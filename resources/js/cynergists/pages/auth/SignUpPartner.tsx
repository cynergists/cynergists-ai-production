import { Helmet } from "react-helmet";
import { router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { 
  Users, 
  DollarSign, 
  Repeat, 
  CheckCircle, 
  ArrowRight,
  Zap,
  Globe,
  HeadphonesIcon,
  TrendingUp,
  Shield,
  Clock
} from "lucide-react";

export default function SignUpPartner() {

  const handleApplyClick = () => {
    router.visit("/signup/partner/apply");
  };

  return (
    <Layout>
      <Helmet>
        <title>Partner Program | Earn Recurring Commissions | Cynergists</title>
        <meta 
          name="description" 
          content="Join the Cynergists Partner Program. Earn 20% recurring commissions for the life of every client you refer. No fulfillment, no overhead, just income." 
        />
        <meta property="og:title" content="Cynergists Partner Program | Recurring Revenue for Referrals" />
        <meta property="og:description" content="Earn 20% monthly recurring commissions by referring businesses to Cynergists. We handle delivery. You collect residuals." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://cynergists.com/signup/partner" />
      </Helmet>

      <div className="bg-background">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Turn Your Network Into
                <span className="text-gradient block mt-2">Recurring Revenue</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                Refer business owners to Cynergists. We handle all the delivery. 
                You earn 20% residual commissions for as long as they stay.
              </p>
              <Button 
                size="lg" 
                onClick={handleApplyClick}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 text-base"
              >
                Join the Cynergists Partner Program
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="mt-4 text-sm text-muted-foreground">
                No fulfillment burden. No client management. Just residual income.
              </p>
            </div>
          </div>
        </section>

        {/* Credibility Strip */}
        <section className="py-12 border-y border-border bg-card/50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Done-For-You Delivery</h3>
                <p className="text-muted-foreground">
                  We handle onboarding, execution, and ongoing support for every client you refer.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Full-Service AI Operations</h3>
                <p className="text-muted-foreground">
                  AI agents and workflow automation. One partner relationship covers it all.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Clients That Stick</h3>
                <p className="text-muted-foreground">
                  Our delivery quality keeps clients active month after month. That means ongoing commissions for you.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 lg:py-28">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                How the <span className="text-gradient">Partner Program Works</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Three steps. No complexity. Start earning.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="relative">
                <div className="bg-card border border-border rounded-2xl p-8 h-full">
                  <div className="h-14 w-14 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                    <Users className="h-7 w-7 text-primary" />
                  </div>
                  <div className="text-5xl font-bold text-primary/20 absolute top-4 right-6">1</div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    You Make the Introduction
                  </h3>
                  <p className="text-muted-foreground">
                    Share your unique partner link with business owners who need operational support. 
                    That is your only job.
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-card border border-border rounded-2xl p-8 h-full">
                  <div className="h-14 w-14 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                    <Zap className="h-7 w-7 text-primary" />
                  </div>
                  <div className="text-5xl font-bold text-primary/20 absolute top-4 right-6">2</div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    We Handle Everything Else
                  </h3>
                  <p className="text-muted-foreground">
                    Cynergists manages onboarding, delivery, billing, and ongoing client support. 
                    You stay out of the weeds.
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-card border border-border rounded-2xl p-8 h-full">
                  <div className="h-14 w-14 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                    <Repeat className="h-7 w-7 text-primary" />
                  </div>
                  <div className="text-5xl font-bold text-primary/20 absolute top-4 right-6">3</div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    You Earn Every Month
                  </h3>
                  <p className="text-muted-foreground">
                    Receive 20% of the monthly revenue from every client you refer. 
                    For as long as they remain active.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Commission Breakdown */}
        <section className="py-20 lg:py-28 bg-card/50 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  The <span className="text-gradient">Commission Structure</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  Simple math. Serious upside.
                </p>
              </div>
              
              <div className="bg-background border border-border rounded-2xl p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-8 mb-10">
                  <div className="text-center md:text-left">
                    <div className="text-6xl md:text-7xl font-bold text-primary mb-2">20%</div>
                    <p className="text-xl text-foreground font-medium">Monthly Recurring Commission</p>
                    <p className="text-muted-foreground mt-2">
                      On all active client revenue attributed to your referrals.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">No Commission Cap</p>
                        <p className="text-sm text-muted-foreground">Refer as many clients as you want.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Lifetime of the Account</p>
                        <p className="text-sm text-muted-foreground">Earn as long as the client stays active.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Zero Fulfillment Responsibility</p>
                        <p className="text-sm text-muted-foreground">We do the work. You collect the check.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-border pt-8">
                  <p className="text-center text-muted-foreground mb-6">
                    <strong className="text-foreground">Example:</strong> Refer 5 clients averaging $2,500/month each. 
                    That is $2,500/month in passive income. Every month. With no delivery burden.
                  </p>
                  <div className="text-center">
                    <Button 
                      size="lg" 
                      onClick={handleApplyClick}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 text-base"
                    >
                      Apply to the Partner Program
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Who This Is For */}
        <section className="py-20 lg:py-28">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Who This <span className="text-gradient">Program Is For</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  The right partners make all the difference.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Ideal Partners
                  </h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      Consultants and advisors already serving business owners
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      Agencies looking to expand their service offering without hiring
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      Business leaders with clients who need AI automation
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      SaaS advisors, MSPs, and accountants with trusted client relationships
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      Well-connected operators who value long-term partnerships
                    </li>
                  </ul>
                </div>
                
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    Not the Right Fit
                  </h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground mt-1">•</span>
                      Mass cold outreach or spam-based lead generation
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground mt-1">•</span>
                      One-time transaction seekers without relationship focus
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground mt-1">•</span>
                      Those looking for quick commissions over quality referrals
                    </li>
                  </ul>
                  <p className="mt-4 text-sm text-muted-foreground/80 italic">
                    We prioritize partner quality to protect our clients and your reputation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Cynergists */}
        <section className="py-20 lg:py-28 bg-card/50 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Why Partners <span className="text-gradient">Choose Cynergists</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  One partnership. Complete operational coverage.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Global Operations Team</h3>
                    <p className="text-muted-foreground">
                      Fully managed team across multiple time zones. Your referrals get coverage when they need it.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">AI Plus Human Operators</h3>
                    <p className="text-muted-foreground">
                      Automation handles the repetitive work. Skilled operators handle everything else.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <HeadphonesIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Single Point of Contact</h3>
                    <p className="text-muted-foreground">
                      Your referrals get one relationship instead of juggling multiple vendors and contractors.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Clients Stay Because Delivery Works</h3>
                    <p className="text-muted-foreground">
                      Low churn means long-term commissions. We keep clients because we get results.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Transparent Commission Tracking</h3>
                    <p className="text-muted-foreground">
                      See exactly what you have earned and what is coming. No guesswork.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Fast Onboarding</h3>
                    <p className="text-muted-foreground">
                      Referred clients are onboarded quickly. You do not wait months to start earning.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 lg:py-28">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Ready to <span className="text-gradient">Start Earning?</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Apply to the Cynergists Partner Program and turn your network into recurring revenue.
              </p>
              <Button 
                size="lg" 
                onClick={handleApplyClick}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 text-base"
              >
                Join the Cynergists Partner Program
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="mt-4 text-sm text-muted-foreground">
                Spots are limited to maintain partner quality.
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}