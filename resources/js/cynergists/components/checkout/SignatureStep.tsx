import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OrbitingButton } from "@/components/ui/orbiting-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, PenTool, Check, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { ContactInfo, SignatureData } from "@/pages/Checkout";

interface SignatureStepProps {
  contactData: ContactInfo;
  signatureData: SignatureData;
  onUpdate: (data: Partial<SignatureData>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface InitialFieldProps {
  label: string;
  sectionNumber: number;
  sectionTitle: string;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

const InitialField = ({ label, sectionNumber, sectionTitle, value, onChange, error }: InitialFieldProps) => {
  const [focused, setFocused] = useState(false);
  
  return (
    <div className="flex items-center gap-4 p-4 bg-card/50 border border-border/50 rounded-lg">
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">Section {sectionNumber}</p>
        <p className="text-xs text-muted-foreground">{sectionTitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor={`initials-${sectionNumber}`} className="text-xs text-muted-foreground whitespace-nowrap">
          {label}
        </Label>
        <div className="relative">
          <Input
            id={`initials-${sectionNumber}`}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase().slice(0, 3))}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="___"
            maxLength={3}
            className={`w-16 text-center font-mono text-lg uppercase ${
              error ? "border-destructive" : value ? "border-primary" : ""
            }`}
          />
          {value && !focused && (
            <Check className="absolute -right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
          )}
        </div>
      </div>
    </div>
  );
};

const SignatureStep = ({ contactData, signatureData, onUpdate, onNext, onBack }: SignatureStepProps) => {
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [signatureFocused, setSignatureFocused] = useState(false);

  const clientFullName = `${contactData.firstName} ${contactData.lastName}`;

  const sections = [
    { key: "section3Initials", number: 3, title: "Plans, Usage, and Automatic Scaling" },
    { key: "section4Initials", number: 4, title: "Term, Commitment, and Renewal" },
    { key: "section5Initials", number: 5, title: "Fees, Billing, and Payment" },
    { key: "section6Initials", number: 6, title: "Termination" },
    { key: "section7Initials", number: 7, title: "Non-Solicitation, Non-Circumvention, and Approved Placements" },
  ];

  const validateAndSubmit = () => {
    const newErrors: Record<string, boolean> = {};
    let hasErrors = false;

    sections.forEach(({ key }) => {
      if (!signatureData[key as keyof SignatureData]) {
        newErrors[key] = true;
        hasErrors = true;
      }
    });

    if (!signatureData.clientSignature.trim()) {
      newErrors.clientSignature = true;
      hasErrors = true;
    }

    setErrors(newErrors);

    if (!hasErrors) {
      onUpdate({ signedAt: new Date() });
      onNext();
    }
  };

  const allInitialsComplete = sections.every(
    ({ key }) => !!signatureData[key as keyof SignatureData]
  );
  const signatureComplete = !!signatureData.clientSignature.trim();
  const isComplete = allInitialsComplete && signatureComplete;

  return (
    <div className="card-glass p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <PenTool className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">
            Sign the Agreement
          </h2>
          <p className="text-sm text-muted-foreground">
            Initial each section and sign below
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Complete all required fields</p>
            <p className="text-xs text-muted-foreground mt-1">
              Please initial each highlighted section and provide your full signature at the bottom.
            </p>
          </div>
        </div>
      </div>

      {/* Initial Fields */}
      <div className="space-y-3 mb-8">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Required Initials
        </h3>
        {sections.map(({ key, number, title }) => (
          <InitialField
            key={key}
            label="Initials:"
            sectionNumber={number}
            sectionTitle={title}
            value={signatureData[key as keyof SignatureData] as string}
            onChange={(value) => {
              onUpdate({ [key]: value });
              if (errors[key]) {
                setErrors((prev) => ({ ...prev, [key]: false }));
              }
            }}
            error={errors[key]}
          />
        ))}
      </div>

      {/* Signature Field */}
      <div className="border-t border-border pt-8">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Client Signature
        </h3>
        
        <div className="bg-card/50 border border-border/50 rounded-lg p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Client Signature */}
            <div>
              <Label htmlFor="clientSignature" className="text-foreground font-medium mb-2 block">
                Sign as: {clientFullName}
              </Label>
              <div className="relative">
                <Input
                  id="clientSignature"
                  type="text"
                  value={signatureData.clientSignature}
                  onChange={(e) => {
                    onUpdate({ clientSignature: e.target.value });
                    if (errors.clientSignature) {
                      setErrors((prev) => ({ ...prev, clientSignature: false }));
                    }
                  }}
                  onFocus={() => setSignatureFocused(true)}
                  onBlur={() => setSignatureFocused(false)}
                  placeholder="Type your full name to sign"
                  className={`text-lg font-signature h-14 ${
                    errors.clientSignature ? "border-destructive" : 
                    signatureData.clientSignature ? "border-primary" : ""
                  }`}
                  style={{ fontFamily: "'Brush Script MT', cursive" }}
                />
                {signatureData.clientSignature && !signatureFocused && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                )}
              </div>
              {errors.clientSignature && (
                <p className="text-sm text-destructive mt-2">Please provide your signature</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Date: {formatDate(new Date())}
              </p>
            </div>

            {/* Cynergists Counter-signature (Auto) */}
            <div className="opacity-60">
              <p className="text-foreground font-medium mb-2">Cynergists, LLC</p>
              <div className="h-14 bg-background/50 border border-border rounded-lg flex items-center px-4">
                <span className="text-lg italic text-muted-foreground" style={{ fontFamily: "'Brush Script MT', cursive" }}>
                  Ryan Van Ornum
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Chief Executive Officer • Applied upon completion
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Completion Status */}
      <div className={`mt-6 p-4 rounded-lg flex items-center gap-3 ${
        isComplete ? "bg-primary/10 border border-primary/30" : "bg-muted/50 border border-border"
      }`}>
        {isComplete ? (
          <>
            <Check className="h-5 w-5 text-primary" />
            <p className="text-sm text-foreground font-medium">
              All signatures complete. Ready to proceed to payment.
            </p>
          </>
        ) : (
          <>
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Complete all initials ({sections.filter(s => !!signatureData[s.key as keyof SignatureData]).length}/{sections.length}) 
              and signature to continue.
            </p>
          </>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="pt-6 flex flex-col-reverse md:flex-row gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="w-full md:w-auto"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <OrbitingButton 
          onClick={validateAndSubmit} 
          className="btn-primary w-full md:w-auto"
          disabled={!isComplete}
        >
          Continue to Payment
          <ArrowRight className="ml-2 h-4 w-4" />
        </OrbitingButton>
      </div>
    </div>
  );
};

export default SignatureStep;
