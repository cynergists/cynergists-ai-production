import { Link, router, usePage } from "@inertiajs/react";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useQueryClient } from "@tanstack/react-query";
import BillingStep from "@/components/checkout/BillingStep";
import ConfirmationStep from "@/components/checkout/ConfirmationStep";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

export type PaymentMethod = "ach" | "credit_card" | null;

export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface CompanyInfo {
  jobTitle: string;
  companyName: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
}

export interface SignatureData {
  sectionInitials: Record<string, string>;
  section3Initials?: string;
  section4Initials?: string;
  section5Initials?: string;
  section6Initials?: string;
  section7Initials?: string;
  clientSignature: string;
  signedAt: Date | null;
}

export interface TransactionData {
  subscriptionId?: string;
  customerId?: string;
  amountPaid: number;
  processingFee: number;
  paymentMethod: PaymentMethod;
  billingPeriod: "monthly" | "annual" | "mixed";
  paidAt: Date;
  cartItems: Array<{
    name: string;
    description?: string;
    quantity: number;
    price: number;
    billingPeriod?: "monthly" | "annual";
  }>;
}

export interface CheckoutData {
  contact: ContactInfo;
  company: CompanyInfo;
  signatures: SignatureData;
  paymentMethod: PaymentMethod;
  planName: string;
  planPrice: number;
  billingPeriod: "monthly" | "annual";
  transaction?: TransactionData;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const Checkout = () => {
  const { items, totalPrice, totalItems } = useCart();
  const { props } = usePage<{ auth: { user: { id: string; name: string; email: string } | null } }>();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState<"billing" | "confirmation">("billing");
  const [transactionData, setTransactionData] = useState<TransactionData | undefined>();

  // Redirect if cart is empty (and not on confirmation)
  useEffect(() => {
    if (items.length === 0 && currentStep !== "confirmation") {
      router.visit("/cart");
    }
  }, [items.length, currentStep]);

  const handleTransactionComplete = (transaction: TransactionData) => {
    setTransactionData(transaction);
    // Remove portal agents cache so newly purchased agents appear immediately on next visit
    queryClient.removeQueries({ queryKey: ["portal-agents"] });
  };

  const goToConfirmation = () => {
    setCurrentStep("confirmation");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Build checkout data for confirmation step (simplified)
  const checkoutData: CheckoutData = {
    contact: { firstName: "", lastName: "", email: "", phone: "" },
    company: { jobTitle: "", companyName: "", streetAddress: "", city: "", state: "", zip: "" },
    signatures: { sectionInitials: {}, clientSignature: "", signedAt: null },
    paymentMethod: "credit_card",
    planName: items.map(item => item.name).join(", ") || "Custom Order",
    planPrice: totalPrice,
    billingPeriod: "monthly",
    transaction: transactionData,
  };

  return (
    <Layout>
      <Helmet>
        <title>Checkout | Cynergists</title>
        <meta name="description" content="Complete your Cynergists subscription setup securely." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <main className="min-h-screen py-12 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {currentStep === "billing" && (
              <>
                {/* Back to Cart */}
                <Button variant="ghost" asChild className="mb-6">
                  <Link href="/cart">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Cart
                  </Link>
                </Button>

                {/* Header */}
                <div className="mb-8">
                  <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Checkout
                  </h1>
                  
                  {/* Order Summary Card */}
                  <div className="card-glass p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Your Order</span>
                      <span className="text-sm text-muted-foreground">
                        ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                      </span>
                    </div>
                    <div className="space-y-2">
                      {items.map((item) => {
                        const isAnnual = item.billingPeriod === 'annual';
                        const displayPrice = isAnnual 
                          ? item.price * 12 * item.quantity 
                          : item.price * item.quantity;
                        const periodLabel = isAnnual ? '/yr' : '/mo';
                        
                        return (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {item.name} {item.quantity > 1 && `x${item.quantity}`}
                              {isAnnual && <span className="text-xs ml-1 text-primary">(Annual)</span>}
                            </span>
                            <span className="font-medium">{formatCurrency(displayPrice)}{periodLabel}</span>
                          </div>
                        );
                      })}
                    </div>
                    {(() => {
                      const monthlyItems = items.filter(item => item.billingPeriod === 'monthly');
                      const annualItems = items.filter(item => item.billingPeriod === 'annual');
                      const monthlyTotal = monthlyItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
                      const annualTotal = annualItems.reduce((sum, item) => sum + item.price * 12 * item.quantity, 0);
                      const totalDueToday = annualTotal + monthlyTotal;
                      
                      return (
                        <div className="border-t border-border mt-3 pt-3">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Due Today</span>
                            <span className="text-xl font-bold text-primary">{formatCurrency(totalDueToday)}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Billing Step */}
                <BillingStep
                  onNext={goToConfirmation}
                  onTransactionComplete={handleTransactionComplete}
                  user={props.auth?.user}
                />
              </>
            )}

            {currentStep === "confirmation" && (
              <ConfirmationStep
                checkoutData={checkoutData}
                transactionData={transactionData}
              />
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Checkout;
