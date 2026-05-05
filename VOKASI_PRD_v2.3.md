# VOKASI Platform PRD v2.3
## Brain-Based AI Capability Accelerator for Indonesian Vocational & Higher Education

**Document Version:** 2.3  
**Date:** 2026-04-30  
**Status:** Production-Ready Specification  
**Classification:** Internal - Product & Engineering

---

## 1. Executive Summary

VOKASI is an AI-native vocational education platform designed to build **demonstrable AI capabilities** rather than deliver passive course consumption. Targeting Indonesian SMK (vocational high schools), polytechnics, BLK (job training centers), and universities, VOKASI replaces the traditional "watch video → take quiz → get certificate" model with an **applied, iterative, and psychologically safe learning environment** aligned with brain-based learning science.

**Core Thesis:** In the AI age, information is cheap; judgment, contextual understanding, ethical reasoning, and adaptability are the true premiums. VOKASI builds these capabilities through real-work-anchored challenges, Socratic AI tutoring, competency portfolios, and failure-positive learning loops.

**Market Context:**
- Indonesia has 14,000+ SMKs, 150+ polytechnics, and 4,000+ higher education institutions serving 8M+ students annually.
- Government mandate (Merdeka Belajar Kampus Merdeka / MBKM) requires students to complete real-world projects and internships.
- AI adoption in Indonesian SMEs is accelerating, but talent capable of *judging* AI outputs—not just using tools—is critically scarce.

**Strategic Goal:** Become the definitive AI capability platform for Indonesian vocational and higher education, expanding to ASEAN Phase 2.

---

## 2. Product Vision & Positioning

### 2.1 Vision Statement
To build Indonesia's AI-ready workforce by making every learner capable of thinking critically with AI, not just operating it.

### 2.2 Positioning Statement
For Indonesian vocational students and university learners who need to develop judgment-based AI skills, VOKASI is the brain-based learning platform that builds transferable capabilities through real-world challenges and AI-powered Socratic tutoring—unlike conventional course platforms that optimize for completion rates and passive consumption.

### 2.3 Key Differentiators
1. **Capability over Completion:** Competency portfolios replace certificate walls.
2. **Applied over Theoretical:** Every module ties to authentic workplace scenarios.
3. **Iterative over Linear:** Spaced repetition, revisitable projects, and versioned submissions.
4. **Safe over Judgmental:** Sandbox experimentation and failure-positive culture.
5. **Socratic over Didactic:** AI tutoring probes reasoning, not recall.

---

## 3. Target Users & Personas

### 3.1 Primary Users

#### Persona A: SMK Student (Rina, 17)
- **Context:** Final-year SMK Teknik Komputer & Jaringan, preparing for internship.
- **Goal:** Learn practical AI skills (prompt engineering, basic automation) that make her internship-ready.
- **Pain Point:** Current school curriculum is 3 years behind industry; YouTube tutorials are fragmented and lack feedback.
- **VOKASI Value:** Short, applied challenges with AI tutor support; builds portfolio for job applications.

#### Persona B: Polytechnic Student (Budi, 21)
- **Context:** Semester 5 Politeknik Elektronika Negeri Surabaya, majoring in Data Engineering.
- **Goal:** Master MLOps and deploy real models for his capstone project.
- **Pain Point:** Lectures are theory-heavy; no access to GPU infrastructure or industry datasets.
- **VOKASI Value:** Cloud sandbox environments, real datasets, mentor feedback, and competency tracking for his e-Portfolio.

#### Persona C: University Non-Tech Student (Sari, 20)
- **Context:** Law student at Universitas Indonesia, interested in legal tech.
- **Goal:** Understand AI capabilities and limitations to evaluate AI-generated legal research.
- **Pain Point:** No accessible pathway to learn AI without coding prerequisites.
- **VOKASI Value:** "AI Fluency for Non-Tech" track focused on critical evaluation, not coding.

