import { ReactNode, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import { useAdminPermissions, PermissionKey, ROUTE_PERMISSIONS } from "@/hooks/useAdminPermissions";
import { Loader2 } from "lucide-react";

interface RouteGuardProps {
  children: ReactNode;
  /**
   * Optional override for route permissions.
   * If not provided, will use ROUTE_PERMISSIONS mapping.
   */
  requiredPermissions?: PermissionKey[];
}

/**
 * Route guard component that checks permissions before rendering route content.
 * Redirects to Access Denied page if user lacks required permissions.
 */
export function RouteGuard({ children, requiredPermissions }: RouteGuardProps) {
  const { url } = usePage();
  const pathname = url.split("?")[0];
  const { hasAnyPermission, adminUser, isLoading, isSuperAdmin } = useAdminPermissions();

  // Get required permissions for current route
  const getRequiredPermissions = (): PermissionKey[] => {
    if (requiredPermissions) return requiredPermissions;

    // Match route to permissions
    const pathname = url.split("?")[0];

    // Check exact match first
    if (ROUTE_PERMISSIONS[pathname]) {
      return ROUTE_PERMISSIONS[pathname];
    }

    // Check prefix matches (for nested routes like /admin/ai-agents/:id)
    for (const [route, perms] of Object.entries(ROUTE_PERMISSIONS)) {
      if (pathname.startsWith(route) && route !== "/admin") {
        return perms;
      }
    }

    // Default to dashboard permission for /admin routes
    if (pathname.startsWith("/admin")) {
      return ["dashboard.view_basic"];
    }

    return [];
  };

  const permissions = getRequiredPermissions();

  useEffect(() => {
    if (isLoading) return;

    // Check if user is an admin at all
    if (!adminUser) {
      router.visit("/admin/login");
      return;
    }

    // Check if user is active
    if (!adminUser.is_active) {
      router.visit("/admin/access-denied");
      return;
    }

    // Super admins always have access
    if (isSuperAdmin) return;

    // Check permissions
    if (permissions.length > 0 && !hasAnyPermission(...permissions)) {
      router.visit("/admin/access-denied");
    }
  }, [isLoading, adminUser, isSuperAdmin, permissions, hasAnyPermission]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Don't render content if no admin user
  if (!adminUser || !adminUser.is_active) {
    return null;
  }

  // Super admins always have access
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  // Check permissions before rendering
  if (permissions.length > 0 && !hasAnyPermission(...permissions)) {
    return null;
  }

  return <>{children}</>;
}
