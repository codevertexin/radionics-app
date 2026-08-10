---
title: MAP — UX Architecture
document_id: MAP-UX-ARCHITECTURE
version: 1.0
status: APPROVED
classification: Canonical UX Architecture
methodology: MAP
depends_on:
  - MAP-EXPERIENCE-BACKLOG
  - Unified Methodology Workspace — UX Architecture
  - RADIONICS-PRODUCT-CONSTITUTION
  - RADIONICS-PLATFORM-UX-BACKLOG
  - RADIONICS-PRODUCT-DECISIONS
---

# MAP — UX Architecture

## 1. Purpose

This document defines the methodology-specific UX architecture for MAP inside the RADIONICS Unified Methodology Workspace.

It translates the approved MAP Experience Backlog into a coherent therapeutic workspace experience without redefining:

- Platform Session behaviour;
- Unified Methodology Workspace ownership;
- Platform Session lifecycle;
- session-level methodology composition;
- Related Methodologies behaviour;
- Session Timeline;
- session-level Notes;
- Transcript / Listening;
- Live Report / Report Projection;
- Platform Session Closing.

MAP remains responsible only for the methodology-owned therapeutic experience rendered inside the Methodology Workspace.

The purpose of this architecture is to ensure that MAP-001 through MAP-012:

- form one coherent methodology journey;
- use a consistent visual and interaction language;
- preserve therapist authority;
- preserve the exact therapeutic flow defined by the approved MAP Experience Backlog;
- adapt appropriately to PC and tablet layouts;
- consume platform-owned capabilities without reproducing or redefining them;
- support methodology-specific complexity without changing the surrounding Platform Session architecture.

This document does not replace the MAP Experience Backlog.

The Experience Backlog remains authoritative for therapeutic sequence, methodology semantics, supported actions, completion conditions, evidence boundaries and methodology-specific constraints.

This document defines how those approved experiences are organized and presented as UX.

---

## 2. Authority and Scope

### 2.1 Authority

This document consumes the following authorities:

1. RADIONICS Product Vision & Experience Constitution;
2. RADIONICS Platform UX Backlog;
3. RADIONICS Product Decisions;
4. Unified Methodology Workspace — UX Architecture;
5. MAP — Experience Backlog;
6. applicable Platform Session architecture and contracts.

Where this document conflicts with a higher authority, the higher authority prevails.

Where the MAP Experience Backlog does not define therapeutic behaviour sufficiently for deterministic UX design, this document MUST NOT invent that behaviour.

Methodology ambiguities remain subject to the applicable MAP Methodology Clarification process.

### 2.2 In Scope

This document defines:

- the overall MAP methodology journey inside the Unified Methodology Workspace;
- MAP-specific experience families;
- shared MAP workspace patterns;
- methodology-specific orientation and progression;
- visual and interaction relationships between MAP experiences;
- MAP investigation catalogue behaviour at UX level;
- MAP investigation-element workspace behaviour at UX level;
- MAP investigation-cycle continuity;
- presentation of MAP-specific measurements;
- presentation of canonical MAP protocols;
- methodology-specific progressive disclosure;
- methodology-specific PC and tablet adaptation;
- transition between MAP methodology states while preserving Platform Session context;
- MAP completion hand-back to the Platform Session.

### 2.3 Out of Scope

This document does not define:

- Platform Session visual shell;
- Platform Session Header ownership or lifecycle semantics;
- Related Methodologies platform behaviour;
- Session Methodology Journey architecture;
- platform-level Session Timeline behaviour;
- platform-level Notes behaviour;
- Transcript / Listening lifecycle;
- Live Report ownership;
- Report Projection rules;
- Platform Session Closing behaviour;
- database schema;
- persistence implementation;
- API contracts;
- implementation technology;
- final component code;
- therapeutic behaviour not already supported by the approved MAP Experience Backlog.

The MAP UX MUST consume the Unified Methodology Workspace rather than recreate it.

---

## 3. Relationship to the Unified Methodology Workspace

MAP executes as a methodology-owned experience inside the RADIONICS Unified Methodology Workspace.

The Platform Session remains the stable therapeutic environment.

MAP owns only the content and methodology-specific interaction required to perform MAP therapeutic work.

The Platform Session continues to own:

- client or group identity;
- therapeutic intention as session context;
- Platform Session lifecycle;
- therapeutic session timing;
- active methodology identity;
- methodology composition;
- Related Methodologies;
- Session Timeline;
- session-level Notes;
- Transcript / Listening;
- Live Report / Report Projection;
- session-level lifecycle and exit actions;
- Platform Session Closing.

MAP MAY display or consume relevant platform-owned context where required by the MAP experience.

Such use MUST NOT transfer ownership to MAP.

For example:

- displaying the therapeutic intention inside MAP does not make MAP the source of truth for that intention;
- displaying the initial Hawkins measurement later in the MAP journey does not make the measurement a global platform calculation;
- contributing MAP work events does not transfer ownership of the Session Timeline;
- producing report-eligible MAP evidence does not give MAP ownership of Report Projection;
- completing MAP does not complete the Platform Session.

The MAP experience MUST remain inside the common methodology envelope defined by the Unified Methodology Workspace.

It MUST NOT introduce:

- an independent application shell;
- a methodology-specific Platform Session Header;
- a separate session timer;
- a competing Related Methodologies sidebar;
- a separate session-level Timeline;
- a separate platform Notes system;
- a methodology-owned transcript system;
- an independent client-facing report builder;
- a methodology-specific Platform Session Closing flow.

MAP-specific navigation and progress MAY exist inside the methodology-owned workspace where required by the MAP therapeutic flow.

Such controls MUST remain subordinate to the Platform Session architecture.

---

## 4. MAP UX Principles

The following principles apply to all MAP experiences.

### MAP-UX-P01 — Therapist Authority

The therapist remains the authoritative actor for therapeutic interpretation and confirmation.

The MAP UX MUST NOT independently:

- interpret pendulum movement;
- interpret a radiesthetic clock;
- infer an energetic result;
- select a therapeutic investigation element;
- determine whether MAP activation occurred;
- determine whether a resource should be activated;
- confirm a methodology result;
- determine whether investigation should continue;
- infer therapeutic success, failure or effectiveness.

Where a therapeutic fact, result, measurement or completion state requires therapist confirmation, the UX MUST preserve that explicit action.

### MAP-UX-P02 — Physical and Digital Roles Remain Distinct

MAP contains physical methodology artifacts, physical instruments, spoken protocols and digital support.

The UX MUST preserve the distinction between them.

The digital workspace may:

- present information;
- guide sequence;
- display canonical content;
- record therapist-confirmed facts;
- preserve methodology state;
- support navigation;
- provide contextual knowledge.

It MUST NOT represent itself as physically or energetically performing actions that belong to the therapist or physical methodology practice.

### MAP-UX-P03 — Canonical Content Remains Canonical

Where MAP defines canonical wording or ordered methodology protocol, the UX MUST preserve that authoritative content.

The UX MUST NOT:

- rewrite it;
- summarize it;
- paraphrase it;
- reorder required segments;
- replace it with AI-generated wording;
- convert canonical protocol content into a Therapeutic Resource merely because it has therapeutic significance.

Canonical protocol presentation SHOULD optimize readability and therapist focus without altering methodology content.

### MAP-UX-P04 — Selection Is Not Confirmation

MAP uses several semantically distinct states.

The UX MUST preserve distinctions such as:

- visible;
- consulted;
- selected;
- identified;
- measured;
- used;
- activated;
- confirmed;
- completed.

One state MUST NOT visually or behaviourally imply another unless the applicable MAP contract explicitly defines that consequence.

In particular:

- selection does not imply activation;
- identification does not imply activation;
- measurement does not imply activation;
- speaking does not imply completion;
- viewing canonical content does not imply performance;
- opening an investigation element does not imply therapeutic use.

### MAP-UX-P05 — Progressive Guidance, Not Software-Led Therapy

The MAP UX should guide the therapist through the approved methodology without turning MAP into a rigid software questionnaire.

The platform MAY organize information and make the next valid interaction understandable.

It MUST NOT choose the therapeutic path for the therapist where the methodology preserves therapist intuition, pendulum-led selection or contextual judgement.

Guidance must therefore remain supportive rather than prescriptive.

### MAP-UX-P06 — Calm Therapeutic Focus

The active MAP task should remain visually dominant.

Secondary information SHOULD use progressive disclosure.

The workspace SHOULD avoid:

- unnecessary modal interruption;
- administrative visual noise;
- excessive simultaneous controls;
- irrelevant actions;
- technical terminology where therapist-facing methodology language is sufficient;
- visual density that competes with physical therapeutic work.

The therapist should be able to move attention between the client, physical MAP, pendulum and digital workspace without losing context.

### MAP-UX-P07 — Reuse Without Artificial Uniformity

MAP should reuse common interaction patterns where the therapeutic structure is genuinely similar.

Shared UX patterns MAY support:

- preparation;
- canonical protocol presentation;
- Hawkins measurement;
- investigation catalogue;
- investigation-element work;
- investigation-cycle decisions.

However, shared patterns MUST NOT force different therapeutic behaviours into identical controls.

A MAP experience exposes only the actions and information applicable to its approved methodology contract.

### MAP-UX-P08 — Methodology Evidence Remains Traceable

Therapist-confirmed MAP facts, measurements, results, work instances and completion events must remain semantically traceable.

Repeated work with the same investigation element MUST NOT erase or overwrite prior work instances where the Experience Backlog requires independent traceability.

MAP evidence remains separate from Report Projection.

Preserving evidence in the session does not automatically publish it to the client-facing report.

### MAP-UX-P09 — One MAP Journey Inside One Platform Session

MAP-001 through MAP-012 form one MAP methodology journey.

That methodology journey exists inside a broader Platform Session.

MAP methodology completion MUST remain distinct from Platform Session completion.

The MAP UX MUST preserve Platform Session continuity if the therapist:

- opens a platform-owned session tool;
- invokes an authorized complementary methodology;
- later returns to MAP;
- pauses and resumes according to applicable platform contracts.

### MAP-UX-P10 — PC and Tablet Conceptual Parity

MAP must preserve the same therapeutic meaning and interaction model across supported PC and tablet layouts.

Responsive adaptation MAY change:

- density;
- column count;
- card arrangement;
- visibility of secondary information;
- use of drawers or sheets;
- catalogue presentation.

It MUST NOT change:

- therapeutic sequence;
- therapist authority;
- evidence semantics;
- available methodology actions;
- confirmation requirements;
- methodology lifecycle;
- resource classification.

Mobile phone layouts remain outside the current MAP target unless separately authorized.

---

## 5. MAP Experience Architecture

### 5.1 Overall Journey

The approved MAP methodology journey consists of twelve experiences:

`MAP-001 → MAP-002 → MAP-003 → MAP-004 → MAP-005 → MAP-006`

followed by the therapeutic investigation cycle:

`MAP-007 → MAP-008 → MAP-009`

where:

`MAP-009 = Yes → MAP-007`

and:

`MAP-009 = No → MAP-010`

followed by:

`MAP-010 → MAP-011 → MAP-012`

Therefore, MAP is not a strictly linear twelve-screen workflow.

The overall journey also contains an explicit activation-recovery path at MAP-005.

MAP-005 may therefore produce:

`all required confirmations = Yes → MAP-006`

or, according to the applicable MAP recovery rule:

`activation confirmation = No → MAP-001`

Where the client-connection or complete-activation confirmation is No, the therapist may follow the recovery options defined by the approved MAP Experience Backlog, including:

- restarting the MAP preparation journey from MAP-001; or
- pausing or waiting where the therapist determines that this is required according to the methodology.

Returning to MAP-001 begins a renewed preparation and activation attempt inside the same Platform Session.

Existing Platform Session information MUST remain preserved.

Previously completed MAP preparation experiences that must be repeated MUST require renewed therapist confirmation according to the Experience Backlog.

A recovery path MUST NOT be presented as:

- a technical error;
- a failed application state;
- creation of a new Platform Session;
- automatic cancellation of MAP;
- automatic determination by the platform of how long the therapist should wait.

Only after all MAP-005 confirmations required for progression are explicitly recorded as Yes may the MAP journey continue to MAP-006.

It consists of:

1. preparation;
2. opening and MAP activation;
3. initial measurement;
4. an iterative investigation cycle;
5. post-investigation protocol;
6. final measurement and deterministic comparison;
7. methodology closing and hand-back to the Platform Session.

The UX MUST make the therapist's current position understandable without implying that every MAP experience is equivalent to a conventional software wizard step.

### 5.2 Experience Families

For UX architecture purposes, MAP experiences are grouped into shared families according to their dominant therapeutic interaction.

#### Guided Preparation

Includes:

- MAP-001 — Align the Therapeutic Intention;
- MAP-002 — Prepare the Sacred Space;
- MAP-003 — Prepare the Testimony.

These experiences progressively establish the therapeutic and physical preparation required before MAP opening and activation.

The UX should prioritize:

- calm orientation;
- session context;
- concise guidance;
- therapist-entered or therapist-confirmed information;
- minimal interruption;
- simple progression.

#### Canonical Protocol

Includes primarily:

- MAP-004 — Perform the Opening Prayer;
- MAP-005 — Activate the MAP and Confirm the Connection;
- MAP-010 — Request Continued Treatment During Sleep;
- MAP-012 — Close and Energetically Disconnect the MAP.

These experiences contain canonical methodology wording or ordered therapeutic protocol.

Their UX should prioritize:

- readability;
- exact canonical content;
- correct sequence;
- therapist focus while speaking or performing physical actions;
- explicit confirmation;
- minimal competing controls.

Individual experiences may add experience-specific interactions, such as the three explicit activation confirmations in MAP-005.

#### Hawkins Measurement

Includes:

- MAP-006 — Record the Initial Hawkins Level;
- MAP-011 — Record the Final Hawkins Level.

These experiences share the same canonical Hawkins reference model and should use one coherent measurement interaction pattern.

MAP-011 extends the pattern by presenting the deterministic relationship between the initial and final therapist-confirmed measurements.

The UX MUST preserve the distinction between:

- the Hawkins reference model;
- the therapist-operated Physical Instrument;
- the selected but unconfirmed value;
- the therapist-confirmed measurement;
- the deterministic initial-to-final comparison.

#### Investigation Catalogue

Primarily represented by:

- MAP-007 — Choose the Therapeutic Investigation Path.

This experience is a flexible navigation and discovery surface.

It MUST support access to MAP investigation elements without imposing:

- one permanent investigation mode;
- one mandatory therapeutic route;
- automated recommendations;
- a universal Therapeutic Resource classification.

The therapist remains free to use the approved pendulum-guided, direct, intuitive, organized or combined investigation approaches.

#### Investigation Element Work

Primarily represented by:

- MAP-008 — Work with the Selected MAP Investigation Element.

This is the most adaptive MAP workspace pattern.

The selected element remains the primary therapeutic focus.

Available actions MUST derive from the element's authoritative classification and applicable MAP Methodology Resource Binding.

The UX MUST NOT expose controls merely because the platform technically supports them.

For example, activation controls appear only when Therapeutic Resource Activation is explicitly supported.

#### Investigation Cycle Decision

Primarily represented by:

- MAP-009 — Continue or Complete the MAP Investigation Cycle.

This experience provides a deliberate decision point after a completed MAP-008 work instance.

The UX presents the official continuation question and records the therapist's explicit Yes or No response.

`Yes` returns to MAP-007.

`No` completes the current MAP investigation cycle and proceeds to MAP-010.

The UX MUST NOT select or recommend the next investigation element as a consequence of Yes.

### 5.3 MAP Investigation Cycle

The central therapeutic loop of MAP is:

`MAP-007 → MAP-008 → MAP-009`

A complete iteration represents:

1. therapist selection of an investigation element;
2. methodology-specific work with that selected element;
3. therapist determination of whether additional investigation remains.

If additional work remains:

`MAP-009 Yes → MAP-007`

A new investigation element is selected explicitly.

The next element MAY be identified through a different approved investigation approach from the previous iteration.

If no additional work remains:

`MAP-009 No → MAP-010`

The current investigation cycle is complete.

The UX MUST preserve all previous completed work instances.

Repeated work with the same element MUST remain independently traceable where required by the applicable MAP classification and contract.

The cycle MUST NOT become an automated recommendation loop.

The platform does not determine:

- which element should be selected next;
- whether the same element should be revisited;
- which investigation approach should be used;
- whether the therapeutic route is complete.

Those decisions remain therapist-controlled.

### 5.4 MAP Investigation Journey vs Session Methodology Journey

The MAP Investigation Journey and the Platform Session Methodology Journey are different concepts.

The Platform Session Methodology Journey describes methodology participation across the broader therapeutic session.

For example:

`MAP → 35 Graphs → MAP`

It answers:

**Which methodologies have participated in this Platform Session?**

The MAP Investigation Journey exists inside the MAP methodology execution.

For example:

`Emotional Causes → work instance → Chakras → work instance → Emotional Causes → work instance`

It answers:

**What investigation elements and work instances have formed this MAP therapeutic investigation?**

