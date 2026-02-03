import { formatDateTime, formatPhoneNumber } from '@/lib/utils';
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    Check,
    Loader2,
    Trash2,
    X,
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

import { CenteredDash } from '@/components/admin/CenteredDash';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { AdminUser, UserType } from '@/hooks/useAdminUsersList';
import { useUpdateAdminUser } from '@/hooks/useAdminUsersList';
import { callAdminApi } from '@/lib/admin-api';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ColumnConfig {
    key: string;
    label: string;
    sortable: boolean;
    minWidth?: number;
    defaultWidth?: number;
    centered?: boolean;
    editable?: boolean;
    editType?: 'text' | 'select';
    options?: { value: string; label: string }[];
    render?: (user: AdminUser) => React.ReactNode;
}

const userTypeLabels: Record<UserType, string> = {
    client: 'Client',
    partner: 'Partner',
    employee: 'Employee',
    sales_rep: 'Sales Rep',
    admin: 'Admin',
    super_admin: 'Super Admin',
};

const userTypeOptions = [
    { value: 'client', label: 'Client' },
    { value: 'partner', label: 'Partner' },
    { value: 'employee', label: 'Employee' },
    { value: 'sales_rep', label: 'Sales Rep' },
    { value: 'admin', label: 'Admin' },
    { value: 'super_admin', label: 'Super Admin' },
];

const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
];

const COLUMN_CONFIG: Record<string, ColumnConfig> = {
    display_name: {
        key: 'display_name',
        label: 'Name',
        sortable: true,
        minWidth: 150,
        defaultWidth: 180,
        editable: true,
        editType: 'text',
        render: (user) => user.display_name,
    },
    phone: {
        key: 'phone',
        label: 'Phone',
        sortable: false,
        minWidth: 130,
        defaultWidth: 150,
        editable: true,
        editType: 'text',
        render: (user) =>
            user.phone ? formatPhoneNumber(user.phone) : <CenteredDash />,
    },
    email: {
        key: 'email',
        label: 'Email',
        sortable: true,
        minWidth: 180,
        defaultWidth: 220,
        editable: false, // Not editable per drawer
        render: (user) => user.email,
    },
    user_type: {
        key: 'user_type',
        label: 'User Type',
        sortable: true,
        minWidth: 100,
        defaultWidth: 120,
        editable: true,
        editType: 'select',
        options: userTypeOptions,
        render: (user) => userTypeLabels[user.user_type] || user.user_type,
    },
    status: {
        key: 'status',
        label: 'Status',
        sortable: true,
        minWidth: 80,
        defaultWidth: 100,
        editable: true,
        editType: 'select',
        options: statusOptions,
        render: (user) =>
            user.status.charAt(0).toUpperCase() + user.status.slice(1),
    },
    primary_company: {
        key: 'primary_company',
        label: 'Primary Company',
        sortable: false,
        minWidth: 140,
        defaultWidth: 180,
        editable: true,
        editType: 'text',
        render: (user) => user.primary_company_name || 'Individual',
    },
    subscription_status: {
        key: 'subscription_status',
        label: 'Subscription',
        sortable: true,
        minWidth: 100,
        defaultWidth: 120,
        editable: true,
        editType: 'text',
        render: (user) => user.subscription_status || <CenteredDash />,
    },
    last_login: {
        key: 'last_login',
        label: 'Last Login',
        sortable: true,
        minWidth: 130,
        defaultWidth: 160,
        centered: true,
        editable: false, // System-generated
        render: (user) =>
            user.last_login ? formatDateTime(user.last_login) : 'Never',
    },
    created_at: {
        key: 'created_at',
        label: 'Created',
        sortable: true,
        minWidth: 130,
        defaultWidth: 160,
        centered: true,
        editable: false, // System-generated
        render: (user) =>
            user.created_at ? (
                formatDateTime(user.created_at)
            ) : (
                <CenteredDash />
            ),
    },
};

const DEFAULT_COLUMN_ORDER = [
    'display_name',
    'phone',
    'email',
    'user_type',
    'status',
    'primary_company',
    'subscription_status',
    'last_login',
    'created_at',
];

interface AdminUsersTableProps {
    adminUsers: AdminUser[];
    loading: boolean;
    sortColumn: string;
    sortDirection: 'asc' | 'desc';
    onSort: (column: string) => void;
    onUserClick: (user: AdminUser) => void;
}

