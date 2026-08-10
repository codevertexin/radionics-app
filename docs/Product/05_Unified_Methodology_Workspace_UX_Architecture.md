# Unified Methodology Workspace — UX Architecture

---
document: Unified Methodology Workspace — UX Architecture
version: 1.0
status: APPROVED
classification: Canonical UX Architecture
product: RADIONICS
scope: Platform Session / Unified Methodology Workspace
authority:
  - Product/00_Product_Vision_&_Experience_Constitution.md
  - Product/01_Platform_UX_Backlog.md
  - Product/02_Product_Decisions.md
  - Product/03_Platform_Session_Experience.md
  - Product/04_Platform_Session_Architecture.md
  - AGENTS.md
---

## 1. Purpose

This document defines the canonical UX architecture for the Unified Methodology Workspace used inside a RADIONICS therapeutic session.

The Unified Methodology Workspace is the common session environment in which all therapist-authorized methodologies are presented and operated.

It exists to ensure that MAP, 35 Graphs, 49 Angels and future methodologies can participate in the same therapeutic session without creating separate application experiences, separate session shells or methodology-specific platform layouts.

The architecture follows one central principle:

One Session. One Workspace. Multiple Methodologies.

A methodology may provide a substantially different therapeutic workflow, information model, interaction pattern and set of capabilities from another methodology.

Those differences belong inside the methodology-owned workspace experience.

They MUST NOT require the RADIONICS Platform Session to adopt a different fundamental layout for each methodology.

The Platform Session provides the stable therapeutic working environment.

Each methodology adapts to that environment.

## 2. UX Objectives

The Unified Methodology Workspace MUST optimize for:

1. **Simplicity**
   The therapist should understand where they are and what they can do without navigating between separate application experiences.

2. **Speed**
   Common therapeutic actions and methodology transitions should require minimal interaction.

3. **Focus on the Session**
   Administrative application concerns must not compete with the therapist's attention during active therapeutic work.

4. **Methodology Complementarity**
   Multiple authorized methodologies may participate in one therapeutic session and should complement one another while preserving their independent state and provenance.

5. **Consistency Without Artificial Uniformity**
   Every methodology uses the same Platform Session envelope, but methodologies are not required to expose identical steps, controls, cards, progress models or interaction patterns.

6. **Progressive Disclosure**
   Supporting information should appear when requested or contextually necessary rather than permanently consuming the therapeutic workspace.

7. **Therapist Authority**
   The platform assists the therapist but does not infer therapeutic decisions, methodology selections, confirmations or outcomes where explicit therapist authority is required.

8. **Continuity**
   Client context, therapeutic intention, session time, session evidence and platform-level working context remain available across methodology transitions.

9. **Traceability**
   Methodology transitions, confirmed facts, measurements, results and eligible contributions remain attributable to their originating methodology execution.

10. **PC and Tablet Usability**
    The same mental model must be preserved across supported desktop and tablet layouts without forcing desktop multi-column density onto smaller screens.

## 3. Scope

This document defines:

the Platform Session visual envelope;
ownership of the major workspace regions;
the common methodology workspace contract;
methodology composition within a session;
primary and complementary methodology presentation;
invocation, transition and return behaviour between methodologies;
contextual methodology relationships;
contextual detail and progressive disclosure;
platform-level session context within the workspace;
session-mode visual architecture;
desktop and tablet adaptation;
UX boundaries between platform-owned and methodology-owned behaviour.

This document does not define:

the therapeutic workflow of an individual methodology;
MAP-specific therapeutic behaviour;
35 Graphs-specific therapeutic behaviour;
49 Angels-specific therapeutic behaviour;
methodology-specific canonical content;
methodology-specific data contracts;
implementation technology;
final component implementation;
database schema or persistence implementation.

Individual methodology UX specifications consume this architecture rather than redefine it.

## 4. Architectural Principles

The following principles define the invariant UX architecture of the Unified Methodology Workspace.

They apply to every methodology executed inside a RADIONICS Platform Session.

Methodology-specific UX specifications MUST conform to these principles and MUST NOT redefine them.

### UMW-UX-01 — Single Session / Unified Workspace Ownership

A RADIONICS therapeutic session operates inside one persistent Platform Session Workspace.

The Platform Session Workspace is the authoritative UX container for the therapeutic session.

All primary and complementary methodologies participating in that session execute inside this same workspace.

Invoking, switching, resuming or completing a methodology MUST NOT create a separate Platform Session, separate application shell or parallel therapeutic workspace.

The platform owns the session-level experience, including:

- session identity and lifecycle;
- client or group context;
- therapeutic intention;
- session mode;
- session timing;
- methodology composition and session-level methodology navigation;
- Session Timeline;
- session-level notes;
- transcript and listening state, where enabled;
- report context and Report Projection;
- session-level actions and closing.

These platform-owned concerns persist across methodology transitions.

A methodology owns only the experience required to perform its methodology-specific work inside the methodology workspace region.

The UX MUST preserve the therapist's perception that they are working in one continuous therapeutic session even when multiple methodologies participate in that session.

### UMW-UX-02 — Common Methodology Envelope

Every methodology executes inside the same methodology workspace envelope provided by the Platform Session.

The envelope defines where methodology-specific experience is presented without prescribing the internal therapeutic structure of that experience.

A methodology may define its own:

- workflow;
- information hierarchy;
- navigation model;
- progress model, where applicable;
- canonical methodology content;
- investigation experience;
- measurements;
- therapist confirmations;
- methodology-specific actions;
- supported platform capabilities.

The common envelope MUST NOT require methodologies to expose identical:

- steps;
- progress indicators;
- cards;
- resource models;
- measurements;
- investigation structures;
- navigation controls;
- completion patterns.

The visual and interaction architecture surrounding the methodology remains stable while the methodology-owned content adapts to the active methodology.

Switching from one methodology to another MUST therefore change the methodology experience without replacing the Platform Session experience.

The result is consistency of environment without artificial uniformity of therapeutic practice.

### UMW-UX-10 — Methodology-Neutral Host

The Unified Methodology Workspace MUST remain methodology-neutral.

No structural element of the common workspace may assume the concepts, terminology or workflow of a specific methodology.

In particular, the common workspace MUST NOT assume that every methodology has:

- numbered steps;
- a linear workflow;
- a resource catalogue;
- Therapeutic Resources;
- Resource Cards;
- measurements;
- a Hawkins scale;
- graphs;
- prayers or canonical spoken protocols;
- activations;
- a fixed progress percentage;
- the same completion model.

Methodology-specific concepts belong inside the active methodology experience or within explicitly supported shared platform capabilities.

The common host may expose shared platform capabilities only where they are supported by the active methodology contract.

Optional methodology capabilities MUST remain optional in the UX.

Their absence MUST NOT produce empty mandatory regions, artificial placeholders or methodology-specific assumptions in the common workspace.

