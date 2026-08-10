# Radionics Frontend Persistence Contract

> Phase 6 — defines the data contract between live session state, snapshot serialisation, and report generation.

---

## Overview

The frontend maintains two distinct snapshot shapes, both designed to map 1-to-1 onto future Supabase tables:

| Shape | Table (future) | Purpose |
|---|---|---|
| `SessionStateSnapshot` | `radionics_session_details` | Live mutable state during a session |
| `SessionSnapshot` | `radionics_session_snapshots` | Immutable record at session completion |

All field names use `snake_case` to match the DB column convention.

---

## Types

### `FieldValue`

Discriminated union keyed by `FieldType`. Consumers narrow without casting:

```ts
type FieldValue =
  | { type: 'short_text';        value: string }
  | { type: 'long_text';         value: string }
  | { type: 'number';            value: number }
  | { type: 'date';              value: string }          // ISO date string
  | { type: 'single_select';     value: string }
  | { type: 'multi_select';      value: string[] }
  | { type: 'checkbox';          value: boolean }
  | { type: 'image';             value: string }          // URL or data URI
  | { type: 'audio';             value: string }          // URL
  | { type: 'tool_selector';     value: string[] }        // toolIds
  | { type: 'hawkins_selector';  value: number };
```

### `VoiceNote`

Extended to carry optional tool context and audio URL:

```ts
interface VoiceNote {
  id: string;
  transcript: string;
  durationSeconds: number;
  createdAt: string;
  toolId?: string;    // tool the note was recorded against
  toolName?: string;
  audioUrl?: string;  // blob URL (browser) or remote URL (persisted)
}
```

### `ToolResult`

`found?: boolean` has been **removed**. Derive presence from `status`:

```ts
// ✅ correct
const isPresent = result.status === 'identified' || result.status === 'activated';

// ❌ do not use — field no longer exists
const isPresent = result.found;
```

### `SessionStateSnapshot`

Live state shape. Produced by `useSessionState` and `buildSnapshotFromState`:

```ts
interface SessionStateSnapshot {
  session_id: string;
  hawkins_initial: number | null;
  hawkins_final: number | null;
  reverberation_days: number | null;
  tool_results: ToolResult[];
  identified_tool_ids: string[];
  activated_tool_ids: string[];
  field_values: Record<string, FieldValue>;  // fieldCode → FieldValue
  stage_completion: Record<string, boolean>;
  updated_at: string;
}
```

### `SessionSnapshot`

Immutable completion record. `voice_transcripts` has been **replaced** by `voice_notes`:

```ts
interface SessionSnapshot {
  // ... client + session fields ...
  voice_notes?: VoiceNote[];   // replaces voice_transcripts: string[]
}
```

### `ReportSection`

`structuredData?: unknown` added for read-only sections (`isReadOnly: true`). This carries the raw session facts that generated the `content` string, enabling consumers (e.g. a future PDF renderer) to re-render without re-parsing text:

```ts
interface ReportSection {
  // ...
  structuredData?: unknown;  // only set when isReadOnly === true
}
```

Read-only sections that carry `structuredData`:

| `code` | `structuredData` shape |
|---|---|
| `client` | `{ client_id, client_name, client_email, client_whatsapp, client_telegram, client_type }` |
| `hawkins_evolution` | `{ hawkins_initial, hawkins_final }` |
| `identified_tools` | `{ tool_results: ToolResult[], identified_tool_names: string[] }` |
| `activated_tools` | `{ tool_results: ToolResult[], activated_tool_names: string[] }` |

---

## State Hook — `useSessionState`

File: `packages/web/src/web/lib/session-state.ts`

### New additions

```ts
interface SessionState {
  fieldValues: Record<string, FieldValue>;
  setFieldValue: (fieldId: string, value: FieldValue) => void;
  getFieldValue: (fieldId: string) => FieldValue | undefined;
  // ... existing fields unchanged ...
}
```

`fieldValues` is included in the computed `sessionSnapshot.field_values`.

### Usage

```ts
const { setFieldValue, getFieldValue } = useSessionState(session);

// Write
setFieldValue('hawkins_initial', { type: 'hawkins_selector', value: 200 });
setFieldValue('intention', { type: 'long_text', value: 'Equilíbrio emocional...' });

// Read (narrowing)
const fv = getFieldValue('hawkins_initial');
if (fv?.type === 'hawkins_selector') {
  console.log(fv.value); // number — no cast needed
}
```

---

## Pure Helpers — `snapshot-builder.ts`

File: `packages/web/src/web/lib/snapshot-builder.ts`

No React dependency. Use in report generation, export, or test paths.

### `buildSnapshotFromState`

Builds a `SessionStateSnapshot` from raw values:

```ts
const snapshot = buildSnapshotFromState({
  sessionId: session.id,
  hawkinsInitial: 150,
  hawkinsFinal: 310,
  reverbDays: 21,
  toolResults,
  fieldValues,
  stageCompletion,
});
```

### `buildSessionSnapshot`

Builds a `SessionSnapshot` (completion record) from `Session` + `Client` objects:

```ts
const snapshot = buildSessionSnapshot(session, client, toolResults, {
  therapistNotes: '...',
});
```

---

## Migration Notes

### Removed: `voice_transcripts: string[]`

**Before:**
```ts
snapshot.voice_transcripts?.forEach(t => console.log(t));
```

**After:**
```ts
snapshot.voice_notes?.forEach(note => {
  console.log(note.transcript);
  if (note.toolName) console.log(`Tool: ${note.toolName}`);
});
```

### Removed: `ToolResult.found`

**Before:**
```ts
{ toolId: 't35-01', ..., status: 'identified', found: true }
```

**After:**
```ts
{ toolId: 't35-01', ..., status: 'identified' }
```

The `found` field no longer exists on `ToolResult`. Any code that checks `result.found` will produce a TS error — use `result.status === 'identified' || result.status === 'activated'` instead.

---

## File Map

```
packages/web/src/web/
├── types/index.ts              — all type definitions (source of truth)
├── lib/
│   ├── session-state.ts        — useSessionState hook (FieldValue state added)
│   ├── snapshot-builder.ts     — pure snapshot builders (NEW)
│   └── mock-data.ts            — mock data (voice_transcripts → voice_notes, found removed)
└── pages/
    └── reports/
        └── generate.tsx        — uses voice_notes; buildSnapshotFromState imported
```
