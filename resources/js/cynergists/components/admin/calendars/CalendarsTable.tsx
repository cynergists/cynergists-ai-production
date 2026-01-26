import { useState, useRef, useCallback } from 'react';
import { ChevronUp, ChevronDown, Copy, Check, ExternalLink, Trash2 } from 'lucide-react';
import { Badge } from '@cy/components/ui/badge';
import { Button } from '@cy/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@cy/components/ui/select';
import { Input } from '@cy/components/ui/input';
import { toast } from 'sonner';
import type { Calendar } from '@cy/hooks/useCalendarsList';

interface ColumnConfig {
  key: string;
  label: string;
  sortable: boolean;
  width: number;
  editable?: boolean;
  centered?: boolean;
  render?: (calendar: Calendar, onUpdate: (id: string, field: string, value: string) => void) => React.ReactNode;
}

const CALENDAR_TYPE_OPTIONS = [
  { value: 'individual', label: 'Individual' },
  { value: 'interview', label: 'Interview' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'shared', label: 'Shared' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'default';
    case 'inactive':
      return 'secondary';
    case 'archived':
      return 'outline';
    default:
      return 'secondary';
  }
};

const getTypeBadgeVariant = (type: string) => {
  switch (type) {
    case 'individual':
      return 'default';
    case 'interview':
      return 'secondary';
    case 'partnership':
      return 'outline';
    case 'podcast':
      return 'destructive';
    case 'shared':
      return 'default';
    default:
      return 'secondary';
  }
};

const COLUMN_CONFIG: Record<string, ColumnConfig> = {
  calendar_name: {
    key: 'calendar_name',
    label: 'Calendar Name',
    sortable: true,
    width: 200,
  },
  site_location: {
    key: 'site_location',
    label: 'Website Location',
    sortable: true,
    width: 150,
    editable: true,
    render: (calendar, onUpdate) => (
      <Input
        defaultValue={calendar.site_location || ''}
        className="h-8 text-sm"
        onBlur={(e) => {
          if (e.target.value !== (calendar.site_location || '')) {
            onUpdate(calendar.id, 'site_location', e.target.value);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur();
          }
        }}
      />
    ),
  },
  participants: {
    key: 'participants',
    label: 'Participants',
    sortable: true,
    width: 150,
    editable: true,
    render: (calendar, onUpdate) => (
      <Input
        defaultValue={calendar.participants || ''}
        className="h-8 text-sm"
        onBlur={(e) => {
          if (e.target.value !== (calendar.participants || '')) {
            onUpdate(calendar.id, 'participants', e.target.value);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur();
          }
        }}
      />
    ),
  },
  owner: {
    key: 'owner',
    label: 'Owner',
    sortable: true,
    width: 120,
    editable: true,
    render: (calendar, onUpdate) => (
      <Input
        defaultValue={calendar.owner || ''}
        className="h-8 text-sm"
        onBlur={(e) => {
          if (e.target.value !== (calendar.owner || '')) {
            onUpdate(calendar.id, 'owner', e.target.value);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur();
          }
        }}
      />
    ),
  },
  calendar_type: {
    key: 'calendar_type',
    label: 'Type',
    sortable: true,
    width: 130,
    editable: true,
    centered: true,
    render: (calendar, onUpdate) => (
      <div className="flex justify-center">
        <Select
          defaultValue={calendar.calendar_type}
          onValueChange={(value) => onUpdate(calendar.id, 'calendar_type', value)}
        >
          <SelectTrigger className="h-8 text-sm w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CALENDAR_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <Badge variant={getTypeBadgeVariant(opt.value)} className="text-xs">
                  {opt.label}
                </Badge>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    ),
  },
  status: {
    key: 'status',
    label: 'Status',
    sortable: true,
    width: 120,
    editable: true,
    centered: true,
    render: (calendar, onUpdate) => (
      <div className="flex justify-center">
        <Select
          defaultValue={calendar.status}
          onValueChange={(value) => onUpdate(calendar.id, 'status', value)}
        >
          <SelectTrigger className="h-8 text-sm w-[110px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <Badge variant={getStatusBadgeVariant(opt.value)} className="text-xs">
                  {opt.label}
                </Badge>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    ),
  },
  public_url: {
    key: 'public_url',
    label: 'Public URL',
    sortable: false,
    width: 180,
  },
  actions: {
    key: 'actions',
    label: 'Actions',
    sortable: false,
    width: 120,
    centered: true,
  },
};

const DEFAULT_COLUMN_ORDER = ['calendar_name', 'site_location', 'participants', 'calendar_type', 'status', 'public_url', 'actions'];

interface CalendarsTableProps {
  calendars: Calendar[];
  loading?: boolean;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  onSort: (column: string) => void;
  onCalendarClick: (calendar: Calendar) => void;
  onUpdate: (id: string, field: string, value: string) => void;
  onDelete?: (id: string) => void;
  visibleColumns?: string[];
  columnWidths?: Record<string, number>;
  onColumnWidthChange?: (colKey: string, width: number) => void;
}

