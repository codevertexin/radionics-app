# RADIONICS — Therapeutic Workspace Experience

**Type:** Experience Architecture Authority
**Status:** Canonical — documentation only
**Date:** 2026-08-03
**Authority priority:** Methodology > this document > Workflow Engine > Workspace UI > Reports
**Related:** `docs/Engine/RADIONICS_WORKFLOW_THERAPEUTIC_ALIGNMENT_REVIEW.md`
**Scope:** Session Workspace experience for therapists (all specialities, Mesa 35 as reference model)

---

This document describes **how an experienced therapist must experience a session** inside RADIONICS.

It does **not** describe React, TypeScript, SQL, components, tables, or APIs.

It is the **primary authority** for every future Workspace evolution.

When engineering, product and this document conflict: **methodology and this document win**.

---

# 1. Purpose

RADIONICS exists to **assist** the therapist during a real therapeutic session.

## What the application is for

| Role | Meaning |
|------|---------|
| **Remembers** | Keeps client context, progress, measurements, decisions and notes across interruptions. |
| **Organises** | Orders preparation, diagnosis, work and closing so the session can be resumed without mental reconstruction. |
| **Presents knowledge** | Shows methodology content (graphs, scripts, explanations, protocols, materials) when the therapist needs it. |
| **Records** | Captures therapist decisions and observations without forcing the therapist to “document later”. |
| **Supports** | Reduces administrative burden so attention stays on the client field. |

## What the application never does

| Boundary | Meaning |
|----------|---------|
| **Never replaces the therapist** | No automatic diagnosis presented as truth. |
| **Never decides** | The system does not “find” graphs for the therapist. |
| **Never forces a unique correct path** | Skip, pause and return are always legitimate. |
| **Never invents knowledge** | Scripts and explanations come from methodology authority, not from UI convenience. |

The therapist is the only clinical authority.

The application is the desk, the memory and the library beside that authority.

---

# 2. Experience Principles

## 2.1 Methodology Wins

The therapeutic methodology defines sequence, meaning, language and completeness.

Software configuration (workflows, templates, stages) implements methodology.
It never invents a new therapy for the sake of UX patterns.

## 2.2 The Workspace is a Therapeutic Desk

The Workspace is a **digital mesa de trabalho**, not a multi-step form.

The therapist should feel:

- “I have my tools, my client, my notes, and the knowledge of the method in front of me.”

Not:

- “I am completing a multi-page wizard.”

## 2.3 Knowledge Assists but Never Decides

Knowledge Layer content (what a graph is, what to tell the client, activation formula, protocol steps) appears **on demand** during analysis and work.

That content informs the therapist.
It does not select tools.
It does not complete the session.

## 2.4 The Therapist Remains in Control

The therapist:

- chooses what to analyse
- chooses what is necessary
- chooses what to activate
- chooses what to skip
- chooses when to close
- chooses what enters the client-facing report

The software follows.

## 2.5 Software Should Disappear During the Session

Cognitive load belongs to **listening to the field**, not to navigation chrome.

When the therapist is deep in analysis or activation, UI should feel quiet, spacious and secondary.

## 2.6 The Report Is the Consequence of the Session

Reports are not a separate creative act.

What is carefully lived in the session becomes the substance of the report.
The therapist reviews; the system compiles.

## 2.7 Natural to an Experienced Practitioner

Every screen moment must answer:

> Would an experienced radiesthetic or radiônica therapist recognise this gesture as part of the real work—or only as software behaviour?

If only software: redesign the experience.

## 2.8 Reduce Cognitive Load

Prefer:

- selection over typing
- visual symbols over long empty forms
- voice dictation over forced prose mid-session
- progressive structure over simultaneous fields
- soft guidance over hard gates

## 2.9 Continuity Across Interruptions

A session may pause for a phone call, continue another day, or span multiple sittings.

Returning must restore **where the work left off**, not force a restart of the ritual.

## 2.10 One Experience Model, Many Methodologies

Mesa 35, Mesa 49, MAP and future methods share the same **experience grammar**.

Only the desks’ tools and knowledge change—not the relational contract between therapist and software.

---

# 3. Complete Therapeutic Journey

This chapter describes **therapeutic moments**, not navigation labels.

