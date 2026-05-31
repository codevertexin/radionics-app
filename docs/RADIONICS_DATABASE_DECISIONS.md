# Radionics — Database Decisions
**Date:** 2025-05-31  
**Status:** FROZEN for MVP  
**Input:** `RADIONICS_SUPABASE_MAPPING_PLAN.md`, `RADIONICS_FRONTEND_PERSISTENCE_CONTRACT.md`, `types/index.ts`  
**Output:** Final table-level verdicts + canonical MVP schema column list

> This document makes final calls. Do not re-open these decisions without a specific product reason. Each verdict includes a reason. When in doubt: less is more — a table deferred is a table that can't go wrong.

---

## Verdict Summary

| Table | Verdict | Reason |
|---|---|---|
| `clients` | **KEEP** | Core entity. Every session needs a client. |
| `therapist_clients` | **DEFER** | Solo practice for MVP. Premature abstraction. |
| `radionics_tables` | **KEEP** | Methodology registry. Static seed data. |
| `radionics_tools` | **KEEP** | Tool registry. Static seed data. |
| `radionics_tool_table_map` | **REMOVE** | Redundant — `radionics_tools.methodology_id` is the FK. |
| `radionics_session_details` | **KEEP** | Primary session record. Central to all workflows. |
| `radionics_session_step_results` | **DEFER** | No query pattern needs it yet. Data lives in `stages` JSONB. |
| `radionics_session_activations` | **DEFER** | Activation data lives in `tool_results` JSONB. Audio not wired. |
| `radionics_session_templates` | **KEEP** | Session creation requires a template. |
| `radionics_template_blocks` | **KEEP** | Template structure requires normalized blocks. |
| `radionics_template_fields` | **KEEP** | Template structure requires normalized fields. |
| `radionics_template_versions` | **DEFER** | No version history UI exists yet. |
| `radionics_session_snapshots` | **CREATE** | Does not exist. Required for report generation and portal. |
| `radionics_reports` | **KEEP** | Core output. Required for therapist workflow. |
| `radionics_report_sections` | **KEEP** | Report editing works at section level. |
| `client_portal_links` | **KEEP** | Required for report sharing. |
| `therapist_methodology_certifications` | **CREATE** | Does not exist. Required to replace the misplaced `certification_status` on `radionics_tables`. |
| `radionics_therapy_types` | **REMOVE** | No frontend type. No product feature. Orphaned. |
| `radionics_tool_therapy_map` | **REMOVE** | Doubly orphaned. Depends on removed table. |

---

## Decisions — Full Reasoning

---

### `clients` — KEEP

Every other entity in the system (sessions, reports, portal links) traces back to a client. This table is non-negotiable.

**Columns to add for MVP:**
`whatsapp`, `telegram`, `phone`, `birth_date`, `client_type`, `notes`, `avatar_url`

**Do not add:** `last_session_date`, `session_count` — these are query-time derived values. Storing them invites stale denormalization bugs. Compute via aggregate query or materialized view when needed.

**client_type** must be enforced as a Postgres `CHECK` constraint or enum: `('contact_only', 'contact_with_email', 'hub_user')`. Text column with no constraint is not acceptable — it will drift.

---

### `therapist_clients` — DEFER

**Reason:** The MVP serves a solo practitioner. Every client belongs to one therapist implicitly via `auth.uid()`. Introducing a junction table now adds RLS complexity, requires a join on every client query, and solves a problem the MVP does not have.

**When to revisit:** When a second therapist needs to access the same client, or when a practice management feature is scoped.

**In the meantime:** Apply a `therapist_id uuid NOT NULL` column directly on `clients` and use `WHERE therapist_id = auth.uid()` as the RLS predicate. This is simpler and covers the solo case entirely.

---

### `radionics_tables` — KEEP

This is the methodology registry (Mesa 35, Mesa 49, MAP). Every session references a methodology. The table must exist and be seeded before any session can be created.

**Columns to add for MVP:**
`short_name`, `image_url`, `color`, `requires_certification`

**Do not add `certification_status` here.** This field is therapist-scoped — therapist A may be certified in Mesa 35 while therapist B is not. A column on `radionics_tables` would be global, which is wrong. See `therapist_methodology_certifications` (CREATE below).

**`tool_count`** — do not store as a column. It is `COUNT(*)` from `radionics_tools WHERE methodology_id = $id`. A stored column will go stale the moment a tool is added or removed. Use a view or compute in the query.

---

### `radionics_tools` — KEEP

Tool registry. Static seed data. Required for session diagnosis and activation flows.

