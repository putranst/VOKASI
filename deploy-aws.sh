#!/bin/bash
# TSEA-X AWS Deployment Script
# Run this on your AWS Ubuntu server

set -e

echo "========================================"
echo "TSEA-X AWS Deployment"
echo "========================================"

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "Docker installed. Please logout and login again, then re-run this script."
    exit 0
fi

# Check for Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo apt-get update
    sudo apt-get install -y docker-compose-plugin
fi

# Create app directory
sudo mkdir -p /app/t6
sudo chown -R $USER:$USER /app
cd /app/t6

# Clone or update repository
if [ -d ".git" ]; then
    echo "Updating existing repository..."
    git pull origin main
else
    echo "Cloning repository..."
    git clone https://github.com/putranasution-tsea/T6.git .
fi

# Create .env files from examples if they don't exist
if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env from .env.production.example..."
    cp backend/.env.production.example backend/.env
    echo "⚠️  Please edit backend/.env and add your API keys!"
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "Creating frontend/.env.local from .env.production.example..."
    cp frontend/.env.production.example frontend/.env.local
    echo "⚠️  Please edit frontend/.env.local and add your Supabase credentials!"
fi

# Build and start containers
echo "Building and starting containers..."
docker compose -f docker-compose.production.yml build
docker compose -f docker-compose.production.yml up -d

# Check status
echo ""
echo "========================================"
echo "✅ Deployment Complete!"
echo "========================================"
echo ""
docker compose -f docker-compose.production.yml ps
echo ""
echo "Frontend: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000"
echo "Backend:  http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8000"
echo "API Docs: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8000/docs"