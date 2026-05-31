# Radionics — Supabase Mapping Plan
**Date:** 2025-05-31  
**Scope:** Map every frontend type to its Supabase table. Identify missing columns, required migrations, RLS requirements, and open risks.  
**Source types:** `types/index.ts` (Phase 6 contract)  
**Source tables:** inferred from naming conventions + audit docs + session-state.ts comments

---

## Reading Guide

Each table entry follows this structure:

| Field | Meaning |
|---|---|
| **Purpose** | What this table stores |
| **Frontend source type** | Which TS type(s) write to / read from it |
| **Insert / update fields** | Columns written by frontend |
| **Fields existing** | Columns known to exist (from naming convention / prior audit) |
| **Fields missing** | Columns that need to be added |
| **Migration needed** | Yes / No / Additive |
| **RLS** | Row-level security policy considerations |
| **Open risks** | Unresolved design questions |

---

## Table-by-Table Mapping

---

### `clients`

**Purpose:** Master client record. One row per client in the therapist's practice.

**Frontend source type:** `Client`

```ts
interface Client {
  id: string;
  name: string;
  email?: string;
  whatsapp?: string;
  telegram?: string;
  phone?: string;
  birthDate?: string;
  clientType: ClientType;   // 'contact_only' | 'contact_with_email' | 'hub_user'
  notes?: string;
  createdAt: string;
  lastSessionDate?: string; // derived — not stored here
  sessionCount: number;     // derived — not stored here
  avatarUrl?: string;
}
```

**Insert / update fields:**
`name`, `email`, `whatsapp`, `telegram`, `phone`, `birth_date`, `client_type`, `notes`, `avatar_url`

**Fields existing (assumed):**
`id`, `name`, `email`, `created_at`

**Fields missing from current DB:**
| Column | Type | Notes |
|---|---|---|
| `whatsapp` | `text` | |
| `telegram` | `text` | |
| `phone` | `text` | |
| `birth_date` | `date` | |
| `client_type` | `text` (enum) | `'contact_only' \| 'contact_with_email' \| 'hub_user'` |
| `notes` | `text` | |
| `avatar_url` | `text` | |

**Derived columns (do NOT add — compute in query):**
- `last_session_date` → max(`radionics_session_details.created_at`) where `client_id = clients.id`
- `session_count` → count from `radionics_session_details`

**Migration needed:** Yes — additive columns

**RLS:**
- Therapist can only SELECT/UPDATE their own clients
- `client_type = 'hub_user'` rows also accessible from the client portal (read-only via token)
- `contact_only` clients have no email → no auth account → portal inaccessible

**Open risks:**
- `client_type` enum may need to be a Postgres enum or check constraint — if it stays `text`, no validation at DB level
- `hub_user` implies a Supabase Auth account linkage — needs a `auth_user_id uuid` FK column when portal auth is implemented

---

### `therapist_clients`

**Purpose:** Junction table linking therapists to clients (many-to-many). Enables multi-therapist practices.

**Frontend source type:** No direct frontend type. Implicitly expressed through `Session.therapistId` + `Session.clientId`.

**Insert / update fields:**
`therapist_id`, `client_id`, `created_at`

**Fields existing (assumed):**
`therapist_id`, `client_id`, `created_at`

**Fields missing:**
| Column | Type | Notes |
|---|---|---|
| `is_primary` | `boolean` | Flag the main therapist when a client has multiple |
| `notes` | `text` | Therapist-specific client notes (separate from global `clients.notes`) |

**Migration needed:** Additive (columns optional)

**RLS:**
- A therapist can only SELECT rows where `therapist_id = auth.uid()`
- Prevents therapist A from reading therapist B's client list even if the client record exists in `clients`

**Open risks:**
- If the app stays single-therapist (solo practice), this table adds complexity without value. Confirm multi-therapist use case before building RLS here.

---

### `radionics_tables`

**Purpose:** Methodology registry. Each row is a methodology (Mesa 35, Mesa 49, MAP, etc.). Maps to `Methodology` type.

**Frontend source type:** `Methodology`

```ts
interface Methodology {
  id: string; code: string; name: string; shortName: string;
  description: string; imageUrl: string; color: string;
  requiresCertification: boolean; isActive: boolean; toolCount: number;
  certificationStatus?: 'approved' | 'pending' | 'not_certified';
}
```

**Insert / update fields:**
Read-only from frontend — methodologies are admin-managed, not therapist-created.

