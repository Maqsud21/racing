'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Crown, Trophy, Settings, AlertTriangle, Clock } from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { toast } from 'sonner'
import { formatUTCDateTime, convertLocalToUTC } from '@/lib/timezone'

interface Race {
  id: string
  startAt: string
  endAt: string
  status: 'OPEN' | 'LOCKED' | 'SETTLED'
  winner: string | null
  uniqueIdx: number
}

interface SettleStats {
  correctVotes: number
  totalVotes: number
  pointsAwarded: number
}

interface RaceSchedule {
  id: string
  scheduledAt: string
  duration: number
  isActive: boolean
}

export default function AdminPanel() {
  const { connected, publicKey, signMessage } = useWallet()
  const [currentRace, setCurrentRace] = useState<Race | null>(null)
  const [selectedWinner, setSelectedWinner] = useState<string>('')
  const [isSettling, setIsSettling] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [settleStats, setSettleStats] = useState<SettleStats | null>(null)
  const [nextSchedule, setNextSchedule] = useState<RaceSchedule | null>(null)
  const [scheduleDateTime, setScheduleDateTime] = useState('')
  const [scheduleDuration, setScheduleDuration] = useState(600) // 10 minutes default
  const [isScheduling, setIsScheduling] = useState(false)

  const roaches = [
    { value: 'JESSE', name: 'Jesse', emoji: '🏃‍♂️' },
    { value: 'BRIAN', name: 'Brian', emoji: '🕵️‍♂️' },
    { value: 'GREG', name: 'Greg', emoji: '💪' },
    { value: 'DALE', name: 'Dale', emoji: '🥷' }
  ]

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!publicKey) {
        setIsAdmin(false)
        return
      }

      try {
        // Check admin status via API
        const response = await fetch('/api/admin/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: publicKey.toString() })
        })
        
        const data = await response.json()
        setIsAdmin(data.ok && data.data.isAdmin)
      } catch (error) {
        console.error('Failed to check admin status:', error)
        setIsAdmin(false)
      }
    }

    checkAdminStatus()
  }, [publicKey])

  useEffect(() => {
    const fetchCurrentRace = async () => {
      try {
        const response = await fetch('/api/race/current')
        const data = await response.json()
        
        if (data.ok) {
          setCurrentRace(data.data.race)
        }
      } catch (error) {
        console.error('Failed to fetch current race:', error)
      }
    }

    const fetchNextSchedule = async () => {
      try {
        const response = await fetch('/api/admin/schedule')
        const data = await response.json()
        
        if (data.ok) {
          setNextSchedule(data.data.nextSchedule)
        }
      } catch (error) {
        console.error('Failed to fetch next schedule:', error)
      }
    }

    fetchCurrentRace()
    fetchNextSchedule()
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchCurrentRace()
      fetchNextSchedule()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleSettleRace = async () => {
    if (!currentRace || !selectedWinner) return

    setIsSettling(true)
    try {
      // Submit settlement (no signature required for MVP)
      const response = await fetch('/api/admin/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raceId: currentRace.id,
          winner: selectedWinner
        })
      })

      const data = await response.json()
      if (!data.ok) {
        throw new Error(data.error || 'Settlement failed')
      }

      toast.success('Race settled successfully!')
      setSettleStats(data.data.stats)
      
      // Refresh race data
      const raceResponse = await fetch('/api/race/current')
      const raceData = await raceResponse.json()
      if (raceData.ok) {
        setCurrentRace(raceData.data.race)
      }
    } catch (error) {
      console.error('Settlement error:', error)
      toast.error(error instanceof Error ? error.message : 'Settlement failed')
    } finally {
      setIsSettling(false)
    }
  }

  const handleCreateSchedule = async () => {
    if (!scheduleDateTime) {
      toast.error('Please select a date and time for the race')
      return
    }

    setIsScheduling(true)
    try {
      // Convert local datetime to UTC
      const utcDateTime = convertLocalToUTC(scheduleDateTime)
      
      const response = await fetch('/api/admin/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledAt: utcDateTime,
          duration: scheduleDuration
        })
      })

      const data = await response.json()
      if (!data.ok) {
        throw new Error(data.error || 'Failed to create schedule')
      }

      toast.success('Race scheduled successfully!')
      setNextSchedule(data.data.schedule)
      setScheduleDateTime('')
    } catch (error) {
      console.error('Schedule creation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create schedule')
    } finally {
      setIsScheduling(false)
    }
  }

  const handleDeleteSchedule = async () => {
    try {
      const response = await fetch('/api/admin/schedule', {
        method: 'DELETE'
      })

      const data = await response.json()
      if (!data.ok) {
        throw new Error(data.error || 'Failed to delete schedule')
      }

      toast.success('Schedule deleted successfully!')
      setNextSchedule(null)
    } catch (error) {
      console.error('Schedule deletion error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete schedule')
    }
  }

  const formatDateTime = (dateString: string) => {
    return formatUTCDateTime(dateString)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-green-500'
      case 'LOCKED': return 'bg-yellow-500'
      case 'SETTLED': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-black roach-cursor">
        <div className="flex items-center justify-center h-64">
          <div className="degen-card p-8 text-center">
            <div className="text-6xl mb-4 roach-bounce">👑</div>
            <h2 className="degen-subtitle mb-2">CONNECT ADMIN WALLET</h2>
            <p className="degen-muted">
              Connect your admin wallet to access the admin panel.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black roach-cursor">
        <div className="flex items-center justify-center h-64">
          <div className="degen-card p-8 text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="degen-subtitle mb-2">ACCESS DENIED</h2>
            <p className="degen-muted mb-4">
              This wallet is not authorized for admin access.
            </p>
            <p className="degen-muted text-sm">
              Wallet: {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black roach-cursor">
      {/* Header */}
      <header className="border-b-2 border-gray-800 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 mobile-padding">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h1 className="degen-title roach-bounce text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
                👑 ADMIN PANEL 👑
              </h1>
              <p className="degen-muted font-bold text-xs sm:text-sm md:text-base">
                MANAGE RACES AND SETTLEMENTS 🚀
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="degen-btn px-3 sm:px-4 py-2 text-xs sm:text-sm font-black">
                <span className="flex items-center gap-1 sm:gap-2">
                  <span>👑</span>
                  <span className="hidden sm:inline">ADMIN</span>
                  <span className="sm:hidden">ADM</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Current Race */}
      <div className="container mx-auto px-4 py-8 mobile-padding space-y-4 sm:space-y-6">
        <div className="degen-card p-4 sm:p-6">
          <h2 className="degen-subtitle mb-4 text-center text-lg sm:text-xl md:text-2xl">🏁 CURRENT RACE 🏁</h2>
          
          {currentRace ? (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="degen-text font-black text-lg sm:text-xl">
                    RACE #{currentRace.uniqueIdx}
                  </div>
                  <div className="degen-muted text-xs sm:text-sm">
                    Started: {formatDateTime(currentRace.startAt)}
                  </div>
                </div>
                <div className={`px-3 sm:px-4 py-2 rounded-xl font-black text-xs sm:text-sm ${
                  currentRace.status === 'OPEN' ? 'bg-green-400 text-black' :
                  currentRace.status === 'LOCKED' ? 'bg-yellow-400 text-black' :
                  'bg-gray-400 text-black'
                }`}>
                  {currentRace.status === 'OPEN' ? '🔥 LIVE' : 
                   currentRace.status === 'LOCKED' ? '🔒 LOCKED' : 
                   '✅ SETTLED'}
                </div>
              </div>

              {currentRace.status !== 'SETTLED' && (
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block degen-text font-bold mb-2 sm:mb-3 text-sm sm:text-base">
                      🏆 SELECT WINNER 🏆
                    </label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between degen-btn text-sm sm:text-base">
                          {selectedWinner ? (
                            <span className="flex items-center gap-1 sm:gap-2">
                              {roaches.find(r => r.value === selectedWinner)?.emoji}
                              <span className="hidden sm:inline">{roaches.find(r => r.value === selectedWinner)?.name}</span>
                              <span className="sm:hidden">{roaches.find(r => r.value === selectedWinner)?.name}</span>
                            </span>
                          ) : (
                            <span className="text-xs sm:text-sm">CHOOSE WINNER...</span>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        {roaches.map((roach) => (
                          <DropdownMenuItem
                            key={roach.value}
                            onClick={() => setSelectedWinner(roach.value)}
                            className="flex items-center gap-2"
                          >
                            <span>{roach.emoji}</span>
                            <span>{roach.name}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <Button
                    onClick={handleSettleRace}
                    disabled={!selectedWinner || isSettling}
                    className="w-full mobile-button degen-btn text-sm sm:text-base"
                  >
                    {isSettling ? (
                      <span className="flex items-center gap-1 sm:gap-2">
                        <span className="animate-spin">⚡</span>
                        <span className="hidden sm:inline">SETTLING...</span>
                        <span className="sm:hidden">SETTLING...</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 sm:gap-2">
                        <span>🏆</span>
                        <span className="hidden sm:inline">SETTLE RACE & AWARD POINTS</span>
                        <span className="sm:hidden">SETTLE RACE</span>
                        <span>💥</span>
                      </span>
                    )}
                  </Button>
                </div>
              )}

              {currentRace.status === 'SETTLED' && currentRace.winner && (
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl mb-3 roach-bounce">
                    {roaches.find(r => r.value === currentRace.winner)?.emoji}
                  </div>
                  <div className="degen-text font-black text-lg sm:text-xl mb-4">
                    WINNER: {roaches.find(r => r.value === currentRace.winner)?.name}
                  </div>
                  {settleStats && (
                    <div className="mt-4 sm:mt-6 p-4 sm:p-6 degen-card">
                      <div className="degen-muted font-bold mb-3 sm:mb-4 text-sm sm:text-base">SETTLEMENT STATS</div>
                      <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                        <div>
                          <div className="degen-text font-black text-lg sm:text-xl">{settleStats.correctVotes}</div>
                          <div className="degen-muted text-xs">CORRECT</div>
                        </div>
                        <div>
                          <div className="degen-text font-black text-lg sm:text-xl">{settleStats.totalVotes}</div>
                          <div className="degen-muted text-xs">TOTAL VOTES</div>
                        </div>
                        <div>
                          <div className="degen-text font-black text-lg sm:text-xl">{settleStats.pointsAwarded}</div>
                          <div className="degen-muted text-xs">POINTS AWARDED</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center degen-muted">
              <div className="text-6xl mb-4 roach-bounce">🏆</div>
              <p className="degen-text font-bold">NO ACTIVE RACE FOUND</p>
            </div>
          )}
        </div>

        {/* Race Scheduling */}
        <div className="degen-card p-4 sm:p-6">
          <h2 className="degen-subtitle mb-4 text-center text-lg sm:text-xl md:text-2xl">⏰ RACE SCHEDULING ⏰</h2>
          
          {nextSchedule ? (
            <div className="space-y-3 sm:space-y-4">
              <div className="text-center">
                <div className="degen-text font-black text-base sm:text-lg mb-2">NEXT RACE SCHEDULED</div>
                <div className="degen-muted text-sm sm:text-base">
                  {formatDateTime(nextSchedule.scheduledAt)}
                </div>
                <div className="degen-muted text-xs sm:text-sm">
                  Voting Duration: {Math.floor(nextSchedule.duration / 60)} minutes
                </div>
                <div className="degen-muted text-xs mt-1">
                  🌍 All times displayed in UTC for global consistency
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mobile-button degen-btn text-sm sm:text-base"
                onClick={handleDeleteSchedule}
              >
                <span className="flex items-center gap-1 sm:gap-2">
                  <span>🗑️</span>
                  <span className="hidden sm:inline">DELETE SCHEDULE</span>
                  <span className="sm:hidden">DELETE</span>
                </span>
              </Button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block degen-text font-bold mb-2 text-sm sm:text-base">
                  📅 RACE DATE & TIME (LOCAL TIME)
                </label>
                <Input
                  type="datetime-local"
                  value={scheduleDateTime}
                  onChange={(e) => setScheduleDateTime(e.target.value)}
                  className="w-full text-sm sm:text-base"
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="degen-muted text-xs mt-1">
                  ⚠️ Times will be automatically converted to UTC for global consistency
                </p>
              </div>
              
              <div>
                <label className="block degen-text font-bold mb-2 text-sm sm:text-base">
                  ⏱️ VOTING DURATION (MINUTES)
                </label>
                <Input
                  type="number"
                  value={scheduleDuration / 60}
                  onChange={(e) => setScheduleDuration(parseInt(e.target.value) * 60)}
                  min="1"
                  max="60"
                  className="w-full text-sm sm:text-base"
                />
              </div>
              
              <Button 
                onClick={handleCreateSchedule}
                disabled={!scheduleDateTime || isScheduling}
                className="w-full mobile-button degen-btn text-sm sm:text-base"
              >
                {isScheduling ? (
                  <span className="flex items-center gap-1 sm:gap-2">
                    <span className="animate-spin">⚡</span>
                    <span className="hidden sm:inline">SCHEDULING...</span>
                    <span className="sm:hidden">SCHEDULING...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 sm:gap-2">
                    <span>⏰</span>
                    <span className="hidden sm:inline">SCHEDULE RACE</span>
                    <span className="sm:hidden">SCHEDULE</span>
                  </span>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Admin Actions */}
        <div className="degen-card p-4 sm:p-6">
          <h2 className="degen-subtitle mb-4 text-center text-lg sm:text-xl md:text-2xl">⚙️ ADMIN ACTIONS ⚙️</h2>
          <div className="space-y-3 sm:space-y-4">
            <Button 
              variant="outline" 
              className="w-full mobile-button degen-btn text-sm sm:text-base"
              onClick={() => window.location.reload()}
            >
              <span className="flex items-center gap-1 sm:gap-2">
                <span>🔄</span>
                <span className="hidden sm:inline">REFRESH DATA</span>
                <span className="sm:hidden">REFRESH</span>
              </span>
            </Button>
            
            <div className="degen-muted text-xs sm:text-sm space-y-1 sm:space-y-2">
              <p>• Schedule races manually or let them auto-generate</p>
              <p>• Voting locks after voting duration</p>
              <p>• Admin must manually settle races</p>
              <p>• Points are awarded automatically on settlement</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-6 sm:mt-8 text-center text-xs sm:text-sm degen-muted">
          <p>ADMIN PANEL • USE RESPONSIBLY 🪳👑</p>
        </footer>
      </div>
    </div>
  )
}
