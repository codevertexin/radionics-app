/**
 * Platform Session F2 Batch B2 — local static migration validator
 *
 * Authorization: RADIONICS-F2-B2-LOCAL-AUTH-20260809-01
 * Run: npm run validate:platform-session-f2-b2
 *
 * LIMITATION: Parses migration SQL text only. Does NOT connect to
 * PostgreSQL/Supabase and does NOT replace live RPC/RLS tests.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const migrationRel =
  'supabase/migrations/20260809170000_radionics_platform_session_b2_testimony_plan_rpcs.sql';
const migrationPath = path.join(root, migrationRel);
const grantsRel =
  'supabase/migrations/20260809173000_radionics_platform_session_b2_rpc_grants_hardening.sql';
const grantsPath = path.join(root, grantsRel);

const b2PublicRpcs = [
  {
    name: 'platform_patch_session_draft_context',
    signature:
      'platform_patch_session_draft_context(uuid, text, text, timestamptz, text, text, boolean, boolean, boolean)',
  },
  {
    name: 'platform_upsert_session_plan_item',
    signature:
      'platform_upsert_session_plan_item(uuid, uuid, text, integer, text, uuid)',
  },
  {
    name: 'platform_delete_session_plan_item',
    signature: 'platform_delete_session_plan_item(uuid, uuid, text)',
  },
  {
    name: 'platform_start_session',
    signature: 'platform_start_session(uuid, text)',
  },
];

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

function hasCreateTable(sql, table) {
  return new RegExp(
    `create\\s+table\\s+(?:if\\s+not\\s+exists\\s+)?public\\.${table}\\b`,
    'i',
  ).test(sql);
}

function hasCreateTableAnywhere(sql, table) {
  return new RegExp(`create\\s+table\\s+[\\w."]*${table}\\b`, 'i').test(sql);
}

console.log('\n[validate-platform-session-f2-b2] Static B2 migration checks\n');
console.log(`Core migration: ${migrationRel}`);
console.log(`RPC grants migration: ${grantsRel}\n`);

assert(fs.existsSync(migrationPath), 'B2 migration file exists');

const raw = fs.existsSync(migrationPath)
  ? fs.readFileSync(migrationPath, 'utf8')
  : '';
const sql = stripSqlComments(raw);

assert(fs.existsSync(grantsPath), 'B2 RPC grants hardening migration exists');
const grantsRaw = fs.existsSync(grantsPath)
  ? fs.readFileSync(grantsPath, 'utf8')
  : '';
const grantsSql = stripSqlComments(grantsRaw);

assert(
  /RADIONICS-F2-B2-LOCAL-AUTH-20260809-01/.test(raw),
  'authorization id recorded in migration header',
);

assert(
  hasCreateTable(sql, 'platform_client_testimony_snapshots'),
  'creates platform_client_testimony_snapshots',
);
assert(
  hasCreateTable(sql, 'platform_session_plan_items'),
  'creates platform_session_plan_items',
);

const createTables = [
  ...sql.matchAll(
    /create\s+table\s+(?:if\s+not\s+exists\s+)?public\.([a-z0-9_]+)/gi,
  ),
].map((m) => m[1].toLowerCase());
assert(
  createTables.length === 2 &&
    createTables.includes('platform_client_testimony_snapshots') &&
    createTables.includes('platform_session_plan_items'),
  'exactly two CREATE TABLE declarations (testimony + plan)',
);

const forbiddenTables = [
  'platform_methodologies',
  'platform_methodology_executions',
  'platform_session_notes',
  'platform_transcript_captures',
  'platform_transcript_segments',
  'platform_timeline_events',
  'platform_report_contributions',
  'platform_session_archive_assemblies',
  'platform_sealed_session_archives',
  'platform_report_templates',
  'platform_report_projections',
  'platform_approved_report_renditions',
  'platform_clients',
  'platform_sessions',
  'platform_command_idempotency',
];
for (const table of forbiddenTables) {
  assert(!hasCreateTableAnywhere(sql, table), `does not create ${table}`);
}

assert(!/\bplatform_methodologies\b/i.test(sql), 'no platform_methodologies reference');
assert(
  !/\bactive_execution_id\s+uuid\b/i.test(sql),
  'active_execution_id column absent (B3 deferred)',
);

assert(
  /foreign\s+key\s*\(\s*session_id\s*,\s*therapist_id\s*\)\s*references\s+public\.platform_sessions/i.test(
    sql,
  ),
  'composite FK to platform_sessions present',
);
assert(
  /foreign\s+key\s*\(\s*client_id\s*,\s*therapist_id\s*\)\s*references\s+public\.platform_clients/i.test(
    sql,
  ),
  'composite FK testimony → platform_clients present',
);
assert(
  /specialty_id\s+uuid\s+not\s+null/i.test(sql) &&
    /references\s+public\.radionics_specialties/i.test(sql),
  'specialty_id NOT NULL FK → radionics_specialties',
);
assert(
  /unique\s*\(\s*session_id\s*\)/i.test(sql),
  'testimony UNIQUE (session_id)',
);
assert(
  /idx_platform_session_plan_items_one_primary_per_session/i.test(sql) &&
    /where\s+role\s*=\s*'primary'/i.test(sql),
  'partial unique one primary plan item per session',
);

assert(
  (sql.match(/enable\s+row\s+level\s+security/gi) || []).length >= 2,
  'RLS enabled on both B2 tables',
);
assert(
  /platform_client_testimony_snapshots_select_own/i.test(sql) &&
    /platform_session_plan_items_select_own/i.test(sql),
  'owner SELECT policies declared',
);
assert(
  !/create\s+policy\s+"platform_client_testimony_snapshots_insert/i.test(sql) &&
    !/create\s+policy\s+"platform_client_testimony_snapshots_update/i.test(sql) &&
    !/create\s+policy\s+"platform_client_testimony_snapshots_delete/i.test(sql),
  'testimony has no authenticated INSERT/UPDATE/DELETE policy',
);
assert(
  !/create\s+policy\s+"platform_session_plan_items_insert/i.test(sql) &&
    !/create\s+policy\s+"platform_session_plan_items_update/i.test(sql) &&
    !/create\s+policy\s+"platform_session_plan_items_delete/i.test(sql),
  'plan items have no authenticated INSERT/UPDATE/DELETE policy',
);

assert(
  /grant\s+select\s+on\s+table\s+public\.platform_client_testimony_snapshots\s+to\s+authenticated/i.test(
    sql,
  ) &&
    /grant\s+select\s+on\s+table\s+public\.platform_session_plan_items\s+to\s+authenticated/i.test(
      sql,
    ),
  'authenticated GRANT SELECT only on B2 tables',
);
assert(
  !/grant\s+(insert|update|delete)\b/i.test(sql),
  'no authenticated INSERT/UPDATE/DELETE grants in B2 migration',
);
assert(
  !/grant\s+[^;]*\bto\s+anon\b/i.test(sql),
  'anon receives no GRANT',
);
assert(
  !/grant\s+[^;]*\btruncate\b/i.test(sql) &&
    !/grant\s+[^;]*\btrigger\b/i.test(sql) &&
    !/grant\s+[^;]*\breferences\b/i.test(sql),
  'no TRUNCATE/TRIGGER/REFERENCES grants',
);

for (const { name } of b2PublicRpcs) {
  assert(
    new RegExp(
      `create\\s+or\\s+replace\\s+function\\s+public\\.${name}\\b`,
      'i',
    ).test(sql),
    `RPC public.${name} present`,
  );
  assert(
    new RegExp(
      `create\\s+or\\s+replace\\s+function\\s+public\\.${name}[\\s\\S]*?security\\s+definer`,
      'i',
    ).test(sql),
    `${name} is SECURITY DEFINER`,
  );
  assert(
    new RegExp(
      `grant\\s+execute\\s+on\\s+function\\s+public\\.${name}`,
      'i',
    ).test(sql),
    `GRANT EXECUTE on ${name} to authenticated`,
  );
}

assert(
  /has_approved_specialty_certification\s*\(/i.test(sql),
  'uses has_approved_specialty_certification for eligibility',
);
assert(
  /platform_command_idempotency/i.test(sql),
  'uses platform_command_idempotency',
);
assert(
  /'pending'/i.test(sql) &&
    /response_status in\s*\(\s*'accepted'\s*,\s*'conflict'\s*,\s*'failed'\s*,\s*'pending'\s*\)/i.test(
      sql,
    ),
  'idempotency response_status allows pending claim rows',
);
assert(
  /on\s+conflict\s*\(\s*therapist_id\s*,\s*idempotency_key\s*\)\s*do\s+nothing/i.test(
    sql,
  ),
  'idempotency claim uses INSERT … ON CONFLICT DO NOTHING',
);
assert(
  /from\s+public\.platform_command_idempotency[\s\S]{0,120}for\s+update/i.test(
    sql,
  ),
  'contending idempotency callers SELECT … FOR UPDATE',
);
assert(
  /platform_b2_finalize_idempotency/i.test(sql) &&
    !/platform_b2_store_idempotency/i.test(sql),
  'finalizes pending claim (no fire-and-forget store insert)',
);
assert(
  /platform_b2_fail_idempotency_claim/i.test(sql),
  'failed claims marked on RPC exception',
);
assert(
  (sql.match(/platform_b2_replay_or_claim_idempotency/gi) || []).length >= 5,
  'all B2 mutating RPCs route through claim/replay helper',
);
assert(
  /approved certification for primary specialty required at start/i.test(sql) ||
    /has_approved_specialty_certification\s*\(\s*v_primary\.specialty_id\s*\)/i.test(
      sql,
    ),
  'start_session re-validates primary specialty certification at transaction time',
);

assert(
  /'displayName'/i.test(sql) &&
    /'fullName'/i.test(sql) &&
    /'dateOfBirth'/i.test(sql) &&
    /'address'/i.test(sql) &&
    /'locality'/i.test(sql) &&
    /'country'/i.test(sql),
  'testimony identity builds Product 03 / F1 required camelCase fields',
);
assert(
  /'phone'/i.test(sql) && /'whatsapp'/i.test(sql) && /'email'/i.test(sql),
  'optional contact fields supported when present',
);

assert(
  !/\bhawkins\b/i.test(sql) &&
    !/\bchakra\b/i.test(sql) &&
    !/\bangel\b/i.test(sql) &&
    !/\bmesa_?35\b/i.test(sql),
  'no methodology-specific therapeutic terms/columns',
);

const incompleteLifecycle = [
  'pause_session',
  'resume_session',
  'enter_closing',
  'complete_session',
  'cancel_session',
  'activate_execution',
  'seal_archive',
];
for (const name of incompleteLifecycle) {
  assert(
    !new RegExp(
      `create\\s+(or\\s+replace\\s+)?function\\s+public\\.${name}\\b`,
      'i',
    ).test(sql),
    `no out-of-scope RPC public.${name}`,
  );
}

assert(
  !/revoke\s+[^;]*service_role/i.test(sql),
  'does not revoke service_role privileges',
);

// --- RPC grants hardening (additive; core B2 migration unchanged) ---
console.log('\n[validate-platform-session-f2-b2] RPC grants hardening checks\n');

assert(
  /\bbegin\s*;/i.test(grantsSql) && /\bcommit\s*;/i.test(grantsSql),
  'RPC grants migration has BEGIN/COMMIT wrapper',
);
assert(
  !/\bcreate\s+table\b/i.test(grantsSql) &&
    !/\balter\s+table\b/i.test(grantsSql) &&
    !/\bdrop\s+table\b/i.test(grantsSql),
  'RPC grants migration does not create/drop/alter tables',
);
assert(
  !/\binsert\s+into\b/i.test(grantsSql) &&
    !/\bupdate\s+\w+/i.test(grantsSql) &&
    !/\bdelete\s+from\b/i.test(grantsSql),
  'RPC grants migration has no data-changing DML',
);
assert(
  !/\bservice_role\b/i.test(grantsSql),
  'RPC grants migration does not reference service_role',
);
assert(
  !/grant\s+[^;]*\bto\s+anon\b/i.test(grantsSql),
  'RPC grants migration grants execute only to authenticated (no anon GRANT)',
);

for (const { name, signature } of b2PublicRpcs) {
  const escaped = signature.replace(/[()]/g, '\\$&').replace(/,/g, '\\s*,\\s*');
  assert(
    new RegExp(
      `revoke\\s+all\\s+on\\s+function\\s+public\\.${escaped}\\s+from\\s+public\\s*,\\s*anon\\s*,\\s*authenticated\\s*;`,
      'i',
    ).test(grantsSql),
    `revokes all on ${name} from public, anon, authenticated`,
  );
  assert(
    new RegExp(
      `grant\\s+execute\\s+on\\s+function\\s+public\\.${escaped}\\s+to\\s+authenticated\\s*;`,
      'i',
    ).test(grantsSql),
    `grants execute on ${name} to authenticated`,
  );
}

const grantsFnRefs = [
  ...grantsSql.matchAll(/function\s+public\.([a-z0-9_]+)\s*\(/gi),
].map((m) => m[1].toLowerCase());
const allowedFnNames = new Set(b2PublicRpcs.map((r) => r.name));
assert(
  grantsFnRefs.length === 8 &&
    grantsFnRefs.every((name) => allowedFnNames.has(name)),
  'RPC grants migration references only the four B2 public RPCs',
);

console.log('\n────────────────────────────────────────');
console.log(`Assertions: ${passed + failed}  passed=${passed}  failed=${failed}`);
console.log(
  'LIMITATION: static SQL inspection only — not a live PostgreSQL/Supabase test.',
);
console.log('────────────────────────────────────────\n');

if (failed > 0) {
  console.error('[validate-platform-session-f2-b2] FAILED');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log('[validate-platform-session-f2-b2] PASSED');
process.exit(0);
