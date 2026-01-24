import { ReactNode, useEffect } from "react";
import { router } from "@inertiajs/react";
import { Helmet } from "react-helmet";
import { Loader2 } from "lucide-react";
import { usePartnerAccess } from "@/hooks/usePartnerAccess";
import { PartnerSidebar } from "./PartnerSidebar";
import PartnerContext from "@/contexts/PartnerContext";

export function PartnerPortalLayout({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, isPartner, partner, status, refetch } = usePartnerAccess();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.visit("/signin");
      } else if (!isPartner) {
        router.visit("/dashboard");
      }
    }
  }, [isLoading, isAuthenticated, isPartner]);

  const handleLogout = async () => {
    router.post("/logout", {}, { onSuccess: () => router.visit("/signin") });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isPartner || !partner) {
    return null;
  }

  const partnerName = [partner.first_name, partner.last_name].filter(Boolean).join(' ') || partner.email;

  return (
    <>
      <Helmet>
        <title>Partner Portal | Cynergists</title>
      </Helmet>

      <PartnerContext.Provider value={{ partner, status, refetch }}>
        <div className="h-screen flex w-full bg-background overflow-hidden">
          <PartnerSidebar
            status={status}
            partnerName={partnerName}
            companyName={partner.company_name}
            partnerSlug={partner.slug}
            onLogout={handleLogout}
          />
          <main className="flex-1 h-full flex flex-col min-h-0 overflow-y-auto">
            {children}
          </main>
        </div>
      </PartnerContext.Provider>
    </>
  );
}
