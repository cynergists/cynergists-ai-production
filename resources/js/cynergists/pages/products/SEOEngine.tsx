import { Helmet } from "react-helmet";
import Layout from "@/components/layout/Layout";
import ProductDetailLayout from "@/components/products/ProductDetailLayout";
import { MapPin, Search, Sparkles, Check } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  seoEngineAuditAreas,
  seoEngineCoreFeatures,
  seoEngineDashboardMetrics,
  seoEngineExecutionTracking,
  seoEngineExplanationPrompts,
  seoEngineRecommendationTypes,
  seoEngineReportHighlights,
  seoEngineScaleCapabilities,
  seoEngineWorkflowSteps,
  seoEngineApprovalControls,
  seoEngineTimeline,
  seoEngineDeliverables,
  seoEngineFaqs,
} from "@/cynergists/data/seoEngine";

const SEOEngine = () => {
  return (
    <Layout>
      <Helmet>
        <title>Carbon SEO, GEO & AEO Engine | Cynergists</title>
        <meta
          name="description"
          content="A dedicated optimization system built to continuously improve how your website ranks in search engines, geographic results, and AI-powered answer engines."
        />
        <meta
          name="keywords"
          content="SEO engine, GEO optimization, AEO optimization, answer engine optimization, technical SEO, schema, local SEO"
        />
        <link rel="canonical" href="https://cynergists.ai/products/seo-engine" />
      </Helmet>

      <main>
        <ProductDetailLayout
          id="seo-geo-aeo-engine"
          name="Carbon"
          category="SEO / GEO / AEO"
          categoryIcon={<Search className="h-4 w-4 text-primary" />}
          shortDescription="A dedicated optimization system built to continuously improve how your website ranks in search engines, geographic results, and AI-powered answer engines."
          imageUrl="/images/agents/seo-engine-placeholder.svg"
          featuresTitle="Core Features (Website-Ready)"
          price={0}
          priceLabel="Custom"
          priceNote="Pricing scales with site size, location footprint, and execution scope."
          features={seoEngineCoreFeatures}
          primaryCtaText="Schedule a Strategy Call"
          primaryCtaLink="/schedule"
          secondaryCtaText="Talk to an Expert"
          secondaryCtaLink="/contact"
        >
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm text-primary font-medium">Website-Ready Engine</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    How the Engine <span className="text-gradient">Works</span>
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    A clear workflow from audit to execution, built for approval-first control and
                    ongoing optimization.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
                  {seoEngineWorkflowSteps.map((item) => (
                    <div key={item.step} className="card-glass text-center">
                      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl flex items-center justify-center mx-auto mb-4">
                        {item.step}
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                      <p className="text-sm text-foreground/70">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="py-20 bg-card/30">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm text-primary font-medium">First Steps Timeline</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    What Happens in the <span className="text-gradient">First 30 Days</span>
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    A structured rollout with clear milestones, approvals, and measurable outcomes.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {seoEngineTimeline.map((item) => (
                    <div key={item.phase} className="card-glass">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-primary">{item.phase}</span>
                        <span className="text-xs uppercase tracking-wide text-foreground/60">
                          {item.title}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                      <p className="text-sm text-foreground/70">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="py-20 bg-card/30">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-8">
                <div className="card-glass">
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    Continuous Website Audits
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Your site is automatically analyzed for:
                  </p>
                  <div className="space-y-3">
                    {seoEngineAuditAreas.map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground/80">{item}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-muted-foreground mt-6">
                    Audits run on a recurring schedule so performance is always current.
                  </p>
                </div>

                <div className="card-glass">
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    Actionable Optimization Recommendations
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Generates prioritized improvement tasks including:
                  </p>
                  <div className="space-y-3">
                    {seoEngineRecommendationTypes.map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground/80">{item}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-muted-foreground mt-6">
                    Each recommendation includes target pages and estimated impact.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-8">
                <div className="card-glass border-primary/30">
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    Approval-First Control
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    You decide what gets changed. Nothing is applied without your permission.
                  </p>
                  <div className="space-y-3">
                    {seoEngineApprovalControls.map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground/80">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card-glass">
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    Execution & Change History
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Tracks every improvement:
                  </p>
                  <div className="space-y-3">
                    {seoEngineExecutionTracking.map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground/80">{item}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-muted-foreground mt-6">
                    Creates a complete optimization audit trail.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="py-20 bg-card/30">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-8">
                <div className="card-glass">
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className="h-5 w-5 text-primary" />
                    <h3 className="text-2xl font-bold text-foreground">Performance Dashboard</h3>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    See progress at a glance:
                  </p>
                  <div className="space-y-3">
                    {seoEngineDashboardMetrics.map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground/80">{item}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-muted-foreground mt-6">
                    Built for clarity, not SEO jargon.
                  </p>
                </div>

                <div className="card-glass">
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    Automated Monthly Reports
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Get clear reports showing:
                  </p>
                  <div className="space-y-3">
                    {seoEngineReportHighlights.map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground/80">{item}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-muted-foreground mt-6">
                    Exportable for sharing or archiving.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="card-glass text-center">
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    AI Explanation Layer
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Plain-English answers to:
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    {seoEngineExplanationPrompts.map((item) => (
                      <div key={item} className="bg-background/60 border border-border/50 rounded-xl p-4">
                        <span className="text-sm font-semibold text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-muted-foreground mt-6">
                    No generic advice. Only real actions and results.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="py-20 bg-card/30">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    What You <span className="text-gradient">Receive</span>
                  </h3>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Deliverables that make progress tangible and ready for client websites.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {seoEngineDeliverables.map((item) => (
                    <div key={item.title} className="card-glass">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="text-lg font-semibold text-foreground mb-1">
                            {item.title}
                          </h4>
                          <p className="text-sm text-foreground/70">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="py-20 bg-card/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Built for <span className="text-gradient">Scale</span>
                </h3>
                <p className="text-muted-foreground mb-8">
                  Designed to support:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {seoEngineScaleCapabilities.map((item) => (
                    <div key={item} className="flex items-start gap-3 card-glass">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    Frequently Asked <span className="text-gradient">Questions</span>
                  </h3>
                  <p className="text-muted-foreground">
                    Clear answers to the most common questions about the SEO engine rollout.
                  </p>
                </div>

                <Accordion type="single" collapsible className="space-y-4">
                  {seoEngineFaqs.map((item, index) => (
                    <AccordionItem
                      key={item.question}
                      value={`seo-faq-${index}`}
                      className="card-glass px-6"
                    >
                      <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline data-[state=open]:text-primary">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-foreground/80 text-base">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </section>
        </ProductDetailLayout>
      </main>
    </Layout>
  );
};

export default SEOEngine;
