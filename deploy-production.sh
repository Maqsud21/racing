#!/bin/bash

# Roach Rally Production Deployment Script
echo "🪳 Deploying Roach Rally to PRODUCTION..."

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
    echo "# Optional Redis for rate limiting"
    echo "UPSTASH_REDIS_REST_URL=\"your-redis-url\""
    echo "UPSTASH_REDIS_REST_TOKEN=\"your-redis-token\""
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
echo "🔨 Building application for production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Production build successful"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
fi

# Stop existing process if running
pm2 stop roach-rally 2>/dev/null || true

# Start the application
echo "🚀 Starting production application..."
pm2 start npm --name "roach-rally" -- start

if [ $? -ne 0 ]; then
    echo "❌ Failed to start application"
    exit 1
fi

echo "✅ Application started successfully!"

# Save PM2 configuration
pm2 save

echo ""
echo "🎉 Production deployment complete!"
echo ""
echo "📊 Production Configuration:"
echo "   • Rate Limiting: ENABLED with generous limits"
echo "   • Authentication: 100 attempts/minute"
echo "   • Voting: 50 votes/minute"
echo "   • API Calls: 1000 calls/minute"
echo "   • Admin Actions: 200 actions/minute"
echo ""
echo "📊 Management Commands:"
echo "   • Check status: pm2 status"
echo "   • View logs: pm2 logs roach-rally"
echo "   • Restart: pm2 restart roach-rally"
echo "   • Test app: curl http://localhost:3000"
echo ""
echo "🪳 Roach Rally is now running in PRODUCTION mode!"
echo "   Ready for users and admins to authenticate! 🏁"
