'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

interface RaceTimerProps {
  startAt: string
  endAt: string
  status: 'OPEN' | 'LOCKED' | 'SETTLED'
}

export function RaceTimer({ startAt, endAt, status }: RaceTimerProps) {
  const [timeLeft, setTimeLeft] = useState('')
  const [currentStatus, setCurrentStatus] = useState(status)

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const start = new Date(startAt)
      const end = new Date(endAt)
      
      let targetTime: Date
      let newStatus = currentStatus
      
      if (status === 'SETTLED') {
        setTimeLeft('Race Complete')
        return
      }
      
      // Determine what we're counting down to
      const sevenMinutesAgo = new Date(start.getTime() + 7 * 60 * 1000)
      
      if (now < sevenMinutesAgo) {
        // Countdown to lock time
        targetTime = sevenMinutesAgo
        newStatus = 'OPEN'
      } else if (now < end) {
        // Countdown to end time
        targetTime = end
        newStatus = 'LOCKED'
      } else {
        // Race should be settled
        setTimeLeft('Race Complete')
        return
      }
      
      setCurrentStatus(newStatus)
      
      const diff = targetTime.getTime() - now.getTime()
      
      if (diff <= 0) {
        setTimeLeft('Race Complete')
        return
      }
      
      const minutes = Math.floor(diff / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
    }
    
    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    
    return () => clearInterval(interval)
  }, [startAt, endAt, status, currentStatus])

  const getStatusColor = () => {
    switch (currentStatus) {
      case 'OPEN': return 'bg-green-500 hover:bg-green-600'
      case 'LOCKED': return 'bg-yellow-500 hover:bg-yellow-600'
      case 'SETTLED': return 'bg-gray-500 hover:bg-gray-600'
      default: return 'bg-gray-500 hover:bg-gray-600'
    }
  }

  return (
    <div className="degen-card p-6 degen-gradient text-black neon-glow">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="degen-text font-black text-xl">⚡ RACE TIMER ⚡</h3>
          <p className="degen-muted font-bold">TIME REMAINING</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-mono font-black roach-bounce neon-text">
            {timeLeft}
          </div>
          <div className={`mt-3 px-4 py-2 rounded-xl font-black text-sm ${
            currentStatus === 'OPEN' ? 'bg-green-400 text-black' :
            currentStatus === 'LOCKED' ? 'bg-yellow-400 text-black' :
            'bg-gray-400 text-black'
          }`}>
            {currentStatus === 'OPEN' ? '🔥 LIVE' : 
             currentStatus === 'LOCKED' ? '🔒 LOCKED' : 
             '✅ COMPLETE'}
          </div>
        </div>
      </div>
    </div>
  )
}
