# VOKASI CI/CD Pipeline Runbook

This runbook defines the default delivery model for VOKASI.

## Branch Strategy

- `main`: production branch
- `staging`: pre-production branch

## Workflows

- `VOKASI Backend CI` (`.github/workflows/backend-ci.yml`)
  - Trigger: push/PR on `main` and `staging` for `backend/**`
  - Checks: dependency install, flake8, pytest
- `VOKASI Frontend CI` (`.github/workflows/frontend-ci.yml`)
  - Trigger: push/PR on `main` and `staging` for `frontend/**`
  - Checks: install, lint, build
- `VOKASI Monorepo CI` (`.github/workflows/ci.yml`)
  - Trigger: push/PR on `main` and `staging`
  - Checks: frontend build + backend dependency/import checks
- `VOKASI Deploy Staging` (`.github/workflows/deploy-staging.yml`)
  - Trigger: push to `staging` or manual dispatch
  - Action: build/push `vokasi-backend:staging` and `vokasi-frontend:staging`
  - Optional: SSH deploy to staging host
- `VOKASI Deploy Production` (`.github/workflows/deploy-production.yml`)
  - Trigger: push to `main` or manual dispatch
  - Action: build/push `vokasi-backend:latest|sha` and `vokasi-frontend:latest|sha`
  - Optional: SSH deploy to production host

## Registry

- Registry: `ghcr.io`
- Image naming:
  - `ghcr.io/<org-or-user>/<repo>/vokasi-backend:<tag>`
  - `ghcr.io/<org-or-user>/<repo>/vokasi-frontend:<tag>`

## Required Repository Secrets

### Base CI secrets (if backend tests require external providers)

- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `OPENROUTER_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

### Optional SSH deploy secrets (staging)

- `VOKASI_STG_SSH_HOST`
- `VOKASI_STG_SSH_USER`
- `VOKASI_STG_SSH_KEY`
- `VOKASI_STG_APP_DIR`

### Optional SSH deploy secrets (production)

- `VOKASI_PROD_SSH_HOST`
- `VOKASI_PROD_SSH_USER`
- `VOKASI_PROD_SSH_KEY`
- `VOKASI_PROD_APP_DIR`

## Deployment Behavior

The SSH deploy jobs are conditional. If SSH secrets are not set, workflows still build and publish images to GHCR, and deployment can be done manually on target hosts.

Manual deploy command on target host:

```bash
docker compose -f docker-compose.production.yml pull
docker compose -f docker-compose.production.yml up -d
```

## Enterprise Hardening Next

- Add protected environments in GitHub (`staging`, `production`) with required reviewers
- Add image vulnerability scanning (e.g. Trivy)
- Add SBOM generation and signing for release artifacts
- Add smoke tests post-deploy (health/API/login checks)
