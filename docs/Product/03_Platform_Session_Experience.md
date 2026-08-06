---
title: RADIONICS — Platform Session Experience
document_id: RADIONICS-PLATFORM-SESSION-EXPERIENCE
version: 1.0
status: APPROVED
classification: Canonical Product Experience
owner: Product Owner
author: CodeVertex Innovations, LLC
last_updated: 2026-08-06
depends_on:
  - RADIONICS-PRODUCT-CONSTITUTION
  - RADIONICS-PLATFORM-UX-BACKLOG
  - RADIONICS-PRODUCT-DECISIONS
language: English
---

# RADIONICS — Platform Session Experience

## Purpose

This document defines the permanent platform experience that surrounds every therapeutic session in RADIONICS.

It translates the Phase 1 capabilities of the Platform UX Backlog into one coherent, methodology-neutral experience:

- PX-001 Session Lifecycle;
- PX-002 Session Creation;
- PX-003 Session Header;
- PX-004 Therapeutic Workspace;
- PX-005 Session Timeline;
- PX-006 Session Closing.

It also defines the permanent integration boundaries for Live Notes, Session Transcript, Live Report, complementary methodologies and report-template selection because the session shell must support those capabilities without later reconstruction.

This document defines product experience and platform responsibility. It does not define database tables, frontend component names, API contracts or methodology-specific therapeutic behaviour.

## Authority and Conflict Resolution

This document is subordinate to:

1. Product Vision & Experience Constitution;
2. Platform UX Backlog;
3. Product Decisions.

It is authoritative for the Platform Session Experience and must be consumed by methodology experience backlogs and implementation tasks.

Earlier technical, workspace, template, session and report documents may inform implementation only where they remain compatible with the current authority hierarchy.

Where an earlier document:

- assumes one fixed therapeutic sequence for every methodology;
- treats Hawkins, chakras, graphs, angels, activations or reverberation as universal platform behaviour;
- couples canonical session-data preservation to a pre-session report template;
- treats report completion as a session lifecycle state;
- or derives the permanent workspace from the 35 Graphs experience;

this document and the higher authorities prevail.

## Product Outcome

RADIONICS provides one calm, familiar and permanent therapeutic environment in which any methodology can operate without changing the platform shell.

The therapist should experience the session as therapeutic practice, not as software operation.

The permanent experience must support, without platform modification:

- MAP;
- 35 Graphs;
- 49 Angels;
- methodologies with no stages;
- methodologies with no visual resources;
- methodologies composed or introduced in the future.

## Scope

### In Scope

- session lifecycle;
- session creation;
- client context and testimony readiness;
- session header;
- methodology-neutral therapeutic workspace;
- platform sidebar and session navigation;
- session journey and methodology invocation boundary;
- notes;
- session transcript boundary;
- live report boundary;
- timeline;
- desktop and tablet responsiveness;
- safe mobile continuity;
- session closing;
- session archive and report-projection separation.

### Out of Scope

- MAP therapeutic workflow;
- 35 Graphs therapeutic workflow;
- 49 Angels therapeutic workflow;
- Hawkins behaviour;
- chakra behaviour;
- activations;
- prayers;
- therapeutic resources and their analysis rules;
- methodology-specific completion rules;
- implementation of complementary-methodology selection and transition;
- detailed voice-processing, transcription or consent implementation;
- printable report rendering;
- AI report drafting;
- database and API design.

Out-of-scope capabilities may have visible extension points in the permanent shell, but this document does not authorize their therapeutic implementation.

# 1. Foundational Separation

The Platform Session Experience consists of two independent responsibilities.

## 1.1 Platform Session Shell

The platform owns:

- session lifecycle and state;
- client context;
- testimony identity snapshot;
- intention;
- active therapeutic time;
- listening status;
- notes;
- session transcript;
- timeline;
- live report;
- session journey;
- pause, resume, exit and closing;
- persistence feedback;
- responsive behaviour.

## 1.2 Methodology Workspace

The active methodology owns:

- its therapeutic stages, if any;
- its internal navigation;
- its instructions;
- its resources;
- its selections and measurements;
- its therapeutic actions;
- its results;
- its methodology-specific completion awareness;
- its reportable contributions.

