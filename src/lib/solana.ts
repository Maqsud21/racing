import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'

// Solana RPC endpoint
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://mainnet.helius-rpc.com/?api-key=ef87ad2f-a923-4ff3-a59d-8fe795b40315'

// Payment wallet address
const PAYMENT_WALLET = process.env.PAYMENT_WALLET || '7UwkPhbKdgcoTx2JjFwWkNs8x8ZfEH443tdrwe2NQmuP'

// Voting fee in SOL
const VOTING_FEE_SOL = 0.02

export interface PaymentVerification {
  isValid: boolean
  transactionSignature?: string
  amount?: number
  error?: string
}

/**
 * Verify that a user has sent the required SOL payment to the payment wallet
 * @param userWalletAddress - The user's wallet address
 * @param transactionSignature - The transaction signature to verify
 * @returns Promise<PaymentVerification>
 */
export async function verifySolPayment(
  userWalletAddress: string,
  transactionSignature: string
): Promise<PaymentVerification> {
  try {
    const connection = new Connection(SOLANA_RPC_URL, 'confirmed')
    
    // Get transaction details
    const transaction = await connection.getTransaction(transactionSignature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    })

    if (!transaction) {
      return {
        isValid: false,
        error: 'Transaction not found or not confirmed'
      }
    }

    // Check if transaction was successful
    if (transaction.meta?.err) {
      return {
        isValid: false,
        error: 'Transaction failed'
      }
    }

    // Get the payment wallet public key
    const paymentWalletPubkey = new PublicKey(PAYMENT_WALLET)
    const userWalletPubkey = new PublicKey(userWalletAddress)

    // Check if the transaction involves the correct wallets
    const accountKeys = transaction.transaction.message.accountKeys
    const hasPaymentWallet = accountKeys.some(key => key.equals(paymentWalletPubkey))
    const hasUserWallet = accountKeys.some(key => key.equals(userWalletPubkey))

    if (!hasPaymentWallet || !hasUserWallet) {
      return {
        isValid: false,
        error: 'Transaction does not involve the correct wallets'
      }
    }

    // Check the transfer amount
    const preBalances = transaction.meta?.preBalances || []
    const postBalances = transaction.meta?.postBalances || []
    
    // Find the payment wallet index
    const paymentWalletIndex = accountKeys.findIndex(key => key.equals(paymentWalletPubkey))
    
    if (paymentWalletIndex === -1) {
      return {
        isValid: false,
        error: 'Payment wallet not found in transaction'
      }
    }

    // Calculate the amount received by the payment wallet
    const amountReceived = (postBalances[paymentWalletIndex] - preBalances[paymentWalletIndex]) / LAMPORTS_PER_SOL

    // Check if the amount is correct (allow for small rounding differences)
    const expectedAmount = VOTING_FEE_SOL
    const tolerance = 0.001 // 0.001 SOL tolerance

    if (Math.abs(amountReceived - expectedAmount) > tolerance) {
      return {
        isValid: false,
        error: `Incorrect payment amount. Expected ${expectedAmount} SOL, received ${amountReceived} SOL`
      }
    }

    return {
      isValid: true,
      transactionSignature,
      amount: amountReceived
    }

  } catch (error) {
    console.error('Error verifying SOL payment:', error)
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Get the payment wallet address
 */
export function getPaymentWalletAddress(): string {
  return PAYMENT_WALLET
}

/**
 * Get the voting fee in SOL
 */
export function getVotingFee(): number {
  return VOTING_FEE_SOL
}
