# Radionics Data Model Audit
**Date:** 2025-05-31  
**Scope:** Frontend data model — persistence gaps, redundancies, structural design questions  
**Files analysed:** `types/index.ts`, `session-state.ts`, `template-state.ts`, `report-state.ts`, `mock-data.ts`, `workspace.tsx`, `generate.tsx`  

---

## 1. Where TemplateField values are stored during a session

### Current state
`TemplateField` defines the *schema* of a block (label, type, options, visibility flags).  
**There is no runtime store for field values.**

During a session `workspace.tsx` uses `useSessionState`, which only tracks:

| Field | Type | Stored |
|---|---|---|
| `toolResults` | `ToolResult[]` | ✅ React state |
| `hawkinsInitial` | `number \| null` | ✅ React state |
| `hawkinsFinal` | `number \| null` | ✅ React state |
| `reverbDays` | `number \| null` | ✅ React state |

All other template-defined fields (`short_text`, `long_text`, `date`, `checkbox`, `number`, `image`, `audio`) have **no value store**. The `PreparationStage` has local `useState` for `intention`, `sessionMode`, and `intentionOptions` — scoped to the component, not persisted to `sessionSnapshot`, not accessible elsewhere.

### Gap
**No `fieldValues: Record<fieldId, unknown>` map exists anywhere.** Template fields are rendered in the workspace builder UI but values collected from them are not captured, not included in `SessionStateSnapshot`, and not forwarded to `SessionSnapshot`.

### What would fix it
A `fieldValues: Record<string, FieldValue>` map in `useSessionState`, where `FieldValue` is a discriminated union keyed by `FieldType`. The snapshot would carry `field_values: Record<fieldCode, FieldValue>` to Supabase.

---

## 2. How SessionSnapshot is generated from those values

### Current state
`SessionSnapshot` (Supabase-ready, maps to `radionics_session_snapshots`) is **not generated from field values**. It is:

1. **In mock-data:** hard-coded static objects in `SESSION_SNAPSHOTS[]`
2. **In workspace:** `sessionSnapshot` (of type `SessionStateSnapshot`) is computed from `useSessionState` and passed to `ReportPreviewModal` — but this type is a *different, narrower* type than `SessionSnapshot`
3. **In generate page:** `getSnapshotBySessionId(sessionId)` reads directly from the mock array

The two snapshot types are never merged:

| Type | Fields | Used by |
|---|---|---|
| `SessionStateSnapshot` | tool_results, hawkins, reverbDays, stage_completion | workspace preview modal |
| `SessionSnapshot` | all of the above + client fields, methodology, intention, voice_transcripts, therapist_notes | report generation, report sections |

### Gap
There is **no function that constructs a `SessionSnapshot` from live session state + field values**. The report is generated from a pre-baked mock, not from what the therapist actually did during the session.

### What would fix it
A `buildSnapshotFromState(session, sessionState, fieldValues): SessionSnapshot` function. This would be called when the therapist completes the session and triggers report generation.

---

## 3. Are `identified_tool_ids` and `activated_tool_ids` redundant?

### Current state
`SessionStateSnapshot` carries both:
```ts
identified_tool_ids: string[]   // status === 'identified' || status === 'activated'
activated_tool_ids:  string[]   // status === 'activated'
```
Both are derived from `tool_results[]` via filter in `useSessionState`.

`SessionSnapshot` carries the name equivalents:
```ts
identified_tool_names: string[]
activated_tool_names:  string[]
```
Also derived. Not stored independently anywhere.

`ToolResult` itself has a deprecated `found?: boolean` that was meant to express identification but is now superseded by `status`.

### Are they redundant?

**Partially yes — but the redundancy is intentional at the persistence layer and problematic at the type layer.**

- At the **DB layer** (Supabase): denormalized arrays (`identified_tool_ids`, `activated_tool_ids`) are a valid query optimization — you can `WHERE 'tool-id' = ANY(identified_tool_ids)` without joining to `tool_results` JSONB. Acceptable.
- At the **type layer**: having both `_ids` and `_names` variants across two snapshot types with no shared derivation function creates drift risk. `identified_tool_names` in `SessionSnapshot` would go stale if `tool_results` is updated.
- `ToolResult.found` is genuinely redundant and misleadingly named. It is `@deprecated` in the type but still present in mock data (`found: true`). It should be deleted.

### Verdict
- `identified_tool_ids` / `activated_tool_ids` in `SessionStateSnapshot`: keep, useful as derived indexes
- `identified_tool_names` / `activated_tool_names` in `SessionSnapshot`: keep, but derive them from `tool_results` at snapshot-build time, not stored independently
- `ToolResult.found`: **remove**. Has no value — `status !== 'not_analyzed'` covers the same intent

---

## 4. Do `therapist_notes` belong in `SessionSnapshot` or `ReportSection`?

### Current state
`therapist_notes` appears in **both**:

| Location | Type | Visibility | Mutable? |
|---|---|---|---|
| `SessionSnapshot.therapist_notes?: string` | flat string | implicit private | no (snapshot = sealed) |
| `ReportSection` where `code === 'therapist_notes'` | `ReportSection.content: string` | `visibility: 'private'` | yes, via `updateSectionContent` |

In `buildReportSections()` (`mock-data.ts`), the snapshot's `therapist_notes` seeds the `therapist_notes` section's `content`. So `SessionSnapshot` is the source of truth at generation time, and `ReportSection` is the editable copy.

### Is this the right design?

**Yes, with one caveat.**

- `SessionSnapshot` should be **immutable after the session closes**. It records what happened. `therapist_notes` in the snapshot captures the raw notes taken *during* the session (possibly via voice or quick text).
- `ReportSection.therapist_notes` is the *polished* version — the therapist can rewrite, expand, or redact before sharing.
- This is the correct separation: **session artifact vs. report editorial**.

