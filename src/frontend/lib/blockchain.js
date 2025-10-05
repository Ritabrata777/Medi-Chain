'use client';

import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { MEDI_CHAIN_CONTRACT_ADDRESS, APTOS_TESTNET_RPC_URL } from '@/backend/contracts/config';

// Utility function for formatting Aptos addresses
const formatAptosAddress = (address) => {
    if (!address || typeof address !== 'string') {
        throw new Error('Invalid address provided');
    }

    let formattedAddress = address;
    
    // Remove 0x prefix if present
    if (formattedAddress.startsWith('0x')) {
        formattedAddress = formattedAddress.substring(2);
    }
    
    // Pad with zeros to make it 64 characters
    formattedAddress = formattedAddress.padStart(64, '0');
    
    // Add 0x prefix back
    return '0x' + formattedAddress;
};

// Configuration for Aptos testnet
const aptosConfig = new AptosConfig({ 
    network: Network.TESTNET,
    fullnode: APTOS_TESTNET_RPC_URL 
});
const aptos = new Aptos(aptosConfig);

const HEALTH_WALLET_ADDRESS = process.env.NEXT_PUBLIC_HEALTH_WALLET_CONTRACT_ADDRESS;

/**
 * Connects to the user's wallet and returns wallet info.
 * @returns {Promise<{address: string, publicKey: string}|null>}
 */
const getWallet = async () => {
    try {
        if (typeof window.aptos === 'undefined') {
            alert('Please install Petra Aptos wallet.');
            return null;
        }
        
        const response = await window.aptos.connect();
        if (response.address) {
            return { 
                address: response.address, 
                publicKey: response.publicKey 
            };
        }
        return null;
    } catch (error) {
        console.error("Failed to get wallet:", error);
        return null;
    }
}

// Network validation helper
export const validateNetwork = async () => {
    if (typeof window.aptos === 'undefined') {
        throw new Error('No wallet detected. Please install Petra Aptos wallet.');
    }

    try {
        // Petra automatically connects to testnet, so we just check if it's connected
        const response = await window.aptos.connect();
        if (!response.address) {
            throw new Error('Please connect your Petra wallet.');
        }
        
        return true;
    } catch (error) {
        console.error('Network validation failed:', error);
        throw error;
    }
};

// === MediChain Contract Interactions ===

export const verifyDoctorOnBlockchain = async (doctorWallet) => {
    // Always use mock implementation for now since contracts aren't deployed
    console.warn("Using mock blockchain transaction for verification. Contracts not deployed yet.");
    return Promise.resolve({ txHash: `0xmock_verification_${doctorWallet}_${Date.now()}` });
};

export const banUserOnBlockchain = async (userWallet, userType) => {
    if (!MEDI_CHAIN_CONTRACT_ADDRESS || MEDI_CHAIN_CONTRACT_ADDRESS === '0xYOUR_CONTRACT_ADDRESS_HERE') {
        console.warn("Using mock blockchain transaction for ban. Please update the contract address.");
        return Promise.resolve({ txHash: `0xmock_ban_${userWallet}_${Date.now()}` });
    }

    const wallet = await getWallet();
    if (!wallet) {
        throw new Error("Could not connect to the wallet. Make sure your Petra wallet is connected.");
    }

    try {
        // Format the user wallet address to ensure it's 64 characters
        const formattedUserWallet = formatAptosAddress(userWallet);
        
        console.log('User ban - Original wallet:', userWallet);
        console.log('User ban - Formatted wallet:', formattedUserWallet);
        
        const transaction = {
            type: "entry_function_payload",
            function: `${MEDI_CHAIN_CONTRACT_ADDRESS}::medichain::ban_doctor`,
            arguments: [formattedUserWallet, "Banned by admin"],
            type_arguments: []
        };

        const response = await window.aptos.signAndSubmitTransaction(transaction);
        return { txHash: response.hash };
    } catch (error) {
        console.error("User ban transaction failed:", error);
        if (error.code === 4001) {
            throw new Error("Transaction was cancelled by user in Petra wallet.");
        }
        throw new Error(error.message || "An error occurred during the blockchain transaction for banning.");
    }
};

export const unbanUserOnBlockchain = async (userWallet) => {
    if (!MEDI_CHAIN_CONTRACT_ADDRESS || MEDI_CHAIN_CONTRACT_ADDRESS === '0xYOUR_CONTRACT_ADDRESS_HERE') {
        console.warn("Using mock blockchain transaction for unban. Please update the contract address.");
        return Promise.resolve({ txHash: `0xmock_unban_${userWallet}_${Date.now()}` });
    }

    const wallet = await getWallet();
    if (!wallet) {
        throw new Error("Could not connect to the wallet. Make sure your Petra wallet is connected.");
    }

    try {
        // Format the user wallet address to ensure it's 64 characters
        const formattedUserWallet = formatAptosAddress(userWallet);
        
        console.log('User unban - Original wallet:', userWallet);
        console.log('User unban - Formatted wallet:', formattedUserWallet);
        
        // Note: This would need to be implemented in the Move contract
        const transaction = {
            type: "entry_function_payload",
            function: `${MEDI_CHAIN_CONTRACT_ADDRESS}::medichain::unban_doctor`,
            arguments: [formattedUserWallet],
            type_arguments: []
        };

        const response = await window.aptos.signAndSubmitTransaction(transaction);
        return { txHash: response.hash };
    } catch (error) {
        console.error("User unban transaction failed:", error);
        if (error.code === 4001) {
            throw new Error("Transaction was cancelled by user in Petra wallet.");
        }
        throw new Error(error.message || "An error occurred during the blockchain transaction for unbanning.");
    }
};

