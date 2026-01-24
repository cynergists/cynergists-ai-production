import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calendar, CalendarDays, CreditCard, Loader2 } from "lucide-react";
import { formatPercent } from "@/lib/utils";

interface ClientsSummary {
  totalActiveAmount: number;
  activeMonthlyCount: number;
  activeMonthlyAmount: number;
  activeAnnualCount: number;
  activeAnnualAmount: number;
  activeOneTimeCount: number;
  activeOneTimeAmount: number;
  terminatedMonthlyCount: number;
  terminatedAnnualCount: number;
  terminatedOneTimeCount: number;
  terminatedTotalCount: number;
  retentionMonthlyPercent: number;
  retentionAnnualPercent: number;
  retentionTotalPercent: number;
}

interface ClientsMetricsSummaryProps {
  summary: ClientsSummary | null;
  loading?: boolean;
  hasActiveFilters?: boolean;
}

export function ClientsMetricsSummary({ summary, loading, hasActiveFilters }: ClientsMetricsSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentLocal = (value: number) => {
    return formatPercent(value);
  };

  // Calculate totals for "Active Accounts" card
  const totalActiveCount = (summary?.activeMonthlyCount ?? 0) + (summary?.activeAnnualCount ?? 0);
  const annualizedTotal = (summary?.totalActiveAmount ?? 0) * 12;

  const metrics = [
    {
      label: "Active Accounts",
      dollarAmount: summary ? formatCurrency(summary.totalActiveAmount) : "$0",
      annualAmount: formatCurrency(annualizedTotal),
      showPerMonth: true,
      rows: [
        { label: "Active Clients", value: totalActiveCount },
        { label: "Terminated", value: summary?.terminatedTotalCount ?? 0 },
        { label: "Retention", value: formatPercentLocal(summary?.retentionTotalPercent ?? 0) },
      ],
      icon: DollarSign,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      label: "Monthly Subscriptions",
      dollarAmount: summary ? formatCurrency(summary.activeMonthlyAmount) : "$0",
      annualAmount: formatCurrency((summary?.activeMonthlyAmount ?? 0) * 12),
      showPerMonth: true,
      rows: [
        { label: "Active Clients", value: summary?.activeMonthlyCount ?? 0 },
        { label: "Terminated", value: summary?.terminatedMonthlyCount ?? 0 },
        { label: "Retention", value: formatPercentLocal(summary?.retentionMonthlyPercent ?? 0) },
      ],
      icon: Calendar,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      label: "Annual Subscriptions",
      dollarAmount: summary ? formatCurrency(summary.activeAnnualAmount ?? 0) : "$0",
      annualAmount: formatCurrency((summary?.activeAnnualAmount ?? 0) * 12),
      showPerMonth: true,
      rows: [
        { label: "Active Clients", value: summary?.activeAnnualCount ?? 0 },
        { label: "Terminated", value: summary?.terminatedAnnualCount ?? 0 },
        { label: "Retention", value: formatPercentLocal(summary?.retentionAnnualPercent ?? 0) },
      ],
      icon: CalendarDays,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      label: "One Time Payments",
      dollarAmount: summary ? formatCurrency(summary.activeOneTimeAmount) : "$0",
      annualAmount: null,
      showPerMonth: false,
      rows: [
        { label: "Clients", value: summary?.activeOneTimeCount ?? 0 },
      ],
      icon: CreditCard,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground">{metric.label}</p>
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`h-4 w-4 ${metric.color}`} />
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`h-4 w-4 ${metric.color}`} />
                </div>
                <p className="text-xs font-medium text-muted-foreground">{metric.label}</p>
              </div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-2xl font-bold text-foreground">
                  {metric.dollarAmount}
                  {metric.showPerMonth && <span className="text-sm font-normal text-muted-foreground">/mo</span>}
                </p>
                {metric.annualAmount && (
                  <p className="text-lg font-semibold text-foreground">
                    {metric.annualAmount}
                    <span className="text-xs font-normal text-muted-foreground">/yr</span>
                  </p>
                )}
              </div>
              <div className="space-y-1">
                {metric.rows.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{row.label}:</span>
                    <span className="font-medium text-foreground">{row.value}</span>
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