Specialities may soften or reorder some moments; none may invent a contradictory relational model.

---

## 3.1 Preparing the Session

### Purpose

Create administrative and clinical readiness before energetic work begins.

### Therapist actions

- Select client and methodology (with certification already in place).
- Confirm session mode (presencial / online / distância).
- Ensure basic client data is available for the chosen mode.
- Mentally place the purpose of today’s meeting.

### What the application shows

- Client identity.
- Specialty / methodology name in human language.
- Session mode.
- Calm entry into the desk (no internal “workflow version” language).

### Knowledge available

- Optional specialty overview.
- Mode guidance (e.g. what distance work requires).

### Information recorded

- Client, specialty, mode, professional identity, timestamps, session draft status.

### Outputs produced

- A recoverable session shell.

### Report contribution

- Identification block (client, therapist, date, mode, methodology).

---

## 3.2 Receiving the Client

### Purpose

Honour the person: presence (or distance presence) of the consulente.

### Therapist actions

- Acknowledge the client relationship.
- In distance mode: ensure testimony material is adequate.
- In presencial/online: settle mutual presence.

### What the application shows

- Client name and essential profile context.
- Mode-specific reminders (testimony, birth data when relevant to the method).

### Knowledge available

- Checklist tone (never judicial): what distance work usually needs.

### Information recorded

- Testimony readiness (when used).
- Optional pre-session notes about reception.

### Outputs produced

- Client context readiness.

### Report contribution

- Usually silent or footnote only (not clinical content).

---

## 3.3 Defining the Intention

### Purpose

Orient the work. Intention is the therapeutic North of the session.

### Therapist actions

- Choose intentional **domains** of life / work when taxonomy helps.
- Formulate the **specific intention sentence** for this meeting.
- Refine as needed before connection deepens.

### What the application shows

- Structured domain options (when available for the specialty).
- Free formulation field.
- Intention always visible as light context during later desks (optional compact recall).

### Knowledge available

- Domain descriptions.
- Soft suggestions of common graph families **as memory aids**, never auto-selection.

### Information recorded

- Intention domains.
- Formulation text.
- Who set them and when.

### Outputs produced

- `therapeutic orientation` for the whole session.

### Report contribution

- “Objetivo da sessão” = formulation first; domains as tags/context.

---

## 3.4 Preparing the Energetic Environment

### Purpose

Ready the physical and subtle workplace: table, space, silence, materials.

### Therapist actions

- Prepare environment.
- Optionally mark readiness (so resume knows preparation was done).
- Optional opening dedication / opening prayer when methodology uses it.

### What the application shows

- Soft ritual checklist (optional markers).
- Opening prayer / dedication text when knowledge provides it.
- No forced completion wall.

### Knowledge available

- Opening formulas, environmental guidance from methodology materials.

### Information recorded

- Environment ready (yes / skip with reason optional).
- Opening ritual completed (yes / skip).

### Outputs produced

- Ritual readiness flags.

### Report contribution

- Optional private completeness markers, generally not client-facing detail.

---

## 3.5 Establishing the Connection

### Purpose

Link the work to the client field (mesa activated, connection established).

### Therapist actions

- Activate the table according to method.
- Establish link with client field.
- Sense stability.
- Confirm connection or note difficulty.

### What the application shows

- Clear connection confirmations in human language (“Mesa activada”, “Cliente conectado”).
- Space for short observation of connection quality.
- Optional subtle supportive timing—not a game or compulsory animation theatre.

### Knowledge available

- Connection practice notes if methodology documents them.

### Information recorded

- Connection established yes/no.
- Free observation of connection.

### Outputs produced

- Connection outcome and notes.

### Report contribution

- Rarely expanded publicly; private notes may inform summary later.

---

## 3.6 Initial Energetic Assessment

### Purpose

Register the starting vibrational / consciousness reference of the session (e.g. Hawkins initial where methodology uses it).

### Therapist actions

- Measure according to method.
- Note subjective tone if useful (“raiva”, “medo”, etc. as scale language—not automatic psychology diagnosis).

### What the application shows

- Scale / measurement desk for the methodology tool.
- Labels and colours as understanding aids.
- No implication that the number is “the client’s identity”.

### Knowledge available

- Scale meanings from methodology.

