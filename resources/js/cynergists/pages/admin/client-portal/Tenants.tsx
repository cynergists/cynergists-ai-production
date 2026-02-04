import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Link } from '@inertiajs/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
    ArrowLeft,
    Ban,
    CheckCircle,
    ExternalLink,
    Eye,
    Loader2,
    MoreHorizontal,
    Search,
} from 'lucide-react';
import { useState } from 'react';

interface Tenant {
    id: string;
    user_id: string;
    company_name: string;
    subdomain: string;
    is_temp_subdomain: boolean;
    status: string;
    created_at: string;
    onboarding_completed_at: string | null;
}

export default function ManageTenants() {
    const [search, setSearch] = useState('');
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: tenants, isLoading } = useQuery({
        queryKey: ['admin-tenants'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('portal_tenants')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Tenant[];
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const { error } = await supabase
                .from('portal_tenants')
                .update({ status })
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-tenants'] });
            toast({ title: 'Tenant status updated' });
        },
        onError: (error) => {
            toast({
                title: 'Error updating tenant',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    const filteredTenants = tenants?.filter(
        (tenant) =>
            tenant.company_name.toLowerCase().includes(search.toLowerCase()) ||
            tenant.subdomain.toLowerCase().includes(search.toLowerCase()),
    );

    const getStatusBadge = (status: string, isTempSubdomain: boolean) => {
        if (isTempSubdomain) {
            return (
                <Badge
                    variant="outline"
                    className="border-yellow-500/20 bg-yellow-500/10 text-yellow-500"
                >
                    Pending Setup
                </Badge>
            );
        }

        switch (status) {
            case 'active':
                return (
                    <Badge
                        variant="outline"
                        className="border-green-500/20 bg-green-500/10 text-green-500"
                    >
                        Active
                    </Badge>
                );
            case 'suspended':
                return (
                    <Badge
                        variant="outline"
                        className="border-red-500/20 bg-red-500/10 text-red-500"
                    >
                        Suspended
                    </Badge>
                );
            case 'cancelled':
                return (
                    <Badge
                        variant="outline"
                        className="border-gray-500/20 bg-gray-500/10 text-gray-500"
                    >
                        Cancelled
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/client-portal">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Tenant Management
                    </h1>
                    <p className="text-muted-foreground">
                        View and manage customer portal instances
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative max-w-sm flex-1">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search tenants..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="text-sm text-muted-foreground">
                    {filteredTenants?.length || 0} tenant
                    {filteredTenants?.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Subdomain</TableHead>
                                <TableHead>Company</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTenants?.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="py-12 text-center text-muted-foreground"
                                    >
                                        No tenants found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredTenants?.map((tenant) => (
                                    <TableRow key={tenant.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <code className="rounded bg-muted px-2 py-0.5 text-sm">
                                                    {tenant.subdomain}
                                                </code>
                                                {!tenant.is_temp_subdomain && (
                                                    <a
                                                        href={`https://${tenant.subdomain}.cynergists.com`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-muted-foreground hover:text-foreground"
                                                    >
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {tenant.company_name}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(
                                                tenant.status,
                                                tenant.is_temp_subdomain,
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {format(
                                                new Date(tenant.created_at),
                                                'MMM d, yyyy',
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={`/portal?tenant=${tenant.subdomain}`}
                                                            target="_blank"
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Preview Portal
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    {tenant.status ===
                                                    'active' ? (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                updateStatusMutation.mutate(
                                                                    {
                                                                        id: tenant.id,
                                                                        status: 'suspended',
                                                                    },
                                                                )
                                                            }
                                                            className="text-destructive"
                                                        >
                                                            <Ban className="mr-2 h-4 w-4" />
                                                            Suspend
                                                        </DropdownMenuItem>
                                                    ) : tenant.status ===
                                                      'suspended' ? (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                updateStatusMutation.mutate(
                                                                    {
                                                                        id: tenant.id,
                                                                        status: 'active',
                                                                    },
                                                                )
                                                            }
                                                        >
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Activate
                                                        </DropdownMenuItem>
                                                    ) : null}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