**Fields existing (assumed):**
`id`, `code`, `name`, `description`, `is_active`

**Fields missing:**
| Column | Type | Notes |
|---|---|---|
| `short_name` | `text` | |
| `image_url` | `text` | |
| `color` | `text` | hex string |
| `requires_certification` | `boolean` | |
| `tool_count` | `int4` | denormalized from `radionics_tools` count — or compute dynamically |
| `certification_status` | `text` | therapist-specific! should be in a join table, not here |

**Migration needed:** Yes — additive; `certification_status` needs special handling (see risk)

**RLS:**
- SELECT open to all authenticated therapists
- INSERT/UPDATE restricted to admin role only

**Open risks:**
- `certificationStatus` in `Methodology` is therapist-scoped (therapist A is certified, therapist B is not). This **must not** be a column in `radionics_tables` — it belongs in a `therapist_methodology_certifications` join table with `therapist_id`, `methodology_id`, `status`.
- `toolCount` should be a view or computed column, not a stored denormalized int — it will drift.

---

### `radionics_tools`

**Purpose:** Tool registry. Each row is a single radionics tool (e.g. Anti Magia, Luxor). Maps to `Tool` type.

**Frontend source type:** `Tool`

```ts
interface Tool {
  id: string; code: string; name: string; description: string;
  whatItDoes: string; example: string; suggestedActivation: string;
  imageUrl: string; methodologyId: string; sortOrder: number;
}
```

**Insert / update fields:**
Read-only from frontend — admin-managed.

**Fields existing (assumed):**
`id`, `code`, `name`, `description`, `methodology_id`, `sort_order`

**Fields missing:**
| Column | Type | Notes |
|---|---|---|
| `what_it_does` | `text` | |
| `example` | `text` | |
| `suggested_activation` | `text` | |
| `image_url` | `text` | |

**Migration needed:** Yes — additive

**RLS:**
- SELECT open to all authenticated therapists
- No INSERT/UPDATE from frontend

**Open risks:** None significant.

---

### `radionics_tool_table_map`

**Purpose:** Junction — which tools belong to which methodology (table). Redundant if `radionics_tools.methodology_id` is the single FK, but exists as a many-to-many map (some tools may appear in multiple methodologies).

**Frontend source type:** Implicit in `Tool.methodologyId`. No explicit frontend type.

**Insert / update fields:** Admin-managed only.

**Fields existing (assumed):**
`tool_id`, `table_id` (= methodology id), `sort_order`

**Fields missing:** None identified.

**Migration needed:** No

**RLS:** SELECT open to authenticated users.

**Open risks:**
- If `radionics_tools.methodology_id` already handles the relationship, this table may be redundant. Audit whether it's used in queries before adding FKs.

---

### `radionics_session_details`

**Purpose:** Mutable session state — persisted throughout the session lifecycle. Maps to `SessionStateSnapshot` (the live, writable state shape). Also the primary header record for a session.

**Frontend source type:** `SessionStateSnapshot` + `Session`

```ts
// SessionStateSnapshot — written by useSessionState
interface SessionStateSnapshot {
  session_id: string;
  hawkins_initial: number | null;
  hawkins_final: number | null;
  reverberation_days: number | null;
  tool_results: ToolResult[];         // JSONB
  identified_tool_ids: string[];      // text[] — denormalized
  activated_tool_ids: string[];       // text[] — denormalized
  field_values: Record<string, FieldValue>; // JSONB
  stage_completion: Record<string, boolean>; // JSONB
  updated_at: string;
}

// Session — broader header fields also belong here
interface Session {
  id; clientId; therapistId; methodologyId; templateId;
  status; sessionMode; intention;
  hawkinsInitial; hawkinsFinal; reverberationDays;
  currentStageCode; currentStepCode;
  stages: SessionStage[];   // JSONB (full stage tree)
  createdAt; updatedAt; scheduledAt; completedAt;
}
```

**Insert / update fields:**
`id`, `client_id`, `therapist_id`, `methodology_id`, `template_id`,  
`status`, `session_mode`, `intention`,  
`hawkins_initial`, `hawkins_final`, `reverberation_days`,  
`current_stage_code`, `current_step_code`,  
`stages` (JSONB), `tool_results` (JSONB), `field_values` (JSONB),  
`identified_tool_ids` (text[]), `activated_tool_ids` (text[]),  
`stage_completion` (JSONB),  
`updated_at`, `scheduled_at`, `completed_at`

