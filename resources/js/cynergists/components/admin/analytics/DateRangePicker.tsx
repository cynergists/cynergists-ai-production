import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn, formatDate } from '@/lib/utils';
import {
    endOfDay,
    endOfMonth,
    endOfYear,
    startOfDay,
    startOfMonth,
    startOfYear,
    subDays,
    subMonths,
    subYears,
} from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';

interface DateRangePickerProps {
    dateRange: DateRange | undefined;
    onDateRangeChange: (range: DateRange | undefined) => void;
}

const presets = [
    {
        label: 'Today',
        value: 'today',
        getRange: () => ({
            from: startOfDay(new Date()),
            to: endOfDay(new Date()),
        }),
    },
    {
        label: 'Last 7 Days',
        value: '7d',
        getRange: () => ({ from: subDays(new Date(), 7), to: new Date() }),
    },
    {
        label: 'Last 30 Days',
        value: '30d',
        getRange: () => ({ from: subDays(new Date(), 30), to: new Date() }),
    },
    {
        label: 'Last 90 Days',
        value: '90d',
        getRange: () => ({ from: subDays(new Date(), 90), to: new Date() }),
    },
    {
        label: 'This Month',
        value: 'this_month',
        getRange: () => ({ from: startOfMonth(new Date()), to: new Date() }),
    },
    {
        label: 'Last Month',
        value: 'last_month',
        getRange: () => {
            const lastMonth = subMonths(new Date(), 1);
            return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
        },
    },
    {
        label: 'This Year',
        value: 'this_year',
        getRange: () => ({ from: startOfYear(new Date()), to: new Date() }),
    },
    {
        label: 'Last Year',
        value: 'last_year',
        getRange: () => {
            const lastYear = subYears(new Date(), 1);
            return { from: startOfYear(lastYear), to: endOfYear(lastYear) };
        },
    },
];

export function DateRangePicker({
    dateRange,
    onDateRangeChange,
}: DateRangePickerProps) {
    const [preset, setPreset] = useState<string>('30d');

    const handlePresetChange = (value: string) => {
        setPreset(value);
        if (value !== 'custom') {
            const selectedPreset = presets.find((p) => p.value === value);
            if (selectedPreset) {
                onDateRangeChange(selectedPreset.getRange());
            }
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Select value={preset} onValueChange={handlePresetChange}>
                <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                    {presets.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                            {p.label}
                        </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
            </Select>

            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            'w-[280px] justify-start text-left font-normal',
                            !dateRange && 'text-muted-foreground',
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                            dateRange.to ? (
                                <>
                                    {formatDate(dateRange.from)} -{' '}
                                    {formatDate(dateRange.to)}
                                </>
                            ) : (
                                formatDate(dateRange.from)
                            )
                        ) : (
                            <span>Pick a date range</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={(range) => {
                            setPreset('custom');
                            onDateRangeChange(range);
                        }}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
