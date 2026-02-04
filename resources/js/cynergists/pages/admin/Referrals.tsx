import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    AlertTriangle,
    CheckCircle,
    Copy,
    ExternalLink,
    Loader2,
    Search,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Referral {
    id: string;
    partner_id: string;
    deal_id: string | null;
    lead_name: string | null;
    lead_email: string | null;
    lead_phone: string | null;
    lead_company: string | null;
    first_name: string | null;
    last_name: string | null;
    status: string;
    source: string | null;
    event_type: string | null;
    duplicate: boolean;
    needs_approval: boolean;
    rejection_reason: string | null;
    notes: string | null;
    created_at: string;
    partners?: {
        first_name: string | null;
        last_name: string | null;
        slug: string;
    };
}

const statusConfig: Record<
    string,
    {
        label: string;
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
    }
> = {
    new: { label: 'New', variant: 'default' },
    accepted: { label: 'Accepted', variant: 'secondary' },
    qualified: { label: 'Qualified', variant: 'secondary' },
    converted: { label: 'Converted', variant: 'default' },
    rejected: { label: 'Rejected', variant: 'destructive' },
};

export default function AdminReferrals() {
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [needsApprovalFilter, setNeedsApprovalFilter] =
        useState<string>('all');
    const [duplicateFilter, setDuplicateFilter] = useState<string>('all');
    const [selectedReferral, setSelectedReferral] = useState<Referral | null>(
        null,
    );
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const fetchReferrals = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('referrals')
                .select('*, partners(first_name, last_name, slug)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            // Cast to handle new columns not yet in types
            setReferrals((data as unknown as Referral[]) || []);
        } catch (error) {
            console.error('Error fetching referrals:', error);
            toast.error('Failed to load referrals');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReferrals();
    }, []);

    const filteredReferrals = referrals.filter((r) => {
        const matchesSearch =
            !searchQuery ||
            r.lead_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.lead_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.lead_phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.lead_company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.partners?.slug?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            statusFilter === 'all' || r.status === statusFilter;
        const matchesNeedsApproval =
            needsApprovalFilter === 'all' ||
            (needsApprovalFilter === 'yes' && r.needs_approval) ||
            (needsApprovalFilter === 'no' && !r.needs_approval);
        const matchesDuplicate =
            duplicateFilter === 'all' ||
            (duplicateFilter === 'yes' && r.duplicate) ||
            (duplicateFilter === 'no' && !r.duplicate);
        return (
            matchesSearch &&
            matchesStatus &&
            matchesNeedsApproval &&
            matchesDuplicate
        );
    });

    const handleAccept = async (referral: Referral) => {
        setIsUpdating(true);
        try {
            // Update referral status to accepted
            const { error: updateError } = await supabase
                .from('referrals')
                .update({ status: 'accepted', needs_approval: false })
                .eq('id', referral.id);

            if (updateError) throw updateError;

            // If deal exists, ensure partner_id is set and add note
            if (referral.deal_id) {
                await supabase
                    .from('partner_deals')
                    .update({
                        partner_id: referral.partner_id,
                        last_activity_at: new Date().toISOString(),
                    })
                    .eq('id', referral.deal_id);

                // Add deal note (cast to any since RPC not yet in generated types)
                await (supabase.rpc as any)('add_deal_note', {
                    p_deal_id: referral.deal_id,
                    p_note_text: 'Referral accepted by admin',
                    p_note_type: 'system',
                });
            } else {
                // Create new deal
                const leadName =
                    [referral.first_name, referral.last_name]
                        .filter(Boolean)
                        .join(' ') ||
                    referral.lead_name ||
                    'Unknown';
                const { data: newDeal, error: dealError } = await supabase
                    .from('partner_deals')
                    .insert({
                        partner_id: referral.partner_id,
                        client_name: leadName,
                        client_email: referral.lead_email,
                        client_phone: referral.lead_phone,
                        client_company: referral.lead_company,
                        stage: 'new',
                        deal_value: 0,
                        referral_id: referral.id,
                        timeline: [
                            {
                                timestamp: new Date().toISOString(),
                                type: 'created',
                                message: 'Deal created from accepted referral',
                            },
                        ],
                    })
                    .select()
                    .single();

                if (dealError) throw dealError;

                // Link deal to referral
                await supabase
                    .from('referrals')
                    .update({ deal_id: newDeal.id })
                    .eq('id', referral.id);

                // Add deal note (cast to any since RPC not yet in generated types)
                await (supabase.rpc as any)('add_deal_note', {
                    p_deal_id: newDeal.id,
                    p_note_text: 'Deal created from accepted referral',
                    p_note_type: 'system',
                });
            }

            toast.success('Referral accepted');
            fetchReferrals();
            setIsDetailOpen(false);
        } catch (error) {
            console.error('Error accepting referral:', error);
            toast.error('Failed to accept referral');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleReject = async () => {
        if (!selectedReferral || !rejectionReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }

        setIsUpdating(true);
        try {
            // Update referral status to rejected with reason (cast for new column)
            const { error: updateError } = await supabase
                .from('referrals')
                .update({
                    status: 'rejected',
                    needs_approval: false,
                    rejection_reason: rejectionReason.trim(),
                } as any)
                .eq('id', selectedReferral.id);

            if (updateError) throw updateError;

            // If deal exists, add note (but don't assign partner)
            if (selectedReferral.deal_id) {
                await (supabase.rpc as any)('add_deal_note', {
                    p_deal_id: selectedReferral.deal_id,
                    p_note_text: `Referral rejected by admin: ${rejectionReason.trim()}`,
                    p_note_type: 'admin',
                });
            }

            toast.success('Referral rejected');
            fetchReferrals();
            setIsRejectOpen(false);
            setIsDetailOpen(false);
            setRejectionReason('');
        } catch (error) {
            console.error('Error rejecting referral:', error);
            toast.error('Failed to reject referral');
        } finally {
            setIsUpdating(false);
        }
    };

    const getPartnerName = (r: Referral) => {
        if (r.partners) {
            return (
                [r.partners.first_name, r.partners.last_name]
                    .filter(Boolean)
                    .join(' ') || r.partners.slug
            );
        }
        return 'Unknown';
    };

    const getLeadName = (r: Referral) => {
        return (
            [r.first_name, r.last_name].filter(Boolean).join(' ') ||
            r.lead_name ||
            'N/A'
        );
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Referrals Queue</h1>
                    <p className="text-muted-foreground">
                        Manage partner referrals and link to deals
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 lg:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by email, name, phone, company, or partner..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Select
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                            >
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Status
                                    </SelectItem>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="accepted">
                                        Accepted
                                    </SelectItem>
                                    <SelectItem value="qualified">
                                        Qualified
                                    </SelectItem>
                                    <SelectItem value="converted">
                                        Converted
                                    </SelectItem>
                                    <SelectItem value="rejected">
                                        Rejected
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={needsApprovalFilter}
                                onValueChange={setNeedsApprovalFilter}
                            >
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Needs Approval" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="yes">
                                        Needs Approval
                                    </SelectItem>
                                    <SelectItem value="no">
                                        No Approval Needed
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={duplicateFilter}
                                onValueChange={setDuplicateFilter}
                            >
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Duplicates" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="yes">
                                        Duplicates
                                    </SelectItem>
                                    <SelectItem value="no">
                                        Unique Only
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Partner</TableHead>
                                        <TableHead>Lead Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Company</TableHead>
                                        <TableHead>Event</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Flags</TableHead>
                                        <TableHead>Deal</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredReferrals.map((r) => (
                                        <TableRow key={r.id}>
                                            <TableCell className="whitespace-nowrap">
                                                {format(
                                                    new Date(r.created_at),
                                                    'MMM d, yyyy',
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {getPartnerName(r)}
                                                </div>
                                                {r.partners?.slug && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {r.partners.slug}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {getLeadName(r)}
                                            </TableCell>
                                            <TableCell>
                                                {r.lead_email ? (
                                                    <div className="flex items-center gap-1">
                                                        <span className="max-w-[150px] truncate">
                                                            {r.lead_email}
                                                        </span>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-6 w-6"
                                                            onClick={() =>
                                                                copyToClipboard(
                                                                    r.lead_email!,
                                                                )
                                                            }
                                                        >
                                                            <Copy className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    '—'
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {r.lead_phone || '—'}
                                            </TableCell>
                                            <TableCell>
                                                {r.lead_company || '—'}
                                            </TableCell>
                                            <TableCell>
                                                {r.event_type ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        {r.event_type}
                                                    </Badge>
                                                ) : (
                                                    '—'
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        statusConfig[r.status]
                                                            ?.variant ||
                                                        'outline'
                                                    }
                                                >
                                                    {statusConfig[r.status]
                                                        ?.label || r.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    {r.needs_approval && (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-yellow-500/30 bg-yellow-500/10 text-xs text-yellow-600"
                                                        >
                                                            <AlertTriangle className="mr-1 h-3 w-3" />
                                                            Approval
                                                        </Badge>
                                                    )}
                                                    {r.duplicate && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            Dup
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {r.deal_id ? (
                                                    <Button
                                                        size="sm"
                                                        variant="link"
                                                        className="h-auto p-0"
                                                        onClick={() =>
                                                            router.visit(
                                                                `/admin/deals?dealId=${r.deal_id}`,
                                                            )
                                                        }
                                                    >
                                                        <ExternalLink className="mr-1 h-3 w-3" />
                                                        View
                                                    </Button>
                                                ) : (
                                                    '—'
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setSelectedReferral(
                                                                r,
                                                            );
                                                            setIsDetailOpen(
                                                                true,
                                                            );
                                                        }}
                                                    >
                                                        Details
                                                    </Button>
                                                    {r.status === 'new' && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="text-green-600"
                                                                onClick={() =>
                                                                    handleAccept(
                                                                        r,
                                                                    )
                                                                }
                                                            >
                                                                <CheckCircle className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="text-destructive"
                                                                onClick={() => {
                                                                    setSelectedReferral(
                                                                        r,
                                                                    );
                                                                    setIsRejectOpen(
                                                                        true,
                                                                    );
                                                                }}
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredReferrals.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={11}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                No referrals found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Referral Details</DialogTitle>
                    </DialogHeader>
                    {selectedReferral && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">
                                        Name:
                                    </span>{' '}
                                    {getLeadName(selectedReferral)}
                                </div>
                                <div>
                                    <span className="text-muted-foreground">
                                        Email:
                                    </span>{' '}
                                    {selectedReferral.lead_email || 'N/A'}
                                </div>
                                <div>
                                    <span className="text-muted-foreground">
                                        Phone:
                                    </span>{' '}
                                    {selectedReferral.lead_phone || 'N/A'}
                                </div>
                                <div>
                                    <span className="text-muted-foreground">
                                        Company:
                                    </span>{' '}
                                    {selectedReferral.lead_company || 'N/A'}
                                </div>
                                <div>
                                    <span className="text-muted-foreground">
                                        Partner:
                                    </span>{' '}
                                    {getPartnerName(selectedReferral)}
                                </div>
                                <div>
                                    <span className="text-muted-foreground">
                                        Source:
                                    </span>{' '}
                                    {selectedReferral.source || 'N/A'}
                                </div>
                                <div>
                                    <span className="text-muted-foreground">
                                        Event:
                                    </span>{' '}
                                    {selectedReferral.event_type || 'N/A'}
                                </div>
                                <div>
                                    <span className="text-muted-foreground">
                                        Status:
                                    </span>{' '}
                                    <Badge
                                        variant={
                                            statusConfig[
                                                selectedReferral.status
                                            ]?.variant
                                        }
                                    >
                                        {statusConfig[selectedReferral.status]
                                            ?.label || selectedReferral.status}
                                    </Badge>
                                </div>
                            </div>
                            {selectedReferral.duplicate && (
                                <Badge
                                    variant="outline"
                                    className="bg-orange-500/10 text-orange-600"
                                >
                                    Marked as Duplicate
                                </Badge>
                            )}
                            {selectedReferral.needs_approval && (
                                <Badge
                                    variant="outline"
                                    className="bg-yellow-500/10 text-yellow-600"
                                >
                                    Needs Approval
                                </Badge>
                            )}
                            {selectedReferral.notes && (
                                <div>
                                    <span className="text-sm text-muted-foreground">
                                        Notes:
                                    </span>
                                    <p className="mt-1 rounded bg-muted p-2 text-sm">
                                        {selectedReferral.notes}
                                    </p>
                                </div>
                            )}
                            {selectedReferral.rejection_reason && (
                                <div>
                                    <span className="text-sm text-muted-foreground">
                                        Rejection Reason:
                                    </span>
                                    <p className="mt-1 rounded bg-destructive/10 p-2 text-sm text-destructive">
                                        {selectedReferral.rejection_reason}
                                    </p>
                                </div>
                            )}
                            {selectedReferral.deal_id && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">
                                        Linked Deal:
                                    </span>
                                    <Button
                                        size="sm"
                                        variant="link"
                                        onClick={() =>
                                            router.visit(
                                                `/admin/deals?dealId=${selectedReferral.deal_id}`,
                                            )
                                        }
                                    >
                                        <ExternalLink className="mr-1 h-3 w-3" />
                                        View Deal
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        {selectedReferral?.status === 'new' && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsRejectOpen(true);
                                    }}
                                    disabled={isUpdating}
                                >
                                    Reject
                                </Button>
                                <Button
                                    onClick={() =>
                                        handleAccept(selectedReferral)
                                    }
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    Accept
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog
                open={isRejectOpen}
                onOpenChange={(open) => {
                    setIsRejectOpen(open);
                    if (!open) setRejectionReason('');
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Referral</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Please provide a reason for rejecting this referral.
                            This will be recorded but not shown to the partner.
                        </p>
                        <div>
                            <Label htmlFor="rejection-reason">
                                Rejection Reason *
                            </Label>
                            <Textarea
                                id="rejection-reason"
                                placeholder="e.g., Lead already exists in CRM, Invalid contact info, etc."
                                value={rejectionReason}
                                onChange={(e) =>
                                    setRejectionReason(e.target.value)
                                }
                                className="mt-1"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsRejectOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={isUpdating || !rejectionReason.trim()}
                        >
                            {isUpdating ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Reject Referral
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
