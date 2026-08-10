---
title: MAP — Experience Backlog
document_id: MAP-EXPERIENCE-BACKLOG
version: 1.0
status: APPROVED
classification: Approved for Implementation
depends_on:
  - RADIONICS-PRODUCT-CONSTITUTION
  - RADIONICS-PLATFORM-UX-BACKLOG
  - RADIONICS-PRODUCT-DECISIONS
source_material:
  - MAP — Mapa Complementar de Atendimento Terapêutico 2.0 · April 2025
language: English
---

# Purpose

This document describes the implementation roadmap for the MAP therapeutic methodology.

It consumes platform capabilities defined by the Platform UX Backlog.

It never defines platform behaviour.

# Methodology Element Classification and Authority

The MAP methodology uses multiple kinds of elements during a therapeutic session.

These elements MUST NOT be treated as interchangeable merely because the source methodology may refer to them collectively as tools, resources or elements of the MAP.

For experience-design purposes, the following conceptual distinctions apply.

## Therapeutic Resource

A Therapeutic Resource is a reusable therapeutic entity that may be consumed by MAP and potentially by other methodologies.

Examples may include therapeutic graphs, chakras, angelic resources, Rays and other reusable therapeutic entities where their therapeutic identity is independently meaningful.

A Therapeutic Resource may have a global reusable identity while MAP-specific behaviour is defined separately through the applicable Methodology Resource Binding.

## Methodology Resource Binding

A Methodology Resource Binding defines how a reusable Therapeutic Resource behaves specifically within MAP.

Where applicable, a MAP Resource Binding may define:

- MAP-specific grouping or placement;
- methodology-specific meaning or Knowledge;
- selection behaviour;
- internal options or subresources;
- multiplicity rules;
- therapeutic action;
- activation capability;
- activation cardinality;
- canonical activation wording or template;
- approved placeholders;
- client-communication guidance;
- report contribution semantics;
- completion conditions;
- relationships to other MAP resources.

A global Therapeutic Resource MUST NOT automatically inherit MAP-specific therapeutic behaviour outside MAP.

Likewise, shared resource identity MUST NOT cause methodology-specific Knowledge, activation wording or therapeutic interpretation to be presented as universally applicable.

## Canonical Methodology Content or Protocol

Canonical Methodology Content or Protocol is wording, guidance or a procedural sequence that belongs specifically to the MAP methodology.

Examples include prayers, spoken requests, opening or closing sequences and other canonical MAP instructions.

Canonical Methodology Content or Protocol MUST preserve the authoritative MAP wording and sequence where the source defines them as canonical.

Its presence in MAP does not automatically classify it as a reusable Therapeutic Resource.

## Reference or Measurement Model

A Reference or Measurement Model provides a canonical structure used to interpret or record a therapist-observed result.

The Hawkins Scale is an example.

The model itself is distinct from:

- the physical instrument used by the therapist;
- the therapist-confirmed measurement;
- any objective comparison derived from confirmed measurements.

## Physical Instrument

A Physical Instrument is physically operated and interpreted by the therapist.

Examples include the pendulum and radiesthetic clock.

The platform may support the therapist in recording or navigating their use but MUST NOT independently observe, infer or interpret the physical instrument.

## Physical Methodology Artifact or Context

A Physical Methodology Artifact or Context is a physical element required or used by the methodology without necessarily being an independently activated Therapeutic Resource.

Examples may include the physical MAP, testimony and decagon according to the applicable experience.

## Therapist-Configured List

A Therapist-Configured List is a therapist-authorized or methodology-authorized structured collection whose internal items may be identified during therapeutic work.

The list, its items, selection rules and therapeutic behaviour MUST remain distinct.

MAP-specific behaviour for Lists remains subject to authoritative methodology clarification where the source does not define it completely.

## Session Fact, Measurement or Result

A Session Fact, Measurement or Result records something explicitly confirmed, interpreted or entered by the therapist during the session.

Examples may include:

- a confirmed therapeutic intention;
- a selected resource;
- an identified internal option;
- a radiesthetic-clock result;
- an initial or final Hawkins level;
- a therapist-confirmed Yes or No answer;
- confirmation that a methodology protocol was performed.

Recording one session fact MUST NOT implicitly create another therapeutic fact.

In particular:

- identified does not imply activated;
- measured does not imply activated;
- selected does not imply used;
- spoken does not imply completed;
- activated does not imply completion unless the applicable methodology contract explicitly defines that relationship.

## Derived Deterministic Fact

A Derived Deterministic Fact is calculated exclusively from already confirmed source facts without therapeutic interpretation.

For example, the objective relationship between an initial and final Hawkins value may be derived as Higher, Unchanged or Lower.

A Derived Deterministic Fact MUST remain traceable to its confirmed source facts and MUST NOT be converted into a claim of therapeutic success, failure or effectiveness.

## Report Projection

Report Projection is the therapist-controlled selection and presentation of confirmed session information for client-facing reporting.

Session evidence and Report Projection are separate concerns.

Information preserved in the session record MUST NOT be removed merely because it is excluded from the report.

Likewise, preserving session information MUST NOT automatically publish it in the client report.

# Methodology Clarification Boundary

Where the authoritative MAP source is ambiguous, internally inconsistent or does not define the therapeutic behaviour required for deterministic implementation, the platform MUST fail closed.

Until authoritative clarification is obtained:

- no missing activation wording may be invented;
- no activation capability may be inferred;
- no unsupported activation cardinality may be assumed;
- no resource-specific therapeutic action may be generated from analogy with another resource family;
- no ambiguous result may be promoted to a Therapeutic Resource merely because it appears on the physical MAP or radiesthetic clock.

Open methodology questions are tracked separately in the MAP 2.0 Methodology Clarification Register.

The Experience Backlog may document the safe implementation boundary while the methodological question remains open, but it MUST NOT silently resolve the methodology on Vanessa's behalf.

# MAP Experiences

## MAP-001 — Align the Therapeutic Intention

Status

⚪ Planned

### Purpose

Enable the therapist to establish a clear therapeutic intention with the client before preparing the therapeutic space, creating the testimony or beginning any MAP activation.

This experience translates Step 1 — “Alinhe a intenção com o consulente” — from the official MAP 2.0 methodology.

### User Value

The therapist begins the MAP session with clarity about what the client wants to address, change or achieve.

The experience supports attentive listening without distracting the therapist from the conversation or attempting to interpret the client on the therapist’s behalf.

### Entry Conditions

- A therapeutic session has been created.
- MAP is the primary methodology of the session.
- The client or group being attended has been identified.
- No MAP activation has started.
- The therapeutic space and testimony have not yet been prepared within the methodology flow.

### Therapeutic Flow

1. The therapist begins a brief conversation with the client.
2. The therapist listens to the client’s main complaints, intentions or perceived blockages.
3. The therapist uses active and empathetic listening to welcome and guide the conversation.
4. The therapist identifies the primary focus of the session.
5. The therapist formulates, with the client, one clear and objective therapeutic intention.
6. The therapist reviews and confirms the intention before continuing.
7. Once confirmed, the session may proceed to preparation of the therapeutic space.

The focus may relate to areas recognized by the official methodology, including:

- emotional;
- spiritual;
- physical;
- vibrational.

The therapist may use another focus description when that better represents the client’s intention.

For group sessions, the intention belongs to the group rather than to an individual client.

### Workspace Behaviour

The workspace should provide a calm intention-capture area within the active MAP session.

It should:

- keep the client or group context visible;
- prioritize the therapeutic intention;
- allow the therapist to record one concise intention statement;
- optionally record supporting live notes without competing with the primary intention;
- keep the confirmed intention visible during the subsequent MAP flow;
- allow the therapist to revise the intention until MAP activation begins;
- avoid dialogs, questionnaires or mandatory classifications that interrupt the conversation.

The interface must not force the therapist to translate the client’s experience into predefined diagnostic categories.

### Voice Behaviour

Because this experience happens through conversation, voice should be the preferred capture method whenever available.

The therapist should be able to:

- dictate the therapeutic intention;
- dictate supporting notes;
- review the captured text;
- correct it before confirmation.

Voice capture must never confirm or reinterpret the therapeutic intention automatically.

Keyboard entry must remain available as an alternative.

### AI Behaviour

AI is not required for the initial implementation of this experience.

Any future AI assistance may:

- organize dictated notes;
- propose a concise intention statement based on the therapist’s own words;
- identify when the recorded intention appears incomplete or ambiguous.

AI must never:

- diagnose the client;
- determine the session focus;
- infer hidden causes or blockages;
- decide the therapeutic intention;
- replace the therapist’s active and empathetic listening;
- confirm an intention without explicit therapist approval.

### Resources

No therapeutic resource is activated during this experience.

The experience may consume the following platform capabilities:

- PX-002 Session Creation;
- PX-003 Session Header;
- PX-004 Therapeutic Workspace;
- PX-101 Voice Experience;
- PX-102 Live Notes;
- PX-301 Live Report.

The confirmed therapeutic intention is preserved as a therapist-confirmed Session Fact.

Its provenance remains explicit: the platform records the intention confirmed by the therapist and does not independently infer, interpret or validate the therapeutic meaning of that intention.

The confirmed intention remains part of the preserved session record independently of whether it is later included in a client-facing report.

Its inclusion, wording and presentation in the Live Report are governed separately by therapist-controlled Report Projection.

### Acceptance Criteria

The experience is complete when:

- the therapist can record the client’s or group’s therapeutic intention;
- the intention can be entered by text;
- the confirmed intention is recorded as a therapist-confirmed Session Fact;
- preserving the intention in the session record does not automatically include it in the client-facing report;
- report inclusion remains controlled separately through Report Projection;
- voice capture can be added without changing the therapeutic flow;
- the therapist can review and edit the intention before confirming it;
- only the therapist can confirm the final intention;
- the confirmed intention remains visible during the MAP session;
- the intention is preserved as part of the session record;
- supporting notes remain secondary to the therapeutic intention;
- no MAP resource or activation is started automatically;
- the interface does not diagnose, interpret or choose the focus for the therapist;
- the therapist can proceed directly to MAP-002 after confirmation.

### Future Evolution

Future versions may support:

- therapist-approved AI condensation of conversational notes;
- multiple preliminary concerns consolidated into one primary intention;
- intention history when the therapist revises the focus during a session;
- reusable intention suggestions created by the therapist;
- group-intention workflows;
- comparison between the initial intention and the closing session reflection.

These evolutions must preserve therapist authority and must not introduce automated therapeutic decisions.

## MAP-002 — Prepare the Sacred Space

Status

⚪ Planned

### Purpose

Support the therapist in preparing a calm, comfortable and intentionally harmonized space before creating the testimony or beginning any MAP activation.

This experience translates Step 2 — “Prepare o espaço sagrado” — from the official MAP 2.0 methodology.

### User Value

The therapist can prepare the therapeutic environment according to their intuition, practice and session context without having to remember every possibility described by the methodology.

The experience provides quiet guidance while preserving the therapist’s freedom to decide how the space should be prepared.

### Entry Conditions

- MAP-001 has been completed.
- The therapeutic intention has been confirmed.
- MAP remains the primary methodology of the session.
- No testimony has been prepared within the methodology flow.
- No MAP activation has started.

### Therapeutic Flow

1. The therapist considers the format and context of the session.
2. The therapist harmonizes the environment according to their intuition.
3. The therapist may use elements such as:

   - incense;
   - sound;
   - crystals;
   - mantras;
   - other preparation elements consistent with their practice.

4. The therapist lights a candle, guided by intuition and with a clear spiritual destination, such as the client’s guardian angel or an archangel.
5. The therapist may perform additional prayers when desired.
6. For an in-person session, the therapist prepares a comfortable treatment table or seat for the client.
7. The therapist confirms that the space is ready.
8. The session may then proceed to preparation of the testimony.

The platform must treat space preparation as therapist-guided and context-dependent.

It must not impose a fixed combination of preparation elements.

### Workspace Behaviour

The workspace should present a calm and discreet preparation moment within the active MAP session.

It should:

- keep the confirmed therapeutic intention visible;
- show the official preparation guidance without overwhelming the workspace;
- present preparation elements as contextual guidance rather than a mandatory digital checklist;
- allow the therapist to indicate that the space is ready with one simple action;
- allow optional preparation notes;
- adapt the visible guidance to the session format when that format is known;
- show the treatment table or comfortable-seat reminder only when relevant to an in-person session;
- allow the therapist to continue without recording which physical elements were used.

The workspace must not require photographs, evidence or detailed confirmation of the physical environment.

### Voice Behaviour

Voice interaction is optional during this experience.

When available, the therapist may use voice to:

- record a brief preparation note;
- mark the space as ready;
- request the preparation guidance without navigating away from the session.

Voice interaction must remain discreet and must not interrupt prayers, silence or environmental preparation.

A one-click confirmation must remain available.

### AI Behaviour

AI is not required for the initial implementation of this experience.

Any future AI assistance may:

- surface therapist-authored preparation preferences;
- recall preparation elements previously chosen for similar session formats;
- present relevant preparation guidance on request.

AI must never:

- determine whether the space is spiritually or energetically prepared;
- require specific ritual elements;
- select spiritual intentions or destinations for the therapist;
- interpret the therapist’s environment;
- confirm readiness without an explicit therapist action.

### Methodology Inputs, Guidance and Physical Elements

No MAP diagnostic or therapeutic activation resource is invoked during this experience.

Space preparation is therapist-guided and may involve physical, environmental, spiritual or practice-specific preparation elements.

The methodology explicitly includes:

- a candle, lit with a clear spiritual destination;
- optional incense;
- optional sound;
- optional crystals;
- optional mantras;
- optional additional prayers;
- preparation of a comfortable treatment table or seat when relevant to an in-person session.

These elements MUST NOT be classified automatically as reusable Therapeutic Resources merely because they are used during MAP preparation.

Within this experience:

