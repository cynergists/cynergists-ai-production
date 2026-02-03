import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { ArrowLeft, ShieldX } from 'lucide-react';

export default function AccessDenied() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="max-w-md space-y-6 px-6 text-center">
                <div className="flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                        <ShieldX className="h-8 w-8 text-destructive" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-foreground">
                        Access Denied
                    </h1>
                    <p className="text-muted-foreground">
                        You don't have permission to access this page.
                    </p>
                </div>

                <p className="text-sm text-muted-foreground">
                    If you believe this is an error, please contact your
                    administrator.
                </p>

                <Button
                    onClick={() => router.visit('/admin')}
                    variant="outline"
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Button>
            </div>
        </div>
    );
}
