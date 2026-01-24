import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CreditCard, Lock, ShieldCheck, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { usePaymentSettings } from "@/hooks/usePaymentSettings";
import type { PaymentMethod, ContactInfo, TransactionData } from "@/pages/Checkout";

// Square SDK types - using module augmentation to avoid conflicts
interface SquareCardOptions {
  style?: Record<string, Record<string, string>>;
}

interface SquarePaymentsLocal {
  card: (options?: SquareCardOptions) => Promise<SquareCardLocal>;
}

interface SquareCardLocal {
  attach: (selector: string) => Promise<void>;
  tokenize: () => Promise<{ status: string; token?: string; errors?: Array<{ message: string }> }>;
  destroy: () => void;
}

interface PaymentStepProps {
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
  planName: string;
  planPrice: number;
  billingPeriod: "monthly" | "annual";
  contactData: ContactInfo;
  companyName?: string;
  onNext: () => void;
  onBack: () => void;
  onTransactionComplete: (transaction: TransactionData) => void;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const formatCardNumber = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  const groups = digits.match(/.{1,4}/g);
  return groups ? groups.join(" ").slice(0, 19) : "";
};

const formatExpiry = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  if (digits.length >= 2) {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
  }
  return digits;
};

const generateIdempotencyKey = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

const PaymentStep = ({
  selectedMethod,
  onSelectMethod,
  planName,
  planPrice,
  billingPeriod,
  contactData,
  companyName,
  onNext,
  onBack,
  onTransactionComplete,
}: PaymentStepProps) => {
  const { items, totalPrice, clearCart } = useCart();
  const { settings: paymentSettings } = usePaymentSettings();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  // Square SDK state
  const [squareLoaded, setSquareLoaded] = useState(false);
  const [squareCard, setSquareCard] = useState<SquareCardLocal | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [isInitializingCard, setIsInitializingCard] = useState(false);
  const [cardInitError, setCardInitError] = useState<string | null>(null);
  
  // Pre-fill name from contact data
  const fullName = `${contactData.firstName} ${contactData.lastName}`.trim();
  
  // Credit Card State (for sandbox mode)
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState(fullName);

  const displayPlanName = planName;
  const isProduction = paymentSettings.paymentMode === "production";

  // Auto-select credit card as the only payment method
  if (selectedMethod !== "credit_card") {
    onSelectMethod("credit_card");
  }
  
  // Separate items by billing period
  const monthlyItems = items.filter(item => item.billingPeriod === 'monthly');
  const annualItems = items.filter(item => item.billingPeriod === 'annual');
  
  // Calculate monthly items total (due monthly)
  const monthlyItemsTotal = monthlyItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Calculate annual items total (price already reflects annual discount, multiply by 12 for full year)
  const annualItemsTotal = annualItems.reduce((sum, item) => sum + item.price * 12 * item.quantity, 0);
  
  // Calculate savings for annual items (they get 10% off, so original was price / 0.9)
  const annualSavings = annualItems.reduce((total, item) => {
    const originalMonthly = item.price / 0.9;
    const savingsPerItem = originalMonthly * 0.1 * 12 * item.quantity;
    return total + savingsPerItem;
  }, 0);
  
  // Total due today: annual items (full year) + monthly items (1 month)
  const subtotalDueToday = annualItemsTotal + monthlyItemsTotal;
  
  // No processing fee - we absorb credit card fees
  const processingFee = 0;
  
  // Final amount due (same as subtotal since no fee)
  const amountDue = subtotalDueToday;
  
  // Determine if cart has any annual items or only monthly
  const hasAnnualItems = annualItems.length > 0;
  const hasMonthlyItems = monthlyItems.length > 0;
  const hasMixedBilling = hasAnnualItems && hasMonthlyItems;

  // Load Square SDK for production mode
  useEffect(() => {
    if (isProduction && !squareLoaded) {
      const script = document.createElement("script");
      script.src = "https://web.squarecdn.com/v1/square.js";
      script.async = true;
      script.onload = () => setSquareLoaded(true);
      document.body.appendChild(script);
      
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [isProduction, squareLoaded]);

  // Fetch location ID and application ID from edge function
  useEffect(() => {
    if (isProduction && (!locationId || !applicationId)) {
      fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-square-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get-location" }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Square config received:", { locationId: data.locationId, applicationId: data.applicationId, paymentMode: data.paymentMode });
          if (data.locationId) setLocationId(data.locationId);
          if (data.applicationId) setApplicationId(data.applicationId);
          if (data.error) {
            console.error("Error fetching Square config:", data.error);
            setCardInitError(data.error);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch Square config:", err);
          setCardInitError("Failed to connect to payment service");
        });
    }
  }, [isProduction, locationId, applicationId]);

  // Initialize Square Card for production card payments
  useEffect(() => {
    let isMounted = true;
    let cardInstance: SquareCardLocal | null = null;
    
    const initSquareCard = async () => {
      if (!isProduction || !squareLoaded || !window.Square || !locationId || !applicationId) {
        return;
      }

      // Wait for the container to be rendered
      const container = document.getElementById("square-card-container");
      if (!container) {
        // Retry after a short delay if container isn't ready
        setTimeout(() => {
          if (isMounted) initSquareCard();
        }, 100);
        return;
      }

      setIsInitializingCard(true);
      setCardInitError(null);

      try {
        // Clean up any existing Square card first
        if (squareCard) {
          try {
            squareCard.destroy();
          } catch (e) {
            console.warn("Error destroying previous Square card:", e);
          }
          setSquareCard(null);
        }

        console.log("Initializing Square payments with:", { applicationId, locationId });
        const payments = await window.Square.payments(applicationId, locationId);
        if (!isMounted) return;
        
        // Styling for Square card iframe
        const cardStyle = {
          input: {
            backgroundColor: 'transparent',
            color: 'hsl(var(--foreground))',
            fontFamily: 'inherit',
            fontSize: '14px',
          },
          'input::placeholder': {
            color: 'hsl(var(--muted-foreground))',
          },
          'input.is-focus': {
            backgroundColor: 'transparent',
          },
          '.input-container': {
            borderColor: 'hsl(var(--border))',
            borderWidth: '1px',
            borderRadius: '6px',
          },
          '.input-container.is-focus': {
            borderColor: 'hsl(var(--primary))',
            borderWidth: '1px',
          },
          '.input-container.is-error': {
            borderColor: 'hsl(var(--destructive))',
            borderWidth: '1px',
          },
          '.message-text': {
            color: 'hsl(var(--muted-foreground))',
          },
          '.message-icon': {
            color: 'hsl(var(--muted-foreground))',
          },
          '.message-text.is-error': {
            color: 'hsl(var(--destructive))',
          },
          '.message-icon.is-error': {
            color: 'hsl(var(--destructive))',
          },
        };
        
        const card = await payments.card({
          style: cardStyle,
        });
        if (!isMounted) {
          card.destroy();
          return;
        }
        
        cardInstance = card;
        
        // Double-check container still exists before attaching
        const containerCheck = document.getElementById("square-card-container");
        if (!containerCheck) {
          card.destroy();
          return;
        }
        
        await card.attach("#square-card-container");
        if (!isMounted) {
          card.destroy();
          return;
        }
        
        setSquareCard(card);
        setCardInitError(null);
        console.log("Square card initialized successfully");
      } catch (error) {
        console.error("Failed to initialize Square card:", error);
        if (isMounted) {
          setCardInitError(error instanceof Error ? error.message : "An unexpected error occurred while initializing the payment method");
        }
      } finally {
        if (isMounted) {
          setIsInitializingCard(false);
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(initSquareCard, 50);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (cardInstance) {
        try {
          cardInstance.destroy();
        } catch (e) {
          console.warn("Error destroying Square card on cleanup:", e);
        }
      }
    };
  }, [isProduction, squareLoaded, locationId, applicationId]);

  // Cleanup Square card on unmount
  useEffect(() => {
    return () => {
      if (squareCard) {
        try {
          squareCard.destroy();
        } catch (e) {
          console.warn("Error destroying Square card on unmount:", e);
        }
      }
    };
  }, [squareCard]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      let sourceId: string;

      if (isProduction) {
        // Tokenize with Square SDK
        if (!squareCard) {
          throw new Error("Payment form not properly initialized. Please refresh and try again.");
        }
        const result = await squareCard.tokenize();
        if (result.status !== "OK" || !result.token) {
          throw new Error(result.errors?.[0]?.message || "Card tokenization failed. Please check your card details.");
        }
        sourceId = result.token;
      } else {
        // Use sandbox test nonce
        sourceId = "cnon:card-nonce-ok";
      }

      // Build cart items for the API
      const cartItemsForApi = items.map(item => ({
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        price: Math.round(item.price * 100), // Convert to cents
      }));

      const { data, error } = await supabase.functions.invoke("process-square-payment", {
        body: {
          sourceId,
          amount: Math.round(amountDue * 100), // Total amount in cents
          currency: "USD",
          customerEmail: contactData.email,
          customerName: fullName,
          planName: displayPlanName,
          billingPeriod: hasMixedBilling ? "mixed" : hasAnnualItems ? "annual" : "monthly",
          monthlyPrice: Math.round(monthlyItemsTotal * 100), // Monthly items total in cents
          idempotencyKey: generateIdempotencyKey(),
          paymentType: "card",
          cartItems: cartItemsForApi,
          processingFee: 0,
        },
      });

      if (error) {
        throw new Error(error.message || "Payment processing failed");
      }

      if (data?.success) {
        // Build transaction data for confirmation page
        const transactionData: TransactionData = {
          subscriptionId: data?.subscriptionId,
          customerId: data?.customerId,
          amountPaid: amountDue,
          processingFee: 0,
          paymentMethod: selectedMethod,
          billingPeriod: hasMixedBilling ? "mixed" : hasAnnualItems ? "annual" : "monthly",
          paidAt: new Date(),
          cartItems: items.map(item => ({
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            price: item.price,
            billingPeriod: item.billingPeriod,
          })),
        };

        // Store transaction data before clearing cart
        onTransactionComplete(transactionData);

        // Send confirmation email (don't block on this)
        const isTestMode = paymentSettings.paymentMode === "sandbox";
        supabase.functions.invoke("send-checkout-confirmation", {
          body: {
            customerEmail: contactData.email,
            customerName: fullName,
            planName: displayPlanName,
            billingPeriod: hasMixedBilling ? "mixed" : hasAnnualItems ? "annual" : "monthly",
            amountPaid: Math.round(amountDue * 100),
            cartItems: cartItemsForApi,
            paymentMethod: selectedMethod,
            processingFee: 0,
            companyName: companyName || undefined,
            transactionId: data?.subscriptionId || data?.transactionId,
            isTestMode,
          },
        }).catch(err => console.error("Failed to send confirmation email:", err));

        // Clear the cart after successful payment
        clearCart();

        toast({
          title: "Payment Successful",
          description: `Your ${displayPlanName} plan subscription is now active.`,
        });
        onNext();
      } else {
        throw new Error(data?.error || "Payment failed");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "There was an error processing your payment. Please try again.";
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const isSandboxCardValid = () => {
    const cardDigits = cardNumber.replace(/\s/g, "");
    const expiryParts = expiry.split("/");
    return (
      cardDigits.length === 16 &&
      expiryParts.length === 2 &&
      expiryParts[0].length === 2 &&
      expiryParts[1].length === 2 &&
      cvv.length >= 3 &&
      cardName.trim().length > 0
    );
  };

  const isFormValid = isProduction ? squareCard !== null && !isInitializingCard : isSandboxCardValid();

  return (
    <div className="card-glass p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <CreditCard className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">
            Payment
          </h2>
          <p className="text-sm text-muted-foreground">
            Enter your card details to complete purchase
          </p>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
        <div className="mb-3">
          <p className="font-semibold text-foreground mb-2">
            Your Order{" "}
            <span className="text-sm font-normal text-muted-foreground">
              ({hasMixedBilling ? "mixed billing" : hasAnnualItems ? "annual billing" : "monthly recurring"})
            </span>
          </p>
          {/* Cart Items */}
          <div className="space-y-1 mb-3">
            {items.map((item) => {
              const isItemAnnual = item.billingPeriod === 'annual';
              const displayPrice = isItemAnnual 
                ? item.price * 12 * item.quantity 
                : item.price * item.quantity;
              const periodLabel = isItemAnnual ? '/yr' : '/mo';
              
              return (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.name} {item.quantity > 1 && `x${item.quantity}`}
                    {isItemAnnual && <span className="text-xs ml-1 text-primary">(Annual)</span>}
                  </span>
                  <span className="text-foreground">{formatPrice(displayPrice)}{periodLabel}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="space-y-2 border-t border-primary/20 pt-3">
          {/* Show monthly items total if any */}
          {hasMonthlyItems && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monthly items (billed monthly)</span>
              <span className="text-foreground">{formatPrice(monthlyItemsTotal)}/mo</span>
            </div>
          )}
          
          {/* Show annual items total if any */}
          {hasAnnualItems && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Annual items (billed yearly)</span>
                <span className="text-foreground">{formatPrice(annualItemsTotal)}/yr</span>
              </div>
              {annualSavings > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-400">Annual savings (10% discount)</span>
                  <span className="text-green-400">{formatPrice(Math.round(annualSavings))}</span>
                </div>
              )}
            </>
          )}
          
          {/* Total due today */}
          <div className="flex justify-between pt-2 border-t border-primary/20">
            <span className="font-semibold text-foreground">Due today</span>
            <span className="text-2xl font-bold text-primary">{formatPrice(amountDue)}</span>
          </div>
          
          {/* Billing explanation */}
          <p className="text-xs text-muted-foreground text-right">
            {hasMixedBilling 
              ? "Annual items paid upfront • Monthly items billed monthly"
              : hasAnnualItems 
                ? "Billed annually"
                : "Billed monthly"
            }
          </p>
        </div>
      </div>

      {/* Credit Card Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-4 w-4 text-primary" />
          <span className="font-medium text-foreground">Credit Card Details</span>
        </div>

        {isProduction ? (
          // Square SDK Card Input for Production
          <div className="space-y-4">
            {cardInitError && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                {cardInitError}
              </div>
            )}
            
            {isInitializingCard && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Initializing payment form...
              </div>
            )}
            
            <div id="square-card-container" className="min-h-[120px] border border-border rounded-lg p-4 bg-background" />
          </div>
        ) : (
          // Manual Card Input for Sandbox
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input
                id="cardName"
                name="ccname"
                type="text"
                autoComplete="cc-name"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="John Smith"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <div className="relative">
                <Input
                  id="cardNumber"
                  name="cardnumber"
                  type="text"
                  autoComplete="cc-number"
                  inputMode="numeric"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="4242 4242 4242 4242"
                  maxLength={19}
                  required
                />
                <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiration Date</Label>
                <Input
                  id="expiry"
                  name="cc-exp"
                  type="text"
                  autoComplete="cc-exp"
                  inputMode="numeric"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/YY"
                  maxLength={5}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  name="cvc"
                  type="text"
                  autoComplete="cc-csc"
                  inputMode="numeric"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="123"
                  maxLength={4}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Security Badge */}
        <div className="flex items-center gap-3 p-4 bg-card/50 border border-border/50 rounded-lg">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">Secure Payment</p>
            <p className="text-xs text-muted-foreground">
              Your payment information is encrypted and securely processed
            </p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="pt-4 flex flex-col-reverse md:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isProcessing}
            className="w-full md:w-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            type="submit"
            className="btn-primary w-full md:w-auto"
            disabled={!isFormValid || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Purchase
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PaymentStep;
