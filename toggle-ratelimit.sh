#!/bin/bash

# Toggle Rate Limiting Script for Roach Rally
# Usage: ./toggle-ratelimit.sh [dev|prod]

MODE=${1:-dev}

if [ "$MODE" = "dev" ]; then
    echo "🪳 Switching to DEVELOPMENT mode (rate limits DISABLED)"
    
    # Replace the rate limit exports with null values
    sed -i.bak 's/export const voteRatelimit = redis ? new Ratelimit/export const voteRatelimit = null \/\/ redis ? new Ratelimit/' src/lib/ratelimit.ts
    sed -i.bak 's/export const authRatelimit = redis ? new Ratelimit/export const authRatelimit = null \/\/ redis ? new Ratelimit/' src/lib/ratelimit.ts
    sed -i.bak 's/export const apiRatelimit = redis ? new Ratelimit/export const apiRatelimit = null \/\/ redis ? new Ratelimit/' src/lib/ratelimit.ts
    sed -i.bak 's/export const adminRatelimit = redis ? new Ratelimit/export const adminRatelimit = null \/\/ redis ? new Ratelimit/' src/lib/ratelimit.ts
    
    # Update fallback function to always allow
    sed -i.bak 's/return inMemoryLimiter.limit(identifier, limit, windowMs)/\/\/ Always allow requests in development\n  return {\n    success: true,\n    limit: 999999,\n    remaining: 999999,\n    reset: Date.now() + windowMs\n  }\n  \/\/ return inMemoryLimiter.limit(identifier, limit, windowMs)/' src/lib/ratelimit.ts
    
    echo "✅ Rate limiting DISABLED for development"
    
elif [ "$MODE" = "prod" ]; then
    echo "🪳 Switching to PRODUCTION mode (rate limits ENABLED with generous limits)"
    
    # Restore the original rate limiters
    sed -i.bak 's/export const voteRatelimit = null \/\/ redis ? new Ratelimit/export const voteRatelimit = redis ? new Ratelimit/' src/lib/ratelimit.ts
    sed -i.bak 's/export const authRatelimit = null \/\/ redis ? new Ratelimit/export const authRatelimit = redis ? new Ratelimit/' src/lib/ratelimit.ts
    sed -i.bak 's/export const apiRatelimit = null \/\/ redis ? new Ratelimit/export const apiRatelimit = redis ? new Ratelimit/' src/lib/ratelimit.ts
    sed -i.bak 's/export const adminRatelimit = null \/\/ redis ? new Ratelimit/export const adminRatelimit = redis ? new Ratelimit/' src/lib/ratelimit.ts
    
    # Restore fallback function
    sed -i.bak 's/\/\/ Always allow requests in development/return inMemoryLimiter.limit(identifier, limit, windowMs)/' src/lib/ratelimit.ts
    
    echo "✅ Rate limiting ENABLED for production"
    
else
    echo "❌ Invalid mode. Use 'dev' or 'prod'"
    echo "Usage: ./toggle-ratelimit.sh [dev|prod]"
    exit 1
fi

echo ""
echo "🔄 Restarting development server..."
echo "Press Ctrl+C to stop the current server, then run: npm run dev"
