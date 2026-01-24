import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link, router } from "@inertiajs/react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { OrbitingButton } from "@/components/ui/orbiting-button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Users, Loader2 } from "lucide-react";
import CheckoutBump from "@/components/checkout/CheckoutBump";
import CheckoutBumpCRM from "@/components/checkout/CheckoutBumpCRM";

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
    default:
      return "default";
  }
};

// Full pool of specialists to recommend as upsells
const allRecommendedSpecialists = [
  {
    id: "administrative-assistant",
    name: "Administrative Assistant",
    hourlyRate: 15,
    partTime: 1200,
    fullTime: 2400,
    description: "Keep your operations running smoothly with dedicated admin support.",
  },
  {
    id: "bookkeeper",
    name: "Bookkeeper",
    hourlyRate: 18,
    partTime: 1440,
    fullTime: 2880,
    description: "Maintain accurate financials and stay IRS-ready year-round.",
  },
  {
    id: "video-editor",
    name: "Video Editor",
    hourlyRate: 25,
    partTime: 2000,
    fullTime: 4000,
    description: "Transform raw footage into polished, professional content.",
  },
  {
    id: "seo-specialist",
    name: "SEO Specialist",
    hourlyRate: 25,
    partTime: 2000,
    fullTime: 4000,
    description: "Boost your organic traffic and search engine rankings.",
  },
  {
    id: "ad-campaign-manager",
    name: "Ad Campaign Manager",
    hourlyRate: 25,
    partTime: 2000,
    fullTime: 4000,
    description: "Maximize your ad spend ROI across all platforms.",
  },
  {
    id: "copywriter",
    name: "Copywriter",
    hourlyRate: 20,
    partTime: 1600,
    fullTime: 3200,
    description: "Craft compelling copy that converts visitors into customers.",
  },
  {
    id: "executive-assistant",
    name: "Executive Assistant",
    hourlyRate: 20,
    partTime: 1600,
    fullTime: 3200,
    description: "High-level support for busy executives and founders.",
  },
  {
    id: "crm-administrator",
    name: "CRM Administrator",
    hourlyRate: 18,
    partTime: 1440,
    fullTime: 2880,
    description: "Keep your CRM organized and your pipeline flowing.",
  },
  {
    id: "automation-engineer",
    name: "Automation Engineer",
    hourlyRate: 25,
    partTime: 2000,
    fullTime: 4000,
    description: "Eliminate manual tasks with smart automation workflows.",
  },
  {
    id: "web-developer",
    name: "Web Developer",
    hourlyRate: 25,
    partTime: 2000,
    fullTime: 4000,
    description: "Build and maintain high-performance websites and apps.",
  },
  {
    id: "customer-success-manager",
    name: "Customer Success Manager",
    hourlyRate: 21,
    partTime: 1680,
    fullTime: 3360,
    description: "Keep your customers happy and reduce churn.",
  },
  {
    id: "appointment-setter",
    name: "Appointment Setter",
    hourlyRate: 18,
    partTime: 1440,
    fullTime: 2880,
    description: "Fill your calendar with qualified leads and meetings.",
  },
];