The platform must never require a methodology to use concepts such as diagnosis, activation, Hawkins, chakras, graphs, reverberation or staged progress.

## 1.3 Methodology Workspace Contract

Every methodology may provide:

- display identity;
- workspace content;
- optional internal navigation;
- optional progress information;
- optional completion awareness;
- isolated execution state;
- timeline events;
- reportable data contributions;
- optional relationships to complementary methodologies.

All capabilities except identity, content and isolated state are optional.

When a capability is absent, the platform omits it. The platform must not display empty sections or invent generic therapeutic steps.

# 2. PX-001 — Session Lifecycle

## 2.1 Lifecycle States

The permanent session lifecycle is:

`draft → in_progress ⇄ paused → closing → completed`

An alternative terminal transition is:

`draft | in_progress | paused → cancelled`

Scheduling is metadata and is not a therapeutic lifecycle state.

Report states are independent from session states.

## 2.2 Draft

A draft session exists but therapeutic work has not started.

The therapist may:

- review or correct the session configuration;
- open the pre-session chamber;
- start the session;
- leave and return later;
- cancel the session.

Opening a draft never starts the timer or listening.

## 2.3 In Progress

The session enters `in_progress` only after the therapist explicitly selects **Start Session**.

At that moment the platform:

- seals the client identity data used for the testimony at session start;
- records the start event in the timeline;
- begins active therapeutic time;
- enables live persistence;
- opens the primary methodology;
- enables notes, timeline, transcript controls and live report accumulation.

## 2.4 Paused

Pausing is a one-action command available in the session header.

When paused:

- active therapeutic time stops;
- current state is persisted immediately;
- active listening is ended or safely suspended;
- the workspace state remains preserved;
- the platform shows a calm paused state;
- Resume Session and Exit to Dashboard remain available.

Resuming restores the exact methodology position and records a timeline event.

## 2.5 Closing

Selecting **Close Session** enters the platform closing experience but does not complete the session.

The therapist may:

- review the session;
- return to the active methodology;
- save and exit while remaining in `closing`;
- complete the session.

## 2.6 Completed

Completing the session:

- fixes the completion time;
- ends active therapeutic time;
- closes active listening;
- seals the session archive;
- stabilizes the session timeline;
- preserves each methodology execution state;
- opens the post-session summary.

A completed session cannot return to `in_progress`.

Post-session corrections are managed as explicit corrections, notes, report edits or addenda with history.

## 2.7 Cancelled

Cancellation preserves a minimum historical record and an optional reason.

A cancelled session:

- is not deleted;
- is not presented as completed;
- cannot be resumed;
- does not silently create a completed therapeutic record.

## 2.8 Exit Behaviour

Leaving the workspace never means completing the session.

- `draft`: exit preserves the draft;
- `in_progress`: the therapist chooses Pause and Exit or Continue Session;
- `paused`: exit is immediate after persistence succeeds;
- `closing`: Save and Exit preserves the closing state.

Unexpected browser or network interruption preserves the last successful autosave. Re-entry into an active session uses **Continue Session** and does not invent a therapeutic pause.

## 2.9 User-Facing Actions

| Session state | Primary action |
| --- | --- |
| Draft | Start Session |
| In progress | Continue Session |
| Paused | Resume Session |
| Closing | Continue Closing |
| Completed | View Session |
| Cancelled | View Record |

# 3. PX-002 — Session Creation

## 3.1 Experience Sequence

The permanent creation sequence is:

`Client → Primary Methodology → Preparation → Confirmation`

The experience begins with the person receiving the session, not with the application's internal classification model.

## 3.2 Client Selection

The therapist may:

- select a recent client;
- search existing clients;
- create a new client without leaving the flow;
- begin from a client profile with that client preselected.

## 3.3 Minimum Client Record

The minimum testimony-ready client identity is:

### Required

- display name;
- full name;
- date of birth;
- address;
- locality;
- country.

Postal code is collected when applicable.

### Optional Contact Information

- telephone;
- WhatsApp;
- email.

The absence of contact information never blocks client creation or session start.

If an existing client lacks required testimony identity, missing fields are completed inside the session-creation flow without redirecting the therapist to another page.

