# deploy_git.ps1
# Deployment script using Git Pull via SSH workflow

$VmName = "tsea-x-vm"
$Zone = "us-central1-a"

Write-Host "1. Initiating Git Push..." -ForegroundColor Cyan
git push
if ($LASTEXITCODE -ne 0) {
    Write-Error "Git push failed. Please check your repository status."
    exit 1
}

Write-Host "2. Connecting to VM ($VmName) to pull and rebuild..." -ForegroundColor Cyan
gcloud compute ssh $VmName --zone=$Zone --command="
    echo 'Connected to VM. Checking for repository...'
    
    # Check for T6 or TSEA-X directory
    if [ -d 'T6' ]; then
        cd T6
        echo '✅ Found T6 directory.'
    elif [ -d 'TSEA-X' ]; then
        cd TSEA-X
        echo '✅ Found TSEA-X directory.'
    else
        echo '❌ Repository not found (checked ~/T6 and ~/TSEA-X).'
        echo 'Please clone the repository first or ensure you are in the correct user directory.'
        exit 1
    fi

    echo '⬇️ Pulling latest changes from git...'
    git pull
    
    echo '🔄 Rebuilding and restarting containers...'
    echo 'Using docker-compose.yml (includes Caddy)'
    sudo docker-compose -f docker-compose.yml up -d --build
    
    # Prune unused images to save space
    sudo docker image prune -f

    echo '📋 Current Status:'
    sudo docker-compose ps
"

Write-Host "`nDeployment Command Sent!" -ForegroundColor Green
