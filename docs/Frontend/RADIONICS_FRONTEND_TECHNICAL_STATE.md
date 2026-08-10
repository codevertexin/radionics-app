# RADIONICS Frontend — Technical State Summary

> Generated: 2026-05-31
> Status: Phase 5 complete — all mock data, no Supabase integration
> Stack: Bun · Vite · React · Hono · Wouter · TailwindCSS

---

## 1. Routes & Page Files

All routes registered in `packages/web/src/web/app.tsx` via `wouter` `<Switch>`.

| Route | Page File | Notes |
|---|---|---|
| `/` | `pages/index.tsx` | Landing / onboarding |
| `/dashboard` | `pages/dashboard.tsx` | Stats overview |
| `/sessions` | `pages/sessions/index.tsx` | Session list |
| `/sessions/:id` | `pages/sessions/workspace.tsx` | Full session workspace (no AppLayout) |
| `/sessions/:id/report` | `pages/reports/generate.tsx` | Snapshot → draft report flow |
| `/clients` | `pages/clients/index.tsx` | Client list |
| `/clients/:id` | `pages/clients/detail.tsx` | Client profile + session history |
| `/templates` | `pages/templates/index.tsx` | Template list |
| `/templates/new` | `pages/templates/wizard.tsx` | New template wizard (no AppLayout) |
| `/templates/:id/edit` | `pages/templates/builder.tsx` | Template block builder |
| `/reports` | `pages/reports/index.tsx` | Report list |
| `/reports/:id/pdf` | `pages/reports/pdf.tsx` | A4 PDF preview (print-ready) |
| `/reports/:id/preview` | `pages/reports/preview.tsx` | Client-facing preview |
| `/reports/:id` | `pages/reports/detail.tsx` | Therapist report editor |
| `/methodologies` | `pages/methodologies.tsx` | Methodology catalogue |
| `/profile` | `pages/profile.tsx` | Therapist profile |

> **Route order matters**: `/reports/:id/pdf` and `/reports/:id/preview` MUST be declared before `/reports/:id` in the Switch — wouter matches top-down and `:id` would capture `"pdf"` otherwise.

---

## 2. Main Types & Interfaces

All defined in `packages/web/src/web/types/index.ts`.

---

### `SessionStateSnapshot`

Supabase-ready shape for `radionics_session_details`. Produced by `useSessionState`.

```ts
interface SessionStateSnapshot {
  session_id: string;
  hawkins_initial: number | null;
  hawkins_final: number | null;
  reverberation_days: number | null;
  tool_results: ToolResult[];
  identified_tool_ids: string[];      // toolId[] where status === 'identified' | 'activated'
  activated_tool_ids: string[];       // toolId[] where status === 'activated'
  stage_completion: Record<string, boolean>;
  updated_at: string;                 // ISO8601
}
```

---

### `ToolResult`

Per-tool diagnosis outcome, nested inside `SessionStateSnapshot.tool_results`.

```ts
interface ToolResult {
  toolId: string;
  toolName: string;
  toolImageUrl: string;
  status: 'not_analyzed' | 'in_analysis' | 'identified' | 'activated' | 'skipped';
  found?: boolean;        // @deprecated — derive from status
  intensity?: 'low' | 'medium' | 'high';
  notes?: string;
  transcript?: string;
  voiceNotes?: VoiceNote[];
  activatedAt?: string;
}
```

---

### `VoiceNote`

Attached to a `ToolResult`. Recording is mock-only — no real audio API wired.

```ts
interface VoiceNote {
  id: string;
  transcript: string;
  durationSeconds: number;
  createdAt: string;    // ISO8601
}
```

---

### `ReportV2`

Extends the legacy `Report` type. The main report entity used in all Phase 5 UI.

```ts
interface ReportV2 extends Report {
  sections: ReportSection[];
  snapshot?: SessionSnapshot;         // immutable session facts
  portalLink?: ClientPortalLink;      // set when status === 'shared'
  finalInterpretation?: string;       // legacy field, prefer sections
  therapistNotes?: string;            // legacy field, prefer sections
}
```

`Report` base fields (also in `ReportV2`):
```ts
{
  id, sessionId, clientId, clientName,
  methodologyName, methodologyCode, therapistId,
  status: 'draft' | 'in_review' | 'approved' | 'shared',
  sessionDate,        // 'YYYY-MM-DD'
  intention,
  summary,
  hawkinsInitial, hawkinsFinal,
  toolsIdentified, toolsActivated,     // string[] of names (legacy)
  interpretations, recommendations,    // string[] (legacy)
  reverberationDays,
  nextSteps,
  createdAt, approvedAt, sharedAt,
}
```

