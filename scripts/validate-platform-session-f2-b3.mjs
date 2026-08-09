/**
 * Platform Session F2 Batch B3 — local static migration validator
 *
 * Authorization: RADIONICS-F2-B3-LOCAL-AUTH-20260809-01
 * Run: npm run validate:platform-session-f2-b3
 *
 * LIMITATION: Parses migration SQL text only. Does NOT connect to
 * PostgreSQL/Supabase and does NOT replace live RPC/RLS tests.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const migrationRel =
  'supabase/migrations/20260809180000_radionics_platform_session_b3_methodology_executions.sql';
const migrationPath = path.join(root, migrationRel);

const b3PublicRpcs = [
  {
    name: 'platform_create_methodology_execution',
    signature:
      'platform_create_methodology_execution(uuid, uuid, text, text, integer, uuid)',
  },
  {
    name: 'platform_activate_execution',
    signature: 'platform_activate_execution(uuid, uuid, text)',
  },
  {
    name: 'platform_deactivate_execution',
    signature: 'platform_deactivate_execution(uuid, text)',
  },
  {
    name: 'platform_complete_methodology_execution',
    signature: 'platform_complete_methodology_execution(uuid, uuid, text)',
  },
  {
    name: 'platform_abandon_methodology_execution',
    signature: 'platform_abandon_methodology_execution(uuid, uuid, text)',
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

console.log('\n[validate-platform-session-f2-b3] Static B3 migration checks\n');
console.log(`Migration: ${migrationRel}\n`);

assert(fs.existsSync(migrationPath), 'B3 migration file exists');

const raw = fs.existsSync(migrationPath)
  ? fs.readFileSync(migrationPath, 'utf8')
  : '';
const sql = stripSqlComments(raw);

assert(
  /RADIONICS-F2-B3-LOCAL-AUTH-20260809-01/.test(raw),
  'authorization id recorded in migration header',
);

assert(
  hasCreateTable(sql, 'platform_methodology_executions'),
  'creates platform_methodology_executions',
);

const createTables = [
  ...sql.matchAll(
    /create\s+table\s+(?:if\s+not\s+exists\s+)?public\.([a-z0-9_]+)/gi,
  ),
].map((m) => m[1].toLowerCase());
assert(
  createTables.length === 1 &&
    createTables[0] === 'platform_methodology_executions',
  'exactly one CREATE TABLE (platform_methodology_executions)',
);

const forbiddenTables = [
  'platform_methodologies',
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
  'platform_client_testimony_snapshots',
  'platform_session_plan_items',
];
for (const table of forbiddenTables) {
  assert(!hasCreateTableAnywhere(sql, table), `does not create ${table}`);
}

assert(!/\bplatform_methodologies\b/i.test(sql), 'no platform_methodologies reference');
assert(
  !/platform_patch_methodology_execution_state/i.test(sql),
  'no platform_patch_methodology_execution_state RPC',
);

assert(
  /alter\s+table\s+public\.platform_sessions\s+add\s+column\s+active_execution_id\s+uuid/i.test(
    sql,
  ),
  'adds platform_sessions.active_execution_id',
);
assert(
  /unique\s*\(\s*session_id\s*,\s*therapist_id\s*,\s*id\s*\)/i.test(sql),
  'UNIQUE (session_id, therapist_id, id) on executions for same-session pointer FK',
);
assert(
  /foreign\s+key\s*\(\s*id\s*,\s*therapist_id\s*,\s*active_execution_id\s*\)\s*references\s+public\.platform_methodology_executions\s*\(\s*session_id\s*,\s*therapist_id\s*,\s*id\s*\)/i.test(
    sql,
  ),
  'active_execution_id FK includes session id, therapist id, and execution id',
);
assert(
  /platform_b3_assert_active_execution_coherence/i.test(sql) &&
    /deferrable\s+initially\s+deferred/i.test(sql),
  'OD-B3-13 deferred coherence trigger present',
);
assert(
  /pointer is null but/i.test(sql) &&
    /must equal the unique active execution/i.test(sql),
  'coherence enforces NULL↔no-active and pointer↔unique active',
);
assert(
  /set\s+active_execution_id\s*=\s*p_execution_id/i.test(sql) &&
    /status\s*=\s*'active'/i.test(sql),
  'activate sets pointer after targeting active status path',
);
assert(
  /set\s+active_execution_id\s*=\s*null/i.test(sql),
  'deactivate/complete/abandon clear active_execution_id pointer',
);

assert(
  /specialty_id\s+uuid\s+not\s+null/i.test(sql) &&
    /references\s+public\.radionics_specialties/i.test(sql),
  'specialty_id NOT NULL FK → radionics_specialties',
);
assert(
  /plan_item_id\s+uuid\s+null/i.test(sql) &&
    /foreign\s+key\s*\(\s*plan_item_id\s*,\s*therapist_id\s*\)\s*references\s+public\.platform_session_plan_items/i.test(
      sql,
    ),
  'optional plan_item_id composite FK → plan items',
);
assert(
  /idx_platform_methodology_executions_one_active_per_session/i.test(sql) &&
    /where\s+status\s*=\s*'active'/i.test(sql),
  'partial unique one active execution per session',
);
assert(
  /idx_platform_methodology_executions_one_primary_per_session/i.test(sql) &&
    /where\s+role\s*=\s*'primary'/i.test(sql),
  'partial unique one primary execution per session',
);
assert(
  /status\s+in\s*\(\s*'not_started'\s*,\s*'active'\s*,\s*'paused'\s*,\s*'completed'\s*,\s*'abandoned'\s*\)/i.test(
    sql,
  ),
  'execution status CHECK matches F1 set',
);
assert(
  /state_payload\s+jsonb\s+not\s+null\s+default\s+'\{\}'::jsonb/i.test(sql),
  'initial opaque state_payload default {}',
);

assert(
  /enable\s+row\s+level\s+security/i.test(sql),
  'RLS enabled on executions',
);
assert(
  /platform_methodology_executions_select_own/i.test(sql),
  'owner SELECT policy declared',
);
assert(
  !/create\s+policy\s+"platform_methodology_executions_insert/i.test(sql) &&
    !/create\s+policy\s+"platform_methodology_executions_update/i.test(sql) &&
    !/create\s+policy\s+"platform_methodology_executions_delete/i.test(sql),
  'executions have no authenticated INSERT/UPDATE/DELETE policy',
);
assert(
  /grant\s+select\s+on\s+table\s+public\.platform_methodology_executions\s+to\s+authenticated/i.test(
    sql,
  ),
  'authenticated GRANT SELECT only on executions',
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

for (const { name, signature } of b3PublicRpcs) {
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
  /has_approved_specialty_certification\s*\(/i.test(sql),
  'uses has_approved_specialty_certification',
);
assert(
  /approved specialty certification required at activate/i.test(sql) ||
    /has_approved_specialty_certification\s*\(\s*v_target\.specialty_id\s*\)/i.test(
      sql,
    ),
  'activate re-checks certification at transaction time',
);
assert(
  /platform_b2_replay_or_claim_idempotency/i.test(sql) &&
    /platform_b2_finalize_idempotency/i.test(sql) &&
    /platform_b2_fail_idempotency_claim/i.test(sql),
  'reuses B2 pending-claim idempotency helpers',
);
assert(
  (sql.match(/platform_b2_replay_or_claim_idempotency/gi) || []).length >= 5,
  'all five B3 lifecycle RPCs route through claim/replay helper',
);
assert(
  /platform_b3_session_allows_execution_lifecycle/i.test(sql) &&
    /'in_progress'\s*,\s*'paused'\s*,\s*'closing'/i.test(sql),
  'blocks draft/terminal session lifecycle for execution RPCs',
);
assert(
  /for\s+update/i.test(sql),
  'uses SELECT … FOR UPDATE locking in lifecycle RPCs',
);

assert(
  !/\bhawkins\b/i.test(sql) &&
    !/\bchakra\b/i.test(sql) &&
    !/\bangel\b/i.test(sql) &&
    !/\bmesa_?35\b/i.test(sql),
  'no methodology-specific therapeutic terms/columns',
);

const forbiddenRpcs = [
  'platform_patch_methodology_execution_state',
  'pause_session',
  'resume_session',
  'enter_closing',
  'complete_session',
  'cancel_session',
  'seal_archive',
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
assert(
  /platform_guard_mutable_owned_row/i.test(sql),
  'executions use platform_guard_mutable_owned_row trigger',
);

console.log('\n────────────────────────────────────────');
console.log(`Assertions: ${passed + failed}  passed=${passed}  failed=${failed}`);
console.log(
  'LIMITATION: static SQL inspection only — not a live PostgreSQL/Supabase test.',
);
console.log('────────────────────────────────────────\n');

if (failed > 0) {
  console.error('[validate-platform-session-f2-b3] FAILED');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log('[validate-platform-session-f2-b3] PASSED');
process.exit(0);
