import { Check, Calendar, Mail, FileText, AlertCircle, CreditCard, Building, Clock, Receipt, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { CheckoutData, TransactionData } from "@/pages/Checkout";

interface ConfirmationStepProps {
  checkoutData: CheckoutData;
  transactionData?: TransactionData;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
};

const ConfirmationStep = ({ checkoutData, transactionData }: ConfirmationStepProps) => {
  const { toast } = useToast();
  const displayPlanName = checkoutData.planName.charAt(0).toUpperCase() + checkoutData.planName.slice(1);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  // Get billing description
  const getBillingDescription = () => {
    if (!transactionData) return "Monthly Recurring";
    switch (transactionData.billingPeriod) {
      case "annual":
        return "Annual Billing";
      case "mixed":
        return "Mixed Billing (Monthly & Annual)";
      default:
        return "Monthly Recurring";
    }
  };

  return (
    <div className="space-y-8">
      {/* Success Header */}
      <div className="card-glass p-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-6 animate-pulse">
          <Check className="h-10 w-10 text-primary" />
        </div>
        
        <h2 className="font-display text-3xl font-bold text-foreground mb-4">
          Payment Successful!
        </h2>
        
        <p className="text-lg text-muted-foreground mb-6">
          Thank you for choosing Cynergists. Your subscription is now active.
        </p>

        <div className="inline-flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-lg px-6 py-3">
          <Mail className="h-5 w-5 text-primary" />
          <span className="text-sm text-foreground">
            Confirmation sent to <strong>{checkoutData.contact.email}</strong>
          </span>
        </div>
      </div>

      {/* Transaction Receipt */}
      <div className="card-glass p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Transaction Receipt
          </h3>
          {transactionData?.paidAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {formatDate(new Date(transactionData.paidAt))}
            </div>
          )}
        </div>
        
        {/* Transaction ID */}
        {transactionData?.subscriptionId && (
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Transaction ID</p>
                <p className="font-mono text-sm text-foreground">{transactionData.subscriptionId}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => copyToClipboard(transactionData.subscriptionId!, "Transaction ID")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="space-y-3 mb-6">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Order Items</p>
          {transactionData?.cartItems?.map((item, index) => {
            const isAnnual = item.billingPeriod === 'annual';
            const displayPrice = isAnnual 
              ? item.price * 12 * item.quantity 
              : item.price * item.quantity;
            const periodLabel = isAnnual ? '/yr' : '/mo';
            
            return (
              <div key={index} className="flex justify-between py-2 border-b border-border last:border-0">
                <div>
                  <span className="text-foreground">{item.name}</span>
                  {item.quantity > 1 && <span className="text-muted-foreground ml-1">x{item.quantity}</span>}
                  {item.description && (
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  )}
                  {isAnnual && (
                    <span className="inline-block text-xs bg-primary/20 text-primary px-2 py-0.5 rounded mt-1">
                      Annual
                    </span>
                  )}
                </div>
                <span className="text-foreground font-medium">{formatPrice(displayPrice)}{periodLabel}</span>
              </div>
            );
          })}
        </div>

        {/* Payment Summary */}
        <div className="border-t border-border pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">
              {formatPrice((transactionData?.amountPaid || checkoutData.planPrice) - (transactionData?.processingFee || 0))}
            </span>
          </div>
          
          {transactionData?.processingFee && transactionData.processingFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Processing Fee</span>
              <span className="text-foreground">{formatPrice(transactionData.processingFee)}</span>
            </div>
          )}
          
          <div className="flex justify-between pt-2 border-t border-border">
            <span className="font-semibold text-foreground">Total Paid</span>
            <span className="text-xl font-bold text-primary">
              {formatPrice(transactionData?.amountPaid || checkoutData.planPrice)}
            </span>
          </div>
        </div>

        {/* Payment Details */}
        <div className="mt-6 pt-4 border-t border-border grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground mb-1">Payment Method</p>
            <div className="flex items-center gap-2 text-foreground">
              {(transactionData?.paymentMethod || checkoutData.paymentMethod) === "ach" ? (
                <>
                  <Building className="h-4 w-4" />
                  ACH Bank Transfer
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Credit Card
                </>
              )}
            </div>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Billing Cycle</p>
            <p className="text-foreground">{getBillingDescription()}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Customer</p>
            <p className="text-foreground">{checkoutData.contact.firstName} {checkoutData.contact.lastName}</p>
          </div>
          {checkoutData.company.companyName && (
            <div>
              <p className="text-muted-foreground mb-1">Company</p>
              <p className="text-foreground">{checkoutData.company.companyName}</p>
            </div>
          )}
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-display font-bold text-lg text-foreground mb-2">
              Important: Service Activation
            </h3>
            <p className="text-foreground mb-4">
              Your service will <strong>not begin</strong> until you complete your onboarding call. 
              Scheduling your onboarding is <strong>required</strong> to activate your subscription.
            </p>
          </div>
        </div>
      </div>

      {/* Onboarding Scheduling */}
      <div className="card-glass p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-foreground">
              Final Step: Schedule Your Onboarding Call
            </h3>
            <p className="text-sm text-muted-foreground">
              This is required to start your services
            </p>
          </div>
        </div>

        {/* Calendar Embed Placeholder */}
        <div className="bg-background/50 border border-border rounded-lg p-8 min-h-[400px] flex flex-col items-center justify-center">
          <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground mb-2">
            Onboarding Calendar
          </p>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
            Calendar embed will be configured here. Select a time that works best for your 30-minute onboarding call.
          </p>
          
          {/* Temporary placeholder - will be replaced with actual calendar embed */}
          <div className="text-center text-xs text-muted-foreground bg-muted/50 rounded p-4">
            <p className="font-medium mb-1">Calendar Integration Pending</p>
            <p>The calendar embed will be added once you provide the scheduling tool details.</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Can&apos;t find a time that works?{" "}
            <Button variant="link" className="text-primary p-0 h-auto" asChild>
              <a href="mailto:support@cynergists.com">Contact us directly</a>
            </Button>
          </p>
        </div>
      </div>

      {/* What's Next */}
      <div className="card-glass p-6">
        <h3 className="font-display font-bold text-lg text-foreground mb-4">
          What Happens Next?
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-medium text-foreground">Schedule Your Onboarding</p>
              <p className="text-sm text-muted-foreground">
                Pick a time above to meet with your dedicated account manager
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground text-sm font-bold flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-medium text-foreground">Complete Onboarding Call</p>
              <p className="text-sm text-muted-foreground">
                We&apos;ll discuss your priorities, set up communication channels, and assign your team
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground text-sm font-bold flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-medium text-foreground">Start Working Together</p>
              <p className="text-sm text-muted-foreground">
                Your services begin immediately after onboarding is complete
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Print/Save Receipt */}
      <div className="text-center">
        <Button 
          variant="outline" 
          onClick={() => window.print()}
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          Print Receipt
        </Button>
      </div>
    </div>
  );
};

export default ConfirmationStep;