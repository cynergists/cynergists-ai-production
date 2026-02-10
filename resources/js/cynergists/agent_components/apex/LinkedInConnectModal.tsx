import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface LinkedInConnectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    availableAgentId: string;
    selectedAgentId: string;
}

type ModalStep = 'credentials' | 'connecting' | 'checkpoint' | 'polling' | 'success' | 'error';

export function LinkedInConnectModal({
    open,
    onOpenChange,
    availableAgentId,
    selectedAgentId,
}: LinkedInConnectModalProps) {
    const [step, setStep] = useState<ModalStep>('credentials');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [checkpointCode, setCheckpointCode] = useState('');
    const [checkpointType, setCheckpointType] = useState<string | null>(null);
    const [accountId, setAccountId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const queryClient = useQueryClient();

    const stopPolling = useCallback(() => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
    }, []);

    const resetState = useCallback(() => {
        stopPolling();
        setStep('credentials');
        setUsername('');
        setPassword('');
        setShowPassword(false);
        setCheckpointCode('');
        setCheckpointType(null);
        setAccountId(null);
        setErrorMessage(null);
    }, [stopPolling]);

    const handleComplete = useCallback(() => {
        stopPolling();
        setStep('success');
        toast.success('LinkedIn account connected successfully');
        queryClient.invalidateQueries({
            queryKey: ['agent-details', selectedAgentId],
        });
        setTimeout(() => {
            onOpenChange(false);
        }, 1500);
    }, [stopPolling, queryClient, selectedAgentId, onOpenChange]);

    const pollForStatus = useCallback(
        (pollingAccountId: string) => {
            stopPolling();
            pollIntervalRef.current = setInterval(async () => {
                try {
                    const response = await apiClient.get<{
                        account: { status: string };
                    }>(
                        `/api/apex/linkedin/${pollingAccountId}/status?agent_id=${availableAgentId}`,
                    );

                    if (response.account.status === 'active') {
                        handleComplete();
                    }
                } catch {
                    // Continue polling
                }
            }, 3000);
        },
        [stopPolling, availableAgentId, handleComplete],
    );

    // Reset when modal closes
    useEffect(() => {
        if (!open) {
            resetState();
        }
    }, [open, resetState]);

    // Cleanup on unmount
    useEffect(() => {
        return () => stopPolling();
    }, [stopPolling]);

    const handleSubmitCredentials = async (e: React.FormEvent) => {
        e.preventDefault();
        setStep('connecting');
        setErrorMessage(null);

        try {
            const response = await apiClient.post<{
                account: { id: string; status: string };
                requires_checkpoint: boolean;
                checkpoint_type: string | null;
            }>('/api/apex/linkedin/connect-credentials', {
                username,
                password,
                agent_id: availableAgentId,
            });

            setAccountId(response.account.id);

            if (response.account.status === 'active') {
                handleComplete();
            } else if (response.requires_checkpoint) {
                setCheckpointType(response.checkpoint_type);
                setStep('checkpoint');
            } else {
                // Account is pending — poll for status
                setStep('polling');
                pollForStatus(response.account.id);
            }
        } catch (error: any) {
            setErrorMessage(
                error?.message || 'Failed to connect. Please check your credentials.',
            );
            setStep('error');
        }
    };

    const handleSubmitCheckpoint = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accountId) return;

        setStep('connecting');

        try {
            const response = await apiClient.post<{
                success: boolean;
                account: { id: string; status: string };
            }>(`/api/apex/linkedin/${accountId}/checkpoint`, {
                code: checkpointCode,
                agent_id: availableAgentId,
            });

            if (response.account.status === 'active') {
                handleComplete();
            } else {
                setStep('polling');
                pollForStatus(accountId);
            }
        } catch (error: any) {
            setErrorMessage(
                error?.message || 'Verification failed. Please try again.',
            );
            setStep('error');
        }
    };

    const checkpointLabel =
        checkpointType === 'IN_APP_VALIDATION'
            ? 'Check your LinkedIn mobile app and approve the sign-in request.'
            : 'Enter the verification code sent to your email or phone.';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <svg
                            className="h-5 w-5 text-[#0A66C2]"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                        Connect LinkedIn
                    </DialogTitle>
                    <DialogDescription>
                        Sign in to your LinkedIn account to enable outreach
                        campaigns.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-2">
                    {/* Credentials Form */}
                    {step === 'credentials' && (
                        <form onSubmit={handleSubmitCredentials} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="linkedin-email">Email or Phone</Label>
                                <Input
                                    id="linkedin-email"
                                    type="text"
                                    placeholder="your@email.com"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="linkedin-password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="linkedin-password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Your LinkedIn password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Your credentials are sent securely and are not stored
                                on our servers.
                            </p>
                            <Button
                                type="submit"
                                className="w-full bg-[#0A66C2] hover:bg-[#004182]"
                                disabled={!username || !password}
                            >
                                Sign In to LinkedIn
                            </Button>
                        </form>
                    )}

                    {/* Connecting / Processing */}
                    {step === 'connecting' && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-[#0A66C2]" />
                            <p className="mt-3 text-sm text-muted-foreground">
                                Connecting to LinkedIn...
                            </p>
                        </div>
                    )}

                    {/* Checkpoint / 2FA */}
                    {step === 'checkpoint' && (
                        <form onSubmit={handleSubmitCheckpoint} className="space-y-4">
                            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
                                <p className="text-sm text-foreground">
                                    {checkpointLabel}
                                </p>
                            </div>
                            {checkpointType !== 'IN_APP_VALIDATION' && (
                                <div className="space-y-2">
                                    <Label htmlFor="checkpoint-code">Verification Code</Label>
                                    <Input
                                        id="checkpoint-code"
                                        type="text"
                                        placeholder="Enter code"
                                        value={checkpointCode}
                                        onChange={(e) => setCheckpointCode(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>
                            )}
                            <div className="flex gap-2">
                                {checkpointType === 'IN_APP_VALIDATION' ? (
                                    <Button
                                        type="button"
                                        className="w-full"
                                        onClick={() => {
                                            if (accountId) {
                                                setStep('polling');
                                                pollForStatus(accountId);
                                            }
                                        }}
                                    >
                                        I've Approved It
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        className="w-full bg-[#0A66C2] hover:bg-[#004182]"
                                        disabled={!checkpointCode}
                                    >
                                        Verify
                                    </Button>
                                )}
                            </div>
                        </form>
                    )}

                    {/* Polling for status */}
                    {step === 'polling' && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-[#0A66C2]" />
                            <p className="mt-3 text-sm text-muted-foreground">
                                Verifying your LinkedIn connection...
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                This may take a moment.
                            </p>
                        </div>
                    )}

                    {/* Success */}
                    {step === 'success' && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                <svg
                                    className="h-6 w-6 text-green-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <p className="mt-3 text-sm font-medium text-foreground">
                                LinkedIn connected successfully!
                            </p>
                        </div>
                    )}

                    {/* Error */}
                    {step === 'error' && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                <svg
                                    className="h-6 w-6 text-red-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </div>
                            <p className="mt-3 text-sm text-foreground">
                                {errorMessage}
                            </p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={resetState}
                            >
                                Try Again
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
