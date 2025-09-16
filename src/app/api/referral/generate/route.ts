import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { userId, walletAddress } = await requireAuth()
    
    // Check if user already has a referral code
    const existingUser = await db.user.findUnique({
      where: { id: userId },
      select: { referralCode: true }
    })
    
    if (existingUser?.referralCode) {
      return NextResponse.json({
        ok: true,
        data: {
          referralCode: existingUser.referralCode,
          referralLink: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}?ref=${existingUser.referralCode}`
        }
      })
    }
    
    // Generate unique referral code
    const referralCode = generateReferralCode(walletAddress)
    
    // Update user with referral code
    await db.user.update({
      where: { id: userId },
      data: { referralCode }
    })
    
    const referralLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}?ref=${referralCode}`
    
    return NextResponse.json({
      ok: true,
      data: {
        referralCode,
        referralLink
      }
    })
    
  } catch (error) {
    console.error('Generate referral error:', error)
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to generate referral code'
    }, { status: 500 })
  }
}

function generateReferralCode(walletAddress: string): string {
  // Create a short, unique code based on wallet address
  const hash = walletAddress.slice(0, 8).toUpperCase()
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${hash}${randomSuffix}`
}
