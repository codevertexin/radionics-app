---
title: RADIONICS — Platform Session Implementation Readiness
document_id: RADIONICS-PLATFORM-SESSION-IMPLEMENTATION-READINESS
version: 1.0
status: APPROVED
classification: Technical Readiness and Migration Plan
owner: Product Owner
author: CodeVertex Innovations, LLC
last_updated: 2026-08-06
depends_on:
  - RADIONICS-PRODUCT-CONSTITUTION
  - RADIONICS-PLATFORM-UX-BACKLOG
  - RADIONICS-PRODUCT-DECISIONS
  - RADIONICS-PLATFORM-SESSION-EXPERIENCE
language: English
---

# RADIONICS — Platform Session Implementation Readiness

## 1. Purpose

This document evaluates the current RADIONICS application and Supabase baseline against the approved Platform Session Experience.

It defines:

- what may be preserved;
- what must be adapted;
- what must be replaced;
- the target platform boundaries;
- the required persistence capabilities;
- the safe migration sequence;
- implementation gates and validation criteria.

This is a readiness document. It does not authorize application-code changes, database writes, production deployment or methodology implementation.

## 2. Authority

Implementation must obey the following order:

1. `Product/00_Product_Vision_&_Experience_Constitution.md`;
2. `Product/01_Platform_UX_Backlog.md`;
3. `Product/02_Product_Decisions.md`;
4. `Product/03_Platform_Session_Experience.md`;
5. methodology experience backlogs;
6. implementation tasks.

Earlier technical documents remain informative only where compatible with this hierarchy.

## 3. Executive Verdict

**Verdict: ARCHITECTURALLY FEASIBLE — FOUNDATION RECONCILIATION REQUIRED BEFORE UI IMPLEMENTATION.**

The current prototype contains valuable methodology, resource, workflow, certification and visual assets. These should be preserved.

The current session experience is not ready to become the permanent platform shell because:

- clients and sessions are still stored in memory;
- no operational session persistence schema exists in the supplied Supabase migrations;
- session state assumes one methodology per session;
- session creation requires a workflow or legacy template before the session exists;
- client identity is insufficient for testimony-ready sessions;
- session lifecycle omits `closing` and `cancelled` and incorrectly includes `reported`;
- report structures are coupled to a predefined therapeutic shape;
- the workspace combines platform shell and Mesa 35 behaviour in one large page;
- session notes, transcript, timeline and live-report contributions lack independent canonical persistence;
- mobile behaviour has no explicit safe-continuity boundary.

Direct visual reconstruction of the existing `WorkspacePage` would preserve the wrong ownership boundaries. The platform foundation must be introduced first.

## 4. Evidence Baseline

The review covered the supplied:

- Vite React TypeScript application;
- Supabase migration set;
- repository technical documentation;
- Product authority documents;
- Platform Session Experience;
- current dashboard and workspace references.

Observed technical baseline:

| Area | Current state | Readiness consequence |
|---|---|---|
| Frontend | React, TypeScript, Vite, React Router, TanStack Query | Reusable foundation |
| Authentication | Supabase authentication available | Reusable with session RLS |
| Specialties and certification | Supabase-backed | Reusable eligibility source |
| Methodology catalogue | Supabase-backed tools, assets and knowledge | Preserve |
| Workflow engine | Versioned workflow templates and ordered steps | Preserve as methodology capability |
| Clients | In-memory store | Must be persisted before platform sessions |
| Sessions | In-memory store | Must be replaced by canonical repository |
| Reports | Primarily mock/state-driven | Requires archive-projection reconciliation |
| Session workspace | Monolithic, Mesa 35-aware page | Decompose and adapt |
| Session archive | Type-level concept only; no supplied operational table | Must be materialized |

## 5. Current Asset Classification

### 5.1 Preserve

The following capabilities are compatible with the target platform when kept within their proper boundary:

- application authentication and authenticated routing;
- approved-specialty and certification checks;
- methodology tools, assets, media and knowledge content;
- workflow template versioning;
- workflow step definitions;
- workflow-state initialization and persistence preparation logic;
- methodology resource services;
- React Query infrastructure;
- established visual tokens, controls and general dark visual identity;
- dashboard, session-list and client-list concepts;
- explicit mock/Supabase environment separation during migration.

### 5.2 Adapt

The following capabilities contain reusable logic but require new ownership boundaries:

| Current capability | Required adaptation |
|---|---|
| `NewSessionPage` | Reorder to Client → Primary Methodology → Preparation → Confirmation |
| `Session` type | Split platform session, methodology executions and projections |
| `sessionsService` | Replace in-memory implementation behind a stable repository contract |
| `clientsService` | Persist testimony-ready client identity and optional contacts |
| workflow engine | Treat each workflow run as a methodology execution, not the session itself |
| workflow adapter | Become a methodology adapter behind the workspace contract |
| session snapshot builder | Expand into canonical archive assembly independent of report templates |
| report state | Consume archive contributions through report projections |
| dashboard | Remove universal Hawkins assumptions and use platform status only |
| responsive styles | Add explicit supported-device and safe-continuity rules |

### 5.3 Replace or Retire

The following structures are incompatible as permanent platform foundations:

- universal fixed stages: Preparation, Connection, Diagnosis, Activations and Closing;
- `reported` as a session status;
- one `methodologyId` as the complete model of a multi-methodology session;
- mandatory session template selection as session creation architecture;
- a report schema with universal Hawkins, tools, activations and reverberation fields;
- report-generation reads directly from mutable live session state;
- mock transcription presented as real capture;
- methodology logic embedded directly in the platform workspace page;
- page-local timers as the only authority for therapeutic elapsed time.

Legacy structures may remain temporarily behind compatibility adapters until migrated. They must not shape the new platform contracts.

## 6. Confirmed Product-to-Code Gaps

### 6.1 Session Lifecycle

Current frontend status:

`draft | in_progress | paused | completed | reported`

Required platform status:

`draft → in_progress ⇄ paused → closing → completed`

Alternative terminal transition:

`draft | in_progress | paused → cancelled`

Required change:

- add `closing` and `cancelled`;
- remove `reported` from session lifecycle;
- preserve reporting as an independent lifecycle;
- enforce transition rules in the domain/repository layer, not only in buttons;
- store timestamps for creation, start, pause/resume accounting, closing, completion and cancellation.

### 6.2 Session Creation

Current order:

`Specialty → Session Type/Template → Client → Confirmation`

Required order:

`Client → Primary Methodology → Preparation → Confirmation`

Gaps:

- no new-client creation within the flow;
- contacts and testimony identity are incomplete;
- template selection conflates Session Plan and Report Template;
- creation immediately navigates to the workspace without a distinct explicit start boundary;
- initial identity snapshot is not captured at start.

### 6.3 Client Context

Current client type has `name`, optional email, WhatsApp, Telegram, phone and birth date.

Required testimony-ready identity:

- display name;
- full name;
- date of birth;
- address;
- locality;
- country;
- postal code where applicable;
- optional phone;
- optional WhatsApp;
- optional email.

The current `name` field must not be silently reinterpreted as both display name and legal/full name.

### 6.4 Platform Header

The target header requires stable platform identity, client context, intention, active therapeutic time, listening state and lifecycle actions.

Current workspace fragments these concerns and keeps some timer/listening behaviour locally. There is no durable timing ledger or canonical capture state.

### 6.5 Workspace Ownership

`WorkspacePage.tsx` is approximately 2,125 lines and directly imports Mesa 35 assets, Hawkins values, tool status models, activation copy and workflow diagnostics.

This is the primary structural risk.

Required decomposition:

- Platform Session Shell;
- Session Header;
- Platform Sidebar;
- Methodology Workspace Host;
- Session Companion Panel;
- methodology adapter(s);
- session state/repository services.

