# T6 Platform — Technical Appendix

**Version**: 1.0  
**Date**: January 2026  
**Classification**: Whitepaper Supplement  

---

## Executive Summary

The T6 platform is engineered as a cloud-native, AI-first educational technology stack designed to deliver scalable, project-based learning with verifiable blockchain credentials. This technical appendix provides a comprehensive overview of the production-ready MVP architecture, technology choices, and implementation rationale for technical stakeholders, investors, and institutional partners.

---

## 1. Architecture Philosophy

T6 follows three core architectural principles:

1. **AI-First Design**: Every learning interaction is augmented by AI—from Socratic tutoring to automated grading to intelligent course generation.

2. **Credential Immutability**: Learning achievements are permanently recorded on blockchain as non-transferable Soulbound Tokens (SBTs), creating a tamper-proof skills passport.

3. **Edge-Ready Scalability**: The stack is containerized and stateless, ready for global CDN distribution and horizontal scaling.

---

## 2. Technology Stack Overview

### 2.1 Frontend Layer

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| **Framework** | Next.js | 16.0.7 | App Router architecture enables server-side rendering, static generation, and edge deployment. React Server Components reduce client bundle size. |
| **Language** | TypeScript | 5.x | Compile-time type safety reduces runtime errors by ~40% and enables confident refactoring at scale. |
| **UI Library** | React | 19.2.0 | Concurrent rendering, Suspense boundaries, and Server Components support for optimal UX. |
| **Styling** | Tailwind CSS | 4.x | Utility-first approach ensures design consistency and eliminates CSS bloat. |
| **Animation** | Framer Motion | 12.x | Physics-based animations with gesture support for mobile-first interactions. |
| **Icons** | Lucide React | 0.554.0 | Tree-shakeable icon library (~1KB per icon) with consistent design language. |
| **Code Editor** | Monaco Editor | 4.7.0 | VS Code's editor core powers the Cloud IDE with syntax highlighting, IntelliSense, and 40+ language support. |
| **Knowledge Graph** | react-force-graph-2d | 1.29.0 | WebGL-accelerated graph rendering for Personal Knowledge Container (PKC) visualization. |
| **Gamification** | canvas-confetti | 1.9.4 | Celebration effects for achievement unlocks and milestone completions. |

### 2.2 Backend Layer

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| **Framework** | FastAPI | 0.104.1 | Async-native Python framework with automatic OpenAPI documentation generation. Benchmarks show 3x throughput vs Flask. |
| **Language** | Python | 3.11+ | First-class AI/ML library ecosystem (OpenAI, LangChain, HuggingFace) with async/await support. |
| **Data Validation** | Pydantic | 2.5.0 | Runtime type validation with JSON Schema generation for API contracts. |
| **ORM** | SQLAlchemy | 2.0.23 | Async query support with type hints and mature migration tooling. |
| **Migrations** | Alembic | 1.12.1 | Version-controlled database schema evolution with rollback capability. |
| **ASGI Server** | Uvicorn | 0.24.0 | High-performance async server with HTTP/2 and WebSocket support. |
| **HTTP Client** | HTTPX | 0.25.1 | Async HTTP/2 client for external API integrations (AI services, blockchain nodes). |

### 2.3 AI/ML Services

| Service | Technology | Purpose |
|---------|-----------|---------|
| **Primary LLM** | OpenAI GPT-4 | Powers Socratic tutoring dialogues, course content generation, project charter analysis, and automated grading with rubric adherence. |
| **Multi-Modal AI** | Google Gemini Pro Vision | Extracts structured content from lecture slides (PPTX), PDFs, and handwritten diagrams for course material parsing. |
| **Document Processing** | PyPDF (3.17.4) | PDF text extraction with layout preservation for syllabus parsing. |
| **Presentation Processing** | python-pptx (0.6.23) | PowerPoint slide extraction with speaker notes and embedded media handling. |
| **Image Processing** | Pillow (10.1.0) | Image preprocessing for Gemini Vision inputs (resizing, format conversion). |

**AI Integration Pattern:**
```
Student Input → FastAPI → AI Service Layer → LLM API → Response Parser → Structured Output → Frontend
                              ↓
                    Context Injection (Course data, CDIO phase, prior interactions)
```

### 2.4 Database & Authentication

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Primary Database** | PostgreSQL 15.x | ACID-compliant relational storage with Row-Level Security (RLS) for multi-tenant isolation. |
| **Backend-as-a-Service** | Supabase | Managed PostgreSQL with real-time subscriptions, authentication, and edge functions. |
| **Vector Storage** | pgvector (extension) | 1536-dimensional embeddings for semantic search across PKC knowledge nodes. |
| **Authentication** | Supabase Auth | JWT-based authentication with email/password, Google OAuth, and GitHub OAuth. Magic link support for passwordless login. |

**Row-Level Security Model:**
- Students see only their own enrollments, projects, and credentials
- Instructors see student submissions for their courses only
- Admins have cross-tenant visibility for platform management
- Partners see aggregated analytics for their institution's courses

### 2.5 Blockchain Layer

