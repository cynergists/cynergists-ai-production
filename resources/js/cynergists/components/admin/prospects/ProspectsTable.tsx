import { useRef, useCallback, useState, useEffect } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Loader2, GripVertical, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import type { Prospect } from "@/hooks/useProspectsList";
import { formatPhoneForDisplay } from "@/components/ui/phone-input";
import { useUpdateProspect } from "@/hooks/useUpdateProspect";
import { CenteredDash } from "@/components/admin/CenteredDash";

type EditType = "text" | "email" | "tel" | "date" | "number" | "select" | "toggle" | "textarea";

interface ColumnConfig {
  key: string;
  label: string;
  sortable: boolean;
  minWidth?: number;
  defaultWidth?: number;
  centered?: boolean;
  editable?: boolean;
  editType?: EditType;
  selectOptions?: { value: string; label: string }[];
  render?: (prospect: Prospect) => React.ReactNode;
  headerExtra?: React.ReactNode;
}

const STATUS_OPTIONS = [
  { value: "website_form", label: "Website Form" },
  { value: "cold", label: "Aware" },
  { value: "warm", label: "Interested" },
  { value: "hot", label: "Committed" },
];

const COLUMN_CONFIG: Record<string, ColumnConfig> = {
  name: {
    key: "name",
    label: "Name",
    sortable: true,
    minWidth: 120,
    defaultWidth: 180,
    editable: true,
    editType: "text",
  },
  email: {
    key: "email",
    label: "Email",
    sortable: true,
    minWidth: 150,
    defaultWidth: 220,
    editable: true,
    editType: "email",
  },
  phone: {
    key: "phone",
    label: "Phone",
    sortable: true,
    minWidth: 150,
    defaultWidth: 180,
    centered: true,
    editable: true,
    editType: "tel",
    render: (prospect) => formatPhoneForDisplay(prospect.phone) || <CenteredDash />,
  },
  company: {
    key: "company",
    label: "Company",
    sortable: true,
    minWidth: 120,
    defaultWidth: 150,
    editable: true,
    editType: "text",
    render: (prospect) => prospect.company || <CenteredDash />,
  },
  services: {
    key: "services",
    label: "Services",
    sortable: true,
    minWidth: 120,
    defaultWidth: 150,
    centered: true,
    editable: true,
    editType: "text",
    render: (prospect) => prospect.services || <CenteredDash />,
  },
  status: {
    key: "status",
    label: "Status",
    sortable: true,
    minWidth: 80,
    defaultWidth: 120,
    centered: true,
    editable: true,
    editType: "select",
    selectOptions: STATUS_OPTIONS,
    render: (prospect) => {
      const status = prospect.status || "cold";
      const labelMap: Record<string, string> = {
        website_form: "Website Form",
        cold: "Aware",
        warm: "Interested",
        hot: "Committed"
      };
      
      // Color-coded status badges
      const getStatusClasses = (s: string) => {
        switch (s) {
          case "hot":
            return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
          case "warm":
            return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
          case "cold":
            return "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800";
          default:
            return "bg-muted text-muted-foreground border-border";
        }
      };
      
      return (
        <Badge variant="outline" className={getStatusClasses(status)}>
          {labelMap[status] || status}
        </Badge>
      );
    },
  },
  sales_rep: {
    key: "sales_rep",
    label: "Sales",
    sortable: true,
    minWidth: 100,
    defaultWidth: 130,
    editable: true,
    editType: "text",
    render: (prospect) => prospect.sales_rep || <CenteredDash />,
  },
  partner_name: {
    key: "partner_name",
    label: "Partner",
    sortable: true,
    minWidth: 100,
    defaultWidth: 130,
    editable: true,
    editType: "text",
    render: (prospect) => prospect.partner_name || <CenteredDash />,
  },
  tags: {
    key: "tags",
    label: "Tags",
    sortable: false,
    minWidth: 120,
    defaultWidth: 180,
    editable: false, // Tags need special handling
    render: (prospect) => {
      if (!prospect.tags || prospect.tags.length === 0) return <CenteredDash />;
      return (
        <div className="flex gap-1 flex-wrap">
          {prospect.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {prospect.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{prospect.tags.length - 3}
            </Badge>
          )}
        </div>
      );
    },
  },
  lead_source: {
    key: "lead_source",
    label: "Source",
    sortable: true,
    minWidth: 100,
    defaultWidth: 130,
    editable: true,
    editType: "text",
    render: (prospect) => prospect.lead_source || <CenteredDash />,
  },
  interested_plan: {
    key: "interested_plan",
    label: "Interested Plan",
    sortable: true,
    minWidth: 100,
    defaultWidth: 150,
    editable: true,
    editType: "text",
    render: (prospect) => prospect.interested_plan || <CenteredDash />,
  },
  last_meeting: {
    key: "last_meeting",
    label: "Last Meeting",
    sortable: true,
    minWidth: 100,
    defaultWidth: 130,
    centered: true,
    editable: true,
    editType: "date",
    render: (prospect) => prospect.last_meeting 
      ? formatDate(prospect.last_meeting)
      : <CenteredDash />,
  },
  last_outreach: {
    key: "last_outreach",
    label: "Last Outreach",
    sortable: true,
    minWidth: 100,
    defaultWidth: 130,
    centered: true,
    editable: true,
    editType: "date",
    render: (prospect) => prospect.last_outreach 
      ? formatDate(prospect.last_outreach)
      : <CenteredDash />,
  },
  next_outreach: {
    key: "next_outreach",
    label: "Next Outreach",
    sortable: true,
    minWidth: 100,
    defaultWidth: 130,
    editable: true,
    editType: "date",
    render: (prospect) => prospect.next_outreach 
      ? formatDate(prospect.next_outreach)
      : <CenteredDash />,
  },
  next_meeting: {
    key: "next_meeting",
    label: "Next Meeting",
    sortable: true,
    minWidth: 100,
    defaultWidth: 130,
    centered: true,
    editable: true,
    editType: "date",
    render: (prospect) => prospect.next_meeting 
      ? formatDate(prospect.next_meeting)
      : <CenteredDash />,
  },
  est_closing_date: {
    key: "est_closing_date",
    label: "Est Closing",
    sortable: true,
    minWidth: 100,
    defaultWidth: 130,
    centered: true,
    editable: true,
    editType: "date",
    render: (prospect) => prospect.est_closing_date 
      ? formatDate(prospect.est_closing_date)
      : <CenteredDash />,
  },
  estimated_value: {
    key: "estimated_value",
    label: "Est Amount",
    sortable: true,
    minWidth: 100,
    defaultWidth: 130,
    centered: true,
    editable: true,
    editType: "number",
    render: (prospect) => prospect.estimated_value 
      ? `$${prospect.estimated_value.toLocaleString()}`
      : <CenteredDash />,
  },
  sdr_set: {
    key: "sdr_set",
    label: "SDR Set",
    sortable: true,
    minWidth: 80,
    defaultWidth: 100,
    centered: true,
    editable: true,
    editType: "toggle",
  },
  notes: {
    key: "notes",
    label: "Notes",
    sortable: false,
    minWidth: 150,
    defaultWidth: 200,
    editable: true,
    editType: "textarea",
    render: (prospect) => prospect.notes 
      ? <span className="line-clamp-2 text-xs">{prospect.notes}</span>
      : <CenteredDash />,
  },
};

