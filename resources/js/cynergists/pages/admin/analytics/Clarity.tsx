import { useState } from "react";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import { formatPercent } from "@/lib/utils";
import {
  MousePointerClick,
  MousePointer,
  ArrowDown,
  Zap,
  Monitor,
  Smartphone,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { DateRangePicker } from "@/components/admin/analytics/DateRangePicker";
import { AnalyticsCard } from "@/components/admin/analytics/AnalyticsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useClarityAnalytics } from "@/hooks/useClarityAnalytics";

export default function ClarityAnalytics() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const { data, isLoading, isConfigured } = useClarityAnalytics(dateRange);

  if (!isConfigured) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Microsoft Clarity</h1>
          <p className="text-muted-foreground">
            User behavior analytics and session recordings
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuration Required</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>
              Microsoft Clarity is not configured yet. To set it up:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Sign up for free at clarity.microsoft.com</li>
              <li>Create a new project and get your Project ID</li>
              <li>Generate an API token in Settings → API</li>
              <li>Add CLARITY_PROJECT_ID and CLARITY_API_TOKEN in your secrets</li>
            </ol>
            <Button variant="outline" asChild>
              <a href="https://clarity.microsoft.com" target="_blank" rel="noopener noreferrer">
                Go to Microsoft Clarity
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Microsoft Clarity</h1>
          <p className="text-muted-foreground">
            User behavior analytics and session recordings
          </p>
        </div>
        <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard
          title="Total Sessions"
          value={data?.totalSessions ?? "—"}
          change={data?.sessionChange}
          changeType={data?.sessionChangeType}
          icon={MousePointerClick}
          loading={isLoading}
        />
        <AnalyticsCard
          title="Dead Clicks"
          value={data?.deadClicks ?? "—"}
          description="Clicks with no response"
          icon={MousePointer}
          loading={isLoading}
        />
        <AnalyticsCard
          title="Rage Clicks"
          value={data?.rageClicks ?? "—"}
          description="Repeated frustrated clicks"
          icon={Zap}
          loading={isLoading}
        />
        <AnalyticsCard
          title="Avg. Scroll Depth"
          value={data?.avgScrollDepth ? formatPercent(data.avgScrollDepth) : "—"}
          description="How far users scroll"
          icon={ArrowDown}
          loading={isLoading}
        />
      </div>

      {/* Device Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Device Breakdown
            </CardTitle>
            <CardDescription>Sessions by device type</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : data?.deviceBreakdown ? (
              <div className="space-y-3">
                {Object.entries(data.deviceBreakdown).map(([device, count]) => (
                  <div key={device} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {device.toLowerCase() === "mobile" ? (
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="capitalize">{device}</span>
                    </div>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session Recordings</CardTitle>
            <CardDescription>Recent user session replays</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-4">
                  View session recordings in Microsoft Clarity dashboard
                </p>
                <Button variant="outline" asChild>
                  <a href="https://clarity.microsoft.com" target="_blank" rel="noopener noreferrer">
                    Open Clarity Dashboard
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
