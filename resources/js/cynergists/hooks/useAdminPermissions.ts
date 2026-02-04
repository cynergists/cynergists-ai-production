import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';

export type PermissionKey =
    | 'dashboard.view_basic'
    | 'dashboard.view_financial_summary'
    | 'integrations.manage'
    | 'ai_agents.view'
    | 'ai_agents.manage'
    | 'ai_agents.pricing_manage'
    | 'ai_agents.publish'
    | 'prospects.view_assigned'
    | 'prospects.view_all'
    | 'prospects.edit_assigned'
    | 'prospects.edit_all'
    | 'prospects.assign'
    | 'prospects.export'
    | 'sales_team.view'
    | 'sales_team.manage'
    | 'sales_team.commission_view'
    | 'sales_team.commission_edit'
    | 'employees.view'
    | 'employees.manage'
    | 'payroll.view'
    | 'payroll.edit'
    | 'partners.view_directory'
    | 'partners.manage'
    | 'partners.commission_view'
    | 'partners.commission_edit'
    | 'partners.payout_view'
    | 'users.view'
    | 'users.invite'
    | 'users.deactivate'
    | 'users.assign_admin_role'
    | 'users.assign_super_admin'
    | 'calendars.view'
    | 'calendars.manage'
    | 'calendars.publish'
    | 'calendars.assign_participants'
    | 'transactions.view'
    | 'transactions.sync'
    | 'transactions.refund'
    | 'transactions.test_mode'
    | 'contracts.view_templates'
    | 'contracts.edit_templates'
    | 'contracts.view_signed'
    | 'contracts.manage_signed'
    | 'analytics.view'
    | 'settings.personal'
    | 'settings.system';

export type AdminUserType = 'employee' | 'sales_rep' | 'admin';

interface AdminUser {
    id: string | number;
    email: string;
    name: string;
    is_super_admin: boolean;
    admin_user_type: AdminUserType;
    is_active: boolean;
}

interface UseAdminPermissionsResult {
    permissions: Map<PermissionKey, boolean>;
    hasPermission: (key: PermissionKey) => boolean;
    hasAnyPermission: (...keys: PermissionKey[]) => boolean;
    hasAllPermissions: (...keys: PermissionKey[]) => boolean;
    isSuperAdmin: boolean;
    adminUser: AdminUser | null;
    isLoading: boolean;
    error: Error | null;
}

export function useAdminPermissions(): UseAdminPermissionsResult {
    const { props } = usePage<{
        auth?: {
            user?: {
                id: number | string;
                email: string;
                name: string;
                is_active?: boolean;
            } | null;
            roles?: string[];
        };
    }>();

    const roles = props.auth?.roles ?? [];
    const isAdmin = roles.includes('admin');

    const adminUser = useMemo<AdminUser | null>(() => {
        const user = props.auth?.user;

        if (!user || !isAdmin) {
            return null;
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            is_super_admin: false,
            admin_user_type: 'admin',
            is_active: user.is_active ?? true,
        };
    }, [props.auth?.user, isAdmin]);

    const permissions = useMemo(() => {
        const map = new Map<PermissionKey, boolean>();

        if (isAdmin) {
            ALL_PERMISSIONS.forEach((permission) => {
                map.set(permission, true);
            });
        }

        return map;
    }, [isAdmin]);

    const hasPermission = (key: PermissionKey): boolean => {
        return permissions.get(key) ?? false;
    };

    const hasAnyPermission = (...keys: PermissionKey[]): boolean => {
        return keys.some((key) => hasPermission(key));
    };

    const hasAllPermissions = (...keys: PermissionKey[]): boolean => {
        return keys.every((key) => hasPermission(key));
    };

    return {
        permissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        isSuperAdmin: false,
        adminUser,
        isLoading: false,
        error: null,
    };
}

// Permission keys organized by module for easy reference
export const PERMISSION_MODULES = {
    Dashboard: ['dashboard.view_basic', 'dashboard.view_financial_summary'],
    Integrations: ['integrations.manage'],
    'AI Agents': [
        'ai_agents.view',
        'ai_agents.manage',
        'ai_agents.pricing_manage',
        'ai_agents.publish',
    ],
    Prospects: [
        'prospects.view_assigned',
        'prospects.view_all',
        'prospects.edit_assigned',
        'prospects.edit_all',
        'prospects.assign',
        'prospects.export',
    ],
    'Sales Team': [
        'sales_team.view',
        'sales_team.manage',
        'sales_team.commission_view',
        'sales_team.commission_edit',
    ],
    Employees: ['employees.view', 'employees.manage'],
    Payroll: ['payroll.view', 'payroll.edit'],
    Partners: [
        'partners.view_directory',
        'partners.manage',
        'partners.commission_view',
        'partners.commission_edit',
        'partners.payout_view',
    ],
    Users: [
        'users.view',
        'users.invite',
        'users.deactivate',
        'users.assign_admin_role',
        'users.assign_super_admin',
    ],
    Calendars: [
        'calendars.view',
        'calendars.manage',
        'calendars.publish',
        'calendars.assign_participants',
    ],
    Transactions: [
        'transactions.view',
        'transactions.sync',
        'transactions.refund',
        'transactions.test_mode',
    ],
    Contracts: [
        'contracts.view_templates',
        'contracts.edit_templates',
        'contracts.view_signed',
        'contracts.manage_signed',
    ],
    Analytics: ['analytics.view'],
    Settings: ['settings.personal', 'settings.system'],
} as const;

const ALL_PERMISSIONS = Object.values(PERMISSION_MODULES).flat();

// Route to required permissions mapping
export const ROUTE_PERMISSIONS: Record<string, PermissionKey[]> = {
    '/admin': ['dashboard.view_basic'],
    '/admin/ai-agents': ['ai_agents.view'],
    '/admin/prospects': ['prospects.view_assigned', 'prospects.view_all'],
    '/admin/sales': ['sales_team.view'],
    '/admin/employees': ['employees.view'],
    '/admin/partners': ['partners.view_directory'],
    '/admin/users': ['users.view'],
    '/admin/calendars': ['calendars.view'],
    '/admin/transactions': ['transactions.view'],
    '/admin/agreements': ['contracts.view_signed'],
    '/admin/templates': ['contracts.view_templates'],
    '/admin/analytics': ['analytics.view'],
    '/admin/settings': ['settings.personal'],
    '/admin/integrations': ['integrations.manage'],
};
