import { Helmet } from "react-helmet";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { OrbitingButton } from "@/components/ui/orbiting-button";
import { Link } from "@inertiajs/react";
import { ArrowRight, Zap, Handshake, Users, DollarSign, CheckCircle, HelpCircle, TrendingUp, Shield, Target } from "lucide-react";

const partnerBenefits = [
  "Services are easy to explain",
  "Clients see measurable results",
  "Retention is strong",
  "Commissions are predictable",
];

const referralServices = [
  {
    title: "AI Agents",
    description: "Custom agents for revenue and operations",
  },
  {
    title: "Workflow Automation",
    description: "End-to-end process automation",
  },
  {
    title: "Ongoing Management",
    description: "Continuous tuning and oversight",
  },
  {
    title: "Monthly Service Plans",
    description: "Ongoing operational support",
  },
];

const faqs = [
  {
    question: "How much can partners earn?",
    answer: "Earnings depend on the number of clients referred and the services they engage in. With 20% residual commissions, partners can build meaningful recurring income over time.",
  },
  {
    question: "Do commissions expire?",
    answer: "No. Commissions continue for as long as the referred client remains active.",
  },
  {
    question: "Is there a limit to referrals?",
    answer: "No. There is no cap on referrals or commissions.",
  },
  {
    question: "Do partners need to sell services?",
    answer: "No. Partners make introductions only. Cynergists manages sales, delivery, and support.",
  },
  {
    question: "Who is a good fit for this partner program?",
    answer: "Anyone with access to business decision-makers who values long-term relationships and recurring income.",
  },
];

const steps = [
  {
    step: "01",
    title: "Apply to the Program",
    description: "Submit your application to join our partner network.",
  },
  {
    step: "02",
    title: "Align on Fit",
    description: "We discuss expectations, fit, and process together.",
  },
  {
    step: "03",
    title: "Start Introducing",
    description: "Begin introducing qualified businesses to Cynergists.",
  },
];

