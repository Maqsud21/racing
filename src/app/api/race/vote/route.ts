import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { Roach } from '@prisma/client'
import { verifySolPayment } from '@/lib/solana'

const voteSchema = z.object({
  raceId: z.string().min(1),
  pick: z.enum(['JESSE', 'BRIAN', 'GREG', 'DALE']),
  transactionSignature: z.string().min(1, 'Transaction signature is required')
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting DISABLED for development
    
    const auth = await requireAuth()
    const body = await request.json()
    const { raceId, pick, transactionSignature } = voteSchema.parse(body)
    
    // Get the race
    const race = await db.race.findUnique({
      where: { id: raceId }
    })
    
    if (!race) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Race not found' 
      }, { status: 404 })
    }
    
    if (race.status !== 'OPEN') {
      return NextResponse.json({ 
        ok: false, 
        error: 'Race is not open for voting' 
      }, { status: 400 })
    }
    
    // Check if race is still in voting window (until race ends)
    const now = new Date()
    const raceEnd = new Date(race.endAt)
    
    if (now > raceEnd) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Voting window has closed' 
      }, { status: 400 })
    }
    
    // Verify SOL payment
    const paymentVerification = await verifySolPayment(auth.walletAddress, transactionSignature)
    
    if (!paymentVerification.isValid) {
      return NextResponse.json({ 
        ok: false, 
        error: paymentVerification.error || 'Payment verification failed' 
      }, { status: 400 })
    }
    
    // Upsert vote (update if exists, create if not)
    const vote = await db.vote.upsert({
      where: {
        raceId_userId: {
          raceId,
          userId: auth.userId
        }
      },
      update: {
        pick: pick as Roach,
        sig: transactionSignature // Store the transaction signature
      },
      create: {
        raceId,
        userId: auth.userId,
        pick: pick as Roach,
        sig: transactionSignature // Store the transaction signature
      }
    })
    
    return NextResponse.json({ 
      ok: true, 
      data: { 
        vote: {
          id: vote.id,
          pick: vote.pick,
          createdAt: vote.createdAt
        },
        message: 'Vote recorded successfully'
      } 
    })
  } catch (error) {
    console.error('Vote error:', error)
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to record vote' 
    }, { status: 500 })
  }
}
