import { Helmet } from "react-helmet";
import Layout from "@/components/layout/Layout";
import ProductDetailLayout from "@/components/products/ProductDetailLayout";
import { BarChart3, Check } from "lucide-react";

const features = [
  "Complete CRM & pipeline management",
  "Unlimited email marketing",
  "Two-way SMS messaging",
  "Calendar & appointment booking",
  "Funnel & website builder",
  "Built-in phone system",
  "Reputation & review management",
  "Advanced marketing automation",
  "AI-powered features",
];

const whosItFor = `Service businesses (HVAC, Plumbing, Landscaping)
Professional services (Law Firms, Accountants, Coaches)
Sales teams (Real Estate, Insurance, Financial Services)
Anyone tired of juggling 10+ disconnected tools`;

const integrations = [
  "Zapier",
  "Google Calendar",
  "Stripe",
  "QuickBooks",
  "Mailchimp",
  "Slack",
];

const CRM = () => {
  return (
    <Layout>
      <Helmet>
        <title>CRM Platform | Cynergists - All-in-One Business Growth System</title>
        <meta
          name="description"
          content="All-in-one CRM platform for lead management, marketing automation, appointment scheduling, and more. Replace 10+ tools with one powerful system."
        />
        <meta
          name="keywords"
          content="CRM, customer relationship management, marketing automation, lead management, appointment scheduling, business growth"
        />
        <link rel="canonical" href="https://cynergists.ai/products/crm" />
      </Helmet>

      <main>
        <ProductDetailLayout
          id="crm-professional"
          name="All-in-One CRM Platform"
          category="CRM Platform"
          categoryIcon={<BarChart3 className="h-4 w-4 text-primary" />}
          shortDescription="Stop juggling 10 different tools. Run everything from one platform—CRM, email marketing, SMS, phone calls, funnels, scheduling, automation, and more."
          price={297}
          billingPeriod="monthly"
          features={features}
          whosItFor={whosItFor}
          integrations={integrations}
          primaryCtaText="Add to Cart"
          secondaryCtaText="Request a Demo"
          secondaryCtaLink="/schedule"
        >
          {/* Problem/Solution Section */}
          <section className="py-20 bg-card/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    The Tool Overload <span className="text-gradient">Problem</span>
                  </h2>
                  <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
                    Most businesses are paying for a dozen disconnected tools that don't talk to each
                    other. The result? Wasted money, lost leads, and endless frustration.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="card-glass">
                    <h3 className="text-xl font-bold text-foreground mb-4">
                      What You're Probably Paying For Now:
                    </h3>
                    <ul className="space-y-3">
                      {[
                        "CRM software ($50-300/mo)",
                        "Email marketing tool ($30-150/mo)",
                        "SMS platform ($25-100/mo)",
                        "Scheduling app ($15-50/mo)",
                        "Funnel builder ($97-297/mo)",
                        "Phone system ($30-100/mo)",
                        "Review management ($50-150/mo)",
                        "Automation tool ($50-200/mo)",
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-3 text-foreground/80">
                          <span className="text-destructive">×</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-lg font-bold text-destructive">
                        Total: $347 - $1,347+/month
                      </p>
                    </div>
                  </div>

                  <div className="card-glass border-primary">
                    <h3 className="text-xl font-bold text-foreground mb-4">
                      What You Get With Our CRM:
                    </h3>
                    <ul className="space-y-3">
                      {features.map((item) => (
                        <li key={item} className="flex items-center gap-3 text-foreground/80">
                          <Check className="h-5 w-5 text-primary flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 pt-4 border-t border-primary/30">
                      <p className="text-lg font-bold text-primary">Starting at just $97/month</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Use Cases */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Perfect For <span className="text-gradient">Your Industry</span>
                  </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    {
                      title: "Service Businesses",
                      examples: "HVAC, Plumbing, Roofing, Landscaping, Auto Repair",
                      benefit: "Automate follow-ups, collect reviews, and fill your schedule.",
                    },
                    {
                      title: "Professional Services",
                      examples: "Law Firms, Accountants, Consultants, Coaches",
                      benefit: "Nurture leads, book consultations, and manage client relationships.",
                    },
                    {
                      title: "Sales Teams",
                      examples: "Real Estate, Insurance, Financial Services",
                      benefit: "Track pipelines, automate outreach, and close more deals.",
                    },
                  ].map((useCase) => (
                    <div key={useCase.title} className="card-glass">
                      <h3 className="text-lg font-semibold text-foreground mb-2">{useCase.title}</h3>
                      <p className="text-sm text-primary mb-3">{useCase.examples}</p>
                      <p className="text-sm text-foreground/70">{useCase.benefit}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </ProductDetailLayout>
      </main>
    </Layout>
  );
};

export default CRM;
