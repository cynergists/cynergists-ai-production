import { cn } from '@/lib/utils';
import { MessageSquare, Settings, Users } from 'lucide-react';

type ActiveView =
    | 'chat'
    | 'onboarding'
    | 'settings'
    | 'dashboard'
    | 'campaigns'
    | 'connections'
    | 'messages'
    | 'activity'
    | 'add-site'
    | 'content-pipeline'
    | 'published'
    | 'analytics'
    | string;

interface AgentQuickLinksProps {
    activeView: ActiveView;
    setActiveView: (view: ActiveView) => void;
}

const links = [
    { key: 'chat', label: 'Chat', icon: MessageSquare },
    { key: 'onboarding', label: 'Onboarding', icon: Users },
    { key: 'settings', label: 'Settings', icon: Settings },
] as const;

export function AgentQuickLinks({ activeView, setActiveView }: AgentQuickLinksProps) {
    return (
        <nav className="flex flex-col space-y-2">
            {links.map(({ key, label, icon: Icon }) => (
                <button
                    key={key}
                    type="button"
                    onClick={() => setActiveView(key)}
                    className={cn(
                        'flex items-center gap-3 rounded-xl border-l-3 px-4 py-3 text-left text-base font-medium transition-all duration-200',
                        activeView === key
                            ? 'border-l-primary bg-primary/10 text-primary'
                            : 'border-l-transparent text-foreground/70 hover:bg-muted/50 hover:text-foreground',
                    )}
                >
                    <Icon className="h-5 w-5 shrink-0" />
                    {label}
                </button>
            ))}
        </nav>
    );
}