- the candle is a methodology-defined physical preparation element;
- incense, sound and crystals are optional preparation elements;
- mantras and additional prayers are optional methodology or therapist-guided preparation content;
- the treatment table or seat is physical session context.

Where any of these elements is later demonstrated to have an independently reusable therapeutic identity in MAP or another methodology, that identity and its applicable Methodology Resource Binding MUST be defined separately.

The platform does not digitally activate, verify or infer the use or spiritual effect of any preparation element.

The therapist may complete MAP-002 without recording which optional physical or spiritual preparation elements were used.

The experience may consume the following platform capabilities:

- PX-003 Session Header;
- PX-004 Therapeutic Workspace;
- PX-101 Voice Experience;
- PX-102 Live Notes;
- PX-104 Knowledge on Demand;
- PX-105 Progressive Information;
- PX-301 Live Report.

Preparation notes are preserved as session data only when the therapist chooses to record them.

Recording a preparation note does not convert the referenced preparation element into a Therapeutic Resource or independently confirm that the physical or spiritual action occurred.

Preserved preparation notes remain separate from Report Projection.

Their inclusion, wording and presentation in the Live Report remain controlled by the therapist.

### Acceptance Criteria

The experience is complete when:

- the confirmed therapeutic intention remains visible;
- the therapist can access the official space-preparation guidance;
- preparation elements are presented without imposing a fixed combination;
- the experience supports different session formats;
- in-person guidance includes preparation of a comfortable treatment table or seat;
- the therapist can record an optional preparation note;
- the therapist can confirm readiness with one simple action;
- no evidence of physical preparation is required;
- no MAP resource or activation begins automatically;
- only the therapist can confirm that the space is ready;
- the official guidance includes lighting a candle with a clear spiritual destination;
- the therapist can proceed directly to MAP-003 after confirmation.

### Future Evolution

Future versions may support:

- therapist-defined preparation routines;
- reusable preparation templates;
- session-format-specific preparation preferences;
- optional sound, mantra or prayer preparation content;
- voice-controlled access to preparation guidance;
- reminders based on the therapist’s own previous choices;
- accessibility-sensitive preparation guidance.

These evolutions must preserve the therapist’s intuition and must not transform space preparation into a rigid or compulsory digital ritual.

## MAP-003 — Prepare the Testimony

Status

⚪ Planned

### Purpose

Support the therapist in preparing the physical testimony that represents the client within the MAP session before the opening prayer or any MAP activation begins.

This experience translates Step 3 — “Prepare o testemunho” — and the testimony guidance defined in Section 8.2 of the official MAP 2.0 methodology.

### User Value

The therapist has the relevant client and session information available in one place while preparing the physical testimony.

The experience reduces the need to search for or rewrite information from memory while preserving the therapist’s authority to decide which available information to place on the testimony.

### Entry Conditions

- MAP-002 has been completed.
- The therapeutic intention has been confirmed.
- The sacred space has been prepared.
- MAP remains the primary methodology of the session.
- No opening prayer or MAP activation has started.

### Therapeutic Flow

1. The platform presents the information available for preparation of the testimony:

   - client’s full name;
   - client’s date of birth;
   - address or location where the client is at the time of the session;
   - confirmed therapeutic intention.

2. The therapist reviews the available information.
3. Whenever possible, the therapist uses the complete information in the physical testimony.
4. If the complete information is unavailable, the therapist may proceed using only the client’s full name and date of birth.
5. The platform indicates that the reduced testimony is permitted but is not the recommended form.
6. The therapist decides which of the available information to write on the physical testimony.
7. The therapist prepares the testimony on paper.

Paper guidance:

- white paper is recommended;
- another type, format or colour of paper may be used;
- the paper may have lines or no lines;
- the therapist may write with a pen or pencil of any colour.

8. The therapist places the physical testimony in the centre of the decagon.
9. The therapist confirms that the testimony has been prepared and positioned.
10. The session may then proceed to the opening prayer.

The platform provides the available information and methodology guidance.

It must not determine which information the therapist writes on the physical testimony.

### Workspace Behaviour

The workspace should provide a focused testimony-preparation moment within the active MAP session.

It should:

- keep the confirmed therapeutic intention visible;
- display the client’s available testimony information clearly;
- avoid requiring the therapist to copy information from another screen;
- allow the therapist to add or update the client’s current location when necessary;
- distinguish the complete recommended testimony from the permitted minimum testimony;
- present missing-information guidance without blocking the therapist;
- remind the therapist to prepare a physical paper testimony;
- recommend white paper without making it mandatory;
- remind the therapist to place the testimony in the centre of the decagon;
- allow the therapist to confirm completion with one simple action.

The workspace must not require the therapist to record exactly which information was written on the physical testimony.

The digital workspace supports preparation but does not replace the physical testimony required by the methodology.

### Voice Behaviour

Voice interaction is optional during this experience.

When available, the therapist may use voice to:

- provide or correct the client’s current location;
- review the available testimony information;
- record an optional preparation note;
- confirm that the testimony has been prepared and positioned.

Voice interaction must not read sensitive client information aloud automatically.

Text and one-click interaction must remain available.

### AI Behaviour

AI is not required for the initial implementation of this experience.

Any future AI assistance may:

- identify which recommended testimony information is not yet available;
- organize information explicitly provided by the therapist;
- surface the confirmed therapeutic intention for easy transcription.

AI must never:

- invent missing client information;
- infer the client’s current location;
- alter the confirmed therapeutic intention;
- decide which information should be written on the testimony;
- claim that a physical testimony has been prepared;
- replace explicit therapist confirmation.

### Physical Methodology Artifacts and Context

This experience uses two physical methodology elements:

- the physical testimony;
- the MAP decagon.

Within MAP-003, both are treated as Physical Methodology Artifacts or Context.

The physical testimony represents the client or group within the MAP session according to the methodology.

The decagon provides the physical placement point for the prepared testimony.

Neither the physical testimony nor the decagon is classified as activated merely because it is prepared, positioned or used during this experience.

In particular:

- preparing the physical testimony does not constitute therapeutic-resource activation;
- placing the testimony in the centre of the decagon does not activate the decagon;
- the platform does not infer that either physical action occurred;
- only the therapist may confirm that the testimony has been prepared and positioned.

The experience may consume the following platform capabilities:

- PX-003 Session Header;
- PX-004 Therapeutic Workspace;
- PX-101 Voice Experience;
- PX-102 Live Notes;
- PX-104 Knowledge on Demand;
- PX-105 Progressive Information;
- PX-301 Live Report.

The therapist’s confirmation that the testimony has been prepared and positioned is preserved as a therapist-confirmed Session Fact.

That confirmation records completion of the MAP-003 methodology step.

It does not prove or digitally verify the physical contents, material, placement or therapeutic effect of the testimony.

The platform is not required to record the exact information physically written on the testimony.

The physical testimony and its exact written contents are not automatically reproduced in the Live Report.

The already confirmed therapeutic intention remains preserved independently in the session record.

Any client-facing inclusion of testimony-related session information remains governed separately by therapist-controlled Report Projection.

### Acceptance Criteria

The experience is complete when:

- the therapist can see the client’s available testimony information;
- the available information includes full name, date of birth, current location and confirmed therapeutic intention;
- complete information is presented as the recommended standard;
- the therapist may proceed with only full name and date of birth when necessary;
- reduced testimony guidance is non-blocking and identified as not recommended;
- the therapist remains free to decide which available information to write;
- white paper is recommended but not mandatory;
- the platform communicates that the testimony must be physically prepared;
- the therapist is reminded to place the testimony in the centre of the decagon;
- no decagon or MAP activation begins automatically;
- the therapist can confirm preparation and placement with one simple action;
- only the therapist can confirm that the testimony is ready;
- testimony preparation and placement are recorded as therapist-confirmed session facts rather than platform-observed physical events;
- preparing or positioning the testimony does not automatically activate the testimony or decagon;
- the exact physical contents of the testimony are not required to be duplicated in the digital session record;
- preserving testimony-related session information does not automatically include it in the client-facing report;
- report inclusion remains controlled separately through Report Projection;
- the therapist can proceed directly to MAP-004 after confirmation.

### Future Evolution

Future versions may support:

- printable testimony preparation;
- therapist-defined testimony preferences;
- current-location reuse with explicit therapist confirmation;
- accessible testimony-preparation formats;
- optional reminders for incomplete recommended information;
- secure preparation workflows for remote sessions;
- group-testimony workflows after their therapeutic rules have been explicitly clarified.

These evolutions must preserve the physical testimony requirement and the therapist’s authority over the information used.

## MAP-004 — Perform the Opening Prayer

Status

⚪ Planned

### Purpose

Guide the therapist through the complete MAP opening prayer sequence after the physical testimony has been prepared and positioned, and before the MAP is activated for the session.

This experience translates Step 4 — “Oração de abertura” — from the official MAP 2.0 methodology.

### User Value

The therapist can remain present and focused while following the complete opening sequence in the correct order without having to memorize, search for or manually adapt the official prayers.

The experience provides calm, readable guidance while preserving the therapist’s voice, intention and spiritual practice.

### Entry Conditions

- MAP-003 has been completed.
- The therapeutic intention has been confirmed.
- The sacred space has been prepared.
- The physical testimony has been prepared.
- The testimony has been placed in the centre of the decagon.
- No MAP activation has started.

### Therapeutic Flow

The therapist performs the opening sequence aloud in the following order:

1. Opening Prayer;
2. Protection for the Client;
3. Invocation of the Archangels.

#### Opening Prayer

The platform presents the official MAP Opening Prayer exactly as defined by the methodology.

The prayer includes the therapist’s name and invokes:

- the therapist’s guardian angel;
- the hierarchy of light of the White Brotherhood;
- God;
- Master Jesus;
- Archangels;
- Ascended Masters;
- Beings of Light.

The prayer establishes the session as a channel of light, truth, healing and wisdom and requests that only elevated energies access the therapeutic field.

#### Protection for the Client

The platform presents the official Protection for the Client prayer exactly as defined by the methodology.

Before speaking, the therapist reviews:

- the client’s name;
- the confirmed therapeutic intention.

The prayer connects the therapist with the client and the confirmed intention, requests protection for the client and their physical space, and invokes the protective blue mantle of Archangel Michael.

For a group session, the client reference is replaced by the group reference, as instructed by the official methodology.

#### Invocation of the Archangels

The platform presents the official invocation in its defined sequence:

- Raphael in front;
- Gabriel behind;
- Michael on the right;
- Uriel on the left.

The invocation anchors protection for the therapist and the client or group.

4. After completing the three parts, the therapist explicitly confirms that the opening prayer sequence has been performed.
5. The session may then proceed to activation of the MAP and confirmation of the connection.

The sequence must remain complete and ordered.

The platform must not omit, rewrite, summarize or reinterpret the official prayer content.

### Workspace Behaviour

The workspace should provide a calm, focused and highly readable prayer experience.

It should:

- keep the client or group context visible;
- keep the confirmed therapeutic intention available;
- present one prayer segment at a time;
- preserve the official sequence;
- insert or clearly display the therapist’s name where required;
- insert or clearly display the client’s name and confirmed intention where required;
- support group terminology when the session is a group session;
- use large, readable text suitable for speaking aloud;
- allow the therapist to move between prayer segments with one simple action;
- allow the therapist to return to the previous segment when necessary;
- preserve the therapist’s current position if supporting information is opened;
- require explicit therapist confirmation after the complete sequence.

The workspace must not turn the prayer into a conventional form, checklist or technical task.

### Voice Behaviour

Speaking aloud is part of the official therapeutic flow.

The platform should support the therapist in reading the prayers aloud without requiring voice recording or transcription.

Voice capabilities may allow the therapist to:

- request the next prayer segment;
- repeat the current segment;
- return to the previous segment;
- confirm completion after the sequence has been performed.

The platform must not:

- interrupt the prayer;
- automatically advance while the therapist is speaking;
- evaluate pronunciation;
- verify whether the prayer was spoken correctly;
- require recording or transcription;
- store the spoken prayer without an explicit therapist action.

Text and one-click navigation must remain available.

### AI Behaviour

AI is not required for the initial implementation of this experience.

Any future AI assistance may:

- support hands-free navigation between prayer segments;
- surface the correct client, group and intention context;
- improve accessibility without changing the official content.

AI must never:

- generate an alternative prayer;
- summarize or paraphrase the official prayers;
- alter spiritual names, positions or invocations;
- assess the therapist’s spiritual performance;
- claim that the prayer was completed;
- advance the experience without explicit therapist confirmation.

### Canonical Methodology Content and Protocol

This experience consumes one canonical MAP opening protocol composed of three ordered protocol segments:

1. Opening Prayer;
2. Protection for the Client;
3. Invocation of the Archangels.

These protocol segments are Canonical Methodology Content.

They MUST NOT be classified automatically as reusable Therapeutic Resources merely because they are spoken or therapeutically meaningful within MAP.

The three segments together define the canonical MAP opening protocol for this experience.

The authoritative wording and required sequence MUST be preserved.

The platform MUST NOT:

- reorder the three protocol segments;
- omit a required segment;
- merge them into alternative AI-generated wording;
- paraphrase or therapeutically reinterpret the canonical text;
- treat completion of one segment as completion of the entire opening protocol;
- convert the Archangels named within the Invocation of the Archangels into automatically selected or activated Therapeutic Resources.

In particular, the canonical Invocation of the Archangels performed during MAP-004 is methodology protocol content.

It is distinct from any Archangel Therapeutic Resources that may later be identified, selected, worked with or activated during the MAP investigation cycle.

Mentioning or invoking an Archangel within the canonical opening protocol MUST NOT automatically create:

- a therapeutic-resource selection;
- a therapeutic-resource usage record;
- a therapeutic-resource activation record;
- a recommendation to use that Archangel later in the session.

The therapist’s explicit confirmation that the complete canonical opening protocol was performed is preserved as a therapist-confirmed Session Fact.

