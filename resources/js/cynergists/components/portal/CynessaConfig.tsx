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
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { apiClient } from '@/lib/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, FolderOpen, Loader2, Shield } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CynessaConfigProps {
    agentId: string;
    configuration: Record<string, unknown> | null;
}

interface CynessaConfiguration {
    voiceEnabled: boolean;
    notificationsEnabled: boolean;
    googleDriveIntegration: boolean;
    crmSyncEnabled: boolean;
    escalationEmail?: string;
    preferredGreeting?: string;
}

export default function CynessaConfig({
    agentId,
    configuration,
}: CynessaConfigProps) {
    const queryClient = useQueryClient();

    // Safely parse configuration with defaults
    const currentConfig: CynessaConfiguration = {
        voiceEnabled: false,
        notificationsEnabled: true,
        googleDriveIntegration: true,
        crmSyncEnabled: true,
        escalationEmail: '',
        preferredGreeting: '',
        ...(configuration as Partial<CynessaConfiguration>),
    };

    const [voiceEnabled, setVoiceEnabled] = useState(
        currentConfig.voiceEnabled,
    );
    const [notificationsEnabled, setNotificationsEnabled] = useState(
        currentConfig.notificationsEnabled,
    );
    const [googleDriveIntegration, setGoogleDriveIntegration] = useState(
        currentConfig.googleDriveIntegration,
    );
    const [crmSyncEnabled, setCrmSyncEnabled] = useState(
        currentConfig.crmSyncEnabled,
    );
    const [escalationEmail, setEscalationEmail] = useState(
        currentConfig.escalationEmail ?? '',
    );
    const [preferredGreeting, setPreferredGreeting] = useState(
        currentConfig.preferredGreeting ?? '',
    );

    const updateConfigMutation = useMutation({
        mutationFn: async (config: Partial<CynessaConfiguration>) => {
            await apiClient.put(`/api/portal/agents/${agentId}/configuration`, {
                configuration: config,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['agent-details', agentId],
            });
            toast.success('Configuration updated successfully');
        },
        onError: () => {
            toast.error('Failed to update configuration');
        },
    });

    const handleSave = () => {
        updateConfigMutation.mutate({
            voiceEnabled,
            notificationsEnabled,
            googleDriveIntegration,
            crmSyncEnabled,
            escalationEmail: escalationEmail || undefined,
            preferredGreeting: preferredGreeting || undefined,
        });
    };

    return (
        <div className="space-y-6">
            {/* Onboarding Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Onboarding Settings
                    </CardTitle>
                    <CardDescription>
                        Configure how Cynessa guides you through the onboarding
                        process
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Voice Interactions</Label>
                            <p className="text-sm text-muted-foreground">
                                Enable voice-based onboarding (coming soon)
                            </p>
                        </div>
                        <Switch
                            checked={voiceEnabled}
                            onCheckedChange={setVoiceEnabled}
                            disabled // Will enable when voice is ready
                        />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <Label htmlFor="greeting">Preferred Greeting</Label>
                        <Input
                            id="greeting"
                            placeholder="e.g., Hi there! Welcome to Cynergists"
                            value={preferredGreeting}
                            onChange={(e) =>
                                setPreferredGreeting(e.target.value)
                            }
                        />
                        <p className="text-sm text-muted-foreground">
                            Customize how Cynessa greets you (optional)
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Integrations */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FolderOpen className="h-5 w-5" />
                        Integrations
                    </CardTitle>
                    <CardDescription>
                        Connect Cynessa with your tools and services
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Google Drive Sync</Label>
                            <p className="text-sm text-muted-foreground">
                                Automatically organize uploads in Google Drive
                            </p>
                        </div>
                        <Switch
                            checked={googleDriveIntegration}
                            onCheckedChange={setGoogleDriveIntegration}
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>CRM Synchronization</Label>
                            <p className="text-sm text-muted-foreground">
                                Keep your data synced with GoHighLevel
                            </p>
                        </div>
                        <Switch
                            checked={crmSyncEnabled}
                            onCheckedChange={setCrmSyncEnabled}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Notifications & Escalation */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notifications & Escalation
                    </CardTitle>
                    <CardDescription>
                        Configure when and how you receive updates
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Enable Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                                Get notified about important updates
                            </p>
                        </div>
                        <Switch
                            checked={notificationsEnabled}
                            onCheckedChange={setNotificationsEnabled}
                        />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <Label htmlFor="escalation">Escalation Email</Label>
                        <Input
                            id="escalation"
                            type="email"
                            placeholder="team@yourcompany.com"
                            value={escalationEmail}
                            onChange={(e) => setEscalationEmail(e.target.value)}
                        />
                        <p className="text-sm text-muted-foreground">
                            Where to send urgent matters that need human
                            attention
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={updateConfigMutation.isPending}
                    className="w-full sm:w-auto"
                >
                    {updateConfigMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Configuration
                </Button>
            </div>

            {/* Info Card */}
            <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                    <CardTitle className="text-base">About Cynessa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>
                        Cynessa is your AI onboarding assistant, designed to
                        make getting started with Cynergists as smooth as
                        possible.
                    </p>
                    <p>
                        She can help you upload brand assets, answer questions
                        about our services, and connect you with the right team
                        members when needed.
                    </p>
                    <p className="font-medium text-foreground">
                        💡 Tip: Voice features are coming soon! They'll be
                        enabled automatically when ready.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
