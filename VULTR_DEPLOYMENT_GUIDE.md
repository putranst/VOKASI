# 🚀 T6 Platform — Vultr VPS Deployment Guide

## Overview

This guide deploys the T6 platform (Next.js frontend + FastAPI backend) to a **Vultr VPS** using Docker Compose + Caddy (automatic HTTPS). No GCP dependencies.

**Architecture on VPS:**
```
Internet → Caddy (80/443, auto HTTPS) → Frontend (port 3000)
                                       → Backend  (port 8000)
```

---

## 📋 Prerequisites

Before starting, have these ready:
- [ ] A **Vultr account** at [vultr.com](https://vultr.com)
- [ ] Your domain `t6.tsea.asia` DNS A-record pointing to the VPS IP
- [ ] Your API keys: `OPENAI_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`
- [ ] Your Supabase credentials (URL + anon key)
- [ ] Git repository with your latest code (or ability to SCP files)

---

## Step 1: Create the Vultr VPS

1. Log in to [my.vultr.com](https://my.vultr.com)
2. Click **Deploy** → **Cloud Compute**
3. Choose these settings:
   - **Location**: Singapore or Tokyo (closest to your users)
   - **Image**: Ubuntu 22.04 LTS x64
   - **Plan**: **Regular Cloud Compute — 2 vCPU / 4 GB RAM / 80 GB SSD** (~$24/month)
     - ⚠️ Minimum: 2GB RAM. The Next.js build requires ~1.5GB RAM.
   - **Additional Features**: Enable **IPv6** (optional), **Backups** (recommended, +20%)
4. Add your **SSH key** (strongly recommended over password)
5. Set **Hostname**: `t6-platform`
6. Click **Deploy Now**

> ⏱️ VPS will be ready in ~60 seconds. Note the **IP address**.

---

## Step 2: Point Your Domain to the VPS

In your DNS provider (wherever `tsea.asia` is managed):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `t6` | `YOUR_VPS_IP` | 300 |

> ⏱️ DNS propagation takes 5–30 minutes. You can proceed while waiting.

---

## Step 3: SSH Into Your VPS

```bash
# From your Windows machine (PowerShell or Windows Terminal)
ssh root@YOUR_VPS_IP
```

---

## Step 4: Run the One-Time Setup Script

```bash
# Download and run the setup script
curl -fsSL https://raw.githubusercontent.com/YOUR_GITHUB/TSEA-X/main/vultr_setup.sh | bash

# OR if you uploaded the file manually:
bash /opt/tsea-x/vultr_setup.sh
```

This installs Docker, configures the firewall, and creates swap space. Takes ~3 minutes.

---

## Step 5: Upload Your Code to the VPS

**Option A: Git Clone (Recommended)**
```bash
cd /opt
git clone https://github.com/YOUR_GITHUB_USERNAME/TSEA-X.git tsea-x
cd tsea-x
```

**Option B: SCP from Windows (if repo is private)**
```powershell
# Run from your Windows machine in PowerShell
scp -r C:\Users\PT\Desktop\TSEA-X root@YOUR_VPS_IP:/opt/tsea-x
```

---

## Step 6: Create the Production Environment File

```bash
cd /opt/tsea-x

# Copy the template
cp .env.production.example .env.production

# Edit it with your real values
nano .env.production
```

Fill in all values in `.env.production`:

```env
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
OPENROUTER_API_KEY=sk-or-...

DATABASE_URL=postgresql://postgres:PASSWORD@db.XXXX.supabase.co:5432/postgres
SUPABASE_URL=https://XXXX.supabase.co
SUPABASE_ANON_KEY=eyJ...

ENVIRONMENT=production
DEBUG=false

NEXT_PUBLIC_BACKEND_URL=https://t6.tsea.asia
NEXT_PUBLIC_SUPABASE_URL=https://XXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Save with `Ctrl+X`, then `Y`, then `Enter`.

---

## Step 7: Deploy!

```bash
cd /opt/tsea-x
bash vultr_deploy.sh
```

This will:
1. Pull latest code from Git
2. Build Docker images (takes ~5–10 minutes first time)
3. Start all containers
4. Run health checks
5. Caddy automatically obtains SSL certificate from Let's Encrypt

> ⏱️ First deployment takes 5–10 minutes due to Docker builds.

---

## Step 8: Verify Everything Works

```bash
# Check all containers are running
docker compose -f docker-compose.vultr.yml ps

# Check logs
docker compose -f docker-compose.vultr.yml logs -f

# Test backend health
curl https://t6.tsea.asia/api/health

# Test frontend
curl -I https://t6.tsea.asia
```

Visit **https://t6.tsea.asia** in your browser. 🎉

---

## 🔄 Updating the Platform (Future Deployments)

Every time you push new code:

```bash
# On your VPS
cd /opt/tsea-x
bash vultr_deploy.sh
```

Or set up a simple update alias:
```bash
echo 'alias t6-deploy="cd /opt/tsea-x && bash vultr_deploy.sh"' >> ~/.bashrc
source ~/.bashrc
# Then just run:
t6-deploy
```

---

## 🛠️ Useful Management Commands

```bash
# View live logs
docker compose -f docker-compose.vultr.yml logs -f

# View only backend logs
docker compose -f docker-compose.vultr.yml logs -f backend

# Restart a specific service
docker compose -f docker-compose.vultr.yml restart backend

# Stop everything
docker compose -f docker-compose.vultr.yml down

# Check disk usage
df -h
docker system df
```

---

## 🗄️ Database Options

### Option A: Keep Using Supabase (Recommended — Zero Effort)
Your existing Supabase setup works perfectly. Just set `DATABASE_URL` in `.env.production` to your Supabase PostgreSQL connection string. No changes needed.

### Option B: Local PostgreSQL on VPS (For full control)
Add this to `docker-compose.vultr.yml` if you want the DB on the VPS:

```yaml
  postgres:
    image: postgres:15-alpine
    container_name: tsea-x-postgres
    restart: always
    environment:
      POSTGRES_DB: tsea_x
      POSTGRES_USER: tsea_user
      POSTGRES_PASSWORD: STRONG_PASSWORD_HERE
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
```

Then set `DATABASE_URL=postgresql://tsea_user:STRONG_PASSWORD_HERE@postgres:5432/tsea_x`

---

## 🔒 Security Checklist

- [ ] `.env.production` is in `.gitignore` (already done ✅)
- [ ] UFW firewall only allows ports 22, 80, 443 (done by `vultr_setup.sh` ✅)
- [ ] SSH key authentication (set up in Step 1)
- [ ] Caddy handles HTTPS automatically ✅
- [ ] Consider disabling root SSH login after setup:
  ```bash
  # Create a non-root user
  adduser deploy
  usermod -aG sudo deploy
  usermod -aG docker deploy
  ```

---

## 💰 Estimated Monthly Cost

| Resource | Cost |
|----------|------|
| Vultr 2vCPU/4GB VPS | ~$24/month |
| Vultr Backups (optional) | ~$4.80/month |
| Domain (tsea.asia) | Already owned |
| SSL Certificate | **Free** (Let's Encrypt via Caddy) |
| **Total** | **~$24–29/month** |

---

## 🆘 Troubleshooting

**Build fails with "out of memory"**
```bash
# Check swap is active
free -h
# If not, re-run setup script or manually:
swapon /swapfile
```

**Caddy can't get SSL certificate**
- Ensure DNS A-record is pointing to your VPS IP
- Ensure ports 80 and 443 are open: `ufw status`
- Check Caddy logs: `docker compose -f docker-compose.vultr.yml logs caddy`

**Backend container keeps restarting**
```bash
docker compose -f docker-compose.vultr.yml logs backend --tail=50
# Usually a missing env var or database connection issue
```

**Frontend shows blank page**
```bash
docker compose -f docker-compose.vultr.yml logs frontend --tail=50
# Check NEXT_PUBLIC_BACKEND_URL is set correctly in .env.production
```