That confirmation records completion of MAP-004.

The platform does not independently verify that the prayer was spoken, that the physical or energetic actions described by the methodology occurred, or that any spiritual or therapeutic effect resulted.

The experience may consume the following platform capabilities:

- PX-003 Session Header;
- PX-004 Therapeutic Workspace;
- PX-101 Voice Experience;
- PX-102 Live Notes;
- PX-104 Knowledge on Demand;
- PX-105 Progressive Information;
- PX-301 Live Report.

Preserved protocol-completion evidence remains separate from Report Projection.

Any client-facing inclusion or description of the MAP opening protocol remains controlled separately by the therapist.

### Acceptance Criteria

The experience is complete when:

- the three official prayer segments are available;
- the segments appear in the correct order;
- the exact official wording is preserved;
- the therapist’s name is available where required;
- the client’s name and confirmed intention are available where required;
- group terminology is supported without changing the prayer’s meaning;
- only one prayer segment is presented as the primary focus at a time;
- the prayer text is readable while being spoken aloud;
- the therapist can move forward and backward without losing session context;
- no recording or transcription is required;
- the platform does not evaluate the spoken prayer;
- no MAP activation begins automatically;
- only the therapist can confirm completion;
- the three ordered parts are treated as segments of one canonical MAP opening protocol rather than as three independently reusable Therapeutic Resources;
- canonical protocol wording and sequence are preserved;
- completion remains traceable to explicit therapist confirmation;
- invoking the Archangels within the canonical opening protocol does not automatically select, use or activate Archangel Therapeutic Resources;
- protocol-completion evidence remains separate from therapist-controlled Report Projection;
- the therapist can proceed directly to MAP-005 after confirmation.

### Future Evolution

Future versions may support:

- hands-free prayer navigation;
- therapist-controlled text-size and contrast preferences;
- optional therapist-recorded prayer audio;
- prayer and protocol accessibility modes;
- discreet pauses between prayer segments;
- therapist-authored additional prayers performed outside the mandatory MAP sequence.

These evolutions must preserve the official prayer sequence and must never modify or replace the canonical MAP prayer and protocol content.

## MAP-005 — Activate the MAP and Confirm the Connection

Status

⚪ Planned

### Purpose

Guide the therapist through activation of the MAP and confirmation of the therapeutic connection before beginning frequency measurement or therapeutic investigation.

This experience translates Step 5 — “Ativando sua mesa e confirmando a conexão” — from the official MAP 2.0 methodology.

### User Value

The therapist can perform the complete MAP activation and confirmation sequence without having to remember the activation words, questions or recovery path.

The experience keeps the process calm and ordered while ensuring that only the therapist records and interprets the pendulum responses.

### Entry Conditions

- MAP-004 has been completed.
- The therapeutic intention has been confirmed.
- The sacred space has been prepared.
- The physical testimony is positioned in the centre of the decagon.
- The complete opening prayer sequence has been performed.
- The MAP has not yet been confirmed as activated for the session.

### Therapeutic Flow

#### Request MAP Activation

1. The platform presents the official MAP Activation Request exactly as defined by the methodology.
2. The therapist says the activation request aloud.
3. The therapist closes their eyes and places their hands over the physical MAP.
4. The therapist remains in silence for up to one minute.
5. The therapist determines when the silent activation moment is complete.

The platform may support this moment with a discreet timer.

The timer must not automatically complete or confirm the activation.

#### Confirm MAP Activation

6. Using the pendulum and the radiesthetic clock, the therapist asks whether the MAP is activated.
7. The therapist observes and interprets the pendulum response.
8. The therapist records the response in the workspace:

   - Yes;
   - No.

9. If the response is No:

   - the MAP is not considered ready;
   - the session must not proceed to therapeutic investigation;
   - the therapist returns to MAP-001 and repeats the preparation and opening process.

#### Confirm Client Connection

10. When MAP activation has been confirmed, the therapist asks whether the client is fully connected to the MAP.
11. The therapist observes and interprets the pendulum response.
12. The therapist records the response:

   - Yes;
   - No.

#### Confirm Complete Activation

13. The therapist asks whether the activation is complete.
14. The therapist observes and interprets the pendulum response.
15. The therapist records the response:

   - Yes;
   - No.

16. The MAP is ready for the session only when the therapist has recorded:

   - MAP activated: Yes;
   - client fully connected: Yes;
   - activation complete: Yes.

17. If either connection confirmation is No, the therapist may:

   - return to MAP-001 and repeat the preparation, opening and activation process; or
   - consult the pendulum regarding the reason and how long they should wait before attempting the session again.

18. Only after all three confirmations are recorded as Yes may the therapist proceed to initial frequency measurement.

For a group session, the client connection question uses the group reference, as instructed by the official methodology.

The platform records the therapist’s interpretation of the pendulum response.

It must never interpret the physical pendulum movement itself.

### Workspace Behaviour

The workspace should present the activation and confirmation sequence progressively.

It should:

- keep the client or group context visible;
- keep the confirmed therapeutic intention available;
- present the official activation request in a readable format;
- provide an optional discreet timer of up to one minute;
- allow the therapist to end the silent moment before the timer finishes;
- present one confirmation question at a time;
- keep the three confirmation results distinct;
- provide simple Yes and No recording actions;
- show which confirmations have been completed;
- prevent accidental progression while any confirmation is No or unanswered;
- explain the official recovery path when a No response is recorded;
- allow the therapist to restart the methodology flow from MAP-001;
- preserve existing session information when the flow is restarted;
- require the therapist to reconfirm each repeated experience;
- allow the therapist to pause the session when the pendulum indicates that they should wait.

The interface must not present a negative response as a technical error.

It represents a therapeutic outcome interpreted by the therapist.

### Voice Behaviour

Voice interaction may support hands-free progression during this experience.

When available, the therapist may use voice to:

- request the activation script;
- start or stop the silent timer;
- request the next confirmation question;
- record Yes or No;
- request repetition of the current question;
- choose to restart or pause the session.

Voice interaction must not remain actively intrusive during the silent activation moment.

The platform must not use voice analysis, sound detection or camera input to infer whether activation occurred.

Text and one-click controls must remain available.

### AI Behaviour

AI is not required for the initial implementation of this experience.

Any future AI assistance may:

- surface the canonical MAP Activation Request;
- support hands-free navigation;
- explain the documented recovery options after a No response;
- preserve session context when the MAP activation journey is restarted.

AI must never:

- determine whether the MAP is activated;
- interpret pendulum movements;
- infer the client’s connection;
- convert an unanswered confirmation into Yes or No;
- override a No response;
- estimate how long the therapist should wait;
- invent a reason for an unsuccessful connection;
- proceed without the therapist’s explicit responses.

### Methodology Protocol, Physical Context and Instruments

This experience combines canonical MAP methodology content, physical methodology context and therapist-operated physical instruments.

These elements MUST remain conceptually distinct.

#### Canonical Methodology Content or Protocol

The MAP Activation Request is Canonical Methodology Content.

Its authoritative wording and required sequence MUST be preserved.

The MAP Activation Request MUST NOT be classified automatically as a reusable Therapeutic Resource.

The platform may surface the canonical MAP Activation Request at the appropriate point in the experience, but MUST NOT rewrite, paraphrase, complete or therapeutically reinterpret it.

#### Physical Methodology Artifacts and Context

This experience uses:

- the physical MAP;
- the prepared physical testimony;
- the MAP decagon.

Within MAP-005, these elements provide the physical methodology context required for the activation procedure.

Their physical presence, placement or prior preparation is not independently observed or verified by the platform.

Use of the physical MAP, testimony or decagon in this experience MUST NOT automatically create a Therapeutic Resource activation record.

#### Physical Instruments

This experience uses:

- the pendulum;
- the radiesthetic clock.

These are therapist-operated Physical Instruments.

Only the therapist may physically operate and therapeutically interpret them.

The platform MUST NOT independently observe pendulum movement, determine a radiesthetic-clock answer, infer a Yes or No result, or claim that an energetic state has been detected.

#### Therapist-Confirmed Activation Results

The activation procedure produces three explicit therapist-confirmed results:

1. MAP activated — Yes / No;
2. client connected — Yes / No;
3. activation complete — Yes / No.

Each result is preserved as a therapist-confirmed Session Fact or Result.

Its provenance MUST remain explicit.

The platform records the answer confirmed by the therapist; it does not independently verify the physical, energetic or therapeutic phenomenon represented by that answer.

Recording `Yes` for one result MUST NOT automatically infer `Yes` for another.

The three results remain individually traceable.

MAP-005 may be considered complete only according to the completion conditions defined by the MAP therapeutic flow and the therapist's explicit confirmations.

#### MAP Activation Boundary

Activation in MAP-005 refers to activation of the MAP methodology for the current therapeutic journey.

It is distinct from Therapeutic Resource Activation that may be performed later in the MAP investigation cycle where explicitly supported by the selected element’s authoritative classification and MAP-specific behaviour.

Therefore:

- MAP activation MUST NOT create a Therapeutic Resource activation record;
- MAP activation MUST NOT mark any later Therapeutic Resource as selected, used or activated;
- activation of a Therapeutic Resource later in the journey MUST NOT retroactively alter the MAP-005 activation results;
- the two activation concepts MUST remain independently traceable in session history.

The experience may consume the following platform capabilities:

- PX-003 Session Header;
- PX-004 Therapeutic Workspace;
- PX-101 Voice Experience;
- PX-102 Live Notes;
- PX-104 Knowledge on Demand;
- PX-105 Progressive Information;
- PX-301 Live Report.

The MAP activation results are preserved as session evidence independently of Report Projection.

Their inclusion, wording and presentation in the client-facing report remain controlled separately by the therapist.

### Acceptance Criteria

The experience is complete when:

- the official MAP Activation Request is available;
- the exact official wording is preserved;
- the therapist is guided to speak the request aloud;
- the therapist is guided to place their hands over the physical MAP;
- a silent period of up to one minute is supported;
- any timer remains optional and does not confirm completion automatically;
- the three official confirmation questions remain distinct;
- each confirmation supports an explicit Yes or No response;
- only the therapist can record the interpreted pendulum response;
- progression requires all three confirmations to be Yes;
- a No activation response returns the methodology flow to MAP-001;
- a No connection or completeness response presents the two official recovery paths;
- restarting preserves session information but requires renewed confirmation of each experience;
- pausing does not falsely mark the activation as complete;
- group terminology is supported;
- the platform does not interpret the pendulum;
- the platform does not present a No response as a technical failure;
- the MAP Activation Request is treated as Canonical Methodology Content rather than as a reusable Therapeutic Resource;
- the physical MAP, testimony and decagon remain distinct from therapist-operated Physical Instruments;
- pendulum and radiesthetic-clock interpretation remains exclusively therapist-controlled;
- each Yes or No activation result is preserved as an independently therapist-confirmed Session Fact or Result;
- the platform does not independently verify MAP activation, client connection or activation completion;
- confirming one activation result does not automatically infer another;
- MAP activation remains distinct from later Therapeutic Resource Activation;
- completing MAP-005 does not automatically select, use or activate any Therapeutic Resource;
- preserved MAP activation evidence remains separate from therapist-controlled Report Projection;
- the therapist can proceed directly to MAP-006 only after all confirmations are Yes.

### Future Evolution

Future versions may support:

- therapist-controlled activation timers;
- hands-free confirmation navigation;
- MAP activation-journey history;
- pause and resume guidance;
- configurable therapist preferences for repeated preparation;
- optional notes about a No response;
- physical-tool guidance available on demand.

These evolutions must preserve therapist interpretation, the official recovery paths and the requirement for three explicit positive confirmations.

## MAP-006 — Record the Initial Hawkins Level

Status

⚪ Planned

### Purpose

Enable the therapist to record the client’s initial Hawkins level, as indicated by the pendulum on the physical MAP, before beginning the MAP therapeutic investigation.

This experience translates Step 6 — “Verificação da frequência inicial” — from the official MAP 2.0 methodology.

### User Value

The therapist can register the initial energetic reference with one visual selection while remaining focused on the physical MAP and pendulum.

The recorded level establishes the session baseline that will later be compared with the final Hawkins level.

### Entry Conditions

- MAP-005 has been completed.
- The MAP has been confirmed as activated.
- The client or group has been confirmed as fully connected.
- The activation has been confirmed as complete.
- No MAP therapeutic investigation has started.
- No initial Hawkins level has been recorded for the current MAP activation journey.

### Therapeutic Flow

1. The therapist uses the physical pendulum with:

   - the Hawkins Scale represented on the MAP; or
   - the physical radiesthetic clock, as permitted by the methodology.

2. The therapist asks the official initial Hawkins question for the client or group.
3. The therapist observes and interprets the pendulum indication.
4. The platform presents the official Hawkins levels as visual selection options:

   - 20 — Shame;
   - 30 — Guilt;
   - 50 — Apathy;
   - 75 — Grief;
   - 100 — Fear;
   - 125 — Desire;
   - 150 — Anger;
   - 175 — Pride;
   - 200 — Courage;
   - 250 — Neutrality;
   - 310 — Willingness;
   - 350 — Acceptance;
   - 400 — Reason;
   - 500 — Love;
   - 540 — Joy;
   - 600 — Peace;
   - 700 — Enlightenment.

5. The therapist selects the level indicated by the pendulum.
6. The platform shows the selected value and level name for review.
7. The therapist confirms the initial Hawkins level.
8. The confirmed level becomes the initial reference for the session.
9. The session may then proceed to MAP therapeutic investigation.

The `700 — Enlightenment` selection represents the highest level shown on the MAP interface, corresponding to the methodology’s Enlightenment range.

The platform records the therapist’s selection.

It must not observe, calculate or interpret the physical pendulum response.

### Workspace Behaviour

The workspace should provide a visual Hawkins selection experience aligned with the physical MAP.

It should:

- keep the client or group context visible;
- keep the confirmed therapeutic intention available;
- display all official Hawkins levels simultaneously when screen space permits;
- present each level as a visually recognizable selectable card;
- show both the numeric value and the level name;
- preserve the official order from the lowest to the highest level;
- allow selection with one action;
- clearly distinguish the selected level;
- allow the therapist to change the selection before confirmation;
- require explicit confirmation;
- keep the confirmed initial level visible during the remainder of the session;
- avoid requiring numeric typing;
- avoid opening unnecessary dialogs.

The experience is designed primarily for desktop and tablet therapeutic workspaces.

It must remain usable within the supported workspace sizes without hiding or reordering the Hawkins levels.

### Voice Behaviour

Voice interaction may provide an alternative to visual selection.

When available, the therapist may:

- request the initial Hawkins measurement guidance;
- select a level by speaking its value or name;
- review the selected level;
- correct the selection;
- confirm the initial level.

Voice capture must not infer a level from surrounding speech or from the therapist’s question to the pendulum.

Visual and one-click selection must remain the primary interaction.

### AI Behaviour

AI is not required for this experience.

Any future AI assistance may:

- recognize an explicitly dictated Hawkins value or level name;
- surface the corresponding official level card;
- provide the methodology’s reference information on demand.

AI must never:

- observe or interpret the pendulum;
- calculate a Hawkins level;
- infer a level from client information, symptoms, notes or intention;
- select a level without therapist instruction;
- change the therapist’s selection;
- assess whether the initial level is positive, negative, expected or correct;
- recommend a therapeutic resource solely from the recorded level.

### Measurement Model, Physical Context and Instruments

This experience combines a MAP Reference or Measurement Model, physical methodology context and therapist-operated Physical Instruments.

These elements MUST remain conceptually distinct.

#### Reference or Measurement Model

The Hawkins Scale is a Reference or Measurement Model used by MAP to represent the therapist-observed energetic level.

The official Hawkins levels and names exposed by this experience MUST remain aligned with the MAP 2.0 methodology.

The Hawkins Scale itself is distinct from:

- the physical instrument used to obtain an indication;
- the therapist-confirmed initial measurement;
- the later final measurement;
- the deterministic comparison between the two confirmed measurements.

Displaying or consulting the Hawkins Scale MUST NOT itself create a measurement.

#### Physical Methodology Context

The physical MAP may provide the Hawkins Scale used during the measurement.

Within MAP-006, the physical MAP is Physical Methodology Artifact or Context.

Its use during measurement MUST NOT create a Therapeutic Resource selection, usage or activation record.

#### Physical Instruments

The therapist may use:

- the pendulum;
- the physical radiesthetic clock, when applicable according to the methodology.

These are therapist-operated Physical Instruments.

Only the therapist may observe and interpret their physical indication.

The platform MUST NOT:

- observe pendulum movement;
- infer a Hawkins level;
- calculate a Hawkins level from client or session information;
- determine whether the therapist’s selected level is therapeutically correct;
- convert the measurement into a therapeutic-resource activation.

#### Therapist-Confirmed Initial Measurement

The selected initial Hawkins level becomes a therapist-confirmed Session Measurement only after explicit therapist confirmation.

The confirmed measurement preserves:

- the official numeric value;
- the official level name;
- its role as the initial Hawkins measurement;
- its association with the current session and applicable MAP activation journey;
- therapist-confirmed provenance.

Before confirmation, a selected level remains editable and MUST NOT be treated as the authoritative initial measurement.

Only one confirmed initial Hawkins measurement applies to the current MAP activation journey unless a later methodology contract explicitly defines repeated-measurement behaviour.

The platform records the therapist-confirmed measurement.

It does not claim to have measured the client independently.

The experience may consume the following platform capabilities:

- PX-003 Session Header;
- PX-004 Therapeutic Workspace;
- PX-005 Session Timeline;
- PX-101 Voice Experience;
- PX-104 Knowledge on Demand;
- PX-105 Progressive Information;
- PX-301 Live Report.

The confirmed initial Hawkins measurement becomes part of:

- the preserved session record;
- the Session Timeline;
- the source evidence for the later initial-versus-final Hawkins comparison.

The initial measurement and the later final measurement MUST remain separately traceable.

The initial-versus-final comparison is a separate Derived Deterministic Fact and MUST NOT be created until both required therapist-confirmed measurements exist.

The confirmed initial measurement remains preserved independently of Report Projection.

Its inclusion, wording and presentation in the client-facing report remain controlled separately by the therapist.

### Acceptance Criteria

The experience is complete when:

- all official Hawkins level options are available;
- every option shows its numeric value and level name;
- the levels appear in their official ascending order;
- the therapist can select a level with one action;
- numeric typing is not required;
- only one initial Hawkins level can be selected at a time;
- the therapist can review and change the selection before confirmation;
- only the therapist can confirm the selected level;
- the platform does not interpret the pendulum;
- the platform does not calculate or infer the initial level;
- the confirmed initial level remains visible during the session;
- the initial level is preserved for final comparison;
- the initial level is preserved in the Session Timeline;
- preservation of the initial measurement does not automatically include it in the client-facing report;
- no therapeutic resource is automatically recommended or activated;
- the Hawkins Scale is treated as a Reference or Measurement Model rather than as a Therapeutic Resource activated by this experience;
- the physical MAP remains distinct from the Hawkins measurement recorded by the platform;
- the pendulum and radiesthetic clock remain therapist-operated Physical Instruments;
- a selected Hawkins level becomes authoritative only after explicit therapist confirmation;
- the confirmed initial level is preserved as a therapist-confirmed Session Measurement;
- measurement provenance remains explicit;
- displaying or consulting the Hawkins Scale does not itself create a measurement;
- recording the initial measurement does not create a Therapeutic Resource selection, usage or activation record;
- the initial and final Hawkins measurements remain independently traceable;
- the initial-versus-final comparison is not created until both therapist-confirmed measurements exist;
- any later comparison is treated as a Derived Deterministic Fact rather than as a new therapeutic measurement;
- preservation of the initial measurement remains separate from therapist-controlled Report Projection;
- the therapist can proceed directly to MAP-007 after confirmation.

### Future Evolution

Future versions may support:

- therapist-controlled visual themes for the Hawkins Scale;
- richer level information through progressive disclosure;
- voice selection by value or level name;
- accessibility alternatives to colour-based recognition;
- historical initial-versus-final comparisons across client sessions;
- optional therapist notes associated with the measurement.

These evolutions must preserve direct therapist selection and must never transform the Hawkins level into an automatically calculated assessment.

## MAP-007 — Choose the Therapeutic Investigation Path

Status

⚪ Planned

### Purpose

Enable the therapist to begin the MAP therapeutic investigation using the form of guidance most appropriate to the session, while preserving the flexibility, intuition and pendulum-led practice defined by the methodology.

This experience translates the investigation-entry options described in Step 7 — “Início do atendimento e rastreio com a MAP” — from the official MAP 2.0 methodology.

### User Value

The therapist can begin the therapeutic investigation naturally, without being forced into a rigid sequence or a predefined software workflow.

The experience provides immediate access to the MAP therapeutic investigation catalogue while allowing the therapist to follow the pendulum, the client’s reported concerns, an intuitive rotation or an organized therapeutic route.

The investigation catalogue may expose different kinds of methodology elements. Catalogue presence does not by itself classify every element as a reusable Therapeutic Resource or imply that every element supports activation.

### Entry Conditions

- MAP-006 has been completed.
- The MAP has been confirmed as activated.
- The client or group has been confirmed as connected.
- The activation has been confirmed as complete.
- The initial Hawkins level has been recorded.
- No MAP investigation element has yet been selected for the active investigation cycle.

### Therapeutic Flow

The therapist may begin the investigation using any of the following official approaches.

#### Pendulum-Guided Selection

1. The therapist uses the pendulum over the physical decagon.
2. The therapist asks which therapeutic resource should be activated first.
3. The therapist observes and interprets the pendulum response.
4. The therapist finds and selects the indicated resource in the MAP workspace.

The wording “which therapeutic resource should be activated first” reflects the current authoritative MAP source and is preserved pending methodology clarification.

For platform behaviour, this wording MUST NOT be interpreted as evidence that every element identifiable through MAP:

- is a reusable Therapeutic Resource;
- supports Therapeutic Resource Activation;
- requires an activation script;
- becomes activated merely because it is identified or selected.

The therapist’s physical pendulum interpretation determines what MAP element is indicated.

The platform records only the therapist’s explicit selection and does not infer the indicated element from pendulum movement.

#### Direct Selection from the Client Context

1. The therapist considers what the client reported during the initial conversation or anamnesis.
2. The therapist directly accesses a MAP investigation element related to the therapeutic intention, complaint or context.
3. The therapist selects that element in the MAP workspace.

The platform must not infer or recommend an investigation element from the client’s information.

#### Intuitive Rotation

1. The therapist moves intuitively through the MAP investigation catalogue.
2. The therapist may pass through the available methodology elements or use their cataleptic hand to identify where to work.
3. When an element is identified, the therapist selects it in the MAP workspace.

#### Organized Therapeutic Route

The therapist may follow an organized route through MAP resource groups.

The methodology provides the following example:

1. spiritual causes;
2. emotional causes;
3. physical causes;
4. chakras;
5. angels;
6. archangels;
7. radiesthetic graphs;
8. other relevant MAP resources.

The terminology above preserves the current MAP source.

In particular, the source-level wording “physical causes” MUST NOT be silently normalized to “Physical Issues” until the methodology terminology has been authoritatively clarified.

This route is guidance rather than a mandatory sequence.

The therapist may change its order, omit groups, revisit groups or include additional MAP investigation elements.

#### Combined Investigation

The therapist may combine the official approaches during the same session.

For example, the therapist may:

- begin with the pendulum;
- directly access an investigation element related to the client’s report;
- continue through an intuitive rotation;
- later use an organized route to confirm whether any groups remain unexplored.

The therapist does not select a permanent investigation mode.

Each investigation-element choice may arise through a different form of guidance.

Once an investigation element is explicitly selected, the session proceeds to MAP-008, where its authoritative classification and supported therapeutic behaviour determine what actions are available.

### Workspace Behaviour

The workspace should support immediate and flexible access to the MAP therapeutic investigation catalogue.

The investigation catalogue is a navigation and discovery surface. It MUST NOT impose one universal therapeutic-resource ontology on every MAP element exposed through it.

It should:

- keep the client or group context visible;
- keep the confirmed therapeutic intention visible;
- keep the initial Hawkins level available without making it the primary focus;
- present the MAP investigation groups visually;
- prioritize images when investigation elements are visually recognized;
- allow investigation elements to be found by group, image or name;
- provide access to all official MAP investigation elements required by the methodology;
- support direct element selection with one simple action;
- allow the therapist to move freely between investigation groups;
- provide the official investigation approaches as guidance on demand;
- avoid requiring the therapist to choose a fixed investigation mode;
- avoid forcing the organized route;
- preserve the therapist’s current position when guidance is opened;
- indicate which investigation elements have already been used or consulted during the session, according to their applicable classification, without preventing permitted reuse;
- open the selected investigation element without unnecessary confirmation dialogs.

The workspace must remain suitable for desktop and tablet use.

It must not reduce the therapeutic investigation to a linear questionnaire or mandatory digital sequence.

### Voice Behaviour

Voice may support investigation-element access while the therapist remains focused on the physical MAP and client.

When available, the therapist may:

- request a MAP investigation group;
- open an investigation element by explicitly speaking its name;
- request the official investigation guidance;
- return to the investigation catalogue;
- record a brief note about why an investigation element was selected.

Voice selection must require an explicit investigation-element instruction.

The platform must not select investigation elements based on:

- ambient conversation;
- the client’s statements;
- session transcription;
- inferred intention;
- keywords detected without an explicit therapist command.

Visual navigation and one-click selection must remain available.

### AI Behaviour

AI is not required for the initial implementation of this experience.

Any future AI assistance may:

- help locate an investigation element explicitly requested by the therapist;
- organize the investigation catalogue;
- surface the official investigation approaches on request;
- return the therapist to a previously visited investigation group.

AI must never:

- choose the investigation approach;
- recommend an investigation element from client data;
- infer an investigation element from the therapeutic intention;
- interpret the pendulum;
- analyze the client’s speech to select an investigation element;
- force or optimize the therapeutic route;
- prevent the therapist from revisiting an investigation element;
- replace intuition or therapist judgment.

### MAP Investigation Catalogue and Element Classification

MAP-007 exposes the methodology elements that may be consulted, identified or selected during therapeutic investigation.

Catalogue membership is a navigation concern and MUST remain distinct from therapeutic classification.

The current MAP source includes or references investigation elements such as:

- Masters of the White Brotherhood / Rays;
- Wheel of Angels;
- Emotional Causes;
- Spiritual Causes;
- Numbers from 0 to 9;
- Radiesthesia Graphs;
- Emotional Wounds;
- Physical Issues;
- Archangels;
- Decagon;
- Hawkins Scale;
- Radiesthetic Clock;
- Chakras;
- therapist-created MAP lists;
- other elements formally included in the MAP methodology.

The exact authoritative classification and therapeutic behaviour of each family MUST be defined independently.

Depending on the element and authoritative methodology definition, an investigation entry may represent or reference:

- a Therapeutic Resource;
- a Methodology Resource Binding;
- Canonical Methodology Content or Protocol;
- a Reference or Measurement Model;
- a Physical Instrument;
- a Physical Methodology Artifact or Context;
- a Therapist-Configured List;
- another methodology-defined element whose classification remains pending authoritative clarification.

The platform MUST NOT infer therapeutic capabilities merely from catalogue membership.

In particular, catalogue presence does not mean that an element:

- has been selected;
- has been analyzed;
- has been measured;
- has been used;
- supports activation;
- has been activated;
- has been completed.

Selection is itself a therapist-confirmed Session Fact.

Where the selected element has a defined reusable Therapeutic Resource identity, the applicable MAP Methodology Resource Binding governs its MAP-specific behaviour.