### Caveat
The snapshot's `therapist_notes` is a flat `string`. If the therapist records multiple voice notes across the session, all would need to be concatenated into this field. That flattening loses temporal context and note-source attribution.

### Recommendation
Keep `therapist_notes` in **both** locations, but clarify intent:
- Rename `SessionSnapshot.therapist_notes` → `session_notes_raw?: string` to signal it's unedited
- Keep `ReportSection.therapist_notes.content` as the editable report field
- Document the seeding relationship explicitly in code

---

## 5. Should `voice_transcripts` become structured `VoiceNote[]`?

### Current state
`SessionSnapshot.voice_transcripts?: string[]` — a flat array of transcript strings with no metadata.

`VoiceNote` type already exists:
```ts
interface VoiceNote {
  id: string;
  transcript: string;
  durationSeconds: number;
  createdAt: string;
}
```

`ToolResult.voiceNotes?: VoiceNote[]` — tool-scoped voice notes, already structured.

`SessionSnapshot` has no equivalent — it degrades to `string[]`.

### Problem
`voice_transcripts: string[]` loses:
- Which tool the note was for (or whether it was global)
- When it was recorded (sequence matters for session narrative)
- Duration (affects how much information is likely in the note)
- Whether the transcript was auto-generated or corrected

This information exists in `ToolResult.voiceNotes[]` during the session but is **not forwarded to `SessionSnapshot`**.

### Verdict: Yes — replace `voice_transcripts: string[]` with `voice_notes: VoiceNote[]`

Also add an optional `toolId?: string` on `VoiceNote` so tool-scoped and session-global notes can coexist in a single flat list, ordered by `createdAt`.

Proposed shape for `SessionSnapshot`:
```ts
voice_notes?: Array<VoiceNote & { toolId?: string; toolName?: string }>;
```

This makes the field additive (no breaking rename needed for currently null fields) and enables the AI draft pipeline to use voice note content with full context.

---

## 6. Should `ReportSection.content` remain `string` or become structured JSON?

### Current state
`ReportSection.content: string` — plain text/newline-delimited.

The `buildReportSections` function populates several sections with structured data collapsed into strings:
```ts
// hawkins_evolution
content: `Nível inicial: ${snapshot.hawkins_initial}\nNível final: ${snapshot.hawkins_final ?? 'Não registado'}`

// identified_tools
content: snapshot.identified_tool_names.join('\n')
```

### Arguments for structured JSON

| Section | Ideal structure | Current |
|---|---|---|
| `hawkins_evolution` | `{ initial: number, final: number, delta: number }` | `"Nível inicial: 150\nNível final: 310"` |
| `identified_tools` | `ToolResult[]` | `"Anti Magia\nLuxor\nKarma"` |
| `activated_tools` | `ToolResult[]` | `"Anti Magia\nLuxor"` |
| `client` | `{ name, email, whatsapp }` | `"Maria Silva\nmaria@email.com"` |
| `reverberation` | `{ days: number }` | `"Período de reverberação: 21 dias"` |

### Arguments for keeping `string`

- The section editor (`detail.tsx`) renders a `<textarea>` — it needs a string
- PDF export also expects string content
- Structured sections (`hawkins_evolution`, `identified_tools`, `activated_tools`, `client`) are **already `isReadOnly: true`** — they are display-only
- Converting to JSON would require a render layer per `ReportSectionCode` in every consumer (detail, preview, pdf)

### Verdict: Split by `isReadOnly`

Do not change `content: string` on editable sections. For read-only sections, introduce an optional `structuredData` field:

```ts
interface ReportSection {
  code: ReportSectionCode;
  content: string;              // always present — for editors, PDF, plain text fallback
  isReadOnly: boolean;
  structuredData?: unknown;     // for read-only sections — typed per code
  // ...
}
```

This is additive, non-breaking, and enables richer rendering of `hawkins_evolution` (chart/bar), `identified_tools` (tool cards), etc. without changing the string pipeline.

Alternatively, wait until a rendering layer is needed before adding `structuredData`. The current `string` approach is not wrong — it is premature to structure data that has no structured consumer yet.

---

## Summary Table

| Question | Finding | Severity | Action |
|---|---|---|---|
| TemplateField value storage | No store exists at all | **Critical** | Add `fieldValues` map to `useSessionState` |
| SessionSnapshot generation | Not generated from live state | **Critical** | Build `buildSnapshotFromState()` function |
| `identified_tool_ids` vs `activated_tool_ids` | Redundant but intentional for query perf | Low | Keep; remove `ToolResult.found` |
| `therapist_notes` location | Correct dual-location pattern | None | Rename snapshot field for clarity |
| `voice_transcripts: string[]` | Degrades `VoiceNote` data | **Medium** | Replace with `VoiceNote[]` + optional `toolId` |
| `ReportSection.content` type | String is fine for editable sections | None | Add `structuredData?: unknown` for read-only sections when a richer consumer exists |

---

## Critical Path for Persistence

When Supabase is wired, the minimum viable persistence contract requires:

```
Template (definition)
  └─ TemplateBlock[]
       └─ TemplateField[]

Session (header + status)
  └─ FieldValues: Record<fieldCode, FieldValue>    ← MISSING
  └─ SessionStateSnapshot (tool_results, hawkins)  ← exists, in-memory only

SessionSnapshot (sealed at session close)           ← exists as type, no builder
  └─ voice_notes: VoiceNote[]                      ← replace voice_transcripts

Report
  └─ ReportSection[]                               ← exists
       └─ structuredData? (read-only sections)     ← optional future
```

The two critical gaps — field value storage and snapshot construction — block any meaningful persistence implementation.
