@echo off
echo ========================================
echo TSEA-X Development Environment Setup
echo ========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo WARNING: Not running as administrator
    echo Some installations may require admin rights
    echo.
)

echo [Step 1/7] Checking Python installation...
python --version >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] Python not found in PATH
    echo Please install Python 3.11+ from https://www.python.org/downloads/
    echo IMPORTANT: Check "Add Python to PATH" during installation
    echo.
    pause
    exit /b 1
) else (
    python --version
    echo [OK] Python is installed
)
echo.

echo [Step 2/7] Checking Node.js installation...
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] Node.js not found in PATH
    echo Please install Node.js LTS from https://nodejs.org/
    echo.
    pause
    exit /b 1
) else (
    node --version
    npm --version
    echo [OK] Node.js and npm are installed
)
echo.

echo [Step 3/7] Checking Git installation...
git --version >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] Git not found in PATH
    echo Please install Git from https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
) else (
    git --version
    echo [OK] Git is installed
)
echo.

echo [Step 4/7] Setting up Python virtual environment...
cd backend
if not exist .venv (
    echo Creating virtual environment...
    python -m venv .venv
    if %errorLevel% neq 0 (
        echo [!] Failed to create virtual environment
        cd ..
        pause
        exit /b 1
    )
    echo [OK] Virtual environment created
) else (
    echo [OK] Virtual environment already exists
)

echo Activating virtual environment...
call .venv\Scripts\activate.bat
if %errorLevel% neq 0 (
    echo [!] Failed to activate virtual environment
    echo Try running: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
    cd ..
    pause
    exit /b 1
)
echo.

echo [Step 5/7] Installing Python dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt
if %errorLevel% neq 0 (
    echo [!] Failed to install Python dependencies
    cd ..
    pause
    exit /b 1
)
echo [OK] Python dependencies installed
cd ..
echo.

echo [Step 6/7] Installing Node.js dependencies...
cd frontend
if not exist node_modules (
    echo Installing npm packages (this may take a few minutes)...
    npm install
    if %errorLevel% neq 0 (
        echo [!] Failed to install npm dependencies
        cd ..
        pause
        exit /b 1
    )
    echo [OK] npm dependencies installed
) else (
    echo [OK] node_modules already exists, updating...
    npm install
)
cd ..
echo.

echo [Step 7/7] Checking environment files...
if not exist backend\.env (
    echo [!] backend\.env not found
    echo Please create backend\.env with your API keys
    echo See backend\.env.example for reference
    echo.
)

if not exist frontend\.env.local (
    echo [!] frontend\.env.local not found
    echo Please create frontend\.env.local with your configuration
    echo See frontend\.env.local.example for reference
    echo.
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Configure your .env files (backend and frontend)
echo 2. Run: start-all.bat to start both servers
echo.
echo Backend will run on: http://localhost:8000
echo Frontend will run on: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo.
pause
