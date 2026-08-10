# RADIONICS — Therapeutic Workspace Reconstruction Master Plan

**Type:** Transformation Roadmap (execution authority)
**Status:** Canonical — documentation only
**Date:** 2026-08-03
**Depends on (canonical):**
- `docs/Experience/RADIONICS_THERAPEUTIC_WORKSPACE_EXPERIENCE.md`
- `docs/Experience/RADIONICS_THERAPEUTIC_INTERACTION_MODEL.md`
**Related audit:** Therapeutic Alignment Review (V3.0D.REVIEW class)

---

## Authority reminder

| Layer | Role |
|-------|------|
| Methodology | Ultimate truth of practice |
| Therapeutic Workspace Experience | What the therapist lives |
| Therapeutic Interaction Model | How interactions, states and decisions behave |
| **This Master Plan** | How the current Workspace is reconstructed to obey the above |
| Workflow Engine | Implements order/conditions/outcomes |
| Workspace presentation | Human face of desks |
| Reports | Compile + approve consequence |

This document is **not** architecture of systems, **not** UI design, and **not** implementation.

It is the **transformation roadmap**.

**STOP IMPLEMENTATION** relative to this task: no code, SQL, engine, workspace, reports, UI, hooks, services or tests are modified here.

---

# 1. Executive Summary

## 1.1 Why reconstruction is required

The Session Workspace today is a **partial translation** of therapeutic practice into a five-stage software shell. It can open sessions, show tools, mark statuses and preview reports—but it does not yet faithfully embody:

- ritual readiness and connection as clinical acts
- asset lifecycle (encounter → identify/discard → interpret → script → confirm)
- activation as work, not a one-click collapse
- silent report accumulation with human approval
- desks that feel like a therapeutic mesa rather than a form

The Therapeutic Alignment Review established roughly **45–55%** fidelity for Mesa 35 end-to-end. Continuing to patch the legacy form model would deepen incorrect assumptions.

Reconstruction is required so that **every future Workspace change starts from Experience and Interaction**, not from legacy stage components.

## 1.2 Summary of the Therapeutic Alignment Review

Key conclusions carried forward:

| Finding | Implication for reconstruction |
|---------|--------------------------------|
| Workflow Engine direction is largely sound | Keep engine; bind it to Interaction Model |
| Knowledge / Resources / Materials are sound as content | Present them in desks; do not reinvent knowledge |
| Workspace only partially represents methodology | Rebuild desk-by-desk against Experience |
| Activation must be Identify → Script → Perform → Confirm | TR-3 + TR-4 are critical path |
| Intention, rituals, report depth are under-modeled | TR-1, TR-5, TR-6 close the arc |
| Dual create paths confuse “session type” | Migration must clarify workflow vs legacy without breaking legacy |

## 1.3 New authority hierarchy (non-negotiable)

```text
Methodology
  → Therapeutic Workspace Experience
    → Therapeutic Interaction Model
      → Reconstruction Master Plan (this)
        → Workflow binding
          → Workspace desks
            → Report review
```

**Never redesign outside Experience.**
**Never invent interaction outside Interaction Model.**
**Workflow follows Interaction.**
**Workspace follows Workflow + Interaction.**
**Report follows Session.**

---

# 2. Current State

Assessment is experiential/architectural relative to the new authorities—not a code inventory.

---

## 2.1 Preparation Desk

| Dimension | Assessment |
|-----------|------------|
| **Current implementation** | Intention free-text / weak chips; Hawkins often placed here; little testimony/environment/opening prayer structure; wizard creates session shell |
| **Alignment level** | **Low–Partial** |
| **Major gaps** | Structured intention domains; environment readiness; opening ritual; mode-gated testimony; Hawkins belongs elsewhere for Mesa 35 full |
| **Blocking issues** | Therapists start “clinical measurement” before connection/diagnosis semantics; intention does not reliably become report objective with domains |

---

## 2.2 Connection Desk

| Dimension | Assessment |
|-----------|------------|
| **Current implementation** | Soft / decorative connection experience; weak durable connection outcomes |
| **Alignment level** | **Low** |
| **Major gaps** | Confirmable “mesa activada / cliente conectado”; connection notes; non-theatrical behaviour |
| **Blocking issues** | Connection is not remembered as a therapeutic event; completion rules may treat connection as always true |

---

## 2.3 Diagnosis Desk

