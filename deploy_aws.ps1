# deploy_aws.ps1
# =========================================
# TSEA-X AWS Deployment Script
# Deploys the application to an AWS EC2 Ubuntu instance via SSH/SCP
# =========================================
#
# Usage:
#   .\deploy_aws.ps1 -PublicIp "1.2.3.4" -KeyPath "C:\path\to\key.pem"
#
# Prerequisites:
#   - OpenSSH client installed (built into Windows 10+)
#   - EC2 instance with aws_setup.sh already run
#   - Security Group: ports 22, 80, 443 open

param (
    [Parameter(Mandatory=$true)]
    [string]$PublicIp,
    
    [Parameter(Mandatory=$true)]
    [string]$KeyPath,

    [string]$RemoteUser = "ubuntu",
    [string]$RemotePath = "/opt/tsea-x"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  TSEA-X AWS Deployment" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Target: $RemoteUser@$PublicIp" 
Write-Host "  Path:   $RemotePath"
Write-Host ""

# --- Step 1: Create production env files if they don't exist ---
Write-Host "[1/6] Checking production environment files..." -ForegroundColor Yellow

if (-not (Test-Path ".\backend\.env.production")) {
    Write-Host "  Creating backend/.env.production from your dev .env..." -ForegroundColor DarkYellow
    Copy-Item ".\backend\.env" ".\backend\.env.production"
    # Patch environment variable
    (Get-Content ".\backend\.env.production") -replace 'ENVIRONMENT=.*', 'ENVIRONMENT=production' | Set-Content ".\backend\.env.production"
    Write-Host "  >> Created backend/.env.production — review it before deploying!" -ForegroundColor Magenta
}

if (-not (Test-Path ".\frontend\.env.production")) {
    Write-Host "  Creating frontend/.env.production..." -ForegroundColor DarkYellow
    @"
NEXT_PUBLIC_BACKEND_URL=
NEXT_PUBLIC_SUPABASE_URL=$((Get-Content ".\frontend\.env.local" | Select-String "NEXT_PUBLIC_SUPABASE_URL=").ToString().Split('=',2)[1])
NEXT_PUBLIC_SUPABASE_ANON_KEY=$((Get-Content ".\frontend\.env.local" | Select-String "NEXT_PUBLIC_SUPABASE_ANON_KEY=").ToString().Split('=',2)[1])
NEXT_PUBLIC_ENVIRONMENT=production
"@ | Set-Content ".\frontend\.env.production"
    Write-Host "  >> Created frontend/.env.production" -ForegroundColor Magenta
}

# --- Step 2: Create remote directory ---
Write-Host "[2/6] Preparing remote server..." -ForegroundColor Yellow
ssh -i $KeyPath -o StrictHostKeyChecking=no "${RemoteUser}@${PublicIp}" "sudo mkdir -p ${RemotePath} && sudo chown -R ${RemoteUser}:${RemoteUser} ${RemotePath}"

# --- Step 3: Copy deployment files ---
Write-Host "[3/6] Uploading deployment configuration..." -ForegroundColor Yellow
scp -i $KeyPath -o StrictHostKeyChecking=no `
    .\docker-compose.aws.yml `
    .\Caddyfile `
    "${RemoteUser}@${PublicIp}:${RemotePath}/"

# Rename docker-compose.aws.yml to docker-compose.yml on remote
ssh -i $KeyPath "$RemoteUser@$PublicIp" "mv $RemotePath/docker-compose.aws.yml $RemotePath/docker-compose.yml"

# --- Step 4: Upload source code ---
Write-Host "[4/6] Uploading source code (this may take a few minutes)..." -ForegroundColor Yellow

# Upload backend
Write-Host "  Uploading backend..." -ForegroundColor DarkYellow
scp -i $KeyPath -r `
    .\backend\main.py `
    .\backend\models.py `
    .\backend\sql_models.py `
    .\backend\database.py `
    .\backend\mock_db.py `
    .\backend\seed_data.py `
    .\backend\requirements.txt `
    .\backend\Dockerfile `
    .\backend\.dockerignore `
    .\backend\.env.production `
    "${RemoteUser}@${PublicIp}:${RemotePath}/backend/"

# Upload backend subdirectories
ssh -i $KeyPath "${RemoteUser}@${PublicIp}" "mkdir -p ${RemotePath}/backend/services ${RemotePath}/backend/routers"
scp -i $KeyPath -r .\backend\services\* "${RemoteUser}@${PublicIp}:${RemotePath}/backend/services/"
scp -i $KeyPath -r .\backend\routers\* "${RemoteUser}@${PublicIp}:${RemotePath}/backend/routers/"

# Upload frontend
Write-Host "  Uploading frontend..." -ForegroundColor DarkYellow
ssh -i $KeyPath "${RemoteUser}@${PublicIp}" "mkdir -p ${RemotePath}/frontend"
scp -i $KeyPath `
    .\frontend\package.json `
    .\frontend\package-lock.json `
    .\frontend\next.config.ts `
    .\frontend\tsconfig.json `
    .\frontend\postcss.config.mjs `
    .\frontend\Dockerfile `
    .\frontend\.dockerignore `
    .\frontend\.env.production `
    "${RemoteUser}@${PublicIp}:${RemotePath}/frontend/"

# Upload frontend src and public
scp -i $KeyPath -r .\frontend\src "${RemoteUser}@${PublicIp}:${RemotePath}/frontend/"
scp -i $KeyPath -r .\frontend\public "${RemoteUser}@${PublicIp}:${RemotePath}/frontend/"

# Upload eslint config if it exists
if (Test-Path ".\frontend\eslint.config.mjs") {
    scp -i $KeyPath .\frontend\eslint.config.mjs "${RemoteUser}@${PublicIp}:${RemotePath}/frontend/"
}

# --- Step 5: Build and start containers ---
Write-Host "[5/6] Building and starting Docker containers (this takes 3-5 minutes)..." -ForegroundColor Yellow
ssh -i $KeyPath "${RemoteUser}@${PublicIp}" @"
cd $RemotePath

# Load frontend env vars as build args
export NEXT_PUBLIC_SUPABASE_URL=`$(grep NEXT_PUBLIC_SUPABASE_URL frontend/.env.production | cut -d= -f2-)
export NEXT_PUBLIC_SUPABASE_ANON_KEY=`$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY frontend/.env.production | cut -d= -f2-)

echo 'Building containers...'
docker compose build --no-cache

echo 'Starting containers...'
docker compose up -d --remove-orphans

echo 'Cleaning up old images...'
docker image prune -f
"@

# --- Step 6: Verify ---
Write-Host "[6/6] Verifying deployment..." -ForegroundColor Yellow
ssh -i $KeyPath "${RemoteUser}@${PublicIp}" "cd ${RemotePath} && docker compose ps && echo '' && echo 'Container logs (last 5 lines each):' && docker compose logs --tail=5"

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Visit: http://$PublicIp" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Useful commands (SSH into server):" -ForegroundColor DarkGray
Write-Host "    ssh -i $KeyPath $RemoteUser@$PublicIp" -ForegroundColor DarkGray
Write-Host "    cd $RemotePath && docker compose logs -f" -ForegroundColor DarkGray
Write-Host "    cd $RemotePath && docker compose restart" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  When DNS is ready (t6.tsea.asia -> $PublicIp):" -ForegroundColor Magenta
Write-Host "    1. Edit Caddyfile on server: swap Option A/B" -ForegroundColor Magenta
Write-Host "    2. docker compose restart caddy" -ForegroundColor Magenta
Write-Host ""
