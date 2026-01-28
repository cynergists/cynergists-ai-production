import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link, router, usePage } from "@inertiajs/react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import CheckoutProgress from "@/components/checkout/CheckoutProgress";
import ContactInfoStep from "@/components/checkout/ContactInfoStep";
import CompanyInfoStep from "@/components/checkout/CompanyInfoStep";
import AgreementReviewStep from "@/components/checkout/AgreementReviewStep";
import PaymentStep from "@/components/checkout/PaymentStep";
import ConfirmationStep from "@/components/checkout/ConfirmationStep";

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
  // Dynamic section initials (preferred) - keys are "section_1", "section_2", etc.
  sectionInitials: Record<string, string>;
  // Legacy fixed section keys (for backward compatibility)
  section3Initials?: string;
  section4Initials?: string;
  section5Initials?: string;
  section6Initials?: string;
  section7Initials?: string;
  clientSignature: string;
  signedAt: Date | null;
}

export type PaymentMethod = "ach" | "credit_card" | null;

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

const STEP_TITLES = [
  "Contact Information",
  "Company Information",
  "Review & Sign Agreement",
  "Payment",
  "Confirmation",
];

const STORAGE_KEY_CONTACT = "cynergists_checkout_contact";
const STORAGE_KEY_COMPANY = "cynergists_checkout_company";

const getStoredContactInfo = (): ContactInfo => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CONTACT);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Error loading stored contact info:", e);
  }
  return {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  };
};

const getStoredCompanyInfo = (): CompanyInfo => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_COMPANY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Error loading stored company info:", e);
  }
  return {
    jobTitle: "",
    companyName: "",
    streetAddress: "",
    city: "",
    state: "",
    zip: "",
  };
};

