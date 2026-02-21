import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Loader2, LogOut } from 'lucide-react';
import { toast } from 'sonner';

interface ImpersonationStatus {
    impersonating: boolean;
    admin?: {
        id: string;
        name: string;
        email: string;
    };
    impersonated_user?: {
        id: string;
        name: string;
        email: string;
    };
    started_at?: string;
    reason?: string;
}

export function ImpersonationBanner() {
    const queryClient = useQueryClient();

    // Check impersonation status
    const { data: status } = useQuery<ImpersonationStatus>({
        queryKey: ['impersonation-status'],
        queryFn: async () => {
            const response = await apiClient.get<ImpersonationStatus>(
                '/api/admin/impersonate/status',
            );
            return response;
        },
        refetchInterval: 30000, // Check every 30 seconds
    });

    // End impersonation mutation
    const endImpersonation = useMutation({
        mutationFn: async () => {
            return apiClient.post('/api/admin/impersonate/end');
        },
        onSuccess: () => {
            toast.success('Impersonation ended. Returning to admin view.');
            queryClient.invalidateQueries({ queryKey: ['impersonation-status'] });
            // Reload page to clear impersonated state
            window.location.href = '/portal';
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to end impersonation.');
        },
    });

    const handleEndImpersonation = () => {
        if (
            window.confirm(
                'End impersonation and return to your admin account?',
            )
        ) {
            endImpersonation.mutate();
        }
    };

    if (!status?.impersonating) {
        return null;
    }

    return (
        <div className="sticky top-0 z-50 flex items-center justify-between border-b-2 border-destructive bg-destructive/10 px-4 py-2 backdrop-blur-sm">
            <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
                <div className="flex flex-col">
                    <p className="text-sm font-semibold text-destructive">
                        Impersonating: {status.impersonated_user?.name}
                    </p>
                    <p className="text-xs text-destructive/80">
                        {status.impersonated_user?.email} • Admin:{' '}
                        {status.admin?.name}
                    </p>
                </div>
            </div>
            <Button
                variant="destructive"
                size="sm"
                onClick={handleEndImpersonation}
                disabled={endImpersonation.isPending}
                className="gap-2"
            >
                {endImpersonation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <LogOut className="h-4 w-4" />
                )}
                Exit Impersonation
            </Button>
        </div>
    );
}
