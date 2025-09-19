# Chenaniah.org Deployment Guide

## Prerequisites
- Node.js 18+ installed on the server
- npm or yarn package manager
- nginx (for reverse proxy)
- PM2 (for process management)

## Step 1: Upload the Application

```bash
# Upload the deployment package to your server
scp chenaniah-web.tar.gz barch@15.204.227.47:/home/barch/
```

## Step 2: SSH into the Server

```bash
ssh barch@15.204.227.47
# Password: 12345678
```

## Step 3: Extract and Setup the Application

```bash
# Create application directory
mkdir -p /home/barch/chenaniah-web
cd /home/barch

# Extract the application
tar -xzf chenaniah-web.tar.gz -C chenaniah-web/

# Navigate to the application directory
cd chenaniah-web

# Install dependencies
npm install --legacy-peer-deps

# Try to build the application
npm run build
```

## Step 4: Configure PM2 for Process Management

```bash
# Install PM2 globally
npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'chenaniah-web',
    script: 'npm',
    args: 'start',
    cwd: '/home/barch/chenaniah-web',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Start the application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

## Step 5: Configure Nginx (if needed)

```bash
# Create nginx configuration
sudo nano /etc/nginx/sites-available/chenaniah-web

# Add the following configuration:
server {
    listen 80;
    server_name your-domain.com;  # Replace with your actual domain

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

# Enable the site
sudo ln -s /etc/nginx/sites-available/chenaniah-web /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

## Step 6: Check Application Status

```bash
# Check PM2 status
pm2 status

# Check application logs
pm2 logs chenaniah-web

# Check if the application is running on port 3000
netstat -tlnp | grep :3000
```

## Troubleshooting

### If Build Fails
```bash
# Try running in development mode
npm run dev

# Or try with different Node version
nvm use 18
npm run build
```

### If Port 3000 is Already in Use
```bash
# Check what's using port 3000
sudo lsof -i :3000

# Kill the process if needed
sudo kill -9 <PID>

# Or change the port in ecosystem.config.js
```

### If PM2 Fails to Start
```bash
# Check PM2 logs
pm2 logs chenaniah-web --lines 50

# Restart the application
pm2 restart chenaniah-web

# Or delete and recreate
pm2 delete chenaniah-web
pm2 start ecosystem.config.js
```

## Monitoring

```bash
# Monitor application in real-time
pm2 monit

# View logs
pm2 logs chenaniah-web --follow

# Restart application
pm2 restart chenaniah-web

# Stop application
pm2 stop chenaniah-web
```

## File Structure on Server
```
/home/barch/chenaniah-web/
├── app/
├── components/
├── public/
├── package.json
├── next.config.mjs
├── ecosystem.config.js
└── ...
```

## Security Notes
- Make sure to configure firewall rules
- Use HTTPS in production
- Keep dependencies updated
- Monitor application logs regularly
