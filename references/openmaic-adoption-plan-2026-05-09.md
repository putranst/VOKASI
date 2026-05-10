# OpenMAIC Feature Adoption Plan for VOKASI2
**Date:** 2026-05-09  
**Focus:** Lesson Generation, Classroom Components, Multi-Agent Interaction

---

## 1. Lesson Generation System

### OpenMAIC Architecture
```
User Requirements → Outline Generator → Scene Content → Scene Actions → Classroom
```

**Key Files:**
- `lib/generation/outline-generator.ts` — Generates scene outlines from requirements
- `lib/generation/scene-generator.ts` — Generates slide/quiz/interactive/PBL content
- `lib/server/classroom-generation.ts` — Orchestrates full classroom generation
- `lib/server/classroom-job-runner.ts` — Async job management

### VOKASI2 Adaptation

| OpenMAIC Concept | VOKASI2 Equivalent | Integration Path |
|------------------|-------------------|------------------|
| Scene Outline | Course Module | Extend `courses` table with outline JSON |
| Scene Types | Lesson Types | Add `slide`, `quiz`, `interactive`, `pbl` types |
| Classroom Job | Course Generation Job | Reuse existing `course_generator.py` infrastructure |
| PDF Parsing | Document Processor | Already have `document-processor.ts` |

### Recommended Implementation

```typescript
// New: frontend/src/lib/lesson-generation/types.ts
interface LessonOutline {
  id: string;
  courseId: string;
  order: number;
  title: string;
  type: 'slide' | 'quiz' | 'interactive' | 'pbl' | 'sandbox';
  objectives: string[];
  content: LessonContent;
  estimatedMinutes: number;
  mediaGenerations?: MediaGeneration[];
}

// Extend existing course generation
async function generateLessonFromOutline(
  outline: LessonOutline,
  courseContext: CourseContext
): Promise<GeneratedLesson>
```

**Priority:** 🟡 Medium (2-3 weeks)
**Benefit:** Richer course content with diverse lesson types

---

## 2. Classroom/Stage Components

### OpenMAIC Architecture
```
Stage → SceneRenderer → [SlideRenderer | QuizView | InteractiveRenderer | PBLRenderer]
```

**Key Components:**
- `components/stage.tsx` — Main stage container
- `components/stage/scene-renderer.tsx` — Route to correct renderer
- `components/scene-renderers/` — Specialized renderers

### VOKASI2 Adaptation

| OpenMAIC Component | VOKASI2 Enhancement | Priority |
|--------------------|---------------------|----------|
| `SlideRenderer` | Enhance existing lesson viewer | 🔴 High |
| `QuizView` | Add to Challenge Arena | 🔴 High |
| `InteractiveRenderer` | New feature for sandbox | 🟡 Medium |
| `PBLRenderer` | Add to SocraticChat | 🟡 Medium |

### New Components for VOKASI2

```typescript
// frontend/src/components/classroom/
├── classroom-stage.tsx        // Main container (like stage.tsx)
├── lesson-renderer.tsx        // Route to correct lesson type
├── renderers/
│   ├── slide-renderer.tsx     // Content slides with TTS
│   ├── quiz-renderer.tsx      // Interactive quiz
│   ├── sandbox-renderer.tsx   // Code sandbox integration
│   └── simulation-renderer.tsx // Workplace simulation
└── classroom-controls.tsx     // Navigation, progress, TTS
```

**Priority:** 🔴 High (1-2 weeks)
**Benefit:** Immersive learning experience

---

## 3. Multi-Agent Interaction

### OpenMAIC Architecture
```
Director Graph → Agent Profiles → Agent Bar → PBL Chat
```

**Key Files:**
- `lib/orchestration/director-graph.ts` — LangGraph-based orchestration (18KB)
- `lib/orchestration/director-prompt.ts` — Agent behavior prompts (10KB)
- `lib/orchestration/prompt-builder.ts` — Dynamic prompt construction (38KB)
- `components/agent/` — Agent UI components

