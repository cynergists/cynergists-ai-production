// Re-export from unified hook for backward compatibility
import { useViewPreferences, type ViewPreferences, type SavedView } from './useViewPreferences';

// Re-export types with legacy names for backward compatibility
export type ProspectViewPreferences = ViewPreferences;
export type { SavedView };

const DEFAULT_COLUMN_ORDER = [
  'name', 'email', 'phone', 'company', 'services', 'status',
  'sales_rep', 'partner_name', 'lead_source',
  'last_meeting', 'last_outreach', 'next_outreach', 'next_meeting',
  'est_closing_date', 'estimated_value', 'sdr_set', 'notes', 'tags'
];

export function useProspectViewPreferences() {
  return useViewPreferences({
    tableName: 'prospect_view_preferences',
    defaultColumnOrder: DEFAULT_COLUMN_ORDER,
    defaultSortColumn: 'name',
    defaultSortDirection: 'asc',
  });
}
