import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { SavedView } from '@/hooks/useViewPreferences';
import {
    ChevronDown,
    ChevronUp,
    Eye,
    EyeOff,
    FolderOpen,
    GripVertical,
    RotateCcw,
    Star,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

interface ViewSettingsProps {
    columnOrder: string[];
    hiddenColumns: string[];
    savedViews: SavedView[];
    activeViewName: string | null;
    defaultViewName: string | null;
    columnLabels: Record<string, string>;
    onColumnOrderChange: (order: string[]) => void;
    onToggleColumn: (column: string) => void;
    onLoadView: (name: string) => void;
    onDeleteView: (name: string) => void;
    onSetDefaultView: (name: string | null) => void;
    onResetToDefault: () => void;
}

export function ViewSettings({
    columnOrder,
    hiddenColumns,
    savedViews,
    activeViewName,
    defaultViewName,
    columnLabels,
    onColumnOrderChange,
    onToggleColumn,
    onLoadView,
    onDeleteView,
    onSetDefaultView,
    onResetToDefault,
}: ViewSettingsProps) {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const moveColumn = (from: number, to: number) => {
        if (from === to || to < 0 || to >= columnOrder.length) return;
        const newOrder = [...columnOrder];
        const [removed] = newOrder.splice(from, 1);
        newOrder.splice(to, 0, removed);
        onColumnOrderChange(newOrder);
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverIndex(index);
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDrop = (e: React.DragEvent, toIndex: number) => {
        e.preventDefault();
        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
        if (!isNaN(fromIndex) && fromIndex !== toIndex) {
            moveColumn(fromIndex, toIndex);
        }
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="font-medium">View Settings</h4>
                <Button variant="ghost" size="sm" onClick={onResetToDefault}>
                    <RotateCcw className="mr-1 h-3 w-3" />
                    Reset
                </Button>
            </div>

            {/* Saved Views */}
            {savedViews.length > 0 && (
                <>
                    <div className="space-y-2">
                        <Label className="text-xs font-medium">
                            Saved Views
                        </Label>
                        <div className="space-y-1">
                            {savedViews.map((view) => {
                                const isDefault = defaultViewName === view.name;
                                return (
                                    <div
                                        key={view.name}
                                        className={`flex items-center justify-between rounded-md p-2 text-sm ${
                                            activeViewName === view.name
                                                ? 'bg-primary/10'
                                                : 'hover:bg-muted'
                                        }`}
                                    >
                                        <button
                                            onClick={() =>
                                                onLoadView(view.name)
                                            }
                                            className="flex flex-1 items-center gap-2 text-left"
                                        >
                                            <FolderOpen className="h-3 w-3" />
                                            {view.name}
                                            {isDefault && (
                                                <span className="text-xs text-primary">
                                                    (default)
                                                </span>
                                            )}
                                        </button>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className={`h-6 w-6 ${isDefault ? 'text-primary' : ''}`}
                                                onClick={() =>
                                                    onSetDefaultView(
                                                        isDefault
                                                            ? null
                                                            : view.name,
                                                    )
                                                }
                                                title={
                                                    isDefault
                                                        ? 'Remove as default'
                                                        : 'Set as default'
                                                }
                                            >
                                                <Star
                                                    className={`h-3 w-3 ${isDefault ? 'fill-primary' : ''}`}
                                                />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() =>
                                                    onDeleteView(view.name)
                                                }
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <Separator />
                </>
            )}

            {/* Column Visibility & Order */}
            <div className="space-y-2">
                <Label className="text-xs font-medium">
                    Columns (drag to reorder)
                </Label>
                <ScrollArea className="h-64">
                    <div className="space-y-1 pr-4">
                        {columnOrder.map((col, index) => {
                            const isHidden = hiddenColumns.includes(col);
                            const isDragging = draggedIndex === index;
                            const isDragOver = dragOverIndex === index;

                            return (
                                <div
                                    key={col}
                                    draggable
                                    onDragStart={(e) =>
                                        handleDragStart(e, index)
                                    }
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, index)}
                                    onDragEnd={handleDragEnd}
                                    className={`group flex items-center gap-2 rounded-md p-2 transition-all hover:bg-muted ${
                                        isDragging ? 'bg-muted opacity-50' : ''
                                    } ${isDragOver ? 'border-t-2 border-primary' : ''}`}
                                >
                                    {/* Drag handle */}
                                    <div className="cursor-grab active:cursor-grabbing">
                                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                                    </div>

                                    {/* Up/Down buttons */}
                                    <div className="flex flex-col -space-y-1">
                                        <button
                                            onClick={() =>
                                                moveColumn(index, index - 1)
                                            }
                                            disabled={index === 0}
                                            className="rounded p-0.5 hover:bg-muted-foreground/20 disabled:cursor-not-allowed disabled:opacity-30"
                                        >
                                            <ChevronUp className="h-3 w-3 text-muted-foreground" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                moveColumn(index, index + 1)
                                            }
                                            disabled={
                                                index === columnOrder.length - 1
                                            }
                                            className="rounded p-0.5 hover:bg-muted-foreground/20 disabled:cursor-not-allowed disabled:opacity-30"
                                        >
                                            <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                        </button>
                                    </div>

                                    {/* Visibility checkbox */}
                                    <Checkbox
                                        id={`col-${col}`}
                                        checked={!isHidden}
                                        onCheckedChange={() =>
                                            onToggleColumn(col)
                                        }
                                    />

                                    {/* Label */}
                                    <Label
                                        htmlFor={`col-${col}`}
                                        className="flex-1 cursor-pointer text-sm select-none"
                                    >
                                        {columnLabels[col] || col}
                                    </Label>

                                    {/* Visibility toggle icon */}
                                    <button
                                        onClick={() => onToggleColumn(col)}
                                        className="rounded p-1 hover:bg-muted-foreground/20"
                                    >
                                        {isHidden ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
