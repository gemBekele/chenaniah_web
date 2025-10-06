#!/bin/bash

# SSL Setup Script for chenaniah.org
# This script sets up Let's Encrypt SSL certificates

echo "🔒 Setting up SSL certificates for chenaniah.org..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run this script as root (use sudo)"
    exit 1
fi

# Update system packages
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install certbot and nginx plugin
echo "🔧 Installing certbot and nginx plugin..."
apt install -y certbot python3-certbot-nginx

# Stop nginx temporarily
echo "⏸️ Stopping nginx temporarily..."
systemctl stop nginx

# Obtain SSL certificate
echo "🔐 Obtaining SSL certificate for chenaniah.org..."
certbot certonly --standalone -d chenaniah.org -d www.chenaniah.org --email admin@chenaniah.org --agree-tos --non-interactive

# Check if certificate was obtained successfully
if [ $? -eq 0 ]; then
    echo "✅ SSL certificate obtained successfully!"
    
    # Set up automatic renewal
    echo "🔄 Setting up automatic certificate renewal..."
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    echo "✅ SSL setup complete!"
    echo "📋 Next steps:"
    echo "1. Copy nginx-chenaniah.conf to /etc/nginx/sites-available/chenaniah.org"
    echo "2. Enable the site: ln -s /etc/nginx/sites-available/chenaniah.org /etc/nginx/sites-enabled/"
    echo "3. Test nginx config: nginx -t"
    echo "4. Start nginx: systemctl start nginx"
    echo "5. Enable nginx: systemctl enable nginx"
else
    echo "❌ Failed to obtain SSL certificate"
    echo "Please check your domain DNS settings and try again"
    exit 1
fi
