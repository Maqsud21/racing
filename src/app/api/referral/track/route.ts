import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { referralCode, refereeWallet } = await request.json()
    
    if (!referralCode || !refereeWallet) {
      return NextResponse.json({
        ok: false,
        error: 'Referral code and referee wallet are required'
      }, { status: 400 })
    }
    
    // Check if referral already exists
    const existingReferral = await db.referral.findUnique({
      where: {
        referrerCode_refereeWallet: {
          referrerCode: referralCode,
          refereeWallet: refereeWallet
        }
      }
    })
    
    if (existingReferral) {
      return NextResponse.json({
        ok: false,
        error: 'Referral already tracked for this wallet'
      }, { status: 400 })
    }
    
    // Find the referrer
    const referrer = await db.user.findUnique({
      where: { referralCode: referralCode }
    })
    
    if (!referrer) {
      return NextResponse.json({
        ok: false,
        error: 'Invalid referral code'
      }, { status: 400 })
    }
    
    // Check if referee is trying to refer themselves
    if (referrer.walletAddress === refereeWallet) {
      return NextResponse.json({
        ok: false,
        error: 'Cannot refer yourself'
      }, { status: 400 })
    }
    
    // Calculate points based on referral count
    const newReferralCount = referrer.referralCount + 1
    let pointsToAward = 0
    
    if (newReferralCount <= 100) {
      // 3 refs = 1 point
      pointsToAward = Math.floor(newReferralCount / 3) - Math.floor(referrer.referralCount / 3)
    } else {
      // After 100 refs, each 3 refs = 2 points
      const oldBonusPoints = referrer.referralCount > 100 ? Math.floor((referrer.referralCount - 100) / 3) * 2 : 0
      const newBonusPoints = Math.floor((newReferralCount - 100) / 3) * 2
      pointsToAward = newBonusPoints - oldBonusPoints
    }
    
    // Update referrer's stats
    await db.user.update({
      where: { id: referrer.id },
      data: {
        referralCount: newReferralCount,
        referralPoints: referrer.referralPoints + pointsToAward,
        points: referrer.points + pointsToAward
      }
    })
    
    // Create referral record
    await db.referral.create({
      data: {
        referrerCode: referralCode,
        refereeWallet: refereeWallet,
        pointsAwarded: pointsToAward
      }
    })
    
    return NextResponse.json({
      ok: true,
      data: {
        pointsAwarded: pointsToAward,
        newReferralCount: newReferralCount,
        totalReferralPoints: referrer.referralPoints + pointsToAward
      }
    })
    
  } catch (error) {
    console.error('Track referral error:', error)
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to track referral'
    }, { status: 500 })
  }
}
