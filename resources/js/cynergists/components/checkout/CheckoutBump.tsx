import { useState } from "react";
import { Check, Plus, Zap } from "lucide-react";
import { OrbitingButton } from "@/components/ui/orbiting-button";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const LINKEDIN_OUTREACH_PRODUCT = {
  id: "product-linkedin-outreach",
  type: "ai-agent" as const,
  name: "LinkedIn Outreach",
  description: "Automated LinkedIn outreach system",
  price: 397,
  billingPeriod: "monthly" as const,
};

const CheckoutBump = () => {
  const { items, addItem } = useCart();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  // Check if LinkedIn Outreach is already in cart
  const hasLinkedIn = items.some((item) => item.id === LINKEDIN_OUTREACH_PRODUCT.id);

  // Don't show if already in cart
  if (hasLinkedIn) return null;

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem(LINKEDIN_OUTREACH_PRODUCT);
    toast({
      title: "Added to your order!",
      description: "LinkedIn Outreach has been added to your cart.",
    });
    setTimeout(() => setIsAdding(false), 500);
  };

  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-primary/50 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-5 mb-6">
      {/* Ribbon badge */}
      <div className="absolute -right-8 top-3 rotate-45 bg-primary px-8 py-1 text-xs font-bold uppercase text-primary-foreground shadow-lg">
        Add-On
      </div>

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/20">
          <Zap className="h-6 w-6 text-primary" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-foreground mb-1">
            Add LinkedIn Outreach?
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Automate your LinkedIn prospecting with AI-powered outreach. Connect with ideal clients while you focus on closing deals.
          </p>

          {/* Benefits */}
          <ul className="space-y-1.5 mb-4">
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary shrink-0" />
              <span>Automated connection requests & follow-ups</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary shrink-0" />
              <span>AI-personalized messaging at scale</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary shrink-0" />
              <span>Lead tracking & CRM integration</span>
            </li>
          </ul>

          {/* Price and CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(LINKEDIN_OUTREACH_PRODUCT.price)}
              </span>
              <span className="text-sm text-muted-foreground">/month</span>
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