## 3.4 Client Identity Through the Draft

While the session remains a draft, it reflects corrections made to the client profile.

At explicit session start, the platform captures the testimony identity snapshot used by that session.

Later client-profile changes do not silently rewrite the session's historical identity.

Explicit corrections during the session are recorded in the timeline.

## 3.5 Primary Methodology

The therapist selects one primary methodology.

The platform presents only methodologies that are active and available to the therapist under applicable permissions or certifications.

Specialty or certification is eligibility context. It is not presented as though it were the methodology itself.

## 3.6 Preparation

Required preparation data:

- client;
- primary methodology;
- session mode: in person, online or at distance.

Optional preparation data:

- scheduled date and time;
- Session Plan, when applicable;
- preliminary intention;
- private preparation note.

The intention may remain empty and may be discovered or reformulated during the session.

Less-used options remain under progressive disclosure.

## 3.7 Session Plan

A Session Plan may organize initial workspace preparation or additional fields.

A Session Plan:

- never changes the therapeutic methodology;
- never limits the canonical data that a methodology may produce;
- never determines which canonical session information is preserved;
- is independent from the Report Template selected at closing or afterwards.

## 3.8 Confirmation and Creation

The confirmation view presents:

- display and full client name;
- date of birth;
- summarized location;
- primary methodology;
- session mode;
- schedule, when present;
- Session Plan, when present;
- preliminary intention, when present.

Creating the record produces a `draft`.

**Prepare Start** opens the pre-session chamber. Only **Start Session** changes the lifecycle state and begins active time.

## 3.9 Entry Points

The same creation experience supports:

- Dashboard → New Session;
- Sessions → New Session;
- Client → New Session;
- Session Plan → Use in Session;
- Previous Session → New Similar Session.

Creating a similar session copies configuration only. It never copies results, notes, transcript or therapeutic conclusions.

# 4. PX-003 — Session Header

## 4.1 Purpose

The permanent header must answer four questions immediately:

1. With whom am I working?
2. What is the session intention?
3. How long has the active therapeutic work lasted?
4. Is listening active?

## 4.2 Permanent Areas

### RADIONICS Identity

- compact platform identity;
- discreet exit control;
- no full Dashboard navigation.

### Client Context

Always visible:

- avatar or initials;
- display name;
- age or date of birth;
- locality and country.

Expanded on demand:

- full name;
- complete address;
- contacts;
- testimony identity.

### Session Context

With secondary prominence:

- primary methodology;
- active methodology, when different;
- session mode;
- lifecycle state.

### Intention

The intention is permanent, directly editable and voice-capable.

When empty, the header communicates that it has not yet been defined without presenting an error.

Confirmed changes are recorded in the timeline.

### Active Therapeutic Time

The primary timer represents active therapeutic time, not merely time since page load.

Details may disclose:

- start time;
- pause periods;
- elapsed wall time;
- active therapeutic time.

### Listening

Listening is always explicit and has unambiguous states:

- off;
- starting;
- active;
- paused;
- unavailable or error.

Listening never starts automatically. Pausing, exiting or closing safely ends or suspends capture.

Detailed listening, recording, transcription and consent behaviour belongs to PX-101 and PX-304.

### Session Actions

The header provides context-appropriate actions:

- Pause;
- Resume;
- Help;
- secondary session menu;
- Exit.

Close Session remains a permanent, visually distinct platform action and is not hidden among methodology actions.

# 5. PX-004 — Therapeutic Workspace

## 5.1 Permanent Layout

The workspace consists of:

1. permanent session header;
2. permanent platform navigation;
3. central Methodology Workspace;
4. contextual Session Companion Panel.

## 5.2 Platform Navigation

The platform sidebar contains:

- Session / active methodology;
- Notes;
- Live Report;
- Timeline;
- Close Session, isolated at the bottom.

It never permanently lists methodology-specific tools or resources.

Hawkins, chakras, graphs, angels, flower remedies, frequencies, prayers and activations belong to methodologies or the therapeutic resource system.

## 5.3 Central Methodology Workspace

During `in_progress`, the active methodology owns the central area.

