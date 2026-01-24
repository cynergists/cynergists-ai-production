import { CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "@inertiajs/react";
import { OrbitingButton } from "@/components/ui/orbiting-button";

const departments = [
  {
    title: "Sales and RevOps",
    description: "lead handling, follow up, deal support, CRM upkeep"
  },
  {
    title: "Support and Success",
    description: "intake, triage, knowledge based responses, escalation routing"
  },
  {
    title: "Finance and Admin",
    description: "document handling, reminders, approvals, reconciliation support"
  },
  {
    title: "Leadership",
    description: "reporting, scorecards, weekly summaries, operational visibility"
  }
];

const BenefitsSection = () => {
  return (
    <section className="py-24 bg-background dark:bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-primary/5 dark:block hidden" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
              <span className="text-sm text-primary font-medium">Built for Real Teams</span>
            </div>
            
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Works Across{" "}
              <span className="text-gradient">Departments</span>
            </h2>
            
            <h3 className="text-xl md:text-2xl text-muted-foreground font-medium mb-8">
              The best fit is high volume work with clear rules and repeatable steps
            </h3>
            
            <p className="text-muted-foreground leading-relaxed">
              If a workflow is important, repeated, and currently handled by humans doing the same steps over and over, it belongs here.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {departments.map((dept) => (
              <div key={dept.title} className="card-glass p-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">{dept.title}</h4>
                    <p className="text-muted-foreground text-sm">{dept.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <OrbitingButton asChild className="btn-primary group text-lg px-8 py-6">
              <Link href="/marketplace">
                See Where It Fits
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </OrbitingButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
