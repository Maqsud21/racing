import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const envVars = {
      PUMP_FUN_LINK: process.env.PUMP_FUN_LINK || 'https://pump.fun',
      CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS || ''
    }

    return NextResponse.json({
      ok: true,
      data: envVars
    })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: 'Failed to fetch environment variables'
    }, { status: 500 })
  }
}