The UX MUST NOT merge these two journeys.

The MAP Investigation Journey is methodology-owned context.

The Session Methodology Journey is platform-owned context.

MAP MAY contribute methodology events to the Platform Session Timeline according to the applicable platform contract.

That contribution MUST NOT transfer ownership of the Session Methodology Journey to MAP.

Likewise, invoking a complementary methodology during MAP MUST NOT be represented as another MAP investigation element.

A complementary methodology remains a separate Methodology Execution participating in the same Platform Session.

### 5.5 MAP Completion Boundary

MAP-012 completes the active MAP methodology journey.

It does not complete the Platform Session.

After valid MAP completion:

- the MAP methodology execution is completed;
- MAP evidence remains preserved;
- the completed MAP journey remains reviewable according to applicable platform rules;
- control returns to the Platform Session.

The Platform Session may then expose authorized next actions such as:

- review the completed MAP journey;
- continue therapeutic work in the current session;
- invoke an authorized complementary methodology;
- proceed to Platform Session Closing.

The MAP UX MUST NOT choose that next action automatically.

The therapist remains authoritative over what happens next in the broader Platform Session.

## 6. Shared MAP Workspace Patterns

Shared MAP Workspace Patterns define reusable UX structures for MAP experiences that share a genuine interaction model.

A shared pattern:

- establishes common visual and interaction behaviour;
- reduces unnecessary variation between related MAP experiences;
- preserves therapist orientation across the methodology journey;
- may be specialized by an individual MAP experience;
- does not override the therapeutic flow or acceptance criteria of that experience.

Patterns are UX architecture.

They MUST NOT create methodology behaviour that is absent from the approved MAP Experience Backlog.

An experience MAY consume more than one shared pattern where its approved therapeutic behaviour genuinely requires it.

### MAP-PATTERN-01 — Guided Preparation

#### Purpose

Guided Preparation provides the common UX structure for the MAP experiences that prepare the therapeutic context before opening and activation.

It is primarily consumed by:

- MAP-001 — Align the Therapeutic Intention;
- MAP-002 — Prepare the Sacred Space;
- MAP-003 — Prepare the Testimony.

The pattern should help the therapist prepare deliberately while keeping the software visually quiet and subordinate to the therapeutic process.

Guided Preparation MUST NOT transform MAP preparation into a generic administrative setup wizard.

#### Core Workspace Model

The Guided Preparation workspace should prioritize three conceptual regions:

1. **Current Preparation Focus**
2. **Contextual Guidance**
3. **Explicit Progression Action**

Conceptually:

`Current Preparation Focus`
`↓`
`Guidance / Required Information`
`↓`
`Therapist Action or Confirmation`
`↓`
`Continue`

The active preparation task MUST remain visually dominant.

Platform-owned session context remains available through the Unified Methodology Workspace and MUST NOT be unnecessarily duplicated inside the MAP content area.

MAP MAY surface a relevant subset of that context where it directly supports the current preparation task.

#### Current Preparation Focus

Each Guided Preparation experience MUST clearly communicate what the therapist is preparing now.

The workspace SHOULD provide:

- a concise experience title;
- a short methodology-appropriate orientation;
- the current preparation content or action;
- only the supporting information needed for that action;
- a clear progression point when the applicable completion condition has been satisfied.

The experience SHOULD NOT present the therapist with the entire remaining MAP preparation sequence simultaneously.

Orientation to the broader MAP journey may exist, but the current task remains primary.

#### MAP-001 Specialization — Therapeutic Intention

When consumed by MAP-001, Guided Preparation centers on the therapeutic intention.

The intention interaction MUST distinguish:

- intention being entered or edited;
- intention ready for therapist review;
- intention explicitly confirmed.

An entered intention MUST NOT become authoritative merely because text exists in the field.

The therapist must retain control over the wording before confirmation.

Once confirmed, the therapeutic intention becomes persistent session context according to the applicable platform and MAP contracts.

Later MAP experiences MAY display the confirmed intention as contextual orientation without recreating or independently editing its authoritative source.

If MAP-005 requires the preparation journey to restart from MAP-001, the intention MUST remain available for review.

The UX MUST NOT silently treat the previous confirmation as a renewed confirmation for the new preparation attempt.

Where the applicable MAP recovery contract requires renewed confirmation, the therapist explicitly reconfirms the intention before progression.

#### MAP-002 Specialization — Sacred Space Preparation

When consumed by MAP-002, Guided Preparation centers on helping the therapist prepare the physical therapeutic environment.

The workspace SHOULD present the applicable preparation guidance clearly and calmly.

Physical methodology elements MAY be referenced where required by the approved MAP experience.

Their presentation MUST NOT imply that the platform:

- detects their presence;
- verifies their physical placement;
- verifies preparation of the space;
- independently determines that the space is therapeutically ready.

The experience MUST NOT become a mandatory digital checklist merely because multiple physical preparation elements are described.

The therapist remains responsible for physical preparation.

Where completion requires therapist confirmation, the UX records that explicit confirmation.

Guidance MAY use progressive disclosure where additional explanation is useful but not necessary for every session.

#### MAP-003 Specialization — Testimony Preparation

When consumed by MAP-003, Guided Preparation centers on preparing the physical testimony required by MAP.

The workspace SHOULD make the information required for testimony preparation easy to consult while the therapist performs the physical preparation outside the software.

Where the approved MAP experience distinguishes complete and reduced testimony information, the UX MUST preserve that distinction.

The presentation SHOULD make the preferred or complete preparation understandable without making an authorized reduced preparation appear to be a software error.

The platform MUST NOT claim to observe or verify that the physical testimony was created, positioned or prepared correctly.

Where the therapist must confirm preparation, that confirmation records the therapist-confirmed fact defined by the MAP Experience Backlog.

It does not constitute platform verification of the physical artifact.

#### Guidance Hierarchy

Guided Preparation SHOULD distinguish between:

**Essential guidance**
Information required to understand or perform the current preparation action.

and:

**Supporting guidance**
Additional methodology knowledge, explanation or reference that may help the therapist but is not required to remain permanently visible.

Essential guidance SHOULD remain directly accessible in the active workspace.

Supporting guidance SHOULD use progressive disclosure where practical.

This distinction MUST NOT hide information that the approved MAP experience requires the therapist to see before confirmation.

#### Confirmation Model

Guided Preparation MUST use explicit therapist confirmation whenever the applicable MAP experience requires confirmation.

The UX MUST distinguish:

`not prepared / not confirmed`

from:

`therapist confirmed`

Where editable information precedes confirmation, the UX SHOULD also distinguish:

`editing`

from:

`ready for confirmation`

Confirmation MUST NOT be inferred from:

- navigation;
- field completion alone;
- time spent on the experience;
- opening guidance;
- voice transcription;
- leaving the experience;
- progression elsewhere in the application.

After confirmation, the resulting methodology fact or state is preserved according to the applicable MAP contract.

#### Progression

The primary progression action SHOULD remain easy to identify without visually dominating the therapeutic workspace.

The progression action becomes valid only when the completion conditions of the specific MAP experience have been satisfied.

Guided Preparation MUST NOT invent additional mandatory completion conditions for visual consistency.

For example, MAP-002 MUST NOT require the therapist to digitally tick every preparation reference if the approved MAP experience requires only an explicit readiness confirmation.

Likewise, MAP-003 MUST NOT require information that the approved testimony rules allow to be absent.

#### Recovery and Re-entry

Guided Preparation MUST support legitimate re-entry into MAP preparation.

This includes the MAP-005 recovery path where the applicable activation result requires the therapist to return to MAP-001.

Re-entry MUST preserve the existing Platform Session.

It MUST NOT appear as:

- creation of a new client session;
- loss of previously preserved session context;
- an application error;
- an accidental navigation backwards.

Where the MAP Experience Backlog requires preparation to be repeated, the UX SHOULD make the renewed preparation cycle understandable.

Previously entered information MAY remain available where the applicable contracts permit it.

Previous confirmation MUST NOT substitute for a newly required confirmation.

#### Voice Behaviour

Voice MAY support Guided Preparation where allowed by the applicable experience and platform Voice capability.

For example, voice may assist with:

- entering or editing the therapeutic intention;
- requesting supporting methodology information;
- dictating an observation;
- navigating supporting guidance where supported.

Ambient session transcription MUST NOT:

- confirm preparation;
- confirm the therapeutic intention;
- mark the sacred space as prepared;
- mark the testimony as prepared;
- advance the MAP experience.

Explicit methodology actions remain distinct from passive transcription.

#### Progressive Disclosure

Guided Preparation SHOULD keep the first visible layer concise.

Additional information may be exposed through the progressive-disclosure behaviour provided by the Unified Methodology Workspace.

The therapist SHOULD be able to obtain more methodology context without permanently increasing workspace density.

Progressive disclosure MUST NOT remove the current preparation task from context.

#### PC Behaviour

On PC, Guided Preparation MAY use available horizontal space to keep:

- the current preparation task;
- essential guidance;
- relevant preparation context;

simultaneously understandable where doing so does not create unnecessary visual density.

Supporting information MAY appear alongside or through contextual disclosure.

The active preparation action remains visually primary.

#### Tablet Behaviour

On tablet, Guided Preparation SHOULD preserve the same conceptual order:

`Preparation Focus → Guidance → Therapist Action → Progression`

Secondary guidance MAY move into:

- expandable sections;
- drawers;
- sheets;
- other progressive-disclosure surfaces permitted by the Unified Methodology Workspace.

Tablet adaptation MUST NOT remove required methodology information or change confirmation semantics.

#### Pattern Boundary

Guided Preparation ends when the specific consuming experience reaches its approved completion condition.

The pattern does not itself determine what that condition is.

MAP-001, MAP-002 and MAP-003 remain separate methodology experiences with separate evidence and completion semantics.

Sharing Guided Preparation MUST NOT collapse them into one combined preparation record.

#### Core Guided Preparation Principle

The software prepares the therapist to perform MAP.

It does not perform the preparation on the therapist's behalf.

The workspace should therefore provide:

**enough guidance to maintain methodology confidence,
enough structure to preserve traceability,
and no more interaction than the therapeutic preparation actually requires.**

### MAP-PATTERN-02 — Canonical Protocol

#### Purpose

Canonical Protocol provides the common UX structure for MAP experiences in which the therapist must consult, speak, perform or confirm methodology-defined canonical content or an ordered therapeutic protocol.

It is primarily consumed by:

- MAP-004 — Perform the Opening Prayer;
- MAP-005 — Activate the MAP and Confirm the Connection;
- MAP-010 — Request Continued Treatment During Sleep;
- MAP-012 — Close and Energetically Disconnect the MAP.

The pattern exists to keep canonical MAP content directly available at the point of therapeutic work while preserving exact wording, required order, therapist authority and explicit confirmation semantics.

Canonical Protocol MUST NOT turn canonical methodology content into:

- editable therapist-authored content;
- AI-generated therapeutic wording;
- a generic Therapeutic Resource;
- a software-executed therapeutic action;
- passive reading that is automatically treated as completion.

#### Core Workspace Model

The Canonical Protocol workspace should prioritize four conceptual regions where applicable:

1. **Protocol Context**
2. **Canonical Content**
3. **Experience-Specific Therapeutic Action or Confirmation**
4. **Progression**

Conceptually:

`Protocol Context`
`↓`
`Canonical Content`
`↓`
`Therapist performs / speaks / confirms`
`↓`
`Experience-specific confirmation`
`↓`
`Progression`

Not every consuming experience requires every region to have the same prominence.

The canonical content remains the primary reference whenever the therapist is expected to consult or speak it.

#### Protocol Context

The workspace SHOULD identify:

- what MAP protocol is currently being performed;
- why it occurs at this point in the MAP journey where such orientation is useful;
- any essential prerequisite already established by the approved experience;
- the action expected from the therapist.

Protocol Context MUST remain concise.

It MUST NOT compete visually with the canonical wording itself.

Where the therapist already understands the protocol, supporting explanation SHOULD be progressively disclosable rather than permanently occupying the primary workspace.

#### Canonical Content Presentation

Canonical MAP wording MUST be presented exactly as defined by the authoritative methodology content.

The UX MUST NOT:

- paraphrase;
- summarize;
- simplify;
- rewrite;
- reorder;
- automatically translate canonical wording unless an authoritative localized version exists;
- omit required segments for visual convenience;
- add AI-generated therapeutic statements inside canonical content.

Typography and layout MAY improve readability.

For example, the UX MAY use:

- paragraph separation;
- readable line length;
- appropriate spacing;
- visually distinct canonical sections;
- ordered segments where the methodology itself defines an order;
- focus treatment for the currently relevant portion.

Such presentation MUST NOT alter therapeutic meaning or canonical sequence.

#### Canonical Content vs Guidance

The UX MUST visually and semantically distinguish:

**Canonical Content**

from:

**Guidance about how to use the Canonical Content**

Guidance MAY explain context, preparation or interaction.

It MUST NOT appear as though it forms part of the canonical prayer, request or protocol when it does not.

Where practical, supporting guidance SHOULD use progressive disclosure.

The therapist should always be able to determine which words belong to the methodology and which words belong to the interface.

#### Reading Is Not Performance

Displaying canonical content does not mean that the therapeutic protocol has been performed.

Scrolling through it does not mean that it has been performed.

Remaining on the experience for a particular duration does not mean that it has been performed.

Ambient transcription detecting similar wording does not mean that it has been performed.

The UX MUST NOT infer therapeutic completion from passive interaction with canonical content.

Where the approved MAP experience requires therapist confirmation, completion depends on that explicit confirmation.

#### Speaking Is Not Automatic Confirmation

Where canonical content is intended to be spoken, Voice or Transcript capabilities MAY support the therapist according to applicable platform contracts.

However:

`speech detected ≠ protocol confirmed`

The platform MUST NOT infer that:

- the full canonical wording was spoken;
- the protocol was therapeutically completed;
- the required physical action occurred;
- activation occurred;
- connection occurred;
- energetic disconnection occurred;

merely because speech was captured.

Transcript remains evidence of captured speech according to its own platform semantics.

MAP confirmation remains an explicit methodology action.

#### Ordered Protocol Behaviour

Where an experience defines an ordered protocol, the UX MUST preserve that order.

The interface MAY provide orientation within the protocol where useful.

Such orientation MUST NOT allow the software to silently skip required methodology stages.

The UX MAY distinguish:

- current protocol segment;
- previously consulted segment;
- next available segment;

where that distinction helps the therapist maintain orientation.

However, segment navigation MUST NOT automatically create therapeutic evidence unless the applicable MAP experience explicitly defines such evidence.

#### Therapist-Controlled Progression

The therapist controls progression through the protocol.

The UX MAY make the next valid interaction clear.

It MUST NOT automatically advance because:

- canonical text reached the end of the viewport;
- a timer elapsed;
- speech stopped;
- transcript matched expected wording;
- a physical instrument is presumed to have been used;
- the platform predicts that the protocol is complete.

Where explicit confirmation is required, the therapist performs that confirmation.

#### MAP-004 Specialization — Opening Prayer

When consumed by MAP-004, Canonical Protocol centers on the authoritative MAP Opening Prayer.

The workspace SHOULD prioritize uninterrupted readability and therapist focus.

Supporting information SHOULD remain secondary.

The platform MUST NOT treat:

- opening the prayer;
- scrolling through it;
- reading duration;
- captured speech;

as evidence that the Opening Prayer was performed.

The completion semantics of MAP-004 remain those defined by the approved MAP Experience Backlog.

MAP-004 progression MUST NOT independently imply that MAP activation or client connection has occurred.

Those belong to MAP-005.

#### MAP-005 Specialization — Activation and Connection

When consumed by MAP-005, Canonical Protocol combines the applicable MAP activation protocol with explicit therapist-confirmed activation results.

The UX MUST preserve the distinction between:

1. consulting or performing the activation protocol;
2. observing the therapist's physical methodology process;
3. recording the therapist's explicit confirmation results.

The three required activation confirmations remain independent facts.

The UX MUST NOT collapse them into a single generic:

`MAP ready`

state.

Each required Yes / No result must remain individually understandable and traceable according to the approved MAP Experience Backlog.

Progression to MAP-006 becomes available only when the required MAP-005 confirmation conditions are satisfied.

A No result MUST NOT be presented as:

- application failure;
- validation error;
- incorrect therapist behaviour;
- automatically failed MAP session.

Instead, the UX MUST expose the applicable methodology recovery path defined by the MAP Experience Backlog.

The platform MUST NOT choose the therapeutic recovery option for the therapist.

#### MAP-005 Recovery Presentation

Where MAP-005 produces a recovery condition, the canonical protocol workspace should transition from normal progression into a clear therapeutic recovery state.

That state SHOULD:

- preserve the recorded confirmation result;
- explain the available methodology-valid next actions;
- preserve Platform Session continuity;
- avoid technical error language;
- make return to renewed preparation understandable where applicable;
- allow platform Pause where the applicable MAP recovery path permits waiting.

The UX MUST NOT determine the waiting duration.

It MUST NOT automatically restart MAP.

It MUST NOT silently replace a No result with a new attempt.

