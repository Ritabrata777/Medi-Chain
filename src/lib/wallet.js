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
