# AGENTS.md

# RADIONICS Repository Guidelines

> **Internal Product Motto**

> **Build Resources. Compose Methodologies. Empower Therapists.**

## Mission

The purpose of this repository is to build RADIONICS as a long-term therapeutic platform.

Every implementation must strengthen the therapist's real workflow rather than introducing unnecessary software complexity.

The platform must always adapt to therapeutic practice.

Therapeutic practice must never adapt to the platform.

---

# Authority Hierarchy

The authority hierarchy is mandatory.

Lower-level documents may extend higher-level documents but must never contradict them.

Every AI coding agent working in this repository must respect the following authority order.

1. Product Vision & Experience Constitution
2. Platform UX Backlog
3. Product Decisions
4. Approved Canonical Product Experience Documents
5. Approved Product Implementation Readiness Documents
6. Methodology Experience Backlogs
7. Implementation Tasks

For Platform Session work, the following approved documents are mandatory:

- Product/03_Platform_Session_Experience.md
- Product/04_Platform_Session_Implementation_Readiness.md

Whenever two documents conflict, the document with the highest authority prevails.

No implementation may contradict the Product Constitution.

Product Constitution

↓

Platform UX Backlog

↓

Product Decisions

↓

Methodology Experience Backlogs

↓

Current Sprint

↓

Implementation Tasks

---

# Repository Structure

The repository is intentionally divided into two independent domains.

## Product

Defines the platform.

Examples:

- Product Constitution
- Platform UX Backlog
- Product Decisions

These documents describe reusable platform capabilities.

They never describe methodology-specific behavior.

---

## Methodologies

Each therapeutic methodology owns its own documentation.

Each methodology defines:

- therapeutic flow
- experience backlog
- methodology resources
- implementation priorities

Methodologies consume platform capabilities.

They never redefine platform behavior.

---

# Working Method

Every implementation follows the same sequence.

Official Methodology

↓

Experience Design

↓

Implementation

↓

Validation

↓

Documentation

Implementation must never begin before the therapeutic experience has been understood.

---

# Think Before Coding

AI coding agents must understand the therapeutic workflow before proposing implementation.

If the workflow is unclear, implementation must stop until the experience has been clarified.

Never compensate for missing product decisions with technical assumptions.

---

# Scope Discipline

Platform capabilities belong to the platform.

Therapeutic behavior belongs to methodologies.

Whenever a change affects both, implement the platform capability first and then consume it from the methodology.

Avoid duplicating responsibilities across layers.

---

# Platform Session Architecture Boundaries

The permanent Platform Session domain is methodology-neutral.

Platform Session capabilities own:

- session lifecycle;
- client testimony context;
- Session Plan;
- methodology executions;
- notes;
- transcript boundaries;
- timeline;
- report contributions;
- canonical session archives;
- report-projection boundaries.

Methodologies operate through isolated Methodology Executions.

A session may contain multiple methodology executions, but no more than one execution may be active within the same session at any time.

Platform Session code must never import or encode methodology-specific therapeutic concepts such as Hawkins, chakras, graphs, angels, activations, diagnosis or reverberation.

Legacy session types and services may remain temporarily for compatibility. They must not redefine the canonical Platform Session contracts under:

`/src/platform/session`

Canonical session data must be preserved independently from report templates.

Report templates select, organize and present archived session information. They must never determine or mutate the canonical session archive.

Approved report renditions and sealed canonical session archives are immutable.

---

# Product Principles

Every implementation must respect the Product Constitution.

In particular:

• The therapist is the center.

• The session is the product.

• Simplicity reduces cognitive load.

• Voice before keyboard.

• Images before text.

• Never interrupt therapeutic flow.

• Technology remains in the background.

---

# UX Rules

Whenever possible:

• Prefer visual interaction.

• Prefer one-click actions.

• Prefer progressive disclosure.

• Avoid unnecessary dialogs.

• Keep therapists focused on the client.

---

# Documentation Rules

Platform documentation belongs under:

/docs/Product

Methodology documentation belongs under:

/docs/Methodologies

Platform documents must never describe methodology-specific workflows.

Methodology documents must never redefine platform behavior.

---

# Implementation Rules

Before implementing any feature:

1. Read the Product Constitution.

2. Read the relevant Platform UX capability.

3. Read the relevant approved Canonical Product Experience document.

4. Read the relevant approved Product Implementation Readiness document.

5. Read the relevant Methodology Experience Backlog when methodology behaviour is in scope.

Never implement assumptions that are not documented.

---

# Task Reports

Every completed task must contain:

Summary

Files Modified

Validation Performed

Limitations

Deferred Work

No hidden changes.

---

# Forbidden Changes

AI agents must never:

• redefine therapeutic methodologies;

• modify Product Constitution without explicit approval;

• introduce platform behavior inside methodology documents;

• implement undocumented assumptions;

• replace therapist decisions with automated decisions.

---

# Definition of Done

A task is only considered complete when:

• implementation is finished;

• validation succeeds;

• documentation is updated when required;

• therapeutic workflow has been preserved.

Passing tests alone never means the task is complete.

---

# Final Principle

Every decision should answer one question.

"Does this make the therapist's work feel more natural?"

If the answer is no, the implementation should be reconsidered.