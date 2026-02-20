import { AgentQuickLinks } from '@/components/portal/AgentQuickLinks';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    BarChart3,
    CheckCircle,
    Clock,
    Download,
    Eye,
    FileText,
    Globe,
    Plus,
    TrendingUp,
    XCircle,
} from 'lucide-react';

interface CarbonSidebarProps {
    agentDetails: any;
    seoStats?: {
        healthScore: number | null;
        totalSites: number;
        activeAudits: number;
        metrics: Array<{
            id: string;
            label: string;
            value: number | string;
            status?: 'good' | 'warning' | 'poor';
        }>;
    };
    activeView?: string;
    setActiveView?: (view: string) => void;
    todayActivity?: any;
    setupProgress?: any;
}

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'completed':
            return CheckCircle;
        case 'running':
            return Clock;
        case 'failed':
            return XCircle;
        default:
            return FileText;
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'completed':
            return 'text-green-500';
        case 'running':
            return 'text-blue-500';
        case 'failed':
            return 'text-red-500';
        default:
            return 'text-gray-500';
    }
};

export default function CarbonSidebar({
    agentDetails,
    seoStats,
    activeView,
    setActiveView,
}: CarbonSidebarProps) {
    const stats = seoStats || {
        healthScore: null,
        totalSites: 0,
        activeAudits: 0,
        metrics: [],
    };

    const hasHealthScore = stats.healthScore !== null;

    // Extract SEO data from agentDetails
    const seoData = agentDetails?.seo_data || {};
    const sites = seoData?.sites || [];
    const recentAudits = seoData?.recent_audits || [];
    const topRecommendations = seoData?.top_recommendations || [];

    return (
        <div className="hidden min-h-0 w-[300px] shrink-0 flex-col gap-6 transition-all duration-300 lg:flex">
            {/* Quick Links */}
            <div className="flex flex-col rounded-2xl border border-primary/20 bg-card p-5">
                <h2 className="mb-4 shrink-0 text-lg font-semibold text-foreground">
                    Quick Links
                </h2>
                <AgentQuickLinks activeView={activeView ?? 'chat'} setActiveView={setActiveView ?? (() => {})} />
            </div>

            {/* SEO Overview */}
            <div className="flex flex-col rounded-2xl border border-green-500/20 bg-card p-5">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                        <BarChart3 className="h-5 w-5 text-green-600" />
                        SEO Overview
                    </h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 text-green-600 hover:bg-green-500/10 hover:text-green-600"
                        onClick={() => setActiveView?.('add-site')}
                    >
                        <Plus className="h-4 w-4" />
                        <span className="text-xs font-medium">Add Site</span>
                    </Button>
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="mb-1 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase">
                                Health Score
                            </span>
                        </div>
                        {hasHealthScore ? (
                            <div className="flex items-baseline gap-2">
                                <p className="text-2xl font-bold text-green-600">
                                    {stats.healthScore}%
                                </p>
                                <span className="text-xs text-muted-foreground">
                                    Overall
                                </span>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No audits completed yet
                            </p>
                        )}
                    </div>

                    <div>
                        <div className="mb-1 flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase">
                                Active Sites
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground">
                            {stats.totalSites} {stats.totalSites === 1 ? 'site' : 'sites'} monitored
                        </p>
                    </div>

                    <div>
                        <div className="mb-1 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase">
                                Active Audits
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground">
                            {stats.activeAudits} {stats.activeAudits === 1 ? 'audit' : 'audits'} running
                        </p>
                    </div>
                </div>

                <div className="mt-4 border-t border-green-500/20 pt-4">
                    <div className="mb-2 text-xs text-muted-foreground">
                        Site Health Distribution
                    </div>
                    <div className="space-y-1.5">
                        {stats.metrics.map((metric) => (
                            <div key={metric.id} className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">{metric.label}</span>
                                <span className="font-medium">{metric.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Audits */}
            <div className="flex max-h-[400px] flex-col overflow-hidden rounded-2xl border border-green-500/20 bg-card p-5">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                    <FileText className="h-5 w-5 text-green-600" />
                    Recent Audits
                </h2>

                <ScrollArea className="max-h-[320px] flex-1">
                    {recentAudits.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            No audits yet
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {recentAudits.map((audit: any, index: number) => {
                                const IconComponent = getStatusIcon(audit.status);
                                const statusColor = getStatusColor(audit.status);

                                return (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 rounded-lg border border-green-500/10 bg-muted/30 p-3 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                                            <IconComponent className={`h-5 w-5 ${statusColor}`} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-foreground">
                                                {audit.site_name || 'Unknown Site'}
                                            </p>
                                            <p className="text-xs text-muted-foreground capitalize">
                                                {audit.status} • {audit.date || 'Recently'}
                                            </p>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 shrink-0"
                                                title="View audit"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            {audit.status === 'completed' && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 shrink-0"
                                                    title="Download report"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
    );
}
