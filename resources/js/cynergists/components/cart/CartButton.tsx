import { useCart } from '@/contexts/CartContext';
import { Link } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';

interface CartButtonProps {
    alwaysShow?: boolean;
}

const CartButton = ({ alwaysShow = false }: CartButtonProps) => {
    const { totalItems } = useCart();

    // Hide cart button if empty (unless alwaysShow is true)
    if (totalItems === 0 && !alwaysShow) {
        return null;
    }

    return (
        <Link
            href="/cart"
            className="relative rounded-lg p-2 transition-colors hover:bg-muted"
            aria-label="View cart"
        >
            <ShoppingCart className="h-5 w-5 text-foreground/80" />
            {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {totalItems > 9 ? '9+' : totalItems}
                </span>
            )}
        </Link>
    );
};

export default CartButton;