Its stages and internal navigation appear inside this area. Platform navigation and methodology navigation remain visibly distinct.

The platform temporarily owns the central area only for:

- pre-session chamber;
- paused-session state;
- closing experience.

## 5.4 Session Companion Panel

The right-side companion panel supports:

- Session Journey by default;
- Notes;
- Live Report;
- Timeline.

Opening Notes, Live Report or Timeline temporarily replaces the journey view in the panel. Closing the auxiliary view returns to Session Journey.

The active methodology remains mounted and preserves its exact state.

## 5.5 Session Journey

Session Journey visually preserves the methodologies or tables that participate in one therapeutic session.

It shows:

- the primary methodology;
- methodologies already invoked;
- their status;
- the currently active methodology;
- the action to add a complementary methodology when that capability is available.

Possible execution states include:

- active;
- paused;
- completed;
- available;
- unavailable with explanation.

Only one methodology execution is active at a time.

The default view shows the primary methodology and executions already added. The complete catalogue appears only when the therapist asks to add another methodology.

The platform may surface compatible possibilities declared by methodologies and permitted for the therapist, but never chooses a complementary methodology automatically.

## 5.6 Complementary Methodology Extension Boundary

Detailed behaviour belongs to PX-402 and PX-403.

The permanent shell must nevertheless support without reconstruction:

- one primary methodology;
- additional unplanned methodologies during an active session;
- isolated state per methodology execution;
- pause and return to an earlier execution;
- one session timeline;
- one session archive;
- one live-report accumulation pool;
- report contributions grouped by methodology execution.

Multiple tables inside one methodology remain methodology-owned behaviour.

## 5.7 Desktop and Tablet Support

### Desktop and Laptop

The complete workspace is the primary experience:

- full header;
- permanent sidebar;
- dominant methodology area;
- companion panel when required.

### Tablet Landscape

- condensed header;
- narrow or collapsible sidebar;
- dominant methodology area;
- companion panel as temporary column or drawer;
- touch-appropriate controls.

### Tablet Portrait

- controlled multi-row header;
- icon-first platform rail;
- broad drawers for companion content;
- no workspace-level horizontal scrolling;
- preserved methodology capability, not a reduced therapeutic workflow.

## 5.8 Mobile Continuity

The complete Therapeutic Workspace is not supported below the validated tablet threshold, initially targeted at 768 CSS pixels.

Mobile may support administrative and consultation experiences outside the workspace.

When a session workspace is opened on mobile, the platform provides safe continuity:

- explain that the session is designed for computer or tablet;
- view a session summary;
- pause and exit when an active session exists;
- continue on a supported device.

The platform must not compress the complete therapeutic workspace into a phone layout.

# 6. PX-005 — Session Timeline

## 6.1 Purpose

The timeline is the meaningful chronological memory of the therapeutic session. It is not a technical click log.

## 6.2 Platform Events

The platform may record:

- session creation;
- start;
- pause and resume;
- intention confirmation or revision;
- explicit testimony identity correction;
- methodology invocation and transition;
- closing start;
- completion or cancellation.

## 6.3 Methodology Events

A methodology may emit meaningful events such as:

- stage start or completion;
- confirmed therapeutic result;
- resource selection, use or activation;
- therapist decision;
- complementary methodology request or completion.

The platform preserves and presents the event without interpreting its therapeutic meaning.

## 6.4 Therapist Moments

The therapist may create a moment by voice or text and may associate it with the active methodology context.

The therapist decides whether a moment is private or may contribute to the report.

## 6.5 Excluded Noise

The therapeutic timeline excludes:

- autosaves;
- panel opening and closing;
- searches;
- insignificant navigation;
- transient unconfirmed edits;
- technical recovery details.

Technical audit information, when required, remains separate.

## 6.6 Historical Integrity

Meaningful events are not silently rewritten.

Corrections append context while preserving the original event. The currently valid value may be used by the report, but the session journey remains understandable.

After completion, later observations are identified as addenda and are not presented as though they occurred during the session.

# 7. Live Notes

## 7.1 Capture

Notes open in the companion panel without leaving the methodology.

The therapist may:

