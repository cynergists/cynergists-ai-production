import { Card, CardContent } from '@/components/ui/card';
import type { PartnersSummary } from '@/hooks/usePartnersList';
import { formatCurrency } from '@/lib/utils';
import { Clock, DollarSign, Percent, UserCheck, Users } from 'lucide-react';

interface PartnersMetricsSummaryProps {
    summary: PartnersSummary;
}

export function PartnersMetricsSummary({
    summary,
}: PartnersMetricsSummaryProps) {
    const metrics = [
        {
            label: 'Total Partners',
            value: summary.total.toString(),
            icon: Users,
            color: 'text-blue-500',
        },
        {
            label: 'Active',
            value: summary.active.toString(),
            icon: UserCheck,
            color: 'text-green-500',
        },
        {
            label: 'Total Referrals',
            value: summary.totalReferrals.toString(),
            icon: Users,
            color: 'text-purple-500',
        },
        {
            label: 'Revenue Generated',
            value: formatCurrency(summary.totalRevenue),
            icon: DollarSign,
            color: 'text-emerald-500',
        },
        {
            label: 'Total Commissions',
            value: formatCurrency(summary.totalCommissions),
            icon: Percent,
            color: 'text-blue-500',
        },
        {
            label: 'Outstanding Balance',
            value: formatCurrency(summary.outstandingBalance),
            icon: Clock,
            color:
                summary.outstandingBalance > 0
                    ? 'text-amber-500'
                    : 'text-muted-foreground',
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {metrics.map((metric) => (
                <Card key={metric.label}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    {metric.label}
                                </p>
                                <p className="truncate text-lg font-bold">
                                    {metric.value}
                                </p>
                            </div>
                            <metric.icon
                                className={`h-6 w-6 ${metric.color} flex-shrink-0 opacity-80`}
                            />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