**Columns to add for MVP:**
`what_it_does`, `example`, `suggested_activation`, `image_url`

No structural concerns. Clean table.

---

### `radionics_tool_table_map` — REMOVE

**Reason:** `radionics_tools` already has a `methodology_id` FK. A separate junction table for a relationship that is 1:1 in practice (each tool belongs to one methodology) adds joins without adding value.

**If multi-methodology tools ever become a requirement** (e.g. a tool shared between Mesa 35 and MAP), revisit then. Do not build for a requirement that does not exist.

**Action:** Drop this table. Remove any FK constraints it imposes on `radionics_tools`. Update the data seed to write `methodology_id` directly on the tool row.

---

### `radionics_session_details` — KEEP

The primary session record. Owns everything that happens during a session. This is the most important table in the system.

**Two jobs in one table — this is intentional for MVP:**
1. Session header (`client_id`, `therapist_id`, `status`, `intention`, `session_mode`, `template_id`)
2. Session live state (`tool_results` JSONB, `field_values` JSONB, `stages` JSONB, `stage_completion` JSONB, `hawkins_*`)

Splitting these into separate tables (header + state) adds a join on every read and a coordinated write on every save. The MVP auto-save pattern (upsert on a single row) does not justify the split. Revisit at scale.

**Single source of truth decision:**  
`tool_results` JSONB at the top level is canonical. The `stages` JSONB column stores UI navigation state only (stage/step status flags, `currentStageCode`, `currentStepCode`) — it does not duplicate tool result data. Any code that writes tool results into `stages[].steps[].toolResults` in the DB is wrong and must be cleaned up before Supabase integration.

**`identified_tool_ids` / `activated_tool_ids`:**  
Keep as `text[]` columns. They are denormalized but deliberate — they enable `WHERE 'tool-id' = ANY(identified_tool_ids)` without parsing JSONB. Enforce consistency via a Postgres trigger that derives them from `tool_results` on every update. The frontend must not be trusted to keep these in sync.

**Columns for MVP:**

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `therapist_id` | `uuid` FK auth | |
| `client_id` | `uuid` FK clients | |
| `methodology_id` | `uuid` FK radionics_tables | |
| `template_id` | `uuid` FK radionics_session_templates | |
| `status` | `text` CHECK | `'draft','in_progress','paused','completed','reported'` |
| `session_mode` | `text` CHECK | `'presential','online','distance'` |
| `intention` | `text` | |
| `hawkins_initial` | `int2` | |
| `hawkins_final` | `int2` | |
| `reverberation_days` | `int2` | |
| `current_stage_code` | `text` | |
| `current_step_code` | `text` | |
| `stages` | `jsonb` | navigation state only — no tool result data |
| `tool_results` | `jsonb` | canonical `ToolResult[]` |
| `field_values` | `jsonb` | `Record<fieldCode, FieldValue>` |
| `identified_tool_ids` | `text[]` | derived trigger — do not write from frontend |
| `activated_tool_ids` | `text[]` | derived trigger — do not write from frontend |
| `stage_completion` | `jsonb` | `Record<stageCode, boolean>` |
| `scheduled_at` | `timestamptz` | |
| `completed_at` | `timestamptz` | |
| `created_at` | `timestamptz` DEFAULT now() | |
| `updated_at` | `timestamptz` DEFAULT now() | trigger-maintained |

---

### `radionics_session_step_results` — DEFER

**Reason:** All step data lives in `radionics_session_details.stages` JSONB. There is no query that needs step-level row access in the MVP. Building this table now means double-writing the same data to two places and maintaining consistency between them.

**When to revisit:** When a specific analytics query or reporting feature needs to filter/aggregate at the step level (e.g. "which step do most sessions pause at"). Not before.

---

### `radionics_session_activations` — DEFER

**Reason:** Activation data (tool id, intensity, notes, voice notes) lives inside `radionics_session_details.tool_results` JSONB as `ToolResult[]`. There is no activation-specific query that requires a separate table in the MVP.

Additionally, the most valuable field this table would add — `voice_notes[].audioUrl` — is not wired. Audio recording is mock-only. Building the table now means either inserting rows with null audio URLs or blocking the feature until audio is ready.

**When to revisit:** When audio upload to Supabase Storage is implemented, or when an activation history timeline feature is scoped.

---

### `radionics_session_templates` — KEEP

Session creation requires a template. The template drives the block and field structure that appears in the workspace. Without this table, all sessions would use a hardcoded structure — which defeats the purpose of the template system.

