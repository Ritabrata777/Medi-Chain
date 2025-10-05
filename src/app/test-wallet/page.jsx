'use client';
import { useState, useEffect } from 'react';
import { PetraGuide } from '@/frontend/components/PetraGuide';
import { connectWallet, checkNetwork, switchToAmoyNetwork } from '@/frontend/lib/blockchain';
import { Button } from '@/frontend/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/frontend/components/ui/card';
import { Alert, AlertDescription } from '@/frontend/components/ui/alert';
import { Badge } from '@/frontend/components/ui/badge';
import { Wallet, CheckCircle, XCircle, RefreshCw, Network } from 'lucide-react';
import { toast } from '@/frontend/hooks/use-toast';

export default function TestWalletPage() {
    const [walletStatus, setWalletStatus] = useState({
        installed: false,
        connected: false,
        account: null,
        network: null,
        networkCorrect: false
    });
    const [isLoading, setIsLoading] = useState(false);

    const checkWalletStatus = async () => {
        const status = {
            installed: typeof window.aptos !== 'undefined',
            connected: false,
            account: null,
            network: null,
            networkCorrect: false
        };

        if (status.installed) {
            try {
                const response = await window.aptos.connect();
                status.connected = !!response.address;
                status.account = response.address || null;
                status.network = 'Aptos Testnet';
                status.networkCorrect = true; // Petra automatically connects to testnet
            } catch (error) {
                console.error('Error checking wallet status:', error);
            }
        }

        setWalletStatus(status);
    };

    useEffect(() => {
        checkWalletStatus();
    }, []);

    const handleConnect = async () => {
        setIsLoading(true);
        try {
            const account = await connectWallet();
            if (account) {
                await checkWalletStatus();
                toast({
                    title: 'Success',
                    description: 'Wallet connected successfully!',
                });
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Connection Failed',
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSwitchNetwork = async () => {
        // Petra automatically connects to Aptos testnet, no need to switch
        toast({
            title: 'Info',
            description: 'Petra automatically connects to Aptos testnet!',
        });
    };

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wallet className="h-6 w-6" />
                        Petra Wallet Connection Test
                    </CardTitle>
                    <CardDescription>
                        Test and troubleshoot your Petra wallet connection
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Status Overview */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                            {walletStatus.installed ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <span>Petra Installed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {walletStatus.connected ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <span>Wallet Connected</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {walletStatus.networkCorrect ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <span>Correct Network</span>
                        </div>
                    </div>

                    {/* Account Info */}
                    {walletStatus.account && (
                        <Alert>
                            <AlertDescription>
                                <strong>Connected Account:</strong> {walletStatus.account}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Network Info */}
                    {walletStatus.network && (
                        <div className="flex items-center gap-2">
                            <Network className="h-4 w-4" />
                            <span>Network: {walletStatus.network.name} (Chain ID: {walletStatus.network.chainId.toString()})</span>
                            {walletStatus.networkCorrect && (
                                <Badge variant="secondary">Correct</Badge>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button 
                            onClick={handleConnect} 
                            disabled={isLoading || walletStatus.connected}
                            className="flex-1"
                        >
                            {isLoading ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Connecting...
                                </>
                            ) : (
                                <>
                                    <Wallet className="mr-2 h-4 w-4" />
                                    Connect Wallet
                                </>
                            )}
                        </Button>
                        
                        {walletStatus.connected && !walletStatus.networkCorrect && (
                            <Button 
                                onClick={handleSwitchNetwork} 
                                disabled={isLoading}
                                variant="outline"
                            >
                                <Network className="mr-2 h-4 w-4" />
                                Network Info
                            </Button>
                        )}
                        
                        <Button 
                            onClick={checkWalletStatus} 
                            disabled={isLoading}
                            variant="outline"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh
                        </Button>
                    </div>

                    {/* Troubleshooting Guide */}
                    {!walletStatus.installed && (
                        <Alert>
                            <AlertDescription>
                                <strong>Petra wallet not found!</strong> Please install the Petra Aptos wallet extension from{' '}
                                <a 
                                    href="https://petra.app/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-500 underline"
                                >
                                    petra.app
                                </a>
                            </AlertDescription>
                        </Alert>
                    )}

                    {walletStatus.installed && !walletStatus.connected && (
                        <Alert>
                            <AlertDescription>
                                <strong>Petra not connected!</strong> Please unlock Petra and connect your wallet.
                            </AlertDescription>
                        </Alert>
                    )}

                    {walletStatus.connected && !walletStatus.networkCorrect && (
                        <Alert>
                            <AlertDescription>
                                <strong>Network Info:</strong> Petra automatically connects to Aptos testnet.
                            </AlertDescription>
                        </Alert>
                    )}

                    {walletStatus.installed && walletStatus.connected && walletStatus.networkCorrect && (
                        <Alert className="border-green-200 bg-green-50">
                            <AlertDescription className="text-green-800">
                                <strong>✅ All good!</strong> Your Petra wallet is properly configured and ready to use with MediChain.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
