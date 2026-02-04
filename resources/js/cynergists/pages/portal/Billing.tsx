import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePortalContext } from '@/contexts/PortalContext';
import { apiClient } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
    AlertCircle,
    Calendar,
    CreditCard,
    Download,
    Receipt,
} from 'lucide-react';

export default function PortalBilling() {
    const { user } = usePortalContext();

    const { data: subscriptions, isLoading } = useQuery({
        queryKey: ['portal-subscriptions', user?.id],
        queryFn: async () => {
            const response = await apiClient.get<{
                subscriptions: Array<{
                    id: string;
                    status: string;
                    tier: string | null;
                    start_date: string | null;
                    end_date: string | null;
                    auto_renew: boolean | null;
                }>;
            }>('/api/portal/billing');

            return response.subscriptions;
        },
        enabled: Boolean(user?.id),
    });

    const monthlyTotal = null;

    return (
        <div className="p-8">
            <div className="mb-8">
                <div className="mb-2 flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold text-foreground">
                        Billing
                    </h1>
                </div>
                <p className="text-muted-foreground">
                    Manage your subscriptions and payment methods.
                </p>
            </div>

            {/* Current Plan Summary */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Monthly Total
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <div className="text-3xl font-bold">
                                {monthlyTotal !== null
                                    ? `$${monthlyTotal}`
                                    : 'N/A'}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Active Subscriptions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <div className="text-3xl font-bold">
                                {subscriptions?.length || 0}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Next Billing Date
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <div className="text-3xl font-bold">
                                {subscriptions?.[0]?.end_date
                                    ? format(
                                          new Date(subscriptions[0].end_date),
                                          'MMM d',
                                      )
                                    : 'N/A'}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Active Subscriptions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Receipt className="h-5 w-5" />
                            Active Subscriptions
                        </CardTitle>
                        <CardDescription>
                            Your current AI agent subscriptions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2].map((i) => (
                                    <Skeleton key={i} className="h-20 w-full" />
                                ))}
                            </div>
                        ) : subscriptions?.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                <AlertCircle className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                <p>No active subscriptions</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {subscriptions?.map((sub) => (
                                    <div
                                        key={sub.id}
                                        className="flex items-center justify-between rounded-lg border border-border p-4"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                AI Agent Subscription
                                            </p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                <span>
                                                    Renews{' '}
                                                    {sub.end_date
                                                        ? format(
                                                              new Date(
                                                                  sub.end_date,
                                                              ),
                                                              'MMM d, yyyy',
                                                          )
                                                        : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge
                                                variant="outline"
                                                className="capitalize"
                                            >
                                                {sub.tier ?? 'basic'}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Payment Method
                        </CardTitle>
                        <CardDescription>
                            Your saved payment information
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between rounded-lg border border-border p-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-14 items-center justify-center rounded bg-muted text-xs font-bold">
                                    VISA
                                </div>
                                <div>
                                    <p className="font-medium">
                                        •••• •••• •••• 4242
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Expires 12/26
                                    </p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm">
                                Update
                            </Button>
                        </div>

                        <div className="mt-6 space-y-2">
                            <h4 className="font-medium">Billing History</h4>
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                Invoice #
                                                {String(i).padStart(4, '0')}
                                            </p>
                                            <p className="text-muted-foreground">
                                                Dec {i}, 2025
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-medium">
                                                ${299}
                                            </span>
                                            <Button variant="ghost" size="sm">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
