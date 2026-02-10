import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ArrowLeft, BookOpen, Play, User } from 'lucide-react';
import { useState } from 'react';

interface BriggsTrainingLibraryViewProps {
    agentDetails: any;
    setActiveView: (view: string) => void;
}

const categoryLabels: Record<string, string> = {
    objection_handling: 'Objection Handling',
    cold_call: 'Cold Calling',
    discovery_call: 'Discovery Calls',
    pitch: 'Pitching',
    closing: 'Closing',
    follow_up: 'Follow Up',
    negotiation: 'Negotiation',
};

const difficultyColors: Record<string, string> = {
    beginner: 'border-green-500/30 bg-green-500/10 text-green-600',
    intermediate:
        'border-yellow-500/30 bg-yellow-500/10 text-yellow-600',
    advanced: 'border-red-500/30 bg-red-500/10 text-red-500',
};

export default function BriggsTrainingLibraryView({
    agentDetails,
    setActiveView,
}: BriggsTrainingLibraryViewProps) {
    const briggsData = agentDetails?.briggs_data ?? null;
    const library = briggsData?.training_library ?? {};
    const [expandedCategory, setExpandedCategory] = useState<
        string | null
    >(null);

    const categories = Object.keys(library);

    return (
        <div className="flex flex-1 flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border px-6 py-4">
                <button
                    onClick={() => setActiveView('chat')}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">
                    Training Library
                </h2>
            </div>

            {/* Content */}
            <ScrollArea className="min-h-0 flex-1 px-6 py-4">
                {categories.length === 0 ? (
                    <div className="py-12 text-center text-sm text-muted-foreground">
                        No training scenarios available yet.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {categories.map((category) => {
                            const scenarios = library[category] ?? [];
                            const isExpanded =
                                expandedCategory === category ||
                                categories.length <= 3;

                            return (
                                <div key={category}>
                                    <button
                                        onClick={() =>
                                            setExpandedCategory(
                                                expandedCategory ===
                                                    category
                                                    ? null
                                                    : category,
                                            )
                                        }
                                        className="mb-2 flex w-full items-center justify-between text-left"
                                    >
                                        <h3 className="text-sm font-semibold text-foreground">
                                            {categoryLabels[category] ??
                                                category}
                                        </h3>
                                        <Badge
                                            variant="secondary"
                                            className="text-xs"
                                        >
                                            {scenarios.length}
                                        </Badge>
                                    </button>

                                    {isExpanded && (
                                        <div className="space-y-2">
                                            {scenarios.map(
                                                (scenario: any) => (
                                                    <Card
                                                        key={scenario.id}
                                                        className="p-4 transition-all duration-200 hover:shadow-md"
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="text-sm font-medium text-foreground">
                                                                        {
                                                                            scenario.title
                                                                        }
                                                                    </h4>
                                                                    <span
                                                                        className={cn(
                                                                            'rounded-full border px-1.5 py-0.5 text-[10px] font-medium',
                                                                            difficultyColors[
                                                                                scenario
                                                                                    .difficulty
                                                                            ] ??
                                                                                '',
                                                                        )}
                                                                    >
                                                                        {scenario.difficulty
                                                                            ?.charAt(
                                                                                0,
                                                                            )
                                                                            .toUpperCase() +
                                                                            scenario.difficulty?.slice(
                                                                                1,
                                                                            )}
                                                                    </span>
                                                                </div>
                                                                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                                    <User className="h-3 w-3" />
                                                                    <span>
                                                                        {
                                                                            scenario.buyer_name
                                                                        }

                                                                        ,{' '}
                                                                        {
                                                                            scenario.buyer_title
                                                                        }
                                                                    </span>
                                                                </div>
                                                                {scenario.description && (
                                                                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                                                                        {scenario.description.slice(
                                                                            0,
                                                                            120,
                                                                        )}
                                                                        {scenario
                                                                            .description
                                                                            .length >
                                                                            120
                                                                            ? '...'
                                                                            : ''}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                className="h-8 shrink-0 gap-1.5 text-xs"
                                                                onClick={() =>
                                                                    setActiveView(
                                                                        'chat',
                                                                    )
                                                                }
                                                            >
                                                                <Play className="h-3 w-3" />
                                                                Start
                                                            </Button>
                                                        </div>
                                                    </Card>
                                                ),
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
