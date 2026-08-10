/**
 * Platform Session F2 Batch B4C — local static migration validator
 *
 * Authorization: RADIONICS-F2-B4C-LOCAL-AUTH-20260810-01
 * Run: npm run validate:platform-session-f2-b4c
 *
 * LIMITATION: Parses migration SQL text only. Does NOT connect to
 * PostgreSQL/Supabase and does NOT replace live RPC/RLS tests.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const migrationRel =
  'supabase/migrations/20260810160000_radionics_platform_session_b4c_report_contributions.sql';
const migrationPath = path.join(root, migrationRel);

const b4cPublicRpcs = [
  {
    name: 'platform_create_report_contribution',
    signature:
      'platform_create_report_contribution(uuid, text, text, jsonb, jsonb, text, text, text, uuid, uuid, text, text, uuid, uuid, uuid, uuid)',
  },
  {
    name: 'platform_set_report_contribution_inclusion',
    signature:
      'platform_set_report_contribution_inclusion(uuid, uuid, text, text)',
  },
  {
    name: 'platform_update_report_contribution_display',
    signature:
      'platform_update_report_contribution_display(uuid, uuid, text, text, boolean)',
  },
  {
    name: 'platform_attach_report_contribution_provenance_refs',
    signature:
      'platform_attach_report_contribution_provenance_refs(uuid, uuid, text, uuid, boolean, uuid, boolean, uuid, boolean, uuid, boolean, uuid, boolean)',
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

console.log('\n[validate-platform-session-f2-b4c] Static B4C migration checks\n');
console.log(`Migration: ${migrationRel}\n`);

assert(fs.existsSync(migrationPath), 'B4C migration file exists');

const raw = fs.existsSync(migrationPath)
  ? fs.readFileSync(migrationPath, 'utf8')
  : '';
const sql = stripSqlComments(raw);

assert(
  /RADIONICS-F2-B4C-LOCAL-AUTH-20260810-01/.test(raw),
  'authorization id recorded in migration header',
);

assert(
  hasCreateTable(sql, 'platform_report_contributions'),
  'creates platform_report_contributions',
);

const createTables = [
  ...sql.matchAll(
    /create\s+table\s+(?:if\s+not\s+exists\s+)?public\.([a-z0-9_]+)/gi,
  ),
].map((m) => m[1].toLowerCase());
assert(
  createTables.length === 1 && createTables[0] === 'platform_report_contributions',
  'exactly one CREATE TABLE (platform_report_contributions)',
);

const forbiddenTables = [
  'platform_methodologies',
  'platform_session_notes',
  'platform_timeline_events',
  'platform_transcript_captures',
  'platform_transcript_segments',
  'platform_session_archive_assemblies',
  'platform_sealed_session_archives',
  'platform_report_templates',
  'platform_report_projections',
  'platform_approved_report_renditions',
  'platform_clients',
  'platform_sessions',
  'platform_command_idempotency',
  'platform_methodology_executions',
];
for (const table of forbiddenTables) {
  assert(!hasCreateTableAnywhere(sql, table), `does not create ${table}`);
}

assert(!/\bplatform_methodologies\b/i.test(sql), 'no platform_methodologies reference');
assert(
  !/platform_upsert_report_contribution/i.test(sql),
  'no platform_upsert_report_contribution',
);
assert(
  !/platform_patch_.*contribution|update_report_contribution_structured|patch_report_contribution/i.test(
    sql,
  ),
  'no general structured_value patch RPC',
);
assert(
  !/platform_patch_methodology_execution_state/i.test(sql),
  'no platform_patch_methodology_execution_state',
);

assert(
  /platform_session_notes_id_therapist_session_unique/i.test(sql) &&
    /platform_timeline_events_id_therapist_session_unique/i.test(sql) &&
    /platform_transcript_segments_id_therapist_session_unique/i.test(sql),
  'additive UNIQUE (id, therapist_id, session_id) on notes/timeline/segments',
);

assert(
  /foreign\s+key\s*\(\s*note_id\s*,\s*therapist_id\s*,\s*session_id\s*\)/i.test(sql) &&
    /foreign\s+key\s*\(\s*timeline_event_id\s*,\s*therapist_id\s*,\s*session_id\s*\)/i.test(
      sql,
    ) &&
    /foreign\s+key\s*\(\s*transcript_capture_id\s*,\s*therapist_id\s*,\s*session_id\s*\)/i.test(
      sql,
    ) &&
    /foreign\s+key\s*\(\s*transcript_segment_id\s*,\s*therapist_id\s*,\s*session_id\s*\)/i.test(
      sql,
    ),
  'same-session provenance FKs present (note/timeline/capture/segment)',
);
assert(
  /foreign\s+key\s*\(\s*session_id\s*,\s*therapist_id\s*,\s*execution_id\s*\)\s*references\s+public\.platform_methodology_executions/i.test(
    sql,
  ),
  'same-session optional execution_id FK present',
);
assert(
  /references\s+public\.radionics_specialties/i.test(sql),
  'optional specialty_id → radionics_specialties',
);

assert(
  /contribution_kind\s+in\s*\([\s\S]*?'session_fact'[\s\S]*?'system_context'/i.test(
    sql,
  ),
  'contribution_kind CHECK includes approved kinds',
);
assert(
  /inclusion\s+in\s*\(\s*'candidate'\s*,\s*'pending_review'\s*,\s*'included'\s*,\s*'excluded'\s*\)/i.test(
    sql,
  ),
  'inclusion CHECK matches F1 set',
);
assert(
  /system_context_not_included|contribution_kind\s*<>\s*'system_context'/i.test(
    sql,
  ),
  'system_context cannot be inclusion=included',
);
assert(
  /create-only|structured_value set once|structured_value create-once/i.test(raw),
  'create-once structured_value documented in migration',
);

assert(/enable\s+row\s+level\s+security/i.test(sql), 'RLS enabled on contributions');
assert(
  /platform_report_contributions_select_own/i.test(sql),
  'owner SELECT policy declared',
);
assert(
  !/create\s+policy\s+"platform_report_contributions_insert/i.test(sql) &&
    !/create\s+policy\s+"platform_report_contributions_update/i.test(sql) &&
    !/create\s+policy\s+"platform_report_contributions_delete/i.test(sql),
  'contributions have no authenticated INSERT/UPDATE/DELETE policy',
);
assert(
  /grant\s+select\s+on\s+table\s+public\.platform_report_contributions\s+to\s+authenticated/i.test(
    sql,
  ),
  'authenticated GRANT SELECT only on contributions',
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
  /platform_b4c_session_allows_contribution/i.test(sql) &&
    /'in_progress'\s*,\s*'paused'\s*,\s*'closing'/i.test(sql),
  'blocks draft/terminal session lifecycle for contribution RPCs',
);
assert(
  /private notes cannot seed report contributions/i.test(sql),
  'rejects private note provenance on create',
);

for (const { name, signature } of b4cPublicRpcs) {
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
  (sql.match(/platform_b2_replay_or_claim_idempotency/gi) || []).length >= 4,
  'all four B4C RPCs route through claim/replay helper',
);
assert(
  /platform_guard_mutable_owned_row/i.test(sql),
  'contributions use platform_guard_mutable_owned_row trigger',
);

assert(
  !/\bhawkins\b/i.test(sql) &&
    !/\bchakra\b/i.test(sql) &&
    !/\bangel\b/i.test(sql) &&
    !/\bmesa_?35\b/i.test(sql),
  'no methodology-specific therapeutic terms/columns',
);

const forbiddenRpcs = [
  'platform_upsert_report_contribution',
  'platform_patch_methodology_execution_state',
  'seal_archive',
  'approve_rendition',
  'platform_create_session_note',
  'platform_append_timeline_event',
  'platform_start_transcript_capture',
  'pause_session',
  'complete_session',
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
  console.error('[validate-platform-session-f2-b4c] FAILED');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log('[validate-platform-session-f2-b4c] PASSED');
process.exit(0);
