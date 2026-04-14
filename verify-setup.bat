@echo off
echo ========================================
echo TSEA-X System Verification
echo ========================================
echo.

echo [1/8] Checking Python...
python --version 2>nul
if %errorLevel% neq 0 (
    echo [X] Python not found
    set /a errors+=1
) else (
    echo [OK] Python installed
)
echo.

echo [2/8] Checking pip...
pip --version 2>nul
if %errorLevel% neq 0 (
    echo [X] pip not found
    set /a errors+=1
) else (
    echo [OK] pip installed
)
echo.

echo [3/8] Checking Node.js...
node --version 2>nul
if %errorLevel% neq 0 (
    echo [X] Node.js not found
    set /a errors+=1
) else (
    echo [OK] Node.js installed
)
echo.

echo [4/8] Checking npm...
npm --version 2>nul
if %errorLevel% neq 0 (
    echo [X] npm not found
    set /a errors+=1
) else (
    echo [OK] npm installed
)
echo.

echo [5/8] Checking Git...
git --version 2>nul
if %errorLevel% neq 0 (
    echo [X] Git not found
    set /a errors+=1
) else (
    echo [OK] Git installed
)
echo.

echo [6/8] Checking backend virtual environment...
if exist backend\.venv (
    echo [OK] Virtual environment exists
) else (
    echo [X] Virtual environment not found
    set /a errors+=1
)
echo.

echo [7/8] Checking frontend node_modules...
if exist frontend\node_modules (
    echo [OK] node_modules exists
) else (
    echo [X] node_modules not found
    set /a errors+=1
)
echo.

echo [8/8] Checking environment files...
if exist backend\.env (
    echo [OK] backend\.env exists
) else (
    echo [!] backend\.env not found (create from .env.example)
)

if exist frontend\.env.local (
    echo [OK] frontend\.env.local exists
) else (
    echo [!] frontend\.env.local not found (create from .env.local.example)
)
echo.

echo ========================================
if %errors% gtr 0 (
    echo Status: INCOMPLETE - %errors% issue(s) found
    echo Run setup-dev-env.bat to complete setup
) else (
    echo Status: READY TO GO!
    echo Run start-all.bat to start servers
)
echo ========================================
echo.
pause
