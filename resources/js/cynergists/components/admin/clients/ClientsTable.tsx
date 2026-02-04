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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPhoneForDisplay } from '@/components/ui/phone-input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Client } from '@/hooks/useAdminQueries';
import { useUpdateClient } from '@/hooks/useUpdateClient';
import { formatDate } from '@/lib/utils';
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    Check,
    CreditCard,
    GripVertical,
    Loader2,
    X,
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { ClientPaymentsDialog } from './ClientPaymentsDialog';

// Fields that come from Square and should NOT be editable
const SQUARE_READONLY_FIELDS = [
    'payment_type',
    'payment_amount',
    'last_payment_date',
    'next_payment_due_date',
    'square_plan_name',
    'square_synced_at',
];

interface ColumnConfig {
    key: string;
    label: string;
    sortable: boolean;
    minWidth?: number;
    defaultWidth?: number;
    editable?: boolean;
    editType?: 'text' | 'select' | 'date' | 'number';
    selectOptions?: { value: string; label: string }[];
    render?: (client: Client) => React.ReactNode;
}

const STATUS_OPTIONS = [
    { value: 'active', label: 'Active' },
    { value: 'past_due', label: 'Past Due' },
    { value: 'terminated', label: 'Terminated' },
    { value: 'paused', label: 'Paused' },
];

const PAYMENT_TYPE_OPTIONS = [
    { value: 'subscription', label: 'Subscription' },
    { value: 'one_time', label: 'One Time' },
    { value: 'invoice', label: 'Invoice' },
];

