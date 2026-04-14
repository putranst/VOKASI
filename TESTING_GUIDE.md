# TSEA-X Testing & Setup Guide

**Date**: 2025-11-27  
**Purpose**: Complete testing checklist and setup instructions

---

## 🚀 QUICK START

### Prerequisites
- Python 3.10+ installed
- Node.js 18+ installed
- Git installed

---

## 📦 BACKEND SETUP

### Step 1: Install Python Dependencies

```bash
cd c:/Users/PT/Desktop/TSEA-X/backend
pip install -r requirements.txt
```

**Required packages**:
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `pydantic` - Data validation
- `python-dotenv` - Environment variables
- `openai` - OpenAI API (optional)
- `google-generativeai` - Gemini API (optional)
- `httpx` - HTTP client

### Step 2: Create Environment File (Optional)

Create `backend/.env`:
```env
OPENAI_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
OPENROUTER_API_KEY=your_key_here
```

### Step 3: Start Backend Server

```bash
cd backend
python -m uvicorn main:app --reload
```

**Expected Output**:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Verify**: Open http://localhost:8000/docs to see API documentation

---

## 🎨 FRONTEND SETUP

### Step 1: Install Node Dependencies

```bash
cd c:/Users/PT/Desktop/TSEA-X/frontend
npm install
```

### Step 2: Start Development Server

```bash
npm run dev
```

**Expected Output**:
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Ready in Xs
```

**Verify**: Open http://localhost:3000

---

## ✅ TESTING CHECKLIST

### Backend API Tests

#### 1. Health Check
```bash
curl http://localhost:8000/health
```
**Expected**: `{"status":"healthy","cdio_enabled":true,...}`

#### 2. Admin Stats
```bash
curl http://localhost:8000/api/v1/admin/stats
```
**Expected**: JSON with `totalUsers`, `totalCourses`, etc.

#### 3. Recent Activity
```bash
curl http://localhost:8000/api/v1/admin/recent-activity
```
**Expected**: Array of activity objects

#### 4. Grading Endpoint
```bash
curl -X POST http://localhost:8000/api/v1/grading/charter \
  -H "Content-Type: application/json" \
  -d "{\"project_id\": 1}"
```
**Expected**: Grading result with scores and feedback

#### 5. Code Execution
```bash
curl -X POST http://localhost:8000/api/v1/code/execute \
  -H "Content-Type: application/json" \
  -d "{\"code\": \"print('Hello')\", \"language\": \"python\"}"
```
**Expected**: `{"output":"Hello","success":true,...}`

---

### Frontend Page Tests

#### 1. Homepage
- **URL**: http://localhost:3000
- **Check**: Hero section, course cards, navigation
- **Status**: ✅ Should load

#### 2. Dashboard
- **URL**: http://localhost:3000/dashboard
- **Check**: Enrolled courses, credentials, stats
- **Status**: ✅ Should load

#### 3. Admin Dashboard
- **URL**: http://localhost:3000/admin
- **Check**: KPI cards, activity feed, tabs
- **Status**: ✅ Should load (NEW)

#### 4. Conceive Page
- **URL**: http://localhost:3000/courses/1/conceive
- **Check**: Charter form, AI suggestions, Socratic Tutor
- **Status**: ✅ Should load

#### 5. Implement Page
- **URL**: http://localhost:3000/courses/1/implement?project=1
- **Check**: Cloud IDE, code editor, grading button
- **Status**: ✅ Should load

#### 6. Operate Page
- **URL**: http://localhost:3000/courses/1/operate?project=1
- **Check**: Deployment form, SBT display
- **Status**: ✅ Should load

---

### Feature Integration Tests

#### Test 1: Socratic Tutor
1. Navigate to `/courses/1/conceive`
2. Click "Ask Tutor" button (bottom-right)
3. Type "Help me" and send
4. **Expected**: AI responds with guiding question

#### Test 2: Charter Grading
1. Navigate to `/courses/1/conceive`
2. Fill out charter form
3. Click "Save Charter"
4. Click "Request AI Feedback"
5. **Expected**: Modal opens with grade and feedback

#### Test 3: Code Execution
1. Navigate to `/courses/1/implement?project=1`
2. Write Python code: `print("Test")`
3. Click "Run Code"
4. **Expected**: Output shows "Test"

#### Test 4: Multi-Language Code (Backend Ready)
1. Test JavaScript:
   ```bash
   curl -X POST http://localhost:8000/api/v1/code/execute \
     -H "Content-Type: application/json" \
     -d "{\"code\": \"console.log('Hello')\", \"language\": \"javascript\"}"
   ```
2. **Expected**: Output shows "Hello"

#### Test 5: Admin Dashboard
1. Navigate to `/admin`
2. **Check**:
   - KPI cards display numbers
   - Recent activity feed shows entries
   - Tab navigation works
   - System health shows "healthy"

---

## 🐛 TROUBLESHOOTING

### Issue: "Module not found: uvicorn"
**Solution**:
```bash
cd backend
pip install uvicorn
```

### Issue: "Module not found: fastapi"
**Solution**:
```bash
cd backend
pip install -r requirements.txt
```

### Issue: Frontend won't start
**Solution**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue: "CORS error" in browser console
**Solution**: Backend CORS is configured for localhost:3000 and localhost:3001. Check `backend/main.py` line 47-53.

### Issue: Admin dashboard shows "Loading..."
**Cause**: Backend not running or API endpoints failing
**Solution**: 
1. Check backend is running on port 8000
2. Test API: `curl http://localhost:8000/api/v1/admin/stats`
3. Check browser console for errors

