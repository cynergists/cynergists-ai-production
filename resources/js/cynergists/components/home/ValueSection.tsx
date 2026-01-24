import { CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "@inertiajs/react";
import { OrbitingButton } from "@/components/ui/orbiting-button";

const valuePoints = [
  "Faster response and follow up without extra headcount",
  "Cleaner handoffs between teams",
  "Less operational drag and fewer dropped balls",
  "More time for strategy, leadership, and growth"
];

const ValueSection = () => {
  return (
    <section className="py-24 bg-card/30 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
              <span className="text-sm text-primary font-medium">Immediate Leverage</span>
            </div>
            
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Get Back Time and{" "}
              <span className="text-gradient">Consistency</span>
            </h2>
            
            <h3 className="text-xl md:text-2xl text-muted-foreground font-medium mb-8">
              Reduce the work that steals momentum and leadership capacity
            </h3>
            
            <p className="text-muted-foreground leading-relaxed mb-8">
              When execution becomes consistent, your team stops playing cleanup and starts building. You reclaim time, reduce bottlenecks, and improve follow through.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-12">
            {valuePoints.map((point) => (
              <div key={point} className="card-glass p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{point}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <OrbitingButton asChild className="btn-primary group text-lg px-8 py-6">
              <Link href="/schedule">
                Assemble Your Team
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </OrbitingButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValueSection;
