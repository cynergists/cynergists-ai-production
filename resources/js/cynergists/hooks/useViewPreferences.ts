import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

export interface SavedView {
  name: string;
  columnOrder: string[];
  hiddenColumns: string[];
  columnWidths: Record<string, number>;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  activeFilters: Record<string, string>;
  rowsPerPage: number;
}

export interface ViewPreferences {
  columnOrder: string[];
  hiddenColumns: string[];
  columnWidths: Record<string, number>;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  activeFilters: Record<string, string>;
  rowsPerPage: number;
  savedViews: SavedView[];
  activeViewName: string | null;
  defaultViewName: string | null;
}

export type ViewPreferencesTable = 'client_view_preferences' | 'prospect_view_preferences' | 'partner_view_preferences' | 'staff_view_preferences' | 'sales_rep_view_preferences';

interface UseViewPreferencesConfig {
  tableName: ViewPreferencesTable;
  defaultColumnOrder: string[];
  defaultSortColumn?: string;
  defaultSortDirection?: 'asc' | 'desc';
}

function createDefaultPreferences(config: UseViewPreferencesConfig): ViewPreferences {
  return {
    columnOrder: config.defaultColumnOrder,
    hiddenColumns: [],
    columnWidths: {},
    sortColumn: config.defaultSortColumn || 'name',
    sortDirection: config.defaultSortDirection || 'asc',
    activeFilters: {},
    rowsPerPage: 50,
    savedViews: [],
    activeViewName: null,
    defaultViewName: null,
  };
}

