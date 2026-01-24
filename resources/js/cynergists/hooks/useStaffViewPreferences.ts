import { useViewPreferences, type ViewPreferences, type SavedView } from './useViewPreferences';

export type StaffViewPreferences = ViewPreferences;
export type { SavedView };

const DEFAULT_COLUMN_ORDER = [
  'name', 'email', 'phone', 'status', 'staff_type', 'employment_type',
  'pay_type', 'pay_rate', 'commission_type', 'commission_rate',
  'start_date', 'end_date'
];

export function useStaffViewPreferences() {
  return useViewPreferences({
    tableName: 'staff_view_preferences',
    defaultColumnOrder: DEFAULT_COLUMN_ORDER,
    defaultSortColumn: 'name',
    defaultSortDirection: 'asc',
  });
}
