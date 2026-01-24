import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import { apiClient } from '@/lib/api-client';

const DEFAULT_COLUMN_ORDER = [
  'calendar_name',
  'site_location',
  'participants',
  'calendar_type',
  'status',
  'public_url',
  'actions',
];

const DEFAULT_COLUMN_WIDTHS: Record<string, number> = {
  calendar_name: 200,
  site_location: 150,
  participants: 150,
  calendar_type: 130,
  status: 120,
  public_url: 180,
  actions: 120,
};

interface CalendarViewPreferences {
  column_widths: Record<string, number>;
  column_order: string[];
  hidden_columns: string[];
}

export function useCalendarViewPreferences() {
  const queryClient = useQueryClient();
  const [localColumnWidths, setLocalColumnWidths] = useState<Record<string, number>>(DEFAULT_COLUMN_WIDTHS);
  const debouncedColumnWidths = useDebounce(localColumnWidths, 500);

  // Fetch preferences from database
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['calendar-view-preferences'],
    queryFn: async () => {
      return apiClient.get<Record<string, unknown> | null>(
        '/api/view-preferences/calendar_view_preferences',
      );
    },
  });

  // Initialize local state from database
  useEffect(() => {
    if (preferences?.column_widths) {
      const widths = preferences.column_widths as Record<string, number>;
      setLocalColumnWidths({ ...DEFAULT_COLUMN_WIDTHS, ...widths });
    }
  }, [preferences]);

  // Mutation to save preferences
  const saveMutation = useMutation({
    mutationFn: async (updates: Partial<CalendarViewPreferences>) => {
      await apiClient.post('/api/view-preferences/calendar_view_preferences', {
        column_widths: updates.column_widths,
        column_order: updates.column_order || DEFAULT_COLUMN_ORDER,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-view-preferences'] });
    },
  });

  // Save column widths when debounced value changes
  useEffect(() => {
    if (!isLoading && debouncedColumnWidths !== DEFAULT_COLUMN_WIDTHS) {
      saveMutation.mutate({ column_widths: debouncedColumnWidths });
    }
  }, [debouncedColumnWidths, isLoading]);

  const setColumnWidth = useCallback((colKey: string, width: number) => {
    setLocalColumnWidths(prev => ({ ...prev, [colKey]: width }));
  }, []);

  const columnOrder = preferences?.column_order || DEFAULT_COLUMN_ORDER;
  const hiddenColumns = preferences?.hidden_columns || [];

  return {
    columnOrder,
    hiddenColumns,
    visibleColumns: columnOrder.filter((col: string) => !hiddenColumns.includes(col)),
    columnWidths: localColumnWidths,
    setColumnWidth,
    isLoading,
  };
}
