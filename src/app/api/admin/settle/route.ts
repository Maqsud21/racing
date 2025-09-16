import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
// import { Roach } from '@prisma/client' // Not needed for this file

const settleSchema = z.object({
  raceId: z.string().min(1),
  winner: z.enum(['JESSE', 'BRIAN', 'GREG', 'DALE'])
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting DISABLED for development
    
    const auth = await requireAdmin()
    const body = await request.json()
    const { raceId, winner } = settleSchema.parse(body)
    
    // Get the race
    const race = await db.race.findUnique({
      where: { id: raceId },
      include: {
        votes: {
          include: {
            user: true
          }
        }
      }
    })
    
    if (!race) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Race not found' 
      }, { status: 404 })
    }
    
    if (race.status === 'SETTLED') {
      return NextResponse.json({ 
        ok: false, 
        error: 'Race already settled' 
      }, { status: 400 })
    }
    
    // Get config for points per correct answer
    const config = await db.config.findFirst()
    const pointsPerCorrect = config?.pointsPerCorrect || 1
    
    // Start transaction to settle race and award points
    const result = await db.$transaction(async (tx) => {
      // Update race status and winner
      const updatedRace = await tx.race.update({
        where: { id: raceId },
        data: {
          status: 'SETTLED',
          winner: winner as any
        }
      })
      
      // Award points to correct voters
      const correctVotes = race.votes.filter(vote => vote.pick === winner)
      
      if (correctVotes.length > 0) {
        // Update points for all correct voters
        await tx.user.updateMany({
          where: {
            id: {
              in: correctVotes.map(vote => vote.userId)
            }
          },
          data: {
            points: {
              increment: pointsPerCorrect
            }
          }
        })
        
        // Update accuracy percentages and streaks for all voters
        for (const vote of race.votes) {
          const user = vote.user
          const isCorrect = vote.pick === winner
          
          // Get all votes by this user
          const allUserVotes = await tx.vote.findMany({
            where: { userId: user.id },
            include: { race: true }
          })
          
          // Count correct votes (where user's pick matches race winner)
          const correctVotes = allUserVotes.filter(vote => 
            vote.race.status === 'SETTLED' && vote.pick === vote.race.winner
          ).length
          
          const totalVotes = allUserVotes.length
          const accuracyPct = totalVotes > 0 ? (correctVotes / totalVotes) * 100 : 0
          
          // Calculate new streak
          let newStreak = user.streak
          if (isCorrect) {
            newStreak += 1
          } else {
            newStreak = 0 // Reset streak on incorrect vote
          }
          
          await tx.user.update({
            where: { id: user.id },
            data: { 
              accuracyPct,
              streak: newStreak
            }
          })
        }
      }
      
      return {
        race: updatedRace,
        correctVotes: correctVotes.length,
        totalVotes: race.votes.length,
        pointsAwarded: correctVotes.length * pointsPerCorrect
      }
    })
    
    return NextResponse.json({ 
      ok: true, 
      data: { 
        race: {
          id: result.race.id,
          status: result.race.status,
          winner: result.race.winner
        },
        stats: {
          correctVotes: result.correctVotes,
          totalVotes: result.totalVotes,
          pointsAwarded: result.pointsAwarded
        },
        message: 'Race settled successfully'
      } 
    })
  } catch (error) {
    console.error('Settle error:', error)
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to settle race' 
    }, { status: 500 })
  }
}
