'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'

export function WalletButton() {
  const { connected, publicKey, signMessage, disconnect } = useWallet()
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const searchParams = useSearchParams()
  const referralCode = searchParams.get('ref')

  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if user is already signed in when wallet connects
  useEffect(() => {
    if (connected && publicKey && !isSignedIn && !isAuthenticating) {
      // Check if there's an existing session
      checkExistingSession()
    }
  }, [connected, publicKey, isSignedIn, isAuthenticating])

  const checkExistingSession = async () => {
    try {
      const response = await fetch('/api/user/me')
      const data = await response.json()
      
      if (data.ok && data.data.user) {
        // User is already signed in
        setIsSignedIn(true)
      }
    } catch (error) {
      // No existing session, user needs to sign in manually
      console.log('No existing session found')
    }
  }

  const handleSignIn = async () => {
    if (!signMessage || !publicKey) return

    setIsAuthenticating(true)
    try {
      // Get nonce from server
      const nonceResponse = await fetch('/api/auth/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: publicKey.toString() })
      })
      
      const nonceData = await nonceResponse.json()
      if (!nonceData.ok) {
        throw new Error(nonceData.error || 'Failed to get nonce')
      }

      // Create simple message to sign
      const message = `Sign in to Roach Rumble - ${nonceData.data.nonce}`
      
      // Sign the message
      const encodedMessage = new TextEncoder().encode(message)
      const signature = await signMessage(encodedMessage)
      const signatureBase64 = Buffer.from(signature).toString('base64')

      // Verify with server
      const verifyResponse = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          nonce: nonceData.data.nonce,
          signature: signatureBase64,
          referralCode: referralCode || undefined
        })
      })

      const verifyData = await verifyResponse.json()
      if (!verifyData.ok) {
        throw new Error(verifyData.error || 'Authentication failed')
      }

      toast.success('Successfully signed in!')
      setIsSignedIn(true)
      // Refresh the page to update all auth states
      window.location.reload()
    } catch (error) {
      console.error('Sign in error:', error)
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('User rejected') || error.message.includes('rejected')) {
          toast.error('Sign-in cancelled by user')
        } else {
          toast.error(error.message)
        }
      } else {
        toast.error('Sign in failed')
      }
    } finally {
      setIsAuthenticating(false)
    }
  }

  if (!mounted) {
    return (
      <Button className="degen-btn mobile-button">
        <span className="animate-pulse">⚡</span> LOADING...
      </Button>
    )
  }

  if (!connected) {
    return (
      <div className="w-full sm:w-auto space-y-2">
        {referralCode && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/50 rounded-full">
              <span className="text-xs degen-text font-bold">🎁 REFERRAL ACTIVE</span>
              <span className="text-xs degen-muted font-mono">{referralCode}</span>
            </div>
          </div>
        )}
        <WalletMultiButton className="degen-btn mobile-button font-black w-full sm:w-auto" />
      </div>
    )
  }

  const handleLogout = async () => {
    try {
      await disconnect()
      setIsSignedIn(false)
      toast.success('Disconnected from wallet')
      // Clear any session data
      window.location.reload()
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to disconnect')
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto">
      {/* Wallet Address - Hidden on mobile to save space */}
      <div className="degen-muted text-xs sm:text-sm font-bold hidden sm:block">
        {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
      </div>
      
      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        {isAuthenticating ? (
          <Button 
            disabled
            className="degen-btn mobile-button w-full sm:w-auto"
          >
            <span className="flex items-center gap-2">
              <span className="animate-spin">⚡</span>
              <span className="hidden sm:inline">SIGNING...</span>
              <span className="sm:hidden">SIGNING</span>
            </span>
          </Button>
        ) : isSignedIn ? (
          <Button 
            onClick={handleLogout}
            className="degen-btn mobile-button w-full sm:w-auto"
          >
            <span className="flex items-center gap-2">
              <span>✅</span>
              <span className="hidden sm:inline">SIGNED IN</span>
              <span className="sm:hidden">SIGNED IN</span>
            </span>
          </Button>
        ) : (
          <Button 
            onClick={handleSignIn}
            className="degen-btn mobile-button w-full sm:w-auto"
          >
            <span className="flex items-center gap-2">
              <span>🚀</span>
              <span className="hidden sm:inline">SIGN IN</span>
              <span className="sm:hidden">SIGN IN</span>
            </span>
          </Button>
        )}
      </div>
    </div>
  )
}
