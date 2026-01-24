/**
 * AgreementSigningFlow Component
 * 
 * A unified, state-driven signing workflow component used by both:
 * - Checkout flow (AgreementReviewStep)
 * - Standalone signing page (SignAgreement)
 * 
 * This component handles:
 * - Dynamic section extraction from template content
 * - Deterministic initial tracking
 * - Automatic transition to signature when initials complete
 * - eSign acceptance gate
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, PenLine, CheckCircle, AlertCircle } from "lucide-react";
import DOMPurify from "dompurify";
import { 
  getSectionKeysFromTemplate, 
  getNextIncompleteSection,
  getSigningProgress 
} from "@/utils/agreementParser";
import { toast } from "sonner";

const CURSIVE_FONTS = [
  { name: "Dancing Script", className: "font-dancing" },
  { name: "Great Vibes", className: "font-great-vibes" },
  { name: "Pacifico", className: "font-pacifico" },
  { name: "Satisfy", className: "font-satisfy" },
];

export interface SigningFlowProps {
  /** The processed agreement content (with merge fields replaced, but {{CLIENT_INITIALS}} intact) */
  agreementContent: string;
  /** Default initials suggestion (e.g., "JD" for John Doe) */
  defaultInitials: string;
  /** Default name for signature */
  defaultSignatureName: string;
  /** Callback when signing is complete */
  onComplete: (data: SigningResult) => void;
  /** Optional callback for back button */
  onBack?: () => void;
  /** Whether to show the back button */
  showBackButton?: boolean;
  /** Pre-populated section initials (for resuming) */
  initialSectionInitials?: Record<string, string>;
  /** Pre-populated signature */
  initialSignature?: string;
}

export interface SigningResult {
  sectionInitials: Record<string, string>;
  signature: string;
  signedAt: Date;
}

