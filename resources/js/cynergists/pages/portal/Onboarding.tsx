import cynergistsLogo from '@/assets/logos/cynergists-ai-full.webp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { useCurrentUserTenant } from '@/hooks/useTenant';
import { apiClient } from '@/lib/api-client';
import { router } from '@inertiajs/react';
import { AlertCircle, Check, Loader2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 30);
}

export default function PortalOnboarding() {
    const { toast } = useToast();
    const { data: tenant, isLoading: tenantLoading } = useCurrentUserTenant();

    const [subdomain, setSubdomain] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [availabilityMessage, setAvailabilityMessage] = useState('');
    const [isClaiming, setIsClaiming] = useState(false);

    const debouncedSubdomain = useDebounce(subdomain, 500);

    // Pre-fill with slugified company name
    useEffect(() => {
        if (tenant?.company_name && !subdomain) {
            const suggested = slugify(tenant.company_name);
            if (suggested.length >= 3) {
                setSubdomain(suggested);
            }
        }
    }, [tenant?.company_name, subdomain]);

    // Redirect if onboarding already completed
    useEffect(() => {
        if (tenant && !tenant.is_temp_subdomain) {
            router.visit('/portal');
        }
    }, [tenant]);

    // Check availability when subdomain changes
    const checkAvailability = useCallback(async (value: string) => {
        if (value.length < 3) {
            setIsAvailable(null);
            setAvailabilityMessage('Minimum 3 characters');
            return;
        }

        setIsChecking(true);
        try {
            const data = await apiClient.post<{
                available: boolean;
                reason: string | null;
                message: string;
            }>('/api/portal/tenant/check-subdomain', { subdomain: value });

            setIsAvailable(data.available);
            if (data.available) {
                setAvailabilityMessage('Available!');
            } else if (data.reason === 'invalid_format') {
                setAvailabilityMessage(data.message || 'Invalid format');
            } else {
                setAvailabilityMessage('Already taken');
            }
        } catch (error) {
            console.error('Error checking subdomain:', error);
            setIsAvailable(null);
            setAvailabilityMessage('Error checking availability');
        } finally {
            setIsChecking(false);
        }
    }, []);

    useEffect(() => {
        if (debouncedSubdomain) {
            checkAvailability(debouncedSubdomain);
        } else {
            setIsAvailable(null);
            setAvailabilityMessage('');
        }
    }, [debouncedSubdomain, checkAvailability]);

    const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setSubdomain(value);
        setIsAvailable(null);
        setAvailabilityMessage('');
    };

    const handleClaim = async () => {
        if (!isAvailable || isClaiming) return;

        setIsClaiming(true);
        try {
            const data = await apiClient.post<{
                success: boolean;
                error?: string;
            }>('/api/portal/tenant/claim-subdomain', { subdomain });

            if (data.success) {
                toast({
                    title: 'Portal address claimed!',
                    description: `Your portal is now at ${subdomain}.cynergists.com`,
                });

                // In production, would redirect to subdomain
                // For now, redirect to portal
                router.visit('/portal');
                router.visit('/portal');
            } else {
                throw new Error(data.error || 'Failed to claim subdomain');
            }
        } catch (error) {
            console.error('Error claiming subdomain:', error);
            toast({
                title: 'Failed to claim address',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsClaiming(false);
        }
    };

    if (tenantLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Choose Your Portal Address | Cynergists</title>
            </Helmet>

            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl">
                    {/* Logo */}
                    <div className="mb-6 flex justify-center">
                        <img
                            src={cynergistsLogo}
                            alt="Cynergists"
                            className="h-10 w-auto"
                        />
                    </div>

                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="mb-2 text-2xl font-bold text-foreground">
                            Choose Your Portal Address
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Your team will access your portal at this address
                        </p>
                    </div>

                    {/* Subdomain Input */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="subdomain">Portal Address</Label>
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        id="subdomain"
                                        value={subdomain}
                                        onChange={handleSubdomainChange}
                                        placeholder="your-company"
                                        className="border-border bg-input pr-10"
                                        maxLength={30}
                                    />
                                    <div className="absolute top-1/2 right-3 -translate-y-1/2">
                                        {isChecking ? (
                                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        ) : isAvailable === true ? (
                                            <Check className="h-4 w-4 text-green-500" />
                                        ) : isAvailable === false ? (
                                            <X className="h-4 w-4 text-destructive" />
                                        ) : null}
                                    </div>
                                </div>
                                <span className="text-sm whitespace-nowrap text-muted-foreground">
                                    .cynergists.com
                                </span>
                            </div>
                            {availabilityMessage && (
                                <p
                                    className={`text-xs ${isAvailable ? 'text-green-500' : isAvailable === false ? 'text-destructive' : 'text-muted-foreground'}`}
                                >
                                    {availabilityMessage}
                                </p>
                            )}
                        </div>

                        <Button
                            onClick={handleClaim}
                            disabled={!isAvailable || isClaiming}
                            className="w-full bg-primary py-3 font-semibold text-primary-foreground hover:bg-primary/90"
                        >
                            {isClaiming ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                'Claim This Address'
                            )}
                        </Button>

                        {/* Tips */}
                        <div className="mt-6 rounded-lg bg-muted p-4">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                <div className="space-y-1 text-xs text-muted-foreground">
                                    <p>
                                        <strong>Tips:</strong>
                                    </p>
                                    <ul className="list-inside list-disc space-y-0.5">
                                        <li>
                                            Use lowercase letters, numbers, and
                                            hyphens
                                        </li>
                                        <li>Keep it short and memorable</li>
                                        <li>This cannot be changed later</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
