/**
 * Platform Session F2 Batch B4A — local static migration validator
 *
 * Authorization: RADIONICS-F2-B4A-LOCAL-AUTH-20260810-01
 * Run: npm run validate:platform-session-f2-b4a
 *
 * LIMITATION: Parses migration SQL text only. Does NOT connect to
 * PostgreSQL/Supabase and does NOT replace live RPC/RLS tests.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const migrationRel =
  'supabase/migrations/20260810120000_radionics_platform_session_b4a_notes_timeline.sql';
const migrationPath = path.join(root, migrationRel);

const b4aPublicRpcs = [
  {
    name: 'platform_create_session_note',
    signature:
      'platform_create_session_note(uuid, text, text, text, jsonb, text, uuid, jsonb)',
  },
  {
    name: 'platform_update_session_note',
    signature:
      'platform_update_session_note(uuid, uuid, text, text, text, jsonb, boolean)',
  },
  {
    name: 'platform_append_timeline_event',
    signature:
      'platform_append_timeline_event(uuid, text, text, timestamptz, text, text, jsonb, uuid)',
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

console.log('\n[validate-platform-session-f2-b4a] Static B4A migration checks\n');
console.log(`Migration: ${migrationRel}\n`);

assert(fs.existsSync(migrationPath), 'B4A migration file exists');

const raw = fs.existsSync(migrationPath)
  ? fs.readFileSync(migrationPath, 'utf8')
  : '';
const sql = stripSqlComments(raw);

assert(
  /RADIONICS-F2-B4A-LOCAL-AUTH-20260810-01/.test(raw),
  'authorization id recorded in migration header',
);

assert(hasCreateTable(sql, 'platform_session_notes'), 'creates platform_session_notes');
assert(
  hasCreateTable(sql, 'platform_timeline_events'),
  'creates platform_timeline_events',
);

const createTables = [
  ...sql.matchAll(
    /create\s+table\s+(?:if\s+not\s+exists\s+)?public\.([a-z0-9_]+)/gi,
  ),
].map((m) => m[1].toLowerCase());
assert(
  createTables.length === 2 &&
    createTables.includes('platform_session_notes') &&
    createTables.includes('platform_timeline_events'),
  'exactly two CREATE TABLE declarations (notes + timeline)',
);

const forbiddenTables = [
  'platform_methodologies',
  'platform_transcript_captures',
  'platform_transcript_segments',
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
  'platform_methodology_executions',
];
for (const table of forbiddenTables) {
  assert(!hasCreateTableAnywhere(sql, table), `does not create ${table}`);
}

assert(!/\bplatform_methodologies\b/i.test(sql), 'no platform_methodologies reference');
assert(
  !/platform_patch_methodology_execution_state/i.test(sql),
  'no platform_patch_methodology_execution_state',
);

assert(
  /foreign\s+key\s*\(\s*session_id\s*,\s*therapist_id\s*\)\s*references\s+public\.platform_sessions/i.test(
    sql,
  ),
  'composite FK to platform_sessions present',
);
assert(
  /foreign\s+key\s*\(\s*session_id\s*,\s*therapist_id\s*,\s*execution_id\s*\)\s*references\s+public\.platform_methodology_executions\s*\(\s*session_id\s*,\s*therapist_id\s*,\s*id\s*\)/i.test(
    sql,
  ),
  'same-session optional execution_id FK present',
);

assert(
  /kind\s+in\s*\(\s*'written'\s*,\s*'dictated'\s*,\s*'transcript_excerpt'\s*\)/i.test(
    sql,
  ),
  'note kind CHECK matches F1',
);
assert(
  /disposition\s+in\s*\(\s*'private'\s*,\s*'review_for_report'\s*,\s*'included_in_report'\s*\)/i.test(
    sql,
  ),
  'note disposition CHECK matches Product 03',
);
assert(
  /source\s+in\s*\(\s*'platform'\s*,\s*'methodology'\s*,\s*'therapist'\s*\)/i.test(
    sql,
  ),
  'timeline source CHECK matches F1',
);
assert(
  /platform_b4a_is_noise_event_type/i.test(sql),
  'timeline noise event_type denylist helper present',
);

assert(
  (sql.match(/enable\s+row\s+level\s+security/gi) || []).length >= 2,
  'RLS enabled on both B4A tables',
);
assert(
  /platform_session_notes_select_own/i.test(sql) &&
    /platform_timeline_events_select_own/i.test(sql),
  'owner SELECT policies declared',
);
assert(
  !/create\s+policy\s+"platform_session_notes_insert/i.test(sql) &&
    !/create\s+policy\s+"platform_session_notes_update/i.test(sql) &&
    !/create\s+policy\s+"platform_session_notes_delete/i.test(sql),
  'notes have no authenticated INSERT/UPDATE/DELETE policy',
);
assert(
  !/create\s+policy\s+"platform_timeline_events_insert/i.test(sql) &&
    !/create\s+policy\s+"platform_timeline_events_update/i.test(sql) &&
    !/create\s+policy\s+"platform_timeline_events_delete/i.test(sql),
  'timeline has no authenticated INSERT/UPDATE/DELETE policy',
);

assert(
  /grant\s+select\s+on\s+table\s+public\.platform_session_notes\s+to\s+authenticated/i.test(
    sql,
  ) &&
    /grant\s+select\s+on\s+table\s+public\.platform_timeline_events\s+to\s+authenticated/i.test(
      sql,
    ),
  'authenticated GRANT SELECT only on B4A tables',
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

for (const { name, signature } of b4aPublicRpcs) {
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
  /platform_b2_replay_or_claim_idempotency/i.test(sql) &&
    /platform_b2_finalize_idempotency/i.test(sql) &&
    /platform_b2_fail_idempotency_claim/i.test(sql),
  'reuses B2 pending-claim idempotency helpers',
);
assert(
  (sql.match(/platform_b2_replay_or_claim_idempotency/gi) || []).length >= 3,
  'all three B4A RPCs route through claim/replay helper',
);
assert(
  /platform_b4a_session_allows_note_timeline/i.test(sql) &&
    /'in_progress'\s*,\s*'paused'\s*,\s*'closing'/i.test(sql),
  'blocks draft/terminal session lifecycle for note/timeline RPCs',
);
assert(
  /platform_guard_mutable_owned_row/i.test(sql),
  'notes use platform_guard_mutable_owned_row trigger',
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
  'seal_archive',
  'approve_rendition',
  'pause_session',
  'resume_session',
  'complete_session',
  'cancel_session',
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
  console.error('[validate-platform-session-f2-b4a] FAILED');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log('[validate-platform-session-f2-b4a] PASSED');
process.exit(0);