---

### `ReportSection`

One editable unit of a report. Ten sections per report (see `SECTION_ORDER`).

```ts
interface ReportSection {
  code: ReportSectionCode;
  title: string;
  content: string;
  isReadOnly: boolean;          // true = session fact, not therapist-editable
  sourceTrace: SourceTrace;
  visibility: SectionVisibility;
  aiDraft?: string;             // AI-generated suggestion text
  isDirty?: boolean;            // has unsaved edits
}

type ReportSectionCode =
  | 'client' | 'session_objective' | 'hawkins_evolution'
  | 'identified_tools' | 'activated_tools' | 'therapist_notes'
  | 'final_interpretation' | 'recommendations'
  | 'reverberation' | 'next_steps';

type SourceTrace =
  | 'session_field'     // pulled from session data
  | 'tool_note'         // from a tool's notes field
  | 'voice_transcript'  // from voice recording transcript
  | 'therapist_edit'    // manually written by therapist
  | 'ai_draft';         // AI generated, awaiting review

type SectionVisibility = 'included' | 'hidden_from_client' | 'private';
```

Read-only sections (data from session, not therapist-editable here):
- `client`, `hawkins_evolution`, `identified_tools`, `activated_tools`

Required sections (checked before submit-for-review):
- `session_objective`, `hawkins_evolution`, `final_interpretation`, `recommendations`

---

### `Template`

Maps to `radionics_session_templates` + nested blocks + fields.

```ts
interface Template {
  id: string;
  name: string;
  description?: string;
  methodologyId: string;
  methodologyName: string;
  isBaseTemplate: boolean;
  templateType: 'official' | 'custom';
  status: 'active' | 'archived';
  blocks: TemplateBlock[];
  createdAt: string;
  updatedAt: string;
  version?: number;
  parentTemplateId?: string;    // when duplicated from another
}
```

---

### `TemplateBlock`

Maps to `radionics_template_blocks`.

```ts
interface TemplateBlock {
  id: string;
  blockCode: string;
  title: string;
  description?: string;
  orderIndex: number;
  stageCode?: string;       // 'preparation' | 'diagnosis' | 'activations' | 'closing'
  isRequired: boolean;
  showInSession: boolean;
  showInReport: boolean;
  showInHub: boolean;
  isPrivate: boolean;
  fields: TemplateField[];
}
```

---

### `TemplateField`

Maps to `radionics_template_fields`.

```ts
interface TemplateField {
  id: string;
  fieldCode: string;
  label: string;
  fieldType: FieldType;
  orderIndex: number;
  isRequired: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  showInSession?: boolean;
  showInReport?: boolean;
  showInHub?: boolean;
}

type FieldType =
  | 'short_text' | 'long_text' | 'number' | 'date'
  | 'single_select' | 'multi_select' | 'checkbox'
  | 'image' | 'audio'
  | 'tool_selector'     // special — renders tool grid
  | 'hawkins_selector'; // special — renders Hawkins scale picker
```

---

## 3. Hooks

### `useSessionState` — `lib/session-state.ts`

Central state for an active session. Owns all mutable data. Computes stage completion. Produces Supabase-ready snapshot.

**Input:**
```ts
{
  id: string;
  methodologyId: string;
  hawkinsInitial?: number;
  hawkinsFinal?: number;
  reverberationDays?: number;
}
```

**Returns `SessionState`:**
```ts
{
  // State
  toolResults: ToolResult[];
  hawkinsInitial: number | null;
  hawkinsFinal: number | null;
  reverbDays: number | null;

  // Mutations
  setToolResult(toolId, patch): void;
  setHawkinsInitial(v): void;
  setHawkinsFinal(v): void;
  setReverbDays(v): void;
  addVoiceNote(toolId, note): void;

  // Computed
  stageCompletion: StageCompletion;    // {preparation, connection, diagnosis, activations, closing}: boolean
  sessionSnapshot: SessionStateSnapshot;
}
```

**Stage completion logic:**
| Stage | Rule |
|---|---|
| `preparation` | `hawkinsInitial !== null` |
| `connection` | Always `true` (no required inputs) |
| `diagnosis` | Every tool in methodology has a status that's not `not_analyzed` or `in_analysis` |
| `activations` | Every tool that was `identified` or `activated` is now `activated` or `skipped` |
| `closing` | `hawkinsFinal !== null && reverbDays !== null` |

