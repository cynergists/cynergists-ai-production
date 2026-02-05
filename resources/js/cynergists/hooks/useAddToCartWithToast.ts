import type { CartItem } from '@/contexts/CartContext';
import { useCart } from '@/contexts/CartContext';
import { router } from '@inertiajs/react';
import { useCallback } from 'react';
import { toast } from 'sonner';

interface AddToCartOptions {
    /** Custom toast title (defaults to "Added to cart") */
    title?: string;
    /** Custom toast description (defaults to item name) */
    description?: string;
    /** Whether to show the toast (defaults to true) */
    showToast?: boolean;
}

/**
 * Hook that provides an addToCart function which adds an item to the cart
 * and shows a toast notification with a "View Cart" action button.
 */
export function useAddToCartWithToast() {
    const { addItem } = useCart();

    const addToCart = useCallback(
        (item: Omit<CartItem, 'quantity'>, options?: AddToCartOptions) => {
            const {
                title = 'Added to cart',
                description,
                showToast = true,
            } = options || {};

            // Add the item to cart
            addItem(item);

            // Show toast with View Cart action
            if (showToast) {
                toast.success(title, {
                    description: description || item.name,
                    action: {
                        label: 'View Cart',
                        onClick: () => router.visit('/cart'),
                    },
                });
            }
        },
        [addItem],
    );

    return { addToCart };
}

export default useAddToCartWithToast;
