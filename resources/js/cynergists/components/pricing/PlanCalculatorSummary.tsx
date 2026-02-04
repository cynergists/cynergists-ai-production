import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAddToCartWithToast } from '@/hooks/useAddToCartWithToast';
import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    Calculator,
    ChevronDown,
    ChevronUp,
    RotateCcw,
    ShoppingCart,
} from 'lucide-react';
import { useState } from 'react';
import type { PlanTier } from './roleData';

interface RoleSelection {
    roleId: string;
    roleName: string;
    hours: number;
}

interface PlanCalculatorSummaryProps {
    totalHours: number;
    recommendedPlan: PlanTier | null;
    selections: RoleSelection[];
    onReset: () => void;
}

const PlanCalculatorSummary = ({
    totalHours,
    recommendedPlan,
    selections,
    onReset,
}: PlanCalculatorSummaryProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const activeSelections = selections.filter((s) => s.hours > 0);
    const { addToCart } = useAddToCartWithToast();
    const isMobile = useIsMobile();

    // Build URL params for booking form
    const buildBookingUrl = () => {
        if (activeSelections.length === 0) return '/schedule';

        const params = new URLSearchParams();
        params.set('plan', recommendedPlan?.name || '');
        params.set('hours', totalHours.toString());

        const rolesParam = activeSelections
            .map((s) => `${encodeURIComponent(s.roleName)}:${s.hours}`)
            .join(',');
        params.set('roles', rolesParam);

        return `/schedule?${params.toString()}`;
    };

    // Get the sales page URL based on hours
    const getSalesPageUrl = () => {
        if (totalHours >= 40 && totalHours <= 99) return '/plans/emerge';
        if (totalHours >= 100 && totalHours <= 199) return '/plans/expansion';
        if (totalHours >= 200 && totalHours <= 299) return '/plans/elite';
        return '/contact'; // 0-39 or 300+
    };

    // Get the button text based on hours
    const getButtonText = () => {
        if (totalHours >= 40 && totalHours <= 99) return 'Add Emerge to Cart';
        if (totalHours >= 100 && totalHours <= 199)
            return 'Add Expansion to Cart';
        if (totalHours >= 200 && totalHours <= 299) return 'Add Elite to Cart';
        return 'Talk to Sales'; // 0-39 or 300+
    };

    // Check if we should show cart button
    const showCartButton = totalHours >= 40 && totalHours <= 299;

    // Handle add to cart
    const handleAddToCart = () => {
        if (!recommendedPlan) return;

        addToCart({
            type: 'plan',
            id: `${recommendedPlan.name.toLowerCase()}-monthly`,
            name: `${recommendedPlan.name} Plan`,
            description: `${recommendedPlan.maxHours} Monthly Team Hours`,
            price: recommendedPlan.price,
            billingPeriod: 'monthly',
        });
    };

    // Mobile compact view
    if (isMobile) {
        return (
            <div className="card-glass p-4">
                <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                    {/* Compact Header - Always Visible */}
                    <div className="flex items-center justify-between gap-3">
                        {/* Left: Hours + Plan */}
                        <div className="flex min-w-0 flex-1 items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Calculator className="h-4 w-4 flex-shrink-0 text-primary" />
                                <span className="text-2xl font-bold text-foreground">
                                    {totalHours}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    hrs
                                </span>
                            </div>
                            <div className="h-6 w-px bg-border/50" />
                            <div className="min-w-0">
                                {recommendedPlan ? (
                                    <div className="flex flex-col">
                                        <span className="truncate text-sm font-semibold text-primary">
                                            {recommendedPlan.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {recommendedPlan.priceLabel}
                                        </span>
                                    </div>
                                ) : totalHours > 0 && totalHours < 40 ? (
                                    <span className="text-sm font-semibold text-primary">
                                        Talk to Sales
                                    </span>
                                ) : (
                                    <span className="text-sm text-muted-foreground">
                                        Select hours
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Right: Expand Button */}
                        <CollapsibleTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 flex-shrink-0 p-0"
                            >
                                {isExpanded ? (
                                    <ChevronUp className="h-4 w-4" />
                                ) : (
                                    <ChevronDown className="h-4 w-4" />
                                )}
                            </Button>
                        </CollapsibleTrigger>
                    </div>

                    {/* Primary CTA - Always Visible */}
                    <div className="mt-3">
                        {showCartButton ? (
                            <Button
                                onClick={handleAddToCart}
                                className="btn-primary h-10 w-full"
                            >
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                {getButtonText()}
                            </Button>
                        ) : (
                            <Button
                                asChild
                                className="btn-primary h-10 w-full"
                                disabled={totalHours === 0}
                            >
                                <Link href={buildBookingUrl()}>
                                    Schedule a Call
                                </Link>
                            </Button>
                        )}
                    </div>

                    {/* Expandable Content */}
                    <CollapsibleContent className="mt-4 space-y-3">
                        {/* Selected Roles */}
                        {activeSelections.length > 0 && (
                            <div className="rounded-lg border border-border/50 bg-card/50 p-3">
                                <p className="mb-2 text-xs text-muted-foreground">
                                    Selected Roles
                                </p>
                                <div className="max-h-32 space-y-1 overflow-y-auto">
                                    {activeSelections.map((selection) => (
                                        <div
                                            key={selection.roleId}
                                            className="flex justify-between py-0.5 text-sm"
                                        >
                                            <span className="truncate pr-2 text-muted-foreground">
                                                {selection.roleName}
                                            </span>
                                            <span className="font-medium whitespace-nowrap text-foreground">
                                                {selection.hours} hrs
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Secondary Actions */}
                        <div className="flex gap-2">
                            {!showCartButton && (
                                <Button
                                    asChild
                                    variant="outline"
                                    className="h-9 flex-1 border-primary/50 text-sm text-primary hover:bg-primary/10"
                                >
                                    <Link href={getSalesPageUrl()}>
                                        {getButtonText()}
                                        <ArrowRight className="ml-1 h-3 w-3" />
                                    </Link>
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                className="h-9 flex-1 text-sm text-muted-foreground hover:text-foreground"
                                onClick={onReset}
                                disabled={totalHours === 0}
                            >
                                <RotateCcw className="mr-1 h-3 w-3" />
                                Reset
                            </Button>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </div>
        );
    }

    // Desktop view (unchanged)
    return (
        <div className="card-glass p-6">
            <div className="mb-6 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                <h3 className="font-display text-lg font-bold text-foreground">
                    Your Plan Summary
                </h3>
            </div>

            {/* Top row - 3 equal boxes */}
            <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                {/* Box 1 - Total Hours */}
                <div className="flex min-h-[100px] flex-col justify-center rounded-lg border border-border/50 bg-card/50 p-5">
                    <p className="mb-1 text-sm text-muted-foreground">
                        Total Hours
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                        {totalHours}
                    </p>
                </div>

                {/* Box 2 - Recommended Plan */}
                <div className="flex min-h-[100px] flex-col justify-center rounded-lg border border-primary/30 bg-primary/10 p-5">
                    <p className="mb-1 text-sm text-muted-foreground">
                        Recommended Plan
                    </p>
                    {recommendedPlan ? (
                        <>
                            <p className="text-xl font-bold text-primary">
                                {recommendedPlan.name}
                            </p>
                            <p className="text-lg font-semibold text-foreground">
                                {recommendedPlan.priceLabel}
                            </p>
                        </>
                    ) : totalHours > 0 && totalHours < 40 ? (
                        <>
                            <p className="text-xl font-bold text-primary">
                                Talk to Sales
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Select 40+ hours for plans
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-xl font-bold text-muted-foreground/50">
                                —
                            </p>
                            <p className="text-lg font-semibold text-muted-foreground/50">
                                Select Hours
                            </p>
                        </>
                    )}
                </div>

                {/* Box 3 - Selected Roles */}
                <div className="min-h-[100px] rounded-lg border border-border/50 bg-card/50 p-5">
                    <p className="mb-2 text-sm text-muted-foreground">
                        Selected Roles
                    </p>
                    <div className="max-h-40 space-y-1 overflow-y-auto">
                        {activeSelections.length > 0 ? (
                            activeSelections.map((selection) => (
                                <div
                                    key={selection.roleId}
                                    className="flex justify-between py-1 text-sm"
                                >
                                    <span className="truncate pr-2 text-muted-foreground">
                                        {selection.roleName}
                                    </span>
                                    <span className="font-medium whitespace-nowrap text-foreground">
                                        {selection.hours} hrs
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground/50">
                                No roles selected
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom row - 3 buttons aligned under the boxes */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Button
                    asChild
                    className="btn-primary h-11 w-full"
                    disabled={totalHours === 0}
                >
                    <Link href={buildBookingUrl()}>Schedule a Call</Link>
                </Button>

                {showCartButton ? (
                    <Button
                        onClick={handleAddToCart}
                        className="btn-primary h-11 w-full"
                    >
                        <ShoppingCart className="mr-2 h-4 w-4 flex-shrink-0" />
                        {getButtonText()}
                    </Button>
                ) : (
                    <Button
                        asChild
                        variant="ghost"
                        className="h-11 w-full text-primary hover:bg-primary/10"
                    >
                        <Link href={getSalesPageUrl()}>
                            {getButtonText()}
                            <ArrowRight className="ml-2 h-4 w-4 flex-shrink-0" />
                        </Link>
                    </Button>
                )}

                <Button
                    variant="ghost"
                    className="h-11 w-full text-muted-foreground hover:text-foreground"
                    onClick={onReset}
                    disabled={totalHours === 0}
                >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset Selections
                </Button>
            </div>
        </div>
    );
};

export default PlanCalculatorSummary;