| Component | Technology | Details |
|-----------|-----------|---------|
| **Smart Contract Language** | Solidity 0.8.20 | Latest stable version with built-in overflow protection. |
| **Contract Libraries** | OpenZeppelin Contracts | Battle-tested implementations of ERC-721, Ownable, and Counters patterns. |
| **Token Standard** | ERC-721 (Modified) | Soulbound implementation that overrides `_transfer` to prevent token movement. |
| **Target Network** | Polygon PoS | Sub-cent transaction fees ($0.001-0.01 per mint) with 2-second finality. |
| **Network Strategy** | Testnet → Mainnet | Currently simulated; production deployment targets Polygon Mainnet with MetaMask integration. |

**T6Credential.sol Key Features:**
```solidity
// Non-transferable (Soulbound)
function _update(address to, uint256 tokenId, address auth) internal override {
    if (from != address(0) && to != address(0)) {
        revert("Soulbound: Transfer not allowed");
    }
    super._update(to, tokenId, auth);
}

// Credential metadata on-chain
struct CredentialMetadata {
    string courseId;
    string grade;
    string instructorSignature;
    uint256 issueDate;
}
```

---

## 3. Infrastructure & Deployment

### 3.1 Cloud Provider: Google Cloud Platform (GCP)

| Service | Usage |
|---------|-------|
| **Compute Engine** | VM-based deployment for MVP (n2-standard-2 instances) |
| **Cloud SQL** | Managed PostgreSQL with automated backups and point-in-time recovery |
| **Container Registry** | Docker image storage (gcr.io/tsea-x-platform/*) |
| **Cloud SQL Proxy** | Secure, IAM-authenticated database connections |
| **Cloud CDN** | (Planned) Static asset caching for global latency reduction |

### 3.2 Container Architecture

```yaml
# docker-compose.yml structure
services:
  frontend:    # Next.js SSR application
  backend:     # FastAPI application  
  caddy:       # Reverse proxy with automatic HTTPS
  cloud-sql-proxy:  # Secure database tunnel
```

**Container Specifications:**
- Frontend: Node.js 20 Alpine (~150MB image)
- Backend: Python 3.11 Slim (~400MB image with ML dependencies)
- Caddy: Alpine variant (~40MB image)

### 3.3 Production Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         INTERNET                                     │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │    CloudFlare     │
                    │   DNS + DDoS      │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │      Caddy        │
                    │  Auto-HTTPS/Proxy │
                    │    :80, :443      │
                    └─────────┬─────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
┌────────▼────────┐  ┌────────▼────────┐  ┌───────▼───────┐
│    Frontend     │  │    Backend      │  │   Supabase    │
│    (Next.js)    │  │    (FastAPI)    │  │   (Auth/RT)   │
│     :3000       │  │     :8000       │  │    Cloud      │
└─────────────────┘  └────────┬────────┘  └───────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   Cloud SQL       │
                    │   (PostgreSQL)    │
                    │   via Proxy       │
                    └───────────────────┘
```

---

## 4. Database Schema

### 4.1 Core Tables (14 tables with RLS)

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `users` | User profiles extending Supabase auth | FK to auth.users |
| `institutions` | Partner organizations | - |
| `courses` | Course catalog | FK to institutions |
| `enrollments` | Student-course mappings | FK to users, courses |
| `projects` | CDIO project instances | FK to users, courses |
| `project_charters` | Conceive phase artifacts | FK to projects |
| `design_blueprints` | Design phase artifacts | FK to projects |
| `implementations` | Implement phase code | FK to projects |
| `deployments` | Operate phase + SBT data | FK to projects |
| `credentials` | Issued SBT records | FK to users, courses |
| `revenue_transactions` | Financial tracking | FK to courses, users |
| `knowledge_nodes` | PKC nodes + embeddings | FK to users |
| `knowledge_links` | PKC relationships | FK to knowledge_nodes |
| `learning_journal` | Reflective entries | FK to users |

### 4.2 Performance Indexes

```sql
-- Optimized for common query patterns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_credentials_user_id ON credentials(user_id);
CREATE INDEX idx_knowledge_nodes_user ON knowledge_nodes(user_id);
```

---

## 5. API Surface

### 5.1 RESTful Endpoints

| Group | Endpoints | Authentication |
|-------|-----------|----------------|
| **Courses** | `GET/POST /api/v1/courses`, `POST /api/v1/courses/generate` | Public read, JWT write |
| **Projects** | `CRUD /api/v1/projects`, `/charter`, `/blueprint`, `/implementation`, `/deployment` | JWT required |
| **Enrollments** | `POST/DELETE /api/v1/enrollments`, `GET /api/v1/users/{id}/enrollments` | JWT required |
| **Credentials** | `POST /api/v1/credentials`, `/mint`, `/verify/{token_id}` | JWT for write, public verify |
| **Institutions** | `GET /api/v1/institutions`, `/{id}/courses`, `/{id}/stats` | Public read |
| **Users** | `GET /api/v1/users/{id}/profile`, `/gamification` | JWT required |
| **AI Services** | `POST /api/v1/ai/socratic`, `/generate-charter`, `/grade` | JWT required |

### 5.2 OpenAPI Specification

Auto-generated documentation available at:
- Swagger UI: `https://api.t6.tsea.asia/docs`
- ReDoc: `https://api.t6.tsea.asia/redoc`

---

## 6. Security Architecture

### 6.1 Authentication Flow

```
1. User submits credentials → Supabase Auth
2. Supabase validates → Returns JWT (1hr expiry) + Refresh Token (7d)
3. Frontend stores JWT in memory (not localStorage for XSS protection)
4. API requests include: Authorization: Bearer <JWT>
5. Backend validates JWT signature against Supabase public key
6. RLS policies enforce data access at database level
```

### 6.2 Security Measures

| Layer | Protection |
|-------|------------|
| **Transport** | TLS 1.3 via Caddy (automatic HTTPS) |
| **Authentication** | JWT with RS256 signatures |
| **Authorization** | PostgreSQL Row-Level Security |
| **Input Validation** | Pydantic models with strict typing |
| **CORS** | Allowlisted frontend origins only |
| **Rate Limiting** | (Planned) Redis-backed per-user throttling |
| **Secrets** | Environment variables, never committed |

---

## 7. MVP Feature Matrix

| Feature | Status | Stack Components |
|---------|--------|------------------|
| User Authentication (Email + OAuth) | ✅ Production | Supabase Auth |
| Course Catalog with Search/Filter | ✅ Production | Next.js, PostgreSQL FTS |
| CDIO 4-Phase Workflow | ✅ Production | React state machine, FastAPI |
| AI Socratic Tutor (Streaming) | ✅ Production | GPT-4, SSE streaming |
| AI Course Generator | ✅ Production | GPT-4, Gemini Vision |
| Blockchain Credentials (SBT) | ✅ Simulated | Solidity, Web3 (planned) |
| Public Credential Verification | ✅ Production | QR codes, token lookup |
| Cloud IDE | ✅ MVP | Monaco Editor, sandboxed exec |
| Gamification (XP, Streaks, Badges) | ✅ Production | PostgreSQL, React |
| Institution Dashboard | ✅ Production | Role-based views |
| Admin Dashboard | ✅ Production | Full CRUD, analytics |

---

## 8. Roadmap: Production Enhancements

### Phase 1: Hardening (Q1 2026)
- [ ] Kubernetes migration (GKE) for auto-scaling
- [ ] Redis caching layer for session/API responses
- [ ] Prometheus + Grafana monitoring stack
- [ ] Sentry error tracking integration

### Phase 2: Blockchain Production (Q2 2026)
- [ ] Polygon Mainnet deployment
- [ ] MetaMask wallet integration
- [ ] IPFS metadata storage (Pinata/web3.storage)
- [ ] On-chain credential revocation

### Phase 3: Scale (Q3 2026)
- [ ] Multi-region deployment (Asia-Pacific focus)
- [ ] Elasticsearch for full-text search
- [ ] WebSocket real-time collaboration
- [ ] Mobile-responsive PWA

---

## 9. Performance Benchmarks

| Metric | Current | Target |
|--------|---------|--------|
| API Response Time (p95) | 180ms | <100ms |
| Frontend TTFB | 320ms | <200ms |
| Lighthouse Score | 87 | >95 |
| Database Query Time (avg) | 12ms | <10ms |
| Concurrent Users Tested | 500 | 10,000 |

---

## 10. Cost Model (MVP)

| Resource | Monthly Cost (USD) |
|----------|-------------------|
| GCP Compute (2x n2-standard-2) | $140 |
| Cloud SQL (db-f1-micro) | $25 |
| Supabase Pro | $25 |
| OpenAI API (estimated 100K tokens/day) | $90 |
| Domain + CDN | $20 |
| **Total MVP** | **~$300/month** |

*Note: Scales linearly to ~$2,000/month at 10,000 MAU with caching optimizations.*

---

## Appendix A: Repository Structure

```
TSEA-X/
├── frontend/                 # Next.js 16 application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Reusable UI components
│   │   └── lib/             # Utilities, contexts
│   └── package.json
├── backend/                  # FastAPI application
│   ├── main.py              # API entrypoint
│   ├── models.py            # Pydantic schemas
│   ├── sql_models.py        # SQLAlchemy models
│   ├── services/            # Business logic
│   │   ├── openai_service.py
│   │   ├── grading_service.py
│   │   └── blockchain_service.py
│   └── requirements.txt
├── blockchain/               # Smart contracts
│   └── T6Credential.sol
├── docker-compose.yml        # Container orchestration
├── supabase_schema.sql       # Database DDL
└── *.md                      # Documentation
```

---

## Appendix B: Environment Variables

```bash
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_BACKEND_URL=https://api.t6.tsea.asia

# Backend (.env)
DATABASE_URL=postgresql://user:pass@host:5432/db
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=AI...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
```

---

**Document Prepared By**: T6 Engineering Team  
**Contact**: engineering@tsea.asia  
**Last Updated**: January 18, 2026
