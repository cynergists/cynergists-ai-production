import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
    essentialsAgents,
    formatCurrency,
    getEssentialsTierIndex,
    hasUniformPricing,
} from '@/data/essentialsAgents';
import { useAddToCartWithToast } from '@/hooks/useAddToCartWithToast';
import { cn } from '@/lib/utils';
import { Circle, ShoppingCart } from 'lucide-react';
import { useMemo, useState } from 'react';

interface DatabaseTier {
    price: number;
    description: string;
}

interface AgentDetailSliderProps {
    agentId: string;
    agentName: string;
    agentDescription: string | null;
    agentJobTitle: string | null;
    agentPrice: number;
    agentTiers?: DatabaseTier[] | null;
}

export function AgentDetailSlider({
    agentId,
    agentName,
    agentDescription,
    agentJobTitle,
    agentPrice,
    agentTiers,
}: AgentDetailSliderProps) {
    const { addToCart } = useAddToCartWithToast();

    // Find matching essentials agent by name
    const essentialsAgent = useMemo(() => {
        return essentialsAgents.find(
            (a) => a.name.toLowerCase() === agentName.toLowerCase(),
        );
    }, [agentName]);

    // Use database tiers if available, otherwise use essentialsAgent tiers
    const hasDatabaseTiers = agentTiers && agentTiers.length > 0;
    const useDatabaseData = hasDatabaseTiers && !essentialsAgent;

    const [selectedTierIndex, setSelectedTierIndex] = useState(() => {
        if (essentialsAgent) {
            return getEssentialsTierIndex(essentialsAgent);
        }
        return 0;
    });

    // If no essentials agent and no database tiers, show simple add to cart
    if (!essentialsAgent && !hasDatabaseTiers) {
        return (
            <div className="space-y-4">
                {/* Simple pricing display */}
                <div className="rounded-lg bg-muted/30 p-4">
                    <p className="text-base text-accent dark:text-lime-400">
                        <span className="font-medium">Price:</span>{' '}
                        {formatCurrency(agentPrice)}/mo
                    </p>
                </div>

                {/* Add to Cart Button */}
                <Button
                    size="lg"
                    onClick={() => {
                        addToCart(
                            {
                                id: `agent-${agentId}`,
                                type: 'ai-agent',
                                name: agentName,
                                description:
                                    agentJobTitle || agentDescription || '',
                                price: agentPrice,
                                billingPeriod: 'monthly',
                            },
                            {
                                description: `${agentName} has been added to your cart.`,
                            },
                        );
                    }}
                    className="w-full bg-lime-500 font-medium text-black hover:bg-lime-600"
                >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart - {formatCurrency(agentPrice)}/mo
                </Button>
            </div>
        );
    }

    // Get tier data from database or essentials
    const tiers = useDatabaseData ? agentTiers! : essentialsAgent!.tiers;
    const selectedTier = useDatabaseData
        ? {
              key: `tier-${selectedTierIndex}`,
              price: agentTiers![selectedTierIndex].price,
              monthly_output: null,
              details: agentTiers![selectedTierIndex].description,
              display_name: `Tier ${selectedTierIndex + 1}`,
              one_liner: agentTiers![selectedTierIndex].description,
          }
        : essentialsAgent!.tiers[selectedTierIndex];

    const isUniformPricing = useDatabaseData
        ? agentTiers!.length === 1
        : hasUniformPricing(essentialsAgent!);
    const tierCount = tiers.length;
    const maxValue = tierCount - 1;

    const handleAddToCart = () => {
        const tierDescription = selectedTier.details
            ? `${selectedTier.display_name}: ${selectedTier.details}`
            : selectedTier.display_name;

        addToCart(
            {
                id: `agent-${agentId}-${selectedTier.key}`,
                type: 'ai-agent',
                name: agentName,
                description: tierDescription,
                price: selectedTier.price,
                billingPeriod: 'monthly',
            },
            {
                description: `${agentName} (${selectedTier.display_name}) has been added to your cart.`,
            },
        );
    };

    return (
        <div className="space-y-4">
            {/* Slider Section - Only show if not uniform pricing */}
            {!isUniformPricing ? (
                <>
                    {/* Prominent Output Display - Above Slider */}
                    {selectedTier.details && (
                        <div className="rounded-lg border border-border/50 bg-muted/50 px-4 py-3">
                            <p className="text-lg font-bold text-foreground">
                                {selectedTier.details}
                            </p>
                        </div>
                    )}

                    {/* Discrete Slider */}
                    <div className="mb-2">
                        <Slider
                            value={[selectedTierIndex]}
                            onValueChange={([value]) =>
                                setSelectedTierIndex(value)
                            }
                            min={0}
                            max={maxValue}
                            step={1}
                            className="w-full"
                            aria-label={`Select tier for ${agentName}`}
                        />

                        {/* Tier Step Icons */}
                        <div className="mt-2 flex justify-between px-1">
                            {tiers.map((tier, index) => {
                                const tierKey = useDatabaseData
                                    ? `tier-${index}`
                                    : (tier as any).key;
                                const tierName = useDatabaseData
                                    ? `Tier ${index + 1}`
                                    : (tier as any).display_name;
                                return (
                                    <button
                                        key={tierKey}
                                        onClick={() =>
                                            setSelectedTierIndex(index)
                                        }
                                        className={cn(
                                            'rounded-full p-0.5 transition-all focus:ring-2 focus:ring-lime-500/50 focus:outline-none',
                                            index === selectedTierIndex
                                                ? 'text-accent dark:text-lime-400'
                                                : 'text-muted-foreground/50 hover:text-muted-foreground',
                                        )}
                                        aria-label={`Select ${tierName}`}
                                        title={tierName}
                                    >
                                        <Circle
                                            className={cn(
                                                'h-3 w-3 transition-all',
                                                index === selectedTierIndex &&
                                                    'fill-accent dark:fill-lime-400',
                                            )}
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </>
            ) : (
                /* Non-interactive display for uniform pricing (like Atlas) */
                <div className="rounded-lg border border-border/50 bg-muted/50 px-4 py-3">
                    <p className="text-base font-medium text-foreground">
                        {selectedTier.details || 'Unlimited usage'}
                    </p>
                </div>
            )}

            {/* Pricing Details */}
            <div className="rounded-lg bg-muted/30 p-4">
                <p className="text-base text-accent dark:text-lime-400">
                    <span className="font-medium">Price:</span>{' '}
                    {formatCurrency(selectedTier.price)}/mo
                </p>
            </div>

            {/* Add to Cart Button */}
            <Button
                size="lg"
                onClick={handleAddToCart}
                className="w-full bg-lime-500 font-medium text-black hover:bg-lime-600"
            >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart - {formatCurrency(selectedTier.price)}/mo
            </Button>
        </div>
    );
}