A renewed attempt remains a distinct therapist-controlled continuation of the MAP journey.

#### MAP-010 Specialization — Continued Treatment During Sleep

When consumed by MAP-010, Canonical Protocol centers on the authoritative request for continued treatment during sleep.

The canonical request MUST remain distinguishable from explanatory guidance.

The platform MUST NOT represent itself as:

- initiating treatment during sleep;
- verifying that such treatment occurs;
- observing therapeutic activity after the session;
- guaranteeing an outcome.

The UX records only the therapist-confirmed methodology facts authorized by the MAP Experience Backlog.

Completion of MAP-010 permits progression to MAP-011 according to the approved journey.

It does not itself constitute final MAP completion.

#### MAP-012 Specialization — Closing and Energetic Disconnection

When consumed by MAP-012, Canonical Protocol centers on the authoritative MAP closing and energetic-disconnection protocol.

The workspace SHOULD support a deliberate closing experience rather than presenting MAP-012 as an ordinary navigation action.

The UX MUST preserve the distinction between:

- consulting the closing protocol;
- therapist performance of the required therapeutic actions;
- explicit completion confirmation;
- completed MAP methodology state;
- Platform Session Closing.

The platform MUST NOT infer energetic disconnection from:

- speech;
- elapsed time;
- navigation;
- closing the MAP workspace;
- leaving the application.

Only the applicable therapist-confirmed MAP completion semantics establish MAP completion.

After valid MAP completion, control returns to the Platform Session according to the MAP Completion Boundary.

The Canonical Protocol pattern MUST NOT automatically:

- complete the Platform Session;
- invoke another methodology;
- enter Platform Session Closing;
- choose the therapist's next session action.

#### Confirmation Presentation

Where a consuming experience requires explicit confirmation, confirmation controls SHOULD be visually associated with the therapeutic fact being confirmed.

The UX SHOULD avoid ambiguous generic controls such as:

`Done`

where the underlying methodology requires a more specific confirmation.

The therapist should understand exactly what is being recorded.

Confirmation wording MUST remain consistent with the approved MAP Experience Backlog and applicable localization rules.

#### Protocol State

The UX MAY preserve orientation state required to safely resume the experience after interruption.

Such state MAY include, where supported:

- current protocol context;
- current ordered segment;
- already recorded explicit confirmations;
- recovery state.

Orientation state MUST NOT be presented as therapeutic evidence unless the MAP contract defines it as such.

For example:

`current segment = 3`

does not mean:

`segments 1–2 therapeutically completed`

unless explicit methodology evidence establishes that conclusion.

#### Interruption and Return

Canonical Protocol MUST tolerate legitimate interruption by Platform Session capabilities.

If the therapist:

- opens Notes;
- consults Timeline;
- uses another platform-owned tool;
- pauses the Platform Session;
- invokes an authorized complementary methodology where permitted;
- later returns to MAP;

the MAP protocol context SHOULD remain recoverable according to the applicable execution contract.

Returning to the workspace MUST NOT silently confirm or repeat a therapeutic action.

Where a canonical protocol must be restarted after interruption, that requirement must come from the MAP methodology authority rather than being invented by the UX.

#### Progressive Disclosure

The canonical wording itself MUST NOT be hidden behind progressive disclosure when the therapist needs it to perform the active protocol.

Secondary content MAY use progressive disclosure, including:

- explanations;
- supporting methodology knowledge;
- contextual reminders;
- additional reference information.

Progressive disclosure MUST preserve a clear distinction between canonical wording and supporting material.

#### PC Behaviour

On PC, the canonical protocol MAY use a focused reading region with sufficient surrounding space to reduce distraction.

Where an experience also requires confirmation, the layout MAY keep the relevant confirmation area available without visually competing with the canonical content.

Long canonical content SHOULD prioritize readable line length over filling the entire available horizontal width.

#### Tablet Behaviour

On tablet, the canonical content remains the primary reading surface.

Secondary guidance MAY move into permitted progressive-disclosure surfaces.

Confirmation controls MUST remain readily accessible without covering or obscuring the canonical content required for the current therapeutic action.

Responsive adaptation MUST NOT:

- abbreviate canonical content;
- change protocol order;
- remove required confirmations;
- merge independent therapeutic facts.

#### Pattern Boundary

Canonical Protocol defines presentation and interaction structure.

It does not define the therapeutic meaning or completion criteria of MAP-004, MAP-005, MAP-010 or MAP-012.

Each consuming experience remains authoritative for:

- its canonical content;
- required therapeutic action;
- required confirmations;
- evidence;
- recovery behaviour;
- completion condition;
- next valid MAP transition.

Sharing this pattern MUST NOT collapse the four experiences into one protocol state.

#### Core Canonical Protocol Principle

Canonical MAP content is presented by the software.

The therapeutic protocol is performed and confirmed by the therapist.

The UX must therefore preserve:

**exact content,
clear therapeutic orientation,
explicit therapist authority,
and no inferred performance.**

### MAP-PATTERN-03 — Hawkins Measurement

#### Purpose

Hawkins Measurement provides the common UX structure for MAP experiences that record a therapist-confirmed Hawkins level.

It is primarily consumed by:

- MAP-006 — Record the Initial Hawkins Level;
- MAP-011 — Record the Final Hawkins Level.

Both experiences MUST use the same underlying Hawkins measurement interaction model.

MAP-011 extends that model with deterministic comparison against the confirmed initial measurement recorded through MAP-006.

The pattern exists to provide a clear and consistent digital representation of a measurement obtained through therapist-operated MAP practice.

The platform does not perform the measurement.

#### Core Measurement Model

The Hawkins Measurement workspace should distinguish four conceptual elements:

1. **Measurement Context**
2. **Hawkins Reference Model**
3. **Therapist Selection**
4. **Explicit Measurement Confirmation**

For MAP-011, a fifth element is added after confirmation:

5. **Initial-to-Final Comparison**

Conceptually:

`Measurement Context`
`↓`
`Hawkins Reference Model`
`↓`
`Therapist identifies level using the Physical Instrument`
`↓`
`Therapist selects corresponding digital value`
`↓`
`Therapist confirms measurement`

and, for MAP-011:

`Confirmed Final Measurement`
`+`
`Confirmed Initial Measurement`
`↓`
`Deterministic Comparison`

The UX MUST preserve the semantic boundaries between these stages.

#### Measurement Context

The workspace MUST make clear whether the therapist is recording:

- the initial Hawkins level; or
- the final Hawkins level.

The context SHOULD remain concise and visually subordinate to the measurement interaction.

The therapist should not need to infer whether the currently displayed Hawkins selector belongs to MAP-006 or MAP-011.

Where useful, the confirmed therapeutic intention MAY remain available as contextual session information according to the Unified Methodology Workspace contract.

#### Physical Measurement Boundary

The Hawkins level is determined through the therapist's physical methodology practice.

The platform MUST NOT claim to:

- operate the pendulum;
- observe pendulum movement;
- read the Physical Instrument;
- determine the Hawkins level;
- infer a level from therapist movement;
- calculate a therapeutic measurement from unrelated session data.

The digital interaction begins only when the therapist identifies the value that should be recorded.

The therapist then selects the corresponding value in the digital Hawkins reference model.

#### Hawkins Reference Model

The UX MUST present the authoritative Hawkins levels defined by the approved MAP methodology source.

It MUST NOT:

- invent additional levels;
- remove supported levels;
- rename levels without authoritative localization;
- reorder the model in a way that changes its meaning;
- interpolate unsupported values;
- convert the reference model into a continuous software-generated scale where the methodology defines discrete values.

The visual representation MAY optimize:

- legibility;
- scanning;
- selection;
- comparison;
- PC and tablet use.

Visual optimization MUST NOT alter the underlying measurement model.

#### Reference vs Measurement

Displaying the Hawkins reference model does not constitute a measurement.

A Hawkins value visible on screen is reference information.

A highlighted or temporarily selected value is not yet a confirmed measurement.

The UX MUST distinguish at least:

`reference value`

from:

`selected value`

from:

`confirmed measurement`

The platform MUST NOT create measurement evidence merely because a therapist:

- views a level;
- hovers over a level;
- focuses a level;
- scrolls to a level;
- temporarily selects a level;
- speaks a number that appears in Transcript.

#### Selection Behaviour

The therapist MUST explicitly select the Hawkins value corresponding to the result obtained through the physical methodology process.

The selected value SHOULD be visually unmistakable.

Selection MUST remain reversible until explicit confirmation.

Changing the selection before confirmation MUST NOT create multiple confirmed measurement records.

The UX SHOULD allow the therapist to review the selected value before confirming it.

The platform MUST NOT automatically select a value based on:

- previous sessions;
- the initial measurement;
- the final measurement;
- client history;
- transcript content;
- AI inference;
- statistical prediction;
- therapeutic expectations.

#### Confirmation Behaviour

A selected Hawkins value becomes the applicable MAP measurement only through the explicit confirmation required by the approved experience.

Confirmation MUST clearly communicate what is being recorded.

For MAP-006, the therapist confirms:

**the Initial Hawkins Level**

For MAP-011, the therapist confirms:

**the Final Hawkins Level**

A generic ambiguous confirmation such as `Done` SHOULD be avoided where it obscures this distinction.

After confirmation, the measurement becomes preserved MAP evidence according to the applicable contract.

#### MAP-006 Specialization — Initial Measurement

When consumed by MAP-006, Hawkins Measurement records the therapist-confirmed initial Hawkins level.

The workspace SHOULD prioritize:

- measurement orientation;
- the authoritative Hawkins reference model;
- clear selection;
- explicit confirmation.

After confirmation, the initial measurement becomes persistent MAP methodology evidence.

It MUST remain available for the later deterministic comparison required by MAP-011.

The UX MUST NOT:

- interpret whether the initial value is good or bad;
- diagnose the client from the value;
- infer therapeutic meaning not defined by the MAP methodology;
- predict the expected final value;
- recommend therapeutic investigation elements from the value unless separately authorized by the MAP methodology.

Completion of MAP-006 permits progression to MAP-007 according to the approved MAP journey.

#### MAP-011 Specialization — Final Measurement

When consumed by MAP-011, Hawkins Measurement records the therapist-confirmed final Hawkins level using the same Hawkins reference model and selection semantics as MAP-006.

The final measurement MUST be independently selected and explicitly confirmed.

The UX MUST NOT preselect:

- the initial value;
- a value above the initial measurement;
- a value predicted from session activity;
- a value inferred from therapeutic expectations.

The therapist records the physical methodology result exactly as determined through MAP practice.

Only after the final value is confirmed may the deterministic initial-to-final comparison be treated as complete.

#### Initial Measurement Context During MAP-011

The confirmed initial Hawkins measurement MAY be visible during MAP-011 where doing so supports therapist orientation.

If displayed before final confirmation, it MUST be clearly identified as:

**Initial Measurement**

and MUST NOT visually imply a recommended or expected final value.

The UX MUST preserve the independence of final measurement selection.

The initial value MUST NOT constrain which valid final Hawkins value the therapist may select.

#### Deterministic Comparison

After the final measurement is confirmed, MAP-011 MAY present the deterministic comparison required by the approved MAP experience.

The comparison is derived exclusively from:

- the confirmed initial Hawkins value; and
- the confirmed final Hawkins value.

Conceptually:

`Initial = X`
`Final = Y`

followed by the deterministic relationship defined by the approved MAP contract.

The comparison MUST NOT introduce an additional therapist-entered measurement.

It MUST NOT modify either confirmed value.

#### Comparison Is Not Therapeutic Interpretation

The deterministic comparison describes the relationship between two confirmed measurements.

The platform MUST NOT automatically transform that relationship into claims such as:

- treatment succeeded;
- treatment failed;
- client improved;
- client worsened;
- energetic health increased;
- energetic health decreased;
- therapeutic objective was achieved;
- additional treatment is required.

Unless such interpretation is explicitly defined by an authoritative MAP contract, it remains outside this UX pattern.

The UI MUST distinguish:

**measurement comparison**

from:

**therapeutic interpretation**.

#### Equal Values

If the initial and final Hawkins measurements are equal, the UX MUST represent that relationship neutrally.

Equality MUST NOT be presented as:

- an error;
- failed therapy;
- missing progress;
- invalid measurement.

The platform records and compares the therapist-confirmed facts.

It does not judge the therapeutic meaning of equality.

#### Lower Final Values

If the final confirmed value is lower than the initial confirmed value, the UX MUST still preserve and display the valid measurement.

The interface MUST NOT:

- block confirmation;
- require the therapist to choose a higher value;
- automatically request remeasurement;
- classify the session as unsuccessful;
- overwrite the result.

Any therapeutic response to that relationship must come from an applicable MAP methodology rule, not from generic UX assumptions.

#### Measurement Correction

Before confirmation, selection remains editable.

After confirmation, correction behaviour MUST follow the applicable MAP evidence and persistence contract.

The UX MUST NOT silently overwrite confirmed methodology evidence.

Where correction of a confirmed value is authorized, the correction MUST preserve the required traceability.

This pattern does not independently define the persistence-level correction mechanism.

#### Voice Behaviour

Voice MAY assist with navigation or explicit selection where supported by the applicable platform capability.

However, ambient transcription MUST NOT create or confirm a Hawkins measurement.

For example:

`therapist says "300"`

inside general session conversation MUST NOT automatically become:

`Hawkins measurement = 300`.

Any voice-enabled measurement action must remain explicit, intentional and distinguishable from passive Transcript capture.

Confirmation semantics remain the same regardless of input modality.

#### Progressive Disclosure

The active measurement interaction SHOULD remain immediately visible.

Supporting information about the Hawkins reference model MAY use progressive disclosure where it is not required for basic selection.

Progressive disclosure MUST NOT hide:

- the values required for measurement;
- the current selected value;
- whether the value has been confirmed;
- initial/final identity;
- the deterministic comparison once required by the completed MAP-011 state.

#### PC Behaviour

On PC, the Hawkins reference model MAY use additional horizontal space to improve scanning and provide contextual information without crowding the measurement interaction.

The selected value and confirmation state MUST remain immediately understandable.

During MAP-011, the initial value and final measurement interaction MAY coexist where this does not create visual bias toward a particular final selection.

After confirmation, the comparison MAY become more visually prominent.

#### Tablet Behaviour

On tablet, the same Hawkins reference model and measurement semantics MUST be preserved.

The presentation MAY become:

- vertically organized;
- scrollable;
- more compact;
- progressively disclosed where secondary information is involved.

The selected value and confirmation action MUST remain easy to access.

Tablet adaptation MUST NOT reduce the valid value set or replace explicit selection with inferred measurement.

#### Interruption and Return

If the therapist leaves the active MAP workspace temporarily through an authorized Platform Session interaction, the measurement state SHOULD remain recoverable according to the applicable execution contract.

An unconfirmed selection MAY be restored as orientation state where permitted.

It MUST remain visually distinguishable from a confirmed measurement.

Returning to MAP MUST NOT automatically confirm the pending value.

A confirmed measurement remains preserved evidence and MUST NOT revert to an unconfirmed state merely because the therapist navigated elsewhere.

#### Pattern Boundary

Hawkins Measurement defines the UX structure for selecting, confirming and comparing MAP Hawkins measurements.

It does not define:

- how the therapist physically obtains the value;
- how the pendulum is interpreted;
- therapeutic meaning of a value;
- therapeutic meaning of a change;
- diagnostic conclusions;
- treatment recommendations;
- persistence implementation.

MAP-006 and MAP-011 remain separate experiences with separate evidence and progression semantics.

Sharing this pattern MUST NOT collapse initial and final measurements into one mutable value.

#### Core Hawkins Measurement Principle

The therapist performs the measurement.

The software records the therapist-confirmed result.

The software may deterministically compare confirmed results.

It does not interpret the pendulum or judge the therapeutic meaning of the comparison.

The UX must therefore preserve:

**one authoritative reference model,
explicit therapist selection,
explicit measurement confirmation,
immutable semantic distinction between initial and final,
and neutral deterministic comparison.**

### MAP-PATTERN-04 — Investigation Catalogue

#### Purpose

Investigation Catalogue provides the common UX structure used by MAP-007 to support therapist-controlled discovery, consultation and explicit selection of MAP investigation elements.

The catalogue is not a recommendation engine.

It is not a generic Therapeutic Resource library.

It is not a fixed wizard that determines the therapeutic route.

Its purpose is to make the authoritative MAP investigation structure accessible inside the Methodology Workspace while preserving the therapist's freedom to identify the next element through any investigation approach authorized by the approved MAP Experience Backlog.

The catalogue MUST support the transition:

`MAP-007 — investigate / identify / select`
`↓`
`MAP-008 — work with the selected element`

without allowing the platform to determine which element should be selected.

#### Core Workspace Model

The Investigation Catalogue should distinguish four conceptual regions:

1. **Investigation Context**
2. **Investigation Approach / Navigation**
3. **MAP Investigation Elements**
4. **Explicit Element Selection**

Conceptually:

`Current MAP Investigation`
`↓`
`Choose or use an authorized investigation approach`
`↓`
`Explore / consult MAP elements`
`↓`
`Therapist identifies an element`
`↓`
`Explicit selection`
`↓`
`MAP-008 Work Instance`

