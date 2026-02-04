import { OrbitingButton } from '@/components/ui/orbiting-button';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Check, Plus, Zap } from 'lucide-react';
import { useState } from 'react';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const LINKEDIN_OUTREACH_PRODUCT = {
    id: 'product-linkedin-outreach',
    type: 'ai-agent' as const,
    name: 'LinkedIn Outreach',
    description: 'Automated LinkedIn outreach system',
    price: 397,
    billingPeriod: 'monthly' as const,
};

const CheckoutBump = () => {
    const { items, addItem } = useCart();
    const { toast } = useToast();
    const [isAdding, setIsAdding] = useState(false);

    // Check if LinkedIn Outreach is already in cart
    const hasLinkedIn = items.some(
        (item) => item.id === LINKEDIN_OUTREACH_PRODUCT.id,
    );

    // Don't show if already in cart
    if (hasLinkedIn) return null;

    const handleAddToCart = () => {
        setIsAdding(true);
        addItem(LINKEDIN_OUTREACH_PRODUCT);
        toast({
            title: 'Added to your order!',
            description: 'LinkedIn Outreach has been added to your cart.',
        });
        setTimeout(() => setIsAdding(false), 500);
    };

    return (
        <div className="relative mb-6 overflow-hidden rounded-xl border-2 border-primary/50 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-5">
            {/* Ribbon badge */}
            <div className="absolute top-3 -right-8 rotate-45 bg-primary px-8 py-1 text-xs font-bold text-primary-foreground uppercase shadow-lg">
                Add-On
            </div>

            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/20">
                    <Zap className="h-6 w-6 text-primary" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                    <h3 className="mb-1 text-lg font-bold text-foreground">
                        Add LinkedIn Outreach?
                    </h3>
                    <p className="mb-3 text-sm text-muted-foreground">
                        Automate your LinkedIn prospecting with AI-powered
                        outreach. Connect with ideal clients while you focus on
                        closing deals.
                    </p>

                    {/* Benefits */}
                    <ul className="mb-4 space-y-1.5">
                        <li className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 shrink-0 text-primary" />
                            <span>
                                Automated connection requests & follow-ups
                            </span>
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 shrink-0 text-primary" />
                            <span>AI-personalized messaging at scale</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 shrink-0 text-primary" />
                            <span>Lead tracking & CRM integration</span>
                        </li>
                    </ul>

                    {/* Price and CTA */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-primary">
                                {formatCurrency(
                                    LINKEDIN_OUTREACH_PRODUCT.price,
                                )}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                /month
                            </span>
                        </div>
                        <OrbitingButton
                            onClick={handleAddToCart}
                            disabled={isAdding}
                            className="btn-primary whitespace-nowrap"
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
                        </OrbitingButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutBump;
