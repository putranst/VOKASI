---
description: Start all TSEA-X servers (frontend and backend)
---

# Start Server Workflow

This workflow starts both the frontend (Next.js) and backend (FastAPI) servers for the TSEA-X application.

## Steps

// turbo
1. Run the startup script:
```bash
.\start-all.bat
```

This will:
- Start the **Backend** server (FastAPI) on http://localhost:8000
- Start the **Frontend** server (Next.js) on http://localhost:3000
- Open both in separate terminal windows

## Alternative: Manual Start

If you prefer to start servers manually:

**Backend:**
```bash
cd backend
venv\Scripts\activate
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## Verify Servers

After starting, verify both servers are running:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Troubleshooting

If servers fail to start:

1. **Backend issues**: Ensure virtual environment exists
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Frontend issues**: Ensure dependencies are installed
   ```bash
   cd frontend
   npm install
   ```
