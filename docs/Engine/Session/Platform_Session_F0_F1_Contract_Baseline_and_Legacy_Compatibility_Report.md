# Platform Session F0-F1 — Contract Baseline and Legacy Compatibility Report

**Status:** F0 + F1 complete (platform domain contracts + characterization only)  
**Date:** 2026-08-06  
**Revision:** F0+F1 limited correction (host contract, session facts alignment, session-scoped active invariant, sealed archive immutability)  
**Scope:** Contract freeze, characterization tests, methodology-neutral platform session domain  
**Authority:** Product docs 00–04 (read-only; not modified)

This unit does **not** complete the overall Platform Session Experience. Persistence, workspace UI, and methodology implementation remain deferred. **F2 was not started.**

---

## 1. Inspected baseline

Inspected before additive changes:

| Area | Paths |
|------|--------|
| Product authority | `docs/AGENTS.md`, `docs/Product/00`–`04` |
| Session / client types | `src/types/index.ts` (`Session`, `SessionStatus`, `Client`, `ToolResult`, snapshots) |
| Session / client services | `src/services/sessionsService.ts`, client services |
| Session creation | `src/pages/sessions/NewSessionPage.tsx`, wizard helpers |
| Workspace | `src/pages/sessions/WorkspacePage.tsx` (not modified) |
| Workspace helpers | `src/lib/sessionWorkspace.ts`, `src/lib/session-state` |
| Workflow adapter | `src/lib/workflow-adapter/*` (init, persist, legacy bridge, stage completion) |
| Snapshot / reports | `toLegacySessionSnapshot`, snapshot builder consumers |
| Validation pattern | `src/lib/workflow-adapter/validateV30d2.ts`, `scripts/validate-v30d2-*.mjs` |
| Package scripts | `package.json` (no Vitest; assert runners via `tsx`) |

**Legacy reality notes:**

- Legacy `SessionStatus` still includes `reported` — retained for current app behaviour.
- Platform lifecycle deliberately excludes `reported`; reporting has a separate lifecycle.
- Mesa 35 workflow adapter remains the rich reference consumer, not the permanent platform architecture.
- Product adapter sketch mentions ReactNode; platform F1 host contract is **framework-neutral** (no React).

---

## 2. Classification — preserve / adapt / legacy / replace-later

| Component | Classification | Notes |
|-----------|----------------|-------|
| `Session` / `sessionsService` / mock store | **preserve** | Current app behaviour unchanged |
| `SessionStatus` including `reported` | **legacy compatibility** | Do not remove; platform uses new statuses |
| `Client.name` single field | **legacy compatibility** | Platform splits `displayName` / `fullName` |
| `normalizeSessionWorkspace` / `cloneToolResults` | **preserve** | Characterized |
| Workflow adapter | **preserve** (temporary consumer) | Characterized |
| `WorkspacePage` Mesa 35 UI | **replace-later** | Not modified in F0/F1 |
| Report snapshot via `toLegacySessionSnapshot` | **preserve** / **adapt later** | Characterized |
| Session Plan / archive / notes / timeline (new) | **new platform** | Additive under `src/platform/session` |
| Supabase session tables | **deferred** | Not touched |

---

## 3. New / updated contract locations

All under `src/platform/session/` (methodology-neutral; no Mesa 35 therapeutic imports):

| Module | Responsibility |
|--------|----------------|
| `types.ts` | Domain contracts, including `MethodologyWorkspaceHostContract`, assembly vs sealed archive |
| `lifecycle.ts` | Centralized fail-closed session lifecycle |
| `testimony.ts` | Identity + testimony snapshot |
| `sessionPlan.ts` | Session Plan vs invocations |
| `methodologyExecution.ts` | Execution records + **sessionId-scoped** one-active invariant |
| `methodologyWorkspace.ts` | Declarative capability **and** operational host contract |
| `notes.ts` | Notes + dispositions |
| `transcript.ts` | Capture/segment boundary only |
| `timeline.ts` | Append-oriented timeline |
| `reportContributions.ts` | Reportable contributions |
| `archive.ts` | In-assembly vs sealed canonical archive |
| `reportProjection.ts` | Projection + immutable approved rendition |
| `immutability.ts` | deepClone / deepFreeze / immutableClone |
| `repositories.ts` | Interfaces only; `PlatformSessionRecord` ≡ `PlatformSessionFacts` + timezone |
| `index.ts` | Public surface |
| `validatePlatformSessionF0F1.ts` | F0 characterization + F1 invariant tests |

