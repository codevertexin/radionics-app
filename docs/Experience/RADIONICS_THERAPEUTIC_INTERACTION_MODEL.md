# RADIONICS — Therapeutic Interaction Model

**Type:** Experience Interaction Architecture Authority
**Status:** Canonical — documentation only
**Date:** 2026-08-03
**Role:** Bridge between Therapeutic Workspace Experience and Workflow Engine
**Complements (does not replace):** `docs/Experience/RADIONICS_THERAPEUTIC_WORKSPACE_EXPERIENCE.md`
**Authority order:** Methodology → Workspace Experience → **this Interaction Model** → Workflow Engine → Workspace presentation → Reports

---

## How to read this document

| Document | Answers |
|----------|---------|
| **Therapeutic Workspace Experience** | *What should the therapist feel and live across the whole session?* |
| **Therapeutic Interaction Model (this)** | *How does each interaction, decision, asset lifecycle and transition behave?* |
| **Workflow Engine** | *How are those behaviours ordered, conditioned and stored for a speciality?* |

This document defines **interaction semantics**.
It does **not** define code, SQL, components, hooks, services or UI implementation.

No future Workspace work may invent interaction patterns that contradict this model.

---

# 1. Purpose of the Interaction Model

The Therapeutic Workspace Experience describes the **journey**.

This Interaction Model describes the **grammar of action**.

It exists so that:

- every graph/asset behaves the same way across specialities
- therapist decisions are unambiguous
- script reading is a first-class therapeutic moment
- protocols fit the same grammar without a second product
- notes accumulate into the report without a second writing job
- navigation follows the therapist instead of forcing “Next”
- Workflow Engine steps map cleanly onto experience moments

The application **records interactions**.
It never replaces the clinical act behind them.

---

# 2. Interaction Philosophy

## 2.1 Core stance

| Principle | Interaction consequence |
|-----------|-------------------------|
| Methodology wins | Interaction vocabulary comes from therapy, not forms |
| Desk, not form | Actions are “work with this”, not “submit page” |
| Knowledge assists | Scripts and explanations appear; they do not auto-complete |
| Therapist decides | Every clinical state change is an explicit therapist act |
| Software disappears | Deep work moments minimise chrome and interruption |
| Report is consequence | Interactions leave truthful seeds; report compiles later |
| Soft freedom | Skip, pause, return and reassess are always valid |

## 2.2 Interaction unit

The atomic clinical unit of interaction is the **Asset Encounter**.

An asset may be a graph, chakra, angel, protocol-linked tool, or other methodology object.

The therapist either:

1. **encounters** it (opens / focuses), then
2. **decides** about it, then
3. optionally **works** it, then
4. **closes** that encounter

Session progression is a sequence of encounters, measurements, rituals and notes—not a forced tour of every catalog item.

## 2.3 Three interaction planes

Every moment lives on one primary plane:

| Plane | Nature | Examples |
|-------|--------|----------|
| **Orientation** | Context and readiness | Intention, mode, testimony readiness |
| **Analysis** | Enquiry and decision | Graph analysis, identify / discard |
| **Work** | Energetic action and confirmation | Script reading, activation, protocol steps |
| **Closure** | Measurement closing, aftercare, ritual end | Final Hawkins, reverberation, disconnect |
| **Reflection** | Review of accumulated truth | Report review, final notes polish |

Planes may overlap lightly (e.g. a note during work), but the **primary plane** must stay clear so the therapist never feels lost between “analysing” and “activating”.

---

# 3. Session Interaction Lifecycle (macro)

High-level progression of interaction modes:

```text
Orientation
  → Ritual readiness (optional)
  → Connection confirmation
  → Initial measurement (when method uses it)
  → Analysis encounters (selective)
  → Work encounters (identified set)
  → Optional specialty work (chakras / protocols)
  → Final measurement
  → Aftercare + closing rituals
  → Final notes
  → Report review / approval
  → Session complete or pause
```

This is **semantic order**, not a hard gate machine.
The therapist may return upstream (e.g. re-open analysis after starting work) unless a speciality explicitly documents a rare hard rule—and even then soft skip remains preferred.

---

# 4. Asset Lifecycle (canonical)

Applies to graphs and analogous activatable assets.

## 4.1 Lifecycle states

