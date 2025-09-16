'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Share2, Copy, Users, Trophy, Gift, Check, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { toast } from 'sonner'

interface ReferralStats {
  referralCode: string | null
  referralCount: number
  referralPoints: number
  referralLink: string
}

interface ReferralLeaderboardEntry {
  rank: number
  walletAddress: string
  referralCount: number
  referralPoints: number
  joinedAt: string
}

export default function ReferralPage() {
  const { connected, publicKey } = useWallet()
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null)
  const [leaderboard, setLeaderboard] = useState<ReferralLeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }

  const fetchReferralStats = async () => {
    if (!connected || !publicKey) return

    try {
      const response = await fetch('/api/referral/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const data = await response.json()
      if (data.ok) {
        setReferralStats({
          referralCode: data.data.referralCode,
          referralCount: 0, // Will be updated from user profile
          referralPoints: 0, // Will be updated from user profile
          referralLink: data.data.referralLink
        })
      }
    } catch (error) {
      console.error('Error fetching referral stats:', error)
    }
  }

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/referral/leaderboard?limit=50')
      const data = await response.json()
      if (data.ok) {
        setLeaderboard(data.data)
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    }
  }

  const fetchUserProfile = async () => {
    if (!connected || !publicKey) return

    try {
      const response = await fetch('/api/user/me')
      const data = await response.json()
      if (data.ok && referralStats) {
        setReferralStats(prev => prev ? {
          ...prev,
          referralCount: data.data.referralCount || 0,
          referralPoints: data.data.referralPoints || 0
        } : null)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchReferralStats(),
        fetchLeaderboard()
      ])
      setLoading(false)
    }

    loadData()
  }, [connected, publicKey])

  useEffect(() => {
    if (referralStats?.referralCode) {
      fetchUserProfile()
    }
  }, [referralStats?.referralCode, connected])

  const copyReferralLink = async () => {
    if (!referralStats?.referralLink) return

    try {
      await navigator.clipboard.writeText(referralStats.referralLink)
      setCopied(true)
      toast.success('Referral link copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const shareToSocial = (platform: 'twitter' | 'telegram') => {
    if (!referralStats?.referralLink) return

    const text = `🪳 ROACH RALLY 🪳

Join me in the ultimate cockroach racing experience! 

Use my referral link to get started:
${referralStats.referralLink}

Race every 10 minutes, vote on your favorite roach, and earn points!

ARE YOU WINNING ROACH? 🚀`

    const encodedText = encodeURIComponent(text)
    
    if (platform === 'twitter') {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}`
      window.open(twitterUrl, '_blank', 'width=600,height=400')
    } else if (platform === 'telegram') {
      const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(referralStats.referralLink)}&text=${encodedText}`
      window.open(telegramUrl, '_blank', 'width=600,height=400')
    }
  }

  const getNextRewardMilestone = (currentCount: number) => {
    if (currentCount < 100) {
      const nextMilestone = Math.ceil(currentCount / 3) * 3
      return {
        count: nextMilestone,
        points: Math.floor(nextMilestone / 3),
        remaining: nextMilestone - currentCount
      }
    } else {
      const nextMilestone = Math.ceil((currentCount - 100) / 3) * 3 + 100
      return {
        count: nextMilestone,
        points: Math.floor((nextMilestone - 100) / 3) * 2,
        remaining: nextMilestone - currentCount
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <div className="text-2xl sm:text-3xl roach-bounce">🪳</div>
            <p className="degen-text font-black text-lg sm:text-xl mt-4">Loading referral system...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-black text-white p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="text-center sm:text-left">
              <h1 className="degen-text font-black text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
                🎁 REFERRAL SYSTEM 🎁
              </h1>
              <p className="degen-muted text-xs sm:text-sm md:text-base">
                Invite friends and earn points!
              </p>
            </div>
            <Link href="/" className="degen-btn mobile-button w-full sm:w-auto">
              <span className="flex items-center gap-2">
                <span className="hidden sm:inline">BACK TO RACE</span>
                <span className="sm:hidden">BACK</span>
              </span>
            </Link>
          </div>

          <div className="text-center py-20">
            <div className="text-6xl sm:text-8xl roach-bounce mb-6">🔗</div>
            <h2 className="degen-text font-black text-2xl sm:text-3xl mb-4">Connect Your Wallet</h2>
            <p className="degen-muted text-sm sm:text-base mb-8">
              Connect your wallet to access the referral system and start earning points!
            </p>
            <Link href="/" className="degen-btn mobile-button">
              <span className="flex items-center gap-2">
                <span>CONNECT WALLET</span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const nextMilestone = referralStats ? getNextRewardMilestone(referralStats.referralCount) : null

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="text-center sm:text-left">
            <h1 className="degen-text font-black text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
              🎁 REFERRAL SYSTEM 🎁
            </h1>
            <p className="degen-muted text-xs sm:text-sm md:text-base">
              Invite friends and earn points!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" className="degen-btn mobile-button w-full sm:w-auto">
                <span className="flex items-center gap-2">
                  <span>←</span>
                  <span className="hidden sm:inline">BACK TO RACE</span>
                  <span className="sm:hidden">BACK</span>
                </span>
              </Button>
            </Link>
            <Link href="/leaderboard" className="w-full sm:w-auto">
              <Button variant="outline" className="degen-btn mobile-button w-full sm:w-auto">
                🏆 LEADERBOARD
              </Button>
            </Link>
            <Link href="/me" className="w-full sm:w-auto">
              <Button variant="outline" className="degen-btn mobile-button w-full sm:w-auto">
                👤 MY PROFILE
              </Button>
            </Link>
          </div>
        </div>

        {/* Referral Stats */}
        <div className="degen-card p-4 sm:p-6">
          <h2 className="degen-subtitle mb-4 sm:mb-6 text-center text-lg sm:text-xl">📊 YOUR REFERRAL STATS 📊</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl mb-2">👥</div>
              <div className="degen-text font-black text-lg sm:text-xl">{referralStats?.referralCount || 0}</div>
              <div className="degen-muted text-xs">REFERRALS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl mb-2">🎁</div>
              <div className="degen-text font-black text-lg sm:text-xl">{referralStats?.referralPoints || 0}</div>
              <div className="degen-muted text-xs">REFERRAL PTS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl mb-2">🏆</div>
              <div className="degen-text font-black text-lg sm:text-xl">{referralStats?.referralCode ? 'ACTIVE' : 'INACTIVE'}</div>
              <div className="degen-muted text-xs">STATUS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl mb-2">🎯</div>
              <div className="degen-text font-black text-lg sm:text-xl">{nextMilestone?.remaining || 0}</div>
              <div className="degen-muted text-xs">TO NEXT</div>
            </div>
          </div>

          {/* Referral Link */}
          <div className="space-y-4">
            {referralStats?.referralCode ? (
              <div className="degen-card p-4 sm:p-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-2 border-purple-400/50">
                <h3 className="degen-text font-black text-center mb-4 text-lg sm:text-xl">🔗 YOUR REFERRAL LINK</h3>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <div className="flex-1 p-3 bg-gray-900 rounded-lg border border-gray-700">
                      <div className="text-xs degen-muted mb-1">REFERRAL CODE:</div>
                      <div className="font-mono text-sm degen-text font-bold">{referralStats.referralCode}</div>
                    </div>
                    <Button 
                      onClick={copyReferralLink}
                      className="degen-btn mobile-button"
                    >
                      <span className="flex items-center gap-2">
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span className="hidden sm:inline">{copied ? 'COPIED!' : 'COPY'}</span>
                        <span className="sm:hidden">{copied ? '✓' : 'COPY'}</span>
                      </span>
                    </Button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <div className="flex-1 p-3 bg-gray-900 rounded-lg border border-gray-700">
                      <div className="text-xs degen-muted mb-1">FULL LINK:</div>
                      <div className="font-mono text-xs degen-text font-bold break-all">{referralStats.referralLink}</div>
                    </div>
                    <Button 
                      onClick={copyReferralLink}
                      className="degen-btn mobile-button"
                    >
                      <span className="flex items-center gap-2">
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span className="hidden sm:inline">{copied ? 'COPIED!' : 'COPY'}</span>
                        <span className="sm:hidden">{copied ? '✓' : 'COPY'}</span>
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="degen-card p-4 sm:p-6 bg-gradient-to-br from-gray-500/20 to-gray-600/20 border-2 border-gray-400/50">
                <h3 className="degen-text font-black text-center mb-4 text-lg sm:text-xl">🔗 GENERATE YOUR REFERRAL LINK</h3>
                <div className="text-center space-y-4">
                  <div className="text-4xl sm:text-6xl mb-4">🎁</div>
                  <p className="degen-muted text-sm sm:text-base mb-4">
                    Generate your unique referral code to start inviting friends and earning points!
                  </p>
                  <Button 
                    onClick={fetchReferralStats}
                    className="degen-btn mobile-button"
                  >
                    <span className="flex items-center gap-2">
                      <span>🚀</span>
                      <span className="hidden sm:inline">GENERATE REFERRAL CODE</span>
                      <span className="sm:hidden">GENERATE</span>
                    </span>
                  </Button>
                </div>
              </div>
            )}

            {/* Share Buttons - Only show when referral code exists */}
            {referralStats?.referralCode && (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button 
                  onClick={() => shareToSocial('twitter')}
                  className="degen-btn mobile-button flex-1"
                >
                  <span className="flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">SHARE ON X</span>
                    <span className="sm:hidden">X</span>
                  </span>
                </Button>
                
                <Button 
                  onClick={() => shareToSocial('telegram')}
                  className="degen-btn mobile-button flex-1"
                >
                  <span className="flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">TELEGRAM</span>
                    <span className="sm:hidden">TG</span>
                  </span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Reward System Info */}
        <div className="degen-card p-4 sm:p-6">
          <h2 className="degen-subtitle mb-4 sm:mb-6 text-center text-lg sm:text-xl">💰 REWARD SYSTEM 💰</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-400/50 rounded-lg">
                <h3 className="degen-text font-black text-sm sm:text-base mb-2">📈 FIRST 100 REFERRALS</h3>
                <p className="degen-muted text-xs sm:text-sm">Every 3 referrals = 1 point</p>
                <div className="mt-2">
                  <Badge className="bg-green-600 text-white text-xs">3 refs → 1 pt</Badge>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-400/50 rounded-lg">
                <h3 className="degen-text font-black text-sm sm:text-base mb-2">🚀 AFTER 100 REFERRALS</h3>
                <p className="degen-muted text-xs sm:text-sm">Every 3 referrals = 2 points</p>
                <div className="mt-2">
                  <Badge className="bg-purple-600 text-white text-xs">3 refs → 2 pts</Badge>
                </div>
              </div>
            </div>

            {nextMilestone && (
              <div className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-400/50 rounded-lg">
                <h3 className="degen-text font-black text-sm sm:text-base mb-2">🎯 NEXT MILESTONE</h3>
                <p className="degen-muted text-xs sm:text-sm">
                  {nextMilestone.remaining} more referrals to reach {nextMilestone.count} total referrals
                </p>
                <p className="degen-text font-bold text-sm sm:text-base mt-1">
                  You'll earn {nextMilestone.points} point{nextMilestone.points !== 1 ? 's' : ''}!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Referral Leaderboard */}
        <div className="degen-card overflow-hidden">
          <div className="p-4 sm:p-6 border-b-2 border-gray-700">
            <h2 className="degen-subtitle text-center text-lg sm:text-xl">🏆 REFERRAL LEADERBOARD 🏆</h2>
          </div>
          
          <div className="divide-y divide-gray-700">
            {leaderboard.length === 0 ? (
              <div className="p-6 sm:p-8 text-center">
                <div className="text-4xl sm:text-6xl mb-4">📊</div>
                <p className="degen-muted text-sm sm:text-base">No referrals yet! Be the first to invite friends!</p>
              </div>
            ) : (
              leaderboard.map((entry, index) => (
                <div key={entry.walletAddress} className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-black text-sm sm:text-base">
                        {entry.rank}
                      </div>
                      <div>
                        <div className="font-mono text-xs sm:text-sm degen-text font-bold">
                          {formatWalletAddress(entry.walletAddress)}
                        </div>
                        <div className="degen-muted text-xs">
                          Joined {new Date(entry.joinedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="text-center">
                        <div className="degen-text font-black text-sm sm:text-base">{entry.referralCount}</div>
                        <div className="degen-muted text-xs">REFERRALS</div>
                      </div>
                      <div className="text-center">
                        <div className="degen-text font-black text-sm sm:text-base">{entry.referralPoints}</div>
                        <div className="degen-muted text-xs">POINTS</div>
                      </div>
                      {entry.rank <= 3 && (
                        <div className="text-2xl sm:text-3xl">
                          {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
