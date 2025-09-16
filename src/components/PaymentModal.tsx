'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onPaymentComplete: (transactionSignature: string) => void
  paymentWallet: string
  votingFee: number
}

export default function PaymentModal({
  isOpen,
  onClose,
  onPaymentComplete,
  paymentWallet,
  votingFee
}: PaymentModalProps) {
  const { publicKey, sendTransaction } = useWallet()
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactionSignature, setTransactionSignature] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Auto-send payment when modal opens
  useEffect(() => {
    if (isOpen && publicKey && sendTransaction && !isProcessing && !transactionSignature && !error) {
      handleSendPayment()
    }
  }, [isOpen, publicKey, sendTransaction])

  // Reset error when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null)
      setTransactionSignature(null)
    }
  }, [isOpen])

  const handleRetry = () => {
    setError(null)
    setTransactionSignature(null)
    handleSendPayment()
  }

  const handleSendPayment = async () => {
    if (!publicKey || !sendTransaction) {
      toast.error('Wallet not connected')
      onClose()
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=ef87ad2f-a923-4ff3-a59d-8fe795b40315', 'confirmed')
      
      // Check user's SOL balance
      const balance = await connection.getBalance(publicKey)
      const requiredLamports = votingFee * LAMPORTS_PER_SOL
      
      if (balance < requiredLamports) {
        throw new Error(`Insufficient SOL balance. Required: ${votingFee} SOL, Available: ${balance / LAMPORTS_PER_SOL} SOL`)
      }
      
      // Create transaction
      const transaction = new Transaction()
      
      // Add transfer instruction
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey(paymentWallet),
        lamports: votingFee * LAMPORTS_PER_SOL
      })
      
      transaction.add(transferInstruction)
      
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey
      
      console.log('Transaction created:', {
        from: publicKey.toString(),
        to: paymentWallet,
        amount: votingFee * LAMPORTS_PER_SOL,
        lamports: votingFee * LAMPORTS_PER_SOL
      })
      
      // Send transaction
      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      })
      
      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, 'confirmed')
      
      if (confirmation.value.err) {
        throw new Error('Transaction failed: ' + confirmation.value.err)
      }
      
      // Verify the transaction actually transferred SOL
      const transactionDetails = await connection.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0
      })
      
      if (!transactionDetails) {
        throw new Error('Transaction not found after confirmation')
      }
      
      console.log('Transaction confirmed:', {
        signature,
        amount: votingFee * LAMPORTS_PER_SOL,
        confirmed: true
      })
      
      setTransactionSignature(signature)
      toast.success('Payment sent successfully!')
      
      // Auto-complete after a short delay
      setTimeout(() => {
        onPaymentComplete(signature)
        onClose()
      }, 1500)
      
    } catch (error) {
      console.error('Payment error:', error)
      
      // Handle specific error cases
      let errorMessage = 'Payment failed. Please try again.'
      
      if (error instanceof Error) {
        if (error.message.includes('User rejected')) {
          errorMessage = 'Transaction cancelled by user'
          toast.error('Transaction cancelled by user')
        } else if (error.message.includes('Unexpected error')) {
          errorMessage = 'Wallet connection error. Please try again.'
          toast.error('Wallet connection error. Please try again.')
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient SOL balance. Please add more SOL to your wallet.'
          toast.error('Insufficient SOL balance')
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Transaction timed out. Please try again.'
          toast.error('Transaction timed out')
        } else if (error.message.includes('blockhash')) {
          errorMessage = 'Network error. Please try again.'
          toast.error('Network error')
        } else {
          errorMessage = `Payment failed: ${error.message}`
          toast.error(`Payment failed: ${error.message}`)
        }
      } else {
        toast.error('Payment failed. Please try again.')
      }
      
      setError(errorMessage)
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">💰</div>
          <h2 className="text-2xl font-black text-white mb-2">PROCESSING PAYMENT</h2>
          <p className="text-purple-200 text-sm mb-2">
            Sending {votingFee} SOL to register your vote
          </p>
          <p className="text-xs text-purple-300 mb-1">
            You'll be prompted to sign the transaction in your wallet
          </p>
          <p className="text-xs text-purple-400">
            Payment wallet: {paymentWallet.slice(0, 8)}...{paymentWallet.slice(-8)}
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {isProcessing && (
            <div className="degen-card p-4 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-purple-300 text-sm font-bold">SENDING TRANSACTION...</p>
              <p className="text-xs text-purple-200 mt-1">
                Please sign the transaction in your wallet
              </p>
            </div>
          )}

          {error && (
            <div className="degen-card p-4 text-center">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-300 text-sm font-bold">PAYMENT FAILED</p>
              <p className="text-xs text-purple-200 mt-1">
                {error}
              </p>
            </div>
          )}

          {transactionSignature && (
            <div className="degen-card p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-green-300 text-sm font-bold">PAYMENT CONFIRMED!</p>
              <p className="text-xs text-purple-200 mt-1">
                Transaction: {transactionSignature.slice(0, 8)}...{transactionSignature.slice(-8)}
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="space-y-3">
            <Button
              onClick={handleRetry}
              disabled={isProcessing}
              className="w-full degen-btn py-3 text-lg font-black"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  RETRYING...
                </>
              ) : (
                'TRY AGAIN'
              )}
            </Button>
            
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full text-purple-300 hover:text-white"
            >
              Cancel
            </Button>
          </div>
        )}

        {isProcessing && !error && (
          <div className="text-center">
            <p className="text-xs text-purple-300">
              This will only take a moment...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
