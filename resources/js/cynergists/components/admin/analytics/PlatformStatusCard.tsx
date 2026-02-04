import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { ExternalLink, LucideIcon, Settings } from 'lucide-react';

interface PlatformStatusCardProps {
    platform: string;
    icon: LucideIcon;
    status: 'connected' | 'not_configured' | 'error';
    lastSync?: string;
    detailsPath: string;
    onConfigure?: () => void;
}

export function PlatformStatusCard({
    platform,
    icon: Icon,
    status,
    lastSync,
    detailsPath,
    onConfigure,
}: PlatformStatusCardProps) {
    const statusConfig = {
        connected: {
            label: 'Connected',
            variant: 'default' as const,
            className: 'bg-green-600 hover:bg-green-700',
        },
        not_configured: {
            label: 'Not Configured',
            variant: 'secondary' as const,
            className: '',
        },
        error: {
            label: 'Error',
            variant: 'destructive' as const,
            className: '',
        },
    };

    const config = statusConfig[status];

    return (
        <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader className="p-4 pb-2">
                <div className="mb-2 flex items-center gap-2">
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <CardTitle className="truncate text-sm font-medium">
                        {platform}
                    </CardTitle>
                </div>
                <Badge
                    variant={config.variant}
                    className={`${config.className} w-fit text-xs`}
                >
                    {config.label}
                </Badge>
            </CardHeader>
            <CardContent className="p-4 pt-2">
                {status === 'connected' && lastSync && (
                    <p className="mb-2 text-xs text-muted-foreground">
                        Last synced: {lastSync}
                    </p>
                )}
                <div className="flex">
                    {status === 'connected' ? (
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-8 w-full text-xs"
                        >
                            <Link href={detailsPath}>
                                View Details
                                <ExternalLink className="ml-1 h-3 w-3" />
                            </Link>
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-full text-xs"
                            onClick={onConfigure}
                        >
                            <Settings className="mr-1 h-3 w-3" />
                            Configure
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
