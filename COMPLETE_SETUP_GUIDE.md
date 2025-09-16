# 🪳 Roach Rally - Complete Setup Guide

## 📋 **Table of Contents**
1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Platform-Specific Setup](#platform-specific-setup)
4. [Project Setup](#project-setup)
5. [Environment Configuration](#environment-configuration)
6. [Database Setup](#database-setup)
7. [Development Workflow](#development-workflow)
8. [Understanding the Codebase](#understanding-the-codebase)
9. [Key Features Explained](#key-features-explained)
10. [API Documentation](#api-documentation)
11. [Deployment Guide](#deployment-guide)
12. [Troubleshooting](#troubleshooting)
13. [Contributing Guidelines](#contributing-guidelines)

---

## 🎯 **Project Overview**

**Roach Rally** is a Solana-based voting game where users bet on roach races using SOL cryptocurrency. It's built with modern web technologies and includes admin controls, real-time updates, and a complete user management system.

### **Core Concept**
- Users connect their Solana wallet
- They vote on which roach will win the race
- Each vote costs 0.02 SOL
- Winners earn rewards based on their accuracy
- Admins control race scheduling and settlement

### **Technology Stack**
- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui components
- **Backend**: Next.js API routes, Iron Session
- **Database**: Prisma ORM with SQLite
- **Blockchain**: Solana Web3.js integration
- **Animations**: Framer Motion
- **Rate Limiting**: Upstash Redis (with in-memory fallback)

---

## 🔧 **Prerequisites**

### **Required Software**
- **Node.js**: Version 18+ (recommended: 20+)
- **npm**: Version 9+ (comes with Node.js)
- **Git**: For version control (optional)

### **Recommended Tools**
- **VS Code**: Best editor for this project
- **Solana Wallet**: Phantom, Solflare, or Backpack
- **Postman/Insomnia**: For API testing

### **System Requirements**
- **RAM**: 4GB+ recommended
- **Storage**: 2GB+ free space
- **OS**: Windows, macOS, or Linux

---

## 🖥️ **Platform-Specific Setup**

### **Windows Setup**

#### **Option 1: Native Windows**
1. **Install Node.js**:
   - Download from [nodejs.org](https://nodejs.org/)
   - Choose LTS version (20.x recommended)
   - Run installer as administrator

2. **Install Git** (optional):
   - Download from [git-scm.com](https://git-scm.com/)
   - Use default settings

3. **Install VS Code**:
   - Download from [code.visualstudio.com](https://code.visualstudio.com/)
   - Install recommended extensions

#### **Option 2: WSL2 (Recommended)**
1. **Enable WSL2**:
   ```powershell
   # Run as administrator
   wsl --install
   ```

2. **Install Ubuntu**:
   ```bash
   # In WSL2 terminal
   sudo apt update
   sudo apt install nodejs npm
   ```

### **macOS Setup**

1. **Install Homebrew** (if not installed):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install Node.js**:
   ```bash
   brew install node
   ```

3. **Install VS Code**:
   ```bash
   brew install --cask visual-studio-code
   ```

### **Linux Setup**

#### **Ubuntu/Debian**:
```bash
# Update package list
sudo apt update

# Install Node.js and npm
sudo apt install nodejs npm

# Install VS Code (optional)
sudo snap install code --classic
```

#### **CentOS/RHEL**:
```bash
# Install Node.js and npm
sudo yum install nodejs npm

# Or use dnf on newer versions
sudo dnf install nodejs npm
```

---

## 🚀 **Project Setup**

### **Step 1: Extract Project**
```bash
# Extract the archive
tar -xzf roach-rally-project.tar.gz

# Navigate to project directory
cd roach-rally-clean

# Verify files are present
ls -la
```

### **Step 2: Install Dependencies**
```bash
# Install all dependencies
npm install

# This will create node_modules/ directory
# and install all packages listed in package.json
```

### **Step 3: Verify Installation**
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check if dependencies installed correctly
npm list --depth=0
```

---

## ⚙️ **Environment Configuration**

### **Step 1: Copy Environment File**
```bash
# Copy the example environment file
cp .env.example .env

# Or if .env already exists, edit it directly
```

### **Step 2: Configure Environment Variables**

Open `.env` file and update these values:

```bash
# Session Secret (REQUIRED)
IRON_SESSION_PASSWORD="your-super-secret-session-password-at-least-32-characters-long"

# Admin Wallets (REQUIRED)
ADMIN_WALLETS="your-wallet-address,another-admin-wallet"

# Payment Wallet (REQUIRED)
PAYMENT_WALLET="your-payment-wallet-address"

# Solana RPC (REQUIRED)
SOLANA_RPC_URL="https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY"

# Database (REQUIRED)
DATABASE_URL="file:./dev.db"

# Optional Settings
PUMP_FUN_LINK="https://pump.fun"
CONTRACT_ADDRESS="So11111111111111111111111111111111111111112"
```

### **Step 3: Get Solana RPC URL**

1. **Sign up for Helius** (recommended):
   - Go to [helius.xyz](https://helius.xyz/)
   - Create free account
   - Get your API key
   - Use: `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY`

2. **Alternative RPC providers**:
   - **QuickNode**: [quicknode.com](https://quicknode.com/)
   - **Alchemy**: [alchemy.com](https://alchemy.com/)
   - **Public RPC**: `https://api.mainnet-beta.solana.com` (rate limited)

---

## 🗄️ **Database Setup**

### **Step 1: Generate Prisma Client**
```bash
# Generate Prisma client
npx prisma generate
```

### **Step 2: Push Database Schema**
```bash
# Create database and tables
npx prisma db push
```

### **Step 3: Seed Database (Optional)**
```bash
# Add sample data
npx prisma db seed
```

### **Step 4: Open Database GUI (Optional)**
```bash
# Open Prisma Studio
npx prisma studio
```

---

## 🏗️ **Development Workflow**

### **Start Development Server**
```bash
# Start the development server
npm run dev

# Server will start on http://localhost:3000
# Hot reload is enabled - changes auto-refresh
```

### **Build for Production**
```bash
# Build the project
npm run build

# Start production server
npm start
```

### **Run Linting**
```bash
# Check for code issues
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

---

## 📁 **Understanding the Codebase**

### **Project Structure**
```
roach-rally-clean/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── api/               # API endpoints
│   │   │   ├── auth/          # Authentication
│   │   │   ├── admin/         # Admin functions
│   │   │   ├── race/          # Race management
│   │   │   └── user/          # User management
│   │   ├── admin/             # Admin panel pages
│   │   ├── leaderboard/       # Leaderboard page
│   │   └── page.tsx           # Main homepage
│   ├── components/            # React components
│   │   ├── RoachCard.tsx      # Individual roach voting card
│   │   ├── CountdownTimer.tsx # Race countdown display
│   │   ├── WalletButton.tsx   # Wallet connection
│   │   └── ...                # Other components
│   └── lib/                   # Utility functions
│       ├── solana.ts          # Solana integration
│       ├── ratelimit.ts       # Rate limiting
│       ├── timezone.ts        # Timezone utilities
│       └── env.ts             # Environment variables
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── dev.db                 # SQLite database
│   └── seed.ts                # Database seeding
├── public/                    # Static assets
│   ├── favicon.svg            # Website favicon
│   └── ...                    # Other assets
├── package.json               # Dependencies
├── .env                       # Environment variables
└── README.md                  # Project documentation
```

### **Key Files Explained**

#### **src/app/page.tsx**
- Main homepage component
- Handles wallet connection
- Displays current race status
- Manages voting functionality

#### **src/app/api/race/vote/route.ts**
- Handles vote submission
- Processes SOL payments
- Validates transactions
- Updates database

#### **src/app/admin/page.tsx**
- Admin panel interface
- Race scheduling
- Race settlement
- User management

#### **prisma/schema.prisma**
- Database schema definition
- User, Race, Vote models
- Relationships between entities

---

## 🎮 **Key Features Explained**

### **Wallet Integration**
- **Supported Wallets**: Phantom, Solflare, Backpack
- **Connection**: Uses Solana Wallet Adapter
- **Authentication**: Wallet signature verification
- **Transactions**: SOL payment processing

### **Race System**
- **Scheduling**: Admins can schedule races
- **Voting Period**: Users vote during open period
- **Settlement**: Admins declare winners
- **Rewards**: Winners earn SOL based on accuracy

### **User Management**
- **Profiles**: Username, stats, earnings
- **Referrals**: Users can refer others
- **Leaderboard**: Rankings by accuracy
- **Streaks**: Win streak tracking

### **Admin Features**
- **Race Control**: Schedule and settle races
- **User Oversight**: View user profiles
- **Statistics**: Race and user analytics
- **Wallet Management**: Multiple admin wallets

---

## 🔌 **API Documentation**

### **Public Endpoints**

#### **GET /api/race/current**
- **Purpose**: Get current race status
- **Response**: Race data, next schedule
- **Rate Limit**: 10 requests/minute

#### **GET /api/leaderboard**
- **Purpose**: Get user rankings
- **Response**: Top users by accuracy
- **Rate Limit**: 10 requests/minute

#### **GET /api/env**
- **Purpose**: Get public environment variables
- **Response**: PUMP_FUN_LINK, CONTRACT_ADDRESS

### **User Endpoints**

#### **POST /api/auth/verify**
- **Purpose**: Verify wallet signature
- **Body**: `{ walletAddress, signature, message }`
- **Rate Limit**: 5 requests/minute

#### **GET /api/user/me**
- **Purpose**: Get user profile
- **Auth**: Required (wallet signature)
- **Rate Limit**: 10 requests/minute

#### **POST /api/race/vote**
- **Purpose**: Submit vote
- **Body**: `{ pick, transactionSignature }`
- **Rate Limit**: 10 votes/minute

### **Admin Endpoints**

#### **POST /api/admin/check**
- **Purpose**: Check admin status
- **Body**: `{ walletAddress }`
- **Rate Limit**: 10 requests/minute

#### **GET /api/admin/schedule**
- **Purpose**: Get scheduled races
- **Auth**: Admin required
- **Rate Limit**: 10 requests/minute

#### **POST /api/admin/schedule**
- **Purpose**: Schedule new race
- **Body**: `{ scheduledAt, duration }`
- **Auth**: Admin required
- **Rate Limit**: 5 requests/minute

#### **POST /api/admin/settle**
- **Purpose**: Settle race
- **Body**: `{ raceId, winner }`
- **Auth**: Admin required
- **Rate Limit**: 5 requests/minute

---

## 🚀 **Deployment Guide**

### **Vercel Deployment (Recommended)**

1. **Connect Repository**:
   - Push code to GitHub
   - Connect to Vercel
   - Import project

2. **Configure Environment Variables**:
   - Add all variables from `.env`
   - Set production values
   - Deploy

3. **Custom Domain** (optional):
   - Add custom domain in Vercel
   - Update DNS settings

### **Manual Deployment**

1. **Build Project**:
   ```bash
   npm run build
   ```

2. **Upload Files**:
   - Upload `out/` directory to hosting
   - Set environment variables
   - Start server

3. **Server Requirements**:
   - Node.js 18+
   - 1GB RAM minimum
   - 10GB storage

---

## 🔧 **Troubleshooting**

### **Common Issues**

#### **"Cannot find module" errors**
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### **Database connection errors**
```bash
# Solution: Reset database
rm prisma/dev.db
npx prisma db push
npx prisma db seed
```

#### **Wallet connection issues**
- Check if wallet extension is installed
- Ensure wallet is unlocked
- Try refreshing the page

#### **Payment failures**
- Verify Solana RPC URL
- Check wallet has sufficient SOL
- Ensure transaction is confirmed

#### **Build errors**
```bash
# Solution: Clear cache and rebuild
rm -rf .next
npm run build
```

### **Debug Mode**
```bash
# Enable debug logging
DEBUG=* npm run dev
```

### **Check Logs**
- **Browser Console**: F12 → Console tab
- **Server Logs**: Terminal output
- **Database**: Prisma Studio

---

## 🤝 **Contributing Guidelines**

### **Code Style**
- Use TypeScript for all new code
- Follow existing naming conventions
- Add comments for complex logic
- Use meaningful variable names

### **Git Workflow** (if using Git)
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# Test thoroughly

# Commit changes
git add .
git commit -m "Add new feature"

# Push to remote
git push origin feature/new-feature
```

### **Testing**
- Test all new features
- Verify API endpoints
- Check wallet integration
- Test admin functions

---

## 📞 **Support & Resources**

### **Documentation**
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma**: [prisma.io/docs](https://prisma.io/docs)
- **Solana**: [docs.solana.com](https://docs.solana.com)
- **Tailwind**: [tailwindcss.com/docs](https://tailwindcss.com/docs)

### **Community**
- **Discord**: Solana developer community
- **GitHub**: Project repository
- **Stack Overflow**: Tag questions with relevant tags

### **Getting Help**
1. Check this guide first
2. Search existing issues
3. Ask in community channels
4. Create detailed issue reports

---

## 🎉 **You're Ready!**

Congratulations! You now have everything you need to:
- ✅ Set up the development environment
- ✅ Understand the codebase structure
- ✅ Configure the application
- ✅ Deploy to production
- ✅ Troubleshoot issues
- ✅ Contribute to the project

**Happy coding! 🚀🪳**

---

*Last updated: September 2024*
*Project version: 1.0.0*
