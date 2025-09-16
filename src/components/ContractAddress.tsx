'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

interface ContractAddressProps {
  contractAddress: string
}

export default function ContractAddress({ contractAddress }: ContractAddressProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contractAddress)
      setCopied(true)
      toast.success('Contract address copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy contract address')
    }
  }

  const formatAddress = (address: string) => {
    if (address.length <= 12) return address
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }

  if (!contractAddress) return null

  return (
    <div className="degen-card p-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-blue-300 mb-1">Contract Address</div>
          <div className="text-sm font-mono text-blue-100 break-all">
            {formatAddress(contractAddress)}
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="degen-btn p-2 hover:scale-105 transition-transform flex-shrink-0"
          title="Copy contract address"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-blue-300" />
          )}
        </button>
      </div>
    </div>
  )
}