**Mock caveat:** Voice note recording uses a fake timer — no real `MediaRecorder` API connected.

---

### `useReportState` — `lib/report-state.ts`

Manages all mutable state for `ReportV2`. Simulates auto-save with a 1500ms debounce. All Supabase write operations are stubs (setTimeout mocks).

**Input:** `initialReport: ReportV2`

**Returns `UseReportStateReturn`:**
```ts
{
  report: ReportV2;
  saveState: 'saved' | 'unsaved' | 'saving';
  activeSection: ReportSectionCode | null;
  setActiveSection(code): void;

  // Section mutations
  updateSectionContent(code, content): void;
  updateSectionVisibility(code, visibility): void;
  applyAiDraft(code): void;           // copies aiDraft into content, sets sourceTrace = 'ai_draft'

  // Status flow
  setStatus(status): void;
  saveDraft(): void;
  submitForReview(): void;            // sets status = 'in_review'
  approve(): void;                    // sets status = 'approved', stamps approvedAt
  reopenForEditing(): void;           // sets status = 'draft'

  // Share
  shareViaHub(): void;
  shareViaEmail(): void;
  generatePortalLink(): string;       // sets status = 'shared', stamps sharedAt, creates portalLink

  // AI
  isGeneratingAI: boolean;
  generateAIDraft(): void;            // fills all sections that have aiDraft and no content
}
```

**Auto-save behavior:**
- Any content/visibility change → `saveState = 'unsaved'`
- After 1500ms → `saveState = 'saving'`
- After 800ms more → `saveState = 'saved'`

---

### Template State Hooks — `lib/template-state.ts`

#### `useTemplateState(initialTemplateId?: string)`

Full CRUD for template building. Used in `pages/templates/builder.tsx` and `pages/templates/wizard.tsx`.

**Returns:**
```ts
{
  template: Template;
  saveState: SaveState;              // 'saved' | 'unsaved' | 'saving'

  // Template-level
  updateTemplate(updates): void;

  // Block ops
  addBlock(stageCode?, libBlockId?): string;   // returns new block id
  updateBlock(blockId, updates): void;
  deleteBlock(blockId): void;
  duplicateBlock(blockId): void;
  moveBlock(blockId, 'up' | 'down'): void;

  // Field ops
  addField(blockId): string;                   // returns new field id
  updateField(blockId, fieldId, updates): void;
  deleteField(blockId, fieldId): void;

  // Computed
  blocksByStage(stageCode): TemplateBlock[];
  totalBlocks: number;
  totalFields: number;
  isReadOnly: boolean;               // true when template.isBaseTemplate

  // Supabase-ready snapshot (snake_case, see §6)
  snapshot: { id, name, ..., blocks: [...] };
}
```

#### `BLOCK_LIBRARY` (exported constant)

Pre-defined block templates grouped by category:
- `common` — client ID, intention, consent, health notes, emotional history
- `therapeutic` — Hawkins initial/final, tool selection, activations, chakras, symbols
- `report` — interpretation, recommendations, reverberation, next steps
- `private` — therapist-only notes

#### `BLOCK_LIBRARY_CATEGORIES` (exported constant)

```ts
[
  { id: 'common',      label: 'Comuns',       color: 'text-sky-400' },
  { id: 'therapeutic', label: 'Terapêuticos', color: 'text-violet-400' },
  { id: 'report',      label: 'Relatório',    color: 'text-amber-400' },
  { id: 'private',     label: 'Privados',     color: 'text-rose-400' },
]
```

---

## 4. Mock Data Sources

All in `packages/web/src/web/lib/mock-data.ts`.

| Export | Type | Count | Notes |
|---|---|---|---|
| `HAWKINS_LEVELS` | `HawkinsLevel[]` | 17 levels | 20–700 scale (Hawkins) |
| `METHODOLOGIES` | `Methodology[]` | 3 | MAP, RAD_35, RAD_49 |
| `TOOLS_RAD35` | `Tool[]` | 8 | Mesa dos 35 (subset) |
| `TOOLS_RAD49` | `Tool[]` | 5 | Mesa dos 49 (subset) |
| `CLIENTS` | `Client[]` | 6 | Mix of all 3 client types |
| `TEMPLATES` | `Template[]` | 3 | 2 official + 1 custom |
| `SESSIONS` | `Session[]` | 5 | All statuses covered |
| `REPORTS` | `Report[]` | 4 | All statuses covered |
| `SESSION_SNAPSHOTS` | `SessionSnapshot[]` | 4 | One per session with data |

