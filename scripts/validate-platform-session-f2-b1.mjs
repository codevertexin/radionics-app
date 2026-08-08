/**
 * Platform Session F2 Batch B1 — local static migration validator
 *
 * Authorization: RADIONICS-F2-B1-LOCAL-AUTH-20260807-01
 * Run: npm run validate:platform-session-f2-b1
 *   or: node scripts/validate-platform-session-f2-b1.mjs
 *
 * LIMITATION: This validator parses migration SQL text only.
 * It does NOT connect to PostgreSQL / Supabase and does NOT replace
 * real database tests (RLS A/B, FK enforcement, trigger behaviour).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const migrationRel =
  'supabase/migrations/20260807120000_radionics_platform_session_b1_core.sql';
const migrationPath = path.join(root, migrationRel);
const grantsRel =
  'supabase/migrations/20260807124000_radionics_platform_session_b1_grants_hardening.sql';
const grantsPath = path.join(root, grantsRel);

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
  const re = new RegExp(
    `create\\s+table\\s+(?:if\\s+not\\s+exists\\s+)?public\\.${table}\\b`,
    'i',
  );
  return re.test(sql);
}

function hasCreateTableAnywhere(sql, table) {
  const re = new RegExp(`create\\s+table\\s+[\\w."]*${table}\\b`, 'i');
  return re.test(sql);
}

console.log('\n[validate-platform-session-f2-b1] Static B1 migration checks\n');
console.log(`Core migration: ${migrationRel}`);
console.log(`Grants migration: ${grantsRel}\n`);

assert(fs.existsSync(migrationPath), 'core migration file exists');

const raw = fs.existsSync(migrationPath)
  ? fs.readFileSync(migrationPath, 'utf8')
  : '';
const sql = stripSqlComments(raw);
const lower = sql.toLowerCase();

assert(fs.existsSync(grantsPath), 'grants-hardening migration file exists');
const grantsRaw = fs.existsSync(grantsPath)
  ? fs.readFileSync(grantsPath, 'utf8')
  : '';
const grantsSql = stripSqlComments(grantsRaw);

// --- Exact B1 tables present ---
assert(hasCreateTable(sql, 'platform_clients'), 'creates public.platform_clients');
assert(hasCreateTable(sql, 'platform_sessions'), 'creates public.platform_sessions');
assert(
  hasCreateTable(sql, 'platform_command_idempotency'),
  'creates public.platform_command_idempotency',
);

const createTableNames = [
  ...sql.matchAll(
    /create\s+table\s+(?:if\s+not\s+exists\s+)?public\.([a-z0-9_]+)/gi,
  ),
].map((m) => m[1].toLowerCase());
assert(
  createTableNames.length === 3 &&
    createTableNames.includes('platform_clients') &&
    createTableNames.includes('platform_sessions') &&
    createTableNames.includes('platform_command_idempotency'),
  'exactly three CREATE TABLE declarations (clients, sessions, idempotency)',
);

// --- B2+ tables absent (canonical F2 names) ---
const b2PlusTables = [
  'platform_client_testimony_snapshots',
  'platform_session_plan_items',
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
  'platform_methodologies',
];

for (const table of b2PlusTables) {
  assert(!hasCreateTableAnywhere(sql, table), `does not create ${table}`);
}

assert(
  !/\bplatform_methodologies\b/i.test(sql),
  'no reference to platform_methodologies',
);

// --- active_execution_id deferred to B3 (may be mentioned only in docs/comments) ---
assert(
  !/\bactive_execution_id\s+uuid\b/i.test(sql),
  'active_execution_id column deliberately absent (deferred to B3)',
);
assert(
  !/references\s+public\.platform_methodology_executions\b/i.test(sql),
  'no FK to platform_methodology_executions (deferred to B3)',
);
assert(
  /deferred to b3/i.test(raw),
  'documents active_execution_id / executions deferral to B3',
);

// --- Timer field present ---
assert(
  /\bactive_timer_started_at\b/i.test(sql),
  'active_timer_started_at present on platform_sessions',
);
assert(
  /\baccumulated_active_duration_ms\b/i.test(sql),
  'accumulated_active_duration_ms present',
);

// --- Lifecycle: exact F0/F1 set; no reported ---
assert(
  /lifecycle_status\s+in\s*\(\s*'draft'\s*,\s*'in_progress'\s*,\s*'paused'\s*,\s*'closing'\s*,\s*'completed'\s*,\s*'cancelled'\s*\)/i.test(
    sql,
  ),
  'lifecycle_status CHECK lists exact F0/F1 statuses',
);
assert(
  !/lifecycle_status[\s\S]{0,400}'reported'/i.test(sql),
  "lifecycle CHECK does not allow 'reported'",
);
assert(
  !/'reported'\s*[,)]/.test(sql) || !/lifecycle_status/i.test(sql),
  "no 'reported' in lifecycle allowed set",
);

// Stronger: ensure reported never appears as allowed lifecycle value
const lifecycleBlock = sql.match(
  /platform_sessions_lifecycle_status_check[\s\S]{0,500}?check\s*\(([\s\S]*?)\)/i,
);
if (lifecycleBlock) {
  assert(
    !/'reported'/i.test(lifecycleBlock[1]),
    "lifecycle_status_check body excludes 'reported'",
  );
} else {
  assert(false, 'found platform_sessions_lifecycle_status_check body');
}

// --- SessionMode from contracts ---
assert(
  /session_mode\s+in\s*\(\s*'presential'\s*,\s*'online'\s*,\s*'distance'\s*\)/i.test(
    sql,
  ),
  "session_mode CHECK is presential|online|distance",
);

// --- Composite FKs ---
assert(
  /foreign\s+key\s*\(\s*client_id\s*,\s*therapist_id\s*\)\s*references\s+public\.platform_clients\s*\(\s*id\s*,\s*therapist_id\s*\)/i.test(
    sql,
  ),
  'composite FK sessions(client_id, therapist_id) → clients',
);
assert(
  /on\s+delete\s+restrict/i.test(sql),
  'ON DELETE RESTRICT present (ownership integrity)',
);
assert(
  /foreign\s+key\s*\(\s*session_id\s*,\s*therapist_id\s*\)\s*references\s+public\.platform_sessions\s*\(\s*id\s*,\s*therapist_id\s*\)/i.test(
    sql,
  ),
  'composite FK idempotency(session_id, therapist_id) → sessions',
);

// --- UNIQUE constraints ---
assert(
  /unique\s*\(\s*id\s*,\s*therapist_id\s*\)/i.test(sql),
  'UNIQUE (id, therapist_id) present',
);
assert(
  /unique\s*\(\s*therapist_id\s*,\s*idempotency_key\s*\)/i.test(sql),
  'UNIQUE (therapist_id, idempotency_key) present',
);

// --- Idempotency response_status ---
assert(
  /response_status\s+in\s*\(\s*'accepted'\s*,\s*'conflict'\s*,\s*'failed'\s*\)/i.test(
    sql,
  ),
  "response_status CHECK is accepted|conflict|failed",
);

// --- Ownership / RLS ---
assert(
  /enable\s+row\s+level\s+security/i.test(sql),
  'RLS enabled (at least once)',
);
assert(
  (lower.match(/enable\s+row\s+level\s+security/g) || []).length >= 3,
  'RLS enabled on all three B1 tables',
);
assert(
  /platform_clients_select_own/i.test(sql) &&
    /platform_clients_insert_own/i.test(sql) &&
    /platform_clients_update_own/i.test(sql) &&
    /platform_clients_delete_own/i.test(sql),
  'platform_clients owner CRUD policies declared',
);
assert(
  /platform_sessions_select_own/i.test(sql) &&
    /platform_sessions_insert_own_draft/i.test(sql),
  'platform_sessions select + draft insert policies declared',
);
assert(
  !/create\s+policy\s+"platform_sessions_update/i.test(sql) &&
    !/create\s+policy\s+"platform_sessions_delete/i.test(sql),
  'platform_sessions has no direct therapist UPDATE/DELETE policy',
);
assert(
  /platform_command_idempotency_select_own/i.test(sql),
  'platform_command_idempotency SELECT own policy declared',
);
assert(
  !/create\s+policy\s+"platform_command_idempotency_insert/i.test(sql) &&
    !/create\s+policy\s+"platform_command_idempotency_update/i.test(sql) &&
    !/create\s+policy\s+"platform_command_idempotency_delete/i.test(sql),
  'platform_command_idempotency has no therapist INSERT/UPDATE/DELETE policy',
);
assert(
  /therapist_id\s*=\s*auth\.uid\(\)/i.test(sql),
  'ownership uses therapist_id = auth.uid()',
);
assert(
  /therapist_id is immutable/i.test(sql),
  'therapist_id immutability guard present',
);

// --- Guard function rename + server-owned identity/timestamps ---
assert(
  !/\bplatform_b1_guard_mutable_owned_row\b/i.test(sql),
  'old function platform_b1_guard_mutable_owned_row absent',
);
assert(
  /create\s+or\s+replace\s+function\s+public\.platform_guard_mutable_owned_row\s*\(/i.test(
    sql,
  ),
  'permanent function platform_guard_mutable_owned_row present',
);

const guardMatch = sql.match(
  /create\s+or\s+replace\s+function\s+public\.platform_guard_mutable_owned_row\s*\(\s*\)[\s\S]*?\$\$([\s\S]*?)\$\$/i,
);
const guardBody = guardMatch ? guardMatch[1] : '';
assert(Boolean(guardBody), 'extracted platform_guard_mutable_owned_row body');

const insertBranch = guardBody.match(
  /elsif\s+tg_op\s*=\s*'INSERT'\s+then([\s\S]*?)(?:end\s+if|return\s+new)/i,
);
const insertBody = insertBranch ? insertBranch[1] : '';
assert(
  /new\.created_at\s*:=\s*now\s*\(\s*\)\s*;/i.test(insertBody) &&
    !/coalesce\s*\(\s*new\.created_at/i.test(insertBody),
  'INSERT forces created_at = now() (no coalesce)',
);
assert(
  /new\.updated_at\s*:=\s*now\s*\(\s*\)\s*;/i.test(insertBody) &&
    !/coalesce\s*\(\s*new\.updated_at/i.test(insertBody),
  'INSERT forces updated_at = now() (no coalesce)',
);
assert(
  /new\.row_revision\s*:=\s*1\s*;/i.test(insertBody),
  'INSERT forces row_revision = 1',
);

const updateBranch = guardBody.match(
  /if\s+tg_op\s*=\s*'UPDATE'\s+then([\s\S]*?)elsif\s+tg_op\s*=\s*'INSERT'/i,
);
const updateBody = updateBranch ? updateBranch[1] : '';
assert(
  /new\.id\s+is\s+distinct\s+from\s+old\.id/i.test(updateBody) &&
    /id is immutable/i.test(updateBody),
  'UPDATE rejects id changes',
);
assert(
  /new\.therapist_id\s+is\s+distinct\s+from\s+old\.therapist_id/i.test(updateBody) &&
    /therapist_id is immutable/i.test(updateBody),
  'UPDATE rejects therapist_id changes',
);
assert(
  /new\.created_at\s+is\s+distinct\s+from\s+old\.created_at/i.test(updateBody) &&
    /created_at is immutable/i.test(updateBody),
  'UPDATE rejects created_at changes',
);
assert(
  /new\.row_revision\s*:=\s*old\.row_revision\s*\+\s*1\s*;/i.test(updateBody),
  'UPDATE forces row_revision = old.row_revision + 1',
);
assert(
  /new\.updated_at\s*:=\s*now\s*\(\s*\)\s*;/i.test(updateBody),
  'UPDATE forces updated_at = now()',
);

// --- Reinforced lifecycle coherence per status ---
function statusArm(status) {
  const marker = `lifecycle_status = '${status}'`;
  const start = sql.toLowerCase().indexOf(marker.toLowerCase());
  if (start < 0) return '';
  const from = sql.slice(start + marker.length);
  // Stop at the next lifecycle_status arm or end of this CHECK constraint group.
  const nextArm = from.search(/\)\s*or\s*\(\s*lifecycle_status\s*=/i);
  const endCheck = from.search(/\)\s*\)\s*;/);
  let end = from.length;
  if (nextArm >= 0) end = Math.min(end, nextArm);
  if (endCheck >= 0) end = Math.min(end, endCheck);
  return from.slice(0, end);
}

const draftArm = statusArm('draft');
assert(
  /started_at\s+is\s+null/i.test(draftArm) &&
    /active_timer_started_at\s+is\s+null/i.test(draftArm) &&
    /closing_entered_at\s+is\s+null/i.test(draftArm) &&
    /completed_at\s+is\s+null/i.test(draftArm) &&
    /cancelled_at\s+is\s+null/i.test(draftArm) &&
    /cancellation_reason\s+is\s+null/i.test(draftArm),
  'draft forbids started_at/timer/closing/terminal/cancellation_reason',
);

const inProgressArm = statusArm('in_progress');
assert(
  /started_at\s+is\s+not\s+null/i.test(inProgressArm) &&
    /active_timer_started_at\s+is\s+not\s+null/i.test(inProgressArm) &&
    /completed_at\s+is\s+null/i.test(inProgressArm) &&
    /cancelled_at\s+is\s+null/i.test(inProgressArm) &&
    /cancellation_reason\s+is\s+null/i.test(inProgressArm),
  'in_progress requires started_at + timer; forbids terminals/cancellation_reason',
);

const pausedArm = statusArm('paused');
assert(
  /started_at\s+is\s+not\s+null/i.test(pausedArm) &&
    /active_timer_started_at\s+is\s+null/i.test(pausedArm) &&
    /completed_at\s+is\s+null/i.test(pausedArm) &&
    /cancelled_at\s+is\s+null/i.test(pausedArm) &&
    /cancellation_reason\s+is\s+null/i.test(pausedArm),
  'paused requires started_at and null timer; forbids cancellation_reason',
);

const closingArm = statusArm('closing');
assert(
  /started_at\s+is\s+not\s+null/i.test(closingArm) &&
    /closing_entered_at\s+is\s+not\s+null/i.test(closingArm) &&
    /active_timer_started_at\s+is\s+null/i.test(closingArm) &&
    /completed_at\s+is\s+null/i.test(closingArm) &&
    /cancelled_at\s+is\s+null/i.test(closingArm) &&
    /cancellation_reason\s+is\s+null/i.test(closingArm),
  'closing requires started_at + closing_entered_at; forbids cancellation_reason',
);

const completedArm = statusArm('completed');
assert(
  /started_at\s+is\s+not\s+null/i.test(completedArm) &&
    /closing_entered_at\s+is\s+not\s+null/i.test(completedArm) &&
    /completed_at\s+is\s+not\s+null/i.test(completedArm) &&
    /cancelled_at\s+is\s+null/i.test(completedArm) &&
    /active_timer_started_at\s+is\s+null/i.test(completedArm) &&
    /cancellation_reason\s+is\s+null/i.test(completedArm),
  'completed requires started/closing/completed; forbids cancellation_reason',
);

const cancelledArm = statusArm('cancelled');
const cancelledFlat = cancelledArm.replace(/\s+/g, ' ').trim();
assert(
  /cancelled_at is not null/i.test(cancelledFlat) &&
    /completed_at is null/i.test(cancelledFlat) &&
    /active_timer_started_at is null/i.test(cancelledFlat),
  'cancelled requires cancelled_at; completed_at and timer null',
);
assert(
  /closing_entered_at is null or started_at is not null/i.test(cancelledFlat) &&
    !/and closing_entered_at is null\s*$/i.test(cancelledFlat),
  'cancelled allows closing_entered_at when started_at is set (closing cycle)',
);
assert(
  !/cancellation_reason is (not )?null/i.test(cancelledFlat),
  'cancelled leaves cancellation_reason optional (no forced null/not-null)',
);
assert(
  /cancellation_reason\s+is\s+null/i.test(draftArm) &&
    /cancellation_reason\s+is\s+null/i.test(inProgressArm) &&
    /cancellation_reason\s+is\s+null/i.test(pausedArm) &&
    /cancellation_reason\s+is\s+null/i.test(closingArm) &&
    /cancellation_reason\s+is\s+null/i.test(completedArm),
  'cancellation_reason NULL on all non-cancelled states',
);

// --- No incomplete lifecycle RPCs ---
const rpcNames = [
  'start_session',
  'pause_session',
  'resume_session',
  'enter_closing',
  'complete_session',
  'cancel_session',
  'activate_execution',
  'seal_archive',
];
for (const name of rpcNames) {
  assert(
    !new RegExp(`create\\s+(or\\s+replace\\s+)?function\\s+public\\.${name}\\b`, 'i').test(
      sql,
    ),
    `no incomplete RPC public.${name}`,
  );
}

// --- No therapeutic methodology columns / Hawkins etc. ---
const forbiddenTherapeutic = [
  'hawkins',
  'chakra',
  'angel',
  'grafico',
  'gráfico',
  'mesa_35',
  'mesa35',
  'frequency_hz',
  'consciousness_level',
];
for (const term of forbiddenTherapeutic) {
  assert(
    !new RegExp(term, 'i').test(sql),
    `no therapeutic column/term: ${term}`,
  );
}

// --- No service-role usage in B1 migration ---
assert(
  !/service_role/i.test(sql),
  'no service_role grants or policies in B1 migration',
);

// --- Guard helper + indexes ---
assert(
  /execute\s+function\s+public\.platform_guard_mutable_owned_row\s*\(\s*\)/i.test(
    sql,
  ),
  'triggers invoke platform_guard_mutable_owned_row',
);
assert(
  /idx_platform_clients_therapist_id/i.test(sql) &&
    /idx_platform_clients_therapist_display_name/i.test(sql),
  'platform_clients indexes present',
);
assert(
  /idx_platform_sessions_therapist_updated_at/i.test(sql) &&
    /idx_platform_sessions_client_therapist/i.test(sql),
  'platform_sessions indexes present',
);
assert(
  /idx_platform_command_idempotency_expires_at/i.test(sql) &&
    /idx_platform_command_idempotency_therapist_created_at/i.test(sql),
  'platform_command_idempotency indexes present',
);

// --- Authorization marker (core) ---
assert(
  /RADIONICS-F2-B1-LOCAL-AUTH-20260807-01/.test(raw),
  'authorization id recorded in core migration header',
);

// --- Grants hardening migration (additive; original core unchanged) ---
console.log('\n[validate-platform-session-f2-b1] Grants hardening checks\n');

assert(
  /RADIONICS-F2-B1-DEV-GRANTS-CORRECTION-20260807-01/.test(grantsRaw),
  'grants correction authorization recorded in grants migration header',
);
assert(
  !/\bbegin\b/i.test(grantsSql) && !/\bcommit\b/i.test(grantsSql),
  'grants migration has no BEGIN/COMMIT wrapper',
);
assert(
  !/\bcreate\s+table\b/i.test(grantsSql),
  'grants migration creates no additional tables',
);
assert(
  !/\bservice_role\b/i.test(grantsSql),
  'grants migration does not reference service_role (no revoke/modify)',
);

const b1GrantTables = [
  'platform_clients',
  'platform_sessions',
  'platform_command_idempotency',
];

for (const table of b1GrantTables) {
  assert(
    new RegExp(
      `revoke\\s+all\\s+privileges\\s+on\\s+table\\s+public\\.${table}\\s+from\\s+public\\s*,\\s*anon\\s*,\\s*authenticated\\s*;`,
      'i',
    ).test(grantsSql),
    `revoke all on ${table} from public, anon, authenticated`,
  );
}

assert(
  /grant\s+select\s*,\s*insert\s*,\s*update\s*,\s*delete\s+on\s+table\s+public\.platform_clients\s+to\s+authenticated\s*;/i.test(
    grantsSql,
  ),
  'authenticated GRANT on platform_clients = SELECT, INSERT, UPDATE, DELETE',
);
assert(
  /grant\s+select\s*,\s*insert\s+on\s+table\s+public\.platform_sessions\s+to\s+authenticated\s*;/i.test(
    grantsSql,
  ),
  'authenticated GRANT on platform_sessions = SELECT, INSERT',
);
assert(
  /grant\s+select\s+on\s+table\s+public\.platform_command_idempotency\s+to\s+authenticated\s*;/i.test(
    grantsSql,
  ),
  'authenticated GRANT on platform_command_idempotency = SELECT',
);

assert(
  !/grant\s+[^;]*\bto\s+anon\b/i.test(grantsSql),
  'anon receives no GRANT in grants-hardening migration',
);
assert(
  !/grant\s+[^;]*\btruncate\b/i.test(grantsSql) &&
    !/grant\s+[^;]*\btrigger\b/i.test(grantsSql) &&
    !/grant\s+[^;]*\breferences\b/i.test(grantsSql),
  'authenticated is not granted TRUNCATE, TRIGGER, or REFERENCES on B1 tables',
);

// Correct live constraint total on B1 tables is 38 (not a prior miscount of 37).
// Static composition: 32 named CONSTRAINT clauses + 3 PRIMARY KEY + 3 REFERENCES auth.users.
const namedConstraintCount = (
  sql.match(
    /\bconstraint\s+platform_(clients|sessions|command_idempotency)_[a-z0-9_]+/gi,
  ) || []
).length;
const primaryKeyCount = (sql.match(/\bprimary\s+key\b/gi) || []).length;
const authUsersFkCount = (sql.match(/references\s+auth\.users\s*\(/gi) || [])
  .length;
assert(
  namedConstraintCount === 32,
  `core migration declares 32 named platform_* constraints (found ${namedConstraintCount})`,
);
assert(
  primaryKeyCount === 3,
  `core migration declares 3 PRIMARY KEY clauses (found ${primaryKeyCount})`,
);
assert(
  authUsersFkCount === 3,
  `core migration declares 3 REFERENCES auth.users FKs (found ${authUsersFkCount})`,
);
assert(
  namedConstraintCount + primaryKeyCount + authUsersFkCount === 38,
  'B1 constraint composition totals 38 (32 named + 3 PK + 3 auth.users FK)',
);

console.log('\n────────────────────────────────────────');
console.log(`Assertions: ${passed + failed}  passed=${passed}  failed=${failed}`);
console.log(
  'LIMITATION: static SQL inspection only — not a live PostgreSQL/Supabase test.',
);
console.log('────────────────────────────────────────\n');

if (failed > 0) {
  console.error('[validate-platform-session-f2-b1] FAILED');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log('[validate-platform-session-f2-b1] PASSED');
process.exit(0);
