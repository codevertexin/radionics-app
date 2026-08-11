/**
 * Platform Session F2 Batch B6 — local static migration validator
 *
 * Authorization: RADIONICS-F2-B6-LOCAL-AUTH-20260811-01
 * Run: npm run validate:platform-session-f2-b6
 *
 * LIMITATION: Parses migration SQL text only. Does NOT connect to
 * PostgreSQL/Supabase and does NOT replace live RPC/RLS tests.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const migrationRel =
  'supabase/migrations/20260811140000_radionics_platform_session_b6_report_projection.sql';
const migrationPath = path.join(root, migrationRel);

const b6PublicRpcs = [
  {
    name: 'platform_upsert_report_template',
    signature:
      'platform_upsert_report_template(text, text, text, jsonb, uuid, uuid, text)',
  },
  {
    name: 'platform_set_report_template_status',
    signature: 'platform_set_report_template_status(uuid, text, text, integer)',
  },
  {
    name: 'platform_create_report_projection',
    signature: 'platform_create_report_projection(uuid, uuid, uuid, text)',
  },
  {
    name: 'platform_update_report_projection_draft',
    signature:
      'platform_update_report_projection_draft(uuid, uuid, text, jsonb, jsonb, boolean, boolean, integer)',
  },
  {
    name: 'platform_set_report_projection_status',
    signature:
      'platform_set_report_projection_status(uuid, uuid, text, text, integer)',
  },
  {
    name: 'platform_approve_report_rendition',
    signature: 'platform_approve_report_rendition(uuid, uuid, text, integer)',
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

console.log('\n[validate-platform-session-f2-b6] Static B6 migration checks\n');
console.log(`Migration: ${migrationRel}\n`);

assert(fs.existsSync(migrationPath), 'B6 migration file exists');

const raw = fs.existsSync(migrationPath)
  ? fs.readFileSync(migrationPath, 'utf8')
  : '';
const sql = stripSqlComments(raw);

assert(
  /RADIONICS-F2-B6-LOCAL-AUTH-20260811-01/.test(raw),
  'authorization id recorded in migration header',
);

assert(
  hasCreateTable(sql, 'platform_report_templates'),
  'creates platform_report_templates',
);
assert(
  hasCreateTable(sql, 'platform_report_projections'),
  'creates platform_report_projections',
);
assert(
  hasCreateTable(sql, 'platform_approved_report_renditions'),
  'creates platform_approved_report_renditions',
);

const createTables = [
  ...sql.matchAll(
    /create\s+table\s+(?:if\s+not\s+exists\s+)?public\.([a-z0-9_]+)/gi,
  ),
].map((m) => m[1].toLowerCase());
assert(
  createTables.length === 3 &&
    createTables.includes('platform_report_templates') &&
    createTables.includes('platform_report_projections') &&
    createTables.includes('platform_approved_report_renditions'),
  'exactly three CREATE TABLE (templates + projections + renditions)',
);

const forbiddenTables = [
  'platform_methodologies',
  'platform_session_notes',
  'platform_timeline_events',
  'platform_transcript_captures',
  'platform_transcript_segments',
  'platform_report_contributions',
  'platform_session_archive_assemblies',
  'platform_sealed_session_archives',
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
  /platform_sealed_session_archives_id_therapist_session_unique/i.test(sql),
  'additive UNIQUE (id, therapist_id, session_id) on sealed archives',
);
assert(
  /foreign\s+key\s*\(\s*archive_id\s*,\s*therapist_id\s*,\s*session_id\s*\)\s*references\s+public\.platform_sealed_session_archives/i.test(
    sql,
  ),
  'same-session sealed archive FK on projections',
);
assert(
  /references\s+public\.radionics_specialties/i.test(sql),
  'optional specialty_id → radionics_specialties on templates',
);

assert(
  /status\s+in\s*\(\s*'draft'\s*,\s*'in_review'\s*,\s*'approved'\s*\)/i.test(sql),
  'projection status CHECK draft|in_review|approved',
);
assert(
  /status\s+in\s*\(\s*'draft'\s*,\s*'active'\s*,\s*'inactive'\s*\)/i.test(sql),
  'template status CHECK draft|active|inactive',
);
assert(
  /content_sha256/i.test(sql) && /platform_b6_content_sha256|digest\s*\(/i.test(sql),
  'rendition content_sha256 via sha256 helper',
);
assert(
  /trg_platform_approved_report_renditions_immutable|platform_b6_reject_rendition_mutation/i.test(
    sql,
  ),
  'approved rendition immutability trigger present',
);
assert(
  /unique\s*\(\s*session_id\s*,\s*version\s*\)/i.test(sql),
  'rendition version monotonic unique per session',
);

assert(/enable\s+row\s+level\s+security/i.test(sql), 'RLS enabled on B6 tables');
assert(
  /platform_report_templates_select_official_or_own/i.test(sql) &&
    /platform_report_projections_select_own/i.test(sql) &&
    /platform_approved_report_renditions_select_own/i.test(sql),
  'owner/official SELECT policies declared',
);
assert(
  !/create\s+policy\s+"platform_report_projections_insert/i.test(sql) &&
    !/create\s+policy\s+"platform_approved_report_renditions_insert/i.test(sql) &&
    !/create\s+policy\s+"platform_approved_report_renditions_update/i.test(sql),
  'B6 session tables have no authenticated INSERT/UPDATE policies',
);
assert(
  /grant\s+select\s+on\s+table\s+public\.platform_report_templates\s+to\s+authenticated/i.test(
    sql,
  ) &&
    /grant\s+select\s+on\s+table\s+public\.platform_report_projections\s+to\s+authenticated/i.test(
      sql,
    ) &&
    /grant\s+select\s+on\s+table\s+public\.platform_approved_report_renditions\s+to\s+authenticated/i.test(
      sql,
    ),
  'authenticated GRANT SELECT only on B6 tables',
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
  /sealed archive not found for session/i.test(sql),
  'create projection requires sealed archive',
);
assert(
  /report template must be active/i.test(sql),
  'create projection requires active template',
);
assert(
  /privateNotesAutoInclude['"]?\s*,\s*false|privateNotesAutoInclude',\s*false/i.test(
    sql,
  ),
  'policy marks private notes not auto-included',
);
assert(
  /fullTranscriptAutoInclude['"]?\s*,\s*false|fullTranscriptAutoInclude',\s*false/i.test(
    sql,
  ),
  'policy marks full transcript not auto-included',
);
assert(
  /sourceArchiveEnvelope|p_archive\.envelope/i.test(sql),
  'approve freezes source archive envelope into sealed_content',
);
assert(
  /never mutates|does not mutate archive|no archive mutation/i.test(raw),
  'archive non-mutation documented',
);

for (const { name, signature } of b6PublicRpcs) {
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
  'all six B6 RPCs route through claim/replay helper',
);
assert(
  /platform_guard_mutable_owned_row/i.test(sql),
  'templates/projections use platform_guard_mutable_owned_row',
);

assert(
  !/\bhawkins\b/i.test(sql) &&
    !/\bchakra\b/i.test(sql) &&
    !/\bangel\b/i.test(sql) &&
    !/\bmesa_?35\b/i.test(sql),
  'no methodology-specific therapeutic terms/columns',
);
assert(
  !/create\s+table[\s\S]{0,80}\bpdf\b/i.test(sql) &&
    !/create\s+(or\s+replace\s+)?function\s+public\.\w*pdf\w*/i.test(sql),
  'no PDF tables or PDF generator RPCs',
);
assert(
  !/create\s+(or\s+replace\s+)?function\s+public\.platform_seal_session_archive\b/i.test(
    sql,
  ) &&
    !/create\s+(or\s+replace\s+)?function\s+public\.platform_prepare_session_archive_assembly\b/i.test(
      sql,
    ) &&
    !/create\s+(or\s+replace\s+)?function\s+public\.platform_unseal/i.test(sql),
  'no archive seal/prepare/unseal RPCs in B6',
);

const forbiddenRpcs = [
  'platform_generate_report_pdf',
  'platform_export_report_pdf',
  'platform_share_report_rendition',
  'platform_update_sealed_session_archive',
  'platform_patch_methodology_execution_state',
  'platform_create_session_note',
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
  console.error('[validate-platform-session-f2-b6] FAILED');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log('[validate-platform-session-f2-b6] PASSED');
process.exit(0);
