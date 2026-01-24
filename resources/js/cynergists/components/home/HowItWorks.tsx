import { ClipboardList, Cog, Rocket, Eye, ArrowRight } from "lucide-react";
import { OrbitingButton } from "@/components/ui/orbiting-button";
import { Link } from "@inertiajs/react";

const steps = [
  {
    icon: ClipboardList,
    step: "01",
    title: "Mission Briefing",
    description: "Identify the workflow, constraints, and success criteria.",
  },
  {
    icon: Cog,
    step: "02",
    title: "Agent Blueprint",
    description: "Define the role, tools, permissions, and escalation rules.",
  },
  {
    icon: Rocket,
    step: "03",
    title: "Deployment",
    description: "Connect systems, test in controlled conditions, then go live.",
  },
  {
    icon: Eye,
    step: "04",
    title: "Oversight",
    description: "Monitor, QA, and adjust to keep results consistent.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-background dark:bg-background light:bg-transparent relative overflow-hidden">
      {/* Background Effects - only show in dark mode */}
      <div className="absolute inset-0 dark:block hidden">
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
            <span className="text-sm text-primary font-medium">Your Deployment Path</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            From Mission Briefing to{" "}
            <span className="text-gradient">Live Execution</span>
          </h2>
          <h3 className="text-xl md:text-2xl text-muted-foreground font-medium mb-6">
            A proven build, deploy, and manage process that keeps your business in control
          </h3>
          <div className="max-w-3xl mx-auto space-y-4 text-muted-foreground">
            <p>
              We start by mapping the workflow you want off your plate, the data it touches, and the handoffs required for clean execution. Then we design the agent role, define its inputs and outputs, and set the rules for what it can do on its own versus what requires approval.
            </p>
            <p>
              After deployment, we monitor performance, fix edge cases, and continuously refine the agent as your business changes. Human experts design, deploy, and continuously tune every agent so it performs in real workflows, not demos.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group"
            >
              {/* Connector line (hidden on last item and mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
              )}

              <div className="card-glass h-full flex flex-col items-center text-center p-6 group-hover:border-primary/50 transition-all duration-300">
                {/* Step number badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  Step {step.step}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mt-2 group-hover:bg-primary/20 transition-colors">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>

                {/* Content */}
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
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
    </section>
  );
};

export default HowItWorks;
