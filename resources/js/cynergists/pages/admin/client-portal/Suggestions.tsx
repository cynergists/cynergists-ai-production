import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Link } from '@inertiajs/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface Suggestion {
    id: string;
    user_id: string;
    customer_id: string | null;
    agent_name: string;
    category: string;
    description: string;
    use_case: string | null;
    status: 'pending' | 'reviewed' | 'approved' | 'implemented' | 'rejected';
    admin_notes: string | null;
    created_at: string;
}

const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
    { value: 'reviewed', label: 'Reviewed', color: 'bg-blue-500' },
    { value: 'approved', label: 'Approved', color: 'bg-green-500' },
    { value: 'implemented', label: 'Implemented', color: 'bg-purple-500' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-500' },
];

export default function ViewSuggestions() {
    const queryClient = useQueryClient();

    const { data: suggestions, isLoading } = useQuery({
        queryKey: ['agent-suggestions'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('agent_suggestions')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data as Suggestion[];
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const { error } = await supabase
                .from('agent_suggestions')
                .update({ status })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agent-suggestions'] });
            toast.success('Status updated successfully');
        },
        onError: (error) => {
            toast.error('Failed to update status: ' + error.message);
        },
    });

    const getStatusBadge = (status: string) => {
        const option = statusOptions.find((o) => o.value === status);
        return (
            <Badge className={`${option?.color} text-white`}>
                {option?.label || status}
            </Badge>
        );
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
                        Agent Suggestions
                    </h1>
                    <p className="text-muted-foreground">
                        Review customer-submitted agent ideas
                    </p>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Agent Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Use Case</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Submitted</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : suggestions?.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="text-center text-muted-foreground"
                                >
                                    No suggestions yet. Customers can submit
                                    ideas through the portal.
                                </TableCell>
                            </TableRow>
                        ) : (
                            suggestions?.map((suggestion) => (
                                <TableRow key={suggestion.id}>
                                    <TableCell className="font-medium">
                                        {suggestion.agent_name}
                                    </TableCell>
                                    <TableCell>{suggestion.category}</TableCell>
                                    <TableCell className="max-w-xs truncate">
                                        {suggestion.description}
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">
                                        {suggestion.use_case || '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={suggestion.status}
                                            onValueChange={(value) =>
                                                updateMutation.mutate({
                                                    id: suggestion.id,
                                                    status: value,
                                                })
                                            }
                                        >
                                            <SelectTrigger className="w-[130px]">
                                                <SelectValue>
                                                    {getStatusBadge(
                                                        suggestion.status,
                                                    )}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusOptions.map((opt) => (
                                                    <SelectItem
                                                        key={opt.value}
                                                        value={opt.value}
                                                    >
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {format(
                                            new Date(suggestion.created_at),
                                            'MMM d, yyyy',
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
