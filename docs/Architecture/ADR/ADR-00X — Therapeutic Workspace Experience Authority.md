ADR-00X — Therapeutic Workspace Experience Authority

Status: Accepted

Date: 2026-08-03

Decision Authority: CodeVertex Innovations, LLC

Context

The RADIONICS platform evolved through successive architectural layers:

Domain Model
Methodology Engine
Knowledge Layer
Resources
Materials Library
Workflow Engine

During the first complete implementation of the Session Workspace it became clear that a technically correct architecture does not automatically reproduce the real therapeutic methodology.

A Therapeutic Alignment Review concluded that the Workspace represented approximately half of the real therapeutic experience.

The missing authority was not technical.

It was experiential.

To resolve this, the document

RADIONICS_THERAPEUTIC_WORKSPACE_EXPERIENCE.md

was created as the canonical description of how a therapist experiences a therapeutic session inside the platform.

Decision

The document

RADIONICS_THERAPEUTIC_WORKSPACE_EXPERIENCE.md

becomes the canonical authority for every Workspace evolution.

Whenever implementation, architecture or UI conflict with the experience document:

the experience document wins.

Authority hierarchy
Vision

↓

Therapeutic Methodology

↓

Therapeutic Workspace Experience

↓

Workflow Engine

↓

Workspace UI

↓

Implementation

The Therapeutic Workspace Experience translates methodology into therapist experience.

The Workflow Engine implements that experience.

The Workspace presents that experience.

The Report summarizes that experience.

Responsibilities
Therapeutic Methodology

Defines:

therapeutic practice
rituals
concepts
language
meaning

Never defines software.

Therapeutic Workspace Experience

Defines:

therapist journey
therapeutic desks
interaction model
experience principles
therapist decisions
report philosophy

Never defines implementation.

Workflow Engine

Defines:

execution order
optional paths
conditions
workflow outputs

Never changes therapeutic meaning.

Workspace

Defines:

presentation
ergonomics
navigation
visual language

Never invents therapeutic behaviour.

Reports

Define:

compilation
review
rendering

Never create therapeutic conclusions.

Architectural consequences

Future implementation work must begin by validating the Therapeutic Workspace Experience.

Engineering must never optimise the experience away for implementation convenience.

Every Workspace feature shall first answer:

Does this faithfully represent the therapist's real work?

Only afterwards:

How should it be implemented?

Acceptance criteria

A Workspace implementation is considered correct only if:

it follows the therapeutic methodology;
it follows the Therapeutic Workspace Experience;
it preserves therapist authority;
it uses the Workflow Engine only as an execution layer;
it treats reports as the consequence of the session.
Consequences

This ADR establishes a permanent separation between:

Therapeutic Experience

and

Technical Implementation.

Future specialties (Mesa 49, MAP and others) shall extend the same experience grammar instead of introducing new interaction paradigms.

Related documents
Vision
Therapeutic Methodology
RADIONICS_THERAPEUTIC_WORKSPACE_EXPERIENCE.md
RADIONICS_WORKFLOW_THERAPEUTIC_ALIGNMENT_REVIEW.md
Workflow Engine documentation
Workspace Architecture