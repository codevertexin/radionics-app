---
title: MAP — Visual Design Specification
document_id: MAP-VISUAL-DESIGN-SPECIFICATION
version: 0.1
status: DRAFT
classification: Working Document
methodology: MAP
depends_on:
  - MAP-UX-ARCHITECTURE
  - MAP-EXPERIENCE-BACKLOG
  - Unified Methodology Workspace — UX Architecture
  - RADIONICS-PRODUCT-CONSTITUTION
  - RADIONICS-PLATFORM-UX-BACKLOG
  - RADIONICS-PRODUCT-DECISIONS
---

# MAP — Visual Design Specification

## 1. Purpose and Scope

### 1.1 Purpose

This document defines the visual design specification for the MAP methodology experience inside the RADIONICS Unified Methodology Workspace.

It translates the approved MAP UX Architecture into a concrete visual system and layout specification suitable for:

- visual prototyping;
- PC and tablet design;
- design validation;
- implementation handoff.

This document determines how the approved MAP UX architecture should be visually expressed.

It MUST preserve the therapeutic meaning, interaction semantics, ownership boundaries, progression rules, evidence semantics and therapist authority established by:

- MAP — UX Architecture;
- MAP — Experience Backlog;
- Unified Methodology Workspace — UX Architecture;
- applicable higher RADIONICS product and Platform Session authorities.

This specification designs MAP.

It does not redesign the RADIONICS Platform Session.

### 1.2 Visual Design Objective

The objective of this specification is to make the MAP therapeutic experience visually:

- coherent across MAP-001 through MAP-012;
- immediately understandable during active therapeutic work;
- calm and focused rather than administratively dense;
- consistent with the Unified Methodology Workspace;
- distinct enough to express MAP-specific therapeutic work without creating a separate application experience;
- usable on PC and tablet;
- resilient to progressive disclosure;
- accessible and localization-aware;
- explicit about therapist confirmation and preserved evidence;
- capable of representing non-linear MAP progression without presenting MAP as a conventional software wizard.

The visual design SHOULD reduce cognitive overhead while preserving the therapeutic richness required by MAP.

Visual simplicity MUST NOT remove information, distinctions or therapist controls required by the approved methodology UX architecture.

### 1.3 In Scope

This document defines the visual specification for:

1. the MAP methodology-owned surface inside the Unified Methodology Workspace;
2. visual hierarchy within the MAP workspace;
3. visual continuity across MAP-001 through MAP-012;
4. the six Shared MAP Workspace Patterns:
   - Guided Preparation;
   - Canonical Protocol;
   - Hawkins Measurement;
   - Investigation Catalogue;
   - Investigation Element Workspace;
   - Investigation Cycle Decision;
5. experience-specific visual specialization where required;
6. MAP Journey Rail presentation;
7. current phase and current experience orientation;
8. previously traversed and not-yet-reached journey treatment;
9. authorized recovery presentation;
10. Investigation-loop visual continuity;
11. MAP Investigation Journey contextual presentation where required;
12. selection, confirmation and confirmed-evidence visual states;
13. methodology-owned supporting information and progressive disclosure;
14. visual treatment of canonical methodology content;
15. visual treatment of MAP-specific measurements;
16. visual treatment of investigation catalogue and investigation-element work;
17. PC composition;
18. tablet composition;
19. responsive adaptation between supported form factors;
20. accessible visual state communication;
21. localization-resilient layout behaviour;
22. visual constraints required for prototype and implementation handoff.

### 1.4 Out of Scope

This document does not redesign or redefine:

- the Platform Session visual shell;
- Platform Session Header;
- client or group identity ownership;
- session timer;
- Platform Session lifecycle;
- Related Methodologies;
- Platform Session Methodology Journey;
- Session Timeline;
- session-level Notes;
- Transcript / Listening;
- Live Report / Report Projection;
- Platform Session Closing;
- platform-owned navigation;
- platform-owned session actions.

