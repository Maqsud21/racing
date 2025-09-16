'use client'

import { Badge } from '@/components/ui/badge'
import { Trophy } from 'lucide-react'

interface ScorePillProps {
  points: number
  className?: string
}

export function ScorePill({ points, className = '' }: ScorePillProps) {
  return (
    <div className={`degen-btn px-3 sm:px-4 py-2 font-black text-xs sm:text-sm ${className}`}>
      <span className="flex items-center gap-1 sm:gap-2">
        <span className="text-sm sm:text-lg">🏆</span>
        <span>{points}</span>
        <span className="text-xs hidden sm:inline">PTS</span>
      </span>
    </div>
  )
}
