import { Helmet } from "react-helmet";
import { Link, usePage } from "@inertiajs/react";
import Layout from "@/components/layout/Layout";
import { OrbitingButton } from "@/components/ui/orbiting-button";
import { Check, Clock, Users, Zap, Shield, ArrowRight } from "lucide-react";
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
    question: "How do I decide what to delegate?",
    answer: "You set priorities. We help structure tasks so hours are used efficiently and aligned with your goals.",
  },
  {
    question: "What happens if priorities change?",
    answer: "Hours can be reallocated across roles as needs shift during the month.",
  },
  {
    question: "Is this a long-term commitment?",
    answer: "No. Essentials is a monthly subscription with built-in flexibility.",
  },
  {
    question: "Can this replace hiring?",
    answer: "For many businesses, yes. AI agents often replace manual support without the overhead of employment.",
  },
];

const Essentials = () => {
  const { url } = usePage();
  const searchParams = new URLSearchParams(url.split("?")[1] ?? "");
  const billingPeriod = searchParams.get("billing") || "monthly";
  const checkoutUrl = `/checkout?plan=essentials${billingPeriod === "annual" ? "&billing=annual" : ""}`;

  return (
    <Layout>
      <Helmet>
        <title>Essentials Plan - $497/mo | Cynergists</title>
        <meta name="description" content="15 managed service hours per month. Focused execution without hiring overhead. Access every department and role with fully managed execution." />
        <link rel="canonical" href="https://cynergists.ai/plans/essentials" />
      </Helmet>

      <main>
        {/* Hero Section */}
        <header className="py-20 lg:py-32 gradient-hero">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Essentials
              </h1>
              <p className="text-xl md:text-2xl font-medium text-foreground/90 mb-4">
                Focused Execution Without Hiring Overhead
              </p>
              <div className="flex items-baseline justify-center gap-2 mb-6">
                <span className="font-display text-5xl md:text-6xl font-bold text-primary">$497</span>
                <span className="text-xl text-muted-foreground">/ Month</span>
              </div>
              <p className="text-lg text-primary font-semibold mb-6">15 Managed Service Hours</p>
              <p className="text-lg text-muted-foreground mb-8">
                Many businesses do not need a full internal team. They need dependable execution. Essentials is designed for founders and small teams who want to delegate meaningful work without committing to hires, long-term contracts, or fixed roles. This plan provides immediate access to a managed team capable of handling real operational tasks across multiple functions.
              </p>
              <OrbitingButton asChild className="btn-primary text-lg px-8 py-6">
                <Link href={checkoutUrl}>
                  Get Started Now
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
                  "15 service hours per month",
                  "Access to every department",
                  "Access to every role",
                  "Fully managed execution",
                  "Flexible monthly capacity",
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

        {/* Execution Without Burden */}
        <section className="py-20 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-3xl font-bold text-foreground mb-6">
                Execution Without the Burden of Hiring
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Hiring and managing people takes time, money, and focus.
              </p>
              <ul className="text-lg text-muted-foreground mb-8 space-y-2">
                <li>• Recruiting.</li>
                <li>• Training.</li>
                <li>• Payroll.</li>
                <li>• Benefits.</li>
                <li>• Oversight.</li>
              </ul>
              <p className="text-lg text-muted-foreground mb-6">
                Essentials removes those responsibilities.
              </p>
              <p className="text-lg text-foreground font-medium mb-4">
                You assign priorities. We manage the team. Work gets completed inside a structured system with accountability built in.
              </p>
              <div className="flex flex-wrap gap-4 text-lg font-semibold text-primary">
                <span>No payroll.</span>
                <span>No benefits.</span>
                <span>No hiring risk.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Use Hours Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-3xl font-bold text-foreground mb-6">
                Use Hours Where They Matter Most
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Your 15 hours can be allocated across any role based on your current needs.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "Administrative support",
                  "Copywriting",
                  "CRM updates",
                  "Basic automation",
                  "Content editing",
                  "Bookkeeping support",
                  "Technical tasks",
                  "Operational cleanup",
                ].map((task) => (
                  <div key={task} className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{task}</span>
                  </div>
                ))}
              </div>
              <p className="text-lg text-muted-foreground mt-8">
                Work moves forward without you managing multiple vendors or contractors.
              </p>
            </div>
          </div>
        </section>

        {/* Available Roles */}
        <section className="py-20 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                Access Every Role as Needs Change
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                You are not locked into a single function.
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
              <p className="text-lg text-muted-foreground mt-8">
                Hours shift as priorities shift.
              </p>
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

        {/* Who This Is For */}
        <section className="py-20 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-3xl font-bold text-foreground mb-8">
                Who This Is For
              </h2>
              <ul className="space-y-4 mb-8">
                {[
                  "Founders delegating operational tasks",
                  "Small teams needing reliable support",
                  "Businesses avoiding payroll expansion",
                  "Operators who want execution handled, not managed",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-lg">
                    <Check className="h-6 w-6 text-primary flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-lg text-muted-foreground">
                If you need work done consistently without hiring complexity, this model fits.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
                  <span className="text-sm text-primary font-medium">Public Briefing</span>
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

        {/* Bottom Line */}
        <section className="py-20 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="font-display text-3xl font-bold text-foreground mb-6">
                Bottom Line
              </h2>
              <p className="text-xl text-muted-foreground">
                Essentials delivers reliable execution without the friction of building an internal team. If you want work handled professionally without expanding payroll, this plan is designed for that purpose.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 gradient-hero">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Put execution on autopilot and keep your business moving.
            </p>
            <OrbitingButton asChild className="btn-primary text-lg px-8 py-6">
              <Link href={checkoutUrl}>
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </OrbitingButton>
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default Essentials;