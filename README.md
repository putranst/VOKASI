# TSEA-X Platform

TSEA-X is an AI-powered competency learning platform featuring Soulbound Credentials, Socratic Bots, and real-time policy-to-practice integration.

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Python 3.11+
- Docker & Docker Compose (optional, for production/containerized dev)

### Quick Start (Windows)

1. **Run the setup script:**
   ```powershell
   .\dev-setup.ps1
   ```
   This will set up virtual environments, install dependencies, and create environment files.

2. **Start Development Servers:**
   You can use the Makefile if you have `make` installed:
   ```bash
   make dev
   ```
   Or run them manually in separate terminals:

   **Backend:**
   ```bash
   cd backend
   .\venv\Scripts\activate
   uvicorn main:app --reload
   ```

   **Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the App:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## 🛠️ CI/CD Pipeline

This project uses GitHub Actions for Continuous Integration and Continuous Deployment.

### Workflows
- **Backend CI**: Runs on push/PR to `backend/**`. Performs linting (flake8) and testing (pytest).
- **Frontend CI**: Runs on push/PR to `frontend/**`. Performs linting and build verification.

### Deployment (Docker)
The project is containerized for production deployment.

**Build and Run Production Containers:**
```bash
docker-compose -f docker-compose.production.yml up --build -d
```

## 📁 Project Structure

- `backend/`: FastAPI application
- `frontend/`: Next.js application
- `.github/workflows/`: CI/CD configurations
- `docker-compose.production.yml`: Production orchestration

## 🔑 Environment Variables

Copy the example files to create your local configuration:
- Backend: `cp backend/.env.example backend/.env`
- Frontend: `cp frontend/.env.local.example frontend/.env.local`

**Required Secrets for GitHub Actions:**
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
