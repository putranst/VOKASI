# TSEA‑X T6 – CDIO + PKC Implementation Plan

## Objective

Elevate TSEA‑X from advanced MVP to production‑grade, CDIO+PKC‑centric infrastructure with verifiable credentials respected by universities and enterprises. [file:21][file:22]

---

## Workstream 1 – Architecture & Data Platform

**Goal:** Supabase as single source of truth; FastAPI as orchestration layer; clean separation of concerns. [file:22][file:23]

### Tasks

1. **Inventory and refactor data access**
   - List all REST endpoints still serving CRUD for courses, enrollments, projects, dashboards. [file:22]
   - For each, decide: “Supabase direct” vs “FastAPI orchestration”.

2. **Supabase‑first data access**
   - Update Student, Instructor, Institution dashboards to use Supabase client only (no REST) for reads/writes that touch single tables or simple joins. [file:22][file:23]
   - Remove in‑memory storage and legacy endpoints now replaced by Supabase. [file:22][file:23]

3. **Orchestration services in FastAPI**
   - Restrict FastAPI to: AI services, Cloud IDE execution, credential lifecycle, PKC exports, cross‑system workflows. [file:22][file:23]
   - Add a lightweight internal event model (e.g., `project_completed`, `credential_issued`) as FastAPI functions that can be called from frontend or Supabase triggers.

4. **Analytics foundation**
   - Create dedicated analytics tables or schemas (e.g., `learning_events`, `cdio_metrics`, `pkc_metrics`) in Supabase.
   - Implement minimal ETL jobs (cron or functions) to aggregate per‑course, per‑institution KPIs (completion, credential issuance, CDIO progression). [file:21][file:22]

---

## Workstream 2 – CDIO Flow Hardening

**Goal:** Make CDIO the explicit backbone of all learning flows and closely tie it to evidence and assessment. [file:21][file:22]

### Tasks

1. **CDIO phase enforcement**
   - Ensure `projects` always track `current_phase` and valid transitions (conceive → design → implement → operate). [file:22]
   - Add guards in frontend so learners cannot skip phases unless explicitly allowed by course config.

2. **Phase artefact completeness rules**
   - Define minimal artefact requirements per phase (e.g., charter + reflection for Conceive; blueprint + reasoning for Design). [file:21][file:22]
   - Implement checks before allowing transition to next phase; surface informative errors to learners.

3. **Rubric and evaluation model**
   - Add tables for `rubrics`, `rubric_criteria`, and `rubric_scores` keyed by course + CDIO phase.
   - Build instructor UI to define rubrics; wire Verification Engine and instructors’ reviews to populate scores. [file:21]

4. **Instructor oversight**
   - Extend Instructor Dashboard with per‑phase summary views (who is stuck where, quality indicators). [file:22][file:23]

---

## Workstream 3 – PKC (Personal Knowledge Container)

**Goal:** Turn PKC into the canonical learner record, automatically populated from CDIO, and consumable by credentials and AI. [file:21][file:23]

### Tasks

1. **PKC schema implementation**
   - Create `knowledge_nodes`, `knowledge_links`, `learning_journal`, `knowledge_exports` tables in Supabase. [file:23]
   - Implement full RLS so learners only see their own PKC; instructors see only evidence linked to their courses. [file:23]

2. **Auto‑capture from CDIO**
   - On charter submit → insert PKC node (`nodetype=question`, metadata: `project_id`, `cdio_phase=conceive`). [file:21][file:23]
   - On design blueprint submit → insert PKC node (`nodetype=concept`).
   - On implementation updates → insert PKC nodes (`nodetype=artifact`, link to repo/code snapshot).
   - On operate/verification → insert PKC node (`nodetype=artifact` or `reflection`) with verification summary. [file:21][file:23]

3. **Learning journal & PKC UI**
   - Build a “My PKC” page with: list view of nodes, daily journal component, search and basic filters. [file:23]
   - Add daily prompts on active days; auto‑link entries to recent projects and courses. [file:23]

4. **Knowledge graph & export (v1)**
   - Implement simple graph visualization (React Flow / D3) for nodes + links filtered by course or date. [file:23]
   - Implement Markdown and JSON exports for a learner’s PKC (course‑scoped and full account). [file:23]

---

## Workstream 4 – Credential & Blockchain Redesign

**Goal:** VC‑first credential model with optional SBTs, trusted by academia and business. [file:21][file:22]

### Tasks

1. **Credential data model**
   - Extend `credentials` table with fields for `vc_id`, `vc_status`, `evidence_package_id`, `issuer_id`. [file:22][file:23]
   - Define `evidence_packages` table pointing to PKC nodes and project artefacts used for each credential. [file:21]

