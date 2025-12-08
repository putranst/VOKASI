#!/bin/bash

# TSEA-X Persistence Setup Script
# This script installs PM2 (Process Manager) to keep the servers running in the background.

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting TSEA-X Persistence Setup...${NC}"

# 1. Install PM2 globally
echo -e "${YELLOW}Installing PM2...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed. Please install Node.js first.${NC}"
    exit 1
fi
sudo npm install -g pm2

# 2. Setup Backend (FastAPI)
echo -e "${YELLOW}Configuring Backend process...${NC}"
# Try to find the python virtual environment
PYTHON_INTERPRETER=""
if [ -d ".venv" ]; then
    PYTHON_INTERPRETER="./.venv/bin/python"
elif [ -d "venv" ]; then
    PYTHON_INTERPRETER="./venv/bin/python"
else
    echo -e "${RED}Warning: No virtual environment (.venv or venv) found. Using system python3.${NC}"
    PYTHON_INTERPRETER="python3"
fi

# Stop existing if any
pm2 delete tsea-backend 2>/dev/null || true

# Start Backend
pm2 start backend/main.py --name tsea-backend --interpreter $PYTHON_INTERPRETER

# 3. Setup Frontend (Next.js)
echo -e "${YELLOW}Configuring Frontend process...${NC}"
# Stop existing if any
pm2 delete tsea-frontend 2>/dev/null || true

# Start Frontend
cd frontend
pm2 start npm --name tsea-frontend -- start
cd ..

# 4. Save and Setup Startup Hook
echo -e "${YELLOW}Saving PM2 list and configuring startup hook...${NC}"
pm2 save

# Generate startup script (this usually requires sudo, so we print instructions or try to execute)
# We use 'pm2 startup' to generate the command, then execute it.
# Detecting system is tricky, but usually 'pm2 startup' detects it.
echo -e "${YELLOW}Configuring system startup...${NC}"
STARTUP_CMD=$(pm2 startup | grep "sudo env PATH")
if [ ! -z "$STARTUP_CMD" ]; then
    eval $STARTUP_CMD
else
    # Fallback if the grep failed (sometimes it outputs differently)
    pm2 startup
fi

pm2 save

echo -e "${GREEN}Persistence Setup Complete!${NC}"
echo -e "${GREEN}Status check:${NC}"
pm2 status

echo -e "\nUse 'pm2 logs' to view server logs."
echo -e "Use 'pm2 status' to check availability."
