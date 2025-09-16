import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    
    const users = await db.user.findMany({
      select: {
        id: true,
        walletAddress: true,
        points: true,
        accuracyPct: true,
        streak: true,
        createdAt: true,
        _count: {
          select: {
            votes: true
          }
        }
      },
      orderBy: [
        { points: 'desc' },
        { accuracyPct: 'desc' },
        { createdAt: 'asc' }
      ],
      take: limit
    })
    
    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      walletAddress: user.walletAddress,
      points: user.points,
      accuracyPct: user.accuracyPct,
      streak: user.streak,
      totalVotes: user._count.votes,
      joinedAt: user.createdAt
    }))
    
    return NextResponse.json({ 
      ok: true, 
      data: { leaderboard } 
    })
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to fetch leaderboard' 
    }, { status: 500 })
  }
}
