# 🚀 Production Deployment Guide

## 📋 **Required Environment Variables**

Set these environment variables on your DigitalOcean server:

```bash
# Required Environment Variables
IRON_SESSION_PASSWORD="your-super-secret-session-password-at-least-32-characters-long"
ADMIN_WALLETS="your-wallet-address,another-admin-wallet"
PAYMENT_WALLET="your-payment-wallet-address"
SOLANA_RPC_URL="https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY"
DATABASE_URL="file:./dev.db"

# Optional
PUMP_FUN_LINK="https://pump.fun"
CONTRACT_ADDRESS="So11111111111111111111111111111111111111112"

# Rate Limiting (Optional - for Redis-based rate limiting)
UPSTASH_REDIS_REST_URL="your-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"
```

## 🛠️ **Production Deployment Steps**

### **1. Server Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Git
sudo apt install git -y
```

### **2. Clone and Setup Project**
```bash
# Clone your repository
git clone <your-repo-url>
cd roach-rally-clean

# Install dependencies
npm install

# Create environment file
nano .env
# Add all required environment variables above
```

### **3. Database Setup**
```bash
# Generate Prisma client
npx prisma generate

# Create database
npx prisma db push

# Optional: Seed database
npm run db:seed
```

### **4. Build and Start**
```bash
# Build the application
npm run build

# Start with PM2
pm2 start npm --name "roach-rally" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

## 🔧 **Production Rate Limiting Configuration**

The application now uses **generous but functional rate limits**:

- **Authentication**: 100 attempts per minute
- **Voting**: 50 votes per minute  
- **API Calls**: 1000 calls per minute
- **Admin Actions**: 200 actions per minute

### **Rate Limiting Behavior**

1. **With Redis** (recommended for production):
   - Uses Upstash Redis for distributed rate limiting
   - More accurate and persistent across server restarts
   - Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

2. **Without Redis** (fallback):
   - Uses in-memory rate limiting
   - Resets on server restart
   - Still provides protection against abuse

## 🌐 **Nginx Configuration**

```nginx
server {
    listen 80;
    server_name your-domain.com;

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

## 📊 **Monitoring & Logs**

### **Check Application Status**
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs roach-rally

# Restart application
pm2 restart roach-rally
```

### **Monitor Rate Limiting**
```bash
# Check if rate limiting is working
curl -I http://localhost:3000/api/race/current

# Test authentication endpoint
curl -X POST http://localhost:3000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"test","nonce":"test","signature":"test"}'
```

## 🔐 **Security Considerations**

1. **Environment Variables**: Keep all secrets secure
2. **Rate Limiting**: Prevents abuse while allowing normal usage
3. **Database**: SQLite file should be backed up regularly
4. **SSL**: Use Let's Encrypt for HTTPS in production

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Rate Limiting Too Strict**:
   ```bash
   # Check current limits in src/lib/ratelimit.ts
   # Adjust limits if needed
   ```

2. **Authentication Issues**:
   ```bash
   # Check environment variables
   echo $IRON_SESSION_PASSWORD
   echo $ADMIN_WALLETS
   ```

3. **Database Issues**:
   ```bash
   # Reset database if needed
   rm prisma/dev.db
   npx prisma db push
   ```

## 📈 **Performance Optimization**

1. **Enable Redis** for better rate limiting performance
2. **Use PM2 cluster mode** for multiple processes
3. **Set up monitoring** with PM2 monitoring tools
4. **Regular backups** of the SQLite database

## 🎯 **Production Checklist**

- [ ] Environment variables configured
- [ ] Database created and seeded
- [ ] Application built successfully
- [ ] PM2 process running
- [ ] Rate limiting working (not too strict)
- [ ] Authentication working
- [ ] Admin functions accessible
- [ ] SSL certificate installed (if using domain)
- [ ] Monitoring set up
- [ ] Backups configured

---

**Your Roach Rally application is now production-ready! 🪳🏁**