| State | Meaning |
|-------|---------|
| **dormant** | In catalog; not currently encountered |
| **encountered** | Opened / focused for analysis |
| **not_needed** | Therapist decided: no work today |
| **identified** | Therapist decided: needs work |
| **ready_for_work** | Identified and available on Activation Desk |
| **script_present** | Knowledge provides activation text |
| **script_unavailable** | No orienting text; work still allowed |
| **in_activation** | Therapist is performing the energetic act |
| **activated** | Therapist confirmed work done |
| **reassessed_skipped** | Was identified; therapist later chose not to activate |
| **revisited** | Re-opened after a prior decision (state may change) |

States are **clinical memory**, not software trophies.

## 4.2 Canonical lifecycle flow

```text
dormant
  → encounter (Analysis)
      → not_needed
      OR identified (+ optional interpretation + optional intensity)
         → ready_for_work
            → read script (if present) / note absence
            → perform energetic work (outside software)
            → confirm activated (+ observation)
            OR reassessed_skipped
```

## 4.3 Forbidden collapses

| Forbidden collapse | Why |
|--------------------|-----|
| dormant → activated in one opaque click | Erases analysis and interpretation |
| identified without therapist act | Software deciding |
| activated without opportunity to see script when script exists | Knowledge disdain |
| forcing every dormant asset through encounter | False completeness |

Express / abbreviated session types may **invite** shorter paths, but must still preserve identifiable decision moments (at least identify vs not needed vs activate confirmation).

---

# 5. Moment Model Template

Every therapeutic moment below uses the same schema:

- **Purpose**
- **Therapist actions**
- **Application behaviour**
- **Knowledge presented**
- **Information recorded**
- **Possible next actions**
- **Exit conditions**

“Application behaviour” means experiential behaviour—not implementation.

---

# 6. Orientation Moments

---

## 6.1 Session orientation

### Purpose
Place the therapist and client in a recoverable professional container.

### Therapist actions
Confirm client, speciality, and session mode; enter the desk.

### Application behaviour
Presents human identity of client and methodology; avoids engine jargon; opens Orientation plane calmly.

### Knowledge presented
Optional speciality overview; mode guidance.

### Information recorded
Client, speciality, mode, professional context, session opened/resumed timestamps.

### Possible next actions
Define intention; prepare environment; pause.

### Exit conditions
Therapist acknowledges orientation is sufficient to proceed, or pauses.

---

## 6.2 Intention setting

### Purpose
Orient the therapeutic North of the session.

### Therapist actions
Select intention domains when useful; write/dictate formulation; refine while still in Orientation.

### Application behaviour
Keeps domains + formulation co-present; allows edit early; may show intention as light recall later without nagging.

### Knowledge presented
Domain meanings; soft memory aids only (never auto-identified assets).

### Information recorded
Domains, formulation, timing of last edit.

### Possible next actions
Environment readiness; opening ritual; connection.

### Exit conditions
Therapist leaves intention as “good enough for now” (empty formulation allowed with soft awareness, never hard block by default).

---

## 6.3 Environment and opening readiness

### Purpose
Mark physical/subtle readiness and optional opening prayer.

### Therapist actions
Prepare environment; optionally perform opening prayer; mark done or skip.

### Application behaviour
Offers soft checklist language; never walls progress; prayer text available when knowledge exists.

### Knowledge presented
Opening formulas / environmental notes from methodology materials.

### Information recorded
Environment ready / skipped; opening ritual done / skipped; optional note.

### Possible next actions
Connection desk; pause.

### Exit conditions
Therapist proceeds with or without markers.

---

# 7. Connection Moments

---

## 7.1 Connection establishment

### Purpose
Establish and confirm the energetic link with the client field / mesa.

### Therapist actions
Activate table; establish link; sense stability; confirm or note difficulty.

### Application behaviour
Uses human confirmations (“mesa activada”, “cliente conectado”); holds space for observation; does not gamify connection.

### Knowledge presented
Optional connection practice notes.

### Information recorded
Connection outcomes; connection notes.

### Possible next actions
Initial measurement; begin diagnosis; return to intention; pause.

### Exit conditions
Therapist confirms connection state (yes / partial / skipped with note) and leaves Connection plane.

---

# 8. Measurement Moments

---

## 8.1 Initial energetic assessment