export const logToBlockchain = async ({ summaryHash, doctorWallet, patientHash }) => {
  if (!MEDI_CHAIN_CONTRACT_ADDRESS || MEDI_CHAIN_CONTRACT_ADDRESS === '0xYOUR_CONTRACT_ADDRESS_HERE') {
      console.warn("Using mock blockchain transaction. Please update the contract address in your .env file (NEXT_PUBLIC_MEDI_CHAIN_CONTRACT_ADDRESS).");
      return Promise.resolve({
        txHash: `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        summaryHash,
        doctorWallet,
        patientHash
      });
  }
  
    const wallet = await getWallet();
    if (!wallet) {
        throw new Error("Could not connect to the wallet. Make sure your Petra wallet is connected.");
  }

  try {
        // For Aptos, we'll simulate a transaction since we need to adapt the smart contract
        const transaction = {
            type: "entry_function_payload",
            function: `${MEDI_CHAIN_CONTRACT_ADDRESS}::medichain::add_consultation_log`,
            arguments: [doctorWallet, summaryHash, patientHash, "General consultation", "Prescription details"],
            type_arguments: []
        };

        const response = await window.aptos.signAndSubmitTransaction(transaction);

    return {
            txHash: response.hash,
      summaryHash,
      doctorWallet,
      patientHash,
    };
  } catch (error) {
    console.error("Blockchain transaction failed:", error);
    
        if (error.code === 4001) {
            throw new Error("Transaction was cancelled by you in Petra wallet. You can try again when you're ready.");
        }
        
        if (error.message && error.message.includes("insufficient")) {
            throw new Error("Insufficient APT for gas fees. Please get more test tokens from the Aptos testnet faucet.");
        }
        
    if (error.message && error.message.includes("Doctor is not verified")) {
      throw new Error("Doctor is not verified. Please contact admin for verification.");
    }
        
    if (error.message && error.message.includes("Doctor is banned")) {
      throw new Error("Doctor is banned and cannot log consultations.");
    }
        
    if (error.message && error.message.includes("wallet not connected")) {
            throw new Error("Please connect your Petra wallet and try again.");
    }
        
        if (error.message && error.message.includes("wrong network")) {
            throw new Error("Please switch your wallet to Aptos testnet and try again.");
    }
        
        if (error.message && error.message.includes("not found")) {
      throw new Error("Smart contract not found. Please check your network connection.");
    }
    
    const errorMessage = error.message || error.reason || "Unknown error occurred";
    throw new Error(`Blockchain transaction failed: ${errorMessage}`);
  }
};

// === Health Record Wallet Interactions ===

export const hasConsent = async ({ patient, grantee, scopeId }) => {
    if (!HEALTH_WALLET_ADDRESS || HEALTH_WALLET_ADDRESS === '0xYOUR_HEALTH_WALLET_CONTRACT_ADDRESS_HERE') {
        console.warn("Health wallet contract address not set. Returning false for consent check.");
        return false;
    }

    try {
        // For Aptos, we would query the contract state
        // This is a simplified version - in reality you'd use aptos.getAccountResource()
        return false; // Mock for now
    } catch (error) {
        console.error("Failed to check consent:", error);
        return false;
    }
};

export const grantConsent = async ({ patient, grantee, scopeId, expiresAt }) => {
    if (!HEALTH_WALLET_ADDRESS || HEALTH_WALLET_ADDRESS === '0xYOUR_HEALTH_WALLET_CONTRACT_ADDRESS_HERE') {
        console.warn("Health wallet contract address not set. Using mock transaction.");
        return Promise.resolve({ txHash: `0xmock_consent_${Date.now()}` });
    }

    const wallet = await getWallet();
    if (!wallet) {
        throw new Error("Could not connect to the wallet. Make sure your Petra wallet is connected.");
    }

    try {
        const transaction = {
            type: "entry_function_payload",
            function: `${HEALTH_WALLET_ADDRESS}::health_wallet::grant_consent`,
            arguments: [patient, grantee, scopeId, expiresAt],
            type_arguments: []
        };

        const response = await window.aptos.signAndSubmitTransaction(transaction);
        return { txHash: response.hash };
    } catch (error) {
        console.error("Grant consent transaction failed:", error);
        if (error.code === 4001) {
            throw new Error("Transaction was cancelled by user in Petra wallet.");
        }
        throw new Error(`Grant consent failed: ${error.message || "Unknown error occurred"}`);
    }
};

export const revokeConsent = async ({ patient, grantee, scopeId }) => {
    if (!HEALTH_WALLET_ADDRESS || HEALTH_WALLET_ADDRESS === '0xYOUR_HEALTH_WALLET_CONTRACT_ADDRESS_HERE') {
        console.warn("Health wallet contract address not set. Using mock transaction.");
        return Promise.resolve({ txHash: `0xmock_revoke_${Date.now()}` });
    }

    const wallet = await getWallet();
    if (!wallet) {
        throw new Error("Could not connect to the wallet. Make sure your Petra wallet is connected.");
    }

    try {
        const transaction = {
            type: "entry_function_payload",
            function: `${HEALTH_WALLET_ADDRESS}::health_wallet::revoke_consent`,
            arguments: [patient, grantee, scopeId],
            type_arguments: []
        };

        const response = await window.aptos.signAndSubmitTransaction(transaction);
        return { txHash: response.hash };
  } catch (error) {
        console.error("Revoke consent transaction failed:", error);
        if (error.code === 4001) {
            throw new Error("Transaction was cancelled by user in Petra wallet.");
        }
        throw new Error(`Revoke consent failed: ${error.message || "Unknown error occurred"}`);
    }
};

// === General Helpers ===

export const createHash = async (data) => {
    try {
        // Check if crypto.subtle is available (modern browsers)
        if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(data);
            const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return `0x${hashHex}`;
        }
        
        // Fallback for environments where crypto.subtle is not available
        console.warn('crypto.subtle not available, using fallback hash function');
        
        // Simple hash function fallback (not cryptographically secure, but functional)
        let hash = 0;
        if (data.length === 0) return '0x0000000000000000000000000000000000000000000000000000000000000000';
        
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        // Convert to hex string and pad to 64 characters (32 bytes)
        const hashHex = Math.abs(hash).toString(16).padStart(64, '0');
        return `0x${hashHex}`;
        
    } catch (error) {
        console.error('Error creating hash:', error);
        
        // Ultimate fallback - return a hash based on data length and timestamp
        const timestamp = Date.now().toString(16);
        const length = data.length.toString(16);
        const fallbackHash = `${timestamp}${length}`.padStart(64, '0');
        return `0x${fallbackHash}`;
    }
};

// === Contract Status Checkers ===

export const checkDoctorVerificationStatus = async (doctorWallet) => {
    // Always use mock implementation for now since contracts aren't deployed
    console.warn("Using mock doctor verification status check. Contracts not deployed yet.");
    console.log('Checking doctor status - Wallet:', doctorWallet);
    
    // Mock implementation - return false to allow verification attempts
    return { isVerified: false, isBanned: false, userType: 'unknown' };
};

// Export connectWallet function for compatibility
export const connectWallet = async () => {
    if (typeof window.aptos === 'undefined') {
        alert('Please install Petra Aptos wallet.');
        return null;
    }

    try {
        const response = await window.aptos.connect();
        if (response.address) {
            return response.address;
        }
        return null;
    } catch (error) {
        console.error("Wallet connection failed:", error);
        if (error.code === 4001) {
            // User rejected the connection request
            alert('You rejected the wallet connection request.');
        }
        return null;
    }
};

// Mock functions for fundraising page compatibility
export const getActiveCampaignsFromChain = async () => {
    // Mock implementation - return empty array for now
    return [];
};

export const getDonorsForCampaign = async (campaignId) => {
    // Mock implementation - return empty array for now
    return [];
};

export const checkCampaignExists = async (campaignId) => {
    // Mock implementation - return true for now
    return true;
};

export const clearRPCCache = async () => {
    // Mock implementation - no-op for now
    return;
};

// Mock functions for compatibility with existing components
export const uploadHealthRecord = async (recordData) => {
    console.warn("uploadHealthRecord not implemented for Aptos yet");
    return { txHash: `0xmock_upload_${Date.now()}` };
};

export const approveDoctorForRecord = async (doctorAddress, recordId) => {
    console.warn("approveDoctorForRecord not implemented for Aptos yet");
    return { txHash: `0xmock_approve_${Date.now()}` };
};

export const revokeDoctorForRecord = async (doctorAddress, recordId) => {
    console.warn("revokeDoctorForRecord not implemented for Aptos yet");
    return { txHash: `0xmock_revoke_${Date.now()}` };
};

export const canDoctorAccessRecord = async (doctorAddress, recordId) => {
    console.warn("canDoctorAccessRecord not implemented for Aptos yet");
    return false;
};

// Debug function to test contract interaction
export const debugContractInteraction = async () => {
    if (!MEDI_CHAIN_CONTRACT_ADDRESS || MEDI_CHAIN_CONTRACT_ADDRESS === '0xYOUR_CONTRACT_ADDRESS_HERE') {
        console.warn("No contract address configured for debugging.");
        return;
    }

    try {
        const wallet = await getWallet();
        if (!wallet) {
            throw new Error("Could not connect to the wallet.");
        }

        console.log("=== Contract Debug Information ===");
        console.log("Contract address:", MEDI_CHAIN_CONTRACT_ADDRESS);
        console.log("Wallet address:", wallet.address);
        console.log("=== End Debug Information ===");
    } catch (error) {
        console.error("Debug failed:", error);
    }
};