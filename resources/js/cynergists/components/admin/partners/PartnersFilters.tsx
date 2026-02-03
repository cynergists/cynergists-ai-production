import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RotateCcw } from 'lucide-react';

interface PartnersFiltersProps {
    activeFilters: Record<string, string>;
    onFilterChange: (column: string, value: string) => void;
    onClearFilters: () => void;
}

const STATUS_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'suspended', label: 'Suspended' },
];

export function PartnersFilters({
    activeFilters,
    onFilterChange,
    onClearFilters,
}: PartnersFiltersProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                <Button variant="ghost" size="sm" onClick={onClearFilters}>
                    <RotateCcw className="mr-1 h-3 w-3" />
                    Reset
                </Button>
            </div>

            <ScrollArea className="h-[200px] pr-3">
                <div className="space-y-3">
                    {/* Status filter */}
                    <div className="space-y-1">
                        <Label className="text-xs">Status</Label>
                        <Select
                            value={activeFilters.status || 'all'}
                            onValueChange={(value) =>
                                onFilterChange(
                                    'status',
                                    value === 'all' ? '' : value,
                                )
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Company filter */}
                    <div className="space-y-1">
                        <Label className="text-xs">Company</Label>
                        <Input
                            placeholder="Filter by company..."
                            value={activeFilters.company_name || ''}
                            onChange={(e) =>
                                onFilterChange('company_name', e.target.value)
                            }
                        />
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
