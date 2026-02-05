import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    BASE_PLAN_PRICE,
    calcBundleSavings,
    calcIncludedValue,
    calcIncremental,
    essentialsAgents,
    formatCurrency,
    getEssentialsTierIndex,
} from '@/data/essentialsAgents';
import { useAddToCartWithToast } from '@/hooks/useAddToCartWithToast';
import { Check, RotateCcw, ShoppingCart } from 'lucide-react';

interface EssentialsPlanSummaryProps {
    selections: Record<string, number>;
    onReset: () => void;
}

export function EssentialsPlanSummary({
    selections,
    onReset,
}: EssentialsPlanSummaryProps) {
    const { addToCart } = useAddToCartWithToast();

    const basePlanPrice = BASE_PLAN_PRICE;
    const includedValue = calcIncludedValue();
    const bundleSavings = calcBundleSavings();

    // Calculate total add-ons
    const totalAddOns = essentialsAgents.reduce((sum, agent) => {
        const selectedIndex =
            selections[agent.name] ?? getEssentialsTierIndex(agent);
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
            .filter((agent) => {
                const selectedIndex =
                    selections[agent.name] ?? getEssentialsTierIndex(agent);
                return calcIncremental(agent, selectedIndex) > 0;
            })
            .map((agent) => {
                const selectedIndex =
                    selections[agent.name] ?? getEssentialsTierIndex(agent);
                const tierKey = agent.tiers[selectedIndex]?.key || 'essentials';
                return `${agent.name}: ${tierKey.charAt(0).toUpperCase() + tierKey.slice(1)}`;
            });

        const planName = isAtEssentials
            ? 'Essentials Plan'
            : 'Custom Essentials Plan';
        const description =
            customizations.length > 0
                ? `Includes: ${essentialsAgents.map((a) => a.name).join(', ')}. Upgrades: ${customizations.join(', ')}`
                : `Includes: ${essentialsAgents.map((a) => a.name).join(', ')}`;

        addToCart(
            {
                id: `essentials-plan-${Date.now()}`,
                name: planName,
                description,
                price: totalMonthly,
                type: 'ai-agent',
                billingPeriod: 'monthly',
            },
            {
                description: `${planName} - ${formatCurrency(totalMonthly)}/mo`,
            },
        );
    };

    return (
        <Card className="mb-8 border-lime-500/30 [box-shadow:0_0_30px_rgba(132,204,22,0.15)]">
            <CardContent className="p-6">
                {/* Header */}
                <h2 className="mb-6 text-center text-2xl font-bold md:text-left md:text-3xl">
                    Your Custom Plan
                </h2>

                {/* Top Row - Pricing Info */}
                <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                    {/* Plan Type */}
                    <div className="text-center md:text-left">
                        <p className="mb-1 text-sm text-muted-foreground">
                            {isAtEssentials ? 'Base Plan' : 'Custom Plan'}
                        </p>
                        <p className="text-lg font-bold md:text-xl">
                            {formatCurrency(totalMonthly)}/mo
                        </p>
                    </div>

                    {/* Add-ons (only show if customized) */}
                    {!isAtEssentials && (
                        <div className="text-center md:text-left">
                            <p className="mb-1 text-sm text-muted-foreground">
                                Add-ons
                            </p>
                            <p className="text-lg font-bold text-primary md:text-xl">
                                +{formatCurrency(totalAddOns)}/mo
                            </p>
                        </div>
                    )}

                    {/* Included Value */}
                    <div className="text-center md:text-left">
                        <p className="mb-1 text-sm text-muted-foreground">
                            Included Value
                        </p>
                        <p className="text-lg font-bold md:text-xl">
                            {formatCurrency(includedValue)}/mo
                        </p>
                    </div>

                    {/* Savings */}
                    <div className="text-center md:text-left">
                        <p className="mb-1 text-sm text-muted-foreground">
                            You Save
                        </p>
                        <p className="text-lg font-bold text-accent md:text-xl dark:text-lime-400">
                            {formatCurrency(bundleSavings)}/mo
                        </p>
                    </div>
                </div>

                {/* Agent Pills Row */}
                <div className="mb-6 flex flex-wrap gap-2">
                    {essentialsAgents.map((agent) => {
                        const selectedIndex =
                            selections[agent.name] ??
                            getEssentialsTierIndex(agent);
                        const addOn = calcIncremental(agent, selectedIndex);

                        return (
                            <div
                                key={agent.name}
                                className="flex items-center gap-2 rounded-full bg-muted/50 px-3 py-1.5 text-sm"
                            >
                                <span className="font-medium">
                                    {agent.name}
                                </span>
                                {addOn > 0 ? (
                                    <span className="font-medium text-primary">
                                        +{formatCurrency(addOn)}
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-accent dark:text-lime-400">
                                        <Check className="h-3 w-3" />
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Actions Row */}
                <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                        onClick={handleAddToCart}
                        className="flex-1 bg-lime-500 font-semibold text-black hover:bg-lime-600"
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
