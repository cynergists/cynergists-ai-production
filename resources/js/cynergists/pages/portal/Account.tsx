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
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { Skeleton } from '@/components/ui/skeleton';
import { usePortalContext } from '@/contexts/PortalContext';
import { apiClient } from '@/lib/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    AlertCircle,
    Bot,
    Check,
    Key,
    Loader2,
    Pencil,
    UserCircle,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface AccountAgent {
    id: string;
    agent_type: string;
    agent_name: string;
    is_active: boolean;
    usage_count: number | null;
    last_used_at: string | null;
    avatar_url: string | null;
    billing_type: 'monthly' | 'one_time';
    subscription: {
        id: string;
        status: string;
        tier: string | null;
        end_date: string | null;
        billing_type: string | null;
        square_subscription_id: string | null;
    } | null;
}

interface AccountData {
    profile: {
        first_name: string | null;
        last_name: string | null;
        company_name: string | null;
    } | null;
    agents: AccountAgent[];
}

export default function PortalAccount() {
    const { user } = usePortalContext();
    const queryClient = useQueryClient();
    const [unsubscribeTarget, setUnsubscribeTarget] = useState<{
        id: string;
        name: string;
        billingType?: 'monthly' | 'one_time';
    } | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['portal-account', user?.id],
        queryFn: async () => {
            const response =
                await apiClient.get<AccountData>('/api/portal/account');
            return response;
        },
        enabled: Boolean(user?.id),
    });

    useEffect(() => {
        if (data?.profile) {
            setFirstName(data.profile.first_name || '');
            setLastName(data.profile.last_name || '');
            setCompanyName(data.profile.company_name || '');
        }
    }, [data?.profile]);

    const updateProfile = useMutation({
        mutationFn: async () => {
            return apiClient.put<{ success: boolean }>('/api/portal/profile', {
                first_name: firstName,
                last_name: lastName,
                company_name: companyName,
            });
        },
        onSuccess: () => {
            toast.success('Profile updated');
            setIsEditing(false);
            queryClient.invalidateQueries({
                queryKey: ['portal-account', user?.id],
            });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update profile');
        },
    });

    const handleCancelEdit = () => {
        setFirstName(data?.profile?.first_name || '');
        setLastName(data?.profile?.last_name || '');
        setCompanyName(data?.profile?.company_name || '');
        setIsEditing(false);
    };

    const changePassword = useMutation({
        mutationFn: async () => {
            if (newPassword !== confirmPassword) {
                throw new Error('Passwords do not match');
            }
            if (newPassword.length < 8) {
                throw new Error('Password must be at least 8 characters');
            }
            return apiClient.patch<{ success: boolean }>(
                '/api/user/password',
                {
                    current_password: currentPassword,
                    password: newPassword,
                    password_confirmation: confirmPassword,
                },
            );
        },
        onSuccess: () => {
            toast.success('Password changed successfully');
            setIsChangingPassword(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to change password');
        },
    });

    const handleCancelPasswordChange = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsChangingPassword(false);
    };

    const unsubscribeMutation = useMutation({
        mutationFn: async (agentId: string) => {
            return apiClient.post<{ success: boolean; message: string }>(
                `/api/portal/account/unsubscribe/${agentId}`,
            );
        },
        onSuccess: (response) => {
            toast.success(
                response.message || 'Agent unsubscribed successfully',
            );
            queryClient.invalidateQueries({
                queryKey: ['portal-account', user?.id],
            });
            queryClient.invalidateQueries({
                queryKey: ['portal-agents', user?.id],
            });
            setUnsubscribeTarget(null);
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to unsubscribe');
            setUnsubscribeTarget(null);
        },
    });

    const profile = data?.profile;
    const agents = data?.agents ?? [];
    const displayName = [profile?.first_name, profile?.last_name]
        .filter(Boolean)
        .join(' ');

    return (
        <div className="h-full overflow-y-auto">
            <div className="mx-auto max-w-4xl px-6 py-8 lg:px-8">
                <div className="mb-8">
                    <div className="mb-2 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <UserCircle className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">
                                Account
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Manage your profile and agent subscriptions.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Profile Information - Left column */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <UserCircle className="h-4 w-4" />
                                        Profile
                                    </CardTitle>
                                    {!isLoading && !isEditing && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="space-y-4">
                                        <Skeleton className="h-16 w-16 rounded-full" />
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-4 w-48" />
                                        <Skeleton className="h-4 w-36" />
                                    </div>
                                ) : isEditing ? (
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            updateProfile.mutate();
                                        }}
                                        className="space-y-4"
                                    >
                                        <div className="space-y-2">
                                            <Label htmlFor="first_name">
                                                First Name
                                            </Label>
                                            <Input
                                                id="first_name"
                                                value={firstName}
                                                onChange={(e) =>
                                                    setFirstName(e.target.value)
                                                }
                                                placeholder="First name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="last_name">
                                                Last Name
                                            </Label>
                                            <Input
                                                id="last_name"
                                                value={lastName}
                                                onChange={(e) =>
                                                    setLastName(e.target.value)
                                                }
                                                placeholder="Last name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="company_name">
                                                Company
                                            </Label>
                                            <Input
                                                id="company_name"
                                                value={companyName}
                                                onChange={(e) =>
                                                    setCompanyName(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Company name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <p className="text-sm text-muted-foreground">
                                                {user?.email || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                type="submit"
                                                size="sm"
                                                className="flex-1"
                                                disabled={
                                                    updateProfile.isPending
                                                }
                                            >
                                                {updateProfile.isPending ? (
                                                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <Check className="mr-2 h-3.5 w-3.5" />
                                                )}
                                                Save
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleCancelEdit}
                                                disabled={
                                                    updateProfile.isPending
                                                }
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
                                            {profile?.first_name?.[0]?.toUpperCase() ||
                                                user?.email?.[0]?.toUpperCase() ||
                                                '?'}
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                    Name
                                                </p>
                                                <p className="text-sm font-medium text-foreground">
                                                    {displayName || 'Not set'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                    Email
                                                </p>
                                                <p className="text-sm font-medium text-foreground">
                                                    {user?.email || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                    Company
                                                </p>
                                                <p className="text-sm font-medium text-foreground">
                                                    {profile?.company_name ||
                                                        'Not set'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Password Change */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Key className="h-4 w-4" />
                                        Password
                                    </CardTitle>
                                    {!isChangingPassword && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0"
                                            onClick={() =>
                                                setIsChangingPassword(true)
                                            }
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isChangingPassword ? (
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            changePassword.mutate();
                                        }}
                                        className="space-y-4"
                                    >
                                        <div className="space-y-2">
                                            <Label htmlFor="current_password">
                                                Current Password
                                            </Label>
                                            <PasswordInput
                                                id="current_password"
                                                value={currentPassword}
                                                onChange={(e) =>
                                                    setCurrentPassword(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Current password"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="new_password">
                                                New Password
                                            </Label>
                                            <PasswordInput
                                                id="new_password"
                                                value={newPassword}
                                                onChange={(e) =>
                                                    setNewPassword(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="At least 8 characters"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirm_password">
                                                Confirm Password
                                            </Label>
                                            <PasswordInput
                                                id="confirm_password"
                                                value={confirmPassword}
                                                onChange={(e) =>
                                                    setConfirmPassword(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Repeat new password"
                                                required
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                type="submit"
                                                size="sm"
                                                className="flex-1"
                                                disabled={
                                                    changePassword.isPending
                                                }
                                            >
                                                {changePassword.isPending ? (
                                                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <Check className="mr-2 h-3.5 w-3.5" />
                                                )}
                                                Change Password
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={
                                                    handleCancelPasswordChange
                                                }
                                                disabled={
                                                    changePassword.isPending
                                                }
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">
                                            Change your password to keep your
                                            account secure.
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setIsChangingPassword(true)
                                            }
                                        >
                                            Change Password
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Agent Subscriptions - Right column */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <Bot className="h-4 w-4" />
                                            Agent Subscriptions
                                        </CardTitle>
                                        <CardDescription>
                                            Your active AI agents
                                        </CardDescription>
                                    </div>
                                    {!isLoading && agents.length > 0 && (
                                        <Badge variant="secondary">
                                            {agents.length} active
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map((i) => (
                                            <div
                                                key={i}
                                                className="flex items-center gap-4 rounded-lg border border-border p-4"
                                            >
                                                <Skeleton className="h-10 w-10 rounded-lg" />
                                                <div className="flex-1 space-y-2">
                                                    <Skeleton className="h-4 w-32" />
                                                    <Skeleton className="h-3 w-20" />
                                                </div>
                                                <Skeleton className="h-8 w-24" />
                                            </div>
                                        ))}
                                    </div>
                                ) : agents.length === 0 ? (
                                    <div className="py-12 text-center text-muted-foreground">
                                        <AlertCircle className="mx-auto mb-3 h-10 w-10 opacity-40" />
                                        <p className="font-medium">
                                            No active agent subscriptions
                                        </p>
                                        <p className="mt-1 text-sm">
                                            Browse available agents to get
                                            started.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {agents.map((agent) => {
                                            const isCynessa =
                                                agent.agent_name.toLowerCase() ===
                                                'cynessa';
                                            const isMonthly =
                                                agent.billing_type === 'monthly';
                                            const isPendingCancellation =
                                                agent.subscription?.status ===
                                                'pending_cancellation';

                                            return (
                                                <div
                                                    key={agent.id}
                                                    className="flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/30"
                                                >
                                                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                                                        {agent.avatar_url ? (
                                                            <img
                                                                src={
                                                                    agent.avatar_url
                                                                }
                                                                alt={
                                                                    agent.agent_name
                                                                }
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center bg-primary/10">
                                                                <Bot className="h-5 w-5 text-primary" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium text-foreground">
                                                            {agent.agent_name}
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xs text-muted-foreground">
                                                                {agent.agent_type}
                                                            </p>
                                                            <Badge
                                                                variant="outline"
                                                                className="text-[10px] px-1.5 py-0"
                                                            >
                                                                {isMonthly
                                                                    ? 'Monthly'
                                                                    : 'One-time'}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="flex shrink-0 items-center gap-2">
                                                        {agent.subscription
                                                            ?.tier && (
                                                            <Badge
                                                                variant="outline"
                                                                className="capitalize"
                                                            >
                                                                {
                                                                    agent
                                                                        .subscription
                                                                        .tier
                                                                }
                                                            </Badge>
                                                        )}
                                                        {isPendingCancellation ? (
                                                            <Badge variant="secondary">
                                                                Cancelling...
                                                            </Badge>
                                                        ) : (
                                                            !isCynessa && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                    onClick={() =>
                                                                        setUnsubscribeTarget(
                                                                            {
                                                                                id: agent.id,
                                                                                name: agent.agent_name,
                                                                                billingType:
                                                                                    agent.billing_type,
                                                                            },
                                                                        )
                                                                    }
                                                                >
                                                                    <XCircle className="mr-1.5 h-3.5 w-3.5" />
                                                                    {isMonthly
                                                                        ? 'Cancel Subscription'
                                                                        : 'Remove Access'}
                                                                </Button>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Unsubscribe Confirmation Dialog */}
            <AlertDialog
                open={!!unsubscribeTarget}
                onOpenChange={(open) => !open && setUnsubscribeTarget(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {unsubscribeTarget?.billingType === 'monthly'
                                ? `Cancel subscription for ${unsubscribeTarget?.name}?`
                                : `Remove access to ${unsubscribeTarget?.name}?`}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {unsubscribeTarget?.billingType === 'monthly'
                                ? `Your subscription will be cancelled, but access to ${unsubscribeTarget?.name} will remain active until the end of your current billing period.`
                                : `This will immediately deactivate your access to ${unsubscribeTarget?.name}. You will no longer be able to use this agent.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={unsubscribeMutation.isPending}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() =>
                                unsubscribeTarget &&
                                unsubscribeMutation.mutate(
                                    unsubscribeTarget.id,
                                )
                            }
                            disabled={unsubscribeMutation.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {unsubscribeMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {unsubscribeTarget?.billingType ===
                                    'monthly'
                                        ? 'Cancelling...'
                                        : 'Removing...'}
                                </>
                            ) : unsubscribeTarget?.billingType === 'monthly' ? (
                                'Cancel Subscription'
                            ) : (
                                'Remove Access'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
