import { Link } from "@inertiajs/react";
import { ShoppingCart, ArrowRight, Check, Bot, Plug } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { OrbitingButton } from "@/components/ui/orbiting-button";
import { useAddToCartWithToast } from "@/hooks/useAddToCartWithToast";

interface AIAgentDetailLayoutProps {
  // Agent Info
  id: string;
  name: string;
  category?: string;
  categoryIcon?: ReactNode;
  shortDescription: string;
  price: number;
  billingPeriod?: "monthly" | "annual" | "one_time";
  imageUrl?: string;
  
  // Content sections
  features?: string[];
  perfectFor?: string[];
  integrations?: string[];
  
  // CTAs
  primaryCtaText?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  
  // Custom content sections rendered after main layout
  children?: ReactNode;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const AIAgentDetailLayout = ({
  id,
  name,
  category,
  categoryIcon,
  shortDescription,
  price,
  billingPeriod = "monthly",
  imageUrl,
  features = [],
  perfectFor = [],
  integrations = [],
  primaryCtaText = "Add to Cart",
  secondaryCtaText = "Schedule a Call",
  secondaryCtaLink = "/schedule",
  children,
}: AIAgentDetailLayoutProps) => {
  const { addToCart } = useAddToCartWithToast();

  const handleAddToCart = () => {
    addToCart({
      id,
      type: "ai-agent",
      name,
      description: shortDescription,
      price,
      billingPeriod: billingPeriod === "one_time" ? "monthly" : billingPeriod,
    });
  };

  return (
    <>
      {/* Hero Section - Image Left, Details Right */}
      <section className="py-20 lg:py-32 gradient-hero">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Left - Image/Visual */}
            <div className="order-2 lg:order-1">
              {imageUrl ? (
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-border/50 shadow-2xl">
                  <img
                    src={imageUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-border/50 shadow-2xl bg-card/50 flex items-center justify-center">
                  <div className="p-8 text-center">
                    <div className="mx-auto mb-4 p-6 rounded-2xl bg-primary/10 border border-primary/30 inline-block">
                      {categoryIcon || <Bot className="h-12 w-12 text-primary" />}
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">{name}</h3>
                  </div>
                </div>
              )}
            </div>

            {/* Right - Details */}
            <div className="order-1 lg:order-2">
              {/* Category Badge */}
              {category && (
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
                  {categoryIcon || <Bot className="h-4 w-4 text-primary" />}
                  <span className="text-sm text-primary font-medium">{category}</span>
                </div>
              )}

              {/* Title */}
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                {name}
              </h1>

              {/* Description */}
              <p className="text-lg md:text-xl text-foreground/80 mb-8">
                {shortDescription}
              </p>

              {/* Price */}
              <div className="mb-8">
                <span className="text-4xl font-bold text-primary">
                  {price > 0 ? formatPrice(price) : "Free"}
                </span>
                {billingPeriod !== "one_time" && price > 0 && (
                  <span className="text-lg text-muted-foreground">
                    /{billingPeriod === "monthly" ? "month" : "year"}
                  </span>
                )}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <OrbitingButton className="btn-primary" onClick={handleAddToCart}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {primaryCtaText}
                </OrbitingButton>
                <Button asChild variant="outline">
                  <Link href={secondaryCtaLink}>
                    {secondaryCtaText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {features.length > 0 && (
        <section className="py-20 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
                What's <span className="text-gradient">Included</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-4 rounded-xl bg-background/50 border border-border/50"
                  >
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Perfect For & Integrations Section */}
      {(perfectFor.length > 0 || integrations.length > 0) && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
              {perfectFor.length > 0 && (
                <div className="card-glass border-primary">
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    Perfect For
                  </h3>
                  <div className="space-y-3">
                    {perfectFor.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground/80">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {integrations.length > 0 && (
                <div className="card-glass">
                  <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Plug className="h-5 w-5 text-primary" />
                    Integrations
                  </h3>
                  <div className="space-y-3">
                    {integrations.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground/80">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Custom Content */}
      {children}

      {/* Bottom CTA */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            {shortDescription}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <OrbitingButton className="btn-primary" onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              {primaryCtaText}
            </OrbitingButton>
            <Button asChild variant="outline">
              <Link href={secondaryCtaLink}>
                {secondaryCtaText}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default AIAgentDetailLayout;
