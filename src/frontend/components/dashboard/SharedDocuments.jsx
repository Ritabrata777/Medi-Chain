
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/frontend/components/ui/card';
import { Button } from '@/frontend/components/ui/button';
import { Input } from '@/frontend/components/ui/input';
import { Badge } from '@/frontend/components/ui/badge';
import { FileText, Loader2, Send, Clock, CheckCircle, XCircle, Eye, RefreshCw } from 'lucide-react';
import { useToast } from "@/frontend/hooks/use-toast";
import { getAccessRequestsByDoctor, createAccessRequest, getPatientProfile } from '@/backend/services/mongodb';
import { canDoctorAccessRecord } from '@/frontend/lib/blockchain';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/frontend/components/ui/tooltip";


const SharedDocuments = ({ activeWallet }) => {
    const { toast } = useToast();
    const [patientWallet, setPatientWallet] = useState('');
    const [isRequesting, setIsRequesting] = useState(false);
    const [accessRequests, setAccessRequests] = useState([]);
    const [isLoadingRequests, setIsLoadingRequests] = useState(false);
    const [patientNames, setPatientNames] = useState({});

    // Load doctor's access requests on component mount
    const loadRequests = useCallback(async () => {
        if (!activeWallet) return;
        setIsLoadingRequests(true);
        try {
            const requests = await getAccessRequestsByDoctor(activeWallet);
            setAccessRequests(requests || []);

            // Fetch patient names for all unique patient IDs
            const uniquePatientIds = [...new Set((requests || []).map(req => req.patientId))];
            const namesMap = {};
            
            for (const patientId of uniquePatientIds) {
                try {
                    const profile = await getPatientProfile(patientId);
                    namesMap[patientId] = profile?.name || 'Unknown Patient';
                } catch (error) {
                    console.error(`Error fetching patient profile for ${patientId}:`, error);
                    namesMap[patientId] = 'Unknown Patient';
                }
            }
            
            setPatientNames(namesMap);
        } catch (error) {
            console.error('Error loading access requests:', error);
            toast({ 
                variant: 'destructive', 
                title: 'Error', 
                description: 'Failed to load access requests.' 
            });
        } finally {
            setIsLoadingRequests(false);
        }
    }, [activeWallet, toast]);
    
    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    const handleRequestAccess = async () => {
        if (!patientWallet.trim()) {
            toast({ 
                variant: 'destructive', 
                title: 'Error', 
                description: 'Please enter a patient wallet address.' 
            });
            return;
        }

        if (!activeWallet) {
            toast({ 
                variant: 'destructive', 
                title: 'Error', 
                description: 'Wallet not connected.' 
            });
            return;
        }

        setIsRequesting(true);
        try {
            // Create access request for all documents (patient will decide which to share)
            const request = await createAccessRequest({
                doctorId: activeWallet,
                patientId: patientWallet.trim(),
                documentIds: [], // Empty array means request for all documents
                durationHours: 24
            });

            // Add to local state
            setAccessRequests(prev => [request, ...prev]);
            
            // Clear input
            setPatientWallet('');
            
            toast({ 
                title: 'Request Sent', 
                description: 'Access request sent to patient. Waiting for approval...' 
            });
        } catch (error) {
            console.error('Error creating access request:', error);
            toast({ 
                variant: 'destructive', 
                title: 'Error', 
                description: 'Failed to send access request. Please try again.' 
            });
        } finally {
            setIsRequesting(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'denied':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'pending':
            default:
                return <Clock className="h-4 w-4 text-yellow-500" />;
        }
    };

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'approved':
                return 'secondary';
            case 'denied':
                return 'destructive';
            case 'pending':
            default:
                return 'default';
        }
    };

    const formatWalletAddress = (address) => {
        if (!address) return 'Unknown';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const [expiredRequests, setExpiredRequests] = useState(new Set());

    const checkRequestExpiration = async (request) => {
        if (request.status !== 'approved') return false;
        
        try {
            const profile = await getPatientProfile(request.patientId);
            if (!profile) return false;
            
            const consents = Array.isArray(profile?.consents) ? profile.consents : [];
            const now = Date.now();
            const granted = consents.find(c => 
                c.address?.toLowerCase() === (activeWallet || '').toLowerCase() &&
                c.requestId === request.id // Match the specific request
            );
            
            if (!granted || !granted.expiresAt) return false;
            
            return granted.expiresAt <= now;
        } catch (error) {
            console.error('Error checking expiration:', error);
            return false;
        }
    };

    // Check expiration for all approved requests
    useEffect(() => {
        const checkAllExpirations = async () => {
            const expiredSet = new Set();
            
            for (const request of accessRequests) {
                if (request.status === 'approved') {
                    const isExpired = await checkRequestExpiration(request);
                    if (isExpired) {
                        expiredSet.add(request.id);
                    }
                }
            }
            
            setExpiredRequests(expiredSet);
        };

        if (accessRequests.length > 0) {
            checkAllExpirations();
        }
    }, [accessRequests, activeWallet]);

    const handleViewFiles = async (patientId) => {
        try {
            const profile = await getPatientProfile(patientId);
            if (!profile) {
                toast({ 
                    variant: 'destructive', 
                    title: 'Error', 
                    description: 'Patient profile not found.' 
                });
                return;
            }

            // Get the most recent approved request for this doctor
            const doctorRequests = accessRequests.filter(req => 
                req.patientId === patientId && 
                req.doctorId === activeWallet && 
                req.status === 'approved'
            );
            
            if (doctorRequests.length === 0) {
                toast({ 
                    variant: 'destructive', 
                    title: 'No Access', 
                    description: 'You do not have any approved access to this patient\'s documents.' 
                });
                return;
            }

            // Get the most recent approved request
            const mostRecentRequest = doctorRequests.sort((a, b) => 
                new Date(b.requestDate) - new Date(a.requestDate)
            )[0];

            // Get the consent for this specific request
            const consents = Array.isArray(profile?.consents) ? profile.consents : [];
            const now = Date.now();
            
            // Find the permission that matches this specific request
            const granted = consents.find(c => 
                c.address?.toLowerCase() === (activeWallet || '').toLowerCase() && 
                c.requestId === mostRecentRequest.id && // Match the specific request
                c.documentIds && 
                c.documentIds.length > 0
            );
            
            if (!granted) {
                toast({ 
                    variant: 'destructive', 
                    title: 'No Access', 
                    description: 'You do not have access to this patient\'s documents.' 
                });
                return;
            }

            // Check if access has expired
            if (granted.expiresAt && granted.expiresAt <= now) {
                toast({ 
                    variant: 'destructive', 
                    title: 'Access Expired', 
                    description: `Your access expired on ${new Date(granted.expiresAt).toLocaleString()}` 
                });
                return;
            }

            const allowedIds = new Set(Array.isArray(granted?.documentIds) ? granted.documentIds : []);
            const allDocs = Array.isArray(profile?.consentDocuments) ? profile.consentDocuments : [];
            const sharedDocs = allowedIds.size > 0 ? allDocs.filter(d => allowedIds.has(d.id)) : [];

            if (sharedDocs.length === 0) {
                toast({ 
                    title: 'No Documents', 
                    description: 'No documents have been shared with you yet.' 
                });
                return;
            }

            // Validate blockchain access for each document
            const validatedDocs = [];
            for (const doc of sharedDocs) {
                if (doc.blockchainRecordId) {
                    try {
                        const hasAccess = await canDoctorAccessRecord(doc.blockchainRecordId, activeWallet);
                        if (hasAccess) {
                            validatedDocs.push(doc);
                        } else {
                            console.warn(`Blockchain access denied for document ${doc.id}`);
                        }
                    } catch (blockchainError) {
                        console.warn(`Blockchain validation failed for document ${doc.id}:`, blockchainError);
                        // Fallback to local validation if blockchain fails
                        validatedDocs.push(doc);
                    }
                } else {
                    // No blockchain record ID, use local validation
                    validatedDocs.push(doc);
                }
            }

            if (validatedDocs.length === 0) {
                toast({ 
                    variant: 'destructive',
                    title: 'Access Denied', 
                    description: 'Blockchain validation failed. Access denied.' 
                });
                return;
            }

            // Debug: Log document information
            console.log('Validated documents:', validatedDocs.map(doc => ({
                name: doc.name,
                hasDataUri: !!doc.dataUri,
                dataUriLength: doc.dataUri?.length || 0,
                type: doc.type
            })));

            // Open validated documents in new tabs
            validatedDocs.forEach((doc, index) => {
                if (doc.dataUri) {
                    try {
                        // Create a proper data URL for different file types
                        let dataUrl = doc.dataUri;
                        
                        // Ensure proper MIME type for different file extensions
                        if (doc.name.toLowerCase().endsWith('.pdf')) {
                            if (!dataUrl.startsWith('data:application/pdf')) {
                                dataUrl = `data:application/pdf;base64,${doc.dataUri.split(',')[1] || doc.dataUri}`;
                            }
                        } else if (doc.name.toLowerCase().match(/\.(jpg|jpeg)$/)) {
                            if (!dataUrl.startsWith('data:image/jpeg')) {
                                dataUrl = `data:image/jpeg;base64,${doc.dataUri.split(',')[1] || doc.dataUri}`;
                            }
                        } else if (doc.name.toLowerCase().endsWith('.png')) {
                            if (!dataUrl.startsWith('data:image/png')) {
                                dataUrl = `data:image/png;base64,${doc.dataUri.split(',')[1] || doc.dataUri}`;
                            }
                        }
                        
                        // Open in new tab with a small delay to prevent popup blocking
                        setTimeout(() => {
                            const newWindow = window.open('', '_blank');
                            if (newWindow) {
                                if (doc.name.toLowerCase().endsWith('.pdf')) {
                                    // For PDFs, create a secure read-only viewer
                                    newWindow.document.write(`
                                        <html>
                                            <head>
                                                <title>${doc.name} - Read Only</title>
                                                <style>
                                                    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #f0f0f0; }
                                                    .header { background: #2c3e50; color: white; padding: 15px; text-align: center; position: relative; }
                                                    .security-badge { background: #e74c3c; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; position: absolute; right: 15px; top: 15px; }
                                                    .expiry-info { background: #34495e; color: #ecf0f1; padding: 8px; text-align: center; font-size: 12px; }
                                                    .viewer-container { background: white; margin: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); overflow: hidden; }
                                                    embed { width: 100%; height: calc(100vh - 140px); border: none; }
                                                    .no-select { user-select: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; }
                                                </style>
                                                <script>
                                                    // Disable right-click, F12, Ctrl+S, Ctrl+A, etc.
                                                    document.addEventListener('contextmenu', e => e.preventDefault());
                                                    document.addEventListener('keydown', e => {
                                                        if (e.key === 'F12' || (e.ctrlKey && (e.key === 's' || e.key === 'a' || e.key === 'c' || e.key === 'v' || e.key === 'p'))) {
                                                            e.preventDefault();
                                                        }
                                                    });
                                                    // Disable text selection
                                                    document.addEventListener('selectstart', e => e.preventDefault());
                                                    // Disable drag and drop
                                                    document.addEventListener('dragstart', e => e.preventDefault());
                                                    
                                                    // Check expiration and update countdown
                                                    const expiryTime = ${granted.expiresAt};
                                                    
                                                    // Update countdown every second
                                                    const updateCountdown = () => {
                                                        const now = Date.now();
                                                        const timeLeft = expiryTime - now;
                                                        
                                                        if (timeLeft <= 0) {
                                                            document.body.innerHTML = \`
                                                                <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #f0f0f0; font-family: Arial, sans-serif;">
                                                                    <div style="text-align: center; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                                                                        <h2 style="color: #e74c3c;">Access Expired</h2>
                                                                        <p>Your access to this document has expired.</p>
                                                                        <p>Please request new access from the patient.</p>
                                                                    </div>
                                                                </div>
                                                            \`;
                                                            return;
                                                        }
                                                        
                                                        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                                                        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                                                        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
                                                        
                                                        const countdownElement = document.getElementById('countdown-${index}');
                                                        if (countdownElement) {
                                                            countdownElement.textContent = \`Time remaining: \${hours}h \${minutes}m \${seconds}s\`;
                                                        }
                                                    };
                                                    
                                                    updateCountdown();
                                                    setInterval(updateCountdown, 1000);
                                                </script>
                                            </head>
                                            <body class="no-select">
                                                <div class="header">
                                                    <strong>${doc.name}</strong>
                                                    <div class="security-badge">READ ONLY</div>
                                                </div>
                                                <div class="expiry-info">
                                                    ⏰ Access expires: ${new Date(granted.expiresAt).toLocaleString()}
                                                    <br>
                                                    <span id="countdown-${index}">Calculating time remaining...</span>
                                                </div>
                                                <div class="viewer-container">
                                                    <embed src="${dataUrl}" type="application/pdf" />
                                                </div>
                                            </body>
                                        </html>
                                    `);
                                } else if (doc.name.toLowerCase().match(/\.(jpg|jpeg|png)$/)) {
                                    // For images, create a secure read-only viewer
                                    newWindow.document.write(`
                                        <html>
                                            <head>
                                                <title>${doc.name} - Read Only</title>
                                                <style>
                                                    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #f0f0f0; }
                                                    .header { background: #2c3e50; color: white; padding: 15px; text-align: center; position: relative; }
                                                    .security-badge { background: #e74c3c; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; position: absolute; right: 15px; top: 15px; }
                                                    .expiry-info { background: #34495e; color: #ecf0f1; padding: 8px; text-align: center; font-size: 12px; }
                                                    .image-container { background: white; margin: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); padding: 20px; text-align: center; }
                                                    img { max-width: 100%; max-height: calc(100vh - 160px); border: 2px solid #ddd; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
                                                    .no-select { user-select: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; }
                                                </style>
                                                <script>
                                                    // Disable right-click, F12, Ctrl+S, Ctrl+A, etc.
                                                    document.addEventListener('contextmenu', e => e.preventDefault());
                                                    document.addEventListener('keydown', e => {
                                                        if (e.key === 'F12' || (e.ctrlKey && (e.key === 's' || e.key === 'a' || e.key === 'c' || e.key === 'v' || e.key === 'p'))) {
                                                            e.preventDefault();
                                                        }
                                                    });
                                                    // Disable text selection
                                                    document.addEventListener('selectstart', e => e.preventDefault());
                                                    // Disable drag and drop
                                                    document.addEventListener('dragstart', e => e.preventDefault());
                                                    // Disable image dragging
                                                    document.addEventListener('dragstart', e => e.preventDefault());
                                                    
                                                    // Check expiration and update countdown
                                                    const expiryTime = ${granted.expiresAt};
                                                    
                                                    // Update countdown every second
                                                    const updateCountdown = () => {
                                                        const now = Date.now();
                                                        const timeLeft = expiryTime - now;
                                                        
                                                        if (timeLeft <= 0) {
                                                            document.body.innerHTML = \`
                                                                <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #f0f0f0; font-family: Arial, sans-serif;">
                                                                    <div style="text-align: center; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                                                                        <h2 style="color: #e74c3c;">Access Expired</h2>
                                                                        <p>Your access to this document has expired.</p>
                                                                        <p>Please request new access from the patient.</p>
                                                                    </div>
                                                                </div>
                                                            \`;
                                                            return;
                                                        }
                                                        
                                                        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                                                        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                                                        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
                                                        
                                                        const countdownElement = document.getElementById('countdown-img-${index}');
                                                        if (countdownElement) {
                                                            countdownElement.textContent = \`Time remaining: \${hours}h \${minutes}m \${seconds}s\`;
                                                        }
                                                    };
                                                    
                                                    updateCountdown();
                                                    setInterval(updateCountdown, 1000);
                                                </script>
                                            </head>
                                            <body class="no-select">
                                                <div class="header">
                                                    <strong>${doc.name}</strong>
                                                    <div class="security-badge">READ ONLY</div>
                                                </div>
                                                <div class="expiry-info">
                                                    ⏰ Access expires: ${new Date(granted.expiresAt).toLocaleString()}
                                                    <br>
                                                    <span id="countdown-img-${index}">Calculating time remaining...</span>
                                                </div>
                                                <div class="image-container">
                                                    <img src="${dataUrl}" alt="${doc.name}" draggable="false" />
                                                </div>
                                            </body>
                                        </html>
                                    `);
                                } else {
                                    // For other files, show read-only message
                                    newWindow.document.write(`
                                        <html>
                                            <head>
                                                <title>${doc.name} - Read Only</title>
                                                <style>
                                                    body { margin: 0; padding: 40px; text-align: center; background: #f0f0f0; font-family: Arial, sans-serif; }
                                                    .container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
                                                    .security-badge { background: #e74c3c; color: white; padding: 8px 16px; border-radius: 4px; font-size: 14px; display: inline-block; margin-bottom: 20px; }
                                                    .expiry-info { background: #34495e; color: #ecf0f1; padding: 10px; border-radius: 4px; margin-top: 20px; }
                                                </style>
                                            </head>
                                            <body>
                                                <div class="container">
                                                    <div class="security-badge">READ ONLY ACCESS</div>
                                                    <h2>${doc.name}</h2>
                                                    <p>This file type cannot be displayed in read-only mode.</p>
                                                    <p>Contact the patient for proper access to this document.</p>
                                                    <div class="expiry-info">
                                                        ⏰ Access expires: ${new Date(granted.expiresAt).toLocaleString()}
                                                    </div>
                                                </div>
                                            </body>
                                        </html>
                                    `);
                                }
                                newWindow.document.close();
                            } else {
                                // Popup blocked - show error message
                                toast({
                                    variant: 'destructive',
                                    title: 'Popup Blocked',
                                    description: 'Please allow popups for this site to view documents securely.'
                                });
                            }
                        }, index * 100); // Small delay between opening multiple tabs
                    } catch (error) {
                        console.error(`Error opening document ${doc.name}:`, error);
                    }
                } else {
                    console.warn(`Document ${doc.name} has no dataUri`);
                    toast({
                        variant: 'destructive',
                        title: 'Document Error',
                        description: `Document "${doc.name}" could not be opened. File data is missing.`
                    });
                }
            });

            toast({ 
                title: 'Documents Opened', 
                description: `Opened ${validatedDocs.length} document(s) in new tabs.` 
            });
        } catch (error) {
            console.error('Error viewing files:', error);
            toast({ 
                variant: 'destructive', 
                title: 'Error', 
                description: 'Failed to load patient documents.' 
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Request Access Section */}
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Send className="h-5 w-5 text-primary" />
                        Request Document Access
                    </CardTitle>
                    <CardDescription>
                        Send a request to a patient to view their health documents
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <Input
                                placeholder="Enter patient wallet address (0x...)"
                                value={patientWallet}
                                onChange={(e) => setPatientWallet(e.target.value)}
                                className="font-mono h-10"
                            />
                        </div>
                        <Button 
                            onClick={handleRequestAccess} 
                            disabled={!patientWallet.trim() || isRequesting}
                            className="h-10 px-6"
                        >
                            {isRequesting ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Send className="h-4 w-4 mr-2" />
                            )}
                            Send Request
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Access Requests Status */}
            <Card>
                <CardHeader className="pb-4 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <FileText className="h-5 w-5 text-primary" />
                            Access Requests
                        </CardTitle>
                        <CardDescription>
                            Track your document access requests and view approved files
                        </CardDescription>
                    </div>
                     <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={loadRequests} disabled={isLoadingRequests}>
                                <RefreshCw className={`h-4 w-4 ${isLoadingRequests ? 'animate-spin' : ''}`} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Refresh Requests</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                </CardHeader>
                <CardContent>
                    {isLoadingRequests ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <span className="ml-2 text-muted-foreground">Loading...</span>
                        </div>
                    ) : accessRequests.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                            <p className="text-muted-foreground">No requests yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {accessRequests.map((request) => (
                                <Card key={request.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="space-y-3">
                                            {/* Header with status */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(request.status)}
                                                    <Badge variant={getStatusBadgeVariant(request.status)} className="text-xs">
                                                        {request.status}
                                                    </Badge>
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(request.requestDate).toLocaleDateString()}
                                                </span>
                                            </div>

                                            {/* Patient info */}
                                            <div className="space-y-1">
                                                <h3 className="font-semibold text-base">
                                                    {patientNames[request.patientId] || 'Loading...'}
                                                </h3>
                                                <p className="text-sm text-muted-foreground font-mono">
                                                    {formatWalletAddress(request.patientId)}
                                                </p>
                                            </div>

                                            {/* Action button */}
                                            {request.status === 'approved' && !expiredRequests.has(request.id) && (
                                                <Button
                                                    onClick={() => handleViewFiles(request.patientId)}
                                                    className="w-full gap-2"
                                                    size="sm"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    View Documents
                                                </Button>
                                            )}

                                            {/* Expired state */}
                                            {request.status === 'approved' && expiredRequests.has(request.id) && (
                                                <div className="w-full text-center py-2 px-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md text-sm font-medium">
                                                    Expired
                                                </div>
                                            )}

                                            {/* Status-specific messages */}
                                            {request.status === 'pending' && (
                                                <div className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/20 px-2 py-1 rounded">
                                                    Waiting for patient approval
                                                </div>
                                            )}
                                            {request.status === 'denied' && (
                                                <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-2 py-1 rounded">
                                                    Access denied by patient
                                                </div>
                                            )}
                                            {request.status === 'approved' && expiredRequests.has(request.id) && (
                                                <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/20 px-2 py-1 rounded">
                                                    Access has expired
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default SharedDocuments;

    