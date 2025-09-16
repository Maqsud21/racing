import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    
    // If no session, return null user (not authenticated)
    if (!session.userId || !session.walletAddress) {
      return NextResponse.json({ 
        ok: true, 
        data: { user: null } 
      })
    }
    
    const user = await db.user.findUnique({
      where: { id: session.userId },
      include: {
        votes: {
          include: {
            race: {
              select: {
                id: true,
                uniqueIdx: true,
                status: true,
                winner: true,
                startAt: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 20
        }
      }
    })
    
    if (!user) {
      return NextResponse.json({ 
        ok: false, 
        error: 'User not found' 
      }, { status: 404 })
    }
    
    // Calculate additional stats
    const totalVotes = user.votes.length
    const correctVotes = user.votes.filter(vote => 
      vote.race.status === 'SETTLED' && vote.race.winner === vote.pick
    ).length
    
    // Calculate user's rank based on points
    const usersWithHigherPoints = await db.user.count({
      where: {
        points: {
          gt: user.points
        }
      }
    })
    const userRank = usersWithHigherPoints + 1
    
    const recentVotes = user.votes.map(vote => ({
      id: vote.id,
      pick: vote.pick,
      raceNumber: vote.race.uniqueIdx,
      raceStatus: vote.race.status,
      winner: vote.race.winner,
      isCorrect: vote.race.status === 'SETTLED' && vote.race.winner === vote.pick,
      createdAt: vote.createdAt
    }))
    
    return NextResponse.json({ 
      ok: true, 
      data: { 
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          points: user.points,
          accuracyPct: user.accuracyPct,
          streak: user.streak,
          rank: userRank,
          createdAt: user.createdAt,
          referralCode: user.referralCode,
          referralCount: user.referralCount,
          referralPoints: user.referralPoints
        },
        stats: {
          totalVotes,
          correctVotes,
          accuracyPct: totalVotes > 0 ? (correctVotes / totalVotes) * 100 : 0
        },
        recentVotes
      } 
    })
  } catch (error) {
    console.error('User profile error:', error)
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to fetch user profile' 
    }, { status: 500 })
  }
}
