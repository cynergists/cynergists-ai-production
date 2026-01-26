import { Helmet } from "react-helmet";
import Layout from "@/components/layout/Layout";
import { OrbitingButton } from "@/components/ui/orbiting-button";
import { Link } from "@inertiajs/react";
import { Shield, Users, Globe, Heart, ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const aboutFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is Cynergists a Veteran-Owned company?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Cynergists is a Veteran-Owned and Operated company. We know what it means to serve a mission greater than ourselves, and we bring military-level discipline, communication, and leadership to every client engagement."
      }
    },
    {
      "@type": "Question",
      "name": "Where is the Cynergists team located?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Your points of contact (The Command Structure) are right here in the US, ensuring clear communication and strategy. Our Operatives are sourced from the top 1% of global talent: specialists, tech-wizards, and logistical geniuses brought under one banner."
      }
    },
    {
      "@type": "Question",
      "name": "How does Cynergists treat its staff?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Unlike most agencies that treat staff like disposable assets, we treat ours like Elite Units. We pay well, train hard, and offer career paths, not just gigs. Because we take care of our people, they take care of your business."
      }
    },
    {
      "@type": "Question",
      "name": "What does Cynergists handle for business owners?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We handle the heavy lifting, including the automation, the AI agents, and the tech, so you can focus on the one thing only you can do: Leading the Mission."
      }
    }
  ]
};

