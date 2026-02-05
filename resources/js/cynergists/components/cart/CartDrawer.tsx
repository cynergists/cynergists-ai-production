import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OrbitingButton } from '@/components/ui/orbiting-button';
import { useCart } from '@/contexts/CartContext';
import { Link, router } from '@inertiajs/react';
import { ArrowRight, Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const getTypeLabel = (type: string) => {
    switch (type) {
        case 'role':
            return 'Specialist';
        case 'plan':
            return 'Plan';
        case 'ai-agent':
            return 'AI Agent';
        case 'software':
            return 'Software';
        case 'product':
            return 'Product';
        default:
            return type;
    }
};

const getTypeBadgeVariant = (type: string) => {
    switch (type) {
        case 'role':
            return 'default';
        case 'plan':
            return 'secondary';
        case 'ai-agent':
            return 'outline';
        case 'software':
            return 'secondary';
        case 'product':
            return 'secondary';
        default:
            return 'default';
    }
};

const CartDrawer = () => {
    const {
        items,
        removeItem,
        updateQuantity,
        clearCart,
        isOpen,
        closeCart,
        totalItems,
        totalPrice,
    } = useCart();

    const handleTypeBadgeClick = (type: string) => {
        closeCart();
        router.visit(
            `/admin/plans?search=${encodeURIComponent(getTypeLabel(type))}`,
        );
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
                onClick={closeCart}
            />

            {/* Drawer */}
            <div className="animate-slide-in-right fixed top-0 right-0 z-50 flex h-screen w-full max-w-md flex-col overflow-hidden border-l border-border bg-card">
                {/* Header */}
                <div className="flex-shrink-0 border-b border-border p-6">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ShoppingCart className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-bold">Your Cart</h2>
                            {totalItems > 0 && (
                                <Badge variant="secondary" className="ml-2">
                                    {totalItems}{' '}
                                    {totalItems === 1 ? 'item' : 'items'}
                                </Badge>
                            )}
                        </div>
                        <button
                            onClick={closeCart}
                            className="rounded-lg p-2 transition-colors hover:bg-muted"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    {totalItems > 0 && (
                        <div className="flex flex-col gap-1 rounded-lg bg-primary/10 px-4 py-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Monthly Total
                                </span>
                                <span className="text-lg font-bold text-primary">
                                    {formatCurrency(totalPrice)}/mo
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Billed monthly
                            </p>
                        </div>
                    )}
                </div>

                {/* Cart Items */}
                <div className="min-h-0 flex-1 overflow-y-auto p-6">
                    {items.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-center">
                            <ShoppingCart className="mb-4 h-16 w-16 text-muted-foreground/30" />
                            <p className="mb-2 text-lg font-medium text-muted-foreground">
                                Your cart is empty
                            </p>
                            <p className="mb-6 text-sm text-muted-foreground">
                                Add specialists, plans, or AI agents to get
                                started
                            </p>
                            <Button
                                asChild
                                variant="outline"
                                onClick={closeCart}
                            >
                                <Link href="/marketplace">Browse Services</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-lg border border-border/50 bg-muted/30 p-4"
                                >
                                    <div className="mb-2 flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="mb-1 flex items-center gap-2">
                                                <Badge
                                                    variant={
                                                        getTypeBadgeVariant(
                                                            item.type,
                                                        ) as
                                                            | 'default'
                                                            | 'secondary'
                                                            | 'outline'
                                                    }
                                                    className="cursor-pointer transition-opacity hover:opacity-80"
                                                    onClick={() =>
                                                        handleTypeBadgeClick(
                                                            item.type,
                                                        )
                                                    }
                                                >
                                                    {getTypeLabel(item.type)}
                                                </Badge>
                                                {item.metadata?.commitment && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        {item.metadata
                                                            .commitment ===
                                                        'full-time'
                                                            ? 'Full-Time'
                                                            : 'Part-Time'}
                                                    </Badge>
                                                )}
                                            </div>
                                            <h3 className="font-semibold text-foreground">
                                                {item.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {item.description}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="rounded p-1.5 transition-colors hover:bg-destructive/10 hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() =>
                                                    updateQuantity(
                                                        item.id,
                                                        item.quantity - 1,
                                                    )
                                                }
                                                className="rounded bg-muted p-1 transition-colors hover:bg-muted/80"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <span className="w-8 text-center font-medium">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    updateQuantity(
                                                        item.id,
                                                        item.quantity + 1,
                                                    )
                                                }
                                                className="rounded bg-muted p-1 transition-colors hover:bg-muted/80"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-primary">
                                                {formatCurrency(
                                                    item.price * item.quantity,
                                                )}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatCurrency(item.price)}/mo
                                                each
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="flex-shrink-0 border-t border-border bg-card p-6">
                        <div className="mb-4 flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Monthly Total:
                                </span>
                                <span className="text-2xl font-bold text-primary">
                                    {formatCurrency(totalPrice)}/mo
                                </span>
                            </div>
                            <p className="text-right text-xs text-muted-foreground">
                                All items billed monthly
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <OrbitingButton
                                asChild
                                className="btn-primary w-full"
                                onClick={() => {
                                    closeCart();
                                    window.scrollTo(0, 0);
                                }}
                            >
                                <Link href="/cart">
                                    View Cart
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </OrbitingButton>
                            <Button
                                variant="ghost"
                                className="text-muted-foreground hover:text-destructive"
                                onClick={clearCart}
                            >
                                Clear Cart
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartDrawer;