**Columns for MVP:**

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `therapist_id` | `uuid` nullable | null = base/official template |
| `methodology_id` | `uuid` FK radionics_tables | |
| `name` | `text` | |
| `description` | `text` | |
| `is_base_template` | `boolean` | |
| `template_type` | `text` CHECK | `'official','custom'` |
| `status` | `text` CHECK | `'active','archived'` |
| `parent_template_id` | `uuid` self-ref FK | nullable — set when duplicated |
| `created_at` | `timestamptz` DEFAULT now() | |
| `updated_at` | `timestamptz` DEFAULT now() | |

**Do not store `methodology_name`** on this table. Join to `radionics_tables` in the query.

---

### `radionics_template_blocks` — KEEP

Template structure requires normalized blocks. The alternative — storing blocks as JSONB inside `radionics_session_templates` — makes it impossible to query "which templates use block X" or enforce block-level RLS. The normalization is correct.

**Columns for MVP:**

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `template_id` | `uuid` FK | |
| `block_code` | `text` | |
| `title` | `text` | |
| `description` | `text` | |
| `order_index` | `int2` | |
| `stage_code` | `text` | which session stage renders this block |
| `is_required` | `boolean` | |
| `show_in_session` | `boolean` | |
| `show_in_report` | `boolean` | |
| `show_in_hub` | `boolean` | |
| `is_private` | `boolean` | hidden from client portal |

---

### `radionics_template_fields` — KEEP

Fields are the atomic data-collection units of the template system. Without this table, `FieldValue` has nowhere to be validated against a schema definition. The `field_code` here is the key used in `radionics_session_details.field_values` JSONB — the two must stay in sync.

**Columns for MVP:**

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `block_id` | `uuid` FK radionics_template_blocks | |
| `field_code` | `text` | key in `field_values` JSONB |
| `label` | `text` | |
| `field_type` | `text` CHECK | must match `FieldType` TS union exactly |
| `order_index` | `int2` | |
| `is_required` | `boolean` | |
| `placeholder` | `text` | |
| `help_text` | `text` | |
| `options` | `text[]` | for `single_select` / `multi_select` |
| `show_in_session` | `boolean` | |
| `show_in_report` | `boolean` | |
| `show_in_hub` | `boolean` | |

**`field_type` CHECK constraint must enumerate all `FieldType` values:** `'short_text','long_text','number','date','single_select','multi_select','checkbox','image','audio','tool_selector','hawkins_selector'`

---

### `radionics_template_versions` — DEFER

**Reason:** No version history UI exists. No product requirement for rollback. Building an audit trail table before there is a consumer of that trail is waste.

**When to revisit:** When the template editor needs a "restore previous version" feature. At that point the schema is a `template_id` + `version_number` + `snapshot jsonb` — straightforward to add.

---

### `radionics_session_snapshots` — CREATE

This table does not exist in the current DB (or exists under an unknown name). It must be created.

**Reason:** `SessionSnapshot` is the immutable record sealed at session completion. It is the source of truth for report generation and the client portal. Without it, reports are generated from live session state — which can be mutated after the report is approved.

The snapshot also denormalizes client contact fields as they existed at session time. This is intentional: if the client changes their email after a session, the session record should reflect what was true then.

**Columns for MVP:**

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `session_id` | `uuid` FK radionics_session_details UNIQUE | one snapshot per session |
| `client_id` | `uuid` FK clients | |
| `client_name` | `text` | denormalized at seal time |
| `client_email` | `text` | denormalized at seal time |
| `client_whatsapp` | `text` | denormalized at seal time |
| `client_telegram` | `text` | denormalized at seal time |
| `client_type` | `text` | denormalized at seal time |
| `methodology_name` | `text` | denormalized at seal time |
| `methodology_code` | `text` | denormalized at seal time |
| `session_date` | `date` | |
| `intention` | `text` | |
| `hawkins_initial` | `int2` | |
| `hawkins_final` | `int2` | |
| `reverberation_days` | `int2` | |
| `tool_results` | `jsonb` | `ToolResult[]` sealed copy |
| `identified_tool_names` | `text[]` | |
| `activated_tool_names` | `text[]` | |
| `therapist_notes` | `text` | raw session notes (not report notes) |
| `voice_notes` | `jsonb` | `VoiceNote[]` — replaces `voice_transcripts` |
| `created_at` | `timestamptz` DEFAULT now() | INSERT only — never updated |

**This table is INSERT-only.** No UPDATE policy. If data is wrong, a corrected snapshot must be created and the old one soft-deleted via a `superseded_by` FK — or in the MVP, accept that corrections happen in `radionics_report_sections.content` (the editable layer) and the snapshot remains as-recorded.

---

### `radionics_reports` — KEEP

