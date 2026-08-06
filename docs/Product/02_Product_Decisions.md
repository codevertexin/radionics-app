---
title: RADIONICS — Product Decisions
document_id: RADIONICS-PRODUCT-DECISIONS
version: 1.1
status: APPROVED
classification: Canonical
owner: Product Owner
author: CodeVertex Innovations, LLC
last_updated: 2026-08-06
depends_on:
  - RADIONICS-PRODUCT-CONSTITUTION
language: English
---

# RADIONICS — Product Decisions

## Purpose

This document records long-term product decisions that have been formally approved.

Unlike discussions, these decisions are considered canonical until explicitly superseded.

Every implementation must respect these decisions.

---

## Update Policy

Only formally approved long-term product decisions may be added to this document.

Existing decisions must never be modified.

If a decision changes, it must be superseded by a new Product Decision while preserving the historical record.

---

# Decision Status

APPROVED

SUPERSEDED

DEPRECATED

---

## PD-001 — The Therapist is the Center

Status

APPROVED

Decision

The therapist is the primary user of RADIONICS.

Every feature must prioritize the therapist's workflow over technical convenience.

---

## PD-002 — One Primary Methodology per Session

Status

APPROVED

Decision

Every therapeutic session belongs to one primary methodology.

Complementary methodologies may be invoked during the session.

---

## PD-003 — Resources are Reusable

Status

APPROVED

Decision

Therapeutic resources are reusable building blocks shared across methodologies.

---

## PD-004 — Voice First

Status

APPROVED

Decision

Whenever speaking is more natural than typing, voice should be the preferred interaction.

---

## PD-005 — Images Before Text

Status

APPROVED

Decision

Whenever therapists naturally recognize physical tools visually, the interface should prioritize images.

---

## PD-006 — Live Report

Status

APPROVED

Decision

Reports are continuously built during the therapeutic session.

The therapist should never be required to recreate the session afterwards.

---

## PD-007 — Platform Before Methodology

Status

APPROVED

Decision

Platform capabilities are implemented independently from therapeutic methodologies.

Methodologies consume platform capabilities but do not define them.

---

## PD-008 — Product Development Sequence

Status

APPROVED

Decision

Every implementation follows:

Official Methodology

↓

Experience Design

↓

Implementation

↓

Validation

↓

Documentation

---

## PD-009 — Session Record and Report Projection Separation

Status

APPROVED

Decision

RADIONICS preserves the complete therapeutic session record independently from any Report Template.

Report Templates define how archived session information is selected, organized and presented. They never determine which canonical therapeutic data is preserved.

The therapist selects or confirms the Report Template at session closing or afterwards.

Changing a Report Template never changes the archived session record or previously approved reports.

Session Plans and Report Templates are separate product concepts.

Session Plans may organize session preparation and presentation, but they never limit canonical therapeutic data preservation or determine the final report structure.
