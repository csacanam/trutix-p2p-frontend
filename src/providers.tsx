"use client";
 
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { config, selectedChain } from "./wagmi";
 
export function Providers(props: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  // Debug logs
console.log('Environment VITE_USE_TESTNET:', import.meta.env.VITE_USE_TESTNET);
console.log('Selected Chain:', selectedChain);
console.log('Chain ID:', selectedChain.id);
console.log('Chain Name:', selectedChain.name);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={import.meta.env.VITE_PUBLIC_ONCHAINKIT_API_KEY}
          chain={selectedChain}
        >
          {props.children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}