export function AgreementSigningFlow({
  agreementContent,
  defaultInitials,
  defaultSignatureName,
  onComplete,
  onBack,
  showBackButton = true,
  initialSectionInitials = {},
  initialSignature = "",
}: SigningFlowProps) {
  // Derive section keys from template content
  const sectionKeys = getSectionKeysFromTemplate(agreementContent);
  
  // Signing state
  const [sectionInitials, setSectionInitials] = useState<Record<string, string>>(initialSectionInitials);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [tempInitials, setTempInitials] = useState(defaultInitials);
  const [selectedFont, setSelectedFont] = useState(CURSIVE_FONTS[0]);
  const [fontLocked, setFontLocked] = useState(false);
  const [showSignatureSection, setShowSignatureSection] = useState(false);
  const [signatureName, setSignatureName] = useState(defaultSignatureName);
  const [hasAgreed, setHasAgreed] = useState(false);
  
  // Refs for scrolling
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const signatureRef = useRef<HTMLDivElement>(null);
  
  // Calculate progress
  const progress = getSigningProgress(
    sectionKeys,
    sectionInitials,
    !!initialSignature
  );
  
  // Auto-show signature section when all initials complete
  useEffect(() => {
    if (progress.allInitialsComplete && !showSignatureSection) {
      setShowSignatureSection(true);
      toast.success("All sections initialed! Please sign below.");
      
      setTimeout(() => {
        signatureRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 200);
    }
  }, [progress.allInitialsComplete, showSignatureSection]);
  
  const handleStartSigning = useCallback(() => {
    const firstIncomplete = getNextIncompleteSection(sectionKeys, sectionInitials);
    
    if (firstIncomplete) {
      setActiveSection(firstIncomplete);
      setTempInitials(defaultInitials);
      setTimeout(() => {
        sectionRefs.current[firstIncomplete]?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    } else {
      // All initials complete, go to signature
      setShowSignatureSection(true);
      setTimeout(() => {
        signatureRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [sectionKeys, sectionInitials, defaultInitials]);
  
  const handleInitialClick = useCallback((sectionKey: string) => {
    if (!sectionInitials[sectionKey]) {
      setActiveSection(sectionKey);
      setTempInitials(defaultInitials);
    }
  }, [sectionInitials, defaultInitials]);
  
  const handleConfirmInitials = useCallback(() => {
    if (!activeSection || !tempInitials.trim()) return;
    
    const initialsValue = `${tempInitials}|${selectedFont.className}`;
    
    // Create updated state BEFORE setting (fixes stale state issue)
    const updatedInitials = {
      ...sectionInitials,
      [activeSection]: initialsValue,
    };
    
    setSectionInitials(updatedInitials);
    
    if (!fontLocked) {
      setFontLocked(true);
    }
    
    // Find next incomplete section using UPDATED state
    const nextSection = getNextIncompleteSection(sectionKeys, updatedInitials, activeSection);
    
    if (nextSection) {
      // Move to next section
      setActiveSection(nextSection);
      toast.info(`Section initialed. ${sectionKeys.length - Object.keys(updatedInitials).length} remaining.`);
      setTimeout(() => {
        sectionRefs.current[nextSection]?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
    } else {
      // All sections complete, transition to signature
      setActiveSection(null);
      setShowSignatureSection(true);
      toast.success("All sections initialed! Please sign below.");
      setTimeout(() => {
        signatureRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
    }
  }, [activeSection, tempInitials, selectedFont.className, fontLocked, sectionKeys, sectionInitials]);
  
  const handleSignAgreement = useCallback(() => {
    if (!hasAgreed) {
      toast.error("Please agree to the electronic signature terms");
      return;
    }
    
    if (!signatureName.trim() || signatureName.trim().length < 2) {
      toast.error("Please enter your full legal name");
      return;
    }
    
    const signature = `${signatureName}|${selectedFont.className}`;
    
    onComplete({
      sectionInitials,
      signature,
      signedAt: new Date(),
    });
  }, [hasAgreed, signatureName, selectedFont.className, sectionInitials, onComplete]);
  
  // Render inline initials box for a section
  const renderInitialsBox = (sectionKey: string, index: number) => {
    const initials = sectionInitials[sectionKey];
    const isActive = activeSection === sectionKey;
    const [initialsText, fontClass] = initials ? initials.split("|") : ["", ""];
    
    return (
      <div
        key={sectionKey}
        ref={el => { sectionRefs.current[sectionKey] = el; }}
        className="my-4 p-3 bg-primary/10 border border-primary/30 rounded-lg"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Section {index + 1} - Client Initials Required:
            </span>
          </div>
          
          {initials ? (
            <div className={`w-20 h-12 bg-primary/20 border-2 border-primary rounded flex items-center justify-center text-lg text-primary ${fontClass}`}>
              {initialsText}
              <Check className="h-3 w-3 ml-1 text-green-500" />
            </div>
          ) : isActive ? (
            <div className="bg-background border-2 border-primary rounded p-3 min-w-[200px]">
              <Input
                value={tempInitials}
                onChange={(e) => setTempInitials(e.target.value.toUpperCase())}
                className="text-center text-lg mb-2"
                placeholder="Initials"
                autoFocus
                maxLength={4}
              />
              {!fontLocked && (
                <div className="grid grid-cols-2 gap-1 mb-2">
                  {CURSIVE_FONTS.map((font) => (
                    <button
                      key={font.name}
                      onClick={() => setSelectedFont(font)}
                      className={`p-2 text-sm border rounded ${font.className} ${
                        selectedFont.name === font.name 
                          ? "border-primary bg-primary/10" 
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {tempInitials || "AB"}
                    </button>
                  ))}
                </div>
              )}
              {fontLocked && (
                <div className={`text-center text-2xl mb-2 ${selectedFont.className}`}>
                  {tempInitials || "AB"}
                </div>
              )}
              <Button 
                size="sm" 
                onClick={handleConfirmInitials} 
                className="w-full" 
                disabled={!tempInitials.trim()}
              >
                <Check className="h-4 w-4 mr-1" /> Confirm Initials
              </Button>
            </div>
          ) : (
            <button
              onClick={() => handleInitialClick(sectionKey)}
              className="w-20 h-12 border-2 border-dashed border-primary/50 rounded flex items-center justify-center text-xs text-primary/70 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
            >
              <PenLine className="h-4 w-4 mr-1" />
              Initial
            </button>
          )}
        </div>
      </div>
    );
  };
  
  // Render the agreement content with initials boxes injected
  const renderAgreementContent = () => {
    const INITIALS_MARKER = /\{\{CLIENT_INITIALS\}\}/gi;
    const parts = agreementContent.split(INITIALS_MARKER);
    const initialsCount = parts.length - 1;
    
    return (
      <div className="max-w-none agreement-content prose [&_p]:my-2 [&_p:empty]:min-h-[1.6em] [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_hr]:my-6 [&_hr]:border-border [&_strong]:font-semibold [&_br]:block">
        {parts.map((part, index) => (
          <div key={index}>
            <div 
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(part) }} 
              className="prose-content"
            />
            {index < initialsCount && renderInitialsBox(sectionKeys[index], index)}
          </div>
        ))}
      </div>
    );
  };
  
  // Calculate if signature button should be enabled
  const canSign = progress.allInitialsComplete && hasAgreed && signatureName.trim().length >= 2;
  
  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-3">
          {progress.allInitialsComplete ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-primary" />
          )}
          <span className="text-sm font-medium">{progress.progressText}</span>
        </div>
        
        {!activeSection && !showSignatureSection && sectionKeys.length > 0 && (
          <Button onClick={handleStartSigning} size="sm">
            <PenLine className="h-4 w-4 mr-2" />
            Start Signing
          </Button>
        )}
      </div>
      
      {/* Agreement Content */}
      <div className="bg-background/50 border border-border rounded-lg p-6 max-h-[600px] overflow-y-auto text-sm leading-relaxed">
        {renderAgreementContent()}
        
        {/* Signature Section */}
        <div 
          ref={signatureRef}
          className={`border-t-2 border-primary pt-8 mt-8 transition-opacity duration-300 ${
            showSignatureSection || progress.allInitialsComplete ? "opacity-100" : "opacity-50"
          }`}
        >
          <h2 className="font-display font-bold text-lg text-foreground mb-6 text-center">
            ELECTRONIC SIGNATURE
          </h2>
          
          {progress.allInitialsComplete ? (
            <div className="space-y-6 max-w-md mx-auto">
              {/* eSign Acceptance Checkbox */}
              <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
                <Checkbox
                  id="esign-agreement"
                  checked={hasAgreed}
                  onCheckedChange={(checked) => setHasAgreed(checked === true)}
                  className="mt-0.5"
                />
                <label htmlFor="esign-agreement" className="text-sm leading-relaxed cursor-pointer">
                  I agree that my electronic signature is the legal equivalent of my manual signature 
                  on this agreement. By checking this box and typing my name below, I am signing this 
                  Master Services Agreement.
                </label>
              </div>
              
              {/* Signature Name Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Type your full legal name to sign:
                </label>
                <Input
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  placeholder="Full Legal Name"
                  className="text-center text-lg"
                />
                
                {/* Signature Preview */}
                {signatureName && (
                  <div className="text-center py-4 border-b-2 border-foreground/30">
                    <span className={`text-3xl ${selectedFont.className}`}>
                      {signatureName}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Sign Button */}
              <Button
                onClick={handleSignAgreement}
                disabled={!canSign}
                className="w-full"
                size="lg"
              >
                <PenLine className="h-5 w-5 mr-2" />
                Sign Agreement
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
              <p>Please complete all required initials above to unlock the signature section.</p>
              <p className="text-sm mt-2">
                {progress.completedInitials} of {progress.requiredInitials} sections complete
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Navigation Buttons */}
      {showBackButton && onBack && (
        <div className="flex justify-start">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
        </div>
      )}
    </div>
  );
}

export default AgreementSigningFlow;
