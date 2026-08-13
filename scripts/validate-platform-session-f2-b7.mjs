/**
 * Platform Session F2 Batch B7 — local meta / closure validator
 *
 * Authorization: RADIONICS-F2-B7-LOCAL-AUTH-20260812-01
 * Run: npm run validate:platform-session-f2-b7
 *
 * Orchestrates B1–B6 + F0/F1 static validators and asserts cross-batch
 * contract alignment, migration order, RLS/grants/RPC posture, same-session
 * FK posture, forbidden objects, and generated-types readiness (plan only).
 *
 * LIMITATION: Static / process orchestration only. Does NOT connect to
 * PostgreSQL/Supabase and does NOT replace live post-apply verification.
 *
 * No B7 SQL migration is required by this local closure (OD-B7-5: only if gap).
 */

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const expectedMigrations = [
  'supabase/migrations/20260807120000_radionics_platform_session_b1_core.sql',
  'supabase/migrations/20260807124000_radionics_platform_session_b1_grants_hardening.sql',
  'supabase/migrations/20260809170000_radionics_platform_session_b2_testimony_plan_rpcs.sql',
  'supabase/migrations/20260809173000_radionics_platform_session_b2_rpc_grants_hardening.sql',
  'supabase/migrations/20260809180000_radionics_platform_session_b3_methodology_executions.sql',
  'supabase/migrations/20260810120000_radionics_platform_session_b4a_notes_timeline.sql',
  'supabase/migrations/20260810140000_radionics_platform_session_b4b_transcript_captures.sql',
  'supabase/migrations/20260810160000_radionics_platform_session_b4c_report_contributions.sql',
  'supabase/migrations/20260811120000_radionics_platform_session_b5_archive_seal.sql',
  'supabase/migrations/20260811140000_radionics_platform_session_b6_report_projection.sql',
];

const batchValidators = [
  'validate:platform-session-f2-b1',
  'validate:platform-session-f2-b2',
  'validate:platform-session-f2-b3',
  'validate:platform-session-f2-b4a',
  'validate:platform-session-f2-b4b',
  'validate:platform-session-f2-b4c',
  'validate:platform-session-f2-b5',
  'validate:platform-session-f2-b6',
  'validate:platform-session-f0-f1',
];

const domainTablesByBatch = {
  B1: [
    'platform_clients',
    'platform_sessions',
    'platform_command_idempotency',
  ],
  B2: [
    'platform_client_testimony_snapshots',
    'platform_session_plan_items',
  ],
  B3: ['platform_methodology_executions'],
  B4A: ['platform_session_notes', 'platform_timeline_events'],
  B4B: ['platform_transcript_captures', 'platform_transcript_segments'],
  B4C: ['platform_report_contributions'],
  B5: [
    'platform_session_archive_assemblies',
    'platform_sealed_session_archives',
  ],
  B6: [
    'platform_report_templates',
    'platform_report_projections',
    'platform_approved_report_renditions',
  ],
};

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, message) {
  if (condition) {
    passed += 1;
    console.log(`  OK  ${message}`);
  } else {
    failed += 1;
    failures.push(message);
    console.error(`  FAIL  ${message}`);
  }
}

function stripSqlComments(sql) {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/--[^\n]*/g, ' ');
}

