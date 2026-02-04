import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AdminUserType,
    useAdminPermissions,
} from '@/hooks/useAdminPermissions';
import { supabase } from '@/integrations/supabase/client';
import { router } from '@inertiajs/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, RotateCcw, Save, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

interface Permission {
    id: string;
    key: string;
    label: string;
    module: string;
    description: string | null;
}

interface RolePermission {
    id: string;
    role: AdminUserType;
    permission_id: string;
    enabled: boolean;
}

// Default permissions matching section D of requirements
const DEFAULT_PERMISSIONS: Record<AdminUserType, string[]> = {
    admin: [
        'dashboard.view_basic',
        'dashboard.view_financial_summary',
        'analytics.view',
        'ai_agents.view',
        'ai_agents.manage',
        'prospects.view_all',
        'prospects.edit_all',
        'prospects.assign',
        'partners.view_directory',
        'users.view',
        'users.invite',
        'calendars.view',
        'calendars.manage',
        'calendars.publish',
        'calendars.assign_participants',
        'contracts.view_signed',
        'contracts.view_templates',
        'settings.personal',
    ],
    sales_rep: [
        'prospects.view_assigned',
        'prospects.edit_assigned',
        'calendars.view',
        'contracts.view_signed',
        'ai_agents.view',
        'settings.personal',
    ],
    employee: ['ai_agents.view', 'calendars.view', 'settings.personal'],
};

