import { Link } from "@inertiajs/react";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight } from "lucide-react";
import { 
  essentialsAgents, 
  BASE_PLAN_PRICE, 
  calcIncludedValue, 
  calcBundleSavings, 
  formatCurrency 
} from "@/data/essentialsAgents";

export function EssentialsBundleBanner() {
  const includedValue = calcIncludedValue();
  const bundleSavings = calcBundleSavings();

  return (
    <Link 
      href="/marketplace/essentials"
      className="block relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 dark:from-slate-900 dark:via-slate-800 dark:to-teal-900 border-y border-lime-500/30 hover:border-lime-500/50 transition-all group cursor-pointer"
    >
      {/* Futuristic background elements */}
      <div className="absolute inset-0">
        {/* Animated glow orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-lime-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl" />
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(132,204,22,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(132,204,22,0.5) 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
        {/* Scanline effect */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(132,204,22,0.1) 2px, rgba(132,204,22,0.1) 4px)`
          }}
        />
      </div>

      {/* Decorative corner accents */}
      <div className="absolute top-6 left-6 flex gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-lime-500" />
        <div className="w-1.5 h-1.5 rounded-full bg-lime-500" />
        <div className="w-1.5 h-1.5 rounded-full bg-lime-500" />
      </div>
      <div className="absolute top-8 right-12 w-3 h-3 border border-lime-500/50 rotate-45 group-hover:border-lime-500 transition-colors" />
      <div className="absolute bottom-8 right-8 flex gap-1">
        <div className="w-1.5 h-1.5 bg-lime-500/50" />
        <div className="w-1.5 h-1.5 bg-lime-500/50" />
        <div className="w-1.5 h-1.5 bg-lime-500/50" />
      </div>

      <div className="container mx-auto px-4 py-10 md:py-14 relative">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left side - Content */}
          <div className="flex-1 text-center lg:text-left">
            <Badge className="mb-3 bg-lime-500/20 text-accent dark:text-lime-400 border-lime-500/30">
              <Sparkles className="h-3 w-3 mr-1" />
              Bundle & Save
            </Badge>
            
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
              <span className="text-foreground">The </span>
              <span className="text-gradient">Essentials Plan</span>
            </h2>
            
            <p className="text-muted-foreground mb-4 max-w-xl">
              6 AI Agents included for {formatCurrency(BASE_PLAN_PRICE)}/mo. Upgrade output agent by agent.
            </p>

            {/* Agent Pills - Compact */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-4">
              {essentialsAgents.map((agent) => (
                <div
                  key={agent.name}
                  className="px-3 py-1.5 bg-background/30 backdrop-blur-sm border border-lime-500/20 rounded-md text-xs"
                >
                  <span className="font-medium">{agent.name}</span>
                  <span className="text-muted-foreground ml-1">• {agent.job_title}</span>
                </div>
              ))}
            </div>

            <p className="text-accent dark:text-lime-400 text-sm font-medium">
              Save over 25% on bundled agents
            </p>
          </div>

          {/* Right side - Pricing & CTA */}
          <div className="flex flex-col items-center lg:items-end gap-4">
            <div className="text-center lg:text-right">
              <p className="text-muted-foreground text-xs mb-1">Starting at</p>
              <p className="text-4xl md:text-5xl font-bold text-accent dark:text-lime-400">
                {formatCurrency(BASE_PLAN_PRICE)}
                <span className="text-lg font-normal text-muted-foreground">/mo</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Includes {formatCurrency(includedValue)} value
              </p>
            </div>

            <div className="flex items-center gap-2 text-accent dark:text-lime-400 font-semibold group-hover:gap-3 transition-all">
              Build Your Plan
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
