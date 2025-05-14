import { http, createConfig } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";

// Determine which chain to use based on environment variable
const isTestnet = import.meta.env.VITE_USE_TESTNET === 'true';
const selectedChain = isTestnet ? baseSepolia : base;

export const cbWalletConnector = coinbaseWallet({
  appName: "Trutix",
  preference: "smartWalletOnly",
  chainId: selectedChain.id
});

export const config = createConfig({
  chains: [selectedChain],
  multiInjectedProviderDiscovery: false,
  connectors: [cbWalletConnector],
  ssr: false,
  transports: {
    [selectedChain.id]: http(),
  },
});

// Export the selected chain for use in other components
export { selectedChain };

declare module "wagmi" {
    interface Register {
      config: typeof config;
    }
}