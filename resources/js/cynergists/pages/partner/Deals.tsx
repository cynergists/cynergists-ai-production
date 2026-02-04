import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { usePartnerContext } from '@/contexts/PartnerContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
    ArrowUpRight,
    Briefcase,
    CheckCircle2,
    Clock,
    Filter,
    Search,
    TrendingUp,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Deal {
    id: string;
    client_name: string;
    client_email: string | null;
    stage: string;
    deal_value: number;
    expected_close_date: string | null;
    closed_at: string | null;
    created_at: string;
}

const stageConfig: Record<
    string,
    { label: string; icon: React.ComponentType<any>; className: string }
> = {
    new: {
        label: 'New',
        icon: Clock,
        className:
            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    },
    in_progress: {
        label: 'In Progress',
        icon: ArrowUpRight,
        className:
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    closed_won: {
        label: 'Closed Won',
        icon: CheckCircle2,
        className:
            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    },
    closed_lost: {
        label: 'Closed Lost',
        icon: XCircle,
        className:
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    },
};

export default function PartnerDeals() {
    const { partner, status } = usePartnerContext();
    const [deals, setDeals] = useState<Deal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [stageFilter, setStageFilter] = useState<string>('all');
    const { toast } = useToast();

    useEffect(() => {
        fetchDeals();
    }, [partner?.id]);

    const fetchDeals = async () => {
        if (!partner?.id) return;

        try {
            const { data, error } = await supabase
                .from('partner_deals')
                .select('*')
                .eq('partner_id', partner.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDeals(data || []);
        } catch (error) {
            console.error('Error fetching deals:', error);
            toast({
                title: 'Error',
                description: 'Failed to load deals',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const filteredDeals = deals.filter((deal) => {
        const matchesSearch =
            deal.client_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            deal.client_email
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase());

        const matchesStage =
            stageFilter === 'all' || deal.stage === stageFilter;

        return matchesSearch && matchesStage;
    });

    // Calculate summary stats
    const totalValue = deals.reduce((sum, deal) => sum + deal.deal_value, 0);
    const wonValue = deals
        .filter((d) => d.stage === 'closed_won')
        .reduce((sum, deal) => sum + deal.deal_value, 0);
    const openDeals = deals.filter(
        (d) => d.stage === 'new' || d.stage === 'in_progress',
    ).length;
    const wonDeals = deals.filter((d) => d.stage === 'closed_won').length;

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">Deals</h1>
                <p className="mt-1 text-muted-foreground">
                    Track the progress of your referred deals
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Deals
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{deals.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Open Deals
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {openDeals}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Won Deals
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {wonDeals}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Won Value
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">
                            {formatCurrency(wonValue)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="py-4">
                    <div className="flex flex-col gap-4 md:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by client name or email..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select
                            value={stageFilter}
                            onValueChange={setStageFilter}
                        >
                            <SelectTrigger className="w-[180px]">
                                <Filter className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Filter by stage" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Stages</SelectItem>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="in_progress">
                                    In Progress
                                </SelectItem>
                                <SelectItem value="closed_won">
                                    Closed Won
                                </SelectItem>
                                <SelectItem value="closed_lost">
                                    Closed Lost
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Deals Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Deals</CardTitle>
                    <CardDescription>
                        {filteredDeals.length} deal
                        {filteredDeals.length !== 1 ? 's' : ''} found
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : filteredDeals.length === 0 ? (
                        <div className="py-12 text-center">
                            <Briefcase className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="mb-2 text-lg font-semibold text-foreground">
                                No deals yet
                            </h3>
                            <p className="text-muted-foreground">
                                When your referrals convert to deals, they'll
                                appear here.
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Deal Value</TableHead>
                                    <TableHead>Stage</TableHead>
                                    <TableHead>Expected Close</TableHead>
                                    <TableHead>Created</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredDeals.map((deal) => {
                                    const stageInfo =
                                        stageConfig[deal.stage] ||
                                        stageConfig.new;
                                    const StageIcon = stageInfo.icon;

                                    return (
                                        <TableRow key={deal.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">
                                                        {deal.client_name}
                                                    </p>
                                                    {deal.client_email && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {deal.client_email}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-semibold">
                                                    {formatCurrency(
                                                        deal.deal_value,
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        stageInfo.className
                                                    }
                                                >
                                                    <StageIcon className="mr-1 h-3 w-3" />
                                                    {stageInfo.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {deal.stage === 'closed_won' &&
                                                deal.closed_at ? (
                                                    <span className="text-sm text-green-600">
                                                        Won{' '}
                                                        {new Date(
                                                            deal.closed_at,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                ) : deal.stage ===
                                                  'closed_lost' ? (
                                                    <span className="text-sm text-red-600">
                                                        Lost
                                                    </span>
                                                ) : deal.expected_close_date ? (
                                                    <span className="text-sm text-muted-foreground">
                                                        {new Date(
                                                            deal.expected_close_date,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-muted-foreground">
                                                    {new Date(
                                                        deal.created_at,
                                                    ).toLocaleDateString()}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Info Card */}
            <Card>
                <CardContent className="py-6">
                    <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">
                                Deal Stages
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Deal stages are updated by our team as they
                                progress through the sales pipeline. You'll earn
                                a commission when a deal closes and the first
                                payment is captured.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