### Information recorded

- Numeric (or method-native) initial measurement.
- Optional emotional / descriptive label.

### Outputs produced

- Baseline measurement for comparison at closing.

### Report contribution

- Hawkins (or equivalent) initial line.

---

## 3.7 Beginning the Diagnosis

### Purpose

Enter analysis mode: the desk of symbols, questions and silence.

### Therapist actions

- Open the diagnosis desk.
- Choose what to examine (full sweep or focused path).
- Keep intention and client context in peripheral awareness.

### What the application shows

- Visual catalog of active methodology assets relevant to this speciality (e.g. full graph set for Mesa 35).
- Filters that help memory (status, search)—not forced queues.
- Clear distinction between “not analysed”, “identified”, “not needed”.

### Knowledge available

- On selection: “what it is”, client-safe explanation, recommended use where known.

### Information recorded

- Navigation is not itself a clinical record; only deliberate tool outcomes are.

### Outputs produced

- Entry into tool-by-tool analysis state.

### Report contribution

- None until tools are decided.

---

## 3.8 Analysing Each Graph (or Tool)

### Purpose

Radiesthetic / method-specific enquiry: is this symbol active for the client field today?

### Therapist actions

- Hold the graph / tool.
- Use method practice (pendulum, intuition, trained response).
- Consult knowledge only as support.

### What the application shows

- Large clear symbol image (real methodology media).
- Name and order if traditional.
- Knowledge panels nearby without crowding the symbol.
- Decisions: still open / needed / not needed.

### Knowledge available

- Therapist explanation.
- Client-facing explanation.
- Activation text preview (not forcing activation yet).

### Information recorded

- Not yet—unless the therapist commits a decision.

### Outputs produced

- Pre-decision readiness.

### Report contribution

- None.

---

## 3.9 Interpreting the Graph

### Purpose

Transform a “hit” into human meaning: why this symbol appears now.

### Therapist actions

- Dictate or write a short interpretation.
- Distinguish client language from private technical notes when useful.

### What the application shows

- Space for interpretation next to the identified tool.
- Voice dictation path when available.
- Preserve prior interpretations when revisiting.

### Knowledge available

- Optional prompts (e.g. “o que informar ao cliente”) as language support, never auto-fill of clinical truth.

### Information recorded

- Interpretation text and/or voice note metadata.

### Outputs produced

- Human meaning attached to identification.

### Report contribution

- Interpretation excerpts under identified tools (client-facing polish optional).

---

## 3.10 Identifying or Discarding

### Purpose

Binary therapeutic decision after analysis: this needs work, or not.

### Therapist actions

- **Identify** when the field indicates necessity.
- **Discard / ignore / not needed** when it does not.
- May leave as not analysed if unexamined (full sweep is not mandatory).
- Optional intensity when methodology uses intensity language.

### What the application shows

- Unambiguous actions for Identify / Not needed.
- Optional intensity selector after identify.
- Status visible on cards without shaming incomplete catalogs.

### Knowledge available

- Same as analysis; no extra pressure.

### Information recorded

- Tool status: identified | not needed | not analysed.
- Intensity if set.
- Timestamp of decision when useful for history.

### Outputs produced

- The activation worklist for later.

### Report contribution

- Identified list + optional not-needed summary (usually compact).

---

## 3.11 Working Through Identified Graphs

### Purpose

Transition from diagnosis desk to work desk: only what was found necessary.

### Therapist actions

- Review pending activations.
- Order work by clinical sense (not forced software order unless the therapist wants a list order).
- Return to diagnosis if another symbol appears during work (freedom to re-open).

### What the application shows

- Queue or cards of **identified**, not the entire catalog.
- Progress as human language (“2 pending of 5”), never “stage completion percentage of software gates” as primary emotion.

### Knowledge available

- Activation desks loaded per tool.

### Information recorded

- Ordered work intent is optional; outcomes matter more than forced rank.

### Outputs produced

- Active work set.

### Report contribution

- Bridge between identified and activated lists.

---

## 3.12 Reading Activation Scripts

### Purpose

Bring the methodology voice into the work: the formula must be available, readable, and respected.

### Therapist actions

- Read the script carefully.
- Personalise mentally with the client name when the formula includes it.
- Never invent a substitute formula when knowledge provides an official one (unless therapist consciously adapts and notes it).

