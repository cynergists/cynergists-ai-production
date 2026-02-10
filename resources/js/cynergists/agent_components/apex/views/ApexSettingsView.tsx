import { ScrollArea } from '@/components/ui/scroll-area';
import {
    useApexLinkedInAccounts,
    useDisconnectLinkedIn,
} from '@/hooks/useApexApi';
import {
    ExternalLink,
    Linkedin,
    Loader2,
    LogOut,
    Mail,
    RefreshCw,
    User,
} from 'lucide-react';
import { useState } from 'react';

interface ApexSettingsViewProps {
    agentDetails: any;
}

export default function ApexSettingsView({
    agentDetails,
}: ApexSettingsViewProps) {
    const agentId = agentDetails?.apex_data?.available_agent_id ?? null;
    const { data, isLoading, refetch, isRefetching } =
        useApexLinkedInAccounts();
    const disconnectMutation = useDisconnectLinkedIn();
    const [confirmDisconnect, setConfirmDisconnect] = useState<string | null>(
        null,
    );

    const accounts = data?.accounts ?? [];

    return (
        <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-6 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">
                            Settings
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Manage your LinkedIn connection and account settings
                        </p>
                    </div>
                    <button
                        onClick={() => refetch()}
                        disabled={isRefetching}
                        className="flex items-center gap-1.5 rounded-lg border border-primary/20 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                    >
                        <RefreshCw
                            className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`}
                        />
                        Refresh
                    </button>
                </div>

                {/* LinkedIn Account Section */}
                <div className="rounded-xl border border-primary/10 bg-card">
                    <div className="flex items-center gap-3 border-b border-primary/10 p-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                            <Linkedin className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">
                                LinkedIn Account
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                Connected LinkedIn profile used for outreach
                            </p>
                        </div>
                    </div>

                    <div className="p-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        ) : accounts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
                                    <Linkedin className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <p className="mt-3 text-sm font-medium text-foreground">
                                    No LinkedIn account connected
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Chat with Apex to connect your LinkedIn
                                    account
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {accounts.map((account) => (
                                    <div
                                        key={account.id}
                                        className="rounded-lg border border-primary/10 bg-muted/20 p-4"
                                    >
                                        {/* Account info */}
                                        <div className="flex items-start gap-4">
                                            {account.avatar_url ? (
                                                <img
                                                    src={account.avatar_url}
                                                    alt={
                                                        account.display_name ??
                                                        'LinkedIn'
                                                    }
                                                    className="h-12 w-12 shrink-0 rounded-full border border-primary/10 object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                                                    <User className="h-6 w-6 text-blue-500" />
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="truncate text-sm font-semibold text-foreground">
                                                        {account.display_name ??
                                                            'LinkedIn Account'}
                                                    </p>
                                                    <StatusBadge
                                                        status={account.status}
                                                    />
                                                </div>
                                                {account.email && (
                                                    <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Mail className="h-3 w-3" />
                                                        {account.email}
                                                    </div>
                                                )}
                                                {account.linkedin_profile_url && (
                                                    <a
                                                        href={
                                                            account.linkedin_profile_url
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-1 flex items-center gap-1.5 text-xs text-blue-500 hover:underline"
                                                    >
                                                        <ExternalLink className="h-3 w-3" />
                                                        View LinkedIn Profile
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        {/* Account details */}
                                        <div className="mt-4 grid grid-cols-2 gap-3">
                                            <DetailItem
                                                label="Account ID"
                                                value={account.unipile_account_id}
                                            />
                                            <DetailItem
                                                label="Last Synced"
                                                value={
                                                    account.last_synced_at
                                                        ? formatDate(
                                                              account.last_synced_at,
                                                          )
                                                        : 'Never'
                                                }
                                            />
                                            <DetailItem
                                                label="Connected"
                                                value={formatDate(
                                                    account.created_at,
                                                )}
                                            />
                                            <DetailItem
                                                label="Status"
                                                value={
                                                    account.status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                    account.status.slice(1)
                                                }
                                            />
                                        </div>

                                        {/* Disconnect */}
                                        <div className="mt-4 border-t border-primary/10 pt-4">
                                            {confirmDisconnect ===
                                            account.id ? (
                                                <div className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                                                    <p className="text-xs text-red-600">
                                                        Are you sure? This will
                                                        disconnect your LinkedIn
                                                        account.
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() =>
                                                                setConfirmDisconnect(
                                                                    null,
                                                                )
                                                            }
                                                            className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (agentId) {
                                                                    disconnectMutation.mutate(
                                                                        {
                                                                            accountId:
                                                                                account.id,
                                                                            agentId,
                                                                        },
                                                                    );
                                                                    setConfirmDisconnect(
                                                                        null,
                                                                    );
                                                                }
                                                            }}
                                                            disabled={
                                                                disconnectMutation.isPending
                                                            }
                                                            className="flex items-center gap-1.5 rounded-md bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                                                        >
                                                            {disconnectMutation.isPending ? (
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                            ) : (
                                                                <LogOut className="h-3 w-3" />
                                                            )}
                                                            Disconnect
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        setConfirmDisconnect(
                                                            account.id,
                                                        )
                                                    }
                                                    className="flex items-center gap-1.5 rounded-lg border border-red-500/20 px-3 py-2 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/5"
                                                >
                                                    <LogOut className="h-3.5 w-3.5" />
                                                    Disconnect Account
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ScrollArea>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        active: 'border-green-500/30 bg-green-500/10 text-green-600',
        pending: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-600',
        disconnected: 'border-red-500/30 bg-red-500/10 text-red-600',
    };

    return (
        <span
            className={`rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${styles[status] ?? styles.pending}`}
        >
            {status}
        </span>
    );
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {label}
            </p>
            <p className="mt-0.5 truncate text-xs text-foreground">{value}</p>
        </div>
    );
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}