**Fields existing (assumed):**
`id`, `client_id`, `therapist_id`, `methodology_id`, `status`, `created_at`, `updated_at`

**Fields missing:**
| Column | Type | Notes |
|---|---|---|
| `template_id` | `uuid` FK | FK to `radionics_session_templates` |
| `session_mode` | `text` | `'presential' \| 'online' \| 'distance'` |
| `intention` | `text` | |
| `hawkins_initial` | `int2` | |
| `hawkins_final` | `int2` | |
| `reverberation_days` | `int2` | |
| `current_stage_code` | `text` | |
| `current_step_code` | `text` | |
| `stages` | `jsonb` | full `SessionStage[]` tree |
| `tool_results` | `jsonb` | `ToolResult[]` — **critical** |
| `field_values` | `jsonb` | `Record<fieldCode, FieldValue>` — **critical, new** |
| `identified_tool_ids` | `text[]` | denormalized for query performance |
| `activated_tool_ids` | `text[]` | denormalized |
| `stage_completion` | `jsonb` | `Record<stageCode, boolean>` |
| `scheduled_at` | `timestamptz` | |
| `completed_at` | `timestamptz` | |

**Migration needed:** Yes — significant, multiple columns

**RLS:**
- Therapist can SELECT/UPDATE only rows where `therapist_id = auth.uid()`
- No client access to this table — raw session data is private
- Auto-save (upsert) on `updated_at` — needs UPDATE policy, not just INSERT

**Open risks:**
- `stages` JSONB stores the entire `SessionStage[]` tree including `SessionStep[]` and embedded `toolResults`. This overlaps with the top-level `tool_results` JSONB column. Decision needed: **single source of truth**. Recommendation: `tool_results` at top-level is the canonical state; `stages` carries UI navigation state only (status flags, step completion), not tool result data.
- `field_values` JSONB stores `FieldValue` discriminated union — validate `type` field server-side with a check constraint or Postgres function, or accept that validation is frontend-only.
- `identified_tool_ids` / `activated_tool_ids` must be kept in sync with `tool_results` JSONB on every write. Options: computed columns (Postgres generated) or trigger, or accept the frontend always writes both together. Triggers are safer.

---

### `radionics_session_step_results`

**Purpose:** Granular step-level results — one row per step per session. Enables per-step analytics without parsing the full `stages` JSONB blob.

**Frontend source type:** `SessionStep` (embedded in `SessionStage.steps[]`)

```ts
interface SessionStep {
  code: string; label: string; type: StepType; status: StageStatus;
  content?: string; selectedTools?: string[];
  toolResults?: ToolResult[]; notes?: string; transcript?: string;
}
```

**Insert / update fields:**
`session_id`, `stage_code`, `step_code`, `step_type`, `status`,  
`selected_tool_ids` (text[]), `tool_results` (JSONB), `notes`, `transcript`, `updated_at`

**Fields existing (assumed):**
`id`, `session_id`, `stage_code`, `step_code`, `status`

**Fields missing:**
| Column | Type | Notes |
|---|---|---|
| `step_type` | `text` | `StepType` enum |
| `selected_tool_ids` | `text[]` | tools selected in this step |
| `tool_results` | `jsonb` | step-scoped tool results |
| `notes` | `text` | |
| `transcript` | `text` | raw voice transcript for this step |
| `updated_at` | `timestamptz` | |

**Migration needed:** Yes — additive

**RLS:** Same as `radionics_session_details` — therapist-scoped.

**Open risks:**
- This table is redundant if `radionics_session_details.stages` JSONB is the source of truth. Avoid double-writing unless query patterns actually need step-level indexing. Defer until analytics are required.
- If deferred, mark as **static mock** in current phase.

---

### `radionics_session_activations`

**Purpose:** Log of tool activations — when a tool was activated, with what intensity and notes. One row per tool-activation event.

**Frontend source type:** `ToolResult` (filtered to `status === 'activated'`)

```ts
interface ToolResult {
  toolId: string; toolName: string; toolImageUrl: string;
  status: ToolStatus; intensity?: ToolIntensity;
  notes?: string; transcript?: string;
  voiceNotes?: VoiceNote[];
  activatedAt?: string;
}
```

**Insert / update fields:**
`session_id`, `tool_id`, `intensity`, `notes`, `voice_notes` (JSONB), `activated_at`

