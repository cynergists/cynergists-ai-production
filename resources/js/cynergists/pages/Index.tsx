import { Helmet } from "react-helmet";
import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import HowItWorks from "@/components/home/HowItWorks";
import ProblemSection from "@/components/home/ProblemSection";
import SolutionSection from "@/components/home/SolutionSection";
import BenefitsSection from "@/components/home/BenefitsSection";
import ControlsSection from "@/components/home/ControlsSection";
import ProofSection from "@/components/home/ProofSection";
import FAQSection from "@/components/home/FAQSection";
import CTASection from "@/components/home/CTASection";
import LogoCarousel from "@/components/home/LogoCarousel";
import TestimonialsSection from "@/components/home/TestimonialsSection";


const homepageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Cynergists | AI Agents That Work For Your Business",
  "description": "Cynergists designs, deploys, and manages AI Agents that take full ownership of revenue, operations, and internal workflows.",
  "url": "https://cynergists.com/",
  "mainEntity": {
    "@type": "Organization",
    "name": "Cynergists",
    "url": "https://cynergists.com",
    "logo": "https://cynergists.com/logo.png",
    "description": "AI Agents that automate revenue, operations, and internal workflows."
  }
};

const homepageFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Do I need superpowers to use AI Agents?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. You need clear goals and a real workflow. We handle design, deployment, and ongoing tuning. Your team stays in control with defined approvals and guardrails."
      }
    },
    {
      "@type": "Question",
      "name": "Are these agents pre built or custom?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "They are built around your workflows and your tools. Some parts may be reusable patterns, but the deployment is tailored to how your business operates."
      }
    },
    {
      "@type": "Question",
      "name": "What tools can you connect to?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We connect to the systems you already use, then design the agent role around what is possible and safe inside those systems."
      }
    },
    {
      "@type": "Question",
      "name": "How do you prevent mistakes or risky actions?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We define permissions, approvals, and escalation rules up front, then monitor performance and refine edge cases over time."
      }
    },
    {
      "@type": "Question",
      "name": "Who owns the process after launch?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You do. We provide ongoing management and human oversight so the agents remain reliable as your business changes."
      }
    }
  ]
};

const Index = () => {
  return (
    <Layout>
      <Helmet>
        <title>Cynergists | AI Agents That Work For Your Business</title>
        <meta name="description" content="Cynergists designs, deploys, and manages AI Agents that take full ownership of revenue, operations, and internal workflows. Assemble your team today." />
        <link rel="canonical" href="https://cynergists.com/" />
        <meta property="og:title" content="Cynergists | AI Agents That Work For Your Business" />
        <meta property="og:description" content="Cynergists designs, deploys, and manages AI Agents that take full ownership of revenue, operations, and internal workflows." />
        <meta property="og:url" content="https://cynergists.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://cynergists.com/og-image.webp" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Cynergists | AI Agents That Work For Your Business" />
        <meta name="twitter:description" content="Cynergists designs, deploys, and manages AI Agents that take full ownership of revenue, operations, and internal workflows." />
        <meta name="twitter:image" content="https://cynergists.com/og-image.webp" />
        <script type="application/ld+json">
          {JSON.stringify(homepageSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(homepageFaqSchema)}
        </script>
      </Helmet>
      <HeroSection />
      <HowItWorks />
      <LogoCarousel />
      <ProblemSection />
      <SolutionSection />
      <BenefitsSection />
      <ControlsSection />
      <TestimonialsSection />
      <ProofSection />
      <FAQSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
