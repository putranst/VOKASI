# Socratic Tutor Implementation Walkthrough

**Date**: 2025-11-27  
**Feature**: AI-Powered Socratic Tutor for CDIO Framework  
**Status**: ✅ Completed & Verified

---

## Overview

The Socratic Tutor is an AI-powered chatbot that guides students through the CDIO (Conceive, Design, Implement, Operate) framework by asking guiding questions rather than providing direct answers. This implementation is part of **Phase 2: The Brain (AI Agents)** from the TSEA-X blueprint.

## Implementation Details

### Backend Components

#### 1. API Endpoint (`backend/main.py`)

**Endpoint**: `POST /api/v1/ai/socratic`

**Request Model**:
```python
class SocraticRequest(BaseModel):
    user_message: str
    project_id: int
    context: Optional[Dict] = {}
    history: Optional[List[Dict]] = []
```

**Key Features**:
- Automatically fetches project context (charter, phase, problem statement) if not provided
- Passes context and conversation history to the AI service
- Returns Socratic-style responses from the AI

**Location**: Lines 1974-2003 in `backend/main.py`

#### 2. AI Service (`backend/services/openai_service.py`)

**Function**: `socratic_response()`

**System Prompt**:
```
You are a Socratic Tutor. NEVER give answers. ONLY ask guiding questions.
Keep responses short (under 50 words). Be encouraging.
```

**Features**:
- Supports multiple AI providers (OpenAI, OpenRouter, Gemini, Mock)
- Prioritizes providers in order: OpenAI → OpenRouter → Gemini → Mock
- Designed to encourage critical thinking, not provide solutions

### Frontend Components

#### 1. Socratic Tutor Component (`frontend/src/components/SocraticTutor.tsx`)

**Features**:
- **Floating chat interface** with smooth animations
- **Message history** with user/AI distinction
- **Loading states** while AI responds
- **Gradient design** (purple to indigo) matching TSEA-X branding
- **Auto-scroll** to latest message
- **Error handling** for network issues

**Props**:
```typescript
interface SocraticTutorProps {
    projectId: number;
    context?: any;
    isOpen: boolean;
    onClose: () => void;
}
```

**UI Components**:
- Header with tutor branding and close button
- Scrollable message area
- Input field with send button
- Disabled state when loading

#### 2. Integration into Conceive Page (`frontend/src/app/courses/[id]/conceive/page.tsx`)

**Added Elements**:
1. **State Management**:
   ```typescript
   const [showTutor, setShowTutor] = useState(false);
   ```

2. **Floating Toggle Button**:
   - Positioned at bottom-right (z-index: 40)
   - Gradient background (purple-600 to indigo-600)
   - Shows "Ask Tutor" with Sparkles icon
   - Hides when chat is open

3. **Context Passing**:
   ```typescript
   context={{
       problemStatement,
       successMetrics,
       targetOutcome
   }}
   ```

## API Flow

### Request Flow
1. **User types question** → Frontend `SocraticTutor.tsx`
2. **POST request** to `/api/v1/ai/socratic` with:
   - User message
   - Project ID
   - Current context (problem statement, etc.)
   - Conversation history
3. **Backend fetches project context** (if not provided)
4. **AI service generates response** using Socratic prompting
5. **Response returned** to frontend
6. **Message displayed** in chat interface

### Example Interaction

**User**: "Help me refine my problem statement"

**AI (Socratic)**: "What makes this problem worth solving for your target users? Have you considered who is most affected?"

**User**: "Small business owners struggling with inventory"

**AI (Socratic)**: "Interesting! Can you quantify the impact? What specific pain points do they face daily?"

## Verification

### Backend Verification
- ✅ `/api/v1/ai/socratic` endpoint responds correctly
- ✅ Project context is automatically fetched
- ✅ AI service returns guiding questions (not direct answers)

### Frontend Verification
- ✅ "Ask Tutor" button appears on Conceive page
- ✅ Chat window opens on click
- ✅ Messages send and receive correctly
- ✅ UI animations work smoothly
- ✅ Error handling for network issues

### Browser Test Results
**Test**: Opened chat, sent message "Help me"  
**Result**: ✅ AI responded with Socratic question  
**Screenshot**: Captured interaction showing chat interface and AI response

## Integration Points

The Socratic Tutor is currently integrated into:
- ✅ **Conceive Page** (`/courses/[id]/conceive`)

**Future Integration** (Recommended):
- ⏳ Design Page (for architecture validation)
- ⏳ Implement Page (for debugging guidance)
- ⏳ Operate Page (for deployment troubleshooting)

## Technical Specifications

### Dependencies
- **Frontend**: React hooks (useState, useRef, useEffect), Lucide icons
- **Backend**: FastAPI, OpenAI/Gemini SDK, asyncio
- **AI**: OpenAI GPT-4, Google Gemini, OpenRouter (fallback)

### Environment Variables Required
```bash
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
OPENROUTER_API_KEY=your_openrouter_key
```

### Performance
- **Response Time**: ~2-5 seconds (depends on AI provider)
- **Message Limit**: No artificial limit (conversation history grows)
- **Concurrency**: Supports multiple simultaneous users

## Key Features

### 1. Socratic Methodology
- ✅ Asks guiding questions instead of providing answers
- ✅ Encourages critical thinking
- ✅ Keeps responses concise (<50 words)
- ✅ Maintains encouraging tone

### 2. Context Awareness
- ✅ Reads current project phase
- ✅ Understands problem statement
- ✅ References success metrics
- ✅ Maintains conversation history

### 3. User Experience
- ✅ Floating chat interface (non-intrusive)
- ✅ Toggle open/close
- ✅ Smooth animations
- ✅ Loading indicators
- ✅ Error messages for failures

## Future Enhancements

1. **Multi-Phase Support**: Deploy tutor across all CDIO phases
2. **Conversation Persistence**: Save chat history to database
3. **Analytics**: Track common questions and student struggles
4. **Advanced Prompting**: Phase-specific system prompts
5. **Voice Input**: Speech-to-text for accessibility
6. **Suggested Questions**: Auto-suggest common queries

## Related Documentation

- **Cloud IDE**: `CLOUD_IDE_WALKTHROUGH.md`
- **Enrollment System**: `ENROLLMENT_SYSTEM_WALKTHROUGH.md`
- **Project Blueprint**: `tsea_x_blueprint.md`

---

**Next Steps**: Implement Grading Agents for automated feedback on student submissions.