**Fields existing (assumed):**
`id`, `session_id`, `tool_id`, `activated_at`

**Fields missing:**
| Column | Type | Notes |
|---|---|---|
| `intensity` | `text` | `'low' \| 'medium' \| 'high'` |
| `notes` | `text` | |
| `voice_notes` | `jsonb` | `VoiceNote[]` — includes `toolId`, `toolName`, `audioUrl` |
| `transcript` | `text` | raw combined transcript for this activation |

**Migration needed:** Yes — additive

**RLS:** Therapist-scoped. No client access.

**Open risks:**
- `voice_notes[].audioUrl` — if audio is recorded in-browser, the URL is a `blob:` URL that only lives in the browser session. Persistence requires upload to Supabase Storage first, then store the persistent URL. This is **not currently wired** — the frontend comment in `session-state.ts` explicitly notes: *"Browser audio API not wired — voice note recording is mock-only"*.
- Until audio upload is wired, `voice_notes[].audioUrl` should be omitted from insert payloads.

---

### `radionics_session_templates`

**Purpose:** Template definitions — each row is a saved template (or base template) that drives session structure. Maps to `Template`.

**Frontend source type:** `Template`

```ts
interface Template {
  id: string; name: string; description?: string;
  methodologyId: string; methodologyName: string;
  isBaseTemplate: boolean; templateType: TemplateType;
  status: 'active' | 'archived';
  blocks: TemplateBlock[];  // JSONB or normalized in radionics_template_blocks
  createdAt: string; updatedAt: string;
  version?: number;           // radionics_template_versions
  parentTemplateId?: string;
}
```

**Insert / update fields:**
`name`, `description`, `methodology_id`, `is_base_template`, `template_type`,  
`status`, `blocks` (JSONB — if denormalized), `parent_template_id`, `updated_at`

**Fields existing (assumed):**
`id`, `name`, `methodology_id`, `status`, `created_at`, `updated_at`

**Fields missing:**
| Column | Type | Notes |
|---|---|---|
| `description` | `text` | |
| `is_base_template` | `boolean` | |
| `template_type` | `text` | `'official' \| 'custom'` |
| `parent_template_id` | `uuid` | self-referential FK for duplicated templates |
| `therapist_id` | `uuid` | owner — base templates have no owner (null or admin) |
| `methodology_name` | `text` | denormalized from join — avoid storing; compute in view |

**Migration needed:** Yes

**RLS:**
- `is_base_template = true` → SELECT for all authenticated therapists, no UPDATE
- `is_base_template = false` → SELECT/UPDATE only for owning `therapist_id`

**Open risks:**
- `blocks` — should blocks be inline JSONB in this table or normalized in `radionics_template_blocks`? The separate table exists, suggesting normalization is intended. But the frontend passes `blocks: TemplateBlock[]` as a nested array. Two approaches possible:
  1. Normalize: write each block as a separate row in `radionics_template_blocks`
  2. Denormalize: store `blocks` as JSONB here, skip `radionics_template_blocks` for now  
  **Recommendation:** Use normalization for the live session template; keep JSONB snapshot in `radionics_session_details` for historical integrity.
- `methodology_name` on `Template` is denormalized — do not persist; JOIN to `radionics_tables` in query.

---

### `radionics_template_blocks`

**Purpose:** Individual blocks within a template. One row per block per template. Maps to `TemplateBlock`.

**Frontend source type:** `TemplateBlock`

```ts
interface TemplateBlock {
  id: string; blockCode: string; title: string; description?: string;
  orderIndex: number; stageCode?: string;
  isRequired: boolean; showInSession: boolean; showInReport: boolean;
  showInHub: boolean; isPrivate: boolean;
  fields: TemplateField[];  // normalized in radionics_template_fields
}
```

**Insert / update fields:**
`template_id`, `block_code`, `title`, `description`, `order_index`,  
`stage_code`, `is_required`, `show_in_session`, `show_in_report`,  
`show_in_hub`, `is_private`

**Fields existing (assumed):**
`id`, `template_id`, `block_code`, `title`, `order_index`

**Fields missing:**
| Column | Type | Notes |
|---|---|---|
| `description` | `text` | |
| `stage_code` | `text` | which session stage this block renders in |
| `is_required` | `boolean` | |
| `show_in_session` | `boolean` | |
| `show_in_report` | `boolean` | |
| `show_in_hub` | `boolean` | |
| `is_private` | `boolean` | hidden from client portal |

