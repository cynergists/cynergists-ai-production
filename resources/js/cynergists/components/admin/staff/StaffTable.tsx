import { useRef, useCallback, useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Loader2, GripVertical, Check, X, Search, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDate, formatPercent } from "@/lib/utils";
import type { StaffMember, StaffType } from "@/hooks/useStaffList";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CenteredDash } from "@/components/admin/CenteredDash";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ColumnConfig {
  key: string;
  label: string;
  sortable: boolean;
  minWidth?: number;
  defaultWidth?: number;
  centered?: boolean;
  editable?: boolean;
  editType?: "text" | "number" | "date" | "select";
  render?: (member: StaffMember) => React.ReactNode;
}

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const COLUMN_CONFIG: Record<string, ColumnConfig> = {
  name: {
    key: "name",
    label: "Name",
    sortable: true,
    minWidth: 120,
    defaultWidth: 180,
    editable: false,
  },
  title: {
    key: "title",
    label: "Title",
    sortable: true,
    minWidth: 100,
    defaultWidth: 150,
    editable: true,
    editType: "text",
    render: (member) => member.title || <CenteredDash />,
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
    render: (member) => {
      const status = member.status || "inactive";
      const variant = status === "active" ? "default" : "secondary";
      return <Badge variant={variant}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
    },
  },
  start_date: {
    key: "start_date",
    label: "Start Date",
    sortable: true,
    minWidth: 100,
    defaultWidth: 120,
    centered: true,
    editable: true,
    editType: "date",
    render: (member) => member.start_date ? formatDate(member.start_date) : <CenteredDash />,
  },
  hourly_pay: {
    key: "hourly_pay",
    label: "Hourly Pay",
    sortable: true,
    minWidth: 100,
    defaultWidth: 120,
    centered: true,
    editable: true,
    editType: "number",
    render: (member) => member.hourly_pay ? `$${member.hourly_pay.toFixed(2)}` : <CenteredDash />,
  },
  hours_per_week: {
    key: "hours_per_week",
    label: "Hours/Week",
    sortable: true,
    minWidth: 100,
    defaultWidth: 120,
    centered: true,
    editable: true,
    editType: "number",
    render: (member) => member.hours_per_week ?? <CenteredDash />,
  },
  commission_percent: {
    key: "commission_percent",
    label: "Commission",
    sortable: true,
    minWidth: 100,
    defaultWidth: 110,
    centered: true,
    editable: true,
    editType: "number",
    render: (member) => member.commission_percent ? formatPercent(member.commission_percent) : <CenteredDash />,
  },
  total_clients: {
    key: "total_clients",
    label: "Clients",
    sortable: true,
    minWidth: 80,
    defaultWidth: 100,
    centered: true,
    editable: true,
    editType: "number",
    render: (member) => member.total_clients ?? <CenteredDash />,
  },
  monthly_pay: {
    key: "monthly_pay",
    label: "Monthly",
    sortable: true,
    minWidth: 100,
    defaultWidth: 120,
    centered: true,
    editable: true,
    editType: "number",
    render: (member) => member.monthly_pay ? `$${member.monthly_pay.toFixed(2)}` : <CenteredDash />,
  },
};

const DEFAULT_COLUMN_ORDER = ["name", "title", "status", "start_date", "hourly_pay", "hours_per_week", "commission_percent", "total_clients", "monthly_pay"];

interface StaffTableProps {
  staff: StaffMember[];
  onSelectStaff: (staff: StaffMember) => void;
  onAddNew: (staffType?: StaffType) => void;
  onStaffUpdated?: () => void;
}

