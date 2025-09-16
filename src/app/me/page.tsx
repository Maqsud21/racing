'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trophy, Target, TrendingUp, Clock, CheckCircle, XCircle, Copy } from 'lucide-react'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { ShareProfile } from '@/components/ShareProfile'
import { toast } from 'sonner'

interface UserProfile {
  id: string
  walletAddress: string
  points: number
  accuracyPct: number
  streak: number
  createdAt: string
}

interface UserStats {
  totalVotes: number
  correctVotes: number
  accuracyPct: number
}

interface RecentVote {
  id: string
  pick: string
  raceNumber: number
  raceStatus: string
  winner: string | null
  isCorrect: boolean
  createdAt: string
}

export default function Profile() {
  const { connected } = useWallet()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [recentVotes, setRecentVotes] = useState<RecentVote[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!connected) {
      setIsLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/user/me')
        const data = await response.json()
        
        if (data.ok) {
          setProfile(data.data.user)
          setStats(data.data.stats)
          setRecentVotes(data.data.recentVotes)
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [connected])

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getRoachEmoji = (roach: string) => {
    const emojis: Record<string, string> = {
      JESSE: '🏃‍♂️',
      BRIAN: '🕵️‍♂️',
      GREG: '💪',
      DALE: '🥷'
    }
    return emojis[roach] || '🪳'
  }

  const getRoachName = (roach: string) => {
    const names: Record<string, string> = {
      JESSE: 'Jesse',
      BRIAN: 'Brian',
      GREG: 'Greg',
      DALE: 'Dale'
    }
    return names[roach] || roach
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-black roach-cursor">
        <div className="flex items-center justify-center h-64">
          <div className="degen-card p-8 text-center">
            <div className="text-6xl mb-4 roach-bounce">👤</div>
            <h2 className="degen-subtitle mb-2">CONNECT YOUR WALLET</h2>
            <p className="degen-muted mb-4">
              Connect your Solana wallet to view your profile and stats.
            </p>
            <Link href="/">
              <Button className="degen-btn mobile-button">
                <span className="flex items-center gap-2">
                  <span>🏠</span>
                  GO TO HOME
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black roach-cursor">
        <div className="flex items-center justify-center h-64">
          <div className="degen-text font-black text-xl">
            <span className="animate-spin">⚡</span> LOADING PROFILE...
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black roach-cursor">
        <div className="flex items-center justify-center h-64">
          <div className="degen-card p-8 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="degen-subtitle mb-2">PROFILE NOT FOUND</h2>
            <p className="degen-muted mb-4">
              We couldn&apos;t find your profile. Make sure you&apos;re signed in.
            </p>
            <Link href="/">
              <Button className="degen-btn mobile-button">
                <span className="flex items-center gap-2">
                  <span>🏠</span>
                  GO TO HOME
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black roach-cursor">
      {/* Header */}
      <header className="border-b-2 border-gray-800 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="text-center sm:text-left">
              <h1 className="degen-title roach-bounce text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
                👤 MY ROACH LORE 👤
              </h1>
              <p className="degen-muted font-bold text-xs sm:text-sm md:text-base">
                YOUR RACING STATS AND HISTORY 🚀
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
              <Link href="/referral" className="w-full sm:w-auto">
                <Button variant="outline" className="degen-btn mobile-button w-full sm:w-auto">
                  🎁 REFERRALS
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Stats */}
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div className="degen-card p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🏆</div>
            <div className="degen-text font-black text-lg sm:text-xl">{profile.points}</div>
            <div className="degen-muted text-xs">POINTS</div>
          </div>
          <div className="degen-card p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🎯</div>
            <div className="degen-text font-black text-lg sm:text-xl">
              {stats?.accuracyPct.toFixed(1) || 0}%
            </div>
            <div className="degen-muted text-xs">ACCURACY</div>
          </div>
          <div className="degen-card p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🔥</div>
            <div className="degen-text font-black text-lg sm:text-xl">{profile.streak}</div>
            <div className="degen-muted text-xs">STREAK</div>
          </div>
          <div className="degen-card p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">📊</div>
            <div className="degen-text font-black text-lg sm:text-xl">{stats?.totalVotes || 0}</div>
            <div className="degen-muted text-xs">VOTES</div>
          </div>
        </div>

        {/* Referral Stats */}
        <div className="degen-card p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="degen-subtitle mb-4 sm:mb-6 text-center text-lg sm:text-xl">🎁 REFERRAL STATS 🎁</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl mb-2">👥</div>
              <div className="degen-text font-black text-lg sm:text-xl">{profile.referralCount || 0}</div>
              <div className="degen-muted text-xs">REFERRALS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl mb-2">🎁</div>
              <div className="degen-text font-black text-lg sm:text-xl">{profile.referralPoints || 0}</div>
              <div className="degen-muted text-xs">REFERRAL PTS</div>
            </div>
            <div className="text-center col-span-2 md:col-span-1">
              <div className="text-2xl sm:text-3xl mb-2">🔗</div>
              <div className="degen-text font-black text-sm sm:text-base">
                {profile.referralCode ? 'ACTIVE' : 'INACTIVE'}
              </div>
              <div className="degen-muted text-xs">REFERRAL CODE</div>
            </div>
          </div>

          {/* Referral Link Display */}
          {profile.referralCode ? (
            <div className="space-y-3">
              <div className="p-3 bg-gray-900 rounded-lg border border-gray-700">
                <div className="text-xs degen-muted mb-1">YOUR REFERRAL LINK:</div>
                <div className="font-mono text-xs degen-text font-bold break-all mb-2">
                  {window.location.origin}?ref={profile.referralCode}
                </div>
                <Button
                  onClick={() => {
                    const link = `${window.location.origin}?ref=${profile.referralCode}`
                    navigator.clipboard.writeText(link)
                    toast.success('Referral link copied!')
                  }}
                  className="w-full degen-btn mobile-button"
                >
                  <span className="flex items-center gap-2">
                    <Copy className="w-4 h-4" />
                    <span>COPY REFERRAL LINK</span>
                  </span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="degen-muted text-sm sm:text-base mb-4">
                Generate your referral code to start inviting friends!
              </p>
              <Link href="/referral">
                <Button className="degen-btn mobile-button">
                  <span className="flex items-center gap-2">
                    <span>🚀</span>
                    <span>GENERATE REFERRAL CODE</span>
                  </span>
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="degen-card p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="degen-subtitle mb-3 sm:mb-4 text-center text-lg sm:text-xl">👤 PROFILE INFORMATION 👤</h2>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
              <span className="degen-muted font-bold text-xs sm:text-sm">WALLET ADDRESS:</span>
              <span className="font-mono text-xs sm:text-sm degen-text font-bold">
                {formatWalletAddress(profile.walletAddress)}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
              <span className="degen-muted font-bold text-xs sm:text-sm">MEMBER SINCE:</span>
              <span className="degen-text font-bold text-xs sm:text-sm">{formatDate(profile.createdAt)}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
              <span className="degen-muted font-bold text-xs sm:text-sm">CORRECT VOTES:</span>
              <span className="degen-text font-bold text-xs sm:text-sm">
                {stats?.correctVotes || 0} / {stats?.totalVotes || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Share Profile */}
        <div className="degen-card p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="degen-subtitle mb-3 sm:mb-4 text-center text-lg sm:text-xl">📢 SHARE YOUR ROACH LORE 📢</h2>
          <p className="degen-muted text-center text-xs sm:text-sm mb-4">
            Show off your roach racing skills! Share your stats and challenge others to join the race.
          </p>
          <ShareProfile userProfile={profile} userStats={stats || { totalVotes: 0, correctVotes: 0, accuracyPct: 0 }} />
        </div>

        {/* Recent Votes */}
        <div className="degen-card overflow-hidden">
          <div className="p-4 sm:p-6 border-b-2 border-gray-700">
            <h2 className="degen-subtitle text-center text-lg sm:text-xl">📊 RECENT VOTES 📊</h2>
          </div>
          <div className="divide-y divide-gray-700">
            {recentVotes.length === 0 ? (
              <div className="p-6 sm:p-8 text-center degen-muted">
                <div className="text-4xl sm:text-6xl mb-4 roach-bounce">📊</div>
                <p className="degen-text font-bold text-sm sm:text-base">NO VOTES YET. JOIN A RACE TO START BUILDING YOUR STATS!</p>
              </div>
            ) : (
              recentVotes.map((vote) => (
                <div key={vote.id} className="p-3 sm:p-4 hover:bg-gray-800/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-2 sm:mb-3">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <span className="text-2xl sm:text-3xl">{getRoachEmoji(vote.pick)}</span>
                      <div>
                        <div className="degen-text font-black text-sm sm:text-base">
                          RACE #{vote.raceNumber}
                        </div>
                        <div className="degen-muted text-xs sm:text-sm">
                          Picked {getRoachName(vote.pick)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-left sm:text-right">
                      {vote.raceStatus === 'SETTLED' ? (
                        vote.isCorrect ? (
                          <div className="degen-btn px-2 sm:px-3 py-1 text-xs font-black bg-green-400 text-black">
                            ✅ CORRECT
                          </div>
                        ) : (
                          <div className="degen-btn px-2 sm:px-3 py-1 text-xs font-black bg-red-400 text-black">
                            ❌ WRONG
                          </div>
                        )
                      ) : (
                        <div className="degen-btn px-2 sm:px-3 py-1 text-xs font-black bg-yellow-400 text-black">
                          ⏳ PENDING
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {vote.raceStatus === 'SETTLED' && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-xs sm:text-sm">
                      <span className="degen-muted">
                        Winner: {vote.winner ? getRoachName(vote.winner) : 'TBD'}
                      </span>
                      <span className="degen-muted">
                        {formatDateTime(vote.createdAt)}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm degen-muted">
          <p>KEEP RACING TO IMPROVE YOUR STATS! 🪳🚀</p>
        </footer>
      </div>
    </div>
  )
}
