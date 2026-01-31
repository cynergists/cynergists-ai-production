import { Link, router } from "@inertiajs/react";
import { ShoppingCart, X, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrbitingButton } from "@/components/ui/orbiting-button";
import { useCart } from "@/contexts/CartContext";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "role":
      return "Specialist";
    case "plan":
      return "Plan";
    case "ai-agent":
      return "AI Agent";
    case "software":
      return "Software";
    case "product":
      return "Product";
    default:
      return type;
  }
};

const getTypeBadgeVariant = (type: string) => {
  switch (type) {
    case "role":
      return "default";
    case "plan":
      return "secondary";
    case "ai-agent":
      return "outline";
    case "software":
      return "secondary";
    case "product":
      return "secondary";
    default:
      return "default";
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
    router.visit(`/admin/plans?search=${encodeURIComponent(getTypeLabel(type))}`);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-screen w-full max-w-md bg-card border-l border-border z-50 animate-slide-in-right flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Your Cart</h2>
              {totalItems > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </Badge>
              )}
            </div>
            <button
              onClick={closeCart}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {totalItems > 0 && (
            <div className="flex flex-col gap-1 bg-primary/10 rounded-lg px-4 py-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Monthly Total</span>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(totalPrice)}/mo
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Billed monthly</p>
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                Your cart is empty
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Add specialists, plans, or AI agents to get started
              </p>
              <Button asChild variant="outline" onClick={closeCart}>
                <Link href="/pricing">Browse Services</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-lg bg-muted/30 border border-border/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant={getTypeBadgeVariant(item.type) as "default" | "secondary" | "outline"}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleTypeBadgeClick(item.type)}
                        >
                          {getTypeLabel(item.type)}
                        </Badge>
                        {item.metadata?.commitment && (
                          <Badge variant="outline" className="text-xs">
                            {item.metadata.commitment === "full-time" ? "Full-Time" : "Part-Time"}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 rounded bg-muted hover:bg-muted/80 transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 rounded bg-muted hover:bg-muted/80 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(item.price)}/mo each
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
          <div className="p-6 border-t border-border bg-card flex-shrink-0">
            <div className="flex flex-col gap-1 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Monthly Total:</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(totalPrice)}/mo
                </span>
              </div>
              <p className="text-xs text-muted-foreground text-right">All items billed monthly</p>
            </div>
            <div className="flex flex-col gap-2">
              <OrbitingButton asChild className="btn-primary w-full" onClick={() => { closeCart(); window.scrollTo(0, 0); }}>
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
