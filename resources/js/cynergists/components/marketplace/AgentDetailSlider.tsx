import { useState, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Circle, ShoppingCart, ArrowUp, Check } from "lucide-react";
import { 
  essentialsAgents, 
  EssentialsAgent,
  getEssentialsTierIndex,
  hasUniformPricing,
  formatCurrency 
} from "@/data/essentialsAgents";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

interface AgentDetailSliderProps {
  agentId: string;
  agentName: string;
  agentDescription: string | null;
  agentJobTitle: string | null;
}

export function AgentDetailSlider({ 
  agentId, 
  agentName, 
  agentDescription,
  agentJobTitle 
}: AgentDetailSliderProps) {
  const { addItem, openCart } = useCart();
  const { toast } = useToast();
  
  // Find matching essentials agent by name
  const essentialsAgent = useMemo(() => {
    return essentialsAgents.find(
      a => a.name.toLowerCase() === agentName.toLowerCase()
    );
  }, [agentName]);

  const [selectedTierIndex, setSelectedTierIndex] = useState(() => {
    if (!essentialsAgent) return 0;
    return getEssentialsTierIndex(essentialsAgent);
  });

  // If no matching essentials agent, don't show slider
  if (!essentialsAgent) {
    return null;
  }

  const selectedTier = essentialsAgent.tiers[selectedTierIndex];
  const isUniformPricing = hasUniformPricing(essentialsAgent);
  const tierCount = essentialsAgent.tiers.length;
  const maxValue = tierCount - 1;

  const handleAddToCart = () => {
    const tierDescription = selectedTier.details 
      ? `${selectedTier.display_name}: ${selectedTier.details}`
      : selectedTier.display_name;
    
    addItem({
      id: `agent-${agentId}-${selectedTier.key}`,
      type: "ai-agent",
      name: agentName,
      description: tierDescription,
      price: selectedTier.price,
      billingPeriod: "monthly",
    });
    toast({
      title: "Added to Cart",
      description: `${agentName} (${selectedTier.display_name}) has been added to your cart.`,
    });
    openCart();
  };

  return (
    <div className="space-y-4">
      {/* Slider Section - Only show if not uniform pricing */}
      {!isUniformPricing ? (
        <>
          {/* Prominent Output Display - Above Slider */}
          {selectedTier.details && (
            <div className="py-3 px-4 bg-muted/50 rounded-lg border border-border/50">
              <p className="text-lg font-bold text-foreground">
                {selectedTier.details}
              </p>
            </div>
          )}

          {/* Discrete Slider */}
          <div className="mb-2">
            <Slider
              value={[selectedTierIndex]}
              onValueChange={([value]) => setSelectedTierIndex(value)}
              min={0}
              max={maxValue}
              step={1}
              className="w-full"
              aria-label={`Select tier for ${agentName}`}
            />
            
            {/* Tier Step Icons */}
            <div className="flex justify-between mt-2 px-1">
              {essentialsAgent.tiers.map((tier, index) => (
                <button
                  key={tier.key}
                  onClick={() => setSelectedTierIndex(index)}
                  className={cn(
                    "transition-all focus:outline-none focus:ring-2 focus:ring-lime-500/50 rounded-full p-0.5",
                    index === selectedTierIndex 
                      ? "text-accent dark:text-lime-400" 
                      : "text-muted-foreground/50 hover:text-muted-foreground"
                  )}
                  aria-label={`Select ${tier.display_name}`}
                  title={tier.display_name}
                >
                  <Circle 
                    className={cn(
                      "h-3 w-3 transition-all",
                      index === selectedTierIndex && "fill-accent dark:fill-lime-400"
                    )} 
                  />
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Non-interactive display for uniform pricing (like Atlas) */
        <div className="py-3 px-4 bg-muted/50 rounded-lg border border-border/50">
          <p className="text-base font-medium text-foreground">{selectedTier.details || "Unlimited usage"}</p>
        </div>
      )}

      {/* Pricing Details */}
      <div className="bg-muted/30 rounded-lg p-4">
        <p className="text-base text-accent dark:text-lime-400">
          <span className="font-medium">Price:</span> {formatCurrency(selectedTier.price)}/mo
        </p>
      </div>

      {/* Add to Cart Button */}
      <Button 
        size="lg" 
        onClick={handleAddToCart}
        className="w-full bg-lime-500 hover:bg-lime-600 text-black font-medium"
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        Add to Cart - {formatCurrency(selectedTier.price)}/mo
      </Button>
    </div>
  );
}
