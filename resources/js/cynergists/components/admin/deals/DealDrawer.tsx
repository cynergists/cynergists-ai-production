import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { Textarea } from '@/components/ui/textarea';
import { useAutoSave } from '@/hooks/useAutoSave';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import {
    AlertTriangle,
    Building2,
    Copy,
    Loader2,
    Mail,
    MessageSquare,
    Phone,
    Trash2,
    User,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface Deal {
    id: string;
    partner_id: string | null;
    client_name: string;
    client_email: string | null;
    client_phone: string | null;
    client_company: string | null;
    stage: string;
    deal_value: number;
    expected_close_date: string | null;
    last_activity_at: string | null;
    created_at: string;
    timeline: Array<{ timestamp: string; type: string; message: string }>;
    partners?: {
        first_name: string | null;
        last_name: string | null;
        slug: string;
    } | null;
}

interface DealNote {
    id: string;
    deal_id: string;
    note_text: string;
    note_type: string;
    created_by_admin_id: string | null;
    created_at: string;
}

interface Referral {
    id: string;
    lead_name: string | null;
    lead_email: string | null;
    source: string | null;
    event_type: string | null;
    duplicate: boolean;
    status: string;
    created_at: string;
}

interface Partner {
    id: string;
    first_name: string | null;
    last_name: string | null;
    slug: string;
}

interface DealDrawerProps {
    deal: Deal | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

const stageOptions = [
    { value: 'new', label: 'New' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'closed_won', label: 'Closed Won' },
    { value: 'closed_lost', label: 'Closed Lost' },
];

export function DealDrawer({
    deal,
    isOpen,
    onClose,
    onUpdate,
}: DealDrawerProps) {
    const [editedDeal, setEditedDeal] = useState<Partial<Deal>>({});
    const [notes, setNotes] = useState<DealNote[]>([]);
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [newNote, setNewNote] = useState('');
    const [noteType, setNoteType] = useState<string>('admin');
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [showPartnerWarning, setShowPartnerWarning] = useState(false);
    const [pendingPartnerId, setPendingPartnerId] = useState<string | null>(
        null,
    );
    const [oldPartnerId, setOldPartnerId] = useState<string | null>(null);

    useEffect(() => {
        if (deal) {
            setEditedDeal({
                stage: deal.stage,
                deal_value: deal.deal_value,
                expected_close_date: deal.expected_close_date,
                partner_id: deal.partner_id,
            });
            fetchNotes();
            fetchReferrals();
            fetchPartners();
        }
    }, [deal]);

    const fetchNotes = async () => {
        if (!deal) return;
        // Cast to any since deal_notes table not yet in generated types
        const { data } = await (supabase.from as any)('deal_notes')
            .select('*')
            .eq('deal_id', deal.id)
            .order('created_at', { ascending: false });
        setNotes((data as DealNote[]) || []);
    };

    const fetchReferrals = async () => {
        if (!deal) return;
        const { data } = await supabase
            .from('referrals')
            .select(
                'id, lead_name, lead_email, source, event_type, duplicate, status, created_at',
            )
            .eq('deal_id', deal.id)
            .order('created_at', { ascending: false });
        setReferrals(data || []);
    };

    const fetchPartners = async () => {
        const { data } = await supabase
            .from('partners')
            .select('id, first_name, last_name, slug')
            .in('partner_status', ['active', 'pending'])
            .order('first_name');
        setPartners(data || []);
    };

    // Memoize initial data for autosave comparison
    const initialFormData = useMemo(() => {
        if (!deal) return null;
        return {
            stage: deal.stage,
            deal_value: deal.deal_value,
            expected_close_date: deal.expected_close_date,
            partner_id: deal.partner_id,
        };
    }, [deal]);

    // Auto-save handler
    const handleAutoSave = useCallback(
        async (data: Partial<Deal>): Promise<boolean> => {
            if (!deal) return false;
            try {
                const updates: Record<string, unknown> = {
                    stage: data.stage,
                    deal_value: data.deal_value || 0,
                    expected_close_date: data.expected_close_date || null,
                    last_activity_at: new Date().toISOString(),
                };

                // Handle closed stages
                if (
                    data.stage === 'closed_won' ||
                    data.stage === 'closed_lost'
                ) {
                    updates.closed_at = new Date().toISOString();
                }

                const { error } = await supabase
                    .from('partner_deals')
                    .update(updates)
                    .eq('id', deal.id);

                if (error) throw error;
                onUpdate();
                return true;
            } catch (error) {
                console.error('Error updating deal:', error);
                return false;
            }
        },
        [deal, onUpdate],
    );

    // Enable autosave
    const { isSaving } = useAutoSave({
        data: editedDeal as Record<string, unknown>,
        onSave: handleAutoSave as (
            data: Record<string, unknown>,
        ) => Promise<boolean>,
        enabled: !!deal && isOpen,
        initialData: initialFormData as Record<string, unknown> | undefined,
    });

    const handlePartnerChange = (newPartnerId: string) => {
        if (newPartnerId === 'unassigned') {
            setEditedDeal((prev) => ({ ...prev, partner_id: null }));
            return;
        }

        if (deal?.partner_id && deal.partner_id !== newPartnerId) {
            // Show warning
            setOldPartnerId(deal.partner_id);
            setPendingPartnerId(newPartnerId);
            setShowPartnerWarning(true);
        } else {
            setEditedDeal((prev) => ({ ...prev, partner_id: newPartnerId }));
        }
    };

    const confirmPartnerChange = async () => {
        if (!deal || !pendingPartnerId) return;
        try {
            const oldPartner = partners.find((p) => p.id === oldPartnerId);
            const newPartner = partners.find((p) => p.id === pendingPartnerId);
            const oldName = oldPartner
                ? [oldPartner.first_name, oldPartner.last_name]
                      .filter(Boolean)
                      .join(' ')
                : 'None';
            const newName = newPartner
                ? [newPartner.first_name, newPartner.last_name]
                      .filter(Boolean)
                      .join(' ')
                : 'None';

            // Update partner_id
            const { error: updateError } = await supabase
                .from('partner_deals')
                .update({
                    partner_id: pendingPartnerId,
                    last_activity_at: new Date().toISOString(),
                })
                .eq('id', deal.id);

            if (updateError) throw updateError;

            // Add audit note (cast to any since RPC not yet in generated types)
            await (supabase.rpc as any)('add_deal_note', {
                p_deal_id: deal.id,
                p_note_text: `Partner attribution updated by admin from "${oldName}" to "${newName}"`,
                p_note_type: 'admin',
            });

            // Log to audit
            await supabase.from('partner_audit_logs').insert({
                partner_id: pendingPartnerId,
                action: 'deal_attribution_changed',
                resource_type: 'deal',
                resource_id: deal.id,
                old_value: { partner_id: oldPartnerId, partner_name: oldName },
                new_value: {
                    partner_id: pendingPartnerId,
                    partner_name: newName,
                },
            });

            setEditedDeal((prev) => ({
                ...prev,
                partner_id: pendingPartnerId,
            }));
            toast.success('Partner updated');
            fetchNotes();
            onUpdate();
        } catch (error) {
            console.error('Error updating partner:', error);
            toast.error('Failed to update partner');
        } finally {
            setShowPartnerWarning(false);
            setPendingPartnerId(null);
            setOldPartnerId(null);
        }
    };

    const handleAddNote = async () => {
        if (!deal || !newNote.trim()) return;
        setIsAddingNote(true);
        try {
            // Cast to any since RPC not yet in generated types
            await (supabase.rpc as any)('add_deal_note', {
                p_deal_id: deal.id,
                p_note_text: newNote.trim(),
                p_note_type: noteType,
            });

            setNewNote('');
            toast.success('Note added');
            fetchNotes();
            onUpdate();
        } catch (error) {
            console.error('Error adding note:', error);
            toast.error('Failed to add note');
        } finally {
            setIsAddingNote(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const getPartnerName = (partnerId: string | null) => {
        if (!partnerId) return 'Unassigned';
        const partner = partners.find((p) => p.id === partnerId);
        if (!partner) return 'Unknown';
        return (
            [partner.first_name, partner.last_name].filter(Boolean).join(' ') ||
            partner.slug
        );
    };

    if (!deal) return null;

    return (
        <>
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent className="flex w-full flex-col overflow-hidden sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            {deal.client_company || deal.client_name}
                        </SheetTitle>
                    </SheetHeader>

                    <ScrollArea className="-mx-6 flex-1 px-6">
                        <div className="space-y-6 pb-6">
                            {/* Contact Info */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-muted-foreground">
                                    Contact Information
                                </h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span>{deal.client_name}</span>
                                    </div>
                                    {deal.client_email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span className="truncate">
                                                {deal.client_email}
                                            </span>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6"
                                                onClick={() =>
                                                    copyToClipboard(
                                                        deal.client_email!,
                                                    )
                                                }
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    )}
                                    {deal.client_phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span>{deal.client_phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Editable Fields */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-muted-foreground">
                                    Deal Details
                                </h4>

                                <div className="space-y-2">
                                    <Label>Stage</Label>
                                    <Select
                                        value={editedDeal.stage || deal.stage}
                                        onValueChange={(v) =>
                                            setEditedDeal((prev) => ({
                                                ...prev,
                                                stage: v,
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {stageOptions.map((opt) => (
                                                <SelectItem
                                                    key={opt.value}
                                                    value={opt.value}
                                                >
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Deal Value ($)</Label>
                                    <Input
                                        type="number"
                                        value={
                                            editedDeal.deal_value ??
                                            deal.deal_value ??
                                            ''
                                        }
                                        onChange={(e) =>
                                            setEditedDeal((prev) => ({
                                                ...prev,
                                                deal_value:
                                                    parseFloat(
                                                        e.target.value,
                                                    ) || 0,
                                            }))
                                        }
                                        placeholder="0"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Expected Close Date</Label>
                                    <Input
                                        type="date"
                                        value={
                                            editedDeal.expected_close_date?.split(
                                                'T',
                                            )[0] ||
                                            deal.expected_close_date?.split(
                                                'T',
                                            )[0] ||
                                            ''
                                        }
                                        onChange={(e) =>
                                            setEditedDeal((prev) => ({
                                                ...prev,
                                                expected_close_date:
                                                    e.target.value || null,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Partner Attribution</Label>
                                    <Select
                                        value={
                                            editedDeal.partner_id ||
                                            deal.partner_id ||
                                            'unassigned'
                                        }
                                        onValueChange={handlePartnerChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select partner..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unassigned">
                                                Unassigned
                                            </SelectItem>
                                            {partners.map((p) => (
                                                <SelectItem
                                                    key={p.id}
                                                    value={p.id}
                                                >
                                                    {[p.first_name, p.last_name]
                                                        .filter(Boolean)
                                                        .join(' ') || p.slug}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Autosave indicator */}
                                <div className="flex h-9 items-center gap-2 text-sm text-muted-foreground">
                                    {isSaving && (
                                        <>
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            <span>Saving...</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Add Note */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-muted-foreground">
                                    Add Note
                                </h4>
                                <div className="space-y-2">
                                    <Select
                                        value={noteType}
                                        onValueChange={setNoteType}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">
                                                Admin Only
                                            </SelectItem>
                                            <SelectItem value="partner_visible">
                                                Partner Visible
                                            </SelectItem>
                                            <SelectItem value="system">
                                                System
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Textarea
                                        placeholder="Add a note..."
                                        value={newNote}
                                        onChange={(e) =>
                                            setNewNote(e.target.value)
                                        }
                                        rows={2}
                                    />
                                    <Button
                                        size="sm"
                                        onClick={handleAddNote}
                                        disabled={
                                            isAddingNote || !newNote.trim()
                                        }
                                    >
                                        {isAddingNote ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <MessageSquare className="mr-2 h-4 w-4" />
                                        )}
                                        Add Note
                                    </Button>
                                </div>
                            </div>

                            <Separator />

                            {/* Timeline */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-muted-foreground">
                                    Timeline
                                </h4>
                                <div className="space-y-3">
                                    {/* Notes */}
                                    {notes.map((note) => (
                                        <div
                                            key={note.id}
                                            className="rounded-lg border p-3 text-sm"
                                        >
                                            <div className="mb-1 flex items-center gap-2">
                                                <Badge
                                                    variant={
                                                        note.note_type ===
                                                        'admin'
                                                            ? 'destructive'
                                                            : note.note_type ===
                                                                'partner_visible'
                                                              ? 'secondary'
                                                              : 'outline'
                                                    }
                                                    className="text-xs"
                                                >
                                                    {note.note_type}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(
                                                        new Date(
                                                            note.created_at,
                                                        ),
                                                        { addSuffix: true },
                                                    )}
                                                </span>
                                            </div>
                                            <p>{note.note_text}</p>
                                        </div>
                                    ))}

                                    {/* Referrals */}
                                    {referrals.map((ref) => (
                                        <div
                                            key={ref.id}
                                            className="rounded-lg border bg-muted/30 p-3 text-sm"
                                        >
                                            <div className="mb-1 flex items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    Referral
                                                </Badge>
                                                {ref.duplicate && (
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-orange-500/10 text-xs"
                                                    >
                                                        Duplicate
                                                    </Badge>
                                                )}
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(
                                                        new Date(
                                                            ref.created_at,
                                                        ),
                                                        { addSuffix: true },
                                                    )}
                                                </span>
                                            </div>
                                            <p className="text-muted-foreground">
                                                {ref.lead_name ||
                                                    ref.lead_email}{' '}
                                                -{' '}
                                                {ref.event_type ||
                                                    ref.source ||
                                                    'Unknown source'}
                                            </p>
                                        </div>
                                    ))}

                                    {/* Deal Timeline */}
                                    {deal.timeline &&
                                        Array.isArray(deal.timeline) &&
                                        deal.timeline.map((entry, idx) => (
                                            <div
                                                key={idx}
                                                className="rounded-lg border bg-muted/10 p-3 text-sm"
                                            >
                                                <div className="mb-1 flex items-center gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        {entry.type}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {entry.timestamp
                                                            ? formatDistanceToNow(
                                                                  new Date(
                                                                      entry.timestamp,
                                                                  ),
                                                                  {
                                                                      addSuffix: true,
                                                                  },
                                                              )
                                                            : ''}
                                                    </span>
                                                </div>
                                                <p>{entry.message}</p>
                                            </div>
                                        ))}

                                    {notes.length === 0 &&
                                        referrals.length === 0 &&
                                        (!deal.timeline ||
                                            deal.timeline.length === 0) && (
                                            <p className="py-4 text-center text-sm text-muted-foreground">
                                                No timeline entries yet
                                            </p>
                                        )}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Actions - Full width Delete and Close buttons */}
                    <div className="mt-auto flex items-center gap-2 border-t pt-4">
                        <Button
                            variant="destructive"
                            className="flex-1"
                            disabled
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                            {isSaving && (
                                <Loader2 className="ml-2 h-3 w-3 animate-spin" />
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={onClose}
                        >
                            Close
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Partner Change Warning */}
            <Dialog
                open={showPartnerWarning}
                onOpenChange={setShowPartnerWarning}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            Change Partner Attribution
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Changing partner attribution will affect commissions for
                        this deal. Are you sure you want to change from{' '}
                        <strong>{getPartnerName(oldPartnerId)}</strong> to{' '}
                        <strong>{getPartnerName(pendingPartnerId)}</strong>?
                    </p>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowPartnerWarning(false);
                                setPendingPartnerId(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmPartnerChange}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Confirm Change
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
