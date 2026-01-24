import { Shield, CheckCircle } from "lucide-react";

const controls = [
  "Approval rules for sensitive actions",
  "Logging for visibility into actions and outputs",
  "Quality checks to reduce drift and errors",
  "Escalation paths when confidence is low or context is missing"
];

const ControlsSection = () => {
  return (
    <section className="py-24 bg-secondary/10 dark:bg-secondary/20 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-secondary/20 dark:bg-secondary/30 border border-secondary/40 rounded-full px-4 py-2 mb-6">
              <Shield className="h-4 w-4 text-secondary" />
              <span className="text-sm text-secondary font-medium">Guardrails First</span>
            </div>
            
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Control Is{" "}
              <span className="text-gradient">Not Optional</span>
            </h2>
            
            <h3 className="text-xl md:text-2xl text-foreground/70 font-medium mb-6">
              Agents should move fast, but never recklessly
            </h3>
            
            <p className="text-foreground/80 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
              Every agent is deployed with role based permissions, clear boundaries, and defined escalation paths. Autonomy is earned, not assumed.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-10">
            {controls.map((control) => (
              <div key={control} className="bg-card dark:bg-card/50 border border-border/50 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">{control}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-xl font-medium text-foreground">
              This is how you keep speed without losing trust.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ControlsSection;
