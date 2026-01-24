import { useRef, useCallback, useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Loader2, GripVertical, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDate, formatPercent } from "@/lib/utils";
import type { SalesRep } from "@/hooks/useSalesRepsList";
import { formatPhoneForDisplay } from "@/components/ui/phone-input";
import { useUpdateSalesRep } from "@/hooks/useSalesRepsList";
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
  render?: (rep: SalesRep) => React.ReactNode;
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
    editType: "text",
  },
  phone: {
    key: "phone",
    label: "Phone",
    sortable: false,
    minWidth: 150,
    defaultWidth: 180,
    centered: true,
    editable: true,
    editType: "text",
    render: (rep) => formatPhoneForDisplay(rep.phone) || <CenteredDash />,
  },
  title: {
    key: "title",
    label: "Title",
    sortable: true,
    minWidth: 100,
    defaultWidth: 150,
    editable: true,
    editType: "text",
    render: (rep) => rep.title || <CenteredDash />,
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
    render: (rep) => {
      const status = rep.status || "inactive";
      const variant = status === "active" ? "default" : "secondary";
      return <Badge variant={variant}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
    },
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
    render: (rep) => rep.total_clients ?? <CenteredDash />,
  },
  monthly_revenue: {
    key: "monthly_revenue",
    label: "Monthly Revenue",
    sortable: true,
    minWidth: 120,
    defaultWidth: 140,
    centered: true,
    editable: true,
    editType: "number",
    render: (rep) => `$${rep.monthly_revenue.toLocaleString()}`,
  },
  commission_rate: {
    key: "commission_rate",
    label: "Commission",
    sortable: true,
    minWidth: 100,
    defaultWidth: 110,
    centered: true,
    editable: true,
    editType: "number",
    render: (rep) => formatPercent(rep.commission_rate),
  },
  hire_date: {
    key: "hire_date",
    label: "Hire Date",
    sortable: true,
    minWidth: 100,
    defaultWidth: 120,
    centered: true,
    editable: true,
    editType: "date",
    render: (rep) => rep.hire_date ? formatDate(rep.hire_date) : <CenteredDash />,
  },
};

const DEFAULT_COLUMN_ORDER = ["name", "email", "phone", "title", "status", "total_clients", "monthly_revenue", "commission_rate", "hire_date"];

interface SalesRepsTableProps {
  salesReps: SalesRep[];
  loading: boolean;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
  onRepClick: (rep: SalesRep) => void;
  onRepUpdated?: () => void;
}

export function SalesRepsTable({
  salesReps,
  loading,
  sortColumn,
  sortDirection,
  onSort,
  onRepClick,
  onRepUpdated,
}: SalesRepsTableProps) {
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
  const [editingCell, setEditingCell] = useState<{ repId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const updateSalesRep = useUpdateSalesRep();

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
  const handleStartEdit = (repId: string, field: string, currentValue: string | number | null) => {
    setEditingCell({ repId, field });
    setEditValue(currentValue?.toString() || "");
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const handleSaveEdit = async (repId: string, field: string) => {
    if (updateSalesRep.isPending) return;
    
    const col = COLUMN_CONFIG[field];
    let valueToSave: string | number | null = editValue || null;
    
    if (col?.editType === "number" && editValue) {
      valueToSave = parseFloat(editValue);
    }
    
    await updateSalesRep.mutateAsync({ id: repId, [field]: valueToSave });
    setEditingCell(null);
    setEditValue("");
    onRepUpdated?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent, repId: string, field: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveEdit(repId, field);
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleSelectChange = async (repId: string, field: string, value: string) => {
    if (updateSalesRep.isPending) return;
    
    await updateSalesRep.mutateAsync({ id: repId, [field]: value || null });
    setEditingCell(null);
    setEditValue("");
    onRepUpdated?.();
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50 flex-shrink-0" />;
    }
    return sortDirection === "asc" 
      ? <ArrowUp className="h-4 w-4 ml-1 flex-shrink-0" />
      : <ArrowDown className="h-4 w-4 ml-1 flex-shrink-0" />;
  };

  if (loading && salesReps.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!loading && salesReps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>No sales reps found</p>
        <p className="text-sm">Add your first sales representative to get started</p>
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
          {salesReps.map((rep) => (
            <tr key={rep.id} className="border-b transition-colors hover:bg-muted/50 align-top">
              {visibleColumns.map((colKey, colIndex) => {
                const col = COLUMN_CONFIG[colKey];
                const isNameColumn = colKey === "name";
                const width = getColumnWidth(colKey);
                const isEditable = col.editable && !isNameColumn;
                const isEditing = editingCell?.repId === rep.id && editingCell?.field === colKey;
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
                        onValueChange={(value) => handleSelectChange(rep.id, colKey, value)}
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
                          onKeyDown={(e) => handleKeyDown(e, rep.id, colKey)}
                          onBlur={() => handleSaveEdit(rep.id, colKey)}
                          autoFocus
                          className="h-8 text-sm"
                          disabled={updateSalesRep.isPending}
                        />
                        <button
                          onClick={() => handleSaveEdit(rep.id, colKey)}
                          className="p-1 hover:bg-primary/10 rounded"
                          disabled={updateSalesRep.isPending}
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
                  ? col.render(rep) 
                  : (rep[colKey as keyof SalesRep]?.toString() || <CenteredDash />);

                return (
                  <td
                    key={colKey}
                    onClick={(e) => {
                      if (isNameColumn) {
                        onRepClick(rep);
                      } else if (isEditable) {
                        e.stopPropagation();
                        handleStartEdit(rep.id, colKey, rep[colKey as keyof SalesRep] as string | number | null);
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
