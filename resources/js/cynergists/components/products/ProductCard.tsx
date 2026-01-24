import { Link } from "@inertiajs/react";
import { ShoppingCart, ArrowRight, Check } from "lucide-react";
import { OrbitingButton } from "@/components/ui/orbiting-button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/hooks/useProductsQueries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface ProductCardProps {
  product: Product & { categories?: { name: string } | null };
  variant?: "default" | "specialist";
  showFeatures?: boolean;
  maxFeatures?: number;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const ProductCard = ({
  product,
  variant = "default",
  showFeatures = true,
  maxFeatures = 4,
}: ProductCardProps) => {
  const { addItem, openCart } = useCart();
  const [commitment, setCommitment] = useState<"part-time" | "full-time">("full-time");

  const isSpecialist = variant === "specialist" || product.categories?.name === "Team";

  const getPrice = () => {
    if (isSpecialist) {
      return commitment === "part-time"
        ? product.part_time_price || product.price / 2
        : product.price;
    }
    return product.price;
  };

  const getHours = () => (commitment === "part-time" ? 80 : 160);

  const handleAddToCart = () => {
    const price = getPrice();

    if (isSpecialist) {
      addItem({
        id: `${product.product_sku || product.id}-${commitment}`,
        type: "role",
        name: product.product_name,
        description: `${commitment === "part-time" ? "Part-Time" : "Full-Time"} – ${getHours()} hrs/mo`,
        price,
        billingPeriod: "monthly",
        metadata: {
          hoursPerMonth: getHours(),
          commitment,
          hourlyRate: product.hourly_rate,
        },
      });
    } else {
      addItem({
        id: product.product_sku || product.id,
        type: "plan",
        name: product.product_name,
        description: product.short_description || "",
        price,
        billingPeriod: product.billing_type === "one_time" ? undefined : "monthly",
      });
    }
    openCart();
  };

  const categoryName = product.categories?.name || "Product";
  const features = product.whats_included?.split("\n").slice(0, maxFeatures) || [];

  return (
    <article className="card-glass flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-xl font-semibold text-foreground">{product.product_name}</h3>
        <Badge
          variant={categoryName === "AI Agent" ? "default" : "secondary"}
          className="text-xs shrink-0"
        >
          {categoryName}
        </Badge>
      </div>

      {/* Description */}
      <p className="text-sm text-foreground/80 mb-4">{product.short_description}</p>

      {/* Specialist Commitment Selector */}
      {isSpecialist && (
        <div className="mb-4">
          <Select
            value={commitment}
            onValueChange={(value: "part-time" | "full-time") => setCommitment(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full-time">Full-Time (160 hrs/mo)</SelectItem>
              <SelectItem value="part-time">Part-Time (80 hrs/mo)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Features List */}
      {showFeatures && features.length > 0 && (
        <ul className="space-y-2 mb-6">
          {features.map((item, idx) => (
            <li key={idx} className="flex items-center gap-2 text-sm text-foreground/80">
              <Check className="h-4 w-4 text-primary flex-shrink-0" />
              {item.replace(/^[-•]\s*/, "")}
            </li>
          ))}
        </ul>
      )}

      {/* Price & CTAs */}
      <div className="flex flex-col gap-3 mt-auto">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-primary">
              {product.price > 0 ? formatPrice(getPrice()) : "Free"}
            </span>
            {product.billing_type !== "one_time" && (
              <span className="text-sm text-muted-foreground">/mo</span>
            )}
            {isSpecialist && (
              <p className="text-xs text-muted-foreground">{getHours()} hours per month</p>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <OrbitingButton className="btn-primary w-full" onClick={handleAddToCart}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </OrbitingButton>

        {/* Learn More Link */}
        {product.url && (
          <Link 
            href={product.url}
            className="w-full text-center text-primary hover:text-primary/80 text-sm font-medium inline-flex items-center justify-center py-2"
          >
            Learn More
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        )}
      </div>
    </article>
  );
};

export default ProductCard;