const Cart = () => {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    addItem,
    totalItems,
    totalPrice,
  } = useCart();

  const handleTypeBadgeClick = (type: string) => {
    router.visit(`/admin/plans?search=${encodeURIComponent(getTypeLabel(type))}`);
  };
  
  const [checkingAuth, setCheckingAuth] = useState(false);

  const handleCheckout = async () => {
    setCheckingAuth(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Store intended destination
        sessionStorage.setItem("checkout_redirect", "/checkout");
        router.visit("/signin");
      } else {
        router.visit("/checkout");
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      router.visit("/signin");
    } finally {
      setCheckingAuth(false);
    }
  };

  // Filter out specialists that are already in cart and limit to 4
  const filteredRecommendations = allRecommendedSpecialists
    .filter((specialist) => !items.some((item) => item.id.startsWith(specialist.id)))
    .slice(0, 4);

  // Track commitment selection for each recommended specialist
  const [commitmentSelections, setCommitmentSelections] = useState<Record<string, "part-time" | "full-time">>({});

  // Get commitment for a specialist, defaulting to part-time
  const getCommitment = (specialistId: string) => commitmentSelections[specialistId] || "full-time";

  const handleCommitmentChange = (specialistId: string, commitment: "part-time" | "full-time") => {
    setCommitmentSelections(prev => ({ ...prev, [specialistId]: commitment }));
  };

  const handleAddRecommended = (specialist: typeof allRecommendedSpecialists[0]) => {
    const commitment = getCommitment(specialist.id);
    const price = commitment === "part-time" ? specialist.partTime : specialist.fullTime;
    const hours = commitment === "part-time" ? 80 : 160;
    
    addItem({
      id: `${specialist.id}-${commitment}`,
      type: "role",
      name: specialist.name,
      description: `${commitment === "part-time" ? "Part-Time" : "Full-Time"} – ${hours} hrs/mo`,
      price,
      billingPeriod: "monthly",
      metadata: {
        hoursPerMonth: hours,
        commitment,
        hourlyRate: specialist.hourlyRate,
      },
    });
  };

  return (
    <Layout>
      <Helmet>
        <title>Your Cart | Cynergists</title>
        <meta name="description" content="Review your selected services and specialists before scheduling a call to finalize." />
      </Helmet>

      <main className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/30">
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Your Cart</h1>
                {totalItems > 0 && (
                  <p className="text-muted-foreground">
                    {totalItems} {totalItems === 1 ? "item" : "items"} • {formatCurrency(totalPrice)}/month
                  </p>
                )}
              </div>
            </div>

            {items.length === 0 ? (
              /* Empty State */
              <div className="card-glass text-center py-16">
                <ShoppingCart className="h-20 w-20 text-muted-foreground/30 mx-auto mb-6" />
                <h2 className="text-2xl font-bold mb-3">Your cart is empty</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Add specialists, plans, or AI agents to get started building your dream team.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <OrbitingButton asChild className="btn-primary">
                    <Link href="/pricing">
                      View Plans
                    </Link>
                  </OrbitingButton>
                  <Button asChild variant="outline">
                    <Link href="/services">Learn About AI Agents</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart Items - Scrollable */}
                <div className="lg:col-span-2">
                  <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="card-glass flex flex-col sm:flex-row sm:items-center gap-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
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
                          <h3 className="text-lg font-semibold">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="text-right min-w-[100px]">
                            <p className="text-lg font-bold text-primary">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(item.price)}/mo
                            </p>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive mt-4"
                    onClick={clearCart}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear Cart
                  </Button>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="card-glass sticky top-24">
                    <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                    
                    <div className="space-y-3 mb-6">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground truncate pr-2">
                            {item.name} {item.quantity > 1 && `x${item.quantity}`}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-border pt-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium">Monthly Total</span>
                        <span className="text-2xl font-bold text-primary">
                          {formatCurrency(totalPrice)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Billed monthly • 6-month commitment
                      </p>
                    </div>

                    {/* Order Bumps - Hide for partner packages */}
                    {!items.some(item => item.metadata?.isPartnerPackage) && (
                      <div className="mb-4">
                        <CheckoutBump />
                        <CheckoutBumpCRM />
                      </div>
                    )}

                    <OrbitingButton 
                      className="btn-primary w-full mb-3"
                      onClick={handleCheckout}
                      disabled={checkingAuth}
                    >
                      {checkingAuth ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ShoppingCart className="mr-2 h-4 w-4" />
                      )}
                      Check Out
                    </OrbitingButton>
                    
                    <p className="text-xs text-center text-muted-foreground">
                      Review your selections and complete your order.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Recommended Specialists Section */}
            {items.length > 0 && filteredRecommendations.length > 0 && (
              <section className="mt-16">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Recommended Based On Your Cart</h2>
                </div>
                <p className="text-muted-foreground mb-8">
                  Complement your team with these popular specialists.
                </p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredRecommendations.map((specialist) => {
                    const commitment = getCommitment(specialist.id);
                    const price = commitment === "part-time" ? specialist.partTime : specialist.fullTime;
                    
                    return (
                      <div
                        key={specialist.id}
                        className="card-glass flex flex-col"
                      >
                        <h3 className="font-semibold mb-2">{specialist.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4 flex-1">
                          {specialist.description}
                        </p>
                        
                        {/* Price Display */}
                        <div className="mb-3">
                          <span className="text-2xl font-bold text-primary">
                            {formatCurrency(price)}
                          </span>
                          <span className="text-sm text-muted-foreground">/mo</span>
                        </div>
                        
                        {/* Commitment Dropdown */}
                        <div className="mb-3">
                          <Select
                            value={commitment}
                            onValueChange={(value: "part-time" | "full-time") => 
                              handleCommitmentChange(specialist.id, value)
                            }
                          >
                            <SelectTrigger className="w-full h-9 text-sm bg-primary/10 border-primary/30 text-primary font-medium hover:bg-primary/20 focus:ring-primary/30">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="part-time">Part-Time (80 hrs/mo)</SelectItem>
                              <SelectItem value="full-time">Full-Time (160 hrs/mo)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => handleAddRecommended(specialist)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add to Cart
                        </Button>
                      </div>
                    );
                  })}
                </div>

                <div className="text-center mt-8">
                  <Button asChild variant="outline">
                    <Link href="/hourly-specialists">
                      View All Specialists
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Cart;