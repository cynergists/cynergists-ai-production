import { AgentQuickLinks } from '@/components/portal/AgentQuickLinks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    AlertTriangle,
    Calendar,
    CheckCircle2,
    Clock,
    PauseCircle,
    PlayCircle,
    Settings,
    Shield,
    Users,
} from 'lucide-react';
import React from 'react';

interface BeaconSidebarProps {
    agentDetails: any;
    activeView?: string;
    setActiveView?: (view: string) => void;
}

export default function BeaconSidebar({ agentDetails, activeView, setActiveView }: BeaconSidebarProps) {
    // Mock state - in real implementation this would come from props/context
    const currentState = 'Draft'; // Draft, Onboarding, Active, Paused, etc.
    const isConfigured = false;
    const approvalMode = 'approval'; // 'approval' or 'autopilot'
    const pendingActions = 0;

    const getStateColor = (state: string) => {
        switch (state) {
            case 'Active': return 'bg-green-500';
            case 'Paused': return 'bg-amber-500';
            case 'Onboarding': return 'bg-blue-500';
            case 'Draft': return 'bg-gray-500';
            default: return 'bg-gray-500';
        }
    };

    const getStateIcon = (state: string) => {
        switch (state) {
            case 'Active': return <PlayCircle className="h-4 w-4" />;
            case 'Paused': return <PauseCircle className="h-4 w-4" />;
            case 'Onboarding': return <Settings className="h-4 w-4" />;
            case 'Draft': return <Calendar className="h-4 w-4" />;
            default: return <Calendar className="h-4 w-4" />;
        }
    };

    return (
        <div className="h-full">
            <ScrollArea className="h-full px-4 py-3">
                <div className="space-y-4">
                    {/* Quick Links */}
                    <div className="flex flex-col rounded-2xl border border-primary/20 bg-card p-4">
                        <h2 className="mb-3 shrink-0 text-base font-semibold text-foreground">
                            Quick Links
                        </h2>
                        <AgentQuickLinks activeView={activeView ?? 'chat'} setActiveView={setActiveView ?? (() => {})} />
                    </div>

                    {/* Agent Status */}
                    <Card className="p-4">
                        <div className="mb-3 flex items-center gap-2">
                            <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full ring-2 ring-indigo-500/40">
                                {agentDetails?.avatar_url ? (
                                    <img
                                        src={agentDetails.avatar_url}
                                        alt="Beacon"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-indigo-600">
                                        <Calendar className="h-4 w-4 text-white" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="font-medium">Beacon Events</div>
                                <div className="text-xs text-muted-foreground">v1.0</div>
                            </div>
                        </div>
                        
                        <div className="mb-3 flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${getStateColor(currentState)}`} />
                            <span className="text-sm font-medium">{currentState}</span>
                            {getStateIcon(currentState)}
                        </div>

                        <div className="text-xs text-muted-foreground">
                            Event & Webinar workflow management
                        </div>
                    </Card>

                    {/* Quick Stats */}
                    <Card className="p-4">
                        <div className="mb-3 font-medium text-sm">Current Status</div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Configuration</span>
                                <Badge variant={isConfigured ? "default" : "secondary"} className="text-xs">
                                    {isConfigured ? "Complete" : "Pending"}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Execution Mode</span>
                                <Badge variant="outline" className="text-xs">
                                    {approvalMode === 'approval' ? 'Approval' : 'Autopilot'}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Pending Actions</span>
                                <span className="font-medium">{pendingActions}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Configuration Progress */}
                    <Card className="p-4">
                        <div className="mb-3 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">Setup Progress</span>
                        </div>
                        <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                                Event Details
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                                Schedule & Timing
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                                Audience & Registration
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                                Execution Settings
                            </div>
                        </div>
                    </Card>

                    {/* Safety Features */}
                    <Card className="border-green-500/20 bg-green-50/50 p-4">
                        <div className="mb-3 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-sm text-green-900">Active Safeguards</span>
                        </div>
                        <div className="space-y-1 text-xs text-green-700">
                            <div>✓ Input validation</div>
                            <div>✓ Approval gates</div>
                            <div>✓ State recovery</div>
                            <div>✓ Duplicate prevention</div>
                        </div>
                    </Card>

                    {/* Current Limitations */}
                    <Card className="border-amber-500/20 bg-amber-50/50 p-4">
                        <div className="mb-3 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <span className="font-medium text-sm text-amber-900">Scope Boundaries</span>
                        </div>
                        <div className="space-y-1 text-xs text-amber-700">
                            <div>• Event configuration only</div>
                            <div>• No marketing strategy</div>
                            <div>• No performance predictions</div>
                            <div>• No CRM integrations</div>
                        </div>
                    </Card>

                    {/* Quick Actions */}
                    <div className="space-y-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full justify-start gap-2 border-indigo-500/20 hover:bg-indigo-50"
                        >
                            <Calendar className="h-3 w-3" />
                            Configure Event
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full justify-start gap-2"
                            disabled={!isConfigured}
                        >
                            <Clock className="h-3 w-3" />
                            View Schedule
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full justify-start gap-2"
                            disabled={pendingActions === 0}
                        >
                            <Users className="h-3 w-3" />
                            Review Actions
                        </Button>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}