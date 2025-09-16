'use client'

import { useState, useEffect } from 'react'

export default function UTCClock() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const utcTime = now.toLocaleString('en-US', {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
      setTime(utcTime)
    }

    // Update immediately
    updateTime()
    
    // Update every second
    const interval = setInterval(updateTime, 1000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-black/20 border border-gray-600 rounded-full">
      <span className="text-xs text-gray-400">UTC</span>
      <span className="text-sm font-mono font-bold text-green-400">
        {time}
      </span>
    </div>
  )
}
