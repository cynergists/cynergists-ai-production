import { useState } from "react";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import { Facebook, Eye, Users, ThumbsUp, Share2, AlertCircle, ExternalLink } from "lucide-react";
import { DateRangePicker } from "@/components/admin/analytics/DateRangePicker";
import { AnalyticsCard } from "@/components/admin/analytics/AnalyticsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function MetaAnalytics() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const isConfigured = false;

  if (!isConfigured) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meta Analytics</h1>
          <p className="text-muted-foreground">
            Facebook and Instagram page performance
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuration Required</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>Meta Analytics is not configured yet. To set it up:</p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Set up Meta Business Manager at business.facebook.com</li>
              <li>Create an app at developers.facebook.com</li>
              <li>Request pages_read_engagement permission (requires app review)</li>
              <li>Add META_ACCESS_TOKEN and META_PAGE_ID secrets</li>
            </ol>
            <Button variant="outline" asChild>
              <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer">
                Go to Meta Developers
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
          <h1 className="text-3xl font-bold tracking-tight">Meta Analytics</h1>
          <p className="text-muted-foreground">
            Facebook and Instagram page performance
          </p>
        </div>
        <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard title="Page Reach" value="—" icon={Eye} />
        <AnalyticsCard title="Page Followers" value="—" icon={Users} />
        <AnalyticsCard title="Engagement" value="—" icon={ThumbsUp} />
        <AnalyticsCard title="Shares" value="—" icon={Share2} />
      </div>
    </div>
  );
}