**Migration needed:** Yes — additive

**RLS:** Follow parent template's RLS (base template blocks: read-only; custom: owner-editable).

**Open risks:** None significant. Clean normalized structure.

---

### `radionics_template_fields`

**Purpose:** Fields within a template block. One row per field. Maps to `TemplateField`.

**Frontend source type:** `TemplateField`

```ts
interface TemplateField {
  id: string; fieldCode: string; label: string;
  fieldType: FieldType; orderIndex: number; isRequired: boolean;
  placeholder?: string; helpText?: string; options?: string[];
  showInSession?: boolean; showInReport?: boolean; showInHub?: boolean;
}
```

**Insert / update fields:**
`block_id`, `field_code`, `label`, `field_type`, `order_index`,  
`is_required`, `placeholder`, `help_text`, `options` (text[] or JSONB),  
`show_in_session`, `show_in_report`, `show_in_hub`

**Fields existing (assumed):**
`id`, `block_id`, `field_code`, `label`, `field_type`, `order_index`

**Fields missing:**
| Column | Type | Notes |
|---|---|---|
| `is_required` | `boolean` | |
| `placeholder` | `text` | |
| `help_text` | `text` | |
| `options` | `text[]` | for `single_select` / `multi_select` fields |
| `show_in_session` | `boolean` | |
| `show_in_report` | `boolean` | |
| `show_in_hub` | `boolean` | |

**Migration needed:** Yes — additive

**RLS:** Follow parent block/template RLS chain.

**Open risks:**
- `field_type` maps to `FieldType` enum — must match `FieldValue.type` discriminant exactly. Any drift between DB enum values and TS union members will cause runtime failures on field value hydration.
- `options` for `tool_selector` and `hawkins_selector` field types are not traditional option lists — they have special rendering logic. Ensure the frontend switch statement handles all `FieldType` values before persisting unknown types.

---

### `radionics_template_versions`

**Purpose:** Version history of a template. Maps `Template.version` and `Template.parentTemplateId` to an audit trail.

**Frontend source type:** `Template.version` (number) + `Template.parentTemplateId`

**Insert / update fields:**
`template_id`, `version_number`, `snapshot` (JSONB — full template at that version), `created_at`, `created_by`

**Fields existing (assumed):**
`id`, `template_id`, `version_number`, `created_at`

**Fields missing:**
| Column | Type | Notes |
|---|---|---|
| `snapshot` | `jsonb` | full template blocks+fields at that version |
| `created_by` | `uuid` | therapist who saved this version |
| `change_summary` | `text` | optional human-readable diff note |

**Migration needed:** Yes — additive

**RLS:** Read-only for template owner. No client access.

**Open risks:**
- Version snapshot JSONB can grow large if templates have many blocks/fields. Consider compressing or only storing diffs for v2.
- `Template.version` is an incrementing integer on the frontend but has no enforcement at DB level currently. Could drift if two sessions write simultaneously.

---

### `radionics_session_snapshots` *(inferred — not in the provided table list)*

> **Note:** The user-provided table list does not include `radionics_session_snapshots`. However, `SessionSnapshot` explicitly maps to this table in code comments and the persistence contract doc. This section documents it for completeness — it either exists under a different name or needs to be created.

**Purpose:** Immutable sealed record of a session at completion. Seeded from `Session` + `ToolResult[]` + `Client` at session close. Maps to `SessionSnapshot`.

**Frontend source type:** `SessionSnapshot`

```ts
interface SessionSnapshot {
  session_id; client_id; client_name; client_email; client_whatsapp;
  client_telegram; client_type; methodology_name; methodology_code;
  session_date; intention;
  hawkins_initial; hawkins_final; reverberation_days;
  tool_results: ToolResult[];           // JSONB
  identified_tool_names: string[];      // text[]
  activated_tool_names: string[];       // text[]
  therapist_notes?: string;
  voice_notes?: VoiceNote[];            // JSONB — replaces voice_transcripts
  created_at;
}
```

**Insert / update fields:** INSERT only — never updated after session close.

**Fields existing:** Unknown — table may not exist yet.

**Fields missing (if table needs creation):**
All of the above columns.

**Migration needed:** Yes — create table

**RLS:**
- Therapist: SELECT where `session_id` belongs to their sessions
- Client portal: SELECT via `client_portal_links` token — only the snapshot for that specific report

