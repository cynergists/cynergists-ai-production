import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, Sparkles } from 'lucide-react';

interface UpcomingAgentsSectionProps {
    className?: string;
}

export function UpcomingAgentsSection({
    className,
}: UpcomingAgentsSectionProps) {
    return (
        <section className={className}>
            <div className="mb-6 px-4 md:px-0">
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                    Next up.{' '}
                    <span className="font-normal text-muted-foreground">
                        Get notified when they launch.
                    </span>
                </h1>
            </div>

            <div className="px-4 md:px-0">
                <Card className="border-2 border-dashed border-border/50 bg-muted/20">
                    <CardContent className="py-12 text-center">
                        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-lime-500/10">
                            <Sparkles className="h-8 w-8 text-accent dark:text-lime-400" />
                        </div>
                        <h3 className="mb-2 text-xl font-semibold">
                            New agents are in development
                        </h3>
                        <p className="mx-auto mb-6 max-w-md text-muted-foreground">
                            We're building more AI agents to help you scale. Be
                            the first to know when they're ready.
                        </p>
                        <Button className="bg-lime-500 text-black hover:bg-lime-600">
                            <Bell className="mr-2 h-4 w-4" />
                            Notify Me
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
