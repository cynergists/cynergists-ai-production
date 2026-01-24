import { OrbitingButton } from "@/components/ui/orbiting-button";
import { ArrowRight } from "lucide-react";
import { Link } from "@inertiajs/react";

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-background dark:bg-background">
      {/* Background - only in dark mode */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 dark:block hidden" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl dark:block hidden" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl dark:block hidden" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
            <span className="text-sm text-primary font-medium">Your Mission Briefing</span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Ready to Reclaim Your Time and{" "}
            <span className="text-gradient">Grow Without the Chaos?</span>
          </h2>
          <h3 className="text-xl md:text-2xl text-muted-foreground font-medium mb-8">
            Stop letting manual work drain your team while competitors move faster
          </h3>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Every week you wait is another week lost to busywork, delays, and stalled execution. The companies that win build a team that can operate daily without constant supervision.
          </p>
          <p className="text-lg text-foreground mb-8 max-w-2xl mx-auto">
            If you want AI Agents that work in real workflows with expert humans keeping them precise and safe, you are in the right place.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <OrbitingButton asChild className="btn-primary group text-lg px-8 py-6">
              <Link href="/marketplace">
                Explore the Marketplace
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </OrbitingButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