| Dimension | Assessment |
|-----------|------------|
| **Current implementation** | Catalog grid + detail drawer; statuses not_analyzed / identified / skipped / activated; notes/voice partially present; workflow path can load methodology assets; legacy path still mock-limited |
| **Alignment level** | **Partial** |
| **Major gaps** | Explicit Asset Lifecycle language; discard vs identify clarity; interpretation as first-class; soft catalog freedom vs “analyse all” pressure; knowledge-first encounter |
| **Blocking issues** | Collapse into activation from wrong plane; incomplete catalogs on legacy sessions; stage completion may force full sweep semantics |

---

## 2.4 Activation Desk

| Dimension | Assessment |
|-----------|------------|
| **Current implementation** | List of identified items; activate/skip; script text when available; limited confirmation depth |
| **Alignment level** | **Partial → Incorrect in places** |
| **Major gaps** | Script-reading as primary work moment; quiet perform phase; confirmation + observation discipline; clean return to diagnosis; work queue as desk not form |
| **Blocking issues** | One-click activate without script primacy; weak distinction Analysis plane vs Work plane |

---

## 2.5 Closing Desk

| Dimension | Assessment |
|-----------|------------|
| **Current implementation** | Hawkins final + reverberation + report entry; missing closing prayer / disconnection as first-class acts; recommendations uneven |
| **Alignment level** | **Partial** |
| **Major gaps** | Closing prayer; break connection; structured recommendations; final notes partitions; soft pending reminders without shame |
| **Blocking issues** | Session can “close” without ritual closure memory; report opened without aftercare completeness awareness |

---

## 2.6 Report Review

| Dimension | Assessment |
|-----------|------------|
| **Current implementation** | Preview/modal from snapshot; limited sections; weak “accumulation then approve” philosophy; little return-to-desk to correct truth |
| **Alignment level** | **Partial** |
| **Major gaps** | Silent accumulation contract; review/edit/approve as dedicated surface; private vs client-facing; return to desks; finalization semantics |
| **Blocking issues** | Report feels generated rather than lived; missing interpretations/scripts/rituals/protocol trails |

---

# 3. Reconstruction Principles

1. **Never redesign outside Experience.** Every desk change must cite Experience moments.
2. **Never invent interaction.** Every clickable clinical act must map to Interaction Model moments/states.
3. **Workflow follows Interaction.** Step types and outputs encode Interaction outcomes—not the reverse.
4. **Workspace follows Workflow + Interaction.** Presentation is desks and encounters, not engine codes.
5. **Report follows Session.** No report content without recorded interaction truth.
6. **Desk-by-desk reconstruction.** Do not “big-bang rewrite” the whole Workspace without gates.
7. **Legacy must keep working** until a specialty’s workflow path is gated complete.
8. **Methodology language only** in therapist-facing surfaces.
9. **Soft freedom over hard gates.** Progress is memory, not prison.
10. **One grammar for all specialities.** Mesa 49 / MAP reuse phases, vary content.
11. **Knowledge is read-only input.** Never invent scripts or explanations in reconstruction.
12. **Express variants shorten optional rituals; they do not erase Identify → Work grammar.**

---

# 4. Reconstruction Phases

Phases are **sequential in dependency**, but cross-cutting work (§5) may proceed in parallel under gates.

Each phase ends only when Acceptance Gates (§7) pass.

---

## TR-1 — Preparation Desk

### Objectives

Rebuild Orientation plane:

- session orientation clarity
- intention domains + formulation
- environment readiness
- opening ritual (soft)
- mode-gated testimony readiness
- remove Hawkins-from-Preparation as Mesa 35 full default (measurement moves with Diagnosis/Interaction timing)

### Dependencies

- Experience §§ orientation/intention/environment
- Interaction §§ 6.x
- Wizard/session create already able to open workflow sessions (precondition, not redesigned here unless gated)

### Deliverables

- Preparation Desk behavioural spec aligned to Experience/Interaction
- Intention profile outcomes defined for Workflow binding
- Ritual readiness outcomes defined
- Gap list of current Preparation behaviours to retire

### Success criteria

- Therapist can set intention without feeling a form
- Opening/environment are optional markers, not walls
- Hawkins initial is not the primary meaning of Preparation for Mesa 35 full
- Intention seeds report objective

### Out of scope

- Diagnosis catalog work
- Activation scripts
- Report approval UI
- New specialities beyond Mesa 35 reference

---

## TR-2 — Connection Desk

### Objectives

Make connection a confirmable therapeutic event:

- mesa activated
- client connected
- connection notes
- non-theatrical, dismissible guidance

