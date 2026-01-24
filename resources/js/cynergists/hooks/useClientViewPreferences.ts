// Re-export from unified hook for backward compatibility
import { useViewPreferences, type ViewPreferences, type SavedView } from './useViewPreferences';

// Re-export types with legacy names for backward compatibility
export type ClientViewPreferences = ViewPreferences;
export type { SavedView };

const DEFAULT_COLUMN_ORDER = [
  'name', 'email', 'phone', 'status', 'payments', 'payment_type', 
  'last_payment_date', 'next_payment_due_date', 'payment_amount',
  'sales_rep', 'partner_name', 'tags'
];

export function useClientViewPreferences() {
  return useViewPreferences({
    tableName: 'client_view_preferences',
    defaultColumnOrder: DEFAULT_COLUMN_ORDER,
    defaultSortColumn: 'name',
    defaultSortDirection: 'asc',
  });
}