### 6.6 Session Journey

Current session state describes one specialty/methodology and one workflow.

Required capability:

- one primary methodology execution;
- zero or more complementary executions;
- exactly one active execution at a time;
- preservation of each execution's independent state;
- pause, resume and consult behaviour;
- invocation during a session even when not included in the initial Session Plan.

Detailed therapeutic transition rules remain deferred to PX-402/PX-403. The data and shell foundations must support them now.

### 6.7 Notes, Transcript and Timeline

Current notes and voice data are embedded in steps or tool results. The workspace also contains mock transcript behaviour.

Required separation:

- session notes as independent records;
- optional methodology-execution context;
- written, dictated or transcript-excerpt origin;
- private/review-for-report/included disposition;
- transcript capture sessions and segments;
- explicit listening state and consent boundary;
- meaningful append-only timeline events;
- no timeline noise from clicks or autosave.

### 6.8 Session Archive and Reports

Current types anticipate `SessionSnapshot`, but its structure is methodology-specific and incomplete. Supplied migrations do not create the operational archive and report foundation.

The approved model requires:

`Live Session Data → Canonical Session Archive → Report Projection → Approved Report Rendition`

The archive must not depend on the chosen report template.

Changing a report template must never mutate:

- client identity captured for the session;
- session facts;
- methodology execution records;
- notes or transcript evidence;
- timeline history;
- previous approved report versions.

## 7. Target Architecture

### 7.1 Layer Boundaries

#### Platform Session Domain

Owns:

- lifecycle;
- timing;
- client testimony snapshot;
- intention;
- session plan;
- active methodology execution;
- notes;
- transcript metadata;
- timeline;
- reportable contributions;
- closing review;
- archive sealing.

#### Methodology Execution Domain

Owns:

- methodology identity and version;
- isolated state;
- internal navigation;
- methodology-defined progress;
- methodology events;
- reportable contributions.

#### Report Domain

Owns:

- report-template selection;
- projection rules;
- therapist inclusion/edit choices;
- report draft lifecycle;
- approval;
- immutable approved renditions;
- sharing.

#### Presentation Layer

Owns:

- desktop/tablet platform shell;
- safe mobile continuity;
- responsive panels;
- persistence feedback;
- loading, empty and error states.

### 7.2 Permanent Frontend Composition

Recommended component boundary:

```text
PlatformSessionRoute
  SessionProvider
    PlatformSessionShell
      SessionHeader
      PlatformSidebar
      MethodologyWorkspaceHost
        ActiveMethodologyAdapter
      SessionCompanionPanel
        SessionJourney
        NotesPanel
        LiveReportPanel
        TimelinePanel
      SessionClosingFlow
```

The component names are recommendations, not canonical public API names. The ownership boundaries are mandatory.

### 7.3 Methodology Adapter Contract

Each methodology integration should expose a stable adapter equivalent to:

```ts
interface MethodologyWorkspaceAdapter {
  identity: MethodologyIdentity;
  renderWorkspace(context: MethodologyExecutionContext): ReactNode;
  getNavigation?(): MethodologyNavigationItem[];
  getProgress?(): MethodologyProgress;
  getCompletionAwareness?(): CompletionAwareness;
  serializeState(): unknown;
  emitTimelineEvent(event: MethodologyTimelineInput): void;
  emitReportContribution(contribution: ReportContributionInput): void;
}
```

Only identity, workspace content and isolated serializable state are required. All other capabilities are optional.

The platform must not inspect Mesa 35 fields to decide generic platform behaviour.

## 8. Persistence Capability Model

The following conceptual stores are required. Exact SQL names and normalization must be validated during database design.

