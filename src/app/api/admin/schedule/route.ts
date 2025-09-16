import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { z } from 'zod'

const scheduleSchema = z.object({
  scheduledAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid datetime format"
  }),
  duration: z.number().min(60).max(3600).optional().default(600), // 1 min to 1 hour
})

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await requireAdmin()
    
    const body = await request.json()
    const { scheduledAt, duration } = scheduleSchema.parse(body)
    
    const scheduledDate = new Date(scheduledAt)
    
    // Deactivate all existing schedules
    await db.raceSchedule.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    })
    
    // Create new schedule
    const schedule = await db.raceSchedule.create({
      data: {
        scheduledAt: scheduledDate,
        duration,
        createdBy: walletAddress,
        isActive: true
      }
    })
    
    return NextResponse.json({ 
      ok: true, 
      data: { 
        schedule: {
          id: schedule.id,
          scheduledAt: schedule.scheduledAt.toISOString(),
          duration: schedule.duration,
          isActive: schedule.isActive
        }
      } 
    })
  } catch (error) {
    console.error('Schedule creation error:', error)
    return NextResponse.json({ 
      ok: false, 
      error: error instanceof Error ? error.message : 'Failed to create schedule' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { walletAddress } = await requireAdmin()
    
    const schedules = await db.raceSchedule.findMany({
      where: { isActive: true },
      orderBy: { scheduledAt: 'asc' },
      take: 1
    })
    
    const nextSchedule = schedules[0] || null
    
    return NextResponse.json({ 
      ok: true, 
      data: { 
        nextSchedule: nextSchedule ? {
          id: nextSchedule.id,
          scheduledAt: nextSchedule.scheduledAt.toISOString(),
          duration: nextSchedule.duration,
          isActive: nextSchedule.isActive
        } : null
      } 
    })
  } catch (error) {
    console.error('Schedule fetch error:', error)
    return NextResponse.json({ 
      ok: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch schedule' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { walletAddress } = await requireAdmin()
    
    // Deactivate all schedules
    await db.raceSchedule.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    })
    
    return NextResponse.json({ 
      ok: true, 
      data: { message: 'All schedules deactivated' } 
    })
  } catch (error) {
    console.error('Schedule deletion error:', error)
    return NextResponse.json({ 
      ok: false, 
      error: error instanceof Error ? error.message : 'Failed to delete schedule' 
    }, { status: 500 })
  }
}
