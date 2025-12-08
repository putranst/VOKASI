$ProjectId = gcloud config get-value project
$ServiceAccount = "178367585998-compute@developer.gserviceaccount.com"

Write-Host "Granting roles to Service Account: $ServiceAccount in Project: $ProjectId" -ForegroundColor Yellow

# Grant Editor role (covers Storage, Artifact Registry, etc.)
gcloud projects add-iam-policy-binding $ProjectId `
    --member="serviceAccount:$ServiceAccount" `
    --role="roles/editor"

# Enable Cloud Build API
gcloud services enable cloudbuild.googleapis.com --project $ProjectId

Write-Host "Permissions updated. You can now retry deployment." -ForegroundColor Green
