import { Helmet } from "react-helmet";
import { Link, usePage } from "@inertiajs/react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { OrbitingButton } from "@/components/ui/orbiting-button";
import { Check, Clock, Users, Zap, Shield, ArrowRight, FlaskConical } from "lucide-react";
import { usePlanBySlug } from "@/hooks/usePublicPlans";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const availableRoles = [
  "Ad Campaign Managers",
  "Administrative Assistants",
  "AI Prompt Engineers",
  "Automation & Workflow Engineers",
  "Bookkeepers",
  "Copywriters",
  "CRM Administrators",
  "Customer Success Managers",
  "Executive Assistants",
  "Grant Writers",
  "Paralegals",
  "Real Estate Coordinators",
  "Sales Development Reps",
  "SEO, GEO, & AEO Specialists",
  "Social Media Managers",
  "Video Editors",
  "Web Developers",
];

const benefits = [
  {
    icon: Clock,
    title: "Flexible Allocation",
    description: "Hours move across roles without renegotiation.",
  },
  {
    icon: Shield,
    title: "Predictable Cost",
    description: "One flat monthly fee.",
  },
  {
    icon: Zap,
    title: "Managed Execution",
    description: "Work is assigned, tracked, and delivered.",
  },
  {
    icon: Users,
    title: "Immediate Support",
    description: "Execution begins without a hiring process.",
  },
];

const faqs = [
  {
    question: "What is the Test Plan for?",
    answer: "The Test Plan is designed for testing checkout flows, payment processing, and other system functionality in a safe environment.",
  },
  {
    question: "Is this a real subscription?",
    answer: "Yes, this creates a real subscription at a minimal cost ($1/month) for testing purposes.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Absolutely. This plan can be cancelled at any time without penalty.",
  },
  {
    question: "Who should use this plan?",
    answer: "This plan is intended for internal testing and development purposes only.",
  },
];

const TestPlan = () => {
  const { url } = usePage();
  const searchParams = new URLSearchParams(url.split("?")[1] ?? "");
  const billingPeriod = searchParams.get("billing") || "monthly";
  const checkoutUrl = `/checkout?plan=test-plan${billingPeriod === "annual" ? "&billing=annual" : ""}`;
  
  const { data: plan, isLoading } = usePlanBySlug("test-plan");
  
  const price = plan?.price || 1;
  const planName = plan?.name || "Test Plan";
  const description = plan?.description || "A minimal plan for testing checkout and payment flows.";

  return (
    <Layout>
      <Helmet>
        <title>{planName} - ${price}/mo | Cynergists</title>
        <meta name="description" content={description} />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://cynergists.com/plans/test-plan" />
      </Helmet>

      <main>
        {/* Hero Section */}
        <header className="py-20 lg:py-32 gradient-hero">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-2 mb-6">
                <FlaskConical className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-amber-500 font-medium">Test Environment</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                {planName}
              </h1>
              <p className="text-xl md:text-2xl font-medium text-foreground/90 mb-4">
                For Testing & Development Purposes
              </p>
              <div className="flex items-baseline justify-center gap-2 mb-6">
                {isLoading ? (
                  <span className="font-display text-5xl md:text-6xl font-bold text-primary">...</span>
                ) : (
                  <>
                    <span className="font-display text-5xl md:text-6xl font-bold text-primary">${price}</span>
                    <span className="text-xl text-muted-foreground">/ Month</span>
                  </>
                )}
              </div>
              <p className="text-lg text-primary font-semibold mb-6">Minimal Test Subscription</p>
              <p className="text-lg text-muted-foreground mb-8">
                {description}
              </p>
              <OrbitingButton asChild className="btn-primary text-lg px-8 py-6">
                <Link href={checkoutUrl}>
                  Start Test
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </OrbitingButton>
            </div>
          </div>
        </header>

        {/* What's Included */}
        <section className="py-20 bg-card/30">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl font-bold text-foreground text-center mb-12">
              What's Included
            </h2>
            <div className="max-w-2xl mx-auto">
              <ul className="space-y-4">
                {[
                  "Full checkout flow testing",
                  "Payment processing validation",
                  "Agreement signing workflow",
                  "Email notification testing",
                  "Subscription management testing",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-lg">
                    <Check className="h-6 w-6 text-primary flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Test Environment Notice */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-3xl font-bold text-foreground mb-6">
                Test Environment Notice
              </h2>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6 mb-6">
                <p className="text-lg text-foreground mb-4">
                  <strong>This plan is intended for internal testing only.</strong>
                </p>
                <ul className="text-muted-foreground space-y-2">
                  <li>• Creates a real subscription at minimal cost</li>
                  <li>• Tests all checkout and payment flows</li>
                  <li>• Validates agreement signing process</li>
                  <li>• Confirms email notifications work correctly</li>
                </ul>
              </div>
              <p className="text-lg text-muted-foreground">
                For production use, please select one of our standard plans.
              </p>
            </div>
          </div>
        </section>

        {/* Available Roles */}
        <section className="py-20 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                Available Roles (Standard Plans)
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                When you're ready for a production plan, you'll have access to:
              </p>
              <div className="grid md:grid-cols-3 gap-3">
                {availableRoles.map((role) => (
                  <div key={role} className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground">{role}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">And more</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why This Works */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl font-bold text-foreground text-center mb-12">
              Why This Model Works
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="card-glass p-6 text-center">
                  <benefit.icon className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
                  <span className="text-sm text-primary font-medium">Test Plan FAQ</span>
                </div>
                <h2 className="font-display text-3xl font-bold text-foreground">
                  Frequently Asked Questions
                </h2>
              </div>
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="card-glass px-6"
                  >
                    <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline data-[state=open]:text-primary">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-foreground/80 text-base">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 gradient-hero">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Test?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start the test checkout flow now.
            </p>
            <OrbitingButton asChild className="btn-primary text-lg px-8 py-6">
              <Link href={checkoutUrl}>
                Start Test
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </OrbitingButton>
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default TestPlan;