export function AdminUsersTable({
    adminUsers,
    loading,
    sortColumn,
    sortDirection,
    onSort,
    onUserClick,
}: AdminUsersTableProps) {
    const queryClient = useQueryClient();
    const updateMutation = useUpdateAdminUser();
    const visibleColumns = DEFAULT_COLUMN_ORDER.filter(
        (col) => COLUMN_CONFIG[col],
    );

    const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
        {},
    );
    const [resizing, setResizing] = useState<string | null>(null);
    const [localWidths, setLocalWidths] = useState<Record<string, number>>({});
    const startXRef = useRef(0);
    const startWidthRef = useRef(0);

    // Inline editing state
    const [editingCell, setEditingCell] = useState<{
        userId: string;
        field: string;
    } | null>(null);
    const [editValue, setEditValue] = useState<string>('');

    // Delete confirmation state
    const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const getColumnWidth = (colKey: string) => {
        if (localWidths[colKey] !== undefined) {
            return localWidths[colKey];
        }
        return (
            columnWidths[colKey] || COLUMN_CONFIG[colKey]?.defaultWidth || 150
        );
    };

    const handleResizeStart = useCallback(
        (e: React.MouseEvent, colKey: string) => {
            e.preventDefault();
            e.stopPropagation();
            setResizing(colKey);
            startXRef.current = e.clientX;
            startWidthRef.current =
                columnWidths[colKey] ||
                COLUMN_CONFIG[colKey]?.defaultWidth ||
                150;

            const handleMouseMove = (moveEvent: MouseEvent) => {
                const delta = moveEvent.clientX - startXRef.current;
                const newWidth = Math.max(20, startWidthRef.current + delta);
                setLocalWidths((prev) => ({ ...prev, [colKey]: newWidth }));
            };

            const handleMouseUp = (upEvent: MouseEvent) => {
                const delta = upEvent.clientX - startXRef.current;
                const finalWidth = Math.max(20, startWidthRef.current + delta);

                setColumnWidths((prev) => ({ ...prev, [colKey]: finalWidth }));

                setLocalWidths((prev) => {
                    const next = { ...prev };
                    delete next[colKey];
                    return next;
                });
                setResizing(null);
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        },
        [columnWidths],
    );

    const handleStartEdit = (user: AdminUser, field: string) => {
        setEditingCell({ userId: user.id, field });
        const userRecord = user as unknown as Record<string, unknown>;
        setEditValue((userRecord[field] as string) || '');
    };

    const handleCancelEdit = () => {
        setEditingCell(null);
        setEditValue('');
    };

    const handleSaveEdit = async (user: AdminUser) => {
        if (!editingCell) return;

        try {
            await updateMutation.mutateAsync({
                id: user.id,
                [editingCell.field]: editValue,
            });
            setEditingCell(null);
            setEditValue('');
        } catch {
            // Error handled by mutation
        }
    };

    const handleDeleteUser = async () => {
        if (!deleteUserId) return;

        setIsDeleting(true);
        try {
            await callAdminApi('delete_admin_user', { id: deleteUserId });

            toast.success('User deleted successfully');
            queryClient.invalidateQueries({
                queryKey: ['admin', 'admin-users'],
            });
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to delete user',
            );
        } finally {
            setIsDeleting(false);
            setDeleteUserId(null);
        }
    };

    const SortIcon = ({ column }: { column: string }) => {
        if (sortColumn !== column) {
            return (
                <ArrowUpDown className="ml-1 h-4 w-4 flex-shrink-0 opacity-50" />
            );
        }
        return sortDirection === 'asc' ? (
            <ArrowUp className="ml-1 h-4 w-4 flex-shrink-0" />
        ) : (
            <ArrowDown className="ml-1 h-4 w-4 flex-shrink-0" />
        );
    };

    const renderEditableCell = (user: AdminUser, col: ColumnConfig) => {
        const isEditing =
            editingCell?.userId === user.id && editingCell?.field === col.key;

        if (isEditing) {
            if (col.editType === 'select' && col.options) {
                return (
                    <div
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Select
                            value={editValue}
                            onValueChange={(value) => {
                                setEditValue(value);
                                updateMutation.mutate({
                                    id: user.id,
                                    [col.key]: value,
                                });
                                setEditingCell(null);
                            }}
                        >
                            <SelectTrigger className="h-7 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {col.options.map((opt) => (
                                    <SelectItem
                                        key={opt.value}
                                        value={opt.value}
                                    >
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={handleCancelEdit}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                );
            }
            return (
                <div
                    className="flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="h-7 text-xs"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(user);
                            if (e.key === 'Escape') handleCancelEdit();
                        }}
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleSaveEdit(user)}
                    >
                        <Check className="h-3 w-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={handleCancelEdit}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            );
        }

        return (
            <div
                className={`truncate ${col.editable ? '-mx-1 cursor-pointer rounded px-1 hover:bg-muted/50' : ''}`}
                onDoubleClick={
                    col.editable
                        ? () => handleStartEdit(user, col.key)
                        : undefined
                }
                title={col.editable ? 'Double-click to edit' : undefined}
            >
                {col.render ? col.render(user) : '—'}
            </div>
        );
    };

    if (loading && adminUsers.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!loading && adminUsers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <p>No users found</p>
                <p className="text-sm">Try adjusting your search</p>
            </div>
        );
    }

    return (
        <>
            <div className="relative">
                {loading && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                )}
                <table
                    style={{
                        tableLayout: 'fixed',
                        width: 'max-content',
                        minWidth: '100%',
                    }}
                    className="w-full caption-bottom text-sm"
                >
                    <thead className="[&_tr]:border-b">
                        <tr className="border-b bg-background transition-colors">
                            {visibleColumns.map((colKey, colIndex) => {
                                const col = COLUMN_CONFIG[colKey];
                                const width = getColumnWidth(colKey);
                                const isFirstColumn = colIndex === 0;
                                return (
                                    <th
                                        key={colKey}
                                        className={`group relative sticky top-0 h-12 bg-background px-4 text-left align-middle font-medium text-muted-foreground transition-all ${
                                            isFirstColumn
                                                ? 'left-0 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]'
                                                : 'z-20'
                                        }`}
                                        style={{
                                            width: `${width}px`,
                                            minWidth: '20px',
                                        }}
                                    >
                                        <div
                                            className={`flex items-center ${col.centered ? 'justify-center' : ''} ${col.sortable ? 'cursor-pointer select-none hover:text-foreground' : ''}`}
                                            onClick={() =>
                                                col.sortable && onSort(colKey)
                                            }
                                        >
                                            <span
                                                style={{
                                                    wordBreak: 'keep-all',
                                                    overflowWrap: 'normal',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {col.label}
                                            </span>
                                            {col.sortable && (
                                                <SortIcon column={colKey} />
                                            )}
                                        </div>
                                        <div
                                            className={`absolute top-0 right-0 h-full w-1 cursor-col-resize transition-colors hover:bg-primary/50 ${
                                                resizing === colKey
                                                    ? 'bg-primary'
                                                    : 'bg-transparent group-hover:bg-border'
                                            }`}
                                            onMouseDown={(e) =>
                                                handleResizeStart(e, colKey)
                                            }
                                        />
                                    </th>
                                );
                            })}
                            {/* Actions column header */}
                            <th
                                className="sticky top-0 z-20 h-12 bg-background px-4 text-center align-middle font-medium text-muted-foreground"
                                style={{ width: '60px' }}
                            >
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {adminUsers.map((user) => (
                            <tr
                                key={user.id}
                                className="border-b align-top transition-colors hover:bg-muted/50"
                            >
                                {visibleColumns.map((colKey, colIndex) => {
                                    const col = COLUMN_CONFIG[colKey];
                                    const isNameColumn =
                                        colKey === 'display_name';
                                    const width = getColumnWidth(colKey);
                                    const isFirstColumn = colIndex === 0;

                                    const stickyClasses = isFirstColumn
                                        ? 'sticky left-0 z-10 bg-background shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]'
                                        : '';

                                    return (
                                        <td
                                            key={colKey}
                                            className={`p-4 align-middle ${col.centered ? 'text-center' : ''} ${
                                                isNameColumn && !editingCell
                                                    ? 'cursor-pointer font-medium text-lime-400 hover:text-lime-300'
                                                    : ''
                                            } ${stickyClasses}`}
                                            style={{
                                                width: `${width}px`,
                                                maxWidth: `${width}px`,
                                            }}
                                            onClick={
                                                isNameColumn && !editingCell
                                                    ? () => onUserClick(user)
                                                    : undefined
                                            }
                                        >
                                            {renderEditableCell(user, col)}
                                        </td>
                                    );
                                })}
                                {/* Actions column */}
                                <td
                                    className="p-4 text-center align-middle"
                                    style={{ width: '60px' }}
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteUserId(user.id);
                                        }}
                                        title="Delete user"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={!!deleteUserId}
                onOpenChange={() => setDeleteUserId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this user? This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteUser}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