### Dependencies

- TR-1 complete enough that intention exists as context
- Interaction §7

### Deliverables

- Connection Desk behavioural spec
- Connection outcome vocabulary for Workflow binding
- Soft progression hint rules (no hard block)

### Success criteria

- Connection outcome is remembered on resume
- Therapist never feels a mini-game
- Can proceed with skip + note

### Out of scope

- Graph analysis
- Activation
- Final measurement

---

## TR-3 — Diagnosis Desk

### Objectives

Implement Analysis plane faithfully.

**Must explicitly include:**

| Theme | Reconstruction intent |
|-------|------------------------|
| **Asset Lifecycle** | dormant → encountered → not_needed / identified → ready_for_work |
| **Identify** | Explicit therapist decision into worklist |
| **Discard** | Explicit not_needed without shame |
| **Interpretation** | First-class note on identified assets |
| **Notes** | Voice/text capture beside encounter |
| **Selection model** | Selective analysis; full sweep optional; no forced “all graphs” |

Also:

- methodology catalog source for workflow sessions
- knowledge presentation on encounter
- optional intensity
- clear plane separation from Activation
- soft pending language, not completion theatre

### Dependencies

- TR-1 / TR-2 for context and connection memory
- Interaction §§ 4, 9
- Knowledge Layer availability for speciality

### Deliverables

- Diagnosis Desk behavioural spec covering lifecycle + decisions
- Mapping table: Interaction states ↔ Workflow outcomes ↔ Report seeds
- Rules for return from Activation into Diagnosis

### Success criteria

- Identify and Discard are distinct, obvious acts
- Interpretation can be captured without leaving the encounter mentally
- Therapist can leave many assets unanalysed without guilt
- No silent jump to Activated from Diagnosis as primary path

### Out of scope

- Script-primary Activation Desk (TR-4)
- Closing rituals
- Protocol runtime depth (may stub panel later under TR-4 specialty extension)

---

## TR-4 — Activation Desk

### Objectives

Implement Work plane faithfully.

**Must explicitly include:**

| Theme | Reconstruction intent |
|-------|------------------------|
| **Work queue** | Only identified / pending / activated sets |
| **Script reading** | Primary content of activation encounter |
| **Activation confirmation** | Explicit confirm after perform |
| **Observations** | Post-activation notes |
| **Return to diagnosis** | Bidirectional freedom |

Also:

- quiet perform phase (no fake energy timers)
- script unavailable friendly path without inventing text
- reassess skip from worklist
- optional chakra/protocol extensions only if Interaction grammar preserved

### Dependencies

- TR-3 (worklist integrity)
- Interaction §§ 10, 11
- Activation scripts from Knowledge

### Deliverables

- Activation Desk behavioural spec
- Encounter microflow: open → script → perform → confirm
- Report seed rules for activated items

### Success criteria

- Script is unavoidable when present (visually primary)
- Confirm is distinct from Identify
- Pending queue language is human
- Therapist can return to Diagnosis and re-enter Work without losing truth

### Out of scope

- Final Hawkins (TR-5)
- Report approval (TR-6)
- Full Mesa 49 protocol productization beyond grammar-ready panel

---

## TR-5 — Closing Desk

### Objectives

Implement Closure plane.

**Must explicitly include:**

| Theme | Reconstruction intent |
|-------|------------------------|
| **Final Hawkins** | Final measurement with initial recall |
| **Reverberation** | Soft common periods + custom |
| **Recommendations** | Structured aftercare capture |
| **Closing prayer** | Soft ritual confirm |
| **Disconnection** | Soft “quebra de conexão” confirm |

Also:

- final notes with visibility partition
- soft reminders of pending activations (non-blocking)

### Dependencies

- TR-4 for truthful activated set
- Interaction §§ 8.2, 12

### Deliverables

- Closing Desk behavioural spec
- Aftercare + ritual outcome vocabulary
- Evolution note optional capture (therapist-authored)

### Success criteria

- Closing feels grounding, not “last form page”
- Rituals are markable/skippable
- Aftercare seeds report without second writing job

### Out of scope

- Report finalization mechanics (TR-6)
- Printing polish (cross-cutting)

---

## TR-6 — Report Review

### Objectives

Implement Reflection plane as consequence of session.

**Must explicitly include:**

| Theme | Reconstruction intent |
|-------|------------------------|
| **Accumulated report** | Compile only recorded truth |
| **Review** | Therapist reads draft as editor |
| **Approval** | Explicit finalization |
| **Return to desks** | Fix reality before approve |
| **Finalization** | Approved artefact semantics |

