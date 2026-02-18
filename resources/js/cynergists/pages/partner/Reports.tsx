import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePartnerContext } from '@/contexts/PartnerContext';
import { apiClient } from '@/lib/api-client';
import { format } from 'date-fns';
import {
    Calendar,
    Download,
    FileBarChart,
    Loader2,
    Lock,
    Play,
    Plus,
    ToggleLeft,
    ToggleRight,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ScheduledReport {
    id: string;
    schedule_type: string;
    report_type: string;
    format_pdf: boolean;
    format_csv: boolean;
    day_of_week: number | null;
    day_of_month: number | null;
    detail_level: string;
    email_to: string | null;
    is_active: boolean;
    next_run_at: string;
    last_run_at: string | null;
}

interface ReportRun {
    id: string;
    period_start: string;
    period_end: string;
    generated_at: string;
    status: string;
    pdf_url: string | null;
    csv_commissions_url: string | null;
    csv_payouts_url: string | null;
    error_message: string | null;
}

const DAY_NAMES = [
    '',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
];

export default function PartnerReports() {
    const { status, partner } = usePartnerContext();
    const [schedules, setSchedules] = useState<ScheduledReport[]>([]);
    const [reportRuns, setReportRuns] = useState<ReportRun[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [runningNow, setRunningNow] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const [newSchedule, setNewSchedule] = useState({
        schedule_type: 'monthly',
        report_type: 'combined',
        format_pdf: true,
        format_csv: true,
        day_of_week: 1,
        day_of_month: 1,
        detail_level: 'detailed',
        email_to: '',
    });

    useEffect(() => {
        if (partner?.id && status === 'active') {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [partner?.id, status]);

    const fetchData = async () => {
        if (!partner?.id) return;

        setLoading(true);
        try {
            const [schedulesRes, runsRes] = await Promise.all([
                supabase
                    .from('partner_scheduled_reports')
                    .select('*')
                    .eq('partner_id', partner.id)
                    .order('created_at', { ascending: false }),
                supabase
                    .from('report_runs')
                    .select('*')
                    .eq('partner_id', partner.id)
                    .order('generated_at', { ascending: false })
                    .limit(20),
            ]);

            if (schedulesRes.error) throw schedulesRes.error;
            if (runsRes.error) throw runsRes.error;

            setSchedules(
                (schedulesRes.data || []) as unknown as ScheduledReport[],
            );
            setReportRuns((runsRes.data || []) as unknown as ReportRun[]);
        } catch (error) {
            console.error('Error fetching reports data:', error);
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const createSchedule = async () => {
        if (!partner?.id) return;

        setCreating(true);
        try {
            const nextRunAt = new Date();
            nextRunAt.setDate(nextRunAt.getDate() + 7);

            const { error } = await supabase
                .from('partner_scheduled_reports')
                .insert({
                    partner_id: partner.id,
                    schedule_type: newSchedule.schedule_type,
                    report_type: newSchedule.report_type,
                    format_pdf: newSchedule.format_pdf,
                    format_csv: newSchedule.format_csv,
                    day_of_week: ['weekly', 'biweekly'].includes(
                        newSchedule.schedule_type,
                    )
                        ? newSchedule.day_of_week
                        : null,
                    day_of_month: ['monthly', 'quarterly'].includes(
                        newSchedule.schedule_type,
                    )
                        ? newSchedule.day_of_month
                        : null,
                    detail_level: newSchedule.detail_level,
                    email_to: newSchedule.email_to || partner.email,
                    is_active: true,
                    next_run_at: nextRunAt.toISOString(),
                });

            if (error) throw error;

            toast.success('Report schedule created');
            setDialogOpen(false);
            fetchData();
        } catch (error) {
            console.error('Error creating schedule:', error);
            toast.error('Failed to create schedule');
        } finally {
            setCreating(false);
        }
    };

    const toggleSchedule = async (scheduleId: string, isActive: boolean) => {
        try {
            const { error } = await supabase
                .from('partner_scheduled_reports')
                .update({ is_active: !isActive })
                .eq('id', scheduleId);

            if (error) throw error;

            toast.success(isActive ? 'Schedule disabled' : 'Schedule enabled');
            fetchData();
        } catch (error) {
            console.error('Error toggling schedule:', error);
            toast.error('Failed to update schedule');
        }
    };

    const runNow = async (schedule: ScheduledReport) => {
        if (!partner?.id) return;

        setRunningNow(schedule.id);
        try {
            const periodEnd = new Date();
            const periodStart = new Date();

            switch (schedule.schedule_type) {
                case 'weekly':
                    periodStart.setDate(periodStart.getDate() - 7);
                    break;
                case 'biweekly':
                    periodStart.setDate(periodStart.getDate() - 14);
                    break;
                case 'monthly':
                    periodStart.setDate(periodStart.getDate() - 30);
                    break;
                case 'quarterly':
                    periodStart.setDate(periodStart.getDate() - 90);
                    break;
            }

            const { data, error } = await supabase.functions.invoke(
                'generate-partner-report',
                {
                    body: {
                        report_id: schedule.id,
                        partner_id: partner.id,
                        period_start: periodStart.toISOString(),
                        period_end: periodEnd.toISOString(),
                        report_type: schedule.report_type,
                        format_pdf: schedule.format_pdf,
                        format_csv: schedule.format_csv,
                        detail_level: schedule.detail_level,
                        email_to: schedule.email_to || partner.email,
                    },
                },
            );

            if (error) throw error;

            toast.success('Report generated and sent to your email');
            fetchData();
        } catch (error) {
            console.error('Error running report:', error);
            toast.error('Failed to generate report');
        } finally {
            setRunningNow(null);
        }
    };

    if (status !== 'active') {
        return (
            <div className="flex min-h-[60vh] items-center justify-center p-6">
                <Card className="max-w-md text-center">
                    <CardHeader>
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <Lock className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <CardTitle>Reports Locked</CardTitle>
                        <CardDescription>
                            Report scheduling is available for active partners
                            only.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Reports
                    </h1>
                    <p className="text-muted-foreground">
                        Schedule and download commission reports.
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Schedule
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Report Schedule</DialogTitle>
                            <DialogDescription>
                                Set up automated commission and payout reports.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Cadence</Label>
                                <Select
                                    value={newSchedule.schedule_type}
                                    onValueChange={(v) =>
                                        setNewSchedule({
                                            ...newSchedule,
                                            schedule_type: v,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="weekly">
                                            Weekly
                                        </SelectItem>
                                        <SelectItem value="biweekly">
                                            Biweekly
                                        </SelectItem>
                                        <SelectItem value="monthly">
                                            Monthly
                                        </SelectItem>
                                        <SelectItem value="quarterly">
                                            Quarterly
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {['weekly', 'biweekly'].includes(
                                newSchedule.schedule_type,
                            ) && (
                                <div className="space-y-2">
                                    <Label>Day of Week</Label>
                                    <Select
                                        value={String(newSchedule.day_of_week)}
                                        onValueChange={(v) =>
                                            setNewSchedule({
                                                ...newSchedule,
                                                day_of_week: parseInt(v),
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                                                <SelectItem
                                                    key={d}
                                                    value={String(d)}
                                                >
                                                    {DAY_NAMES[d]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {['monthly', 'quarterly'].includes(
                                newSchedule.schedule_type,
                            ) && (
                                <div className="space-y-2">
                                    <Label>Day of Month</Label>
                                    <Select
                                        value={String(newSchedule.day_of_month)}
                                        onValueChange={(v) =>
                                            setNewSchedule({
                                                ...newSchedule,
                                                day_of_month: parseInt(v),
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from(
                                                { length: 28 },
                                                (_, i) => i + 1,
                                            ).map((d) => (
                                                <SelectItem
                                                    key={d}
                                                    value={String(d)}
                                                >
                                                    {d}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Report Type</Label>
                                <Select
                                    value={newSchedule.report_type}
                                    onValueChange={(v) =>
                                        setNewSchedule({
                                            ...newSchedule,
                                            report_type: v,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="combined">
                                            Combined (Commissions + Payouts)
                                        </SelectItem>
                                        <SelectItem value="commissions">
                                            Commissions Only
                                        </SelectItem>
                                        <SelectItem value="payouts">
                                            Payouts Only
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Detail Level</Label>
                                <Select
                                    value={newSchedule.detail_level}
                                    onValueChange={(v) =>
                                        setNewSchedule({
                                            ...newSchedule,
                                            detail_level: v,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="detailed">
                                            Detailed (with tables)
                                        </SelectItem>
                                        <SelectItem value="summary">
                                            Summary only
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="pdf"
                                        checked={newSchedule.format_pdf}
                                        onCheckedChange={(c) =>
                                            setNewSchedule({
                                                ...newSchedule,
                                                format_pdf: !!c,
                                            })
                                        }
                                    />
                                    <Label htmlFor="pdf">PDF</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="csv"
                                        checked={newSchedule.format_csv}
                                        onCheckedChange={(c) =>
                                            setNewSchedule({
                                                ...newSchedule,
                                                format_csv: !!c,
                                            })
                                        }
                                    />
                                    <Label htmlFor="csv">CSV</Label>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Email To (optional)</Label>
                                <Input
                                    placeholder={partner?.email || 'Your email'}
                                    value={newSchedule.email_to}
                                    onChange={(e) =>
                                        setNewSchedule({
                                            ...newSchedule,
                                            email_to: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <Button
                                className="w-full"
                                onClick={createSchedule}
                                disabled={creating}
                            >
                                {creating && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Create Schedule
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="schedules">
                <TabsList>
                    <TabsTrigger value="schedules">Schedules</TabsTrigger>
                    <TabsTrigger value="history">Report History</TabsTrigger>
                </TabsList>

                <TabsContent value="schedules" className="mt-4">
                    {loading ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                            </CardContent>
                        </Card>
                    ) : schedules.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                <p className="text-muted-foreground">
                                    No report schedules yet. Create one to get
                                    started.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Cadence</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Next Run</TableHead>
                                        <TableHead>Last Run</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {schedules.map((s) => (
                                        <TableRow key={s.id}>
                                            <TableCell className="capitalize">
                                                {s.schedule_type}
                                            </TableCell>
                                            <TableCell className="capitalize">
                                                {s.report_type}
                                            </TableCell>
                                            <TableCell>
                                                {format(
                                                    new Date(s.next_run_at),
                                                    'MMM d, yyyy',
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {s.last_run_at
                                                    ? format(
                                                          new Date(
                                                              s.last_run_at,
                                                          ),
                                                          'MMM d, yyyy',
                                                      )
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        s.is_active
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {s.is_active
                                                        ? 'Active'
                                                        : 'Disabled'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            runNow(s)
                                                        }
                                                        disabled={
                                                            runningNow === s.id
                                                        }
                                                    >
                                                        {runningNow === s.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Play className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            toggleSchedule(
                                                                s.id,
                                                                s.is_active,
                                                            )
                                                        }
                                                    >
                                                        {s.is_active ? (
                                                            <ToggleRight className="h-4 w-4" />
                                                        ) : (
                                                            <ToggleLeft className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="history" className="mt-4">
                    {loading ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                            </CardContent>
                        </Card>
                    ) : reportRuns.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <FileBarChart className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                <p className="text-muted-foreground">
                                    No reports generated yet.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Generated</TableHead>
                                        <TableHead>Period</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Downloads</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reportRuns.map((r) => (
                                        <TableRow key={r.id}>
                                            <TableCell>
                                                {format(
                                                    new Date(r.generated_at),
                                                    'MMM d, yyyy h:mm a',
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {format(
                                                    new Date(r.period_start),
                                                    'MMM d',
                                                )}{' '}
                                                -{' '}
                                                {format(
                                                    new Date(r.period_end),
                                                    'MMM d, yyyy',
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        r.status === 'emailed'
                                                            ? 'default'
                                                            : r.status ===
                                                                'failed'
                                                              ? 'destructive'
                                                              : 'secondary'
                                                    }
                                                >
                                                    {r.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {r.pdf_url && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            asChild
                                                        >
                                                            <a
                                                                href={r.pdf_url}
                                                                target="_blank"
                                                                rel="noopener"
                                                            >
                                                                <Download className="mr-1 h-4 w-4" />{' '}
                                                                PDF
                                                            </a>
                                                        </Button>
                                                    )}
                                                    {r.csv_commissions_url && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            asChild
                                                        >
                                                            <a
                                                                href={
                                                                    r.csv_commissions_url
                                                                }
                                                                target="_blank"
                                                                rel="noopener"
                                                            >
                                                                <Download className="mr-1 h-4 w-4" />{' '}
                                                                CSV
                                                            </a>
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
