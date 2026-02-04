import { AnalyticsCard } from '@/components/admin/analytics/AnalyticsCard';
import { DateRangePicker } from '@/components/admin/analytics/DateRangePicker';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useSquareAnalytics } from '@/hooks/useSquareAnalytics';
import { formatDate, formatPercent } from '@/lib/utils';
import { subDays } from 'date-fns';
import {
    ArrowDownRight,
    ArrowUpRight,
    CreditCard,
    DollarSign,
    Loader2,
    Receipt,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';

export default function RevenueAnalytics() {
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 30),
        to: new Date(),
    });

    const { data, isLoading, error } = useSquareAnalytics(dateRange);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount / 100); // Square amounts are in cents
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Revenue Analytics
                    </h1>
                    <p className="text-muted-foreground">
                        Payment and transaction data from Square
                    </p>
                </div>
                <DateRangePicker
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                />
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <AnalyticsCard
                    title="Total Revenue"
                    value={
                        data?.totalRevenue
                            ? formatCurrency(data.totalRevenue)
                            : '—'
                    }
                    change={data?.revenueChange}
                    changeType={data?.revenueChangeType}
                    icon={DollarSign}
                    loading={isLoading}
                />
                <AnalyticsCard
                    title="Transactions"
                    value={data?.transactionCount ?? '—'}
                    change={data?.transactionChange}
                    changeType={data?.transactionChangeType}
                    icon={Receipt}
                    loading={isLoading}
                />
                <AnalyticsCard
                    title="Average Order"
                    value={
                        data?.averageOrder
                            ? formatCurrency(data.averageOrder)
                            : '—'
                    }
                    description="Per transaction"
                    icon={TrendingUp}
                    loading={isLoading}
                />
                <AnalyticsCard
                    title="Card Payments"
                    value={data?.cardPayments ?? '—'}
                    description="vs other methods"
                    icon={CreditCard}
                    loading={isLoading}
                />
            </div>

            {/* Revenue by Day */}
            <Card>
                <CardHeader>
                    <CardTitle>Daily Revenue</CardTitle>
                    <CardDescription>Revenue breakdown by day</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : error ? (
                        <div className="py-8 text-center text-muted-foreground">
                            <p>Unable to load revenue data</p>
                            <p className="text-sm">{error.message}</p>
                        </div>
                    ) : data?.dailyRevenue && data.dailyRevenue.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">
                                        Revenue
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Transactions
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Avg Order
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Change
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.dailyRevenue.map((day, index) => {
                                    const prevDay =
                                        data.dailyRevenue[index + 1];
                                    const change = prevDay
                                        ? ((day.revenue - prevDay.revenue) /
                                              prevDay.revenue) *
                                          100
                                        : 0;
                                    return (
                                        <TableRow key={day.date}>
                                            <TableCell>
                                                {formatDate(day.date)}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(day.revenue)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {day.transactions}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(
                                                    day.revenue /
                                                        day.transactions || 0,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {index <
                                                    data.dailyRevenue.length -
                                                        1 && (
                                                    <span
                                                        className={`flex items-center justify-end gap-1 ${
                                                            change >= 0
                                                                ? 'text-green-600'
                                                                : 'text-red-600'
                                                        }`}
                                                    >
                                                        {change >= 0 ? (
                                                            <ArrowUpRight className="h-4 w-4" />
                                                        ) : (
                                                            <ArrowDownRight className="h-4 w-4" />
                                                        )}
                                                        {formatPercent(
                                                            Math.abs(change),
                                                        )}
                                                    </span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="py-8 text-center text-muted-foreground">
                            <p>No revenue data for the selected period</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Payment Methods */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Methods</CardTitle>
                        <CardDescription>
                            Breakdown by payment type
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="h-8 animate-pulse rounded bg-muted"
                                    />
                                ))}
                            </div>
                        ) : data?.paymentMethods ? (
                            <div className="space-y-3">
                                {Object.entries(data.paymentMethods).map(
                                    ([method, count]) => (
                                        <div
                                            key={method}
                                            className="flex items-center justify-between"
                                        >
                                            <span className="capitalize">
                                                {method.replace('_', ' ')}
                                            </span>
                                            <span className="font-medium">
                                                {count}
                                            </span>
                                        </div>
                                    ),
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No data available
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top Products</CardTitle>
                        <CardDescription>Best selling items</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="h-8 animate-pulse rounded bg-muted"
                                    />
                                ))}
                            </div>
                        ) : data?.topProducts && data.topProducts.length > 0 ? (
                            <div className="space-y-3">
                                {data.topProducts.map((product, index) => (
                                    <div
                                        key={product.name}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">
                                                {index + 1}.
                                            </span>
                                            <span>{product.name}</span>
                                        </div>
                                        <span className="font-medium">
                                            {formatCurrency(product.revenue)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No data available
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
