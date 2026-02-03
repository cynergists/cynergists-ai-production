import {
    useViewPreferences,
    type SavedView,
    type ViewPreferences,
} from './useViewPreferences';

export type SalesRepViewPreferences = ViewPreferences;
export type { SavedView };

const DEFAULT_COLUMN_ORDER = [
    'name',
    'email',
    'phone',
    'status',
    'commission_rate',
    'total_sales',
    'total_commission',
    'created_at',
];

export function useSalesRepViewPreferences() {
    return useViewPreferences({
        tableName: 'sales_rep_view_preferences',
        defaultColumnOrder: DEFAULT_COLUMN_ORDER,
        defaultSortColumn: 'name',
        defaultSortDirection: 'asc',
    });
}
