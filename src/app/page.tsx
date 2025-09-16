'use client'

import { useState, useEffect } from 'react'
import { WalletButton } from '@/components/WalletButton'
import { RaceTimer } from '@/components/RaceTimer'
import { RoachCard } from '@/components/RoachCard'
import { ScorePill } from '@/components/ScorePill'
import { CountdownTimer } from '@/components/CountdownTimer'
import PaymentModal from '@/components/PaymentModal'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useWallet } from '@solana/wallet-adapter-react'
import { toast } from 'sonner'
import { Trophy, Users, Clock, Copy, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { getPaymentWalletAddress, getVotingFee } from '@/lib/solana'
import { useSearchParams } from 'next/navigation'
import ContractAddress from '@/components/ContractAddress'
import UTCClock from '@/components/UTCClock'

interface Race {
  id: string
  startAt: string
  endAt: string
  status: 'OPEN' | 'LOCKED' | 'SETTLED'
  winner: string | null
  uniqueIdx: number
}

interface UserVote {
  pick: string
  createdAt: string
}

interface UserProfile {
  points: number
  walletAddress: string
  streak: number
  rank?: number
  referralCode?: string | null
  referralCount?: number
  referralPoints?: number
}

interface EnvVars {
  PUMP_FUN_LINK: string
  CONTRACT_ADDRESS: string
}

interface NextSchedule {
  id: string
  scheduledAt: string
  duration: number
}

export default function Home() {
  const { connected, publicKey, signMessage } = useWallet()
  const searchParams = useSearchParams()
  const referralCode = searchParams.get('ref')
  const [race, setRace] = useState<Race | null>(null)
  const [userVote, setUserVote] = useState<UserVote | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [nextSchedule, setNextSchedule] = useState<NextSchedule | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showWTFModal, setShowWTFModal] = useState(false)
  const [selectedRoach, setSelectedRoach] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showReferralBanner, setShowReferralBanner] = useState(false)
  const [lastRaceStatus, setLastRaceStatus] = useState<string | null>(null)
  const [envVars, setEnvVars] = useState<EnvVars>({ PUMP_FUN_LINK: 'https://pump.fun', CONTRACT_ADDRESS: '' })

  // Fetch current race and user data
  const fetchRaceData = async () => {
    try {
      const response = await fetch('/api/race/current')
      const data = await response.json()
      
      if (data.ok) {
        const newRace = data.data.race
        const newStatus = newRace?.status || 'NO_RACE'
        
        // Notify user of race status changes
        if (lastRaceStatus && lastRaceStatus !== newStatus) {
          if (newStatus === 'OPEN') {
            toast.success('🚀 Race is now OPEN! You can vote!')
          } else if (newStatus === 'LOCKED') {
            toast.info('🔒 Race is LOCKED! Voting closed.')
          } else if (newStatus === 'SETTLED') {
            toast.success('🏆 Race settled! Check the results!')
          }
        }
        
        setLastRaceStatus(newStatus)
        setRace(newRace)
        setUserVote(data.data.userVote)
        setNextSchedule(data.data.nextSchedule)
      }
    } catch (error) {
      console.error('Failed to fetch race data:', error)
    }
  }

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/me')
      const data = await response.json()
      
      if (data.ok) {
        setUserProfile(data.data.user)
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    }
  }

  // Fetch environment variables
  const fetchEnvVars = async () => {
    try {
      const response = await fetch('/api/env')
      const data = await response.json()
      
      if (data.ok) {
        setEnvVars(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch environment variables:', error)
    }
  }

  useEffect(() => {
    fetchRaceData()
    fetchEnvVars()
    if (connected) {
      fetchUserProfile()
    }
    setIsLoading(false)
    
    // Refresh every 3 seconds for real-time updates
    const interval = setInterval(() => {
      fetchRaceData()
      if (connected) {
        fetchUserProfile()
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [connected])

  useEffect(() => {
    if (referralCode && !connected) {
      setShowReferralBanner(true)
    }
  }, [referralCode, connected])

  const handleVote = async (roachName: string) => {
    if (!race) return

    // Show payment modal first
    setSelectedRoach(roachName)
    setShowPaymentModal(true)
  }

  const handlePaymentComplete = async (transactionSignature: string) => {
    if (!race || !selectedRoach) return

    setIsVoting(true)
    try {
      // Submit vote with transaction signature
      const response = await fetch('/api/race/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raceId: race.id,
          pick: selectedRoach,
          transactionSignature
        })
      })

      const data = await response.json()
      if (!data.ok) {
        throw new Error(data.error || 'Vote failed')
      }

      toast.success(`Vote recorded for ${selectedRoach}!`)
      setUserVote({ pick: selectedRoach, createdAt: new Date().toISOString() })
      
      // Refresh user profile to update points
      fetchUserProfile()
    } catch (error) {
      console.error('Vote error:', error)
      toast.error(error instanceof Error ? error.message : 'Vote failed')
    } finally {
      setIsVoting(false)
      setSelectedRoach(null)
    }
  }

  const canVote = Boolean(race?.status === 'OPEN' && connected && !userVote)
  const hasVoted = !!userVote
  
  // Connection status
  const getConnectionStatus = () => {
    if (!connected) return { text: 'Not Connected', color: 'text-red-400' }
    if (connected && !userProfile) return { text: 'Connecting...', color: 'text-yellow-400' }
    return { text: 'Connected', color: 'text-green-400' }
  }
  
  const connectionStatus = getConnectionStatus()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black roach-cursor relative overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 roach-bounce">🪳</div>
          <h1 className="degen-title text-2xl mb-2">ROACH RALLY</h1>
          <p className="degen-muted">Loading the chaos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black roach-cursor relative overflow-hidden">
      {/* Animated Background Bugs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Bug 1 - Top Left */}
        <div className="absolute top-20 left-10 w-8 h-8 opacity-20">
          <div className="w-full h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full bug-float" 
               style={{ animationDuration: '3s', animationDelay: '0s' }} />
        </div>
        
        {/* Bug 2 - Top Right */}
        <div className="absolute top-32 right-16 w-6 h-6 opacity-15">
          <div className="w-full h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full bug-pulse-glow" 
               style={{ animationDuration: '2.5s', animationDelay: '1s' }} />
        </div>
        
        {/* Bug 3 - Middle Left */}
        <div className="absolute top-1/2 left-8 w-10 h-10 opacity-25">
          <div className="w-full h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full bug-drift" 
               style={{ animationDuration: '4s', animationDelay: '2s' }} />
        </div>
        
        {/* Bug 4 - Middle Right */}
        <div className="absolute top-1/3 right-12 w-7 h-7 opacity-20">
          <div className="w-full h-full bg-gradient-to-r from-cyan-400 to-pink-400 rounded-full bug-float" 
               style={{ animationDuration: '3.5s', animationDelay: '0.5s' }} />
        </div>
        
        {/* Bug 5 - Bottom Left */}
        <div className="absolute bottom-32 left-20 w-9 h-9 opacity-18">
          <div className="w-full h-full bg-gradient-to-r from-purple-400 to-green-400 rounded-full bug-pulse-glow" 
               style={{ animationDuration: '2.8s', animationDelay: '1.5s' }} />
        </div>
        
        {/* Bug 6 - Bottom Right */}
        <div className="absolute bottom-20 right-8 w-5 h-5 opacity-22">
          <div className="w-full h-full bg-gradient-to-r from-red-400 to-yellow-400 rounded-full bug-drift" 
               style={{ animationDuration: '3.2s', animationDelay: '2.5s' }} />
        </div>
        
        {/* Bug 7 - Center */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 opacity-12">
          <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full bug-float" 
               style={{ animationDuration: '5s', animationDelay: '3s' }} />
        </div>
        
        {/* Bug 8 - Random Position */}
        <div className="absolute top-1/4 left-1/3 w-8 h-8 opacity-16">
          <div className="w-full h-full bg-gradient-to-r from-pink-400 to-cyan-400 rounded-full bug-pulse-glow" 
               style={{ animationDuration: '4.5s', animationDelay: '1.8s' }} />
        </div>
        
        {/* Bug 9 - Additional floating bug */}
        <div className="absolute top-1/6 right-1/4 w-7 h-7 opacity-14">
          <div className="w-full h-full bg-gradient-to-r from-orange-400 to-red-400 rounded-full bug-drift" 
               style={{ animationDuration: '6s', animationDelay: '4s' }} />
        </div>
        
        {/* Bug 10 - Another floating bug */}
        <div className="absolute bottom-1/4 left-1/4 w-5 h-5 opacity-19">
          <div className="w-full h-full bg-gradient-to-r from-teal-400 to-blue-400 rounded-full bug-float" 
               style={{ animationDuration: '7s', animationDelay: '2.2s' }} />
        </div>
      </div>

      {/* Header */}
      <header className="border-b-2 border-gray-800 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Title Section */}
            <div className="text-center sm:text-left">
              <h1 className="degen-title roach-bounce text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
                🪳 ROACH RALLY
              </h1>
              <p className="degen-muted font-bold text-xs sm:text-sm md:text-base">
                PICK YOUR PEST. WIN THE FEST. 🚀
              </p>
              {connected && (
                <div className={`text-xs font-bold ${connectionStatus.color}`}>
                  {connectionStatus.text}
                </div>
              )}
            </div>
            
            {/* Wallet Section */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
              {/* User Stats */}
              {userProfile && (
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center sm:justify-start">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <ScorePill points={userProfile.points} />
                    <div className="degen-muted text-xs sm:text-sm font-bold">
                      Rank #{userProfile.rank || '-'} • {userProfile.streak || 0}🔥
                    </div>
                  </div>
                  
                  {/* Referral Link Display */}
                  {userProfile.referralCode && (
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/50 rounded-full">
                        <span className="text-xs">🎁</span>
                        <span className="text-xs degen-text font-bold">REF:</span>
                        <span className="text-xs font-mono">{userProfile.referralCode}</span>
                      </div>
                      <Button
                        onClick={() => {
                          const link = `${window.location.origin}?ref=${userProfile.referralCode}`
                          navigator.clipboard.writeText(link)
                          toast.success('Referral link copied!')
                        }}
                        className="px-2 py-1 text-xs degen-btn"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  
                </div>
              )}
              
              {/* Contract Address Display - Always Visible */}
              {envVars.CONTRACT_ADDRESS && (
                <div className="flex justify-center sm:justify-start">
                  <ContractAddress contractAddress={envVars.CONTRACT_ADDRESS} />
                </div>
              )}
              
              {/* Wallet Button and UTC Clock */}
              <div className="w-full sm:w-auto flex items-center gap-3">
                <UTCClock />
                <WalletButton />
                <button 
                  onClick={() => {
                    fetchRaceData()
                    if (connected) fetchUserProfile()
                  }}
                  className="degen-btn p-2 hover:scale-105 transition-transform"
                  title="Refresh data"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Referral Banner */}
      {showReferralBanner && (
        <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-b-2 border-purple-400/50 p-4">
          <div className="container mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">🎁</span>
              <span className="degen-text font-black text-lg sm:text-xl">REFERRAL LINK DETECTED!</span>
              <span className="text-2xl">🎁</span>
            </div>
            <p className="degen-muted text-sm sm:text-base mb-3">
              You've been invited to join Roach Rumble! Connect your wallet to start racing and earn points.
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs degen-muted">Referral Code:</span>
              <span className="font-mono text-sm degen-text font-bold bg-gray-900 px-2 py-1 rounded">
                {referralCode}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 mobile-padding space-y-4 sm:space-y-6 relative z-10">
        {/* Race Timer */}
        {race ? (
          <div className="degen-card p-4 sm:p-6 md:p-8">
            <CountdownTimer 
              targetDate={
                race.status === 'OPEN' ? race.endAt : // Countdown to voting close
                race.status === 'LOCKED' ? race.endAt : // Countdown to race start  
                race.status === 'SETTLED' ? race.endAt : race.startAt
              }
              mode={
                race.status === 'OPEN' ? 'voting-close' : // Voting is open, countdown to close
                race.status === 'LOCKED' ? 'race-live' : // Race is live, countdown to start
                race.status === 'SETTLED' ? 'waiting-results' : 'race-start'
              }
              raceStatus={race.status}
              onComplete={() => {
                // Refresh race data when countdown completes
                fetchRaceData()
              }}
            />
          </div>
        ) : nextSchedule ? (
          <div className="degen-card p-4 sm:p-6 md:p-8">
            <CountdownTimer 
              targetDate={nextSchedule.scheduledAt}
              mode="voting-starts"
              onComplete={() => {
                // Refresh race data when countdown completes
                fetchRaceData()
              }}
            />
          </div>
        ) : (
          <div className="degen-card p-4 sm:p-6 md:p-8 text-center">
            <div className="text-4xl sm:text-6xl mb-4 roach-bounce">🪳</div>
            <h3 className="degen-subtitle mb-2 text-lg sm:text-xl md:text-2xl">NO RACE SCHEDULED</h3>
            <p className="degen-muted text-sm sm:text-base">The roaches are carbo-loading... 💪</p>
          </div>
        )}

        {/* Vote Status */}
        {race && (
          <div className="degen-card p-4 sm:p-6">
            {connected ? (
              hasVoted ? (
                <div className="text-center">
                  <div className="degen-btn inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 mb-3 text-sm sm:text-base">
                    <span className="text-xl sm:text-2xl">🎯</span>
                    <span className="font-black">VOTED FOR {userVote.pick}</span>
                    <span className="text-xl sm:text-2xl">🚀</span>
                  </div>
                  {race?.status === 'OPEN' && (
                    <p className="degen-muted text-xs sm:text-sm">
                      You can change your vote until the race locks 🔄
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <p className="degen-text font-bold text-base sm:text-lg md:text-xl">
                    {race?.status === 'OPEN' 
                      ? '🔥 CHOOSE YOUR CHAMPION!' 
                      : '🔒 VOTING CLOSED'}
                  </p>
                </div>
              )
            ) : (
              <div className="text-center">
                <p className="degen-text font-bold text-base sm:text-lg md:text-xl mb-3">
                  {race?.status === 'OPEN' 
                    ? '🔥 CONNECT WALLET TO VOTE!' 
                    : '🔒 VOTING CLOSED'}
                </p>
                <p className="degen-muted text-sm">
                  Connect your wallet to participate in the race and earn points!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Roach Cards */}
        {(race || nextSchedule) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {(['JESSE', 'BRIAN', 'GREG', 'DALE'] as const).map((roach) => (
              <RoachCard
                key={roach}
                name={roach}
                color="from-purple-500 to-blue-500"
                isSelected={userVote?.pick === roach}
                isVoted={hasVoted}
                canVote={canVote}
                onVote={handleVote}
                isLoading={isVoting}
                isDisabled={!race || race.status !== 'OPEN'}
              />
            ))}
          </div>
        )}


        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
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
          <Link href="/me" className="w-full sm:w-auto">
            <Button variant="outline" className="degen-btn mobile-button w-full sm:w-auto">
              👤 MY PROFILE
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 text-center text-sm degen-muted">
        <div className="flex flex-col items-center gap-3">
          <p>Built with Roaches for the Pump.Fun ecosystem. No roaches were harmed for the sake of the project.</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <a 
              href="https://x.com/roachrally" 
          target="_blank"
          rel="noopener noreferrer"
              className="degen-btn px-4 py-2 text-sm hover:scale-105 transition-transform text-center"
            >
              🐦 Follow on X
        </a>
        <a
              href={envVars.PUMP_FUN_LINK} 
          target="_blank"
          rel="noopener noreferrer"
              className="degen-btn px-4 py-2 text-sm hover:scale-105 transition-transform bg-gradient-to-r from-purple-600 to-pink-600 text-center"
            >
              📺 Watch Live Stream
            </a>
            <button 
              onClick={() => setShowWTFModal(true)}
              className="degen-btn px-4 py-2 text-sm hover:scale-105 transition-transform"
            >
              ❓ WTF is Roach Rally?
            </button>
          </div>
        </div>
      </footer>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false)
          setSelectedRoach(null)
        }}
        onPaymentComplete={handlePaymentComplete}
        paymentWallet={getPaymentWalletAddress()}
        votingFee={getVotingFee()}
      />

      {/* WTF Modal */}
      {showWTFModal && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowWTFModal(false)
            }
          }}
        >
          <div className="degen-card max-w-4xl w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Fixed Header */}
            <div className="flex justify-between items-center p-4 sm:p-6 border-b-2 border-gray-700 flex-shrink-0">
              <h2 className="degen-title text-xl sm:text-2xl md:text-3xl">🪳 WTF is Roach Rally?</h2>
              <button 
                onClick={() => setShowWTFModal(false)}
                className="degen-btn p-2 hover:scale-105 transition-transform text-lg"
                title="Close"
              >
                ✕
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 p-4 sm:p-6 md:p-8 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-800">
            
            <div className="space-y-8 text-sm sm:text-base">
              {/* Introduction */}
              <div className="degen-text text-center">
                <p className="mb-4 text-lg">
                  Welcome to <strong>Roach Rally</strong> — the only sport where degenerates bet their pride (and maybe their bags) on four bugged-out legends. Forget horse racing, forget esports — this is pure insect degeneracy.
                </p>
              </div>

              {/* Champions */}
              <div>
                <h3 className="degen-subtitle text-xl sm:text-2xl mb-4 text-center">🏆 Meet your champions:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="degen-card p-4 hover:scale-105 transition-transform">
                    <div className="text-lg font-bold mb-2">JESSE 🔥</div>
                    <div className="text-sm font-semibold mb-1">YOLO SPEED DEMON</div>
                    <div className="text-xs">Charges headfirst like he just 100x'd a shitcoin and didn't set a stop-loss.</div>
                  </div>
                  <div className="degen-card p-4 hover:scale-105 transition-transform">
                    <div className="text-lg font-bold mb-2">BRIAN 🧠</div>
                    <div className="text-sm font-semibold mb-1">CALCULATED KILLER</div>
                    <div className="text-xs">Lurks, waits, then rugpulls the finish line when you least expect it.</div>
                  </div>
                  <div className="degen-card p-4 hover:scale-105 transition-transform">
                    <div className="text-lg font-bold mb-2">GREG 💪</div>
                    <div className="text-sm font-semibold mb-1">BULLDOZER BEAST</div>
                    <div className="text-xs">Stomps through obstacles like your uncle through a wedding buffet.</div>
                  </div>
                  <div className="degen-card p-4 hover:scale-105 transition-transform">
                    <div className="text-lg font-bold mb-2">DALE 🥷</div>
                    <div className="text-sm font-semibold mb-1">STEALTH NINJA</div>
                    <div className="text-xs">Appears out of nowhere, steals your girl and the race.</div>
                  </div>
                </div>
              </div>

              {/* How it works */}
              <div className="degen-text text-center">
                <p className="mb-6 text-lg">
                  Every 10 minutes, these cockroach gods scuttle into battle. You pick your pest, you scream at your screen, you pray to RNGesus — and then you cope when Greg bulldozes your dreams again.
                </p>
              </div>

              <div>
                <h3 className="degen-subtitle text-xl sm:text-2xl mb-6 text-center">❓ How does it work?</h3>
                <div className="space-y-4">
                  <div className="degen-card p-4 hover:scale-105 transition-transform">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">📺</span>
                      <h4 className="font-bold text-lg">Watch the chaos</h4>
                    </div>
                    <p className="text-sm">Daily livestream on Pump.Fun.</p>
                    <p className="text-sm">Spam emojis. Throw shade. Become part of the lore.</p>
                  </div>
                  <div className="degen-card p-4 hover:scale-105 transition-transform">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">🗳️</span>
                      <h4 className="font-bold text-lg">Vote on the website</h4>
                    </div>
                    <p className="text-sm">Connect your Solana wallet (don't worry, we're not rugged… yet).</p>
                    <p className="text-sm">Pick your champion bug. Lock in your destiny.</p>
                  </div>
                  <div className="degen-card p-4 hover:scale-105 transition-transform">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">👑</span>
                      <h4 className="font-bold text-lg">Admin blesses the winner</h4>
                    </div>
                    <p className="text-sm">Our almighty bug overlord (admin) declares who actually won.</p>
                    <p className="text-sm">Trust the process (you have no choice).</p>
                  </div>
                  <div className="degen-card p-4 hover:scale-105 transition-transform">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">💎</span>
                      <h4 className="font-bold text-lg">Farm those points</h4>
                    </div>
                    <p className="text-sm">Guess right = +1 point.</p>
                    <p className="text-sm">Guess wrong = cope harder, degen.</p>
                  </div>
                  <div className="degen-card p-4 hover:scale-105 transition-transform">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">💰</span>
                      <h4 className="font-bold text-lg">Daily $ROACH rewards</h4>
                    </div>
                    <p className="text-sm">End of day, the Top 10 wallet warriors split the $ROACH bag.</p>
                    <p className="text-sm">Translation: bet on bugs → maybe get tokens → probably still cope.</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="degen-subtitle text-xl sm:text-2xl mb-4 text-center">🪳 Why cockroaches?</h3>
                <div className="degen-card p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💥</span>
                      <span className="text-sm">Survive nukes and bear markets</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⚡</span>
                      <span className="text-sm">Faster than liquidation emails</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔥</span>
                      <span className="text-sm">Bugs are the new meta</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">😂</span>
                      <span className="text-sm">Funnier than it should be</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="degen-card p-6 text-center border-2 border-purple-500">
                <h3 className="degen-subtitle text-xl sm:text-2xl mb-4">🎉 TL;DR</h3>
                <div className="space-y-3 text-base">
                  <p className="font-semibold">Pick your roach.</p>
                  <p className="font-semibold">Pray for survival.</p>
                  <p className="font-semibold">Win $ROACH or cry in Discord.</p>
                  <p className="font-semibold">Every 10 minutes, the streets run wild with antennae and cope.</p>
                  <div className="mt-6 p-4 bg-purple-900/30 rounded-lg">
                    <p className="font-bold text-lg">Welcome to Roach Rally.</p>
                    <p className="font-bold text-lg">You're not here to get rich.</p>
                    <p className="font-bold text-lg">You're here to get roach-pilled.</p>
                  </div>
                </div>
              </div>
            </div>
            </div>
            
            {/* Fixed Footer */}
            <div className="flex justify-center p-4 sm:p-6 border-t-2 border-gray-700 flex-shrink-0">
              <button 
                onClick={() => setShowWTFModal(false)}
                className="degen-btn px-6 py-3 text-base hover:scale-105 transition-transform"
              >
                🚀 Got it, let's race!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}