# AWS Ubuntu Deployment Guide

## Prerequisites
- AWS Ubuntu Server (22.04 LTS recommended)
- SSH access to your server
- Git repository access

## Step 1: Connect to Your AWS Server

```bash
ssh -i /path/to/your-key.pem ubuntu@<your-aws-public-ip>
```

## Step 2: Install Docker

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt-get install -y docker-compose-plugin

# Logout and login again for group change
exit
```

## Step 3: Clone Repository

```bash
# Reconnect
ssh -i /path/to/your-key.pem ubuntu@<your-aws-public-ip>

# Create app directory
sudo mkdir -p /app/t6
sudo chown -R $USER:$USER /app
cd /app/t6

# Clone repository
git clone https://github.com/putranasution-tsea/T6.git .
```

## Step 4: Configure Environment Variables

### Backend (.env)

```bash
cd /app/t6
cp backend/.env.production.example backend/.env
nano backend/.env
```

Edit `backend/.env` with your values:
```
ENVIRONMENT=production
GEMINI_API_KEY=<your-gemini-api-key>
OPENROUTER_API_KEY=<your-openrouter-api-key>
OPENROUTER_MODEL=google/gemini-2.0-flash-001
DATABASE_URL=sqlite:///./tsea.db
CORS_ORIGINS=http://<your-aws-public-ip>:3000,http://localhost:3000
SECRET_KEY=<generate-a-random-string>
```

### Frontend (.env.local)

```bash
cp frontend/.env.production.example frontend/.env.local
nano frontend/.env.local
```

Edit `frontend/.env.local` with your values:
```
NEXT_PUBLIC_BACKEND_URL=http://<your-aws-public-ip>:8000
NEXT_PUBLIC_SUPABASE_URL=https://tbshdtudypejjbxcrddl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
NEXT_PUBLIC_ENVIRONMENT=production
```

## Step 5: Configure AWS Security Group

In AWS Console, add inbound rules:
- **Port 22** (SSH) - Your IP
- **Port 80** (HTTP) - 0.0.0.0/0
- **Port 443** (HTTPS) - 0.0.0.0/0
- **Port 3000** (Frontend) - 0.0.0.0/0
- **Port 8000** (Backend) - 0.0.0.0/0

## Step 6: Deploy

```bash
cd /app/t6

# Build and start
docker compose -f docker-compose.production.yml build
docker compose -f docker-compose.production.yml up -d

# Check status
docker compose -f docker-compose.production.yml ps

# View logs
docker compose -f docker-compose.production.yml logs -f
```

## Step 7: Access Your Application

- **Frontend**: http://<your-aws-public-ip>:3000
- **Backend API**: http://<your-aws-public-ip>:8000/docs
- **Health Check**: http://<your-aws-public-ip>:8000/api/health

## Useful Commands

```bash
# Stop services
docker compose -f docker-compose.production.yml down

# Restart services
docker compose -f docker-compose.production.yml restart

# Rebuild after code changes
git pull
docker compose -f docker-compose.production.yml build
docker compose -f docker-compose.production.yml up -d

# View backend logs
docker compose -f docker-compose.production.yml logs -f backend

# View frontend logs
docker compose -f docker-compose.production.yml logs -f frontend
```

## Environment Variables Needed

### From Your Local Development:
- `GEMINI_API_KEY` - From your local `backend/.env`
- `OPENROUTER_API_KEY` - From your local `backend/.env`
- `NEXT_PUBLIC_SUPABASE_URL` - From your local `frontend/.env.local`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - From your local `frontend/.env.local`

### Generate New:
- `SECRET_KEY` - Run: `python -c "import secrets; print(secrets.token_urlsafe(32))"`