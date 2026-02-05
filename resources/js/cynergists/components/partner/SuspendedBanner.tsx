import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';

export function SuspendedBanner() {
    return (
        <div className="border-b border-destructive/20 bg-destructive/10 px-4 py-3">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <p className="text-sm font-medium text-destructive">
                        Your account has been suspended. Please contact support
                        for assistance.
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="border-destructive/50 text-destructive hover:bg-destructive/10"
                >
                    <Link href="/partner/tickets">Contact Support</Link>
                </Button>
            </div>
        </div>
    );
}