The Unified Methodology Workspace must therefore be capable of hosting MAP, 35 Graphs, 49 Angels and future authorized methodologies without requiring redesign of the Platform Session shell.

A future methodology that conforms to the Platform Session and methodology-host contracts must be able to enter the same workspace architecture without creating a new application-level layout.

### UMW-UX-03 — Complementary Methodologies Rail

The Platform Session MAY expose a persistent or collapsible Related Methodologies rail adjacent to the active Methodology Workspace.

The rail is a platform-owned contextual navigation surface.

Its purpose is to make methodologies or therapeutic tables that are relevant to the therapist's current work immediately accessible without leaving the active session.

The Related Methodologies rail MUST NOT be treated as:

- a catalogue of every methodology available in RADIONICS;
- a replacement for methodology selection at session creation;
- an administrative certification-management surface;
- an automatic recommendation engine;
- evidence that a related methodology should therapeutically be used.

Items exposed in the rail MUST be limited to methodologies or therapeutic tables for which:

- a valid relationship with the current methodology, investigation element or therapeutic context is defined;
- the therapist is authorized and eligible to use the target methodology;
- the target methodology is available for invocation in the current Platform Session context.

The rail may distinguish between:

- a related methodology that has not yet participated in the session;
- a complementary methodology already invoked during the session;
- a complementary methodology with preserved resumable state;
- a complementary methodology already completed.

The active methodology MUST remain visually distinguishable from related or complementary methodologies.

The rail MUST provide rapid access while remaining visually secondary to the active Methodology Workspace.

It MUST NOT reduce the primary methodology workspace to an unusable width.

On narrower supported layouts, the rail MAY collapse into a drawer, sheet or equivalent contextual surface while preserving the same conceptual function.

The Related Methodologies rail belongs to the Platform Session.

Individual methodologies may expose relationship information that allows the platform to populate it, but they MUST NOT create independent competing sidebars or methodology-specific session navigation shells.

### UMW-UX-04 — One Active Methodology at a Time

Multiple methodology executions may participate in the same Platform Session.

Only one methodology execution may be operationally active in the Unified Methodology Workspace at a time.

The UX MUST make the currently active methodology unambiguous.

When the therapist moves from one methodology to another:

1. the current methodology state is preserved;
2. the current methodology ceases to occupy the active Methodology Workspace;
3. the target methodology becomes the active methodology experience;
4. the Platform Session context remains unchanged;
5. session-level capabilities remain available according to their own contracts.

A methodology that is no longer active MUST NOT lose its preserved execution state merely because another methodology is being used.

The UX MUST distinguish, where applicable, between methodology states such as:

- active;
- preserved / resumable;
- completed.

The platform MUST NOT visually imply that two methodologies are simultaneously active when the domain contract permits only one active methodology execution.

Complementarity is therefore represented as continuity between methodology executions inside one session, not as parallel active therapeutic workspaces.

### UMW-UX-08 — Related Methodology Invocation and Return

A therapist may invoke an authorized related methodology from the Related Methodologies rail when the current therapeutic context supports that relationship.

Invocation MUST remain an explicit therapist action.

The platform MUST NOT automatically open, activate or execute a related methodology solely because a relationship exists.

Before invocation, the platform MUST preserve the state of the currently active methodology according to its execution contract.

The related methodology then becomes the active methodology inside the same Unified Methodology Workspace.

The transition MUST preserve:

- Platform Session identity;
- client or group context;
- therapeutic intention;
- session timing;
- Session Timeline;
- notes;
- transcript or listening context, where enabled;
- report context;
- provenance of the originating methodology execution.

The platform MUST preserve the relationship between the originating methodology and the complementary methodology invocation where such a relationship exists.

A complementary methodology MUST NOT be represented as a new Platform Session.

When complementary work is completed or the therapist chooses to leave it, the platform MUST provide a clear path to return to the relevant preserved methodology context where continuation is valid.

For example:

`MAP → complementary methodology → return to MAP`

must be experienced as one continuous therapeutic session.

Returning to the originating methodology MUST restore its preserved methodology-owned state rather than restart its workflow unless the methodology contract explicitly requires restart behaviour.

Completion of a complementary methodology MUST NOT automatically:

- complete the originating methodology;
- advance the originating methodology;
- change a therapist-confirmed result in the originating methodology;
- complete the Platform Session;
- include complementary methodology evidence in the client-facing report.

Any cross-methodology use of confirmed facts, measurements, results or report contributions MUST remain governed by explicit platform and methodology contracts with preserved provenance.

The Session Timeline SHOULD make methodology transitions understandable as part of one session history.

A transition may therefore be represented conceptually as:

`MAP paused/preserved → 35 Graphs active → 35 Graphs completed → MAP resumed`

without implying that two methodologies were simultaneously active.

### UMW-UX-09 — Session Methodology Composition & Journey

A Platform Session MAY contain therapeutic work from more than one methodology while preserving one continuous session identity.

The UX MUST distinguish between:

- the Primary Methodology;
- Related Methodologies available for invocation;
- Complementary Methodology Executions that have actually participated in the session;
- the currently Active Methodology Execution.

These concepts have different meanings and MUST NOT be presented as interchangeable states.

#### Primary Methodology

Every Platform Session begins with one Primary Methodology established through the applicable session creation or scheduling flow.

The Primary Methodology is the methodology for which the therapeutic session was originally created or scheduled with the client.

Creating or starting the Platform Session establishes the corresponding Primary Methodology Execution according to the applicable Platform Session and methodology execution contracts.

The Primary Methodology remains the Primary Methodology for the lifetime of that Platform Session.

Activating a complementary methodology MUST NOT replace, reclassify or overwrite the Primary Methodology.

Therefore:

`Primary` describes the methodology's role in the session.

`Active` describes which methodology execution currently occupies the Methodology Workspace.

A Primary Methodology may therefore be:

- active;
- preserved while complementary work is active;
- resumed after complementary work;
- completed according to its own execution contract.

Its role as Primary remains unchanged.

#### Related Methodology Availability

Related Methodologies are methodologies that may be made available to the therapist as contextual complementary options during work with another methodology.

Availability MUST derive from an authorized methodology relationship configured for the therapist or otherwise established through the applicable platform configuration contract.

The Unified Methodology Workspace MUST NOT treat the complete RADIONICS methodology catalogue as the Related Methodologies list.

A methodology SHOULD appear as available for contextual invocation only when:

1. an applicable configured relationship permits it in the current methodology context; and
2. the therapist satisfies the current authorization or eligibility requirements for using that methodology.

Conceptually:

`Configured Relationship + Current Eligibility → Available Related Methodology`

The existence of an available relationship does not mean that the methodology participates in the current Platform Session.

Displaying a methodology in Related Methodologies MUST NOT, by itself:

