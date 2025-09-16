'use client'

import { useState, useEffect } from 'react'
import { formatUTCDateTime } from '@/lib/timezone'

interface CountdownTimerProps {
  targetDate: string
  onComplete?: () => void
  className?: string
  mode?: 'race-start' | 'voting-close' | 'voting-starts' | 'race-live' | 'waiting-results'
  raceStatus?: 'OPEN' | 'LOCKED' | 'SETTLED'
}

export function CountdownTimer({ targetDate, onComplete, className = '', mode = 'race-start', raceStatus }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    // Reset expired state when target date changes
    setIsExpired(false)
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const target = new Date(targetDate).getTime()
      const difference = target - now

      if (difference <= 0) {
        setIsExpired(true)
        onComplete?.()
        return { days: 0, hours: 0, minutes: 0, seconds: 0 }
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      return { days, hours, minutes, seconds }
    }

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    // Initial calculation
    setTimeLeft(calculateTimeLeft())

    return () => clearInterval(timer)
  }, [targetDate, onComplete])

  if (isExpired) {
    switch (mode) {
      case 'voting-starts':
        return (
          <div className={`text-center ${className}`}>
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4 roach-bounce">🚀</div>
            <div className="degen-text font-black text-lg sm:text-xl">VOTING STARTS NOW!</div>
            <div className="degen-muted text-sm">CHOOSE YOUR ROACH!</div>
          </div>
        )
      case 'voting-close':
        return (
          <div className={`text-center ${className}`}>
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4 roach-bounce">🔒</div>
            <div className="degen-text font-black text-lg sm:text-xl">VOTING CLOSED!</div>
            <div className="degen-muted text-sm">RACE IS NOW LIVE</div>
          </div>
        )
      case 'race-live':
        return (
          <div className={`text-center ${className}`}>
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4 roach-bounce">🏃‍♂️</div>
            <div className="degen-text font-black text-lg sm:text-xl">RACE IS LIVE!</div>
            <div className="degen-muted text-sm">ROACHES ARE RACING</div>
          </div>
        )
      case 'waiting-results':
        return (
          <div className={`text-center ${className}`}>
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4 roach-bounce">⏳</div>
            <div className="degen-text font-black text-lg sm:text-xl">WAITING FOR RESULTS</div>
            <div className="degen-muted text-sm">ADMIN IS SETTLING</div>
          </div>
        )
      default: // race-start
        return (
          <div className={`text-center ${className}`}>
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4 roach-bounce">🚀</div>
            <div className="degen-text font-black text-lg sm:text-xl">RACE STARTING NOW!</div>
            <div className="degen-muted text-sm">GET READY TO VOTE!</div>
          </div>
        )
    }
  }

  const getIconAndTitle = () => {
    switch (mode) {
      case 'voting-starts':
        return { icon: '🚀', title: 'VOTING STARTS IN:' }
      case 'voting-close':
        return { icon: '⏱️', title: 'VOTING CLOSES IN:' }
      case 'race-live':
        return { icon: '🏃‍♂️', title: 'RACE LIVE FOR:' }
      case 'waiting-results':
        return { icon: '⏳', title: 'WAITING FOR:' }
      default: // race-start
        return { icon: '⏰', title: 'NEXT RACE IN:' }
    }
  }

  const { icon, title } = getIconAndTitle()

  return (
    <div className={`text-center ${className}`}>
      <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 roach-bounce">
        {icon}
      </div>
      <div className="degen-text font-black text-base sm:text-lg mb-2">
        {title}
      </div>
      
      <div className="flex justify-center gap-1 sm:gap-2 max-w-md mx-auto">
        {timeLeft.days > 0 && (
          <>
            <div className="degen-card p-2 sm:p-3 min-w-[50px] sm:min-w-[60px]">
              <div className="degen-text font-black text-sm sm:text-lg">{timeLeft.days}</div>
              <div className="degen-muted text-xs">DAYS</div>
            </div>
            <div className="degen-card p-2 sm:p-3 min-w-[50px] sm:min-w-[60px]">
              <div className="degen-text font-black text-sm sm:text-lg">{timeLeft.hours}</div>
              <div className="degen-muted text-xs">HOURS</div>
            </div>
            <div className="degen-card p-2 sm:p-3 min-w-[50px] sm:min-w-[60px]">
              <div className="degen-text font-black text-sm sm:text-lg">{timeLeft.minutes}</div>
              <div className="degen-muted text-xs">MIN</div>
            </div>
            <div className="degen-card p-2 sm:p-3 min-w-[50px] sm:min-w-[60px]">
              <div className="degen-text font-black text-sm sm:text-lg">{timeLeft.seconds}</div>
              <div className="degen-muted text-xs">SEC</div>
            </div>
          </>
        )}
        
        {timeLeft.days === 0 && timeLeft.hours > 0 && (
          <>
            <div className="degen-card p-2 sm:p-3 min-w-[50px] sm:min-w-[60px]">
              <div className="degen-text font-black text-sm sm:text-lg">{timeLeft.hours}</div>
              <div className="degen-muted text-xs">HOURS</div>
            </div>
            <div className="degen-card p-2 sm:p-3 min-w-[50px] sm:min-w-[60px]">
              <div className="degen-text font-black text-sm sm:text-lg">{timeLeft.minutes}</div>
              <div className="degen-muted text-xs">MIN</div>
            </div>
            <div className="degen-card p-2 sm:p-3 min-w-[50px] sm:min-w-[60px]">
              <div className="degen-text font-black text-sm sm:text-lg">{timeLeft.seconds}</div>
              <div className="degen-muted text-xs">SEC</div>
            </div>
          </>
        )}
        
        {timeLeft.days === 0 && timeLeft.hours === 0 && (
          <>
            <div className="degen-card p-2 sm:p-3 min-w-[50px] sm:min-w-[60px]">
              <div className="degen-text font-black text-sm sm:text-lg">{timeLeft.minutes}</div>
              <div className="degen-muted text-xs">MIN</div>
            </div>
            <div className="degen-card p-2 sm:p-3 min-w-[50px] sm:min-w-[60px]">
              <div className="degen-text font-black text-sm sm:text-lg">{timeLeft.seconds}</div>
              <div className="degen-muted text-xs">SEC</div>
            </div>
          </>
        )}
      </div>
      
      <div className="degen-muted text-xs sm:text-sm mt-3 sm:mt-4 px-2">
        {(() => {
          const utcTime = formatUTCDateTime(targetDate)
          
          switch (mode) {
            case 'voting-starts':
              return `VOTING STARTS AT: ${utcTime}`
            case 'voting-close':
              return `VOTING CLOSES AT: ${utcTime}`
            case 'race-live':
              return `RACE STARTED AT: ${utcTime}`
            case 'waiting-results':
              return `RACE ENDED AT: ${utcTime}`
            default: // race-start
              return `RACE STARTS AT: ${utcTime}`
          }
        })()}
      </div>
    </div>
  )
}