The report is the primary deliverable. Without a report record, there is nothing to share with the client.

**Columns for MVP:**

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `session_id` | `uuid` FK radionics_session_details | |
| `client_id` | `uuid` FK clients | |
| `therapist_id` | `uuid` FK auth | |
| `snapshot_id` | `uuid` FK radionics_session_snapshots | nullable — linked after snapshot is sealed |
| `status` | `text` CHECK | `'draft','in_review','approved','shared'` |
| `session_date` | `date` | |
| `intention` | `text` | |
| `summary` | `text` | |
| `hawkins_initial` | `int2` | |
| `hawkins_final` | `int2` | |
| `reverberation_days` | `int2` | |
| `tools_identified` | `text[]` | display names — denormalized |
| `tools_activated` | `text[]` | display names — denormalized |
| `final_interpretation` | `text` | |
| `therapist_notes` | `text` | private — excluded from portal |
| `next_steps` | `text` | |
| `approved_at` | `timestamptz` | |
| `shared_at` | `timestamptz` | |
| `created_at` | `timestamptz` DEFAULT now() | |
| `updated_at` | `timestamptz` DEFAULT now() | |

**Do not store `interpretations: string[]` or `recommendations: string[]`** as `text[]` columns. These belong in `radionics_report_sections` as section content. Flat arrays on the report header are a legacy shape from `Report` (v1) that `ReportV2` supersedes via sections. Use sections. The `Report.interpretations` and `Report.recommendations` fields on the frontend type should be deprecated.

**Do not store `clientName`, `methodologyName`, `methodologyCode`** — these are JOIN-derived. The `snapshot_id` FK provides the denormalized copies when needed (snapshot is the right place for them).

---

### `radionics_report_sections` — KEEP

Report editing works at the section level. Each section has independent visibility, source attribution, and editability. These properties cannot be modeled as columns on `radionics_reports` without a column-per-section explosion.

**Columns for MVP:**

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `report_id` | `uuid` FK radionics_reports | |
| `section_code` | `text` CHECK | must match `ReportSectionCode` TS union |
| `title` | `text` | |
| `content` | `text` | editable; canonical human-readable value |
| `is_read_only` | `boolean` | |
| `source_trace` | `text` CHECK | `'session_field','tool_note','voice_transcript','therapist_edit','ai_draft'` |
| `visibility` | `text` CHECK | `'included','hidden_from_client','private'` |
| `ai_draft` | `text` | original AI-generated text before therapist edits |
| `order_index` | `int2` | |
| `updated_at` | `timestamptz` DEFAULT now() | |

**Do not persist `isDirty`** — transient UI flag only.  
**Do not persist `structuredData`** — reconstructed at render time from the snapshot. Storing it would duplicate snapshot data and create a sync problem.

**`section_code` CHECK constraint must enumerate all `ReportSectionCode` values:** `'client','session_objective','hawkins_evolution','identified_tools','activated_tools','therapist_notes','final_interpretation','recommendations','reverberation','next_steps'`

---

### `client_portal_links` — KEEP

Report sharing via a token link is a core product feature. The portal is what differentiates a radionics app from a private notepad.

**Columns for MVP:**

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `report_id` | `uuid` FK radionics_reports | |
| `client_id` | `uuid` FK clients | |
| `token` | `text` UNIQUE | `gen_random_uuid()::text` or `encode(gen_random_bytes(32),'hex')` — server-generated only |
| `expires_at` | `timestamptz` | nullable = never expires |
| `revoked_at` | `timestamptz` | nullable = active |
| `accessed_at` | `timestamptz` | last access — update on each portal load |
| `created_at` | `timestamptz` DEFAULT now() | |

**Do not store `url`** — it is `${BASE_URL}/portal/${token}`, deterministic and domain-dependent. Storing it means every domain change requires a data migration.

**Token generation must be server-side** (Supabase Edge Function or Postgres function). No client-generated tokens.

**Anon RLS policy** is required and must be exact:
```
SELECT WHERE token = $token
  AND revoked_at IS NULL
  AND (expires_at IS NULL OR expires_at > now())
```
No other columns are accessible to anon. The report data itself is fetched via the `session_id` → `report_id` chain after token validation, not directly from this table.

---

### `therapist_methodology_certifications` — CREATE

This table does not exist but must be created to replace the misplaced `certification_status` column on `radionics_tables`.

**Reason:** Certification is therapist-scoped. A therapist is certified (or not) in a given methodology. That status does not belong as a column on the methodology itself, which is a global/admin-managed record.

