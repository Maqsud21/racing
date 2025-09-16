'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'

interface RoachCardProps {
  name: 'JESSE' | 'BRIAN' | 'GREG' | 'DALE'
  color: string
  isSelected?: boolean
  isVoted?: boolean
  canVote?: boolean
  onVote: (roach: string) => void
  isLoading?: boolean
  isDisabled?: boolean
}

const roachData = {
  JESSE: {
    name: 'JESSE',
    bio: '🔥 YOLO SPEED DEMON - CHARGES LIKE A MANIAC',
    emoji: '🏃‍♂️',
    color: 'from-red-500 to-pink-500',
    degenColor: 'from-red-400 to-pink-400'
  },
  BRIAN: {
    name: 'BRIAN',
    bio: '🧠 CALCULATED KILLER - WAITS FOR THE PERFECT MOMENT',
    emoji: '🕵️‍♂️',
    color: 'from-blue-500 to-cyan-500',
    degenColor: 'from-blue-400 to-cyan-400'
  },
  GREG: {
    name: 'GREG',
    bio: '💪 BULLDOZER BEAST - CRUSHES EVERYTHING IN HIS PATH',
    emoji: '💪',
    color: 'from-green-500 to-emerald-500',
    degenColor: 'from-green-400 to-emerald-400'
  },
  DALE: {
    name: 'DALE',
    bio: '🥷 STEALTH NINJA - FINDS THE IMPOSSIBLE ROUTES',
    emoji: '🥷',
    color: 'from-purple-500 to-violet-500',
    degenColor: 'from-purple-400 to-violet-400'
  }
}

export function RoachCard({ 
  name, 
  color, 
  isSelected, 
  isVoted, 
  canVote, 
  onVote, 
  isLoading,
  isDisabled = false
}: RoachCardProps) {
  const roach = roachData[name]
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      whileHover={!isDisabled ? { scale: 1.05, rotate: 2 } : {}}
      whileTap={!isDisabled ? { scale: 0.95 } : {}}
      onHoverStart={() => !isDisabled && setIsHovered(true)}
      onHoverEnd={() => !isDisabled && setIsHovered(false)}
      className="h-full"
    >
      <div className={`degen-card p-4 sm:p-6 h-full relative overflow-hidden ${
        isSelected ? 'neon-glow border-2 border-green-400' : ''
      } ${isVoted ? 'opacity-80' : ''} ${canVote ? 'hover:border-pink-400' : ''} ${
        isDisabled ? 'opacity-50 grayscale' : ''
      }`}>
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className={`w-full h-full bg-gradient-to-br ${roach.degenColor} animate-pulse`} />
        </div>
        
        <div className="relative z-10 h-full flex flex-col">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="text-3xl sm:text-4xl roach-bounce">
              {roach.emoji}
            </div>
            {isVoted && (
              <div className="degen-btn px-2 sm:px-3 py-1 text-xs font-black">
                ✅ VOTED
              </div>
            )}
          </div>
          
          <h3 className="degen-text font-black text-lg sm:text-xl mb-2 sm:mb-3 text-center">
            {roach.name}
          </h3>
          
          <p className="degen-muted text-xs sm:text-sm mb-4 sm:mb-6 text-center leading-relaxed flex-grow">
            {roach.bio}
          </p>
          
          <Button
            onClick={() => onVote(name)}
            disabled={!canVote || isLoading || isDisabled}
            className={`w-full mobile-button font-black text-sm sm:text-lg ${
              canVote && !isDisabled
                ? 'degen-btn hover:scale-105' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-1 sm:gap-2">
                <span className="animate-spin">⚡</span>
                <span className="hidden sm:inline">VOTING...</span>
                <span className="sm:hidden">VOTE...</span>
              </span>
            ) : isDisabled ? (
              <span className="flex items-center gap-1 sm:gap-2">
                <span>⏳</span>
                <span className="hidden sm:inline">VOTING CLOSED</span>
                <span className="sm:hidden">CLOSED</span>
                <span>🔒</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 sm:gap-2">
                <span>🚀</span>
                <span className="hidden sm:inline">PICK {roach.name}</span>
                <span className="sm:hidden">{roach.name}</span>
                <span>💥</span>
              </span>
            )}
          </Button>
        </div>
        
        {/* Hover effect */}
        {isHovered && canVote && !isDisabled && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </div>
    </motion.div>
  )
}
