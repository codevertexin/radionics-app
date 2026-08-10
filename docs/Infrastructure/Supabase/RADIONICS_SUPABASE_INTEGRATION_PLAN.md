# Radionics — Supabase Integration Plan
**Date:** 2025-05-31
**Status:** Pre-implementation reference
**Input:** `RADIONICS_DATABASE_DECISIONS.md`, `RADIONICS_FRONTEND_PERSISTENCE_CONTRACT.md`, `types/index.ts`, `mock-data.ts`
**Scope:** Exact integration path from current mock frontend to live Supabase. No SQL. No code changes. Planning only.

---

## Current State Summary

Every page reads from static arrays in `packages/web/src/web/lib/mock-data.ts`. No network calls exist. The Hono API server is wired (`lib/api.ts`) but has no routes that touch data. The Drizzle schema file is an empty stub.

**Mock exports that exist today:**

| Export | Type | Used by |
|---|---|---|
| `METHODOLOGIES` | `Methodology[]` | `methodologies.tsx`, `sessions/index.tsx`, `templates/`, `profile.tsx` |
| `TOOLS_RAD35` / `TOOLS_RAD49` | `Tool[]` | `workspace.tsx`, `session-state.ts` |
| `getToolsByMethodology()` | helper | `session-state.ts`, `workspace.tsx` |
| `CLIENTS` | `Client[]` | `clients/index.tsx`, `clients/detail.tsx` |
| `getClientById()` | helper | `clients/detail.tsx`, `reports/generate.tsx`, `reports/detail.tsx`, `reports/pdf.tsx` |
| `TEMPLATES` | `Template[]` | `sessions/index.tsx`, `templates/index.tsx`, `templates/wizard.tsx`, `templates/builder.tsx` |
| `getTemplateById()` | helper | (internal) |
| `SESSIONS` | `Session[]` | `sessions/index.tsx`, `dashboard.tsx`, `clients/detail.tsx`, `reports/detail.tsx` |
| `getSessionById()` | helper | `sessions/workspace.tsx`, `reports/generate.tsx` |
| `getDashboardData()` | helper | `dashboard.tsx` |
| `REPORTS` | `Report[]` | `reports/index.tsx`, `reports/detail.tsx` |
| `getReportById()` | helper | (internal) |
| `SESSION_SNAPSHOTS` | `SessionSnapshot[]` | `reports/generate.tsx` |
| `getSnapshotBySessionId()` | helper | `reports/generate.tsx` |
| `buildReportSections()` | helper | `reports/generate.tsx`, `getReportV2ById()` |
| `getReportV2ById()` | helper | `reports/detail.tsx`, `reports/preview.tsx`, `reports/pdf.tsx` |
| `HAWKINS_LEVELS` | constant | `dashboard.tsx`, `workspace.tsx` — **never replaced** |

**`HAWKINS_LEVELS` is a mathematical constant, not DB data. It stays in mock-data.ts permanently.**

---

## Do-Not-Touch List

These tables and their related mock exports are **out of scope** for this integration. Do not add Supabase calls, do not create service functions, do not modify mock data that feeds them.

| Table | Reason |
|---|---|
| `client_portal_links` | Existing HUB/client portal table — do not touch. Out of scope. |
| `radionics_report_share_links` | New RADIONICS report-sharing table (token links). Portal auth not designed yet — deferred. |
| `radionics_therapy_types` | No frontend type. Dropped from MVP. |
| `radionics_tool_therapy_map` | Depends on dropped table. |
| `radionics_session_step_results` | Deferred. Data lives in `stages` JSONB. |
| `radionics_session_activations` | Deferred. Audio not wired. |
| `radionics_template_versions` | No version UI. Deferred. |
| `therapist_clients` | Deferred. Solo practice MVP. |

---

## New Files to Create

All new Supabase-facing code goes into new files. **Do not modify `mock-data.ts` until a phase is complete and its mock is fully replaced.**

```
packages/web/src/web/lib/
├── db/
│   ├── client.ts           — Supabase client singleton
│   ├── transforms.ts       — camelCase ↔ snake_case transform functions (ALL transforms live here)
│   ├── methodologies.ts    — query: methodologies + tools
│   ├── clients.ts          — query + mutation: clients
│   ├── templates.ts        — query + mutation: templates + blocks + fields
│   ├── sessions.ts         — query + mutation: session CRUD + autosave
│   ├── snapshots.ts        — mutation: seal session snapshot
│   └── reports.ts          — query + mutation: reports + sections
```

The `mock-data.ts` file is **not deleted** — it is hollowed out phase by phase as each service file goes live, leaving only `HAWKINS_LEVELS` and any genuinely static constants.

---

## Transform Functions Required