**Helper functions:**
```ts
getSessionById(id): Session | undefined
getClientById(id): Client | undefined
getMethodologyById(id): Methodology | undefined
getTemplateById(id): Template | undefined
getReportById(id): Report | undefined
getHawkinsLevel(value): HawkinsLevel | undefined
getToolsByMethodology(methodologyId): Tool[]
getSnapshotBySessionId(sessionId): SessionSnapshot | undefined
buildReportSections(snapshot): ReportSection[]   // builds 10 sections from snapshot
getReportV2ById(id): ReportV2 | undefined        // composites Report + snapshot + sections
```

**`getReportV2ById` composition logic:**
1. Find base `Report` in `REPORTS`
2. Find matching `SessionSnapshot` in `SESSION_SNAPSHOTS`
3. Call `buildReportSections(snapshot)` to generate 10 sections
4. Overlay `base.interpretations`, `base.recommendations`, `base.nextSteps`, `base.summary` into sections if present
5. Attach `portalLink` if `status === 'shared'`
6. Return merged `ReportV2`

---

## 5. State Flow: Methodology → Template → Client → Session → Report

```
METHODOLOGY
  └─ defines available tools (TOOLS_RAD35, TOOLS_RAD49)
  └─ drives template selection
       │
       ▼
TEMPLATE (radionics_session_templates)
  └─ has blocks (radionics_template_blocks)
       └─ each block has fields (radionics_template_fields)
  └─ stageCode on each block maps to session stages
       │
       ▼
CLIENT
  └─ selected when scheduling session
  └─ clientType determines sharing options (hub_user, contact_with_email, contact_only)
       │
       ▼
SESSION (radionics_sessions)
  └─ links: clientId, methodologyId, templateId
  └─ has stages → steps (static structure in mock)
  └─ mutable state owned by useSessionState:
       ├─ toolResults: ToolResult[]     (per-tool diagnosis outcomes)
       ├─ hawkinsInitial / hawkinsFinal
       ├─ reverbDays
       └─ stageCompletion               (computed from above)
  └─ on complete → sessionSnapshot produced (Supabase-ready)
       │
       ▼
REPORT GENERATION (pages/reports/generate.tsx)
  └─ reads SessionSnapshot
  └─ calls buildReportSections(snapshot) → 10 ReportSection[]
  └─ creates draft ReportV2 (mock: navigates to /reports/:id)
       │
       ▼
REPORT EDITING (pages/reports/detail.tsx + useReportState)
  └─ therapist edits sections (content, visibility)
  └─ applies AI drafts
  └─ status flow: draft → in_review → approved → shared
  └─ share triggers portalLink creation
       │
       ▼
CLIENT-FACING VIEW
  ├─ /reports/:id/preview  — filtered view (sections where visibility !== 'private')
  └─ /reports/:id/pdf      — A4 print layout (same filter, print-ready CSS)
```

---

## 6. Data Shape for Supabase Persistence

These are the exact snake_case shapes ready for DB insertion. All field names were designed to match the intended table columns.

### `radionics_sessions`
```ts
{
  id: string,
  client_id: string,
  therapist_id: string,
  methodology_id: string,
  template_id: string,
  status: 'draft' | 'in_progress' | 'paused' | 'completed' | 'reported',
  session_mode: 'presential' | 'online' | 'distance',
  intention: string | null,
  current_stage_code: string | null,
  current_step_code: string | null,
  scheduled_at: string | null,   // ISO8601
  completed_at: string | null,
  created_at: string,
  updated_at: string,
}
```

### `radionics_session_details` (from `SessionStateSnapshot`)
```ts
{
  session_id: string,
  hawkins_initial: number | null,
  hawkins_final: number | null,
  reverberation_days: number | null,
  tool_results: ToolResult[],           // JSONB
  identified_tool_ids: string[],        // text[]
  activated_tool_ids: string[],         // text[]
  stage_completion: Record<string, boolean>,  // JSONB
  updated_at: string,
}
```

### `radionics_session_snapshots` (from `SessionSnapshot`)
```ts
{
  session_id: string,
  client_id: string,
  client_name: string,
  client_email: string | null,
  client_whatsapp: string | null,
  client_telegram: string | null,
  client_type: 'contact_only' | 'contact_with_email' | 'hub_user',
  methodology_name: string,
  methodology_code: string,
  session_date: string,           // 'YYYY-MM-DD'
  intention: string | null,
  hawkins_initial: number | null,
  hawkins_final: number | null,
  reverberation_days: number | null,
  tool_results: ToolResult[],     // JSONB
  identified_tool_names: string[],
  activated_tool_names: string[],
  therapist_notes: string | null,
  voice_transcripts: string[] | null,
  created_at: string,
}
```

