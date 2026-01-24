import { useState, useCallback } from "react";
import { Link } from "@inertiajs/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { EssentialsPlanBuilder } from "@/components/marketplace/EssentialsPlanBuilder";
import { 
  essentialsAgents, 
  getEssentialsTierIndex,
  BASE_PLAN_PRICE,
  calcIncludedValue,
  calcBundleSavings,
  formatCurrency
} from "@/data/essentialsAgents";

// Initialize selections with all agents at their Essentials tier
function getInitialSelections(): Record<string, number> {
  const selections: Record<string, number> = {};
  essentialsAgents.forEach((agent) => {
    selections[agent.name] = getEssentialsTierIndex(agent);
  });
  return selections;
}

export default function EssentialsPlan() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selections, setSelections] = useState<Record<string, number>>(getInitialSelections);

  const includedValue = calcIncludedValue();
  const bundleSavings = calcBundleSavings();

  const handleSelectionChange = useCallback((agentName: string, tierIndex: number) => {
    setSelections((prev) => ({
      ...prev,
      [agentName]: tierIndex,
    }));
  }, []);

  const handleResetSelections = useCallback(() => {
    setSelections(getInitialSelections());
  }, []);

  return (
    <Layout searchQuery={searchQuery} onSearchChange={setSearchQuery}>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-background via-background to-lime-500/5">
          {/* Futuristic background elements */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(132,204,22,0.15),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(132,204,22,0.1),transparent_50%)]" />
            {/* Grid pattern overlay */}
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(rgba(132,204,22,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(132,204,22,0.3) 1px, transparent 1px)`,
                backgroundSize: '50px 50px'
              }}
            />
          </div>

          {/* Decorative corner accents */}
          <div className="absolute top-8 left-8 flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-lime-500" />
            <div className="w-2 h-2 rounded-full bg-lime-500" />
            <div className="w-2 h-2 rounded-full bg-lime-500" />
          </div>
          <div className="absolute top-12 right-16 w-4 h-4 border-2 border-lime-500 rotate-45" />
          <div className="absolute bottom-20 left-20 w-3 h-3 bg-lime-500/50 rotate-45" />

          <div className="container mx-auto px-4 py-16 md:py-24 relative">
            {/* Back link */}
            <Link
              href="/marketplace"
              className="inline-flex items-center text-muted-foreground hover:text-accent dark:hover:text-lime-400 transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Marketplace
            </Link>

            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-6 bg-lime-500/20 text-accent dark:text-lime-400 border-lime-500/30 px-4 py-1.5">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Bundle & Save
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="text-gradient">Your First AI Agent Team,</span>
                <br />
                <span className="text-white">Ready to Deploy</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-4">
                Six agents included. Customize and upgrade any agent right now to match your exact needs.
              </p>
              
              <p className="text-lg text-muted-foreground">
                Change your plan as your needs change.
              </p>
            </div>
          </div>
        </div>

        {/* Plan Builder Section */}
        <EssentialsPlanBuilder
          selections={selections}
          onSelectionChange={handleSelectionChange}
          onReset={handleResetSelections}
        />
      </div>
    </Layout>
  );
}
