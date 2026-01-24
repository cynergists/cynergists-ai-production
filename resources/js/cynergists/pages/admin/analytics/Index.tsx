import { useState, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { subDays, differenceInDays, format } from "date-fns";
import {
  DollarSign,
  TrendingUp,
  Users,
  Eye,
  Youtube,
  Linkedin,
  BarChart3,
  Search,
  MousePointerClick,
  CreditCard,
} from "lucide-react";
import { DateRangePicker } from "@/components/admin/analytics/DateRangePicker";
import { AnalyticsCard } from "@/components/admin/analytics/AnalyticsCard";
import { PlatformMiniCard } from "@/components/admin/analytics/PlatformMiniCard";
import { usePlatformAnalytics } from "@/hooks/usePlatformAnalytics";

// Custom icons for platforms
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const MetaIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z"/>
  </svg>
);

const GoogleAnalyticsIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M22.84 2.998v17.997a3.003 3.003 0 0 1-6.005 0V2.998a3.003 3.003 0 0 1 6.005 0zM7.163 2.998v17.997a3.003 3.003 0 0 1-6.005 0V2.998a3.003 3.003 0 0 1 6.005 0zm7.84 8.998v9a3 3 0 0 1-6 0v-9a3 3 0 0 1 6 0z"/>
  </svg>
);

export default function AnalyticsOverview() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const { data: platformData, aggregated, isLoading, connectedCount } = usePlatformAnalytics(dateRange);

  // Calculate timeframe label for tiles
  const timeframeLabel = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return "Selected Period";
    const days = differenceInDays(dateRange.to, dateRange.from);
    if (days === 0) return "Today";
    if (days === 6) return "Last 7 Days";
    if (days === 29 || days === 30) return "Last 30 Days";
    if (days === 89 || days === 90) return "Last 90 Days";
    return `${format(dateRange.from, "M/d/yy")} - ${format(dateRange.to, "M/d/yy")}`;
  }, [dateRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const hasAnyData = connectedCount > 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {connectedCount} of 8 platforms connected
          </p>
        </div>
        <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
      </div>

      {/* Key Business Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard
          title={`Visitors (${timeframeLabel})`}
          value={hasAnyData && aggregated.totalVisitors > 0 ? formatNumber(aggregated.totalVisitors) : "—"}
          description={platformData.ga4.configured ? "From Google Analytics" : "Configure GA4 to see data"}
          icon={Users}
        />
        <AnalyticsCard
          title={`Impressions (${timeframeLabel})`}
          value={hasAnyData && aggregated.totalImpressions > 0 ? formatNumber(aggregated.totalImpressions) : "—"}
          description={hasAnyData ? "Across all platforms" : "Configure platforms to see data"}
          icon={Eye}
        />
        <AnalyticsCard
          title={`Engagement (${timeframeLabel})`}
          value={hasAnyData && aggregated.totalEngagement > 0 ? formatNumber(aggregated.totalEngagement) : "—"}
          description="Likes, comments, shares"
          icon={TrendingUp}
        />
        <AnalyticsCard
          title={`Gross Revenue (${timeframeLabel})`}
          value={platformData.square.configured ? formatCurrency(aggregated.totalRevenue) : "—"}
          description={platformData.square.configured ? `${aggregated.transactionCount} transactions` : "Configure Square to see data"}
          icon={DollarSign}
        />
      </div>

      {/* Platform Mini Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Platform Overview</h2>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <PlatformMiniCard
            name="Google Analytics"
            icon={() => <GoogleAnalyticsIcon />}
            primaryMetric={platformData.ga4.primaryMetric}
            primaryLabel="Users"
            status={platformData.ga4.status || "not_configured"}
            iconColor="text-orange-500"
          />
          <PlatformMiniCard
            name="Search Console"
            icon={Search}
            primaryMetric={platformData.searchConsole.primaryMetric}
            primaryLabel="Clicks"
            status={platformData.searchConsole.status || "not_configured"}
            iconColor="text-blue-500"
          />
          <PlatformMiniCard
            name="YouTube"
            icon={Youtube}
            primaryMetric={platformData.youtube.primaryMetric}
            primaryLabel="Views"
            status={platformData.youtube.status || "not_configured"}
            iconColor="text-red-500"
          />
          <PlatformMiniCard
            name="TikTok"
            icon={() => <TikTokIcon />}
            primaryMetric={platformData.tiktok.primaryMetric}
            primaryLabel="Views"
            status={platformData.tiktok.status || "not_configured"}
            iconColor="text-foreground"
          />
          <PlatformMiniCard
            name="LinkedIn"
            icon={Linkedin}
            primaryMetric={platformData.linkedin.primaryMetric}
            primaryLabel="Impressions"
            status={platformData.linkedin.status || "not_configured"}
            iconColor="text-blue-600"
          />
          <PlatformMiniCard
            name="Meta"
            icon={() => <MetaIcon />}
            primaryMetric={platformData.meta.primaryMetric}
            primaryLabel="Reach"
            status={platformData.meta.status || "not_configured"}
            iconColor="text-blue-500"
          />
          <PlatformMiniCard
            name="Microsoft Clarity"
            icon={MousePointerClick}
            primaryMetric={platformData.clarity.primaryMetric}
            primaryLabel="Sessions"
            status={platformData.clarity.status || "not_configured"}
            iconColor="text-purple-500"
          />
          <PlatformMiniCard
            name="Square"
            icon={CreditCard}
            primaryMetric={platformData.square.primaryMetric}
            primaryLabel="Revenue"
            status={platformData.square.status || "not_configured"}
            iconColor="text-green-500"
          />
        </div>
      </div>
    </div>
  );
}