### What the application shows

- Primary activation text, large and readable.
- Clear message if no script exists (“texto orientador ainda não disponível”) without blocking work.
- Client name substitution as **presentation assistance**, not mandatory automation theatre.

### Knowledge available

- Activation scripts, provenance when useful (source respect).

### Information recorded

- That the script was available/used (conceptually); optional “script reviewed” sense for memory—never accusation.

### Outputs produced

- Prepared spoken work.

### Report contribution

- Optional short citation of script; usually private completeness only.

---

## 3.13 Performing the Energetic Work

### Purpose

The actual therapeutic act happens **with/through the field**, outside software.

### Therapist actions

- Speak / channel / apply the work according to training.
- Observe response in the field.
- Take as long as needed.

### What the application shows

- Stillness: script remains visible.
- No countdown that pretends to “complete energy”.
- Soft affordance to confirm when the therapist is ready.

### Knowledge available

- Script + symbol remain present.

### Information recorded

- Nothing automatic about “field success”; only therapist confirmation later.

### Outputs produced

- Real-world intervention.

### Report contribution

- Narrative only through therapist observations after.

---

## 3.14 Confirming Completion

### Purpose

Mark the tool as worked, with optional qualitative observation.

### Therapist actions

- Confirm activation.
- Or skip intentional work if reassessed.
- Add observation (“sem resistência”, “resposta intensa”, “necessita reverberação prolongada”).

### What the application shows

- Confirm activated.
- Observation field.
- Gentle next item in the work set.

### Knowledge available

- Optional support only.

### Information recorded

- Status activated.
- Observation.
- Optional activation time.

### Outputs produced

- Completed work items.

### Report contribution

- Activated list + observations.

---

## 3.15 Working with Chakras

### Purpose

When methodology uses chakras: analyse imbalance, select centres, activate with chakra scripts.

### Therapist actions

- Select relevant centres.
- Interpret if needed.
- Read chakra activation language.
- Confirm work.

### What the application shows

- Chakra desk as a natural section—not an engineer “sub-step code”.
- Full traditional set when methodology supports it.

### Knowledge available

- Chakra functions, imbalance language, activation formulas.

### Information recorded

- Selected / activated centres and notes.

### Outputs produced

- Chakra work trace.

### Report contribution

- Conditional chakra section.

---

## 3.16 Executing Therapeutic Protocols

### Purpose

When methodology is protocol-oriented (e.g. Mesa 49 / MAP support paths): open a known protocol and walk its guidance and assets.

### Therapist actions

- Choose protocol when method calls for it.
- Follow protocol guidance steps at human pace.
- Activate linked assets as needed.
- Skip protocol entirely if not indicated today.

### What the application shows

- Protocol name, why activate, ordered guidance.
- Linked assets as work materials.
- Never a second “app mode” that abandons the desk metaphor.

### Knowledge available

- Protocol definition, steps, assets, related activation scripts.

### Information recorded

- Selected protocol.
- Guidance progress (when therapist marks).
- Asset activations from protocol path.

### Outputs produced

- Protocol-assisted session trail.

### Report contribution

- Protocol name, narrative of linked activations.

---

## 3.17 Final Energetic Assessment

### Purpose

Close the measurement arc: final measurement where method uses it.

### Therapist actions

- Measure final reference.
- Compare privately with initial; optional qualitative note.

### What the application shows

- Same measurement desk as initial.
- Side-by-side recall of initial when helpful.

### Knowledge available

- Scale meanings.

### Information recorded

- Final measurement + optional label.

### Outputs produced

- Closing measurement pair.

### Report contribution

- Final measurement + optional evolution sentence (therapist-validated).

---

## 3.18 Reverberation

### Purpose

Define the period of integration after work.

### Therapist actions

- Choose reverberation duration consistent with training and field sense.
- Optionally attach integration recommendations.

### What the application shows

- Reverberation choices (common periods as soft options, free custom when needed).
- Recommendations space.

### Knowledge available

- Specialty practices for aftercare.

### Information recorded

- Reverberation days / period.
- Recommendations text or bullets.

### Outputs produced

- Aftercare plan.

### Report contribution

- Reverberation + recommendations.

