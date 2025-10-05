
'use client';
import { toast } from '@/frontend/hooks/use-toast';

export const connectWallet = async () => {
    if (typeof window.aptos === 'undefined') {
        toast({
            variant: 'destructive',
            title: 'Petra Wallet Not Found',
            description: 'Please install Petra Aptos wallet extension and refresh the page.',
        });
        return null;
    }

    try {
        // Connect to Petra wallet
        const response = await window.aptos.connect();
        if (response.address) {
            toast({
                title: 'Wallet Connected',
                description: `Connected to ${response.address.slice(0, 6)}...${response.address.slice(-4)}`,
            });
            return response.address;
        }
        
        return null;
    } catch (error) {
        console.error("Wallet connection failed:", error);
        
        if (error.code === 4001) {
            toast({
                variant: 'destructive',
                title: 'Connection Rejected',
                description: 'You rejected the wallet connection request in Petra.',
            });
        } else if (error.message && error.message.includes('Failed to connect to Petra')) {
            toast({
                variant: 'destructive',
                title: 'Petra Connection Error',
                description: 'Please unlock Petra and try again. If the issue persists, try refreshing the page.',
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Connection Failed',
                description: 'Could not connect to Petra. Please check your wallet extension and try again.',
            });
        }
        return null;
    }
};