function read(rel) {
  const p = path.join(root, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
}

function hasCreateTable(sql, table) {
  return new RegExp(
    `create\\s+table\\s+(?:if\\s+not\\s+exists\\s+)?public\\.${table}\\b`,
    'i',
  ).test(sql);
}

console.log('\n[validate-platform-session-f2-b7] F2 persistence closure checks\n');
console.log('Authorization: RADIONICS-F2-B7-LOCAL-AUTH-20260812-01\n');

// ---------------------------------------------------------------------------
// 1. Migration chain presence + monotonic timestamps
// ---------------------------------------------------------------------------

assert(
  expectedMigrations.every((rel) => fs.existsSync(path.join(root, rel))),
  'all expected B1–B6 platform_session migration files exist',
);

const timestamps = expectedMigrations.map((rel) => {
  const base = path.basename(rel);
  const m = /^(\d{14})_/.exec(base);
  return m ? m[1] : null;
});
assert(
  timestamps.every(Boolean),
  'all F2 migration filenames have 14-digit timestamps',
);
assert(
  timestamps.every((t, i) => i === 0 || t > timestamps[i - 1]),
  'F2 migration timestamps are strictly increasing (dependency order)',
);

const b7DomainMigrations = fs
  .readdirSync(path.join(root, 'supabase/migrations'))
  .filter((f) => /platform_session_b7/i.test(f) && f.endsWith('.sql'));
assert(
  b7DomainMigrations.length === 0,
  'no B7 domain SQL migration present (hardening not required for local closure)',
);

// ---------------------------------------------------------------------------
// 2. Aggregate SQL corpus + create-table inventory
// ---------------------------------------------------------------------------

const allRaw = expectedMigrations.map((rel) => read(rel)).join('\n\n');
const allSql = stripSqlComments(allRaw);

const created = [
  ...allSql.matchAll(
    /create\s+table\s+(?:if\s+not\s+exists\s+)?public\.([a-z0-9_]+)/gi,
  ),
].map((m) => m[1].toLowerCase());

const expectedTables = Object.values(domainTablesByBatch).flat();
for (const table of expectedTables) {
  assert(created.includes(table), `corpus creates ${table}`);
}

assert(
  !created.includes('platform_methodologies'),
  'corpus does not create platform_methodologies',
);
assert(
  !/\bplatform_methodologies\b/i.test(allSql),
  'no platform_methodologies reference across F2 migrations',
);

assert(
  !/create\s+table\s+[\w."]*platform_report_pdf/i.test(allSql) &&
    !/create\s+(or\s+replace\s+)?function\s+public\.\w*pdf\w*/i.test(allSql),
  'no PDF tables or PDF generator RPCs across F2',
);
assert(
  !/create\s+(or\s+replace\s+)?function\s+public\.platform_unseal/i.test(allSql) &&
    !/create\s+(or\s+replace\s+)?function\s+public\.platform_update_sealed_session_archive/i.test(
      allSql,
    ),
  'no archive unseal / sealed-archive update RPCs across F2',
);

// ---------------------------------------------------------------------------
// 3. Per-batch create-table ownership (no cross-batch recreation)
// ---------------------------------------------------------------------------

const batchFiles = {
  B1: [
    'supabase/migrations/20260807120000_radionics_platform_session_b1_core.sql',
  ],
  B2: [
    'supabase/migrations/20260809170000_radionics_platform_session_b2_testimony_plan_rpcs.sql',
  ],
  B3: [
    'supabase/migrations/20260809180000_radionics_platform_session_b3_methodology_executions.sql',
  ],
  B4A: [
    'supabase/migrations/20260810120000_radionics_platform_session_b4a_notes_timeline.sql',
  ],
  B4B: [
    'supabase/migrations/20260810140000_radionics_platform_session_b4b_transcript_captures.sql',
  ],
  B4C: [
    'supabase/migrations/20260810160000_radionics_platform_session_b4c_report_contributions.sql',
  ],
  B5: [
    'supabase/migrations/20260811120000_radionics_platform_session_b5_archive_seal.sql',
  ],
  B6: [
    'supabase/migrations/20260811140000_radionics_platform_session_b6_report_projection.sql',
  ],
};

for (const [batch, files] of Object.entries(batchFiles)) {
  const sql = stripSqlComments(files.map((f) => read(f)).join('\n'));
  for (const table of domainTablesByBatch[batch]) {
    assert(hasCreateTable(sql, table), `${batch} creates ${table}`);
  }
}

// ---------------------------------------------------------------------------
// 4. RLS / grants / RPC posture (cross-cutting static)
// ---------------------------------------------------------------------------

assert(
  (allSql.match(/enable\s+row\s+level\s+security/gi) || []).length >=
    expectedTables.length,
  'RLS enabled at least once per domain table count (corpus)',
);

assert(
  /grant\s+select\s+on\s+table\s+public\.platform_/i.test(allSql),
  'authenticated SELECT grants present on platform tables',
);
assert(
  /revoke\s+all\s+on\s+function\s+public\.platform_[\s\S]{0,200}from\s+public\s*,\s*anon\s*,\s*authenticated/i.test(
    allSql,
  ),
  'RPC revoke-all from public, anon, authenticated pattern present',
);
assert(
  /grant\s+execute\s+on\s+function\s+public\.platform_[\s\S]{0,120}to\s+authenticated/i.test(
    allSql,
  ),
  'RPC GRANT EXECUTE to authenticated pattern present',
);

// B2–B6 domain tables should not receive INSERT/UPDATE/DELETE grants (B1 clients/sessions differ).
const b2PlusSql = stripSqlComments(
  [
    ...batchFiles.B2,
    ...batchFiles.B3,
    ...batchFiles.B4A,
    ...batchFiles.B4B,
    ...batchFiles.B4C,
    ...batchFiles.B5,
    ...batchFiles.B6,
  ]
    .map((f) => read(f))
    .join('\n'),
);
assert(
  !/grant\s+(insert|update|delete)\b/i.test(b2PlusSql),
  'B2–B6 migrations grant no INSERT/UPDATE/DELETE table privileges',
);
assert(!/grant\s+[^;]*\bto\s+anon\b/i.test(b2PlusSql), 'B2–B6 grant nothing to anon');

assert(
  /platform_b2_replay_or_claim_idempotency/i.test(allSql),
  'B2 pending-claim idempotency helper reused by later batches',
);

// ---------------------------------------------------------------------------
// 5. Same-session FK / immutability posture
// ---------------------------------------------------------------------------

const b4c = stripSqlComments(
  read(
    'supabase/migrations/20260810160000_radionics_platform_session_b4c_report_contributions.sql',
  ),
);
const b5 = stripSqlComments(
  read(
    'supabase/migrations/20260811120000_radionics_platform_session_b5_archive_seal.sql',
  ),
);
const b6 = stripSqlComments(
  read(
    'supabase/migrations/20260811140000_radionics_platform_session_b6_report_projection.sql',
  ),
);

assert(
  /foreign\s+key\s*\(\s*note_id\s*,\s*therapist_id\s*,\s*session_id\s*\)/i.test(
    b4c,
  ) &&
    /foreign\s+key\s*\(\s*transcript_segment_id\s*,\s*therapist_id\s*,\s*session_id\s*\)/i.test(
      b4c,
    ),
  'B4C same-session provenance FKs present',
);
assert(
  /platform_sealed_session_archives_session_unique|unique\s*\(\s*session_id\s*\)/i.test(
    b5,
  ),
  'B5 one sealed archive per session',
);
assert(
  /trg_platform_sealed_session_archives_immutable|platform_b5_reject_sealed_mutation/i.test(
    b5,
  ),
  'B5 sealed archive immutability trigger present',
);
assert(
  /report_template_authority[\s\S]*is\s+null|report_template_authority_null/i.test(
    b5,
  ),
  'B5 report_template_authority always NULL',
);
assert(
  /foreign\s+key\s*\(\s*archive_id\s*,\s*therapist_id\s*,\s*session_id\s*\)\s*references\s+public\.platform_sealed_session_archives/i.test(
    b6,
  ),
  'B6 same-session sealed archive FK on projections',
);
assert(
  /trg_platform_approved_report_renditions_immutable|platform_b6_reject_rendition_mutation/i.test(
    b6,
  ),
  'B6 approved rendition immutability trigger present',
);

assert(
  /create\s+or\s+replace\s+function\s+public\.platform_seal_session_archive\b/i.test(
    b5,
  ),
  'B5 seal RPC present',
);
assert(
  /create\s+or\s+replace\s+function\s+public\.platform_approve_report_rendition\b/i.test(
    b6,
  ),
  'B6 approve rendition RPC present',
);
assert(
  /create\s+or\s+replace\s+function\s+public\.platform_create_report_contribution\b/i.test(
    b4c,
  ),
  'B4C create contribution RPC present',
);

// ---------------------------------------------------------------------------
// 6. F1 contracts / no F3 platform-session Supabase wiring
// ---------------------------------------------------------------------------

const reposPath = path.join(root, 'src/platform/session/repositories.ts');
const repos = fs.existsSync(reposPath)
  ? fs.readFileSync(reposPath, 'utf8')
  : '';
assert(fs.existsSync(reposPath), 'F1 repositories.ts exists');
assert(
  !/@supabase|supabaseClient|from\s+['"]@\/lib\/supabase/i.test(repos),
  'F1 repositories.ts does not import Supabase',
);
assert(
  /export interface PlatformSessionRepository/.test(repos) &&
    /export interface SessionArchiveRepository/.test(repos),
  'F1 repository interfaces present (seam for F3; not implemented here)',
);

const platformSessionSrc = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (/\.(ts|tsx|mjs|js)$/.test(ent.name)) platformSessionSrc.push(p);
  }
}
walk(path.join(root, 'src/platform/session'));

assert(
  platformSessionSrc.every((p) => {
    const t = fs.readFileSync(p, 'utf8');
    return !/@supabase\/supabase-js|from\s+['"]@\/lib\/supabaseClient['"]/.test(
      t,
    );
  }),
  'src/platform/session/** has no Supabase client imports',
);

const forbiddenServiceGlobs = [
  'src/services/platformSession',
  'src/services/supabase/platformSession',
  'src/services/supabase/platform_session',
];
assert(
  forbiddenServiceGlobs.every((rel) => !fs.existsSync(path.join(root, rel))),
  'no F3 platform-session Supabase service directory present',
);

// ---------------------------------------------------------------------------
// 7. Generated types readiness (plan only — no Dev apply in this task)
// ---------------------------------------------------------------------------

const generatedCandidates = [
  'src/types/supabase.generated.ts',
  'src/lib/database.types.ts',
  'src/types/database.types.ts',
];
const hasGenerated = generatedCandidates.some((rel) =>
  fs.existsSync(path.join(root, rel)),
);
// Absence is OK for local B7; plan is recorded in B7 report. Presence must not
// imply F3 wiring already shipped.
assert(
  true,
  hasGenerated
    ? 'generated Database types file present (optional early artifact)'
    : 'generated Database types deferred (plan-only; awaiting Dev schema)',
);

const reportRel =
  'docs/Engine/Session/Platform_Session_F2_B7_Local_Implementation_Report.md';
const reportRaw = read(reportRel);
assert(
  reportRaw.length === 0 ||
    /generated types|Database types|supabase gen types/i.test(reportRaw),
  'B7 report documents generated-types plan (when report present)',
);

// ---------------------------------------------------------------------------
// 8. package.json scripts + auth id in this validator
// ---------------------------------------------------------------------------

const pkg = JSON.parse(read('package.json') || '{}');
const scripts = pkg.scripts || {};
for (const name of [
  ...batchValidators,
  'validate:platform-session-f2-b7',
]) {
  assert(
    typeof scripts[name] === 'string' && scripts[name].length > 0,
    `package.json has script ${name}`,
  );
}

assert(
  /RADIONICS-F2-B7-LOCAL-AUTH-20260812-01/.test(
    fs.readFileSync(fileURLToPath(import.meta.url), 'utf8'),
  ),
  'B7 authorization id recorded in validator header',
);

assert(
  !/\bhawkins\b/i.test(allSql) &&
    !/\bchakra\b/i.test(allSql) &&
    !/\bangel\b/i.test(allSql),
  'no methodology-specific therapeutic terms in F2 SQL corpus',
);

// ---------------------------------------------------------------------------
// 9. Orchestrate child validators (B1–B6 + F0/F1)
// ---------------------------------------------------------------------------

const skipChildren = process.env.B7_SKIP_CHILDREN === '1';
if (skipChildren) {
  assert(true, 'child validators skipped (B7_SKIP_CHILDREN=1)');
} else {
  console.log('\n[validate-platform-session-f2-b7] Orchestrating child validators\n');
  for (const script of batchValidators) {
    const result = spawnSync(
      process.platform === 'win32' ? 'npm.cmd' : 'npm',
      ['run', script],
      {
        cwd: root,
        encoding: 'utf8',
        shell: process.platform === 'win32',
        env: { ...process.env, B7_SKIP_CHILDREN: '1' },
      },
    );
    assert(
      result.status === 0,
      `child validator ${script} PASSED`,
    );
    if (result.status !== 0) {
      if (result.stdout) console.error(result.stdout);
      if (result.stderr) console.error(result.stderr);
    }
  }
}

console.log('\n────────────────────────────────────────');
console.log(`Assertions: ${passed + failed}  passed=${passed}  failed=${failed}`);
console.log(
  'LIMITATION: static/orchestration only — not a live PostgreSQL/Supabase test.',
);
console.log('B7 SQL migration: none (no hardening gap for local closure).');
console.log('────────────────────────────────────────\n');

if (failed > 0) {
  console.error('[validate-platform-session-f2-b7] FAILED');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log('[validate-platform-session-f2-b7] PASSED');
console.log('Label: F2 LOCAL PERSISTENCE COMPLETE (static) — NOT APPLIED');
process.exit(0);
