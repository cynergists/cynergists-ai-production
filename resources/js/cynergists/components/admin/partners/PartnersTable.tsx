import { CenteredDash } from '@/components/admin/CenteredDash';
import { Badge } from '@/components/ui/badge';
import type { Partner } from '@/hooks/usePartnersList';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowDown, ArrowUp, ArrowUpDown, Loader2 } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

interface ColumnConfig {
    key: string;
    label: string;
    sortable: boolean;
    minWidth?: number;
    defaultWidth?: number;
    centered?: boolean;
    render?: (partner: Partner) => React.ReactNode;
}

// Status options for partner status
const STATUS_OPTIONS = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'terminated', label: 'Terminated' },
];

// Column configuration matching exact spec order
const COLUMN_CONFIG: Record<string, ColumnConfig> = {
    name: {
        key: 'name',
        label: 'Partner Name',
        sortable: true,
        minWidth: 150,
        defaultWidth: 200,
        render: (partner) => {
            const name = `${partner.first_name} ${partner.last_name}`.trim();
            return name || partner.email;
        },
    },
    company_name: {
        key: 'company_name',
        label: 'Company',
        sortable: true,
        minWidth: 120,
        defaultWidth: 160,
        render: (partner) => partner.company_name || 'Individual',
    },
    partner_status: {
        key: 'partner_status',
        label: 'Partner Status',
        sortable: true,
        minWidth: 100,
        defaultWidth: 130,
        centered: true,
        render: (partner) => {
            const status = partner.partner_status || 'active';
            const getStatusClasses = (s: string) => {
                switch (s) {
                    case 'active':
                        return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
                    case 'inactive':
                        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
                    case 'terminated':
                        return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
                    default:
                        return 'bg-muted text-muted-foreground border-border';
                }
            };
            const labelMap: Record<string, string> = {
                active: 'Active',
                inactive: 'Inactive',
                terminated: 'Terminated',
            };
            return (
                <Badge variant="outline" className={getStatusClasses(status)}>
                    {labelMap[status] || status}
                </Badge>
            );
        },
    },
    referrals_given: {
        key: 'referrals_given',
        label: 'Referrals Given',
        sortable: true,
        minWidth: 100,
        defaultWidth: 130,
        centered: true,
        render: (partner) => partner.referrals_given || 0,
    },
    last_referral_date: {
        key: 'last_referral_date',
        label: 'Last Referral Date',
        sortable: true,
        minWidth: 120,
        defaultWidth: 140,
        centered: true,
        render: (partner) =>
            partner.last_referral_date
                ? formatDate(partner.last_referral_date)
                : 'Never',
    },
    revenue_generated: {
        key: 'revenue_generated',
        label: 'Revenue Generated',
        sortable: true,
        minWidth: 120,
        defaultWidth: 150,
        centered: true,
        render: (partner) => formatCurrency(partner.revenue_generated || 0),
    },
    total_commissions_earned: {
        key: 'total_commissions_earned',
        label: 'Total Commissions',
        sortable: true,
        minWidth: 120,
        defaultWidth: 150,
        centered: true,
        render: (partner) =>
            formatCurrency(partner.total_commissions_earned || 0),
    },
    outstanding_commission_balance: {
        key: 'outstanding_commission_balance',
        label: 'Outstanding Balance',
        sortable: true,
        minWidth: 130,
        defaultWidth: 160,
        centered: true,
        render: (partner) => {
            const balance = partner.outstanding_commission_balance || 0;
            if (balance > 0) {
                return (
                    <span className="font-medium text-amber-600 dark:text-amber-400">
                        {formatCurrency(balance)}
                    </span>
                );
            }
            return formatCurrency(0);
        },
    },
    internal_owner: {
        key: 'internal_owner',
        label: 'Internal Owner',
        sortable: false,
        minWidth: 140,
        defaultWidth: 180,
        render: (partner) => {
            if (partner.internal_owner) {
                const ownerName = [
                    partner.internal_owner.first_name,
                    partner.internal_owner.last_name,
                ]
                    .filter(Boolean)
                    .join(' ');
                return ownerName || partner.internal_owner.email;
            }
            return <CenteredDash />;
        },
    },
    next_follow_up_date: {
        key: 'next_follow_up_date',
        label: 'Next Follow-Up Date',
        sortable: true,
        minWidth: 120,
        defaultWidth: 150,
        centered: true,
        render: (partner) =>
            partner.next_follow_up_date ? (
                formatDate(partner.next_follow_up_date)
            ) : (
                <CenteredDash />
            ),
    },
};

// Default column order matching spec exactly
const DEFAULT_COLUMN_ORDER = [
    'name',
    'company_name',
    'partner_status',
    'referrals_given',
    'last_referral_date',
    'revenue_generated',
    'total_commissions_earned',
    'outstanding_commission_balance',
    'internal_owner',
    'next_follow_up_date',
];

interface PartnersTableProps {
    partners: Partner[];
    loading: boolean;
    sortColumn: string;
    sortDirection: 'asc' | 'desc';
    onSort: (column: string) => void;
    onPartnerClick: (partner: Partner) => void;
}

export function PartnersTable({
    partners,
    loading,
    sortColumn,
    sortDirection,
    onSort,
    onPartnerClick,
}: PartnersTableProps) {
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

    if (loading && partners.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!loading && partners.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <p>No partners found</p>
                <p className="text-sm">
                    Add partners to start tracking referrals and commissions
                </p>
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
                    </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                    {partners.map((partner) => (
                        <tr
                            key={partner.id}
                            className="border-b align-top transition-colors hover:bg-muted/50"
                        >
                            {visibleColumns.map((colKey, colIndex) => {
                                const col = COLUMN_CONFIG[colKey];
                                const isNameColumn = colKey === 'name';
                                const width = getColumnWidth(colKey);
                                const isFirstColumn = colIndex === 0;

                                const stickyClasses = isFirstColumn
                                    ? 'sticky left-0 z-10 bg-background shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]'
                                    : '';

                                return (
                                    <td
                                        key={colKey}
                                        className={`p-4 align-middle ${col.centered ? 'text-center' : ''} ${
                                            isNameColumn
                                                ? 'cursor-pointer font-medium text-lime-400 hover:text-lime-300'
                                                : ''
                                        } ${stickyClasses}`}
                                        style={{
                                            width: `${width}px`,
                                            maxWidth: `${width}px`,
                                        }}
                                        onClick={
                                            isNameColumn
                                                ? () => onPartnerClick(partner)
                                                : undefined
                                        }
                                    >
                                        <div className="truncate">
                                            {col.render
                                                ? col.render(partner)
                                                : String(
                                                      partner[
                                                          colKey as keyof Partner
                                                      ] ?? '—',
                                                  )}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
