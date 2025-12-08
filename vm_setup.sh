#!/bin/bash

# TSEA-X VM Setup Script
# Run this on a fresh Ubuntu 22.04 LTS instance

echo "🚀 Starting TSEA-X Server Provisioning..."

# 1. Update & Install Dependencies
echo "📦 Installing System Dependencies..."
sudo apt-get update
sudo apt-get install -y git curl python3-pip python3-venv nginx

# 2. Install Node.js 20.x
echo "🟢 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2 Process Manager
echo "⚙️ Installing PM2..."
sudo npm install -g pm2
sudo pm2 startup systemd

# 4. Clone/Setup Application
echo "📂 Setting up Application Directory..."
sudo mkdir -p /app
sudo chown -R $USER:$USER /app
cd /app

if [ ! -d "TSEA-X" ]; then
    echo "⬇️ Cloning Repository..."
    # NOTE: You will need to use a Personal Access Token or SSH key here locally
    git clone https://github.com/YOUR_GITHUB_USERNAME/TSEA-X.git
    cd TSEA-X
else
    cd TSEA-X
    echo "⬇️ Pulling latest changes..."
    git pull
fi

# 5. Backup Setup (Backend)
echo "🐍 Setting up Backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn psycopg2-binary
deactivate
cd ..

# 6. Frontend Setup
echo "⚛️ Setting up Frontend..."
cd frontend
npm install
npm run build
cd ..

# 7. Configure Nginx (Reverse Proxy)
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/tsea-x <<EOF
server {
    listen 80;
    server_name _;  # Replace with your domain later

    # Frontend Proxy
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API Proxy
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/tsea-x /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# 8. Start Services with PM2
echo "🚀 Starting Services..."
# Backend
pm2 delete tsea-backend 2>/dev/null || true
pm2 start "backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000" --name tsea-backend --cwd ./backend

# Frontend
pm2 delete tsea-frontend 2>/dev/null || true
pm2 start "npm start" --name tsea-frontend --cwd ./frontend --port 3000

pm2 save

echo "✅ Deployment Complete! Visit your IP address."
