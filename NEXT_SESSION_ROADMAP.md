# Next Session Roadmap

**Created**: 2025-11-27 22:17  
**Session Goal**: Complete Polish & Enhancement → Blockchain Integration → Testing

---

## 🎯 SESSION OBJECTIVES

### Primary Goal: Complete Polish & Enhancement
Finish the remaining enhancement features before moving to blockchain integration.

---

## 📋 TASK CHECKLIST

### Task 1: Multi-Language Cloud IDE (Frontend)
**File**: `frontend/src/components/CloudIDE.tsx`

**Changes Needed**:
1. Add language selector dropdown (Python, JavaScript, Java)
2. Update Monaco Editor's `language` prop based on selection
3. Change template code per language:
   ```typescript
   const templates = {
       python: "# Python code here\ndef main():\n    print('Hello')\n",
       javascript: "// JavaScript code here\nfunction main() {\n    console.log('Hello');\n}\nmain();",
       java: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello\");\n    }\n}"
   }
   ```
4. Pass selected language to API call

**Estimated Time**: 30 minutes

---

### Task 2: Code Persistence
**Backend**: Add code snapshot storage to database  
**Frontend**: Auto-save functionality

**Steps**:
1. Update `models.py` to track code versions
2. Create API endpoint: `POST /api/v1/projects/{id}/save-code`
3. Add auto-save timer (every 30 seconds) to CloudIDE
4. Add "Last saved" indicator in UI

**Estimated Time**: 45 minutes

---

### Task 3: Phase-Specific Socratic Prompts
**File**: `backend/services/openai_service.py`

**Changes**:
- Modify `socratic_response()` to include phase-aware prompts:
  - **Conceive**: "Focus on problem clarity and scope"
  - **Design**: "Guide architecture decisions and scalability"
  - **Implement**: "Help with debugging and best practices"
  - **Operate**: "Focus on deployment and maintenance"

**Estimated Time**: 20 minutes

---

### Task 4: Integrate Socratic Tutor in Design & Operate Pages
**Files**:
- `frontend/src/app/courses/[id]/design/page.tsx`
- `frontend/src/app/courses/[id]/operate/page.tsx`

**Changes**: Copy integration pattern from Conceive page

**Estimated Time**: 30 minutes

---

### Task 5: Basic Instructor Dashboard
**New File**: `frontend/src/app/instructor/page.tsx`

**Features**:
- List all student submissions
- Show grading queue
- Quick grade actions
- Basic analytics (completion rates, average grades)

**Estimated Time**: 1-2 hours

---

## 🔬 TESTING CHECKLIST

After completion, test:
- [ ] Run Python code in Cloud IDE
- [ ] Run JavaScript code in Cloud IDE  
- [ ] Run Java code in Cloud IDE
- [ ] Code auto-saves correctly
- [ ] Socratic Tutor in all phases
- [ ] Grading modal displays correctly
- [ ] Instructor dashboard loads

---

## 📦 PHASE 3: BLOCKCHAIN ROADMAP

Once Polish & Enhancement is complete:

### Step 1: Smart Contract Development
- Write SBT (Soulbound Token) contract in Solidity
- Include metadata support
- Add revocation functionality
- Test on Hardhat local network

### Step 2: Deploy to Polygon Mumbai
- Set up deployment scripts
- Deploy contract to testnet
- Verify on PolygonScan
- Document contract address

### Step 3: Web3 Frontend Integration
- Install `ethers.js` or `web3.js`
- Add MetaMask connection button
- Handle wallet connection state
- Display user's wallet address

### Step 4: IPFS Integration
- Set up Pinata or NFT.Storage account
- Upload credential metadata to IPFS
- Store IPFS hash in smart contract
- Display metadata in Digital Wallet

### Step 5: Public Verification Portal
- Create `/verify/[tokenId]` public page
- Query blockchain for credential data
- Display verification status
- Show QR code for sharing

---

## 🚀 QUICK START COMMANDS

### Backend:
```bash
cd c:/Users/PT/Desktop/TSEA-X/backend
python -m uvicorn main:app --reload
```

### Frontend:
```bash
cd c:/Users/PT/Desktop/TSEA-X/frontend
npm run dev
```

### Test Grading:
```bash
cd c:/Users/PT/Desktop/TSEA-X
python scripts/test_grading.py
```

---

## 📁 KEY FILES TO WORK ON

### Immediate:
1. `frontend/src/components/CloudIDE.tsx` - Multi-language support
2. `backend/models.py` - Code snapshot model
3. `backend/main.py` - Save code endpoint
4. `backend/services/openai_service.py` - Phase-specific prompts

### Later (Blockchain):
1. `contracts/SoulboundToken.sol` (NEW)
2. `scripts/deploy.js` (NEW)
3. `frontend/src/lib/web3.ts` (NEW)
4. `frontend/src/app/verify/[tokenId]/page.tsx` (NEW)

---

## 🎓 CURRENT STATUS RECAP

**Completed**: 
- ✅ Phase 1: CDIO Framework
- ✅ Phase 2: AI Agents (Socratic Tutor + Grading)
- ✅ Phase 4: Cloud IDE (Python execution)

**In Progress**:
- 🔄 Polish & Enhancement (50% - backend multi-lang done)

**Pending**:
- ⏳ Phase 3: Full Blockchain Integration
- ⏳ Advanced Analytics & Reporting
- ⏳ Mobile Responsive Design

---

## 💡 OPTIONAL ENHANCEMENTS (If Time Permits)

1. **Dark Mode** for entire platform
2. **Email Notifications** for grading results
3. **Real-time Collaboration** in Cloud IDE
4. **AI Code Suggestions** (GitHub Copilot-style)
5. **Download Certificate** as PDF
6. **Student Progress Charts** with Chart.js

---

## 📞 NOTES FOR NEXT SESSION

- Backend multi-language execution is **READY** ✅
- Just need to update frontend UI for language selection
- All documentation is up-to-date
- No blocking issues
- Database migrations may be needed for code persistence

---

**Next Session Start**: Pick up from Task 1 (Multi-Language Cloud IDE Frontend)

**Success Criteria**: 
1. Students can write and run Python, JavaScript, and Java code
2. Code auto-saves every 30 seconds
3. Socratic Tutor available in all CDIO phases
4. Instructor can view submission queue

**End Goal**: Platform ready for blockchain integration!

---

Good luck with the next session! 🚀
