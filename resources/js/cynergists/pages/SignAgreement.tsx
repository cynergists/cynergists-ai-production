/**
 * SignAgreement Page
 * 
 * Standalone page for signing agreements via email link.
 * Uses the unified AgreementSigningFlow component.
 */

import { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, FileText, AlertCircle, Loader2 } from "lucide-react";
import { AgreementSigningFlow, SigningResult } from "@/components/signing/AgreementSigningFlow";

interface Agreement {
  id: string;
  title: string;
  content: string;
  plan_name: string;
  plan_price: number;
  client_name: string;
  client_email: string;
  client_company: string | null;
  status: string;
  signed_at: string | null;
  signer_name: string | null;
  expires_at: string | null;
}

const SignAgreement = () => {
  const { url } = usePage();
  const token = new URLSearchParams(url.split("?")[1] ?? "").get("token");
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signed, setSigned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Pre-populated initials from DB (if resuming)
  const [initialSectionInitials, setInitialSectionInitials] = useState<Record<string, string>>({});

  useEffect(() => {
    if (token) {
      loadAgreement();
    } else {
      setError("Invalid agreement link");
      setLoading(false);
    }
  }, [token]);

  const loadAgreement = async () => {
    try {
      const { data: agreementData, error: agreementError } = await supabase
        .rpc("get_agreement_by_token", { agreement_token: token! });

      if (agreementError || !agreementData || agreementData.length === 0) {
        setError("Agreement not found or link has expired");
        return;
      }

      const agreementRecord = agreementData[0];

      if (agreementRecord.status === "signed") {
        setSigned(true);
        setAgreement(agreementRecord);
        return;
      }

      if (agreementRecord.expires_at && new Date(agreementRecord.expires_at) < new Date()) {
        setError("This agreement link has expired. Please contact Cynergists for a new link.");
        return;
      }

      setAgreement(agreementRecord);

      // Load agreement sections (pre-populated initials)
      const { data: sectionsData } = await supabase
        .rpc("get_agreement_sections_by_token", { agreement_token: token! });
      
      if (sectionsData && sectionsData.length > 0) {
        const existingInitials: Record<string, string> = {};
        sectionsData.forEach((section: { section_key: string; initials: string | null }, index: number) => {
          if (section.initials) {
            // Map DB section keys to our dynamic keys
            existingInitials[`section_${index + 1}`] = section.initials;
          }
        });
        setInitialSectionInitials(existingInitials);
      }

      // Mark as viewed
      await supabase.rpc("mark_agreement_viewed", {
        agreement_token: token!,
        p_ip_address: null,
        p_user_agent: navigator.userAgent,
      });

    } catch {
      setError("Failed to load agreement");
    } finally {
      setLoading(false);
    }
  };

  const handleSigningComplete = async (result: SigningResult) => {
    if (!agreement || !token) return;
    setSubmitting(true);

    try {
      const { data: signResult, error: signError } = await supabase.rpc(
        "sign_agreement",
        {
          agreement_token: token,
          p_signer_name: result.signature.split("|")[0], // Extract name from "Name|font-class"
          p_signature: result.signature,
          p_ip_address: null,
        }
      );

      if (signError) throw signError;
      if (!signResult) throw new Error("Failed to sign agreement");

      setSigned(true);
      
      toast({
        title: "Agreement Signed",
        description: "Thank you! Your agreement has been signed successfully.",
      });

    } catch {
      toast({
        title: "Error",
        description: "Failed to sign agreement. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Get default initials from client name
  const getDefaultInitials = (): string => {
    if (!agreement) return "AB";
    const nameParts = agreement.client_name.split(" ");
    return nameParts.map(n => n[0]?.toUpperCase() || "").join("");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Unable to Load Agreement</h1>
          <p className="text-muted-foreground">{error}</p>
          <p className="mt-4 text-sm">
            Please contact{" "}
            <a href="mailto:team@cynergists.com" className="text-primary underline">
              team@cynergists.com
            </a>{" "}
            for assistance.
          </p>
        </div>
      </div>
    );
  }

  // Success state
  if (signed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Helmet>
          <title>Agreement Signed | Cynergists</title>
        </Helmet>
        <div className="text-center max-w-md">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Agreement Signed!</h1>
          <p className="text-muted-foreground mb-6">
            Thank you, {agreement?.client_name}! Your {agreement?.plan_name} Plan
            agreement has been signed successfully.
          </p>
          <div className="bg-muted/50 rounded-lg p-6 text-left">
            <h3 className="font-semibold mb-3">What happens next?</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Our team will receive notification of your signed agreement</li>
              <li>You'll receive an email to schedule your onboarding call</li>
              <li>We'll set up your account and begin services</li>
            </ol>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Questions? Contact us at{" "}
            <a href="mailto:team@cynergists.com" className="text-primary underline">
              team@cynergists.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  // Submitting overlay
  if (submitting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-medium">Signing agreement...</p>
          <p className="text-sm text-muted-foreground">Please wait</p>
        </div>
      </div>
    );
  }

  // Main signing flow
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Sign Agreement | Cynergists</title>
        <meta name="robots" content="noindex, nofollow" />
        <link
          href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Great+Vibes&family=Pacifico&family=Satisfy&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      <style>{`
        .font-dancing { font-family: 'Dancing Script', cursive; }
        .font-great-vibes { font-family: 'Great Vibes', cursive; }
        .font-pacifico { font-family: 'Pacifico', cursive; }
        .font-satisfy { font-family: 'Satisfy', cursive; }
      `}</style>

      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container max-w-4xl py-4">
          <div className="flex items-center gap-3">
            <FileText className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-lg font-bold">{agreement?.title}</h1>
              <p className="text-sm text-muted-foreground">
                Prepared for {agreement?.client_name}
                {agreement?.client_company && ` • ${agreement.client_company}`}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl py-8">
        <div className="bg-card border rounded-lg p-8">
          <AgreementSigningFlow
            agreementContent={agreement?.content || ""}
            defaultInitials={getDefaultInitials()}
            defaultSignatureName={agreement?.client_name || ""}
            onComplete={handleSigningComplete}
            showBackButton={false}
            initialSectionInitials={initialSectionInitials}
          />
        </div>
      </main>
    </div>
  );
};

export default SignAgreement;
