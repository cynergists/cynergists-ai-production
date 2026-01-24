import { useEffect, useState } from "react";
import { Link } from "@inertiajs/react";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Loader2, ArrowRight, CheckCircle2, Users, Zap, TrendingUp } from "lucide-react";
import { LeadCaptureForm } from "@/components/partner/LeadCaptureForm";
import { storeAttribution, buildAttributionData, hasAttribution } from "@/utils/partnerAttribution";

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
        setError("Invalid partner link");
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
          setError("Partner not found");
          setIsLoading(false);
          return;
        }

        setPartner(data);

        // Store attribution data
        const attributionData = buildAttributionData(data.id, data.slug);
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
        setError("Unable to load partner information");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPartnerAndTrack();
  }, [slug]);

  const partnerName = partner
    ? [partner.first_name, partner.last_name].filter(Boolean).join(' ') || partner.company_name || 'Partner'
    : 'Partner';

  // Build book a call URL with attribution params
  const buildBookingUrl = () => {
    const params = new URLSearchParams(window.location.search);
    params.set('ref', slug || '');
    return `/schedule?${params.toString()}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
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
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Card className="max-w-md w-full mx-4">
            <CardHeader className="text-center">
              <CardTitle>Partner Not Found</CardTitle>
              <CardDescription>
                {error || "This partner link is invalid or the partner is no longer active."}
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
        <meta name="description" content={`You've been referred by ${partnerName}. Schedule a call to learn how Cynergists can help your business.`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left: Content */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  Referred by {partnerName}
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
143:                   Scale Your Business with{" "}
144:                   <span className="text-primary">AI Agents</span>
145:                 </h1>

                <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
                  Get AI agents that take ownership of revenue, operations, and internal workflows 
                  tailored to your business needs. Stop struggling with manual work and start scaling.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" asChild className="text-lg">
                    <Link href={buildBookingUrl()}>
                      <Calendar className="mr-2 h-5 w-5" />
                      Book a Free Call
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="text-lg">
                    <a href="#lead-form">
                      Learn More
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                  </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border/50">
                  <div>
                    <div className="text-2xl md:text-3xl font-bold text-primary">500+</div>
                    <div className="text-sm text-muted-foreground">Clients Served</div>
                  </div>
                  <div>
                    <div className="text-2xl md:text-3xl font-bold text-primary">40%</div>
                    <div className="text-sm text-muted-foreground">Avg. Cost Savings</div>
                  </div>
                  <div>
                    <div className="text-2xl md:text-3xl font-bold text-primary">24hr</div>
                    <div className="text-sm text-muted-foreground">Response Time</div>
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
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How We Help You Scale</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our comprehensive suite of services addresses every operational challenge your business faces.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="border-none shadow-lg">
                <CardHeader className="text-center">
                  <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <TrendingUp className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle>Revenue Agents</CardTitle>
                  <CardDescription className="text-base">
                    AI agents that handle lead qualification, follow-ups, and sales support 
                    to drive consistent revenue growth.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-none shadow-lg">
                <CardHeader className="text-center">
                  <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Zap className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle>Operations Agents</CardTitle>
                  <CardDescription className="text-base">
                    Eliminate manual work and reduce errors with intelligent automation. 
                    AI agents that handle scheduling, data entry, and workflows.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-none shadow-lg">
                <CardHeader className="text-center">
                  <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Users className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle>Support Agents</CardTitle>
                  <CardDescription className="text-base">
                    24/7 customer support and internal assistance. 
                    AI agents that respond instantly and never take time off.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <Card className="bg-primary text-primary-foreground border-none overflow-hidden">
              <CardContent className="p-8 md:p-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to Transform Your Operations?
                </h2>
                <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
                  Join hundreds of businesses that have streamlined their operations with Cynergists. 
                  Book a free strategy call today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
        <section className="py-16 border-t">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground mb-8">Trusted by leading companies</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
              {/* Logo placeholders */}
              <div className="h-8 w-24 bg-muted rounded" />
              <div className="h-8 w-28 bg-muted rounded" />
              <div className="h-8 w-20 bg-muted rounded" />
              <div className="h-8 w-24 bg-muted rounded" />
              <div className="h-8 w-28 bg-muted rounded" />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Cynergists. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm text-muted-foreground">
                <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
                <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