Launcher: `scripts/validate-platform-session-f0-f1.mjs`  
npm script: `validate:platform-session-f0-f1`

---

## 4. Invariants implemented (including F0+F1 correction)

1. Session lifecycle: `draft → in_progress ⇄ paused → closing → completed`, plus `cancelled` terminals; `closing → in_progress` allowed; invalid transitions fail closed.
2. `reported` is **not** a platform session status.
3. Report lifecycle independent from session lifecycle.
4. Testimony requires distinct `displayName` and `fullName` (+ DOB, address, locality, country); contacts optional.
5. Historical testimony separable from later profile edits.
6. Session Plan ≠ workflow template ≠ report template; unplanned invocations allowed.
7. **At most one `active` methodology execution per `sessionId`.** Active executions in different sessions do not conflict.
8. Execution state opaque, versioned, clone-isolated.
9. Methodology capability / host contract may omit stages, visuals, progress, completion, navigation, timeline, contributions.
10. **Operational host contract** requires identity + isolated state + `serializeState`; optional navigation/progress/completion/timeline/contributions; no React.
11. Notes support private / review_for_report / included_in_report + provenance.
12. Timeline classifies platform / methodology / therapist only.
13. Contributions carry provenance + inclusion; not approved report sections.
14. Archive never binds to a report template as data authority.
15. **`SessionArchiveAssembly` vs `SealedCanonicalSessionArchive`:** sealed completed-session archive requires testimony + sealing; sealed objects and approved renditions are domain-immutable (clone + freeze; input mutation isolated).
16. **`PlatformSessionRecord` aligned with `PlatformSessionFacts`:** modality, intention, scheduling, `activeExecutionId`, `accumulatedActiveDurationMs`, lifecycle timestamps (+ optional `schedulingTimezone`).
17. Scheduling metadata is not lifecycle state.

---

## 5. Characterization coverage (F0)

Protected existing behaviour:

- Workflow-state initialization (`createEmptyWorkflowState`, `initializeWorkflowStateForSession`)
- Persistence preparation (`prepareWorkflowPersist`)
- Workflow ↔ legacy round-trip (`hydrate` / `sync`)
- `normalizeSessionWorkspace`
- `cloneToolResults` isolation (including `voiceNotes`)
- `computeAdapterStageCompletion`
- `toLegacySessionSnapshot` shape for reports
- `CreateSessionInput` metadata required by workflow sessions

---

## 6. Compatibility seams

- **Legacy `reported`:** remains on `SessionStatus`; platform uses `PlatformSessionLifecycleStatus` + `PlatformReportLifecycleStatus`.
- **Legacy `Client.name`:** unchanged; platform `ClientIdentityProfile` is additive.
- **Current services:** not replaced; repository interfaces are forward-looking only.
- **`MethodologyWorkspaceCapability`:** retained as declarative flags; complemented by `MethodologyWorkspaceHostContract` (operational, framework-neutral).
- **Product ReactNode adapter sketch:** not implemented; host contract stays framework-neutral.
- **Mock transcript / workspace behaviour:** not removed.
- **No WorkspacePage seam** in this unit.

---

## 7. Tests and commands

```bash
npm run validate:platform-session-f0-f1
npm run typecheck
npm run lint
npm run build
node scripts/validate-v30d2-workflow-adapter.mjs
```

Assertion count (current correction): **151** (`PASSED assertions: 151`).

---

## 8. Deferred work (explicit)

- Supabase migrations, RLS, generated types, any DB writes
- Workspace visual reconstruction / responsive UI / WorkspacePage
- Session creation UI changes
- MAP / 35 Graphs redesign / 49 Angels implementation
- PX-402 / PX-403 detailed UX
- Notes UI, audio recording, transcription, consent UI
- Live Report UI, PDF generation, archive persistence/sealing transactions
- Replacing legacy session services with platform repositories
- **F2 and later platform session units**

---

## 9. Confirmation

| Constraint | Status |
|------------|--------|
| Product documents unmodified | Yes |
| No Supabase migration or write | Yes |
| No UI reconstruction / WorkspacePage | Yes |
| No methodology implementation | Yes |
| No deployment | Yes |
| No commit or push (unless owner requests) | Yes |
| F2 not started | Yes |

**Verdict for this unit only:** F0 + F1 complete — ready for owner review (post-correction).  
**Overall Platform Session Experience:** not complete.