interface ProspectsTableProps {
  prospects: Prospect[];
  loading: boolean;
  columnOrder: string[];
  hiddenColumns: string[];
  columnWidths: Record<string, number>;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
  onProspectClick: (prospect: Prospect) => void;
  onColumnResize: (column: string, width: number) => void;
  onColumnReorder: (newOrder: string[]) => void;
  onProspectUpdated?: () => void;
}

export function ProspectsTable({
  prospects,
  loading,
  columnOrder,
  hiddenColumns,
  columnWidths,
  sortColumn,
  sortDirection,
  onSort,
  onProspectClick,
  onColumnResize,
  onColumnReorder,
  onProspectUpdated,
}: ProspectsTableProps) {
  const visibleColumns = columnOrder.filter(
    (col) => !hiddenColumns.includes(col) && COLUMN_CONFIG[col]
  );

  const [resizing, setResizing] = useState<string | null>(null);
  const [localWidths, setLocalWidths] = useState<Record<string, number>>({});
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Inline editing state
  const [editingCell, setEditingCell] = useState<{ prospectId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const { updateProspect, updating } = useUpdateProspect();
  
  // Optimistic local state for toggles and selects to prevent page jumping
  const [localOverrides, setLocalOverrides] = useState<Record<string, Record<string, unknown>>>({});
  
  // Reset local overrides when prospects data changes (e.g., after navigation/filter change)
  useEffect(() => {
    setLocalOverrides({});
  }, [prospects]);
  
  // Helper to get the display value (local override or original)
  const getProspectValue = (prospect: Prospect, field: string) => {
    if (localOverrides[prospect.id]?.[field] !== undefined) {
      return localOverrides[prospect.id][field];
    }
    return prospect[field as keyof Prospect];
  };

  const getColumnWidth = (colKey: string) => {
    if (localWidths[colKey] !== undefined) {
      return localWidths[colKey];
    }
    return columnWidths[colKey] || COLUMN_CONFIG[colKey]?.defaultWidth || 150;
  };

  const handleResizeStart = useCallback((e: React.MouseEvent, colKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(colKey);
    startXRef.current = e.clientX;
    startWidthRef.current = columnWidths[colKey] || COLUMN_CONFIG[colKey]?.defaultWidth || 150;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startXRef.current;
      const newWidth = Math.max(20, startWidthRef.current + delta);
      setLocalWidths(prev => ({ ...prev, [colKey]: newWidth }));
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      const delta = upEvent.clientX - startXRef.current;
      const finalWidth = Math.max(20, startWidthRef.current + delta);
      
      onColumnResize(colKey, finalWidth);
      
      setLocalWidths(prev => {
        const next = { ...prev };
        delete next[colKey];
        return next;
      });
      setResizing(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [columnWidths, onColumnResize]);

  const handleDragStart = useCallback((e: React.DragEvent, colKey: string) => {
    setDraggedColumn(colKey);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', colKey);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, colKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedColumn && colKey !== draggedColumn) {
      setDragOverColumn(colKey);
    }
  }, [draggedColumn]);

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetColKey: string) => {
    e.preventDefault();
    
    if (!draggedColumn || draggedColumn === targetColKey) {
      setDraggedColumn(null);
      setDragOverColumn(null);
      return;
    }

    const newOrder = [...columnOrder];
    const draggedIndex = newOrder.indexOf(draggedColumn);
    const targetIndex = newOrder.indexOf(targetColKey);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedColumn);
      
      onColumnReorder(newOrder);
    }

    setDraggedColumn(null);
    setDragOverColumn(null);
  }, [draggedColumn, columnOrder, onColumnReorder]);

  const handleDragEnd = useCallback(() => {
    setDraggedColumn(null);
    setDragOverColumn(null);
  }, []);

  // Inline editing handlers
  const handleStartEdit = (prospectId: string, field: string, currentValue: string | number | null) => {
    const col = COLUMN_CONFIG[field];
    if (col?.editType === "date" && currentValue) {
      // Convert datetime to date-only format for date inputs
      const dateVal = new Date(currentValue as string);
      setEditValue(dateVal.toISOString().split('T')[0]);
    } else {
      setEditValue(currentValue?.toString() || "");
    }
    setEditingCell({ prospectId, field });
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const handleSaveEdit = async (prospectId: string, field: string) => {
    if (updating) return;
    
    const col = COLUMN_CONFIG[field];
    let valueToSave: string | number | null = editValue || null;
    
    // Convert number fields
    if (col?.editType === "number" && editValue) {
      valueToSave = parseFloat(editValue);
    }
    
    const result = await updateProspect(prospectId, { [field]: valueToSave });
    if (result) {
      setEditingCell(null);
      setEditValue("");
      onProspectUpdated?.();
    }
  };

  const handleToggleChange = async (prospectId: string, field: string, newValue: boolean) => {
    // Optimistically update local state immediately
    setLocalOverrides(prev => ({
      ...prev,
      [prospectId]: { ...prev[prospectId], [field]: newValue }
    }));
    // Update in background - don't refetch to avoid page jump
    await updateProspect(prospectId, { [field]: newValue });
  };

  const handleSelectChange = async (prospectId: string, field: string, newValue: string) => {
    // Optimistically update local state immediately
    setLocalOverrides(prev => ({
      ...prev,
      [prospectId]: { ...prev[prospectId], [field]: newValue }
    }));
    // Update in background - don't refetch to avoid page jump
    await updateProspect(prospectId, { [field]: newValue || null });
  };

  const handleKeyDown = (e: React.KeyboardEvent, prospectId: string, field: string) => {
    if (e.key === "Enter" && COLUMN_CONFIG[field]?.editType !== "textarea") {
      e.preventDefault();
      handleSaveEdit(prospectId, field);
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50 flex-shrink-0" />;
    }
    return sortDirection === "asc" 
      ? <ArrowUp className="h-4 w-4 ml-1 flex-shrink-0" />
      : <ArrowDown className="h-4 w-4 ml-1 flex-shrink-0" />;
  };

  if (loading && prospects.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!loading && prospects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>No prospects found</p>
        <p className="text-sm">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
      <table style={{ tableLayout: 'fixed', width: 'max-content', minWidth: '100%' }} className="w-full caption-bottom text-sm">
        <thead className="[&_tr]:border-b">
          <tr className="border-b transition-colors bg-background">
            {visibleColumns.map((colKey, colIndex) => {
              const col = COLUMN_CONFIG[colKey];
              const width = getColumnWidth(colKey);
              const isDragging = draggedColumn === colKey;
              const isDragOver = dragOverColumn === colKey;
              const isFirstColumn = colIndex === 0;
              return (
                <th
                  key={colKey}
                  className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-background relative group transition-all sticky top-0 ${
                    isDragging ? 'opacity-50' : ''
                  } ${isDragOver ? 'bg-primary/10 border-l-2 border-primary' : ''} ${
                    isFirstColumn ? 'left-0 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : 'z-20'
                  }`}
                  style={{ width: `${width}px`, minWidth: '20px' }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, colKey)}
                  onDragOver={(e) => handleDragOver(e, colKey)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, colKey)}
                  onDragEnd={handleDragEnd}
                >
                  <div 
                    className={`flex items-start pr-3 ${col.sortable ? "cursor-pointer select-none hover:text-foreground" : ""}`}
                    onClick={() => col.sortable && onSort(colKey)}
                  >
                    <GripVertical className="h-4 w-4 mr-1 opacity-30 group-hover:opacity-70 cursor-grab flex-shrink-0 mt-0.5" />
                    <span style={{ wordBreak: 'keep-all', overflowWrap: 'normal', whiteSpace: 'normal' }}>{col.label}</span>
                    {col.headerExtra}
                    {col.sortable && <SortIcon column={colKey} />}
                  </div>
                  <div
                    className={`absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/50 transition-colors ${
                      resizing === colKey ? 'bg-primary' : 'bg-transparent group-hover:bg-border'
                    }`}
                    onMouseDown={(e) => handleResizeStart(e, colKey)}
                  />
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {prospects.map((prospect) => (
            <tr key={prospect.id} className="border-b transition-colors hover:bg-muted/50 align-top">
              {visibleColumns.map((colKey, colIndex) => {
                const col = COLUMN_CONFIG[colKey];
                const isNameColumn = colKey === "name";
                const width = getColumnWidth(colKey);
                const isEditable = col.editable === true;
                const isEditing = editingCell?.prospectId === prospect.id && editingCell?.field === colKey;
                const isFirstColumn = colIndex === 0;
                
                // Highlight date fields red if blank or past date
                const today = new Date(new Date().toDateString());
                const isLastOutreachBlank = colKey === 'last_outreach' && !prospect.last_outreach;
                const isNextOutreachHighlight = colKey === 'next_outreach' && (
                  !prospect.next_outreach || new Date(prospect.next_outreach) < today
                );
                const isNextMeetingHighlight = colKey === 'next_meeting' && (
                  !prospect.next_meeting || new Date(prospect.next_meeting) < today
                );
                const isEstClosingHighlight = colKey === 'est_closing_date' && (
                  !prospect.est_closing_date || new Date(prospect.est_closing_date) < today
                );
                const shouldHighlightRed = isLastOutreachBlank || isNextOutreachHighlight || isNextMeetingHighlight || isEstClosingHighlight;

                const stickyClasses = isFirstColumn ? 'sticky left-0 z-10 bg-background shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : '';

                // Render toggle switch for SDR Set
                if (col.editType === "toggle") {
                  const toggleValue = getProspectValue(prospect, colKey) as boolean;
                  return (
                    <td
                      key={colKey}
                      className={`p-4 align-middle ${stickyClasses}`}
                      style={{ width: `${width}px`, maxWidth: `${width}px` }}
                    >
                      <div className="flex justify-center items-center">
                        <Switch
                          checked={toggleValue === true}
                          onCheckedChange={(checked) => handleToggleChange(prospect.id, colKey, checked)}
                          disabled={updating}
                          className="h-4 w-7 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input [&>span]:h-3 [&>span]:w-3 [&>span]:data-[state=checked]:translate-x-3"
                        />
                      </div>
                    </td>
                  );
                }

                // Render select dropdown for status (inline, no popup)
                if (col.editType === "select" && col.selectOptions) {
                  const selectValue = getProspectValue(prospect, colKey) as string;
                  return (
                    <td
                      key={colKey}
                      className={`p-2 align-middle ${stickyClasses}`}
                      style={{ width: `${width}px`, maxWidth: `${width}px` }}
                    >
                      <div className="flex justify-center items-center">
                        <Select
                          value={selectValue || "cold"}
                          onValueChange={(value) => handleSelectChange(prospect.id, colKey, value)}
                          disabled={updating}
                        >
                          <SelectTrigger className="h-8 w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {col.selectOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                  );
                }

                // Render editable cell in editing mode
                if (isEditing && isEditable) {
                  const inputType = col.editType === "number" ? "number" : 
                                   col.editType === "date" ? "date" : 
                                   col.editType === "email" ? "email" : 
                                   col.editType === "tel" ? "tel" : "text";
                  
                  return (
                    <td
                      key={colKey}
                      className={`p-1 align-middle ${stickyClasses}`}
                      style={{ width: `${width}px`, maxWidth: `${width}px` }}
                    >
                      <div className="flex items-center gap-1">
                        {col.editType === "textarea" ? (
                          <Textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Escape") handleCancelEdit();
                            }}
                            className="min-h-[60px] text-sm"
                            autoFocus
                            placeholder="Enter notes"
                          />
                        ) : (
                          <Input
                            type={inputType}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, prospect.id, colKey)}
                            className="h-8 text-sm"
                            autoFocus
                            step={col.editType === "number" ? "0.01" : undefined}
                          />
                        )}
                        <button
                          onClick={() => handleSaveEdit(prospect.id, colKey)}
                          className="p-1 hover:bg-primary/10 rounded"
                          disabled={updating}
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 hover:bg-destructive/10 rounded"
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    </td>
                  );
                }

                // Render editable cell (non-editing state) - clickable to edit
                if (isEditable) {
                  const rawValue = prospect[colKey as keyof Prospect];
                  const displayContent = col.render 
                    ? col.render(prospect) 
                    : (rawValue?.toString() || <CenteredDash />);
                  
                  return (
                    <td
                      key={colKey}
                      onClick={() => {
                        if (isNameColumn) {
                          onProspectClick(prospect);
                        } else {
                          handleStartEdit(prospect.id, colKey, rawValue as string | number | null);
                        }
                      }}
                      className={`p-4 align-middle break-words align-top cursor-pointer hover:bg-primary/5 transition-colors ${
                        isNameColumn ? "font-medium text-primary hover:underline" : ""
                      } ${col.centered ? "text-center" : ""} ${stickyClasses}`}
                      style={{ 
                        width: `${width}px`, 
                        maxWidth: `${width}px`, 
                        wordBreak: 'break-word',
                        backgroundColor: shouldHighlightRed ? 'hsla(0, 60%, 75%, 0.3)' : undefined,
                      }}
                      title={isNameColumn ? "Click to view details" : "Click to edit"}
                    >
                      {col.centered ? (
                        <div className="flex justify-center items-center">
                          {displayContent}
                        </div>
                      ) : displayContent}
                    </td>
                  );
                }
                
                // Non-editable cells
                return (
                  <td
                    key={colKey}
                    onClick={() => isNameColumn && onProspectClick(prospect)}
                    className={`p-4 align-middle break-words align-top ${isNameColumn ? "font-medium text-primary hover:underline cursor-pointer" : ""} ${col.centered ? "text-center" : ""} ${stickyClasses}`}
                    style={{ 
                      width: `${width}px`, 
                      maxWidth: `${width}px`, 
                      wordBreak: 'break-word',
                      backgroundColor: shouldHighlightRed ? 'hsla(0, 60%, 75%, 0.3)' : undefined,
                    }}
                  >
                    {col.centered ? (
                      <div className="flex justify-center items-center">
                        {col.render 
                          ? col.render(prospect) 
                          : (prospect[colKey as keyof Prospect] as string) || <CenteredDash />
                        }
                      </div>
                    ) : (
                      col.render 
                        ? col.render(prospect) 
                        : (prospect[colKey as keyof Prospect] as string) || <CenteredDash />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}