---

## 3.19 Closing Prayer

### Purpose

Spiritual/ethical closure of the work when methodology includes it.

### Therapist actions

- Perform closing prayer / thanksgiving.
- Mark done or skip with professional freedom.

### What the application shows

- Closing prayer text if provided by knowledge/materials.
- Soft confirmation only.

### Knowledge available

- Closing formulas.

### Information recorded

- Closing prayer done/skip.

### Outputs produced

- Ritual closure flag.

### Report contribution

- Generally private.

---

## 3.20 Breaking the Connection

### Purpose

Safely end the link between mesa/work and client field.

### Therapist actions

- Perform disconnection practice.
- Confirm completed when ready.

### What the application shows

- Explicit human language act (“Quebra de conexão”).
- Optional note if difficult.

### Knowledge available

- Method notes for disconnection.

### Information recorded

- Disconnect confirmed.

### Outputs produced

- Safety closure of the energetic link.

### Report contribution

- Generally private.

---

## 3.21 Final Notes

### Purpose

Capture closing clinical impressions: stability, concerns, follow-up intuition.

### Therapist actions

- Dictate or write final observations.
- Separate private reflections from client-facing phrasing when needed.

### What the application shows

- Final notes surface.
- Optional private vs shareable distinction.

### Knowledge available

- None forced.

### Information recorded

- Final notes (visibility partition when available).

### Outputs produced

- Closing narrative seeds for report summary.

### Report contribution

- Summary seed + private appendix.

---

## 3.22 Report Review

### Purpose

Read what the session already built; edit fairness and clarity; approve.

### Therapist actions

- Review compiled sections.
- Correct language for the client.
- Withhold private notes.
- Approve.

### What the application shows

- Draft report built from recorded reality.
- Clear approve action.
- No empty “generate from zero” creative canvas as primary model.

### Knowledge available

- None beyond session data.

### Information recorded

- Approval, version, share intent.

### Outputs produced

- Approved report artefact.

### Report contribution

- The report itself.

---

## 3.23 Session Completion

### Purpose

Leave the desk knowing the professional act is closed or consciously paused.

### Therapist actions

- Complete or pause.
- Trust resume later if unfinished.
- Move attention to human aftercare, not software residual tasks.

### What the application shows

- Clear completed / paused states.
- Easy re-entry to unfinished work.

### Knowledge available

- Optional next-session hints later (never mandatory).

### Information recorded

- Session status.

### Outputs produced

- Historical session for evolution and continuity.

### Report contribution

- Status linkage (reported / completed).

---

# 4. Therapeutic Work Desks

The Workspace is organised as **desks**, not pages.

A desk has a single primary job.
The therapist can leave and return freely.

---

## 4.1 Preparation Desk

### Primary objective

Ready the session: people, intention, environment, opening.

### Information available

- Client.
- Mode.
- Intention domains and formulation.
- Ritual readiness markers.

### Tools available

- Intention structure.
- Testimony / mode checklists.
- Opening prayer knowledge when relevant.

### Natural sequence

Receive → Intention → Environment → Opening (connection is often next desk).

### Feeling

Settled, calm, quiet—not a long form.

---

## 4.2 Connection Desk

### Primary objective

Establish and confirm the energetic link.

### Information available

- Client name and intention recall.
- Connection outcomes.

### Tools available

- Connection confirmations.
- Observation note.
- Optional supportive guidance (not entertainment).

### Natural sequence

Prepare environment → Connect → Confirm → Enter assessment/diagnosis.

### Feeling

Focused and brief.

---

## 4.3 Diagnosis Desk

### Primary objective

Analyse and decide what is necessary.

### Information available

- Full relevant catalog (methodology assets).
- Status of each tool.
- Knowledge for each tool.
- Initial measurement (when timed before or at start of diagnosis).

### Tools available

- Visual analysis of graphs/symbols.
- Identify / not needed.
- Interpretation and voice notes.
- Intensity when used.
- Measurement access when method places it here.
- Optional chakra analysis section.

### Natural sequence

Measure initial (if applicable) → Analyse tools selectively → Interpret hits → Build worklist.

### Feeling

Like sitting at a symbol board: look, question, mark, note.

---

## 4.4 Activation Desk

### Primary objective

