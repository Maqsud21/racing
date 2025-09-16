# 🚀 Roach Rally - Quick Start Guide

## ⚡ **5-Minute Setup**

### **1. Extract & Install**
```bash
# Extract the project
tar -xzf roach-rally-project.tar.gz
cd roach-rally-clean

# Install dependencies
npm install
```

### **2. Configure Environment**
```bash
# Copy environment file
cp .env.example .env

# Edit .env with your values
# Minimum required: IRON_SESSION_PASSWORD, ADMIN_WALLETS, PAYMENT_WALLET, SOLANA_RPC_URL
```

### **3. Setup Database**
```bash
# Generate Prisma client
npx prisma generate

# Create database
npx prisma db push
```

### **4. Start Development**
```bash
# Start the server
npm run dev

# Open http://localhost:3000
```

## 🔧 **Required Environment Variables**

```bash
# Session Secret (32+ characters)
IRON_SESSION_PASSWORD="your-super-secret-session-password-at-least-32-characters-long"

# Admin Wallets (comma-separated)
ADMIN_WALLETS="your-wallet-address,another-admin-wallet"

# Payment Wallet (receives SOL)
PAYMENT_WALLET="your-payment-wallet-address"

# Solana RPC (get from helius.xyz)
SOLANA_RPC_URL="https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY"

# Database
DATABASE_URL="file:./dev.db"
```

## 🎯 **What You Get**

- ✅ **Complete Solana voting game**
- ✅ **Admin panel for race management**
- ✅ **User profiles and leaderboard**
- ✅ **SOL payment processing**
- ✅ **Real-time countdown timers**
- ✅ **Responsive design**

## 📱 **Test the Application**

1. **Open**: http://localhost:3000
2. **Connect**: Solana wallet (Phantom, Solflare)
3. **Vote**: On roach races (costs 0.02 SOL)
4. **Admin**: Access /admin with admin wallet

## 🆘 **Need Help?**

- **Full Guide**: See `COMPLETE_SETUP_GUIDE.md`
- **Issues**: Check browser console (F12)
- **Database**: Run `npx prisma studio`

---

**Ready to race! 🪳🏁**
