import heroCommander from "@/assets/hero-commander.webp";
import { CheckCircle } from "lucide-react";

const bullets = [
  {
    title: "Revenue Agents",
    description: "qualification, follow up, routing, pipeline hygiene, and enablement support"
  },
  {
    title: "Operations Agents",
    description: "task coordination, SOP execution, internal requests, and process automation"
  },
  {
    title: "Internal Workflow Agents",
    description: "reporting, documentation, knowledge retrieval, and cross team handoffs"
  }
];

const SolutionSection = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/50 via-transparent to-primary/5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Image */}
          <div className="relative rounded-2xl p-[3px] bg-gradient-to-br from-primary via-primary/60 to-secondary shadow-2xl">
            <img 
              src={heroCommander} 
              alt="Commander managing AI operations on a futuristic holographic display" 
              className="w-full h-auto rounded-xl object-cover"
            />
          </div>

          {/* Right Column - Text Content */}
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              AI Agents With{" "}
              <span className="text-gradient">Defined Roles</span>
            </h2>
            
            <h3 className="text-xl md:text-2xl text-foreground/70 font-medium mb-6">
              Built like specialists, deployed like a coordinated team
            </h3>
            
            <p className="text-foreground/80 text-lg leading-relaxed mb-8">
              Each agent is designed to own a specific job, with clear responsibilities, clear guardrails, and clear handoffs. Alone, they reduce drag. Together, they create momentum.
            </p>
            
            <div className="space-y-4 mb-8">
              {bullets.map((bullet) => (
                <div key={bullet.title} className="flex items-start gap-3 p-4 rounded-lg bg-card/50 dark:bg-card/30 border border-border/50">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground">{bullet.title}:</span>{" "}
                    <span className="text-foreground/70">{bullet.description}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-foreground/80 text-lg leading-relaxed">
              You get agents that work inside your existing systems, with human oversight that keeps execution accurate and controlled.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
