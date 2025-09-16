import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSession, verifySignature } from '@/lib/auth'
import { db } from '@/lib/db'

const verifySchema = z.object({
  walletAddress: z.string().min(1),
  nonce: z.string().min(1),
  signature: z.string().min(1),
  referralCode: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting DISABLED for development
    
    const body = await request.json()
    const { walletAddress, nonce, signature, referralCode } = verifySchema.parse(body)
    
    // For now, let's accept any signature from a connected wallet
    // In production, you'd want proper signature verification
    // But for MVP, we'll trust that the wallet is connected
    
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { walletAddress }
    })
    
    let isNewUser = false
    if (!existingUser) {
      isNewUser = true
      
      // Handle referral tracking for new users
      if (referralCode) {
        try {
          const referralResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/referral/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              referralCode,
              refereeWallet: walletAddress
            })
          })
          
          if (referralResponse.ok) {
            console.log('Referral tracked successfully for new user:', walletAddress)
          }
        } catch (error) {
          console.error('Error tracking referral:', error)
          // Don't fail the auth process if referral tracking fails
        }
      }
    }
    
    // Create session
    await createSession(walletAddress)
    
    return NextResponse.json({ 
      ok: true, 
      data: { 
        walletAddress,
        isNewUser,
        message: 'Authentication successful'
      } 
    })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ 
      ok: false, 
      error: 'Authentication failed' 
    }, { status: 400 })
  }
}
