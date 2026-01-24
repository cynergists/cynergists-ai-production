import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCcw, ArrowRight, Check, ShoppingCart } from "lucide-react";
import { 
  essentialsAgents, 
  BASE_PLAN_PRICE,
  calcIncremental,
  calcIncludedValue,
  calcBundleSavings,
  getEssentialsTierIndex,
  formatCurrency 
} from "@/data/essentialsAgents";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

interface EssentialsPlanSummaryProps {
  selections: Record<string, number>;
  onReset: () => void;
}

export function EssentialsPlanSummary({ selections, onReset }: EssentialsPlanSummaryProps) {
  const { addItem, openCart } = useCart();
  const { toast } = useToast();
  
  const basePlanPrice = BASE_PLAN_PRICE;
  const includedValue = calcIncludedValue();
  const bundleSavings = calcBundleSavings();
  
  // Calculate total add-ons
  const totalAddOns = essentialsAgents.reduce((sum, agent) => {
    const selectedIndex = selections[agent.name] ?? getEssentialsTierIndex(agent);
    return sum + calcIncremental(agent, selectedIndex);
  }, 0);

  const totalMonthly = basePlanPrice + totalAddOns;

  // Check if all selections are at Essentials tier
  const isAtEssentials = essentialsAgents.every((agent) => {
    const essentialsIndex = getEssentialsTierIndex(agent);
    const currentIndex = selections[agent.name] ?? essentialsIndex;
    return currentIndex === essentialsIndex;
  });

  const handleAddToCart = () => {
    // Build description of customizations
    const customizations = essentialsAgents
      .filter(agent => {
        const selectedIndex = selections[agent.name] ?? getEssentialsTierIndex(agent);
        return calcIncremental(agent, selectedIndex) > 0;
      })
      .map(agent => {
        const selectedIndex = selections[agent.name] ?? getEssentialsTierIndex(agent);
        const tierKey = agent.tiers[selectedIndex]?.key || "essentials";
        return `${agent.name}: ${tierKey.charAt(0).toUpperCase() + tierKey.slice(1)}`;
      });

    const description = customizations.length > 0 
      ? `Includes: ${essentialsAgents.map(a => a.name).join(", ")}. Upgrades: ${customizations.join(", ")}`
      : `Includes: ${essentialsAgents.map(a => a.name).join(", ")}`;

    addItem({
      id: `essentials-plan-${Date.now()}`,
      name: isAtEssentials ? "Essentials Plan" : "Custom Essentials Plan",
      description,
      price: totalMonthly,
      type: "ai-agent",
      billingPeriod: "monthly"
    });

    toast({
      title: "Added to cart!",
      description: `${isAtEssentials ? "Essentials Plan" : "Custom Essentials Plan"} - ${formatCurrency(totalMonthly)}/mo`,
    });

    openCart();
  };

  return (
    <Card className="border-lime-500/30 [box-shadow:0_0_30px_rgba(132,204,22,0.15)] mb-8">
      <CardContent className="p-6">
        {/* Header */}
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left">
          Your Custom Plan
        </h2>
        
        {/* Top Row - Pricing Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6">
          {/* Plan Type */}
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground mb-1">
              {isAtEssentials ? "Base Plan" : "Custom Plan"}
            </p>
            <p className="text-lg md:text-xl font-bold">{formatCurrency(totalMonthly)}/mo</p>
          </div>

          {/* Add-ons (only show if customized) */}
          {!isAtEssentials && (
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground mb-1">Add-ons</p>
              <p className="text-lg md:text-xl font-bold text-primary">+{formatCurrency(totalAddOns)}/mo</p>
            </div>
          )}

          {/* Included Value */}
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground mb-1">Included Value</p>
            <p className="text-lg md:text-xl font-bold">{formatCurrency(includedValue)}/mo</p>
          </div>

          {/* Savings */}
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground mb-1">You Save</p>
            <p className="text-lg md:text-xl font-bold text-accent dark:text-lime-400">{formatCurrency(bundleSavings)}/mo</p>
          </div>
        </div>

        {/* Agent Pills Row */}
        <div className="flex flex-wrap gap-2 mb-6">
          {essentialsAgents.map((agent) => {
            const selectedIndex = selections[agent.name] ?? getEssentialsTierIndex(agent);
            const addOn = calcIncremental(agent, selectedIndex);
            
            return (
              <div 
                key={agent.name} 
                className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full text-sm"
              >
                <span className="font-medium">{agent.name}</span>
                {addOn > 0 ? (
                  <span className="text-primary font-medium">+{formatCurrency(addOn)}</span>
                ) : (
                  <span className="text-accent dark:text-lime-400 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleAddToCart}
            className="flex-1 bg-lime-500 hover:bg-lime-600 text-black font-semibold"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
          
          <Button
            variant="outline"
            onClick={onReset}
            disabled={isAtEssentials}
            className="sm:w-auto"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}