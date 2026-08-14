/**
 * Platform Therapist Setup — local static validator
 *
 * Authorization: RADIONICS-THERAPIST-SETUP-LOCAL-AUTH-20260814-01
 * Run: npm run validate:platform-therapist-setup
 *
 * Asserts Phase-1 specialty/cert contracts + Therapist Setup governance
 * migration (OD-TS-5 document-before-pending, OD-TS-7 expiry in helper),
 * grants hardening matrix, two approved flows, deferred private
 * methodologies, and no platform_methodologies.
 *
 * LIMITATION: Static SQL/text checks only. Does NOT connect to
 * PostgreSQL/Supabase and does NOT replace live post-apply verification.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const phase1Rel =
  'supabase/migrations/20260531120000_radionics_specialties_phase1.sql';
const storageRel =
  'supabase/migrations/20260531120001_radionics_certifications_storage.sql';
const resubmitRel =
  'supabase/migrations/20260531130000_certifications_resubmit_rls.sql';
const helperIntroRel =
  'supabase/migrations/20260531150000_radionics_methodology_core_v2.sql';
const governanceRel =
  'supabase/migrations/20260814120000_radionics_therapist_setup_governance.sql';
const grantsRel =
  'supabase/migrations/20260814123000_radionics_therapist_setup_grants_hardening.sql';
const readinessRel =
  'docs/Engine/Therapist/Platform_Therapist_Setup_Pre_Implementation_Readiness.md';
const reportRel =
  'docs/Engine/Therapist/Platform_Therapist_Setup_Local_Implementation_Report.md';
const certRulesRel = 'src/lib/certificationRules.ts';

const canonicalTables = [
  'radionics_specialties',
  'radionics_specialty_requests',
  'therapist_specialty_certifications',
  'therapist_specialty_documents',
];

const forbiddenPrivateTables = [
  'therapist_owned_methodologies',
  'therapist_private_methodologies',
  'therapist_methodologies',
  'private_methodologies',
  'platform_methodologies',
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

function functionBodyContains(sql, fnName, needle) {
  const re = new RegExp(
    `create\\s+or\\s+replace\\s+function\\s+public\\.${fnName}\\b[\\s\\S]*?\\$\\$[\\s\\S]*?\\$\\$`,
    'i',
  );
  const m = sql.match(re);
  if (!m) return false;
  return new RegExp(needle, 'i').test(m[0]);
}

console.log('\n[validate-platform-therapist-setup] Therapist Setup local checks\n');
console.log('Authorization: RADIONICS-THERAPIST-SETUP-LOCAL-AUTH-20260814-01\n');

// ---------------------------------------------------------------------------
// 1. Authority / deliverable presence
// ---------------------------------------------------------------------------

assert(fs.existsSync(path.join(root, readinessRel)), 'readiness document exists');
assert(fs.existsSync(path.join(root, reportRel)), 'local implementation report exists');
assert(fs.existsSync(path.join(root, phase1Rel)), 'Phase-1 specialties migration exists');
assert(fs.existsSync(path.join(root, storageRel)), 'certifications storage migration exists');
assert(fs.existsSync(path.join(root, resubmitRel)), 'certifications resubmit RLS migration exists');
assert(
  fs.existsSync(path.join(root, helperIntroRel)),
  'methodology core migration (helper intro) exists',
);
assert(
  fs.existsSync(path.join(root, governanceRel)),
  'Therapist Setup governance migration exists',
);
assert(
  fs.existsSync(path.join(root, grantsRel)),
  'Therapist Setup grants hardening migration exists',
);
assert(fs.existsSync(path.join(root, certRulesRel)), 'certificationRules.ts exists');

const packageJson = JSON.parse(read('package.json') || '{}');
assert(
  packageJson.scripts?.['validate:platform-therapist-setup'] ===
    'node scripts/validate-platform-therapist-setup.mjs',
  'package.json has validate:platform-therapist-setup script',
);

const readiness = read(readinessRel);
assert(
  /OD-TS-1[\s\S]*APPROVED/i.test(readiness) &&
    /OD-TS-15[\s\S]*APPROVED/i.test(readiness),
  'readiness marks OD-TS set as APPROVED',
);
assert(
  /Two flows only|exactly two/i.test(readiness) &&
    /radionics_specialty_requests/i.test(readiness) &&
    /Private\/owned methodologies deferred|explicitly deferred/i.test(readiness),
  'readiness encodes OD-TS-15 two flows + private deferred',
);

const report = read(reportRel);
assert(
  /RADIONICS-THERAPIST-SETUP-LOCAL-AUTH-20260814-01/.test(report),
  'report cites local authorization id',
);
assert(
  /THERAPIST SETUP GRANTS HARDENING RECONCILIATION COMPLETE — READY FOR OWNER REVIEW — NOT APPLIED/.test(
    report,
  ),
  'report contains grants hardening stop line',
);
assert(
  /NOT APPLIED/i.test(report),
  'report status remains not applied',
);

// ---------------------------------------------------------------------------
// 2. Phase-1 canonical tables + contracts
// ---------------------------------------------------------------------------

const phase1Raw = read(phase1Rel);
const phase1Sql = stripSqlComments(phase1Raw);

for (const table of canonicalTables) {
  assert(hasCreateTable(phase1Sql, table), `Phase-1 creates public.${table}`);
}

assert(
  /unique\s*\(\s*therapist_id\s*,\s*specialty_id\s*\)/i.test(phase1Sql),
  'certifications UNIQUE (therapist_id, specialty_id)',
);

assert(
  /status\s+in\s*\(\s*'not_certified'\s*,\s*'pending'\s*,\s*'approved'\s*,\s*'rejected'\s*,\s*'expired'\s*\)/i.test(
    phase1Sql,
  ),
  'certification status CHECK set preserved',
);

assert(
  /status\s+in\s*\(\s*'pending_review'\s*,\s*'approved'\s*,\s*'rejected'\s*\)/i.test(phase1Sql),
  'specialty request status CHECK includes pending_review/approved/rejected',
);

assert(
  /mime_type\s+in\s*\(\s*'application\/pdf'\s*,\s*'image\/jpeg'\s*,\s*'image\/png'\s*\)/i.test(
    phase1Sql,
  ),
  'documents mime CHECK allows pdf/jpeg/png',
);

assert(
  !hasCreateTable(phase1Sql, 'platform_methodologies'),
  'Phase-1 does not create platform_methodologies',
);

for (const table of forbiddenPrivateTables) {
  assert(
    !hasCreateTable(phase1Sql, table),
    `Phase-1 does not create forbidden table ${table}`,
  );
}

const storageRaw = read(storageRel);
assert(
  /radionics-certifications/i.test(storageRaw),
  'storage migration references radionics-certifications bucket',
);
assert(
  /radionics\/certifications/i.test(storageRaw),
  'storage path prefix radionics/certifications present',
);

const resubmitSql = stripSqlComments(read(resubmitRel));
assert(
  /certifications_therapist_update_own_editable/i.test(resubmitSql),
  'resubmit RLS policy present',
);
assert(
  /status\s+in\s*\(\s*'not_certified'\s*,\s*'pending'\s*,\s*'rejected'\s*,\s*'expired'\s*\)/i.test(
    resubmitSql,
  ),
  'therapist update cannot self-set approved',
);

// ---------------------------------------------------------------------------
// 3. Governance migration (OD-TS-5 / OD-TS-7)
// ---------------------------------------------------------------------------

const govRaw = read(governanceRel);
const govSql = stripSqlComments(govRaw);
const govLower = govSql.toLowerCase();

assert(
  /RADIONICS-THERAPIST-SETUP-LOCAL-AUTH-20260814-01/.test(govRaw),
  'governance migration cites local auth id',
);

assert(
  /create\s+or\s+replace\s+function\s+public\.has_approved_specialty_certification\s*\(\s*p_specialty_id\s+uuid\s*\)/i.test(
    govSql,
  ),
  'governance replaces has_approved_specialty_certification',
);

assert(
  functionBodyContains(
    govSql,
    'has_approved_specialty_certification',
    'expires_at\\s+is\\s+null\\s+or\\s+c\\.expires_at\\s*>\\s*now\\(\\)',
  ),
  'helper enforces expires_at null or future (OD-TS-7)',
);

assert(
  functionBodyContains(
    govSql,
    'has_approved_specialty_certification',
    "status\\s*=\\s*'approved'",
  ),
  'helper still requires status approved',
);

assert(
  /grant\s+execute\s+on\s+function\s+public\.has_approved_specialty_certification\s*\(\s*uuid\s*\)\s+to\s+authenticated/i.test(
    govSql,
  ),
  'helper EXECUTE granted to authenticated',
);
assert(
  /grant\s+execute\s+on\s+function\s+public\.has_approved_specialty_certification\s*\(\s*uuid\s*\)\s+to\s+service_role/i.test(
    govSql,
  ),
  'helper EXECUTE granted to service_role',
);

assert(
  /create\s+or\s+replace\s+function\s+public\.enforce_certification_pending_requires_document\s*\(/i.test(
    govSql,
  ),
  'OD-TS-5 enforce function created',
);
assert(
  /trg_therapist_specialty_certifications_pending_requires_document/i.test(govSql),
  'pending-requires-document trigger present',
);
assert(
  /therapist_specialty_documents/i.test(govSql) &&
    /status\s*=\s*'pending'/i.test(govSql),
  'pending gate references documents table',
);

assert(
  !/create\s+table/i.test(govSql),
  'governance migration creates no new tables',
);
assert(
  !/\bplatform_methodologies\b/i.test(govSql) ||
    /no\s+platform_methodologies/i.test(govRaw),
  'governance does not introduce platform_methodologies object',
);
assert(
  !hasCreateTable(govSql, 'platform_methodologies'),
  'governance does not CREATE platform_methodologies',
);

for (const table of [
  'therapist_owned_methodologies',
  'therapist_private_methodologies',
  'therapist_methodologies',
  'private_methodologies',
]) {
  assert(
    !hasCreateTable(govSql, table),
    `governance does not create deferred private table ${table}`,
  );
}

assert(
  !/create\s+table\s+[\w."]*platform_session/i.test(govSql),
  'governance does not create platform_session tables',
);
assert(
  !/create\s+(or\s+replace\s+)?function\s+public\.platform_/i.test(govSql),
  'governance does not create platform_* RPCs',
);

assert(
  /Flow 2|OD-TS-9|never auto-creates therapist certification/i.test(govRaw),
  'governance comments state request approval ≠ certification',
);
assert(
  /no therapist-owned|private catalog|private methodology/i.test(govRaw),
  'governance comments defer private methodologies',
);

// ---------------------------------------------------------------------------
// 4. Helper intro vs governance supersession (static chain)
// ---------------------------------------------------------------------------

const helperIntroSql = stripSqlComments(read(helperIntroRel));
assert(
  /create\s+or\s+replace\s+function\s+public\.has_approved_specialty_certification/i.test(
    helperIntroSql,
  ),
  'V2.1 originally defined has_approved_specialty_certification',
);
assert(
  !functionBodyContains(
    helperIntroSql,
    'has_approved_specialty_certification',
    'expires_at',
  ),
  'pre-governance helper lacked expires_at (gap closed by Therapist Setup)',
);

const govTs = '20260814120000';
const b6Ts = '20260811140000';
assert(govTs > b6Ts, 'Therapist Setup migration timestamp after F2 B6');

// ---------------------------------------------------------------------------
// 5. Client submit/resubmit rules alignment (no UI batch)
// ---------------------------------------------------------------------------

const certRules = read(certRulesRel);
assert(
  /assertCanSubmitNewCertification/.test(certRules),
  'certificationRules exports submit gate',
);
assert(
  /case\s+'pending':/.test(certRules) && /case\s+'approved':/.test(certRules),
  'submit rules block pending and approved',
);
assert(
  /canOpenResubmitModal/.test(certRules) &&
    /rejected/.test(certRules) &&
    /expired/.test(certRules),
  'resubmit allowed only for rejected/expired',
);

const mockResubmit = read('src/services/certificationsService.ts');
assert(
  /pelo menos um documento/i.test(mockResubmit),
  'mock resubmit requires ≥1 document (client align OD-TS-5)',
);

const supabaseReview = read('src/services/supabase/specialtiesSupabase.ts');
assert(
  /adminReviewSpecialtyRequest/.test(supabaseReview),
  'Flow 2 admin review service exists',
);
assert(
  /\.from\('radionics_specialties'\)\s*\.insert/i.test(supabaseReview),
  'request approval inserts into radionics_specialties catalog',
);
assert(
  !/therapist_specialty_certifications[\s\S]{0,200}insert/i.test(
    supabaseReview.split('adminReviewSpecialtyRequest')[1] ?? '',
  ),
  'request approval path does not insert therapist_specialty_certifications',
);

// ---------------------------------------------------------------------------
// 6. Forbidden cross-scope artifacts in this batch
// ---------------------------------------------------------------------------

assert(
  !/create\s+table\s+[\w."]*methodology_configuration/i.test(govSql),
  'no methodology configuration table in governance SQL',
);

const f2Touched = fs
  .readdirSync(path.join(root, 'supabase/migrations'))
  .filter((f) => /platform_session_b[1-7]/i.test(f));
assert(f2Touched.length >= 10, 'F2 B1–B6 migration files still present');

const therapistMigrations = fs
  .readdirSync(path.join(root, 'supabase/migrations'))
  .filter((f) => /therapist_setup/i.test(f) && f.endsWith('.sql'))
  .sort();
assert(
  therapistMigrations.length === 2 &&
    therapistMigrations.includes(path.basename(governanceRel)) &&
    therapistMigrations.includes(path.basename(grantsRel)),
  'Therapist Setup has governance + grants hardening migrations only',
);

// ---------------------------------------------------------------------------
// 7. Grants hardening reconciliation (exact matrix)
// ---------------------------------------------------------------------------

console.log('\n[validate-platform-therapist-setup] Grants hardening checks\n');

const grantsRaw = read(grantsRel);
const grantsSql = stripSqlComments(grantsRaw);

assert(
  /RADIONICS-THERAPIST-SETUP-LOCAL-AUTH-20260814-01/.test(grantsRaw),
  'grants hardening cites local auth id',
);
assert(
  /^\s*begin\s*;/im.test(grantsSql) && /\bcommit\s*;/i.test(grantsSql),
  'grants migration uses BEGIN/COMMIT wrapper',
);
assert(
  !/\bcreate\s+table\b/i.test(grantsSql),
  'grants migration creates no tables',
);
assert(
  !/\bcreate\s+(or\s+replace\s+)?function\b/i.test(grantsSql),
  'grants migration creates no RPCs/functions',
);
assert(
  !/\bcreate\s+policy\b/i.test(grantsSql) && !/\balter\s+policy\b/i.test(grantsSql),
  'grants migration does not alter RLS policies',
);
assert(
  !/\bservice_role\b/i.test(grantsSql),
  'grants migration does not reference service_role',
);
assert(
  !hasCreateTable(grantsSql, 'platform_methodologies') &&
    !/\bcreate\s+[\w."]*platform_methodologies\b/i.test(grantsSql),
  'grants migration does not create platform_methodologies',
);

for (const table of canonicalTables) {
  assert(
    new RegExp(
      `revoke\\s+all\\s+privileges\\s+on\\s+table\\s+public\\.${table}\\s+from\\s+public\\s*,\\s*anon\\s*,\\s*authenticated\\s*;`,
      'i',
    ).test(grantsSql),
    `revoke all on ${table} from public, anon, authenticated`,
  );
}

assert(
  /grant\s+select\s*,\s*insert\s*,\s*update\s*,\s*delete\s+on\s+table\s+public\.radionics_specialties\s+to\s+authenticated\s*;/i.test(
    grantsSql,
  ),
  'authenticated GRANT on radionics_specialties = SELECT, INSERT, UPDATE, DELETE',
);
assert(
  /grant\s+select\s*,\s*insert\s*,\s*update\s+on\s+table\s+public\.radionics_specialty_requests\s+to\s+authenticated\s*;/i.test(
    grantsSql,
  ),
  'authenticated GRANT on radionics_specialty_requests = SELECT, INSERT, UPDATE',
);
assert(
  /grant\s+select\s*,\s*insert\s*,\s*update\s+on\s+table\s+public\.therapist_specialty_certifications\s+to\s+authenticated\s*;/i.test(
    grantsSql,
  ),
  'authenticated GRANT on therapist_specialty_certifications = SELECT, INSERT, UPDATE',
);
assert(
  /grant\s+select\s*,\s*insert\s*,\s*delete\s+on\s+table\s+public\.therapist_specialty_documents\s+to\s+authenticated\s*;/i.test(
    grantsSql,
  ),
  'authenticated GRANT on therapist_specialty_documents = SELECT, INSERT, DELETE',
);

assert(
  !/grant\s+[^;]*\bto\s+anon\b/i.test(grantsSql),
  'anon receives no GRANT in grants-hardening migration',
);
assert(
  !/grant\s+[^;]*\btruncate\b/i.test(grantsSql) &&
    !/grant\s+[^;]*\btrigger\b/i.test(grantsSql) &&
    !/grant\s+[^;]*\breferences\b/i.test(grantsSql),
  'no TRUNCATE, TRIGGER, or REFERENCES grants to anon/authenticated',
);

assert(
  !/grant\s+[^;]*\bdelete\s+[^;]*on\s+table\s+public\.radionics_specialty_requests\b/i.test(
    grantsSql,
  ),
  'specialty_requests is not granted DELETE',
);
assert(
  !/grant\s+[^;]*\bdelete\s+[^;]*on\s+table\s+public\.therapist_specialty_certifications\b/i.test(
    grantsSql,
  ),
  'certifications is not granted DELETE',
);
assert(
  !/grant\s+[^;]*\bupdate\s+[^;]*on\s+table\s+public\.therapist_specialty_documents\b/i.test(
    grantsSql,
  ),
  'documents is not granted UPDATE',
);

const grantsTs = '20260814123000';
assert(grantsTs > govTs, 'grants hardening timestamp after governance migration');

assert(
  /GRANTS HARDENING|grants hardening|Dev apply findings/i.test(read(reportRel)),
  'report documents grants hardening / Dev apply reconciliation',
);
assert(
  /THERAPIST SETUP GRANTS HARDENING RECONCILIATION COMPLETE — READY FOR OWNER REVIEW — NOT APPLIED/.test(
    read(reportRel),
  ),
  'report contains grants hardening stop line',
);

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log(`\n[validate-platform-therapist-setup] ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  console.error('Failures:');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log('THERAPIST SETUP LOCAL VALIDATOR GREEN — NOT APPLIED\n');
