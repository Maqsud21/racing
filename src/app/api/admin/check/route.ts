import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const checkSchema = z.object({
  walletAddress: z.string().min(1)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress } = checkSchema.parse(body)
    
    // Check if wallet is in admin list
    const adminWallets = process.env.ADMIN_WALLETS?.split(',') || []
    const isAdmin = adminWallets.includes(walletAddress)
    
    return NextResponse.json({ 
      ok: true, 
      data: { isAdmin } 
    })
  } catch (error) {
    console.error('Admin check error:', error)
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to check admin status' 
    }, { status: 400 })
  }
}
