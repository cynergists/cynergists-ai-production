import { AnalyticsCard } from '@/components/admin/analytics/AnalyticsCard';
import { DateRangePicker } from '@/components/admin/analytics/DateRangePicker';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { subDays } from 'date-fns';
import {
    AlertCircle,
    ExternalLink,
    Eye,
    Share2,
    ThumbsUp,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';

export default function MetaAnalytics() {
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
                        Meta Analytics
                    </h1>
                    <p className="text-muted-foreground">
                        Facebook and Instagram page performance
                    </p>
                </div>

                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Configuration Required</AlertTitle>
                    <AlertDescription className="space-y-4">
                        <p>
                            Meta Analytics is not configured yet. To set it up:
                        </p>
                        <ol className="list-inside list-decimal space-y-2 text-sm">
                            <li>
                                Set up Meta Business Manager at
                                business.facebook.com
                            </li>
                            <li>Create an app at developers.facebook.com</li>
                            <li>
                                Request pages_read_engagement permission
                                (requires app review)
                            </li>
                            <li>
                                Add META_ACCESS_TOKEN and META_PAGE_ID secrets
                            </li>
                        </ol>
                        <Button variant="outline" asChild>
                            <a
                                href="https://developers.facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
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
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Meta Analytics
                    </h1>
                    <p className="text-muted-foreground">
                        Facebook and Instagram page performance
                    </p>
                </div>
                <DateRangePicker
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                />
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
