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
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { AccessLevel, UserType } from '@/hooks/useAdminUsersList';
import { callAdminApi } from '@/lib/admin-api';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface AddUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// Map user types to their default access levels
const userTypeToAccessLevel: Record<UserType, AccessLevel> = {
    client: 'limited',
    partner: 'limited',
    employee: 'manager',
    sales_rep: 'manager',
    admin: 'manager',
    super_admin: 'admin',
};

export function AddUserDialog({ open, onOpenChange }: AddUserDialogProps) {
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        user_type: 'client' as UserType,
    });

    const handleUserTypeChange = (value: UserType) => {
        setFormData((prev) => ({ ...prev, user_type: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.first_name || !formData.last_name) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsLoading(true);
        try {
            // Auto-set access level based on user type
            const dataToSend = {
                ...formData,
                access_level: userTypeToAccessLevel[formData.user_type],
            };

            await callAdminApi('create_admin_user', undefined, dataToSend);

            toast.success('User created successfully');
            queryClient.invalidateQueries({
                queryKey: ['admin', 'admin-users'],
            });
            onOpenChange(false);
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                user_type: 'client',
            });
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to create user',
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                        Create a new user account in the system.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="first_name">First Name *</Label>
                            <Input
                                id="first_name"
                                value={formData.first_name}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        first_name: e.target.value,
                                    }))
                                }
                                placeholder="First name"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last_name">Last Name *</Label>
                            <Input
                                id="last_name"
                                value={formData.last_name}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        last_name: e.target.value,
                                    }))
                                }
                                placeholder="Last name"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    email: e.target.value,
                                }))
                            }
                            placeholder="user@example.com"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    phone: e.target.value,
                                }))
                            }
                            placeholder="Phone number"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="user_type">User Type</Label>
                        <Select
                            value={formData.user_type}
                            onValueChange={handleUserTypeChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select user type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="client">Client</SelectItem>
                                <SelectItem value="partner">Partner</SelectItem>
                                <SelectItem value="employee">
                                    Employee
                                </SelectItem>
                                <SelectItem value="sales_rep">
                                    Sales Rep
                                </SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="super_admin">
                                    Super Admin
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Access level:{' '}
                            {userTypeToAccessLevel[formData.user_type]
                                .charAt(0)
                                .toUpperCase() +
                                userTypeToAccessLevel[formData.user_type].slice(
                                    1,
                                )}
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Create User
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