- create a Methodology Execution;
- add the methodology to the Session Journey;
- change the active methodology;
- preserve or complete another methodology;
- create therapeutic evidence;
- imply that the related methodology is clinically or therapeutically required.

Availability is an option presented to the therapist.

Invocation remains a therapist decision.

#### Therapist Authority Over Invocation

The platform MUST NOT automatically invoke a Related Methodology merely because:

- a configured relationship exists;
- the methodology is eligible;
- a particular result or measurement is observed;
- another methodology reaches a particular state;
- the platform detects a possible relationship.

The therapist decides whether the Related Methodology is therapeutically relevant in the current session.

Only an explicit therapist invocation may initiate the transition from an available Related Methodology into a participating Complementary Methodology Execution, subject to the applicable execution contract.

Conceptually:

`Available Related Methodology + Explicit Therapist Invocation → Complementary Methodology Execution`

#### Complementary Methodology Execution

A methodology becomes part of the current Platform Session composition when it is actually invoked and the corresponding Complementary Methodology Execution is established according to the applicable contracts.

A Complementary Methodology Execution:

- belongs to the same Platform Session;
- preserves its own methodology-owned state;
- preserves its own execution identity and provenance;
- does not become the Primary Methodology;
- may become the Active Methodology;
- may later be preserved, resumed, completed or otherwise transitioned according to its execution contract.

Invoking a complementary methodology MUST NOT create a second Platform Session.

The Primary and Complementary distinction describes participation role, not therapeutic importance.

The UX MUST NOT imply that a Complementary Methodology is inherently secondary in clinical or therapeutic significance merely because it was invoked after the Primary Methodology.

#### Active Methodology Execution

At most one Methodology Execution may occupy the active Methodology Workspace at a time.

The Active Methodology may be either:

- the Primary Methodology Execution; or
- a Complementary Methodology Execution.

Changing the Active Methodology MUST NOT change which methodology is Primary.

For example:

`MAP — Primary · Preserved`

`35 Graphs — Complementary · Active`

means that the Platform Session remains a MAP-primary session while the therapist is currently working inside the 35 Graphs complementary execution.

If the therapist later returns to MAP:

`MAP — Primary · Active`

`35 Graphs — Complementary · Preserved`

the session composition remains intact.

Only operational focus has changed.

#### Session Methodology Composition

The Platform Session methodology composition consists of the Methodology Executions that have actually participated in that session.

It MUST NOT be confused with the set of methodologies merely available through configured relationships.

Conceptually:

`Session Composition = Primary Execution + Invoked Complementary Executions`

Related Methodologies that were never invoked MUST NOT appear as though they participated in the session.

The platform SHOULD preserve the participation role, execution identity, invocation relationship and relevant ordering/provenance required by the applicable Platform Session contracts.

A methodology's participation in Session Composition MUST NOT depend on whether it ultimately contributes content to the client-facing report.

Session participation and Report Projection inclusion are separate concerns.

#### Session Journey

The platform SHOULD provide a session-level representation of methodology participation where required to help the therapist understand how the therapeutic session has evolved.

This representation is the Session Methodology Journey.

The Session Journey MAY expose, where supported by the applicable contracts:

- the Primary Methodology;
- invoked Complementary Methodologies;
- the currently Active Methodology;
- preserved methodology executions;
- completed methodology executions;
- invocation relationships;
- invocation order;
- return or resume relationships.

For example:

`MAP`
`Primary · Preserved`
`↓ invoked`
`35 Graphs`
`Complementary · Active`

The Session Journey MUST represent actual participation in the Platform Session.

It MUST NOT become another presentation of the Related Methodologies catalogue.

A Related Methodology that remains merely available MUST NOT appear in the Journey as though it had been invoked.

Likewise, removing a methodology from immediate active focus MUST NOT erase its historical participation in the Journey.

#### Related Methodologies vs Session Journey

Related Methodologies and Session Journey are distinct platform capabilities.

Related Methodologies answers:

**“What other methodologies are currently available for me to invoke from this therapeutic context?”**

Session Journey answers:

**“Which methodologies have actually participated in this Platform Session, and what is their current relationship to the session?”**

The UX MUST preserve this distinction.

The Related Methodologies surface is prospective.

The Session Journey is participatory and historical.

A methodology may therefore appear first in Related Methodologies and, after explicit therapist invocation, become represented in the Session Journey as a Complementary Methodology Execution.

The platform MUST NOT require that it disappear permanently from relationship context merely because it has participated; any subsequent availability or resume behaviour MUST follow the applicable execution and relationship contracts.

#### Session Plan Boundary

A Session Plan, where present, is preparation context.

It is not the authoritative record of methodology participation during the Platform Session.

The Session Plan MAY influence initial preparation according to its applicable contract.

It MUST NOT prevent the therapist from invoking an otherwise authorized and eligible Related Methodology during the session merely because that methodology was not anticipated in the initial plan.

An unplanned but valid therapist invocation MAY therefore create a Complementary Methodology Execution during the Platform Session.

The Session Journey reflects what actually happened.

The Session Plan reflects preparation.

The two MUST NOT be collapsed into one another.

#### Methodology Transition Continuity

When the therapist invokes, switches to, returns to or resumes another Methodology Execution, Platform Session continuity MUST be preserved.

The transition MUST NOT reset or replace:

- Platform Session identity;
- client or group context;
- therapeutic intention;
- Platform Session timing history;
- Session Timeline;
- session-level Notes;
- Transcript / Listening context, except where required by its own contract;
- Report Projection context.

Methodology-owned state MUST remain isolated by execution while session-level context remains continuous.

#### Traceability

The UX SHOULD preserve enough provenance for the therapist to understand the relationship between methodology executions without requiring implementation-level knowledge.

Where applicable, the platform SHOULD be able to distinguish:

- which execution is Primary;
- which executions are Complementary;
- which execution is Active;
- which methodology invocation led to a complementary execution;
- when the therapist returned to or resumed another execution.

This traceability MUST NOT be used to infer therapeutic meaning that the therapist did not explicitly establish.

#### Core Composition Principle

The Unified Methodology Workspace MUST preserve the following model:

`Scheduled / Created Methodology → Primary Methodology Execution`

`Configured Relationship + Current Eligibility → Available Related Methodology`

`Available Related Methodology + Explicit Therapist Invocation → Complementary Methodology Execution`

`Primary + Invoked Complementary Executions → Session Methodology Composition`

`One participating execution at a time → Active Methodology Workspace`

The therapist determines when complementary methodology work becomes part of the therapeutic session.

The platform preserves continuity, eligibility, state and provenance around that decision.

### UMW-UX-05 — Contextual Detail on Demand

The Unified Methodology Workspace MUST use progressive disclosure for supporting information that is useful to the therapist but not required to remain continuously visible.

Contextual detail MUST NOT permanently consume primary methodology workspace area merely because the information is available.

