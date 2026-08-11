/**
 * Platform Session F2 Batch B5 — local static migration validator
 *
 * Authorization: RADIONICS-F2-B5-LOCAL-AUTH-20260811-01
 * Run: npm run validate:platform-session-f2-b5
 *
 * LIMITATION: Parses migration SQL text only. Does NOT connect to
 * PostgreSQL/Supabase and does NOT replace live RPC/RLS tests.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const migrationRel =
  'supabase/migrations/20260811120000_radionics_platform_session_b5_archive_seal.sql';
const migrationPath = path.join(root, migrationRel);

const b5PublicRpcs = [
  {
    name: 'platform_prepare_session_archive_assembly',
    signature: 'platform_prepare_session_archive_assembly(uuid, text, integer)',
  },
  {
    name: 'platform_seal_session_archive',
    signature: 'platform_seal_session_archive(uuid, text, integer)',
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

console.log('\n[validate-platform-session-f2-b5] Static B5 migration checks\n');
console.log(`Migration: ${migrationRel}\n`);

assert(fs.existsSync(migrationPath), 'B5 migration file exists');

const raw = fs.existsSync(migrationPath)
  ? fs.readFileSync(migrationPath, 'utf8')
  : '';
const sql = stripSqlComments(raw);

assert(
  /RADIONICS-F2-B5-LOCAL-AUTH-20260811-01/.test(raw),
  'authorization id recorded in migration header',
);

assert(
  hasCreateTable(sql, 'platform_session_archive_assemblies'),
  'creates platform_session_archive_assemblies',
);
assert(
  hasCreateTable(sql, 'platform_sealed_session_archives'),
  'creates platform_sealed_session_archives',
);

const createTables = [
  ...sql.matchAll(
    /create\s+table\s+(?:if\s+not\s+exists\s+)?public\.([a-z0-9_]+)/gi,
  ),
].map((m) => m[1].toLowerCase());
assert(
  createTables.length === 2 &&
    createTables.includes('platform_session_archive_assemblies') &&
    createTables.includes('platform_sealed_session_archives'),
  'exactly two CREATE TABLE (assemblies + sealed)',
);

const forbiddenTables = [
  'platform_methodologies',
  'platform_report_templates',
  'platform_report_projections',
  'platform_approved_report_renditions',
  'platform_session_notes',
  'platform_timeline_events',
  'platform_transcript_captures',
  'platform_transcript_segments',
  'platform_report_contributions',
  'platform_clients',
  'platform_sessions',
  'platform_command_idempotency',
  'platform_methodology_executions',
  'platform_client_testimony_snapshots',
  'platform_session_plan_items',
];
for (const table of forbiddenTables) {
  assert(!hasCreateTableAnywhere(sql, table), `does not create ${table}`);
}

assert(!/\bplatform_methodologies\b/i.test(sql), 'no platform_methodologies reference');
assert(
  !/platform_report_templates|platform_report_projections|platform_approved_report_renditions/i.test(
    sql,
  ) ||
    (!hasCreateTableAnywhere(sql, 'platform_report_templates') &&
      !hasCreateTableAnywhere(sql, 'platform_report_projections') &&
      !hasCreateTableAnywhere(sql, 'platform_approved_report_renditions')),
  'no B6 report template/projection/rendition tables',
);

assert(
  !/create\s+(or\s+replace\s+)?function\s+public\.platform_generate_report/i.test(
    sql,
  ) &&
    !/create\s+(or\s+replace\s+)?function\s+public\.platform_approve_rendition/i.test(
      sql,
    ) &&
    !/create\s+(or\s+replace\s+)?function\s+public\.platform_create_report_projection/i.test(
      sql,
    ),
  'no report generation / projection / approve RPCs',
);

assert(
  !/create\s+(or\s+replace\s+)?function\s+public\.platform_update_sealed/i.test(
    sql,
  ) &&
    !/create\s+(or\s+replace\s+)?function\s+public\.platform_patch_.*archive/i.test(
      sql,
    ) &&
    !/create\s+(or\s+replace\s+)?function\s+public\.platform_unseal/i.test(sql),
  'no post-seal update/patch/unseal RPCs',
);

assert(
  /platform_sealed_session_archives_session_unique|unique\s*\(\s*session_id\s*\)/i.test(
    sql,
  ),
  'one sealed archive per session (UNIQUE session_id)',
);
assert(
  /report_template_authority[\s\S]*check\s*\(\s*report_template_authority\s+is\s+null\s*\)/i.test(
    sql,
  ) || /report_template_authority_null/i.test(sql),
  'report_template_authority always NULL',
);
assert(
  /content_sha256/i.test(sql) &&
    /platform_b5_envelope_sha256|digest\s*\(/i.test(sql),
  'content_sha256 via sha256 digest helper',
);
assert(
  /references\s+public\.platform_client_testimony_snapshots/i.test(sql),
  'sealed archive FK to testimony snapshots',
);
assert(
  /foreign\s+key\s*\(\s*session_id\s*,\s*therapist_id\s*\)\s*references\s+public\.platform_sessions/i.test(
    sql,
  ),
  'composite session ownership FKs present',
);

assert(
  /idx_platform_archive_one_in_assembly_per_session|assembly_status\s*=\s*'in_assembly'/i.test(
    sql,
  ),
  'at most one in_assembly row per session',
);
assert(
  /trg_platform_sealed_session_archives_immutable|platform_b5_reject_sealed_mutation/i.test(
    sql,
  ),
  'sealed archive immutability trigger present',
);
assert(
  /platform_guard_mutable_owned_row/i.test(sql),
  'assemblies use platform_guard_mutable_owned_row trigger',
);

assert(
  /enable\s+row\s+level\s+security/i.test(sql),
  'RLS enabled on B5 tables',
);
assert(
  /platform_session_archive_assemblies_select_own/i.test(sql) &&
    /platform_sealed_session_archives_select_own/i.test(sql),
  'owner SELECT policies declared for assemblies + sealed',
);
assert(
  !/create\s+policy\s+"platform_session_archive_assemblies_insert/i.test(sql) &&
    !/create\s+policy\s+"platform_sealed_session_archives_insert/i.test(sql) &&
    !/create\s+policy\s+"platform_sealed_session_archives_update/i.test(sql) &&
    !/create\s+policy\s+"platform_sealed_session_archives_delete/i.test(sql),
  'B5 tables have no authenticated INSERT/UPDATE/DELETE policies',
);
assert(
  /grant\s+select\s+on\s+table\s+public\.platform_session_archive_assemblies\s+to\s+authenticated/i.test(
    sql,
  ) &&
    /grant\s+select\s+on\s+table\s+public\.platform_sealed_session_archives\s+to\s+authenticated/i.test(
      sql,
    ),
  'authenticated GRANT SELECT only on B5 tables',
);
assert(
  !/grant\s+(insert|update|delete)\b/i.test(sql),
  'no authenticated INSERT/UPDATE/DELETE table grants',
);
assert(!/grant\s+[^;]*\bto\s+anon\b/i.test(sql), 'anon receives no GRANT');
assert(
  !/grant\s+[^;]*\btruncate\b/i.test(sql) &&
    !/grant\s+[^;]*\btrigger\b/i.test(sql) &&
    !/grant\s+[^;]*\breferences\b/i.test(sql),
  'no TRUNCATE/TRIGGER/REFERENCES grants',
);

assert(
  /platform_b5_session_allows_seal/i.test(sql) &&
    /p_lifecycle\s*=\s*'completed'|lifecycle_status\s*=\s*'completed'/i.test(sql),
  'seal allowed only when lifecycle completed',
);
assert(
  /platform_b5_session_allows_prepare/i.test(sql) &&
    /'closing'\s*,\s*'completed'/i.test(sql),
  'prepare allowed in closing|completed',
);
assert(
  /testimony snapshot required to seal archive/i.test(sql),
  'seal requires testimony snapshot',
);
assert(
  /inclusion\s+in\s*\(\s*'retained'\s*,\s*'pending_review'\s*\)/i.test(sql),
  'transcript segments filtered to retained|pending_review',
);
assert(
  /platform_report_contributions/i.test(sql) &&
    /platform_session_notes/i.test(sql) &&
    /platform_timeline_events/i.test(sql),
  'envelope builder reads notes/timeline/contributions',
);
assert(
  /reportTemplateAuthority['"]?\s*,\s*null|report_template_authority\s*,\s*null/i.test(
    sql,
  ),
  'envelope / insert keeps report template authority null',
);
assert(
  /2097152|2 MiB|soft size limit/i.test(sql),
  'soft envelope size limit enforced',
);

for (const { name, signature } of b5PublicRpcs) {
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

  const escaped = signature.replace(/[()]/g, '\\$&').replace(/,/g, '\\s*,\\s*');
  assert(
    new RegExp(
      `revoke\\s+all\\s+on\\s+function\\s+public\\.${escaped}\\s+from\\s+public\\s*,\\s*anon\\s*,\\s*authenticated\\s*;`,
      'i',
    ).test(sql),
    `revokes all on ${name} from public, anon, authenticated`,
  );
  assert(
    new RegExp(
      `grant\\s+execute\\s+on\\s+function\\s+public\\.${escaped}\\s+to\\s+authenticated\\s*;`,
      'i',
    ).test(sql),
    `grants execute on ${name} to authenticated`,
  );
}

assert(
  (sql.match(/create\s+or\s+replace\s+function\s+public\.platform_seal_session_archive\b/gi) || [])
    .length === 1,
  'platform_seal_session_archive defined exactly once',
);

assert(
  /platform_b2_replay_or_claim_idempotency/i.test(sql) &&
    /platform_b2_finalize_idempotency/i.test(sql) &&
    /platform_b2_fail_idempotency_claim/i.test(sql),
  'reuses B2 pending-claim idempotency helpers',
);
assert(
  (sql.match(/platform_b2_replay_or_claim_idempotency/gi) || []).length >= 2,
  'both B5 RPCs route through claim/replay helper',
);

assert(
  !/\bhawkins\b/i.test(sql) &&
    !/\bchakra\b/i.test(sql) &&
    !/\bangel\b/i.test(sql) &&
    !/\bmesa_?35\b/i.test(sql),
  'no methodology-specific therapeutic terms/columns',
);
assert(
  !/\baudio\b/i.test(sql) &&
    !/\bstt\b/i.test(sql) &&
    !/\bprovisional\b/i.test(sql),
  'no audio/STT/provisional persistence',
);
assert(!/\bpdf\b/i.test(sql), 'no PDF references');

const forbiddenRpcs = [
  'platform_upsert_report_contribution',
  'platform_patch_methodology_execution_state',
  'platform_approve_rendition',
  'platform_create_report_projection',
  'platform_generate_report',
  'platform_update_sealed_session_archive',
  'platform_create_session_note',
  'platform_append_timeline_event',
  'platform_start_transcript_capture',
];
for (const name of forbiddenRpcs) {
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

console.log('\n────────────────────────────────────────');
console.log(`Assertions: ${passed + failed}  passed=${passed}  failed=${failed}`);
console.log(
  'LIMITATION: static SQL inspection only — not a live PostgreSQL/Supabase test.',
);
console.log('────────────────────────────────────────\n');

if (failed > 0) {
  console.error('[validate-platform-session-f2-b5] FAILED');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log('[validate-platform-session-f2-b5] PASSED');
process.exit(0);
