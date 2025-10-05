import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { MEDI_CHAIN_CONTRACT_ADDRESS, FUNDRAISER_CONTRACT_ADDRESS, APTOS_TESTNET_RPC_URL, APTOS_TESTNET_CHAIN_ID } from '@/backend/contracts/config';

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

// Wallet connection helper
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
        console.error("Wallet connection failed:", error);
        return null;
    }
};

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
        console.error("Network validation failed:", error);
        throw error;
    }
};

// === MediChain Contract Interactions ===

export const verifyDoctorOnBlockchain = async (doctorWallet) => {
    // Check if we're on the client side
    if (typeof window === 'undefined') {
        throw new Error("This function can only be called from the client side. Please ensure you're calling it from a browser environment.");
    }

    if (!MEDI_CHAIN_CONTRACT_ADDRESS || MEDI_CHAIN_CONTRACT_ADDRESS === '0xYOUR_CONTRACT_ADDRESS_HERE') {
        console.warn("Using mock blockchain transaction for verification. Please update the contract address.");
        return Promise.resolve({ txHash: `0xmock_verification_${doctorWallet}_${Date.now()}` });
    }

    const wallet = await getWallet();
    if (!wallet) {
        throw new Error("Could not connect to the wallet. Make sure your Petra wallet is connected.");
    }

    try {
        // Format the doctor wallet address to ensure it's 64 characters
        const formattedDoctorWallet = formatAptosAddress(doctorWallet);
        
        console.log('Doctor verification - Original wallet:', doctorWallet);
        console.log('Doctor verification - Formatted wallet:', formattedDoctorWallet);
        
        // For Aptos, we'll simulate a transaction since we need to adapt the smart contract
        const transaction = {
            type: "entry_function_payload",
            function: `${MEDI_CHAIN_CONTRACT_ADDRESS}::medichain::verify_doctor`,
            arguments: [formattedDoctorWallet],
            type_arguments: []
        };

        const response = await window.aptos.signAndSubmitTransaction(transaction);
        return { txHash: response.hash };
    } catch (error) {
        console.error("Doctor verification transaction failed:", error);
        if (error.code === 4001) {
            throw new Error("Transaction was cancelled by user in Petra wallet.");
        }
        throw new Error(`Verification failed: ${error.message || "Unknown error occurred"}`);
    }
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
  // Check if we're on the client side
  if (typeof window === 'undefined') {
      throw new Error("This function can only be called from the client side. Please ensure you're calling it from a browser environment.");
  }

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

// === Fundraiser Contract Interactions ===

export const createCampaignOnChain = async (campaignData) => {
    // Check if we're on the client side
    if (typeof window === 'undefined') {
        throw new Error("This function can only be called from the client side. Please ensure you're calling it from a browser environment.");
    }

    if (!FUNDRAISER_CONTRACT_ADDRESS) {
        throw new Error("Fundraiser contract address is not configured.");
    }
    
    const wallet = await getWallet();
    if (!wallet) {
        throw new Error("Could not connect to the wallet. Make sure your Petra wallet is connected.");
    }

    try {
        const { beneficiary, goalAmount, title, description } = campaignData;
        const goalInOctas = Math.floor(parseFloat(goalAmount) * 100000000); // Convert APT to octas

        const transaction = {
            type: "entry_function_payload",
            function: `${FUNDRAISER_CONTRACT_ADDRESS}::fundraiser::create_campaign`,
            arguments: [goalInOctas, title, description],
            type_arguments: []
        };

        const response = await window.aptos.signAndSubmitTransaction(transaction);
        return { txHash: response.hash, campaignId: "1" }; // Mock campaign ID
    } catch (error) {
        console.error("Campaign creation transaction failed:", error);
        if (error.code === 4001) {
            throw new Error("Transaction was cancelled by user in Petra wallet.");
        }
        throw new Error(`Campaign creation failed: ${error.message || "Unknown error occurred"}`);
    }
};

export const donateToCampaignOnChain = async (campaignId, amount) => {
    // Check if we're on the client side
    if (typeof window === 'undefined') {
        throw new Error("This function can only be called from the client side. Please ensure you're calling it from a browser environment.");
    }

    if (!FUNDRAISER_CONTRACT_ADDRESS) {
        throw new Error("Fundraiser contract address is not configured.");
    }
    
    const wallet = await getWallet();
    if (!wallet) {
        throw new Error("Could not connect to the wallet. Make sure your Petra wallet is connected.");
    }

    try {
        // Convert campaignId to number if it's a string
        const numericCampaignId = typeof campaignId === 'string' ? parseInt(campaignId, 10) : campaignId;
        const amountInOctas = Math.floor(parseFloat(amount) * 100000000); // Convert APT to octas
        
        const transaction = {
            type: "entry_function_payload",
            function: `${FUNDRAISER_CONTRACT_ADDRESS}::fundraiser::donate`,
            arguments: [numericCampaignId, amountInOctas],
            type_arguments: []
        };

        const response = await window.aptos.signAndSubmitTransaction(transaction);
        return { txHash: response.hash };
    } catch (error) {
        console.error("Donation transaction failed:", error);
        if (error.code === 4001) {
            throw new Error("Transaction was cancelled by user in Petra wallet.");
        }
        throw new Error(`Donation failed: ${error.message || "Unknown error occurred"}`);
    }
};

export const donateDirectToWallet = async (toAddress, amount) => {
    // Require browser signer (Petra)
    if (typeof window === 'undefined' || typeof window.aptos === 'undefined') {
        throw new Error('No wallet detected. Please install Petra or another Aptos wallet.');
    }

    try {
        console.log('Donation request - Target address:', toAddress);
        
        // Format Aptos address properly (64 characters, excluding 0x)
        const formatAptosAddress = (address) => {
            if (!address || typeof address !== 'string') {
                throw new Error('Invalid address provided');
            }
            let formattedAddress = address;
            if (formattedAddress.startsWith('0x')) {
                formattedAddress = formattedAddress.substring(2);
            }
            formattedAddress = formattedAddress.padStart(64, '0');
            return '0x' + formattedAddress;
        };
        const aptToOctas = (aptAmount) => Math.floor(parseFloat(aptAmount) * 100000000);
        const formattedAddress = formatAptosAddress(toAddress);
        const amountInOctas = aptToOctas(amount);
        
        console.log('Formatted address:', formattedAddress);
        console.log('Address length:', formattedAddress.length);
        
        // Double-check address format
        if (!formattedAddress.startsWith('0x') || formattedAddress.length !== 66) {
            throw new Error('Invalid wallet address format');
        }

        if (amountInOctas <= 0) {
            throw new Error('Invalid donation amount.');
        }

        // Create transfer transaction
        const transaction = {
            type: "entry_function_payload",
            function: "0x1::aptos_account::transfer",
            arguments: [formattedAddress, amountInOctas],
            type_arguments: []
        };

        // Send transaction through Petra
        const response = await window.aptos.signAndSubmitTransaction(transaction);

        return { txHash: response.hash };
        } catch (error) {
        console.error('Direct donation failed:', error);
        if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
            throw new Error('Transaction rejected in wallet.');
        }
        if (String(error?.message || '').includes('insufficient funds')) {
            throw new Error('Insufficient APT in your wallet to cover the donation and gas fees.');
        }
        if (String(error?.message || '').includes('invalid address')) {
            throw new Error('Invalid patient wallet address.');
        }
        throw new Error(error?.message || 'Failed to send donation.');
    }
};