export function useViewPreferences(config: UseViewPreferencesConfig) {
  const defaultPrefs = createDefaultPreferences(config);
  const [preferences, setPreferences] = useState<ViewPreferences>(defaultPrefs);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const loadPreferences = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from(config.tableName)
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading preferences:', error);
        return;
      }

      if (data) {
        const savedViews = (data.saved_views as unknown as SavedView[]) || [];
        const defaultViewName = (data as Record<string, unknown>).default_view_name as string | null;
        const defaultView = defaultViewName ? savedViews.find(v => v.name === defaultViewName) : null;
        
        if (defaultView) {
          setPreferences({
            columnOrder: defaultView.columnOrder,
            hiddenColumns: defaultView.hiddenColumns,
            columnWidths: defaultView.columnWidths,
            sortColumn: defaultView.sortColumn,
            sortDirection: defaultView.sortDirection,
            activeFilters: defaultView.activeFilters,
            rowsPerPage: data.rows_per_page || 50,
            savedViews,
            activeViewName: defaultViewName,
            defaultViewName,
          });
        } else {
          setPreferences({
            columnOrder: data.column_order || config.defaultColumnOrder,
            hiddenColumns: data.hidden_columns || [],
            columnWidths: (data.column_widths as Record<string, number>) || {},
            sortColumn: data.sort_column || config.defaultSortColumn || 'name',
            sortDirection: (data.sort_direction as 'asc' | 'desc') || config.defaultSortDirection || 'asc',
            activeFilters: (data.active_filters as Record<string, string>) || {},
            rowsPerPage: data.rows_per_page || 50,
            savedViews,
            activeViewName: data.active_view_name || null,
            defaultViewName,
          });
        }
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
    } finally {
      setLoading(false);
    }
  }, [config.tableName, config.defaultColumnOrder, config.defaultSortColumn, config.defaultSortDirection]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const savePreferences = useCallback(async (newPrefs: Partial<ViewPreferences>) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updatedPrefs = { ...preferences, ...newPrefs };
      setPreferences(updatedPrefs);

      const { data: existing } = await supabase
        .from(config.tableName)
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      const prefsData = {
        column_order: updatedPrefs.columnOrder,
        hidden_columns: updatedPrefs.hiddenColumns,
        column_widths: updatedPrefs.columnWidths as Json,
        sort_column: updatedPrefs.sortColumn,
        sort_direction: updatedPrefs.sortDirection,
        active_filters: updatedPrefs.activeFilters as Json,
        rows_per_page: updatedPrefs.rowsPerPage,
        saved_views: updatedPrefs.savedViews as unknown as Json,
        active_view_name: updatedPrefs.activeViewName,
        default_view_name: updatedPrefs.defaultViewName,
      };

      let error;
      if (existing) {
        const result = await supabase
          .from(config.tableName)
          .update(prefsData)
          .eq('user_id', user.id);
        error = result.error;
      } else {
        const result = await supabase
          .from(config.tableName)
          .insert([{ user_id: user.id, ...prefsData }]);
        error = result.error;
      }

      if (error) {
        console.error('Error saving preferences:', error);
        toast({
          title: 'Error',
          description: 'Failed to save view preferences',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Error saving preferences:', err);
    } finally {
      setSaving(false);
    }
  }, [preferences, toast, config.tableName]);

  const setColumnOrder = useCallback((order: string[]) => {
    savePreferences({ columnOrder: order });
  }, [savePreferences]);

  const toggleColumnVisibility = useCallback((column: string) => {
    const newHidden = preferences.hiddenColumns.includes(column)
      ? preferences.hiddenColumns.filter(c => c !== column)
      : [...preferences.hiddenColumns, column];
    savePreferences({ hiddenColumns: newHidden });
  }, [preferences.hiddenColumns, savePreferences]);

  const setColumnWidth = useCallback((column: string, width: number) => {
    savePreferences({ columnWidths: { ...preferences.columnWidths, [column]: width } });
  }, [preferences.columnWidths, savePreferences]);

  const setSort = useCallback((column: string, direction: 'asc' | 'desc') => {
    savePreferences({ sortColumn: column, sortDirection: direction });
  }, [savePreferences]);

  const setFilter = useCallback((column: string, value: string) => {
    const newFilters = { ...preferences.activeFilters };
    if (value) {
      newFilters[column] = value;
    } else {
      delete newFilters[column];
    }
    savePreferences({ activeFilters: newFilters });
  }, [preferences.activeFilters, savePreferences]);

  const clearFilters = useCallback(() => {
    savePreferences({ activeFilters: {} });
  }, [savePreferences]);

  const setRowsPerPage = useCallback((rows: number) => {
    savePreferences({ rowsPerPage: rows });
  }, [savePreferences]);

  const saveView = useCallback((name: string, allowOverwrite: boolean = false): boolean => {
    const existingIndex = preferences.savedViews.findIndex(v => v.name === name);
    
    if (existingIndex >= 0 && !allowOverwrite) {
      toast({ 
        title: 'Name already exists', 
        description: `A view named "${name}" already exists. Please choose a different name.`,
        variant: 'destructive',
      });
      return false;
    }
    
    if (existingIndex < 0 && preferences.savedViews.length >= 3) {
      toast({ 
        title: 'View limit reached', 
        description: 'You can save up to 3 views. Please delete an existing view first.',
        variant: 'destructive',
      });
      return false;
    }

    const newView: SavedView = {
      name,
      columnOrder: preferences.columnOrder,
      hiddenColumns: preferences.hiddenColumns,
      columnWidths: preferences.columnWidths,
      sortColumn: preferences.sortColumn,
      sortDirection: preferences.sortDirection,
      activeFilters: preferences.activeFilters,
      rowsPerPage: preferences.rowsPerPage,
    };
    
    const newViews = existingIndex >= 0
      ? preferences.savedViews.map((v, i) => i === existingIndex ? newView : v)
      : [...preferences.savedViews, newView];
    savePreferences({ savedViews: newViews, activeViewName: name });
    toast({ title: 'View saved', description: `"${name}" has been saved` });
    return true;
  }, [preferences, savePreferences, toast]);

  const loadView = useCallback((name: string) => {
    const view = preferences.savedViews.find(v => v.name === name);
    if (view) {
      savePreferences({
        columnOrder: view.columnOrder,
        hiddenColumns: view.hiddenColumns,
        columnWidths: view.columnWidths,
        sortColumn: view.sortColumn,
        sortDirection: view.sortDirection,
        activeFilters: view.activeFilters,
        rowsPerPage: view.rowsPerPage ?? preferences.rowsPerPage,
        activeViewName: name,
      });
    }
  }, [preferences.savedViews, preferences.rowsPerPage, savePreferences]);

  const deleteView = useCallback((name: string) => {
    const newViews = preferences.savedViews.filter(v => v.name !== name);
    const newActiveView = preferences.activeViewName === name ? null : preferences.activeViewName;
    const newDefaultView = preferences.defaultViewName === name ? null : preferences.defaultViewName;
    savePreferences({ savedViews: newViews, activeViewName: newActiveView, defaultViewName: newDefaultView });
    toast({ title: 'View deleted', description: `"${name}" has been deleted` });
  }, [preferences.savedViews, preferences.activeViewName, preferences.defaultViewName, savePreferences, toast]);

  const setDefaultView = useCallback((name: string | null) => {
    savePreferences({ defaultViewName: name });
    if (name) {
      toast({ title: 'Default view set', description: `"${name}" will load automatically` });
    } else {
      toast({ title: 'Default view cleared', description: 'No view will load automatically' });
    }
  }, [savePreferences, toast]);

  const resetToDefault = useCallback(() => {
    savePreferences(defaultPrefs);
    toast({ title: 'Reset complete', description: 'View reset to default settings' });
  }, [savePreferences, toast, defaultPrefs]);

  return {
    preferences,
    loading,
    saving,
    setColumnOrder,
    toggleColumnVisibility,
    setColumnWidth,
    setSort,
    setFilter,
    clearFilters,
    setRowsPerPage,
    saveView,
    loadView,
    deleteView,
    setDefaultView,
    resetToDefault,
  };
}
