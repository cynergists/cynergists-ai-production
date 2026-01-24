/**
 * AgreementReviewStep Component
 * 
 * Checkout step for reviewing and signing the Master Services Agreement.
 * Uses the unified AgreementSigningFlow component for deterministic signing.
 */

import { useState, useEffect } from "react";
import { Loader2, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/utils";
import { AgreementSigningFlow, SigningResult } from "@/components/signing/AgreementSigningFlow";
import type { ContactInfo, CompanyInfo, SignatureData } from "@/pages/Checkout";

interface AgreementReviewStepProps {
  contactData: ContactInfo;
  companyData: CompanyInfo;
  signatureData: SignatureData;
  planName: string;
  planPrice: number;
  onUpdateSignatures: (data: Partial<SignatureData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const AgreementReviewStep = ({ 
  contactData, 
  companyData, 
  signatureData,
  planName,
  planPrice,
  onUpdateSignatures,
  onNext, 
  onBack 
}: AgreementReviewStepProps) => {
  const clientFullName = `${contactData.firstName} ${contactData.lastName}`;
  const clientTitle = companyData.jobTitle;
  const companyName = companyData.companyName;
  const companyAddress = `${companyData.streetAddress}, ${companyData.city}, ${companyData.state} ${companyData.zip}`;
  const effectiveDate = formatDate(new Date());
  
  const defaultInitials = `${contactData.firstName.charAt(0)}${contactData.lastName.charAt(0)}`.toUpperCase();

  // Template loading state
  const [templateContent, setTemplateContent] = useState<string | null>(null);
  const [loadingTemplate, setLoadingTemplate] = useState(true);

  // Fetch MSA template on mount
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const { data, error } = await supabase
          .from("document_templates")
          .select("content")
          .eq("document_type", "msa")
          .eq("is_active", true)
          .single();

        if (error || !data) {
          setTemplateContent(generateFallbackTemplate());
        } else {
          // Process template variables - but keep {{CLIENT_INITIALS}} intact
          let content = data.content
            // Client fields
            .replace(/\{\{CLIENT_FIRST_NAME\}\}/gi, contactData.firstName)
            .replace(/\{\{CLIENT_LAST_NAME\}\}/gi, contactData.lastName)
            .replace(/\{\{CLIENT_NAME\}\}/gi, clientFullName)
            .replace(/\{\{CLIENT_EMAIL\}\}/gi, contactData.email)
            .replace(/\{\{CLIENT_PHONE\}\}/gi, contactData.phone)
            .replace(/\{\{CLIENT_TITLE\}\}/gi, clientTitle)
            // Company fields
            .replace(/\{\{COMPANY_NAME\}\}/gi, companyName)
            .replace(/\{\{CLIENT_COMPANY\}\}/gi, companyName || clientFullName)
            .replace(/\{\{COMPANY_STREET\}\}/gi, companyData.streetAddress)
            .replace(/\{\{COMPANY_CITY\}\}/gi, companyData.city)
            .replace(/\{\{COMPANY_STATE\}\}/gi, companyData.state)
            .replace(/\{\{COMPANY_ZIP\}\}/gi, companyData.zip)
            .replace(/\{\{CLIENT_ADDRESS\}\}/gi, companyAddress)
            .replace(/\{\{COMPANY_DISPLAY\}\}/gi, companyName || clientFullName)
            // Date fields
            .replace(/\{\{TODAYS_DATE\}\}/gi, effectiveDate)
            .replace(/\{\{DATE\}\}/gi, effectiveDate)
            .replace(/\{\{EFFECTIVE_DATE\}\}/gi, effectiveDate)
            // Plan fields
            .replace(/\{\{PLAN_NAME\}\}/gi, planName)
            .replace(/\{\{PLAN_PRICE\}\}/gi, `$${planPrice.toLocaleString()}`);
          
          setTemplateContent(content);
        }
      } catch {
        setTemplateContent(generateFallbackTemplate());
      } finally {
        setLoadingTemplate(false);
      }
    };

    fetchTemplate();
  }, [clientFullName, companyName, clientTitle, companyAddress, effectiveDate, planName, planPrice, contactData, companyData]);

  // Generate fallback template with {{CLIENT_INITIALS}} markers
  const generateFallbackTemplate = (): string => {
    return `
<h1 style="text-align: center;">CYNERGISTS MASTER SERVICES AGREEMENT</h1>

<p style="text-align: center;"><strong>Effective Date:</strong> ${effectiveDate}</p>

<p>This Master Services Agreement ("Agreement") is entered into by and between <strong>Cynergists, LLC</strong>, 
a Wyoming limited liability company ("Cynergists"), and the undersigned client ("Client").</p>

<div style="background: var(--card); border: 1px solid var(--border); border-radius: 0.5rem; padding: 1rem; margin: 1rem 0;">
<p><strong>Client:</strong> ${clientFullName}</p>
<p><strong>Title:</strong> ${clientTitle}</p>
<p><strong>Company:</strong> ${companyName}</p>
<p><strong>Address:</strong> ${companyAddress}</p>
</div>

<p>Cynergists and Client may be referred to individually as a "Party" and collectively as the "Parties."</p>

<h2>1. Purpose and Structure</h2>
<p>This Agreement establishes the legal framework governing all services provided by Cynergists to Client. 
Specific commercial terms are defined in one or more Statements of Work ("SOWs") executed by the Parties.</p>

<h2>2. Services and Service Model</h2>
<p>Cynergists provides AI agents, managed services, operational support, automation, AI-enabled services, 
and related business services ("Services").</p>

<h2>3. Plans, Usage, and Automatic Scaling</h2>
<p>Client's service configuration is defined in the applicable SOW. If Client's usage exceeds limits, 
Client automatically transitions to the appropriate higher service level.</p>
{{CLIENT_INITIALS}}

<h2>4. Term, Commitment, and Renewal</h2>
<p>The initial service term is defined in the applicable SOW. Services automatically renew unless 
timely written notice is provided.</p>
{{CLIENT_INITIALS}}

<h2>5. Fees, Billing, and Payment</h2>
<p>All Services are billed in advance. Fees are non-refundable. Late payments accrue interest at 1.5% per month.</p>
{{CLIENT_INITIALS}}
    `.trim();
  };

  // Handle signing completion from the unified flow
  const handleSigningComplete = (result: SigningResult) => {
    // Convert dynamic section initials to the legacy format for backward compatibility
    const signatureUpdate: Partial<SignatureData> = {
      clientSignature: result.signature,
      signedAt: result.signedAt,
      sectionInitials: result.sectionInitials,
    };
    
    // Also map to legacy section keys if they exist
    Object.entries(result.sectionInitials).forEach(([key, value], index) => {
      const legacyKey = `section${index + 3}Initials` as keyof SignatureData;
      (signatureUpdate as any)[legacyKey] = value;
    });
    
    onUpdateSignatures(signatureUpdate);
    
    // Explicitly advance to next step
    onNext();
  };

  if (loadingTemplate) {
    return (
      <div className="card-glass p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="card-glass p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">
            Master Services Agreement
          </h2>
          <p className="text-sm text-muted-foreground">
            Review and sign to continue
          </p>
        </div>
      </div>

      {/* Unified Signing Flow */}
      <AgreementSigningFlow
        agreementContent={templateContent || ""}
        defaultInitials={defaultInitials}
        defaultSignatureName={clientFullName}
        onComplete={handleSigningComplete}
        onBack={onBack}
        showBackButton={true}
        initialSectionInitials={signatureData.sectionInitials || {}}
        initialSignature={signatureData.clientSignature}
      />
    </div>
  );
};

export default AgreementReviewStep;
