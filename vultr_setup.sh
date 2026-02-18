#!/bin/bash
# ============================================================
# T6 Platform - Vultr VPS Setup Script
# Run this ONCE on a fresh Ubuntu 22.04 VPS
# Usage: bash vultr_setup.sh
# ============================================================

set -e  # Exit on any error

echo "============================================"
echo "  T6 Platform - Vultr VPS Initial Setup"
echo "============================================"

# --- 1. System Update ---
echo "[1/7] Updating system packages..."
apt-get update -y && apt-get upgrade -y

# --- 2. Install Docker ---
echo "[2/7] Installing Docker..."
apt-get install -y ca-certificates curl gnupg lsb-release git ufw

# Add Docker's official GPG key
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start and enable Docker
systemctl start docker
systemctl enable docker

echo "Docker installed: $(docker --version)"

# --- 3. Configure Firewall ---
echo "[3/7] Configuring UFW firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh        # Port 22
ufw allow http       # Port 80
ufw allow https      # Port 443
ufw --force enable
echo "Firewall configured."

# --- 4. Create App Directory ---
echo "[4/7] Creating app directory..."
mkdir -p /opt/tsea-x
cd /opt/tsea-x

# --- 5. Create log directory for Caddy ---
mkdir -p /var/log/caddy

# --- 6. Swap space (important for builds on small VPS) ---
echo "[5/7] Setting up swap space (2GB)..."
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo "Swap created."
else
    echo "Swap already exists, skipping."
fi

# --- 7. Done ---
echo ""
echo "============================================"
echo "  Setup Complete!"
echo "============================================"
echo ""
echo "NEXT STEPS:"
echo "  1. Upload your code to /opt/tsea-x/"
echo "     (use: git clone or scp)"
echo "  2. Create /opt/tsea-x/.env.production"
echo "     (copy from .env.production.example and fill in values)"
echo "  3. Run the deploy script:"
echo "     cd /opt/tsea-x && bash vultr_deploy.sh"
echo ""
