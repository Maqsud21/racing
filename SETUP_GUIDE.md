# 🪳 Roach Rally - Setup Guide

## 📋 **Project Overview**
Roach Rally is a Solana-based voting game where users bet on roach races using SOL. Built with Next.js 15, Prisma, and Solana wallet integration.

## 🚀 **Quick Start**

### **1. Install Dependencies**
```bash
npm install
```

### **2. Environment Setup**
Copy `.env` file and update with your configuration:
```bash
cp .env.example .env
```

**Required Environment Variables:**
- `IRON_SESSION_PASSWORD`: Session secret (32+ characters)
- `ADMIN_WALLETS`: Comma-separated admin wallet addresses
- `PAYMENT_WALLET`: Wallet address to receive SOL payments
- `SOLANA_RPC_URL`: Solana RPC endpoint
- `PUMP_FUN_LINK`: Livestream link
- `CONTRACT_ADDRESS`: Contract address for display

### **3. Database Setup**
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### **4. Start Development Server**
```bash
npm run dev
```

## 🏗️ **Project Structure**

```
roach-rally/
├── src/
│   ├── app/                 # Next.js 15 app router
│   │   ├── api/            # API routes
│   │   ├── admin/           # Admin panel
│   │   ├── leaderboard/     # Leaderboard page
│   │   └── page.tsx         # Main page
│   ├── components/          # React components
│   └── lib/                 # Utilities
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── dev.db              # SQLite database
│   └── seed.ts             # Database seeding
├── public/                  # Static assets
└── package.json            # Dependencies
```

## 🔧 **Key Features**

### **Core Functionality**
- ✅ **Solana Wallet Integration**: Connect with Phantom, Solflare, etc.
- ✅ **SOL Payment Processing**: 0.02 SOL voting fee
- ✅ **Race Management**: Admin-controlled race scheduling
- ✅ **Real-time Updates**: Live countdown timers
- ✅ **Leaderboard**: User rankings and statistics
- ✅ **Referral System**: Earn rewards for referrals

### **Admin Features**
- ✅ **Race Scheduling**: Set voting start times
- ✅ **Race Settlement**: Declare winners
- ✅ **User Management**: View user profiles
- ✅ **Statistics**: Race and user analytics

### **Security Features**
- ✅ **Rate Limiting**: Prevents spam and abuse
- ✅ **Admin Authentication**: Wallet-based admin access
- ✅ **Session Management**: Secure user sessions
- ✅ **Input Validation**: Zod schema validation

## 🛠️ **Development Commands**

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

## 📱 **API Endpoints**

### **Public APIs**
- `GET /api/race/current` - Get current race status
- `GET /api/leaderboard` - Get leaderboard data
- `GET /api/env` - Get environment variables

### **User APIs**
- `POST /api/auth/verify` - Verify wallet signature
- `GET /api/user/me` - Get user profile
- `POST /api/race/vote` - Submit vote

### **Admin APIs**
- `POST /api/admin/check` - Check admin status
- `GET /api/admin/schedule` - Get scheduled races
- `POST /api/admin/schedule` - Schedule new race
- `POST /api/admin/settle` - Settle race

## 🔐 **Admin Configuration**

### **Current Admin Wallets**
- `FRCcqUUkx3LcGHFQrEth3v36arn8FrkR14hgWHSLcfXc`
- `FP44n1HAkdr7dT3MksycaKoBM5eR8VBWEwBBpeDPqD36`
- `B3QTQLbdE4JkgRx5ByhGT2NhzsL3MSoCBVbMgC5HUe6h`
- `C1wqytevZQfBJGxyNMgtc5yWymyg3mTRGakwoFukqUFk`
- `BwiYBuS1HzXvQnARpNs8cV36heQDmwTWMNg8YTjc2fRh`

### **Payment Wallet**
- `7UwkPhbKdgcoTx2JjFwWkNs8x8ZfEH443tdrwe2NQmuP`

## 🚀 **Deployment**

### **Vercel (Recommended)**
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### **Manual Deployment**
1. Build the project: `npm run build`
2. Upload to your hosting provider
3. Set environment variables
4. Start with: `npm start`

## 📊 **Database Schema**

### **Users Table**
- `id`: Primary key
- `walletAddress`: Solana wallet address
- `username`: Display name
- `referralCode`: Unique referral code
- `referredBy`: Referrer's wallet address
- `totalVotes`: Total votes cast
- `totalWins`: Total races won
- `totalEarnings`: Total SOL earned
- `streak`: Current win streak
- `bestStreak`: Best win streak
- `accuracy`: Win percentage

### **Races Table**
- `id`: Primary key
- `status`: OPEN, LOCKED, SETTLED
- `startAt`: Voting start time
- `endAt`: Voting end time
- `winner`: Winning roach
- `totalVotes`: Total votes cast
- `totalVolume`: Total SOL volume

### **Votes Table**
- `id`: Primary key
- `raceId`: Race reference
- `userId`: User reference
- `pick`: Roach choice
- `amount`: SOL amount
- `transactionSignature`: Solana transaction hash

## 🔧 **Troubleshooting**

### **Common Issues**
1. **Wallet Connection**: Ensure wallet extension is installed
2. **Payment Failures**: Check Solana RPC endpoint
3. **Database Errors**: Run `npx prisma db push`
4. **Build Errors**: Clear `.next` directory and rebuild

### **Support**
- Check console logs for errors
- Verify environment variables
- Ensure all dependencies are installed
- Check Solana RPC endpoint connectivity

## 📝 **Notes**
- Database is SQLite (dev.db) - contains all user data
- Admin wallets are configured in environment variables
- Payment wallet receives all SOL voting fees
- Rate limiting prevents abuse and spam
- All times are displayed in UTC

---

**Ready to race! 🪳🏁**
