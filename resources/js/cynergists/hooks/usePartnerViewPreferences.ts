// Re-export from unified hook for backward compatibility
import {
    useViewPreferences,
    type SavedView,
    type ViewPreferences,
} from './useViewPreferences';

// Re-export types with legacy names for backward compatibility
export type PartnerViewPreferences = ViewPreferences;
export type { SavedView };

const DEFAULT_COLUMN_ORDER = [
    'name',
    'email',
    'company_name',
    'phone',
    'status',
    'partnership_interest',
    'referral_volume',
    'created_at',
];

export function usePartnerViewPreferences() {
    return useViewPreferences({
        tableName: 'partner_view_preferences',
        defaultColumnOrder: DEFAULT_COLUMN_ORDER,
        defaultSortColumn: 'created_at',
        defaultSortDirection: 'desc',
    });
}
