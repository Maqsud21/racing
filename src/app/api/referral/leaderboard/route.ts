import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    
    // Get referral leaderboard
    const leaderboard = await db.user.findMany({
      where: {
        referralCount: {
          gt: 0
        }
      },
      select: {
        walletAddress: true,
        referralCount: true,
        referralPoints: true,
        createdAt: true
      },
      orderBy: [
        { referralCount: 'desc' },
        { referralPoints: 'desc' }
      ],
      take: limit
    })
    
    // Format leaderboard with ranks
    const formattedLeaderboard = leaderboard.map((user, index) => ({
      rank: index + 1,
      walletAddress: user.walletAddress,
      referralCount: user.referralCount,
      referralPoints: user.referralPoints,
      joinedAt: user.createdAt
    }))
    
    return NextResponse.json({
      ok: true,
      data: formattedLeaderboard
    })
    
  } catch (error) {
    console.error('Referral leaderboard error:', error)
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to fetch referral leaderboard'
    }, { status: 500 })
  }
}
