Write-Host "Setting up TSEA-X Development Environment..." -ForegroundColor Cyan

# Check Prerequisites
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Error "Python is not installed."
    exit 1
}
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js is not installed."
    exit 1
}

# Backend Setup
Write-Host "`nSetting up Backend..." -ForegroundColor Green
cd backend
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..."
    python -m venv venv
}
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env from template. Please update it with your keys." -ForegroundColor Yellow
}
cd ..

# Frontend Setup
Write-Host "`nSetting up Frontend..." -ForegroundColor Green
cd frontend
npm install
if (-not (Test-Path ".env.local")) {
    Copy-Item ".env.local.example" ".env.local"
    Write-Host "Created .env.local from template." -ForegroundColor Yellow
}
cd ..

Write-Host "`nSetup Complete! Run 'make dev' or start servers manually." -ForegroundColor Cyan
