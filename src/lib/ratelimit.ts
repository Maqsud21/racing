import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Create Redis instance (will use environment variables if available)
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN 
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

// Create rate limiters for different endpoints (only if Redis is available)
// PRODUCTION CONFIGURATION - Generous but functional limits
export const voteRatelimit = redis ? new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(50, '60 s'), // 50 votes per minute (very generous)
  analytics: true,
  prefix: 'roach_vote',
}) : null

export const authRatelimit = redis ? new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(100, '60 s'), // 100 auth attempts per minute (very generous)
  analytics: true,
  prefix: 'roach_auth',
}) : null

export const apiRatelimit = redis ? new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(1000, '60 s'), // 1000 API calls per minute (very generous)
  analytics: true,
  prefix: 'roach_api',
}) : null

export const adminRatelimit = redis ? new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(200, '60 s'), // 200 admin actions per minute (very generous)
  analytics: true,
  prefix: 'roach_admin',
}) : null

// Fallback in-memory rate limiter for when Redis is not available
class InMemoryRateLimit {
  private requests: Map<string, number[]> = new Map()
  
  async limit(identifier: string, limit: number, windowMs: number): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
    const now = Date.now()
    const key = identifier
    const requests = this.requests.get(key) || []
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < windowMs)
    
    if (validRequests.length >= limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset: validRequests[0] + windowMs
      }
    }
    
    // Add current request
    validRequests.push(now)
    this.requests.set(key, validRequests)
    
    return {
      success: true,
      limit,
      remaining: limit - validRequests.length,
      reset: now + windowMs
    }
  }
}

const inMemoryLimiter = new InMemoryRateLimit()

// Fallback rate limiting function - PRODUCTION CONFIGURATION
export async function fallbackRateLimit(
  identifier: string, 
  limit: number, 
  windowMs: number
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  return inMemoryLimiter.limit(identifier, limit, windowMs)
}

// Helper function to get client identifier
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  const ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown'
  return ip
}