| Capability | Purpose | Key rule |
|---|---|---|
| Clients | Current client profile | Therapist-scoped; contacts optional |
| Sessions | Platform lifecycle and current context | No report status; no methodology-specific columns |
| Client testimony snapshots | Identity as captured at explicit start | Immutable after start except explicit governed correction |
| Session plan items | Initially intended methodologies | Distinct from executions and report templates |
| Methodology executions | Each invoked table/methodology | Multiple per session; one active at a time |
| Execution state | Versioned/serializable methodology state | Opaque to platform where possible |
| Session notes | Therapist-authored evidence | Independent inclusion disposition |
| Transcript captures/segments | Optional listening/transcription record | Explicit start/stop and privacy boundary |
| Timeline events | Meaningful audit and therapeutic history | Append-oriented; no click noise |
| Report contributions | Structured candidates emitted during session | Preserve source and methodology context |
| Session archives | Sealed canonical session record | Independent of report template |
| Report projections | Template applied to one archive | Regenerable until approved |
| Approved report renditions | Therapist-approved output | Immutable/versioned |

### 8.1 Session Record

The platform session record should contain only cross-methodology facts, including:

- session ID;
- therapist ID;
- client ID;
- lifecycle status;
- session mode;
- intention;
- scheduled metadata;
- current active execution ID;
- accumulated active duration;
- started/closing/completed/cancelled timestamps;
- created/updated metadata.

It must not contain universal Hawkins, chakra, graph, angel, activation or reverberation columns.

### 8.2 Methodology Execution

Each execution should preserve:

- session ID;
- methodology/specialty identity;
- role: primary or complementary;
- sequence/invocation order;
- adapter/version identity;
- execution status;
- isolated state payload;
- started, paused, resumed and completed timestamps;
- optional completion-awareness payload.

The current workflow state can be retained as one execution-state format.

### 8.3 Canonical Session Archive

At completion, archive sealing should assemble a versioned envelope containing:

- platform session facts;
- testimony identity snapshot;
- all methodology executions and their preserved outputs;
- notes and their dispositions;
- transcript metadata and permitted transcript content;
- timeline events;
- reportable contributions;
- provenance and schema versions;
- sealing timestamp.

The archive must preserve more information than any single report displays.

### 8.4 Report Projection

A report template defines presentation and selection rules, not session-data collection.

Projection must:

- read from a sealed archive;
- expose all eligible archived fields;
- organize fields into template sections;
- allow therapist inclusion/exclusion and editing;
- retain source trace;
- preserve therapist edits separately from archive facts;
- create a new immutable rendition on approval.

## 9. Data Integrity and Security Requirements

Before implementation, database design must define:

- therapist ownership and RLS for every session-derived entity;
- allowed lifecycle transitions;
- one-active-execution invariant;
- idempotent start, pause, resume, closing and completion commands;
- optimistic concurrency or revision control for autosave;
- immutable archive sealing;
- immutable approved report versions;
- transcript/audio access and retention controls;
- cascade/restrict behaviour;
- cancellation preservation rules;
- migration treatment of legacy mock or future persisted sessions.

No service-role credential may be used in the browser.

## 10. Responsive Architecture

### 10.1 Supported Full Workspace

The full therapeutic workspace targets:

- desktop and laptop;
- landscape and sufficiently wide portrait tablet;
- minimum supported full-workspace width of approximately 768 CSS pixels, subject to implementation validation.

### 10.2 Adaptive Behaviour

At narrower supported widths:

- the fixed header retains essential client, time and lifecycle information;
- the platform sidebar may collapse to icons or a drawer;
- the companion panel becomes an overlay/drawer;
- the methodology workspace keeps the maximum available area;
- no permanent three-column squeeze is allowed.

### 10.3 Phone Safe Continuity

Phones do not receive the compressed full therapeutic workspace.

They may safely support:

- viewing session identity and status;
- pausing or leaving safely;
- reviewing basic notes or timeline where appropriate;
- clear instruction to continue the full workspace on desktop or tablet.

Methodology analysis and dense resource interaction must not be forced onto phone layouts.

## 11. Implementation Sequence

