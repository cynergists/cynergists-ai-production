import { useCart } from '@/contexts/CartContext';
import { router, usePage } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

// Pre-defined products for quick checkout links
const QUICK_PRODUCTS: Record<
    string,
    {
        id: string;
        type: 'product';
        name: string;
        description: string;
        price: number;
        billingPeriod: 'monthly' | 'annual';
        metadata?: { isPartnerPackage?: boolean };
        redirectTo?: string; // Custom redirect instead of standard checkout
    }
> = {
    'linkedin-outreach': {
        id: 'partner-linkedin-outreach',
        type: 'product',
        name: 'Partner Package: LinkedIn Outreach',
        description:
            'AI-powered LinkedIn lead generation and outreach automation',
        price: 189,
        billingPeriod: 'monthly',
        metadata: { isPartnerPackage: true },
        redirectTo: '/partner/linkedin-outreach/checkout', // Standalone partner checkout
    },
};

export default function QuickCheckout() {
    const { url } = usePage();
    const searchParams = new URLSearchParams(url.split('?')[1] ?? '');
    const { clearCart, addItem } = useCart();

    useEffect(() => {
        const productKey = searchParams.get('product');

        if (!productKey || !QUICK_PRODUCTS[productKey]) {
            router.visit('/marketplace');
            return;
        }

        const product = QUICK_PRODUCTS[productKey];

        // If product has a custom redirect, go there instead
        if (product.redirectTo) {
            router.visit(product.redirectTo);
            return;
        }

        // Clear cart and add the specific product
        clearCart();
        addItem(product);

        // Redirect to checkout
        router.visit('/checkout');
    }, [url, clearCart, addItem]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="space-y-4 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">
                    Preparing your checkout...
                </p>
            </div>
        </div>
    );
}
