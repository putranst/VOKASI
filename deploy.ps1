# Deploy TSEA-X to Google Cloud Run
param(
    [string]$ProjectId,
    [string]$Region = "us-central1"
)

# Check if gcloud is installed
if (!(Get-Command "gcloud" -ErrorAction SilentlyContinue)) {
    Write-Error "gcloud CLI is not installed. Please install Google Cloud SDK."
    exit 1
}

# Get Project ID if not provided
if ([string]::IsNullOrEmpty($ProjectId)) {
    $ProjectId = gcloud config get-value project
    if ([string]::IsNullOrEmpty($ProjectId)) {
        $ProjectId = Read-Host "Enter your Google Cloud Project ID"
    }
}

Write-Host "Deploying to Project: $ProjectId in Region: $Region" -ForegroundColor Cyan

# Enable APIs
Write-Host "Enabling necessary APIs..." -ForegroundColor Yellow
gcloud services enable cloudbuild.googleapis.com run.googleapis.com artifactregistry.googleapis.com --project $ProjectId

# 1. Deploy Backend
Write-Host "Building and Deploying Backend..." -ForegroundColor Yellow
$BackendImage = "gcr.io/$ProjectId/tsea-x-backend"
gcloud builds submit --tag $BackendImage ./backend --project $ProjectId

Write-Host "Deploying Backend Service..." -ForegroundColor Yellow
gcloud run deploy tsea-x-backend `
    --image $BackendImage `
    --platform managed `
    --region $Region `
    --allow-unauthenticated `
    --project $ProjectId

# Get Backend URL
$BackendUrl = gcloud run services describe tsea-x-backend --platform managed --region $Region --format 'value(status.url)' --project $ProjectId
$ApiUrl = "$BackendUrl/api/v1"
Write-Host "Backend deployed at: $BackendUrl" -ForegroundColor Green

# 2. Deploy Frontend
Write-Host "Building and Deploying Frontend..." -ForegroundColor Yellow
$FrontendImage = "gcr.io/$ProjectId/tsea-x-frontend"

# Note: We need to pass the API URL as a build arg or env var. 
# For Next.js static generation, build args are better, but for runtime env vars (standalone), we use set-env-vars.
gcloud builds submit --tag $FrontendImage ./frontend --project $ProjectId

Write-Host "Deploying Frontend Service..." -ForegroundColor Yellow
gcloud run deploy tsea-x-frontend `
    --image $FrontendImage `
    --platform managed `
    --region $Region `
    --allow-unauthenticated `
    --set-env-vars NEXT_PUBLIC_API_URL=$ApiUrl `
    --project $ProjectId

$FrontendUrl = gcloud run services describe tsea-x-frontend --platform managed --region $Region --format 'value(status.url)' --project $ProjectId

Write-Host "`nDeployment Complete!" -ForegroundColor Green
Write-Host "Frontend: $FrontendUrl" -ForegroundColor Cyan
Write-Host "Backend:  $BackendUrl" -ForegroundColor Cyan