**Open risks:**
- Client contact fields (`client_email`, `client_whatsapp`, `client_telegram`) are denormalized into the snapshot. This is intentional for report immutability but means contact info in the snapshot will not reflect client record updates. Document this clearly.
- `voice_notes[].audioUrl` — same audio upload risk as in `radionics_session_activations`. Must be a persistent URL, not a blob URL.

---

### `radionics_reports`

**Purpose:** Report header record. One row per report per session. Maps to `ReportV2` (which extends `Report`).

**Frontend source type:** `Report` / `ReportV2`

```ts
interface Report {
  id; sessionId; clientId; clientName; methodologyName; methodologyCode;
  therapistId; status: ReportStatus; sessionDate; intention; summary;
  hawkinsInitial; hawkinsFinal;
  toolsIdentified: string[]; toolsActivated: string[];
  interpretations: string[]; recommendations: string[];
  reverberationDays; nextSteps;
  createdAt; approvedAt; sharedAt;
}

// ReportV2 adds:
interface ReportV2 extends Report {
  sections: ReportSection[];
  snapshot?: SessionSnapshot;
  portalLink?: ClientPortalLink;
  finalInterpretation?: string;
  therapistNotes?: string;
}
```

**Insert / update fields:**
`session_id`, `client_id`, `therapist_id`, `methodology_id`, `status`,  
`session_date`, `intention`, `summary`,  
`hawkins_initial`, `hawkins_final`, `reverberation_days`,  
`tools_identified` (text[]), `tools_activated` (text[]),  
`interpretations` (text[]), `recommendations` (text[]),  
`next_steps`, `final_interpretation`, `therapist_notes`,  
`approved_at`, `shared_at`, `updated_at`

**Fields existing (assumed):**
`id`, `session_id`, `client_id`, `therapist_id`, `status`, `created_at`

**Fields missing:**
| Column | Type | Notes |
|---|---|---|
| `methodology_id` | `uuid` FK | |
| `session_date` | `date` | |
| `intention` | `text` | |
| `summary` | `text` | |
| `hawkins_initial` | `int2` | |
| `hawkins_final` | `int2` | |
| `reverberation_days` | `int2` | |
| `tools_identified` | `text[]` | tool names (denormalized for display) |
| `tools_activated` | `text[]` | tool names |
| `interpretations` | `text[]` | AI or therapist-written lines |
| `recommendations` | `text[]` | |
| `next_steps` | `text` | |
| `final_interpretation` | `text` | ReportV2 field |
| `therapist_notes` | `text` | private, not in client view |
| `approved_at` | `timestamptz` | |
| `shared_at` | `timestamptz` | when portal link was sent |
| `updated_at` | `timestamptz` | |

**Migration needed:** Yes — significant

**RLS:**
- Therapist: full CRUD on own reports
- Client portal: SELECT only, via `client_portal_links` token, only report fields not marked `visibility: 'private'`
- `therapist_notes` must be excluded from portal SELECT policy

**Open risks:**
- `clientName`, `methodologyName`, `methodologyCode` in `Report` are denormalized display strings. Do not store — compute via JOIN in the query layer. The frontend caches them for display but DB should use FKs.
- `interpretations: string[]` and `recommendations: string[]` as `text[]` columns limits rich formatting. If these ever need structured content (markdown, per-item metadata), migrate to JSONB.

---

### `radionics_report_sections`

**Purpose:** Individual sections of a report — one row per section per report. Maps to `ReportSection`.

**Frontend source type:** `ReportSection`

```ts
interface ReportSection {
  code: ReportSectionCode;   // 'client' | 'hawkins_evolution' | etc.
  title: string;
  content: string;           // editable text — stored here
  isReadOnly: boolean;
  sourceTrace: SourceTrace;  // 'session_field' | 'tool_note' | 'voice_transcript' | etc.
  visibility: SectionVisibility;  // 'included' | 'hidden_from_client' | 'private'
  aiDraft?: string;
  isDirty?: boolean;         // frontend-only, not persisted
  structuredData?: unknown;  // frontend-only for read-only sections, not persisted
}
```

**Insert / update fields:**
`report_id`, `section_code`, `title`, `content`, `is_read_only`,  
`source_trace`, `visibility`, `ai_draft`, `updated_at`

**Fields NOT persisted (frontend-only):**
- `isDirty` — transient UI flag
- `structuredData` — reconstructed from `SessionSnapshot` at render time, not stored

**Fields existing (assumed):**
`id`, `report_id`, `section_code`, `content`

