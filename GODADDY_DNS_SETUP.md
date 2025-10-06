# GoDaddy DNS Configuration for chenaniah.org

This guide will help you configure your domain `chenaniah.org` on GoDaddy to point to your server.

## Prerequisites
- GoDaddy account with access to `chenaniah.org` domain
- Your server IP address: `15.204.227.47`

## Step 1: Access GoDaddy DNS Management

1. Log in to your GoDaddy account
2. Go to your **Domain Portfolio** or **My Products**
3. Find `chenaniah.org` and click on **DNS** or **Manage DNS**

## Step 2: Configure DNS Records

You need to set up the following DNS records:

### A Record (Main Domain)
- **Type**: A
- **Name**: @ (or leave blank)
- **Value**: 15.204.227.47
- **TTL**: 600 (10 minutes) or 3600 (1 hour)

### A Record (WWW Subdomain)
- **Type**: A
- **Name**: www
- **Value**: 15.204.227.47
- **TTL**: 600 (10 minutes) or 3600 (1 hour)

### CNAME Record (Optional - for www redirect)
- **Type**: CNAME
- **Name**: www
- **Value**: chenaniah.org
- **TTL**: 600 (10 minutes) or 3600 (1 hour)

## Step 3: Remove Conflicting Records

Make sure to remove or update any existing A records that might conflict:
- Remove any existing A records pointing to different IPs
- Remove any CNAME records that might conflict with your A records

## Step 4: Save Changes

1. Click **Save** or **Save Changes**
2. Wait for DNS propagation (can take 5-60 minutes)

## Step 5: Verify DNS Configuration

You can verify your DNS settings using these commands:

```bash
# Check A record for main domain
nslookup chenaniah.org

# Check A record for www subdomain
nslookup www.chenaniah.org

# Alternative using dig
dig chenaniah.org A
dig www.chenaniah.org A
```

Expected output should show:
```
chenaniah.org.    IN  A    15.204.227.47
www.chenaniah.org. IN A    15.204.227.47
```

## Step 6: Test Domain Resolution

After DNS propagation (usually within 1 hour):

```bash
# Test if domain resolves to your server
ping chenaniah.org
ping www.chenaniah.org

# Test HTTP connection
curl -I http://chenaniah.org
curl -I http://www.chenaniah.org
```

## Troubleshooting

### If DNS doesn't resolve:
1. **Wait longer**: DNS propagation can take up to 24 hours
2. **Check TTL**: Lower TTL values help with faster updates
3. **Clear DNS cache**: 
   - Windows: `ipconfig /flushdns`
   - Mac: `sudo dscacheutil -flushcache`
   - Linux: `sudo systemctl restart systemd-resolved`

### If you get "This site can't be reached":
1. Verify your server is running: `curl http://15.204.227.47:3000`
2. Check nginx configuration: `sudo nginx -t`
3. Check nginx status: `sudo systemctl status nginx`
4. Check PM2 status: `pm2 status`

### Common GoDaddy Issues:
1. **Caching**: GoDaddy sometimes caches old DNS records
2. **Propagation delays**: Can take longer than expected
3. **Record conflicts**: Make sure no conflicting records exist

## Security Considerations

After DNS is configured and your site is live:

1. **Enable HTTPS**: The deployment script will set up Let's Encrypt SSL
2. **Monitor logs**: Check nginx and application logs regularly
3. **Keep updated**: Ensure your server and applications are up to date

## Next Steps

Once DNS is configured:

1. Deploy your application using the provided deployment script
2. Set up SSL certificates
3. Test your site at https://chenaniah.org
4. Monitor for any issues

## Support

If you encounter issues:
1. Check GoDaddy's DNS documentation
2. Contact GoDaddy support if DNS issues persist
3. Verify server configuration and application status
