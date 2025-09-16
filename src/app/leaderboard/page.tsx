'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trophy, Medal, Award, Users } from 'lucide-react'
import Link from 'next/link'

interface LeaderboardEntry {
  rank: number
  walletAddress: string
  points: number
  accuracyPct: number
  streak: number
  totalVotes: number
  joinedAt: string
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard?limit=100')
        const data = await response.json()
        
        if (data.ok) {
          setLeaderboard(data.data.leaderboard)
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-5 h-5 text-yellow-500" />
      case 2: return <Medal className="w-5 h-5 text-gray-400" />
      case 3: return <Award className="w-5 h-5 text-amber-600" />
      default: return <span className="text-sm font-bold text-gray-500">#{rank}</span>
    }
  }

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black roach-cursor">
        <div className="flex items-center justify-center h-64">
          <div className="degen-text font-black text-xl">
            <span className="animate-spin">⚡</span> LOADING LEADERBOARD...
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
                🏆 LEADERBOARD 🏆
              </h1>
              <p className="degen-muted font-bold text-xs sm:text-sm md:text-base">
                TOP ROACH RACING CHAMPIONS 🚀
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
              <Link href="/referral" className="w-full sm:w-auto">
                <Button variant="outline" className="degen-btn mobile-button w-full sm:w-auto">
                  🎁 REFERRALS
                </Button>
              </Link>
              <Link href="/me" className="w-full sm:w-auto">
                <Button variant="outline" className="degen-btn mobile-button w-full sm:w-auto">
                  👤 MY PROFILE
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div className="degen-card p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">👥</div>
            <div className="degen-text font-black text-lg sm:text-xl">{leaderboard.length}</div>
            <div className="degen-muted text-xs">PLAYERS</div>
          </div>
          <div className="degen-card p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🏆</div>
            <div className="degen-text font-black text-lg sm:text-xl">
              {leaderboard[0]?.points || 0}
            </div>
            <div className="degen-muted text-xs">TOP SCORE</div>
          </div>
          <div className="degen-card p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🎯</div>
            <div className="degen-text font-black text-lg sm:text-xl">
              {leaderboard[0]?.accuracyPct.toFixed(1) || 0}%
            </div>
            <div className="degen-muted text-xs">ACCURACY</div>
          </div>
          <div className="degen-card p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🔥</div>
            <div className="degen-text font-black text-lg sm:text-xl">
              {leaderboard[0]?.streak || 0}
            </div>
            <div className="degen-muted text-xs">STREAK</div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="degen-card overflow-hidden">
          <div className="p-4 sm:p-6 border-b-2 border-gray-700">
            <h2 className="degen-subtitle text-center text-lg sm:text-xl">🏆 TOP PLAYERS 🏆</h2>
          </div>
          <div className="divide-y divide-gray-700">
            {leaderboard.length === 0 ? (
              <div className="p-6 sm:p-8 text-center degen-muted">
                <div className="text-4xl sm:text-6xl mb-4 roach-bounce">🏆</div>
                <p className="degen-text font-bold text-sm sm:text-base">NO PLAYERS YET. BE THE FIRST TO JOIN A RACE!</p>
              </div>
            ) : (
              leaderboard.map((entry, index) => (
                <div 
                  key={entry.walletAddress}
                  className={`p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 ${
                    index < 3 ? 'bg-gradient-to-r from-pink-500/10 to-green-500/10 neon-glow' : ''
                  } hover:bg-gray-800/50 transition-colors`}
                >
                  {/* Left side - Rank and Wallet */}
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10">
                      {index === 0 && <span className="text-xl sm:text-2xl">🥇</span>}
                      {index === 1 && <span className="text-xl sm:text-2xl">🥈</span>}
                      {index === 2 && <span className="text-xl sm:text-2xl">🥉</span>}
                      {index > 2 && <span className="degen-text font-black text-sm sm:text-base">#{entry.rank}</span>}
                    </div>
                    <div>
                      <div className="font-mono text-xs sm:text-sm degen-text font-bold">
                        {formatWalletAddress(entry.walletAddress)}
                      </div>
                      <div className="degen-muted text-xs">
                        Joined {formatDate(entry.joinedAt)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Right side - Stats */}
                  <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-center sm:text-right">
                      <div className="degen-text font-black text-sm sm:text-lg">
                        {entry.points}
                      </div>
                      <div className="degen-muted text-xs">PTS</div>
                    </div>
                    
                    <div className="text-center sm:text-right">
                      <div className="degen-text font-bold text-green-400 text-sm sm:text-base">
                        {entry.accuracyPct.toFixed(1)}%
                      </div>
                      <div className="degen-muted text-xs">
                        {entry.totalVotes} VOTES
                      </div>
                    </div>
                    
                    {entry.streak > 0 && (
                      <div className="degen-btn px-2 sm:px-3 py-1 text-xs font-black">
                        🔥 {entry.streak}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm degen-muted">
          <p>UPDATED IN REAL-TIME • RANKINGS BASED ON TOTAL POINTS 🚀</p>
        </footer>
      </div>
    </div>
  )
}
