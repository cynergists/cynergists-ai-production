import { AnalyticsCard } from '@/components/admin/analytics/AnalyticsCard';
import { DateRangePicker } from '@/components/admin/analytics/DateRangePicker';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { subDays } from 'date-fns';
import {
    AlertCircle,
    ExternalLink,
    Eye,
    MessageSquare,
    ThumbsUp,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';

export default function LinkedinAnalytics() {
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
                        LinkedIn Analytics
                    </h1>
                    <p className="text-muted-foreground">
                        Company page and post performance metrics
                    </p>
                </div>

                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Configuration Required</AlertTitle>
                    <AlertDescription className="space-y-4">
                        <p>
                            LinkedIn Analytics is not configured yet. To set it
                            up:
                        </p>
                        <ol className="list-inside list-decimal space-y-2 text-sm">
                            <li>
                                Apply for LinkedIn Marketing API access at
                                developer.linkedin.com
                            </li>
                            <li>Create an OAuth application</li>
                            <li>
                                Request Marketing Developer Platform access (may
                                require company verification)
                            </li>
                            <li>
                                Add LINKEDIN_ACCESS_TOKEN and
                                LINKEDIN_ORGANIZATION_ID secrets
                            </li>
                        </ol>
                        <Button variant="outline" asChild>
                            <a
                                href="https://developer.linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Go to LinkedIn Developers
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
                        LinkedIn Analytics
                    </h1>
                    <p className="text-muted-foreground">
                        Company page and post performance metrics
                    </p>
                </div>
                <DateRangePicker
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <AnalyticsCard title="Impressions" value="—" icon={Eye} />
                <AnalyticsCard title="Followers" value="—" icon={Users} />
                <AnalyticsCard title="Reactions" value="—" icon={ThumbsUp} />
                <AnalyticsCard
                    title="Comments"
                    value="—"
                    icon={MessageSquare}
                />
            </div>
        </div>
    );
}