const COLUMN_CONFIG: Record<string, ColumnConfig> = {
    name: {
        key: 'name',
        label: 'Name',
        sortable: true,
        minWidth: 120,
        defaultWidth: 180,
        editable: true,
        editType: 'text',
    },
    email: {
        key: 'email',
        label: 'Email',
        sortable: true,
        minWidth: 150,
        defaultWidth: 220,
        editable: true,
        editType: 'text',
    },
    phone: {
        key: 'phone',
        label: 'Phone',
        sortable: true,
        minWidth: 150,
        defaultWidth: 180,
        editable: true,
        editType: 'text',
        render: (client) => formatPhoneForDisplay(client.phone),
    },
    status: {
        key: 'status',
        label: 'Status',
        sortable: true,
        minWidth: 80,
        defaultWidth: 120,
        editable: true,
        editType: 'select',
        selectOptions: STATUS_OPTIONS,
        render: (client) => {
            const status = client.status || 'unknown';
            const variant =
                status === 'active'
                    ? 'default'
                    : status === 'past_due'
                      ? 'destructive'
                      : status === 'terminated'
                        ? 'secondary'
                        : 'outline';
            return <Badge variant={variant}>{status}</Badge>;
        },
    },
    payment_type: {
        key: 'payment_type',
        label: 'Payment Type',
        sortable: true,
        minWidth: 100,
        defaultWidth: 130,
        editable: false, // Square-managed field - do not allow editing
        editType: 'select',
        selectOptions: PAYMENT_TYPE_OPTIONS,
        render: (client) => client.payment_type || <CenteredDash />,
    },
    last_activity: {
        key: 'last_activity',
        label: 'Last Activity',
        sortable: true,
        minWidth: 100,
        defaultWidth: 130,
        editable: true,
        editType: 'date',
        render: (client) =>
            client.last_activity ? (
                formatDate(client.last_activity)
            ) : (
                <CenteredDash />
            ),
    },
    last_contact: {
        key: 'last_contact',
        label: 'Last Contact',
        sortable: true,
        minWidth: 100,
        defaultWidth: 130,
        editable: true,
        editType: 'date',
        render: (client) =>
            client.last_contact ? (
                formatDate(client.last_contact)
            ) : (
                <CenteredDash />
            ),
    },
    next_meeting: {
        key: 'next_meeting',
        label: 'Next Meeting',
        sortable: true,
        minWidth: 100,
        defaultWidth: 130,
        editable: true,
        editType: 'date',
        render: (client) =>
            client.next_meeting ? (
                formatDate(client.next_meeting)
            ) : (
                <CenteredDash />
            ),
    },
    last_payment_date: {
        key: 'last_payment_date',
        label: 'Last Payment',
        sortable: true,
        minWidth: 100,
        defaultWidth: 130,
        editable: false, // Square-managed field - do not allow editing
        editType: 'date',
        render: (client) =>
            client.last_payment_date ? (
                formatDate(client.last_payment_date)
            ) : (
                <CenteredDash />
            ),
    },
    next_payment_due_date: {
        key: 'next_payment_due_date',
        label: 'Next Payment',
        sortable: true,
        minWidth: 120,
        defaultWidth: 150,
        editable: false, // Square-managed field - do not allow editing
        editType: 'date',
        render: (client) =>
            client.next_payment_due_date ? (
                formatDate(client.next_payment_due_date)
            ) : (
                <CenteredDash />
            ),
    },
    payment_amount: {
        key: 'payment_amount',
        label: 'Payment Amount',
        sortable: true,
        minWidth: 100,
        defaultWidth: 140,
        editable: false, // Square-managed field - do not allow editing
        editType: 'number',
        render: (client) =>
            client.payment_amount ? (
                `$${client.payment_amount.toLocaleString()}`
            ) : (
                <CenteredDash />
            ),
    },
    sales_rep: {
        key: 'sales_rep',
        label: 'Sales Rep',
        sortable: true,
        minWidth: 100,
        defaultWidth: 130,
        editable: true,
        editType: 'text',
        render: (client) => client.sales_rep || <CenteredDash />,
    },
    partner_name: {
        key: 'partner_name',
        label: 'Partner',
        sortable: true,
        minWidth: 100,
        defaultWidth: 130,
        editable: true,
        editType: 'text',
        render: (client) => client.partner_name || <CenteredDash />,
    },
    tags: {
        key: 'tags',
        label: 'Tags',
        sortable: false,
        minWidth: 120,
        defaultWidth: 180,
        editable: false,
        render: (client) => {
            if (!client.tags || client.tags.length === 0)
                return <CenteredDash />;
            return (
                <div className="flex flex-wrap gap-1">
                    {client.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                        </Badge>
                    ))}
                    {client.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                            +{client.tags.length - 3}
                        </Badge>
                    )}
                </div>
            );
        },
    },
    payments: {
        key: 'payments',
        label: 'Payments',
        sortable: false,
        minWidth: 80,
        defaultWidth: 100,
        editable: false,
        // Render is handled separately in the table body due to state requirements
        render: () => null,
    },
};

interface ClientsTableProps {
    clients: Client[];
    loading: boolean;
    columnOrder: string[];
    hiddenColumns: string[];
    columnWidths: Record<string, number>;
    sortColumn: string;
    sortDirection: 'asc' | 'desc';
    onSort: (column: string) => void;
    onClientClick: (client: Client) => void;
    onColumnResize: (column: string, width: number) => void;
    onColumnReorder: (newOrder: string[]) => void;
    onClientUpdated?: () => void;
}

