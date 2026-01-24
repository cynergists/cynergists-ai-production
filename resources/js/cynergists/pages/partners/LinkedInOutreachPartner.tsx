import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link, router } from "@inertiajs/react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { OrbitingButton } from "@/components/ui/orbiting-button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Check,
  Users,
  TrendingUp,
  DollarSign,
  Zap,
  Target,
  MessageSquare,
  BarChart3,
  ShoppingCart,
  ArrowRight,
  Percent,
  Loader2,
} from "lucide-react";

const PARTNER_PRODUCT = {
  id: "partner-linkedin-outreach",
  type: "product" as const,
  name: "Partner Package: LinkedIn Outreach",
  description: "AI-powered LinkedIn lead generation and outreach automation",
  price: 189,
  billingPeriod: "monthly" as const,
  metadata: { isPartnerPackage: true },
};

const LinkedInOutreachPartner = () => {
  const { toast } = useToast();
  const [isPartner, setIsPartner] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkPartnerStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: hasPartnerRole } = await supabase.rpc('has_role', {
            _user_id: session.user.id,
            _role: 'partner'
          });
          setIsPartner(!!hasPartnerRole);
        }
      } catch (error) {
        console.error("Error checking partner status:", error);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkPartnerStatus();
  }, []);

  const handleGetPartnerPricing = () => {
    // Navigate to standalone partner checkout
    router.visit("/partner/linkedin-outreach/checkout");
  };

  const features = [
    {
      icon: Target,
      title: "AI-Powered Targeting",
      description: "Smart algorithms identify and prioritize your ideal prospects on LinkedIn",
    },
    {
      icon: MessageSquare,
      title: "Personalized Outreach",
      description: "Automated yet personalized connection requests and follow-up sequences",
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Track connection rates, response rates, and pipeline growth in real-time",
    },
    {
      icon: Zap,
      title: "Done-For-You Setup",
      description: "We handle all configuration, targeting, and messaging optimization",
    },
  ];

  const partnerBenefits = [
    "Earn 20% residual commissions on every referral",
    "Commissions paid monthly for as long as the client stays active",
    "No caps or expiration on your earnings",
    "White-label friendly for your agency clients",
    "Dedicated partner support and resources",
    "Co-branded marketing materials available",
  ];

  return (
    <Layout>
      <Helmet>
        <title>Partner Pricing: LinkedIn Outreach | Cynergists</title>
        <meta
          name="description"
          content="Exclusive partner pricing on LinkedIn Outreach automation. Get $208 off retail pricing and earn 20% residual commissions on every referral."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="outline" className="mb-6 text-primary border-primary/50">
                <Percent className="h-3 w-3 mr-1" />
                Exclusive Partner Pricing
              </Badge>
              
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                LinkedIn Outreach <span className="text-gradient">Partner Package</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Offer your clients a battle-tested lead generation system at exclusive partner rates—and earn 
                <span className="text-primary font-semibold"> 20% residual commissions</span> on every referral.
              </p>

              {/* Pricing Card */}
              <div className="card-glass p-8 max-w-lg mx-auto mb-8">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground line-through">$397/mo</p>
                    <p className="text-xs text-muted-foreground">Retail Price</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-primary" />
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary">$189<span className="text-lg">/mo</span></p>
                    <p className="text-xs text-primary">Partner Price</p>
                  </div>
                </div>
                
                <div className="bg-primary/10 rounded-lg p-3 mb-6">
                  <p className="text-sm font-medium text-primary">
                    You save $208/month — that's over $2,400/year!
                  </p>
                </div>

                {checkingAuth ? (
                  <Button className="btn-primary w-full" disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </Button>
                ) : isPartner ? (
                  <OrbitingButton className="btn-primary w-full" onClick={handleGetPartnerPricing}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Get Partner Pricing
                  </OrbitingButton>
                ) : (
                  <>
                    <OrbitingButton className="btn-primary w-full" asChild>
                      <Link href="/signup/partner">
                        <Users className="mr-2 h-4 w-4" />
                        Become a Partner
                      </Link>
                    </OrbitingButton>
                    <p className="text-xs text-muted-foreground mt-3">
                      Already a partner? <Link href="/signin" className="text-primary hover:underline">Sign in</Link> to access your pricing.
                    </p>
                  </>
                )}
                
                <p className="text-xs text-muted-foreground mt-3">
                  Monthly subscription • Cancel anytime
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">
                What's <span className="text-gradient">Included</span>
              </h2>
              <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
                A complete LinkedIn lead generation system, fully managed by our team.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="card-glass p-6 flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Partner Commission Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <Badge variant="outline" className="mb-4 text-primary border-primary/50">
                    <DollarSign className="h-3 w-3 mr-1" />
                    Partner Commissions
                  </Badge>
                  
                  <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                    Offer This to Your Clients. <span className="text-gradient">Earn 20% Residual.</span>
                  </h2>
                  
                  <p className="text-muted-foreground mb-6">
                    As a Cynergists partner, you're not just getting discounted pricing for yourself—you can refer 
                    this service to your clients and earn recurring commissions for as long as they stay active.
                  </p>

                  <div className="card-glass p-6 mb-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                        <TrendingUp className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-primary">$79.40</p>
                        <p className="text-sm text-muted-foreground">Monthly commission per referral</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Based on $397 retail price × 20% commission = $79.40/month recurring
                    </p>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Example:</strong> Refer just 5 clients and earn $397/month in passive income. 
                    That's $4,764/year from a handful of referrals.
                  </p>
                </div>

                <div className="card-glass p-8">
                  <h3 className="font-semibold text-xl mb-6 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Partner Benefits
                  </h3>
                  
                  <ul className="space-y-4">
                    {partnerBenefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 pt-6 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-4">
                      Not a partner yet? Join our program to unlock exclusive pricing and commissions.
                    </p>
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/signup/partner">
                        Join Partner Program
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-muted-foreground mb-8">
                Lock in your exclusive partner pricing today. Start generating leads for yourself 
                or offer this proven system to your clients.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isPartner ? (
                  <OrbitingButton className="btn-primary px-10" onClick={handleGetPartnerPricing}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Get Partner Pricing — $189/mo
                  </OrbitingButton>
                ) : (
                  <OrbitingButton className="btn-primary px-10" asChild>
                    <Link href="/signup/partner">
                      <Users className="mr-2 h-4 w-4" />
                      Become a Partner
                    </Link>
                  </OrbitingButton>
                )}
                <Button variant="outline" asChild className="px-10">
                  <Link href="/products/linkedin-outreach">
                    Learn More About LinkedIn Outreach
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default LinkedInOutreachPartner;
