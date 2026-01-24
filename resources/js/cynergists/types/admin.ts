/**
 * Shared types for admin entities
 * 
 * This file consolidates type definitions used across admin pages
 * to ensure consistency and reduce duplication.
 */

// Base contact fields shared across all entities
export interface BaseContact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  created_at: string;
  updated_at: string;
}

// Common audit fields for tracking changes
export interface AuditFields {
  name_updated_at?: string | null;
  name_updated_by?: string | null;
  email_updated_at?: string | null;
  email_updated_by?: string | null;
  phone_updated_at?: string | null;
  phone_updated_by?: string | null;
  company_updated_at?: string | null;
  company_updated_by?: string | null;
}

// GHL integration fields
export interface GHLFields {
  ghl_contact_id?: string | null;
  ghl_synced_at?: string | null;
}

// Square integration fields
export interface SquareFields {
  square_customer_id?: string | null;
  square_subscription_id?: string | null;
  square_plan_name?: string | null;
  square_synced_at?: string | null;
}

// View preferences for admin tables
export interface SavedView {
  name: string;
  columnOrder: string[];
  hiddenColumns: string[];
  activeFilters: Record<string, string>;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
}

export interface ViewPreferences {
  columnOrder: string[];
  hiddenColumns: string[];
  columnWidths: Record<string, number>;
  savedViews: SavedView[];
  activeViewName: string | null;
  defaultViewName: string | null;
  activeFilters: Record<string, string>;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  rowsPerPage: number;
}

// Column configuration for tables
export interface ColumnConfig {
  key: string;
  label: string;
  defaultVisible: boolean;
  sortable: boolean;
  width?: number;
  minWidth?: number;
}

// Generic table props
export interface AdminTableProps<T> {
  data: T[];
  loading: boolean;
  columnOrder: string[];
  hiddenColumns: string[];
  columnWidths: Record<string, number>;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  onSort: (column: string) => void;
  onRowClick: (item: T) => void;
  onColumnResize: (column: string, width: number) => void;
  onColumnReorder: (newOrder: string[]) => void;
  onItemUpdated?: () => void;
}

// Summary statistics for metrics displays
export interface MetricsSummary {
  total: number;
  thisMonth: number;
  lastMonth: number;
  growth: number;
}

// Filter configuration
export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  column: string;
  label: string;
  type: 'select' | 'date' | 'text';
  options?: FilterOption[];
}
