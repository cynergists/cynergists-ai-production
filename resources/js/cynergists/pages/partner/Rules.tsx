import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    AlertTriangle,
    ArrowRight,
    Calendar,
    CheckCircle2,
    Clock,
    DollarSign,
    Info,
} from 'lucide-react';

export default function PartnerRules() {
    return (
        <div className="space-y-6">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold">Commission Rules</h1>
                    <p className="mt-1 text-muted-foreground">
                        Understand how your commissions are calculated and paid
                    </p>
                </div>

                {/* Commission Rate */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-primary" />
                            Commission Rate
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-4">
                            <div>
                                <div className="text-3xl font-bold text-primary">
                                    20%
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Recurring Commission
                                </div>
                            </div>
                            <Badge
                                variant="secondary"
                                className="px-4 py-2 text-lg"
                            >
                                First Successful Payment
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            You earn 20% of the first successful payment from
                            each referred client. This commission is calculated
                            on the payment amount captured by our payment
                            processor.
                        </p>
                        <div className="rounded-lg border bg-muted/30 p-4">
                            <div className="mb-2 text-sm font-medium">
                                Example:
                            </div>
                            <div className="text-sm text-muted-foreground">
                                If your referred client's first payment is{' '}
                                <strong>$500</strong>, your commission would be{' '}
                                <strong>$100</strong> (20% × $500).
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Clawback Window */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            30-Day Clawback Window
                        </CardTitle>
                        <CardDescription>
                            Refunds within 30 days affect your commission
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-lg border p-4">
                                <div className="mb-2 font-medium">
                                    Full Refund
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    If a client receives a full refund within 30
                                    days of their payment, the commission is
                                    fully clawed back (reversed).
                                </p>
                            </div>
                            <div className="rounded-lg border p-4">
                                <div className="mb-2 font-medium">
                                    Partial Refund
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    If a client receives a partial refund within
                                    30 days, your commission is reduced
                                    proportionally.
                                </p>
                            </div>
                        </div>
                        <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
                            <div className="mb-2 flex items-center gap-2 font-medium text-green-600">
                                <CheckCircle2 className="h-4 w-4" />
                                After 30 Days
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Refunds after the 30-day window do not affect
                                your commission. Once the clawback period
                                passes, your commission is protected.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Payout Cutoff */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            15th of Month Cutoff
                        </CardTitle>
                        <CardDescription>
                            When commissions become payable
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 rounded-lg border p-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                    1
                                </div>
                                <div>
                                    <div className="font-medium">
                                        Earned on or before the 15th
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Commissions earned on or before the 15th
                                        of a month become payable on the 1st of
                                        the following month.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 rounded-lg border p-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                    2
                                </div>
                                <div>
                                    <div className="font-medium">
                                        Earned after the 15th
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Commissions earned after the 15th become
                                        payable on the 1st of the month after
                                        next.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-lg border bg-muted/30 p-4">
                            <div className="mb-3 text-sm font-medium">
                                Example Timeline:
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                <Badge variant="outline">Earned: Jan 10</Badge>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                <Badge variant="outline">Payable: Feb 1</Badge>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                                <Badge variant="outline">Earned: Jan 20</Badge>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                <Badge variant="outline">Payable: Mar 1</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payout Schedule */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            Payout Schedule
                        </CardTitle>
                        <CardDescription>
                            When and how you get paid
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-lg border p-4 text-center">
                                <div className="text-2xl font-bold text-primary">
                                    1st
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    of each month
                                </div>
                            </div>
                            <div className="rounded-lg border p-4 text-center">
                                <div className="text-2xl font-bold">or</div>
                                <div className="text-sm text-muted-foreground">
                                    next business day
                                </div>
                            </div>
                            <div className="rounded-lg border p-4 text-center">
                                <div className="text-2xl font-bold text-primary">
                                    ACH
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Direct Deposit
                                </div>
                            </div>
                        </div>
                        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                            <div className="mb-2 flex items-center gap-2 font-medium text-blue-600">
                                <Info className="h-4 w-4" />
                                Weekend & Holiday Adjustment
                            </div>
                            <p className="text-sm text-muted-foreground">
                                If the 1st falls on a Saturday, payouts are
                                processed the following Monday. If it falls on a
                                Sunday, payouts are processed the following
                                Monday.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Commission Statuses */}
                <Card>
                    <CardHeader>
                        <CardTitle>Commission Statuses</CardTitle>
                        <CardDescription>
                            Understanding what each status means
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 rounded-lg border p-3">
                                <Badge
                                    variant="outline"
                                    className="border-yellow-500/20 bg-yellow-500/10 text-yellow-600"
                                >
                                    Pending
                                </Badge>
                                <p className="text-sm text-muted-foreground">
                                    Commission is being processed. Usually means
                                    we're waiting for payment confirmation.
                                </p>
                            </div>
                            <div className="flex items-start gap-3 rounded-lg border p-3">
                                <Badge
                                    variant="outline"
                                    className="border-blue-500/20 bg-blue-500/10 text-blue-600"
                                >
                                    Earned
                                </Badge>
                                <p className="text-sm text-muted-foreground">
                                    Commission is confirmed but still within the
                                    30-day clawback window. Not yet eligible for
                                    payout.
                                </p>
                            </div>
                            <div className="flex items-start gap-3 rounded-lg border p-3">
                                <Badge
                                    variant="outline"
                                    className="border-green-500/20 bg-green-500/10 text-green-600"
                                >
                                    Payable
                                </Badge>
                                <p className="text-sm text-muted-foreground">
                                    Commission has passed the clawback window
                                    and is ready to be included in the next
                                    payout.
                                </p>
                            </div>
                            <div className="flex items-start gap-3 rounded-lg border p-3">
                                <Badge
                                    variant="outline"
                                    className="border-primary/20 bg-primary/10 text-primary"
                                >
                                    Paid
                                </Badge>
                                <p className="text-sm text-muted-foreground">
                                    Commission has been paid out to you via ACH
                                    transfer.
                                </p>
                            </div>
                            <div className="flex items-start gap-3 rounded-lg border p-3">
                                <Badge
                                    variant="outline"
                                    className="border-destructive/20 bg-destructive/10 text-destructive"
                                >
                                    Clawed Back
                                </Badge>
                                <p className="text-sm text-muted-foreground">
                                    Commission was reversed due to a refund
                                    within the 30-day window.
                                </p>
                            </div>
                            <div className="flex items-start gap-3 rounded-lg border p-3">
                                <Badge
                                    variant="outline"
                                    className="border-orange-500/20 bg-orange-500/10 text-orange-600"
                                >
                                    Disputed
                                </Badge>
                                <p className="text-sm text-muted-foreground">
                                    You've filed a dispute for this commission.
                                    Our team is reviewing it.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* FAQ */}
                <Card>
                    <CardHeader>
                        <CardTitle>Frequently Asked Questions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-lg border p-4">
                            <div className="mb-2 font-medium">
                                Why is my commission still "Earned" instead of
                                "Payable"?
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Commissions remain in "Earned" status during the
                                30-day clawback window. Once this period passes
                                and the cutoff rules are met, it will become
                                "Payable."
                            </p>
                        </div>
                        <div className="rounded-lg border p-4">
                            <div className="mb-2 font-medium">
                                What if I disagree with a commission amount?
                            </div>
                            <p className="text-sm text-muted-foreground">
                                You can file a dispute from the commission
                                details. Our team will review and respond within
                                5 business days.
                            </p>
                        </div>
                        <div className="rounded-lg border p-4">
                            <div className="mb-2 font-medium">
                                How do I update my payout information?
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Go to Settings → Payout Settings to update your
                                bank information. Note: Changes require a
                                24-hour security hold before taking effect.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
