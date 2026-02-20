import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Circle, Loader2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface OnboardingStep {
    id: string;
    label: string;
    completed: boolean;
}

interface OnboardingViewProps {
    agentDetails: any;
    setupProgress: {
        completed: number;
        total: number;
        steps: OnboardingStep[];
    };
}

export function OnboardingView({ agentDetails, setupProgress }: OnboardingViewProps) {
    const queryClient = useQueryClient();
    const tenantData = agentDetails?.tenant_data;
    const settings = tenantData?.settings ?? {};

    const [companyName, setCompanyName] = useState(tenantData?.company_name ?? '');
    const [website, setWebsite] = useState(settings.website ?? '');
    const [industry, setIndustry] = useState(settings.industry ?? '');
    const [businessDescription, setBusinessDescription] = useState(
        settings.business_description ?? '',
    );
    const [servicesNeeded, setServicesNeeded] = useState(settings.services_needed ?? '');
    const [brandTone, setBrandTone] = useState(settings.brand_tone ?? '');
    const [brandColors, setBrandColors] = useState(settings.brand_colors ?? '');

    useEffect(() => {
        if (tenantData) {
            setCompanyName(tenantData.company_name ?? '');
            setWebsite(settings.website ?? '');
            setIndustry(settings.industry ?? '');
            setBusinessDescription(settings.business_description ?? '');
            setServicesNeeded(settings.services_needed ?? '');
            setBrandTone(settings.brand_tone ?? '');
            setBrandColors(settings.brand_colors ?? '');
        }
    }, [agentDetails]);

    const save = useMutation({
        mutationFn: async () =>
            apiClient.put('/api/portal/tenant', {
                company_name: companyName,
                settings: {
                    website,
                    industry,
                    business_description: businessDescription,
                    services_needed: servicesNeeded,
                    brand_tone: brandTone,
                    brand_colors: brandColors,
                },
            }),
        onSuccess: () => {
            toast.success('Onboarding information saved.');
            queryClient.invalidateQueries({ queryKey: ['agent-details'] });
            queryClient.invalidateQueries({ queryKey: ['portal-stats'] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to save.');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        save.mutate();
    };

    const progressPercent =
        setupProgress.total > 0
            ? Math.round((setupProgress.completed / setupProgress.total) * 100)
            : 0;

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="shrink-0 border-b border-primary/20 px-6 py-4">
                <h2 className="text-lg font-semibold text-foreground">Onboarding</h2>
                <p className="text-sm text-muted-foreground">
                    Your company information used by all AI agents.
                </p>
                <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Setup progress</span>
                        <span>{progressPercent}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                        {setupProgress.steps.map((step) => (
                            <div
                                key={step.id}
                                className="flex items-center gap-1 text-xs text-muted-foreground"
                            >
                                {step.completed ? (
                                    <CheckCircle2 className="h-3 w-3 text-primary" />
                                ) : (
                                    <Circle className="h-3 w-3" />
                                )}
                                {step.label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="ob-company-name">Company Name</Label>
                            <Input
                                id="ob-company-name"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="Acme Inc."
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="ob-website">Website</Label>
                            <Input
                                id="ob-website"
                                type="url"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                placeholder="https://example.com"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="ob-industry">Industry</Label>
                            <Input
                                id="ob-industry"
                                value={industry}
                                onChange={(e) => setIndustry(e.target.value)}
                                placeholder="e.g. SaaS, E-Commerce"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="ob-brand-tone">Brand Tone</Label>
                            <Input
                                id="ob-brand-tone"
                                value={brandTone}
                                onChange={(e) => setBrandTone(e.target.value)}
                                placeholder="e.g. Professional, Friendly"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="ob-description">Business Description</Label>
                        <Textarea
                            id="ob-description"
                            rows={3}
                            value={businessDescription}
                            onChange={(e) => setBusinessDescription(e.target.value)}
                            placeholder="Briefly describe what your business does..."
                            className="resize-none"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="ob-services">Services / Products Needed</Label>
                        <Textarea
                            id="ob-services"
                            rows={2}
                            value={servicesNeeded}
                            onChange={(e) => setServicesNeeded(e.target.value)}
                            placeholder="e.g. SEO, social media management, content creation"
                            className="resize-none"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="ob-brand-colors">Brand Colors</Label>
                        <Input
                            id="ob-brand-colors"
                            value={brandColors}
                            onChange={(e) => setBrandColors(e.target.value)}
                            placeholder="e.g. #88CB15, #1A1A2E"
                        />
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={save.isPending} className="gap-2">
                            {save.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
