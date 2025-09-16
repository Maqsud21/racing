# 🪳 Roach Rally

A Solana-based voting game where users bet on roach races using SOL cryptocurrency.

## 🚀 **Quick Start**

### **5-Minute Setup**
```bash
# 1. Extract project
tar -xzf roach-rally-project.tar.gz
cd roach-rally-clean

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your values

# 4. Setup database
npx prisma generate
npx prisma db push

# 5. Start development
npm run dev
```

**Open http://localhost:3000** 🎉

## 📚 **Documentation**

### **Setup Guides**
- **[QUICK_START.md](./QUICK_START.md)** - 5-minute setup
- **[COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)** - Comprehensive guide
- **[PLATFORM_SETUP.md](./PLATFORM_SETUP.md)** - Platform-specific setup
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues & solutions

### **Quick Reference**
- **Environment Variables**: See `.env.example`
- **API Endpoints**: See `COMPLETE_SETUP_GUIDE.md`
- **Database Schema**: See `prisma/schema.prisma`

## 🎮 **What is Roach Rally?**

### **Core Concept**
- Users connect Solana wallets
- Vote on which roach will win races
- Each vote costs 0.02 SOL
- Winners earn rewards based on accuracy
- Admins control race scheduling and settlement

### **Key Features**
- ✅ **Solana Wallet Integration** (Phantom, Solflare, Backpack)
- ✅ **SOL Payment Processing** (0.02 SOL per vote)
- ✅ **Real-time Race Management** (Admin-controlled)
- ✅ **User Profiles & Leaderboard** (Accuracy rankings)
- ✅ **Referral System** (Earn rewards for referrals)
- ✅ **Responsive Design** (Mobile & desktop)

## 🛠️ **Technology Stack**

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui
- **Backend**: Next.js API routes, Iron Session
- **Database**: Prisma ORM with SQLite
- **Blockchain**: Solana Web3.js integration
- **Animations**: Framer Motion
- **Rate Limiting**: Upstash Redis (with fallback)

## 🔧 **Required Setup**

### **Environment Variables**
```bash
# Required
IRON_SESSION_PASSWORD="your-super-secret-session-password-at-least-32-characters-long"
ADMIN_WALLETS="your-wallet-address,another-admin-wallet"
PAYMENT_WALLET="your-payment-wallet-address"
SOLANA_RPC_URL="https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY"
DATABASE_URL="file:./dev.db"

# Optional
PUMP_FUN_LINK="https://pump.fun"
CONTRACT_ADDRESS="So11111111111111111111111111111111111111112"
```

### **External Services**
- **Solana RPC**: Get from [helius.xyz](https://helius.xyz/) (free tier available)
- **Solana Wallet**: Install Phantom, Solflare, or Backpack

## 🏗️ **Project Structure**

```
roach-rally-clean/
├── src/
│   ├── app/                 # Next.js 15 App Router
│   │   ├── api/            # API endpoints
│   │   ├── admin/          # Admin panel
│   │   └── page.tsx        # Main page
│   ├── components/          # React components
│   └── lib/                 # Utilities
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── dev.db              # SQLite database
│   └── seed.ts             # Database seeding
├── public/                  # Static assets
└── package.json            # Dependencies
```

## 🎯 **Development Commands**

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server

# Database
npx prisma studio    # Open database GUI
npx prisma db push   # Push schema changes
npx prisma db seed   # Seed database

# Linting
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues
```

## 🔐 **Admin Features**

### **Current Admin Wallets**
- `FRCcqUUkx3LcGHFQrEth3v36arn8FrkR14hgWHSLcfXc`
- `FP44n1HAkdr7dT3MksycaKoBM5eR8VBWEwBBpeDPqD36`
- `B3QTQLbdE4JkgRx5ByhGT2NhzsL3MSoCBVbMgC5HUe6h`
- `C1wqytevZQfBJGxyNMgtc5yWymyg3mTRGakwoFukqUFk`
- `BwiYBuS1HzXvQnARpNs8cV36heQDmwTWMNg8YTjc2fRh`

### **Admin Capabilities**
- Schedule new races
- Settle races and declare winners
- View user profiles and statistics
- Access admin panel at `/admin`

## 🚀 **Deployment**

### **Vercel (Recommended)**
1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy automatically

### **Manual Deployment**
1. Build: `npm run build`
2. Upload to hosting provider
3. Set environment variables
4. Start: `npm start`

## 📱 **Testing the Application**

### **User Flow**
1. **Connect Wallet**: Click wallet button
2. **Vote**: Choose a roach (costs 0.02 SOL)
3. **Wait**: For race to start and settle
4. **Earn**: Rewards based on accuracy

### **Admin Flow**
1. **Access Admin**: Go to `/admin`
2. **Schedule Race**: Set voting start time
3. **Monitor**: Watch votes come in
4. **Settle**: Declare winner when ready

## 🆘 **Need Help?**

### **Quick Fixes**
```bash
# Restart server
npm run dev

# Clear cache
rm -rf node_modules package-lock.json
npm install

# Reset database
rm prisma/dev.db
npx prisma db push
```

### **Documentation**
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues
- **[COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)** - Full guide
- **[PLATFORM_SETUP.md](./PLATFORM_SETUP.md)** - Platform-specific

### **Support**
- Check browser console (F12)
- Check server logs in terminal
- Verify environment variables
- Check database with `npx prisma studio`

## 🎉 **Ready to Race!**

You now have everything you need to:
- ✅ Set up the development environment
- ✅ Understand the codebase
- ✅ Configure the application
- ✅ Deploy to production
- ✅ Troubleshoot issues

**Happy coding! 🚀🪳**

---

*Project version: 1.0.0*  
*Last updated: September 2024*