@echo off
echo Starting TSEA-X Backend...
call venv\Scripts\activate
uvicorn main:app --reload
pause