Where a methodology element exposes additional explanatory, descriptive, historical or supporting information, the UX SHOULD provide an explicit contextual-detail action such as an information control (`ⓘ`) or equivalent accessible interaction.

Invoking that action may open a contextual detail panel, drawer, sheet or equivalent surface.

Opening contextual detail MUST NOT:

- change the selected methodology element;
- confirm a methodology selection;
- start methodology work;
- create a Session Fact, Measurement or Result;
- activate a Therapeutic Resource;
- advance methodology navigation;
- alter methodology execution state.

Viewing information and performing a therapeutic action MUST remain distinct interactions.

The contextual detail surface SHOULD preserve the therapist's current workspace context and SHOULD be dismissible without losing methodology-owned state.

Where sufficient space exists, contextual detail MAY appear adjacent to the active methodology content.

On narrower supported layouts, it MAY overlay or temporarily replace secondary workspace space through a drawer, sheet or equivalent presentation.

Closing contextual detail MUST return the therapist to the same methodology context from which it was opened.

A methodology MAY define the content exposed through contextual detail.

The Platform Session owns the common interaction pattern and presentation behaviour used to reveal and dismiss that information.

Contextual detail MUST remain visually secondary to the therapeutic task currently being performed.

### UMW-UX-06 — Platform-Owned Session Frame

The Platform Session MUST provide a stable session frame around the active methodology experience.

This frame establishes continuity across the entire therapeutic session and MUST remain recognizable when the active methodology changes.

The platform-owned session frame includes responsibility for presenting or providing access to:

- client or group identity;
- therapeutic intention;
- session mode;
- session timing;
- Platform Session lifecycle state;
- active methodology identity;
- methodology composition and transition context;
- Related Methodologies;
- Session Timeline;
- session-level Notes;
- Transcript and listening state, where enabled;
- Live Report / Report Projection context;
- session-level actions;
- access to Platform Session Closing.

These capabilities do not all need to remain simultaneously visible.

The platform MUST prioritize therapeutic workspace area and use progressive disclosure for secondary session capabilities where appropriate.

In particular, Session Timeline, Notes, Transcript and Live Report SHOULD be available as platform-level contextual tools without requiring a permanently open secondary column.

They MAY be presented through:

- tabs;
- drawers;
- sheets;
- contextual panels;
- expandable surfaces;
- another consistent platform-level progressive-disclosure pattern.

The chosen presentation MUST preserve a consistent mental model across methodologies.

A methodology MUST NOT create its own competing implementation of:

- Session Timeline;
- session-level Notes;
- Transcript;
- Live Report;
- Platform Session Closing;
- methodology composition navigation.

Methodology-specific information may contribute to these platform capabilities according to the applicable contracts, but the session-level surfaces remain platform-owned.

Administrative application navigation MUST NOT compete with the Platform Session frame while the therapist is operating inside dedicated Session Mode.

### UMW-UX-07 — Methodology-Owned Content Area

The central Methodology Workspace is the primary therapeutic working surface of the Unified Methodology Workspace.

The active methodology owns the content and methodology-specific interaction model rendered inside this area.

The Methodology Workspace MUST receive visual priority over secondary platform tools.

A methodology may use this area for any experience supported by its methodology contract, including, where applicable:

- canonical methodology content;
- investigation catalogues;
- methodology-specific navigation;
- therapist-configured lists;
- measurements;
- physical-instrument guidance;
- Therapeutic Resource interactions;
- confirmations;
- methodology-specific notes or observations where explicitly distinguished from session-level Notes;
- results;
- derived deterministic information;
- methodology completion interactions.

The methodology-owned content area MUST NOT take ownership of Platform Session concerns merely because those concerns are relevant to the methodology.

For example:

- displaying the client name does not transfer ownership of client context to the methodology;
- contributing an event does not transfer ownership of the Session Timeline;
- producing report-eligible information does not transfer ownership of Report Projection;
- completing a methodology does not transfer ownership of Platform Session Closing;
- exposing a related-methodology relationship does not transfer ownership of the Related Methodologies rail.

The active methodology MAY expose its own internal navigation or progress representation when supported by its contract.

Such controls MUST remain contained within the Methodology Workspace and MUST NOT replace session-level navigation.

The Methodology Workspace MUST adapt to the active methodology without changing the fundamental Platform Session frame.

A methodology that requires less information or fewer controls MUST be allowed to use a simpler workspace.

The platform MUST NOT fill unused methodology space with artificial controls solely to maintain visual density.

The therapist's current therapeutic task remains the visual and interaction priority of the Session Mode experience.

### UMW-UX-11 — Dedicated Therapeutic Session Visual Mode

Entering an active therapeutic session MUST transition RADIONICS from its standard application context into a dedicated Session Mode.

Session Mode is not a separate application.

It is a focused visual and interaction mode of RADIONICS designed specifically for therapeutic work.

The transition into Session Mode MUST communicate a clear change of working context:

`Application Mode → Therapeutic Session Mode`

The standard RADIONICS administrative shell may use its established dark visual language.

The active therapeutic workspace SHOULD use a warm-light visual environment based on light, warm-neutral or ivory surfaces, dark readable text and restrained gold accents.

Gold SHOULD primarily communicate hierarchy, active state, selection, progress, confirmation or other meaningful emphasis.

Gold SHOULD NOT be used as the dominant full-workspace background where doing so would reduce readability, visual calm or the distinction of highlighted actions.

Selected dark RADIONICS surfaces MAY remain in Session Mode where they provide useful continuity of product identity or persistent session context.

In particular, the Platform Session Header MAY retain a dark visual treatment while the principal therapeutic working surface uses the warm-light Session Mode treatment.

The visual transition MUST preserve RADIONICS identity while making it immediately understandable that the therapist has entered an active therapeutic working context.

While Session Mode is active, standard administrative navigation MUST NOT remain as a competing primary navigation surface.

Administrative destinations such as:

- Dashboard;
- Clients;
- Reports;
- Templates;
- Certifications;
- Specialties / Methodologies administration;
- general application settings;

MUST NOT visually compete with the therapeutic task.

Session Mode instead prioritizes:

- Platform Session context;
- active methodology;
- Related Methodologies;
- session-level therapeutic tools;
- current session actions;
- safe exit or transition from the session.

Leaving Session Mode MUST return the therapist to the appropriate RADIONICS application context without creating the perception that a different application has been closed.

A visual mode transition MUST NOT alter Platform Session lifecycle state by itself.

Entering Session Mode does not automatically start therapeutic work unless the applicable lifecycle contract says so.

Leaving the Session Mode interface does not automatically complete or cancel the Platform Session.

Visual state and domain lifecycle state MUST remain distinct.

### UMW-UX-12 — Stable Mental Model Across PC and Tablet

The Unified Methodology Workspace MUST preserve the same fundamental mental model across all supported PC and tablet layouts.