const Partners = () => {
  return (
    <Layout>
      <Helmet>
        <title>Partner Program | Cynergists - Earn 20% Residual Commissions</title>
        <meta name="description" content="Partner with Cynergists and earn 20% residual commissions by referring businesses to AI Agent services that retain clients long term." />
        <link rel="canonical" href="https://cynergists.ai/partners" />
        <meta property="og:title" content="Partner Program | Cynergists - Earn 20% Residual Commissions" />
        <meta property="og:description" content="Partner with Cynergists and earn 20% residual commissions by referring businesses to AI Agent services." />
        <meta property="og:url" content="https://cynergists.ai/partners" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Partner Program | Cynergists - Earn 20% Residual Commissions" />
        <meta name="twitter:description" content="Partner with Cynergists and earn 20% residual commissions by referring businesses to AI Agent services." />
      </Helmet>
      {/* Hero */}
      <section className="py-24 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
            <Handshake className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary font-medium">Partner Program</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Partner With <span className="text-gradient">Cynergists</span>
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto mb-8">
            Earn 20% Residual Commissions by Referring Businesses You Already Know
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <OrbitingButton asChild className="btn-primary group text-lg px-8 py-6">
              <Link href="/contact" target="_blank" rel="noopener noreferrer">
                Partner With Us!
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </OrbitingButton>
            <Button asChild variant="outline" className="btn-outline text-lg px-8 py-6">
              <Link href="/partners" target="_blank" rel="noopener noreferrer">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Build Recurring Revenue <span className="text-gradient">Without Selling or Delivering Services</span>
            </h2>
            <p className="text-lg text-foreground/80 mb-8">
              If you already have trusted relationships with business owners, founders, or decision-makers, you are sitting on a recurring income opportunity.
            </p>
            <p className="text-lg text-foreground/80 mb-8">
              Cynergists offers a partner program that pays 20% residual commissions on referred clients. You do not sell services. You do not manage delivery. You do not handle support.
            </p>
            <div className="card-glass p-8 max-w-2xl mx-auto">
              <p className="text-2xl font-display font-bold text-primary mb-2">
                You introduce. We execute. You earn.
              </p>
              <p className="text-muted-foreground">
                This is a long-term partnership designed to create predictable, ongoing income.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">How It Works</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              How the Cynergists <span className="text-gradient">Partner Program</span> Works
            </h2>
            <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
              The Cynergists Partner Program is simple by design.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="card-glass p-8 mb-8">
              <p className="text-lg text-foreground/80 mb-6">
                When you introduce a qualified business to Cynergists and they become a client, you earn <span className="text-primary font-semibold">20% recurring commissions</span> for as long as that client remains active. There are no caps and no expiration dates.
              </p>
              <div className="border-l-4 border-primary pl-6">
                <p className="text-foreground/80 italic">
                  This is not a one-time referral bonus.<br />
                  This is residual income built on real client retention.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {steps.map((step, index) => (
                <div key={index} className="card-glass text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <span className="font-display text-xl font-bold text-primary-foreground">{step.step}</span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm text-primary font-medium">Ideal Partners</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                Who This Partner Program <span className="text-gradient">Is For</span>
              </h2>
              <p className="text-lg text-foreground/80 mb-6">
                Our best partners are professionals who already advise or support businesses.
              </p>
              <p className="text-foreground/80 mb-8">
                This includes consultants, agencies, technology providers, coaches, community leaders, and operators who regularly speak with business owners about growth, automation, or efficiency.
              </p>
              <div className="card-glass p-6">
                <p className="text-primary font-semibold">
                  If people already trust you for guidance, Cynergists gives you a proven solution to refer.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {["Consultants", "Agencies", "Tech Providers", "Coaches", "Community Leaders", "Operators"].map((role, index) => (
                <div key={index} className="card-glass text-center py-6">
                  <p className="font-display font-semibold text-foreground">{role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What Partners Can Refer */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">Referral Services</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              What Partners <span className="text-gradient">Can Refer</span>
            </h2>
            <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
              Partners may refer clients to any Cynergists service, including:
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
            {referralServices.map((service, index) => (
              <div key={index} className="card-glass text-center">
                <h3 className="font-display text-lg font-bold text-foreground mb-2">{service.title}</h3>
                <p className="text-muted-foreground text-sm">{service.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-lg text-foreground/80">
              You make the introduction. <span className="text-primary font-semibold">Cynergists handles qualification, onboarding, delivery, and support.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Why Partners Choose Cynergists */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm text-primary font-medium">Why Cynergists</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                Why Partners <span className="text-gradient">Choose Cynergists</span>
              </h2>
              <p className="text-lg text-foreground/80 mb-6">
                Most partner programs fail because the services do not retain clients.
              </p>
              <p className="text-foreground/80 mb-6">
                <span className="text-primary font-semibold">Cynergists is built differently.</span>
              </p>
              <p className="text-foreground/80 mb-8">
                Our services solve real operational problems, which leads to strong retention and consistent recurring revenue. That means partners continue earning month after month.
              </p>
              <div className="border-l-4 border-primary pl-6">
                <p className="text-foreground/80 italic">
                  This is not about chasing deals.<br />
                  It is about building annuity income.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {partnerBenefits.map((benefit, index) => (
                <div key={index} className="card-glass flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-display font-semibold text-foreground">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Commission Structure */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">Commission Structure</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Transparent <span className="text-gradient">20% Residual Commissions</span>
            </h2>
            <p className="text-lg text-foreground/80 mb-8">
              Partners earn 20% residual commissions on active client revenue.
            </p>
            <div className="card-glass p-8">
              <p className="text-foreground/80 mb-6">
                Commissions are recurring, transparent, and tied directly to client retention. As long as the client remains active, commissions continue.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="font-semibold text-foreground">No Tier Resets</p>
                </div>
                <div className="text-center">
                  <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="font-semibold text-foreground">No Caps</p>
                </div>
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="font-semibold text-foreground">No Complicated Payouts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Become a Partner */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
              <Handshake className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">Getting Started</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              How to Become a <span className="text-gradient">Cynergists Partner</span>
            </h2>
            <p className="text-lg text-foreground/80 mb-8">
              Getting started is straightforward.
            </p>
            <div className="card-glass p-8 mb-8">
              <div className="grid md:grid-cols-3 gap-8 text-left">
                <div>
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <span className="font-bold text-primary">1</span>
                  </div>
                  <p className="text-foreground/80">Apply to the partner program</p>
                </div>
                <div>
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <span className="font-bold text-primary">2</span>
                  </div>
                  <p className="text-foreground/80">Align on fit, expectations, and process</p>
                </div>
                <div>
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <span className="font-bold text-primary">3</span>
                  </div>
                  <p className="text-foreground/80">Begin introducing qualified businesses</p>
                </div>
              </div>
            </div>
            <p className="text-lg text-foreground/80">
              Cynergists handles everything else.<br />
              <span className="text-primary font-semibold">You focus on relationships. We focus on execution.</span>
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
              <HelpCircle className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">FAQ</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Frequently Asked Questions About <span className="text-gradient">Partnering With Cynergists</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="card-glass">
                <h3 className="font-display text-lg font-bold text-foreground mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to Build <span className="text-gradient">Recurring Revenue?</span>
            </h2>
            <p className="text-lg text-foreground/80 mb-8">
              If you already have trusted relationships and want to monetize them without selling or delivering services, this program is built for you.
            </p>
            <OrbitingButton asChild className="btn-primary group text-lg px-8 py-6">
              <Link href="/contact" target="_blank" rel="noopener noreferrer">
                Partner With Us!
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </OrbitingButton>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Partners;
