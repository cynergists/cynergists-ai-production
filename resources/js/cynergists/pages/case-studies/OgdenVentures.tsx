import { useState, useRef } from "react";
import { Helmet } from "react-helmet";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { OrbitingButton } from "@/components/ui/orbiting-button";
import { Link } from "@inertiajs/react";
import { ArrowLeft, Settings, AlertTriangle, CheckCircle, Play, Pause, Volume2, VolumeX, ArrowRight, Quote } from "lucide-react";
import ogdenVenturesLogo from "@/assets/logos/ogden-ventures.webp";

const OgdenVentures = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [hasUnmuted, setHasUnmuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (isMuted) {
        setHasUnmuted(true);
        videoRef.current.currentTime = 0;
        videoRef.current.loop = false;
      }
    }
  };

  const handleVideoEnded = () => {
    if (hasUnmuted) {
      setIsPlaying(false);
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>Ogden Ventures Case Study | Cynergists</title>
        <meta name="description" content="How Operational Infrastructure Enabled Scalable Content, Outreach, and Automation for Ogden Ventures. See how Cynergists transformed fragmented systems into an integrated operational backbone." />
        <link rel="canonical" href="https://cynergists.com/case-studies/ogden-ventures" />
        <meta property="og:title" content="Ogden Ventures Case Study | Cynergists" />
        <meta property="og:description" content="How Operational Infrastructure Enabled Scalable Content, Outreach, and Automation for Ogden Ventures." />
        <meta property="og:url" content="https://cynergists.com/case-studies/ogden-ventures" />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ogden Ventures Case Study | Cynergists" />
        <meta name="twitter:description" content="How Operational Infrastructure Enabled Scalable Content, Outreach, and Automation for Ogden Ventures." />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Ogden Ventures Case Study",
            "description": "How Operational Infrastructure Enabled Scalable Content, Outreach, and Automation for Ogden Ventures.",
            "author": {
              "@type": "Organization",
              "name": "Cynergists"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Cynergists"
            }
          })}
        </script>
      </Helmet>

      {/* Hero */}
      <section className="py-20 lg:py-32 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <Link href="/case-studies" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Case Studies
          </Link>
          
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
                <Settings className="h-4 w-4 text-primary" />
                <span className="text-sm text-primary font-medium">Operations Case Study</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
                From Scattered Systems to{" "}
                <span className="text-gradient">Scalable Growth Engine</span>
              </h1>
              <h2 className="text-xl md:text-2xl font-medium text-foreground/90 mb-6">
                How We Built the Operational Backbone That Powers Ogden Ventures' Content and Outreach
              </h2>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="text-foreground font-medium">Client:</span> Marcus Ogden, CEO and Founder of Ogden Ventures LLC
                </div>
                <div>
                  <span className="text-foreground font-medium">Partner:</span> Cynergists
                </div>
              </div>
            </div>
            
            {/* Video Player */}
            <div className="flex-shrink-0 w-full lg:w-auto lg:-ml-8">
              <div className="relative aspect-[9/16] w-full max-w-[340px] mx-auto lg:mx-0 rounded-2xl overflow-hidden shadow-2xl">
                <video
                  ref={videoRef}
                  src="/videos/ogden-ventures-case-study.mp4"
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop={!hasUnmuted}
                  playsInline
                  onEnded={handleVideoEnded}
                />
                
                {/* Video Controls */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10">
                  <button
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full bg-background/80 hover:bg-background flex items-center justify-center transition-colors"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5 text-foreground" />
                    ) : (
                      <Play className="h-5 w-5 text-foreground ml-0.5" />
                    )}
                  </button>
                  <button
                    onClick={toggleMute}
                    className="w-10 h-10 rounded-full bg-background/80 hover:bg-background flex items-center justify-center transition-colors"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? (
                      <VolumeX className="h-5 w-5 text-foreground" />
                    ) : (
                      <Volume2 className="h-5 w-5 text-foreground" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Challenge */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-foreground mb-8">
              The <span className="text-gradient">Challenge</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-6">
              Ogden Ventures was expanding its brand presence across podcasts, social platforms, LinkedIn outreach, and CRM-driven follow-ups. While growth was happening, the backend operations were becoming increasingly fragmented.
            </p>
            
            <p className="text-lg text-muted-foreground mb-6">
              Before engaging Cynergists, the business faced:
            </p>
            
            <ul className="space-y-4 mb-8">
              {[
                "Disconnected systems across podcasting, outreach, and CRM",
                "Manual processes limiting speed and consistency",
                "Operational bottlenecks slowing execution",
                "Founder dependency for coordination and problem resolution",
                "Lack of centralized automation to support scale"
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
            
            <p className="text-lg text-muted-foreground">
              The result was growing complexity. Strategic ideas existed, but execution required too much founder involvement to remain sustainable.
            </p>
          </div>
        </div>
      </section>

      {/* Starting Point */}
      <section className="py-16 lg:py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Starting <span className="text-gradient">Point</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8">
              At the start of the engagement, Ogden Ventures had momentum but lacked an integrated operational backbone.
            </p>
            
            <h3 className="font-display text-xl font-semibold text-foreground mb-6">Initial State Overview:</h3>
            
            <ul className="space-y-4 mb-8">
              {[
                "Podcast production without standardized workflows",
                "CRM in place but underutilized",
                "Manual outreach processes",
                "Limited automation between platforms",
                "No unified system connecting content, distribution, and follow-up"
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
            
            <p className="text-lg text-muted-foreground">
              The business was functional, but not yet built to scale efficiently.
            </p>
          </div>
        </div>
      </section>

      {/* What We Did */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              What We <span className="text-gradient">Did</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8">
              Rather than offering isolated services, Cynergists acted as an embedded operations and execution partner.
            </p>
            
            <h3 className="font-display text-xl font-semibold text-foreground mb-6">Operational Infrastructure Implemented:</h3>
            
            <ul className="space-y-4 mb-8">
              {[
                "Built scalable systems for podcast operations",
                "Structured CRM workflows for outreach and follow-up",
                "Implemented automation across platforms to reduce manual effort",
                "Executed LinkedIn and social media posting consistently",
                "Handled video editing and content distribution",
                "Aligned strategy with tactical execution across channels"
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
            
            <p className="text-lg text-muted-foreground">
              All systems were designed to work together, creating a cohesive operating environment instead of siloed tools.
            </p>
          </div>
        </div>
      </section>

      {/* Execution Philosophy */}
      <section className="py-16 lg:py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-foreground mb-8">
              Execution <span className="text-gradient">Philosophy</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-6">
              Speed and responsiveness were core differentiators.
            </p>
            
            <p className="text-lg text-muted-foreground mb-6">
              When issues surfaced or adjustments were needed, Cynergists addressed them immediately. This prevented delays, minimized friction, and allowed the brand to maintain momentum without interruption.
            </p>
            
            <p className="text-lg text-muted-foreground">
              The team operated as an extension of Ogden Ventures, covering multiple operational angles simultaneously without sacrificing quality or clarity.
            </p>
          </div>
        </div>
      </section>

      {/* Results Over Time */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Results <span className="text-gradient">Over Time</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8">
              As systems matured, operational clarity followed.
            </p>
            
            <h3 className="font-display text-xl font-semibold text-foreground mb-6">Key Outcomes:</h3>
            
            <ul className="space-y-4 mb-8">
              {[
                "Improved organization across all operational systems",
                "More strategic alignment between content, outreach, and CRM",
                "Faster execution without increasing internal workload",
                "Reduced operational noise for leadership",
                "Greater confidence in launching and scaling initiatives"
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
            
            <p className="text-lg text-muted-foreground mb-4">
              According to Marcus, the brand became:
            </p>
            
            <div className="flex flex-wrap gap-4">
              {["More organized", "More strategic", "More tactical"].map((item) => (
                <span key={item} className="bg-primary/10 border border-primary/30 text-primary px-4 py-2 rounded-full text-sm font-medium">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Before vs After */}
      <section className="py-16 lg:py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-foreground mb-8 text-center">
              Before vs After <span className="text-gradient">Snapshot</span>
            </h2>
            
            <div className="card-glass p-6 lg:p-8">
              <div className="grid grid-cols-3 gap-4 lg:gap-6">
                {/* Header Row */}
                <div className="text-center">
                  <span className="text-lg lg:text-xl font-semibold text-muted-foreground">Metric</span>
                </div>
                <div className="text-center">
                  <span className="text-lg lg:text-xl font-semibold text-muted-foreground">Before</span>
                </div>
                <div className="text-center">
                  <span className="text-lg lg:text-xl font-semibold text-muted-foreground">After</span>
                </div>
                
                {/* Data Rows */}
                {[
                  { metric: "Operational Structure", before: "Fragmented", after: "Integrated" },
                  { metric: "CRM Utilization", before: "Limited", after: "Fully leveraged" },
                  { metric: "Content Execution", before: "Inconsistent", after: "Systemized" },
                  { metric: "Automation", before: "Minimal", after: "Cross-platform" },
                  { metric: "Founder Dependency", before: "High", after: "Reduced" },
                ].map((row, index) => (
                  <>
                    <div key={`metric-${index}`} className="flex items-center justify-center p-3 lg:p-4 bg-muted/20 rounded-lg">
                      <span className="text-base lg:text-lg font-medium text-foreground text-center">{row.metric}</span>
                    </div>
                    <div key={`before-${index}`} className="flex items-center justify-center p-3 lg:p-4 bg-muted/10 rounded-lg">
                      <span className="text-base lg:text-lg font-semibold text-muted-foreground text-center">{row.before}</span>
                    </div>
                    <div key={`after-${index}`} className="flex items-center justify-center p-3 lg:p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <span className="text-base lg:text-lg font-semibold text-primary text-center">{row.after}</span>
                    </div>
                  </>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Impact */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-foreground mb-8">
              Business <span className="text-gradient">Impact</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-6">
              The operational improvements translated directly into business leverage.
            </p>
            
            <ul className="space-y-4 mb-8">
              {[
                "Smoother execution across podcasts, outreach, and content",
                "Faster turnaround on requests and adjustments",
                "Improved consistency across brand touchpoints",
                "Less time spent managing tools and processes",
                "More time allocated to leadership, strategy, and growth"
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
            
            <p className="text-lg text-muted-foreground">
              Instead of managing systems, leadership could focus on direction.
            </p>
          </div>
        </div>
      </section>

      {/* Client Testimonial */}
      <section className="py-16 lg:py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-foreground mb-8 text-center">
              Client <span className="text-gradient">Testimonial</span>
            </h2>
            
            <div className="card-glass p-8 lg:p-12 relative">
              <Quote className="absolute top-6 left-6 h-12 w-12 text-primary/20" />
              
              <blockquote className="relative z-10">
                <p className="text-lg lg:text-xl text-foreground/90 italic mb-6 pl-8">
                  "They are sensational. Ryan and his team are fantastic at every angle of scaling a business. They helped our brand scale systems, operational setup, podcasting, outreach, CRM, automation, LinkedIn, social media, posting, and video editing.
                </p>
                <p className="text-lg lg:text-xl text-foreground/90 italic mb-6 pl-8">
                  What I love most is how responsive they are. If something needs to be addressed, they are on it right away.
                </p>
                <p className="text-lg lg:text-xl text-foreground/90 italic mb-8 pl-8">
                  They helped our brand tremendously get more organized, more strategic, and more tactical."
                </p>
                <footer className="pl-8">
                  <p className="font-semibold text-foreground">— Marcus Ogden</p>
                  <p className="text-muted-foreground">CEO, Ogden Ventures LLC</p>
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* The Takeaway */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-foreground mb-8">
              The <span className="text-gradient">Takeaway</span>
            </h2>
            
            <p className="text-xl text-foreground font-medium mb-6">
              Operational scaling is not about adding tools. It is about removing friction.
            </p>
            
            <p className="text-lg text-muted-foreground mb-6">
              Ogden Ventures now operates with:
            </p>
            
            <ul className="space-y-4 mb-8">
              {[
                "Systems that support growth instead of slowing it",
                "Execution that keeps pace with strategy",
                "Infrastructure that scales without founder burnout"
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
            
            <p className="text-lg text-foreground font-medium">
              This is what happens when operations are treated as infrastructure, not overhead.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 bg-card/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">
            Ready to Build Operational Leverage?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Let's discuss how Cynergists can help you systemize execution and scale without chaos.
          </p>
          <OrbitingButton asChild className="btn-primary text-xl px-12 py-8 group">
            <Link href="/schedule">
              Schedule a Call
              <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </OrbitingButton>
        </div>
      </section>
    </Layout>
  );
};

export default OgdenVentures;
