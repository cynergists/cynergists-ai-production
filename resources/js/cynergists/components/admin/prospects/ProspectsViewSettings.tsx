// Re-export from unified ViewSettings for backward compatibility
import { ViewSettings } from "@/components/admin/shared/ViewSettings";
import type { SavedView } from "@/hooks/useViewPreferences";

const COLUMN_LABELS: Record<string, string> = {
  name: "Prospect Name",
  email: "Email",
  phone: "Phone",
  company: "Company",
  services: "Services",
  status: "Status",
  interested_plan: "Interested Plan",
  estimated_value: "Est. Value",
  lead_source: "Lead Source",
  last_activity: "Last Activity",
  last_contact: "Last Contact",
  last_meeting: "Last Meeting",
  last_outreach: "Last Outreach",
  next_outreach: "Next Outreach",
  next_meeting: "Next Meeting",
  est_closing_date: "Est. Closing",
  sdr_set: "SDR Set",
  sales_rep: "Sales",
  partner_name: "Partner",
  tags: "Tags",
  notes: "Notes",
};

interface ProspectsViewSettingsProps {
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

export function ProspectsViewSettings(props: ProspectsViewSettingsProps) {
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
