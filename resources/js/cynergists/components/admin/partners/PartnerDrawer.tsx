/**
 * PartnerDrawer
 *
 * Right-side drawer for viewing and editing partner details.
 * Organized into sections as per specification:
 * 1. Identity & Contact
 * 2. Agreement & Legal
 * 3. Financial Performance (Read-Only Calculated)
 * 4. Relationship Management
 * 5. Portal Access (Optional)
 * 6. System Metadata (Admin Only)
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAutoSave } from '@/hooks/useAutoSave';
import type { Partner, PartnerFormData } from '@/hooks/usePartnersList';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
    Building2,
    Check,
    Copy,
    DollarSign,
    FileText,
    Loader2,
    Settings,
    Trash2,
    User,
    UserPlus,
    Users,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface InternalOwner {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
}

interface PartnerDrawerProps {
    partner: Partner | null;
    open: boolean;
    onClose: () => void;
    onSave: (data: PartnerFormData) => Promise<Partner | null>;
    onUpdate: (
        id: string,
        data: Partial<PartnerFormData>,
    ) => Promise<Partner | null>;
    onDelete?: (id: string) => Promise<boolean>;
    saving?: boolean;
}

export function PartnerDrawer({
    partner,
    open,
    onClose,
    onSave,
    onUpdate,
    onDelete,
    saving = false,
}: PartnerDrawerProps) {
    const isEditing = !!partner;
    const [internalOwners, setInternalOwners] = useState<InternalOwner[]>([]);
    const [loadingOwners, setLoadingOwners] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState<Partial<PartnerFormData>>({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        company_name: '',
        partner_type: 'sole_proprietor',
        partner_status: 'active',
        commission_rate: 20,
        agreement_sent: false,
        agreement_signed: false,
        internal_owner_id: undefined,
        partner_start_date: undefined,
        next_follow_up_date: undefined,
        partner_notes: '',
        portal_access_enabled: false,
        access_level: 'standard',
    });

    // Fetch internal owners
    useEffect(() => {
        if (open) {
            fetchInternalOwners();
        }
    }, [open]);

    // Populate form when partner changes
    useEffect(() => {
        if (partner) {
            setFormData({
                first_name: partner.first_name || '',
                last_name: partner.last_name || '',
                email: partner.email || '',
                phone: partner.phone || '',
                company_name: partner.company_name || '',
                partner_type: partner.partner_type || 'sole_proprietor',
                partner_status: partner.partner_status || 'active',
                commission_rate: partner.commission_rate || 20,
                agreement_sent: partner.agreement_sent || false,
                agreement_sent_date: partner.agreement_sent_date || undefined,
                agreement_signed: partner.agreement_signed || false,
                agreement_signed_date:
                    partner.agreement_signed_date || undefined,
                agreement_version: partner.agreement_version || undefined,
                internal_owner_id: partner.internal_owner_id || undefined,
                partner_start_date: partner.partner_start_date || undefined,
                next_follow_up_date: partner.next_follow_up_date || undefined,
                partner_notes: partner.partner_notes || '',
                portal_access_enabled: partner.portal_access_enabled || false,
                access_level: partner.access_level || 'standard',
            });
        } else {
            // Reset form for new partner
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                company_name: '',
                partner_type: 'sole_proprietor',
                partner_status: 'active',
                commission_rate: 20,
                agreement_sent: false,
                agreement_signed: false,
                internal_owner_id: undefined,
                partner_notes: '',
                portal_access_enabled: false,
                access_level: 'standard',
            });
        }
    }, [partner, open]);

    const fetchInternalOwners = async () => {
        setLoadingOwners(true);
        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (!session) return;

            const response = await supabase.functions.invoke(
                'admin-data?action=get_internal_owners',
                {
                    body: {},
                },
            );

            if (response.data) {
                setInternalOwners(response.data);
            }
        } catch (err) {
            console.error('Error fetching internal owners:', err);
        } finally {
            setLoadingOwners(false);
        }
    };

    const handleChange = (field: keyof PartnerFormData, value: unknown) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Memoize initial data for autosave comparison
    const initialFormData = useMemo(() => {
        if (!partner) return null;
        return {
            first_name: partner.first_name || '',
            last_name: partner.last_name || '',
            email: partner.email || '',
            phone: partner.phone || '',
            company_name: partner.company_name || '',
            partner_type: partner.partner_type || 'sole_proprietor',
            partner_status: partner.partner_status || 'active',
            commission_rate: partner.commission_rate || 20,
            agreement_sent: partner.agreement_sent || false,
            agreement_sent_date: partner.agreement_sent_date || undefined,
            agreement_signed: partner.agreement_signed || false,
            agreement_signed_date: partner.agreement_signed_date || undefined,
            agreement_version: partner.agreement_version || undefined,
            internal_owner_id: partner.internal_owner_id || undefined,
            partner_start_date: partner.partner_start_date || undefined,
            next_follow_up_date: partner.next_follow_up_date || undefined,
            partner_notes: partner.partner_notes || '',
            portal_access_enabled: partner.portal_access_enabled || false,
            access_level: partner.access_level || 'standard',
        };
    }, [partner]);

    // Autosave handler
    const handleAutoSave = useCallback(
        async (data: Partial<PartnerFormData>): Promise<boolean> => {
            if (!partner) return false;
            if (!data.first_name || !data.last_name || !data.email) {
                return false; // Don't save if required fields are missing
            }
            try {
                await onUpdate(partner.id, data);
                return true;
            } catch {
                return false;
            }
        },
        [partner, onUpdate],
    );

    // Enable autosave only when editing existing partner
    const { isSaving } = useAutoSave({
        data: formData as Record<string, unknown>,
        onSave: handleAutoSave as (
            data: Record<string, unknown>,
        ) => Promise<boolean>,
        enabled: isEditing && open,
        initialData: initialFormData as Record<string, unknown> | undefined,
    });

    const handleSubmit = async () => {
        if (!formData.first_name || !formData.last_name || !formData.email) {
            toast.error('First name, last name, and email are required');
            return;
        }

        // Only for creating new partners
        if (!isEditing) {
            await onSave(formData as PartnerFormData);
            onClose();
        }
    };

    const handleDelete = async () => {
        if (!partner || !onDelete) return;

        if (
            window.confirm(
                'Are you sure you want to delete this partner? This action cannot be undone.',
            )
        ) {
            const success = await onDelete(partner.id);
            if (success) {
                onClose();
            }
        }
    };

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const getOwnerDisplayName = (owner: InternalOwner) => {
        const name = [owner.first_name, owner.last_name]
            .filter(Boolean)
            .join(' ');
        return name || owner.email;
    };

    return (
        <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                <SheetHeader className="mb-6">
                    <SheetTitle className="flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <User className="h-5 w-5" />
                                Partner Details
                            </>
                        ) : (
                            <>
                                <UserPlus className="h-5 w-5" />
                                Add New Partner
                            </>
                        )}
                    </SheetTitle>
                </SheetHeader>

                <div className="space-y-6">
                    {/* Section 1: Identity & Contact */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            Identity & Contact
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">First Name *</Label>
                                <Input
                                    id="first_name"
                                    value={formData.first_name || ''}
                                    onChange={(e) =>
                                        handleChange(
                                            'first_name',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="John"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_name">Last Name *</Label>
                                <Input
                                    id="last_name"
                                    value={formData.last_name || ''}
                                    onChange={(e) =>
                                        handleChange(
                                            'last_name',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email || ''}
                                onChange={(e) =>
                                    handleChange('email', e.target.value)
                                }
                                placeholder="john@company.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                value={formData.phone || ''}
                                onChange={(e) =>
                                    handleChange('phone', e.target.value)
                                }
                                placeholder="(555) 123-4567"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="company_name">Company Name</Label>
                            <Input
                                id="company_name"
                                value={formData.company_name || ''}
                                onChange={(e) =>
                                    handleChange('company_name', e.target.value)
                                }
                                placeholder="Acme Corp"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Partner Type</Label>
                            <Select
                                value={
                                    formData.partner_type || 'sole_proprietor'
                                }
                                onValueChange={(value) =>
                                    handleChange('partner_type', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="company">
                                        Company
                                    </SelectItem>
                                    <SelectItem value="sole_proprietor">
                                        Sole Proprietor
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Separator />

                    {/* Section 2: Agreement & Legal */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            Agreement & Legal
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Agreement Sent</Label>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={
                                            formData.agreement_sent || false
                                        }
                                        onCheckedChange={(checked) => {
                                            handleChange(
                                                'agreement_sent',
                                                checked,
                                            );
                                            if (
                                                checked &&
                                                !formData.agreement_sent_date
                                            ) {
                                                handleChange(
                                                    'agreement_sent_date',
                                                    new Date()
                                                        .toISOString()
                                                        .split('T')[0],
                                                );
                                            }
                                        }}
                                    />
                                    {formData.agreement_sent &&
                                        formData.agreement_sent_date && (
                                            <span className="text-sm text-muted-foreground">
                                                {formatDate(
                                                    formData.agreement_sent_date,
                                                )}
                                            </span>
                                        )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Agreement Signed</Label>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={
                                            formData.agreement_signed || false
                                        }
                                        onCheckedChange={(checked) => {
                                            handleChange(
                                                'agreement_signed',
                                                checked,
                                            );
                                            if (
                                                checked &&
                                                !formData.agreement_signed_date
                                            ) {
                                                handleChange(
                                                    'agreement_signed_date',
                                                    new Date()
                                                        .toISOString()
                                                        .split('T')[0],
                                                );
                                            }
                                        }}
                                    />
                                    {formData.agreement_signed &&
                                        formData.agreement_signed_date && (
                                            <span className="text-sm text-muted-foreground">
                                                {formatDate(
                                                    formData.agreement_signed_date,
                                                )}
                                            </span>
                                        )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="agreement_version">
                                    Agreement Version
                                </Label>
                                <Input
                                    id="agreement_version"
                                    value={formData.agreement_version || ''}
                                    onChange={(e) =>
                                        handleChange(
                                            'agreement_version',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="1.0"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="commission_rate">
                                    Commission Rate (%)
                                </Label>
                                <Input
                                    id="commission_rate"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.5"
                                    value={formData.commission_rate || 20}
                                    onChange={(e) =>
                                        handleChange(
                                            'commission_rate',
                                            parseFloat(e.target.value) || 0,
                                        )
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Section 3: Financial Performance (Read-Only) */}
                    {isEditing && partner && (
                        <>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                    <DollarSign className="h-4 w-4" />
                                    Financial Performance
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="rounded-lg bg-muted/50 p-3">
                                        <div className="text-muted-foreground">
                                            Referrals Given
                                        </div>
                                        <div className="text-xl font-semibold">
                                            {partner.referrals_given || 0}
                                        </div>
                                    </div>
                                    <div className="rounded-lg bg-muted/50 p-3">
                                        <div className="text-muted-foreground">
                                            Qualified Referrals
                                        </div>
                                        <div className="text-xl font-semibold">
                                            {partner.qualified_referrals || 0}
                                        </div>
                                    </div>
                                    <div className="rounded-lg bg-muted/50 p-3">
                                        <div className="text-muted-foreground">
                                            Closed-Won Deals
                                        </div>
                                        <div className="text-xl font-semibold">
                                            {partner.closed_won_deals || 0}
                                        </div>
                                    </div>
                                    <div className="rounded-lg bg-muted/50 p-3">
                                        <div className="text-muted-foreground">
                                            Revenue Generated
                                        </div>
                                        <div className="text-xl font-semibold text-emerald-600">
                                            {formatCurrency(
                                                partner.revenue_generated || 0,
                                            )}
                                        </div>
                                    </div>
                                    <div className="rounded-lg bg-muted/50 p-3">
                                        <div className="text-muted-foreground">
                                            Total Commissions Earned
                                        </div>
                                        <div className="text-xl font-semibold">
                                            {formatCurrency(
                                                partner.total_commissions_earned ||
                                                    0,
                                            )}
                                        </div>
                                    </div>
                                    <div className="rounded-lg bg-muted/50 p-3">
                                        <div className="text-muted-foreground">
                                            Outstanding Balance
                                        </div>
                                        <div
                                            className={`text-xl font-semibold ${partner.outstanding_commission_balance > 0 ? 'text-amber-600' : ''}`}
                                        >
                                            {formatCurrency(
                                                partner.outstanding_commission_balance ||
                                                    0,
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {partner.last_commission_payout_date && (
                                    <div className="text-sm text-muted-foreground">
                                        Last Commission Payout:{' '}
                                        {formatDate(
                                            partner.last_commission_payout_date,
                                        )}
                                    </div>
                                )}
                            </div>

                            <Separator />
                        </>
                    )}

                    {/* Section 4: Relationship Management */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                            <Users className="h-4 w-4" />
                            Relationship Management
                        </div>

                        <div className="space-y-2">
                            <Label>Internal Owner *</Label>
                            <Select
                                value={formData.internal_owner_id || ''}
                                onValueChange={(value) =>
                                    handleChange(
                                        'internal_owner_id',
                                        value || undefined,
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue
                                        placeholder={
                                            loadingOwners
                                                ? 'Loading...'
                                                : 'Select owner'
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {internalOwners.map((owner) => (
                                        <SelectItem
                                            key={owner.id}
                                            value={owner.id}
                                        >
                                            {getOwnerDisplayName(owner)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="partner_start_date">
                                    Partner Start Date
                                </Label>
                                <Input
                                    id="partner_start_date"
                                    type="date"
                                    value={formData.partner_start_date || ''}
                                    onChange={(e) =>
                                        handleChange(
                                            'partner_start_date',
                                            e.target.value || undefined,
                                        )
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="next_follow_up_date">
                                    Next Follow-Up Date
                                </Label>
                                <Input
                                    id="next_follow_up_date"
                                    type="date"
                                    value={formData.next_follow_up_date || ''}
                                    onChange={(e) =>
                                        handleChange(
                                            'next_follow_up_date',
                                            e.target.value || undefined,
                                        )
                                    }
                                />
                            </div>
                        </div>

                        {isEditing && partner?.last_activity_date && (
                            <div className="text-sm text-muted-foreground">
                                Last Activity:{' '}
                                {formatDate(partner.last_activity_date)}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="partner_notes">
                                Partner Notes (Internal Only)
                            </Label>
                            <Textarea
                                id="partner_notes"
                                value={formData.partner_notes || ''}
                                onChange={(e) =>
                                    handleChange(
                                        'partner_notes',
                                        e.target.value,
                                    )
                                }
                                placeholder="Internal notes about this partner..."
                                rows={3}
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Section 5: Portal Access */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                            <Settings className="h-4 w-4" />
                            Portal Access
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="portal_access">
                                Portal Access Enabled
                            </Label>
                            <Switch
                                id="portal_access"
                                checked={
                                    formData.portal_access_enabled || false
                                }
                                onCheckedChange={(checked) =>
                                    handleChange(
                                        'portal_access_enabled',
                                        checked,
                                    )
                                }
                            />
                        </div>

                        {formData.portal_access_enabled && (
                            <div className="space-y-2">
                                <Label>Access Level</Label>
                                <Select
                                    value={formData.access_level || 'standard'}
                                    onValueChange={(value) =>
                                        handleChange('access_level', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="standard">
                                            Standard
                                        </SelectItem>
                                        <SelectItem value="limited">
                                            Limited
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {isEditing && partner?.last_login_date && (
                            <div className="text-sm text-muted-foreground">
                                Last Login:{' '}
                                {formatDate(partner.last_login_date)}
                            </div>
                        )}
                    </div>

                    {/* Section 6: System Metadata */}
                    {isEditing && partner && (
                        <>
                            <Separator />

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                    System Metadata
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">
                                            Partner ID
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <code className="rounded bg-muted px-2 py-1 text-xs">
                                                {partner.id}
                                            </code>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0"
                                                onClick={() =>
                                                    copyToClipboard(
                                                        partner.id,
                                                        'id',
                                                    )
                                                }
                                            >
                                                {copiedField === 'id' ? (
                                                    <Check className="h-3 w-3" />
                                                ) : (
                                                    <Copy className="h-3 w-3" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">
                                            Created
                                        </span>
                                        <span>
                                            {formatDate(partner.created_at)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">
                                            Last Updated
                                        </span>
                                        <span>
                                            {formatDate(partner.updated_at)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <Separator />

                    {/* Status Selection */}
                    <div className="space-y-2">
                        <Label>Partner Status</Label>
                        <Select
                            value={formData.partner_status || 'active'}
                            onValueChange={(value) =>
                                handleChange(
                                    'partner_status',
                                    value as
                                        | 'active'
                                        | 'inactive'
                                        | 'terminated',
                                )
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">
                                    Inactive
                                </SelectItem>
                                <SelectItem value="terminated">
                                    Terminated
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 border-t pt-4">
                        {!isEditing ? (
                            <>
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={onClose}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={handleSubmit}
                                    disabled={saving}
                                >
                                    {saving && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Create Partner
                                </Button>
                            </>
                        ) : (
                            <>
                                {onDelete && (
                                    <Button
                                        variant="destructive"
                                        className="flex-1"
                                        onClick={handleDelete}
                                        disabled={saving}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                        {isSaving && (
                                            <Loader2 className="ml-2 h-3 w-3 animate-spin" />
                                        )}
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={onClose}
                                >
                                    Close
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
