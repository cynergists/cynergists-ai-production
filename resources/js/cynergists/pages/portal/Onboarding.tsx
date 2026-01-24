import { useState, useEffect, useCallback } from "react";
import { router } from "@inertiajs/react";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, X, AlertCircle } from "lucide-react";
import { useCurrentUserTenant } from "@/hooks/useTenant";
import { useDebounce } from "@/hooks/useDebounce";
import cynergistsLogo from "@/assets/cynergists-logo-new.png";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 30);
}

export default function PortalOnboarding() {
  const { toast } = useToast();
  const { data: tenant, isLoading: tenantLoading } = useCurrentUserTenant();
  
  const [subdomain, setSubdomain] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);
  
  const debouncedSubdomain = useDebounce(subdomain, 500);

  // Pre-fill with slugified company name
  useEffect(() => {
    if (tenant?.company_name && !subdomain) {
      const suggested = slugify(tenant.company_name);
      if (suggested.length >= 3) {
        setSubdomain(suggested);
      }
    }
  }, [tenant?.company_name, subdomain]);

  // Redirect if onboarding already completed
  useEffect(() => {
    if (tenant && !tenant.is_temp_subdomain) {
      navigate("/portal");
    }
  }, [tenant, navigate]);

  // Check availability when subdomain changes
  const checkAvailability = useCallback(async (value: string) => {
    if (value.length < 3) {
      setIsAvailable(null);
      setAvailabilityMessage("Minimum 3 characters");
      return;
    }

    setIsChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-subdomain", {
        body: { subdomain: value },
      });

      if (error) throw error;

      setIsAvailable(data.available);
      if (data.available) {
        setAvailabilityMessage("Available!");
      } else if (data.reason === "invalid_format") {
        setAvailabilityMessage(data.message || "Invalid format");
      } else {
        setAvailabilityMessage("Already taken");
      }
    } catch (error) {
      console.error("Error checking subdomain:", error);
      setIsAvailable(null);
      setAvailabilityMessage("Error checking availability");
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedSubdomain) {
      checkAvailability(debouncedSubdomain);
    } else {
      setIsAvailable(null);
      setAvailabilityMessage("");
    }
  }, [debouncedSubdomain, checkAvailability]);

  const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSubdomain(value);
    setIsAvailable(null);
    setAvailabilityMessage("");
  };

  const handleClaim = async () => {
    if (!isAvailable || isClaiming) return;

    setIsClaiming(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Session expired",
          description: "Please sign in again.",
          variant: "destructive",
        });
      router.visit("/signin");
        return;
      }

      const { data, error } = await supabase.functions.invoke("claim-subdomain", {
        body: { subdomain },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Portal address claimed!",
          description: `Your portal is now at ${subdomain}.cynergists.com`,
        });
        
        // In production, would redirect to subdomain
        // For now, redirect to portal
        router.visit("/portal");
        router.visit("/portal");
      } else {
        throw new Error(data.error || "Failed to claim subdomain");
      }
    } catch (error) {
      console.error("Error claiming subdomain:", error);
      toast({
        title: "Failed to claim address",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsClaiming(false);
    }
  };

  if (tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Choose Your Portal Address | Cynergists</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-xl">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src={cynergistsLogo}
              alt="Cynergists"
              className="h-10 w-auto"
            />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Choose Your Portal Address
            </h1>
            <p className="text-sm text-muted-foreground">
              Your team will access your portal at this address
            </p>
          </div>

          {/* Subdomain Input */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subdomain">Portal Address</Label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    id="subdomain"
                    value={subdomain}
                    onChange={handleSubdomainChange}
                    placeholder="your-company"
                    className="pr-10 bg-input border-border"
                    maxLength={30}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isChecking ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : isAvailable === true ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : isAvailable === false ? (
                      <X className="h-4 w-4 text-destructive" />
                    ) : null}
                  </div>
                </div>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  .cynergists.com
                </span>
              </div>
              {availabilityMessage && (
                <p className={`text-xs ${isAvailable ? "text-green-500" : isAvailable === false ? "text-destructive" : "text-muted-foreground"}`}>
                  {availabilityMessage}
                </p>
              )}
            </div>

            <Button
              onClick={handleClaim}
              disabled={!isAvailable || isClaiming}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
            >
              {isClaiming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Claim This Address"
              )}
            </Button>

            {/* Tips */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Tips:</strong></p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Use lowercase letters, numbers, and hyphens</li>
                    <li>Keep it short and memorable</li>
                    <li>This cannot be changed later</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