All transforms live in `packages/web/src/web/lib/db/transforms.ts`. This file is the only place camelCase ↔ snake_case conversion happens. No page or hook converts directly.

---

### `dbClientToClient(row) → Client`

**Input:** Row from `clients` table
**Output:** `Client` frontend type

```
DB column            → Frontend field
-----------------------------------------
id                   → id
name                 → name
email                → email (optional)
whatsapp             → whatsapp (optional)
telegram             → telegram (optional)
phone                → phone (optional)
birth_date           → birthDate (optional, keep as ISO string)
client_type          → clientType
notes                → notes (optional)
created_at           → createdAt
avatar_url           → avatarUrl (optional)

NOT from this table  → lastSessionDate   (derived: separate aggregate query or joined view)
NOT from this table  → sessionCount      (derived: COUNT from radionics_session_details)
```

`lastSessionDate` and `sessionCount` require a separate query or a Postgres view. Do not store them as columns. Options:
- Option A: Two queries — one for client row, one for aggregate — merge in the transform
- Option B: Create a `clients_with_stats` Postgres view that includes aggregates; query the view
- **Recommendation for MVP:** Option A. Views add migration surface. Two queries at client detail load is acceptable.

---

### `dbMethodologyToMethodology(row, certRow?) → Methodology`

**Input:** Row from `radionics_tables` + optional row from `therapist_methodology_certifications`
**Output:** `Methodology` frontend type

```
DB column                                    → Frontend field
--------------------------------------------------------------
id                                           → id
code                                         → code
name                                         → name
short_name                                   → shortName
description                                  → description
image_url                                    → imageUrl
color                                        → color
requires_certification                       → requiresCertification
is_active                                    → isActive

NOT stored — computed:
COUNT(radionics_tools WHERE methodology_id)  → toolCount

FROM therapist_methodology_certifications:
status (nullable — default 'not_certified')  → certificationStatus
```

`toolCount` — join via COUNT in the query, not a stored column.
`certificationStatus` — left join to `therapist_methodology_certifications` on `(therapist_id = auth.uid(), methodology_id)`. If no row exists, default to `'not_certified'`.

---

### `dbToolToTool(row) → Tool`

**Input:** Row from `radionics_tools`
**Output:** `Tool` frontend type

```
DB column             → Frontend field
----------------------------------------
id                    → id
code                  → code
name                  → name
description           → description
what_it_does          → whatItDoes
example               → example
suggested_activation  → suggestedActivation
image_url             → imageUrl
methodology_id        → methodologyId
sort_order            → sortOrder
```

No derived fields. Straightforward rename-only transform.

---

### `dbTemplatesToTemplate(templateRow, blockRows, fieldRows) → Template`

**Input:** One row from `radionics_session_templates` + all rows from `radionics_template_blocks` for that template + all rows from `radionics_template_fields` for those blocks
**Output:** `Template` with nested `blocks: TemplateBlock[]` each with nested `fields: TemplateField[]`

**Assembly steps:**
1. Group `fieldRows` by `block_id` into a `Map<blockId, TemplateField[]>`
2. Map `blockRows` → `TemplateBlock[]`, attaching fields from the map, sorted by `order_index`
3. Map `templateRow` → `Template`, attaching sorted blocks

```
radionics_session_templates:
  id                   → id
  name                 → name
  description          → description (optional)
  methodology_id       → methodologyId
  is_base_template     → isBaseTemplate
  template_type        → templateType
  status               → status
  parent_template_id   → parentTemplateId (optional)
  created_at           → createdAt
  updated_at           → updatedAt

  NOT stored — JOIN:
  radionics_tables.name → methodologyName

radionics_template_blocks:
  id                   → id
  block_code           → blockCode
  title                → title
  description          → description (optional)
  order_index          → orderIndex
  stage_code           → stageCode (optional)
  is_required          → isRequired
  show_in_session      → showInSession
  show_in_report       → showInReport
  show_in_hub          → showInHub
  is_private           → isPrivate

radionics_template_fields:
  id                   → id
  field_code           → fieldCode
  label                → label
  field_type           → fieldType
  order_index          → orderIndex
  is_required          → isRequired
  placeholder          → placeholder (optional)
  help_text            → helpText (optional)
  options              → options (optional, text[])
  show_in_session      → showInSession (optional)
  show_in_report       → showInReport (optional)
  show_in_hub          → showInHub (optional)
```

**Query strategy:** Single query with joins is feasible but produces a wide, denormalized result set that requires assembly. Three separate queries (template → blocks → fields) are easier to reason about and safer for the initial implementation. Use the three-query approach for MVP.

---

### `dbSessionToSession(row) → Session`

**Input:** Joined row from `sessions` + `radionics_session_details` + `clients` + `radionics_tables` + `radionics_session_templates`
**Output:** `Session` frontend type

