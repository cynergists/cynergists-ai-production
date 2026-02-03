import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { Link } from '@inertiajs/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface FAQItem {
    id: string;
    question: string;
    answer: string;
    is_active: boolean;
    sort_order: number;
}

export default function ManageFAQs() {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<FAQItem | null>(null);
    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        is_active: true,
    });

    const { data: items, isLoading } = useQuery({
        queryKey: ['portal-faqs'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('portal_faq_items')
                .select('*')
                .order('sort_order', { ascending: true });
            if (error) throw error;
            return data as FAQItem[];
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const { error } = await supabase.from('portal_faq_items').insert({
                ...data,
                sort_order: (items?.length || 0) + 1,
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portal-faqs'] });
            toast.success('FAQ created successfully');
            resetForm();
        },
        onError: (error) => {
            toast.error('Failed to create FAQ: ' + error.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: string;
            data: typeof formData;
        }) => {
            const { error } = await supabase
                .from('portal_faq_items')
                .update(data)
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portal-faqs'] });
            toast.success('FAQ updated successfully');
            resetForm();
        },
        onError: (error) => {
            toast.error('Failed to update FAQ: ' + error.message);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('portal_faq_items')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portal-faqs'] });
            toast.success('FAQ deleted successfully');
        },
        onError: (error) => {
            toast.error('Failed to delete FAQ: ' + error.message);
        },
    });

    const resetForm = () => {
        setFormData({
            question: '',
            answer: '',
            is_active: true,
        });
        setEditingItem(null);
        setIsDialogOpen(false);
    };

    const handleEdit = (item: FAQItem) => {
        setEditingItem(item);
        setFormData({
            question: item.question,
            answer: item.answer,
            is_active: item.is_active,
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            updateMutation.mutate({ id: editingItem.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/client-portal">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Manage FAQs
                        </h1>
                        <p className="text-muted-foreground">
                            Configure FAQ items for the customer support page
                        </p>
                    </div>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => resetForm()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add FAQ
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingItem ? 'Edit FAQ' : 'Add FAQ'}
                                </DialogTitle>
                                <DialogDescription>
                                    {editingItem
                                        ? 'Update the FAQ details'
                                        : 'Fill in the question and answer'}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="question">Question</Label>
                                    <Input
                                        id="question"
                                        value={formData.question}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                question: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="answer">Answer</Label>
                                    <Textarea
                                        id="answer"
                                        value={formData.answer}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                answer: e.target.value,
                                            })
                                        }
                                        rows={4}
                                        required
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="is_active"
                                        checked={formData.is_active}
                                        onCheckedChange={(checked) =>
                                            setFormData({
                                                ...formData,
                                                is_active: checked,
                                            })
                                        }
                                    />
                                    <Label htmlFor="is_active">Active</Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={
                                        createMutation.isPending ||
                                        updateMutation.isPending
                                    }
                                >
                                    {editingItem ? 'Update' : 'Create'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40%]">Question</TableHead>
                            <TableHead className="w-[40%]">Answer</TableHead>
                            <TableHead>Active</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : items?.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="text-center text-muted-foreground"
                                >
                                    No FAQs yet. Click "Add FAQ" to create one.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items?.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                        {item.question}
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate text-muted-foreground">
                                        {item.answer}
                                    </TableCell>
                                    <TableCell>
                                        {item.is_active ? 'Yes' : 'No'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(item)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                if (
                                                    confirm(
                                                        'Are you sure you want to delete this FAQ?',
                                                    )
                                                ) {
                                                    deleteMutation.mutate(
                                                        item.id,
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
        </div>
    );
}
