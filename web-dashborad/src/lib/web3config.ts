import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrumSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Aether Swarm',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [arbitrumSepolia],
  ssr: true,
});

// Contract addresses
export const CONTRACTS = {
  COR_TOKEN: '0x8e0eef788350f40255d86dfe8d91ec0ad3a4547f',
  GRANT_DISTRIBUTION: process.env.NEXT_PUBLIC_GRANT_CONTRACT || '',
};

// Network configuration
export const NETWORK_CONFIG = {
  chainId: 421614,
  chainName: 'Arbitrum Sepolia',
  rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC || 'https://arbitrum-sepolia.g.alchemy.com/v2/YOUR_API_KEY',
  blockExplorer: 'https://sepolia.arbiscan.io',
};