Also:

- private vs client-facing partitions
- sections conditional on what was lived (chakras/protocols when used)

### Dependencies

- TR-1…TR-5 seeds available
- Experience Report Philosophy + Interaction §13

### Deliverables

- Report Review surface behavioural spec
- Accumulation matrix (interaction → section)
- Approval / deferral / return rules

### Success criteria

- Report never invents findings
- Therapist feels “this already knows what I did”
- Approval is the only path to final
- Return to desks updates draft truthfully

### Out of scope

- Marketing PDF themes
- Multi-language generation
- Auto-AI clinical conclusions presented as facts

---

# 5. Cross-cutting Work

Shared across all phases; tracked as **CX** workstreams.
May advance in parallel but cannot bypass desk gates.

| ID | Workstream | Applies to | Reconstruction intent |
|----|------------|------------|------------------------|
| **CX-NAV** | Navigation | All desks | Human desk labels; no Next tyranny; resume contract |
| **CX-PERS** | Persistence | All desks | Outcomes survive pause/resume; no loss of decisions/notes |
| **CX-WF** | Workflow binding | All desks | Interaction outcomes encoded in workflow_state / bridges without exposing engine codes |
| **CX-KNOW** | Knowledge presentation | Diagnosis, Activation, rituals, protocols | Read-only knowledge surfaces; provenance respect |
| **CX-A11Y** | Accessibility | All desks | Script readability; focus; non-color-only status |
| **CX-PROG** | Progress model | All desks | Soft memory hints; no completion prison |
| **CX-VOICE** | Voice notes | Diagnosis, Activation, Closing | First-class capture path where product allows |
| **CX-PRINT** | Printing / materials | Activation, Report | Optional materials/print access without breaking desk metaphor |

### Cross-cutting rules

- CX items do not replace TR phases.
- A TR phase may consume CX readiness as dependency.
- CX must not invent new clinical interactions.

---

# 6. Migration Strategy

## 6.1 Transformation arc

```text
Old Workspace (legacy 5-stage form model)
        ↓
Hybrid (workflow Mesa 35 desks migrate phase-by-phase; legacy intact)
        ↓
New Workspace (Experience/Interaction-true desks as default for workflow specialities)
```

## 6.2 Old Workspace

- Remains available for **legacy sessions** and classic template creates.
- Behaviour frozen except critical bugfixes.
- Must not receive new therapeutic features that contradict Interaction Model.

## 6.3 Hybrid

- **Workflow sessions** (e.g. Mesa 35 recommended path) adopt reconstructed desks as each TR phase gates pass.
- Unfinished phases fall back to best current behaviour **without claiming Experience compliance**.
- Dev/diagnostic honesty: do not advertise “therapeutic complete” until TR-6 gates pass for that speciality.

## 6.4 New Workspace

- After TR-1…TR-6 gates for a speciality:
  - default create path uses reconstructed desks
  - report review uses accumulation/approval model
  - legacy create path either retired or clearly labelled transitional

## 6.5 Legacy sessions continue working

| Session kind | Rule |
|--------------|------|
| Created as legacy / classic template | Keep legacy desk behaviour |
| Seed historical sessions | Keep opening/editing without forced migration |
| In-progress legacy | No automatic conversion of tool semantics mid-flight |

Optional later: “upgrade session to therapeutic model” only as explicit therapist action with clear warning—not in early TR phases.

## 6.6 Workflow sessions evolve

| Stage of roadmap | Workflow session behaviour |
|------------------|----------------------------|
| Before TR-1 gate | Current hybrid adapter behaviour |
| After each TR gate | That desk obeys Experience/Interaction |
| After TR-6 | Full therapeutic arc + report approval for that speciality |

Workflow Engine templates may gain outputs over time; **semantics come from Interaction Model**, not opportunistic fields.

---

# 7. Acceptance Gates

Every TR phase and major CX delivery must pass four gates before “Implementation Ready” work begins for that phase—and again before the phase is marked Done.

## 7.1 Gate A — Architectural Review

Questions:

- Does this phase respect authority hierarchy?
- Does Workflow binding remain subordinate to Interaction?
- Are legacy/workflow migration boundaries clear?
- Any invented concepts not in Experience/Interaction?

**Pass:** Written yes with citations to Experience/Interaction sections.

## 7.2 Gate B — Experience Review

