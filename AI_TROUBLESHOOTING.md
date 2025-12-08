# AI Features Troubleshooting Guide

## Issue Found
The Gemini API key in `.env` appears to be **invalid or expired**.

Current key: `AIzaSyBEsPzIifko9_A9DEKpd4GYHxRP9XLjZEo`
Error: `404 Not Found - models/gemini-pro`

## How to Fix

### Step 1: Get a New Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy the new API key

### Step 2: Update the .env File
Replace the current key in `backend/.env`:
```
GEMINI_API_KEY=YOUR_NEW_API_KEY_HERE
```

### Step 3: Restart the Backend Server
Stop and restart the backend server for changes to take effect:
```bash
# Stop current server (Ctrl+C)
# Then restart:
cd backend
python -m uvicorn main:app --reload
```

### Step 4: Test the AI Features
After restarting, test these features:
- ✅ **AI Companion** - Chat in any course page
- ✅ **Charter Suggestions** - In Conceive phase when creating projects
- ✅ **Socratic Tutor** - In Design phase for guided learning
- ✅ **Course Creation** - AI-powered curriculum generation

## Alternative: Use OpenAI Instead
If you prefer to use OpenAI's ChatGPT:
1. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Update `backend/.env`:
```
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4-turbo-preview
```
3. The system will automatically switch to OpenAI

## Current Configuration
- **Model**: gemini-pro (stable version)
- **Provider Priority**: Gemini → OpenAI → Mock
- **Features**: All AI features use the same provider

## Files Modified
- `backend/services/openai_service.py` - Updated to use `gemini-pro` model
- `backend/requirements.txt` - Includes `google-generativeai`
- Package installed: ✅ google-generativeai

## Next Steps
1. **Get a valid Gemini API key** (recommended - free tier available)
2. **OR use OpenAI** (paid but reliable)
3. **OR keep using MOCK mode** (simulated responses, good for testing UI)

The system will work in MOCK mode until a valid API key is provided.