const initialSignatureData: SignatureData = {
  sectionInitials: {},
  section3Initials: "",
  section4Initials: "",
  section5Initials: "",
  section6Initials: "",
  section7Initials: "",
  clientSignature: "",
  signedAt: null,
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const Checkout = () => {
  const { url } = usePage();
  const searchParams = new URLSearchParams(url.split("?")[1] ?? "");
  const { items, totalPrice, totalItems } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Build order description from cart items
  const orderDescription = items.map(item => 
    `${item.name}${item.quantity > 1 ? ` x${item.quantity}` : ''}`
  ).join(", ");
  
  const [checkoutData, setCheckoutData] = useState<CheckoutData>(() => ({
    contact: getStoredContactInfo(),
    company: getStoredCompanyInfo(),
    signatures: initialSignatureData,
    paymentMethod: null,
    planName: orderDescription || "Custom Order",
    planPrice: totalPrice,
    billingPeriod: "monthly",
  }));

  // Update checkout data when cart changes
  useEffect(() => {
    setCheckoutData(prev => ({
      ...prev,
      planName: orderDescription || "Custom Order",
      planPrice: totalPrice,
    }));
  }, [totalPrice, orderDescription]);

  // Fetch logged-in user's profile and pre-fill forms
  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, email, phone, company_name, title")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        // Pre-fill contact info from profile (takes priority over localStorage)
        const profileContact: ContactInfo = {
          firstName: profile.first_name || "",
          lastName: profile.last_name || "",
          email: profile.email || user.email || "",
          phone: profile.phone || "",
        };

        // Pre-fill company info from profile
        const profileCompany: Partial<CompanyInfo> = {
          companyName: profile.company_name || "",
          jobTitle: profile.title || "",
        };

        setCheckoutData(prev => ({
          ...prev,
          contact: {
            ...prev.contact,
            // Profile data takes priority, but keep localStorage data for empty fields
            firstName: profileContact.firstName || prev.contact.firstName,
            lastName: profileContact.lastName || prev.contact.lastName,
            email: profileContact.email || prev.contact.email,
            phone: profileContact.phone || prev.contact.phone,
          },
          company: {
            ...prev.company,
            companyName: profileCompany.companyName || prev.company.companyName,
            jobTitle: profileCompany.jobTitle || prev.company.jobTitle,
          },
        }));
      }
    };

    fetchUserProfile();
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.visit("/cart");
    }
  }, [items.length]);

  const updateContact = (data: Partial<ContactInfo>) => {
    setCheckoutData((prev) => {
      const newContact = { ...prev.contact, ...data };
      try {
        localStorage.setItem(STORAGE_KEY_CONTACT, JSON.stringify(newContact));
      } catch (e) {
        console.error("Error saving contact info:", e);
      }
      return { ...prev, contact: newContact };
    });
  };

  const updateCompany = (data: Partial<CompanyInfo>) => {
    setCheckoutData((prev) => {
      const newCompany = { ...prev.company, ...data };
      try {
        localStorage.setItem(STORAGE_KEY_COMPANY, JSON.stringify(newCompany));
      } catch (e) {
        console.error("Error saving company info:", e);
      }
      return { ...prev, company: newCompany };
    });
  };

  const updateSignatures = (data: Partial<SignatureData>) => {
    setCheckoutData((prev) => ({
      ...prev,
      signatures: { ...prev.signatures, ...data },
    }));
  };

  const setPaymentMethod = (method: PaymentMethod) => {
    setCheckoutData((prev) => ({
      ...prev,
      paymentMethod: method,
    }));
  };

  const setTransactionData = (transaction: TransactionData) => {
    setCheckoutData((prev) => ({
      ...prev,
      transaction,
    }));
  };

  const goToNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ContactInfoStep
            data={checkoutData.contact}
            onUpdate={updateContact}
            onNext={goToNextStep}
          />
        );
      case 2:
        return (
          <CompanyInfoStep
            data={checkoutData.company}
            onUpdate={updateCompany}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 3:
        return (
          <AgreementReviewStep
            contactData={checkoutData.contact}
            companyData={checkoutData.company}
            signatureData={checkoutData.signatures}
            planName={checkoutData.planName}
            planPrice={checkoutData.planPrice}
            onUpdateSignatures={updateSignatures}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 4:
        return (
          <PaymentStep
            selectedMethod={checkoutData.paymentMethod}
            onSelectMethod={setPaymentMethod}
            planName={checkoutData.planName}
            planPrice={checkoutData.planPrice}
            billingPeriod={checkoutData.billingPeriod}
            contactData={checkoutData.contact}
            companyName={checkoutData.company.companyName}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
            onTransactionComplete={setTransactionData}
          />
        );
      case 5:
        return (
          <ConfirmationStep
            checkoutData={checkoutData}
            transactionData={checkoutData.transaction}
          />
        );
      default:
        return null;
    }
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
          <div className="max-w-3xl mx-auto">
            {/* Back to Cart */}
            <Button variant="ghost" asChild className="mb-6">
              <Link href="/cart">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Cart
              </Link>
            </Button>

            {/* Header with Order Summary */}
            <div className="mb-8">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Checkout
              </h1>
              
              {/* Order Summary Card */}
              <div className="card-glass p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Your Order</span>
                  <span className="text-sm text-muted-foreground">({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
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
                          <span className="text-xs ml-2">({item.description})</span>
                          {isAnnual && <span className="text-xs ml-1 text-primary">(Annual)</span>}
                        </span>
                        <span className="font-medium">{formatCurrency(displayPrice)}{periodLabel}</span>
                      </div>
                    );
                  })}
                </div>
                {(() => {
                  // Separate items by billing period
                  const monthlyItems = items.filter(item => item.billingPeriod === 'monthly');
                  const annualItems = items.filter(item => item.billingPeriod === 'annual');
                  
                  const monthlyTotal = monthlyItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
                  const annualTotal = annualItems.reduce((sum, item) => sum + item.price * 12 * item.quantity, 0);
                  
                  // Calculate savings for annual items
                  const annualSavings = annualItems.reduce((total, item) => {
                    const originalMonthly = item.price / 0.9;
                    const savingsPerItem = originalMonthly * 0.1 * 12 * item.quantity;
                    return total + savingsPerItem;
                  }, 0);
                  
                  // Total due today: annual items (full year) + monthly items (1 month)
                  const totalDueToday = annualTotal + monthlyTotal;
                  
                  return (
                    <>
                      <div className="border-t border-border mt-3 pt-3 space-y-2">
                        {monthlyTotal > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Monthly Items (billed monthly)</span>
                            <span className="font-medium">{formatCurrency(monthlyTotal)}/mo</span>
                          </div>
                        )}
                        {annualTotal > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Annual Items (billed yearly)</span>
                            <span className="font-medium">{formatCurrency(annualTotal)}/yr</span>
                          </div>
                        )}
                        {annualSavings > 0 && (
                          <div className="flex justify-between text-sm text-primary">
                            <span>Annual Savings</span>
                            <span className="font-medium">{formatCurrency(Math.round(annualSavings))}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Total Due Today - Prominent display */}
                      <div className="border-t-2 border-primary mt-3 pt-3">
                        <div className="bg-primary/10 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-lg font-bold text-foreground">Due Today</span>
                              {monthlyTotal > 0 && annualTotal > 0 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Includes 1 month of monthly items + annual items
                                </p>
                              )}
                            </div>
                            <span className="text-2xl font-bold text-primary">{formatCurrency(totalDueToday)}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              <p className="text-muted-foreground">
                Step {currentStep} of {STEP_TITLES.length}: {STEP_TITLES[currentStep - 1]}
              </p>
            </div>

            {/* Sticky container for Progress and Form */}
            <div className="sticky top-16 z-20 bg-background pb-4 -mx-4 px-4 border-b border-border/50 shadow-sm">
              {/* Progress Indicator */}
              <CheckoutProgress 
                currentStep={currentStep} 
                totalSteps={STEP_TITLES.length}
                stepTitles={STEP_TITLES}
              />

              {/* Step Content */}
              <div className="mt-6">
                {renderStep()}
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Checkout;
