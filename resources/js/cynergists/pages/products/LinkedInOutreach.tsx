import { Helmet } from "react-helmet";
import Layout from "@/components/layout/Layout";
import ProductDetailLayout from "@/components/products/ProductDetailLayout";
import { Linkedin, Check } from "lucide-react";

const features = [
  "100% human-operated, no software or bots",
  "Your account stays safe and compliant",
  "Personalized messages that start real conversations",
  "Warm prospects delivered directly to your calendar",
  "Targeted connection requests to ideal prospects",
  "Dedicated outreach specialist assigned to you",
  "Weekly performance reports",
  "Custom messaging sequences based on your ICP",
];

const whosItFor = `B2B companies looking to grow their pipeline
Consultants and coaches needing more qualified leads
Service providers targeting specific industries
Anyone who wants LinkedIn leads without the risk`;

const integrations = [
  "LinkedIn Sales Navigator",
  "Calendly",
  "HubSpot CRM",
  "Salesforce",
  "Zoom",
];

const LinkedInOutreach = () => {
  return (
    <Layout>
      <Helmet>
        <title>LinkedIn Outreach | Cynergists - Human-Powered Lead Generation</title>
        <meta
          name="description"
          content="Human-driven LinkedIn outreach service. No bots, no third-party software. We connect with your ideal prospects and schedule Zoom meetings on your calendar."
        />
        <meta
          name="keywords"
          content="LinkedIn outreach, lead generation, B2B prospecting, human outreach, LinkedIn marketing, appointment setting"
        />
        <link rel="canonical" href="https://cynergists.com/products/linkedin-outreach" />
      </Helmet>

      <main>
        <ProductDetailLayout
          id="linkedin-outreach-growth"
          name="Human-Powered LinkedIn Outreach"
          category="LinkedIn Outreach"
          categoryIcon={<Linkedin className="h-4 w-4 text-primary" />}
          shortDescription="Real humans. Real connections. Real meetings on your calendar. Forget the bots and automation tools that get accounts banned."
          price={1997}
          billingPeriod="monthly"
          features={features}
          whosItFor={whosItFor}
          integrations={integrations}
          primaryCtaText="Add to Cart"
          secondaryCtaText="Schedule a Strategy Call"
          secondaryCtaLink="/schedule"
        >
          {/* Problem/Solution Section */}
          <section className="py-20 bg-card/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-4">
                      The Problem with LinkedIn Automation
                    </h2>
                    <ul className="space-y-3 text-foreground/80">
                      {[
                        "Third-party tools violate LinkedIn's terms of service",
                        "Accounts get restricted or permanently banned",
                        "Generic, robotic messages that prospects ignore",
                        "No genuine relationship building",
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <span className="text-destructive font-bold">✕</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-4">
                      The Cynergists Difference
                    </h2>
                    <ul className="space-y-3 text-foreground/80">
                      {[
                        "100% human-operated, no software or bots",
                        "Your account stays safe and compliant",
                        "Personalized messages that start real conversations",
                        "Warm prospects delivered directly to your calendar",
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    How It <span className="text-gradient">Works</span>
                  </h2>
                  <p className="text-lg text-foreground/80">
                    A simple, transparent process from strategy to booked meetings.
                  </p>
                </div>

                <div className="grid md:grid-cols-4 gap-6">
                  {[
                    {
                      step: "1",
                      title: "Define Your ICP",
                      description:
                        "We work with you to identify your ideal customer profile and targeting criteria.",
                    },
                    {
                      step: "2",
                      title: "Connect & Engage",
                      description:
                        "Our team sends personalized connection requests to qualified prospects.",
                    },
                    {
                      step: "3",
                      title: "Nurture Responses",
                      description:
                        "When prospects accept, we engage with tailored messaging sequences.",
                    },
                    {
                      step: "4",
                      title: "Book Meetings",
                      description:
                        "Interested prospects are scheduled directly on your calendar.",
                    },
                  ].map((item) => (
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
        </ProductDetailLayout>
      </main>
    </Layout>
  );
};

export default LinkedInOutreach;
