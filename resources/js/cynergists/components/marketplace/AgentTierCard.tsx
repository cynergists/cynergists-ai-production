import { Card, CardContent } from '@/components/ui/card';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Slider } from '@/components/ui/slider';
import {
    EssentialsAgent,
    formatCurrency,
    hasUniformPricing,
} from '@/data/essentialsAgents';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Circle } from 'lucide-react';
import { useState } from 'react';

interface AgentTierCardProps {
    agent: EssentialsAgent;
    selectedTierIndex: number;
    onTierChange: (index: number) => void;
}

export function AgentTierCard({
    agent,
    selectedTierIndex,
    onTierChange,
}: AgentTierCardProps) {
    const [isNonNegotiablesOpen, setIsNonNegotiablesOpen] = useState(false);

    const selectedTier = agent.tiers[selectedTierIndex];
    const isUniformPricing = hasUniformPricing(agent);

    // Generate step marks for the slider
    const tierCount = agent.tiers.length;
    const maxValue = tierCount - 1;

    return (
        <Card className="overflow-hidden border-border/50 [box-shadow:0_0_20px_rgba(132,204,22,0.1)] transition-colors hover:border-lime-500/30">
            <CardContent className="p-6">
                {/* Header */}
                <div className="mb-2">
                    <h3 className="text-3xl font-bold">{agent.name}</h3>
                    <p className="text-base font-medium text-muted-foreground">
                        {agent.job_title}
                    </p>
                </div>

                {/* Slider Section - Only show if not uniform pricing */}
                {!isUniformPricing ? (
                    <>
                        {/* Prominent Output Display - Above Slider */}
                        {selectedTier.details && (
                            <div className="mb-4 rounded-lg border border-border/50 bg-muted/50 px-4 py-3">
                                <p className="text-lg font-bold text-foreground">
                                    {selectedTier.details}
                                </p>
                            </div>
                        )}

                        {/* Discrete Slider */}
                        <div className="mb-4">
                            <Slider
                                value={[selectedTierIndex]}
                                onValueChange={([value]) => onTierChange(value)}
                                min={0}
                                max={maxValue}
                                step={1}
                                className="w-full"
                                aria-label={`Select tier for ${agent.name}`}
                            />

                            {/* Tier Step Icons */}
                            <div className="mt-2 flex justify-between px-1">
                                {agent.tiers.map((tier, index) => (
                                    <button
                                        key={tier.key}
                                        onClick={() => onTierChange(index)}
                                        className={cn(
                                            'rounded-full p-0.5 transition-all focus:ring-2 focus:ring-lime-500/50 focus:outline-none',
                                            index === selectedTierIndex
                                                ? 'text-accent dark:text-lime-400'
                                                : 'text-muted-foreground/50 hover:text-muted-foreground',
                                        )}
                                        aria-label={`Select ${tier.display_name}`}
                                        title={tier.display_name}
                                    >
                                        <Circle
                                            className={cn(
                                                'h-3 w-3 transition-all',
                                                index === selectedTierIndex &&
                                                    'fill-accent dark:fill-lime-400',
                                            )}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    /* Non-interactive display for uniform pricing (like Atlas) */
                    <div className="mb-4 rounded-lg border border-border/50 bg-muted/50 px-4 py-3">
                        <p className="text-base font-medium text-foreground">
                            {selectedTier.details || 'Unlimited usage'}
                        </p>
                    </div>
                )}

                {/* Selected Tier Details */}
                <div className="rounded-lg bg-muted/30 p-4">
                    <p className="text-base text-accent dark:text-lime-400">
                        <span className="font-medium">Price:</span>{' '}
                        {formatCurrency(selectedTier.price)}/mo
                    </p>
                </div>

                {/* Non-negotiables Accordion (Always included section) */}
                {agent.non_negotiables && (
                    <Collapsible
                        open={isNonNegotiablesOpen}
                        onOpenChange={setIsNonNegotiablesOpen}
                        className="mt-4"
                    >
                        <CollapsibleTrigger className="flex w-full items-center justify-between rounded p-2 text-base text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground">
                            <span>Always included</span>
                            {isNonNegotiablesOpen ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-2">
                            <p className="rounded-lg bg-muted/30 p-3 text-base text-muted-foreground">
                                {agent.non_negotiables}
                            </p>
                        </CollapsibleContent>
                    </Collapsible>
                )}
            </CardContent>
        </Card>
    );
}
