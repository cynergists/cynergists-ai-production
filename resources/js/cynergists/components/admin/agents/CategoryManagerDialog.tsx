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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { callAdminApi } from '@/lib/admin-api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Plus, Tag, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Category {
    id: string;
    name: string;
    display_order: number;
}

interface Agent {
    id: string;
    name: string;
    category: string;
}

interface CategoryManagerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CategoryManagerDialog({
    open,
    onOpenChange,
}: CategoryManagerDialogProps) {
    const queryClient = useQueryClient();
    const [newCategoryName, setNewCategoryName] = useState('');
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
        null,
    );
    const [affectedAgents, setAffectedAgents] = useState<Agent[]>([]);

    const { data: categories, isLoading } = useQuery({
        queryKey: ['agent-categories'],
        queryFn: async () => {
            return callAdminApi<Category[]>('get_agent_categories');
        },
    });

    const { data: agents } = useQuery({
        queryKey: ['portal-agents-for-categories'],
        queryFn: async () => {
            const data = await callAdminApi<Agent[]>('get_ai_agents');
            return data.map((agent) => ({
                id: agent.id,
                name: agent.name,
                category: agent.category,
            }));
        },
    });

    const addCategoryMutation = useMutation({
        mutationFn: async (name: string) => {
            const maxOrder =
                categories?.reduce(
                    (max, cat) => Math.max(max, cat.display_order),
                    0,
                ) || 0;
            await callAdminApi('create_agent_category', undefined, {
                name,
                display_order: maxOrder + 1,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agent-categories'] });
            queryClient.invalidateQueries({
                queryKey: ['agent-categories-names'],
            });
            setNewCategoryName('');
            toast.success('Category added successfully');
        },
        onError: (error: Error) => {
            if (error.message.includes('duplicate')) {
                toast.error('A category with this name already exists');
            } else {
                toast.error('Failed to add category: ' + error.message);
            }
        },
    });

    const deleteCategoryMutation = useMutation({
        mutationFn: async (category: Category) => {
            await callAdminApi(
                'delete_agent_category',
                { id: category.id },
                { name: category.name },
            );

            return affectedAgents.length;
        },
        onSuccess: (updatedCount) => {
            queryClient.invalidateQueries({ queryKey: ['agent-categories'] });
            queryClient.invalidateQueries({
                queryKey: ['agent-categories-names'],
            });
            queryClient.invalidateQueries({ queryKey: ['portal-agents'] });
            queryClient.invalidateQueries({
                queryKey: ['portal-agents-for-categories'],
            });
            setCategoryToDelete(null);
            setAffectedAgents([]);
            if (updatedCount > 0) {
                toast.success(
                    `Category deleted. ${updatedCount} agent(s) moved to "General"`,
                );
            } else {
                toast.success('Category deleted successfully');
            }
        },
        onError: (error: Error) => {
            toast.error('Failed to delete category: ' + error.message);
        },
    });

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        addCategoryMutation.mutate(newCategoryName.trim());
    };

    const handleDeleteClick = (category: Category) => {
        // Check if any agents use this category
        const agentsWithCategory =
            agents?.filter((a) => a.category === category.name) || [];
        setAffectedAgents(agentsWithCategory);
        setCategoryToDelete(category);
    };

    const confirmDelete = () => {
        if (categoryToDelete) {
            deleteCategoryMutation.mutate(categoryToDelete);
        }
    };

    const isProtectedCategory = (name: string) => name === 'General';

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Tag className="h-5 w-5" />
                            Manage Categories
                        </DialogTitle>
                        <DialogDescription>
                            Add or remove categories for AI Agents
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Add new category */}
                        <form
                            onSubmit={handleAddCategory}
                            className="flex gap-2"
                        >
                            <Input
                                placeholder="New category name..."
                                value={newCategoryName}
                                onChange={(e) =>
                                    setNewCategoryName(e.target.value)
                                }
                                className="flex-1"
                            />
                            <Button
                                type="submit"
                                disabled={
                                    !newCategoryName.trim() ||
                                    addCategoryMutation.isPending
                                }
                            >
                                <Plus className="mr-1 h-4 w-4" />
                                Add
                            </Button>
                        </form>

                        {/* Category list */}
                        <div className="rounded-lg border">
                            <ScrollArea className="h-[300px]">
                                <div className="space-y-1 p-2">
                                    {isLoading ? (
                                        <p className="py-4 text-center text-sm text-muted-foreground">
                                            Loading...
                                        </p>
                                    ) : categories?.length === 0 ? (
                                        <p className="py-4 text-center text-sm text-muted-foreground">
                                            No categories
                                        </p>
                                    ) : (
                                        categories?.map((category) => {
                                            const agentCount =
                                                agents?.filter(
                                                    (a) =>
                                                        a.category ===
                                                        category.name,
                                                ).length || 0;
                                            return (
                                                <div
                                                    key={category.id}
                                                    className="flex items-center justify-between rounded-lg p-2 hover:bg-muted/50"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">
                                                            {category.name}
                                                        </span>
                                                        {agentCount > 0 && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="text-xs"
                                                            >
                                                                {agentCount}{' '}
                                                                agent
                                                                {agentCount !==
                                                                1
                                                                    ? 's'
                                                                    : ''}
                                                            </Badge>
                                                        )}
                                                        {isProtectedCategory(
                                                            category.name,
                                                        ) && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                Default
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {!isProtectedCategory(
                                                        category.name,
                                                    ) && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                            onClick={() =>
                                                                handleDeleteClick(
                                                                    category,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete confirmation dialog */}
            <AlertDialog
                open={!!categoryToDelete}
                onOpenChange={(open) => !open && setCategoryToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            {affectedAgents.length > 0 && (
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                            )}
                            Delete "{categoryToDelete?.name}" category?
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-3">
                                {affectedAgents.length > 0 ? (
                                    <>
                                        <p className="font-medium text-amber-600 dark:text-amber-400">
                                            This category is currently being
                                            used by {affectedAgents.length}{' '}
                                            agent
                                            {affectedAgents.length !== 1
                                                ? 's'
                                                : ''}
                                            :
                                        </p>
                                        <div className="space-y-1 rounded-lg bg-muted/50 p-3">
                                            {affectedAgents.map((agent) => (
                                                <div
                                                    key={agent.id}
                                                    className="text-sm font-medium"
                                                >
                                                    • {agent.name}
                                                </div>
                                            ))}
                                        </div>
                                        <p>
                                            If you proceed, these agents will be
                                            moved to the{' '}
                                            <strong>"General"</strong> category.
                                        </p>
                                    </>
                                ) : (
                                    <p>
                                        This category is not being used by any
                                        agents.
                                    </p>
                                )}
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {affectedAgents.length > 0
                                ? `Delete & Move ${affectedAgents.length} Agent${affectedAgents.length !== 1 ? 's' : ''}`
                                : 'Delete Category'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