Those surfaces may appear in visual references where necessary to demonstrate MAP in context.

Their inclusion MUST be treated as surrounding platform context, not as MAP visual design ownership.

This document also does not define:

- new therapeutic behaviour;
- new MAP experiences;
- changes to MAP therapeutic sequence;
- new methodology progression rules;
- new evidence semantics;
- new confirmation semantics;
- new recovery paths;
- new Investigation-loop behaviour;
- new complementary-methodology orchestration;
- database schema;
- persistence implementation;
- API design;
- frontend architecture;
- final React component structure;
- implementation authorization.

### 1.5 Architecture Preservation Rule

Visual design MUST consume the approved MAP UX Architecture rather than reinterpret it.

A visual solution is NOT valid if achieving it requires changing:

- MAP experience ownership;
- Shared MAP Workspace Pattern assignment;
- therapeutic progression;
- therapist authority;
- selection versus confirmation semantics;
- evidence meaning;
- recovery semantics;
- Investigation-loop semantics;
- MAP Journey Orientation;
- MAP Journey Rail semantics;
- MAP versus Platform Session ownership;
- complementary-methodology boundaries;
- MAP completion versus Platform Session completion;
- PC/tablet semantic parity.

Where a visual idea conflicts with an architectural requirement, the architecture governs.

The visual design must change.

The architecture MUST NOT be silently modified to accommodate the visual design.

### 1.6 Platform Context Rule

MAP MUST always be designed as methodology-owned content inside the Unified Methodology Workspace.

Conceptually:

`Platform Session`
`└── Unified Methodology Workspace`
`    └── MAP Methodology Execution`
`        └── MAP visual experience`

The visual design MUST NOT make MAP appear to be:

- a standalone application;
- a separate session;
- a methodology-specific Platform Session shell;
- a replacement for the Unified Methodology Workspace.

Visual references MAY show the surrounding Platform Session when necessary to validate composition.

However:

**showing platform context does not transfer visual ownership to MAP.**

### 1.7 Supported Form Factors

This specification targets:

- PC;
- tablet.

Both form factors MUST preserve the same therapeutic semantics and methodology capabilities.

They MAY differ in:

- spatial composition;
- density;
- simultaneous information visibility;
- progressive-disclosure mechanisms;
- Journey Rail presentation;
- supporting-context placement.

The tablet design MUST NOT be treated as a scaled-down desktop screenshot.

The PC design MUST NOT depend on interaction patterns unavailable or unsuitable on tablet.

Mobile phone design is outside the current scope of this specification.

### 1.8 Visual Design Deliverable Boundary

This specification is intended to become the canonical visual contract for MAP before final implementation.

It MAY define:

- layout rules;
- visual hierarchy;
- component roles;
- visual states;
- interaction presentation;
- responsive composition;
- spacing relationships;
- typography roles;
- surface relationships;
- icon semantics;
- motion constraints;
- prototype requirements.

It MUST NOT prescribe implementation structure merely for visual convenience.

A visual component described in this document is a design responsibility unless explicitly governed as an implementation contract elsewhere.

Completion or approval of this specification does NOT, by itself, authorize application-code changes.

Implementation authorization remains a separate governance decision.

## 2. Visual Design Authority and Boundaries

This section defines the authority hierarchy governing visual decisions for MAP.

Its purpose is to ensure that methodology-specific visual design extends the RADIONICS visual environment without replacing, duplicating or contradicting platform-owned or Unified Methodology Workspace-owned structure.

Visual authority follows ownership.

A lower visual layer MAY specialize what it owns.

It MUST NOT visually redefine what belongs to a higher layer.

### 2.1 Visual Authority Hierarchy

MAP visual design operates within the following hierarchy:

1. **RADIONICS Platform visual authority**
2. **Unified Methodology Workspace visual authority**
3. **MAP methodology visual authority**

Conceptually:

`RADIONICS Platform`
`└── Unified Methodology Workspace`
`    └── MAP Methodology Visual System`
`        └── MAP Experience / Pattern Specialization`

Each layer inherits the constraints of the layers above it.

MAP visual decisions MUST therefore remain compatible with both:

- the surrounding RADIONICS Platform Session;
- the common methodology envelope defined by the Unified Methodology Workspace.

Where a MAP visual preference conflicts with a higher visual or architectural authority, the higher authority governs.

### 2.2 RADIONICS Platform Visual Authority

The RADIONICS Platform owns the visual identity and interaction treatment of platform-level session capabilities.

This includes, where applicable:

- Platform Session shell;
- Platform Session Header;
- client or group context at platform level;
- session lifecycle controls;
- therapeutic session timing;
- platform navigation;
- Related Methodologies;
- Platform Session Methodology Journey;
- Session Timeline;
- session-level Notes;
- Transcript / Listening;
- Live Report / Report Projection;
- Platform Session Closing;
- platform-level overlays, notifications or system feedback where governed by the platform.

MAP MUST NOT create visually competing versions of those capabilities.

For example, MAP MUST NOT introduce:

- a second session header;
- a second timer;
- a second methodology switcher;
- a competing Related Methodologies surface;
- a MAP-owned Session Timeline;
- a separate Notes system;
- a methodology-specific Transcript control system;
- a separate Live Report surface;
- a MAP-specific Platform Session Closing interface.

Where such platform capabilities are visible around MAP, MAP MUST visually coexist with them.

It MUST NOT visually absorb them into the methodology-owned design.

### 2.3 Unified Methodology Workspace Visual Authority

The Unified Methodology Workspace owns the common visual envelope within which methodologies execute.

MAP MUST consume that envelope rather than create an independent methodology shell.

The Unified Methodology Workspace authority includes common structural concerns such as:

- the methodology execution region;
- relationship between methodology-owned work and surrounding Platform Session context;
- common workspace boundaries;
- common methodology placement;
- platform-permitted supporting regions;
- common responsive constraints;
- common interaction relationships required across methodologies.

MAP MAY specialize the interior of the methodology-owned region.

It MUST NOT redefine the common workspace architecture merely because a MAP-specific layout would otherwise be easier to design.

The visual result should therefore communicate:

**this is MAP inside RADIONICS**

rather than:

**RADIONICS has temporarily become a different MAP application.**

### 2.4 MAP Visual Authority

MAP owns the visual treatment required to express its methodology-specific therapeutic work inside the methodology-owned workspace.

MAP visual authority includes:

- MAP methodology identity within the permitted methodology context;
- MAP-specific current therapeutic focus;
- MAP Journey Orientation;
- MAP Journey Rail;
- visual expression of the six Shared MAP Workspace Patterns;
- MAP experience specialization;
- MAP-specific canonical protocol presentation;
- MAP-specific Hawkins measurement presentation;
- MAP Investigation Catalogue;
- MAP Investigation Element Workspace;
- MAP Investigation Cycle Decision;
- MAP-specific recovery context;
- MAP-specific evidence and confirmation presentation;
- MAP-specific supporting therapeutic information;
- methodology-owned progressive disclosure;
- visual continuity across MAP experiences.

MAP MAY establish a recognizable methodology-specific visual character.

That character MUST remain subordinate to the common RADIONICS product environment.

MAP visual identity MUST NOT depend on creating:

- an independent application chrome;
- a separate global navigation model;
- a separate session shell;
- a competing design system;
- platform-level controls styled as though they belonged to MAP.

### 2.5 Inherited vs Methodology-Specific Visual Decisions

Visual decisions SHOULD be classified before being designed.

A decision is **inherited** when its subject belongs to the Platform Session or Unified Methodology Workspace.

A decision is **MAP-specific** when its subject belongs to the MAP methodology-owned experience.

Examples:

| Visual concern | Authority |
|---|---|
| Platform Session Header | Platform |
| Session timer | Platform |
| Related Methodologies | Platform |
| Session Timeline | Platform |
| Unified methodology execution region | Unified Methodology Workspace |
| Common methodology envelope | Unified Methodology Workspace |
| MAP Journey Rail | MAP |
| MAP canonical protocol composition | MAP |
| Hawkins measurement interaction | MAP |
| Investigation catalogue composition | MAP |
| Investigation element workspace | MAP |
| MAP-009 cycle decision composition | MAP |

The MAP Visual Design Specification MUST define MAP-specific concerns.

For inherited concerns, it SHOULD define only the integration constraints necessary to ensure MAP composes correctly with them.

It MUST NOT create substitute specifications for inherited surfaces.

### 2.6 Visual Integration Does Not Transfer Ownership

A platform-owned value or control may appear visually close to MAP therapeutic content where the applicable architecture permits it.

That proximity does not make it MAP-owned.

For example:

- therapeutic intention may be visible while performing MAP work;
- client identity may remain visible while MAP is active;
- session timing may remain visible around the methodology workspace;
- Related Methodologies may remain accessible while MAP is active;
- Live Report may receive MAP contributions while MAP work is occurring.

MAP MAY account for those surrounding surfaces when defining composition.

It MUST NOT redefine their:

- source of truth;
- lifecycle;
- interaction semantics;
- persistence;
- availability;
- visual ownership.

Visual composition and capability ownership remain separate concerns.

### 2.7 MAP Visual Character

MAP SHOULD have a recognizable visual character sufficient to make the methodology experience coherent across its different therapeutic modes.

That character MAY be expressed through methodology-owned decisions such as:

- internal hierarchy;
- spacing rhythm;
- content grouping;
- therapeutic-focus emphasis;
- supporting-surface treatment;
- MAP Journey Rail treatment;
- pattern-specific composition;
- methodology-owned icon or symbolic treatment where appropriate;
- restrained visual differentiation between therapeutic states.

MAP visual character SHOULD support:

- calm;
- therapeutic focus;
- clarity;
- deliberate interaction;
- continuity;
- confidence in therapist-controlled actions.

It SHOULD NOT rely on excessive decoration or visual novelty to communicate methodology identity.

MAP-specific character MUST remain compatible with the broader RADIONICS visual system.

### 2.8 Visual Differentiation Without Semantic Reinvention

Visual design MAY differentiate MAP experiences and Shared MAP Workspace Patterns where their therapeutic work differs.

For example:

- Guided Preparation may feel guided and sequential without becoming a wizard;
- Canonical Protocol may emphasize uninterrupted canonical content;
- Hawkins Measurement may prioritize the authoritative measurement reference;
- Investigation Catalogue may prioritize discoverability and selection;
- Investigation Element Workspace may prioritize active therapeutic work;
- Investigation Cycle Decision may intentionally reduce visual complexity around the therapist's Yes / No decision.

These differences are expected.

Visual differentiation MUST NOT change the underlying interaction semantics.

For example:

- a visually prominent selection MUST NOT become confirmation;
- a subdued historical value MUST NOT cease to be authoritative evidence;
- a visually available-looking phase MUST NOT become navigable;
- a visually compact protocol MUST NOT omit canonical content;
- an attractive automated suggestion MUST NOT replace therapist authority.

The visual layer expresses semantics.

It does not create new semantics.

### 2.9 Shared Visual Consistency Across MAP Patterns

The six Shared MAP Workspace Patterns SHOULD feel like parts of one MAP methodology.

Consistency SHOULD be achieved through shared visual principles rather than forced component uniformity.

Shared consistency MAY include:

- recognizable MAP identity;
- stable hierarchy conventions;
- consistent spacing logic;
- consistent confirmation language;
- consistent state treatment;
- consistent supporting-information behaviour;
- consistent Journey Rail relationship;
- predictable placement of primary therapeutic focus where appropriate.

Consistency MUST NOT require:

- identical card layouts;
- identical information density;
- identical action placement where the therapeutic interaction differs;
- identical supporting panels;
- identical visual weight across all patterns.

A pattern may look substantially different from another where its therapeutic purpose requires it.

The therapist should nevertheless recognize both as MAP.

### 2.10 Platform Context in Visual References

Visual prototypes and design references SHOULD include enough surrounding Platform Session context to validate real composition.

A MAP-only isolated frame MAY be useful for studying methodology-owned detail.

It MUST NOT be the sole basis for validating the final MAP visual design.

At least the relevant visual validation set SHOULD demonstrate MAP inside the actual Unified Methodology Workspace relationship.

This is necessary to validate, for example:

- available methodology width;
- competition for attention;
- Journey Rail placement;
- supporting-context density;
- relationship with platform-owned surfaces;
- PC composition;
- tablet composition.

Surrounding platform context shown for validation MUST be treated as inherited context.

The MAP visual specification MUST NOT silently redesign that context.

### 2.11 Visual Prototype Boundary

A visual prototype is an expression of this specification.

It is not an authority above it.

Prototype tooling MAY make implementation-oriented choices to render a visual reference.

Those choices are non-authoritative unless they are explicitly incorporated into the approved specification.

A prototype MUST NOT be used to silently introduce:

- new therapeutic actions;
- new navigation;
- new confirmation behaviour;
- new evidence states;
- new platform capabilities;
- new methodology transitions;
- new MAP experiences;
- new ownership boundaries.

Where prototype output conflicts with this specification or the approved UX Architecture, the prototype is wrong.

The governing documents remain authoritative.

### 2.12 Design-System Boundary

This specification MAY identify visual roles required by MAP.

It SHOULD reuse existing RADIONICS design-system primitives and conventions where they are suitable and authoritative.

It MUST NOT create a parallel design system solely for MAP.

Where the existing design system does not yet provide a visual primitive required by the approved MAP architecture, the specification MAY identify the required visual role.

The subsequent design or implementation process may then determine whether that role is satisfied by:

- an existing primitive;
- an extension of an existing primitive;
- a new reusable platform primitive;
- a methodology-specific component.

That decision MUST preserve the ownership boundaries defined by the applicable architecture.

### 2.13 Authority Over Visual Decisions

When evaluating a proposed MAP visual decision, the following order SHOULD be applied:

**First — Does a higher RADIONICS authority already govern it?**

If yes, MAP inherits that decision.

**Second — Does the Unified Methodology Workspace govern it?**

If yes, MAP composes with that decision.

**Third — Does the approved MAP UX Architecture constrain it?**

If yes, the visual solution MUST express that architecture.

**Fourth — Is the decision genuinely visual and still open?**

If yes, this specification may define it.

This sequence prevents visual design from accidentally becoming architecture redesign.

### 2.14 Unresolved Higher-Layer Visual Decisions

Where a required MAP visual decision depends on a higher-layer visual decision that has not yet been defined, this specification MUST NOT invent the higher-layer contract and present it as authoritative.

Instead, the dependency SHOULD be identified explicitly.

MAP MAY define:

- the integration requirement;
- the minimum space or relationship it requires;
- the semantic constraint that must be preserved;
- candidate visual approaches for later validation.

It MUST NOT silently assume ownership of the unresolved platform concern.

An unresolved higher-layer visual dependency is not permission for MAP to redefine the Platform Session or Unified Methodology Workspace.

### 2.15 Core Visual Authority Principle

MAP visual design extends the RADIONICS therapeutic workspace from the inside.

It does not replace it from the outside.

The Platform defines the therapeutic environment.

The Unified Methodology Workspace defines the common methodology envelope.

MAP defines the visual experience of MAP therapeutic work within that envelope.

Therefore:

**inherit what belongs to the Platform,  
compose with what belongs to the Unified Methodology Workspace,  
and design only what belongs to MAP.**