export function ClientsTable({
    clients,
    loading,
    columnOrder,
    hiddenColumns,
    columnWidths,
    sortColumn,
    sortDirection,
    onSort,
    onClientClick,
    onColumnResize,
    onColumnReorder,
    onClientUpdated,
}: ClientsTableProps) {
    const visibleColumns = columnOrder.filter(
        (col) => !hiddenColumns.includes(col) && COLUMN_CONFIG[col],
    );

    const [resizing, setResizing] = useState<string | null>(null);
    const [localWidths, setLocalWidths] = useState<Record<string, number>>({});
    const startXRef = useRef(0);
    const startWidthRef = useRef(0);

    // Drag and drop state
    const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

    // Inline editing state
    const [editingCell, setEditingCell] = useState<{
        clientId: string;
        field: string;
    } | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const { updateClient, updating } = useUpdateClient();

    // Termination confirmation dialog state
    const [showTerminationDialog, setShowTerminationDialog] = useState(false);
    const [pendingTermination, setPendingTermination] = useState<{
        clientId: string;
        clientName: string;
    } | null>(null);

    // Payments dialog state
    const [paymentsClient, setPaymentsClient] = useState<Client | null>(null);

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

                onColumnResize(colKey, finalWidth);

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
        [columnWidths, onColumnResize],
    );

    // Drag and drop handlers
    const handleDragStart = useCallback(
        (e: React.DragEvent, colKey: string) => {
            setDraggedColumn(colKey);
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', colKey);
        },
        [],
    );

    const handleDragOver = useCallback(
        (e: React.DragEvent, colKey: string) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (draggedColumn && colKey !== draggedColumn) {
                setDragOverColumn(colKey);
            }
        },
        [draggedColumn],
    );

    const handleDragLeave = useCallback(() => {
        setDragOverColumn(null);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent, targetColKey: string) => {
            e.preventDefault();

            if (!draggedColumn || draggedColumn === targetColKey) {
                setDraggedColumn(null);
                setDragOverColumn(null);
                return;
            }

            // Calculate new order based on full columnOrder (not just visible)
            const newOrder = [...columnOrder];
            const draggedIndex = newOrder.indexOf(draggedColumn);
            const targetIndex = newOrder.indexOf(targetColKey);

            if (draggedIndex !== -1 && targetIndex !== -1) {
                // Remove dragged item
                newOrder.splice(draggedIndex, 1);
                // Insert at target position
                newOrder.splice(targetIndex, 0, draggedColumn);

                onColumnReorder(newOrder);
            }

            setDraggedColumn(null);
            setDragOverColumn(null);
        },
        [draggedColumn, columnOrder, onColumnReorder],
    );

    const handleDragEnd = useCallback(() => {
        setDraggedColumn(null);
        setDragOverColumn(null);
    }, []);

    // Inline editing handlers
    const handleStartEdit = (
        clientId: string,
        field: string,
        currentValue: string | number | null,
    ) => {
        setEditingCell({ clientId, field });
        setEditValue(currentValue?.toString() || '');
    };

    const handleCancelEdit = () => {
        setEditingCell(null);
        setEditValue('');
    };

    const handleSaveEdit = async (clientId: string, field: string) => {
        if (updating) return;

        const col = COLUMN_CONFIG[field];
        let valueToSave: string | number | null = editValue || null;

        if (col.editType === 'number' && editValue) {
            valueToSave = parseFloat(editValue);
        }

        const result = await updateClient(clientId, { [field]: valueToSave });
        if (result) {
            setEditingCell(null);
            setEditValue('');
            onClientUpdated?.();
        }
    };

    const handleKeyDown = (
        e: React.KeyboardEvent,
        clientId: string,
        field: string,
    ) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSaveEdit(clientId, field);
        } else if (e.key === 'Escape') {
            handleCancelEdit();
        }
    };

    const handleSelectChange = async (
        clientId: string,
        field: string,
        value: string,
        clientName?: string,
    ) => {
        if (updating) return;

        // Check if user is trying to terminate - show confirmation dialog
        if (field === 'status' && value === 'terminated') {
            setPendingTermination({
                clientId,
                clientName: clientName || 'this client',
            });
            setShowTerminationDialog(true);
            return;
        }

        const result = await updateClient(clientId, { [field]: value || null });
        if (result) {
            setEditingCell(null);
            setEditValue('');
            onClientUpdated?.();
        }
    };

    const handleConfirmTermination = async () => {
        if (!pendingTermination || updating) return;

        const result = await updateClient(pendingTermination.clientId, {
            status: 'terminated',
        });
        if (result) {
            setEditingCell(null);
            setEditValue('');
            onClientUpdated?.();
        }

        setShowTerminationDialog(false);
        setPendingTermination(null);
    };

    const handleCancelTermination = () => {
        setShowTerminationDialog(false);
        setPendingTermination(null);
        setEditingCell(null);
        setEditValue('');
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

    if (loading && clients.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!loading && clients.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <p>No clients found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
            </div>
        );
    }

    return (
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
                            const isDragging = draggedColumn === colKey;
                            const isDragOver = dragOverColumn === colKey;
                            const isFirstColumn = colIndex === 0;
                            return (
                                <th
                                    key={colKey}
                                    className={`group relative sticky top-0 h-12 bg-background px-4 text-left align-middle font-medium text-muted-foreground transition-all ${
                                        isDragging ? 'opacity-50' : ''
                                    } ${isDragOver ? 'border-l-2 border-primary bg-primary/10' : ''} ${
                                        isFirstColumn
                                            ? 'left-0 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]'
                                            : 'z-20'
                                    }`}
                                    style={{
                                        width: `${width}px`,
                                        minWidth: '20px',
                                    }}
                                    draggable
                                    onDragStart={(e) =>
                                        handleDragStart(e, colKey)
                                    }
                                    onDragOver={(e) =>
                                        handleDragOver(e, colKey)
                                    }
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, colKey)}
                                    onDragEnd={handleDragEnd}
                                >
                                    <div
                                        className={`flex items-start pr-3 ${col.sortable ? 'cursor-pointer select-none hover:text-foreground' : ''}`}
                                        onClick={() =>
                                            col.sortable && onSort(colKey)
                                        }
                                    >
                                        <GripVertical className="mt-0.5 mr-1 h-4 w-4 flex-shrink-0 cursor-grab opacity-30 group-hover:opacity-70" />
                                        <span
                                            style={{
                                                wordBreak: 'keep-all',
                                                overflowWrap: 'normal',
                                                whiteSpace: 'normal',
                                            }}
                                        >
                                            {col.label}
                                        </span>
                                        {col.sortable && (
                                            <SortIcon column={colKey} />
                                        )}
                                    </div>
                                    {/* Resize handle */}
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
                    </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                    {clients.map((client) => (
                        <tr
                            key={client.id}
                            className="border-b align-top transition-colors hover:bg-muted/50"
                        >
                            {visibleColumns.map((colKey, colIndex) => {
                                const col = COLUMN_CONFIG[colKey];
                                const isNameColumn = colKey === 'name';
                                const width = getColumnWidth(colKey);
                                const isEditable = col.editable !== false;
                                const isEditing =
                                    editingCell?.clientId === client.id &&
                                    editingCell?.field === colKey;
                                const isFirstColumn = colIndex === 0;

                                const stickyClasses = isFirstColumn
                                    ? 'sticky left-0 z-10 bg-background shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]'
                                    : '';

                                // Render editing cell
                                if (isEditing && isEditable) {
                                    if (
                                        col.editType === 'select' &&
                                        col.selectOptions
                                    ) {
                                        return (
                                            <td
                                                key={colKey}
                                                className={`p-1 align-middle ${stickyClasses}`}
                                                style={{
                                                    width: `${width}px`,
                                                    maxWidth: `${width}px`,
                                                }}
                                            >
                                                <Select
                                                    value={editValue}
                                                    onValueChange={(value) =>
                                                        handleSelectChange(
                                                            client.id,
                                                            colKey,
                                                            value,
                                                            client.name,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="h-8">
                                                        <SelectValue placeholder="Select..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {col.selectOptions.map(
                                                            (opt) => (
                                                                <SelectItem
                                                                    key={
                                                                        opt.value
                                                                    }
                                                                    value={
                                                                        opt.value
                                                                    }
                                                                >
                                                                    {opt.label}
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                        );
                                    }

                                    return (
                                        <td
                                            key={colKey}
                                            className={`p-1 align-middle ${stickyClasses}`}
                                            style={{
                                                width: `${width}px`,
                                                maxWidth: `${width}px`,
                                            }}
                                        >
                                            <div className="flex items-center gap-1">
                                                <Input
                                                    type={
                                                        col.editType === 'date'
                                                            ? 'date'
                                                            : col.editType ===
                                                                'number'
                                                              ? 'number'
                                                              : 'text'
                                                    }
                                                    value={editValue}
                                                    onChange={(e) =>
                                                        setEditValue(
                                                            e.target.value,
                                                        )
                                                    }
                                                    onKeyDown={(e) =>
                                                        handleKeyDown(
                                                            e,
                                                            client.id,
                                                            colKey,
                                                        )
                                                    }
                                                    onBlur={() =>
                                                        handleSaveEdit(
                                                            client.id,
                                                            colKey,
                                                        )
                                                    }
                                                    autoFocus
                                                    className="h-8 text-sm"
                                                    disabled={updating}
                                                />
                                                <button
                                                    onClick={() =>
                                                        handleSaveEdit(
                                                            client.id,
                                                            colKey,
                                                        )
                                                    }
                                                    className="rounded p-1 hover:bg-primary/10"
                                                    disabled={updating}
                                                >
                                                    <Check className="h-4 w-4 text-green-600" />
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="rounded p-1 hover:bg-destructive/10"
                                                >
                                                    <X className="h-4 w-4 text-destructive" />
                                                </button>
                                            </div>
                                        </td>
                                    );
                                }

                                // Payments column - special rendering with button
                                if (colKey === 'payments') {
                                    return (
                                        <td
                                            key={colKey}
                                            className={`p-2 align-middle ${stickyClasses}`}
                                            style={{
                                                width: `${width}px`,
                                                maxWidth: `${width}px`,
                                            }}
                                        >
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 px-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setPaymentsClient(client);
                                                }}
                                            >
                                                <CreditCard className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    );
                                }

                                // Regular cell (clickable to edit)
                                return (
                                    <td
                                        key={colKey}
                                        onClick={(e) => {
                                            if (isNameColumn) {
                                                onClientClick(client);
                                            } else if (isEditable) {
                                                e.stopPropagation();
                                                const currentValue =
                                                    client[
                                                        colKey as keyof Client
                                                    ];
                                                handleStartEdit(
                                                    client.id,
                                                    colKey,
                                                    currentValue as
                                                        | string
                                                        | number
                                                        | null,
                                                );
                                            }
                                        }}
                                        className={`p-4 align-middle align-top break-words ${
                                            isNameColumn
                                                ? 'cursor-pointer font-medium text-primary hover:underline'
                                                : ''
                                        } ${isEditable && !isNameColumn ? 'cursor-pointer hover:bg-muted/80' : ''} ${stickyClasses}`}
                                        style={{
                                            width: `${width}px`,
                                            maxWidth: `${width}px`,
                                            wordBreak: 'break-word',
                                        }}
                                    >
                                        {col.render
                                            ? col.render(client)
                                            : (client[
                                                  colKey as keyof Client
                                              ] as string) || <CenteredDash />}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Termination Confirmation Dialog */}
            <AlertDialog
                open={showTerminationDialog}
                onOpenChange={setShowTerminationDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Terminate Client?</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                            <p>
                                Are you sure you want to terminate{' '}
                                <strong>
                                    {pendingTermination?.clientName}
                                </strong>
                                ? This action will:
                            </p>
                            <ul className="list-inside list-disc space-y-1 text-sm">
                                <li>
                                    Cancel their active subscription in Square
                                </li>
                                <li>Stop all future automatic payments</li>
                                <li>
                                    Mark the client as terminated in the system
                                </li>
                            </ul>
                            <p className="font-medium text-destructive">
                                This will immediately stop payments from being
                                pulled from their bank or card.
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancelTermination}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmTermination}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={updating}
                        >
                            {updating
                                ? 'Terminating...'
                                : 'Yes, Terminate Client'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Client Payments Dialog */}
            {paymentsClient && (
                <ClientPaymentsDialog
                    isOpen={!!paymentsClient}
                    onClose={() => setPaymentsClient(null)}
                    clientId={paymentsClient.id}
                    clientName={paymentsClient.name}
                    clientEmail={paymentsClient.email}
                    squareCustomerId={paymentsClient.square_customer_id}
                />
            )}
        </div>
    );
}