### `radionics_reports`
```ts
{
  id: string,
  session_id: string,
  client_id: string,
  therapist_id: string,
  status: 'draft' | 'in_review' | 'approved' | 'shared',
  session_date: string,
  methodology_name: string,
  methodology_code: string,
  intention: string | null,
  hawkins_initial: number | null,
  hawkins_final: number | null,
  reverberation_days: number | null,
  created_at: string,
  approved_at: string | null,
  shared_at: string | null,
}
```

### `radionics_report_sections`
```ts
{
  id: string,             // generated
  report_id: string,
  code: ReportSectionCode,
  title: string,
  content: string,
  is_read_only: boolean,
  source_trace: SourceTrace,
  visibility: SectionVisibility,
  ai_draft: string | null,
  is_dirty: boolean,
  updated_at: string,
}
```

### `radionics_client_portal_links`
```ts
{
  id: string,
  report_id: string,
  client_id: string,
  token: string,
  url: string,
  expires_at: string | null,
  created_at: string,
}
```

### `radionics_session_templates` (from `useTemplateState` `snapshot`)
```ts
{
  id: string,
  name: string,
  description: string | null,
  methodology_id: string,
  is_base_template: boolean,
  template_type: 'official' | 'custom',
  status: 'active' | 'archived',
  version: number,
  parent_template_id: string | null,
  created_at: string,
  updated_at: string,
}
```

### `radionics_template_blocks`
```ts
{
  id: string,
  template_id: string,
  block_code: string,
  title: string,
  description: string | null,
  order_index: number,
  stage_code: string | null,
  is_required: boolean,
  show_in_session: boolean,
  show_in_report: boolean,
  show_in_hub: boolean,
  is_private: boolean,
}
```

### `radionics_template_fields`
```ts
{
  id: string,
  block_id: string,
  field_code: string,
  label: string,
  field_type: FieldType,
  order_index: number,
  is_required: boolean,
  placeholder: string | null,
  help_text: string | null,
  options: string[] | null,
  show_in_session: boolean,
  show_in_report: boolean,
  show_in_hub: boolean,
}
```

---

## 7. Files Requiring Integration Changes

When Supabase is connected, these files will need to swap mock reads/writes for real API calls.

### High priority — data reads

| File | Mock Used | Integration Needed |
|---|---|---|
| `pages/reports/detail.tsx` | `getReportV2ById(id)` | `SELECT` from `radionics_reports` + join sections |
| `pages/reports/pdf.tsx` | `getReportV2ById(id)` | Same as above |
| `pages/reports/preview.tsx` | `getReportV2ById(id)` | Same as above |
| `pages/reports/index.tsx` | `REPORTS` | `SELECT` from `radionics_reports` by therapist |
| `pages/reports/generate.tsx` | `getSessionById`, `getSnapshotBySessionId` | Read session + snapshot from DB |
| `pages/sessions/workspace.tsx` | `getSessionById`, `SESSIONS`, `TOOLS_RAD35` | Read session from DB; tools from DB or static |
| `pages/sessions/index.tsx` | `SESSIONS` | `SELECT` from `radionics_sessions` |
| `pages/clients/detail.tsx` | `CLIENTS`, `SESSIONS` | Read client + their sessions |
| `pages/clients/index.tsx` | `CLIENTS` | `SELECT` from `radionics_clients` |
| `pages/templates/builder.tsx` | `getTemplateById` | Read template from DB |
| `pages/templates/index.tsx` | `TEMPLATES` | `SELECT` from `radionics_session_templates` |
| `pages/dashboard.tsx` | `getDashboardData()` | Aggregation queries |

### High priority — data writes