export function CalendarsTable({
  calendars,
  loading,
  sortColumn,
  sortDirection,
  onSort,
  onCalendarClick,
  onUpdate,
  onDelete,
  visibleColumns = DEFAULT_COLUMN_ORDER,
  columnWidths = {},
  onColumnWidthChange,
}: CalendarsTableProps) {
  const [resizing, setResizing] = useState<string | null>(null);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getColumnWidth = (colKey: string) => {
    return columnWidths[colKey] || COLUMN_CONFIG[colKey]?.width || 150;
  };

  const handleResizeStart = useCallback((e: React.MouseEvent, colKey: string) => {
    e.preventDefault();
    setResizing(colKey);
    startX.current = e.clientX;
    startWidth.current = getColumnWidth(colKey);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const diff = moveEvent.clientX - startX.current;
      const newWidth = Math.max(80, startWidth.current + diff);
      onColumnWidthChange?.(colKey, newWidth);
    };

    const handleMouseUp = () => {
      setResizing(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [onColumnWidthChange]);

  const getPublicUrl = (slug: string) => `https://cynergists.ai/${slug}`;

  const copyToClipboard = async (calendar: Calendar) => {
    const url = getPublicUrl(calendar.slug);
    await navigator.clipboard.writeText(url);
    setCopiedId(calendar.id);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (calendars.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>No calendars found</p>
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {visibleColumns.map((colKey, index) => {
              const config = COLUMN_CONFIG[colKey];
              if (!config) return null;
              const isFirstColumn = index === 0;

              return (
                <th
                  key={colKey}
                  className={`relative px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap ${
                    isFirstColumn ? 'sticky left-0 z-30 bg-muted/50 text-left' : 'sticky top-0 z-20'
                  } ${config.centered ? 'text-center' : 'text-left'} ${config.sortable ? 'cursor-pointer hover:text-foreground' : ''}`}
                  style={{ width: getColumnWidth(colKey), minWidth: getColumnWidth(colKey) }}
                  onClick={(e) => {
                    if (config.sortable) {
                      e.preventDefault();
                      e.stopPropagation();
                      onSort(colKey);
                    }
                  }}
                >
                  <div className={`flex items-center gap-1 ${config.centered ? 'justify-center' : ''}`}>
                    {config.label}
                    {config.sortable && <SortIcon column={colKey} />}
                  </div>
                  <div
                    className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/50"
                    onMouseDown={(e) => handleResizeStart(e, colKey)}
                  />
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {calendars.map((calendar) => (
            <tr key={calendar.id} className="border-b border-border hover:bg-muted/30">
              {visibleColumns.map((colKey, index) => {
                const config = COLUMN_CONFIG[colKey];
                if (!config) return null;
                const isFirstColumn = index === 0;

                if (colKey === 'calendar_name') {
                  return (
                    <td
                      key={colKey}
                      className="sticky left-0 z-10 bg-background px-4 py-3 text-sm font-medium"
                      style={{ width: getColumnWidth(colKey), minWidth: getColumnWidth(colKey) }}
                    >
                      <button
                        onClick={() => onCalendarClick(calendar)}
                        className="text-left text-lime-400 hover:text-lime-300 hover:underline transition-colors"
                      >
                        {calendar.calendar_name}
                      </button>
                    </td>
                  );
                }

                if (colKey === 'public_url') {
                  return (
                    <td
                      key={colKey}
                      className="px-4 py-3 text-sm"
                      style={{ width: getColumnWidth(colKey), minWidth: getColumnWidth(colKey) }}
                    >
                      <span className="truncate max-w-[140px] text-muted-foreground text-xs font-mono">
                        cynergists.com/{calendar.slug}
                      </span>
                    </td>
                  );
                }

                if (colKey === 'actions') {
                  const url = getPublicUrl(calendar.slug);
                  return (
                    <td
                      key={colKey}
                      className="px-4 py-3 text-sm"
                      style={{ width: getColumnWidth(colKey), minWidth: getColumnWidth(colKey) }}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => copyToClipboard(calendar)}
                        >
                          {copiedId === calendar.id ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          asChild
                        >
                          <a href={url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => onDelete?.(calendar.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  );
                }

                if (config.render) {
                  return (
                    <td
                      key={colKey}
                      className="px-4 py-3 text-sm"
                      style={{ width: getColumnWidth(colKey), minWidth: getColumnWidth(colKey) }}
                    >
                      {config.render(calendar, onUpdate)}
                    </td>
                  );
                }

                return (
                  <td
                    key={colKey}
                    className="px-4 py-3 text-sm"
                    style={{ width: getColumnWidth(colKey), minWidth: getColumnWidth(colKey) }}
                  >
                    {String((calendar as unknown as Record<string, unknown>)[colKey] ?? '')}
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
