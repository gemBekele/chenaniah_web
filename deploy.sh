#!/bin/bash

# Chenaniah.org Deployment Script
# This script will help deploy the Next.js application to your server

echo "🚀 Starting Chenaniah.org deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf chenaniah-web.tar.gz \
    --exclude=node_modules \
    --exclude=.next \
    --exclude=.git \
    --exclude=*.log \
    --exclude=.env.local \
    --exclude=.env \
    .

echo "✅ Deployment package created: chenaniah-web.tar.gz"

# Instructions for manual deployment
echo ""
echo "📋 Manual Deployment Instructions:"
echo "1. Upload the chenaniah-web.tar.gz file to your server:"
echo "   scp chenaniah-web.tar.gz barch@15.204.227.47:/home/barch/"
echo ""
echo "2. SSH into your server:"
echo "   ssh barch@15.204.227.47"
echo "   Password: 12345678"
echo ""
echo "3. On the server, run these commands:"
echo "   cd /home/barch"
echo "   tar -xzf chenaniah-web.tar.gz -C chenaniah-web/"
echo "   cd chenaniah-web"
echo "   npm install --legacy-peer-deps"
echo "   npm run build"
echo "   npm start"
echo ""
echo "4. Configure nginx (if needed) to proxy to port 3000"
echo ""
echo "🎉 Deployment complete!"
