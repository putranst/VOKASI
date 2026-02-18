#!/bin/bash
# ============================================================
# T6 Platform - Vultr Deploy Script
# Run this every time you want to deploy/update
# Usage: cd /opt/tsea-x && bash vultr_deploy.sh
# ============================================================

set -e

APP_DIR="/opt/tsea-x"
COMPOSE_FILE="docker-compose.vultr.yml"

echo "============================================"
echo "  T6 Platform - Deploying to Vultr VPS"
echo "============================================"

# --- Check we're in the right directory ---
cd "$APP_DIR"

# --- Check .env.production exists ---
if [ ! -f ".env.production" ]; then
    echo "ERROR: .env.production not found!"
    echo "Copy .env.production.example to .env.production and fill in your values."
    exit 1
fi

# --- Load env vars for build args ---
export $(grep -v '^#' .env.production | xargs)

echo "[1/5] Pulling latest code from Git..."
git pull origin main

echo "[2/5] Stopping existing containers..."
docker compose -f "$COMPOSE_FILE" down --remove-orphans || true

echo "[3/5] Building Docker images..."
docker compose -f "$COMPOSE_FILE" build --no-cache

echo "[4/5] Starting services..."
docker compose -f "$COMPOSE_FILE" --env-file .env.production up -d

echo "[5/5] Waiting for health checks (45s)..."
sleep 45

# Check if services are running
echo ""
echo "--- Service Status ---"
docker compose -f "$COMPOSE_FILE" ps

echo ""
echo "--- Backend Health Check ---"
if curl -sf http://localhost:8000/api/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "⚠️  Backend health check failed - checking logs..."
    docker compose -f "$COMPOSE_FILE" logs backend --tail=30
fi

echo ""
echo "--- Frontend Check ---"
if curl -sf http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is running"
else
    echo "⚠️  Frontend not responding - checking logs..."
    docker compose -f "$COMPOSE_FILE" logs frontend --tail=30
fi

echo ""
echo "============================================"
echo "  Deployment Complete!"
echo "============================================"
echo ""
echo "Your T6 platform should be live at:"
echo "  https://t6.tsea.asia"
echo ""
echo "Useful commands:"
echo "  View logs:    docker compose -f $COMPOSE_FILE logs -f"
echo "  Restart:      docker compose -f $COMPOSE_FILE restart"
echo "  Stop all:     docker compose -f $COMPOSE_FILE down"
echo ""
