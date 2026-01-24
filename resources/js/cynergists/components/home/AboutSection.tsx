import { ArrowRight, Zap, Shield, Target } from "lucide-react";
import { OrbitingButton } from "@/components/ui/orbiting-button";
import { Link } from "@inertiajs/react";
import aiOperationsImage from "@/assets/ai-operations-hero.webp";

const AboutSection = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={aiOperationsImage} 
                alt="AI-powered operations command center" 
                className="w-full h-auto object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-secondary/20 rounded-full blur-2xl" />
          </div>

          {/* Content */}
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Command Your <span className="text-gradient">Operations</span> Like Never Before
            </h2>
            
            <p className="text-muted-foreground text-lg mb-8">
              At Cynergists, we blend cutting-edge AI technology with expert operational leadership 
              to give your business superhero-level capabilities. Our team orchestrates your operations 
              with precision, efficiency, and strategic vision.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">AI-Powered Efficiency</h4>
                  <p className="text-muted-foreground text-sm">Automate workflows and eliminate bottlenecks with intelligent systems.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Human Oversight</h4>
                  <p className="text-muted-foreground text-sm">Dedicated managers who monitor, tune, and optimize your AI agents.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Strategic Growth</h4>
                  <p className="text-muted-foreground text-sm">Scale your business with the right people and proven processes.</p>
                </div>
              </div>
            </div>

            <OrbitingButton asChild size="lg" className="group">
              <Link href="/about">
                Learn About Us
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </OrbitingButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