2. **VC issuer service**
   - Implement a FastAPI service that, given `evidence_package_id` and `issuer_id`, creates and signs a W3C Verifiable Credential (JSON‑LD). [file:21]
   - Store the VC (encrypted) off‑chain and persist only hashes and IDs in Supabase.

3. **SBT integration (Polygon)**
   - Keep existing ERC‑721 SBT, but change minting flow so token metadata references VC ID + evidence hash, not raw data. [file:22]
   - Add opt‑in controls on learner side for SBT minting and public visibility.

4. **Verification and employer flows**
   - Update public verification portal to first validate VC (issuer signature, revocation status), then cross‑check SBT if present. [file:21][file:22]
   - Create an “Employer View” endpoint returning a compact, privacy‑preserving credential summary and selected evidence pointers. [file:21]

---

## Workstream 5 – Cloud IDE / Reality Engine

**Goal:** Production‑grade execution environment aligned with CDIO Implement and Operate phases. [file:21][file:22]

### Tasks

1. **Containerization**
   - Wrap the code execution service in Docker images per language/runtime. [file:22]
   - Deploy to K8s (or managed alternative) with per‑session pods, resource limits, and network policies.

2. **Execution flow**
   - Update `code_execute` endpoint to schedule work into containers instead of local subprocesses; include `project_id`, `user_id` for logging. [file:22]
   - Log execution metadata into Supabase (`language`, `duration`, `status`) for analytics and PKC enrichment.

3. **Operate & verification**
   - Implement “deploy” and “verify” buttons that trigger deployment to a sandbox environment and run automated tests. [file:21][file:22]
   - Store verification output as both deployment records and PKC nodes; trigger credential eligibility when all checks pass. [file:21]

---

## Workstream 6 – AI Orchestration (CDIO + PKC‑aware)

**Goal:** Use AI to support learners and instructors with full CDIO + PKC context. [file:21][file:22][file:23]

### Tasks

1. **Context model**
   - Define what context each AI agent can see: course syllabus, project state, last N PKC nodes, prior mistakes.
   - Implement RAG index over PKC + course materials in your vector DB for Socratic Tutor and future Code Co‑Pilot. [file:21][file:23]

2. **Socratic Tutor enhancements**
   - Add PKC‑based prompts (e.g., “you previously solved a similar problem; here’s a sanitized summary”). [file:21][file:23]
   - Log key interactions as PKC `reflection` or `concept` nodes.

3. **Instructor support**
   - Implement “AI course insights” panel: highlight common misconceptions per phase using aggregated PKC and CDIO data. [file:21][file:22]

---

## Workstream 7 – Governance, Security, and Compliance

**Goal:** Reach a posture acceptable to universities, enterprises, and governments. [file:21][file:22][file:23]

### Tasks

1. **Environments and CI/CD**
   - Set up dev, staging, and prod environments with separate Supabase projects and blockchain configs. [file:22]
   - Implement CI/CD (GitHub Actions) with tests for RLS policies, execution sandboxing, and credential flows. [file:22][file:23]

2. **Security & privacy**
   - Formalize and implement PKC data‑retention and deletion rules; ensure credentials remain verifiable when data is deleted where required. [file:21][file:23]
   - Commission external penetration test once K8s, Supabase, and blockchain are integrated; track and remediate findings.

3. **Governance**
   - Define roles and policies for issuers, reviewers, and admins; document in an internal “Governance Playbook”. [file:21]
   - Create an Academic Advisory Board and capture their requirements for assessment and credential validity. [file:21]

---

## Phasing & Timebox

You can run these as sequential sprints with overlapping workstreams. [file:22][file:23]

- **Sprint 1–2 (Weeks 1–4)**
  - Finish Supabase migration & remove legacy endpoints (WS1).
  - Implement CDIO enforcement rules (WS2).
  - Implement PKC schema + basic auto‑capture for Conceive/Design (WS3).

- **Sprint 3–4 (Weeks 5–8)**
  - Extend auto‑capture to Implement/Operate + PKC UI v1 (WS3).
  - Introduce evidence packages and VC issuer service (WS4).
  - Containerize Cloud IDE and integrate with K8s (WS5).

- **Sprint 5–6 (Weeks 9–12)**
  - Finish SBT integration with VC + evidence (WS4).
  - PKC graph + export features (WS3).
  - PKC‑aware AI enhancements and instructor insights (WS6).

- **Sprint 7–8 (Weeks 13–16)**
  - Governance, security hardening, and external audit (WS7).
  - Pilot with 1–2 institutions and a design partner company; integrate feedback across CDIO, PKC, and credentials. [file:21][file:22]
