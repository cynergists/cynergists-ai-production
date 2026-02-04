import { CategoryManagerDialog } from '@/components/admin/agents/CategoryManagerDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { callAdminApi } from '@/lib/admin-api';
import { Link, router } from '@inertiajs/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    Handshake,
    Plus,
    Settings,
    Store,
    Trash2,
    Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

type SortField =
    | 'name'
    | 'job_title'
    | 'category'
    | 'price'
    | 'is_popular'
    | 'is_active';
type SortDirection = 'asc' | 'desc';

interface Agent {
    id: string;
    name: string;
    job_title: string | null;
    description: string | null;
    price: number;
    category: string;
    website_category: string[] | null;
    is_popular: boolean;
    is_active: boolean;
}

export default function AIAgents() {
    const queryClient = useQueryClient();
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const { data: agents, isLoading } = useQuery({
        queryKey: ['portal-agents'],
        queryFn: async () => {
            return callAdminApi<Agent[]>('get_ai_agents');
        },
    });

    // Sort agents
    const sortedAgents = useMemo(() => {
        if (!agents) return [];
        return [...agents].sort((a, b) => {
            let aVal: string | number | boolean | null = a[sortField];
            let bVal: string | number | boolean | null = b[sortField];

            // Handle nulls
            if (aVal === null) aVal = '';
            if (bVal === null) bVal = '';

            // Compare
            if (typeof aVal === 'boolean') {
                aVal = aVal ? 1 : 0;
                bVal = bVal ? 1 : 0;
            }

            if (typeof aVal === 'string') {
                const compare = aVal.localeCompare(bVal as string);
                return sortDirection === 'asc' ? compare : -compare;
            }

            const compare = (aVal as number) - (bVal as number);
            return sortDirection === 'asc' ? compare : -compare;
        });
    }, [agents, sortField, sortDirection]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field)
            return <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />;
        return sortDirection === 'asc' ? (
            <ArrowUp className="ml-1 h-4 w-4" />
        ) : (
            <ArrowDown className="ml-1 h-4 w-4" />
        );
    };

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await callAdminApi('delete_ai_agent', { id });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portal-agents'] });
            toast.success('AI Agent deleted successfully');
        },
        onError: (error) => {
            toast.error('Failed to delete AI Agent: ' + error.message);
        },
    });

    const handleEdit = (agent: Agent) => {
        router.visit(`/admin/ai-agents/${agent.id}`);
    };

    const handleAddNew = () => {
        router.visit('/admin/ai-agents/new');
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground">
                    AI Agents
                </h1>
                <Button onClick={handleAddNew}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add AI Agent
                </Button>
            </div>

            {/* Live Sync Bar */}
            <div className="flex items-center justify-between rounded-lg border border-lime-500/20 bg-lime-500/10 p-3">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-lime-500" />
                        <span className="text-sm font-medium text-lime-400">
                            Live sync enabled:
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-muted-foreground hover:text-foreground"
                        >
                            <Link href="/marketplace" target="_blank">
                                <Store className="mr-1.5 h-4 w-4" />
                                Marketplace
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-muted-foreground hover:text-foreground"
                        >
                            <Link href="/portal/browse" target="_blank">
                                <Users className="mr-1.5 h-4 w-4" />
                                Client
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-muted-foreground hover:text-foreground"
                        >
                            <Link href="/partner/marketplace" target="_blank">
                                <Handshake className="mr-1.5 h-4 w-4" />
                                Partner
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                <button
                                    className="flex items-center transition-colors hover:text-foreground"
                                    onClick={() => handleSort('job_title')}
                                >
                                    Job Title
                                    <SortIcon field="job_title" />
                                </button>
                            </TableHead>
                            <TableHead>
                                <button
                                    className="flex items-center transition-colors hover:text-foreground"
                                    onClick={() => handleSort('name')}
                                >
                                    Name
                                    <SortIcon field="name" />
                                </button>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-1">
                                    <button
                                        className="flex items-center transition-colors hover:text-foreground"
                                        onClick={() => handleSort('category')}
                                    >
                                        Category
                                        <SortIcon field="category" />
                                    </button>
                                    <button
                                        className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                                        onClick={() =>
                                            setIsCategoryDialogOpen(true)
                                        }
                                        title="Manage Categories"
                                    >
                                        <Settings className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </TableHead>
                            <TableHead>
                                <button
                                    className="flex items-center transition-colors hover:text-foreground"
                                    onClick={() => handleSort('price')}
                                >
                                    Price
                                    <SortIcon field="price" />
                                </button>
                            </TableHead>
                            <TableHead>
                                <button
                                    className="flex items-center transition-colors hover:text-foreground"
                                    onClick={() => handleSort('is_popular')}
                                >
                                    Popular
                                    <SortIcon field="is_popular" />
                                </button>
                            </TableHead>
                            <TableHead>
                                <button
                                    className="flex items-center transition-colors hover:text-foreground"
                                    onClick={() => handleSort('is_active')}
                                >
                                    Active
                                    <SortIcon field="is_active" />
                                </button>
                            </TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : sortedAgents.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="text-center text-muted-foreground"
                                >
                                    No AI Agents yet. Click "Add AI Agent" to
                                    create one.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedAgents.map((agent) => (
                                <TableRow
                                    key={agent.id}
                                    className="hover:bg-muted/50"
                                >
                                    <TableCell className="font-medium">
                                        <button
                                            className="cursor-pointer text-lime-400 hover:text-lime-300 hover:underline"
                                            onClick={() => handleEdit(agent)}
                                        >
                                            {agent.job_title || '—'}
                                        </button>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <span>{agent.name}</span>
                                            {agent.is_popular && (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    Popular
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{agent.category}</TableCell>
                                    <TableCell>${agent.price}/mo</TableCell>
                                    <TableCell>
                                        {agent.is_popular ? 'Yes' : '—'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                agent.is_active
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {agent.is_active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (
                                                    confirm(
                                                        'Are you sure you want to delete this AI Agent?',
                                                    )
                                                ) {
                                                    deleteMutation.mutate(
                                                        agent.id,
                                                    );
                                                }
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <CategoryManagerDialog
                open={isCategoryDialogOpen}
                onOpenChange={setIsCategoryDialogOpen}
            />
        </div>
    );
}
