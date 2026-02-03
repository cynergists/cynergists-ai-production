import { useCallback, useRef, useState } from 'react';

export interface ColumnConfig {
    key: string;
    label: string;
    sortable: boolean;
    minWidth?: number;
    defaultWidth?: number;
    centered?: boolean;
    editable?: boolean;
    editType?: string;
    selectOptions?: { value: string; label: string }[];
    render?: (item: unknown) => React.ReactNode;
    headerExtra?: React.ReactNode;
}

/**
 * Hook for managing column resizing in admin tables
 */
export function useColumnResize(
    columnWidths: Record<string, number>,
    columnConfig: Record<string, ColumnConfig>,
    onColumnResize: (column: string, width: number) => void,
) {
    const [resizing, setResizing] = useState<string | null>(null);
    const [localWidths, setLocalWidths] = useState<Record<string, number>>({});
    const startXRef = useRef(0);
    const startWidthRef = useRef(0);

    const getColumnWidth = useCallback(
        (colKey: string) => {
            if (localWidths[colKey] !== undefined) {
                return localWidths[colKey];
            }
            return (
                columnWidths[colKey] ||
                columnConfig[colKey]?.defaultWidth ||
                150
            );
        },
        [localWidths, columnWidths, columnConfig],
    );

    const handleResizeStart = useCallback(
        (e: React.MouseEvent, colKey: string) => {
            e.preventDefault();
            e.stopPropagation();
            setResizing(colKey);
            startXRef.current = e.clientX;
            startWidthRef.current =
                columnWidths[colKey] ||
                columnConfig[colKey]?.defaultWidth ||
                150;

            const handleMouseMove = (moveEvent: MouseEvent) => {
                const delta = moveEvent.clientX - startXRef.current;
                const newWidth = Math.max(20, startWidthRef.current + delta);
                setLocalWidths((prev) => ({ ...prev, [colKey]: newWidth }));
            };

            const handleMouseUp = (upEvent: MouseEvent) => {
                const delta = upEvent.clientX - startXRef.current;
                const finalWidth = Math.max(20, startWidthRef.current + delta);

                onColumnResize(colKey, finalWidth);

                setLocalWidths((prev) => {
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
        },
        [columnWidths, columnConfig, onColumnResize],
    );

    return {
        resizing,
        getColumnWidth,
        handleResizeStart,
    };
}

/**
 * Hook for managing column drag-and-drop reordering
 */
export function useColumnDragDrop(
    columnOrder: string[],
    onColumnReorder: (newOrder: string[]) => void,
) {
    const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

    const handleDragStart = useCallback(
        (e: React.DragEvent, colKey: string) => {
            setDraggedColumn(colKey);
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', colKey);
        },
        [],
    );

    const handleDragOver = useCallback(
        (e: React.DragEvent, colKey: string) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (draggedColumn && colKey !== draggedColumn) {
                setDragOverColumn(colKey);
            }
        },
        [draggedColumn],
    );

    const handleDragLeave = useCallback(() => {
        setDragOverColumn(null);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent, targetColKey: string) => {
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
        },
        [draggedColumn, columnOrder, onColumnReorder],
    );

    const handleDragEnd = useCallback(() => {
        setDraggedColumn(null);
        setDragOverColumn(null);
    }, []);

    return {
        draggedColumn,
        dragOverColumn,
        handleDragStart,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        handleDragEnd,
    };
}

/**
 * Hook for managing inline cell editing
 */
export function useInlineEditing<T extends { id: string }>(
    columnConfig: Record<string, ColumnConfig>,
    onUpdate: (id: string, data: Record<string, unknown>) => Promise<unknown>,
    onUpdated?: () => void,
) {
    const [editingCell, setEditingCell] = useState<{
        itemId: string;
        field: string;
    } | null>(null);
    const [editValue, setEditValue] = useState('');
    const [updating, setUpdating] = useState(false);

    const handleStartEdit = useCallback(
        (
            itemId: string,
            field: string,
            currentValue: string | number | null,
        ) => {
            const col = columnConfig[field];
            if (col?.editType === 'date' && currentValue) {
                const dateVal = new Date(currentValue as string);
                setEditValue(dateVal.toISOString().split('T')[0]);
            } else {
                setEditValue(currentValue?.toString() || '');
            }
            setEditingCell({ itemId, field });
        },
        [columnConfig],
    );

    const handleCancelEdit = useCallback(() => {
        setEditingCell(null);
        setEditValue('');
    }, []);

    const handleSaveEdit = useCallback(
        async (itemId: string, field: string) => {
            if (updating) return;

            setUpdating(true);
            try {
                const col = columnConfig[field];
                let valueToSave: string | number | null = editValue || null;

                if (col?.editType === 'number' && editValue) {
                    valueToSave = parseFloat(editValue);
                }

                const result = await onUpdate(itemId, { [field]: valueToSave });
                if (result) {
                    setEditingCell(null);
                    setEditValue('');
                    onUpdated?.();
                }
            } finally {
                setUpdating(false);
            }
        },
        [updating, columnConfig, editValue, onUpdate, onUpdated],
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent, itemId: string, field: string) => {
            if (
                e.key === 'Enter' &&
                columnConfig[field]?.editType !== 'textarea'
            ) {
                e.preventDefault();
                handleSaveEdit(itemId, field);
            } else if (e.key === 'Escape') {
                handleCancelEdit();
            }
        },
        [columnConfig, handleSaveEdit, handleCancelEdit],
    );

    return {
        editingCell,
        editValue,
        setEditValue,
        updating,
        handleStartEdit,
        handleCancelEdit,
        handleSaveEdit,
        handleKeyDown,
        isEditing: (itemId: string, field: string) =>
            editingCell?.itemId === itemId && editingCell?.field === field,
    };
}

/**
 * Hook for optimistic local state updates (for toggles and selects)
 */
export function useOptimisticUpdates<T extends { id: string }>(data: T[]) {
    const [localOverrides, setLocalOverrides] = useState<
        Record<string, Record<string, unknown>>
    >({});

    // Reset local overrides when data changes
    const resetOverrides = useCallback(() => {
        setLocalOverrides({});
    }, []);

    const getItemValue = useCallback(
        (item: T, field: string) => {
            if (localOverrides[item.id]?.[field] !== undefined) {
                return localOverrides[item.id][field];
            }
            return (item as Record<string, unknown>)[field];
        },
        [localOverrides],
    );

    const setOptimisticValue = useCallback(
        (itemId: string, field: string, value: unknown) => {
            setLocalOverrides((prev) => ({
                ...prev,
                [itemId]: { ...prev[itemId], [field]: value },
            }));
        },
        [],
    );

    return {
        localOverrides,
        getItemValue,
        setOptimisticValue,
        resetOverrides,
    };
}

/**
 * Common table loading and empty states
 */
export function TableLoadingState() {
    return (
        <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted-foreground border-t-transparent" />
        </div>
    );
}

export function TableEmptyState({
    entityName = 'items',
}: {
    entityName?: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p>No {entityName} found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
        </div>
    );
}

/**
 * Get common header cell classes
 */
export function getHeaderCellClasses(options: {
    isDragging: boolean;
    isDragOver: boolean;
    isFirstColumn: boolean;
}) {
    const { isDragging, isDragOver, isFirstColumn } = options;

    return `h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-background relative group transition-all ${
        isDragging ? 'opacity-50' : ''
    } ${isDragOver ? 'bg-primary/10 border-l-2 border-primary' : ''} ${
        isFirstColumn
            ? 'sticky left-0 top-0 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]'
            : ''
    }`;
}

/**
 * Get common data cell classes
 */
export function getDataCellClasses(options: {
    isFirstColumn: boolean;
    shouldHighlightRed?: boolean;
    centered?: boolean;
}) {
    const { isFirstColumn, shouldHighlightRed, centered } = options;

    const stickyClasses = isFirstColumn
        ? 'sticky left-0 z-10 bg-background shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]'
        : '';
    const highlightClasses = shouldHighlightRed ? 'text-destructive' : '';
    const alignClasses = centered ? 'text-center' : '';

    return `py-3 px-4 align-middle ${stickyClasses} ${highlightClasses} ${alignClasses}`.trim();
}