### Purpose
Record starting reference measurement when the methodology uses it.

### Therapist actions
Measure; optionally attach descriptive label of the scale language.

### Application behaviour
Presents measurement desk clearly; stores baseline for later comparison; does not moralise the number.

### Knowledge presented
Scale meanings.

### Information recorded
Initial value; optional label; time.

### Possible next actions
Enter Diagnosis Desk; pause.

### Exit conditions
Therapist records a value, or consciously skips measurement for this session type.

---

## 8.2 Final energetic assessment

### Purpose
Close the measurement arc.

### Therapist actions
Measure final reference; optionally note qualitative change.

### Application behaviour
Recalls initial value beside final; invites therapist-authored evolution sense without inventing it.

### Knowledge presented
Scale meanings.

### Information recorded
Final value; optional label; optional evolution note.

### Possible next actions
Reverberation; closing rituals; final notes; report preview.

### Exit conditions
Value recorded or consciously skipped.

---

# 9. Analysis Moments (Diagnosis Desk)

---

## 9.1 Enter analysis mode

### Purpose
Open the symbol board for enquiry.

### Therapist actions
Enter Diagnosis Desk; choose focus (full sweep or selective path).

### Application behaviour
Shows methodology catalog visually; status filters as memory aids; no forced queue through every item.

### Knowledge presented
None forced until an asset is encountered.

### Information recorded
Entry into analysis mode (progress memory only).

### Possible next actions
Encounter an asset; take initial measurement if not done; open chakra analysis section; leave to Activation if worklist already exists; pause.

### Exit conditions
Therapist leaves desk freely; analysis need not be “complete”.

---

## 9.2 Asset encounter (analysis)

### Purpose
Focus one asset for enquiry.

### Therapist actions
Open asset; look; sense; optionally read knowledge.

### Application behaviour
Centres the symbol; places knowledge nearby without covering the clinical act; exposes Identify / Not needed (and leave open).

### Knowledge presented
What it is; client-safe explanation; recommended use; activation preview optional.

### Information recorded
Encounter opened (optional); no clinical decision until explicit act.

### Possible next actions
Identify; mark not needed; leave as not analysed; open notes; close encounter.

### Exit conditions
Therapist closes encounter with a decision or leaves undecided (dormant/not analysed).

---

## 9.3 Discard / not needed

### Purpose
Close enquiry without creating work.

### Therapist actions
Mark not needed; optional brief reason.

### Application behaviour
Records discard without shame; asset returns to catalog with clear status.

### Knowledge presented
Unchanged.

### Information recorded
Status not_needed; optional reason; time.

### Possible next actions
Next asset; leave diagnosis; jump to activation of prior worklist.

### Exit conditions
Decision recorded.

---

## 9.4 Identify

### Purpose
Declare that this asset requires work.

### Therapist actions
Mark identified; optionally set intensity; preferably add interpretation.

### Application behaviour
Moves asset into worklist semantics; keeps interpretation space adjacent; soft-encourages interpretation without hard-blocking experienced therapists by default (speciality policy may strengthen).

### Knowledge presented
Same as encounter; interpretation language aids optional.

### Information recorded
Status identified; intensity; interpretation / voice note; time.

### Possible next actions
Continue analysis; go to Activation Desk for this item; pause.

### Exit conditions
Identification recorded.

---

## 9.5 Interpret identified asset

### Purpose
Attach human meaning to a hit.

### Therapist actions
Dictate or write interpretation; refine later if needed.

### Application behaviour
Keeps interpretation editable; distinguishes private vs client-facing when that partition exists.

### Knowledge presented
Optional “what to tell the client” as language support only.

### Information recorded
Interpretation text / voice artefacts.

### Possible next actions
Continue analysis; begin activation of this asset; pause.

### Exit conditions
Therapist stops editing; empty interpretation remains possible unless speciality soft-requires it.

---

# 10. Work Moments (Activation Desk)

---

## 10.1 Enter work mode

### Purpose
Work only what was found necessary.

### Therapist actions
Open Activation Desk; review pending identified assets.

### Application behaviour
Shows identified / pending / activated sets; does not re-show whole catalog as primary; allows return to diagnosis.

### Knowledge presented
Per-item scripts when opened.

### Information recorded
Work mode focus.

### Possible next actions
Open an activation encounter; return to diagnosis; pause.

