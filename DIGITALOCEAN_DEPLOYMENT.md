# 🚀 DigitalOcean Deployment Guide

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
```

## 🛠️ **Deployment Steps**

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

## 🔧 **Common Issues & Solutions**

### **Issue 1: Environment Variables Not Found**
**Error**: `Environment variables not found`
**Solution**:
```bash
# Check if .env file exists
ls -la .env

# Verify environment variables are loaded
node -e "console.log(process.env.IRON_SESSION_PASSWORD)"
```

### **Issue 2: Database Connection Failed**
**Error**: `Database connection failed`
**Solution**:
```bash
# Check database file permissions
ls -la prisma/dev.db

# Regenerate Prisma client
npx prisma generate

# Reset database if needed
rm prisma/dev.db
npx prisma db push
```

### **Issue 3: Build Failures**
**Error**: `Build failed`
**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version (should be 18+)
node --version

# Try building again
npm run build
```

### **Issue 4: Port Issues**
**Error**: `Port already in use`
**Solution**:
```bash
# Check what's using port 3000
sudo lsof -i :3000

# Kill process if needed
sudo kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

### **Issue 5: Solana RPC Issues**
**Error**: `Solana RPC connection failed`
**Solution**:
```bash
# Test RPC connection
curl -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}' \
  $SOLANA_RPC_URL

# Get free RPC from helius.xyz or use public endpoint
SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
```

## 🔍 **Debugging Commands**

### **Check Application Status**
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs roach-rally

# Restart application
pm2 restart roach-rally
```

### **Check Environment**
```bash
# Verify environment variables
pm2 env 0

# Check if app is running
curl http://localhost:3000
```

### **Database Debugging**
```bash
# Open Prisma Studio
npx prisma studio

# Check database schema
npx prisma db pull
```

## 🌐 **Nginx Configuration (Optional)**

If using Nginx as reverse proxy:

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

## 📊 **Monitoring**

### **Set up monitoring**
```bash
# Install monitoring tools
npm install -g pm2-logrotate

# Configure log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

## 🚨 **Emergency Recovery**

If everything breaks:
```bash
# Stop all processes
pm2 stop all

# Clear everything
rm -rf node_modules package-lock.json .next

# Reinstall and restart
npm install
npm run build
pm2 start npm --name "roach-rally" -- start
```

## 📞 **Getting Help**

1. **Check logs**: `pm2 logs roach-rally`
2. **Verify environment**: `pm2 env 0`
3. **Test endpoints**: `curl http://localhost:3000/api/env`
4. **Check database**: `npx prisma studio`

---

**Need more help?** Check the logs and share the specific error messages!
