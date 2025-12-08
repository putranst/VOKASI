# deploy_vm.ps1
$ProjectId = "tsea-x-platform"
$Region = "us-central1"
$Zone = "us-central1-a"
$VmName = "tsea-x-vm"
$StaticIpName = "tsea-x-ip"
$Domain = "t6.tsea.asia"

# 1. Configure Project
Write-Host "Configuring Project $ProjectId..." -ForegroundColor Yellow
gcloud config set project $ProjectId

# 2. Reserve Static IP
Write-Host "Checking Static IP..." -ForegroundColor Yellow
$IpExists = gcloud compute addresses list --filter="name=$StaticIpName" --format="value(address)"
if (-not $IpExists) {
    Write-Host "Creating Static IP $StaticIpName..."
    gcloud compute addresses create $StaticIpName --region=$Region
}
$StaticIp = gcloud compute addresses describe $StaticIpName --region=$Region --format="value(address)"
Write-Host "Static IP: $StaticIp" -ForegroundColor Green
Write-Host "IMPORTANT: Please update your DNS A-record for $Domain to point to $StaticIp" -ForegroundColor Magenta

# 3. Build Images (Frontend needs new API URL)
Write-Host "Building Backend..." -ForegroundColor Yellow
gcloud builds submit --tag "gcr.io/$ProjectId/tsea-x-backend:latest" ./backend

Write-Host "Building Frontend (with API URL: https://$Domain/api)..." -ForegroundColor Yellow
# Note: Next.js bakes in NEXT_PUBLIC_ vars at build time
gcloud builds submit --tag "gcr.io/$ProjectId/tsea-x-frontend:latest" ./frontend --substitutions=_NEXT_PUBLIC_API_URL="https://$Domain/api"

# 4. Create/Update VM
Write-Host "Checking VM..." -ForegroundColor Yellow
$VmExists = gcloud compute instances list --filter="name=$VmName" --format="value(name)"
if (-not $VmExists) {
    Write-Host "Creating VM $VmName..."
    # Create VM with Docker installed via startup script
    gcloud compute instances create $VmName `
        --zone=$Zone `
        --machine-type=e2-medium `
        --image-family=ubuntu-2204-lts `
        --image-project=ubuntu-os-cloud `
        --tags=http-server, https-server `
        --address=$StaticIp `
        --scopes=https://www.googleapis.com/auth/cloud-platform `
        --metadata=startup-script='#! /bin/bash
        apt-get update
        apt-get install -y docker.io docker-compose
        gcloud auth configure-docker -q
        '
    
    Write-Host "Waiting for VM to initialize (60s)..."
    Start-Sleep -Seconds 60
}
else {
    Write-Host "VM $VmName already exists."
}

# 5. Deploy Configuration
Write-Host "Deploying Configuration to VM..." -ForegroundColor Yellow
# Retry loop for SSH availability
for ($i = 1; $i -le 5; $i++) {
    try {
        gcloud compute scp docker-compose.yml nginx.conf ${VmName}:~/ --zone=$Zone
        break
    }
    catch {
        Write-Host "Waiting for SSH... ($i/5)"
        Start-Sleep -Seconds 10
    }
}

# 6. Start Services
Write-Host "Starting Services on VM..." -ForegroundColor Yellow
gcloud compute ssh $VmName --zone=$Zone --command="
    sudo gcloud auth configure-docker -q
    sudo docker-compose pull
    sudo docker-compose up -d --remove-orphans
    sudo docker-compose ps
"

Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "Visit http://$StaticIp or http://$Domain (after DNS update)"