- write;
- dictate;
- create a note from a transcript excerpt;
- associate it with the active methodology, stage or resource when context exists.

Notes autosave and closing the panel returns to the same methodology position.

## 7.2 Visibility

The permanent platform visibility states are:

- Private;
- Review for Report;
- Included in Report.

Private notes never enter a client-facing report without explicit therapist action.

## 7.3 Context

Each note preserves:

- time;
- origin: written, dictated or transcript excerpt;
- methodology execution context;
- optional stage or resource context;
- report-review state.

Post-session edits and additions preserve their later authorship time.

# 8. Session Transcript

## 8.1 Separation

The Session Transcript is distinct from:

- Timeline: what meaningfully happened and when;
- Notes: therapist observations;
- Report: reviewed presentation of the session.

## 8.2 Capture Modes

The permanent platform anticipates:

- therapist dictation;
- continuous session capture.

The active mode is always visible. Capture is never automatic.

Where another person may be captured, explicit therapist confirmation of the required consent is part of the activation boundary.

## 8.3 Private Working Artifact

The transcript may preserve:

- time markers;
- speaker attribution when technically reliable;
- methodology context;
- therapist corrections;
- source relationship to notes or report excerpts.

The transcript is private by default.

It is never automatically shared, treated as confirmed therapeutic truth or inserted in full into the report.

After the session, the therapist may search, correct and use selected excerpts to improve notes or the report.

# 9. Live Report

## 9.1 Principle

The report is continuously prepared as a consequence of the session, but the therapist remains its author, editor and final approver.

The platform accumulates truthful, reportable contributions without inventing missing findings or therapeutic conclusions.

## 9.2 Report Sources

Possible sources include:

- session and client identity snapshot;
- intention;
- meaningful timeline events;
- confirmed methodology results;
- notes marked for report review;
- transcript excerpts explicitly selected by the therapist;
- therapist-authored report text.

Private notes, the complete transcript, transient results and technical information never enter automatically.

## 9.3 Report Lifecycle

The independent report lifecycle is:

`draft → in_review → approved → shared`

Completing a session does not approve or share a report.

## 9.4 Report Editing

The therapist may:

- include or exclude content;
- edit and reorganize sections;
- change visibility;
- defer review;
- inspect source attribution.

Therapist edits are never silently overwritten by later accumulation. New information is presented for review.

Approved or shared reports are versioned historical artefacts. Changing a template or source record never silently changes them.

# 10. Session Archive and Report Projection

## 10.1 Canonical Rule

The complete therapeutic session record is preserved independently from any Report Template.

A Report Template selects, organizes and presents archived session information. It never determines which canonical therapeutic data is preserved.

## 10.2 Session Archive

At completion the platform seals a session archive containing, where available:

### Client identity at session time

- display name;
- full name;
- date of birth;
- complete structured address;
- locality;
- country;
- available contacts.

### Session context

- therapist;
- mode;
- schedule, start, pauses and completion;
- active therapeutic duration;
- intention and confirmed revisions;
- primary methodology;
- complementary methodology executions.

### Methodology executions

For each execution:

- methodology identity and version context;
- execution order;
- start, pause, resume and completion state;
- stages or steps when the methodology has them;
- responses and measurements;
- initial and final energy measurements when the methodology defines them;
- selected, identified, used or activated resources;
- confirmed results;
- methodology reportable contributions.

### Cross-session artefacts

- notes;
- timeline;
- transcript and transcript metadata;
- attachments;
- therapist moments;
- closing observations.

Preserving the maximum relevant therapeutic information does not mean preserving every technical click.

## 10.3 Reportable Contribution Pool

During the session, the platform accumulates structured reportable contributions independently from the final Report Template.

Each contribution preserves:

- stable semantic identity;
- value and display fallback;
- source;
- methodology execution context;
- therapist visibility decision;
- confirmation state;
- time.

Methodologies define possible contributions. The platform stores and composes them without interpreting therapeutic meaning.

## 10.4 Report Template

The therapist selects or confirms a Report Template at closing or afterwards.

A Report Template may define:

- included sections and fields;
- ordering;
- titles and explanatory copy;
- level of detail;
- default visibility;
- standard therapist text;
- report identity and presentation.

