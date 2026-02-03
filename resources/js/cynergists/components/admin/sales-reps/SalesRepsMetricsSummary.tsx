import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { SalesRepsSummary } from '@/hooks/useSalesRepsList';
import { Briefcase, DollarSign, UserCheck, Users } from 'lucide-react';

interface SalesRepsMetricsSummaryProps {
    summary: SalesRepsSummary | null;
    loading: boolean;
}

export function SalesRepsMetricsSummary({
    summary,
    loading,
}: SalesRepsMetricsSummaryProps) {
    if (loading || !summary) {
        return (
            <div className="grid gap-4 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const metrics = [
        {
            title: 'Total Reps',
            value: summary.total,
            icon: Users,
        },
        {
            title: 'Active Reps',
            value: summary.active,
            icon: UserCheck,
        },
        {
            title: 'Total Clients',
            value: summary.totalClients,
            icon: Briefcase,
        },
        {
            title: 'Total Revenue',
            value: `$${summary.totalRevenue.toLocaleString()}`,
            icon: DollarSign,
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-4">
            {metrics.map((metric) => (
                <Card key={metric.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {metric.title}
                        </CardTitle>
                        <metric.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metric.value}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