### Issue: Grading returns 404
**Cause**: Project or charter doesn't exist
**Solution**: Create a project first by enrolling in a course and saving a charter

---

## 📊 EXPECTED TEST RESULTS

### Backend Health
- ✅ Server starts without errors
- ✅ API docs accessible at `/docs`
- ✅ All endpoints return 200 OK
- ✅ No Python exceptions in console

### Frontend Health
- ✅ All pages load without errors
- ✅ No console errors (except optional API warnings)
- ✅ Navigation works between pages
- ✅ Components render correctly

### Feature Health
- ✅ Socratic Tutor opens and responds
- ✅ Grading modal displays results
- ✅ Code execution returns output
- ✅ Admin dashboard shows stats

---

## 🔍 MANUAL TESTING SCRIPT

### Full Platform Test (15 minutes)

1. **Start Servers** (2 min)
   - Start backend: `cd backend && python -m uvicorn main:app --reload`
   - Start frontend: `cd frontend && npm run dev`
   - Verify both running

2. **Test Homepage** (1 min)
   - Visit http://localhost:3000
   - Check hero section loads
   - Check course cards display

3. **Test Enrollment** (2 min)
   - Click "Browse Courses"
   - Click "Enroll" on a course
   - Verify redirect to dashboard
   - Check course appears in "My Courses"

4. **Test CDIO Flow** (5 min)
   - Click on enrolled course
   - **Conceive**: Fill charter, save, request feedback
   - **Design**: (placeholder - skip for now)
   - **Implement**: Write code, run, request review
   - **Operate**: Submit deployment URL

5. **Test Admin Dashboard** (3 min)
   - Visit http://localhost:3000/admin
   - Verify KPI cards show numbers
   - Check activity feed has entries
   - Test tab navigation

6. **Test AI Features** (2 min)
   - Open Socratic Tutor
   - Send a message
   - Verify AI responds
   - Close tutor

---

## 📝 TEST REPORT TEMPLATE

```markdown
# Test Report - [Date]

## Environment
- OS: Windows/Mac/Linux
- Python: [version]
- Node: [version]
- Browser: Chrome/Firefox/Safari

## Backend Tests
- [ ] Server starts: PASS/FAIL
- [ ] Health check: PASS/FAIL
- [ ] Admin stats API: PASS/FAIL
- [ ] Grading API: PASS/FAIL
- [ ] Code execution: PASS/FAIL

## Frontend Tests
- [ ] Homepage loads: PASS/FAIL
- [ ] Dashboard loads: PASS/FAIL
- [ ] Admin dashboard loads: PASS/FAIL
- [ ] Conceive page loads: PASS/FAIL
- [ ] Implement page loads: PASS/FAIL

## Feature Tests
- [ ] Socratic Tutor works: PASS/FAIL
- [ ] Charter grading works: PASS/FAIL
- [ ] Code execution works: PASS/FAIL
- [ ] Admin stats display: PASS/FAIL

## Issues Found
1. [Issue description]
2. [Issue description]

## Notes
[Any additional observations]
```

---

## 🎯 NEXT STEPS AFTER TESTING

Once all tests pass:

1. **Implement Future Enhancements**:
   - Multi-language Cloud IDE UI
   - Code persistence
   - User management tab in admin
   - Course management tab

2. **Phase 3: Blockchain Integration**:
   - Smart contract development
   - MetaMask integration
   - IPFS metadata storage

3. **Production Readiness**:
   - Add authentication
   - Database migration (PostgreSQL)
   - Deploy to cloud (Vercel + Railway)
   - Set up monitoring

---

**Testing Status**: Ready for manual testing  
**Last Updated**: 2025-11-27  
**Next Action**: Install backend dependencies and run tests
