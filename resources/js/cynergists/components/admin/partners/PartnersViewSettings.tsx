// Re-export from unified ViewSettings for backward compatibility
import { ViewSettings } from '@/components/admin/shared/ViewSettings';
import type { SavedView } from '@/hooks/useViewPreferences';

const COLUMN_LABELS: Record<string, string> = {
    name: 'Name',
    email: 'Email',
    company_name: 'Company',
    phone: 'Phone',
    title: 'Title',
    status: 'Status',
    created_at: 'Joined',
};

interface PartnersViewSettingsProps {
    columnOrder: string[];
    hiddenColumns: string[];
    savedViews: SavedView[];
    activeViewName: string | null;
    defaultViewName?: string | null;
    onColumnOrderChange: (order: string[]) => void;
    onToggleColumn: (column: string) => void;
    onLoadView: (name: string) => void;
    onDeleteView: (name: string) => void;
    onSetDefaultView?: (name: string | null) => void;
    onResetToDefault: () => void;
}

export function PartnersViewSettings(props: PartnersViewSettingsProps) {
    return (
        <ViewSettings
            columnOrder={props.columnOrder}
            hiddenColumns={props.hiddenColumns}
            savedViews={props.savedViews}
            activeViewName={props.activeViewName}
            defaultViewName={props.defaultViewName ?? null}
            columnLabels={COLUMN_LABELS}
            onColumnOrderChange={props.onColumnOrderChange}
            onToggleColumn={props.onToggleColumn}
            onLoadView={props.onLoadView}
            onDeleteView={props.onDeleteView}
            onSetDefaultView={props.onSetDefaultView ?? (() => {})}
            onResetToDefault={props.onResetToDefault}
        />
    );
}
