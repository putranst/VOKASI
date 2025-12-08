#!/bin/bash

# TSEA-X HTTPS Setup Script
# This script installs Nginx and configures it to reverse proxy to the Next.js app running on port 3000.
# It supports both real domains (Let's Encrypt) and bare IPs (Self-Signed).

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting TSEA-X HTTPS Setup...${NC}"

# 1. Install Nginx and Certbot
echo -e "${YELLOW}Installing Nginx and Certbot...${NC}"
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx openssl

# 2. Get Domain or IP
read -p "Enter your domain name (e.g., example.com) OR leave empty to use current IP (Self-Signed): " DOMAIN

if [ -z "$DOMAIN" ]; then
    # --- SELF-SIGNED PATH (IP Address) ---
    IP=$(curl -s ifconfig.me)
    DOMAIN=$IP
    echo -e "${YELLOW}No domain provided. Setting up Self-Signed Certificate for IP: $IP${NC}"
    
    # Generate Self-Signed Cert
    sudo mkdir -p /etc/nginx/ssl
    sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/nginx-selfsigned.key \
        -out /etc/nginx/ssl/nginx-selfsigned.crt \
        -subj "/C=US/ST=State/L=City/O=TSEA-X/CN=$IP"

    # Create Nginx Config
    CONFIG="
server {
    listen 80;
    server_name $IP;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name $IP;

    ssl_certificate /etc/nginx/ssl/nginx-selfsigned.crt;
    ssl_certificate_key /etc/nginx/ssl/nginx-selfsigned.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
"
else
    # --- LET'S ENCRYPT PATH (Domain Name) ---
    echo -e "${YELLOW}Domain provided: $DOMAIN. Setting up Let's Encrypt...${NC}"

    # Create Basic Nginx Config first (for HTTP)
    CONFIG="
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
"
fi

# 3. Write Config
echo -e "${YELLOW}Writing Nginx Configuration...${NC}"
echo "$CONFIG" | sudo tee /etc/nginx/sites-available/tsea-x > /dev/null

# 4. Enable Site
sudo ln -sf /etc/nginx/sites-available/tsea-x /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 5. Test and Restart Nginx
echo -e "${YELLOW}Testing Nginx Configuration...${NC}"
sudo nginx -t
sudo systemctl restart nginx

# 6. Run Certbot (Only for Domain)
if [ ! -z "$DOMAIN" ] && [ "$DOMAIN" != "localhost" ] && [[ ! "$DOMAIN" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo -e "${YELLOW}Obtaining SSL Certificate via Certbot...${NC}"
    sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect
fi

echo -e "${GREEN}HTTPS Setup Complete!${NC}"
echo -e "Your app should now be accessible at https://$DOMAIN"
