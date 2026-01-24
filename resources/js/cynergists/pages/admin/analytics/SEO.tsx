import { useState } from "react";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import { Search, MousePointerClick, Eye, TrendingUp, AlertCircle, ExternalLink } from "lucide-react";
import { DateRangePicker } from "@/components/admin/analytics/DateRangePicker";
import { AnalyticsCard } from "@/components/admin/analytics/AnalyticsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SEOAnalytics() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const isConfigured = false;

  if (!isConfigured) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SEO Performance</h1>
          <p className="text-muted-foreground">
            Search rankings and visibility from Google Search Console
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuration Required</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>Google Search Console is not configured yet. To set it up:</p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Use the same Google Cloud Project as GA4</li>
              <li>Enable the Search Console API</li>
              <li>Add the service account as a User to your Search Console property</li>
              <li>Add SEARCH_CONSOLE_SITE_URL secret (e.g., https://yoursite.com)</li>
            </ol>
            <Button variant="outline" asChild>
              <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">
                Go to Search Console
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SEO Performance</h1>
          <p className="text-muted-foreground">
            Search rankings and visibility from Google Search Console
          </p>
        </div>
        <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard title="Total Clicks" value="—" icon={MousePointerClick} />
        <AnalyticsCard title="Impressions" value="—" icon={Eye} />
        <AnalyticsCard title="Avg. CTR" value="—" icon={TrendingUp} />
        <AnalyticsCard title="Avg. Position" value="—" icon={Search} />
      </div>
    </div>
  );
}