**Fields missing:**
| Column | Type | Notes |
|---|---|---|
| `title` | `text` | section display title |
| `is_read_only` | `boolean` | |
| `source_trace` | `text` | audit — how content was generated |
| `visibility` | `text` | `'included' \| 'hidden_from_client' \| 'private'` |
| `ai_draft` | `text` | original AI-generated text before edits |
| `updated_at` | `timestamptz` | |
| `order_index` | `int2` | section display order |

**Migration needed:** Yes — additive

**RLS:**
- Therapist: full CRUD
- Client portal: SELECT only where `visibility = 'included'` and `is_read_only = false` OR `is_read_only = true`
- `visibility = 'private'` sections must be excluded from portal SELECT via RLS policy (not application-layer filtering)

**Open risks:**
- `structuredData` on read-only sections is intentionally **not persisted**. It is reconstructed at render time from the `SessionSnapshot`. If the snapshot is mutated (it shouldn't be, but could be via DB admin), the rendered structured data will drift from the stored `content` string. This is the correct trade-off — `content` is the canonical, human-readable fallback.
- `section_code` values must match the `ReportSectionCode` TS union exactly. Any new section codes added to the DB must be added to the union or the frontend will type-error on response deserialization.

---

### `client_portal_links`

**Purpose:** Shareable token-gated links giving a specific client read access to a specific report. Maps to `ClientPortalLink`.

**Frontend source type:** `ClientPortalLink`

```ts
interface ClientPortalLink {
  id: string; report_id: string; client_id: string;
  token: string; url: string;
  expires_at?: string; created_at: string;
}
```

**Insert / update fields:**
`report_id`, `client_id`, `token`, `url`, `expires_at`

**Fields existing (assumed):**
`id`, `report_id`, `client_id`, `token`, `created_at`

**Fields missing:**
| Column | Type | Notes |
|---|---|---|
| `url` | `text` | derived from token — may be computed, not stored |
| `expires_at` | `timestamptz` | optional expiry |
| `revoked_at` | `timestamptz` | soft-delete for link revocation |
| `accessed_at` | `timestamptz` | last time link was followed |

**Migration needed:** Yes — additive

**RLS:**
- Therapist: SELECT/INSERT/DELETE on own report links
- Unauthenticated (anon role): SELECT where `token = $token` AND `revoked_at IS NULL` AND (`expires_at IS NULL` OR `expires_at > now()`)
- This is the only table with anon SELECT access — must be tightly constrained

**Open risks:**
- `url` likely should not be stored — it's `${base_url}/portal/${token}` which is deterministic. Storing it creates drift if the domain changes. Compute at runtime.
- `token` must be cryptographically random (e.g. `gen_random_uuid()` or `encode(gen_random_bytes(32), 'hex')`). Confirm token generation is server-side only, never client-generated.
- No rate limiting on anonymous token lookup — needs Supabase edge function or RLS `LIMIT` guard to prevent brute-force enumeration.

---

## Legacy Tables — Warnings

### `radionics_therapy_types`

**Status: UNUSED in frontend types**

No TypeScript type maps to this table. It is not referenced in `types/index.ts`, `mock-data.ts`, `session-state.ts`, or any page component.

**Risk:** If this table was intended to categorize methodologies or tools, that role is now filled by `radionics_tables` (methodologies) and the `FieldType` enum (field categorization). Connecting it now would require inventing a mapping that doesn't exist in the frontend contract.

**Recommendation:** 
- Do not map anything to this table in Phase 1 integration
- If it corresponds to an intended feature (e.g. therapy modality tags on sessions), create a `TherapyType` frontend type first and design from the frontend out
- Otherwise, drop or archive

---

### `radionics_tool_therapy_map`

**Status: UNUSED in frontend types**

Junction table mapping tools to therapy types. Since `radionics_therapy_types` itself has no frontend mapping, this table is doubly orphaned.

**Risk:** This table creates FK constraints that could block tool inserts if `therapy_type_id` is required and no therapy types exist.

**Recommendation:**
- Do not write to this table in Phase 1 integration
- Audit whether it has a `NOT NULL` FK constraint on tool inserts — if so, it could block the tools seed
- If the feature is needed later, design the `TherapyType` + mapping UI first, then backfill

---

## Suggested Migration Phases

### Phase 1 — Core Client + Session Header (integrate first)

Wire these tables first — they have the cleanest shapes and no JSONB complexity:

| Table | Action |
|---|---|
| `clients` | Add missing columns; wire client CRUD |
| `therapist_clients` | Add `is_primary`; wire on client create |
| `radionics_tables` | Add missing columns; seed from `METHODOLOGIES` mock data |
| `radionics_tools` | Add missing columns; seed from `TOOLS_RAD35` + `TOOLS_RAD49` mock data |
| `radionics_session_details` | Add header columns (`intention`, `session_mode`, `status`, `template_id`); wire session create |

### Phase 2 — Template System

| Table | Action |
|---|---|
| `radionics_session_templates` | Add missing columns; wire template CRUD |
| `radionics_template_blocks` | Add missing columns; wire block editor |
| `radionics_template_fields` | Add missing columns; wire field editor |
| `radionics_template_versions` | Add `snapshot`/`created_by`; wire auto-versioning on save |

### Phase 3 — Live Session State (JSONB writes)

| Table | Action |
|---|---|
| `radionics_session_details` | Add JSONB columns (`tool_results`, `field_values`, `stages`, `stage_completion`) |
| `radionics_session_activations` | Add missing columns; wire on tool activation |
| `radionics_session_step_results` | Add missing columns; wire on step completion (optional — can defer to Phase 5) |

### Phase 4 — Reports

| Table | Action |
|---|---|
| `radionics_reports` | Add missing columns; wire report create + status updates |
| `radionics_report_sections` | Add missing columns; wire section save |

### Phase 5 — Session Snapshot + Portal

| Table | Action |
|---|---|
| `radionics_session_snapshots` | Create table (or confirm existing table name); wire `buildSessionSnapshot()` call at session close |
| `client_portal_links` | Add `expires_at`, `revoked_at`; wire portal link generation; implement anon RLS |

### Phase 6 — Audio + AI

| Feature | Prerequisite |
|---|---|
| Audio upload (`voice_notes[].audioUrl`) | Supabase Storage bucket; wire upload before session close |
| AI draft generation | AI gateway; wire after Phase 4 |
| `radionics_therapy_types` + `radionics_tool_therapy_map` | Design frontend type first |

---

## Mock Data — What Stays Static

These mock arrays should remain static (not replaced by DB reads) until the corresponding Phase completes:

| Mock export | Stays mock until |
|---|---|
| `HAWKINS_LEVELS` | Never — this is a constant definition, not DB data |
| `METHODOLOGIES` | Phase 1 completes |
| `TOOLS_RAD35` / `TOOLS_RAD49` | Phase 1 completes (after tools seed) |
| `CLIENTS` | Phase 1 completes |
| `SESSIONS` | Phase 3 completes |
| `SESSION_SNAPSHOTS` | Phase 5 completes |
| `SESSIONS[*].stages` (SessionStage tree) | Phase 3 completes |
| `buildReportSections()` | Phase 4 completes |

**Do not** replace mock data piecemeal within a phase — switching half of `CLIENTS` to real DB and half to mock creates inconsistent ID spaces that break FK relationships throughout the session and report flows.

---

## Cross-Cutting Notes

### FieldValue → JSONB validation

`field_values` is stored as `jsonb` in `radionics_session_details`. The `FieldValue` discriminated union (`type` + `value`) has no server-side validation unless enforced via:
- Postgres `CHECK` constraint on the `type` key
- Database trigger validating shape on insert
- Supabase Edge Function middleware

For Phase 1-3, accept frontend-only validation. Add a Postgres check in Phase 4 when reports read from `field_values`.

### snake_case contract

All DB columns use `snake_case`. All frontend snapshot types use `snake_case` (by design — see `SessionStateSnapshot`, `SessionSnapshot`). Regular `camelCase` types (`Session`, `Client`, `Report`) need a transform layer when reading from / writing to Supabase. This transform is not yet implemented.

**Recommendation:** Create a `lib/db-transforms.ts` module with `toDbRow()` / `fromDbRow()` helpers per major type before wiring any Supabase calls.

### Timestamps

All `created_at` / `updated_at` columns should default to `now()` at DB level (`DEFAULT now()`). The frontend sends ISO strings but Postgres should own the canonical timestamp for inserts — do not trust client-provided `created_at` for audit purposes.

### No migrations file exists

`packages/web/src/api/database/schema.ts` is an empty Drizzle stub. There are no migrations. Phase 1 must establish the Drizzle schema file and generate the first migration before any DB integration work can begin.
