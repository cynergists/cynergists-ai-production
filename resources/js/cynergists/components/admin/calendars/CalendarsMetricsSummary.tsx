import { Card } from '@cy/components/ui/card';
import type { Calendar as CalendarType } from '@cy/hooks/useCalendarsList';
import { Calendar, CalendarCheck, CalendarX } from 'lucide-react';

interface CalendarsMetricsSummaryProps {
    calendars: CalendarType[];
}

export function CalendarsMetricsSummary({
    calendars,
}: CalendarsMetricsSummaryProps) {
    const total = calendars.length;
    const active = calendars.filter((c) => c.status === 'active').length;
    const inactive = calendars.filter((c) => c.status === 'inactive').length;

    const metrics = [
        {
            label: 'Total Calendars',
            value: total,
            icon: Calendar,
            color: 'text-primary',
            note: null,
        },
        {
            label: 'Active',
            value: active,
            icon: CalendarCheck,
            color: 'text-green-500',
            note: null,
        },
        {
            label: 'Inactive',
            value: inactive,
            icon: CalendarX,
            color: 'text-amber-500',
            note: 'Redirects to contact page',
        },
    ];

    return (
        <div className="grid grid-cols-3 gap-4">
            {metrics.map((metric) => (
                <Card key={metric.label} className="p-4">
                    <div className="flex items-center gap-3">
                        <metric.icon className={`h-5 w-5 ${metric.color}`} />
                        <div>
                            <p className="text-2xl font-bold">{metric.value}</p>
                            <p className="text-xs text-muted-foreground">
                                {metric.label}
                            </p>
                            {metric.note && (
                                <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                                    {metric.note}
                                </p>
                            )}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