Questions:

- Would an experienced therapist recognise this desk as real work?
- Does software disappear during deep moments?
- Are forbidden feelings avoided (form, Next tyranny, forced completeness)?

**Pass:** Experience owner approval against Experience document.

## 7.3 Gate C — Interaction Review

Questions:

- Are moments complete (Purpose…Exit conditions)?
- Asset lifecycle intact (TR-3/TR-4)?
- Soft freedom preserved?
- Report seeds correct?

**Pass:** Interaction Model compliance checklist signed.

## 7.4 Gate D — Implementation Ready

Questions:

- Deliverables of the phase are unambiguous enough to implement without inventing UX semantics?
- Dependencies met?
- Out of scope still respected?
- Success criteria testable in human terms?

**Pass:** Phase brief locked; implementation may start **only after this gate**.

> Note: This Master Plan itself does not start implementation. Gate D authorises a *future* implementation task.

---

# 8. Progress Matrix

| Desk / Surface | Experience | Interaction | Reconstruction | Status |
|----------------|------------|-------------|----------------|--------|
| Preparation Desk | Approved | Approved | Pending (TR-1) | Not Started |
| Connection Desk | Approved | Approved | Pending (TR-2) | Not Started |
| Diagnosis Desk | Approved | Approved | Pending (TR-3) | Not Started |
| Activation Desk | Approved | Approved | Pending (TR-4) | Not Started |
| Closing Desk | Approved | Approved | Pending (TR-5) | Not Started |
| Report Review | Approved | Approved | Pending (TR-6) | Not Started |
| Navigation (CX-NAV) | Approved | Approved | Pending | Not Started |
| Persistence (CX-PERS) | Approved | Approved | Pending | Not Started |
| Workflow binding (CX-WF) | Approved | Approved | Pending | Not Started |
| Knowledge presentation (CX-KNOW) | Approved | Approved | Pending | Not Started |
| Progress model (CX-PROG) | Approved | Approved | Pending | Not Started |
| Voice notes (CX-VOICE) | Approved | Approved | Pending | Not Started |

**Status legend:** Not Started → In Reconstruction Spec → Gates A–C Pass → Implementation Ready → In Implementation → Done → Specialty Certified

*(Implementation columns remain unused until a future implementation programme begins.)*

---

# 9. Future Specialities

## 9.1 Same reconstruction strategy

**Mesa 49**, **MAP**, and future methodologies **reuse exactly this roadmap**:

1. Confirm Experience grammar applies (it must).
2. Confirm Interaction lifecycle applies to their assets.
3. Run TR-1…TR-6 with specialty content substituted (angels, protocols, clocks, causes…).
4. Extend Activation Desk with protocol panel **without** new interaction philosophy.
5. Certify specialty only after TR-6 gates.

## 9.2 What changes per specialty

| Changes | Examples |
|---------|----------|
| Catalogs | Angels, protocols, MAP tools |
| Optional moments weight | Protocol-first paths |
| Knowledge packs | Protocol steps, angel lore |
| Report sections | Protocol trail |

## 9.3 What never changes

- Authority hierarchy
- Desk metaphor
- Identify → Work grammar for activatable assets
- Soft freedom
- Report as accumulation + approval
- This Master Plan’s phase structure

## 9.4 Anti-pattern for future teams

Do **not** create “MAP Workspace v2” or “Protocol App Mode” as a separate product interaction model.

Adapt content into the same desks and phases.

---

# 10. Recommended Execution Order (summary)

```text
Lock authorities (done)
  → TR-1 Preparation
  → TR-2 Connection
  → TR-3 Diagnosis   ★ critical
  → TR-4 Activation  ★ critical
  → TR-5 Closing
  → TR-6 Report Review
  → Specialty certification (Mesa 35)
  → Repeat TR-1…TR-6 content adaptation (Mesa 49, MAP, …)
```

CX workstreams advance continuously under the same gates.

---

# 11. Document Control

| Item | Value |
|------|-------|
| Path | `docs/Experience/RADIONICS_THERAPEUTIC_WORKSPACE_RECONSTRUCTION_MASTER_PLAN.md` |
| Role | **Canonical execution plan** for rebuilding the Therapeutic Workspace |
| Does not authorise | Immediate coding in this task |
| Updates | Progress Matrix statuses as phases gate; no silent scope creep |

---

**End of Master Plan.**

Reconstruction succeeds only when a therapist can work a full session and say: *the software followed me—and the report already knew what I lived.*
