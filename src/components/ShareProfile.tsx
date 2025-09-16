'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Share2, X, Send, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

interface ShareProfileProps {
  userProfile: {
    walletAddress: string
    points: number
    rank?: number
    streak: number
  }
  userStats: {
    totalVotes: number
    correctVotes: number
    accuracyPct: number
  }
}

export function ShareProfile({ userProfile, userStats }: ShareProfileProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }

  const generateShareText = () => {
    const walletShort = formatWalletAddress(userProfile.walletAddress)
    const rankText = userProfile.rank ? `Rank #${userProfile.rank}` : 'New Player'
    const streakText = userProfile.streak > 0 ? `🔥 ${userProfile.streak} streak` : 'No streak yet'
    
    return `🪳 ROACH RUMBLE 🪳

${rankText} • ${userProfile.points} points • ${streakText}

📊 STATS:
• ${userStats.totalVotes} total votes
• ${userStats.correctVotes} correct picks
• ${userStats.accuracyPct.toFixed(1)}% accuracy

Wallet: ${walletShort}

ARE YOU WINNING ROACH? 🚀

Join the race: roachrumble.com`
  }

  const generateShareCard = () => {
    const walletShort = formatWalletAddress(userProfile.walletAddress)
    const rankText = userProfile.rank ? `#${userProfile.rank}` : 'NEW'
    const streakText = userProfile.streak > 0 ? `${userProfile.streak}🔥` : '0🔥'
    
    return `🪳 ROACH RUMBLE 🪳

┌─────────────────────────┐
│  👤 ${walletShort}        │
│                         │
│  🏆 Rank: ${rankText.padEnd(15)} │
│  💎 Points: ${userProfile.points.toString().padEnd(10)} │
│  🔥 Streak: ${streakText.padEnd(12)} │
│                         │
│  📊 ${userStats.totalVotes} votes • ${userStats.accuracyPct.toFixed(1)}% │
│                         │
│  ARE YOU WINNING ROACH? │
└─────────────────────────┘

Join the race: roachrumble.com`
  }

  const shareToTwitter = () => {
    const text = generateShareText()
    const url = encodeURIComponent(text)
    const twitterUrl = `https://twitter.com/intent/tweet?text=${url}`
    window.open(twitterUrl, '_blank', 'width=600,height=400')
    setIsOpen(false)
    toast.success('Opening Twitter...')
  }

  const shareToTelegram = () => {
    const text = generateShareCard()
    const url = encodeURIComponent(text)
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent('roachrumble.com')}&text=${url}`
    window.open(telegramUrl, '_blank', 'width=600,height=400')
    setIsOpen(false)
    toast.success('Opening Telegram...')
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateShareCard())
      setCopied(true)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="degen-btn mobile-button w-full sm:w-auto"
      >
        <span className="flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">SHARE PROFILE</span>
          <span className="sm:hidden">SHARE</span>
        </span>
      </Button>
    )
  }

  return (
    <div className="space-y-4">
      {/* Share Preview Card */}
      <Card className="degen-card p-4 sm:p-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-2 border-purple-400/50">
        <div className="text-center space-y-3">
          <div className="text-2xl sm:text-3xl roach-bounce">🪳</div>
          <h3 className="degen-text font-black text-lg sm:text-xl">ROACH RUMBLE</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="degen-muted text-sm">Wallet:</span>
              <span className="font-mono text-sm degen-text font-bold">
                {formatWalletAddress(userProfile.walletAddress)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="degen-muted text-sm">Rank:</span>
              <span className="degen-text font-bold text-sm">
                {userProfile.rank ? `#${userProfile.rank}` : 'NEW'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="degen-muted text-sm">Points:</span>
              <span className="degen-text font-bold text-sm">{userProfile.points}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="degen-muted text-sm">Streak:</span>
              <span className="degen-text font-bold text-sm">
                {userProfile.streak > 0 ? `${userProfile.streak}🔥` : '0🔥'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="degen-muted text-sm">Accuracy:</span>
              <span className="degen-text font-bold text-sm">
                {userStats.accuracyPct.toFixed(1)}% ({userStats.correctVotes}/{userStats.totalVotes})
              </span>
            </div>
          </div>
          
          <div className="pt-2 border-t border-gray-600">
            <p className="degen-text font-black text-sm sm:text-base">
              ARE YOU WINNING ROACH? 🚀
            </p>
          </div>
        </div>
      </Card>

      {/* Share Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Button 
          onClick={shareToTwitter}
          className="degen-btn mobile-button flex-1"
        >
          <span className="flex items-center gap-2">
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">SHARE ON X</span>
            <span className="sm:hidden">X</span>
          </span>
        </Button>
        
        <Button 
          onClick={shareToTelegram}
          className="degen-btn mobile-button flex-1"
        >
          <span className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">TELEGRAM</span>
            <span className="sm:hidden">TG</span>
          </span>
        </Button>
        
        <Button 
          onClick={copyToClipboard}
          variant="outline"
          className="degen-muted border-gray-600 hover:bg-gray-800 mobile-button flex-1"
        >
          <span className="flex items-center gap-2">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? 'COPIED!' : 'COPY'}</span>
            <span className="sm:hidden">{copied ? '✓' : 'COPY'}</span>
          </span>
        </Button>
      </div>

      {/* Close Button */}
      <div className="text-center">
        <Button 
          onClick={() => setIsOpen(false)}
          variant="outline"
          className="degen-muted border-gray-600 hover:bg-gray-800 mobile-button"
        >
          <span className="flex items-center gap-2">
            <span>✕</span>
            <span className="hidden sm:inline">CLOSE</span>
            <span className="sm:hidden">CLOSE</span>
          </span>
        </Button>
      </div>
    </div>
  )
}