The catalogue SHOULD make exploration efficient while keeping the current therapeutic investigation understandable.

#### Investigation Context

The workspace SHOULD provide enough context for the therapist to understand that they are inside the active MAP investigation cycle.

Relevant context MAY include:

- the current therapeutic intention;
- that a new investigation element is being sought;
- previous MAP investigation work where useful for orientation;
- whether this is the first or a subsequent MAP-007 iteration.

This context MUST NOT become a recommendation mechanism.

For example, previous work MAY be visible for traceability.

It MUST NOT be used by the platform to state:

- which element should be investigated next;
- which category should be preferred;
- which route is most likely;
- which element produced the best previous result.

#### Authorized Investigation Approaches

MAP-007 MUST preserve the investigation flexibility defined by the approved MAP Experience Backlog.

The therapist may reach an investigation element through the authorized approaches, including:

- pendulum-guided investigation;
- direct selection;
- intuitive rotation;
- organized therapeutic route;
- a combination of authorized approaches.

The UX MUST NOT designate one of these approaches as universally correct or mandatory unless an authoritative MAP rule requires it in a specific context.

The therapist MAY change investigation approach between MAP investigation iterations.

Changing approach MUST NOT:

- create a new Platform Session;
- create a new MAP methodology execution;
- erase previous MAP investigation work;
- imply that the previous approach was incorrect.

#### Investigation Approach Is Not Therapeutic Evidence

Choosing an investigation approach helps organize the therapist's interaction with the catalogue.

It does not itself establish a therapeutic result.

The UX MUST distinguish:

`approach being used`

from:

`element identified`

from:

`element selected for work`.

The platform MUST NOT infer that an element was identified merely because:

- its category was opened;
- it became visible;
- it was focused;
- the therapist hovered over it;
- it was mentioned in Transcript;
- the therapist browsed related information.

#### Catalogue Information Architecture

The catalogue MUST represent MAP investigation elements according to the authoritative methodology structure.

The UX MAY organize those elements through structures such as:

- methodology sections;
- groups;
- categories;
- subcategories;
- searchable or browsable collections;
- other navigation structures supported by the authoritative MAP model.

The UX MUST NOT invent therapeutic hierarchy merely to simplify presentation.

Where the MAP source defines hierarchy, grouping or ordering, that structure SHOULD be preserved.

Where the source does not define therapeutic priority, visual placement MUST NOT imply that one element is therapeutically superior or preferred.

#### Element Identity

Every selectable investigation element MUST have a clear and stable identity in the catalogue.

The therapist should be able to understand what element is being considered before selecting it for MAP-008.

Where supported by the authoritative element definition, catalogue identity MAY include:

- canonical name;
- concise methodology description;
- classification;
- visual reference;
- position within the MAP methodology structure.

The catalogue SHOULD expose only the amount of information necessary for identification and navigation.

Detailed therapeutic work belongs primarily to MAP-008.

#### Classification Preservation

The catalogue MUST preserve the authoritative classification of each MAP element.

An element appearing in the Investigation Catalogue MUST NOT automatically be presented as a Therapeutic Resource.

The UX MUST preserve distinctions established by the MAP Experience Backlog and Methodology Resource Bindings.

Classification MAY affect:

- available contextual information;
- visual metadata;
- whether deeper resource information exists;
- which actions become available later in MAP-008.

Classification MUST NOT be changed by catalogue interaction.

#### Capability Preview

The catalogue MAY communicate, in a restrained way, which kinds of methodology interaction are supported by an element where that information helps therapist orientation.

However, capability preview MUST derive from authoritative classification and Methodology Resource Bindings.

The catalogue MUST NOT expose a capability merely because the platform technically supports it.

For example, the existence of platform Analysis or Activation capabilities does not mean that every MAP investigation element supports Analysis or Activation.

Detailed capability interaction belongs to MAP-008.

The catalogue SHOULD avoid becoming an action-heavy workspace.

#### Browsing Is Not Selection

The UX MUST clearly distinguish browsing from selection.

Opening an element for contextual inspection does not necessarily select it for therapeutic work.

Likewise:

`visible ≠ selected`

`opened ≠ selected`

`consulted ≠ selected`

`mentioned ≠ selected`

`selected ≠ activated`

The transition to MAP-008 requires the explicit element-selection semantics defined by MAP-007.

#### Explicit Element Selection

The therapist MUST explicitly select the MAP investigation element that will become the focus of the next MAP-008 work instance.

The UX SHOULD make the selected identity unmistakable before transition.

Where appropriate, the interface MAY provide a short confirmation state such as:

`Selected for investigation: [Element]`

before entering MAP-008.

This confirmation is selection confirmation.

It MUST NOT imply:

- therapeutic use;
- measurement;
- analysis;
- activation;
- work completion.

Selection establishes only the subject of the next MAP work instance.

#### No Automated Recommendation

The platform MUST NOT automatically recommend the next MAP investigation element unless such behaviour is separately authorized by an authoritative future methodology decision.

Under the current MAP architecture, the catalogue MUST NOT:

- rank elements by predicted therapeutic relevance;
- display AI-generated "recommended next" elements;
- infer the next element from the Hawkins measurement;
- infer the next element from Transcript;
- infer the next element from previous MAP work;
- infer the next element from client history;
- automatically select an element;
- prioritize elements based on assumed therapeutic effectiveness.

Search, filtering, hierarchy and therapist-controlled navigation MAY improve access.

They MUST NOT become hidden recommendation mechanisms.

#### Pendulum-Guided Investigation

Where the therapist uses pendulum-guided investigation, the digital catalogue acts as a reference and navigation surface.

The platform does not observe or interpret the pendulum.

The therapist remains responsible for:

- operating the Physical Instrument;
- interpreting its indication;
- navigating the relevant MAP structure;
- identifying the indicated element;
- explicitly selecting that element digitally.

The UX MAY make hierarchical navigation efficient enough to support this physical-digital interaction.

It MUST NOT claim that the software detected the pendulum result.

#### Direct Selection

Where the therapist already knows which element should be investigated, the catalogue SHOULD permit efficient direct access without forcing unnecessary traversal through the full MAP hierarchy.

Direct access MAY use therapist-controlled mechanisms such as:

- browsing;
- search;
- known hierarchy;
- other non-recommendation navigation.

Direct access MUST preserve the same explicit selection semantics as any other investigation approach.

#### Intuitive Rotation

Where the approved MAP experience permits intuitive rotation through investigation elements, the UX SHOULD support exploration without requiring the therapist to declare a deterministic search path first.

The platform MUST NOT reinterpret intuitive rotation as random automated recommendation.

The therapist remains the actor deciding when an element has been identified and selected.

#### Organized Therapeutic Route

Where the therapist follows an organized therapeutic route, the catalogue MAY expose the authoritative MAP structure in a way that supports systematic navigation.

Systematic navigation MUST NOT imply mandatory progression unless the methodology explicitly requires it.

The UX MUST distinguish:

`available structural order`

from:

`required therapeutic order`.

#### Search and Filtering

Search or filtering MAY be provided as navigation aids where the authoritative MAP dataset supports them.

They MUST operate as therapist-directed retrieval.

Search results MUST NOT be ranked according to inferred therapeutic relevance unless separately authorized.

Filtering MUST NOT alter element classification or available methodology capabilities.

A search result remains a catalogue element subject to explicit selection before MAP-008.

#### Contextual Inspection

The therapist MAY need limited information about an element before deciding whether it is the element indicated for work.

The catalogue MAY therefore support lightweight contextual inspection.

Such inspection SHOULD use progressive disclosure.

It MAY expose:

- concise identity;
- classification;
- brief methodology context;
- visual reference;
- other authoritative identification information.

It SHOULD NOT reproduce the complete MAP-008 working environment inside MAP-007.

The distinction should remain:

`MAP-007 = find and select`
`MAP-008 = work`.

#### Previous Investigation Context

On subsequent iterations of the investigation cycle, the catalogue MAY expose a compact representation of previous MAP work for orientation.

This MAY help the therapist understand:

- which elements have already been worked;
- how many work instances exist;
- whether an element has appeared previously.

Previous work MUST NOT prevent the therapist from selecting the same element again where the MAP methodology permits it.

Repeated selection of the same element creates a new MAP-008 work instance.

It MUST NOT reopen or overwrite the previous completed work instance as though it were the same therapeutic event.

#### MAP Investigation Journey

The catalogue MAY expose the MAP Investigation Journey as methodology-owned context.

This journey MUST remain distinct from the Platform Session Methodology Journey.

For example:

`Emotional Causes → Chakras → Emotional Causes`

represents MAP investigation history.

It does not represent three methodology executions.

The UX SHOULD keep this distinction understandable without requiring the therapist to understand internal architecture terminology.

#### Transition to MAP-008

Once an element is explicitly selected, MAP-007 transitions to MAP-008.

The transition MUST preserve:

- Platform Session identity;
- MAP methodology execution identity;
- therapeutic intention;
- existing MAP evidence;
- previous MAP investigation work;
- current investigation-cycle context.

MAP-008 receives the selected element as the subject of a new work instance.

The platform MUST NOT silently substitute a different element during transition.

#### Return from MAP-009

When MAP-009 records that additional investigation remains:

`MAP-009 Yes → MAP-007`

the catalogue is entered for a new selection.

The UX SHOULD make it understandable that:

- the previous work instance is complete;
- the therapist is now selecting the next element;
- previous investigation history remains preserved.

The catalogue MUST NOT automatically retain the previous element as the next active selection.

The same element MAY be selected again, but only through a new explicit therapist selection.

#### Interruption and Complementary Methodologies

The Investigation Catalogue exists inside the Unified Methodology Workspace.

Authorized Platform Session interactions MAY temporarily interrupt catalogue activity.

If the therapist invokes an authorized complementary methodology and later returns to MAP, the MAP investigation context SHOULD remain recoverable according to the applicable execution contract.

Return to MAP MUST NOT:

- automatically select an element;
- create a MAP-008 work instance;
- restart the entire MAP methodology;
- erase the current investigation cycle.

Any pending unconfirmed selection MUST remain distinguishable from a confirmed selection.

#### Voice Behaviour

Voice MAY assist therapist-controlled catalogue navigation where supported.

Examples may include:

- requesting a known MAP section;
- searching for an element by name;
- opening supporting information;
- explicitly initiating a supported selection action.

Ambient Transcript MUST NOT select an investigation element.

For example, mentioning the name of a MAP element during therapeutic conversation MUST NOT automatically establish that element as the next MAP-008 subject.

Voice-based selection, if supported, must be explicit and intentional.

#### Progressive Disclosure

The catalogue SHOULD use progressive disclosure to control information density.

The initial catalogue surface SHOULD prioritize:

- structure;
- identification;
- navigation;
- selection.

Detailed element information SHOULD remain secondary until requested.

Progressive disclosure MUST NOT obscure the element identity currently being selected.

#### Empty, Search and Navigation States

The catalogue UX SHOULD distinguish legitimate interface states such as:

- initial catalogue;
- browsing a methodology section;
- viewing search results;
- no results for a therapist-entered search;
- contextual element inspection;
- element selected.

A search with no matching results is a retrieval state.

It MUST NOT be interpreted as:

- absence of a therapeutic cause;
- therapeutic completion;
- failure of MAP;
- evidence that no element exists.

The therapist remains responsible for the therapeutic investigation.

#### PC Behaviour

On PC, the catalogue MAY take advantage of horizontal space to expose more of the MAP structure simultaneously.

A PC layout MAY support combinations such as:

`navigation structure | catalogue elements | contextual inspection`

where this remains visually calm and does not imply multiple simultaneous active elements.

The selected element MUST remain unmistakable.

Detailed MAP-008 controls MUST NOT leak into the catalogue merely because space is available.

#### Tablet Behaviour

On tablet, the same catalogue structure and selection semantics MUST be preserved.

Navigation and contextual inspection MAY use:

- progressive panels;
- drawers;
- sheets;
- stacked navigation;
- expandable groups.

Tablet adaptation MUST NOT:

- reduce the authoritative element set;
- remove valid investigation approaches;
- alter classification;
- introduce automatic recommendation;
- turn browsing into implicit selection.

#### Pattern Boundary

Investigation Catalogue defines the UX architecture for finding, consulting and explicitly selecting a MAP investigation element.

It does not define:

- how the therapist therapeutically determines which element is relevant;
- how the pendulum is interpreted;
- the therapeutic work performed with the selected element;
- analysis behaviour;
- measurement behaviour inside MAP-008;
- activation behaviour;
- MAP-008 completion;
- whether further investigation remains after that work.

Those responsibilities belong to the applicable MAP methodology contracts and subsequent experience patterns.

MAP-007 ends when a valid investigation element has been explicitly selected according to its approved completion semantics.

The selected element then becomes the subject of MAP-008.

#### Core Investigation Catalogue Principle

The catalogue exposes the MAP investigation universe.

The therapist determines where to go within it.

The software supports:

**orientation,
retrieval,
inspection,
and explicit selection.**

It does not determine the therapeutic destination.

### MAP-PATTERN-05 — Investigation Element Workspace

#### Purpose

Investigation Element Workspace provides the adaptive UX structure used by MAP-008 to work with the investigation element explicitly selected in MAP-007.

MAP-008 is not one fixed therapeutic form.

It is an adaptive methodology workspace whose available information, interactions and actions depend on:

- the identity of the selected MAP investigation element;
- its authoritative classification;
- the applicable MAP Methodology Resource Binding;
- the capabilities explicitly authorized for that element;
- the therapeutic work actually performed and confirmed by the therapist.

The purpose of this pattern is to provide one coherent MAP working environment without falsely making every investigation element behave in the same way.

The workspace MUST NOT expose an action merely because RADIONICS technically supports that capability.

#### Entry Contract

MAP-008 begins only after MAP-007 has produced an explicitly selected investigation element.

The selected element becomes the subject of a new MAP work instance.

Entry into MAP-008 MUST preserve:

- Platform Session identity;
- MAP methodology execution identity;
- current therapeutic intention;
- selected investigation-element identity;
- authoritative element classification;
- applicable Methodology Resource Binding;
- previous MAP evidence;
- previous completed MAP work instances;
- current investigation-cycle context.

MAP-008 MUST NOT independently choose, replace or reinterpret the selected element.

If the same investigation element is selected again during a later MAP-007 iteration, MAP-008 creates a new work instance rather than reopening the previous completed instance as though it were the same therapeutic event.

#### Core Workspace Model

The Investigation Element Workspace should be composed from a stable conceptual structure:

1. **Element Context**
2. **Authoritative Element Information**
3. **Applicable Therapeutic Interaction**
4. **Work Evidence / Therapist Confirmation**
5. **Work Completion**

Conceptually:

`Selected MAP Element`
`↓`
`Identity + Classification + Relevant Context`
`↓`
`Only applicable element capabilities`
`↓`
`Therapist performs the therapeutic work`
`↓`
`Applicable evidence / explicit confirmation`
`↓`
`Complete MAP-008 Work Instance`
`↓`
`MAP-009`

Not every investigation element requires every possible interaction.

The workspace adapts through capability composition rather than through unrelated experience designs.

#### Stable Workspace, Adaptive Interior

MAP-008 SHOULD preserve a recognizable working structure across investigation elements.

The therapist should not feel that selecting a different element launches a different application.

Stable characteristics SHOULD include:

- placement within the Unified Methodology Workspace;
- element identity treatment;
- contextual orientation;
- hierarchy of primary and secondary information;
- confirmation semantics;
- work-completion semantics;
- access to platform-owned session capabilities.

The interior therapeutic content MAY change substantially according to the selected element.

Consistency MUST therefore come from workspace architecture, not from forcing identical controls onto different therapeutic elements.

#### Element Context

The selected investigation element MUST remain clearly identifiable throughout the active MAP-008 work instance.

The workspace SHOULD expose, where applicable:

- canonical element name;
- relevant MAP structural location;
- authoritative classification;
- concise methodology context;
- current therapeutic intention;
- indication that this is the active investigation element.

Where the same element has previously been worked in the current MAP execution, that history MAY be available as secondary context.

Previous occurrence MUST NOT be presented as evidence that the current work instance has already been performed.

#### Authoritative Element Information

MAP-008 MAY expose methodology information required to understand or work with the selected element.

That information MUST derive from authoritative MAP content or the applicable Methodology Resource Binding.

The workspace MUST NOT generate therapeutic claims merely to fill an information surface.

Authoritative information MAY include, where applicable:

- methodology description;
- explanatory text;
- therapeutic context;
- canonical visual material;
- structured reference information;
- instructions authorized by the methodology;
- resource-specific content.

The UX SHOULD distinguish information required for the active therapeutic work from supplementary reference material.

Supplementary information SHOULD use progressive disclosure where practical.

#### Classification-Driven Behaviour

The authoritative classification of the selected element determines which resource semantics may apply.

MAP-008 MUST NOT assume that every investigation element is a Therapeutic Resource.

The workspace MUST preserve the classification distinctions defined by the MAP Experience Backlog and Methodology Resource Bindings.

