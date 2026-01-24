import { Helmet } from "react-helmet";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { OrbitingButton } from "@/components/ui/orbiting-button";
import { Link } from "@inertiajs/react";
import { ArrowRight, FileText } from "lucide-react";
import jmAutoRepairLogo from "@/assets/case-studies/jm-auto-repair-logo.webp";
import ogdenVenturesLogo from "@/assets/logos/ogden-ventures.webp";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const caseStudies = [
  {
    title: "JM Auto Repair SEO",
    category: "SEO & Digital Marketing",
    objective: "Break through the 7-figure revenue plateau.",
    villain: "Operational bottlenecks and lack of automation.",
    solution: "Deployed Custom AI Agents and workflow automation.",
    description:
      "How strategic SEO turned a local auto repair shop into a consistent lead engine, increasing organic traffic by 70% and ranking keywords by 91%.",
    results: [
      { label: "Organic Traffic", value: "+70%" },
      { label: "Ranking Keywords", value: "+91%" },
      { label: "Backlinks Growth", value: "+391%" },
    ],
    image: "jm-auto-repair",
    logo: jmAutoRepairLogo,
    link: "/case-studies/jm-auto-repair",
  },
  {
    title: "Ogden Ventures Operations",
    category: "AI Operations",
    objective: "Scale without founder burnout.",
    villain: "Fragmented systems and manual processes.",
    solution: "Embedded operations partner with cross-platform automation.",
    description:
      "How operational infrastructure enabled scalable content, outreach, and automation, transforming fragmented systems into an integrated operational backbone.",
    results: [
      { label: "Organization", value: "Integrated" },
      { label: "CRM Usage", value: "Fully Leveraged" },
      { label: "Founder Time", value: "Reduced" },
    ],
    image: "ogden-ventures",
    logo: ogdenVenturesLogo,
    link: "/case-studies/ogden-ventures",
  },
];

const faqs = [
  {
    question: "What results can I expect from working with Cynergists?",
    answer: "While every business is unique, our clients typically see a reduction in operational costs by 40-60% through AI automation and a significant increase in lead response speed via AI Agents. Our case studies above detail specific ROI scenarios across various industries."
  },
  {
    question: "Does Cynergists work with small businesses or only national brands?",
    answer: "We work with both. Our solutions are scalable. We help \"Solopreneurs\" build their first foundational team, and we help established national brands optimize their departments for maximum efficiency and AEO dominance."
  },
  {
    question: "How do I know if these strategies will work for my specific industry?",
    answer: "The principles of AI Automation are universal, but the application is custom. Whether you are in real estate, e-commerce, legal, or healthcare, the \"villains\" of administrative waste and inefficiency are the same. Our case studies demonstrate our ability to adapt our tactics to your specific battlefield."
  },
  {
    question: "Can I speak to a reference?",
    answer: "Transparency is a core value at Cynergists. In addition to our published case studies, we can provide references upon request during your strategy session to ensure you have total confidence in our alliance."
  }
];

const CaseStudies = () => {
  return (
    <Layout>
      <Helmet>
        <title>Case Studies | Cynergists - Declassified Mission Reports</title>
        <meta name="description" content="Read declassified mission reports from business owners who escaped burnout and transformed chaos into national empires. See the math, strategy, and results." />
        <link rel="canonical" href="https://cynergists.com/case-studies" />
        <meta property="og:title" content="Case Studies | Cynergists - Declassified Mission Reports" />
        <meta property="og:description" content="Read declassified mission reports from business owners who transformed chaos into national empires. See the math, strategy, and results." />
        <meta property="og:url" content="https://cynergists.com/case-studies" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Case Studies | Cynergists - Declassified Mission Reports" />
        <meta name="twitter:description" content="Read declassified mission reports from business owners who transformed chaos into national empires." />
      </Helmet>

      {/* Hero Section */}
      <section className="py-20 lg:py-32 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">Case Studies</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Proof Beats <span className="text-gradient">Promises</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-foreground/80 mb-8 max-w-2xl mx-auto">
              Real results from leaders who stopped doing everything themselves.
            </p>
            
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Anyone can make claims. Results tell the truth. These case studies break down how founders and operators used Cynergists to remove operational bottlenecks, stabilize teams, and scale without burning out. No hype. No theory. Just clear problems, decisive action, and measurable outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* Detailed Case Studies */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-foreground mb-12 text-center">
            Featured <span className="text-gradient">Case Studies</span>
          </h2>
          
          <div className="space-y-12 max-w-5xl mx-auto">
            {caseStudies.map((study, index) => (
              <div
                key={study.title}
                className={`card-glass grid lg:grid-cols-2 gap-8 items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Content */}
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <span className="text-sm text-primary font-medium">{study.category}</span>
                  <h3 className="font-display text-2xl font-bold text-foreground mt-2 mb-4">
                    {study.title}
                  </h3>
                  <p className="text-muted-foreground mb-6">{study.description}</p>
                  
                  {/* Results */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {study.results.map((result) => (
                      <div key={result.label} className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="font-display text-2xl font-bold text-primary">
                          {result.value}
                        </div>
                        <div className="text-xs text-muted-foreground">{result.label}</div>
                      </div>
                    ))}
                  </div>
                  
                  {study.link ? (
                    <Button asChild variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10 p-0 group">
                      <Link href={study.link}>
                        Read Full Case Study
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10 p-0 group" disabled>
                      Coming Soon
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Visual */}
                <div className={`${index % 2 === 1 ? "lg:order-1" : ""}`}>
                  {study.link ? (
                    <Link href={study.link} className="block">
                      <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center overflow-hidden cursor-pointer hover:from-primary/30 hover:to-secondary/30 transition-all duration-300">
                        {study.logo && (
                          <div className="bg-white rounded-xl p-8 hover:scale-105 transition-transform duration-300">
                            <img src={study.logo} alt={`${study.title} logo`} className="h-40 w-auto object-contain" />
                          </div>
                        )}
                      </div>
                    </Link>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center overflow-hidden">
                      {study.logo && (
                        <div className="bg-white rounded-xl p-8">
                          <img src={study.logo} alt={`${study.title} logo`} className="h-40 w-auto object-contain" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section - AEO Optimized */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
                <span className="text-sm text-primary font-medium">Public Briefing</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Frequently Asked <span className="text-gradient">Questions</span>
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

      {/* CTA */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">
            Ready to Write Your Success Story?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Your mission could be the next success story. Let's discuss how Cynergists can help you achieve similar results.
          </p>
          <OrbitingButton asChild className="btn-primary text-xl px-12 py-8">
            <Link href="/schedule">
              Schedule a Call
              <ArrowRight className="ml-2 h-6 w-6" />
            </Link>
          </OrbitingButton>
        </div>
      </section>
    </Layout>
  );
};

export default CaseStudies;