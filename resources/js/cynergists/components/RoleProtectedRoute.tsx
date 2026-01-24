import { useState, useEffect, ReactNode } from "react";
import { router, usePage } from "@inertiajs/react";
import { Loader2 } from "lucide-react";

type AppRole = 'admin' | 'partner' | 'client' | 'sales_rep' | 'employee';

interface RoleProtectedRouteProps {
  children: ReactNode;
  requiredRole: AppRole;
  redirectTo?: string;
}

/**
 * A generic protected route component that checks for a specific role.
 * Redirects to signin if not authenticated, or to the specified redirect URL
 * if authenticated but lacking the required role.
 */
const RoleProtectedRoute = ({ 
  children, 
  requiredRole, 
  redirectTo = "/signin" 
}: RoleProtectedRouteProps) => {
  const [authState, setAuthState] = useState<"loading" | "authorized" | "unauthorized">("loading");
  const { url, props } = usePage<{
    auth: {
      user: { id: number } | null;
      roles: string[];
    };
  }>();
  const pathname = url.split("?")[0];

  useEffect(() => {
    const isAuthenticated = Boolean(props.auth?.user);
    const roles = props.auth?.roles ?? [];

    if (!isAuthenticated) {
      sessionStorage.setItem("redirect_after_login", pathname);
      setAuthState("unauthorized");
      return;
    }

    if (!roles.includes(requiredRole)) {
      setAuthState("unauthorized");
      return;
    }

    setAuthState("authorized");
  }, [props.auth, pathname, requiredRole]);

  if (authState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (authState === "unauthorized") {
    router.visit(redirectTo);
    return null;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;

// Convenience components for specific roles
export const SalesRepProtectedRoute = ({ children }: { children: ReactNode }) => (
  <RoleProtectedRoute requiredRole="sales_rep">{children}</RoleProtectedRoute>
);

export const EmployeeProtectedRoute = ({ children }: { children: ReactNode }) => (
  <RoleProtectedRoute requiredRole="employee">{children}</RoleProtectedRoute>
);

export const PartnerProtectedRoute = ({ children }: { children: ReactNode }) => (
  <RoleProtectedRoute requiredRole="partner">{children}</RoleProtectedRoute>
);

export const AdminProtectedRoute = ({ children }: { children: ReactNode }) => (
  <RoleProtectedRoute requiredRole="admin">{children}</RoleProtectedRoute>
);