Perform and register energetic work on what was identified.

### Information available

- Worklist of identified items only.
- Images, names, scripts.
- Prior interpretation.

### Tools available

- Script reading surface.
- Confirm activation.
- Observation after work.
- Skip reassessed items.
- Protocol guidance when specialty requires protocols.
- Chakra activation when chosen.

### Natural sequence

Open item → Read script → Work → Confirm → Next → Return to diagnosis if something new appears.

### Feeling

Like reading a working formula with the symbol present; software is a stand for materials and memory.

---

## 4.5 Closing Desk

### Primary objective

Close measurements, aftercare, rituals, and open report review.

### Information available

- Initial measurement for comparison.
- Pending work warnings (soft, not policing).
- Reverberation and recommendations.

### Tools available

- Final measurement.
- Reverberation.
- Closing prayer and disconnection.
- Final notes.
- Entry to report review.

### Natural sequence

Final measure → Reverb → Close ritual → Notes → Report review.

### Feeling

Grounding and complete—not “last form page”.

---

## 4.6 Report Review Surface

Not a “desk of work”, but the **mirror** of the session.

### Primary objective

Human approval of the session’s written consequence.

### Feeling

Editor of a document that already knows what happened.

---

# 5. Therapist Decisions

Every important decision stays human-owned. Soft support only.

| Decision | What it means | Support the experience may offer |
|----------|---------------|----------------------------------|
| **Ignore / not needed** | Symbol does not ask for work today | Knowledge of role; no guilt for ignoring |
| **Identify** | Symbol is clinically present | Image, name, knowledge, intention context |
| **Interpret** | Meaning of presence | Dictation, client-safe language aids |
| **Set intensity** | Relative force or prominence | Simple optional scale |
| **Read activation** | Align with official formula | Large script text, name substitution aid |
| **Execute activation** | Field work performed by therapist | Quiet space, no fake timers of energy |
| **Confirm activation** | Work registered as done | One clear confirm + note |
| **Skip after reassess** | Worklist can change | Return pathways between desks |
| **Select chakra** | Centre needs attention | Chakra knowledge and scripts |
| **Open / skip protocol** | Specialty structure for the day | Protocol “why activate”, steps |
| **Choose reverberation** | Integration time | Common periods as soft defaults |
| **Add observation** | Qualitative field response | Always nearby, low friction |
| **Edit intention** | Orientation changed | Allowed early; after deep work, careful (therapist still free) |
| **Approve report** | Client document is ready | Compiled draft, private filtering |

**No decision is made by ranking algorithms presented as clinical truth.**

Optional future “suggestions” must remain **hints**, labelled as such, never results.

---

# 6. Report Philosophy

## 6.1 The report is not generated from nothing

The report **accumulates** as the session is lived:

- Intention forms the objective.
- Measurements form the Hawkins (or equivalent) arc.
- Interpreting builds qualitative substance.
- Activations build what was worked.
- Reverberation and recommendations form aftercare.
- Final notes seed the summary.

## 6.2 Compilation, not invention

At the end the system **compiles**.
It does not invent findings the therapist never marked.

## 6.3 Review is human

The therapist:

- reads the draft as a peer document
- softens language for the client
- removes or keeps clinical detail
- approves

Only after approval is the report **final**.

## 6.4 Visibility partitions

Where the methodology or ethics require:

- **Client-facing** material
- **Private therapist** material

must stay separable before share.

## 6.5 Consequence timing

Opening the report mid-session may preview accumulation.
Finality belongs after closing, not during activation work.

---

# 7. Mapping: Experience → Workflow → Workspace → Report

The hierarchy of authority:

```text
Therapeutic Experience (this document)
        ↓ implements
Workflow Engine (order, conditions, step outcomes)
        ↓ presents
Workspace Desks (human face of the experience)
        ↓ summarises
Report (approved consequence)
```

| Layer | Responsibility | Must not do |
|-------|----------------|-------------|
| **Experience** | Define therapist journey, desks, decisions, language feelings | Specify code |
| **Workflow Engine** | Encode order, optionality, outputs, conditions per speciality | Invent rituals unknown to methodology |
| **Workspace** | Present desks, knowledge, record decisions | Force software metaphors over therapy |
| **Report** | Compile and host human approval | Generate findings not recorded |