### Exit conditions
Therapist leaves with pending items allowed.

---

## 10.2 Activation encounter — script reading

### Purpose
Bring methodology voice into the work before/while performing it.

### Therapist actions
Read script; adapt client name mentally; decide to proceed or reassess.

### Application behaviour
Presents script as primary readable content with symbol present; if missing, shows friendly unavailability without blocking; never invents script text.

### Knowledge presented
Official activation script; provenance when useful.

### Information recorded
Script availability; optional sense that script was reviewed (non-punitive).

### Possible next actions
Perform work; confirm activation; skip/reassess; open another item.

### Exit conditions
Therapist proceeds to perform/confirm, or leaves encounter.

---

## 10.3 Activation encounter — perform energetic work

### Purpose
Real clinical act in the field (outside the application).

### Therapist actions
Speak / channel / apply; observe field response; take necessary time.

### Application behaviour
Stays quiet; keeps script visible; offers no fake “energy completion” timer; waits for therapist confirmation readiness.

### Knowledge presented
Script + symbol remain available.

### Information recorded
None automatic about field success.

### Possible next actions
Confirm activation; add observation; abort/reassess.

### Exit conditions
Therapist decides the act is finished enough to confirm—or abandons.

---

## 10.4 Activation encounter — confirm

### Purpose
Register completed work.

### Therapist actions
Confirm activated; add observation; optionally note intensity adjustments.

### Application behaviour
Marks activated; advances gently to next pending item; preserves observation.

### Knowledge presented
Optional only.

### Information recorded
Activated status; observation; optional timestamp; script reference conceptually.

### Possible next actions
Next pending; return to diagnosis; closing plane; pause.

### Exit conditions
Confirmation recorded (or reassessed skip recorded).

---

## 10.5 Reassess skip from worklist

### Purpose
Allow change of mind after identification.

### Therapist actions
Mark skip from worklist with optional reason.

### Application behaviour
Removes pressure; keeps history of prior identification if useful for honesty in report (identified but not activated).

### Knowledge presented
Unchanged.

### Information recorded
reassessed_skipped; reason optional.

### Possible next actions
Next pending; diagnosis; closing.

### Exit conditions
Skip recorded.

---

# 11. Specialty Extension Moments

These use the same grammar; content changes by speciality.

---

## 11.1 Chakra work

### Purpose
Analyse and/or activate energy centres when method uses them.

### Therapist actions
Select centres; interpret if needed; read chakra scripts; confirm work.

### Application behaviour
Presents chakra as a desk section, not an engineering sub-label; same identify/work semantics where activation applies.

### Knowledge presented
Functions, imbalances, activation formulas.

### Information recorded
Selected/activated centres; notes.

### Possible next actions
Return to graphs; closing; pause.

### Exit conditions
Therapist leaves chakra section with current decisions.

---

## 11.2 Protocol-assisted work

### Purpose
Follow a packaged therapeutic protocol when speciality practice calls for it.

### Therapist actions
Choose protocol or skip; follow guidance steps at human pace; work linked assets with normal activation grammar.

### Application behaviour
Keeps protocol inside the desk metaphor (guidance + linked assets); never switches into a disconnected “other app”; protocol steps are guidance, not automatic completion.

### Knowledge presented
Why activate; ordered guidance; linked assets; scripts of linked assets.

### Information recorded
Selected protocol; guidance progress marks when therapist chooses; linked activations.

### Possible next actions
Continue protocol; jump to a linked activation; abandon protocol; closing.

### Exit conditions
Protocol completed, abandoned, or paused mid-guidance.

---

# 12. Closure Moments

---

## 12.1 Reverberation and aftercare

### Purpose
Define integration period and recommendations.

### Therapist actions
Choose reverberation; write recommendations.

### Application behaviour
Offers common periods as soft options; free custom allowed; recommendations field always available.

### Knowledge presented
Specialty aftercare notes when available.

### Information recorded
Reverberation period; recommendations.

### Possible next actions
Closing rituals; final notes; report review.

### Exit conditions
Therapist accepts aftercare as set (or deferred).

---

## 12.2 Closing prayer and disconnection

### Purpose
Ethical/spiritual closure and break of link.

### Therapist actions
Perform closing prayer; break connection; mark done or skip.