| File | Mock Write | Integration Needed |
|---|---|---|
| `lib/report-state.ts` | `setTimeout` auto-save stubs | All mutations → `UPDATE radionics_report_sections`, `UPDATE radionics_reports` |
| `lib/report-state.ts` | `submitForReview()` | `UPDATE status = 'in_review'` |
| `lib/report-state.ts` | `approve()` | `UPDATE status = 'approved', approved_at = now()` |
| `lib/report-state.ts` | `generatePortalLink()` | `INSERT radionics_client_portal_links` + `UPDATE reports.status = 'shared'` |
| `lib/session-state.ts` | All `setState` calls | `UPSERT radionics_session_details` on each mutation (debounced) |
| `lib/template-state.ts` | Auto-save simulation | `UPSERT` template + blocks + fields to 3 tables |
| `pages/reports/generate.tsx` | `setTimeout` progress | `INSERT radionics_reports`, `INSERT radionics_report_sections[]`, `INSERT radionics_session_snapshots` |

### Medium priority — static mock data to replace

| Mock | Replacement |
|---|---|
| `METHODOLOGIES` | `SELECT * FROM radionics_methodologies` |
| `TOOLS_RAD35`, `TOOLS_RAD49` | `SELECT * FROM radionics_tools WHERE methodology_id = ?` |
| `CLIENTS` | `SELECT * FROM radionics_clients WHERE therapist_id = ?` |
| `HAWKINS_LEVELS` | Keep as static constant (no DB needed) |
| `BLOCK_LIBRARY` in `template-state.ts` | Keep as static constant OR `SELECT * FROM radionics_block_library` |

### Low priority — mock-only features

| Feature | File | Notes |
|---|---|---|
| AI draft generation | `lib/report-state.ts` `generateAIDraft()` | Wire to Supabase Edge Function / AI gateway |
| Voice note recording | `pages/sessions/workspace.tsx` | Browser `MediaRecorder` not implemented — mock timer only |
| Email share | `lib/report-state.ts` `shareViaEmail()` | Currently just calls `generatePortalLink()` |
| Hub share | `lib/report-state.ts` `shareViaHub()` | Same — no hub notification sent |
| Therapist auth | Throughout | `therapistId: 'therapist-001'` hardcoded everywhere |

---

## 8. Mock-Only Logic & Assumptions

### Hardcoded values
- `therapistId` is `'therapist-001'` everywhere — no auth context exists yet
- Portal URLs are fake: `https://app.radionics.io/report/:id/view` — no actual domain
- Token format: `tok_${reportId}` — no real token generation

### Mock-only behaviors
- **Auto-save** in `useReportState` and `useTemplateState`: `setTimeout` chains, not real network calls
- **AI draft generation** in `useReportState.generateAIDraft()`: 2200ms fake delay, fills `aiDraft` content — no LLM call
- **AI draft text** in `buildReportSections()`: hardcoded template strings based on snapshot data
- **Voice recording** in workspace: timer counts up, no audio captured, transcript is never populated from real audio
- **Session stages/steps** in mock sessions: static arrays, not driven by template blocks
- **`getReportV2ById`** composites data at read-time from multiple mock arrays — in production this would be a single DB query with joins
- **`ToolResult.found`**: deprecated boolean flag still present in some mock data. Real code should derive from `status === 'identified' || status === 'activated'`

### Schema file
- `packages/web/src/api/database/schema.ts` is empty — only a Drizzle stub. No tables defined yet. All data persistence is in-memory mock.

### Missing entities (not yet modeled in UI)
- Therapist profile / auth (user table)
- Session stages as DB rows (currently static in session object)
- Client hub portal (separate consumer-facing app implied but not built)
- Notification system (email, WhatsApp)
- Report version history
- Template versioning (`version` field exists on type but not used in UI)

---

## 9. Quick Reference: Section Code Mapping

| `code` | `title` | `isReadOnly` | Default `sourceTrace` | Required |
|---|---|---|---|---|
| `client` | Cliente | ✓ | `session_field` | — |
| `session_objective` | Objetivo da Sessão | — | `session_field` | ✓ |
| `hawkins_evolution` | Evolução de Hawkins | ✓ | `session_field` | ✓ |
| `identified_tools` | Gráficos Identificados | ✓ | `session_field` | — |
| `activated_tools` | Gráficos Ativados | ✓ | `session_field` | — |
| `therapist_notes` | Notas do Terapeuta | — | `therapist_edit` | — |
| `final_interpretation` | Interpretação Final | — | `therapist_edit` | ✓ |
| `recommendations` | Recomendações | — | `therapist_edit` | ✓ |
| `reverberation` | Reverberação | — | `session_field` | — |
| `next_steps` | Próximos Passos | — | `therapist_edit` | — |

Default `visibility` at creation:
- `therapist_notes` → `'private'`
- All others → `'included'`

---

*Document reflects Phase 5 state. No Supabase integration exists. All data is ephemeral (in-memory / mock arrays).*
