import Layout from '@/components/layout/Layout';
import { EssentialsPlanBuilder } from '@/components/marketplace/EssentialsPlanBuilder';
import { Badge } from '@/components/ui/badge';
import {
    calcBundleSavings,
    calcIncludedValue,
    essentialsAgents,
    getEssentialsTierIndex,
} from '@/data/essentialsAgents';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useCallback, useState } from 'react';

// Initialize selections with all agents at their Essentials tier
function getInitialSelections(): Record<string, number> {
    const selections: Record<string, number> = {};
    essentialsAgents.forEach((agent) => {
        selections[agent.name] = getEssentialsTierIndex(agent);
    });
    return selections;
}

export default function EssentialsPlan() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selections, setSelections] =
        useState<Record<string, number>>(getInitialSelections);

    const includedValue = calcIncludedValue();
    const bundleSavings = calcBundleSavings();

    const handleSelectionChange = useCallback(
        (agentName: string, tierIndex: number) => {
            setSelections((prev) => ({
                ...prev,
                [agentName]: tierIndex,
            }));
        },
        [],
    );

    const handleResetSelections = useCallback(() => {
        setSelections(getInitialSelections());
    }, []);

    return (
        <Layout searchQuery={searchQuery} onSearchChange={setSearchQuery}>
            <div className="min-h-screen">
                {/* Hero Section */}
                <div className="relative overflow-hidden bg-gradient-to-br from-background via-background to-lime-500/5">
                    {/* Futuristic background elements */}
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(132,204,22,0.15),transparent_50%)]" />
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(132,204,22,0.1),transparent_50%)]" />
                        {/* Grid pattern overlay */}
                        <div
                            className="absolute inset-0 opacity-[0.03]"
                            style={{
                                backgroundImage: `linear-gradient(rgba(132,204,22,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(132,204,22,0.3) 1px, transparent 1px)`,
                                backgroundSize: '50px 50px',
                            }}
                        />
                    </div>

                    {/* Decorative corner accents */}
                    <div className="absolute top-8 left-8 flex gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-lime-500" />
                        <div className="h-2 w-2 rounded-full bg-lime-500" />
                        <div className="h-2 w-2 rounded-full bg-lime-500" />
                    </div>
                    <div className="absolute top-12 right-16 h-4 w-4 rotate-45 border-2 border-lime-500" />
                    <div className="absolute bottom-20 left-20 h-3 w-3 rotate-45 bg-lime-500/50" />

                    <div className="relative container mx-auto px-4 py-16 md:py-24">
                        {/* Back link */}
                        <Link
                            href="/marketplace"
                            className="mb-8 inline-flex items-center text-muted-foreground transition-colors hover:text-accent dark:hover:text-lime-400"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Marketplace
                        </Link>

                        <div className="mx-auto max-w-4xl text-center">
                            <Badge className="mb-6 border-lime-500/30 bg-lime-500/20 px-4 py-1.5 text-accent dark:text-lime-400">
                                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                                Bundle & Save
                            </Badge>

                            <h1 className="mb-6 text-4xl font-bold md:text-6xl">
                                <span className="text-gradient">
                                    Your First AI Agent Team,
                                </span>
                                <br />
                                <span className="text-white">
                                    Ready to Deploy
                                </span>
                            </h1>

                            <p className="mb-4 text-xl text-muted-foreground md:text-2xl">
                                Six agents included. Customize and upgrade any
                                agent right now to match your exact needs.
                            </p>

                            <p className="text-lg text-muted-foreground">
                                Change your plan as your needs change.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Plan Builder Section */}
                <EssentialsPlanBuilder
                    selections={selections}
                    onSelectionChange={handleSelectionChange}
                    onReset={handleResetSelections}
                />
            </div>
        </Layout>
    );
}