### Practical mapping examples (Mesa 35 reference)

| Experience moment | Workflow role (conceptual) | Workspace desk | Report seed |
|-------------------|----------------------------|----------------|-------------|
| Define intention | preparation / intention outputs | Preparation | Objective |
| Connection confirm | connection outputs | Connection | private / rare |
| Hawkins initial | measurement initial | Diagnosis (or before) | Hawkins initial |
| Identify graph | diagnosis outcomes | Diagnosis | Identified list |
| Activation with script | activation outcomes | Activation | Activated list + notes |
| Hawkins final | measurement final | Closing | Hawkins final |
| Reverberation | closing outputs | Closing | Reverberation |
| Approve report | report consequence | Report review | Final artefact |

Engine step codes may differ; **therapist language must stay experience language**.

---

# 8. Things the Therapist Should Never Feel

## Forbidden feelings

| Never | Why |
|-------|-----|
| “I am filling a form.” | Breaks desk metaphor and presence. |
| “The application is deciding.” | Usurps clinical authority. |
| “I have to click Next to be valid.” | Linear software tyranny. |
| “I must complete every graph.” | False obligation; full sweeps are optional forms. |
| “I am navigating software.” | Attention leaves the client field. |
| “I am stuck until the system is happy.” | Completeness theatre. |
| “I don’t know what this button means therapeutically.” | Label failure. |
| “The script is optional decoration.” | Knowledge disdain. |
| “Report is a separate creative job at midnight.” | Broken consequence model. |

## Desired feelings

| Always aim for | Why |
|----------------|-----|
| “I am working naturally.” | Continuity with offline mastery. |
| “I have everything available.” | Desk is complete. |
| “The software follows me.” | Resume and freedom. |
| “I remain in control.” | Trust. |
| “My notes are safe.” | Memory trust. |
| “The report already knows what I did.” | Consequence model. |
| “I can pause.” | Life happens during sessions. |

These are acceptance criteria for experience quality—more important than pixel polish.

---

# 9. Future Evolution

## 9.1 One grammar for all specialities

Future specialities (**Mesa 49**, **MAP**, others) **must adapt to this experience model**.
They must not invent parallel interaction philosophies (e.g. “protocol mode app-inside-app”, unrelated dashboards).

## 9.2 What specialities may change

| May change | Examples |
|------------|----------|
| Tools on desks | Angels, clocks, causes, graphs, materials |
| Knowledge surfaces | Protocol packs, angel lore, MAP charts |
| Optional moments | Protocol-first paths; different measurement tools |
| Catalogs | Different asset families |
| Ritual texts | Specialty opening/closing |

## 9.3 What specialities must not change

| Must not change |
|-----------------|
| Therapist owns clinical decisions |
| Knowledge assists, never decides |
| Identify-before-activate semantics for activatable assets |
| Desks as metaphor, not multi-form bureaucracy |
| Report as compiled consequence |
| Soft skip freedom |
| Session resume fidelity |
| Human language over engine language |

## 9.4 Extending desks

New specialities may deepen desks (e.g. Protocol panel inside Activation Desk) but:

- keep the **same decision ethics**
- keep **knowledge provenance**
- keep **report accumulation**

## 9.5 Product evolution test

Every proposed Workspace feature must pass:

1. **Methodology test** — Is it true to the speciality’s real practice?
2. **Desk test** — Does it belong on a therapeutic desk, not a form?
3. **Control test** — Can the therapist skip without shame?
4. **Knowledge test** — Does it present real knowledge without inventing?
5. **Report test** — Does it leave a truthful seed for the report?
6. **Silence test** — Can software fade while work happens?

If any test fails, the feature is not ready for the Workspace.

---

# Document Control

| Item | Value |
|------|-------|
| Document path | `docs/Experience/RADIONICS_THERAPEUTIC_WORKSPACE_EXPERIENCE.md` |
| Role | **Canonical experience authority** for Workspace |
| Implementation | Explicitly **out of scope** in this task |
| Next use | Guide TR-* experience recovery work and all specialty UX design |

---

**End of authority document.**

The software exists so that, while the therapist works, **memory, order and knowledge are already there**—and so the report can simply tell the truth of what was lived.