Where the selected element is not a Therapeutic Resource, MAP-008 MUST expose only the actions supported by its authoritative classification and methodology definition.

Where classification or therapeutic behaviour remains ambiguous in the MAP source, the platform MUST fail closed according to the Methodology Clarification Boundary.

The experience may consume the following platform capabilities:

- PX-003 Session Header;
- PX-004 Therapeutic Workspace;
- PX-005 Session Timeline;
- PX-101 Voice Experience;
- PX-102 Live Notes;
- PX-103 Session Companion;
- PX-104 Knowledge on Demand;
- PX-105 Progressive Information;
- PX-201 Resource Browser;
- PX-202 Resource Cards;
- PX-205 Resource History;
- PX-206 Resource Groups;
- PX-301 Live Report;
- PX-304 Voice Transcript.

The existing PX resource capabilities may support catalogue entries that are confirmed Therapeutic Resources.

Their presence in this capability list MUST NOT force non-resource methodology elements into the Therapeutic Resource model.

The Session Timeline may record:

- the investigation element explicitly selected by the therapist;
- its investigation group;
- its authoritative classification, when defined;
- the therapist-declared selection approach, when the therapist chooses to record it.

Recording the investigation approach is optional.

Selection provenance MUST remain explicit.

The platform records what the therapist selected; it does not claim to have independently determined what the pendulum, client context or intuitive process indicated.

Preserved investigation evidence remains separate from Report Projection.

### Acceptance Criteria

The experience is complete when:

- the four official investigation approaches are supported;
- the therapist may combine approaches within the same session;
- no permanent investigation mode must be selected;
- the organized therapeutic route is available but not mandatory;
- all official MAP investigation groups are accessible;
- investigation elements can be found visually where visual recognition applies;
- investigation elements can be found by name;
- the therapist can move freely between investigation groups;
- previously used or consulted elements remain accessible according to their applicable classification;
- the platform does not recommend investigation elements from client data;
- the platform does not interpret the pendulum;
- ambient conversation and session transcription do not trigger investigation-element selection;
- only an explicit therapist action selects an investigation element;
- selection is preserved as a therapist-confirmed Session Fact with explicit provenance;
- catalogue membership does not automatically classify an element as a Therapeutic Resource;
- selecting an element does not automatically analyze, measure, use or activate it;
- activation capability is exposed only where supported by the authoritative methodology definition;
- ambiguous activation capability fails closed pending methodology clarification;
- the source wording “which therapeutic resource should be activated first” is preserved without being generalized into a universal platform activation rule;
- “physical causes” remains source terminology pending authoritative clarification against “Physical Issues”;
- the therapist can proceed directly to MAP-008 after explicitly selecting an investigation element.

### Future Evolution

Future versions may support:

- therapist-defined investigation-group ordering;
- favourite MAP investigation elements;
- recently used investigation elements;
- therapist-authored investigation routes;
- visual maps of the current investigation journey;
- voice-controlled investigation-element navigation;
- optional recording of how each investigation element was identified;
- comparison of investigation patterns across the therapist’s own sessions.

These evolutions must preserve free therapeutic navigation and must never turn previous usage patterns into automated therapeutic decisions.

## MAP-008 — Work with the Selected MAP Investigation Element

Status

⚪ Planned

### Purpose

Provide a focused therapeutic workspace where the therapist can work with the MAP investigation element explicitly selected during MAP-007 according to that element’s authoritative classification and MAP-specific therapeutic behaviour.

This experience translates the element-use, analysis and, where explicitly supported, activation work contained within Step 7 — “Início do atendimento e rastreio com a MAP” — from the official MAP 2.0 methodology.

MAP-008 does not assume that every selected investigation element is a Therapeutic Resource or that every supported therapeutic action is activation.

### User Value

The therapist receives the methodology information, guidance and supported actions appropriate to the selected MAP investigation element at the moment it is being worked with.

The experience removes the need to search through the MAP manual while preserving the therapist’s authority to interpret physical instruments, communicate with the client and determine how the selected element is therapeutically handled.

The workspace adapts to the selected element instead of forcing every MAP element through one universal resource-analysis or activation workflow.

### Entry Conditions

- MAP-007 has been completed for the current investigation cycle.
- A MAP investigation element has been explicitly selected by the therapist.
- The initial Hawkins level has been recorded.
- The MAP remains activated and connected to the client or group.
- The selected element has an authoritative classification sufficient to determine the actions the platform may expose.
- Any required MAP Methodology Resource Binding or other methodology-specific behaviour definition is available.
- The selected element has not yet been completed for the current work instance.

If the selected element’s classification or required therapeutic behaviour remains ambiguous, MAP-008 MUST fail closed and MUST NOT invent an analysis, activation or completion workflow.

### Investigation Element Behaviour Contract

Every MAP investigation element handled by MAP-008 MUST expose behaviour according to its authoritative classification and applicable methodology definition.

Where the selected element is a reusable Therapeutic Resource, its MAP-specific behaviour MUST be governed by the applicable Methodology Resource Binding.

Depending on the authoritative definition, an element may expose one or more of the following:

- identity;
- visual representation;
- methodology-specific meaning;
- purpose;
- situations or contexts in which it may be used;
- analysis guidance;
- questions for therapist-led or pendulum-led investigation;
- internal options or subresources;
- information that may be communicated to the client;
- balancing or therapeutic guidance;
- measurement or reference behaviour;
- physical-use instructions;
- an official activation capability;
- canonical activation wording, when explicitly defined;
- related methodology elements;
- element-specific completion conditions.

The platform MUST expose only behaviours supported by the selected element’s authoritative classification and MAP-specific definition.

The platform MUST NOT infer behaviour merely because another MAP element supports it.

In particular:

- selection does not imply use;
- identification does not imply activation;
- measurement does not imply activation;
- use does not imply activation;
- speaking canonical wording does not by itself prove completion;
- activation capability MUST NOT be inferred;
- missing activation wording MUST NOT be generated;
- activation cardinality MUST NOT be copied from another element family.

Where an element does not support Therapeutic Resource Activation, no activation control, activation script or activation outcome may be invented.

Where an element is not a Therapeutic Resource, the platform MUST NOT create a Therapeutic Resource usage or activation record merely because MAP-008 was opened.

### Therapeutic Flow

#### Open the Selected Investigation Element

1. The platform opens the selected investigation element in the active therapeutic workspace.
2. The therapist sees, according to the element’s authoritative definition:

   - its name or canonical label;
   - its visual representation, when available;
   - its MAP investigation group or context, when applicable;
   - its authoritative classification;
   - its primary MAP purpose or role.

3. Only the actions supported by that classification and applicable MAP-specific definition are exposed.

4. Additional methodology information remains available through progressive disclosure.

#### Understand the Selected Element

5. The therapist may consult the official methodology information associated with the selected element.

6. When defined by the methodology, this may include:

- what the element represents;
- what its identification, appearance or selection may indicate according to MAP;
- guidance for therapist-led therapeutic interpretation;
- information that may be communicated to the client;
- specific cautions or boundaries;
- associated balancing or therapeutic guidance;
- applicable physical-use or measurement guidance.

7. The platform presents this information as methodology reference.

It MUST NOT present methodology guidance as an automated diagnosis, measurement or established fact about the client.

#### Identify an Internal Option or Result

8. When the selected element defines internal options, subresources, values or results, the therapist identifies the applicable item using the method defined for that element.

Examples currently represented by the MAP source may include:

- a specific spiritual or emotional cause;
- an emotional wound;
- a physical system;
- a condition within a physical system;
- an angel;
- an archangel;
- a Master or Ray;
- a chakra;
- a radiesthetic graph;
- an item from the Wheel of Angels;
- an item from a therapist-created MAP list;
- a value or answer indicated through the radiesthetic clock.

This list preserves source-level possibilities and MUST NOT be interpreted as assigning the same classification or therapeutic behaviour to every example.

9. The therapist observes and interprets any applicable Physical Instrument or uses their therapeutic judgment according to the methodology.

10. The therapist explicitly confirms the identified internal option or result.

11. The confirmed item is recorded according to its authoritative semantic type.

For example, it may be:

- a selected subresource;
- an identified internal option;
- a therapist-confirmed Session Fact;
- a therapist-confirmed Measurement or Result.

12. Where multiple items are permitted and indicated, each item remains independently traceable according to the applicable methodology contract.

The platform MUST NOT infer the internal option or result from client data.

It MUST NOT automatically select all related items.

Identifying an internal option or result MUST NOT automatically activate either the parent element or the identified item.

#### Communicate with the Client

13. When the authoritative definition of the selected element includes client-communication guidance, the therapist may consult it.

14. The therapist decides:

- whether to communicate the information;
- when to communicate it;
- how to adapt it to the client and session context.

The platform MUST NOT speak to the client on the therapist’s behalf or present methodology guidance, identified options, measurements or therapeutic interpretations as independently established facts about that person.

#### Perform the Supported Therapeutic Action

15. The therapist follows only the action or actions explicitly supported by the selected element’s authoritative definition.

Depending on the element, this may involve:

- consultation or reference;
- analysis;
- identification;
- measurement;
- therapist interpretation;
- physical positioning;
- use of a Physical Instrument;
- selection of an internal option;
- balancing or another methodology-defined therapeutic action;
- Therapeutic Resource Activation, only where explicitly supported.

16. When Therapeutic Resource Activation is explicitly supported:

- the selected element MUST have a Therapeutic Resource identity;
- the applicable MAP Methodology Resource Binding MUST declare activation capability;
- canonical activation wording MUST come from authoritative methodology content;
- required placeholders must be explicitly defined;
- activation cardinality must follow the applicable binding;
- the therapist performs the activation;
- the platform does not claim to activate the resource independently.

17. When canonical activation wording exists:

- the platform presents the exact authoritative wording;
- required client or group context is inserted or clearly displayed only through approved placeholders;
- the therapist reads or performs the activation according to the methodology;
- the platform does not rewrite or therapeutically reinterpret the canonical content.

18. When activation capability or wording is not authoritatively defined, the platform MUST NOT invent, infer or request an activation.

#### Record the Therapeutic Work

19. The therapist records only the outcome or outcomes supported by the selected element’s authoritative behaviour.

Depending on the element, this may include:

- consulted;
- analyzed;
- identified;
- measured;
- used;
- activated;
- not activated;
- deferred;
- another explicitly defined methodology outcome.

20. Each confirmed outcome MUST preserve its semantic type and therapist-confirmed provenance.

21. Recording one outcome MUST NOT implicitly create another.

22. The therapist may add a note or dictate an observation.

23. The therapist explicitly confirms completion of the current work instance according to the element-specific completion conditions.

24. The completed work instance is preserved in the Session Timeline.

25. Preserved session evidence remains separate from Report Projection.

26. After the applicable work instance is complete, the session proceeds to MAP-009 to determine whether the MAP investigation cycle should continue.

### Workspace Behaviour

The workspace should keep the selected investigation element as the primary therapeutic focus while adapting its controls to the element’s authoritative classification and MAP-specific behaviour.

It should:

- preserve the client or group context;
- keep the therapeutic intention available;
- keep the initial Hawkins level available without competing with the active element;
- prioritize visual identity when visual recognition is relevant;
- display the element name, investigation context and authoritative classification clearly;
- expose only actions supported by the element;
- present essential methodology information first;
- place detailed information behind progressive disclosure;
- support internal options, values or results only where defined;
- preserve independently traceable identified items where required;
- provide client-communication guidance only where applicable;
- expose activation controls only when activation capability is explicitly defined;
- present canonical activation wording in a large, readable format when applicable;
- insert or display only approved contextual placeholders;
- allow notes without hiding the active element;
- preserve element state if supporting information is opened;
- distinguish applicable states such as selected, identified, measured, used and activated;
- require explicit therapist confirmation before recording completion;
- allow the therapist to return to the investigation catalogue without falsely completing the current work instance.

The workspace MUST NOT display irrelevant controls merely to make all investigation-element views structurally identical.

A measurement model, Physical Instrument, Physical Methodology Artifact or other non-resource element MUST NOT acquire Therapeutic Resource controls merely because it is displayed in MAP-008.

### Voice Behaviour

Voice should support the therapist while their hands and attention remain on the physical MAP, applicable Physical Instruments or client.

When available, the therapist may:

- request information about the selected investigation element;
- request client-communication guidance where available;
- explicitly select or confirm an internal option or result;
- open canonical activation content where activation is supported;
- navigate through long methodology content;
- dictate a therapeutic observation;
- record an applicable outcome;
- confirm completion of the current work instance.

Ambient conversation or session transcription MUST NOT:

- select or confirm an internal option;
- create a measurement or result;
- mark an element as used;
- mark a Therapeutic Resource as activated;
- complete the current work instance.

Any transcription of therapist speech remains governed by the platform-level Session Transcript experience and is not redefined by this methodology backlog.

### AI Behaviour

AI is not required for the initial implementation of this experience.

Any future AI assistance may:

- locate official information associated with the selected investigation element;
- organize therapist-dictated observations;
- support navigation through long methodology content;
- surface an explicitly requested internal option;
- prepare draft session notes from therapist-confirmed facts.

AI must never:

- interpret a Physical Instrument;
- diagnose the client;
- select an investigation element, internal option or result;
- determine what an element means for the client;
- create a measurement;
- infer activation capability;
- rewrite canonical activation content;
- generate missing activation wording;
- infer activation cardinality;
- claim that activation occurred;
- mark an outcome without explicit therapist confirmation;
- automatically activate related Therapeutic Resources;
- replace the therapist’s communication with the client.

### Investigation Element, Binding and Session Evidence

MAP-008 consumes the investigation element explicitly selected in MAP-007 together with the authoritative definitions required to determine its supported MAP behaviour.

For a confirmed Therapeutic Resource, this may include:

- reusable Therapeutic Resource identity;
- visual representation;
- applicable MAP Methodology Resource Binding;
- MAP-specific purpose and Knowledge;
- analysis guidance;
- internal options or subresources;
- client-communication guidance;
- activation capability;
- canonical activation content;
- activation cardinality;
- physical-use instructions;
- methodology-defined relationships;
- resource-specific completion conditions.

For an element that is not a Therapeutic Resource, MAP-008 consumes only the authoritative classification and methodology behaviour applicable to that element.

Canonical activation wording MUST remain authoritative methodology content referenced by the applicable binding. It MUST NOT be duplicated, generalized or rewritten by the experience.

The experience may consume the following platform capabilities:

- PX-003 Session Header;
- PX-004 Therapeutic Workspace;
- PX-005 Session Timeline;
- PX-101 Voice Experience;
- PX-102 Live Notes;
- PX-103 Session Companion;
- PX-104 Knowledge on Demand;
- PX-105 Progressive Information;
- PX-201 Resource Browser, when the selected element is a Therapeutic Resource;
- PX-202 Resource Cards, when applicable;
- PX-203 Resource Analysis, when analysis behaviour is supported;
- PX-204 Resource Activation, only when Therapeutic Resource Activation is explicitly supported;
- PX-205 Resource History, when the selected element has reusable Therapeutic Resource identity;
- PX-206 Resource Groups, when applicable;
- PX-301 Live Report;
- PX-304 Voice Transcript.

Capability availability MUST follow the selected element’s classification and authoritative MAP behaviour.

The presence of PX-203 or PX-204 in the platform capability catalogue MUST NOT itself grant analysis or activation capability to a MAP element.

The Session Timeline preserves each completed work instance as a distinct event.

Repeated work with the same reusable Therapeutic Resource or investigation element remains independently traceable.

Session evidence and Report Projection remain separate concerns.

### Acceptance Criteria

The experience is complete when:

- the investigation element selected in MAP-007 opens without losing session context;
- its authoritative classification is available to determine supported behaviour;
- the platform exposes only behaviours supported by that classification and applicable MAP definition;
- a reusable Therapeutic Resource uses its applicable MAP Methodology Resource Binding;
- non-resource elements are not forced into the Therapeutic Resource model;
- essential information is visible without opening the full methodology content;
- detailed methodology information remains available on demand;
- internal options, subresources, values or results are exposed only where authoritatively defined;
- identified internal items preserve their applicable semantic type;
- multiple indicated items remain independently traceable where permitted;
- client-communication guidance remains therapist-controlled;
- selection does not imply use or activation;
- identification does not imply activation;
- measurement does not imply activation;
- activation capability is never inferred;
- canonical activation wording is presented only where authoritatively defined;
- canonical wording preserves its exact authoritative content;
- only approved contextual placeholders are inserted or displayed;
- activation cardinality follows the applicable methodology definition or binding;
- elements without activation capability are not forced into an activation workflow;
- speaking canonical activation wording does not automatically prove completion;
- only the therapist can confirm applicable outcomes;
- recording one outcome does not implicitly create another;
- the therapist can add text or voice notes;
- only the therapist can confirm completion of the current work instance;
- every completed work instance is preserved in the Session Timeline;
- repeated work creates distinct traceable events;
- no related investigation element or Therapeutic Resource is selected or activated automatically;
- preserved session evidence remains separate from therapist-controlled Report Projection;
- ambiguous classification, activation capability, wording or cardinality fails closed;
- after completion, the therapist can proceed directly to MAP-009.

### Future Evolution

Future versions may support:

- richer classification-aware investigation-element interaction;
- therapist-controlled workspace layouts;
- optional timers where an authoritative element definition specifies duration;
- element-specific audio or video guidance;
- therapist-created annotations;
- reusable therapist notes;
- resource-usage or element-work history across client sessions where semantically appropriate;
- explicit links to complementary methodologies;
- invocation of a complementary methodology without closing the primary MAP session;
- therapist-reviewed draft report content generated from confirmed session evidence and notes.

These evolutions must preserve the autonomy of each methodology, the authoritative classification and behaviour of each element, the applicable Methodology Resource Binding and the therapist’s exclusive authority over therapeutic interpretation and confirmation.

## MAP-009 — Continue or Complete the MAP Investigation Cycle

Status

⚪ Planned

### Purpose

Enable the therapist to determine whether the MAP therapeutic investigation should continue with another methodology element or whether the current MAP investigation cycle is complete.

This experience translates the continuation guidance at the end of Step 7 — “Início do atendimento e rastreio com a MAP” — from the official MAP 2.0 methodology.

The authoritative continuation question refers to additional therapeutic resources.

That source wording is preserved, but the platform MUST NOT interpret it as proof that every element subsequently identified through MAP-007 is necessarily a reusable Therapeutic Resource.

### User Value

The therapist can close the current MAP-008 work instance and determine whether therapeutic investigation should continue without losing the session journey or being pushed toward a software-defined conclusion.

The experience preserves the pendulum-led continuation decision while keeping the full investigation history available and independently traceable.

### Entry Conditions

- MAP-008 has been completed for the current work instance.
- The applicable outcome or outcomes have been explicitly confirmed by the therapist.
- The completed work instance has been preserved in the Session Timeline.
- The MAP remains activated and connected to the client or group.
- The current MAP investigation cycle has not yet been confirmed as complete.

### Therapeutic Flow

#### Observe the Decagon

1. After completing the current MAP-008 work instance, the therapist returns their attention to the physical decagon.
2. If the pendulum begins rotating counter-clockwise over the decagon, the therapist does not treat that movement alone as final confirmation.
3. The therapist uses the physical radiesthetic clock to confirm whether additional therapeutic work remains within the current MAP investigation cycle.

The pendulum and radiesthetic clock remain therapist-operated Physical Instruments.

The platform MUST NOT observe or interpret their physical indication.

#### Confirm Whether More Resources Remain

4. The platform presents the official MAP continuation question for the client or group.
5. The therapist asks whether there are more therapeutic resources to work with.
6. The therapist observes and interprets the applicable Physical Instrument response.
7. The therapist explicitly records one of the following responses:

   - Yes;
   - No.

The wording “whether there are more therapeutic resources to work with” reflects the current authoritative MAP source and MUST be preserved pending any authoritative methodology clarification.

For platform behaviour, the Yes or No response determines whether the MAP investigation cycle continues.

It MUST NOT itself:

- select the next investigation element;
- classify the next element as a Therapeutic Resource;
- identify what the next element is;
- activate any Therapeutic Resource.

#### Continue the MAP Investigation Cycle

8. If the response is Yes:

   - the MAP investigation cycle remains active;
   - the therapist returns to MAP-007;
   - the therapist chooses how to identify the next MAP investigation element;
   - the next investigation element must be selected explicitly;
   - MAP-008 then handles that selected element according to its authoritative classification and supported behaviour.

9. The therapist may use a different official investigation approach for the next selection.

10. Previously used or consulted investigation elements remain accessible according to their applicable classification and reuse rules.

11. Repeated work with the same investigation element or Therapeutic Resource creates a distinct, independently traceable Session Timeline event.

A Yes response confirms only that the therapist has determined that the investigation should continue.

It MUST NOT automatically identify, recommend, select, use or activate the next element.

#### Complete the MAP Investigation Cycle

12. If the response is No:

   - the current MAP investigation cycle is considered complete;
   - no additional MAP investigation element is selected automatically;
   - the complete investigation journey remains preserved;
   - the therapist may review the session journey;
   - the session may proceed to the request for continued treatment during sleep.

Only the therapist can record the Yes or No response.

The recorded response is preserved as a therapist-confirmed Session Fact.

A No response completes only the current MAP investigation cycle.

It does not:

- close the therapeutic session;
- deactivate the MAP;
- remove or rewrite previous investigation evidence;
- determine the final Hawkins level;
- imply any therapeutic effectiveness or outcome.

### Workspace Behaviour

The workspace should present a calm transition after each completed MAP-008 work instance.

It should:

- keep the client or group context visible;
- keep the confirmed therapeutic intention available;
- show the investigation element or work instance that was just completed;
- preserve access to the full investigation journey;
- present the official continuation question;
- provide simple Yes and No response actions;
- clearly explain the navigation consequence of each response;
- return the therapist to MAP-007 when Yes is recorded;
- proceed to MAP-010 when No is recorded;
- preserve all previous investigation events;
- allow previously used or consulted elements to remain accessible according to their applicable rules;
- distinguish repeated work instances as separate events;
- avoid presenting a recommended next investigation element;
- avoid treating cycle completion as the technical end of the session;
- allow the therapist to review session evidence without changing the recorded continuation response.

The continuation response MUST remain distinct from investigation-element selection.

A No response completes only the MAP investigation cycle.

It does not close the therapeutic session or deactivate the MAP.

### Voice Behaviour

Voice may support the continuation decision.

When available, the therapist may:

- request the official continuation question;
- explicitly record Yes or No;
- return to the MAP investigation catalogue after a Yes response;
- request review of investigation elements or work instances already recorded;
- continue to the next methodology experience after a No response.

Ambient speech and session transcription MUST NOT:

- create a continuation response;
- infer whether the cycle should continue;
- select the next investigation element.

An explicit therapist instruction is always required.

Visual and one-click controls must remain available.

### AI Behaviour

AI is not required for the initial implementation of this experience.

Any future AI assistance may:

- summarize the preserved investigation journey for therapist review;
- locate a previously used or consulted investigation element;
- support hands-free navigation;
- explain the documented navigation consequence of a Yes or No response.

AI must never:

- interpret counter-clockwise pendulum movement;
- interpret the radiesthetic clock;
- determine whether more therapeutic work remains;
- predict the continuation response;
- recommend the next investigation element;
- select an investigation element based on prior usage;
- convert silence or ambient speech into a response;
- complete the MAP investigation cycle;
- override the therapist’s recorded response.

### Methodology Context, Physical Instruments and Continuation Evidence

This experience uses:

- the physical decagon as Physical Methodology Artifact or Context;
- the pendulum as a therapist-operated Physical Instrument;
- the radiesthetic clock as a therapist-operated Physical Instrument;
- the official MAP continuation question as Canonical Methodology Content;
- the preserved MAP investigation history as session evidence.

These elements MUST remain conceptually distinct.

The official continuation question MUST preserve its authoritative wording.

The pendulum and radiesthetic clock remain exclusively therapist-operated and therapist-interpreted.

The Yes or No continuation response is preserved as a therapist-confirmed Session Fact with explicit provenance.

The experience may consume the following platform capabilities:

- PX-003 Session Header;
- PX-004 Therapeutic Workspace;
- PX-005 Session Timeline;
- PX-101 Voice Experience;
- PX-102 Live Notes;
- PX-103 Session Companion;
- PX-104 Knowledge on Demand;
- PX-105 Progressive Information;
- PX-301 Live Report;
- PX-304 Voice Transcript.

Platform resource capabilities MUST NOT cause non-resource investigation elements to be represented as Therapeutic Resources.

All completed MAP investigation work instances and continuation decisions remain preserved as session evidence.

Session evidence remains separate from Report Projection.

Preservation does not automatically include any investigation event or continuation decision in the client-facing report.

### Acceptance Criteria

The experience is complete when:

- the official MAP continuation question is available;
- its authoritative wording is preserved;
- the therapist can explicitly record Yes or No;
- the continuation response is preserved as a therapist-confirmed Session Fact;
- response provenance remains explicit;
- counter-clockwise pendulum movement does not complete the cycle automatically;
- the platform does not interpret the pendulum or radiesthetic clock;
- a Yes response returns the therapist to MAP-007;
- the therapist may choose any official investigation approach for the next element;
- a Yes response does not identify, recommend, select, use or activate the next element;
- the next investigation element requires explicit therapist selection;
- MAP-008 determines subsequent behaviour from the selected element’s authoritative classification;
- previously used or consulted elements remain accessible according to their applicable classification;
- repeated work creates a distinct Session Timeline event;
- a No response completes only the MAP investigation cycle;
- a No response does not close the therapeutic session;
- a No response does not deactivate the MAP;
- all previous investigation evidence remains preserved;
- preservation remains separate from therapist-controlled Report Projection;
- ambient conversation does not create a continuation response;
- only the therapist can determine whether the MAP investigation cycle continues;
- the therapist can proceed directly to MAP-010 after explicitly recording No.

### Future Evolution

Future versions may support:

- visual MAP investigation-journey review;
- filtering the journey by investigation group or authoritative classification;
- therapist-authored annotations between work instances;
- hands-free cycle navigation;
- optional display of unexplored investigation groups;
- comparison of investigation journeys across the therapist’s own sessions;
- therapist-controlled inclusion of individual confirmed investigation events in report templates.

These evolutions must preserve the pendulum-led continuation decision and must never transform session history into an automated therapeutic recommendation system.

## MAP-010 — Request Continued Treatment During Sleep

Status

⚪ Planned

### Purpose

Guide the therapist in making the official MAP request for the therapeutic work to continue during the client’s sleep after the current MAP investigation cycle has been completed.

This experience translates Step 8 — “Pedir aos Anjos para continuar no estado de sono no final” — from the official MAP 2.0 methodology.

### User Value

The therapist can perform the continuation request at the correct moment without having to remember or search for its canonical wording.

The experience preserves the ritual sequence while keeping the software quiet and secondary to the therapist’s spoken request.

### Entry Conditions

- MAP-009 has been completed.
- The therapist has explicitly recorded No to the official MAP continuation question.
- The current MAP investigation cycle is complete.
- All completed investigation work instances and continuation evidence are preserved as session data.
- The MAP remains activated.
- The physical testimony remains positioned on the decagon.
- The final Hawkins level has not yet been measured.
- The closing and energetic disconnection have not started.

### Therapeutic Flow

1. The therapist keeps the pendulum rotating over the physical decagon.
2. The platform presents the official Continued Treatment During Sleep request exactly as defined by the MAP methodology.
3. The therapist says the request aloud.
4. The therapist explicitly confirms that the request has been performed.
5. The request is preserved as a session event.
6. The session may then proceed to measurement of the final Hawkins level.

