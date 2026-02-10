import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FileText, LayoutTemplate, MessageSquare, Settings, Sparkles } from 'lucide-react';

interface MosaicSidebarProps {
    activeView: string;
    setActiveView: (view: string) => void;
<<<<<<< Updated upstream
    agentDetails?: any;
=======
>>>>>>> Stashed changes
}

export default function MosaicSidebar({
    activeView,
    setActiveView,
<<<<<<< Updated upstream
    agentDetails,
}: MosaicSidebarProps) {
    const changeUsage = agentDetails?.mosaic_data?.monthly_change_usage || 0;
    const changeLimit = agentDetails?.mosaic_data?.monthly_change_limit || 10;
    const warningMessage = agentDetails?.mosaic_data?.change_warning;

    return (
        <div className="hidden min-h-0 w-[300px] shrink-0 flex-col gap-6 transition-all duration-300 lg:flex">
            {warningMessage && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                        {warningMessage}
                    </p>
                </div>
            )}

=======
}: MosaicSidebarProps) {
    return (
        <div className="hidden min-h-0 w-[300px] shrink-0 flex-col gap-6 transition-all duration-300 lg:flex">
>>>>>>> Stashed changes
            <div className="flex flex-col rounded-2xl border border-primary/20 bg-card p-5">
                <h2 className="mb-4 shrink-0 text-lg font-semibold text-foreground">
                    Quick Links
                </h2>
                <nav className="flex flex-col space-y-2">
                    <button
                        onClick={() => setActiveView('chat')}
                        className={cn(
                            'flex items-center gap-3 rounded-xl border-l-3 px-4 py-3 text-left text-base font-medium transition-all duration-200',
                            activeView === 'chat'
                                ? 'border-l-primary bg-primary/10 text-primary'
                                : 'border-l-transparent text-foreground/70 hover:bg-muted/50 hover:text-foreground',
                        )}
                    >
                        <MessageSquare className="h-5 w-5 shrink-0" />
                        Chat
                    </button>
                    <button
                        onClick={() => setActiveView('preview')}
                        className={cn(
                            'flex items-center gap-3 rounded-xl border-l-3 px-4 py-3 text-left text-base font-medium transition-all duration-200',
                            activeView === 'preview'
                                ? 'border-l-primary bg-primary/10 text-primary'
                                : 'border-l-transparent text-foreground/70 hover:bg-muted/50 hover:text-foreground',
                        )}
                    >
                        <LayoutTemplate className="h-5 w-5 shrink-0" />
                        Preview
                    </button>
                    <button
                        onClick={() => setActiveView('blueprint')}
                        className={cn(
                            'flex items-center gap-3 rounded-xl border-l-3 px-4 py-3 text-left text-base font-medium transition-all duration-200',
                            activeView === 'blueprint'
                                ? 'border-l-primary bg-primary/10 text-primary'
                                : 'border-l-transparent text-foreground/70 hover:bg-muted/50 hover:text-foreground',
                        )}
                    >
                        <FileText className="h-5 w-5 shrink-0" />
                        Blueprint
                    </button>
                    <button
                        onClick={() => setActiveView('settings')}
                        className={cn(
                            'flex items-center gap-3 rounded-xl border-l-3 px-4 py-3 text-left text-base font-medium transition-all duration-200',
                            activeView === 'settings'
                                ? 'border-l-primary bg-primary/10 text-primary'
                                : 'border-l-transparent text-foreground/70 hover:bg-muted/50 hover:text-foreground',
                        )}
                    >
                        <Settings className="h-5 w-5 shrink-0" />
                        Settings
                    </button>
                </nav>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-primary/20 bg-card p-5">
                <h2 className="mb-4 shrink-0 text-lg font-semibold text-foreground">
                    Build Status
                </h2>
<<<<<<< Updated upstream
                <div className="flex-1 space-y-4 overflow-y-auto">
=======
                <div className="flex-1 overflow-y-auto">
>>>>>>> Stashed changes
                    <div className="space-y-3 text-sm text-foreground">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Preview queued after onboarding
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Mosaic will generate your blueprint and preview once
                            onboarding is complete.
                        </div>
                    </div>
<<<<<<< Updated upstream
                    <div className="space-y-2 border-t border-primary/10 pt-4">
                        <h3 className="text-xs font-semibold text-foreground">
                            Monthly Changes
                        </h3>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Used</span>
                            <span className="font-semibold text-foreground">
                                {changeUsage} / {changeLimit}
                            </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full bg-primary transition-all duration-300"
                                style={{
                                    width: `${Math.min((changeUsage / changeLimit) * 100, 100)}%`,
                                }}
                            />
                        </div>
                    </div>
=======
>>>>>>> Stashed changes
                </div>
                <div className="shrink-0 border-t border-primary/20 pt-4">
                    <Button
                        variant="outline"
                        className="h-9 w-full gap-2 text-sm font-medium hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                    >
                        View Status
                    </Button>
                </div>
            </div>
        </div>
    );
}
