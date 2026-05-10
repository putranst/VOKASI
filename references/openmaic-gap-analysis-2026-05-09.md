# VOKASI2 vs OpenMAIC Gap Analysis
**Date:** 2026-05-09  
**Purpose:** Identify features in OpenMAIC that could enhance VOKASI2

---

## Executive Summary

| Aspect | VOKASI2 | OpenMAIC |
|--------|---------|----------|
| **Focus** | Vocational education platform with AI tutor | Multi-agent immersive classroom experience |
| **Architecture** | Monolithic Next.js 15 + PostgreSQL | Next.js 16 + pnpm monorepo + multiple AI providers |
| **AI Backend** | OpenRouter | Vercel AI SDK (Anthropic, Google, OpenAI) + CopilotKit |
| **License** | Proprietary/SaaS | AGPL-3.0 |
| **Maturity** | Production-ready (38 tables) | Research/academic (JCST'26 paper) |

---

## 🟢 VOKASI2 Advantages (Features OpenMAIC Lacks)

| Feature | VOKASI2 | OpenMAIC |
|---------|---------|----------|
| **Challenge Arena** | ✅ AI-evaluated challenges with rubrics | ❌ Only quiz grading |
| **Competency Portfolio** | ✅ 12-dimension tracking with PDF export | ❌ No portfolio system |
| **Workplace Simulation** | ✅ Multi-turn persona-based scenarios | ❌ No simulation engine |
| **Peer Socratic Circles** | ✅ Group learning with peer evaluation | ❌ No peer learning |
| **Failure Resume** | ✅ Documented learning from failures | ❌ Not available |
| **Gamification** | ✅ 21 badges, streaks, leaderboard | ❌ No gamification |
| **Sandbox Templates** | ✅ 8 pre-built coding exercises | ❌ No sandbox |
| **Mentor Matching** | ✅ Student-mentor request system | ❌ Not available |
| **Peer Reviews** | ✅ Anonymous structured rubric reviews | ❌ Not available |
| **SocraticChat** | ✅ 3-mode AI tutor (Socratic, Guide, Expert) | ⚠️ Basic chat only |
| **Webhooks** | ✅ Event-driven integrations | ❌ Not available |
| **Notifications** | ✅ In-app notification system | ❌ Not available |

---

## 🔵 OpenMAIC Advantages (Features VOKASI2 Lacks)

### High Priority (Consider Adopting)

| Feature | OpenMAIC | VOKASI2 | Impact |
|---------|----------|---------|--------|
| **Video Generation** | ✅ AI-generated educational videos | ❌ Not available | 🔴 HIGH — Rich content |
| **Image Generation** | ✅ Scene illustrations via AI | ❌ Not available | 🔴 HIGH — Visual learning |
| **TTS (Text-to-Speech)** | ✅ Azure voices, multi-language | ❌ Voice input planned only | 🟡 MEDIUM — Accessibility |
| **PPT Generation** | ✅ Auto-generate presentations | ❌ Not available | 🟡 MEDIUM — Instructor tools |
| **Whiteboard/Canvas** | ✅ Interactive canvas with drawing | ❌ Not available | 🟡 MEDIUM — Live collaboration |
| **Web Search Integration** | ✅ Real-time web search in chat | ❌ Not available | 🟢 LOW — Can use existing APIs |
| **Scene-Based Learning** | ✅ Immersive scene rendering | ❌ Not available | 🟡 MEDIUM — Engagement |
| **Multi-provider AI** | ✅ Anthropic, Google, OpenAI native | ⚠️ OpenRouter only | 🟢 LOW — OpenRouter covers all |

### Medium Priority (Nice to Have)

| Feature | OpenMAIC | VOKASI2 |
|---------|----------|---------|
| **Prosemirror Rich Text** | ✅ Full rich text editor | ⚠️ TipTap (less features) |
| **CopilotKit Integration** | ✅ Built-in copilot UI | ❌ Not available |
| **MCP Client** | ✅ Model Context Protocol | ❌ Not available |
| **i18n (7 languages)** | ✅ Full internationalization | ⚠️ Indonesian + English only |
| **PBL Chat** | ✅ Project-Based Learning chat | ❌ Not available |
| **Animation/Transitions** | ✅ animate.css + motion | ⚠️ Basic CSS animations |

### Low Priority (Research Only)

| Feature | OpenMAIC | VOKASI2 |
|---------|----------|---------|
| **Classroom Recording** | ✅ Session recording | ❌ Not available |
| **Agent Profiles** | ✅ Customizable AI personas | ⚠️ Simulation personas only |
| **MathML/OMML** | ✅ Math formula rendering | ⚠️ Basic LaTeX (KaTeX) |
| **Flow Diagrams** | ✅ @xyflow/react diagrams | ❌ Not available |

---

## 🟡 Feature Overlap (Both Have)

| Feature | VOKASI2 Implementation | OpenMAIC Implementation |
|---------|------------------------|-------------------------|
| **PDF Processing** | ✅ pdf-parse + mammoth | ✅ unpdf + pptxtojson |
| **AI Chat** | ✅ SocraticChat (3 modes) | ✅ Basic chat + PBL chat |
| **Course Generation** | ✅ Fast/Heavy modes, streaming | ✅ Scene-based generation |
| **Document Upload** | ✅ Drag-drop + background processing | ✅ PDF parsing |
| **AI Content Refinement** | ✅ Block-level refinement | ⚠️ Basic editing |
| **Template System** | ✅ 8 course + 8 sandbox templates | ⚠️ Config templates only |

---

## 📋 Recommended Adoption Plan

### Phase 1: Quick Wins (1-2 weeks)

| Feature | Effort | Benefit | Integration Path |
|---------|--------|---------|------------------|
| **TTS for lessons** | Low | Accessibility | Use Vercel AI SDK or ElevenLabs |
| **Web search in SocraticChat** | Low | Contextual answers | Add SerpAPI/Tavily tool |
| **Enhanced rich text** | Medium | Better course editor | Upgrade TipTap or adopt Prosemirror |

### Phase 2: Content Enrichment (2-4 weeks)

| Feature | Effort | Benefit | Integration Path |
|---------|--------|---------|------------------|
| **Image generation for courses** | Medium | Visual learning | Integrate DALL-E or Stable Diffusion |
| **PPT export** | Medium | Instructor tool | Adopt pptxgenjs from OpenMAIC |
| **Flow diagrams** | Medium | Visual explanations | Adopt @xyflow/react |

### Phase 3: Immersive Features (4-8 weeks)

| Feature | Effort | Benefit | Integration Path |
|---------|--------|---------|------------------|
| **Video generation** | High | Rich content | Evaluate OpenMAIC's generate/video |
| **Interactive canvas** | High | Live collaboration | Evaluate whiteboard components |
| **Scene-based learning** | High | Engagement | Study OpenMAIC's scene renderers |

---

## 🔧 Technical Comparison

### Stack Differences

| Layer | VOKASI2 | OpenMAIC |
|-------|---------|----------|
| **Framework** | Next.js 15 App Router | Next.js 16 |
| **Package Manager** | bun/npm | pnpm (monorepo) |
| **UI Library** | shadcn/ui | shadcn + Radix + Base UI |
| **State Management** | Zustand | Zustand + Immer |
| **AI SDK** | OpenRouter (custom) | Vercel AI SDK |
| **Database** | PostgreSQL + pgvector | PostgreSQL (via server/) |
| **Styling** | Tailwind v3 | Tailwind v4 |
| **Rich Text** | TipTap | Prosemirror |
| **Charts** | Recharts | ECharts |

### Code Organization

```
VOKASI2:                          OpenMAIC:
├── frontend/                     ├── app/
│   └── src/                      │   ├── api/        (25+ routes)
│       ├── app/                  │   ├── classroom/
│       │   ├── api/ (57 routes)  │   └── generation-preview/
│       │   ├── student/          ├── components/     (17 modules)
│       │   ├── instructor/       ├── lib/            (25 modules)
│       │   └── admin/            ├── configs/        (13 configs)
│       ├── components/           ├── packages/       (monorepo)
│       └── lib/                  └── skills/
└── backend/
    ├── sql/
    └── worker.js
```

---

## 🎯 Key Insights

1. **OpenMAIC excels at content creation** (video, image, PPT, scene-based learning)
2. **VOKASI2 excels at learning outcomes** (competency tracking, simulations, gamification)
3. **Complementary strengths** — VOKASI2 could adopt OpenMAIC's media generation
4. **Licensing compatible** — OpenMAIC is AGPL-3.0, can be used as reference/submodule
5. **Different architectures** — OpenMAIC is more complex (CopilotKit, LangChain, multiple AI providers)

---

## 📌 Action Items

- [ ] Evaluate TTS integration (Azure vs ElevenLabs vs Vercel AI SDK)
- [ ] Prototype image generation for course content
- [ ] Assess PPT export complexity
- [ ] Study scene-based learning UX for potential adoption
- [ ] Review OpenMAIC's i18n implementation for VOKASI2 expansion

---

*Generated by Mes — Hermes Agent*
