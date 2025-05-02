import { http, createConfig } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";

export const cbWalletConnector = coinbaseWallet({
  appName: "Trutix",
  preference: "smartWalletOnly",
});

export const config = createConfig({
  chains: [baseSepolia],
  multiInjectedProviderDiscovery: false,
  connectors: [cbWalletConnector],
  ssr: false,
  transports: {
    [baseSepolia.id]: http(),
  },
});

declare module "wagmi" {
    interface Register {
      config: typeof config;
    }
}