import { useState } from "react";
import { Helmet } from "react-helmet";
import { Link, router } from "@inertiajs/react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Check,
  ArrowLeft,
  Zap,
  Target,
  MessageSquare,
  BarChart3,
  PartyPopper,
  Mail,
  Calendar,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import { PartnerPaymentForm, TransactionResult } from "@/components/partner/PartnerPaymentForm";
import { format } from "date-fns";

const PARTNER_PRODUCT = {
  id: "partner-linkedin-outreach",
  type: "product" as const,
  name: "Partner Package: LinkedIn Outreach",
  description: "AI-powered LinkedIn lead generation and outreach automation",
  price: 189,
  billingPeriod: "monthly" as const,
  metadata: { isPartnerPackage: true },
};

type CheckoutStep = "payment" | "confirmation";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function PartnerLinkedInCheckout() {
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("payment");
  const [transactionData, setTransactionData] = useState<TransactionResult | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string>("");

  const handlePaymentSuccess = (result: TransactionResult) => {
    setTransactionData(result);
    setCurrentStep("confirmation");
    toast({
      title: "Payment Successful!",
      description: "Your LinkedIn Outreach package is now active.",
    });
  };

  const features = [
    { icon: Target, title: "AI-Powered Targeting" },
    { icon: MessageSquare, title: "Personalized Outreach" },
    { icon: BarChart3, title: "Performance Analytics" },
    { icon: Zap, title: "Done-For-You Setup" },
  ];

  return (
    <Layout>
      <Helmet>
        <title>Checkout: LinkedIn Outreach Partner Package | Cynergists</title>
        <meta
          name="description"
          content="Complete your purchase of the LinkedIn Outreach Partner Package at exclusive partner pricing."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <main className="min-h-screen py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <div className="mb-6">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/partner/linkedin-outreach">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Offer
                </Link>
              </Button>
            </div>

            {/* Simple Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-center gap-4">
                <div className={`flex items-center gap-2 ${currentStep === "payment" || currentStep === "confirmation" ? 'text-primary' : 'text-muted-foreground'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep === "payment" ? 'bg-primary text-primary-foreground' : 
                    currentStep === "confirmation" ? 'bg-primary/20 text-primary' : 
                    'bg-muted text-muted-foreground'
                  }`}>
                    {currentStep === "confirmation" ? <Check className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">Payment</span>
                </div>
                <div className={`w-12 h-0.5 ${currentStep === "confirmation" ? 'bg-primary' : 'bg-muted'}`} />
                <div className={`flex items-center gap-2 ${currentStep === "confirmation" ? 'text-primary' : 'text-muted-foreground'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep === "confirmation" ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">Complete</span>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Payment Step */}
                {currentStep === "payment" && (
                  <div className="card-glass p-6 lg:p-8">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      Complete Your Purchase
                    </h2>

                    {/* Payment Form */}
                    <PartnerPaymentForm
                      productName={PARTNER_PRODUCT.name}
                      productPrice={PARTNER_PRODUCT.price}
                      partnerEmail=""
                      partnerName=""
                      onSuccess={handlePaymentSuccess}
                      onBack={() => router.visit("/partner/linkedin-outreach")}
                    />
                  </div>
                )}

                {/* Confirmation Step */}
                {currentStep === "confirmation" && transactionData && (
                  <div className="card-glass p-6 lg:p-8 text-center">
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <PartyPopper className="h-8 w-8 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">Welcome Aboard!</h2>
                      <p className="text-muted-foreground">
                        Your LinkedIn Outreach package is now active
                      </p>
                    </div>

                    {/* Transaction Details */}
                    <div className="bg-muted/30 rounded-lg p-4 mb-6 text-left space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Product</span>
                        <span className="font-medium">{PARTNER_PRODUCT.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Amount Paid</span>
                        <span className="font-medium">{formatCurrency(transactionData.amountPaid)}</span>
                      </div>
                      {transactionData.processingFee > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Processing Fee</span>
                          <span className="text-muted-foreground">{formatCurrency(transactionData.processingFee)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Payment Method</span>
                        <span className="font-medium capitalize">
                          {transactionData.paymentMethod === "credit_card" ? "Credit Card" : "ACH Bank Transfer"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Date</span>
                        <span className="font-medium">{format(transactionData.paidAt, "MMMM d, yyyy")}</span>
                      </div>
                      {transactionData.subscriptionId && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subscription ID</span>
                          <span className="font-mono text-xs">{transactionData.subscriptionId.slice(0, 16)}...</span>
                        </div>
                      )}
                    </div>

                    {/* Next Steps */}
                    <div className="space-y-4 text-left mb-6">
                      <h3 className="font-semibold">What Happens Next?</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">Check Your Email</p>
                            <p className="text-xs text-muted-foreground">
                              We've sent a confirmation and onboarding details to your email
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">Onboarding Call</p>
                            <p className="text-xs text-muted-foreground">
                              Our team will reach out within 24-48 hours to schedule your kickoff call
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Zap className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">Get Started</p>
                            <p className="text-xs text-muted-foreground">
                              You'll be generating leads on LinkedIn within 7 days of onboarding
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button asChild className="flex-1 btn-primary">
                        <Link href="/">
                          Back to Home
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="card-glass p-6 sticky top-24">
                  <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
                  
                  {/* Product */}
                  <div className="border-b border-border pb-4 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{PARTNER_PRODUCT.name}</p>
                        <p className="text-xs text-muted-foreground">Monthly subscription</p>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2 mb-4">
                    {features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="h-3 w-3 text-primary" />
                        {feature.title}
                      </div>
                    ))}
                  </div>

                  {/* Pricing */}
                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Retail Price</span>
                      <span className="line-through text-muted-foreground">$397/mo</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Partner Discount</span>
                      <span className="text-primary">-$208</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                      <span>Due Today</span>
                      <span className="text-primary">{formatCurrency(PARTNER_PRODUCT.price)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Billed monthly • Cancel anytime
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
