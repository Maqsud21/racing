import { IronSession, getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { db } from './db'
import { PublicKey } from '@solana/web3.js'
import nacl from 'tweetnacl'

export interface SessionData {
  walletAddress?: string
  userId?: string
  nonce?: string
}

export type Session = IronSession<SessionData>

const sessionOptions = {
  password: process.env.IRON_SESSION_PASSWORD!,
  cookieName: 'roach-rumble-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
}

export async function getSession(): Promise<Session> {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}

export async function createSession(walletAddress: string): Promise<Session> {
  const session = await getSession()
  
  // Find or create user
  let user = await db.user.findUnique({
    where: { walletAddress }
  })
  
  if (!user) {
    user = await db.user.create({
      data: { walletAddress }
    })
  }
  
  // Generate new nonce
  const nonce = Math.random().toString(36).substring(2, 15)
  
  // Create session record
  await db.session.create({
    data: {
      userId: user.id,
      nonce,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
  })
  
  session.walletAddress = walletAddress
  session.userId = user.id
  session.nonce = nonce
  
  await session.save()
  return session
}

export async function verifySignature(
  message: string,
  signature: string,
  publicKey: string
): Promise<boolean> {
  try {
    const messageBytes = new TextEncoder().encode(message)
    const signatureBytes = Buffer.from(signature, 'base64')
    const publicKeyBytes = new PublicKey(publicKey).toBytes()
    
    return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes)
  } catch (error) {
    console.error('Signature verification failed:', error)
    return false
  }
}

export async function requireAuth(): Promise<{ userId: string; walletAddress: string }> {
  const session = await getSession()
  
  if (!session.userId || !session.walletAddress) {
    throw new Error('Authentication required')
  }
  
  return {
    userId: session.userId,
    walletAddress: session.walletAddress
  }
}

export async function requireAdmin(): Promise<{ userId: string; walletAddress: string }> {
  const auth = await requireAuth()
  const adminWallets = process.env.ADMIN_WALLETS?.split(',') || []
  
  if (!adminWallets.includes(auth.walletAddress)) {
    throw new Error('Admin access required')
  }
  
  return auth
}