export default function Permissions() {
    const { isSuperAdmin, isLoading: isLoadingPerms } = useAdminPermissions();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [pendingChanges, setPendingChanges] = useState<Map<string, boolean>>(
        new Map(),
    );
    const [isSaving, setIsSaving] = useState(false);

    // Redirect non-super-admins
    if (!isLoadingPerms && !isSuperAdmin) {
        router.visit('/admin/access-denied');
        return null;
    }

    // Fetch all permissions
    const { data: permissions, isLoading: isLoadingPermissions } = useQuery({
        queryKey: ['all-permissions'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('permissions')
                .select('*')
                .order('module', { ascending: true })
                .order('key', { ascending: true });
            if (error) throw error;
            return data as Permission[];
        },
    });

    // Fetch all role permissions
    const { data: rolePermissions, isLoading: isLoadingRolePerms } = useQuery({
        queryKey: ['all-role-permissions'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('role_permissions')
                .select('*');
            if (error) throw error;
            return data as RolePermission[];
        },
    });

    // Group permissions by module
    const groupedPermissions = useMemo(() => {
        if (!permissions) return {};

        const filtered = searchQuery
            ? permissions.filter(
                  (p) =>
                      p.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      p.label
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                      p.module
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()),
              )
            : permissions;

        return filtered.reduce(
            (acc, perm) => {
                if (!acc[perm.module]) acc[perm.module] = [];
                acc[perm.module].push(perm);
                return acc;
            },
            {} as Record<string, Permission[]>,
        );
    }, [permissions, searchQuery]);

    // Get current enabled state for a permission/role combo
    const isPermissionEnabled = (
        permissionId: string,
        role: AdminUserType,
    ): boolean => {
        const key = `${role}:${permissionId}`;
        if (pendingChanges.has(key)) {
            return pendingChanges.get(key)!;
        }
        const rp = rolePermissions?.find(
            (rp) => rp.permission_id === permissionId && rp.role === role,
        );
        return rp?.enabled ?? false;
    };

    // Toggle a permission
    const handleToggle = (
        permissionId: string,
        role: AdminUserType,
        enabled: boolean,
    ) => {
        const key = `${role}:${permissionId}`;
        setPendingChanges((prev) => new Map(prev).set(key, enabled));
    };

    // Save all changes
    const handleSave = async () => {
        if (pendingChanges.size === 0) {
            toast.info('No changes to save');
            return;
        }

        setIsSaving(true);
        try {
            const updates: {
                role: AdminUserType;
                permission_id: string;
                enabled: boolean;
            }[] = [];

            pendingChanges.forEach((enabled, key) => {
                const [role, permissionId] = key.split(':') as [
                    AdminUserType,
                    string,
                ];
                updates.push({ role, permission_id: permissionId, enabled });
            });

            // Upsert all changes
            for (const update of updates) {
                const { error } = await supabase
                    .from('role_permissions')
                    .upsert(
                        {
                            role: update.role,
                            permission_id: update.permission_id,
                            enabled: update.enabled,
                            updated_at: new Date().toISOString(),
                        },
                        { onConflict: 'role,permission_id' },
                    );
                if (error) throw error;
            }

            toast.success(`Saved ${updates.length} permission changes`);
            setPendingChanges(new Map());
            queryClient.invalidateQueries({
                queryKey: ['all-role-permissions'],
            });
            queryClient.invalidateQueries({ queryKey: ['admin-permissions'] });
        } catch (error) {
            toast.error(
                'Failed to save permissions: ' + (error as Error).message,
            );
        } finally {
            setIsSaving(false);
        }
    };

    // Reset to defaults
    const handleResetToDefaults = async () => {
        setIsSaving(true);
        try {
            if (!permissions) return;

            // Build upsert data for all role/permission combos
            const upserts: {
                role: AdminUserType;
                permission_id: string;
                enabled: boolean;
            }[] = [];
            const roles: AdminUserType[] = ['admin', 'sales_rep', 'employee'];

            for (const role of roles) {
                for (const perm of permissions) {
                    const enabled = DEFAULT_PERMISSIONS[role].includes(
                        perm.key,
                    );
                    upserts.push({ role, permission_id: perm.id, enabled });
                }
            }

            // Upsert in batches
            for (const upsert of upserts) {
                const { error } = await supabase
                    .from('role_permissions')
                    .upsert(
                        {
                            role: upsert.role,
                            permission_id: upsert.permission_id,
                            enabled: upsert.enabled,
                            updated_at: new Date().toISOString(),
                        },
                        { onConflict: 'role,permission_id' },
                    );
                if (error) throw error;
            }

            toast.success('Permissions reset to defaults');
            setPendingChanges(new Map());
            queryClient.invalidateQueries({
                queryKey: ['all-role-permissions'],
            });
            queryClient.invalidateQueries({ queryKey: ['admin-permissions'] });
        } catch (error) {
            toast.error(
                'Failed to reset permissions: ' + (error as Error).message,
            );
        } finally {
            setIsSaving(false);
        }
    };

    const isLoading =
        isLoadingPermissions || isLoadingRolePerms || isLoadingPerms;
    const hasChanges = pendingChanges.size > 0;

    if (isLoading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Permissions
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage role-based access control for the admin console
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" disabled={isSaving}>
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Reset to Defaults
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Reset to Default Permissions?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will reset all role permissions to
                                    their default values. Any custom changes
                                    will be lost. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleResetToDefaults}
                                >
                                    Reset to Defaults
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Button
                        onClick={handleSave}
                        disabled={!hasChanges || isSaving}
                    >
                        {isSaving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        Save Changes
                        {hasChanges && ` (${pendingChanges.size})`}
                    </Button>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search permissions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Permissions Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]">
                                Permission
                            </TableHead>
                            <TableHead className="w-[200px]">Module</TableHead>
                            <TableHead className="text-center">
                                Employee
                            </TableHead>
                            <TableHead className="text-center">
                                Sales Rep
                            </TableHead>
                            <TableHead className="text-center">Admin</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Object.entries(groupedPermissions).map(
                            ([module, perms]) => (
                                <>
                                    <TableRow
                                        key={`module-${module}`}
                                        className="bg-muted/30"
                                    >
                                        <TableCell
                                            colSpan={5}
                                            className="font-semibold text-foreground"
                                        >
                                            {module}
                                        </TableCell>
                                    </TableRow>
                                    {perms.map((perm) => (
                                        <TableRow key={perm.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="text-sm font-medium">
                                                        {perm.label}
                                                    </div>
                                                    <div className="font-mono text-xs text-muted-foreground">
                                                        {perm.key}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {perm.module}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Switch
                                                    checked={isPermissionEnabled(
                                                        perm.id,
                                                        'employee',
                                                    )}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        handleToggle(
                                                            perm.id,
                                                            'employee',
                                                            checked,
                                                        )
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Switch
                                                    checked={isPermissionEnabled(
                                                        perm.id,
                                                        'sales_rep',
                                                    )}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        handleToggle(
                                                            perm.id,
                                                            'sales_rep',
                                                            checked,
                                                        )
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Switch
                                                    checked={isPermissionEnabled(
                                                        perm.id,
                                                        'admin',
                                                    )}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        handleToggle(
                                                            perm.id,
                                                            'admin',
                                                            checked,
                                                        )
                                                    }
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </>
                            ),
                        )}
                        {Object.keys(groupedPermissions).length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="py-8 text-center text-muted-foreground"
                                >
                                    No permissions found matching your search.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
