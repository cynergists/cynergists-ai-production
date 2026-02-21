import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { apiClient } from '@/lib/api-client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2, Search, User, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface SearchUser {
    id: string;
    name: string;
    email: string;
    created_at: string;
}

export default function ImpersonatePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
    const [reason, setReason] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);

    // Search users
    const { data: searchResults, isLoading: searching } = useQuery<{ users: SearchUser[] }>({
        queryKey: ['user-search', searchQuery],
        queryFn: async () => {
            if (searchQuery.length < 2) {
                return { users: [] };
            }
            const response = await apiClient.get<{ users: SearchUser[] }>(
                `/api/admin/impersonate/search?query=${encodeURIComponent(searchQuery)}`,
            );
            return response;
        },
        enabled: searchQuery.length >= 2,
    });

    // Start impersonation
    const startImpersonation = useMutation({
        mutationFn: async () => {
            if (!selectedUser) throw new Error('No user selected');
            return apiClient.post('/api/admin/impersonate/start', {
                user_id: selectedUser.id,
                reason: reason.trim() || null,
            });
        },
        onSuccess: () => {
            toast.success(
                `Now impersonating ${selectedUser?.name}. Redirecting to portal...`,
            );
            // Redirect to portal as impersonated user
            setTimeout(() => {
                window.location.href = '/portal';
            }, 1000);
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to start impersonation.');
        },
    });

    const handleUserSelect = (user: SearchUser) => {
        setSelectedUser(user);
        setDialogOpen(true);
    };

    const handleConfirmImpersonation = () => {
        startImpersonation.mutate();
    };

    return (
        <PortalLayout>
            <div className="mx-auto max-w-4xl space-y-6 p-6">
                <div>
                    <h1 className="mb-2 text-2xl font-bold text-foreground">
                        Impersonate User
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        View the portal exactly as a user sees it for support and debugging.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Search Users
                        </CardTitle>
                        <CardDescription>
                            Search by name or email to find a user to impersonate.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {searching && (
                            <div className="flex items-center justify-center py-8 text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Searching...
                            </div>
                        )}

                        {!searching && searchResults && searchResults.users.length > 0 && (
                            <div className="space-y-2">
                                {searchResults.users.map((user) => (
                                    <button
                                        key={user.id}
                                        type="button"
                                        onClick={() => handleUserSelect(user)}
                                        className="flex w-full items-center justify-between rounded-lg border border-border p-4 text-left transition-colors hover:bg-muted/50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">
                                                    {user.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Joined {user.created_at}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}

                        {!searching &&
                            searchQuery.length >= 2 &&
                            searchResults?.users.length === 0 && (
                                <div className="py-8 text-center text-sm text-muted-foreground">
                                    No users found matching "{searchQuery}"
                                </div>
                            )}

                        {searchQuery.length < 2 && !searching && (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                Enter at least 2 characters to search
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="text-sm">Important Notes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p>• You will inherit ONLY the user's permissions (not admin privileges)</p>
                        <p>• All actions are logged for audit purposes</p>
                        <p>• Impersonation banner will show at all times</p>
                        <p>• You can exit impersonation at any time</p>
                        <p>• Cannot impersonate other admin accounts</p>
                    </CardContent>
                </Card>
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserCheck className="h-5 w-5 text-primary" />
                            Confirm Impersonation
                        </DialogTitle>
                        <DialogDescription>
                            You are about to impersonate the following user:
                        </DialogDescription>
                    </DialogHeader>

                    {selectedUser && (
                        <div className="space-y-4 py-4">
                            <div className="rounded-lg border border-border bg-muted/50 p-4">
                                <p className="font-semibold text-foreground">
                                    {selectedUser.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {selectedUser.email}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason">Reason (Optional)</Label>
                                <Textarea
                                    id="reason"
                                    placeholder="e.g., Debugging portal issue, Support request #123"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows={3}
                                    maxLength={500}
                                />
                                <p className="text-xs text-muted-foreground">
                                    This will be logged for audit purposes.
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                            disabled={startImpersonation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmImpersonation}
                            disabled={startImpersonation.isPending}
                        >
                            {startImpersonation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Starting...
                                </>
                            ) : (
                                'Start Impersonation'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PortalLayout>
    );
}
