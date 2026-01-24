import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface SignatureSectionProps {
  signature: string;
  onSignatureChange: (value: string) => void;
  agreedToTerms: boolean;
  onAgreedChange: (value: boolean) => void;
  isActive: boolean;
}

const SignatureSection = forwardRef<HTMLDivElement, SignatureSectionProps>(
  ({ signature, onSignatureChange, agreedToTerms, onAgreedChange, isActive }, ref) => {
    return (
      <div
        ref={ref}
        className={`border rounded-lg p-6 transition-all ${
          isActive
            ? "border-primary ring-2 ring-primary/30 bg-primary/5"
            : "border-border"
        }`}
      >
        <h2 className="text-xl font-semibold mb-6">Sign Agreement</h2>

        <div className="space-y-6">
          <div>
            <Label htmlFor="signature" className="text-base">
              Full Legal Name (Signature)
            </Label>
            <Input
              id="signature"
              placeholder="Type your full legal name"
              value={signature}
              onChange={(e) => onSignatureChange(e.target.value)}
              className="mt-2 text-lg h-12"
            />
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              By clicking "I Agree," checking the box, or signing electronically, you
              consent to conduct business electronically and acknowledge that you are
              able to access, receive, and retain electronic records related to this
              agreement.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              You agree that your electronic signature is the legal equivalent of
              your handwritten signature and that this agreement has the same force
              and effect as if it were signed in ink.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              You understand that this agreement, notices, disclosures, and records
              related to your relationship with Cynergists will be provided to you
              electronically unless you request otherwise.
            </p>
          </div>

          <div className="flex items-start gap-3 pt-2">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => onAgreedChange(checked === true)}
              className="mt-1"
            />
            <Label
              htmlFor="terms"
              className="text-sm leading-relaxed cursor-pointer font-medium"
            >
              I Agree - I have read and understood this Service Agreement. I agree to
              be bound by its terms and conditions.
            </Label>
          </div>
        </div>
      </div>
    );
  }
);

SignatureSection.displayName = "SignatureSection";

export default SignatureSection;
