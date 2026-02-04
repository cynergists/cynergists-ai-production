import {
    PermissionKey,
    useAdminPermissions,
} from '@/hooks/useAdminPermissions';
import { ReactNode } from 'react';

interface PermissionGateProps {
    /**
     * Permission key(s) required to view the children.
     * If multiple keys provided, user needs ANY of them (OR logic).
     */
    permission: PermissionKey | PermissionKey[];
    /**
     * If true, user must have ALL permissions (AND logic).
     */
    requireAll?: boolean;
    /**
     * Content to render when user has permission.
     */
    children: ReactNode;
    /**
     * Optional fallback content when permission is denied.
     * Defaults to null (nothing rendered).
     */
    fallback?: ReactNode;
}

/**
 * Component that conditionally renders children based on user permissions.
 * Use this to gate UI elements like buttons, sections, etc.
 */
export function PermissionGate({
    permission,
    requireAll = false,
    children,
    fallback = null,
}: PermissionGateProps) {
    const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } =
        useAdminPermissions();

    if (isLoading) {
        return null;
    }

    const permissions = Array.isArray(permission) ? permission : [permission];

    const hasAccess = requireAll
        ? hasAllPermissions(...permissions)
        : hasAnyPermission(...permissions);

    if (!hasAccess) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

/**
 * Hook version for more complex conditional logic.
 */
export function usePermissionCheck(
    permission: PermissionKey | PermissionKey[],
    requireAll = false,
): { hasAccess: boolean; isLoading: boolean } {
    const { hasAnyPermission, hasAllPermissions, isLoading } =
        useAdminPermissions();

    const permissions = Array.isArray(permission) ? permission : [permission];

    const hasAccess = requireAll
        ? hasAllPermissions(...permissions)
        : hasAnyPermission(...permissions);

    return { hasAccess, isLoading };
}