### Foundation F0 — Contract Freeze and Baseline Tests

Deliver:

- approved readiness document;
- characterization tests for existing workflow/resource capabilities;
- explicit legacy compatibility inventory;
- implementation feature breakdown;
- no visual reconstruction yet.

Exit gate:

- existing valuable methodology behaviour is protected by tests;
- platform and methodology ownership boundaries are accepted.

### Foundation F1 — Platform Domain Contracts

Deliver:

- lifecycle state machine;
- client/testimony identity contracts;
- session plan contract;
- methodology execution contract;
- notes, transcript, timeline and contribution contracts;
- archive and report-projection contracts;
- repository interfaces independent of mock/Supabase implementation.

Exit gate:

- contracts contain no methodology-specific fields;
- transition and invariants tests pass.

### Foundation F2 — Supabase Persistence

Deliver additive migrations and RLS for:

- client profile expansion;
- sessions;
- testimony snapshots;
- plan items;
- methodology executions and execution state;
- notes;
- timeline;
- transcript metadata/segments as authorized;
- report contributions;
- archives and report projections.

Exit gate:

- migrations apply cleanly on a fresh database;
- RLS isolation is validated with at least two therapist identities;
- lifecycle and one-active-execution invariants are enforced;
- no production write is implied without separate authorization.

### Foundation F3 — Repositories and State Orchestration

Deliver:

- Supabase-backed client/session repositories;
- mock adapters implementing the same interfaces;
- autosave/revision behaviour;
- timing and listening state orchestration;
- archive assembly service;
- transition commands and error recovery.

Exit gate:

- refresh/reload preserves session state;
- pause/resume time is correct;
- interrupted saves recover safely.

### Experience E1 — Session Creation

Deliver:

- Client → Primary Methodology → Preparation → Confirmation;
- inline new-client creation;
- minimum testimony-ready identity;
- optional contacts;
- Session Plan distinct from Report Template;
- explicit session start and testimony snapshot.

Exit gate:

- a session may be created without selecting a report template;
- identity is complete before start;
- contacts may remain empty.

### Experience E2 — Permanent Session Shell

Deliver:

- header;
- platform sidebar;
- workspace host;
- companion panel;
- active timing/listening status;
- pause/resume/exit/close actions;
- desktop/tablet responsive behaviour;
- phone safe continuity.

Exit gate:

- shell renders with a minimal test methodology containing no stages;
- shell does not import Mesa 35, Hawkins, chakra or activation modules.

### Experience E3 — Platform Records

Deliver:

- Notes;
- Timeline;
- transcript boundary and explicit controls;
- Live Report contribution review;
- source context and inclusion controls.

Exit gate:

- platform records persist independently of active methodology;
- privacy and inclusion states are explicit.

### Integration I1 — Existing Methodology Adapter

Deliver:

- migrate the current Mesa 35/workflow experience behind the adapter contract;
- preserve existing resource/workflow capabilities;
- remove direct Mesa 35 knowledge from the platform shell;
- validate that MAP and 49 Angels can later implement the same contract without shell changes.

Exit gate:

- Mesa 35 functions as a consumer of the shell;
- a second minimal fixture adapter proves methodology neutrality.

This foundation does not authorize redesign of the Mesa 35 therapeutic workflow.

### Experience E4 — Session Journey and Complementary Executions

Deliver only after PX-402/PX-403 product detail is approved:

- invoke an unplanned complementary methodology;
- switch with one-active-execution enforcement;
- pause, resume and consult prior executions;
- preserve invocation order and relationship;
- show primary and complementary executions in Session Journey.

### Experience E5 — Closing and Archive

Deliver:

- reversible closing review;
- unresolved-item awareness without invented therapeutic rules;
- final notes/transcript/report-contribution review;
- archive sealing;
- complete/cancel distinctions;
- report-template selection at closing or later.

Exit gate:

- completed session archive is independent of report choice;
- therapist may return from `closing` to `in_progress`;
- approved report lifecycle remains separate.