Classification may determine:

- which information is available;
- whether Analysis is applicable;
- whether Measurement is applicable;
- whether Activation is applicable;
- whether another methodology-specific interaction exists;
- what evidence may be produced;
- what completion conditions apply.

Classification itself MUST NOT be changed from inside MAP-008.

#### Capability Resolution

Before exposing an element-specific therapeutic action, the UX MUST resolve whether that action is authorized for the selected element.

Conceptually:

`Selected Element`
`+`
`Authoritative Classification`
`+`
`MAP Methodology Resource Binding`
`↓`
`Applicable Capability Set`

The resulting capability set controls which therapeutic interactions MAY appear.

Possible capability families may include, where explicitly supported:

- Information / Consultation;
- Analysis;
- Measurement;
- Activation;
- methodology-specific element interaction.

This list describes possible capability families.

It MUST NOT be interpreted as a universal action set.

#### Capability Absence Is Meaningful

If an element does not support a capability, the corresponding therapeutic control MUST NOT be presented as though it were available.

For example:

`Activation unsupported`

should normally result in:

`no Activation action`

rather than:

`disabled Activate button`.

The UX SHOULD avoid teaching the therapist that every element conceptually supports every platform capability.

Absence of an action is therefore preferable to persistent disabled controls where the capability is not part of the element contract.

#### Information / Consultation Behaviour

Where the selected element supports consultation or reference information, the workspace MAY present that information directly.

Consulting information MUST NOT automatically create evidence that therapeutic work occurred.

The UX MUST distinguish:

`information viewed`

from:

`therapeutic action performed`

where the element contract makes that distinction relevant.

Opening, scrolling or reading information MUST NOT independently complete MAP-008 unless the authoritative experience explicitly defines consultation itself as the required work.

#### Analysis Behaviour

Where Analysis is explicitly supported for the selected element, MAP-008 MAY expose the applicable analysis interaction.

Analysis MUST follow the authoritative MAP Methodology Resource Binding.

The workspace MUST NOT expose a generic analysis action merely because a platform Analysis capability exists.

The UX MUST preserve distinctions between:

- opening an analysis surface;
- therapist entering or selecting analysis information;
- therapist-confirmed analysis result;
- completed analysis work.

Where Analysis produces therapist-authored or therapist-confirmed evidence, that evidence remains associated with the current MAP-008 work instance.

The platform MUST NOT independently infer the therapeutic conclusion.

#### Measurement Behaviour

Where Measurement is explicitly supported for the selected investigation element, MAP-008 MAY expose the applicable measurement interaction.

Such measurement MUST follow the measurement model authorized by the applicable Methodology Resource Binding.

The existence of MAP-PATTERN-03 — Hawkins Measurement MUST NOT cause every MAP-008 measurement to use the Hawkins model.

Hawkins Measurement is specific to the MAP experiences and contracts that authorize it.

Other element measurements, where defined, retain their own authoritative model.

The platform MUST NOT infer or fabricate a measurement from unrelated session data.

#### Activation Behaviour

Where Therapeutic Resource Activation is explicitly supported for the selected element, MAP-008 MAY expose the applicable Activation interaction.

Activation MUST NOT be available merely because:

- the element is visible;
- the element was selected;
- the element has therapeutic significance;
- another element of the same category supports Activation;
- the platform provides an Activation capability.

The applicable Methodology Resource Binding must explicitly authorize it.

Where Activation is available, the UX MUST distinguish:

`element selected`

from:

`activation available`

from:

`activation initiated by therapist`

from:

`activation explicitly confirmed`

where those states are defined by the applicable contract.

The platform MUST NOT infer activation from:

- opening the resource;
- viewing an image;
- speech;
- elapsed time;
- measurement;
- analysis;
- work-instance completion.

#### Physical Resource Behaviour

Where the selected element corresponds to or references a physical methodology artifact, MAP-008 MUST preserve the physical/digital boundary.

The digital workspace MAY:

- identify the artifact;
- present authoritative reference information;
- guide therapist interaction;
- record therapist-confirmed facts.

It MUST NOT claim to:

- physically manipulate the artifact;
- detect its placement;
- verify its physical use;
- infer an energetic effect;
- replace a physical action where the MAP methodology requires one.

#### Digital Therapeutic Resource Behaviour

Where the applicable MAP binding authorizes a digital Therapeutic Resource, MAP-008 MAY expose the resource through the platform capability defined for that resource.

Displaying the digital resource does not automatically imply therapeutic activation or completion.

The UX MUST preserve the applicable distinction between:

- resource available;
- resource opened;
- resource consulted;
- resource used;
- resource activated;
- therapist-confirmed result.

Only states defined by the authoritative binding may be recorded as methodology evidence.

#### Multiple Applicable Capabilities

Some investigation elements MAY support more than one authorized therapeutic capability.

Where this occurs, MAP-008 SHOULD compose those capabilities inside the same element workspace rather than fragmenting the element into unrelated screens.

The UX MUST make the applicable therapeutic options understandable without implying that all available capabilities are mandatory.

Where the methodology defines a required order, that order MUST be preserved.

Where no required order exists, the UX MUST NOT invent one merely for interface convenience.

Using one capability MUST NOT automatically mark another available capability as completed.

#### Primary and Secondary Therapeutic Actions

Where multiple capabilities are available, the workspace MAY distinguish primary and secondary actions according to the authoritative methodology contract.

Visual hierarchy MUST NOT invent therapeutic priority.

A technically prominent button MUST NOT cause an optional capability to appear therapeutically mandatory.

Where the methodology does not define priority, the UX SHOULD use neutral presentation that preserves therapist choice.

#### Work Evidence

MAP-008 MUST preserve evidence produced by the current work instance according to the applicable element contract.

Evidence MAY include, where authorized:

- therapist-confirmed selections;
- measurements;
- analysis results;
- activation confirmations;
- methodology-specific observations;
- explicit work-completion confirmation.

The existence of a capability does not mean that all possible evidence types must be produced.

Only evidence applicable to the selected element and work actually performed should be recorded.

#### Notes and Transcript Boundary

Platform Session Notes and Transcript remain platform-owned capabilities.

MAP-008 MUST NOT create duplicate session-level Notes or Transcript systems.

The therapist MAY use those platform capabilities while working with an investigation element.

Transcript content MUST NOT automatically become:

- element selection;
- analysis evidence;
- measurement evidence;
- activation evidence;
- work completion.

Where MAP-008 requires a specific therapist-authored methodology fact, that fact must be captured through the applicable explicit methodology interaction rather than inferred from ambient Transcript.

#### Report Contribution Boundary

MAP-008 evidence MAY later contribute to Report Projection according to the applicable platform and methodology contracts.

However:

`MAP evidence ≠ automatically published report content`

The Investigation Element Workspace MUST NOT become a client-facing report editor.

The therapist's therapeutic working surface and the later report composition remain separate concerns.

#### Work Completion

MAP-008 completion means that the current selected-element work instance has reached the completion condition defined by the applicable MAP contract.

The UX MUST NOT define one universal completion rule for all investigation elements.

Depending on the element, completion MAY require different authorized evidence or therapist confirmation.

The workspace SHOULD make the applicable completion condition understandable.

A generic `Done` action SHOULD be avoided where it would obscure what therapeutic work is being confirmed.

#### Completion Is Not Investigation Completion

Completing MAP-008 completes only the current investigation-element work instance.

It MUST NOT mean:

- the MAP investigation cycle is complete;
- no further investigation remains;
- MAP methodology is complete;
- the Platform Session is complete.

After valid MAP-008 completion:

`MAP-008 → MAP-009`

MAP-009 remains the authoritative decision point for whether additional MAP investigation remains.

MAP-008 MUST NOT ask or infer that decision independently.

#### Completed Work Instance Immutability

Once a MAP-008 work instance is completed, subsequent MAP investigation MUST NOT silently mutate that completed instance.

If the same element is selected again later:

`new MAP-007 selection`
`↓`
`new MAP-008 work instance`

Previous completed evidence remains independently traceable.

Where correction of confirmed evidence is separately authorized, it must follow the applicable correction and audit contract rather than masquerading as a new investigation iteration.

#### Work Instance Interruption

The active MAP-008 work instance SHOULD tolerate legitimate interruption through the Unified Methodology Workspace and Platform Session.

Examples include:

- opening Notes;
- consulting Timeline;
- using Transcript / Listening;
- pausing the Platform Session;
- opening permitted platform-owned supporting surfaces;
- invoking an authorized complementary methodology.

The current MAP-008 context SHOULD remain recoverable according to the applicable execution contract.

Return to MAP MUST NOT automatically:

- repeat an action;
- confirm an action;
- complete the work instance;
- create a second work instance.

#### Complementary Methodology Invocation

A complementary methodology invoked during MAP-008 remains a separate Methodology Execution inside the same Platform Session.

It MUST NOT become:

- a MAP investigation element;
- an embedded MAP capability;
- a child MAP work instance;
- evidence that the current MAP-008 element has been completed.

When the therapist returns to MAP, the same active MAP-008 work instance SHOULD resume where permitted by the applicable contracts.

Any information or result that may legitimately pass between methodologies must do so through the platform's authorized methodology-composition contracts.

MAP-008 MUST NOT create an ad hoc cross-methodology data channel.

#### Related Methodologies Boundary

The Investigation Element Workspace MUST NOT recreate the Related Methodologies UI.

Availability and invocation of complementary methodologies remain platform-owned.

MAP-008 MAY remain aware that its execution was interrupted and later resumed.

It MUST NOT independently determine which complementary methodology should be offered in the platform-owned Related Methodologies area.

#### Voice Behaviour

Voice MAY support explicit MAP-008 interactions where both:

1. the platform Voice capability supports the interaction; and
2. the selected element's applicable MAP contract authorizes that interaction.

Voice MAY therefore assist with actions such as:

- navigation;
- opening authoritative information;
- therapist-authored methodology input;
- explicit selection within an applicable capability;
- explicit methodology commands where supported.

Ambient Transcript MUST NOT trigger therapeutic actions.

A word or phrase detected during conversation MUST NOT automatically:

- start Analysis;
- create a measurement;
- activate a resource;
- complete the work instance.

Voice-enabled therapeutic actions must remain intentional and preserve the same confirmation semantics as equivalent direct UI actions.

#### Progressive Disclosure

MAP-008 SHOULD use progressive disclosure aggressively enough to preserve therapeutic focus.

The first visible layer SHOULD prioritize:

- selected element identity;
- information necessary for the current work;
- applicable therapeutic action;
- current evidence or confirmation state;
- work completion when valid.

Secondary information MAY include:

- deeper methodology explanation;
- previous occurrences;
- supplementary resource information;
- additional reference material.

Progressive disclosure MUST NOT hide an action or piece of information required to safely perform the current authorized therapeutic work.

#### Error and Unsupported States

The UX MUST distinguish technical or configuration problems from valid therapeutic states.

Examples of technical/configuration states may include:

- authoritative element definition unavailable;
- required Methodology Resource Binding unavailable;
- inconsistent classification/binding;
- required capability unavailable due to platform failure.

Such states MUST NOT be presented as therapeutic results.

Likewise, absence of an optional capability is not an error when that capability is not authorized for the selected element.

The UX MUST fail closed where a required binding cannot be resolved rather than inventing therapeutic behaviour.

#### PC Behaviour

On PC, MAP-008 MAY use the available workspace width to keep:

- active element context;
- primary therapeutic work;
- relevant supporting information;

simultaneously accessible where this remains visually calm.

A possible conceptual organization is:

`Element Context | Active Therapeutic Work | Contextual Information`

This is not a requirement for three permanent columns.

The active therapeutic work remains visually dominant.

Platform-owned session surfaces remain governed by the surrounding Unified Methodology Workspace.

#### Tablet Behaviour

On tablet, MAP-008 MUST preserve the same element identity, capabilities, evidence semantics and completion rules.

Secondary context MAY move into:

- expandable sections;
- drawers;
- sheets;
- stacked regions;
- other permitted progressive-disclosure surfaces.

Tablet adaptation MUST NOT:

- remove an authorized therapeutic capability;
- add a capability unavailable on PC;
- merge separate evidence states;
- convert optional actions into mandatory actions;
- change work-completion semantics.

#### Pattern Boundary

Investigation Element Workspace defines the adaptive UX architecture for performing MAP work with one explicitly selected investigation element.

It does not define:

- which investigation element should be selected;
- how the therapist determines therapeutic relevance;
- universal capabilities for all MAP elements;
- therapeutic meaning not present in authoritative MAP content;
- whether additional investigation remains;
- Platform Session methodology composition;
- Platform Session completion;
- Report Projection rules;
- persistence implementation.

MAP-007 owns investigation-element selection.

MAP-008 owns the current selected-element work instance.

MAP-009 owns the explicit decision about whether investigation continues.

These boundaries MUST remain distinct.

#### Core Investigation Element Workspace Principle

One workspace adapts to many MAP investigation elements.

Adaptation is driven by authoritative methodology classification and binding, not by software convenience.

The therapist remains the therapeutic actor.

The platform provides only the information and capabilities authorized for the selected element.

The UX must therefore preserve:

**stable workspace orientation,
adaptive element-specific behaviour,
capability-by-contract,
explicit therapeutic evidence,
independent work-instance traceability,
and therapist-controlled completion.**

### MAP-PATTERN-06 — Investigation Cycle Decision

#### Purpose

Investigation Cycle Decision provides the UX structure used by MAP-009 to determine, through explicit therapist confirmation, whether additional MAP investigation remains after completion of a MAP-008 work instance.

It is primarily consumed by:

- MAP-009 — Continue or Complete the MAP Investigation Cycle.

The pattern exists to create a deliberate therapeutic decision point between completed element work and the next MAP journey transition.

MAP-009 MUST NOT:

- identify the next investigation element;
- recommend what should be investigated next;
- infer whether further investigation remains;
- automatically continue the cycle;
- automatically end the cycle;
- reinterpret the result of MAP-008 as the answer to the continuation question.

The therapist remains the authoritative actor.

#### Entry Contract

MAP-009 is entered only after the current MAP-008 work instance has reached its approved completion condition.

Entry into MAP-009 MUST preserve:

- Platform Session identity;
- MAP methodology execution identity;
- therapeutic intention;
- the completed MAP-008 work instance;
- all previously completed MAP investigation work;
- MAP Investigation Journey context;
- current investigation-cycle state.

MAP-009 MUST NOT reopen or modify the completed MAP-008 work instance merely because the therapist is deciding what happens next.

#### Core Workspace Model

The Investigation Cycle Decision workspace should remain intentionally simple.

It should prioritize:

1. **Completed Work Context**
2. **Official Continuation Question**
3. **Explicit Yes / No Decision**
4. **Deterministic Transition**

Conceptually:

`Current MAP-008 work instance completed`
`↓`
`Is there more to investigate?`
`↓`

`Yes` → `MAP-007`

`No` → `MAP-010`

The decision itself should remain the visually dominant interaction.

MAP-009 SHOULD NOT become another investigation catalogue, work workspace or therapeutic-information surface.

#### Completed Work Context

The workspace MAY present concise context about the work instance that has just been completed.

Such context MAY include:

- selected investigation-element identity;
- indication that the current work instance is complete;
- compact MAP Investigation Journey orientation where useful.

This context exists only to orient the therapist.

It MUST NOT be used to influence the continuation decision.

The platform MUST NOT present statements such as:

- “You should investigate another element”;
- “No further work appears necessary”;
- “Based on the previous result, continue”;
- “Based on the previous result, finish”.

#### Official Continuation Question

MAP-009 MUST present the continuation question defined by the approved MAP Experience Backlog.

The wording MUST preserve the authoritative methodology meaning.

The UX MUST NOT replace it with a vague generic action such as:

`Continue`

or:

`Finish`

where that wording would obscure the therapeutic decision being recorded.

The therapist should understand that the question concerns whether **additional MAP investigation remains**, not whether the entire Platform Session should end.

#### Explicit Yes / No Decision

MAP-009 requires an explicit therapist decision.

The UX MUST preserve two distinct valid outcomes:

`Yes`

and:

`No`

Neither result is an error state.

Neither result should be visually framed as inherently preferred, positive or negative.

The platform MUST NOT preselect either answer.

The platform MUST NOT infer the answer from:

- the number of investigation elements already worked;
- duration of the MAP investigation cycle;
- initial or final Hawkins values;
- previous element classifications;
- Transcript content;
- Notes;
- AI inference;
- client history;
- previous sessions.

#### Yes Semantics

A therapist-confirmed Yes means:

**additional MAP investigation remains.**

The resulting transition is:

`MAP-009 Yes → MAP-007`

This transition starts a new investigation-element selection cycle.

It MUST NOT:

- automatically select an element;
- reopen the previous MAP-008 element as active work;
- recommend a next element;
- determine which investigation approach the therapist must use.

On return to MAP-007:

- previous work remains preserved;
- the completed work instance remains independently traceable;
- the therapist explicitly identifies and selects the next element;
- the therapist MAY select the same element again if the methodology permits it.

If the same element is selected again, a new MAP-008 work instance is created.

