import { Bot, ArrowRight } from "lucide-react";
import { OrbitingButton } from "@/components/ui/orbiting-button";
import { Link } from "@inertiajs/react";

const ServicesSection = () => {
  return (
    <section className="py-24 bg-card/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our <span className="text-gradient">Expert Solutions</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive AI Agent solutions designed to transform your business operations 
            and accelerate growth with superhero-level support.
          </p>
        </div>

        {/* Service Card */}
        <div className="max-w-xl mx-auto">
          <div className="card-glass group">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 
                          group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
              <Bot className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
            </div>
            
            <h3 className="font-display text-xl font-bold text-foreground mb-3">
              AI Agents & Automation
            </h3>
            
            <p className="text-muted-foreground mb-6">
              Leverage cutting-edge AI solutions to automate repetitive tasks, enhance customer service, and unlock new possibilities for your business.
            </p>
            
            <ul className="space-y-2 mb-6">
              {["Custom AI Agents", "Workflow Automation", "Data Analysis", "24/7 Support Bots"].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {feature}
                </li>
              ))}
            </ul>
            
            <OrbitingButton asChild variant="ghost" className="group/btn text-primary hover:text-primary hover:bg-primary/10 p-0">
              <Link href="/services">
                Learn More
                <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </OrbitingButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
