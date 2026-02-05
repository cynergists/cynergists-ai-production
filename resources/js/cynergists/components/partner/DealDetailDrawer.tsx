import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { router } from '@inertiajs/react';
import { format, formatDistanceToNow } from 'date-fns';
import {
    Building2,
    Calendar,
    Clock,
    DollarSign,
    Mail,
    Phone,
    Ticket,
    User,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Deal {
    id: string;
    client_name: string;
    client_email: string | null;
    client_phone: string | null;
    client_company: string | null;
    stage: string;
    deal_value: number;
    expected_close_date: string | null;
    created_at: string;
    timeline?: Array<{ timestamp: string; type: string; message: string }>;
}

interface DealNote {
    id: string;
    note_text: string;
    note_type: string;
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

interface DealDetailDrawerProps {
    deal: Deal | null;
    isOpen: boolean;
    onClose: () => void;
}

const stageConfig: Record<
    string,
    {
        label: string;
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
    }
> = {
    new: { label: 'New', variant: 'default' },
    in_progress: { label: 'In Progress', variant: 'secondary' },
    closed_won: { label: 'Closed Won', variant: 'default' },
    closed_lost: { label: 'Closed Lost', variant: 'destructive' },
};

export function DealDetailDrawer({
    deal,
    isOpen,
    onClose,
}: DealDetailDrawerProps) {
    const [notes, setNotes] = useState<DealNote[]>([]);
    const [referrals, setReferrals] = useState<Referral[]>([]);

    useEffect(() => {
        if (deal) {
            fetchNotes();
            fetchReferrals();
        }
    }, [deal]);

    const fetchNotes = async () => {
        if (!deal) return;
        // Partners can only see system and partner_visible notes (RLS enforces this)
        // Cast to any since deal_notes table not yet in generated types
        const { data } = await (supabase.from as any)('deal_notes')
            .select('id, note_text, note_type, created_at')
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
        setReferrals((data as unknown as Referral[]) || []);
    };

    const handleCreateTicket = () => {
        const subject = encodeURIComponent(
            `Re: ${deal?.client_company || deal?.client_name || 'Deal'}`,
        );
        router.visit(`/partner/tickets?subject=${subject}&deal_id=${deal?.id}`);
        onClose();
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(value);
    };

    if (!deal) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="flex w-full flex-col overflow-hidden sm:max-w-md">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        {deal.client_company || deal.client_name}
                    </SheetTitle>
                    <Badge
                        variant={stageConfig[deal.stage]?.variant || 'outline'}
                    >
                        {stageConfig[deal.stage]?.label || deal.stage}
                    </Badge>
                </SheetHeader>

                <ScrollArea className="-mx-6 flex-1 px-6">
                    <div className="space-y-6 pb-6">
                        {/* Contact Info */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-muted-foreground">
                                Contact Information
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span>{deal.client_name}</span>
                                </div>
                                {deal.client_email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span>{deal.client_email}</span>
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

                        {/* Deal Info */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-muted-foreground">
                                Deal Details
                            </h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    <span>
                                        {deal.deal_value
                                            ? formatCurrency(deal.deal_value)
                                            : 'TBD'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>
                                        {deal.expected_close_date
                                            ? format(
                                                  new Date(
                                                      deal.expected_close_date,
                                                  ),
                                                  'MMM d, yyyy',
                                              )
                                            : 'TBD'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>
                                        Created{' '}
                                        {format(
                                            new Date(deal.created_at),
                                            'MMM d, yyyy',
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Create Ticket Button */}
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={handleCreateTicket}
                        >
                            <Ticket className="mr-2 h-4 w-4" />
                            Create Support Ticket
                        </Button>

                        <Separator />

                        {/* Timeline */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-muted-foreground">
                                Activity Timeline
                            </h4>
                            <div className="space-y-3">
                                {/* Notes (filtered by RLS - only system and partner_visible) */}
                                {notes.map((note) => (
                                    <div
                                        key={note.id}
                                        className="rounded-lg border p-3 text-sm"
                                    >
                                        <div className="mb-1 flex items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                {note.note_type ===
                                                'partner_visible'
                                                    ? 'Update'
                                                    : 'System'}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(
                                                    new Date(note.created_at),
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
                                            <Badge
                                                variant={
                                                    ref.status === 'accepted'
                                                        ? 'secondary'
                                                        : ref.status ===
                                                            'rejected'
                                                          ? 'destructive'
                                                          : 'outline'
                                                }
                                                className="text-xs"
                                            >
                                                {ref.status}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(
                                                    new Date(ref.created_at),
                                                    { addSuffix: true },
                                                )}
                                            </span>
                                        </div>
                                        <p className="text-muted-foreground">
                                            {ref.lead_name || ref.lead_email}{' '}
                                            via{' '}
                                            {ref.event_type ||
                                                ref.source ||
                                                'direct'}
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
                                            No activity yet
                                        </p>
                                    )}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
