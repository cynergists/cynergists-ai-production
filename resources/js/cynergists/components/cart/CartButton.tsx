import { Link } from "@inertiajs/react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

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
      className="relative p-2 rounded-lg hover:bg-muted transition-colors"
      aria-label="View cart"
    >
      <ShoppingCart className="h-5 w-5 text-foreground/80" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {totalItems > 9 ? "9+" : totalItems}
        </span>
      )}
    </Link>
  );
};

export default CartButton;
