// Configuration for Aptos Testnet
export const MEDI_CHAIN_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MEDI_CHAIN_CONTRACT_ADDRESS;
export const FUNDRAISER_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_FUNDRAISER_CONTRACT_ADDRESS;
export const HEALTH_WALLET_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_HEALTH_WALLET_CONTRACT_ADDRESS;

// Aptos Testnet RPC URL
export const APTOS_TESTNET_RPC_URL = process.env.NEXT_PUBLIC_APTOS_TESTNET_RPC_URL || 'https://fullnode.testnet.aptoslabs.com/v1';

// Aptos Testnet Chain ID
export const APTOS_TESTNET_CHAIN_ID = 2;

// Admin wallets configuration
export const ADMIN_WALLETS = process.env.NEXT_PUBLIC_ADMIN_WALLETS ? 
    process.env.NEXT_PUBLIC_ADMIN_WALLETS.toLowerCase().split(',') : [];

// Default configuration for development
export const DEFAULT_CONFIG = {
    mediChainAddress: MEDI_CHAIN_CONTRACT_ADDRESS || '0xYOUR_CONTRACT_ADDRESS_HERE',
    fundraiserAddress: FUNDRAISER_CONTRACT_ADDRESS || '0xYOUR_CONTRACT_ADDRESS_HERE',
    healthWalletAddress: HEALTH_WALLET_CONTRACT_ADDRESS || '0xYOUR_HEALTH_WALLET_CONTRACT_ADDRESS_HERE',
    rpcUrl: APTOS_TESTNET_RPC_URL,
    chainId: APTOS_TESTNET_CHAIN_ID
};