#### Persona D: Instructor / Dosen (Pak Adi, 45)
- **Context:** Lecturer at Politeknik Negeri Bandung, tasked with updating curriculum for AI integration.
- **Goal:** Deploy AI-enhanced coursework without building infrastructure from scratch.
- **Pain Point:** No time to create AI-ready case studies; difficulty tracking student applied skills.
- **VOKASI Value:** AI course generation, visual course builder, auto-graded open-ended challenges, and competency dashboards.

### 3.2 Secondary Users
- **Industry Mentors:** Provide async feedback on student projects.
- **University Administrators:** Track cohort competency trends for accreditation.
- **BLKK / Training Center Operators:** Deploy standardized AI upskilling programs.

---

## 4. Core Features & Functionalities

### 4.1 AI Challenge Arena
**Purpose:** Replace traditional quizzes with open-ended, judgment-building challenges.

**Functionality:**
- Weekly rotating challenges across domains: Prompt Engineering, Model Evaluation, Ethical AI, Data Analysis, Automation.
- Challenges have **no single correct answer**; scoring rubric evaluates:
  - Problem decomposition (30%)
  - Tool selection & usage (25%)
  - Output quality & critique (25%)
  - Reflection depth (20%)
- AI evaluator provides structured feedback within 60 seconds.
- Leaderboard ranks by reasoning depth (not speed), with anonymous handles to reduce social pressure.

**Example Challenge:**
> "A local fintech wants to use AI to screen loan applicants. You are given a dataset and a pre-trained model. Your task: (1) Evaluate the model for demographic bias, (2) Write a 200-word memo to the CTO explaining whether to deploy it, and (3) Suggest one alternative approach."

### 4.2 SocraticChat AI Tutor
**Purpose:** Build reasoning capability through dialogue, not information delivery.

**Functionality:**
- Powered by OpenRouter/Kimi API with system prompt engineered for Socratic questioning.
- **Modes:**
  - **Guide Mode:** Asks leading questions when student is stuck (never gives direct answers for conceptual challenges).
  - **Devil's Advocate Mode:** Challenges student assumptions to strengthen argumentation.
  - **Peer Mode:** Simulates a peer learner, encouraging collaborative explanation.
- **Context Awareness:** Accesses student's current project, past mistakes, and competency gaps to personalize questioning.
- **Voice & Text:** Supports Bahasa Indonesia and English; voice input for accessibility.

**Sample Interaction:**
> Student: "I think this model is accurate because it has 95% precision."  
> SocraticChat: "That's a strong number. But what if the dataset has 90% negative cases? What would precision tell you then, and what other metric might reveal a problem?"

### 4.3 Competency Portfolio System
**Purpose:** Demonstrate capabilities, not just course completions.

**Functionality:**
- Every student has a public/private portfolio URL (e.g., `vokasi.id/portfolio/rina-smk`).
- **Artifacts:**
  - Challenge submissions with AI feedback
  - Project versions (V1 → V2 → Final)
  - Reflection logs
  - Mentor endorsements
  - Peer collaboration records
- **Competency Heatmap:** Visual radar chart showing demonstrated skills across 12 dimensions:
  - Prompt Engineering, Model Evaluation, Data Ethics, Automation, Critical Thinking, Collaboration, Communication, Tool Fluency, Debugging, Domain Application, Continuous Learning, Teaching Others.
- **Export:** PDF portfolio and LinkedIn-integrated badge system.

### 4.4 Visual Course Builder (Puck-Based)
**Purpose:** Enable instructors to create brain-based learning experiences without coding.

**Functionality:**
- Drag-and-drop editor (Puck) for course structure.
- **Block Types:**
  - Video (max 7 minutes per segment, enforced)
  - Interactive Scenario (branching decision trees)
  - Code Sandbox (browser-based Jupyter/VS Code-lite)
  - Reflection Prompt (text/voice journal)
  - Peer Review Assignment
  - AI Challenge Integration
  - Quiz (limited to knowledge checks, not primary assessment)
