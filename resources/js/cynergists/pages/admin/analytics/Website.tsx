import { AnalyticsCard } from '@/components/admin/analytics/AnalyticsCard';
import { DateRangePicker } from '@/components/admin/analytics/DateRangePicker';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { subDays } from 'date-fns';
import {
    AlertCircle,
    ArrowUpRight,
    Clock,
    ExternalLink,
    Eye,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';

export default function WebsiteAnalytics() {
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 30),
        to: new Date(),
    });

    // Placeholder - will be replaced with actual hook
    const isConfigured = false;

    if (!isConfigured) {
        return (
            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Website Analytics
                    </h1>
                    <p className="text-muted-foreground">
                        Traffic and user behavior from Google Analytics
                    </p>
                </div>

                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Configuration Required</AlertTitle>
                    <AlertDescription className="space-y-4">
                        <p>
                            Google Analytics is not configured yet. To set it
                            up:
                        </p>
                        <ol className="list-inside list-decimal space-y-2 text-sm">
                            <li>Create a Google Cloud Project</li>
                            <li>Enable the Google Analytics Data API</li>
                            <li>Create a Service Account with JSON key</li>
                            <li>
                                Add the service account as a Viewer to your GA4
                                property
                            </li>
                            <li>
                                Add GOOGLE_SERVICE_ACCOUNT_JSON and
                                GA4_PROPERTY_ID secrets
                            </li>
                        </ol>
                        <Button variant="outline" asChild>
                            <a
                                href="https://console.cloud.google.com"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Go to Google Cloud Console
                                <ExternalLink className="ml-2 h-4 w-4" />
                            </a>
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Website Analytics
                    </h1>
                    <p className="text-muted-foreground">
                        Traffic and user behavior from Google Analytics
                    </p>
                </div>
                <DateRangePicker
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <AnalyticsCard title="Total Users" value="—" icon={Users} />
                <AnalyticsCard title="Page Views" value="—" icon={Eye} />
                <AnalyticsCard title="Avg. Session" value="—" icon={Clock} />
                <AnalyticsCard
                    title="Bounce Rate"
                    value="—"
                    icon={ArrowUpRight}
                />
            </div>
        </div>
    );
}