// === Contract Status Checkers ===

export const checkDoctorVerificationStatus = async (doctorWallet) => {
    if (!MEDI_CHAIN_CONTRACT_ADDRESS || MEDI_CHAIN_CONTRACT_ADDRESS === '0xYOUR_CONTRACT_ADDRESS_HERE') {
        return { isVerified: false, isBanned: false, userType: 'unknown' };
    }

    try {
        // For Aptos, we would query the contract state
        // This is a simplified version - in real implementation, you'd use aptos.getAccountResource()
        // Format the address to ensure it's properly formatted
        const formattedWallet = formatAptosAddress(doctorWallet);
        console.log('Checking doctor status - Original wallet:', doctorWallet);
        console.log('Checking doctor status - Formatted wallet:', formattedWallet);
        
        // Mock implementation for Aptos
        return { isVerified: false, isBanned: false, userType: 'unknown' };
    } catch (error) {
        console.error("Failed to check doctor status:", error);
        return { isVerified: false, isBanned: false, userType: 'unknown' };
    }
};

// Debug function to test contract interaction
export const debugContractInteraction = async () => {
    if (!MEDI_CHAIN_CONTRACT_ADDRESS || MEDI_CHAIN_CONTRACT_ADDRESS === '0xYOUR_CONTRACT_ADDRESS_HERE') {
        console.warn("No contract address configured for debugging.");
        return { success: false, message: "No contract address configured" };
    }

    try {
        // Test basic Aptos connection
        const accountInfo = await aptos.getAccountInfo({ accountAddress: MEDI_CHAIN_CONTRACT_ADDRESS });
        return { 
            success: true, 
            message: "Contract interaction test successful",
            accountInfo 
        };
    } catch (error) {
        console.error("Contract interaction test failed:", error);
        return { 
            success: false, 
            message: `Contract interaction test failed: ${error.message}` 
        };
    }
};

// === Utility Functions ===

export const createHash = async (data) => {
    try {
        // Use Web Crypto API if available
        if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(data);
            const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return `0x${hashHex}`;
        }
        
        // Fallback to simple hash for server-side or older browsers
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        const fallbackHash = Math.abs(hash).toString(16).padStart(8, '0');
        
        return `0x${fallbackHash}`;
    } catch (error) {
        console.error("Hash creation failed:", error);
        // Ultimate fallback
        const fallbackHash = Math.random().toString(16).substring(2, 10);
        return `0x${fallbackHash}`;
    }
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
    // Mock implementation - return sample blockchain donations with transaction hashes
    // In a real implementation, this would fetch actual transaction data from the blockchain
    // For now, return empty array since we're using direct donations only
    console.log(`getDonorsForCampaign: Returning empty array for campaign ${campaignId} (using direct donations only)`);
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