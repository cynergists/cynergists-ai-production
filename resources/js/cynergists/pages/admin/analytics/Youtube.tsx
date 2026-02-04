import { AnalyticsCard } from '@/components/admin/analytics/AnalyticsCard';
import { DateRangePicker } from '@/components/admin/analytics/DateRangePicker';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { subDays } from 'date-fns';
import {
    AlertCircle,
    Clock,
    ExternalLink,
    Eye,
    ThumbsUp,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';

export default function YoutubeAnalytics() {
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 30),
        to: new Date(),
    });

    const isConfigured = false;

    if (!isConfigured) {
        return (
            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        YouTube Analytics
                    </h1>
                    <p className="text-muted-foreground">
                        Video performance and channel growth metrics
                    </p>
                </div>

                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Configuration Required</AlertTitle>
                    <AlertDescription className="space-y-4">
                        <p>
                            YouTube Analytics is not configured yet. To set it
                            up:
                        </p>
                        <ol className="list-inside list-decimal space-y-2 text-sm">
                            <li>Use the same Google Cloud Project as GA4</li>
                            <li>
                                Enable the YouTube Analytics API and YouTube
                                Data API v3
                            </li>
                            <li>
                                Add the service account as a manager to your
                                YouTube channel
                            </li>
                            <li>Add YOUTUBE_CHANNEL_ID secret</li>
                        </ol>
                        <Button variant="outline" asChild>
                            <a
                                href="https://studio.youtube.com"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Go to YouTube Studio
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
                        YouTube Analytics
                    </h1>
                    <p className="text-muted-foreground">
                        Video performance and channel growth metrics
                    </p>
                </div>
                <DateRangePicker
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <AnalyticsCard title="Total Views" value="—" icon={Eye} />
                <AnalyticsCard title="Watch Time" value="—" icon={Clock} />
                <AnalyticsCard title="Subscribers" value="—" icon={Users} />
                <AnalyticsCard title="Engagement" value="—" icon={ThumbsUp} />
            </div>
        </div>
    );
}