const About = () => {
  return (
    <Layout>
      <Helmet>
        <title>About Cynergists | Veteran-Owned AI Agents Headquarters</title>
        <meta name="description" content="Cynergists is a Veteran-Owned company providing AI Agents that automate revenue, operations, and internal workflows. We give entrepreneurs their power back." />
        <link rel="canonical" href="https://cynergists.ai/about" />
        <meta property="og:title" content="About Cynergists | Veteran-Owned AI Agents Headquarters" />
        <meta property="og:description" content="Cynergists is a Veteran-Owned company providing AI Agents that automate revenue, operations, and internal workflows. We give entrepreneurs their power back." />
        <meta property="og:url" content="https://cynergists.ai/about" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://cynergists.ai/og-image.webp" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About Cynergists | Veteran-Owned AI Agents Headquarters" />
        <meta name="twitter:description" content="Cynergists is a Veteran-Owned company providing AI Agents that automate your business." />
        <meta name="twitter:image" content="https://cynergists.ai/og-image.webp" />
        <script type="application/ld+json">
          {JSON.stringify(aboutFaqSchema)}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="py-20 lg:py-32 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">About Cynergists</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Even Heroes Need a{" "}
              <span className="text-gradient">Headquarters</span>.
            </h1>
            
            <h2 className="text-xl md:text-2xl font-medium text-foreground/90 mb-8">
              You Are Saving the World. We Are <span className="text-gradient">Keeping the Lights On</span>.
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="prose prose-lg prose-invert mx-auto text-left">
              <p className="text-lg text-foreground/80 mb-6">
                Every great hero in history had a team behind them. A voice in their ear guiding them through the chaos. A crew back at base building the gadgets, monitoring the threats, and clearing the path.
              </p>
              
              <p className="text-lg text-foreground/80 mb-6">
                Cynergists exists to be that crew.
              </p>
              
              <p className="text-lg text-foreground/80 mb-6">
                We didn't start this company just to fill seats. We started it because we saw too many brilliant entrepreneurs (the Heroes) getting bogged down by the "villains" of business: administrative busywork, operational chaos, and the hiring nightmare.
              </p>
              
              <p className="text-lg text-foreground/80 font-semibold">
                We built Cynergists to give you your power back.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Born from Service Section */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                Born from Service.{" "}
                <span className="text-gradient">Built for Discipline.</span>
              </h2>
            </div>

            <div className="prose prose-lg prose-invert mx-auto text-left mb-12">
              <p className="text-lg text-foreground/80 mb-6">
                We are a Veteran-Owned and Operated company.
              </p>
              
              <p className="text-lg text-foreground/80 mb-6">
                We know what it means to serve a mission greater than ourselves. We know that a team is only as effective as its discipline, its communication, and its leadership.
              </p>
              
              <p className="text-lg text-foreground/80 mb-8">
                When you work with us, you aren't just getting a "freelancer." You are getting a squad that operates with military precision.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="card-glass">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-4">The Command Structure</h3>
                <p className="text-foreground/80">
                  Your points of contact are right here in the US, ensuring clear communication and strategy.
                </p>
              </div>
              
              <div className="card-glass">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Globe className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-4">The Operatives</h3>
                <p className="text-foreground/80">
                  We scour the globe to find the top 1% of talent, the specialists, the tech-wizards, and the logistical geniuses, and bring them under one banner.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secret Identity Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                The "Secret Identity" of{" "}
                <span className="text-gradient">Our Success</span>
              </h2>
            </div>

            <div className="prose prose-lg prose-invert mx-auto text-left">
              <p className="text-lg text-foreground/80 mb-6">
                Most agencies treat their staff like disposable assets. We treat ours like Elite Units.
              </p>
              
              <p className="text-lg text-foreground/80 mb-6">
                We believe that to get superhero performance, you have to treat people with respect. We pay well. We train hard. We offer career paths, not just gigs.
              </p>
              
              <p className="text-lg text-foreground/80">
                Because we take care of our people, they take care of your business. They show up ready to fight for your brand, not just to punch a clock.
              </p>
            </div>

            <div className="flex justify-center mt-12">
              <div className="card-glass max-w-md text-center">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <Heart className="h-7 w-7 text-primary" />
                </div>
                <p className="text-foreground/80 italic">
                  "Because we take care of our people, they take care of your business."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Your Mission Section */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                Your Mission is{" "}
                <span className="text-gradient">Our Command</span>.
              </h2>
            </div>

            <div className="prose prose-lg prose-invert mx-auto text-left mb-12">
              <p className="text-lg text-foreground/80 mb-6">
                You have a choice.
              </p>
              
              <p className="text-lg text-foreground/80 mb-6">
                You can continue to be the "Lone Wolf," trying to fight every battle, answer every email, and put out every fire alone until you burn out.
              </p>
              
              <p className="text-lg text-foreground/80 mb-6">
                Or you can activate your Support Crew.
              </p>
              
              <p className="text-lg text-foreground/80">
                We handle the heavy lifting, including the automation, the AI agents, and the tech, so you can focus on the one thing only you can do: Leading the Mission.
              </p>
            </div>

            <div className="flex justify-center">
              <OrbitingButton asChild className="btn-primary text-lg px-8 py-6">
                <Link href="/contact">
                  Deploy My Team
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </OrbitingButton>
            </div>
          </div>
        </div>
      </section>

      {/* AEO FAQ Section */}
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
              <AccordionItem value="item-1" className="card-glass px-6">
                <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline data-[state=open]:text-primary">
                  Is Cynergists a Veteran-Owned company?
                </AccordionTrigger>
                <AccordionContent className="text-foreground/80 text-base">
                  Yes. Cynergists is a Veteran-Owned and Operated company. We know what it means to serve a mission greater than ourselves, and we bring military-level discipline, communication, and leadership to every client engagement.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="card-glass px-6">
                <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline data-[state=open]:text-primary">
                  Where is the Cynergists team located?
                </AccordionTrigger>
                <AccordionContent className="text-foreground/80 text-base">
                  Your points of contact (The Command Structure) are right here in the US, ensuring clear communication and strategy. Our Operatives are sourced from the top 1% of global talent: specialists, tech-wizards, and logistical geniuses brought under one banner.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="card-glass px-6">
                <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline data-[state=open]:text-primary">
                  How does Cynergists treat its staff?
                </AccordionTrigger>
                <AccordionContent className="text-foreground/80 text-base">
                  Unlike most agencies that treat staff like disposable assets, we treat ours like Elite Units. We pay well, train hard, and offer career paths, not just gigs. Because we take care of our people, they take care of your business.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="card-glass px-6">
                <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline data-[state=open]:text-primary">
                  What does Cynergists handle for business owners?
                </AccordionTrigger>
                <AccordionContent className="text-foreground/80 text-base">
                  We handle the heavy lifting, including the automation, the AI agents, and the tech, so you can focus on the one thing only you can do: Leading the Mission.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
