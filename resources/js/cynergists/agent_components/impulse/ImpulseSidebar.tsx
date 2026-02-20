import { AgentQuickLinks } from '@/components/portal/AgentQuickLinks';
import { AlertTriangle, BarChart3, Calendar, CheckCircle2, Clock, Pause, Play, RefreshCw, Settings, TrendingUp, Upload, Video, Zap } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface ImpulseAgentDetails {
    agent_name?: string | null;
    job_title?: string | null;
}

interface ImpulseSidebarProps {
    agentDetails?: ImpulseAgentDetails | null;
    activeView?: string;
    setActiveView?: (view: string) => void;
    onActionSelect?: (action: string) => void;
}

const ImpulseSidebar = ({
    agentDetails,
    activeView,
    setActiveView,
    onActionSelect,
}: ImpulseSidebarProps) => {
    const [automationStatus, setAutomationStatus] = useState<'active' | 'paused' | 'setup'>('active');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const agentName =
        typeof agentDetails?.agent_name === 'string' && agentDetails.agent_name.trim() !== ''
            ? agentDetails.agent_name
            : 'Impulse';
    const agentJobTitle =
        typeof agentDetails?.job_title === 'string' && agentDetails.job_title.trim() !== ''
            ? agentDetails.job_title
            : 'TikTok Shop Agent';

    const handleRefresh = async () => {
        setIsRefreshing(true);
        // Simulate API call
        setTimeout(() => {
            setIsRefreshing(false);
        }, 2000);
    };

    const toggleAutomation = () => {
        setAutomationStatus(prev => prev === 'active' ? 'paused' : 'active');
    };

    const renderStatusCard = () => (
        <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-semibold">Automation Status</span>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="h-6 w-6 p-0"
                >
                    <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
            </div>
            
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                            automationStatus === 'active' ? 'bg-green-500' : 
                            automationStatus === 'paused' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`} />
                        <span className="text-sm">
                            {automationStatus === 'active' ? 'Running' : 
                             automationStatus === 'paused' ? 'Paused' : 'Setup Required'}
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleAutomation}
                        className="h-6 px-2"
                    >
                        {automationStatus === 'active' ? 
                            <Pause className="w-3 h-3" /> : 
                            <Play className="w-3 h-3" />
                        }
                    </Button>
                </div>
                
                <Badge 
                    variant={automationStatus === 'active' ? 'default' : 'secondary'}
                    className={`w-full justify-center ${
                        automationStatus === 'active' ? 'bg-green-100 text-green-700 border-green-300' : ''
                    }`}
                >
                    {automationStatus === 'active' ? 'Auto-Publishing Active' : 
                     automationStatus === 'paused' ? 'Manual Approval Required' : 'Setup Incomplete'}
                </Badge>
            </div>
        </Card>
    );

    const renderMetricsCard = () => (
        <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold">Today's Performance</span>
            </div>
            
            <div className="space-y-3">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Videos Generated</span>
                        <span className="font-medium">12</span>
                    </div>
                    <Progress value={75} className="h-2" />
                </div>
                
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Avg. Engagement</span>
                        <span className="font-medium text-green-600">4.2%</span>
                    </div>
                    <Progress value={84} className="h-2" />
                </div>
                
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Conversions</span>
                        <span className="font-medium text-blue-600">18</span>
                    </div>
                    <Progress value={60} className="h-2" />
                </div>
            </div>
            
            <Button
                variant="outline"
                size="sm"
                className="w-full mt-3"
                onClick={() => onActionSelect?.('view_analytics')}
            >
                View Full Analytics
            </Button>
        </Card>
    );

    const renderUpcomingActionsCard = () => (
        <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-semibold">Upcoming Actions</span>
            </div>
            
            <div className="space-y-3">
                <div className="flex items-start gap-3 p-2 bg-orange-50 rounded-lg border border-orange-200">
                    <Video className="w-4 h-4 text-orange-600 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-xs font-medium text-orange-800">Video Publish</p>
                        <p className="text-xs text-orange-600">In 2 hours</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-orange-600" />
                </div>
                
                <div className="flex items-start gap-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <Upload className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-xs font-medium text-blue-800">Catalog Sync</p>
                        <p className="text-xs text-blue-600">Tomorrow 6 AM</p>
                    </div>
                    <Clock className="w-4 h-4 text-blue-600" />
                </div>
                
                <div className="flex items-start gap-3 p-2 bg-purple-50 rounded-lg border border-purple-200">
                    <TrendingUp className="w-4 h-4 text-purple-600 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-xs font-medium text-purple-800">Performance Review</p>
                        <p className="text-xs text-purple-600">Friday 5 PM</p>
                    </div>
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                </div>
            </div>
        </Card>
    );

    const renderQuickActionsCard = () => (
        <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
                <Settings className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-semibold">Quick Actions</span>
            </div>
            
            <div className="space-y-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => onActionSelect?.('generate_videos')}
                >
                    <Video className="w-4 h-4 mr-2" />
                    Generate New Videos
                </Button>
                
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => onActionSelect?.('sync_catalog')}
                >
                    <Upload className="w-4 h-4 mr-2" />
                    Sync TikTok Catalog
                </Button>
                
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => onActionSelect?.('view_performance')}
                >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Performance Report
                </Button>
                
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => onActionSelect?.('schedule_posts')}
                >
                    <Calendar className="w-4 h-4 mr-2" />
                    Manage Schedule
                </Button>
            </div>
        </Card>
    );

    const renderPendingApprovalsCard = () => (
        <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-semibold">Pending Approvals</span>
            </div>
            
            <div className="space-y-2">
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-yellow-800">3 Video Drafts</p>
                            <p className="text-xs text-yellow-600">Ready for review</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-yellow-700 hover:text-yellow-800"
                            onClick={() => onActionSelect?.('review_drafts')}
                        >
                            Review
                        </Button>
                    </div>
                </div>
                
                <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-800">1 Schedule Change</p>
                            <p className="text-xs text-gray-600">Needs confirmation</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-gray-700 hover:text-gray-800"
                            onClick={() => onActionSelect?.('confirm_schedule')}
                        >
                            Confirm
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );

    return (
        <div className="w-72 bg-gray-50 border-r border-gray-200 p-4 space-y-4 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">{agentName}</h2>
                    <p className="text-xs text-gray-500">{agentJobTitle}</p>
                </div>
            </div>

            <Separator />

            {/* Quick Links */}
            <div className="flex flex-col rounded-2xl border border-primary/20 bg-card p-4">
                <h2 className="mb-3 shrink-0 text-base font-semibold text-foreground">
                    Quick Links
                </h2>
                <AgentQuickLinks activeView={activeView ?? 'chat'} setActiveView={setActiveView ?? (() => {})} />
            </div>

            {/* Status and Actions */}
            <div className="space-y-4">
                {renderStatusCard()}
                {renderMetricsCard()}
                {renderUpcomingActionsCard()}
                {renderQuickActionsCard()}
                {renderPendingApprovalsCard()}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-gray-200">
                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        Connected to TikTok Shop
                    </p>
                    <Badge variant="outline" className="mt-1 text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Draft Mode
                    </Badge>
                </div>
            </div>
        </div>
    );
};

export default ImpulseSidebar;
