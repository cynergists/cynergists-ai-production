import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    useApexCampaigns,
    useCompleteCampaign,
    usePauseCampaign,
    useStartCampaign,
} from '@/hooks/useApexApi';
import {
    CheckCircle,
    Loader2,
    MessageSquare,
    Pause,
    Pencil,
    Play,
    Plus,
    Target,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import CampaignForm from '../components/CampaignForm';

interface ApexCampaignsViewProps {
    setActiveView: (view: string) => void;
}

type StatusFilter = 'all' | 'active' | 'draft' | 'paused' | 'completed';

export default function ApexCampaignsView({
    setActiveView,
}: ApexCampaignsViewProps) {
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [selectedCampaignId, setSelectedCampaignId] = useState<
        string | null
    >(null);
    const { data, isLoading } = useApexCampaigns();
    const startCampaign = useStartCampaign();
    const pauseCampaign = usePauseCampaign();
    const completeCampaign = useCompleteCampaign();

    const campaigns = data?.campaigns ?? [];
    const filtered =
        statusFilter === 'all'
            ? campaigns
            : campaigns.filter((c) => c.status === statusFilter);

    // Show form view
    if (selectedCampaignId !== null) {
        const editingCampaign =
            selectedCampaignId === 'new'
                ? null
                : campaigns.find((c) => c.id === selectedCampaignId) ?? null;

        return (
            <CampaignForm
                campaign={editingCampaign}
                onBack={() => setSelectedCampaignId(null)}
            />
        );
    }

    const filters: { label: string; value: StatusFilter }[] = [
        { label: 'All', value: 'all' },
        { label: 'Active', value: 'active' },
        { label: 'Draft', value: 'draft' },
        { label: 'Paused', value: 'paused' },
        { label: 'Completed', value: 'completed' },
    ];

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            {/* Filter Tabs + New Campaign Button */}
            <div className="flex items-center justify-between border-b border-primary/10 px-4 py-2">
                <div className="flex gap-1">
                    {filters.map((f) => (
                        <button
                            key={f.value}
                            onClick={() => setStatusFilter(f.value)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                statusFilter === f.value
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                            }`}
                        >
                            {f.label}
                            {f.value !== 'all' && (
                                <span className="ml-1 text-[10px] opacity-70">
                                    {
                                        campaigns.filter((c) =>
                                            f.value === 'all'
                                                ? true
                                                : c.status === f.value,
                                        ).length
                                    }
                                </span>
                            )}
                        </button>
                    ))}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    onClick={() => setSelectedCampaignId('new')}
                >
                    <Plus className="h-3.5 w-3.5" />
                    New
                </Button>
            </div>

            <ScrollArea className="min-h-0 flex-1">
                <div className="space-y-3 p-4">
                    {isLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-32 animate-pulse rounded-xl border border-primary/10 bg-muted/30"
                                />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                <Target className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="mt-3 text-sm font-semibold text-foreground">
                                {statusFilter === 'all'
                                    ? 'No campaigns yet'
                                    : `No ${statusFilter} campaigns`}
                            </h3>
                            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                                Create your first outreach campaign to start
                                connecting with prospects.
                            </p>
                            <button
                                onClick={() => setSelectedCampaignId('new')}
                                className="mt-4 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                                Create Campaign
                            </button>
                        </div>
                    ) : (
                        filtered.map((campaign) => {
                            const acceptanceRate =
                                campaign.connections_sent > 0
                                    ? Math.round(
                                          (campaign.connections_accepted /
                                              campaign.connections_sent) *
                                              100,
                                      )
                                    : 0;
                            const replyRate =
                                campaign.messages_sent > 0
                                    ? Math.round(
                                          (campaign.replies_received /
                                              campaign.messages_sent) *
                                              100,
                                      )
                                    : 0;

                            return (
                                <div
                                    key={campaign.id}
                                    className="rounded-xl border border-primary/10 bg-muted/30 p-4"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="truncate text-sm font-semibold text-foreground">
                                                    {campaign.name}
                                                </h3>
                                                <StatusBadge
                                                    status={campaign.status}
                                                />
                                            </div>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {campaign.campaign_type ===
                                                'connection'
                                                    ? 'Connection Campaign'
                                                    : campaign.campaign_type ===
                                                        'message'
                                                      ? 'Message Campaign'
                                                      : 'Follow-up Campaign'}
                                                {campaign.campaign_prospects_count !==
                                                    undefined &&
                                                    ` · ${campaign.campaign_prospects_count} prospects`}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0"
                                                onClick={() =>
                                                    setSelectedCampaignId(
                                                        campaign.id,
                                                    )
                                                }
                                                title="Edit campaign"
                                            >
                                                <Pencil className="h-3 w-3" />
                                            </Button>
                                            {campaign.status === 'draft' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 gap-1 text-xs"
                                                    onClick={() =>
                                                        startCampaign.mutate(
                                                            campaign.id,
                                                        )
                                                    }
                                                    disabled={
                                                        startCampaign.isPending
                                                    }
                                                >
                                                    {startCampaign.isPending ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                        <Play className="h-3 w-3" />
                                                    )}
                                                    Start
                                                </Button>
                                            )}
                                            {campaign.status === 'active' && (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 gap-1 text-xs"
                                                        onClick={() =>
                                                            pauseCampaign.mutate(
                                                                campaign.id,
                                                            )
                                                        }
                                                        disabled={
                                                            pauseCampaign.isPending
                                                        }
                                                    >
                                                        <Pause className="h-3 w-3" />
                                                        Pause
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 gap-1 text-xs"
                                                        onClick={() =>
                                                            completeCampaign.mutate(
                                                                campaign.id,
                                                            )
                                                        }
                                                        disabled={
                                                            completeCampaign.isPending
                                                        }
                                                    >
                                                        <CheckCircle className="h-3 w-3" />
                                                        Complete
                                                    </Button>
                                                </>
                                            )}
                                            {campaign.status === 'paused' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 gap-1 text-xs"
                                                    onClick={() =>
                                                        startCampaign.mutate(
                                                            campaign.id,
                                                        )
                                                    }
                                                    disabled={
                                                        startCampaign.isPending
                                                    }
                                                >
                                                    <Play className="h-3 w-3" />
                                                    Resume
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stats Row */}
                                    <div className="mt-3 grid grid-cols-5 gap-2">
                                        <MiniStat
                                            icon={
                                                <Users className="h-3 w-3 text-blue-500" />
                                            }
                                            label="Sent"
                                            value={campaign.connections_sent}
                                        />
                                        <MiniStat
                                            icon={
                                                <CheckCircle className="h-3 w-3 text-green-500" />
                                            }
                                            label="Accepted"
                                            value={
                                                campaign.connections_accepted
                                            }
                                        />
                                        <MiniStat
                                            icon={
                                                <MessageSquare className="h-3 w-3 text-purple-500" />
                                            }
                                            label="Msgs"
                                            value={campaign.messages_sent}
                                        />
                                        <MiniStat
                                            label="Accept"
                                            value={`${acceptanceRate}%`}
                                        />
                                        <MiniStat
                                            label="Reply"
                                            value={`${replyRate}%`}
                                        />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        active: 'border-green-500/30 bg-green-500/10 text-green-600',
        draft: 'border-gray-500/30 bg-gray-500/10 text-gray-500',
        paused: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-600',
        completed: 'border-blue-500/30 bg-blue-500/10 text-blue-600',
    };

    return (
        <span
            className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${styles[status] ?? styles.draft}`}
        >
            {status}
        </span>
    );
}

function MiniStat({
    icon,
    label,
    value,
}: {
    icon?: React.ReactNode;
    label: string;
    value: number | string;
}) {
    return (
        <div className="rounded-lg bg-background p-2 text-center">
            {icon && <div className="mb-0.5 flex justify-center">{icon}</div>}
            <p className="text-sm font-semibold text-foreground">{value}</p>
            <p className="text-[10px] text-muted-foreground">{label}</p>
        </div>
    );
}