#### No Semantics

A therapist-confirmed No means:

**the current MAP investigation cycle is complete.**

The resulting transition is:

`MAP-009 No → MAP-010`

No MUST NOT mean:

- MAP methodology completed;
- Platform Session completed;
- client treatment completed;
- no future therapeutic work is ever required;
- therapeutic success;
- therapeutic failure.

It means only that the therapist has explicitly determined that no additional investigation remains in the current MAP investigation cycle.

MAP-010 remains the next approved MAP experience.

#### Decision Is Not Inference

MAP-009 records the therapist's explicit determination.

The platform does not calculate the answer.

The UX MUST NOT introduce a derived state such as:

`Investigation complete`

before the therapist has explicitly recorded No.

Likewise, the existence of another available MAP element MUST NOT cause the platform to infer Yes.

The catalogue describes what may be investigated.

MAP-009 records whether the therapist believes further investigation remains.

These are different concepts.

#### Decision Confirmation

Where the interaction design provides an intermediate confirmation before transition, the UX MUST make clear what is being confirmed.

For example:

`Continue MAP investigation? — Yes`

or:

`Complete current MAP investigation cycle? — No`

may be used where appropriate to prevent accidental transition.

Such confirmation MUST NOT introduce a third therapeutic outcome.

The authoritative result remains Yes or No.

#### Reversibility Before Confirmation

Before the therapist explicitly confirms the MAP-009 decision, a tentative Yes or No selection MAY remain reversible.

A tentative selection MUST NOT trigger navigation or therapeutic evidence automatically.

Only the confirmed decision establishes the MAP-009 result.

After confirmation, correction behaviour MUST follow the applicable MAP evidence and audit contract.

The UX MUST NOT silently overwrite a confirmed MAP-009 decision.

#### Decision Evidence

The confirmed MAP-009 result becomes MAP methodology evidence according to the applicable contract.

That evidence SHOULD remain associated with the investigation cycle transition it caused.

The platform SHOULD be able to preserve the distinction between:

- work instance completed;
- continuation question presented;
- Yes or No explicitly confirmed;
- resulting MAP transition.

The decision evidence MUST NOT mutate the completed MAP-008 evidence.

#### MAP Investigation Journey

MAP-009 forms part of the MAP Investigation Journey.

The journey may conceptually include repeated cycles such as:

`Element A`
`↓`
`Work Instance A1`
`↓`
`More investigation? Yes`
`↓`
`Element B`
`↓`
`Work Instance B1`
`↓`
`More investigation? Yes`
`↓`
`Element A`
`↓`
`Work Instance A2`
`↓`
`More investigation? No`

This history remains MAP methodology-owned context.

It MUST remain distinct from the Platform Session Methodology Journey.

#### No Automatic Recommendation on Yes

The transition after Yes MUST be neutral.

The platform MUST NOT use the confirmed Yes decision to generate:

- “recommended next element”;
- “most likely cause”;
- “suggested category”;
- AI-generated therapeutic routing;
- prioritized investigation options.

MAP-007 remains therapist-controlled.

The purpose of Yes is to reopen investigation selection, not to delegate that selection to the platform.

#### No Automatic Session Closing on No

The transition after No MUST remain inside the approved MAP methodology journey.

`MAP-009 No → MAP-010`

The platform MUST NOT:

- complete MAP immediately;
- enter MAP-012;
- enter Platform Session Closing;
- complete the Platform Session;
- invoke another methodology.

The remaining MAP experiences continue according to the approved journey.

#### Voice Behaviour

Voice MAY support an explicit MAP-009 decision where the platform Voice capability allows intentional methodology commands.

For example, a therapist MAY explicitly issue an authorized decision command equivalent to:

`Yes, there is more to investigate`

or:

`No, there is no more to investigate`

where such voice interaction is supported.

Ambient Transcript MUST NOT create the decision.

For example, conversational use of the words:

`yes`

or:

`no`

MUST NOT automatically trigger MAP-009 progression.

A voice-based MAP-009 decision must remain:

- explicit;
- intentional;
- context-bound;
- subject to the same confirmation semantics as direct UI interaction.

#### Interruption and Return

MAP-009 SHOULD tolerate legitimate interruption through Platform Session capabilities.

If the therapist leaves MAP temporarily before confirming the decision, the pending MAP-009 state MAY be preserved as orientation state.

Return MUST NOT automatically confirm Yes or No.

If MAP-009 had already been confirmed before interruption, the resulting transition state MUST remain preserved according to the applicable execution contract.

The platform MUST NOT ask the therapist to repeat a confirmed decision merely because a platform-owned session tool was opened.

#### Complementary Methodology Boundary

MAP-009 does not determine whether a complementary methodology should be invoked.

The Yes / No decision concerns only continuation of the current MAP investigation cycle.

It MUST NOT be interpreted as:

`Yes = invoke another methodology`

or:

`No = do not invoke another methodology`.

Complementary methodology availability and invocation remain platform-owned concerns under the Unified Methodology Workspace.

#### Progressive Disclosure

MAP-009 SHOULD minimize information density.

The primary visible layer SHOULD contain:

- concise completed-work context;
- the official continuation question;
- explicit Yes / No actions.

Secondary investigation history MAY be available through progressive disclosure where useful.

Progressive disclosure MUST NOT obscure the decision itself.

#### PC Behaviour

On PC, MAP-009 SHOULD remain focused rather than expanding simply because more screen space exists.

The decision may occupy a centered or otherwise visually calm region within the Methodology Workspace.

Previous investigation context MAY remain visible as secondary information.

The UX SHOULD avoid turning the decision into a dashboard.

#### Tablet Behaviour

On tablet, the same continuation question and Yes / No semantics MUST be preserved.

The interaction SHOULD remain immediately usable without requiring unnecessary navigation or disclosure.

Secondary history MAY move into a compact progressive-disclosure surface.

Tablet adaptation MUST NOT:

- merge Yes and No into ambiguous navigation actions;
- preselect an outcome;
- alter the resulting MAP transitions;
- hide which decision is being recorded.

#### Pattern Boundary

Investigation Cycle Decision defines the UX architecture for the explicit MAP-009 continuation decision.

It does not define:

- which MAP element should be investigated;
- how the therapist performs MAP-008 work;
- which investigation approach should be used next;
- therapeutic interpretation of previous work;
- MAP completion;
- Platform Session completion;
- complementary methodology invocation.

MAP-007 owns element selection.

MAP-008 owns element-specific therapeutic work.

MAP-009 owns the explicit decision whether the MAP investigation cycle continues.

MAP-010 begins only after MAP-009 has explicitly recorded No according to the approved MAP journey.

#### Core Investigation Cycle Decision Principle

MAP-009 asks one therapeutic question.

The therapist gives one explicit answer.

The software preserves that answer and performs only the authorized transition.

Conceptually:

**Yes → investigate again.**

**No → continue beyond the investigation cycle.**

Nothing else is inferred.

## 7. MAP Workspace Composition and Journey Orientation

This section defines how the MAP experience remains visually and interactively coherent while its methodology-owned workspace transitions between the Shared MAP Workspace Patterns defined in Section 6.

It does not redefine the Unified Methodology Workspace.

The Platform Session remains the stable outer therapeutic environment.

MAP defines only the methodology-owned composition rendered inside that environment.

### 7.1 Continuous MAP Workspace

MAP-001 through MAP-012 MUST be experienced as one continuous MAP methodology execution inside the Platform Session.

Transitioning between MAP experiences MUST NOT appear as:

- launching a different application;
- opening an unrelated tool;
- creating a new Platform Session;
- creating a new MAP execution;
- leaving the Unified Methodology Workspace;
- replacing the Platform Session shell with a MAP-specific shell.

The Shared MAP Workspace Patterns may substantially change the therapeutic content and interaction presented in the methodology-owned area.

However, those changes occur inside one stable MAP workspace relationship with the surrounding Platform Session.

Conceptually:

`Platform Session`
`└── Unified Methodology Workspace`
`    └── MAP Methodology Execution`
`        └── Current MAP Experience`
`            └── Applicable Shared MAP Workspace Pattern`

The current Shared MAP Workspace Pattern determines the internal therapeutic interaction.

It does not determine or replace the surrounding Platform Session architecture.

### 7.2 Stable MAP Composition

Across MAP experiences, the methodology-owned workspace SHOULD preserve a recognizable composition based on:

1. **MAP Experience Identity**
2. **Current Therapeutic Focus**
3. **Primary Methodology Content**
4. **Applicable Methodology Interaction**
5. **Methodology Progression**

These are conceptual UX responsibilities.

They MUST NOT be interpreted as a requirement for:

- five permanent panels;
- five cards;
- a fixed column structure;
- identical component composition;
- identical information density across all MAP experiences.

The applicable Shared MAP Workspace Pattern determines how those responsibilities are expressed for the current therapeutic work.

The purpose of the stable composition is orientation, not visual uniformity.

### 7.3 MAP Experience Identity

The therapist SHOULD be able to understand which MAP experience is currently active without having to infer it from the content alone.

MAP Experience Identity MAY communicate:

- the current MAP experience;
- its concise therapeutic purpose;
- its relationship to the current MAP phase where useful.

Experience identity SHOULD remain subordinate to the therapeutic work itself.

It MUST NOT dominate the workspace as administrative metadata.

The UX SHOULD NOT require internal identifiers such as:

`MAP-006`

to be the primary therapist-facing label.

Internal experience identifiers MAY remain available where useful for architecture, diagnostics or implementation traceability.

Therapist-facing orientation SHOULD use methodology-appropriate language.

### 7.4 Current Therapeutic Focus

Every MAP experience MUST have one clearly understandable current therapeutic focus.

Examples include:

- aligning the therapeutic intention;
- preparing the sacred space;
- preparing the testimony;
- performing a canonical protocol;
- recording a Hawkins measurement;
- selecting an investigation element;
- working with the selected element;
- deciding whether investigation continues;
- completing the MAP closing protocol.

The current therapeutic focus SHOULD remain the dominant methodology-owned concern in the workspace.

Secondary information MUST NOT visually compete with it unnecessarily.

Platform-owned context MAY remain accessible according to the Unified Methodology Workspace contract.

Its presence MUST NOT obscure what the therapist is currently doing inside MAP.

### 7.5 Pattern Transitions

Transitions between Shared MAP Workspace Patterns MUST preserve MAP continuity.

For example:

`Guided Preparation`
`→ Canonical Protocol`
`→ Hawkins Measurement`
`→ Investigation Catalogue`
`→ Investigation Element Workspace`
`→ Investigation Cycle Decision`

and later:

`→ Canonical Protocol`
`→ Hawkins Measurement`
`→ Canonical Protocol`

represent changes in the therapeutic interaction required by MAP.

They do not represent changes of methodology.

The UX SHOULD therefore provide enough continuity that the therapist understands:

**the MAP work has progressed**

rather than:

**a different application or methodology has opened**.

Continuity MAY be supported through consistent:

- methodology identity;
- workspace placement;
- information hierarchy;
- interaction language;
- progression treatment;
- contextual orientation.

Consistency MUST NOT force different therapeutic patterns into identical layouts.

### 7.6 Pattern-Specific Interior

The stable MAP composition MUST permit substantial variation inside the primary methodology content area.

For example:

- Guided Preparation may emphasize guidance and therapist confirmation;
- Canonical Protocol may emphasize uninterrupted canonical wording;
- Hawkins Measurement may emphasize the authoritative reference model and selected value;
- Investigation Catalogue may emphasize navigation and discovery;
- Investigation Element Workspace may adapt to element-specific capabilities;
- Investigation Cycle Decision may intentionally reduce the workspace to one focused therapeutic question.

These differences are expected.

The UX MUST NOT add unnecessary controls, cards, panels or content merely to make every MAP experience visually symmetrical.

Visual coherence comes from shared hierarchy and orientation.

It does not require identical internal density.

### 7.7 Methodology-Owned and Platform-Owned Context

The MAP workspace MAY consume platform-owned context when that context directly supports the current MAP experience.

Examples may include:

- client or group identity;
- therapeutic intention;
- Platform Session timing context;
- active methodology context;
- relevant session continuity information.

Where such context is displayed inside or adjacent to MAP work, its source-of-truth ownership remains unchanged.

MAP MUST NOT recreate platform-owned capabilities merely to keep them visually close to the methodology work.

In particular, MAP MUST NOT create its own:

- Platform Session Header;
- session timer;
- Related Methodologies surface;
- Session Timeline;
- session-level Notes;
- Transcript / Listening system;
- Live Report;
- Platform Session Closing controls.

The Unified Methodology Workspace remains responsible for making those platform capabilities available according to its own architecture.

### 7.8 MAP-Specific Context

MAP MAY maintain and display methodology-owned context required for continuity of the MAP execution.

Such context MAY include, where applicable:

- current MAP experience;
- MAP preparation state;
- MAP activation state;
- initial Hawkins measurement;
- MAP Investigation Journey;
- current investigation element;
- current MAP-008 work instance;
- confirmed investigation-cycle decisions;
- final Hawkins measurement;
- MAP methodology completion state.

MAP-specific context MUST remain distinct from platform-owned session context.

For example:

`MAP Investigation Journey`

MUST NOT be presented as though it were:

`Platform Session Methodology Journey`.

Likewise:

`MAP completed`

MUST NOT be presented as:

`Platform Session completed`.

### 7.9 Information Persistence Across Pattern Changes

Information required for later MAP work MUST remain available according to its authoritative contract even after the UX transitions to another Shared MAP Workspace Pattern.

For example:

- the confirmed therapeutic intention remains available as MAP progresses;
- the initial Hawkins measurement remains available for MAP-011 comparison;
- completed MAP-008 work instances remain available as investigation history;
- confirmed MAP-009 decisions remain associated with their investigation-cycle transitions.

Changing the current pattern MUST NOT imply deletion, reset or loss of previously preserved MAP evidence.

At the same time, preserved information MUST NOT be treated as newly confirmed merely because it is displayed again.

### 7.10 Cross-Pattern Interaction Semantics

Equivalent interaction semantics SHOULD remain recognizable across Shared MAP Workspace Patterns.

For example:

- selection remains distinct from confirmation;
- confirmation remains explicit where required;
- completed evidence remains distinct from editable orientation state;
- supporting information remains subordinate to active therapeutic work;
- progression occurs only when the applicable experience completion condition is satisfied.

Visual treatment MAY vary according to context.

Semantic meaning MUST remain stable.

A therapist should not have to relearn what confirmation means merely because MAP moved from one Shared Workspace Pattern to another.

### 7.11 No Conventional Wizard Model

MAP progression MUST NOT be reduced to a conventional software wizard model such as:

`Step 1 of 12`
`Step 2 of 12`
`Step 3 of 12`

as the primary representation of methodology progress.

MAP contains:

- recovery;
- repeated preparation;
- an iterative investigation cycle;
- repeated investigation elements;
- potentially repeated work with the same element;
- interruption and return;
- complementary methodology participation within the broader Platform Session.

A simple linear step counter would therefore misrepresent the methodology.

MAP MAY provide orientation and progress.

That orientation SHOULD communicate therapeutic position and journey context rather than administrative step count.

### 7.12 Core Workspace Composition Principle

MAP changes therapeutic mode without changing therapeutic environment.

The Platform Session remains stable.

The Unified Methodology Workspace remains stable.

The MAP methodology execution remains continuous.

Only the methodology-owned interaction required for the current MAP experience changes.

The UX must therefore preserve:

**stable session context,
continuous MAP identity,
clear current therapeutic focus,
pattern-appropriate interaction,
and semantic continuity across transitions.**

### 7.13 MAP Journey Orientation Model

MAP SHOULD provide methodology-owned journey orientation sufficient for the therapist to understand the current therapeutic position without representing the methodology as a conventional linear wizard.

Journey orientation exists to answer:

**Where am I in the MAP therapeutic journey?**

It does not exist to calculate:

**How many software steps are left?**

The orientation model MUST therefore represent therapeutic structure rather than screen count.

#### Therapeutic Journey Phases

For orientation purposes, the MAP journey MAY be understood through the following therapeutic phases:

1. **Preparation**
2. **Opening and Activation**
3. **Initial Measurement**
4. **Investigation**
5. **Post-Investigation Protocol**
6. **Final Measurement**
7. **MAP Closing**

These phases correspond to the approved MAP journey without replacing the individual MAP experiences.

Conceptually:

`Preparation`
`MAP-001 → MAP-002 → MAP-003`
`↓`
`Opening and Activation`
`MAP-004 → MAP-005`
`↓`
`Initial Measurement`
`MAP-006`
`↓`
`Investigation`
`MAP-007 → MAP-008 → MAP-009`
`            ↑          │`
`            └──────────┘ Yes`
`↓ No`
`Post-Investigation Protocol`
`MAP-010`
`↓`
`Final Measurement`
`MAP-011`
`↓`
`MAP Closing`
`MAP-012`

The phase model is an orientation abstraction.

It MUST NOT:

- replace MAP experience identity;
- alter the authoritative MAP sequence;
- create new methodology states;
- collapse evidence from multiple experiences;
- redefine experience completion;
- redefine MAP lifecycle semantics.

