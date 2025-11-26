# Frontend Deployment Guide

This guide explains how to deploy the Next.js frontend to work with the backend at `https://chenaniah.org/api/v2`.

## Configuration Changes Made

1. **API URL updated** to point to `https://chenaniah.org/api/v2/api`
2. **Gender field added** to registration form
3. **Coming soon notices** added to student portal
4. **Dev branch** created for deployment

## Environment Variables

The frontend now uses:
- **Production:** `https://chenaniah.org/api/v2/api`
- **Local Dev:** `http://localhost:5001/api` (when running on localhost)

## Deployment Options

### Option 1: Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from dev branch
cd /home/barch/projects/chenaniah/web/chenaniah-web
git checkout dev
vercel --prod

# During setup, add environment variable:
# NEXT_PUBLIC_API_URL=https://chenaniah.org/api/v2/api
```

### Option 2: Deploy to VPS with PM2

```bash
# On your VPS
cd /home/barch/projects/chenaniah/web/chenaniah-web

# Pull latest changes
git checkout dev
git pull origin dev

# Install dependencies
npm install

# Build
npm run build

# Start with PM2
pm2 start npm --name "chenaniah-web" -- start

# Save PM2 config
pm2 save
```

### Option 3: Static Export

```bash
# Build static export
npm run build

# Copy to web server
scp -r .next user@vps:/var/www/chenaniah/
```

## Testing the Frontend

After deployment, test these flows:

### 1. Registration Flow
```
1. Visit https://chenaniah.org/register
2. Enter a phone number that has an accepted interview
3. Fill in the form (including Gender dropdown)
4. Submit registration
5. Should redirect to dashboard
```

### 2. Login Flow
```
1. Visit https://chenaniah.org/login or /student/login
2. Enter username and password
3. Should redirect to dashboard
```

### 3. Dashboard
```
1. Should show "Portal Under Development" banner
2. Profile completion should work
3. Coming soon sections visible
```

## Quick Deploy Script for VPS

Create this script on your VPS:

```bash
#!/bin/bash
# deploy-frontend-vps.sh

cd /home/barch/projects/chenaniah/web/chenaniah-web

# Pull latest
git checkout dev
git pull origin dev

# Install deps
npm install

# Build
npm run build

# Restart PM2
pm2 restart chenaniah-web || pm2 start npm --name "chenaniah-web" -- start

# Save
pm2 save

echo "✓ Frontend deployed!"
echo "Make sure Nginx is configured to serve the frontend"
```

## Nginx Configuration for Frontend

If hosting on VPS, your Nginx config should look like:

```nginx
server {
    listen 443 ssl;
    server_name chenaniah.org www.chenaniah.org;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/www.chenaniah.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.chenaniah.org/privkey.pem;

    # API v2 (Node.js backend - port 5001)
    location /api/v2/ {
        rewrite ^/api/v2/(.*) /$1 break;
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 50M;
    }

    # Frontend (Next.js - port 3000)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Verify API Connection

After deploying, check the browser console:

```javascript
// Should show API calls to https://chenaniah.org/api/v2/api/...
```

## Environment Variable Priority

The frontend checks in this order:
1. `NEXT_PUBLIC_API_URL` environment variable (if set)
2. If on localhost → `http://localhost:5001/api`
3. Default → `https://chenaniah.org/api/v2/api`

## For Local Development

To test locally with production backend:

```bash
cd /home/barch/projects/chenaniah/web/chenaniah-web

# Create .env.local (not tracked by git)
echo "NEXT_PUBLIC_API_URL=https://chenaniah.org/api/v2/api" > .env.local

# Run dev server
npm run dev

# Visit http://localhost:3000
```

## Troubleshooting

### CORS errors
- Check backend CORS_ORIGINS in `.env`
- Should include: `https://chenaniah.org,https://www.chenaniah.org`

### API calls failing
- Check browser console for actual URL being called
- Verify backend is running: `pm2 status`
- Test backend directly: `curl https://chenaniah.org/api/v2/api/health`

### 404 errors on refresh
- For Next.js standalone: Configure Nginx to handle client-side routing
- Add `try_files` directive or proxy all requests to Next.js

## API URL Format

Note the URL structure:
- Backend base: `https://chenaniah.org/api/v2`
- Nginx strips `/api/v2` → forwards to `http://localhost:5001`
- Frontend adds `/api` → final URL: `/api/health`
- Full path: `https://chenaniah.org/api/v2` + `/api/health` → `http://localhost:5001/api/health` ✓

This is why the utils function returns `https://chenaniah.org/api/v2/api`