A methodology may provide an official default Report Template. Therapists may create personalized variants without modifying the methodology or canonical session archive.

## 10.5 Projection Sequence

The report flow is:

`Session Archive → Reportable Contributions → Selected Report Template → Session-Specific Edits → Approved Report Version`

If a template requests data that was not recorded, the platform omits it or marks it as not recorded according to the template rule. It never invents a value.

## 10.6 Sessions with Multiple Methodologies

Each methodology execution contributes through its own compatible report definition.

The final report may include:

- common session section;
- one section or group per methodology execution;
- therapist-authored overall reflection;
- selected recommendations and next steps.

The therapist may exclude a methodology from the client-facing report without deleting it from the internal session archive.

## 10.7 Template Changes

Changing a Report Template:

- affects new report projections only;
- never changes the session archive;
- never changes approved or shared reports;
- never silently reformats an existing draft;
- may be applied to a draft only after explicit therapist choice.

# 11. PX-006 — Session Closing

## 11.1 Entry

Selecting **Close Session**:

- persists current state;
- safely ends continuous capture;
- preserves the active methodology position;
- changes the session to `closing`;
- opens the platform closing experience.

## 11.2 Closing Review

The closing experience presents:

- client, intention, timing and duration;
- methodology journey and execution states;
- methodology-provided summary and incomplete-awareness items;
- notes and therapist moments;
- transcript status;
- live-report accumulation status;
- report-template selection or confirmation.

## 11.3 Methodology Awareness

A methodology may inform the therapist that therapeutic work appears incomplete.

The therapist may return to the methodology or continue closing.

Methodology awareness is advisory. The platform does not surrender the final closing decision or trap the therapist in a workflow.

## 11.4 Technical Safety Conditions

Completion may be delayed only when necessary to protect data integrity, such as when:

- methodology state has not been persisted;
- pending notes have not been persisted;
- capture has not been safely finalized;
- the session archive cannot be sealed;
- the completion timeline event cannot be recorded.

The platform identifies the precise problem and supports retry. It never closes silently with known data loss.

Transcript text processing may continue after completion when the underlying captured content has been stored safely.

## 11.5 Closing Actions

- Return to Session;
- Save and Exit;
- Complete Session.

## 11.6 Post-Session Summary

After completion, the therapist may:

- review or select the report model;
- review the report;
- consult the transcript;
- consult notes;
- consult the timeline;
- return to the client;
- return to the Dashboard.

# 12. Validation Requirements

The Platform Session Experience is not complete until validated on:

## 12.1 Methodology Independence

- MAP consumes the shell without redefining it;
- 35 Graphs consumes the shell without controlling it;
- 49 Angels consumes the shell without platform modification;
- a neutral test methodology with no stages, Hawkins, resources or activations functions correctly.

## 12.2 Lifecycle

- start is explicit;
- pause and resume preserve exact state;
- exit never completes a session;
- closing is reversible until completion;
- completion seals the archive;
- report lifecycle remains independent.

## 12.3 Data and Reporting

- testimony-ready identity is available;
- session data persists independently from Report Templates;
- Report Template selection can occur at closing or later;
- all recorded compatible fields can be projected into a report;
- private notes and full transcript never leak automatically;
- approved report versions remain stable.

## 12.4 Responsive Experience

- desktop and laptop complete experience;
- tablet landscape complete adapted experience;
- tablet portrait complete adapted experience;
- mobile safe-continuity experience;
- no forced full-workspace horizontal scroll.

## 12.5 Therapeutic Flow

- common actions remain one-second interactions where practical;
- the active methodology remains dominant;
- auxiliary panels do not reset methodology state;
- persistence feedback is calm and clear;
- the therapist retains every therapeutic decision.

# 13. Implementation Boundary

Approval of this document authorizes experience and technical planning. It does not by itself authorize:

- database migrations;
- writes to Supabase environments;
- methodology implementation;
- voice recording or AI processing;
- production deployment.

Implementation must be decomposed into independently testable platform increments and must preserve existing methodology work while extracting it from the permanent shell.

---

Approval Status: APPROVED
Approved by: Product Owner
Approval Date: 2026-08-06
