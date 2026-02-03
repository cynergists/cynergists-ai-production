import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Loader2, TrendingUp, Users } from 'lucide-react';

interface MonthlyData {
    month: number;
    year: number;
    count: number;
    value: number;
    hotCount: number;
    warmCount: number;
    coldCount: number;
    hotValue: number;
    warmValue: number;
    coldValue: number;
}

interface ProspectsSummary {
    totalProspects: number;
    coldCount: number;
    warmCount: number;
    hotCount: number;
    sdrSetCount: number;
    totalEstimatedValue: number;
    hotValue: number;
    warmValue: number;
    coldValue: number;
    monthlyData?: MonthlyData[];
}

interface ProspectsMetricsSummaryProps {
    summary: ProspectsSummary | null;
    loading?: boolean;
    hasActiveFilters?: boolean;
}

const MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

export function ProspectsMetricsSummary({
    summary,
    loading,
    hasActiveFilters,
}: ProspectsMetricsSummaryProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Generate month labels dynamically
    const now = new Date();
    const getMonthLabel = (offset: number) => {
        const monthIndex = (now.getMonth() + offset) % 12;
        return MONTH_NAMES[monthIndex];
    };

    const monthlyData = summary?.monthlyData || [];

    const metrics: {
        label: string;
        dollarAmount: string;
        showPerMonth: boolean;
        isCurrentMonth?: boolean;
        rows: { label: string; value: string | number }[];
        icon: React.ElementType;
        color: string;
        bgColor: string;
    }[] = [
        {
            label: hasActiveFilters ? 'Filtered Prospects' : 'All Prospects',
            dollarAmount: formatCurrency(summary?.totalEstimatedValue || 0),
            showPerMonth: true,
            rows: [
                { label: 'Total', value: summary?.totalProspects || 0 },
                {
                    label: 'Committed',
                    value: `${summary?.hotCount || 0} (${formatCurrency(summary?.hotValue || 0)})`,
                },
                {
                    label: 'Interested',
                    value: `${summary?.warmCount || 0} (${formatCurrency(summary?.warmValue || 0)})`,
                },
                {
                    label: 'Aware',
                    value: `${summary?.coldCount || 0} (${formatCurrency(summary?.coldValue || 0)})`,
                },
            ],
            icon: Users,
            color: 'text-emerald-600 dark:text-emerald-400',
            bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
        },
        ...[0, 1, 2].map((index) => {
            const data = monthlyData[index];
            const monthLabel = getMonthLabel(index);
            const isCurrentMonth = index === 0;

            return {
                label: monthLabel,
                dollarAmount: formatCurrency(data?.value || 0),
                showPerMonth: true,
                isCurrentMonth,
                rows: [
                    { label: 'Prospects', value: data?.count || 0 },
                    {
                        label: 'Committed',
                        value: `${data?.hotCount || 0} (${formatCurrency(data?.hotValue || 0)})`,
                    },
                    {
                        label: 'Interested',
                        value: `${data?.warmCount || 0} (${formatCurrency(data?.warmValue || 0)})`,
                    },
                    {
                        label: 'Aware',
                        value: `${data?.coldCount || 0} (${formatCurrency(data?.coldValue || 0)})`,
                    },
                ],
                icon: isCurrentMonth ? TrendingUp : Calendar,
                color: isCurrentMonth
                    ? 'text-blue-600 dark:text-blue-400'
                    : index === 1
                      ? 'text-purple-600 dark:text-purple-400'
                      : 'text-amber-600 dark:text-amber-400',
                bgColor: isCurrentMonth
                    ? 'bg-blue-50 dark:bg-blue-950/30'
                    : index === 1
                      ? 'bg-purple-50 dark:bg-purple-950/30'
                      : 'bg-amber-50 dark:bg-amber-950/30',
            };
        }),
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {metrics.map((metric, index) => (
                    <Card key={index} className="border-border/50">
                        <CardContent className="p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <p className="text-xs font-medium text-muted-foreground">
                                    {metric.label}
                                </p>
                                <div
                                    className={`rounded-lg p-2 ${metric.bgColor}`}
                                >
                                    <metric.icon
                                        className={`h-4 w-4 ${metric.color}`}
                                    />
                                </div>
                            </div>
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {hasActiveFilters && (
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                        Filtered Results
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                        Metrics reflect your current filter selection
                    </span>
                </div>
            )}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {metrics.map((metric, index) => (
                    <Card key={index} className="border-border/50">
                        <CardContent className="p-4">
                            <div className="mb-2 flex items-center gap-2">
                                <div
                                    className={`rounded-lg p-2 ${metric.bgColor}`}
                                >
                                    <metric.icon
                                        className={`h-4 w-4 ${metric.color}`}
                                    />
                                </div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    {metric.label}
                                    {metric.isCurrentMonth && (
                                        <span className="ml-1 text-xs text-primary">
                                            (Current)
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="mb-2">
                                <p className="text-2xl font-bold text-foreground">
                                    {metric.dollarAmount}
                                    {metric.showPerMonth && (
                                        <span className="text-sm font-normal text-muted-foreground">
                                            /mo
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="space-y-1">
                                {metric.rows.map((row, rowIndex) => (
                                    <div
                                        key={rowIndex}
                                        className="flex justify-between text-sm"
                                    >
                                        <span className="text-muted-foreground">
                                            {row.label}:
                                        </span>
                                        <span className="font-medium text-foreground">
                                            {row.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