- **AI Course Generation:** Instructor inputs learning objectives and target audience; AI generates draft course outline, scenario scripts, and challenge prompts. Instructor edits and approves.
- **Spaced Learning Scheduler:** Auto-distributes content across weeks with built-in review nodes.

### 4.5 Workplace Simulation Engine
**Purpose:** Bridge the gap between classroom and workplace judgment.

**Functionality:**
- AI-generated "client" and "stakeholder" personas with realistic, messy requirements.
- **Simulation Types:**
  - **Client Brief:** Vague requirements force students to ask clarifying questions.
  - **Crisis Scenario:** Model fails in production; student must diagnose and communicate fix.
  - **Ethics Board:** Student defends AI deployment decision to simulated regulators.
- **Dynamic Difficulty:** Adapts based on student competency level.
- **Team Simulations:** Multiplayer scenarios for collaboration skills.

### 4.6 Cloud Sandbox Environment
**Purpose:** Provide safe, judgment-free experimentation space.

**Functionality:**
- Pre-configured environments: Python (Jupyter), LLM Playground (OpenRouter integration), SQL, No-Code Automation (n8n/Langflow).
- **Sandbox Features:**
  - One-click reset (no fear of breaking things)
  - Auto-save version history
  - "Mistake Log" that captures errors and student reflections on them
  - Resource limits enforced (CPU/GPU time quotas per tier)
- **Integration with Challenges:** Sandbox state auto-links to challenge submissions.

### 4.7 Failure Resume & Reflection System
**Purpose:** Normalize failure as a learning mechanism.

**Functionality:**
- Dedicated "Failure Resume" section in portfolio.
- Prompts student to document: What went wrong? What did you learn? What would you do differently?
- **Gamification:** "Resilience Streak" badge for consecutive reflections on failed attempts.
- **Instructor Dashboard:** Shows class-level failure patterns to identify common misconceptions.

### 4.8 Peer Socratic Circles
**Purpose:** Social learning through teaching.

**Functionality:**
- Auto-matches 3-4 students into weekly "Circles" based on complementary skill gaps.
- Each student prepares a 5-minute explanation of a concept; peers ask clarifying questions.
- AI evaluates explanation clarity and peer questioning quality.
- Anonymous to reduce social anxiety; optional reveal after session.

### 4.9 Industry Mentor Match
**Purpose:** Connect learning to real-world validation.

**Functionality:**
- Students submit project drafts; platform matches with industry mentors (async).
- Mentor feedback via voice note or structured rubric (5-minute commitment).
- **Mentor Incentives:** Public mentor profile, certificates for contribution, early access to talent pipeline.
- **Integration:** Mentor endorsements appear on student competency heatmap.

### 4.10 Analytics & Competency Dashboard
**Purpose:** Track capability building, not just engagement.

**Functionality:**
- **Student View:** Personal competency heatmap, learning velocity, challenge history, reflection depth score.
- **Instructor View:** Cohort-level competency gaps, most common failure modes, peer collaboration quality.
- **Admin View:** Institution-wide AI readiness index, accreditation-ready competency reports.
- **Predictive Alerts:** Flags students at risk of disengagement based on sandbox inactivity (not just video watch time).

---

## 5. User Flows & Journeys

### 5.1 New Student Onboarding (SMK/Polytechnic Track)
1. **Sign-up:** Email/phone, institution verification (NISN/NIM), role selection.
2. **AI Diagnostic:** 15-minute adaptive assessment across 12 competency dimensions (not a test—framed as "help us personalize your path").
3. **Path Recommendation:** AI suggests personalized learning track (e.g., "AI Automation Specialist" or "AI Ethics Reviewer").
4. **First Challenge:** Immediate entry into low-stakes Challenge Arena to establish "brain-based" expectations.
5. **Portfolio Seed:** First reflection prompt: "What do you hope to build with AI?"

