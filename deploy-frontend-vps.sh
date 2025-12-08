#!/bin/bash

# Frontend deployment script for VPS
# Run this on your VPS

set -e

echo "========================================"
echo "Chenaniah Frontend Deployment"
echo "========================================"
echo ""

# Navigate to frontend directory
cd /home/barch/projects/chenaniah/web/chenaniah-web
echo "✓ Changed to frontend directory"

# Pull latest changes from dev branch
echo "Pulling latest changes..."
git checkout dev
git pull origin dev

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the frontend
echo "Building frontend..."
npm run build

# Check if build succeeded
if [ ! -d ".next" ]; then
    echo "❌ Build failed - .next directory not found"
    exit 1
fi

echo "✓ Build successful"

# Stop old PM2 process if exists
echo "Stopping old PM2 process..."
pm2 delete chenaniah-web 2>/dev/null || true

# Start with PM2
echo "Starting with PM2..."
pm2 start npm --name "chenaniah-web" -- start

# Save PM2 config
pm2 save

echo ""
echo "========================================"
echo "✓ Frontend Deployment Complete!"
echo "========================================"
echo ""
echo "Check status: pm2 status"
echo "View logs: pm2 logs chenaniah-web"
echo "Visit: https://chenaniah.org"
echo ""
echo "Backend API: https://chenaniah.org/api/v2"

