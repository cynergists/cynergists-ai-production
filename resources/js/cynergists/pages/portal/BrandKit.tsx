import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { usePortalContext } from '@/contexts/PortalContext';
import { apiClient } from '@/lib/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Loader2, Palette, RotateCcw, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { router } from '@inertiajs/react';

interface BrandKitData {
    brand_kit: {
        primary_color?: string | null;
        secondary_color?: string | null;
        brand_tone?: string | null;
        logo_url?: string | null;
    };
    brand_assets: Array<{
        filename: string;
        path: string;
        type: string;
        uploaded_at: string;
    }>;
}

export default function BrandKit() {
    const { user } = usePortalContext();
    const queryClient = useQueryClient();

    const [primaryColor, setPrimaryColor] = useState('');
    const [secondaryColor, setSecondaryColor] = useState('');
    const [brandTone, setBrandTone] = useState('');
    const [logoUrl, setLogoUrl] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['portal-brand-kit', user?.id],
        queryFn: async () => apiClient.get<BrandKitData>('/api/portal/brand-kit'),
        enabled: Boolean(user?.id),
    });

    useEffect(() => {
        if (data?.brand_kit) {
            setPrimaryColor(data.brand_kit.primary_color ?? '');
            setSecondaryColor(data.brand_kit.secondary_color ?? '');
            setBrandTone(data.brand_kit.brand_tone ?? '');
            setLogoUrl(data.brand_kit.logo_url ?? '');
        }
    }, [data]);

    const save = useMutation({
        mutationFn: async () =>
            apiClient.put('/api/portal/brand-kit', {
                primary_color: primaryColor || null,
                secondary_color: secondaryColor || null,
                brand_tone: brandTone || null,
                logo_url: logoUrl || null,
            }),
        onSuccess: () => {
            toast.success('Brand Kit saved.');
            queryClient.invalidateQueries({ queryKey: ['portal-brand-kit'] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to save Brand Kit.');
        },
    });

    const restart = useMutation({
        mutationFn: async () => apiClient.post('/api/portal/brand-kit/restart'),
        onSuccess: () => {
            toast.success('Brand Kit restarted. You will be redirected to Iris.');
            queryClient.invalidateQueries({ queryKey: ['portal-brand-kit'] });
            queryClient.invalidateQueries({ queryKey: ['portal-stats'] });
            // Redirect to portal to start Iris onboarding
            setTimeout(() => router.visit('/portal'), 1000);
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to restart Brand Kit.');
        },
    });

    const handleRestart = () => {
        restart.mutate();
    };

    return (
        <PortalLayout>
            <div className="mx-auto max-w-2xl space-y-6 p-6">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
                        <Palette className="h-6 w-6 text-primary" />
                        Brand Kit
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Your brand identity used across all AI agents.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Brand Identity</CardTitle>
                        <CardDescription>
                            Colors, tone, and logo used by your AI agents to stay on-brand.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-24 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ) : (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    save.mutate();
                                }}
                                className="space-y-4"
                            >
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="bk-primary-color">Primary Color</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                id="bk-primary-color"
                                                value={primaryColor}
                                                onChange={(e) => setPrimaryColor(e.target.value)}
                                                placeholder="#88CB15"
                                                maxLength={20}
                                            />
                                            {primaryColor && (
                                                <div
                                                    className="h-9 w-9 shrink-0 rounded border border-border"
                                                    style={{ backgroundColor: primaryColor }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="bk-secondary-color">Secondary Color</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                id="bk-secondary-color"
                                                value={secondaryColor}
                                                onChange={(e) => setSecondaryColor(e.target.value)}
                                                placeholder="#1A1A2E"
                                                maxLength={20}
                                            />
                                            {secondaryColor && (
                                                <div
                                                    className="h-9 w-9 shrink-0 rounded border border-border"
                                                    style={{ backgroundColor: secondaryColor }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="bk-brand-tone">Brand Tone</Label>
                                    <Textarea
                                        id="bk-brand-tone"
                                        rows={3}
                                        value={brandTone}
                                        onChange={(e) => setBrandTone(e.target.value)}
                                        placeholder="e.g. Professional, Friendly, Innovative — describe how your brand communicates"
                                        className="resize-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="bk-logo-url">Logo URL</Label>
                                    <Input
                                        id="bk-logo-url"
                                        type="url"
                                        value={logoUrl}
                                        onChange={(e) => setLogoUrl(e.target.value)}
                                        placeholder="https://example.com/logo.png"
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                type="button"
                                                className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
                                            >
                                                <RotateCcw className="h-4 w-4" />
                                                Restart Brand Kit
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className="flex items-center gap-2">
                                                    <AlertTriangle className="h-5 w-5 text-destructive" />
                                                    Restart Brand Kit?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription className="space-y-2 text-left">
                                                    <p>This will:</p>
                                                    <ul className="list-disc space-y-1 pl-5">
                                                        <li>Clear all your Brand Kit information</li>
                                                        <li>Restart Iris onboarding from the beginning</li>
                                                        <li>
                                                            <strong>Lock all agents</strong> until Iris onboarding is
                                                            completed again
                                                        </li>
                                                    </ul>
                                                    <p className="pt-2 font-semibold text-destructive">
                                                        This cannot be undone. Are you absolutely sure?
                                                    </p>
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={handleRestart}
                                                    disabled={restart.isPending}
                                                    className="bg-destructive hover:bg-destructive/90"
                                                >
                                                    {restart.isPending ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Restarting...
                                                        </>
                                                    ) : (
                                                        'Yes, Restart Brand Kit'
                                                    )}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>

                                    <Button type="submit" disabled={save.isPending} className="gap-2">
                                        {save.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        Save Brand Kit
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>

                {(data?.brand_assets?.length ?? 0) > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Brand Assets</CardTitle>
                            <CardDescription>Files uploaded to your brand kit.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {data!.brand_assets.map((asset) => (
                                    <li
                                        key={asset.filename}
                                        className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                                    >
                                        <span className="truncate text-foreground">{asset.filename}</span>
                                        <span className="ml-2 shrink-0 text-xs text-muted-foreground capitalize">
                                            {asset.type.replace('_', ' ')}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}
            </div>
        </PortalLayout>
    );
}
