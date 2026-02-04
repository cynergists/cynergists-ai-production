import { LeadCaptureForm } from '@/components/partner/LeadCaptureForm';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import {
    buildAttributionData,
    hasAttribution,
    storeAttribution,
} from '@/utils/partnerAttribution';
import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    Calendar,
    CheckCircle2,
    Loader2,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

interface PartnerInfo {
    id: string;
    first_name: string | null;
    last_name: string | null;
    company_name: string | null;
    slug: string;
}

export default function PartnerLanding({ slug }: { slug: string }) {
    const [partner, setPartner] = useState<PartnerInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchPartnerAndTrack() {
            if (!slug) {
                setError('Invalid partner link');
                setIsLoading(false);
                return;
            }

            try {
                const { data, error: fetchError } = await supabase
                    .from('partners')
                    .select('id, first_name, last_name, company_name, slug')
                    .eq('slug', slug)
                    .in('partner_status', ['pending', 'active'])
                    .maybeSingle();

                if (fetchError) throw fetchError;

                if (!data) {
                    setError('Partner not found');
                    setIsLoading(false);
                    return;
                }

                setPartner(data);

                // Store attribution data
                const attributionData = buildAttributionData(
                    data.id,
                    data.slug,
                );
                storeAttribution(attributionData);

                // Track landing view
                const attributionStatus = hasAttribution();
                await supabase.functions.invoke('track-attribution', {
                    body: {
                        event_type: 'landing_view',
                        partner_id: data.id,
                        partner_slug: data.slug,
                        ...attributionData,
                        cookie_present: attributionStatus.cookie,
                        local_storage_present: attributionStatus.localStorage,
                    },
                });
            } catch (err) {
                console.error('Error fetching partner:', err);
                setError('Unable to load partner information');
            } finally {
                setIsLoading(false);
            }
        }

        fetchPartnerAndTrack();
    }, [slug]);

    const partnerName = partner
        ? [partner.first_name, partner.last_name].filter(Boolean).join(' ') ||
          partner.company_name ||
          'Partner'
        : 'Partner';

    // Build book a call URL with attribution params
    const buildBookingUrl = () => {
        const params = new URLSearchParams(window.location.search);
        params.set('ref', slug || '');
        return `/schedule?${params.toString()}`;
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !partner) {
        return (
            <>
                <Helmet>
                    <title>Partner Not Found | Cynergists</title>
                </Helmet>
                <div className="flex min-h-screen items-center justify-center bg-background">
                    <Card className="mx-4 w-full max-w-md">
                        <CardHeader className="text-center">
                            <CardTitle>Partner Not Found</CardTitle>
                            <CardDescription>
                                {error ||
                                    'This partner link is invalid or the partner is no longer active.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <Button asChild>
                                <Link href="/">Go to Homepage</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    }

    return (
        <>
            <Helmet>
                <title>Referred by {partnerName} | Cynergists</title>
                <meta
                    name="description"
                    content={`You've been referred by ${partnerName}. Schedule a call to learn how Cynergists can help your business.`}
                />
            </Helmet>

            <div className="min-h-screen bg-background">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16 md:py-24">
                    <div className="container mx-auto px-4">
                        <div className="grid items-start gap-12 lg:grid-cols-2">
                            {/* Left: Content */}
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Referred by {partnerName}
                                </div>

                                <h1 className="text-4xl leading-tight font-bold md:text-5xl lg:text-6xl">
                                    143: Scale Your Business with 144:{' '}
                                    <span className="text-primary">
                                        AI Agents
                                    </span>
                                    145:{' '}
                                </h1>

                                <p className="max-w-xl text-lg text-muted-foreground md:text-xl">
                                    Get AI agents that take ownership of
                                    revenue, operations, and internal workflows
                                    tailored to your business needs. Stop
                                    struggling with manual work and start
                                    scaling.
                                </p>

                                <div className="flex flex-col gap-4 sm:flex-row">
                                    <Button
                                        size="lg"
                                        asChild
                                        className="text-lg"
                                    >
                                        <Link href={buildBookingUrl()}>
                                            <Calendar className="mr-2 h-5 w-5" />
                                            Book a Free Call
                                        </Link>
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        asChild
                                        className="text-lg"
                                    >
                                        <a href="#lead-form">
                                            Learn More
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </a>
                                    </Button>
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-3 gap-4 border-t border-border/50 pt-8">
                                    <div>
                                        <div className="text-2xl font-bold text-primary md:text-3xl">
                                            500+
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Clients Served
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-primary md:text-3xl">
                                            40%
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Avg. Cost Savings
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-primary md:text-3xl">
                                            24hr
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Response Time
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Lead Form */}
                            <div id="lead-form" className="lg:sticky lg:top-8">
                                <LeadCaptureForm
                                    partnerId={partner.id}
                                    partnerSlug={partner.slug}
                                    partnerName={partnerName}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Services Section */}
                <section className="bg-muted/30 py-16 md:py-24">
                    <div className="container mx-auto px-4">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                                How We Help You Scale
                            </h2>
                            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                                Our comprehensive suite of services addresses
                                every operational challenge your business faces.
                            </p>
                        </div>

                        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
                            <Card className="border-none shadow-lg">
                                <CardHeader className="text-center">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                                        <TrendingUp className="h-7 w-7 text-primary" />
                                    </div>
                                    <CardTitle>Revenue Agents</CardTitle>
                                    <CardDescription className="text-base">
                                        AI agents that handle lead
                                        qualification, follow-ups, and sales
                                        support to drive consistent revenue
                                        growth.
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card className="border-none shadow-lg">
                                <CardHeader className="text-center">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                                        <Zap className="h-7 w-7 text-primary" />
                                    </div>
                                    <CardTitle>Operations Agents</CardTitle>
                                    <CardDescription className="text-base">
                                        Eliminate manual work and reduce errors
                                        with intelligent automation. AI agents
                                        that handle scheduling, data entry, and
                                        workflows.
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card className="border-none shadow-lg">
                                <CardHeader className="text-center">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                                        <Users className="h-7 w-7 text-primary" />
                                    </div>
                                    <CardTitle>Support Agents</CardTitle>
                                    <CardDescription className="text-base">
                                        24/7 customer support and internal
                                        assistance. AI agents that respond
                                        instantly and never take time off.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16 md:py-24">
                    <div className="container mx-auto px-4">
                        <Card className="overflow-hidden border-none bg-primary text-primary-foreground">
                            <CardContent className="p-8 text-center md:p-12">
                                <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                                    Ready to Transform Your Operations?
                                </h2>
                                <p className="mx-auto mb-8 max-w-2xl text-lg opacity-90">
                                    Join hundreds of businesses that have
                                    streamlined their operations with
                                    Cynergists. Book a free strategy call today.
                                </p>
                                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                                    <Button
                                        size="lg"
                                        variant="secondary"
                                        asChild
                                        className="text-lg"
                                    >
                                        <Link href={buildBookingUrl()}>
                                            <Calendar className="mr-2 h-5 w-5" />
                                            Schedule Your Free Call
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Trust Section */}
                <section className="border-t py-16">
                    <div className="container mx-auto px-4 text-center">
                        <p className="mb-8 text-sm text-muted-foreground">
                            Trusted by leading companies
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 md:gap-12">
                            {/* Logo placeholders */}
                            <div className="h-8 w-24 rounded bg-muted" />
                            <div className="h-8 w-28 rounded bg-muted" />
                            <div className="h-8 w-20 rounded bg-muted" />
                            <div className="h-8 w-24 rounded bg-muted" />
                            <div className="h-8 w-28 rounded bg-muted" />
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t bg-muted/30 py-8">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                            <p className="text-sm text-muted-foreground">
                                © {new Date().getFullYear()} Cynergists. All
                                rights reserved.
                            </p>
                            <div className="flex gap-6 text-sm text-muted-foreground">
                                <Link
                                    href="/privacy"
                                    className="transition-colors hover:text-foreground"
                                >
                                    Privacy
                                </Link>
                                <Link
                                    href="/terms"
                                    className="transition-colors hover:text-foreground"
                                >
                                    Terms
                                </Link>
                                <Link
                                    href="/contact"
                                    className="transition-colors hover:text-foreground"
                                >
                                    Contact
                                </Link>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
