/**
 * Platform Session F2 Batch B4B — local static migration validator
 *
 * Authorization: RADIONICS-F2-B4B-LOCAL-AUTH-20260810-01
 * Run: npm run validate:platform-session-f2-b4b
 *
 * LIMITATION: Parses migration SQL text only. Does NOT connect to
 * PostgreSQL/Supabase and does NOT replace live RPC/RLS tests.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const migrationRel =
  'supabase/migrations/20260810140000_radionics_platform_session_b4b_transcript_captures.sql';
const migrationPath = path.join(root, migrationRel);

const b4bPublicRpcs = [
  {
    name: 'platform_start_transcript_capture',
    signature:
      'platform_start_transcript_capture(uuid, text, boolean, text, uuid, text)',
  },
  {
    name: 'platform_pause_transcript_capture',
    signature: 'platform_pause_transcript_capture(uuid, uuid, text)',
  },
  {
    name: 'platform_resume_transcript_capture',
    signature: 'platform_resume_transcript_capture(uuid, uuid, text)',
  },
  {
    name: 'platform_stop_transcript_capture',
    signature: 'platform_stop_transcript_capture(uuid, uuid, text)',
  },
  {
    name: 'platform_append_transcript_segment',
    signature:
      'platform_append_transcript_segment(uuid, uuid, text, timestamptz, text, jsonb, text, timestamptz, uuid)',
  },
  {
    name: 'platform_update_transcript_segment_inclusion',
    signature:
      'platform_update_transcript_segment_inclusion(uuid, uuid, text, text)',
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

console.log('\n[validate-platform-session-f2-b4b] Static B4B migration checks\n');
console.log(`Migration: ${migrationRel}\n`);

assert(fs.existsSync(migrationPath), 'B4B migration file exists');

const raw = fs.existsSync(migrationPath)
  ? fs.readFileSync(migrationPath, 'utf8')
  : '';
const sql = stripSqlComments(raw);

assert(
  /RADIONICS-F2-B4B-LOCAL-AUTH-20260810-01/.test(raw),
  'authorization id recorded in migration header',
);

assert(
  hasCreateTable(sql, 'platform_transcript_captures'),
  'creates platform_transcript_captures',
);
assert(
  hasCreateTable(sql, 'platform_transcript_segments'),
  'creates platform_transcript_segments',
);

const createTables = [
  ...sql.matchAll(
    /create\s+table\s+(?:if\s+not\s+exists\s+)?public\.([a-z0-9_]+)/gi,
  ),
].map((m) => m[1].toLowerCase());
assert(
  createTables.length === 2 &&
    createTables.includes('platform_transcript_captures') &&
    createTables.includes('platform_transcript_segments'),
  'exactly two CREATE TABLE declarations (captures + segments)',
);

const forbiddenTables = [
  'platform_methodologies',
  'platform_session_notes',
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
  'platform_methodology_executions',
  'platform_transcript_provisional',
  'platform_live_spoken_text',
  'platform_audio_blobs',
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
  /capture_mode\s+in\s*\(\s*'full_session'\s*,\s*'point_in_time'\s*\)/i.test(sql),
  'capture_mode CHECK is full_session|point_in_time',
);
assert(
  /status\s+in\s*\(\s*'idle'\s*,\s*'listening'\s*,\s*'paused'\s*,\s*'stopped'\s*\)/i.test(
    sql,
  ),
  'capture status CHECK matches F1 set',
);
assert(
  /inclusion\s+in\s*\(\s*'retained'\s*,\s*'excluded'\s*,\s*'pending_review'\s*\)/i.test(
    sql,
  ),
  'segment inclusion CHECK matches F1 set',
);

assert(
  /foreign\s+key\s*\(\s*session_id\s*,\s*therapist_id\s*\)\s*references\s+public\.platform_sessions/i.test(
    sql,
  ),
  'composite FK to platform_sessions present',
);
assert(
  /unique\s*\(\s*id\s*,\s*therapist_id\s*,\s*session_id\s*\)/i.test(sql) &&
    /platform_transcript_captures_id_therapist_session_unique/i.test(sql),
  'UNIQUE (id, therapist_id, session_id) on captures for same-session segment FK',
);
assert(
  /foreign\s+key\s*\(\s*capture_id\s*,\s*therapist_id\s*,\s*session_id\s*\)\s*references\s+public\.platform_transcript_captures\s*\(\s*id\s*,\s*therapist_id\s*,\s*session_id\s*\)/i.test(
    sql,
  ),
  'same-session capture FK (capture_id, therapist_id, session_id) → captures(id, therapist_id, session_id)',
);
assert(
  !/foreign\s+key\s*\(\s*capture_id\s*,\s*therapist_id\s*\)\s*references\s+public\.platform_transcript_captures\s*\(\s*id\s*,\s*therapist_id\s*\)\s*(?!,\s*session_id)/i.test(
    sql,
  ),
  'no therapist-only pair capture FK (cross-session capture link forbidden)',
);
assert(
  /foreign\s+key\s*\(\s*session_id\s*,\s*therapist_id\s*,\s*execution_id\s*\)\s*references\s+public\.platform_methodology_executions\s*\(\s*session_id\s*,\s*therapist_id\s*,\s*id\s*\)/i.test(
    sql,
  ),
  'same-session optional execution_id FK present',
);

assert(
  /idx_platform_transcript_one_active_full_session/i.test(sql) &&
    /capture_mode\s*=\s*'full_session'/i.test(sql),
  'partial unique index for one active full_session present',
);

assert(
  (sql.match(/enable\s+row\s+level\s+security/gi) || []).length >= 2,
  'RLS enabled on both B4B tables',
);
assert(
  /platform_transcript_captures_select_own/i.test(sql) &&
    /platform_transcript_segments_select_own/i.test(sql),
  'owner SELECT policies declared',
);
assert(
  !/create\s+policy\s+"platform_transcript_captures_insert/i.test(sql) &&
    !/create\s+policy\s+"platform_transcript_captures_update/i.test(sql) &&
    !/create\s+policy\s+"platform_transcript_captures_delete/i.test(sql),
  'captures have no authenticated INSERT/UPDATE/DELETE policy',
);
assert(
  !/create\s+policy\s+"platform_transcript_segments_insert/i.test(sql) &&
    !/create\s+policy\s+"platform_transcript_segments_update/i.test(sql) &&
    !/create\s+policy\s+"platform_transcript_segments_delete/i.test(sql),
  'segments have no authenticated INSERT/UPDATE/DELETE policy',
);

assert(
  /grant\s+select\s+on\s+table\s+public\.platform_transcript_captures\s+to\s+authenticated/i.test(
    sql,
  ) &&
    /grant\s+select\s+on\s+table\s+public\.platform_transcript_segments\s+to\s+authenticated/i.test(
      sql,
    ),
  'authenticated GRANT SELECT only on B4B tables',
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

assert(!/\bbytea\b/i.test(sql), 'no bytea columns');
assert(
  !/\baudio_url\s|audio_path\s|raw_audio\s|media_url\s/i.test(sql),
  'no audio storage column declarations',
);
assert(
  !/storage\.buckets|create\s+bucket/i.test(sql),
  'no storage bucket for session audio',
);

assert(
  /consent_recorded must be true before listening/i.test(sql),
  'consent required before listening',
);
assert(
  /platform_b4b_session_allows_transcript/i.test(sql) &&
    /'in_progress'\s*,\s*'paused'\s*,\s*'closing'/i.test(sql),
  'blocks draft/terminal session lifecycle for transcript RPCs',
);
assert(
  /already has an active full_session transcript capture/i.test(sql),
  'rejects concurrent active full_session start',
);
assert(
  /provenance must not contain audio storage references/i.test(sql),
  'append rejects audio provenance keys',
);
assert(
  /listening\|paused\|stopped/i.test(sql) &&
    /post-capture confirmation/i.test(sql),
  'append allows listening|paused|stopped for post-capture confirmation',
);
assert(
  /session must be in_progress\|paused\|closing/i.test(sql) ||
    /transcript segment append requires session lifecycle in_progress\|paused\|closing/i.test(
      sql,
    ),
  'append still requires writable session lifecycle even for stopped captures',
);

for (const { name, signature } of b4bPublicRpcs) {
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
  (sql.match(/platform_b2_replay_or_claim_idempotency/gi) || []).length >= 6,
  'all six B4B RPCs route through claim/replay helper',
);
assert(
  /platform_guard_mutable_owned_row/i.test(sql),
  'captures/segments use platform_guard_mutable_owned_row trigger',
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
  'platform_create_session_note',
  'platform_append_timeline_event',
  'seal_archive',
  'approve_rendition',
  'transcribe_audio',
  'upload_session_audio',
  'upsert_live_spoken_text',
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
  console.error('[validate-platform-session-f2-b4b] FAILED');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log('[validate-platform-session-f2-b4b] PASSED');
process.exit(0);
