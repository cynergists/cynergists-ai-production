import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Bot,
    CheckCircle2,
    Circle,
    Clock,
    Rocket,
    Sparkles,
    Zap,
} from 'lucide-react';

interface RoadmapItem {
    id: string;
    title: string;
    description: string;
    status: 'completed' | 'in-progress' | 'planned';
    quarter: string;
    category: string;
}

const roadmapItems: RoadmapItem[] = [
    {
        id: '1',
        title: 'Enhanced Chat Interface',
        description:
            'Improved conversation UI with message threading, reactions, and file attachments.',
        status: 'completed',
        quarter: 'Q4 2025',
        category: 'Platform',
    },
    {
        id: '2',
        title: 'Agent Memory System',
        description:
            'Persistent memory across conversations so agents remember your preferences.',
        status: 'completed',
        quarter: 'Q4 2025',
        category: 'AI',
    },
    {
        id: '3',
        title: 'Team Collaboration',
        description: 'Share agents with team members and manage permissions.',
        status: 'in-progress',
        quarter: 'Q1 2026',
        category: 'Platform',
    },
    {
        id: '4',
        title: 'Custom Agent Training',
        description:
            'Train agents on your own data and documents for personalized responses.',
        status: 'in-progress',
        quarter: 'Q1 2026',
        category: 'AI',
    },
    {
        id: '5',
        title: 'API Access',
        description: 'Programmatic access to your agents via REST API.',
        status: 'planned',
        quarter: 'Q2 2026',
        category: 'Developer',
    },
    {
        id: '6',
        title: 'Workflow Automation',
        description: 'Chain multiple agents together for complex workflows.',
        status: 'planned',
        quarter: 'Q2 2026',
        category: 'Platform',
    },
    {
        id: '7',
        title: 'Voice Agents',
        description:
            'Voice-enabled agents for phone and voice assistant integrations.',
        status: 'planned',
        quarter: 'Q3 2026',
        category: 'AI',
    },
];

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'completed':
            return CheckCircle2;
        case 'in-progress':
            return Clock;
        default:
            return Circle;
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'completed':
            return 'bg-green-500/10 text-green-500 border-green-500/20';
        case 'in-progress':
            return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        default:
            return 'bg-muted text-muted-foreground border-border';
    }
};

const getCategoryIcon = (category: string) => {
    switch (category) {
        case 'AI':
            return Bot;
        case 'Developer':
            return Zap;
        default:
            return Sparkles;
    }
};

export default function PortalRoadmap() {
    const groupedItems = {
        completed: roadmapItems.filter((item) => item.status === 'completed'),
        inProgress: roadmapItems.filter(
            (item) => item.status === 'in-progress',
        ),
        planned: roadmapItems.filter((item) => item.status === 'planned'),
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <div className="mb-2 flex items-center gap-3">
                    <Rocket className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold text-foreground">
                        Roadmap
                    </h1>
                </div>
                <p className="text-muted-foreground">
                    See what's coming next for the AI Agent platform.
                </p>
            </div>

            <div className="space-y-8">
                {/* In Progress */}
                <div>
                    <div className="mb-4 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-500" />
                        <h2 className="text-xl font-semibold">In Progress</h2>
                        <Badge
                            variant="outline"
                            className="border-blue-500/20 bg-blue-500/10 text-blue-500"
                        >
                            {groupedItems.inProgress.length}
                        </Badge>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {groupedItems.inProgress.map((item) => {
                            const CategoryIcon = getCategoryIcon(item.category);
                            return (
                                <Card
                                    key={item.id}
                                    className="border-blue-500/20"
                                >
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {item.category}
                                                </Badge>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {item.quarter}
                                            </span>
                                        </div>
                                        <CardTitle className="mt-2 text-base">
                                            {item.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            {item.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Planned */}
                <div>
                    <div className="mb-4 flex items-center gap-2">
                        <Circle className="h-5 w-5 text-muted-foreground" />
                        <h2 className="text-xl font-semibold">Planned</h2>
                        <Badge variant="outline">
                            {groupedItems.planned.length}
                        </Badge>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {groupedItems.planned.map((item) => {
                            const CategoryIcon = getCategoryIcon(item.category);
                            return (
                                <Card key={item.id} className="opacity-75">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {item.category}
                                                </Badge>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {item.quarter}
                                            </span>
                                        </div>
                                        <CardTitle className="mt-2 text-base">
                                            {item.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            {item.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Completed */}
                <div>
                    <div className="mb-4 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <h2 className="text-xl font-semibold">Completed</h2>
                        <Badge
                            variant="outline"
                            className="border-green-500/20 bg-green-500/10 text-green-500"
                        >
                            {groupedItems.completed.length}
                        </Badge>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {groupedItems.completed.map((item) => {
                            const CategoryIcon = getCategoryIcon(item.category);
                            return (
                                <Card
                                    key={item.id}
                                    className="border-green-500/20 bg-green-500/5"
                                >
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {item.category}
                                                </Badge>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {item.quarter}
                                            </span>
                                        </div>
                                        <CardTitle className="mt-2 text-base">
                                            {item.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            {item.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
