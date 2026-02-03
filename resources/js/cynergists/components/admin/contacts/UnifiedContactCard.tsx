/**
 * UnifiedContactCard
 *
 * A shared contact card component that works with the unified Contact type.
 * This component dynamically renders fields based on the contact type
 * (prospect, client, or partner) while maintaining a consistent interface.
 */

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAutoSave } from '@/hooks/useAutoSave';
import { formatDate, formatDateTime } from '@/lib/utils';
import type {
    Contact,
    ContactFormData,
    ContactStatus,
    ContactType,
    FieldMetadata,
} from '@/types/contact';
import { format } from 'date-fns';
import {
    Briefcase,
    Building2,
    Calendar,
    Clock,
    DollarSign,
    FileText,
    Loader2,
    Mail,
    Phone,
    Tag,
    Target,
    Trash2,
    User,
    UserPlus,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface UnifiedContactCardProps {
    contact: Contact | null;
    contactType: ContactType;
    onClose: () => void;
    onSave: (data: ContactFormData) => Promise<boolean>;
    onDelete?: () => Promise<boolean>;
    isCreating?: boolean;
    saving?: boolean;
    deleting?: boolean;
}

// Status options by contact type
const STATUS_OPTIONS: Record<
    ContactType,
    { value: ContactStatus; label: string }[]
> = {
    prospect: [
        { value: 'cold', label: 'Aware' },
        { value: 'warm', label: 'Interested' },
        { value: 'hot', label: 'Committed' },
    ],
    client: [
        { value: 'active', label: 'Active' },
        { value: 'past_due', label: 'Past Due' },
        { value: 'terminated', label: 'Terminated' },
    ],
    partner: [
        { value: 'active', label: 'Active' },
        { value: 'pending', label: 'Pending' },
        { value: 'suspended', label: 'Suspended' },
    ],
};

// Default statuses by type
const DEFAULT_STATUS: Record<ContactType, ContactStatus> = {
    prospect: 'cold',
    client: 'active',
    partner: 'active',
};

export function UnifiedContactCard({
    contact,
    contactType,
    onClose,
    onSave,
    onDelete,
    isCreating = false,
    saving = false,
    deleting = false,
}: UnifiedContactCardProps) {
    // Core fields
    const [name, setName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [nickName, setNickName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [company, setCompany] = useState('');
    const [title, setTitle] = useState('');
    const [salesRep, setSalesRep] = useState('');
    const [partnerName, setPartnerName] = useState('');
    const [tags, setTags] = useState('');
    const [status, setStatus] = useState<ContactStatus>(
        DEFAULT_STATUS[contactType],
    );
    const [notes, setNotes] = useState('');

    // Dialog state for termination warning
    const [showTerminationDialog, setShowTerminationDialog] = useState(false);
    const [pendingTerminationStatus, setPendingTerminationStatus] =
        useState<ContactStatus | null>(null);

    // Prospect-specific fields
    const [services, setServices] = useState('');
    const [estimatedValue, setEstimatedValue] = useState('');
    const [leadSource, setLeadSource] = useState('');
    const [sdrSet, setSdrSet] = useState(false);
    const [estClosingDate, setEstClosingDate] = useState('');
    const [lastMeeting, setLastMeeting] = useState('');
    const [lastOutreach, setLastOutreach] = useState('');
    const [nextOutreach, setNextOutreach] = useState('');
    const [nextMeeting, setNextMeeting] = useState('');

    // Initialize form with contact data
    useEffect(() => {
        if (contact) {
            setName(contact.name || '');
            setFirstName(contact.firstName || '');
            setLastName(contact.lastName || '');
            setNickName(contact.nickName || '');
            setEmail(contact.email || '');
            setPhone(contact.phone || '');
            setCompany(contact.company || '');
            setTitle(contact.title || '');
            setSalesRep(contact.salesRep || '');
            setPartnerName(contact.partnerName || '');
            setTags((contact.tags || []).join(', '));
            setStatus(contact.status || DEFAULT_STATUS[contactType]);
            setNotes(contact.notes || '');

            // Prospect fields
            setServices(contact.services || '');
            setEstimatedValue(contact.estimatedValue?.toString() || '');
            setLeadSource(contact.leadSource || '');
            setSdrSet(contact.sdrSet || false);
            setEstClosingDate(
                contact.estClosingDate
                    ? format(new Date(contact.estClosingDate), 'yyyy-MM-dd')
                    : '',
            );
            setLastMeeting(
                contact.lastMeeting
                    ? format(new Date(contact.lastMeeting), 'yyyy-MM-dd')
                    : '',
            );
            setLastOutreach(
                contact.lastOutreach
                    ? format(new Date(contact.lastOutreach), 'yyyy-MM-dd')
                    : '',
            );
            setNextOutreach(
                contact.nextOutreach
                    ? format(new Date(contact.nextOutreach), 'yyyy-MM-dd')
                    : '',
            );
            setNextMeeting(
                contact.nextMeeting
                    ? format(
                          new Date(contact.nextMeeting),
                          "yyyy-MM-dd'T'HH:mm",
                      )
                    : '',
            );
        } else {
            // Reset to defaults for new contact
            setName('');
            setFirstName('');
            setLastName('');
            setNickName('');
            setEmail('');
            setPhone('');
            setCompany('');
            setTitle('');
            setSalesRep('');
            setPartnerName('');
            setTags('');
            setStatus(DEFAULT_STATUS[contactType]);
            setNotes('');
            setServices('');
            setEstimatedValue('');
            setLeadSource('');
            setSdrSet(false);
            setEstClosingDate('');
            setLastMeeting('');
            setLastOutreach('');
            setNextOutreach('');
            setNextMeeting('');
        }
    }, [contact, contactType]);

    // Build form data from current state
    const buildFormData = useCallback((): ContactFormData => {
        const formData: ContactFormData = {
            status,
            tags: tags
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
        };

        // Add fields based on contact type
        if (contactType === 'partner') {
            formData.firstName = firstName || undefined;
            formData.lastName = lastName || undefined;
            formData.nickName = nickName || undefined;
            formData.email = email || undefined;
            formData.phone = phone || undefined;
            formData.company = company || undefined;
            formData.title = title || undefined;
        } else {
            // For prospects and clients, compute full name from parts
            const computedName =
                [firstName, lastName].filter(Boolean).join(' ') || name;
            formData.name = computedName || undefined;
            formData.firstName = firstName || undefined;
            formData.lastName = lastName || undefined;
            formData.nickName = nickName || undefined;
            formData.email = email || undefined;
            formData.phone = phone || undefined;
            formData.company = company || undefined;
            formData.salesRep = salesRep || undefined;
            formData.partnerName = partnerName || undefined;
            formData.notes = notes || undefined;
        }

        if (contactType === 'prospect') {
            formData.services = services || undefined;
            formData.estimatedValue = estimatedValue
                ? parseFloat(estimatedValue)
                : undefined;
            formData.leadSource = leadSource || undefined;
            formData.sdrSet = sdrSet;
            formData.estClosingDate = estClosingDate || undefined;
            formData.lastMeeting = lastMeeting || undefined;
            formData.lastOutreach = lastOutreach || undefined;
            formData.nextOutreach = nextOutreach || undefined;
            formData.nextMeeting = nextMeeting || undefined;
        }

        return formData;
    }, [
        name,
        firstName,
        lastName,
        nickName,
        email,
        phone,
        company,
        title,
        salesRep,
        partnerName,
        tags,
        status,
        notes,
        services,
        estimatedValue,
        leadSource,
        sdrSet,
        estClosingDate,
        lastMeeting,
        lastOutreach,
        nextOutreach,
        nextMeeting,
        contactType,
    ]);

    // Memoize current form data for autosave
    const currentFormData = useMemo(() => buildFormData(), [buildFormData]);

    // Autosave handler
    const handleAutoSave = useCallback(async (): Promise<boolean> => {
        if (isCreating) return false; // Don't autosave new contacts
        const formData = buildFormData();
        return await onSave(formData);
    }, [isCreating, buildFormData, onSave]);

    // Enable autosave only when editing existing contact
    const { isSaving: isAutoSaving } = useAutoSave({
        data: currentFormData as Record<string, unknown>,
        onSave: handleAutoSave as () => Promise<boolean>,
        enabled: !isCreating && !!contact,
        showToast: true,
    });

    // Manual save for creating new contacts
    const handleCreate = async () => {
        const formData = buildFormData();
        const success = await onSave(formData);
        if (success) {
            onClose();
        }
    };

    // Handle status change with termination warning for clients
    const handleStatusChange = (newStatus: ContactStatus) => {
        if (
            contactType === 'client' &&
            newStatus === 'terminated' &&
            status !== 'terminated'
        ) {
            // Show confirmation dialog before terminating
            setPendingTerminationStatus(newStatus);
            setShowTerminationDialog(true);
        } else {
            setStatus(newStatus);
        }
    };

    const confirmTermination = () => {
        if (pendingTerminationStatus) {
            setStatus(pendingTerminationStatus);
        }
        setShowTerminationDialog(false);
        setPendingTerminationStatus(null);
    };

    const cancelTermination = () => {
        setShowTerminationDialog(false);
        setPendingTerminationStatus(null);
    };

    const SourceBadge = ({ metadata }: { metadata?: FieldMetadata }) => {
        if (!metadata?.updatedBy) return null;
        const source = metadata.updatedBy;
        const label =
            source === 'website'
                ? 'Website'
                : source === 'admin'
                  ? 'Admin'
                  : source === 'ghl'
                    ? 'GHL'
                    : source === 'square'
                      ? 'Square'
                      : source;
        const variant =
            source === 'website'
                ? 'default'
                : source === 'admin' || source === 'square'
                  ? 'secondary'
                  : 'outline';
        return (
            <Badge variant={variant} className="h-5 text-xs">
                {label}
                {metadata.updatedAt && (
                    <span className="ml-1 opacity-70">
                        {formatDate(metadata.updatedAt)}
                    </span>
                )}
            </Badge>
        );
    };

    // All contact types now use split name fields

    return (
        <div className="mt-4 space-y-6">
            {/* Contact Information */}
            <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-4 w-4" />
                    Contact Information
                </h3>

                <div className="space-y-3">
                    {/* Split name fields for all contact types */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="firstName">First Name *</Label>
                                {contact && (
                                    <SourceBadge
                                        metadata={contact.nameMetadata}
                                    />
                                )}
                            </div>
                            <Input
                                id="firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="First name"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Last name"
                            />
                        </div>
                    </div>

                    {/* Nick Name field */}
                    <div className="space-y-1">
                        <Label htmlFor="nickName">Nick Name</Label>
                        <Input
                            id="nickName"
                            value={nickName}
                            onChange={(e) => setNickName(e.target.value)}
                            placeholder="Preferred name for communications"
                        />
                        <p className="text-xs text-muted-foreground">
                            If set, this name will be used in emails and
                            communications
                        </p>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="email">
                                Email{' '}
                                {isCreating && contactType === 'partner' && '*'}
                            </Label>
                            {contact && (
                                <SourceBadge metadata={contact.emailMetadata} />
                            )}
                        </div>
                        <div className="relative">
                            <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@example.com"
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="phone">Phone</Label>
                            {contact && (
                                <SourceBadge metadata={contact.phoneMetadata} />
                            )}
                        </div>
                        <div className="relative">
                            <Phone className="absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <PhoneInput
                                id="phone"
                                value={phone}
                                onChange={(value) => setPhone(value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="company">Company</Label>
                            {contact && (
                                <SourceBadge
                                    metadata={contact.companyMetadata}
                                />
                            )}
                        </div>
                        <div className="relative">
                            <Building2 className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="company"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                placeholder="Company name"
                                className="pl-9"
                            />
                        </div>
                    </div>

                    {contactType === 'partner' && (
                        <div className="space-y-1">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Job title"
                            />
                        </div>
                    )}

                    {contactType === 'prospect' && (
                        <div className="space-y-1">
                            <Label htmlFor="services">Services</Label>
                            <div className="relative">
                                <Briefcase className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="services"
                                    value={services}
                                    onChange={(e) =>
                                        setServices(e.target.value)
                                    }
                                    placeholder="Services interested in"
                                    className="pl-9"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Separator />

            {/* Status & Pipeline (Prospects) */}
            {contactType === 'prospect' && (
                <>
                    <div className="space-y-4">
                        <h3 className="flex items-center gap-2 text-sm font-medium">
                            <Target className="h-4 w-4" />
                            Pipeline Information
                        </h3>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={status}
                                    onValueChange={(v) =>
                                        setStatus(v as ContactStatus)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATUS_OPTIONS[contactType].map(
                                            (opt) => (
                                                <SelectItem
                                                    key={opt.value}
                                                    value={opt.value}
                                                >
                                                    {opt.label}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="estimatedValue">
                                    Est Amount
                                </Label>
                                <div className="relative">
                                    <DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="estimatedValue"
                                        type="number"
                                        value={estimatedValue}
                                        onChange={(e) =>
                                            setEstimatedValue(e.target.value)
                                        }
                                        placeholder="Estimated value"
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="leadSource">Source</Label>
                                <Input
                                    id="leadSource"
                                    value={leadSource}
                                    onChange={(e) =>
                                        setLeadSource(e.target.value)
                                    }
                                    placeholder="e.g., Website, Referral, LinkedIn"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="estClosingDate">
                                    Est Closing Date
                                </Label>
                                <Input
                                    id="estClosingDate"
                                    type="date"
                                    value={estClosingDate}
                                    onChange={(e) =>
                                        setEstClosingDate(e.target.value)
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="sdrSet">SDR Set</Label>
                                <Switch
                                    id="sdrSet"
                                    checked={sdrSet}
                                    onCheckedChange={setSdrSet}
                                />
                            </div>
                        </div>
                    </div>
                    <Separator />
                </>
            )}

            {/* Partner Status */}
            {contactType === 'partner' && (
                <>
                    <div className="space-y-4">
                        <h3 className="flex items-center gap-2 text-sm font-medium">
                            <UserPlus className="h-4 w-4" />
                            Partner Status
                        </h3>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={status}
                                    onValueChange={(v) =>
                                        setStatus(v as ContactStatus)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATUS_OPTIONS[contactType].map(
                                            (opt) => (
                                                <SelectItem
                                                    key={opt.value}
                                                    value={opt.value}
                                                >
                                                    {opt.label}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <Separator />
                </>
            )}

            {/* Admin Fields (Clients) */}
            {contactType === 'client' && (
                <>
                    <div className="space-y-4">
                        <h3 className="flex items-center gap-2 text-sm font-medium">
                            <Clock className="h-4 w-4" />
                            Admin Fields
                        </h3>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={status}
                                    onValueChange={(v) =>
                                        handleStatusChange(v as ContactStatus)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATUS_OPTIONS[contactType].map(
                                            (opt) => (
                                                <SelectItem
                                                    key={opt.value}
                                                    value={opt.value}
                                                >
                                                    {opt.label}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <Separator />
                </>
            )}

            {/* Assignment (Prospects & Clients) */}
            {(contactType === 'prospect' || contactType === 'client') && (
                <>
                    <div className="space-y-4">
                        <h3 className="flex items-center gap-2 text-sm font-medium">
                            <Clock className="h-4 w-4" />
                            Assignment
                        </h3>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="salesRep">Sales Rep</Label>
                                    {contact && (
                                        <SourceBadge
                                            metadata={contact.salesRepMetadata}
                                        />
                                    )}
                                </div>
                                <Input
                                    id="salesRep"
                                    value={salesRep}
                                    onChange={(e) =>
                                        setSalesRep(e.target.value)
                                    }
                                    placeholder="Sales representative"
                                />
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="partnerName">Partner</Label>
                                    {contact && (
                                        <SourceBadge
                                            metadata={
                                                contact.partnerNameMetadata
                                            }
                                        />
                                    )}
                                </div>
                                <Input
                                    id="partnerName"
                                    value={partnerName}
                                    onChange={(e) =>
                                        setPartnerName(e.target.value)
                                    }
                                    placeholder="Partner name"
                                />
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="tags">Tags</Label>
                                    {contact && (
                                        <SourceBadge
                                            metadata={contact.tagsMetadata}
                                        />
                                    )}
                                </div>
                                <div className="relative">
                                    <Tag className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="tags"
                                        value={tags}
                                        onChange={(e) =>
                                            setTags(e.target.value)
                                        }
                                        placeholder="tag1, tag2, tag3"
                                        className="pl-9"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Comma-separated list
                                </p>
                            </div>
                        </div>
                    </div>
                    <Separator />
                </>
            )}

            {/* Activity Dates (Prospects) */}
            {contactType === 'prospect' && (
                <>
                    <div className="space-y-4">
                        <h3 className="flex items-center gap-2 text-sm font-medium">
                            <Calendar className="h-4 w-4" />
                            Activity Dates
                        </h3>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="lastMeeting">
                                    Last Meeting
                                </Label>
                                <Input
                                    id="lastMeeting"
                                    type="date"
                                    value={lastMeeting}
                                    onChange={(e) =>
                                        setLastMeeting(e.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="lastOutreach">
                                    Last Outreach
                                </Label>
                                <Input
                                    id="lastOutreach"
                                    type="date"
                                    value={lastOutreach}
                                    onChange={(e) =>
                                        setLastOutreach(e.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="nextOutreach">
                                    Next Outreach
                                </Label>
                                <Input
                                    id="nextOutreach"
                                    type="date"
                                    value={nextOutreach}
                                    onChange={(e) =>
                                        setNextOutreach(e.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="nextMeeting">
                                    Next Meeting
                                </Label>
                                <Input
                                    id="nextMeeting"
                                    type="datetime-local"
                                    value={nextMeeting}
                                    onChange={(e) =>
                                        setNextMeeting(e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    </div>
                    <Separator />
                </>
            )}

            {/* Payment Info (Clients - Read Only) */}
            {contactType === 'client' && contact && (
                <>
                    <div className="space-y-4">
                        <h3 className="flex items-center gap-2 text-sm font-medium">
                            <DollarSign className="h-4 w-4" />
                            Payment Information
                            <Badge variant="secondary" className="text-xs">
                                Square
                            </Badge>
                        </h3>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">
                                    Payment Type
                                </p>
                                <p className="font-medium">
                                    {contact.paymentType || '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Amount</p>
                                <p className="font-medium">
                                    {contact.paymentAmount
                                        ? `$${contact.paymentAmount.toLocaleString()}`
                                        : '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">
                                    Last Payment
                                </p>
                                <p className="font-medium">
                                    {contact.lastPaymentDate
                                        ? formatDate(contact.lastPaymentDate)
                                        : '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">
                                    Next Payment
                                </p>
                                <p className="font-medium">
                                    {contact.nextPaymentDueDate
                                        ? formatDate(contact.nextPaymentDueDate)
                                        : '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Plan</p>
                                <p className="font-medium">
                                    {contact.squarePlanName || '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">
                                    Last Synced
                                </p>
                                <p className="font-medium">
                                    {contact.squareSyncedAt
                                        ? formatDateTime(contact.squareSyncedAt)
                                        : '—'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <Separator />
                </>
            )}

            {/* Notes (Prospects & Clients) */}
            {(contactType === 'prospect' || contactType === 'client') && (
                <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-sm font-medium">
                        <FileText className="h-4 w-4" />
                        Notes
                    </h3>

                    <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes about this contact..."
                        rows={4}
                    />
                </div>
            )}

            {/* Action Buttons */}
            <div className="sticky bottom-0 space-y-2 border-t bg-background pt-4">
                {/* Autosave indicator for existing contacts */}
                {/* Actions - Full width buttons */}
                <div className="flex items-center gap-2">
                    {isCreating ? (
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
                                onClick={handleCreate}
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    `Create ${contactType.charAt(0).toUpperCase() + contactType.slice(1)}`
                                )}
                            </Button>
                        </>
                    ) : (
                        <>
                            {onDelete && (
                                <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={onDelete}
                                    disabled={
                                        saving || deleting || isAutoSaving
                                    }
                                >
                                    {deleting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                            {isAutoSaving && (
                                                <Loader2 className="ml-2 h-3 w-3 animate-spin" />
                                            )}
                                        </>
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

            {/* Termination Confirmation Dialog */}
            <AlertDialog
                open={showTerminationDialog}
                onOpenChange={setShowTerminationDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Terminate Client?</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                            <p>
                                Are you sure you want to terminate this client?
                                This action will:
                            </p>
                            <ul className="list-inside list-disc space-y-1 text-sm">
                                <li>
                                    Cancel their active subscription in Square
                                </li>
                                <li>Stop all future automatic payments</li>
                                <li>
                                    Mark the client as terminated in the system
                                </li>
                            </ul>
                            <p className="font-medium text-destructive">
                                This will immediately stop payments from being
                                pulled from their bank or card.
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={cancelTermination}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmTermination}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Yes, Terminate Client
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
