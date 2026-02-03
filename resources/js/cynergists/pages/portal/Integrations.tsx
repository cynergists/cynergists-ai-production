import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ExternalLink, Plug, Zap } from 'lucide-react';

interface Integration {
    id: string;
    name: string;
    description: string;
    icon: string;
    connected: boolean;
    category: string;
}

const integrations: Integration[] = [
    {
        id: 'slack',
        name: 'Slack',
        description:
            'Get agent notifications and interact with agents directly in Slack.',
        icon: '💬',
        connected: false,
        category: 'Communication',
    },
    {
        id: 'hubspot',
        name: 'HubSpot',
        description:
            'Sync contacts and deals between your agents and HubSpot CRM.',
        icon: '🔶',
        connected: false,
        category: 'CRM',
    },
    {
        id: 'salesforce',
        name: 'Salesforce',
        description:
            'Connect your agents to Salesforce for seamless data sync.',
        icon: '☁️',
        connected: false,
        category: 'CRM',
    },
    {
        id: 'zapier',
        name: 'Zapier',
        description: 'Connect to 5,000+ apps with Zapier automation.',
        icon: '⚡',
        connected: true,
        category: 'Automation',
    },
    {
        id: 'google-calendar',
        name: 'Google Calendar',
        description: 'Let agents schedule meetings and manage your calendar.',
        icon: '📅',
        connected: true,
        category: 'Productivity',
    },
    {
        id: 'notion',
        name: 'Notion',
        description: 'Save agent outputs and notes directly to Notion.',
        icon: '📝',
        connected: false,
        category: 'Productivity',
    },
];

export default function PortalIntegrations() {
    const groupedIntegrations = integrations.reduce(
        (acc, integration) => {
            if (!acc[integration.category]) {
                acc[integration.category] = [];
            }
            acc[integration.category].push(integration);
            return acc;
        },
        {} as Record<string, Integration[]>,
    );

    const connectedCount = integrations.filter((i) => i.connected).length;

    return (
        <div className="p-8">
            <div className="mb-8">
                <div className="mb-2 flex items-center gap-3">
                    <Plug className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold text-foreground">
                        Integrations
                    </h1>
                </div>
                <p className="text-muted-foreground">
                    Connect your favorite tools to enhance your AI agents.
                </p>
            </div>

            {/* Connected Summary */}
            <Card className="mb-8 border-primary/20 bg-primary/5">
                <CardContent className="flex items-center justify-between py-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Zap className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">
                                {connectedCount} Connected
                            </h3>
                            <p className="text-muted-foreground">
                                {integrations.length - connectedCount} more
                                available to connect
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Integration Categories */}
            <div className="space-y-8">
                {Object.entries(groupedIntegrations).map(
                    ([category, items]) => (
                        <div key={category}>
                            <h2 className="mb-4 text-lg font-semibold">
                                {category}
                            </h2>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {items.map((integration) => (
                                    <Card
                                        key={integration.id}
                                        className={
                                            integration.connected
                                                ? 'border-primary/20'
                                                : ''
                                        }
                                    >
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">
                                                        {integration.icon}
                                                    </span>
                                                    <CardTitle className="text-base">
                                                        {integration.name}
                                                    </CardTitle>
                                                </div>
                                                {integration.connected && (
                                                    <Badge className="border-green-500/20 bg-green-500/10 text-green-500">
                                                        <Check className="mr-1 h-3 w-3" />
                                                        Connected
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <p className="text-sm text-muted-foreground">
                                                {integration.description}
                                            </p>
                                            {integration.connected ? (
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1"
                                                    >
                                                        Configure
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive"
                                                    >
                                                        Disconnect
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    className="w-full"
                                                >
                                                    Connect
                                                    <ExternalLink className="ml-2 h-4 w-4" />
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ),
                )}
            </div>
        </div>
    );
}
