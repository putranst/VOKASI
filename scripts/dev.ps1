param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("setup", "up", "down", "logs", "health", "backend", "frontend")]
  [string]$Task
)

$ErrorActionPreference = "Stop"

function Invoke-InDirectory {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path,
    [Parameter(Mandatory = $true)]
    [string]$Command
  )

  Push-Location $Path
  try {
    Invoke-Expression $Command
  }
  finally {
    Pop-Location
  }
}

switch ($Task) {
  "setup" {
    Write-Host "[setup] Installing backend and frontend dependencies..."
    Invoke-InDirectory -Path "backend" -Command "python -m venv .venv"
    Invoke-InDirectory -Path "backend" -Command ".\.venv\Scripts\python -m pip install -r requirements.txt"
    Invoke-InDirectory -Path "frontend" -Command "npm install"
  }
  "up" {
    Write-Host "[up] Starting stack with docker compose..."
    docker compose up --build
  }
  "down" {
    Write-Host "[down] Stopping stack..."
    docker compose down
  }
  "logs" {
    Write-Host "[logs] Streaming logs..."
    docker compose logs -f
  }
  "health" {
    Write-Host "[health] Checking backend health endpoint..."
    try {
      $response = Invoke-RestMethod -Method Get -Uri "http://localhost:8000/api/v1/health"
      Write-Output $response
    }
    catch {
      Write-Error "Health check failed. Is backend running on http://localhost:8000?"
      throw
    }
  }
  "backend" {
    Write-Host "[backend] Running backend in reload mode..."
    Invoke-InDirectory -Path "backend" -Command ".\.venv\Scripts\uvicorn app.main:app --reload --port 8000"
  }
  "frontend" {
    Write-Host "[frontend] Running frontend dev server..."
    Invoke-InDirectory -Path "frontend" -Command "npm run dev"
  }
}