Responsive adaptation may change the spatial presentation of a capability.

It MUST NOT change its ownership, meaning or relationship to the therapeutic session.

Across supported layouts, the therapist must continue to understand:

- where the active methodology is;
- which methodology is currently active;
- where related methodologies can be accessed;
- how session-level tools are accessed;
- how contextual information is opened and dismissed;
- how to return from complementary methodology work;
- how to leave or close the session through the appropriate platform action.

The active Methodology Workspace MUST remain the primary visual surface at every supported viewport size.

Secondary capabilities MUST yield space before the active therapeutic workspace becomes operationally constrained.

On wider PC layouts, the platform MAY present:

- the Platform Session Header persistently;
- the active Methodology Workspace as the dominant central region;
- the Related Methodologies rail adjacent to the methodology workspace;
- selected session-level tools through lightweight persistent access points.

On narrower PC layouts, the platform MAY collapse secondary regions while preserving direct access to them.

The Related Methodologies rail MAY become collapsible.

Contextual detail MAY use a drawer or overlay.

Session Timeline, Notes, Transcript and Live Report MAY remain accessible through contextual tools rather than permanent regions.

On tablet landscape layouts, the active Methodology Workspace SHOULD retain the majority of available working space.

Related Methodologies and secondary session tools MAY use drawers, sheets or equivalent on-demand surfaces.

On tablet portrait layouts, the active Methodology Workspace MAY occupy the primary available width.

Related Methodologies, contextual detail and secondary session tools SHOULD be exposed on demand rather than compressed into permanent narrow columns.

Responsive adaptation MUST NOT:

- remove access to an authorized methodology relationship solely because a side rail is collapsed;
- merge contextual information with therapeutic confirmation actions;
- convert platform-owned capabilities into methodology-owned controls;
- create a different methodology lifecycle for tablet;
- imply simultaneous active methodologies;
- hide essential session lifecycle actions without an accessible equivalent;
- require a methodology to define a separate tablet-specific therapeutic workflow.

A methodology MAY adapt its internal presentation to available space where required by its own UX specification.

Such adaptation MUST remain inside the methodology-owned area and MUST preserve the methodology's approved behavioural contract.

The platform MUST NOT require exact geometric parity between PC and tablet.

It MUST require conceptual parity.

The target is therefore:

`same session architecture → adaptive spatial presentation`

rather than:

`desktop experience → separate tablet experience`

Mobile phone layouts are outside the current supported Unified Methodology Workspace target unless separately authorized by a future product decision.

### UMW-UX-13 — Platform Session Header

The Platform Session Header is the persistent platform-owned orientation surface of Therapeutic Session Mode.

Its purpose is to keep the therapist continuously oriented within the current Platform Session without competing with the active therapeutic task.

The Header MUST remain methodology-neutral.

Changing, invoking, completing or resuming a methodology MUST NOT replace the Platform Session Header.

The Header MUST provide persistent or immediately accessible orientation to the current session, including:

- client or group identity;
- therapeutic intention;
- Platform Session lifecycle state;
- active therapeutic session duration;
- active methodology identity;
- listening / transcript state, where applicable;
- safe access to session-level exit or lifecycle actions.

The Header MAY expose additional session-level information where required by an applicable Platform Session contract, provided that the information remains secondary to the active Methodology Workspace.

#### Session Identity

Client or group identity MUST remain recognizable throughout the session.

The therapist MUST NOT need to leave the active methodology experience merely to confirm which client or group the current Platform Session belongs to.

Where therapeutic intention is present, it SHOULD remain visible or immediately accessible as part of the session orientation context.

Client or group identity and therapeutic intention are Platform Session context.

A methodology MAY consume or display that context where authorized, but MUST NOT become its source of truth.

#### Session Lifecycle State

The Header MUST make the current Platform Session lifecycle state understandable where that state is relevant to therapist action.

The visual representation MUST NOT collapse distinct lifecycle states into methodology states.

In particular:

- methodology completion is not Platform Session completion;
- methodology preservation or transition is not Platform Session pause;
- leaving a methodology is not Platform Session cancellation;
- entering or leaving the Session Mode interface does not by itself change lifecycle state.

Lifecycle actions MUST be governed by the Platform Session lifecycle contract rather than by visual navigation state.

#### Active Therapeutic Session Duration

Any persistent session timer presented in the Header MUST represent Platform Session therapeutic duration.

It MUST NOT represent:

- time spent in the currently active methodology;
- time spent on the current methodology step;
- time since the current screen was opened;
- elapsed wall-clock time including periods excluded by the Platform Session timing contract.

The Header timer MUST consume the authoritative Platform Session timing semantics.

Methodology transitions MUST NOT reset the Platform Session timer.

Where the Platform Session is in a lifecycle state that does not accumulate active therapeutic duration, the timer presentation MUST reflect that state without inventing methodology-specific timing behaviour.

A methodology MAY expose methodology-specific timing only where explicitly supported by its own contract.

Such timing MUST remain visually and semantically distinct from the Platform Session therapeutic duration.

#### Active Methodology Orientation

The Header SHOULD identify the methodology currently occupying the active Methodology Workspace.

This indication exists for orientation.

It MUST NOT become methodology navigation that competes with the Related Methodologies or other platform-owned methodology composition surfaces.

Where a complementary methodology becomes active, the Header MAY update the active methodology identity while preserving the same Platform Session identity and context.

For example:

`MAP → 35 Graphs`

may change the active methodology label while client, intention, session duration and Platform Session context remain stable.

#### Listening / Transcript State

Where listening or transcription capabilities are enabled for the Platform Session, the Header SHOULD make their current state immediately understandable.

The Header MAY expose a concise listening-state control or indicator.

It MUST NOT become the primary transcript-reading surface.

Detailed transcript interaction belongs to the dedicated platform-owned transcript/listening UX.

Listening state MUST remain Platform Session context across methodology transitions unless the applicable transcript contract explicitly requires otherwise.

A methodology MUST NOT independently imply that session listening has started, paused or stopped.

#### Session-Level Exit and Lifecycle Access

The Header MUST provide a clear and safe way to access session-level exit or lifecycle actions.

The UX MUST distinguish navigation away from the current interface from domain actions such as:

- pause;
- resume;
- enter closing;
- return from closing;
- complete;
- cancel.

A generic close, back or exit affordance MUST NOT silently map to Platform Session completion or cancellation.

Potentially destructive or terminal lifecycle actions MUST remain explicit.

The detailed interaction model for exit, closing, return, completion and cancellation is defined separately by the Unified Methodology Workspace session lifecycle UX.

#### Visual Priority

The Platform Session Header SHOULD remain compact.

It MUST provide orientation without becoming a dashboard inside the therapeutic workspace.

Administrative application controls MUST NOT be reintroduced into the Header merely because they are globally available elsewhere in RADIONICS.