### VOKASI2 Adaptation

| OpenMAIC Feature | VOKASI2 Integration | Notes |
|------------------|---------------------|-------|
| Agent Profiles | Extend Simulation Personas | Already have `simulation_personas` table |
| Director Graph | Multi-Agent Tutor | Enhance SocraticChat with multiple personas |
| Agent Bar | Tutor Selection UI | Add agent selection to student/tutor page |
| PBL Chat | Socratic Circles Enhancement | Already have peer circles |

### Recommended Architecture for VOKASI2

```typescript
// Enhanced Multi-Agent Tutor System
interface TutorAgent {
  id: string;
  name: string;
  role: 'socratic' | 'expert' | 'peer' | 'mentor';
  personality: string;
  knowledgeDomains: string[];
  avatar?: string;
}

// Multi-agent chat where students can switch between agents
// or have agents collaborate in the background

class MultiAgentTutor {
  agents: TutorAgent[];
  activeAgent: TutorAgent;
  
  async query(userMessage: string): Promise<TutorResponse> {
    // Route to appropriate agent or collaborate
    const relevantAgents = this.selectAgents(userMessage);
    const responses = await Promise.all(
      relevantAgents.map(agent => agent.respond(userMessage))
    );
    return this.synthesize(responses);
  }
}
```

**Priority:** 🟡 Medium (3-4 weeks)
**Benefit:** Richer AI tutoring experience

---

## 4. Integration Roadmap

### Phase 1: Quick Wins (Week 1-2)
| Task | Effort | Impact |
|------|--------|--------|
| Add lesson type variety (slide/quiz/sandbox) | 3 days | High |
| Integrate TTS into lesson viewer | 2 days | High |
| Add quiz renderer to Challenge Arena | 2 days | High |

### Phase 2: Classroom Experience (Week 3-4)
| Task | Effort | Impact |
|------|--------|--------|
| Build classroom-stage component | 4 days | High |
| Add scene navigation/progress | 2 days | Medium |
| Integrate interactive elements | 3 days | Medium |

### Phase 3: Multi-Agent Enhancement (Week 5-8)
| Task | Effort | Impact |
|------|--------|--------|
| Design agent persona system | 3 days | Medium |
| Implement agent routing logic | 5 days | High |
| Build agent selection UI | 2 days | Medium |
| Add collaborative agent responses | 4 days | High |

---

## 5. Technical Debt to Address

| Issue | Location | Fix |
|-------|----------|-----|
| Missing types for scene/lesson | `lib/types/` | Create `lesson-types.ts` |
| No scene renderer pattern | `components/` | Adopt renderer factory pattern |
| Limited lesson variety | Course content | Add scene types to generation |
| No classroom state management | Student views | Add Zustand store for classroom |

---

## 6. Key Files to Create

```
frontend/src/
├── lib/lesson-generation/
│   ├── types.ts
│   ├── outline-generator.ts
│   └── lesson-builder.ts
├── components/classroom/
│   ├── classroom-stage.tsx
│   ├── lesson-renderer.tsx
│   ├── renderers/
│   │   ├── slide-renderer.tsx
│   │   ├── quiz-renderer.tsx
│   │   └── sandbox-renderer.tsx
│   └── controls/
│       ├── navigation.tsx
│       └── progress-bar.tsx
├── lib/multi-agent/
│   ├── types.ts
│   ├── agent-router.ts
│   └── tutor-orchestrator.ts
└── app/api/lessons/
    ├── generate/route.ts
    └── [lessonId]/route.ts
```

---

## 7. Estimated Timeline

| Phase | Duration | Cumulative |
|-------|----------|------------|
| TTS (completed) | 1 day | Day 1 |
| Lesson Types | 1 week | Week 2 |
| Classroom Components | 2 weeks | Week 4 |
| Multi-Agent | 3 weeks | Week 7 |
| Testing & Polish | 1 week | Week 8 |

**Total estimated effort:** 8 weeks for full adoption

---

*Generated by Mes — Hermes Agent*
