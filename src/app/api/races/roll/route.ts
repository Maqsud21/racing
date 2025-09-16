import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Check cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Unauthorized' 
      }, { status: 401 })
    }
    
    const now = new Date()
    
    // Check if there's already an active race
    const activeRace = await db.race.findFirst({
      where: {
        status: {
          in: ['OPEN', 'LOCKED']
        }
      }
    })
    
    if (activeRace) {
      const votingEnd = new Date(activeRace.endAt)
      
      if (activeRace.status === 'OPEN' && now >= votingEnd) {
        // Voting period has ended, race is now live
        await db.race.update({
          where: { id: activeRace.id },
          data: { status: 'LOCKED' }
        })
        
        return NextResponse.json({ 
          ok: true, 
          data: { 
            action: 'locked',
            raceId: activeRace.id,
            message: 'Voting closed - race is now live'
          } 
        })
      }
      
      return NextResponse.json({ 
        ok: true, 
        data: { 
          action: 'no_change',
          raceId: activeRace.id,
          message: 'Active race exists'
        } 
      })
    }
    
    // No active race, check for scheduled races
    const scheduledRace = await db.raceSchedule.findFirst({
      where: {
        isActive: true,
        scheduledAt: {
          lte: now // scheduled time has passed
        }
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    })
    
    if (scheduledRace) {
      // Create race from schedule
      const votingStartAt = scheduledRace.scheduledAt
      const votingEndAt = new Date(votingStartAt.getTime() + scheduledRace.duration * 1000)
      const raceStartAt = votingEndAt // Race starts when voting ends
      
      // Get next race number
      const config = await db.config.findFirst()
      const nextRaceNumber = (config?.lastRaceNumber || 0) + 1
      
      // Create new race
      const newRace = await db.race.create({
        data: {
          id: `race_${Date.now()}`,
          startAt: votingStartAt, // This is when voting starts
          endAt: votingEndAt,     // This is when voting ends
          status: 'OPEN',        // Voting is open
          uniqueIdx: nextRaceNumber
        }
      })
      
      // Deactivate the schedule
      await db.raceSchedule.update({
        where: { id: scheduledRace.id },
        data: { isActive: false }
      })
      
      // Update config with new race number
      await db.config.upsert({
        where: { id: 1 },
        update: { lastRaceNumber: nextRaceNumber },
        create: { 
          id: 1,
          lastRaceNumber: nextRaceNumber,
          pointsPerCorrect: 1,
          enableStreaks: false
        }
      })
      
      return NextResponse.json({ 
        ok: true, 
        data: { 
          action: 'created_from_schedule',
          race: {
            id: newRace.id,
            startAt: newRace.startAt,
            endAt: newRace.endAt,
            status: newRace.status,
            uniqueIdx: newRace.uniqueIdx
          },
          message: 'New race created from schedule - voting is now open'
        } 
      })
    }
    
    // No scheduled race, create a default one
    const startAt = now
    const endAt = new Date(now.getTime() + 10 * 60 * 1000) // 10 minutes from now
    
    // Get next race number
    const config = await db.config.findFirst()
    const nextRaceNumber = (config?.lastRaceNumber || 0) + 1
    
    // Create new race
    const newRace = await db.race.create({
      data: {
        id: `race_${Date.now()}`,
        startAt,
        endAt,
        status: 'OPEN',
        uniqueIdx: nextRaceNumber
      }
    })
    
    // Update config with new race number
    await db.config.upsert({
      where: { id: 1 },
      update: { lastRaceNumber: nextRaceNumber },
      create: { 
        id: 1,
        lastRaceNumber: nextRaceNumber,
        pointsPerCorrect: 1,
        enableStreaks: false
      }
    })
    
    return NextResponse.json({ 
      ok: true, 
      data: { 
        action: 'created',
        race: {
          id: newRace.id,
          startAt: newRace.startAt,
          endAt: newRace.endAt,
          status: newRace.status,
          uniqueIdx: newRace.uniqueIdx
        },
        message: 'New race created'
      } 
    })
  } catch (error) {
    console.error('Race roll error:', error)
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to manage races' 
    }, { status: 500 })
  }
}
