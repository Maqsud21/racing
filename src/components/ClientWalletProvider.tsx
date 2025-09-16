'use client'

import React, { ReactNode, useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { 
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  BackpackWalletAdapter,
  TrustWalletAdapter,
  CoinbaseWalletAdapter,
  BitgetWalletAdapter,
  BitpieWalletAdapter,
  CloverWalletAdapter,
  Coin98WalletAdapter,
  CoinhubWalletAdapter,
  ExodusWalletAdapter,
  GlowWalletAdapter,
  KrystalWalletAdapter,
  MathWalletAdapter,
  NightlyWalletAdapter,
  NufiWalletAdapter,
  OKXWalletAdapter,
  SafePalWalletAdapter,
  SkyWalletAdapter,
  SlopeWalletAdapter,
  TokenPocketWalletAdapter,
  TorusWalletAdapter,
  WalletConnectWalletAdapter,
  XDEFIWalletAdapter
} from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'

// Default styles that can be overridden by your app
import '@solana/wallet-adapter-react-ui/styles.css'

interface ClientWalletProviderProps {
  children: ReactNode
}

export function ClientWalletProvider({ children }: ClientWalletProviderProps) {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = 'mainnet-beta'
  const endpoint = useMemo(() => 'https://mainnet.helius-rpc.com/?api-key=ef87ad2f-a923-4ff3-a59d-8fe795b40315', [])

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BackpackWalletAdapter(),
      new TrustWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new BitgetWalletAdapter(),
      new BitpieWalletAdapter(),
      new CloverWalletAdapter(),
      new Coin98WalletAdapter(),
      new CoinhubWalletAdapter(),
      new ExodusWalletAdapter(),
      new GlowWalletAdapter(),
      new KrystalWalletAdapter(),
      new MathWalletAdapter(),
      new NightlyWalletAdapter(),
      new NufiWalletAdapter(),
      new OKXWalletAdapter(),
      new SafePalWalletAdapter(),
      new SkyWalletAdapter(),
      new SlopeWalletAdapter(),
      new TokenPocketWalletAdapter(),
      new TorusWalletAdapter(),
      new WalletConnectWalletAdapter(),
      new XDEFIWalletAdapter()
    ],
    []
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
