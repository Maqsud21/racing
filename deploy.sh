#!/bin/bash

# Roach Rally DigitalOcean Deployment Script
echo "🪳 Deploying Roach Rally to DigitalOcean..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create .env file with required environment variables:"
    echo ""
    echo "IRON_SESSION_PASSWORD=\"your-super-secret-session-password-at-least-32-characters-long\""
    echo "ADMIN_WALLETS=\"your-wallet-address,another-admin-wallet\""
    echo "PAYMENT_WALLET=\"your-payment-wallet-address\""
    echo "SOLANA_RPC_URL=\"https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY\""
    echo "DATABASE_URL=\"file:./dev.db\""
    echo ""
    exit 1
fi

echo "✅ Environment file found"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Generate Prisma client
echo "🗄️ Setting up database..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

# Push database schema
npx prisma db push

if [ $? -ne 0 ]; then
    echo "❌ Failed to push database schema"
    exit 1
fi

echo "✅ Database setup complete"

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
fi

# Start the application
echo "🚀 Starting application..."
pm2 stop roach-rally 2>/dev/null || true
pm2 start npm --name "roach-rally" -- start

if [ $? -ne 0 ]; then
    echo "❌ Failed to start application"
    exit 1
fi

echo "✅ Application started successfully!"

# Save PM2 configuration
pm2 save

echo ""
echo "🎉 Deployment complete!"
echo "📊 Check status: pm2 status"
echo "📝 View logs: pm2 logs roach-rally"
echo "🌐 Test app: curl http://localhost:3000"
echo ""
echo "🪳 Roach Rally is now running on your DigitalOcean server!"
