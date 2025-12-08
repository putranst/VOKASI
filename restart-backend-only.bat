@echo off
echo ========================================
echo Restarting TSEA-X Backend
echo ========================================
echo.

cd /d %~dp0backend

echo [1/2] Activating virtual environment...
call venv\Scripts\activate

echo [2/2] Starting backend server...
echo Backend will be available at: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.

uvicorn main:app --reload --port 8000
