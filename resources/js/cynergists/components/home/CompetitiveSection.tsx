import { CheckCircle } from "lucide-react";

const advantages = [
  "Faster cycles from request to completion",
  "More predictable outcomes across teams",
  "Less dependency on individual heroics",
  "Stronger operational discipline without bureaucracy"
];

const CompetitiveSection = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-primary/5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
              <span className="text-sm text-primary font-medium">Win With Coordination</span>
            </div>
            
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Most Companies{" "}
              <span className="text-gradient">Add Tools</span>
            </h2>
            
            <h3 className="text-xl md:text-2xl text-muted-foreground font-medium mb-8">
              The winners add an execution unit
            </h3>
            
            <p className="text-muted-foreground leading-relaxed mb-8">
              Tools require humans to drive them. Agents execute inside them. When your workflow engine runs every day with consistency, you move faster than competitors who rely on manual effort and best intentions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {advantages.map((advantage) => (
              <div key={advantage} className="card-glass p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{advantage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompetitiveSection;
