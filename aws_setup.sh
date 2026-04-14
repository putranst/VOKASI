#!/bin/bash
# =========================================
# TSEA-X AWS Server Setup Script
# Run on a fresh Ubuntu 22.04/24.04 LTS EC2 instance
# Usage: chmod +x aws_setup.sh && ./aws_setup.sh
# =========================================

set -e

echo "========================================="
echo "  TSEA-X Server Provisioning"
echo "========================================="

# 1. Update system
echo "[1/5] Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# 2. Install Docker
echo "[2/5] Installing Docker..."
sudo apt-get install -y ca-certificates curl gnupg lsb-release
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 3. Add current user to docker group (avoids needing sudo for docker)
echo "[3/5] Configuring Docker permissions..."
sudo usermod -aG docker $USER

# 4. Install Git
echo "[4/5] Installing Git..."
sudo apt-get install -y git

# 5. Create app directory
echo "[5/5] Creating application directory..."
sudo mkdir -p /opt/tsea-x
sudo chown -R $USER:$USER /opt/tsea-x

# 6. Enable Docker to start on boot
sudo systemctl enable docker
sudo systemctl start docker

echo ""
echo "========================================="
echo "  Setup Complete!"
echo "========================================="
echo ""
echo "IMPORTANT: Log out and log back in for Docker group changes to take effect."
echo "  Run: exit"
echo "  Then SSH back in."
echo ""
echo "Next steps:"
echo "  1. Clone or copy your project to /opt/tsea-x/"
echo "  2. Create .env.production files"
echo "  3. Run: cd /opt/tsea-x && docker compose -f docker-compose.aws.yml up -d --build"
echo ""