### 5.2 Instructor Course Creation Flow
1. **Create Course:** Input title, target audience, duration, learning objectives.
2. **AI Generation:** AI drafts course structure, scenarios, and challenges.
3. **Visual Editing:** Instructor drags blocks in Puck editor, adjusts AI-generated content.
4. **Configure Assessment:** Select challenge types, set competency weights, enable peer review.
5. **Publish & Invite:** Generate course link, invite students via LMS integration or email.
6. **Monitor:** Real-time dashboard shows competency heatmap evolution, not just login counts.

### 5.3 Challenge Completion Flow
1. **Receive Challenge:** Weekly notification with context and resources.
2. **Sandbox Experimentation:** Student explores in safe environment (unlimited attempts).
3. **Draft Submission:** Student submits work-in-progress for AI feedback (optional).
4. **Final Submission:** Student submits with attached reflection (required).
5. **AI Evaluation:** Structured feedback within 60 seconds.
6. **Peer Review (Optional):** Anonymous peer feedback for select challenges.
7. **Portfolio Update:** Competency heatmap updates; artifact added to portfolio.
8. **Reflection Prompt:** "If you had 2 more hours, what would you improve?"

### 5.4 University Non-Tech Track Flow
1. **Track Selection:** "I want to understand AI, not code it."
2. **Module 1: AI Literacy:** Evaluate AI-generated content (articles, images, legal briefs).
3. **Module 2: Critical Evaluation:** Spot hallucinations, bias, and logical flaws in AI outputs.
4. **Module 3: Ethical Reasoning:** Simulation—defend or challenge AI deployment in your field.
5. **Module 4: Applied Project:** Use AI tools to enhance a real assignment from their major (e.g., legal research, marketing plan).
6. **Portfolio:** Demonstrates "AI Fluency" competency badge for non-technical roles.

---

## 6. Technical Specifications

### 6.1 Architecture Overview
```
Frontend (Next.js 15 + Tailwind)
├── Student Dashboard
├── Instructor Course Builder (Puck)
├── Challenge Arena
├── Sandbox Interface (IFrame)
└── Portfolio Viewer

Backend (Node.js / API Routes)
├── Auth & User Management
├── Course & Content Management
├── Challenge Engine
├── AI Tutor Service (OpenRouter/Kimi)
├── Portfolio & Competency Tracker
├── Sandbox Orchestrator
└── Analytics Engine

Data Layer
├── PostgreSQL (structured data)
├── pgvector (embeddings for personalization)
├── Redis (sessions, real-time leaderboards)
└── S3-compatible (portfolio artifacts, sandbox files)

AI/ML Layer
├── OpenRouter API (multi-model access)
├── Custom Evaluation Models (fine-tuned for challenge scoring)
└── Embedding Model (competency matching, mentor matching)

Infrastructure
├── Coolify (deployment & container management)
├── Docker (sandbox isolation)
└── AWS / VPS (hosting)
```

### 6.2 Data Model (Key Entities)

**User**
- id, email, phone, role (student/instructor/admin/mentor), institution_id, track_id, competency_vector (pgvector), created_at

**Course**
- id, title, description, instructor_id, status (draft/published), structure (JSON blocks), competency_weights, created_at

**Challenge**
- id, title, description, rubric (JSON), difficulty, domain_tags, sandbox_template_id, max_attempts, created_at

**Submission**
- id, user_id, challenge_id, content (JSON), reflection_text, ai_feedback (JSON), peer_reviews (JSON), competency_delta (JSON), version_number, created_at

**Portfolio**
- id, user_id, public_url, artifacts (JSON array), competency_heatmap (JSON), failure_resume (JSON array), endorsements (JSON array)

**SandboxSession**
- id, user_id, template_id, container_id, state_url, version_history (JSON), mistake_log (JSON array), created_at, expires_at

**Reflection**
- id, user_id, context_type (challenge/project/simulation), content, ai_analysis (sentiment + depth score), created_at

### 6.3 API Specifications

