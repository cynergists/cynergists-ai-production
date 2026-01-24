import { CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "@inertiajs/react";
import { OrbitingButton } from "@/components/ui/orbiting-button";

const proofPoints = [
  "Production ready design with defined roles and responsibilities",
  "Human oversight for setup, monitoring, and refinement",
  "Ongoing maintenance so agents improve instead of degrade"
];

const ProofSection = () => {
  return (
    <section className="py-24 bg-background dark:bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 dark:block hidden" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
              <span className="text-sm text-primary font-medium">Built for Production</span>
            </div>
            
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              This Is Not a{" "}
              <span className="text-gradient">Toy Deployment</span>
            </h2>
            
            <h3 className="text-xl md:text-2xl text-muted-foreground font-medium mb-8">
              You are building an execution capability, not running an experiment
            </h3>
            
            <p className="text-muted-foreground leading-relaxed mb-8">
              Cynergists builds agents to operate inside real workflows with real constraints. We do not ship prototypes and disappear. We manage the system and keep it dependable as your processes evolve.
            </p>
          </div>

          <div className="space-y-4 mb-12">
            {proofPoints.map((point) => (
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

export default ProofSection;
