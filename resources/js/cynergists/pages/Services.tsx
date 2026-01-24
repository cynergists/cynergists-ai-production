import { Helmet } from "react-helmet";
import Layout from "@/components/layout/Layout";
import { OrbitingButton } from "@/components/ui/orbiting-button";
import { Link } from "@inertiajs/react";
import { Bot, ArrowRight, CheckCircle, Zap, MessageSquare, TrendingUp, FileText, Users } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does Cynergists help businesses scale?",
    answer: "Cynergists helps businesses scale by deploying AI Agents that automate revenue, operations, and internal workflows. Our agents work 24/7 to improve efficiency and reduce overhead."
  },
  {
    question: "Are services available outside the United States?",
    answer: "Yes. Cynergists supports businesses across the United States and internationally."
  },
  {
    question: "What kinds of AI Agents do you build?",
    answer: "We build custom AI Agents for lead capture, sales automation, customer support, research, HR, and more. Each agent is tailored to your specific business needs and integrates with your existing tools."
  },
  {
    question: "Is this a consulting service?",
    answer: "No. Cynergists provides hands-on AI Agent design, deployment, and ongoing management, not just recommendations."
  }
];

const agentTypes = [
  {
    icon: TrendingUp,
    title: "Sales Agents",
    description: "Automate lead qualification, follow-ups, and pipeline management."
  },
  {
    icon: MessageSquare,
    title: "Support Agents",
    description: "24/7 customer support that handles tickets and escalates complex issues."
  },
  {
    icon: FileText,
    title: "Research Agents",
    description: "Deep research for market analysis, competitor tracking, and insights."
  },
  {
    icon: Users,
    title: "HR Agents",
    description: "Streamline hiring with AI-powered screening and scheduling."
  }
];

const servicesSchemaData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "AI Agents | Cynergists",
  "description": "Cynergists designs, deploys, and manages AI Agents that take full ownership of revenue, operations, and internal workflows.",
  "url": "https://cynergists.com/services",
  "mainEntity": {
    "@type": "Service",
    "name": "AI Agents",
    "description": "Custom AI Agents built to automate workflows, capture leads, and support day-to-day operations."
  }
};

const faqSchemaData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
};

const Services = () => {
  return (
    <Layout>
      <Helmet>
        <title>AI Agents | Cynergists</title>
        <meta name="description" content="Cynergists designs, deploys, and manages AI Agents that take full ownership of revenue, operations, and internal workflows." />
        <meta name="keywords" content="AI agents, business automation, AI automation, lead capture, sales automation" />
        <link rel="canonical" href="https://cynergists.com/services" />
        
        <meta property="og:title" content="AI Agents | Cynergists" />
        <meta property="og:description" content="Cynergists designs, deploys, and manages AI Agents that automate your business." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cynergists.com/services" />
        <meta property="og:image" content="https://cynergists.com/og-image.webp" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Agents | Cynergists" />
        <meta name="twitter:description" content="AI Agents that automate your business." />
        <meta name="twitter:image" content="https://cynergists.com/og-image.webp" />
        
        <script type="application/ld+json">
          {JSON.stringify(servicesSchemaData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqSchemaData)}
        </script>
      </Helmet>

      <main>
        {/* Hero Section */}
        <header className="py-20 lg:py-32 gradient-hero relative overflow-hidden" aria-labelledby="services-heading">
          <div className="absolute inset-0">
            <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
              <Bot className="h-4 w-4 text-primary" aria-hidden="true" />
              <span className="text-sm text-primary font-medium">AI Agents</span>
            </div>
            <h1 id="services-heading" className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              AI Agents That <span className="text-gradient">Work For You</span>
            </h1>
            <p className="text-xl md:text-2xl font-medium text-foreground/90 mb-4">
              Designed, Deployed, and <span className="text-gradient">Managed by Cynergists</span>
            </p>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Cynergists designs, deploys, and manages AI Agents that take full ownership of revenue, operations, and internal workflows. Each agent is built to operate independently and win together.
            </p>
          </div>
        </header>

        {/* What Are AI Agents Section */}
        <section className="py-24" aria-labelledby="what-heading">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 id="what-heading" className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                What Are <span className="text-gradient">AI Agents?</span>
              </h2>
              <p className="text-lg text-foreground/80 mb-6">
                AI Agents are intelligent systems built to automate workflows and support day-to-day operations. Unlike simple chatbots or basic automation, our agents handle complex tasks, make decisions, and integrate seamlessly with your existing tools.
              </p>
              <p className="text-muted-foreground">
                These agents handle repetitive tasks, support structured decision-making, and improve consistency across operations. The result is less manual effort, fewer bottlenecks, and faster execution without disrupting your team.
              </p>
            </div>
          </div>
        </section>

        {/* Agent Types Section */}
        <section className="py-24 bg-card/30" aria-labelledby="types-heading">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 id="types-heading" className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                Types of <span className="text-gradient">AI Agents</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We build custom agents for every part of your business.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {agentTypes.map((agent, index) => (
                <div key={index} className="card-glass text-center">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                    <agent.icon className="h-7 w-7 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">{agent.title}</h3>
                  <p className="text-sm text-muted-foreground">{agent.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24" aria-labelledby="benefits-heading">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
              <div>
                <h2 id="benefits-heading" className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Why Choose <span className="text-gradient">Cynergists AI Agents?</span>
                </h2>
                <p className="text-lg text-foreground/80 mb-6">
                  Our agents are built for real business use, not experimentation. We design, deploy, and manage everything so you can focus on growth.
                </p>
                <p className="text-primary font-semibold">
                  Zero payroll. Zero burnout. 100% execution.
                </p>
              </div>
              <div className="card-glass p-8">
                <div className="space-y-4">
                  {[
                    "Custom-built for your specific workflows",
                    "Integrates with your existing tools",
                    "Operates 24/7 without breaks",
                    "Scales instantly as you grow",
                    "Managed and maintained by our team"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" aria-hidden="true" />
                      <p className="text-foreground/80">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Who This Is For Section */}
        <section className="py-24 bg-card/30" aria-labelledby="who-heading">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 id="who-heading" className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Who This Is <span className="text-gradient">Built For</span>
                </h2>
                <p className="text-lg text-foreground/80">
                  Cynergists AI Agents work best with businesses that want to automate before hiring, scale without adding headcount, and focus on growth instead of operations.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  "Founders scaling beyond solo operations",
                  "Small teams stretched across too many roles",
                  "Companies looking to automate before hiring",
                  "Leadership teams focused on growth, not admin"
                ].map((item, index) => (
                  <div key={index} className="card-glass flex items-start gap-4">
                    <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" aria-hidden="true" />
                    <p className="text-foreground/80">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24" aria-labelledby="cta-heading">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 id="cta-heading" className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                Ready to <span className="text-gradient">Assemble Your Team?</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Schedule a call to learn how Cynergists AI Agents can automate your business.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <OrbitingButton asChild className="btn-primary">
                  <Link href="/schedule">
                    Schedule a Call
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </OrbitingButton>
                <OrbitingButton asChild variant="outline" className="btn-outline">
                  <Link href="/pricing">
                    View Pricing
                  </Link>
                </OrbitingButton>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-card/30" aria-labelledby="faq-heading">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 id="faq-heading" className="font-display text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
                Frequently Asked <span className="text-gradient">Questions</span>
              </h2>
              
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="card-glass px-6">
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
      </main>
    </Layout>
  );
};

export default Services;
