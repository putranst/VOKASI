@echo off
echo ========================================
echo Starting TSEA-X Application
echo ========================================
echo.

REM Check if backend venv exists
if not exist backend\venv\Scripts\python.exe (
    echo ERROR: Backend virtual environment not found!
    echo Please run: cd backend ^&^& python -m venv venv ^&^& venv\Scripts\activate ^&^& pip install -r requirements.txt
    pause
    exit /b 1
)

REM Check if frontend node_modules exists
if not exist frontend\node_modules (
    echo ERROR: Frontend node_modules not found!
    echo Please run: cd frontend ^&^& npm install
    pause
    exit /b 1
)

echo [1/2] Starting Backend Server (FastAPI on port 8000)...
start "TSEA-X Backend" cmd /k "cd /d %~dp0backend && venv\Scripts\python.exe -m uvicorn main:app --reload"

echo [2/2] Starting Frontend Server (Next.js on port 3000)...
timeout /t 3 /nobreak >nul
start "TSEA-X Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo ✓ All servers are starting!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
echo Press any key to close this window (servers will keep running)...
pause >nul
