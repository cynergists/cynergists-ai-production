import { Helmet } from "react-helmet";
import { Link, usePage } from "@inertiajs/react";
import Layout from "@/components/layout/Layout";
import { OrbitingButton } from "@/components/ui/orbiting-button";
import { Check, ArrowRight } from "lucide-react";
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

const faqs = [
  {
    question: "How do I decide what to delegate?",
    answer: "You set priorities. We help structure tasks so hours are used efficiently and aligned with your goals.",
  },
  {
    question: "What happens if priorities change?",
    answer: "Hours can be reallocated across roles as needs shift month to month.",
  },
  {
    question: "Is this a long-term commitment?",
    answer: "Emerge is a monthly subscription with a defined minimum commitment.",
  },
  {
    question: "Can this replace internal hires?",
    answer: "For many businesses, yes. AI agents often replace multiple manual roles without the overhead of employment.",
  },
];

const Emerge = () => {
  const { url } = usePage();
  const searchParams = new URLSearchParams(url.split("?")[1] ?? "");
  const billingPeriod = searchParams.get("billing") || "monthly";
  const checkoutUrl = `/checkout?plan=emerge${billingPeriod === "annual" ? "&billing=annual" : ""}`;

  return (
    <Layout>
      <Helmet>
        <title>Emerge Plan | Cynergists</title>
        <meta name="description" content="Built for businesses managing growing workloads. Consistent support across multiple functions without the complexity of building or managing internal staff." />
        <link rel="canonical" href="https://cynergists.com/plans/emerge" />
      </Helmet>

      <main>
        {/* Hero Section */}
        <header className="py-20 lg:py-32 gradient-hero">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Emerge
              </h1>
              <p className="text-xl md:text-2xl font-medium text-foreground/90 mb-6">
                Built for Businesses Managing Growing Workloads
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                As businesses grow, execution demands increase. Emerge is designed for teams that need consistent support across multiple functions, without the complexity of building or managing internal staff. This plan provides expanded capacity and reliable execution so work continues moving forward as priorities evolve.
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

        {/* Execution Without Burden */}
        <section className="py-20">
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
                Cynergists removes those responsibilities.
              </p>
              <p className="text-lg text-foreground font-medium mb-4">
                You focus on direction and outcomes. We manage the team and the work.
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
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-3xl font-bold text-foreground mb-8">
                Why This Model Works
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                You set the priorities. We handle the execution.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                With increased monthly capacity, work can move forward across multiple initiatives at the same time. Hours flex across roles without renegotiation, giving you a single managed team that adapts as your needs change.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                You pay one predictable flat monthly fee, with no payroll, no benefits, and no hiring risk.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                You work directly with your staff, and all tasks are assigned, tracked, and delivered inside a structured system with built-in accountability.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                Execution stays consistent, even as workloads grow.
              </p>
              <p className="text-lg text-foreground font-medium">
                The result is simple. More work moves forward. More reliably. Without operational drag.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-card/30">
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
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="font-display text-3xl font-bold text-foreground mb-6">
                Bottom Line
              </h2>
              <p className="text-xl text-muted-foreground">
                Emerge delivers consistent execution capacity without the friction of building or managing an internal team. If your business needs reliable support across multiple functions each month, this plan is designed to support that reality.
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

export default Emerge;