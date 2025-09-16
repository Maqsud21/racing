# 🔧 Troubleshooting Guide

## 🚨 **Common Issues & Solutions**

### **Installation Issues**

#### **"npm not recognized" or "node not found"**
```bash
# Windows: Restart command prompt after Node.js installation
# macOS: Add Homebrew to PATH
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Linux: Install Node.js via package manager
sudo apt update
sudo apt install nodejs npm
```

#### **Permission denied errors**
```bash
# Use sudo for system-wide installation
sudo npm install -g npm

# Or install with Node Version Manager (nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install node
nvm use node
```

#### **"Cannot find module" errors**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

### **Database Issues**

#### **Database connection errors**
```bash
# Reset database
rm prisma/dev.db
npx prisma generate
npx prisma db push
npx prisma db seed
```

#### **Prisma client errors**
```bash
# Regenerate Prisma client
npx prisma generate

# Check schema syntax
npx prisma validate
```

#### **Migration errors**
```bash
# Reset database and push schema
npx prisma db push --force-reset
npx prisma db seed
```

---

### **Development Server Issues**

#### **Port already in use**
```bash
# Kill process using port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- --port 3001
```

#### **Build errors**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

#### **Hot reload not working**
```bash
# Restart development server
# Check file permissions
# Ensure files are saved
```

---

### **Wallet Connection Issues**

#### **Wallet not connecting**
- Check if wallet extension is installed
- Ensure wallet is unlocked
- Try refreshing the page
- Check browser console for errors

#### **"Wallet not found" error**
- Install Phantom, Solflare, or Backpack
- Enable wallet in browser extensions
- Check if wallet is connected to Solana mainnet

#### **Transaction failures**
- Verify wallet has sufficient SOL
- Check Solana RPC endpoint
- Ensure transaction is confirmed
- Try increasing transaction timeout

---

### **API Issues**

#### **Rate limiting errors**
```bash
# Check rate limit configuration
# Increase limits in src/lib/ratelimit.ts
# Clear rate limit cache
```

#### **Authentication errors**
- Verify wallet signature
- Check session configuration
- Ensure Iron Session password is set

#### **Payment processing errors**
- Verify Solana RPC URL
- Check payment wallet address
- Ensure transaction signature is valid

---

### **Environment Issues**

#### **Environment variables not loading**
```bash
# Check .env file exists
ls -la .env

# Verify file format (no spaces around =)
# Restart development server
```

#### **Missing environment variables**
```bash
# Check required variables:
# IRON_SESSION_PASSWORD
# ADMIN_WALLETS
# PAYMENT_WALLET
# SOLANA_RPC_URL
# DATABASE_URL
```

#### **Invalid environment values**
- Check wallet addresses are valid Solana addresses
- Verify RPC URL format
- Ensure session password is 32+ characters

---

### **Build & Deployment Issues**

#### **Build failures**
```bash
# Check TypeScript errors
npm run lint

# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

#### **Production deployment issues**
- Verify environment variables are set
- Check database connection
- Ensure all dependencies are installed
- Check server logs for errors

---

## 🔍 **Debugging Techniques**

### **Enable Debug Logging**
```bash
# Enable all debug logs
DEBUG=* npm run dev

# Enable specific debug logs
DEBUG=prisma:* npm run dev
DEBUG=solana:* npm run dev
```

### **Check Browser Console**
1. Open browser developer tools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Check Application tab for storage issues

### **Check Server Logs**
- Look at terminal output
- Check for error messages
- Verify API responses
- Check database queries

### **Database Debugging**
```bash
# Open Prisma Studio
npx prisma studio

# Check database file
ls -la prisma/dev.db

# Verify schema
npx prisma validate
```

---

## 🛠️ **Advanced Troubleshooting**

### **Performance Issues**

#### **Slow development server**
```bash
# Check system resources
# Close unnecessary applications
# Use SSD storage
# Increase Node.js memory limit
node --max-old-space-size=4096 npm run dev
```

#### **Slow database queries**
```bash
# Check database size
ls -lh prisma/dev.db

# Optimize queries
# Add database indexes
# Use Prisma Studio to monitor queries
```

### **Memory Issues**

#### **Out of memory errors**
```bash
# Increase Node.js memory limit
node --max-old-space-size=8192 npm run dev

# Check system memory usage
# Close unnecessary applications
# Use 64-bit Node.js
```

### **Network Issues**

#### **RPC connection problems**
- Check internet connection
- Verify RPC URL is accessible
- Try different RPC provider
- Check rate limits

#### **CORS issues**
- Check API configuration
- Verify domain settings
- Check browser security settings

---

## 📊 **Diagnostic Commands**

### **System Information**
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check system info
# Windows
systeminfo

# macOS
system_profiler SPSoftwareDataType

# Linux
uname -a
```

### **Project Information**
```bash
# Check project structure
ls -la

# Check dependencies
npm list --depth=0

# Check database
ls -la prisma/

# Check environment
cat .env
```

### **Network Testing**
```bash
# Test RPC connection
curl -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}' \
  YOUR_RPC_URL

# Test API endpoints
curl http://localhost:3000/api/race/current
```

---

## 🆘 **Getting Help**

### **Before Asking for Help**
1. Check this troubleshooting guide
2. Search for similar issues online
3. Check browser console for errors
4. Verify environment configuration
5. Try basic solutions (restart, reinstall)

### **When Reporting Issues**
Include this information:
- Operating system and version
- Node.js and npm versions
- Error messages (full text)
- Steps to reproduce the issue
- Browser and wallet used

### **Useful Resources**
- **Node.js**: [nodejs.org/docs](https://nodejs.org/docs)
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma**: [prisma.io/docs](https://prisma.io/docs)
- **Solana**: [docs.solana.com](https://docs.solana.com)

### **Community Support**
- **Stack Overflow**: Tag questions appropriately
- **Discord**: Solana developer community
- **GitHub**: Project repository issues

---

## 🎯 **Quick Fixes**

### **Most Common Solutions**
```bash
# 1. Restart development server
npm run dev

# 2. Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# 3. Reset database
rm prisma/dev.db
npx prisma db push

# 4. Check environment variables
cat .env

# 5. Verify wallet connection
# Check browser console (F12)
```

### **Emergency Reset**
```bash
# Complete project reset
rm -rf node_modules .next prisma/dev.db
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

---

**Still having issues? Check the complete setup guide or ask for help! 🆘**
