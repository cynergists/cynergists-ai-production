import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useApexProspects } from '@/hooks/useApexApi';
import {
    ChevronLeft,
    ChevronRight,
    Search,
    Users,
} from 'lucide-react';
import { useState } from 'react';

type ConnectionFilter = '' | 'connected' | 'pending' | 'none';

export default function ApexConnectionsView() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [connectionStatus, setConnectionStatus] =
        useState<ConnectionFilter>('');

    const { data, isLoading } = useApexProspects({
        page,
        search: search || undefined,
        connectionStatus: connectionStatus || undefined,
    });

    const prospects = data?.data ?? [];
    const totalPages = data?.last_page ?? 1;
    const total = data?.total ?? 0;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const filters: { label: string; value: ConnectionFilter }[] = [
        { label: 'All', value: '' },
        { label: 'Connected', value: 'connected' },
        { label: 'Pending', value: 'pending' },
        { label: 'Not Connected', value: 'none' },
    ];

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            {/* Search and Filters */}
            <div className="space-y-2 border-b border-primary/10 px-4 py-3">
                <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search by name, company, or title..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="h-9 border-primary/15 bg-background pl-9 text-sm"
                    />
                </form>
                <div className="flex gap-1">
                    {filters.map((f) => (
                        <button
                            key={f.value}
                            onClick={() => {
                                setConnectionStatus(f.value);
                                setPage(1);
                            }}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                connectionStatus === f.value
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            <ScrollArea className="min-h-0 flex-1">
                <div className="space-y-2 p-4">
                    {isLoading ? (
                        <div className="space-y-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="flex h-16 animate-pulse items-center gap-3 rounded-xl border border-primary/10 bg-muted/30 p-3"
                                >
                                    <div className="h-10 w-10 rounded-full bg-muted/50" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="h-3 w-32 rounded bg-muted/50" />
                                        <div className="h-2.5 w-48 rounded bg-muted/50" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : prospects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="mt-3 text-sm font-semibold text-foreground">
                                No connections found
                            </h3>
                            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                                {search
                                    ? 'Try a different search term.'
                                    : 'Import prospects or start a campaign to build your network.'}
                            </p>
                        </div>
                    ) : (
                        prospects.map((prospect) => (
                            <div
                                key={prospect.id}
                                className="flex items-center gap-3 rounded-xl border border-primary/10 bg-muted/30 p-3 transition-colors hover:bg-muted/50"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10">
                                    {prospect.avatar_url ? (
                                        <img
                                            src={prospect.avatar_url}
                                            alt={prospect.full_name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-sm font-medium text-primary">
                                            {prospect.first_name?.[0] ?? ''}
                                            {prospect.last_name?.[0] ?? ''}
                                        </span>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-foreground">
                                        {prospect.full_name}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {[
                                            prospect.job_title,
                                            prospect.company,
                                        ]
                                            .filter(Boolean)
                                            .join(' at ') || 'No details'}
                                    </p>
                                </div>
                                <ConnectionStatusBadge
                                    status={prospect.connection_status}
                                />
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-primary/10 px-4 py-2">
                    <p className="text-xs text-muted-foreground">
                        {total} total
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="h-7 px-2"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-xs text-muted-foreground">
                            {page} / {totalPages}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                                setPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={page === totalPages}
                            className="h-7 px-2"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

function ConnectionStatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        connected: 'border-green-500/30 bg-green-500/10 text-green-600',
        pending: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-600',
        none: 'border-gray-500/30 bg-gray-500/10 text-gray-500',
        rejected: 'border-red-500/30 bg-red-500/10 text-red-600',
    };

    return (
        <span
            className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${styles[status] ?? styles.none}`}
        >
            {status}
        </span>
    );
}
