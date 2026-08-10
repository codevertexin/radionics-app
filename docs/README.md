# RADIONICS Documentation

This directory contains the canonical documentation for the RADIONICS platform.

Documentation is organised by architectural responsibility rather than by implementation date.

---

# Documentation hierarchy

The platform follows the following authority hierarchy:

```
Vision
        ↓
Therapeutic Methodology
        ↓
Therapeutic Experience
        ↓
Architecture Decisions (ADR)
        ↓
Workflow / Session / Report Engines
        ↓
Frontend
        ↓
Implementation
```

Whenever documents disagree, the document higher in the hierarchy takes precedence.

---

# Folder structure

## Architecture

Architectural Decisions (ADR) and cross-cutting architectural documents.

These documents explain *why* decisions were made.

---

## Experience

Canonical therapist experience.

Defines how a therapeutic session should be experienced.

Never defines implementation.

---

## Engine

Execution engines that implement the therapeutic experience.

Examples:

- Session Engine
- Workflow Engine
- Report Engine
- Resources Engine

---

## Frontend

Frontend architecture and UI technical contracts.

---

## Infrastructure

Database, authentication, persistence, Supabase and technical infrastructure.

---

## Knowledge

Therapeutic knowledge.

Methodologies, protocols, scripts, educational materials and other knowledge assets.

---

## Vision

Product vision and long-term direction.

---

## Legacy

Historical documentation retained for reference.

New development should not use these documents unless explicitly referenced.

---

# Design Principles

The platform follows four fundamental principles.

1. Methodology wins.
2. Experience wins over implementation.
3. The software supports the therapist but never replaces therapeutic judgement.
4. Reports are the consequence of the therapeutic session, never its driver.

---

# Canonical documents

The following documents define the platform:

- Product Vision
- Therapeutic Methodology
- Therapeutic Workspace Experience
- Architecture Decision Records (ADR)
- Workflow Engine
- Session Engine
- Report Engine

# Reading Order

Anyone working on RADIONICS should read the documentation in the following order.

1. Business
   - Product Vision
   - Product Boundaries

2. Experience
   - Therapeutic Workspace Experience

3. Architecture
   - ADR
   - Architectural Decisions

4. Engine
   - Methodology
   - Workflow
   - Session
   - Resources
   - Report

5. Frontend

6. Infrastructure

# Folder Responsibilities

| Folder | Responsibility |
|---------|----------------|
| Business | Why the product exists |
| Experience | How therapy should be experienced |
| Architecture | Why architectural decisions exist |
| Engine | How the platform executes therapy |
| Frontend | UI implementation |
| Infrastructure | Technical platform |
| Knowledge | Therapeutic source material |
| Research | Investigations and architectural studies |
| Legacy | Historical reference only |