The visual hierarchy SHOULD prioritize:

1. session/client orientation;
2. therapeutic intention where appropriate;
3. session timing and lifecycle awareness;
4. active methodology orientation;
5. concise session-level controls.

The active Methodology Workspace remains the primary therapeutic surface.

The Header supports that work; it does not compete with it.

### UMW-UX-14 — Session Tool Access Model

The Platform Session provides a common set of session-level tools that remain available independently of the methodology currently occupying the Methodology Workspace.

Where enabled by the applicable Platform Session contracts, these tools include:

- Session Timeline;
- Notes;
- Transcript / Listening;
- Live Report / Report Projection.

These tools are platform-owned.

They MUST NOT be implemented as methodology-specific substitutes merely because a methodology consumes, contributes to or interacts with their content.

#### Common Access Surface

Session-level tools SHOULD be accessible through a consistent platform-owned access surface within Therapeutic Session Mode.

The access model MUST remain recognizable when the active methodology changes.

For example, moving from:

`MAP → 35 Graphs → MAP`

MUST NOT cause Timeline, Notes, Transcript or Live Report to move to unrelated locations or adopt methodology-specific navigation patterns.

The common access surface MAY use:

- compact tabs;
- labelled icons;
- a contextual tool bar;
- a collapsible tool strip;
- another consistent low-footprint interaction pattern.

The final visual representation MAY adapt to available viewport space.

Its conceptual role MUST remain stable.

#### Workspace Priority

Opening a session-level tool MUST NOT permanently displace the active Methodology Workspace unless the therapist explicitly chooses an interaction that requires a larger dedicated surface.

The Methodology Workspace remains the primary therapeutic working area.

On layouts with sufficient space, a session tool MAY open adjacent to the methodology workspace.

On constrained layouts, it MAY open as:

- a drawer;
- a sheet;
- an overlay;
- a temporary expanded panel;
- another equivalent contextual surface.

Closing the tool MUST restore the therapist to the same active methodology context.

Opening or closing a session tool MUST NOT, by itself:

- change the active methodology;
- alter methodology execution state;
- advance methodology navigation;
- change Platform Session lifecycle state;
- create or approve therapeutic evidence;
- alter Report Projection inclusion.

#### Session Timeline

The Session Timeline is the platform-owned chronological view of relevant session activity.

It SHOULD allow the therapist to understand how the therapeutic session developed across methodology boundaries.

Where supported by the underlying Timeline contract, entries may originate from:

- the Platform;
- a Methodology;
- the Therapist.

Timeline presentation SHOULD preserve enough provenance to distinguish the origin and context of an event.

Methodology transitions SHOULD be understandable in the Timeline.

For example:

`MAP preserved → 35 Graphs active → 35 Graphs completed → MAP resumed`

may appear as part of the same Platform Session history.

The Timeline MUST NOT imply that every internal UI interaction is therapeutically significant or report-eligible.

Timeline visibility does not imply Report Projection inclusion.

#### Notes

Session-level Notes provide a platform-owned note-taking capability for the therapeutic session.

They remain available across methodology transitions.

A therapist MUST be able to access session-level Notes without leaving the Platform Session or losing methodology-owned state.

Where the underlying Notes contract distinguishes note disposition, provenance or other semantics, the UX MUST preserve those distinctions.

A methodology MAY expose methodology-specific observations where its contract requires them.

Such observations MUST remain distinguishable from platform-owned session-level Notes when their semantics differ.

Opening Notes MUST NOT automatically associate a note with the active methodology unless the applicable contract explicitly defines that provenance.

The UX MUST NOT silently convert a session-level note into:

- a Methodology Result;
- a Measurement;
- a Session Fact;
- a Report Projection section;
- a methodology completion condition.

#### Transcript / Listening

Transcript / Listening is a platform-owned session capability.

The common session-tool access surface MAY provide access to the detailed Transcript experience.

A concise listening state may also remain visible in the Platform Session Header as defined by UMW-UX-13.

The detailed Transcript surface MUST remain distinct from the active methodology experience.

Methodology transitions MUST NOT create independent transcripts for each methodology unless an explicit transcript contract requires such behaviour.

Transcript text MUST NOT be treated as therapist-confirmed methodology evidence merely because it was captured during methodology work.

The detailed interaction model for Listening and Transcript is defined by UMW-UX-15.

#### Live Report / Report Projection

Live Report provides therapist access to the evolving report context of the current Platform Session.

It MUST remain conceptually distinct from:

- Session Timeline;
- Notes;
- Transcript;
- methodology-owned state;
- raw methodology contributions;
- methodology completion.

Opening Live Report MUST NOT automatically include currently visible session evidence in Report Projection.

The UX MUST preserve the distinction between information that exists in the session and information that has been included or approved for the client-facing report according to the applicable reporting contracts.

Methodologies MAY contribute report-eligible information through their approved contracts.

They MUST NOT independently own or replace the platform-level Live Report surface.

Switching methodologies MUST preserve the same Platform Session report context.

#### Tool Independence

Timeline, Notes, Transcript and Live Report are related session capabilities but MUST remain semantically distinct.

The UX MUST NOT merge them into a single undifferentiated activity stream.

In particular:

- a Timeline event is not automatically a Note;
- a Note is not automatically Transcript content;
- Transcript content is not automatically a Session Fact or Methodology Result;
- a methodology contribution is not automatically included in Live Report;
- visibility in any session tool is not equivalent to therapeutic confirmation.

The platform MAY provide navigation or cross-reference between these capabilities where supported by the applicable contracts.

Such navigation MUST preserve provenance and MUST NOT silently transform one information type into another.

#### Methodology Continuity

Session-level tools belong to the Platform Session rather than to the active methodology.

Therefore, changing methodologies MUST preserve access to the same session-level tool context.

If the therapist opens a session tool, reviews information and returns to the Methodology Workspace, the active methodology SHOULD remain at the same preserved working context unless an explicit therapist action or applicable contract requires otherwise.

The therapist should experience session-level tools as supporting surfaces around the therapeutic work, not as destinations that interrupt or replace the session.

### UMW-UX-15 — Listening & Transcript Interaction Surface

Listening and Transcript are Platform Session capabilities that support the therapist during therapeutic work without becoming part of any individual methodology.

The UX MUST preserve the distinction between:

- listening / capture state;
- provisional live transcription;
- confirmed transcript content;
- methodology-owned evidence;
- session-level Notes;
- Report Projection.

These concepts MUST NOT be visually or behaviourally collapsed into one another.

#### Listening Modes

Where enabled by the applicable Platform Session transcript contract, the UX MUST support the distinction between:

- `full_session`;
- `point_in_time`.

The active listening mode MUST be understandable to the therapist whenever capture is occurring.

The platform MUST NOT silently change from one listening mode to another.

