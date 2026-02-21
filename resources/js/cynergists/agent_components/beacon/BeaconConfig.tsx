import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    Calendar,
    Clock,
    Globe,
    Users,
    Settings,
    Shield,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';
import React from 'react';

interface BeaconConfigProps {
    agentDetails: any;
}

export function BeaconConfig({ agentDetails }: BeaconConfigProps) {
    return (
        <div className="h-full">
            <ScrollArea className="h-full px-4 py-3">
                <div className="space-y-4">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="mb-2 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-indigo-600" />
                            <h2 className="text-lg font-semibold text-foreground">
                                Event Configuration
                            </h2>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Configure your event and webinar workflows with structured onboarding and approval gates.
                        </p>
                    </div>

                    {/* Configuration Status */}
                    <Card className="border-indigo-500/20 bg-indigo-50/50 p-4">
                        <div className="mb-3 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-indigo-600" />
                            <span className="font-medium text-indigo-900">Configuration Status</span>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-indigo-700">
                                <CheckCircle2 className="h-3 w-3" />
                                One-question-at-a-time onboarding
                            </div>
                            <div className="flex items-center gap-2 text-indigo-700">
                                <CheckCircle2 className="h-3 w-3" />
                                Full input validation before execution
                            </div>
                            <div className="flex items-center gap-2 text-indigo-700">
                                <CheckCircle2 className="h-3 w-3" />
                                Approval gates for safety
                            </div>
                        </div>
                    </Card>

                    {/* Required Inputs */}
                    <Card className="p-4">
                        <div className="mb-3 flex items-center gap-2">
                            <Settings className="h-4 w-4 text-foreground" />
                            <span className="font-medium">Required Event Details</span>
                        </div>
                        <div className="grid gap-3 text-sm">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 h-2 w-2 rounded-full bg-indigo-600" />
                                <div>
                                    <div className="font-medium">Event Information</div>
                                    <div className="text-muted-foreground">Name, type (live/recorded/hybrid)</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                <div>
                                    <div className="font-medium">Scheduling Details</div>
                                    <div className="text-muted-foreground">Date, time, duration, timezone</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                <div>
                                    <div className="font-medium">Audience & Registration</div>
                                    <div className="text-muted-foreground">Target audience, registration URL</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Globe className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                <div>
                                    <div className="font-medium">Execution Settings</div>
                                    <div className="text-muted-foreground">Approval mode, communication cadence</div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Execution Modes */}
                    <Card className="p-4">
                        <div className="mb-3 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-foreground" />
                            <span className="font-medium">Execution Modes</span>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="rounded-lg border border-green-500/20 bg-green-50/50 p-3">
                                <div className="mb-1 font-medium text-green-900">Approval Mode</div>
                                <div className="text-green-700">
                                    Messages generated but require your approval before sending
                                </div>
                            </div>
                            <div className="rounded-lg border border-blue-500/20 bg-blue-50/50 p-3">
                                <div className="mb-1 font-medium text-blue-900">Autopilot Mode</div>
                                <div className="text-blue-700">
                                    Validated messages sent automatically according to schedule
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Safety Features */}
                    <Card className="p-4">
                        <div className="mb-3 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <span className="font-medium">Built-in Safeguards</span>
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <div>• Automatic pause if required data becomes invalid</div>
                            <div>• State recovery after system restarts</div>
                            <div>• Prevention of duplicate executions</div>
                            <div>• Hard session timeout at 30 minutes</div>
                            <div>• Daily and per-event message limits</div>
                            <div>• Full audit logging of all actions</div>
                        </div>
                    </Card>

                    {/* Scope Boundaries */}
                    <Card className="border-amber-500/20 bg-amber-50/50 p-4">
                        <div className="mb-3 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <span className="font-medium text-amber-900">Explicit Boundaries</span>
                        </div>
                        <div className="space-y-1 text-sm text-amber-700">
                            <div>• No marketing strategy or optimization advice</div>
                            <div>• No attendance or revenue guarantees</div>
                            <div>• No CRM integrations or lead scoring</div>
                            <div>• No paid media or analytics forecasting</div>
                            <div>• Focus: Event configuration and reminder execution only</div>
                        </div>
                    </Card>

                    {/* Start Configuration */}
                    <div className="pt-4">
                        <Button 
                            className="w-full bg-indigo-600 hover:bg-indigo-700"
                            size="lg"
                        >
                            <Calendar className="mr-2 h-4 w-4" />
                            Start Event Configuration
                        </Button>
                        <p className="mt-2 text-center text-xs text-muted-foreground">
                            Begin structured onboarding process
                        </p>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}