// Re-export from unified ViewSettings for backward compatibility
import { ViewSettings } from '@/components/admin/shared/ViewSettings';
import type { SavedView } from '@/hooks/useViewPreferences';

const COLUMN_LABELS: Record<string, string> = {
    name: 'Client Name',
    email: 'Email',
    phone: 'Phone',
    status: 'Status',
    payment_type: 'Payment Type',
    last_activity: 'Last Activity',
    last_contact: 'Last Contact',
    next_meeting: 'Next Meeting',
    last_payment_date: 'Last Payment',
    next_payment_due_date: 'Next Payment',
    payment_amount: 'Payment Amount',
    sales_rep: 'Sales Rep',
    partner_name: 'Partner',
    tags: 'Tags',
};

interface ClientsViewSettingsProps {
    columnOrder: string[];
    hiddenColumns: string[];
    savedViews: SavedView[];
    activeViewName: string | null;
    defaultViewName: string | null;
    onColumnOrderChange: (order: string[]) => void;
    onToggleColumn: (column: string) => void;
    onLoadView: (name: string) => void;
    onDeleteView: (name: string) => void;
    onSetDefaultView: (name: string | null) => void;
    onResetToDefault: () => void;
}

export function ClientsViewSettings(props: ClientsViewSettingsProps) {
    return <ViewSettings {...props} columnLabels={COLUMN_LABELS} />;
}