A methodology MUST NOT independently select or change the Platform Session listening mode.

#### Full-Session Listening

`full_session` represents therapist-controlled listening across an extended portion of the Platform Session.

Starting full-session listening MUST require an explicit therapist action.

While full-session listening is active, the therapist MUST be able to understand that capture is occurring without leaving the active Methodology Workspace.

The UX MUST provide access to the transcript lifecycle actions supported by the applicable contract, including:

- start;
- pause;
- resume;
- stop.

These controls MUST remain platform-owned.

Changing methodologies MUST NOT, by itself, stop or restart full-session listening.

If listening remains valid across the methodology transition, its state MUST remain continuous as Platform Session context.

The UX MUST NOT imply that full-session listening belongs to the methodology that happened to be active when capture started.

#### Point-in-Time Capture

`point_in_time` represents an explicit capture of a bounded therapeutic moment rather than continuous session listening.

Starting a point-in-time capture MUST require an explicit therapist action.

The UX MUST make it understandable that the therapist is capturing a specific interval rather than starting full-session listening.

Point-in-time capture MUST NOT silently:

- start `full_session` listening;
- resume a paused `full_session` capture;
- replace the current listening mode;
- merge its lifecycle with full-session listening;
- create methodology evidence merely because a methodology is active.

Where both modes are available in the same Platform Session, their state and controls MUST remain distinguishable.

#### Listening State in the Session Header

The Platform Session Header MAY expose a concise listening indicator and direct access to the most relevant listening action.

The indicator SHOULD make states such as the following understandable where supported by the underlying contract:

- not listening;
- listening;
- paused.

The Header MUST NOT attempt to display the complete transcript.

Detailed transcript review and management belongs to the dedicated Transcript surface.

A listening indicator MUST remain understandable across methodology transitions.

#### Live Transcription Surface

When live transcription is available during active capture, the platform MAY expose a compact live transcription surface within the Session Mode frame.

This surface exists to provide immediate awareness of currently recognized speech while allowing the therapist to remain focused on the active methodology.

The live transcription surface SHOULD remain visually secondary to the Methodology Workspace.

On layouts where appropriate, it MAY appear as a compact bottom session bar or equivalent low-footprint surface.

For example, conceptually:

`Listening ●   “…currently recognized speech…”`

The exact geometry is not defined by this architecture.

The live transcription surface MUST represent provisional transcription state.

Provisional live text MUST NOT be visually represented as though it were already confirmed persistent transcript content.

The UX SHOULD communicate provisionality without requiring the therapist to understand implementation details.

The live surface MUST NOT automatically transform recognized speech into:

- a Session Fact;
- a Methodology Result;
- a Measurement;
- a session-level Note;
- a Report Projection section;
- a methodology completion condition.

#### Confirmed Transcript Content

Only transcript content recognized as confirmed according to the applicable transcript contract may be presented as confirmed persisted transcript content.

The UX MUST preserve the distinction between provisional live text and confirmed transcript content.

If provisional text disappears, changes or is replaced before confirmation, the UX MUST NOT imply that confirmed session information has been deleted.

The detailed Transcript surface SHOULD allow the therapist to understand which content belongs to the persisted transcript record where the underlying contract exposes that distinction.

Confirmation of transcript content MUST NOT, by itself, constitute therapeutic confirmation of the meaning of that speech.

Confirmed transcript content remains transcript content unless another explicit contract and therapist action transforms or references it as another information type.

#### Transcript Review

The detailed Transcript surface SHOULD allow the therapist to review confirmed transcript content without abandoning the active Platform Session.

Opening Transcript review MUST preserve the active methodology context.

Closing Transcript review MUST return the therapist to the same methodology-owned working context unless another explicit action has changed it.

Transcript review MAY provide chronological orientation where supported by the underlying transcript contract.

It MUST NOT present transcript text as though it were methodology-authored content.

Where methodology context is associated with a transcript interval by an approved contract, that relationship MAY be displayed as provenance.

Such provenance MUST NOT imply that the methodology confirmed the spoken content.

#### Methodology Transitions During Listening

A methodology transition MUST NOT create an artificial transcript boundary merely because the active Methodology Workspace changed.

For example:

`MAP → 35 Graphs → MAP`

may occur during one continuous full-session listening period.

Where the transcript contract permits continuous listening, the Platform Session maintains the listening context across that transition.

The platform MAY preserve methodology provenance associated with relevant intervals where supported by the underlying contract.

It MUST NOT split one Platform Session transcript into independent methodology-owned transcripts solely for presentation convenience.

#### Session Lifecycle Interaction

Listening and transcript controls MUST respect Platform Session lifecycle rules.

The UX MUST NOT assume that visual navigation away from the current methodology is equivalent to pausing or stopping listening.

Likewise, stopping listening MUST NOT automatically:

- pause the Platform Session;
- enter Platform Session Closing;
- complete the Platform Session;
- complete the active methodology.

Where a Platform Session lifecycle transition requires listening to stop, pause or otherwise change state, the UX MUST follow the applicable lifecycle and transcript contracts.

It MUST NOT invent an independent lifecycle rule.

#### Therapist Control and Awareness

The therapist MUST remain in explicit control of listening initiation and capture mode.

The platform MUST provide sufficient persistent awareness to avoid ambiguity about whether extended listening is currently active.

Listening controls SHOULD remain rapidly accessible without dominating the therapeutic workspace.

The experience should allow the therapist to benefit from transcription while continuing to work primarily inside the Methodology Workspace.

Listening supports the session.

It does not become the session.

### UMW-UX-16 — Session Exit, Closing and Return

Therapeutic Session Mode MUST provide clear and safe interaction paths for leaving the current interface and for performing Platform Session lifecycle actions.

The UX MUST preserve a strict distinction between:

- leaving the Session Mode interface;
- pausing the Platform Session;
- resuming the Platform Session;
- entering Platform Session Closing;
- returning from Closing to therapeutic work;
- completing the Platform Session;
- cancelling the Platform Session.

These actions have different meanings and MUST NOT be collapsed into a single generic exit behaviour.

#### Leaving the Session Mode Interface

Leaving the Session Mode interface is a navigation action.

It MUST NOT, by itself:

- complete the Platform Session;
- cancel the Platform Session;
- complete the active methodology;
- discard methodology-owned state;
- discard session-level state;
- stop listening unless required by an applicable contract;
- enter Platform Session Closing.

A generic back, close or exit affordance MUST therefore be interpreted as navigation unless the therapist explicitly selects a lifecycle action.

Where leaving the interface while therapeutic work remains active requires an explicit lifecycle decision under the applicable Platform Session contract, the UX MUST present that decision rather than silently infer it.

The therapist MUST be able to understand the resulting Platform Session state before leaving.

Returning later to a resumable Platform Session SHOULD restore the appropriate Platform Session context and preserved methodology execution state according to the applicable contracts.

