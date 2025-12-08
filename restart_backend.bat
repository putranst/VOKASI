@echo off
echo Restarting TSEA-X Backend Server...
echo.

cd backend

echo Installing/updating dependencies...
pip install -r requirements.txt --quiet

echo.
echo Starting backend server...
python -m uvicorn main:app --reload --port 8000

pause