**Columns for MVP:**

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `therapist_id` | `uuid` FK auth | |
| `methodology_id` | `uuid` FK radionics_tables | |
| `status` | `text` CHECK | `'approved','pending','not_certified'` |
| `certified_at` | `timestamptz` | nullable |
| `created_at` | `timestamptz` DEFAULT now() | |

**UNIQUE constraint on `(therapist_id, methodology_id)`.**

**RLS:** Therapist reads only their own rows. Admin manages status.

---

### `radionics_therapy_types` — REMOVE

**Reason:** No frontend type maps to this table. No page, component, or hook references it. No product feature requires it. The table is an orphan from a pre-frontend design phase.

Building a mapping to this table requires inventing a frontend feature that does not exist, which is the wrong direction. Database design must follow frontend contract, not precede it.

**Action:** Drop this table. If a therapy type / modality tagging feature is ever scoped, design it from the frontend type out and create the table then.

---

### `radionics_tool_therapy_map` — REMOVE

**Reason:** Depends on `radionics_therapy_types`, which is removed. Doubly orphaned. 

Even if `radionics_therapy_types` were kept, this junction table would have no consumer in the frontend contract. Remove along with the parent table.

**Action:** Drop this table. Confirm there are no FK constraints from `radionics_tools` to this table before dropping — if there are, they must be removed first.

---

## Final MVP Database Architecture

These are the **10 tables** that exist in the MVP. Nothing else.

```
radionics_tables                        (methodology registry)
radionics_tools                         (tool registry)
therapist_methodology_certifications    (NEW — therapist × methodology status)

clients                                 (client master record)
radionics_session_templates             (template definitions)
radionics_template_blocks               (template blocks)
radionics_template_fields               (template fields)

radionics_session_details               (live session state + header)
radionics_session_snapshots             (CREATE — immutable sealed record)

radionics_reports                       (report header)
radionics_report_sections               (report section content)
client_portal_links                     (shareable token links)
```

That is 12 tables total (10 existing/modified + 2 new: `radionics_session_snapshots` and `therapist_methodology_certifications`).

---

## Dependency Order (for seeding / migration sequencing)

```
1. radionics_tables
2. radionics_tools
3. clients
4. therapist_methodology_certifications   → depends on: radionics_tables
5. radionics_session_templates            → depends on: radionics_tables
6. radionics_template_blocks              → depends on: radionics_session_templates
7. radionics_template_fields              → depends on: radionics_template_blocks
8. radionics_session_details              → depends on: clients, radionics_tables, radionics_session_templates
9. radionics_session_snapshots            → depends on: radionics_session_details, clients
10. radionics_reports                     → depends on: radionics_session_details, clients, radionics_session_snapshots
11. radionics_report_sections             → depends on: radionics_reports
12. client_portal_links                   → depends on: radionics_reports, clients
```

---

## Deferred Table Backlog

These are not in scope for MVP. Record them here so the decision is explicit, not forgotten.

| Table | Trigger to revisit |
|---|---|
| `therapist_clients` | Second therapist needs access to a shared client |
| `radionics_session_step_results` | Step-level analytics query is required |
| `radionics_session_activations` | Audio upload to Storage is implemented |
| `radionics_template_versions` | Template editor needs version history / rollback |

---

## Non-Table Decisions (also frozen)

**`clients.therapist_id`:** Direct FK on `clients` table. Not a junction table. Revisit when multi-therapist is a real requirement.

**`Report.interpretations` / `Report.recommendations`:** Deprecated fields. Do not persist as `text[]` columns on `radionics_reports`. Content lives in `radionics_report_sections` instead. The frontend v1 `Report` type should be marked `@deprecated` in favor of `ReportV2`.

**`radionics_session_details.stages` JSONB scope:** Navigation state only. Not a duplicate of `tool_results`. The two columns have different jobs and must not contain the same data.

**`identified_tool_ids` / `activated_tool_ids`:** Maintained by a Postgres trigger on `radionics_session_details`, not by frontend writes. Frontend sends `tool_results` JSONB; the trigger derives the arrays. This is the only safe consistency guarantee.

**Timestamp authority:** `created_at` defaults to `now()` at DB level. Frontend-provided `created_at` values are ignored on INSERT. `updated_at` is maintained by a trigger, not application code.

**`structuredData` on `ReportSection`:** Not persisted. Frontend-only. Reconstructed from snapshot at render time.

**`isDirty` on `ReportSection`:** Not persisted. Frontend-only UI flag.

**`url` on `ClientPortalLink`:** Not persisted. Computed from `token` at runtime.

**Token generation:** Server-side only. Never accept a client-provided token value.
