import { useEffect, useMemo, useState, ReactNode } from "react";
import { router, usePage } from "@inertiajs/react";
import { useCart } from "@/contexts/CartContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireClientRole?: boolean;
}

const ProtectedRoute = ({ children, requireClientRole = false }: ProtectedRouteProps) => {
  const [authState, setAuthState] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const [redirectTo, setRedirectTo] = useState("/signin");
  const { url, props } = usePage<{
    auth: {
      user: { id: number } | null;
      roles: string[];
    };
  }>();
  const pathname = url.split("?")[0];
  const { items } = useCart();

  // Check if cart contains partner packages
  const hasPartnerPackage = items.some(item => item.metadata?.isPartnerPackage);

  const roles = useMemo(() => props.auth?.roles ?? [], [props.auth]);

  useEffect(() => {
    const isAuthenticated = Boolean(props.auth?.user);
    const requiredRole = hasPartnerPackage ? "partner" : "client";
    const needsRole = requireClientRole || hasPartnerPackage;
    const hasRequiredRole = !needsRole || roles.includes(requiredRole);
    const signupRedirect = hasPartnerPackage ? "/signup/partner" : "/signup/client";

    if (!isAuthenticated) {
      sessionStorage.setItem("checkout_redirect", pathname);
      setRedirectTo(hasPartnerPackage ? "/signup/partner" : "/signin");
      setAuthState("unauthenticated");
      return;
    }

    if (!hasRequiredRole) {
      sessionStorage.setItem("checkout_redirect", pathname);
      setRedirectTo(signupRedirect);
      setAuthState("unauthenticated");
      return;
    }

    setAuthState("authenticated");
  }, [props.auth, roles, pathname, requireClientRole, hasPartnerPackage]);

  // Show loading spinner while checking auth
  if (authState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to sign in (or appropriate signup) if not authenticated
  if (authState === "unauthenticated") {
    router.visit(redirectTo);
    return null;
  }

  // User is authenticated - render children
  return <>{children}</>;
};

export default ProtectedRoute;
