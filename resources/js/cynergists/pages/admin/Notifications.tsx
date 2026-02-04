import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import {
    AlertCircle,
    AlertTriangle,
    Bell,
    CheckCircle,
    ExternalLink,
    Filter,
    Info,
    RefreshCw,
    Search,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Notification {
    id: string;
    severity: 'info' | 'warning' | 'critical';
    category: string;
    title: string;
    details: string | null;
    resource_type: string | null;
    resource_id: string | null;
    created_at: string;
    resolved_at: string | null;
    resolved_by: string | null;
    resolution_notes: string | null;
}

const severityConfig = {
    info: {
        icon: Info,
        color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    },
    warning: {
        icon: AlertTriangle,
        color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    },
    critical: {
        icon: AlertCircle,
        color: 'bg-destructive/10 text-destructive border-destructive/20',
    },
};

const categoryLabels: Record<string, string> = {
    webhook: 'Webhooks',
    payout: 'Payouts',
    report: 'Reports',
    fraud: 'Fraud',
    permissions: 'Permissions',
    integrity: 'Data Integrity',
    payment: 'Payments',
    commission: 'Commissions',
};

export default function AdminNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [severityFilter, setSeverityFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [showResolved, setShowResolved] = useState(false);
    const [selectedNotification, setSelectedNotification] =
        useState<Notification | null>(null);
    const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [resolving, setResolving] = useState(false);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false });

            if (!showResolved) {
                query = query.is('resolved_at', null);
            }

            const { data, error } = await query;

            if (error) throw error;
            setNotifications((data as Notification[]) || []);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [showResolved]);

    const handleResolve = async () => {
        if (!selectedNotification) return;

        try {
            setResolving(true);
            const { error } = await supabase
                .from('notifications')
                .update({
                    resolved_at: new Date().toISOString(),
                    resolution_notes: resolutionNotes || null,
                })
                .eq('id', selectedNotification.id);

            if (error) throw error;

            toast.success('Notification resolved');
            setResolveDialogOpen(false);
            setResolutionNotes('');
            setSelectedNotification(null);
            fetchNotifications();
        } catch (error) {
            console.error('Failed to resolve notification:', error);
            toast.error('Failed to resolve notification');
        } finally {
            setResolving(false);
        }
    };

    const filteredNotifications = notifications.filter((n) => {
        if (severityFilter !== 'all' && n.severity !== severityFilter)
            return false;
        if (categoryFilter !== 'all' && n.category !== categoryFilter)
            return false;
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            return (
                n.title.toLowerCase().includes(search) ||
                n.details?.toLowerCase().includes(search) ||
                n.category.toLowerCase().includes(search)
            );
        }
        return true;
    });

    const stats = {
        total: notifications.length,
        critical: notifications.filter(
            (n) => n.severity === 'critical' && !n.resolved_at,
        ).length,
        warning: notifications.filter(
            (n) => n.severity === 'warning' && !n.resolved_at,
        ).length,
        info: notifications.filter(
            (n) => n.severity === 'info' && !n.resolved_at,
        ).length,
    };

    const getResourceLink = (notification: Notification): string | null => {
        if (!notification.resource_type) return null;

        const routes: Record<string, string> = {
            partner: '/admin/partners',
            payment: '/admin/payments',
            partner_commissions: '/admin/commissions',
            partner_payouts: '/admin/payouts',
            webhook_events: '/admin/tracking',
            partner_report_runs: '/admin/tracking',
            partner_scheduled_reports: '/admin/tracking',
        };

        return routes[notification.resource_type] || null;
    };

    return (
        <div className="p-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold">
                            <Bell className="h-6 w-6" />
                            System Notifications
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Monitor system alerts and issues
                        </p>
                    </div>
                    <Button
                        onClick={fetchNotifications}
                        variant="outline"
                        size="sm"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="rounded-lg border bg-card p-4">
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <div className="text-sm text-muted-foreground">
                            Total
                        </div>
                    </div>
                    <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
                        <div className="text-2xl font-bold text-destructive">
                            {stats.critical}
                        </div>
                        <div className="text-sm text-destructive">Critical</div>
                    </div>
                    <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
                        <div className="text-2xl font-bold text-yellow-500">
                            {stats.warning}
                        </div>
                        <div className="text-sm text-yellow-500">Warning</div>
                    </div>
                    <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
                        <div className="text-2xl font-bold text-blue-500">
                            {stats.info}
                        </div>
                        <div className="text-sm text-blue-500">Info</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative max-w-sm flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search notifications..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select
                        value={severityFilter}
                        onValueChange={setSeverityFilter}
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Severity" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Severity</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="warning">Warning</SelectItem>
                            <SelectItem value="info">Info</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={categoryFilter}
                        onValueChange={setCategoryFilter}
                    >
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {Object.entries(categoryLabels).map(
                                ([key, label]) => (
                                    <SelectItem key={key} value={key}>
                                        {label}
                                    </SelectItem>
                                ),
                            )}
                        </SelectContent>
                    </Select>
                    <Button
                        variant={showResolved ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => setShowResolved(!showResolved)}
                    >
                        <Filter className="mr-2 h-4 w-4" />
                        {showResolved ? 'Showing Resolved' : 'Show Resolved'}
                    </Button>
                </div>

                {/* Table */}
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">
                                    Severity
                                </TableHead>
                                <TableHead className="w-[120px]">
                                    Category
                                </TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead className="w-[160px]">
                                    Created
                                </TableHead>
                                <TableHead className="w-[100px]">
                                    Status
                                </TableHead>
                                <TableHead className="w-[120px]">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-8 text-center"
                                    >
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : filteredNotifications.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        No notifications found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredNotifications.map((notification) => {
                                    const config =
                                        severityConfig[notification.severity];
                                    const Icon = config.icon;
                                    const resourceLink =
                                        getResourceLink(notification);

                                    return (
                                        <TableRow key={notification.id}>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={config.color}
                                                >
                                                    <Icon className="mr-1 h-3 w-3" />
                                                    {notification.severity}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">
                                                    {categoryLabels[
                                                        notification.category
                                                    ] || notification.category}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {notification.title}
                                                    </div>
                                                    {notification.details && (
                                                        <div className="line-clamp-1 text-sm text-muted-foreground">
                                                            {
                                                                notification.details
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {format(
                                                    new Date(
                                                        notification.created_at,
                                                    ),
                                                    'MMM d, h:mm a',
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {notification.resolved_at ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-green-500/20 bg-green-500/10 text-green-500"
                                                    >
                                                        <CheckCircle className="mr-1 h-3 w-3" />
                                                        Resolved
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">
                                                        Open
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {!notification.resolved_at && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedNotification(
                                                                    notification,
                                                                );
                                                                setResolveDialogOpen(
                                                                    true,
                                                                );
                                                            }}
                                                        >
                                                            Resolve
                                                        </Button>
                                                    )}
                                                    {resourceLink && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <a
                                                                href={
                                                                    resourceLink
                                                                }
                                                            >
                                                                <ExternalLink className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Resolve Dialog */}
            <Dialog
                open={resolveDialogOpen}
                onOpenChange={setResolveDialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Resolve Notification</DialogTitle>
                        <DialogDescription>
                            Mark this notification as resolved. Optionally add
                            notes about the resolution.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedNotification && (
                        <div className="space-y-4">
                            <div className="rounded-lg bg-muted p-4">
                                <div className="font-medium">
                                    {selectedNotification.title}
                                </div>
                                {selectedNotification.details && (
                                    <div className="mt-1 text-sm text-muted-foreground">
                                        {selectedNotification.details}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium">
                                    Resolution Notes (optional)
                                </label>
                                <Textarea
                                    placeholder="What was done to resolve this issue?"
                                    value={resolutionNotes}
                                    onChange={(e) =>
                                        setResolutionNotes(e.target.value)
                                    }
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setResolveDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleResolve} disabled={resolving}>
                            {resolving ? 'Resolving...' : 'Mark Resolved'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
