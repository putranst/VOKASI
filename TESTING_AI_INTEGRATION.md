# Quick Test Guide - OpenAI Integration

## Prerequisites
1. Backend running with OpenAI dependencies installed ✅
2. OpenAI API key in backend/.env ✅
3. Frontend running on localhost:3000

## Test 1: Charter Suggestions

### Manual Test Steps:
1. Navigate to: http://localhost:3000/courses/9/conceive
   (Course 9 = "AI Agents for Small Businesses")

2. Fill in charter:
   - **Problem Statement:**
     "Small business owners receive 50+ sales inquiries daily but only 10% convert into actual clients because they lack budget. Business owners waste 3 hours/day on low-value leads instead of serving paying customers."
   
   - **Success Metrics:**
     "Reduce time spent on unqualified leads by 80%, automatically filter leads based on budget, increase time available for high-value clients by 15 hours/week."
   
   - **Target Outcome:**
     "AI-powered lead qualification agent that triages WhatsApp inquiries"

3. Click "Save Charter"

4. **Expected AI Response:**
   - Suggested Tools: ["OpenAI API", "LangChain", "WhatsApp Business API", "Python", "FastAPI"]
   - Reasoning: Something like "These tools enable NLP-based budget extraction and automated lead scoring..."
   - Duration: "2-3 weeks"
   - Difficulty: "Intermediate"

5. ✅ **Pass if:** AI suggestions appear with reasoning
   ❌ **Fail if:** Generic template tools appear

## Test 2: Socratic Tutor

### Manual Test Steps:
1. From Conceive, click "Proceed to Design"

2. Fill in some design:
   - **Logic Flow:** "User sends WhatsApp message → Extract budget using regex → If budget > $5000, notify owner"
   - **Components:** Add "WhatsApp Webhook Handler", "Budget Extractor"

3. In AI Socratic Tutor, ask:
   "Should I use regex to extract the budget?"

4. **Expected AI Response:**
   Something like: "Interesting choice! But what happens if the user writes '$5k' or 'five thousand'? Would regex catch all variations? Have you considered more robust NLP approaches?"

5. Follow-up question:
   "What happens if the WhatsApp webhook goes down?"

6. **Expected AI Response:**
   Context-aware question like: "Great question! I see you have a Webhook Handler component. What happens to incoming messages if that handler fails? Should you have a backup mechanism or retry logic?"

7. ✅ **Pass if:** AI asks thoughtful, context-aware questions
   ❌ **Fail if:** Generic random template responses

## Test 3: Error Handling

### Test AI Fallback:
1. Temporarily break the API (wrong API key in .env)
2. Try saving a charter
3. ✅ **Pass if:** Still shows template suggestions (fallback works)

## Quick API Test (via curl/Postman)

### Charter Suggestions:
```bash
curl -X POST http://localhost:8000/api/v1/ai/charter-suggestions \
  -H "Content-Type: application/json" \
  -d '{
    "problem_statement": "E-commerce store has 30% cart abandonment",
    "success_metrics": "Reduce abandonment to 15%",
    "course_id": 9,
    "target_outcome": "AI recovery agent"
  }'
```

Expected: JSON with tools, reasoning, duration, difficulty

### Socratic Chat:
```bash
curl -X POST http://localhost:8000/api/v1/ai/socratic-chat \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": 1,
    "user_message": "Should I use MongoDB or PostgreSQL?",
    "conversation_history": [],
    "design_context": {
      "logic_flow": "Store cart data temporarily",
      "components": ["Database"],
      "data_flow": "User → API → Database"
    }
  }'
```

Expected: Socratic question about trade-offs

## Backend Restart Instructions

If backend is not running or needs restart:

```powershell
# Navigate to backend
cd c:\Users\PT\Desktop\TSEA-X\backend

# Run the start script
.\start_backend.bat
```

Watch for:
```
INFO:     Uvicorn running on http://localhost:8000
INFO:     Application startup complete.
```

If you see "ModuleNotFoundError: No module named 'openai'":
- Dependencies aren't installed in venv
- Run: `.\venv\Scripts\pip.exe install openai==1.12.0 python-dotenv==1.0.0`

## Success Criteria

✅ **Integration Successful if:**
1. Charter suggestions show course-appropriate tools
2. AI reasoning explains why tools were chosen
3. Socratic tutor asks contextual questions
4. Conversations show AI remembers previous messages
5. Fallback templates work if AI fails

## Troubleshooting

**Problem:** AI returns generic/wrong suggestions
- Check: API key is valid in .env
- Check: Backend logs for OpenAI API errors
- Check: Internet connection (API calls need network)

**Problem:** Socratic tutor gives same response every time
- Check: Conversation history is being sent
- Check: Design context includes current logic/components
- Check: Not using old template code

**Problem:** "AI service error"
- Check: OpenAI API quota/billing
- Check: Backend logs for detailed error
- Verify: .env file exists in backend directory
