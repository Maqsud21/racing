import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const nonceSchema = z.object({
  walletAddress: z.string().min(1)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    nonceSchema.parse(body)
    
    // Generate a random nonce
    const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    
    return NextResponse.json({ 
      ok: true, 
      data: { nonce } 
    })
  } catch (error) {
    console.error('Nonce generation error:', error)
    return NextResponse.json({ 
      ok: false, 
      error: 'Invalid request' 
    }, { status: 400 })
  }
}