**Challenge Submission**
```
POST /api/challenges/{id}/submit
Body: {
  "content": { "code": "...", "memo": "..." },
  "reflection": "I struggled with bias detection because...",
  "sandbox_snapshot_id": "uuid"
}
Response: {
  "submission_id": "uuid",
  "ai_feedback": {
    "scores": { "decomposition": 8, "tool_usage": 7, ... },
    "narrative": "Your bias analysis was thorough, but you missed...",
    "suggested_resources": ["uuid", "uuid"]
  },
  "competency_delta": { "critical_thinking": +0.3, ... }
}
```

**SocraticChat Interaction**
```
POST /api/tutor/chat
Body: {
  "session_id": "uuid",
  "message": "I think precision is the best metric",
  "context": { "current_challenge_id": "uuid", "mode": "devils_advocate" }
}
Response: {
  "response": "That's a strong number. But what if the dataset...",
  "follow_up_questions": ["What other metric might reveal...?"],
  "suggested_mode_switch": "guide"
}
```

**Portfolio Export**
```
GET /api/portfolio/{user_id}/export?format=pdf|json
Response: Binary PDF or structured JSON for LinkedIn integration
```

### 6.4 AI Integration Details

**OpenRouter Configuration**
- Primary: Kimi K2.6 (Socratic tutoring, challenge evaluation)
- Fallback: Claude 3.5 Sonnet (complex reasoning tasks)
- Budget: GPT-4o-mini (knowledge checks, content generation)
- Routing logic based on task complexity and cost optimization.

**Challenge Evaluation Pipeline**
1. Student submission parsed into structured fields.
2. RAG retrieval of similar high-quality submissions and rubric examples.
3. LLM evaluation against rubric with chain-of-thought reasoning.
4. Structured JSON output (scores + narrative feedback).
5. Human-in-the-loop sampling for quality assurance (5% random audit).

**Competency Tracking**
- 12-dimensional vector space; each submission updates vector via weighted averaging.
- pgvector cosine similarity used for peer matching and mentor matching.
- Decay function applied to old competencies (use it or lose it).

### 6.5 Sandbox Security & Isolation
- Each sandbox runs in isolated Docker container with network restrictions.
- Resource limits: 1 CPU, 2GB RAM, 10GB disk per student session.
- Auto-termination after 2 hours inactivity.
- No outbound internet (except whitelisted APIs: OpenRouter, HuggingFace).
- Student code execution monitored for malicious patterns (sandboxed kernel).

---

## 7. UI/UX Design System

### 7.1 Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| Deep Forest | `#064e3b` | Primary brand, headers, CTAs |
| Charcoal | `#1f2937` | Body text, dark UI elements |
| Off-White | `#fafaf9` | Backgrounds, cards |
| Emerald Light | `#34d399` | Success states, competency growth |
| Amber | `#f59e0b` | Warnings, in-progress |
| Rose | `#f43f5e` | Errors, failure resume accent |
| Slate | `#64748b` | Secondary text, borders |

### 7.2 Typography
- **Primary:** Inter (clean, modern, readable at small sizes)
- **Monospace:** JetBrains Mono (code, sandbox, technical content)
- **Scale:** 12px base for dense dashboards, 16px for reading content.

