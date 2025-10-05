'use client';
import { useState } from 'react';
import { Button } from '@/frontend/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/frontend/components/ui/card';
import { Alert, AlertDescription } from '@/frontend/components/ui/alert';
import { Wallet, RefreshCw, ExternalLink } from 'lucide-react';

export const PetraGuide = ({ onConnect }) => {
    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnect = async () => {
        setIsConnecting(true);
        try {
            if (onConnect) {
                await onConnect();
            }
        } finally {
            setIsConnecting(false);
        }
    };

    const checkPetraInstalled = () => {
        return typeof window.aptos !== 'undefined';
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Connect Petra Wallet
                </CardTitle>
                <CardDescription>
                    Connect your Petra Aptos wallet to use MediChain
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {!checkPetraInstalled() ? (
                    <Alert>
                        <AlertDescription>
                            Petra wallet is not installed. Please install the Petra Aptos wallet extension first.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <div className="space-y-3">
                        <Button 
                            onClick={handleConnect} 
                            disabled={isConnecting}
                            className="w-full"
                        >
                            {isConnecting ? (
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
                        
                        <div className="text-sm text-muted-foreground space-y-2">
                            <p><strong>Troubleshooting:</strong></p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                <li>Make sure Petra is unlocked</li>
                                <li>Check if Petra is connected to Aptos testnet</li>
                                <li>Try refreshing the page if connection fails</li>
                                <li>Ensure you have some APT for gas fees</li>
                            </ul>
                        </div>
                        
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => window.location.reload()}
                                className="flex-1"
                            >
                                <RefreshCw className="mr-2 h-3 w-3" />
                                Refresh Page
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open('https://petra.app/', '_blank')}
                                className="flex-1"
                            >
                                <ExternalLink className="mr-2 h-3 w-3" />
                                Get Petra
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
