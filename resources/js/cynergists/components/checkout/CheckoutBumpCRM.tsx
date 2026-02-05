import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Check, Database, Plus } from 'lucide-react';
import { useState } from 'react';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const CRM_PRODUCT = {
    id: 'product-crm',
    type: 'ai-agent' as const,
    name: 'CRM',
    description: 'AI-powered CRM system',
    price: 97,
    billingPeriod: 'monthly' as const,
};

const CheckoutBumpCRM = () => {
    const { items, addItem } = useCart();
    const { toast } = useToast();
    const [isAdding, setIsAdding] = useState(false);

    // Check if CRM is already in cart
    const hasCRM = items.some((item) => item.id === CRM_PRODUCT.id);

    // Don't show if already in cart
    if (hasCRM) return null;

    const handleAddToCart = () => {
        setIsAdding(true);
        addItem(CRM_PRODUCT);
        toast({
            title: 'Added to your order!',
            description: 'CRM has been added to your cart.',
        });
        setTimeout(() => setIsAdding(false), 500);
    };

    return (
        <div className="relative mb-6 overflow-hidden rounded-xl border-2 border-accent/50 bg-gradient-to-br from-accent/5 via-accent/10 to-accent/5 p-5">
            {/* Ribbon badge */}
            <div className="absolute top-3 -right-8 rotate-45 bg-accent px-8 py-1 text-xs font-bold text-accent-foreground uppercase shadow-lg">
                Add-On
            </div>

            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/20">
                    <Database className="h-6 w-6 text-accent" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                    <h3 className="mb-1 text-lg font-bold text-foreground">
                        Add CRM to Your Order?
                    </h3>
                    <p className="mb-3 text-sm text-muted-foreground">
                        Never lose track of a lead again. Our AI-powered CRM
                        keeps your pipeline organized and your follow-ups on
                        autopilot.
                    </p>

                    {/* Benefits */}
                    <ul className="mb-4 space-y-1.5">
                        <li className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 shrink-0 text-accent" />
                            <span>Automated lead tracking & scoring</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 shrink-0 text-accent" />
                            <span>Smart follow-up reminders</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 shrink-0 text-accent" />
                            <span>Pipeline visualization & reporting</span>
                        </li>
                    </ul>

                    {/* Price and CTA */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-accent">
                                {formatCurrency(CRM_PRODUCT.price)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                /month
                            </span>
                        </div>
                        <Button
                            onClick={handleAddToCart}
                            disabled={isAdding}
                            variant="secondary"
                            className="whitespace-nowrap"
                            size="sm"
                        >
                            {isAdding ? (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Added!
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Yes, Add to My Order
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutBumpCRM;