### 7.3 Key UI Patterns
- **Competency Heatmap:** Radar chart (Recharts) with 12 axes; color intensity shows proficiency.
- **Challenge Card:** Problem statement → Resource links → Sandbox button → Submit → Feedback timeline.
- **Portfolio Timeline:** Vertical scroll of artifacts with version branches (Git-graph style).
- **SocraticChat:** Chat interface with mode indicator (Guide/Devil's Advocate/Peer); voice input button.
- **Failure Resume:** Card-based layout with "What failed → What I learned → What I'd do differently" structure.

### 7.4 Responsive Breakpoints
- Mobile-first: 320px (SMK students primarily mobile)
- Tablet: 768px (polytechnic lab tablets)
- Desktop: 1280px (instructor course creation)

---

## 8. Content Strategy

### 8.1 Challenge Library (Seed Content)
**Domain: Prompt Engineering**
- "Optimize a prompt for a local e-commerce chatbot that reduces hallucination about inventory."
- "Red-team a prompt: Find 3 ways to make this medical advice bot give dangerous output."

**Domain: Model Evaluation**
- "Given two sentiment analysis models, evaluate which is more robust to sarcasm in Bahasa Indonesia social media posts."
- "A CV-screening model rejects 80% of female applicants. Diagnose the bias and propose a fix."

**Domain: AI Ethics**
- "Your startup's facial recognition system has 15% higher error rate for dark-skinned individuals. The CEO wants to ship. What do you do?"
- "Draft an AI governance policy for a Indonesian fintech with <50 employees."

**Domain: Automation**
- "Build a no-code workflow that automatically categorizes customer complaints from a Google Sheet and drafts responses."
- "Create a Python script that extracts structured data from unstructured PDF invoices."

### 8.2 Course Templates
- **SMK Fast Track:** 8-week intensive, 3 challenges/week, focused on employability.
- **Polytechnic Deep Dive:** 16-week semester-aligned, capstone-integrated.
- **University AI Fluency:** 6-week non-credit, judgment-focused, no coding required.
- **BLKK Reskilling:** 4-week bootcamp for unemployed graduates, job placement integrated.

### 8.3 Localization
- Primary: Bahasa Indonesia (formal and conversational)
- Secondary: English (for university internationalization track)
- Technical terms: Maintain English with Bahasa Indonesia tooltip explanations (e.g., "Overfitting / Kelebihan Penyesuaian").

---

## 9. Gamification & Engagement

### 9.1 Intrinsic Motivators (Primary)
- **Mastery:** Competency heatmap visualization; visible skill growth.
- **Purpose:** Portfolio serves as job-ready credential; real-world impact via industry challenges.
- **Autonomy:** Self-paced with suggested paths; sandbox freedom.

### 9.2 Extrinsic Motivators (Secondary)
- **Competency Badges:** 12 domain badges + 5 meta-badges (Resilience Streak, Socratic Master, Peer Mentor).
- **Leaderboards:** Anonymous handles; ranked by reasoning depth score, not speed.
- **Streaks:** Daily reflection streak (max 1 per day to prevent burnout).

### 9.3 Anti-Patterns Avoided
- ❌ No points for video watch time (passive consumption)
- ❌ No penalty for sandbox experimentation (psychological safety)
- ❌ No public failure shaming (failure resume is private by default)
- ❌ No infinite scroll content dumps (chunked, spaced learning)

---

## 10. Monetization & Business Model

### 10.1 Revenue Streams
1. **B2B Institutional Licenses:** Per-student, per-semester pricing for SMK/polytechnic/university partnerships.
2. **B2C Pro Subscriptions:** Individual learners accessing advanced challenges, mentor matching, and portfolio hosting.
3. **Corporate Upskilling:** Custom AI fluency programs for Indonesian SMEs and government agencies.
4. **Assessment Certification:** Paid competency verification for job placement (partnered with job platforms).

### 10.2 Pricing Tiers (Phase 1 - Indonesia)
| Tier | Price | Features |
|------|-------|----------|
| **Free** | Rp 0 | Limited challenges, basic portfolio, community support |
| **Student Pro** | Rp 49,000/mo | Unlimited challenges, mentor matching, advanced sandboxes |
| **Institution** | Rp 15,000/student/semester | Full LMS integration, instructor tools, analytics dashboard |
| **Enterprise** | Custom | Custom challenges, private mentor pool, white-label option |

### 10.3 Go-to-Market
- **Phase 1 (Months 1-6):** Pilot with 5 SMK and 2 polytechnics in Java; refine challenge library.
- **Phase 2 (Months 7-12):** Expand to 50 institutions; launch university AI Fluency track; first corporate clients.
- **Phase 3 (Year 2):** ASEAN expansion (Malaysia, Philippines, Vietnam); MOOC partnerships.

---

## 11. Success Metrics & KPIs

### 11.1 Learning Effectiveness (North Star)
- **Competency Velocity:** Average competency score increase per student per month (target: +0.5/month).
- **Transfer Index:** % of students who report using VOKASI-learned skills in internship/work within 3 months (target: 60%).
- **Reflection Depth Score:** AI-analyzed average reflection quality (target: 7/10).

### 11.2 Engagement
- **Challenge Attempt Rate:** % of enrolled students attempting weekly challenges (target: 70%).
- **Sandbox Session Duration:** Average time spent experimenting (target: 45 min/session).
- **Peer Collaboration Rate:** % of students participating in Socratic Circles (target: 40%).

### 11.3 Business
- **Institutional Adoption:** Number of active institutions (target: 100 by Month 12).
- **Student LTV:** Average revenue per student over 12 months.
- **NPS:** Net Promoter Score from students and instructors (target: 50+).

### 11.4 Anti-Metrics (What We Don't Optimize For)
- Video completion rate
- Time-on-platform (passive scrolling)
- Certificate issuance count
- Quiz average scores (recall-based)

---

## 12. Risk Assessment & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **AI evaluation bias** | Medium | High | Human-in-the-loop audit; diverse rubric testing; bias detection in feedback |
| **Student cheating on challenges** | Medium | Medium | Proctored submissions for certification tier; portfolio defense interviews |
| **Instructor resistance to new pedagogy** | High | High | Extensive onboarding; "course in a box" templates; success story sharing |
| **Sandbox infrastructure cost** | Medium | Medium | Aggressive auto-termination; resource quotas; sponsor-funded GPU credits |
| **Content localization quality** | Medium | Medium | Native speaker review; community contribution model; AI-assisted translation |
| **Regulatory (Indonesian data sovereignty)** | Medium | High | Local AWS region; PDPA compliance; on-premise deployment option for government |

---

## 13. Implementation Roadmap

### 13.1 Phase 1: Foundation (Months 1-3)
- [ ] Core platform setup (Next.js, DB, Auth, Coolify deployment)
- [ ] Challenge Arena v1 (3 challenge types, AI evaluation)
- [ ] SocraticChat v1 (text-only, Guide mode)
- [ ] Basic Portfolio (artifact storage, simple heatmap)
- [ ] Sandbox v1 (Python Jupyter, limited resources)
- [ ] Pilot with 2 SMK + 1 polytechnic

### 13.2 Phase 2: Capability Building (Months 4-6)
- [ ] Visual Course Builder (Puck integration)
- [ ] AI Course Generation
- [ ] Workplace Simulation Engine (3 scenario types)
- [ ] Peer Socratic Circles
- [ ] Failure Resume system
- [ ] University AI Fluency track launch
- [ ] Expand to 10 institutions

### 13.3 Phase 3: Scale & Intelligence (Months 7-12)
- [ ] Advanced Analytics & predictive alerts
- [ ] Industry Mentor Match marketplace
- [ ] Mobile app (React Native)
- [ ] Corporate upskilling tier
- [ ] ASEAN market research & localization prep
- [ ] 50+ institutional partners

### 13.4 Phase 4: Ecosystem (Year 2)
- [ ] Job placement integration (partner with job platforms)
- [ ] Open challenge marketplace (community-created challenges)
- [ ] White-label for large corporates
- [ ] ASEAN expansion launch

---

## 14. Appendices

### 14.1 Glossary
- **Brain-Based Learning:** Pedagogy aligned with cognitive science principles (relevance, emotion, attention, meaning, practice, feedback, reflection).
- **Competency Vector:** 12-dimensional numerical representation of a student's demonstrated skills.
- **Socratic Tutoring:** Teaching method using guided questioning to stimulate critical thinking.
- **Sandbox:** Isolated, safe computing environment for experimentation.
- **Failure Resume:** Documented record of mistakes and lessons learned, framed as growth evidence.

### 14.2 References
- Business Times Singapore. "In the AI age, Singapore needs better learning, not just more courses." (2026)
- SkillsFuture Singapore. National AI Impact Programme documentation.
- Micron Singapore. Internal AI upskilling initiative case study.
- Cognitive Science literature on transfer learning and spaced repetition.

### 14.3 Mega-Prompt for AI Development Agents

```
You are an expert full-stack engineer and product builder specializing in Next.js 15, TypeScript, Tailwind CSS, PostgreSQL, and AI integrations. You are building VOKASI, an AI-native vocational education platform.

**CONTEXT:**
VOKASI replaces passive course consumption with brain-based, capability-building learning. The platform serves Indonesian SMK, polytechnic, and university students. Core philosophy: build judgment and transferable skills, not just knowledge.

**TECH STACK:**
- Frontend: Next.js 15 (App Router), Tailwind CSS, shadcn/ui, Puck (visual editor)
- Backend: Next.js API Routes, PostgreSQL + pgvector, Redis
- AI: OpenRouter API (Kimi K2.6 primary, Claude 3.5 fallback)
- Deployment: Coolify on VPS/AWS
- Sandbox: Docker-isolated environments

**DESIGN SYSTEM:**
- Colors: Deep Forest #064e3b, Charcoal #1f2937, Off-White #fafaf9, Emerald Light #34d399, Amber #f59e0b, Rose #f43f5e
- Fonts: Inter (primary), JetBrains Mono (monospace)
- Mobile-first, accessible, Bahasa Indonesia + English support

**CURRENT TASK:**
[INSERT SPECIFIC FEATURE HERE - e.g., "Build the Challenge Arena submission and evaluation flow"]

**REQUIREMENTS:**
1. Follow the PRD v2.3 specifications exactly
2. Implement proper error handling and loading states
3. Ensure responsive design (320px mobile to 1280px desktop)
4. Use TypeScript strictly; no `any` types
5. Implement proper security (input validation, SQL injection prevention, XSS protection)
6. Write clean, commented code with component decomposition
7. Include proper state management (Zustand or React Context)
8. Ensure accessibility (ARIA labels, keyboard navigation, color contrast)
9. Optimize for performance (lazy loading, code splitting, image optimization)
10. Include proper logging for debugging

**DATABASE SCHEMA (Key Tables):**
- users: id, email, role, institution_id, competency_vector (vector), created_at
- courses: id, title, instructor_id, structure (jsonb), status, created_at
- challenges: id, title, description, rubric (jsonb), difficulty, domain_tags
- submissions: id, user_id, challenge_id, content (jsonb), reflection, ai_feedback (jsonb), competency_delta (jsonb), version_number
- portfolios: id, user_id, artifacts (jsonb), competency_heatmap (jsonb), failure_resume (jsonb)
- sandbox_sessions: id, user_id, container_id, state_url, version_history (jsonb), mistake_log (jsonb)

**AI INTEGRATION PATTERN:**
All AI calls go through OpenRouter with this structure:
```typescript
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.SITE_URL,
    'X-Title': 'VOKASI'
  },
  body: JSON.stringify({
    model: 'moonshot-ai/kimi-k2-6', // or fallback
    messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
    response_format: { type: 'json_object' }, // for structured outputs
    temperature: 0.7
  })
});
```

**OUTPUT FORMAT:**
Provide complete, production-ready code files with:
1. File path comments
2. Component/function documentation
3. Type definitions
4. Error boundary implementations
5. Unit test stubs (Jest/React Testing Library)
6. Any necessary environment variable documentation

Do not use placeholder code. Every function must be fully implemented. If you need to make architectural assumptions, state them clearly.
```

---

**Document Owner:** Product & Engineering Team  
**Review Cycle:** Monthly  
**Next Review Date:** 2026-05-30

---
*End of VOKASI PRD v2.3*