### Application behaviour
Soft ritual confirmations; prayer text when known; no forced theatre.

### Knowledge presented
Closing formulas; disconnection notes.

### Information recorded
Closing prayer done/skip; disconnect done/skip; optional notes.

### Possible next actions
Final notes; report review; complete/pause.

### Exit conditions
Therapist leaves Closure rituals.

---

## 12.3 Final notes

### Purpose
Capture closing clinical impressions.

### Therapist actions
Dictate/write final notes; separate private vs shareable when available.

### Application behaviour
Low-friction notes; preserves partitions.

### Knowledge presented
None forced.

### Information recorded
Final notes with visibility partition.

### Possible next actions
Report review; complete; pause.

### Exit conditions
Therapist stops editing.

---

# 13. Report Accumulation & Review

---

## 13.1 Continuous accumulation (interaction rule)

Every meaningful decision and note **already is** report material.

| Interaction | Accumulates into |
|-------------|------------------|
| Intention | Objective |
| Initial/final measurement | Measurement arc |
| Identify + interpretation | Identified section |
| Not needed | Optional compact discard summary |
| Activate + observation | Activated section |
| Protocol selection | Protocol section |
| Chakras | Chakra section |
| Reverberation + recommendations | Aftercare |
| Final notes | Summary seeds / private appendix |

Accumulation is **silent**.
The therapist should not be asked to “write the report” while activating.

---

## 13.2 Report review moment

### Purpose
Human approval of compiled truth.

### Therapist actions
Read draft; edit client language; withhold private material; approve or return to desks.

### Application behaviour
Shows compilation of recorded reality; never invents missing findings; approval makes report final.

### Knowledge presented
None beyond session truth.

### Information recorded
Approval state; edited client-facing text where allowed.

### Possible next actions
Approve; return to closing/activation/diagnosis to fix reality; pause.

### Exit conditions
Approved final report, or explicit deferral.

---

# 14. Therapeutic Notes Model

## 14.1 Note kinds

| Kind | When | Report tendency |
|------|------|-----------------|
| **Interpretation** | After identify | Often client-facing (edited) |
| **Activation observation** | After confirm | Often client-facing or semi |
| **Connection note** | Connection | Usually private |
| **Final note** | Closing | Summary / private split |
| **Ritual note** | Opening/closing | Usually private |
| **Free session note** | Anytime | Partitioned |

## 14.2 Interaction rules for notes

- Notes are always optional unless a speciality soft-requires interpretation on identify.
- Voice dictation is a first-class capture path when available.
- Editing later is allowed; history honesty preferred over lock-down.
- Private notes never leak into client report without therapist action.

---

# 15. Session Progression Rules

## 15.1 Progress is memory, not a prison

Progress exists so the therapist can resume.

Progress must not:

- shame incomplete catalogs
- block closing when the therapist is clinically done
- invent “mandatory next” that methodology does not require

## 15.2 Soft guidance signals (allowed)

- “3 activations pending”
- “Initial measurement not recorded”
- “Intention formulation empty”

Always dismissible; never moralising.

## 15.3 Hard blocks (rare)

Hard blocks are discouraged.

If a speciality later requires a rare hard block, it must be:

- methodology-documented
- explained in human language
- escapable via explicit clinical override / skip with reason

## 15.4 Bidirectional movement

Allowed by default:

- Diagnosis ↔ Activation
- Closing → earlier desks to correct truth before report approval
- Pause anywhere

---

# 16. Navigation Principles

## 16.1 Navigation serves attention

Navigation answers: *Where is my desk?*
Not: *Which wizard step am I on?*

## 16.2 Human labels only

Therapist-facing navigation uses experience language:

Preparation · Connection · Diagnosis · Activations/Work · Closing · Report review

Never: step codes, engine versions, adapter ids.

## 16.3 No “Next” tyranny

Primary motion is:

- choose desk
- choose encounter
- decide
- leave

Optional “continue to next pending activation” is helpful.
Mandatory linear Next is not.

## 16.4 Resume contract

On return, the application restores:

- last desk
- last open encounter if safe
- pending work memory
- intention and measurements

without forcing a restart of rituals already marked done.

---

# 17. UX Principles Specific to Interaction

These refine the Experience document into interaction UX law:

1. **One primary decision per encounter surface.**
2. **Symbol first, chrome second.**
3. **Script is content, not a tooltip.**
4. **Status language is clinical** (identified / not needed / activated), not bureaucratic.
5. **Empty states teach freedom** (“nothing pending” is success, not failure).
6. **Catalog size never becomes obligation.**
7. **Errors are about saving/memory**, never about “wrong therapy”.
8. **Latency may never invent knowledge.**
9. **Express modes shorten optional rituals; they do not erase identify→work grammar.**
10. **Accessibility of reading scripts matters as much as aesthetics.**

---

# 18. Therapist Decisions — Interaction Contract

| Decision | Preconditions | Immediate effect | Downstream effect |
|----------|---------------|------------------|-------------------|
| Encounter asset | In analysis | Focus knowledge + actions | May decide |
| Not needed | Encountered | Leave worklist | Report discard optional |
| Identify | Encountered | Enter worklist | Activation available |
| Interpret | Identified (or during) | Meaning attached | Report substance |
| Intensity | Identified | Qualitative weight | Report/history optional |
| Read script | In activation encounter | Prepared formula | Knowledge respect |
| Confirm activated | Identified (usually) | Work complete | Report activated |
| Reassess skip | Identified pending | Remove from pending | Report honesty |
| Select protocol | Specialty allows | Guidance opens | Protocol section |
| Skip protocol | Specialty allows | No protocol trail | — |
| Select chakra | Specialty allows | Chakra work path | Chakra section |
| Set reverberation | Closing | Aftercare set | Report aftercare |
| Approve report | Accumulation exists | Final artefact | Session reported |

---

# 19. Mapping Bridge: Experience → Interaction → Workflow → Workspace → Report

```text
Therapeutic Workspace Experience
        ↓ (journey & desks)
Therapeutic Interaction Model  ← YOU ARE HERE
        ↓ (semantics of acts & states)
Workflow Engine
        ↓ (order, conditions, persisted outcomes)
Workspace presentation
        ↓ (human desks & encounters)
Report compilation + approval
```

| Interaction concept | Workflow Engine responsibility | Workspace presentation responsibility | Report responsibility |
|---------------------|--------------------------------|----------------------------------------|------------------------|
| Asset lifecycle states | Persist outcomes per step/tool | Show states & actions | List identified/activated |
| Script reading moment | May record script_id / reviewed sense | Present script text | Optional citation |
| Protocol guidance | Protocol step type + selected id | Guidance panel + linked assets | Protocol section |
| Soft progression | Optional completion hints | Human pending language | — |
| Bidirectional navigation | Allow step revisit | Desk switching | Draft updates |
| Report approval | Report consequence flag | Review surface | Final lock |

Workflow Engine **implements** this model.
It does not redefine it.

---

# 20. Consistency Rules Across Specialities

| Must stay constant | May vary |
|--------------------|----------|
| Identify-before-activate grammar for activatable assets | Which assets exist |
| Knowledge never invented | Which scripts/protocols exist |
| Soft skip freedom | Which rituals are emphasized |
| Silent report accumulation | Which report sections appear |
| Desk metaphor | Desk tool panels |
| Human navigation labels | Measurement tool used |
| Therapist owns decisions | Optional soft-requirements |

---

# 21. Things Interaction Must Never Become

| Anti-pattern | Replace with |
|--------------|--------------|
| Form wizard of mandatory fields | Desk encounters |
| One-click select=activate | Identify → script → confirm |
| Forced completion of all assets | Selective analysis |
| Engine codes in UI | Therapeutic language |
| Report written from scratch after session | Accumulation + review |
| Protocol as separate product mode | Protocol panel inside work plane |
| Blocking “Next” | Free desk movement |
| Auto-diagnosis | Therapist decisions only |

---

# 22. Document Control

| Item | Value |
|------|-------|
| Path | `docs/Experience/RADIONICS_THERAPEUTIC_INTERACTION_MODEL.md` |
| Complements | `RADIONICS_THERAPEUTIC_WORKSPACE_EXPERIENCE.md` |
| Does not replace | Experience authority document |
| Implementation | Out of scope here |
| Use | Canonical interaction contract for all future Workspace / Workflow binding |

---

**End of Interaction Model.**

If an implementation cannot point each clinical click to a moment and lifecycle state in this document, it is not ready for the Therapeutic Workspace.