export function StaffTable({ staff, onSelectStaff, onAddNew, onStaffUpdated }: StaffTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [columnOrder] = useState<string[]>(DEFAULT_COLUMN_ORDER);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  
  const visibleColumns = columnOrder.filter((col) => COLUMN_CONFIG[col]);

  const [resizing, setResizing] = useState<string | null>(null);
  const [localWidths, setLocalWidths] = useState<Record<string, number>>({});
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Inline editing state
  const [editingCell, setEditingCell] = useState<{ staffId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [updating, setUpdating] = useState(false);

  // Filter and sort staff
  const filteredAndSortedStaff = [...staff]
    .filter((s) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(query) ||
        s.title?.toLowerCase().includes(query) ||
        s.email?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      const aVal = a[sortColumn as keyof StaffMember];
      const bVal = b[sortColumn as keyof StaffMember];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      const comparison = String(aVal || "").localeCompare(String(bVal || ""));
      return sortDirection === "asc" ? comparison : -comparison;
    });

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
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
      
      setColumnWidths(prev => ({ ...prev, [colKey]: finalWidth }));
      
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
  }, [columnWidths]);

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
    setDraggedColumn(null);
    setDragOverColumn(null);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedColumn(null);
    setDragOverColumn(null);
  }, []);

  // Inline editing handlers
  const handleStartEdit = (staffId: string, field: string, currentValue: string | number | null) => {
    setEditingCell({ staffId, field });
    setEditValue(currentValue?.toString() || "");
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const handleSaveEdit = async (staffId: string, field: string) => {
    if (updating) return;
    setUpdating(true);
    try {
      const numericFields = ["hourly_pay", "hours_per_week", "monthly_pay", "commission_percent", "quota", "total_clients", "monthly_revenue"];
      let valueToSave: string | number | null = editValue || null;
      if (numericFields.includes(field) && editValue) {
        valueToSave = parseFloat(editValue);
      }
      const { error } = await supabase.from("staff").update({ [field]: valueToSave }).eq("id", staffId);
      if (error) throw error;
      toast.success("Staff updated");
      setEditingCell(null);
      setEditValue("");
      onStaffUpdated?.();
    } catch (err) {
      toast.error("Failed to update staff");
    } finally {
      setUpdating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, staffId: string, field: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveEdit(staffId, field);
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleSelectChange = async (staffId: string, field: string, value: string) => {
    if (updating) return;
    setUpdating(true);
    try {
      const { error } = await supabase.from("staff").update({ [field]: value }).eq("id", staffId);
      if (error) throw error;
      toast.success("Staff updated");
      setEditingCell(null);
      onStaffUpdated?.();
    } catch (err) {
      toast.error("Failed to update staff");
    } finally {
      setUpdating(false);
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

  if (staff.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>No staff members yet</p>
        <p className="text-sm">Add your first employee to get started</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <table style={{ tableLayout: 'fixed', width: 'max-content', minWidth: '100%' }} className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b sticky top-0 z-20">
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
                    className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-background relative group transition-all ${
                      isDragging ? 'opacity-50' : ''
                    } ${isDragOver ? 'bg-primary/10 border-l-2 border-primary' : ''} ${
                      isFirstColumn ? 'sticky left-0 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : ''
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
                      onClick={() => col.sortable && handleSort(colKey)}
                    >
                      <GripVertical className="h-4 w-4 mr-1 opacity-30 group-hover:opacity-70 cursor-grab flex-shrink-0 mt-0.5" />
                      <span style={{ wordBreak: 'keep-all', overflowWrap: 'normal', whiteSpace: 'normal' }}>{col.label}</span>
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
            {filteredAndSortedStaff.map((member) => (
              <tr key={member.id} className="border-b transition-colors hover:bg-muted/50 align-top">
                {visibleColumns.map((colKey, colIndex) => {
                  const col = COLUMN_CONFIG[colKey];
                  const isNameColumn = colKey === "name";
                  const width = getColumnWidth(colKey);
                  const isEditable = col.editable && !isNameColumn;
                  const isEditing = editingCell?.staffId === member.id && editingCell?.field === colKey;
                  const isFirstColumn = colIndex === 0;

                  const stickyClasses = isFirstColumn ? 'sticky left-0 z-10 bg-background shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : '';

                  // Render editing cell with select
                  if (isEditing && col.editType === "select") {
                    return (
                      <td
                        key={colKey}
                        className={`p-1 align-middle ${stickyClasses}`}
                        style={{ width: `${width}px`, maxWidth: `${width}px` }}
                      >
                        <Select
                          value={editValue}
                          onValueChange={(value) => handleSelectChange(member.id, colKey, value)}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    );
                  }

                  // Render editing cell with input
                  if (isEditing) {
                    return (
                      <td
                        key={colKey}
                        className={`p-1 align-middle ${stickyClasses}`}
                        style={{ width: `${width}px`, maxWidth: `${width}px` }}
                      >
                        <div className="flex items-center gap-1">
                          <Input
                            type={col.editType === "date" ? "date" : col.editType === "number" ? "number" : "text"}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, member.id, colKey)}
                            onBlur={() => handleSaveEdit(member.id, colKey)}
                            autoFocus
                            className="h-8 text-sm"
                            disabled={updating}
                          />
                          <button
                            onClick={() => handleSaveEdit(member.id, colKey)}
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

                  // Regular cell rendering
                  const cellContent = col.render 
                    ? col.render(member) 
                    : (member[colKey as keyof StaffMember]?.toString() || <CenteredDash />);

                  return (
                    <td
                      key={colKey}
                      onClick={(e) => {
                        if (isNameColumn) {
                          onSelectStaff(member);
                        } else if (isEditable) {
                          e.stopPropagation();
                          handleStartEdit(member.id, colKey, member[colKey as keyof StaffMember] as string | number | null);
                        }
                      }}
                      className={`p-4 align-middle ${
                        isNameColumn ? "font-medium text-primary hover:underline cursor-pointer" : ""
                      } ${isEditable ? "cursor-pointer hover:bg-muted/80" : ""} ${stickyClasses} ${
                        col.centered ? "text-center" : ""
                      }`}
                      style={{ width: `${width}px`, maxWidth: `${width}px` }}
                    >
                      {col.centered ? (
                        <div className="flex justify-center items-center">{cellContent}</div>
                      ) : (
                        cellContent
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