`sessions` is the core header table. `radionics_session_details` is the RADIONICS extension — it holds all radionics-specific state. Both must be joined to produce a `Session` object.

```
FROM sessions (s):
s.id                   → id
s.client_id            → clientId
s.owner_id             → therapistId
s.session_date         → scheduledAt (optional)
s.created_at           → createdAt

FROM radionics_session_details (rsd):
rsd.therapist_id       → therapistId  (confirm matches s.owner_id)
rsd.methodology_id     → methodologyId
rsd.template_id        → templateId
rsd.status             → status
rsd.session_mode       → sessionMode
rsd.intention          → intention (optional)
rsd.hawkins_initial    → hawkinsInitial (optional)
rsd.hawkins_final      → hawkinsFinal (optional)
rsd.reverberation_days → reverberationDays (optional)
rsd.current_stage_code → currentStageCode (optional)
rsd.current_step_code  → currentStepCode (optional)
rsd.stages             → stages (JSONB → SessionStage[], parse directly)
rsd.completed_at       → completedAt (optional)
rsd.updated_at         → updatedAt

NOT stored — JOIN:
clients.name                       → clientName
radionics_tables.name              → methodologyName
radionics_tables.code              → methodologyCode
radionics_session_templates.name   → templateName
```

`clientName`, `methodologyName`, `methodologyCode`, `templateName` — display strings obtained via JOIN. Do not fetch with separate queries.

`stages` JSONB — parse as `SessionStage[]` directly. Supabase client returns JSONB as parsed JS objects automatically.

---

### `dbSessionToSessionStateSnapshot(row) → SessionStateSnapshot`

