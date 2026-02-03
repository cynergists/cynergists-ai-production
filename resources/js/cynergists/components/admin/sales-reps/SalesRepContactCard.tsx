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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
    useCreateSalesRep,
    useDeleteSalesRep,
    useUpdateSalesRep,
    type SalesRep,
} from '@/hooks/useSalesRepsList';
import { formatErrorMessage } from '@/utils/errorMessages';
import { DollarSign, Loader2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SalesRepContactCardProps {
    rep: SalesRep | null;
    isNew: boolean;
    open: boolean;
    onClose: () => void;
}

export function SalesRepContactCard({
    rep,
    isNew,
    open,
    onClose,
}: SalesRepContactCardProps) {
    const { toast } = useToast();
    const createMutation = useCreateSalesRep();
    const updateMutation = useUpdateSalesRep();
    const deleteMutation = useDeleteSalesRep();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        title: '',
        status: 'active',
        commission_rate: '',
        total_clients: '',
        monthly_revenue: '',
        hire_date: '',
        notes: '',
    });

    useEffect(() => {
        if (rep) {
            setFormData({
                name: rep.name || '',
                email: rep.email || '',
                phone: rep.phone || '',
                title: rep.title || '',
                status: rep.status || 'active',
                commission_rate: rep.commission_rate?.toString() || '',
                total_clients: rep.total_clients?.toString() || '',
                monthly_revenue: rep.monthly_revenue?.toString() || '',
                hire_date: rep.hire_date || '',
                notes: rep.notes || '',
            });
        } else if (isNew) {
            setFormData({
                name: '',
                email: '',
                phone: '',
                title: '',
                status: 'active',
                commission_rate: '',
                total_clients: '',
                monthly_revenue: '',
                hire_date: '',
                notes: '',
            });
        }
    }, [rep, isNew]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast({
                title: 'Error',
                description: 'Name is required',
                variant: 'destructive',
            });
            return;
        }

        // Convert string values to numbers for API
        const payload = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            title: formData.title || 'Solutions Expert',
            status: formData.status,
            commission_rate: formData.commission_rate
                ? parseFloat(formData.commission_rate)
                : 0,
            total_clients: formData.total_clients
                ? parseInt(formData.total_clients)
                : 0,
            monthly_revenue: formData.monthly_revenue
                ? parseFloat(formData.monthly_revenue)
                : 0,
            hire_date: formData.hire_date,
            notes: formData.notes,
        };

        try {
            if (isNew) {
                await createMutation.mutateAsync(payload);
                toast({
                    title: 'Success',
                    description: 'Sales rep created successfully',
                });
            } else if (rep) {
                await updateMutation.mutateAsync({ id: rep.id, ...payload });
                toast({
                    title: 'Success',
                    description: 'Sales rep updated successfully',
                });
            }
            onClose();
        } catch (error) {
            const rawMessage =
                error instanceof Error ? error.message : 'Failed to save';
            const message = formatErrorMessage(rawMessage, 'sales rep');
            toast({
                title: 'Error',
                description: message,
                variant: 'destructive',
            });
        }
    };

    const handleDelete = async () => {
        if (!rep) return;
        try {
            await deleteMutation.mutateAsync(rep.id);
            toast({
                title: 'Success',
                description: 'Sales rep deleted successfully',
            });
            setDeleteDialogOpen(false);
            onClose();
        } catch (error) {
            toast({
                title: 'Error',
                description:
                    error instanceof Error ? error.message : 'Failed to delete',
                variant: 'destructive',
            });
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <>
            <Sheet open={open} onOpenChange={onClose}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>
                            {isNew ? 'Add Sales Rep' : 'Edit Sales Rep'}
                        </SheetTitle>
                    </SheetHeader>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="Full name"
                                />
                            </div>

                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            email: e.target.value,
                                        })
                                    }
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div>
                                <Label htmlFor="phone">Phone</Label>
                                <PhoneInput
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            phone: value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            title: e.target.value,
                                        })
                                    }
                                    placeholder="Solutions Expert"
                                />
                            </div>

                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            status: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">
                                            Active
                                        </SelectItem>
                                        <SelectItem value="inactive">
                                            Inactive
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="commission_rate">
                                    Commission Rate (%)
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="commission_rate"
                                        type="number"
                                        step="0.1"
                                        value={formData.commission_rate}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                commission_rate: e.target.value,
                                            })
                                        }
                                        placeholder="10"
                                        className="pr-8"
                                    />
                                    <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
                                        %
                                    </span>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="hire_date">Hire Date</Label>
                                <Input
                                    id="hire_date"
                                    type="date"
                                    value={formData.hire_date}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            hire_date: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label htmlFor="total_clients">
                                    Total Clients
                                </Label>
                                <Input
                                    id="total_clients"
                                    type="number"
                                    value={formData.total_clients}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            total_clients: e.target.value,
                                        })
                                    }
                                    placeholder="0"
                                />
                            </div>

                            <div>
                                <Label htmlFor="monthly_revenue">
                                    Monthly Revenue
                                </Label>
                                <div className="relative">
                                    <DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="monthly_revenue"
                                        type="number"
                                        step="0.01"
                                        value={formData.monthly_revenue}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                monthly_revenue: e.target.value,
                                            })
                                        }
                                        placeholder="0.00"
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div className="col-span-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            notes: e.target.value,
                                        })
                                    }
                                    placeholder="Additional notes..."
                                    rows={4}
                                />
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            {!isNew && rep && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => setDeleteDialogOpen(true)}
                                    disabled={deleteMutation.isPending}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </Button>
                            )}
                            <div className="ml-auto flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {isNew ? 'Create' : 'Save Changes'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>

            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Sales Rep</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {rep?.name}? This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                'Delete'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
