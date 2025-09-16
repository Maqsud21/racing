import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    // Rate limiting DISABLED for development
    
    let session = null
    try {
      session = await getSession()
    } catch (error) {
      // Session error is OK, we'll continue without authentication
      console.log('No valid session found, continuing without auth')
    }
    
    // Get current race
    const currentRace = await db.race.findFirst({
      where: {
        status: {
          in: ['OPEN', 'LOCKED']
        }
      },
      include: {
        votes: {
          where: session?.userId ? {
            userId: session.userId
          } : undefined,
          select: {
            pick: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // Get next race schedule if no current race
    let nextSchedule = null
    if (!currentRace) {
      const schedule = await db.raceSchedule.findFirst({
        where: { isActive: true },
        orderBy: { scheduledAt: 'asc' }
      })
      
      if (schedule) {
        nextSchedule = {
          id: schedule.id,
          scheduledAt: schedule.scheduledAt.toISOString(),
          duration: schedule.duration
        }
      }
    }
    
    if (!currentRace) {
      return NextResponse.json({ 
        ok: true, 
        data: { 
          race: null,
          userVote: null,
          nextSchedule
        } 
      })
    }
    
    const userVote = currentRace.votes.length > 0 ? currentRace.votes[0] : null
    
    return NextResponse.json({ 
      ok: true, 
      data: { 
        race: {
          id: currentRace.id,
          startAt: currentRace.startAt,
          endAt: currentRace.endAt,
          status: currentRace.status,
          winner: currentRace.winner,
          uniqueIdx: currentRace.uniqueIdx
        },
        userVote: userVote ? {
          pick: userVote.pick,
          createdAt: userVote.createdAt
        } : null
      } 
    })
  } catch (error) {
    console.error('Current race error:', error)
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to fetch current race' 
    }, { status: 500 })
  }
}