#### Current Phase

At any active point in the MAP execution, the therapist SHOULD be able to understand the current therapeutic phase.

Only one MAP therapeutic phase SHOULD normally be represented as current.

The current phase derives from the active MAP experience.

For example:

- MAP-001, MAP-002 or MAP-003 → Preparation;
- MAP-004 or MAP-005 → Opening and Activation;
- MAP-006 → Initial Measurement;
- MAP-007, MAP-008 or MAP-009 → Investigation;
- MAP-010 → Post-Investigation Protocol;
- MAP-011 → Final Measurement;
- MAP-012 → MAP Closing.

The phase provides broad orientation.

The active MAP experience provides the precise current therapeutic focus.

These two levels MUST remain distinguishable.

#### Phase State

Journey orientation MAY distinguish phase states such as:

- **current**;
- **previously traversed**;
- **not yet reached**.

Where methodology recovery or repetition makes it relevant, orientation MAY additionally communicate that a previously traversed phase has become current again.

These states are navigation and orientation concepts.

They MUST NOT automatically constitute methodology evidence.

In particular:

`previously traversed`

does not necessarily mean:

`permanently completed and impossible to revisit`.

Likewise:

`not yet reached`

does not mean that the platform should expose or enable direct navigation to that phase.

#### Experience State Within a Phase

Where more detailed orientation is useful, the current phase MAY expose its constituent MAP experiences.

Such orientation MAY distinguish, according to authoritative execution state:

- current experience;
- previously traversed experience;
- experience not yet reached;
- experience requiring renewed work after an authorized recovery transition.

The UX MUST NOT derive completion merely from position.

For example, the fact that MAP-005 has been reached does not independently prove that MAP-001 through MAP-004 hold every currently required confirmation if an authorized recovery cycle later requires renewed confirmation.

Execution state remains authoritative.

Journey orientation reflects that state.

It does not create it.

#### Investigation Is an Iterative Phase

The Investigation phase MUST NOT be represented as a single one-time linear step.

Its authoritative structure remains:

`MAP-007 → MAP-008 → MAP-009`

with:

`MAP-009 Yes → MAP-007`

and:

`MAP-009 No → MAP-010`.

Journey orientation SHOULD therefore communicate that Investigation is an active therapeutic cycle.

It MUST NOT imply that:

- MAP-007 can occur only once;
- MAP-008 can produce only one work instance;
- MAP-009 can be answered only once;
- returning to MAP-007 represents regression;
- repeated investigation represents an error or lack of progress.

Each completed investigation iteration remains part of the MAP Investigation Journey.

The orientation model MAY communicate accumulated investigation activity where useful.

It MUST NOT reduce that activity to an artificial numbered sequence such as:

`Investigation Step 2 of 3`

because the number of required iterations is not known in advance.

#### Investigation Iteration Orientation

While the Investigation phase is active, the therapist SHOULD be able to distinguish the current investigation context from previous investigation work.

For example, the UX MAY communicate:

- current element-selection cycle;
- current selected element;
- current MAP-008 work instance;
- previous completed work instances;
- previous confirmed MAP-009 continuation decisions.

This information belongs to the MAP Investigation Journey.

It MUST NOT be confused with the broader phase orientation.

The phase answers:

**Where am I broadly within MAP?**

The MAP Investigation Journey answers:

**What investigation work has occurred within this Investigation phase?**

#### Recovery Orientation

The MAP-005 recovery path requires special orientation treatment.

Where an authorized MAP-005 result returns the therapist to MAP-001:

`MAP-005 → MAP-001`

the UX MUST communicate renewed Preparation rather than ordinary backward navigation.

The therapist SHOULD be able to understand that:

- the same MAP methodology execution continues;
- the same Platform Session continues;
- a renewed preparation and activation attempt is occurring;
- previously preserved context has not been lost;
- applicable confirmations may need to be performed again.

The orientation model MUST NOT present this transition as:

- application failure;
- accidental navigation;
- creation of another MAP execution;
- deletion of previous MAP work;
- simple manual navigation to an earlier screen.

Previously traversed phases MAY remain recognizable as historical journey context while Preparation becomes current again.

#### Re-entry After Interruption

Temporary departure from the active MAP workspace MUST NOT change the therapist's MAP journey position merely because MAP is not currently visible.

This includes authorized interruption through:

- Notes;
- Timeline;
- another platform-owned session capability;
- Platform Session Pause;
- an authorized complementary methodology.

On return to MAP, journey orientation SHOULD restore the therapist to the applicable MAP execution context.

For example:

`MAP Investigation`
`→ complementary methodology`
`→ return to MAP`

MUST NOT be represented as:

`new MAP journey`
or
`MAP restarted`.

The current MAP phase and applicable experience/work context remain determined by the preserved MAP execution state.

#### Complementary Methodologies Are Not MAP Phases

A complementary methodology invoked during MAP MUST NOT appear inside MAP Journey Orientation as another MAP phase.

For example:

`Preparation → Activation → Hawkins → Investigation → 35 Graphs → Investigation`

would incorrectly merge two different orientation models if presented as MAP phase progression.

MAP Journey Orientation represents only the internal MAP methodology journey.

The broader:

`MAP → 35 Graphs → MAP`

relationship belongs to the Platform Session Methodology Journey.

The therapist MAY have access to both forms of orientation through their respective owners.

The UX MUST preserve their distinction.

#### No Percentage Completion

MAP SHOULD NOT present a percentage-complete value derived merely from experience position.

For example:

`MAP 58% complete`

would be misleading because:

- the Investigation phase may repeat an unknown number of times;
- MAP-005 may cause renewed preparation;
- therapeutic duration differs substantially between experiences;
- one experience does not represent an equal fraction of therapeutic work.

A deterministic percentage MUST NOT be invented from MAP experience count.

#### No Estimated Remaining Work

The UX MUST NOT infer or display estimates such as:

- `3 steps remaining`;
- `almost finished`;
- `5 minutes remaining`;
- `one investigation left`;
- `80% complete`;

unless such information becomes deterministically supported by an authoritative future methodology contract.

The platform cannot know how much therapeutic investigation remains before the therapist makes the applicable methodology decisions.

#### Forward Visibility

Journey orientation MAY show later MAP phases to help the therapist understand the methodology structure.

Forward visibility MUST NOT imply:

- that later phases are currently actionable;
- that the therapist may skip required MAP experiences;
- that progression is guaranteed;
- that the current therapeutic work is nearly complete;
- that a future phase may be entered without satisfying its authoritative prerequisites.

Visible does not mean available.

Orientation does not override progression.

#### Backward Visibility

Previously traversed phases or experiences MAY remain visible for orientation and review where permitted.

Their visibility MUST NOT automatically authorize:

- editing confirmed evidence;
- repeating a therapeutic action;
- changing the active MAP experience;
- navigating backward outside an authorized MAP transition;
- invalidating later evidence.

Reviewability and executable navigation are different capabilities.

The UX MUST preserve that distinction.

#### Journey Orientation and Therapist Focus

Journey orientation SHOULD remain visually subordinate to the current therapeutic task.

It exists to prevent disorientation, not to compete with MAP work.

The therapist should be able to determine the current phase when needed without the workspace becoming dominated by:

- navigation chrome;
- progress indicators;
- historical states;
- future phases;
- administrative workflow information.

During high-focus experiences such as Canonical Protocol or MAP-008 therapeutic work, journey orientation MAY become visually quieter while remaining accessible.

#### PC and Tablet Orientation Parity

PC and tablet MUST preserve the same journey-orientation semantics.

Responsive adaptation MAY change:

- whether the complete phase structure is simultaneously visible;
- whether previous/future phases are collapsed;
- whether orientation uses horizontal or compact presentation;
- whether detailed phase information uses progressive disclosure.

It MUST NOT change:

- which phase is current;
- the distinction between phase and experience;
- Investigation-loop semantics;
- recovery semantics;
- completion meaning;
- methodology boundaries.

#### Core Journey Orientation Principle

MAP journey orientation represents therapeutic position, not software progress.

It must support:

**a recognizable therapeutic journey,
an explicit current phase,
a precise current MAP experience,
an iterative investigation cycle,
visible recovery without false regression,
and continuity across interruption and return.**

It MUST NOT manufacture linearity where the MAP methodology is not linear.

### 7.14 MAP Journey Rail

The MAP Journey Rail is the canonical UX model for presenting MAP Journey Orientation inside the methodology-owned workspace.

It provides a compact representation of the therapist's current therapeutic position while preserving the non-linear semantics defined by the MAP Journey Orientation Model.

The Journey Rail is:

- an orientation surface;
- methodology-owned;
- subordinate to the current therapeutic work;
- responsive across PC and tablet;
- progressively disclosable where necessary.

It is NOT:

- a conventional progress bar;
- a percentage-completion indicator;
- a wizard stepper;
- a free-navigation control;
- a substitute for MAP experience state;
- a substitute for the MAP Investigation Journey;
- a substitute for the Platform Session Methodology Journey.

#### Canonical Phase Structure

The Journey Rail represents the seven therapeutic phases defined by the MAP Journey Orientation Model:

1. Preparation
2. Opening and Activation
3. Initial Measurement
4. Investigation
5. Post-Investigation Protocol
6. Final Measurement
7. MAP Closing

The order of these phases reflects the authoritative MAP journey.

The Rail MUST NOT introduce additional therapeutic phases merely for interface convenience.

Individual MAP experiences remain governed by their authoritative contracts and Shared MAP Workspace Patterns.

#### Phase Representation

Each phase represented in the Journey Rail MUST have a clear semantic relationship with the current MAP execution state.

The Rail MAY distinguish:

- **current**;
- **previously traversed**;
- **not yet reached**;
- **current again after authorized recovery**, where additional context is necessary.

These semantic states MUST derive from authoritative MAP execution state.

The Journey Rail MUST NOT manufacture state from visual position alone.

For example:

`phase appears before current phase`

does not independently mean:

`phase permanently completed`.

Likewise:

`phase appears after current phase`

does not mean:

`phase available for execution`.

#### Current Phase

The current phase MUST be the most immediately identifiable state in the Journey Rail.

The therapist should be able to determine the current broad MAP position without reading the complete therapeutic workspace.

The current phase treatment SHOULD remain visually clear but restrained.

It MUST NOT compete with the current therapeutic interaction for primary attention.

Only one MAP phase SHOULD normally be represented as current.

The current phase is derived from the active MAP experience according to §7.13.

#### Previously Traversed Phases

A phase that has already been traversed MAY remain visually recognizable as historical MAP journey context.

Previously traversed MUST NOT be represented in a way that necessarily means:

- permanently complete;
- locked;
- therapeutically successful;
- impossible to revisit;
- safe to edit;
- available for backward navigation.

The Journey Rail SHOULD therefore avoid relying on conventional task-completion semantics as its primary historical language.

For example, a dominant checkmark convention SHOULD be avoided where it would imply:

`completed forever`.

Historical phase treatment should communicate:

**this therapeutic territory has already been traversed**

rather than:

**this software task is closed**.

#### Not-Yet-Reached Phases

Future phases MAY remain visible to provide structural orientation.

They MUST be visually distinguishable from the current phase and previously traversed phases.

Visibility MUST NOT imply executability.

A not-yet-reached phase MUST NOT become directly actionable merely because it appears in the Journey Rail.

The Rail MUST NOT allow the therapist to skip authoritative MAP prerequisites by selecting a future phase.

#### Journey Rail Is Not Navigation

The Journey Rail is an orientation model first.

Phase labels, markers or phase regions MUST NOT automatically behave as navigation controls.

Conceptually:

`visible phase ≠ navigable phase`

`historical phase ≠ editable phase`

`future phase ≠ available phase`

If a future architecture explicitly authorizes navigation to a particular MAP state, that capability MUST be defined by the applicable MAP execution contract.

It MUST NOT be inferred from the Journey Rail itself.

The visual design SHOULD avoid interaction affordances that falsely imply free navigation.

#### Current Experience Detail

The Journey Rail MAY expose the current MAP experience as a secondary level of orientation.

For example, while the broad phase is:

`Preparation`

the current experience context may communicate:

`Align Therapeutic Intention`

or:

`Prepare Testimony`.

While the broad phase is:

`Investigation`

the current experience context may communicate:

`Select investigation element`

`Work with selected element`

or:

`Decide whether investigation continues`.

The current experience detail MUST remain subordinate to the phase identity.

The Rail MUST NOT display all twelve MAP experiences simultaneously merely to reproduce the internal architecture.

The purpose is therapist orientation, not architecture visualization.

#### Investigation Phase Behaviour

Investigation requires special Journey Rail behaviour because it is iterative and has no predetermined number of cycles.

Throughout:

`MAP-007 → MAP-008 → MAP-009`

the Journey Rail MUST continue to represent:

`Investigation`

as the current therapeutic phase.

A confirmed:

`MAP-009 Yes`

MUST NOT cause the Rail to:

- move backward;
- restart the overall MAP journey;
- create another Investigation phase;
- increment a fixed investigation-step counter.

Instead, Investigation remains current while the current-experience detail returns to the MAP-007 selection context.

Conceptually:

`Investigation`
`└── Select element`

then:

`Investigation`
`└── Work with selected element`

then:

`Investigation`
`└── Decide whether investigation continues`

and, after Yes:

`Investigation`
`└── Select next element`

The therapist may therefore understand both:

**I am still in the Investigation phase**

and:

**my current therapeutic action inside that phase has changed.**

#### Investigation History Boundary

The Journey Rail MUST NOT attempt to contain the complete MAP Investigation Journey.

For example, it SHOULD NOT expand into a permanent structure such as:

`Element A → Work A1 → Yes → Element B → Work B1 → Yes → Element A → Work A2`

inside the primary Rail.

That detailed history belongs to the MAP Investigation Journey and applicable methodology-owned contextual surfaces.

The Journey Rail MAY communicate that Investigation contains accumulated work.

It MUST NOT become the investigation-history viewer.

#### Recovery Behaviour

Authorized MAP recovery MUST be representable without implying application failure or accidental backward navigation.

Where MAP-005 returns the therapist to MAP-001:

`Opening and Activation`
`→ renewed Preparation`

Preparation becomes the current phase again.

Previously traversed journey context MAY remain visually recognizable.

The Journey Rail MUST NOT:

- erase the fact that earlier traversal occurred;
- create a second MAP execution;
- display the recovery as a technical error;
- imply that the therapist manually navigated backward;
- treat all previous MAP context as invalid merely because Preparation is current again.

Where useful, the current phase MAY receive secondary recovery context indicating that this is renewed preparation.

Such context SHOULD remain therapeutic and understandable.

It SHOULD NOT expose internal lifecycle terminology unnecessarily.

#### Current Again vs First Entry

The Journey Rail MAY distinguish a phase entered through authorized recovery from its first traversal where that distinction materially improves therapist orientation.

For example, the UX MAY communicate conceptually:

`Preparation — renewed`

rather than presenting the therapist as though MAP had just begun for the first time.

This distinction MUST NOT create a new therapeutic phase.

`Preparation — renewed`

remains:

`Preparation`.

The exact therapist-facing wording remains a later content-design decision and MUST follow localization and methodology-authority requirements.

#### Interruption and Return

Temporary interruption of MAP MUST NOT alter the Journey Rail's MAP position.

If the therapist temporarily uses:

- Notes;
- Timeline;
- another platform-owned capability;
- Platform Session Pause;
- an authorized complementary methodology;

the preserved MAP execution remains authoritative for Journey Rail state.

On return to MAP, the Rail SHOULD restore the applicable:

- current phase;
- current experience orientation;
- recovery context where applicable;
- Investigation context where applicable.

The Journey Rail MUST NOT reset to Preparation merely because MAP was temporarily not visible.

#### Complementary Methodology Boundary

Complementary methodologies MUST NOT appear as phases or nodes inside the MAP Journey Rail.

For example, if the Platform Session Methodology Journey is:

`MAP → 35 Graphs → MAP`

the MAP Journey Rail remains concerned only with the preserved internal MAP position.

Conceptually, if the therapist leaves MAP during Investigation:

`MAP Journey Rail: Investigation`
`↓`
`Complementary methodology invoked`
`↓`
`Return to MAP`
`↓`
`MAP Journey Rail: Investigation`

The Platform Session owns the broader methodology relationship.

The MAP Journey Rail owns only internal MAP orientation.

#### MAP Completion Behaviour

MAP-012 is represented through the:

`MAP Closing`

phase.

Completing MAP-012 establishes MAP methodology completion according to the applicable MAP contract.

After MAP completion, the Journey Rail MUST NOT imply that the Platform Session itself has completed.

Where the completed MAP journey remains visible as historical context, its presentation MUST remain subordinate to the Platform Session's next valid action.

The surrounding platform may then permit:

- continued session work;
- another methodology;
- Platform Session Closing;

according to platform-owned contracts.

The Journey Rail MUST NOT choose among those actions.

#### Rail Information Density

The Journey Rail SHOULD expose only the information required for reliable therapeutic orientation.

Its default presentation SHOULD prioritize:

