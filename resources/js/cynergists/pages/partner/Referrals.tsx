import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { usePartnerContext } from '@/contexts/PartnerContext';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    Copy,
    Filter,
    Plus,
    Search,
    Users,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Referral {
    id: string;
    lead_name: string | null;
    lead_email: string;
    lead_phone: string | null;
    lead_company: string | null;
    source: string;
    status: string;
    attribution_type: string;
    created_at: string;
    converted_at: string | null;
}

const statusConfig: Record<
    string,
    { label: string; icon: React.ComponentType<any>; className: string }
> = {
    new: {
        label: 'New',
        icon: Clock,
        className:
            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    },
    needs_approval: {
        label: 'Needs Approval',
        icon: AlertCircle,
        className:
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    qualified: {
        label: 'Qualified',
        icon: CheckCircle2,
        className:
            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    },
    converted: {
        label: 'Converted',
        icon: CheckCircle2,
        className:
            'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
    rejected: {
        label: 'Rejected',
        icon: XCircle,
        className:
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    },
};

const sourceLabels: Record<string, string> = {
    form_submit: 'Form Submit',
    booked_call: 'Booked Call',
    paid_checkout: 'Paid Checkout',
    deal_registration: 'Deal Registration',
};

export default function PartnerReferrals() {
    const { partner } = usePartnerContext();
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        lead_name: '',
        lead_email: '',
        lead_phone: '',
        lead_company: '',
        notes: '',
    });

    const partnerLink = partner?.slug
        ? `${window.location.origin}/p/${partner.slug}`
        : null;

    useEffect(() => {
        fetchReferrals();
    }, [partner?.id]);

    const fetchReferrals = async () => {
        if (!partner?.id) return;

        try {
            const data = await apiClient.get<Referral[]>('/partner/referrals');
            setReferrals(data || []);
        } catch (error) {
            console.error('Error fetching referrals:', error);
            toast({
                title: 'Error',
                description: 'Failed to load referrals',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitReferral = async () => {
        if (!formData.lead_email) {
            toast({
                title: 'Email required',
                description: "Please enter the lead's email address",
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await apiClient.post('/partner/referrals', {
                lead_name: formData.lead_name || null,
                lead_email: formData.lead_email,
                lead_phone: formData.lead_phone || null,
                lead_company: formData.lead_company || null,
                notes: formData.notes || null,
                source: 'deal_registration',
                attribution_type: 'deal_registration',
                status: 'new',
            });

            toast({
                title: 'Referral submitted!',
                description: 'Your referral has been registered successfully.',
            });

            setFormData({
                lead_name: '',
                lead_email: '',
                lead_phone: '',
                lead_company: '',
                notes: '',
            });
            setIsDialogOpen(false);
            fetchReferrals();
        } catch (error) {
            console.error('Error submitting referral:', error);
            toast({
                title: 'Error',
                description: 'Failed to submit referral. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyLink = () => {
        if (partnerLink) {
            navigator.clipboard.writeText(partnerLink);
            toast({
                title: 'Link copied!',
                description: 'Your referral link has been copied to clipboard.',
            });
        }
    };

    const filteredReferrals = referrals.filter((referral) => {
        const matchesSearch =
            referral.lead_email
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            referral.lead_name
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            referral.lead_company
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase());

        const matchesStatus =
            statusFilter === 'all' || referral.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Referrals
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Submit referrals and track their progress
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {partnerLink && (
                        <Button
                            variant="outline"
                            onClick={copyLink}
                            className="gap-2"
                        >
                            <Copy className="h-4 w-4" />
                            Copy Link
                        </Button>
                    )}

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Submit Referral
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Submit New Referral</DialogTitle>
                                <DialogDescription>
                                    Register a lead for deal attribution. This
                                    ensures you get credit if they become a
                                    client.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="lead_email">Email *</Label>
                                    <Input
                                        id="lead_email"
                                        type="email"
                                        placeholder="lead@company.com"
                                        value={formData.lead_email}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                lead_email: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lead_name">Full Name</Label>
                                    <Input
                                        id="lead_name"
                                        placeholder="John Smith"
                                        value={formData.lead_name}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                lead_name: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="lead_phone">
                                            Phone
                                        </Label>
                                        <Input
                                            id="lead_phone"
                                            placeholder="(555) 123-4567"
                                            value={formData.lead_phone}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    lead_phone: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lead_company">
                                            Company
                                        </Label>
                                        <Input
                                            id="lead_company"
                                            placeholder="Acme Inc"
                                            value={formData.lead_company}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    lead_company:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Any additional context about this referral..."
                                        value={formData.notes}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                notes: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmitReferral}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting
                                        ? 'Submitting...'
                                        : 'Submit Referral'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="py-4">
                    <div className="flex flex-col gap-4 md:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, email, or company..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                        >
                            <SelectTrigger className="w-[180px]">
                                <Filter className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="needs_approval">
                                    Needs Approval
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
                    </div>
                </CardContent>
            </Card>

            {/* Referrals Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Referrals</CardTitle>
                    <CardDescription>
                        {filteredReferrals.length} referral
                        {filteredReferrals.length !== 1 ? 's' : ''} found
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : filteredReferrals.length === 0 ? (
                        <div className="py-12 text-center">
                            <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="mb-2 text-lg font-semibold text-foreground">
                                No referrals yet
                            </h3>
                            <p className="mb-4 text-muted-foreground">
                                Submit your first referral or share your link to
                                start earning commissions.
                            </p>
                            <div className="flex justify-center gap-2">
                                <Button onClick={() => setIsDialogOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Submit Referral
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Lead</TableHead>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredReferrals.map((referral) => {
                                    const statusInfo =
                                        statusConfig[referral.status] ||
                                        statusConfig.new;
                                    const StatusIcon = statusInfo.icon;

                                    return (
                                        <TableRow key={referral.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">
                                                        {referral.lead_name ||
                                                            '—'}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {referral.lead_email}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {referral.lead_company || '—'}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">
                                                    {sourceLabels[
                                                        referral.source
                                                    ] || referral.source}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        statusInfo.className
                                                    }
                                                >
                                                    <StatusIcon className="mr-1 h-3 w-3" />
                                                    {statusInfo.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-muted-foreground">
                                                    {new Date(
                                                        referral.created_at,
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
        </div>
    );
}