The request must occur after completion of the current MAP investigation cycle and before the final Hawkins measurement.

The platform must not claim that continued treatment has started, is occurring or has been completed.

It records only that the therapist performed the official request.

The therapist’s explicit confirmation is preserved as a therapist-confirmed Session Fact.

That fact records performance of the methodology request.

It does not constitute evidence that continued therapeutic treatment during sleep started, occurred or completed.

### Workspace Behaviour

The workspace should present a quiet and focused transition between completion of the MAP investigation cycle and final measurement.

It should:

- keep the client or group context visible;
- keep the therapeutic intention available;
- indicate that the current MAP investigation cycle is complete;
- present the official request in a large, readable format;
- remind the therapist to keep the pendulum rotating over the decagon;
- avoid unrelated investigation or therapeutic-resource controls;
- require explicit therapist confirmation;
- preserve the request as part of the Session Timeline;
- proceed directly to the final Hawkins measurement after confirmation.

The workspace must not:

- start a timer for the continued treatment;
- estimate its duration;
- create a future task or scheduled process;
- monitor the client’s sleep;
- require a later completion confirmation;
- imply that the platform performs the therapeutic continuation.

### Voice Behaviour

Speaking aloud is part of the official therapeutic flow.

The platform should support the therapist in reading the canonical request without requiring recording or transcription.

When available, voice may allow the therapist to:

- request the official wording;
- repeat the request on screen;
- confirm that the request has been performed;
- proceed to the final Hawkins measurement.

The platform must not interpret ambient speech as confirmation.

Any transcription remains governed by the platform-level Session Transcript experience and is not redefined here.

Text and one-click confirmation must remain available.

### AI Behaviour

AI is not required for this experience.

Any future AI assistance may:

- surface the canonical request;
- support hands-free navigation;
- provide accessibility assistance without changing the official wording.

AI must never:

- rewrite or summarize the request;
- determine whether continued treatment is necessary;
- claim that continued treatment is occurring;
- calculate its duration;
- monitor the client;
- generate therapeutic progress;
- mark the request as performed without explicit therapist confirmation.

### Canonical Methodology Content, Physical Context and Session Evidence

This experience consumes one canonical MAP methodology request:

- MAP Continued Treatment During Sleep Request.

The request is Canonical Methodology Content or Protocol.

It MUST NOT be classified automatically as a reusable Therapeutic Resource merely because it is spoken during the therapeutic flow.

Its exact authoritative wording MUST be preserved.

The platform MUST NOT:

- rewrite or paraphrase the request;
- generate alternative therapeutic wording;
- treat the request as a Therapeutic Resource selection or activation;
- claim that speaking the request starts a platform-managed therapeutic process;
- create a timer, scheduled task or monitoring process from the request.

The physical methodology context includes:

- the physical MAP;
- the prepared testimony;
- the decagon.

The therapist also uses the pendulum as a Physical Instrument.

These elements remain conceptually distinct from the canonical request.

The platform does not independently observe or verify the therapist’s physical use of the MAP, testimony, decagon or pendulum.

The experience may consume the following platform capabilities:

- PX-003 Session Header;
- PX-004 Therapeutic Workspace;
- PX-005 Session Timeline;
- PX-101 Voice Experience;
- PX-104 Knowledge on Demand;
- PX-105 Progressive Information;
- PX-301 Live Report;
- PX-304 Voice Transcript.

The therapist’s explicit confirmation that the canonical request was performed is preserved as a therapist-confirmed Session Fact.

That confirmation records completion of MAP-010.

It does not confirm that continued treatment during sleep started, occurred or completed.

Preserved request-performance evidence remains separate from Report Projection.

Its inclusion, wording and presentation in the client-facing report remain controlled separately by the therapist.

### Acceptance Criteria

The experience is complete when:

- the official request is available;
- its canonical wording is preserved exactly;
- the therapist is reminded to keep the pendulum rotating over the decagon;
- the request is presented in a readable format;
- the therapist is guided to say it aloud;
- no recording or transcription is required;
- the platform does not claim that continued treatment has started;
- no duration is calculated;
- no timer, scheduled task or monitoring process is created;
- only the therapist can confirm that the request was performed;
- the confirmation is preserved as a Session Timeline event;
- the request is treated as Canonical Methodology Content or Protocol rather than as a reusable Therapeutic Resource;
- performing the request does not create a Therapeutic Resource selection, usage or activation record;
- the therapist’s explicit confirmation is preserved as a therapist-confirmed Session Fact;
- the confirmation records only that the canonical request was performed;
- the confirmation does not establish that continued treatment during sleep started, occurred or completed;
- preserved request-performance evidence remains separate from therapist-controlled Report Projection;
- the MAP remains activated after this experience;
- the therapist can proceed directly to MAP-011 after confirmation.

### Future Evolution

Future versions may support:

- hands-free request navigation;
- therapist-controlled text-size preferences;
- optional therapist-recorded audio;
- accessibility modes for canonical spoken methodology content;
- therapist-authored notes about the request.

These evolutions must preserve the canonical wording and must never represent the platform as performing, monitoring or validating continued therapeutic treatment.

## MAP-011 — Record the Final Hawkins Level

Status

⚪ Planned

### Purpose

Enable the therapist to record the client’s final Hawkins level after completion of the current MAP investigation cycle and compare it objectively with the therapist-confirmed initial Hawkins level recorded in MAP-006.

This experience translates Step 9 — “Verificar frequência final da Escala de Hawkins” — from the official MAP 2.0 methodology.

The final Hawkins level is a therapist-confirmed Session Measurement.

The objective relationship between the confirmed initial and final Hawkins measurements is a separate Derived Deterministic Fact.

That comparison MUST NOT be interpreted by the platform as therapeutic success, failure or effectiveness.

### User Value

The therapist can record the final energetic reference with one visual selection and immediately review the objective relationship between the initial and final Hawkins measurements.

The experience preserves both therapist-confirmed measurements independently while providing a deterministic Higher, Unchanged or Lower comparison that remains traceable to those source measurements.

The therapist may later decide whether and how those confirmed facts are communicated to the client through Report Projection.

### Entry Conditions

- MAP-010 has been completed.
- The current MAP investigation cycle has been completed.
- The therapist has explicitly confirmed performance of the Continued Treatment During Sleep request.
- A therapist-confirmed initial Hawkins measurement from MAP-006 is preserved for the current MAP activation journey.
- The MAP remains activated and connected.
- No final Hawkins measurement has yet been confirmed for the current MAP activation journey.
- The closing and energetic disconnection have not started.

### Therapeutic Flow

#### Measure the Final Level

1. The therapist uses the physical pendulum with:

   - the Hawkins Scale represented on the MAP; or
   - the physical radiesthetic clock.

2. The therapist asks the official final Hawkins question for the client or group.
3. The therapist observes and interprets the pendulum indication.
4. The platform presents the same official Hawkins levels used in MAP-006:

   - 20 — Shame;
   - 30 — Guilt;
   - 50 — Apathy;
   - 75 — Grief;
   - 100 — Fear;
   - 125 — Desire;
   - 150 — Anger;
   - 175 — Pride;
   - 200 — Courage;
   - 250 — Neutrality;
   - 310 — Willingness;
   - 350 — Acceptance;
   - 400 — Reason;
   - 500 — Love;
   - 540 — Joy;
   - 600 — Peace;
   - 700 — Enlightenment.

5. The therapist selects the level indicated by the pendulum.
6. The platform shows the selected value and level name for review.
7. The therapist confirms the final Hawkins level.

The selected final Hawkins level becomes authoritative only after explicit therapist confirmation.

Before confirmation, the selection remains editable and MUST NOT be treated as the authoritative final measurement.

The platform records the therapist-confirmed measurement.

It does not claim to have independently measured the client.

#### Compare Initial and Final Levels

8. After confirmation, the platform presents:

   - initial Hawkins value and level;
   - final Hawkins value and level;
   - the direction of movement.

9. The direction is represented as:

   - Higher;
   - Unchanged;
   - Lower.

10. The comparison may visually show the transition, for example:

   `100 — Fear → 250 — Neutrality`

11. The platform calculates only the objective relationship between the two therapist-confirmed values.
12. It does not determine the therapeutic meaning, effectiveness or success of the session.
13. The therapist reviews the comparison.
14. The therapist may add an observation.
15. The comparison is preserved as session data.
16. The therapist may communicate the final level and comparison to the client, as described by the methodology.
17. The session may then proceed to closing and energetic disconnection.

The Higher, Unchanged or Lower relationship is a Derived Deterministic Fact.

It is calculated exclusively from the two therapist-confirmed Hawkins measurements.

The comparison MUST preserve traceability to:

- the confirmed initial Hawkins measurement;
- the confirmed final Hawkins measurement.

The comparison is not:

- a new measurement;
- a therapist-observed pendulum result;
- a Therapeutic Resource result;
- evidence of therapeutic success;
- evidence of therapeutic failure;
- evidence of therapeutic effectiveness.

A Lower or Unchanged result must not block session closing.

The platform must not automatically restart the MAP investigation cycle, recommend an investigation element or initiate any additional Therapeutic Resource Activation.

### Workspace Behaviour

The workspace should reuse the visual Hawkins selection experience established in MAP-006.

It should:

- keep the client or group context visible;
- keep the therapeutic intention available;
- show the initial Hawkins level as a fixed reference;
- present all official final-level options visually;
- show each numeric value and level name;
- preserve the official ascending order;
- allow selection with one action;
- clearly distinguish the selected final level;
- allow correction before confirmation;
- require explicit therapist confirmation;
- display the initial-to-final transition after confirmation;
- represent Higher, Unchanged or Lower without success or failure language;
- allow the therapist to add an optional interpretation or observation;
- preserve both values independently;
- keep the deterministic comparison visibly distinguishable from the two source measurements;
- preserve traceability from the comparison to both confirmed measurements;
- provide a therapist-reviewable comparison view that may later support client-facing Report Projection;
- avoid requiring numeric typing.

The comparison must remain understandable without relying only on colour.

### Voice Behaviour

When available, voice may allow the therapist to:

- request the final Hawkins guidance;
- select a level explicitly by value or name;
- review the selected final level;
- correct the selection;
- confirm the final level;
- request the initial-to-final comparison;
- dictate an observation.

Voice capture must not infer a level from the therapist’s pendulum question or surrounding conversation.

Visual and one-click interaction must remain available.

### AI Behaviour

AI is not required for the initial implementation of this experience.

Any future AI assistance may:

- recognize an explicitly dictated level;
- surface the corresponding official level card;
- format therapist-dictated observations;
- prepare a factual comparison statement for therapist review.

AI must never:

- interpret the pendulum;
- calculate or infer the final level;
- describe a Higher result as therapeutic success;
- describe a Lower or Unchanged result as failure;
- generate a clinical or energetic conclusion;
- recommend additional resources from the comparison;
- alter either confirmed value;
- communicate a conclusion to the client without therapist approval.

### Measurement Model, Physical Context, Instruments and Derived Comparison

This experience combines a MAP Reference or Measurement Model, physical methodology context, therapist-operated Physical Instruments, therapist-confirmed Session Measurements and one Derived Deterministic Fact.

These concepts MUST remain distinct.

#### Reference or Measurement Model

The Hawkins Scale is a Reference or Measurement Model used by MAP to represent the therapist-observed energetic level.

The official Hawkins levels and names exposed in MAP-011 MUST remain identical to those used in MAP-006.

The Hawkins Scale itself is distinct from:

- the physical instrument used by the therapist;
- the therapist-confirmed initial Hawkins measurement;
- the therapist-confirmed final Hawkins measurement;
- the deterministic comparison between those measurements.

Displaying or consulting the Hawkins Scale MUST NOT itself create a measurement.

#### Physical Methodology Context

The physical MAP may provide the Hawkins Scale used during final measurement.

Within MAP-011, the physical MAP is Physical Methodology Artifact or Context.

Its use during measurement MUST NOT create a Therapeutic Resource selection, usage or activation record.

#### Physical Instruments

The therapist may use:

- the pendulum;
- the physical radiesthetic clock, when applicable according to the methodology.

These are therapist-operated Physical Instruments.

Only the therapist may observe and interpret their physical indication.

The platform MUST NOT:

- observe pendulum movement;
- infer the final Hawkins level;
- calculate the final Hawkins measurement from client or session information;
- determine whether the therapist’s selected level is therapeutically correct;
- convert the measurement into a Therapeutic Resource result or activation.

#### Therapist-Confirmed Final Measurement

The selected final Hawkins level becomes a therapist-confirmed Session Measurement only after explicit therapist confirmation.

The confirmed final measurement preserves:

- the official numeric value;
- the official level name;
- its role as the final Hawkins measurement;
- its association with the current session and applicable MAP activation journey;
- therapist-confirmed provenance.

The initial and final Hawkins measurements remain independently traceable.

The final measurement MUST NOT overwrite, mutate or reinterpret the initial measurement.

#### Derived Deterministic Comparison

Once both required therapist-confirmed measurements exist, the platform may derive exactly one objective relationship:

- Higher;
- Unchanged;
- Lower.

This relationship is a Derived Deterministic Fact.

It MUST be calculated exclusively from the confirmed numeric source values.

It MUST remain traceable to both source measurements.

The derived comparison MUST NOT:

- create or alter either Hawkins measurement;
- be represented as a therapist-observed pendulum result;
- infer therapeutic meaning;
- classify the session as successful or unsuccessful;
- claim therapeutic effectiveness;
- recommend further investigation or Therapeutic Resource Activation.

The therapist may record a separate observation about the comparison.

Any therapist-authored observation remains distinct from the deterministic comparison itself.

The experience may consume the following platform capabilities:

- PX-003 Session Header;
- PX-004 Therapeutic Workspace;
- PX-005 Session Timeline;
- PX-101 Voice Experience;
- PX-102 Live Notes;
- PX-103 Session Companion;
- PX-104 Knowledge on Demand;
- PX-105 Progressive Information;
- PX-301 Live Report;
- PX-304 Voice Transcript.

The confirmed final Hawkins measurement and the Derived Deterministic Fact are preserved as session evidence.

They remain independently traceable to the confirmed initial Hawkins measurement.

Preserved session evidence remains separate from Report Projection.

Its inclusion, wording and presentation in the client-facing report remain controlled separately by the therapist.

### Acceptance Criteria

The experience is complete when:

- the therapist-confirmed initial Hawkins measurement is available as a fixed reference;
- all official final-level options are available;
- each option shows its numeric value and level name;
- the final-level catalogue remains identical to the Hawkins model used in MAP-006;
- the levels appear in official ascending order;
- the therapist can select the final level with one action;
- numeric typing is not required;
- only one final level can be selected at a time;
- the selection can be changed before confirmation;
- only the therapist can confirm the final level;
- the selected level becomes authoritative only after explicit therapist confirmation;
- the final level is preserved as a therapist-confirmed Session Measurement;
- measurement provenance remains explicit;
- the platform does not interpret the pendulum or radiesthetic clock;
- the platform does not calculate or infer the final Hawkins measurement;
- the Hawkins Scale remains a Reference or Measurement Model rather than a Therapeutic Resource;
- the physical MAP remains Physical Methodology Artifact or Context;
- recording the final measurement does not create a Therapeutic Resource selection, usage or activation record;
- the initial and final measurements remain independently preserved and traceable;
- the final measurement does not overwrite or reinterpret the initial measurement;
- the initial-to-final relationship is created only after both required therapist-confirmed measurements exist;
- the comparison identifies only Higher, Unchanged or Lower;
- the comparison is preserved as a Derived Deterministic Fact;
- the Derived Deterministic Fact remains traceable to both source measurements;
- the comparison does not create or modify either source measurement;
- the comparison does not use success or failure language;
- the comparison does not claim therapeutic effectiveness;
- Lower or Unchanged does not block closing;
- the comparison does not automatically restart MAP investigation;
- no investigation element or Therapeutic Resource is recommended or activated automatically;
- therapist-authored observations remain distinct from the deterministic comparison;
- the final measurement and comparison are preserved in the Session Timeline;
- preserved session evidence remains separate from therapist-controlled Report Projection;
- the therapist can proceed directly to MAP-012 after confirmation.

### Future Evolution

Future versions may support:

- richer initial-to-final visual comparisons;
- therapist-controlled comparison wording;
- historical Hawkins comparisons across client sessions;
- accessible non-colour comparison views;
- client-facing comparison summaries reviewed by the therapist;
- therapist-configured report blocks for Hawkins results.

These evolutions must preserve the therapist-confirmed source measurements, the deterministic and traceable nature of the Higher / Unchanged / Lower comparison, and the separation between session evidence and Report Projection.

They must never transform the comparison into an automated therapeutic conclusion or effectiveness claim.

## MAP-012 — Close and Energetically Disconnect the MAP

Status

⚪ Planned

### Purpose

Guide the therapist through the official MAP closing and energetic disconnection after the final Hawkins measurement and its deterministic comparison have been completed.

This experience translates Step 10 — “Encerramento e quebra energética” — from the official MAP 2.0 methodology.

MAP-012 completes the active MAP methodology journey.

Completion of the MAP methodology journey remains distinct from completion of the broader platform session.

### User Value

The therapist can complete the MAP therapeutic journey using the full canonical closing protocol without having to remember or search for its wording.

The experience preserves explicit therapist authority over closing, energetic disconnection and MAP deactivation while allowing the completed methodology journey to return cleanly to the broader platform session.

Completing MAP does not force the therapist to end the therapeutic session.

### Entry Conditions

- MAP-011 has been completed.
- The current MAP investigation cycle is complete.
- The Continued Treatment During Sleep request has been explicitly confirmed as performed by the therapist.
- The therapist-confirmed final Hawkins measurement is preserved.
- The initial-to-final Hawkins comparison is preserved as a Derived Deterministic Fact.
- The MAP remains activated.
- The MAP closing protocol has not yet been confirmed as performed for the current MAP activation journey.
- The energetic connection with the client or group has not yet been confirmed as closed.
- MAP deactivation has not yet been confirmed by the therapist.

### Therapeutic Flow

1. The platform presents the official MAP Closing and Energetic Disconnection prayer exactly as defined by the methodology.
2. The platform displays the client’s or group’s name where required.
3. The therapist reads the complete prayer aloud.

The canonical closing sequence includes:

- gratitude to the energies, guides, mentors, angels, archangels and Masters that supported the MAP work;
- closure of the energetic connection with the client or group;
- respect for free will and spiritual integrity;
- separation and return of the therapist’s and client’s respective energies;
- complete deactivation of the MAP;
- release of frequencies and codes activated during the session;
- sealing of the therapeutic work;
- gratitude to the Hierarchy of Light;
- declaration that the MAP treatment is closed.

4. The closing sequence must be performed as one complete canonical methodology protocol.
5. After speaking the complete prayer, the therapist explicitly confirms that the MAP Closing and Energetic Disconnection protocol has been performed.

6. From that explicit confirmation, the platform preserves the following therapist-confirmed Session Facts:

   - MAP closing protocol performed;
   - energetic disconnection confirmed by the therapist;
   - MAP deactivation confirmed by the therapist.

7. Once the required closing facts are confirmed, the active MAP methodology journey is marked completed.

8. The completed MAP journey is handed back to the platform as completed methodology data.

9. All MAP session evidence remains preserved.

10. The platform then determines the available next actions according to the broader therapeutic session experience.

The platform records the therapist’s explicit confirmation.

It MUST NOT claim that it independently:

- performed the closing protocol;
- observed or verified energetic disconnection;
- observed or verified MAP deactivation;
- determined that any energetic or spiritual effect occurred.

The MAP methodology journey completion state is a platform lifecycle consequence of the required therapist-confirmed methodology facts.

It is not independent evidence that energetic disconnection or MAP deactivation physically or energetically occurred.

### Methodology Completion Boundary

Completing MAP-012 closes the active MAP methodology journey.

MAP methodology completion and platform-session completion are separate lifecycle events.

MAP-012 MUST NOT automatically:

- close or complete the broader platform session;
- invoke Platform Session Closing on behalf of the therapist;
- generate, finalize or publish a client-facing report;
- discard session notes or transcription;
- remove preserved MAP session evidence;
- remove the completed MAP journey from the Session Timeline;
- prevent review of the completed MAP journey;
- prevent an authorized complementary methodology from being invoked;
- select or invoke another methodology automatically.

After MAP completion, control returns to the platform session.

The platform may expose only the next actions authorized by the Platform Session experience, which may include:

- review the completed MAP journey;
- continue working within the current session;
- invoke an authorized complementary methodology;
- proceed to Platform Session Closing.

The therapist remains authoritative over the next action.

Completion of MAP MUST NOT itself transition the broader PlatformSession to `completed`.

### Workspace Behaviour

The workspace should provide a calm and focused closing experience.

It should:

- keep the client or group context visible;
- show the final Hawkins level and comparison as completed context;
- present the official closing prayer in a large, readable format;
- insert or clearly display the client or group reference where required;
- avoid unrelated investigation or Therapeutic Resource controls;
- preserve the complete canonical wording;
- require explicit therapist confirmation after the prayer;
- mark the MAP journey as completed only after confirmation;
- distinguish MAP methodology completion visibly from broader platform-session completion;
- return control to the platform without automatically triggering Platform Session Closing;
- preserve all methodology events, notes and confirmed outcomes;
- present the MAP journey as completed and preserve it according to platform session rules;
- allow the completed MAP journey to be reviewed;
- return control to the platform session after completion.

The transition out of MAP must feel like the natural conclusion of the methodology rather than an application exit.

### Voice Behaviour

Speaking aloud is part of the official closing flow.

When available, voice may allow the therapist to:

- request the canonical closing prayer;
- navigate through the prayer when accessibility support is needed;
- repeat the current section;
- confirm that the closing was performed;
- request the next platform-level action after MAP completion.

The platform must not:

- automatically advance while the therapist is speaking;
- evaluate pronunciation;
- determine whether energetic disconnection occurred;
- mark the MAP as closed from ambient speech;
- require recording or transcription;
- complete the broader platform session from a MAP closing command;
- infer energetic disconnection or MAP deactivation from spoken prayer content.

Any transcription remains governed by the platform-level Session Transcript experience.

Text and one-click confirmation must remain available.

### AI Behaviour

AI is not required for this experience.

Any future AI assistance may:

- surface the canonical closing protocol;
- support accessible navigation;
- summarize the preserved MAP journey for therapist review;
- prepare therapist-reviewable report material from confirmed session data.

AI must never:

- rewrite or shorten the canonical prayer;
- perform the closing on behalf of the therapist;
- determine whether the energetic connection was broken;
- claim that the MAP was deactivated;
- close the methodology without explicit therapist confirmation;
- finalize the broader platform session;
- generate a final report without therapist review and configuration;
- infer methodology completion merely because the canonical prayer appears in a transcript;
- decide whether another methodology should be invoked.

### Canonical Closing Protocol, Physical Context and Completion Evidence

This experience consumes one canonical MAP methodology protocol:

- MAP Closing and Energetic Disconnection Prayer.

The prayer is Canonical Methodology Content or Protocol.

It MUST NOT be classified automatically as a reusable Therapeutic Resource.

Its exact authoritative wording and required sequence MUST be preserved.

The platform MUST NOT:

- rewrite, summarize or paraphrase the canonical closing prayer;
- generate alternative closing wording;
- classify the prayer as a Therapeutic Resource;
- create a Therapeutic Resource selection, usage or activation record from performance of the prayer;
- infer completion from the prayer merely appearing in voice transcription or session notes.

#### Physical Methodology Context

The closing protocol applies to the active MAP methodology journey and its existing physical methodology context.

The platform does not independently observe or verify the physical MAP, testimony, decagon or any energetic state during closing.

#### Therapist-Confirmed Closing Evidence

The therapist’s explicit confirmation that the complete closing protocol was performed is preserved as a therapist-confirmed Session Fact.

The associated closing evidence may preserve:

- MAP closing protocol performed;
- energetic disconnection confirmed by the therapist;
- MAP deactivation confirmed by the therapist.

These facts preserve therapist-confirmed provenance.

They MUST NOT be represented as platform-observed physical or energetic events.

Recording one of these facts MUST NOT independently invent another unless the canonical methodology contract explicitly establishes them as consequences of the same required therapist confirmation.

#### Methodology Completion

Once the required closing evidence exists, the MAP methodology journey may transition to completed according to its methodology lifecycle contract.

MAP methodology completion is distinct from:

- energetic or spiritual proof;
- Therapeutic Resource completion;
- Report Projection;
- report finalization;
- Platform Session Closing;
- `PlatformSession = completed`.

The experience may consume the following platform capabilities:

- PX-003 Session Header;
- PX-004 Therapeutic Workspace;
- PX-005 Session Timeline;
- PX-101 Voice Experience;
- PX-102 Live Notes;
- PX-103 Session Companion;
- PX-104 Knowledge on Demand;
- PX-105 Progressive Information;
- PX-301 Live Report;
- PX-304 Voice Transcript;
- PX-402 Complementary Methodologies;
- PX-403 Methodology Transition;
- PX-405 Methodology History.

All MAP session evidence remains preserved after methodology completion.

Preserved session evidence remains separate from Report Projection.

The therapist’s later report configuration determines which confirmed MAP information is included, how it is worded and how it is presented in the client-facing report.

### Acceptance Criteria

The experience is complete when:

- the complete official MAP closing prayer is available;
- the closing prayer is treated as Canonical Methodology Content or Protocol rather than as a reusable Therapeutic Resource;
- the canonical wording and sequence are preserved;
- the client or group context is available where required;
- the therapist is guided to read the prayer aloud;
- no recording or transcription is required;
- only the therapist can confirm that the closing protocol was performed;
- spoken prayer content or transcription does not itself confirm completion;
- the therapist’s explicit confirmation is preserved with explicit provenance;
- energetic disconnection is represented only as therapist-confirmed evidence;
- MAP deactivation is represented only as therapist-confirmed evidence;
- the platform does not claim to independently verify energetic disconnection;
- the platform does not claim to independently perform or verify MAP deactivation;
- performance of the closing protocol does not create a Therapeutic Resource selection, usage or activation record;
- the MAP methodology journey is marked completed only when its required closing evidence exists;
- methodology completion remains distinct from proof of energetic or spiritual effects;
- MAP completion is preserved in the Session Timeline;
- all MAP events, measurements, investigation work instances, applicable Therapeutic Resource usages or activations, notes and confirmed outcomes remain preserved;
- the completed MAP journey remains available for review;
- preserved MAP session evidence remains separate from therapist-controlled Report Projection;
- report content is not generated, finalized or published automatically;
- the broader platform session remains open after MAP methodology completion;
- completing MAP does not automatically transition the PlatformSession to `completed`;
- the platform may expose authorized next actions without selecting one automatically;
- another methodology is not invoked automatically;
- the therapist retains control over whether to review, transition, continue or close the broader session.

### Future Evolution

Future versions may support:

- hands-free closing navigation;
- therapist-controlled prayer display preferences;
- accessible canonical-protocol presentation modes;
- optional therapist-recorded closing audio;
- completed-methodology journey summaries;
- invocation of complementary methodologies within the same platform session;
- post-MAP report-template selection;
- therapist-controlled selection of MAP data for report inclusion;
- comparison of completed MAP journeys across client history.

These evolutions must preserve the authoritative MAP closing protocol, therapist-confirmed provenance, complete methodology history and the strict separation between MAP methodology completion, Report Projection and platform-session completion.