- MAP identity where necessary;
- current phase;
- relationship to previous and future phases;
- concise current-experience detail where useful.

Additional information SHOULD use progressive disclosure.

The Rail SHOULD NOT permanently display:

- internal experience IDs;
- timestamps for every transition;
- every investigation work instance;
- evidence payloads;
- diagnostic state;
- persistence metadata;
- technical lifecycle terminology.

Such information belongs to other contracts or implementation/debugging surfaces.

#### Relationship to Current Therapeutic Focus

The Journey Rail MUST remain visually subordinate to the current therapeutic focus.

The active MAP pattern remains the primary workspace content.

For example:

- canonical wording remains dominant during Canonical Protocol;
- the Hawkins reference model remains dominant during Hawkins Measurement;
- the catalogue remains dominant during MAP-007;
- the selected element and applicable therapeutic work remain dominant during MAP-008;
- the Yes / No decision remains dominant during MAP-009.

The Rail provides orientation around that work.

It does not become the work.

#### PC Presentation

On PC, the Journey Rail MAY remain persistently visible where sufficient workspace exists and where doing so does not reduce therapeutic focus.

A persistent PC presentation SHOULD remain compact.

It MAY expose:

- the seven-phase structure;
- clear current-phase treatment;
- restrained historical/future state;
- current-experience detail associated with the current phase.

The Rail MUST NOT require a permanently large sidebar.

Its exact placement remains a later visual-design decision.

Possible implementations may include a compact vertical or otherwise spatially efficient orientation surface, provided the semantic model remains unchanged.

#### Tablet Presentation

On tablet, the Journey Rail MAY use a more compact default presentation.

The default state MAY prioritize:

`MAP · Current Phase`

plus concise current-experience context.

The therapist SHOULD be able to intentionally reveal the broader Journey Rail when orientation beyond the current phase is needed.

The expanded representation MAY use a platform-permitted:

- drawer;
- sheet;
- overlay;
- expandable region;
- other progressive-disclosure surface.

The compact and expanded forms are two presentations of the same Journey Rail.

They MUST NOT represent different journey state.

#### Responsive Semantic Parity

PC and tablet MUST derive Journey Rail state from the same authoritative MAP execution semantics.

Responsive adaptation MUST NOT change:

- current phase;
- historical phase meaning;
- future phase meaning;
- recovery semantics;
- Investigation-loop semantics;
- current-experience identity;
- MAP completion meaning;
- navigation permissions.

Only presentation density and disclosure mechanics may vary.

#### Accessibility and Non-Visual State

Journey Rail meaning MUST NOT depend solely on color, shape or spatial position.

The semantic distinction between states such as:

- current;
- previously traversed;
- not yet reached;
- renewed current phase where communicated;

MUST be available through accessible presentation.

The Rail SHOULD support meaningful reading order and state communication appropriate to the final interaction technology.

Accessibility treatment MUST preserve the distinction between orientation and navigation.

A non-visual user MUST NOT be led to believe that a phase is an actionable navigation control when it is not.

#### Localization Resilience

The Journey Rail MUST tolerate therapist-facing phase and experience labels across supported locales.

The visual architecture MUST NOT depend on English label length.

Responsive treatment SHOULD tolerate:

- longer localized phase names;
- multi-line labels where appropriate;
- compact alternatives only where authoritative localized wording permits them.

Localization MUST NOT change the underlying seven-phase model or journey semantics.

#### Visual Styling Boundary

This architecture defines the Journey Rail's semantic and interaction model.

It does not yet define:

- final colors;
- typography;
- exact dimensions;
- iconography;
- line treatment;
- marker geometry;
- animation;
- exact desktop placement;
- exact tablet disclosure component;
- final component implementation.

Those decisions belong to the subsequent visual and implementation design layers.

Any later visual treatment MUST preserve the semantics defined here.

#### Core Journey Rail Principle

The MAP Journey Rail makes therapeutic position visible without turning therapy into a software checklist.

It shows:

**where MAP is,
where MAP has travelled,
and the broad therapeutic territory still ahead.**

It does not determine:

**what the therapist should do therapeutically,
how much work remains,
or where the therapist may navigate outside authorized MAP transitions.**

The Rail orients.
## 8. Architecture Completion and Implementation Handoff

This section closes the MAP UX Architecture definition and establishes the boundary between this UX architecture and subsequent visual and implementation design.

It does not introduce new therapeutic behaviour.

It does not redefine the MAP methodology, the Platform Session architecture, the Unified Methodology Workspace, or the Shared MAP Workspace Patterns.

Its purpose is to make explicit:

- what this architecture now governs;
- what remains governed by higher or separate authorities;
- what has intentionally been deferred;
- what subsequent design and implementation work MUST preserve.

### 8.1 Architecture Coverage

The MAP UX Architecture defines the methodology-specific UX structure required to present and execute the approved MAP experience inside the Unified Methodology Workspace.

Its architectural coverage includes:

1. MAP UX scope and authority boundaries;
2. methodology-specific UX principles;
3. relationship between MAP and the Platform Session;
4. the authoritative MAP-001 through MAP-012 experience journey;
5. recovery and investigation-loop semantics;
6. MAP completion and Platform Session hand-back;
7. six Shared MAP Workspace Patterns;
8. experience-to-pattern specialization;
9. cross-pattern workspace continuity;
10. MAP-specific versus platform-owned context;
11. MAP Journey Orientation;
12. the canonical MAP Journey Rail;
13. PC and tablet semantic parity;
14. interruption, return and complementary-methodology continuity;
15. accessibility and localization constraints required by the defined UX architecture.

Together, these concerns define the MAP methodology-owned UX architecture.

No additional methodology-level UX architecture is required merely to begin subsequent visual design.

### 8.2 Preserved Authority Hierarchy

This document remains subordinate to the repository authority hierarchy defined by the applicable governance documentation.

In particular, this UX Architecture MUST NOT override:

- the Product Vision & Experience Constitution;
- approved Product Decisions;
- Platform Session architecture and contracts;
- Unified Methodology Workspace boundaries;
- the authoritative MAP Experience Backlog;
- authoritative MAP methodology content and therapeutic sequence;
- applicable persistence, lifecycle, evidence and reporting contracts.

Where a later design or implementation interpretation conflicts with a higher authority, the higher authority governs.

A conflict MUST NOT be resolved by silently modifying MAP UX semantics.

### 8.3 MAP Methodology Ownership Boundary

This architecture governs only methodology-owned MAP UX.

MAP owns the presentation and interaction required to perform MAP-specific therapeutic work.

MAP does NOT own or recreate platform capabilities such as:

- Platform Session Header;
- session timer;
- Related Methodologies;
- Platform Session Methodology Journey;
- Session Timeline;
- session-level Notes;
- Transcript / Listening;
- Live Report;
- Platform Session lifecycle controls;
- Platform Session Closing.

Those capabilities remain governed by their platform authorities.

MAP MAY interact with or consume platform-owned context only through the applicable platform contracts.

Visual proximity does not transfer ownership.

### 8.4 Shared Workspace Pattern Contract

The six Shared MAP Workspace Patterns defined in Section 6 are the canonical methodology-level interaction families for MAP:

1. Guided Preparation;
2. Canonical Protocol;
3. Hawkins Measurement;
4. Investigation Catalogue;
5. Investigation Element Workspace;
6. Investigation Cycle Decision.

Subsequent visual and implementation design MUST preserve the semantic responsibilities and boundaries of the applicable pattern.

A later design MAY:

- refine composition;
- establish component hierarchy;
- define spacing and density;
- define visual styling;
- define responsive presentation;
- introduce implementation components supporting the pattern.

It MUST NOT:

- merge therapeutically distinct patterns merely for component reuse;
- move an experience to another pattern without architectural review;
- transfer therapeutic ownership between MAP experiences;
- alter confirmation semantics;
- alter progression conditions;
- introduce software interpretation where therapist authority is required.

Component reuse MUST follow architecture.

Architecture MUST NOT be rewritten merely to maximize component reuse.

### 8.5 Journey and Transition Contract

The MAP journey remains governed by the authoritative MAP experience sequence and its approved non-linear transitions.

Subsequent work MUST preserve, in particular:

- MAP-001 through MAP-012 experience identity;
- MAP-005 authorized recovery to MAP-001;
- MAP-007 → MAP-008 → MAP-009 Investigation cycle;
- MAP-009 Yes → MAP-007;
- MAP-009 No → MAP-010;
- MAP-012 methodology completion;
- hand-back from completed MAP to the Platform Session.

No visual control MAY create an unauthorized transition.

No visual representation MAY imply that an unavailable transition is executable.

Navigation affordance does not create lifecycle authority.

### 8.6 Therapist Authority Contract

The UX architecture preserves therapist authority throughout MAP.

Subsequent design and implementation MUST NOT cause the software to:

- infer pendulum results;
- infer therapeutic confirmation;
- select an investigation element on behalf of the therapist;
- infer that MAP-008 work is therapeutically complete;
- decide whether investigation should continue;
- infer Hawkins values;
- infer successful activation;
- choose a complementary methodology therapeutically;
- infer MAP completion outside its authoritative completion contract.

The system may guide, present, constrain, record and transition according to deterministic contracts.

Therapeutic interpretation remains with the therapist wherever the methodology requires therapist judgment.

### 8.7 Evidence and Confirmation Contract

Visual design MUST preserve the distinction between:

- selection;
- tentative or working state;
- therapist confirmation;
- authoritative evidence;
- previously preserved evidence;
- methodology progression.

Displaying a value again MUST NOT silently reconfirm it.

Navigating away from a value MUST NOT silently confirm it.

Selecting an option MUST NOT automatically constitute confirmation unless the authoritative experience contract explicitly defines that behaviour.

Visual convenience MUST NOT collapse distinct evidence states.

### 8.8 Journey Orientation Contract

The MAP Journey Orientation Model and MAP Journey Rail defined in Section 7 are canonical UX architecture.

The seven therapeutic orientation phases remain:

1. Preparation;
2. Opening and Activation;
3. Initial Measurement;
4. Investigation;
5. Post-Investigation Protocol;
6. Final Measurement;
7. MAP Closing.

The Journey Rail represents therapeutic position.

It MUST NOT become:

- a percentage progress bar;
- a fixed-step wizard;
- a free-navigation mechanism;
- a substitute for MAP execution state;
- a substitute for the MAP Investigation Journey;
- a substitute for the Platform Session Methodology Journey.

The final visual design MAY adapt the Rail's presentation.

It MUST preserve its semantics.

### 8.9 Investigation Architecture Contract

Investigation MUST remain explicitly iterative.

The visual and implementation layers MUST preserve the distinction between:

`MAP Journey Orientation`

and:

`MAP Investigation Journey`.

During MAP-007, MAP-008 and MAP-009, the broad Journey Rail phase remains:

`Investigation`.

The current therapeutic interaction may change between:

`Select`
`→ Work`
`→ Decide`

without implying a new MAP phase.

Repeated Investigation cycles MUST NOT be represented as failure, regression or duplicated methodology execution.

The number of Investigation iterations MUST NOT be predicted by the UX.

### 8.10 Recovery Architecture Contract

MAP-005 recovery to MAP-001 remains an authorized methodology transition.

Subsequent design MUST represent this as renewed Preparation within the same MAP execution.

It MUST NOT represent recovery as:

- technical failure;
- accidental backward navigation;
- a new MAP execution;
- deletion of previous MAP evidence;
- restart of the Platform Session.

Previously traversed context remains governed by its authoritative evidence and lifecycle contracts.

The UX MAY communicate renewed therapeutic context where useful.

It MUST NOT manufacture new methodology states merely for visual presentation.

### 8.11 Interruption and Complementary Methodology Contract

MAP MUST tolerate temporary interruption without losing its authoritative internal position.

This includes interruption through applicable platform capabilities and authorized complementary methodologies.

For example:

`MAP`
`→ complementary methodology`
`→ MAP`

represents Platform Session methodology orchestration.

It does not represent a new MAP execution.

On return, MAP MUST derive its UX state from the preserved MAP execution context.

Complementary methodologies MUST NOT be inserted into the MAP Journey Rail.

The Platform Session Methodology Journey and MAP Journey Orientation remain separate concepts with separate owners.

### 8.12 Responsive Contract

The MAP UX Architecture targets PC and tablet according to the approved platform scope.

Responsive design MAY adapt:

- spatial composition;
- information density;
- column structure;
- progressive disclosure;
- drawer or sheet usage;
- Journey Rail presentation;
- contextual information placement.

Responsive design MUST preserve:

- therapeutic meaning;
- available methodology actions;
- confirmation semantics;
- evidence semantics;
- progression conditions;
- Journey Orientation semantics;
- recovery behaviour;
- Investigation-loop behaviour;
- methodology/platform ownership boundaries.

PC and tablet are different presentations of the same MAP therapeutic architecture.

They are not different MAP workflows.

### 8.13 Visual Design Deferred Decisions

The following concerns are intentionally NOT fixed by this UX Architecture unless already constrained elsewhere:

- final color palette;
- exact typography;
- exact spacing;
- exact dimensions;
- final card treatment;
- final border and surface treatment;
- final iconography;
- animation and motion treatment;
- exact Journey Rail placement;
- exact tablet Journey Rail disclosure mechanism;
- exact component implementation;
- final breakpoint values;
- final visual hierarchy tokens;
- implementation-specific component names.

These are valid subsequent visual-design decisions.

They MUST remain within the architectural boundaries defined by this document and higher authorities.

A deferred visual decision is not an architectural gap.

### 8.14 Implementation Deferred Decisions

This document does not prescribe:

- React component structure;
- frontend state-management implementation;
- route implementation;
- persistence schema;
- database queries;
- API contracts not already governed elsewhere;
- repository implementation structure;
- CSS architecture;
- design-token implementation;
- analytics instrumentation;
- telemetry implementation;
- test-framework implementation.

Those concerns belong to their respective architecture and implementation layers.

Implementation choices MUST consume this UX Architecture.

They MUST NOT reinterpret the MAP methodology to simplify code.

### 8.15 Subsequent Visual Design Requirement

Before implementation of final MAP surfaces, the methodology UX defined here SHOULD be translated into a visual design specification or equivalent approved visual reference.

That subsequent work SHOULD establish, at minimum:

- overall MAP workspace composition inside the Unified Methodology Workspace;
- visual hierarchy for the six Shared MAP Workspace Patterns;
- therapist-facing presentation of the twelve MAP experiences;
- MAP Journey Rail visual treatment;
- PC presentation;
- tablet presentation;
- progressive-disclosure behaviour;
- applicable interaction states;
- accessible state treatment;
- localization-resilient layout behaviour.

The visual layer MAY explore alternative compositions.

Any alternative that changes the semantics defined by this architecture requires architectural review before implementation.

### 8.16 Implementation Readiness Boundary

Completion of this UX Architecture does NOT, by itself, authorize application-code changes.

It establishes that the methodology UX architecture is sufficiently defined to proceed to the next approved design or implementation-readiness activity.

Implementation authorization remains a separate governance decision.

No statement in this document should be interpreted as:

`implementation authorized`

unless such authorization is explicitly granted through the applicable repository governance process.

### 8.17 Architecture Change Control

After this UX Architecture is approved and frozen, subsequent work SHOULD treat its normative requirements as architectural constraints.

A proposed change requires architectural review where it would alter, for example:

- MAP experience ownership;
- Shared MAP Workspace Pattern assignment;
- therapeutic progression;
- recovery semantics;
- Investigation-loop semantics;
- therapist confirmation;
- evidence semantics;
- MAP/Platform ownership;
- Journey Orientation semantics;
- Journey Rail semantics;
- PC/tablet semantic parity;
- MAP completion or hand-back behaviour.

Pure visual refinement that preserves these semantics does not require the MAP UX Architecture to be reopened merely because its appearance changes.

### 8.18 Architecture Completion Criteria

This MAP UX Architecture may be considered complete when the following are true:

- all twelve MAP experiences are represented by the approved journey;
- all experience families are covered by a Shared MAP Workspace Pattern;
- cross-pattern ownership boundaries are explicit;
- therapist authority is preserved;
- selection and confirmation semantics are preserved;
- recovery is explicitly represented;
- Investigation iteration is explicitly represented;
- MAP completion remains distinct from Platform Session completion;
- complementary methodologies remain platform-orchestrated;
- workspace continuity across interruption and return is defined;
- MAP Journey Orientation is defined;
- the Journey Rail semantics are defined;
- PC/tablet semantic parity is defined;
- deferred visual and implementation concerns are explicitly bounded;
- no known blocking UX-architecture gap remains.

Meeting these criteria establishes architecture completion.

It does not constitute implementation authorization.

### 8.19 Core Architecture Handoff Principle

The completed MAP UX Architecture defines:

**what the MAP experience must mean,
how its therapeutic work is structurally presented,
how its experiences relate,
how the therapist remains oriented,
and which boundaries subsequent design must preserve.**

The next design layer determines:

**what that architecture finally looks like.**

The implementation layer determines:

**how the approved architecture and visual design are realized in software.**

Neither layer may silently redefine the therapeutic methodology or its architectural boundaries.