#### Pause

Pause is an explicit Platform Session lifecycle action.

The UX MUST distinguish Pause from:

- leaving the interface;
- preserving a methodology while another methodology becomes active;
- pausing listening or transcription;
- entering Closing.

Pausing the Platform Session MUST use the authoritative Platform Session lifecycle transition.

The UX MUST NOT simulate a paused Platform Session merely by disabling or hiding the Methodology Workspace.

When the Platform Session is paused, the interface SHOULD make that state clearly understandable.

Actions unavailable while paused MUST NOT appear to remain operational.

Session timing MUST follow the authoritative Platform Session timing contract.

Pausing the Platform Session MUST NOT be visually represented as completion.

#### Resume

Resume is an explicit transition from a resumable paused Platform Session state back to active therapeutic work.

Resuming MUST restore the Platform Session according to the authoritative lifecycle contract.

Where methodology-owned state has been preserved, the therapist SHOULD return to the appropriate preserved methodology context rather than beginning an unrelated new methodology experience.

Resume MUST NOT:

- create a new Platform Session;
- reset Platform Session therapeutic duration;
- restart a methodology from its beginning unless required by its contract;
- automatically restart listening unless required by the applicable transcript contract.

The UX SHOULD make continuity evident.

#### Entering Closing

Entering Closing represents the therapist's explicit decision to begin the Platform Session closing process.

Closing is a Platform Session lifecycle state.

It is not merely:

- opening the Live Report;
- completing a methodology;
- viewing session results;
- stopping listening;
- leaving the Session Mode interface.

The transition into Closing MUST therefore require an explicit therapist action governed by the Platform Session lifecycle contract.

The Closing experience MAY provide access to the information and actions required to review and prepare the session for completion, according to applicable Platform Session and reporting contracts.

Entering Closing MUST NOT itself mean that the Platform Session has been completed.

The UX MUST make that distinction understandable.

#### Closing Is Reversible Until Completion

Platform Session Closing MUST NOT be designed as an irreversible terminal screen where the authoritative lifecycle permits return to therapeutic work.

Where the Platform Session contract permits:

`closing → in_progress`

the UX MUST provide a clear therapist-controlled path to return to the active therapeutic workspace.

Returning from Closing MUST NOT create a new Platform Session.

The existing Platform Session identity, context and preserved methodology state MUST remain authoritative.

Where a methodology execution remains valid for continuation, the therapist SHOULD return to the relevant preserved methodology context.

Returning from Closing MUST NOT silently:

- discard closing-stage review work;
- reset Platform Session timing history;
- create a duplicate methodology execution;
- automatically restart listening;
- alter Report Projection inclusion without an explicit applicable action.

Any timing behaviour associated with returning from Closing MUST follow the authoritative Platform Session timing contract.

#### Completing the Platform Session

Completion is an explicit terminal Platform Session lifecycle action.

The UX MUST NOT infer completion from:

- completion of the active methodology;
- completion of all currently visible methodology work;
- opening or finalizing a Live Report view;
- stopping Transcript / Listening;
- leaving Session Mode;
- entering Closing.

Where completion prerequisites exist, the UX SHOULD make unresolved prerequisites understandable before the therapist attempts completion.

The therapist MUST explicitly invoke the completion action.

The platform MUST apply the authoritative lifecycle and validation contracts before presenting the Platform Session as completed.

A failed completion attempt MUST NOT visually imply successful completion.

Once completion succeeds, the UX MAY transition away from active Therapeutic Session Mode to an appropriate post-session context.

That visual transition follows the successful domain transition; it does not create it.

#### Cancelling the Platform Session

Cancellation is an explicit terminal lifecycle action distinct from completion.

Cancellation MUST NOT be represented as an ordinary navigation action.

The UX MUST clearly communicate that cancellation changes the lifecycle state of the Platform Session.

Where a cancellation reason is supported or required by the applicable contract, the UX MUST collect it according to that contract.

The platform SHOULD require explicit confirmation before performing cancellation.

Cancellation MUST NOT be triggered merely because the therapist:

- closes the Session Mode interface;
- navigates back to the application;
- pauses the session;
- stops listening;
- leaves a methodology;
- removes a complementary methodology from active focus.

A cancelled Platform Session MUST NOT be visually represented as successfully completed therapeutic work.

#### Methodology Completion and Session Completion

Methodology completion and Platform Session completion are separate concepts.

Completing a methodology MUST NOT automatically complete the Platform Session.

The therapist may complete one methodology and:

- continue with another authorized methodology;
- return to another preserved methodology;
- review session-level tools;
- enter Closing;
- perform another valid Platform Session action.

Likewise, entering Platform Session Closing MUST NOT automatically mark every participating methodology as completed.

Each methodology execution retains the status defined by its own execution contract.

The UX MUST preserve this distinction wherever methodology and session status are presented together.

#### Listening During Exit and Closing

Listening / Transcript lifecycle remains distinct from Platform Session lifecycle.

Navigation away from the current methodology MUST NOT automatically stop listening.

Likewise, stopping listening MUST NOT automatically pause, close, complete or cancel the Platform Session.

Where entering Pause, Closing, Completion or Cancellation requires a listening-state transition, the UX MUST apply the applicable transcript and Platform Session contracts.

If therapist action is required, the UX MUST request that action explicitly.

The platform MUST NOT silently invent transcript behaviour merely to simplify the exit flow.

#### Safe Action Hierarchy

Session lifecycle actions MUST use a visual hierarchy appropriate to their consequence.

Routine actions, reversible lifecycle transitions and terminal actions SHOULD remain distinguishable.

In particular:

- navigation away from the interface;
- Pause;
- Enter Closing;
- Complete Session;
- Cancel Session;

MUST NOT be presented as semantically equivalent actions.

Terminal or destructive actions SHOULD require stronger intentionality than routine navigation.

The UX MUST avoid accidental completion or cancellation while preserving efficient access to routine session actions.

#### Return to Application Mode

After the therapist legitimately leaves active Therapeutic Session Mode, RADIONICS MAY return to the appropriate Application Mode context.

The destination MAY depend on the action that caused the transition and the applicable product flow.

For example, a successful Platform Session completion may lead to a session summary or session record context, while ordinary navigation from a resumable session may return to the relevant application workspace.

This UX architecture does not define the final destination screen for every exit path.

It does require that the destination accurately reflect the authoritative Platform Session lifecycle state.

The transition:

`Therapeutic Session Mode → Application Mode`

MUST therefore remain a visual/navigation consequence of the therapist's action and resulting domain state, not a substitute for lifecycle execution.

#### Core Exit Principle

The therapist must always be able to distinguish:

**“I am leaving this screen”**

from:

**“I am changing the state of this therapeutic session.”**

The platform MUST never rely on visual navigation alone to infer a terminal therapeutic decision.