### Reporting R1 — Projection and Approval

Deliver:

- report-template catalogue;
- archive-field mapping;
- therapist customization;
- report draft/review/approval lifecycle;
- immutable approved rendition;
- later template change creates a new projection, not archive mutation.

## 12. Required Validation Matrix

| Scenario | Required result |
|---|---|
| Methodology has no stages | Workspace renders without empty navigation |
| Methodology has no visual resources | Shell remains complete and calm |
| Session begins with MAP | No Mesa 35 assumptions appear |
| Session begins with 35 Graphs | Platform shell remains unchanged |
| 49 Angels is added later | No platform-schema or shell reconstruction required |
| Complementary methodology invoked mid-session | New isolated execution is created |
| Therapist switches methodologies | Previous execution state is preserved |
| Browser reloads during session | Canonical live state returns |
| Session pauses | Active therapeutic time stops |
| Session enters closing | Review is reversible |
| Session completes | Canonical archive is sealed |
| Report template changes | Archive remains byte/logically unchanged |
| Report is approved | Approved rendition becomes immutable |
| Client later changes address | Historical testimony snapshot remains unchanged |
| Contacts are empty | Client/session creation remains valid |
| Two therapists access data | RLS prevents cross-therapist access |
| Screen is a phone | Safe continuity appears; dense workspace is not compressed |

## 13. Explicit Non-Goals

This readiness plan does not authorize:

- MAP workflow implementation;
- 35 Graphs workflow redesign;
- 49 Angels workflow implementation;
- Hawkins behaviour;
- chakra behaviour;
- activations;
- therapeutic resources or interpretations;
- AI-generated clinical/therapeutic conclusions;
- production deployment;
- destructive replacement of legacy data;
- detailed PX-402/PX-403 behaviour before product approval.

## 14. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Rebuilding UI before domain separation | Permanent shell inherits Mesa 35 assumptions | Complete F1–F3 before E2 |
| Treating workflow template as session | Future methodologies require schema/UI reconstruction | Introduce methodology executions |
| One large workspace refactor | Regression and unreviewable change | Extract behind tested seams incrementally |
| JSONB without contracts | Silent incompatible state drift | Version schemas and validate at boundaries |
| Snapshot created only at report generation | Historical facts may change | Capture testimony at start; seal archive at completion |
| Transcript scope expands silently | Privacy and consent failure | Explicit controls, retention and separate authorization |
| Mock/Supabase divergence | Prototype passes while persistence fails | Shared repository contracts and parity tests |
| Report template drives collection | Archived data is lost when therapist changes model | Preserve canonical contributions independently |

## 15. Implementation Authorization Gate

Implementation may begin only after:

1. this readiness document is reviewed and approved;
2. Platform Session Experience is confirmed as `APPROVED` in the repository;
3. the first implementation scope is selected;
4. database changes are reviewed as additive migrations;
5. methodology-specific work remains explicitly excluded from the platform foundation;
6. acceptance tests are attached to the selected implementation unit.

Recommended first authorized unit:

**F0 + F1 — Contract Freeze, Characterization Tests and Platform Domain Contracts.**

This first unit should not modify Supabase and should not reconstruct the visual workspace.

## 16. Final Readiness Decision

RADIONICS already contains enough valuable infrastructure to support the permanent Platform Session Experience without restarting the application.

However, the current session prototype must be treated as a methodology-rich reference implementation, not as the permanent platform architecture.

The safe path is:

1. preserve knowledge, workflow and resource assets;
2. establish methodology-neutral platform contracts;
3. materialize canonical persistence;
4. build the permanent shell;
5. move existing methodology behaviour behind an adapter;
6. add complementary-methodology navigation after its detailed product contract is approved;
7. seal session archives independently from report projections.

**Readiness status: READY FOR PRODUCT REVIEW — NOT YET AUTHORIZED FOR IMPLEMENTATION.**