**Input:** Row from `radionics_session_details`
**Output:** `SessionStateSnapshot` (the hook's output shape)

This is a lighter transform used when the workspace or report generator needs to hydrate `useSessionState` from a saved row (e.g. resuming a paused session).

```
DB column              → SessionStateSnapshot field
----------------------------------------------------
id                     → session_id
hawkins_initial        → hawkins_initial
hawkins_final          → hawkins_final
reverberation_days     → reverberation_days
tool_results           → tool_results (JSONB, already ToolResult[])
identified_tool_ids    → identified_tool_ids (text[])
activated_tool_ids     → activated_tool_ids (text[])
field_values           → field_values (JSONB, already Record<string, FieldValue>)
stage_completion       → stage_completion (JSONB, already Record<string, boolean>)
updated_at             → updated_at
```

All JSONB columns come back as parsed objects from the Supabase client. No manual JSON parsing needed. Transform is a rename-only operation.

---

### `dbReportToReportV2(reportRow, sectionRows, snapshotRow?) → ReportV2`

**Input:** Row from `radionics_reports` + rows from `radionics_report_sections` + optional row from `radionics_session_snapshots`
**Output:** `ReportV2` frontend type

```
radionics_reports:
  id                   → id
  session_id           → sessionId
  client_id            → clientId
  therapist_id         → therapistId
  snapshot_id          → (used to attach snapshot, not a ReportV2 field directly)
  status               → status
  session_date         → sessionDate
  intention            → intention (optional)
  summary              → summary (optional)
  hawkins_initial      → hawkinsInitial (optional)
  hawkins_final        → hawkinsFinal (optional)
  reverberation_days   → reverberationDays (optional)
  tools_identified     → toolsIdentified (text[])
  tools_activated      → toolsActivated (text[])
  final_interpretation → finalInterpretation (optional)
  therapist_notes      → therapistNotes (optional)
  next_steps           → nextSteps (optional)
  approved_at          → approvedAt (optional)
  shared_at            → sharedAt (optional)
  created_at           → createdAt

  NOT stored — JOIN:
  clients.name          → clientName
  radionics_tables.name → methodologyName
  radionics_tables.code → methodologyCode

radionics_report_sections (sorted by order_index):
  section_code         → code
  title                → title
  content              → content
  is_read_only         → isReadOnly
  source_trace         → sourceTrace
  visibility           → visibility
  ai_draft             → aiDraft (optional)
  updated_at           → (not on ReportSection type — discard or store separately)

  NOT persisted — reconstruct at render time:
  structuredData       → (rebuild from snapshotRow if present)
  isDirty              → always false on load

radionics_session_snapshots (optional, for structuredData rebuild):
  → passed to buildReportSections() to repopulate structuredData on read-only sections
```

`interpretations` and `recommendations` on the base `Report` type are deprecated. Map them from the `final_interpretation` field and the `recommendations` section content respectively if needed for backward compatibility. Do not add `interpretations[]` or `recommendations[]` columns to the DB.

---

## Query Shapes

These are the logical query shapes — not SQL, not Supabase JS. They define what data is fetched, from where, and how it's assembled.

---

### Query: Methodologies list

**Called by:** `methodologies.tsx`, `sessions/index.tsx`, `templates/wizard.tsx`, `profile.tsx`

```
1. SELECT * FROM radionics_tables WHERE is_active = true ORDER BY name

2. FOR EACH methodology:
   SELECT COUNT(*) FROM radionics_tools WHERE methodology_id = $id

3. SELECT * FROM therapist_methodology_certifications
   WHERE therapist_id = auth.uid()

4. Transform: dbMethodologyToMethodology(row, certRow)
   Attach toolCount from step 2
   Attach certificationStatus from step 3 (default 'not_certified' if no row)
```

Optimization note: Steps 1–3 can be a single query using LEFT JOINs + GROUP BY once the schema is stable. For initial implementation, three queries are fine.

---

### Query: Tools by methodology

**Called by:** `session-state.ts` (via `getToolsByMethodology`), `workspace.tsx`

```
1. SELECT * FROM radionics_tools
   WHERE methodology_id = $methodologyId
   ORDER BY sort_order ASC

2. Transform each row: dbToolToTool(row)
```

Result replaces `getToolsByMethodology()` / `TOOLS_RAD35` / `TOOLS_RAD49`.

---

### Query: Template with nested blocks and fields

**Called by:** `templates/index.tsx`, `templates/wizard.tsx`, `templates/builder.tsx`, `sessions/index.tsx`

```
1. SELECT * FROM radionics_session_templates
   LEFT JOIN radionics_tables ON methodology_id = radionics_tables.id
   WHERE (therapist_id = auth.uid() OR is_base_template = true)
   AND status = 'active'
   ORDER BY is_base_template DESC, name ASC

2. SELECT * FROM radionics_template_blocks
   WHERE template_id IN ($templateIds)
   ORDER BY order_index ASC

3. SELECT * FROM radionics_template_fields
   WHERE block_id IN ($blockIds)
   ORDER BY order_index ASC

4. Transform: dbTemplatesToTemplate(templateRow, blockRows, fieldRows)
   Assemble nested structure in memory
```

For single template detail (builder page):
```
1. SELECT single template row by id (+ methodology JOIN)
2. SELECT blocks WHERE template_id = $id
3. SELECT fields WHERE block_id IN ($blockIds)
4. Transform
```

---

### Query: Clients list

**Called by:** `clients/index.tsx`

```
1. SELECT clients.*, COUNT(sd.id) as session_count,
          MAX(sd.created_at) as last_session_date
   FROM clients
   LEFT JOIN radionics_session_details sd ON sd.client_id = clients.id
   WHERE clients.owner_id = auth.uid()
   GROUP BY clients.id
   ORDER BY clients.name ASC

2. Transform each row: dbClientToClient(row)
   Attach session_count and last_session_date from aggregates
```

---

### Query: Single client detail

**Called by:** `clients/detail.tsx`

```
1. SELECT * FROM clients WHERE id = $id AND owner_id = auth.uid()

2. SELECT id, status, methodology_code, created_at, scheduled_at
   FROM radionics_session_details
   WHERE client_id = $id
   ORDER BY created_at DESC
   LIMIT 20

3. SELECT id, status, created_at, shared_at
   FROM radionics_reports
   WHERE client_id = $id
   ORDER BY created_at DESC
   LIMIT 20

4. Transform client row: dbClientToClient(row)
   Derive lastSessionDate and sessionCount from query 2 results
   Attach session list and report list for the detail page
```

---

### Mutation: Session creation

**Called by:** `sessions/index.tsx` (new session flow)

Session creation is a two-step INSERT. `sessions` is the core header table shared across all HUB apps. `radionics_session_details` is the RADIONICS-specific extension row, linked via `session_id`.

```
INPUT:
  clientId: string
  methodologyId: string
  templateId: string
  sessionMode: SessionMode
  intention?: string
  scheduledAt?: string

STEP 1 — INSERT into public.sessions:
  owner_id     = auth.uid()
  client_id    = $clientId
  app_code     = 'RADIONICS'
  session_date = $scheduledAt ?? now()
  objective    = $intention
  mode         = $sessionMode

  → RETURN: sessions.id  (use as $sessionId in step 2)

STEP 2 — INSERT into public.radionics_session_details:
  session_id       = $sessionId
  therapist_id     = auth.uid()
  methodology_id   = $methodologyId
  template_id      = $templateId
  status           = 'draft'
  session_mode     = $sessionMode
  intention        = $intention
  stages           = $initialStagesJson  (built from template structure client-side)
  tool_results     = '[]'
  field_values     = '{}'
  stage_completion = '{"preparation":false,"connection":false,"diagnosis":false,"activations":false,"closing":false}'
  created_at       = now()
  updated_at       = now()

RETURN: $sessionId → dbSessionToSession(joined row)

NAVIGATE: /sessions/$sessionId/workspace
```

`$initialStagesJson` is the `SessionStage[]` array built from the template's `stageCode` assignments, with all statuses set to `'not_started'`. Computed client-side before both INSERTs.

Both INSERTs must succeed. If step 2 fails, step 1 must be rolled back — wrap in a Supabase RPC (Postgres function) or handle deletion of the orphaned `sessions` row on error.

---

### Mutation: Session autosave

**Called by:** `workspace.tsx` (on every meaningful state change, debounced 1.5s)

```
INPUT: SessionStateSnapshot (from useSessionState.sessionSnapshot)

WRITE:
  UPSERT INTO radionics_session_details ON CONFLICT (id) DO UPDATE:
    hawkins_initial   = $hawkins_initial
    hawkins_final     = $hawkins_final
    reverberation_days = $reverberation_days
    tool_results      = $tool_results          (JSONB)
    field_values      = $field_values          (JSONB)
    stage_completion  = $stage_completion      (JSONB)
    current_stage_code = $current_stage_code
    current_step_code  = $current_step_code
    status            = derived from stage_completion (see logic below)
    updated_at        = now()

  NOTE: identified_tool_ids and activated_tool_ids are maintained by
  a Postgres trigger on tool_results update. Do NOT write them from frontend.

STATUS DERIVATION:
  if stageCompletion.closing === true → 'completed'
  else if any stage !== 'not_started' → 'in_progress'
  else → 'draft'
  (if status was already 'reported' → do not downgrade)

RETURN: updated_at timestamp (confirm save)
```

The autosave writes only the state columns — not the header columns (`client_id`, `template_id`, etc.) which are set at creation and never change.

---

### Mutation: Seal session snapshot

**Called by:** `reports/generate.tsx` when therapist initiates report generation

```
INPUT:
  session: Session
  client: Client
  sessionState: SessionStateSnapshot

COMPUTE (client-side via buildSessionSnapshot() from snapshot-builder.ts):
  SessionSnapshot object

WRITE:
  INSERT INTO radionics_session_snapshots:
    session_id           = $session.id
    client_id            = $client.id
    client_name          = $client.name
    client_email         = $client.email
    client_whatsapp      = $client.whatsapp
    client_telegram      = $client.telegram
    client_type          = $client.clientType
    methodology_name     = $session.methodologyName
    methodology_code     = $session.methodologyCode
    session_date         = date($session.createdAt)
    intention            = $session.intention
    hawkins_initial      = $sessionState.hawkins_initial
    hawkins_final        = $sessionState.hawkins_final
    reverberation_days   = $sessionState.reverberation_days
    tool_results         = $sessionState.tool_results
    identified_tool_names = names derived from tool_results
    activated_tool_names  = names derived from tool_results
    therapist_notes      = $sessionState.field_values['private_notes']?.value
    voice_notes          = []  (empty until audio is wired)
    created_at           = now()

  ON CONFLICT (session_id) DO NOTHING
  (snapshot is sealed — if it already exists, do not overwrite)

RETURN: snapshot row → used immediately to call buildReportSections()
```

---

### Mutation: Report generation

**Called by:** `reports/generate.tsx` after snapshot is sealed

```
INPUT: SessionSnapshot (just sealed or retrieved by session_id)

STEP 1 — Build sections client-side:
  sections = buildReportSections(snapshot)
  (This function already exists in mock-data.ts — it moves to db/reports.ts)

STEP 2 — INSERT report header:
  INSERT INTO radionics_reports:
    id                = gen_random_uuid()
    session_id        = $snapshot.session_id
    client_id         = $snapshot.client_id
    therapist_id      = auth.uid()
    snapshot_id       = $snapshot.id
    status            = 'draft'
    session_date      = $snapshot.session_date
    intention         = $snapshot.intention
    hawkins_initial   = $snapshot.hawkins_initial
    hawkins_final     = $snapshot.hawkins_final
    reverberation_days = $snapshot.reverberation_days
    tools_identified  = $snapshot.identified_tool_names
    tools_activated   = $snapshot.activated_tool_names
    created_at        = now()
    updated_at        = now()

STEP 3 — INSERT sections:
  INSERT INTO radionics_report_sections (one row per section):
    report_id     = $reportId (from step 2)
    section_code  = $section.code
    title         = $section.title
    content       = $section.content
    is_read_only  = $section.isReadOnly
    source_trace  = $section.sourceTrace
    visibility    = $section.visibility
    ai_draft      = $section.aiDraft
    order_index   = index in sections array

STEP 4 — Update session status:
  UPDATE radionics_session_details
  SET status = 'reported', updated_at = now()
  WHERE id = $snapshot.session_id

RETURN: report id → navigate to /reports/$id
```

---

### Query: Report detail + sections

**Called by:** `reports/detail.tsx`, `reports/preview.tsx`, `reports/pdf.tsx`

```
1. SELECT reports.*, clients.name as client_name,
          rt.name as methodology_name, rt.code as methodology_code
   FROM radionics_reports reports
   LEFT JOIN clients ON client_id = clients.id
   LEFT JOIN radionics_tables rt ON (
     SELECT methodology_id FROM radionics_session_details
     WHERE id = reports.session_id
   )
   WHERE reports.id = $reportId
   AND reports.therapist_id = auth.uid()

2. SELECT * FROM radionics_report_sections
   WHERE report_id = $reportId
   ORDER BY order_index ASC

3. SELECT * FROM radionics_session_snapshots
   WHERE session_id = (SELECT session_id FROM radionics_reports WHERE id = $reportId)

4. Transform:
   dbReportToReportV2(reportRow, sectionRows, snapshotRow)
   Rebuild structuredData on read-only sections from snapshotRow
```

---

### Mutation: Save report section

**Called by:** `report-state.ts` autosave (debounced 1.5s on content change)

```
INPUT:
  reportId: string
  sectionCode: ReportSectionCode
  content: string
  visibility: SectionVisibility
  sourceTrace: SourceTrace

WRITE:
  UPDATE radionics_report_sections
  SET content = $content,
      visibility = $visibility,
      source_trace = $sourceTrace,
      updated_at = now()
  WHERE report_id = $reportId
  AND section_code = $sectionCode

RETURN: updated_at (confirm save)
```

---

## Files to Modify (when integration phases execute)

**When a phase begins, these files change. Not before.**

| File | Phase | Change |
|---|---|---|
| `lib/mock-data.ts` | Each phase | Remove the mock export that is replaced; keep HAWKINS_LEVELS and helpers not yet replaced |
| `pages/methodologies.tsx` | Phase 1 | Replace `METHODOLOGIES` import with `useMethodologies()` hook |
| `pages/profile.tsx` | Phase 1 | Replace `METHODOLOGIES` import with hook |
| `pages/sessions/index.tsx` | Phase 1 + 2 | Replace `METHODOLOGIES`, `CLIENTS`, `TEMPLATES` with hooks |
| `pages/clients/index.tsx` | Phase 1 | Replace `CLIENTS` with `useClients()` hook |
| `pages/clients/detail.tsx` | Phase 1 | Replace `getClientById`, `SESSIONS`, `REPORTS` with queries |
| `pages/dashboard.tsx` | Phase 3 | Replace `getDashboardData()` with `useDashboard()` hook |
| `pages/templates/index.tsx` | Phase 2 | Replace `TEMPLATES`, `METHODOLOGIES` with hooks |
| `pages/templates/wizard.tsx` | Phase 2 | Replace `METHODOLOGIES`, `TEMPLATES` with hooks |
| `pages/templates/builder.tsx` | Phase 2 | Replace `METHODOLOGIES` with hook; add save mutations |
| `pages/sessions/workspace.tsx` | Phase 3 | Replace `getSessionById`, `getToolsByMethodology`, `TOOLS_RAD35` with DB queries; wire autosave |
| `pages/reports/index.tsx` | Phase 4 | Replace `REPORTS` with `useReports()` hook |
| `pages/reports/generate.tsx` | Phase 4 | Replace `getSessionById`, `getClientById`, `getSnapshotBySessionId` with DB calls; wire snapshot seal + report INSERT |
| `pages/reports/detail.tsx` | Phase 4 | Replace `getReportV2ById`, `getClientById`, `SESSIONS` with DB query |
| `pages/reports/preview.tsx` | Phase 4 | Replace `getReportV2ById` with DB query |
| `pages/reports/pdf.tsx` | Phase 4 | Replace `getReportV2ById`, `getClientById` with DB query |
| `lib/session-state.ts` | Phase 3 | Wire autosave: call `upsertSessionDetails()` inside a debounced effect |
| `lib/report-state.ts` | Phase 4 | Wire section save: call `upsertReportSection()` inside the existing autosave timer |

---

## Implementation Phases

Each phase is independently deployable. The app must build and run after each phase with no regressions.

---

### Phase 0 — Foundation (prerequisite for all phases)

**Goal:** Supabase client configured. Transform file exists. Build passes.

**Tasks:**
1. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env.local`
2. Create `lib/db/client.ts` — exports `supabase` singleton using `@supabase/supabase-js`
3. Create `lib/db/transforms.ts` — stub file with all transform function signatures (empty bodies returning `null!` as placeholder)
4. Confirm `bun run --cwd packages/web build` passes with 0 errors

**Mock data touched:** None
**Pages changed:** None

---

### Phase 1 — Reference Data + Clients

**Goal:** Methodologies, tools, and clients read from Supabase. Static reference data is no longer hardcoded.

**New files:**
- `lib/db/methodologies.ts` — `getMethodologies()`, `getToolsByMethodology(methodologyId)`
- `lib/db/clients.ts` — `getClients()`, `getClientById(id)`, `createClient(data)`, `updateClient(id, data)`

**Transform functions to implement:**
- `dbMethodologyToMethodology()`
- `dbToolToTool()`
- `dbClientToClient()`

**Pages updated:**
- `methodologies.tsx` — replace `METHODOLOGIES`
- `profile.tsx` — replace `METHODOLOGIES`
- `clients/index.tsx` — replace `CLIENTS`
- `clients/detail.tsx` — replace `getClientById`, session/report counts

**Mock exports retired:**
- `METHODOLOGIES`
- `TOOLS_RAD35`, `TOOLS_RAD49`, `getToolsByMethodology()`
- `CLIENTS`, `getClientById()`

**Mock exports kept:**
- Everything else (sessions, templates, reports, snapshots)

**Seed required before this phase ships:** `radionics_tables`, `radionics_tools`, `clients`, `therapist_methodology_certifications`

---

### Phase 2 — Templates

**Goal:** Template list, wizard, and builder read from and write to Supabase.

**New files:**
- `lib/db/templates.ts` — `getTemplates()`, `getTemplateById(id)`, `createTemplate(data)`, `updateTemplate(id, data)`, `deleteTemplate(id)`

**Transform functions to implement:**
- `dbTemplatesToTemplate()`

**Pages updated:**
- `templates/index.tsx` — replace `TEMPLATES`, `METHODOLOGIES`
- `templates/wizard.tsx` — replace `METHODOLOGIES`, `TEMPLATES`
- `templates/builder.tsx` — replace `METHODOLOGIES`; wire save/autosave
- `sessions/index.tsx` — replace `TEMPLATES` (for session creation template picker)

**Mock exports retired:**
- `TEMPLATES`, `getTemplateById()`

**Seed required:** `radionics_session_templates`, `radionics_template_blocks`, `radionics_template_fields` (seed official templates from current mock data)

---

### Phase 3 — Sessions + Autosave

**Goal:** Session list, workspace, and autosave are live. Sessions are created in DB, state is persisted on change.

**New files:**
- `lib/db/sessions.ts` — `getSessions()`, `getSessionById(id)`, `createSession(data)`, `upsertSessionDetails(snapshot)`, `updateSessionStatus(id, status)`

**Transform functions to implement:**
- `dbSessionToSession()`
- `dbSessionToSessionStateSnapshot()`

**Pages updated:**
- `sessions/index.tsx` — replace `SESSIONS`; wire `createSession()`
- `sessions/workspace.tsx` — replace `getSessionById()`, `getToolsByMethodology()`, `TOOLS_RAD35`; wire autosave via `upsertSessionDetails()`
- `dashboard.tsx` — replace `getDashboardData()`

**Hook updated:**
- `lib/session-state.ts` — add autosave effect: debounce 1500ms, call `upsertSessionDetails(sessionSnapshot)` on snapshot change

**Mock exports retired:**
- `SESSIONS`, `getSessionById()`
- `getDashboardData()`

**Seed required:** None (session rows are created by the app)

---

### Phase 4 — Reports

**Goal:** Report generation, editing, and viewing are live. Reports and sections are read from and written to Supabase.

**New files:**
- `lib/db/snapshots.ts` — `sealSessionSnapshot(session, client, sessionState)`, `getSnapshotBySessionId(sessionId)`
- `lib/db/reports.ts` — `getReports()`, `getReportById(id)`, `getReportV2ById(id)`, `createReport(snapshot)`, `upsertReportSection(reportId, sectionCode, data)`, `updateReportStatus(id, status)`

**Transform functions to implement:**
- `dbReportToReportV2()`

**Pages updated:**
- `reports/index.tsx` — replace `REPORTS`
- `reports/generate.tsx` — replace `getSessionById`, `getClientById`, `getSnapshotBySessionId`; wire snapshot seal + report CREATE
- `reports/detail.tsx` — replace `getReportV2ById`, `getClientById`, `SESSIONS`
- `reports/preview.tsx` — replace `getReportV2ById`
- `reports/pdf.tsx` — replace `getReportV2ById`, `getClientById`

**Hook updated:**
- `lib/report-state.ts` — wire `saveDraft()` to call `upsertReportSection()` for each dirty section; wire `setStatus()` to call `updateReportStatus()`

**Mock exports retired:**
- `REPORTS`, `getReportById()`, `getReportV2ById()`
- `SESSION_SNAPSHOTS`, `getSnapshotBySessionId()`
- `buildReportSections()` — moves to `lib/db/reports.ts` as a pure function, same logic

**After this phase:** `mock-data.ts` contains only `HAWKINS_LEVELS` and its one helper `getHawkinsLevel()`. The file can be renamed to `constants.ts` at cleanup time.

---

## Build and Test Checklist

Run this checklist at the end of every phase. All items must pass before merging.

### After Phase 0
- [ ] `bun run --cwd packages/web build` — 0 TS errors, 0 warnings
- [ ] `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` present in `.env.local`
- [ ] Supabase client imports without error
- [ ] `lib/db/transforms.ts` exists with all function signatures stubbed
- [ ] App loads in browser — no console errors

### After Phase 1
- [ ] Build passes
- [ ] Methodologies page loads real data from DB
- [ ] Tools list on methodology page matches seed data
- [ ] Clients list loads, shows correct session count and last session date
- [ ] Client detail page loads without error
- [ ] `METHODOLOGIES`, `CLIENTS`, `getClientById` removed from mock-data.ts
- [ ] `TOOLS_RAD35`, `TOOLS_RAD49`, `getToolsByMethodology` removed from mock-data.ts
- [ ] No page imports the removed exports (grep check)

### After Phase 2
- [ ] Build passes
- [ ] Templates list shows official and custom templates
- [ ] Template wizard shows correct methodology options
- [ ] Template builder loads blocks and fields for selected template
- [ ] Template save writes to DB; reload shows persisted state
- [ ] `TEMPLATES`, `getTemplateById` removed from mock-data.ts
- [ ] No page imports the removed exports

### After Phase 3
- [ ] Build passes
- [ ] Session list shows real sessions (empty state for new install)
- [ ] New session creation inserts a row; redirects to workspace
- [ ] Workspace loads session from DB
- [ ] Autosave fires within 2s of a state change (tool result, hawkins, field value)
- [ ] Autosave confirm (save indicator shows 'saved' state)
- [ ] Refresh workspace page — state is restored from DB
- [ ] Session with `status = 'paused'` resumes at saved stage/step
- [ ] Dashboard shows sessions in progress from DB
- [ ] `SESSIONS`, `getSessionById`, `getDashboardData` removed from mock-data.ts
- [ ] No page imports the removed exports

### After Phase 4
- [ ] Build passes
- [ ] Report generation: snapshot is sealed before report INSERT (check DB row)
- [ ] Report generation: `radionics_report_sections` has 10 rows per generated report
- [ ] Report detail loads from DB — all sections render correctly
- [ ] Report section edit persists within 2s (autosave)
- [ ] Section visibility change persists
- [ ] Report status flow: draft → in_review → approved → shared
- [ ] Report preview renders sections from DB (no mock)
- [ ] PDF page renders from DB data
- [ ] `REPORTS`, `getReportById`, `getReportV2ById` removed from mock-data.ts
- [ ] `SESSION_SNAPSHOTS`, `getSnapshotBySessionId` removed from mock-data.ts
- [ ] `buildReportSections` removed from mock-data.ts (now in `lib/db/reports.ts`)
- [ ] `mock-data.ts` contains only `HAWKINS_LEVELS` + `getHawkinsLevel()`
- [ ] No page imports any removed export (grep check)
- [ ] Full app flow: create client → create session → complete session → generate report → view report

### Regression checks (run after every phase)
- [ ] Hawkins level display still works everywhere (uses constant, not DB)
- [ ] No TypeScript `any` introduced in new DB files
- [ ] No `console.log` left in new DB files
- [ ] All Supabase queries have a `.throwOnError()` or explicit error handling
- [ ] RLS policies block access when `auth.uid()` does not match — test with a second auth user if possible

---

## Key Constraints (do not violate)

1. **Never call `mock-data.ts` from a new `lib/db/` file.** The DB files are the replacement, not a wrapper.
2. **`HAWKINS_LEVELS` stays in mock-data.ts forever** (or until it is renamed to `constants.ts`). It is a mathematical constant.
3. **`identified_tool_ids` and `activated_tool_ids` are never written by frontend.** These are derived by a Postgres trigger. Frontend writes `tool_results` JSONB only.
4. **`structuredData` on `ReportSection` is never persisted.** It is always rebuilt from the snapshot at render time.
5. **`isDirty` on `ReportSection` is never persisted.** Frontend-only.
6. **Session snapshots are INSERT-only.** No UPDATE after creation.
7. **Token generation for portal links is server-side only.** Out of scope for these phases.
8. **Do not import `@supabase/supabase-js` directly in page components.** All DB access goes through `lib/db/` service files.
