#!/bin/bash

echo "🪳 Setting up Roach Rumble..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/roach_rumble?schema=public"

# Session Secret (for Iron Session)
IRON_SESSION_PASSWORD="your-super-secret-session-password-at-least-32-characters-long"

# Admin Wallets (comma-separated)
ADMIN_WALLETS="wallet1,wallet2"

# Cron Secret
CRON_SECRET="your-cron-secret-key"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
EOF
    echo "✅ .env file created! Please update the values."
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npm run db:generate

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update your .env file with real values"
echo "2. Set up your PostgreSQL database"
echo "3. Run: npm run db:push"
echo "4. Run: npm run db:seed"
echo "5. Run: npm run dev"
echo ""
echo "Happy racing! 🪳🏁"
