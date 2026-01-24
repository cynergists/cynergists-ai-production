import { useState, useRef } from "react";
import { Helmet } from "react-helmet";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { OrbitingButton } from "@/components/ui/orbiting-button";
import { Link } from "@inertiajs/react";
import { ArrowLeft, TrendingUp, Search, Link2, AlertTriangle, CheckCircle, Play, Pause, Volume2, VolumeX } from "lucide-react";
import jmAutoRepairLogo from "@/assets/case-studies/jm-auto-repair-logo.webp";
import beforeAfterSnapshot from "@/assets/case-studies/jm-auto-repair-before-after.png";
const JMAutoRepair = () => {
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
        <title>JM Auto Repair SEO Case Study | Cynergists</title>
        <meta name="description" content="How strategic SEO turned a local auto repair shop into a consistent lead engine. See how Cynergists increased organic traffic by 70% and ranking keywords by 91%." />
        <link rel="canonical" href="https://cynergists.com/case-studies/jm-auto-repair" />
        <meta property="og:title" content="JM Auto Repair SEO Case Study | Cynergists" />
        <meta property="og:description" content="How strategic SEO turned a local auto repair shop into a consistent lead engine. See how Cynergists increased organic traffic by 70% and ranking keywords by 91%." />
        <meta property="og:url" content="https://cynergists.com/case-studies/jm-auto-repair" />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="JM Auto Repair SEO Case Study | Cynergists" />
        <meta name="twitter:description" content="How strategic SEO turned a local auto repair shop into a consistent lead engine." />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "JM Auto Repair SEO Case Study",
            "description": "How strategic SEO turned a local auto repair shop into a consistent lead engine.",
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
                <Search className="h-4 w-4 text-primary" />
                <span className="text-sm text-primary font-medium">SEO Case Study</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
                From Invisible to{" "}
                <span className="text-gradient">70% More Traffic in 6 Months</span>
              </h1>
              <h2 className="text-xl md:text-2xl font-medium text-foreground/90 mb-6">
                How We Turned a Local Auto Shop Into a Lead-Generating Machine With Strategic SEO
              </h2>
            </div>
            
            {/* Video Player */}
            <div className="flex-shrink-0 w-full lg:w-auto lg:-ml-8">
              <div className="relative aspect-[9/16] w-full max-w-[340px] mx-auto lg:mx-0 rounded-2xl overflow-hidden shadow-2xl">
                <video
                  ref={videoRef}
                  src="/videos/jm-auto-repair-case-study.mp4"
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
              JM Auto Repair operates in a highly competitive local market where visibility directly impacts revenue. While the business had a website, it was not fully optimized for search engines and was underperforming in key areas that drive inbound demand.
            </p>
            
            <p className="text-lg text-muted-foreground mb-6">
              Before our engagement, the site suffered from:
            </p>
            
            <ul className="space-y-4 mb-8">
              {[
                "Weak on-page SEO fundamentals",
                "Thin service pages that failed to rank competitively",
                "Technical issues that limited crawlability and keyword expansion",
                "Missed opportunities to capture high-intent local searches"
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
            
            <p className="text-lg text-muted-foreground">
              The result was predictable: inconsistent organic traffic and reliance on referrals and paid channels to maintain steady business.
            </p>
          </div>
        </div>
      </section>

      {/* Starting Point */}
      <section className="py-16 lg:py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Starting Point <span className="text-gradient">(June 2025)</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8">
              At the beginning of the campaign, the website showed clear signs of technical and content debt.
            </p>
            
            <h3 className="font-display text-xl font-semibold text-foreground mb-6">Baseline Metrics:</h3>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {[
                { label: "On-Page SEO Score", value: "64" },
                { label: "Organic Monthly Traffic", value: "1,525" },
                { label: "Ranking Keywords", value: "248" },
                { label: "Backlinks", value: "186" },
                { label: "SEO Issues Identified", value: "57" },
              ].map((metric) => (
                <div key={metric.label} className="card-glass text-center p-6">
                  <div className="font-display text-3xl font-bold text-primary mb-2">{metric.value}</div>
                  <div className="text-sm text-muted-foreground">{metric.label}</div>
                </div>
              ))}
            </div>
            
            <p className="text-lg text-muted-foreground">
              At this stage, the site was functional but not competitive. Search engines could not clearly understand page intent, service relevance, or topical authority, which limited growth potential.
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
              Rather than chasing short-term tricks, we focused on building a durable SEO foundation designed to compound over time.
            </p>
            
            <h3 className="font-display text-xl font-semibold text-foreground mb-6">SEO Improvements Implemented:</h3>
            
            <ul className="space-y-4 mb-8">
              {[
                "Rebuilt page structure with proper H1s, titles, and metadata",
                "Expanded thin pages to fully match search intent for auto repair services",
                "Fixed duplicate titles, missing descriptions, and weak internal linking",
                "Cleaned up crawl issues, broken links, and 4XX errors",
                "Improved URL structure for better indexing and relevance",
                "Strengthened site authority through consistent backlink growth"
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
            
            <p className="text-lg text-muted-foreground">
              This work was executed and monitored through recurring audits to ensure progress without regression.
            </p>
          </div>
        </div>
      </section>

      {/* Growth Over Time */}
      <section className="py-16 lg:py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Growth <span className="text-gradient">Over Time</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8">
              As the foundation improved, the results followed.
            </p>
            
            <h3 className="font-display text-xl font-semibold text-foreground mb-6">Mid-Campaign Performance (July - September 2025):</h3>
            
            <ul className="space-y-4 mb-8">
              {[
                "SEO Score improved to 90+",
                "Organic traffic climbed above 2,400 monthly visitors",
                "Ranking keywords expanded to 355",
                "Backlinks grew steadily, reinforcing domain authority"
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
            
            <p className="text-lg text-muted-foreground">
              This confirmed that the site was no longer fragile. It was compounding.
            </p>
          </div>
        </div>
      </section>

      {/* Final Results */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Final Results <span className="text-gradient">(December 2025)</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8">
              By the end of the campaign, JM Auto Repair's website had become a reliable acquisition channel.
            </p>
            
            <h3 className="font-display text-xl font-semibold text-foreground mb-6">After Metrics:</h3>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {[
                { label: "On-Page SEO Score", value: "90", change: "+26" },
                { label: "Organic Monthly Traffic", value: "2,600+", change: "+70%" },
                { label: "Ranking Keywords", value: "475", change: "+91%" },
                { label: "Backlinks", value: "913", change: "+391%" },
                { label: "SEO Issues", value: "12", change: "-79%" },
              ].map((metric) => (
                <div key={metric.label} className="card-glass text-center p-6">
                  <div className="font-display text-3xl font-bold text-primary mb-1">{metric.value}</div>
                  <div className="text-sm text-green-400 mb-2">{metric.change}</div>
                  <div className="text-sm text-muted-foreground">{metric.label}</div>
                </div>
              ))}
            </div>
            
            <p className="text-lg text-muted-foreground mb-8">
              The site also achieved traffic peaks exceeding 3,000 monthly organic visitors, indicating sustained momentum rather than a temporary spike.
            </p>
            
            {/* Before vs After Snapshot */}
            <div className="card-glass p-6 lg:p-8">
              <h3 className="font-display text-2xl lg:text-3xl font-semibold text-foreground mb-8 text-center">
                Before vs After <span className="text-gradient">Snapshot</span>
              </h3>
              
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
                  { metric: "SEO Score", before: "64", after: "90" },
                  { metric: "Monthly Traffic", before: "1,525", after: "2,600+" },
                  { metric: "Ranking Keywords", before: "248", after: "475" },
                  { metric: "Backlinks", before: "186", after: "913" },
                  { metric: "SEO Issues", before: "57", after: "12" },
                ].map((row, index) => (
                  <>
                    <div key={`metric-${index}`} className="flex items-center justify-center p-3 lg:p-4 bg-muted/20 rounded-lg">
                      <span className="text-base lg:text-lg font-medium text-foreground text-center">{row.metric}</span>
                    </div>
                    <div key={`before-${index}`} className="flex items-center justify-center p-3 lg:p-4 bg-muted/10 rounded-lg">
                      <span className="text-lg lg:text-2xl font-bold text-muted-foreground">{row.before}</span>
                    </div>
                    <div key={`after-${index}`} className="flex items-center justify-center p-3 lg:p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <span className="text-lg lg:text-2xl font-bold text-primary">{row.after}</span>
                    </div>
                  </>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Impact */}
      <section className="py-16 lg:py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-foreground mb-8">
              Business <span className="text-gradient">Impact</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-6">
              This SEO growth translated directly into business results.
            </p>
            
            <ul className="space-y-4 mb-8">
              {[
                "More inbound calls and form submissions from high-intent local searches",
                "Reduced reliance on paid advertising to maintain lead volume",
                "Increased visibility for core repair services in local search results",
                "Stronger brand trust due to consistent Google presence",
                "A scalable marketing asset that continues working without additional ad spend"
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
            
            <p className="text-lg text-foreground font-medium">
              Instead of chasing customers, JM Auto Repair positioned itself where customers were already searching.
            </p>
          </div>
        </div>
      </section>

      {/* Conclusion */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="card-glass p-8 lg:p-12 text-center">
              <p className="text-xl text-foreground font-medium mb-8">
                SEO done correctly does not just increase traffic. It increases predictability.
              </p>
              
              <p className="text-lg text-muted-foreground mb-6">
                JM Auto Repair now owns a search presence that:
              </p>
              
              <ul className="space-y-4 text-left max-w-xl mx-auto mb-8">
                {[
                  "Continues to attract local customers every month",
                  "Compounds over time instead of resetting like ads",
                  "Creates leverage against competitors who rely on short-term tactics"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              
              <p className="text-lg text-foreground font-semibold">
                This is what happens when SEO is treated as infrastructure, not an experiment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">
            Ready to Build Your Own Lead Engine?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Let's discuss how Cynergists can help you achieve similar results for your business.
          </p>
          <OrbitingButton asChild className="btn-primary">
            <Link href="/schedule">Schedule a Call</Link>
          </OrbitingButton>
        </div>
      </section>
    </Layout>
  );
};

export default JMAutoRepair;
