import { Badge } from '@/components/ui/badge';
import {
    BASE_PLAN_PRICE,
    calcBundleSavings,
    calcIncludedValue,
    essentialsAgents,
    formatCurrency,
} from '@/data/essentialsAgents';
import { Link } from '@inertiajs/react';
import { ArrowRight, Sparkles } from 'lucide-react';

export function EssentialsBundleBanner() {
    const includedValue = calcIncludedValue();
    const bundleSavings = calcBundleSavings();

    return (
        <Link
            href="/marketplace/essentials"
            className="group relative block cursor-pointer overflow-hidden border-y border-lime-500/30 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 transition-all hover:border-lime-500/50 dark:from-slate-900 dark:via-slate-800 dark:to-teal-900"
        >
            {/* Futuristic background elements */}
            <div className="absolute inset-0">
                {/* Animated glow orbs */}
                <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-lime-500/20 blur-3xl" />
                <div className="absolute right-1/4 bottom-0 h-80 w-80 rounded-full bg-teal-500/15 blur-3xl" />
                {/* Grid pattern overlay */}
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(132,204,22,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(132,204,22,0.5) 1px, transparent 1px)`,
                        backgroundSize: '32px 32px',
                    }}
                />
                {/* Scanline effect */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(132,204,22,0.1) 2px, rgba(132,204,22,0.1) 4px)`,
                    }}
                />
            </div>

            {/* Decorative corner accents */}
            <div className="absolute top-6 left-6 flex gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-lime-500" />
                <div className="h-1.5 w-1.5 rounded-full bg-lime-500" />
                <div className="h-1.5 w-1.5 rounded-full bg-lime-500" />
            </div>
            <div className="absolute top-8 right-12 h-3 w-3 rotate-45 border border-lime-500/50 transition-colors group-hover:border-lime-500" />
            <div className="absolute right-8 bottom-8 flex gap-1">
                <div className="h-1.5 w-1.5 bg-lime-500/50" />
                <div className="h-1.5 w-1.5 bg-lime-500/50" />
                <div className="h-1.5 w-1.5 bg-lime-500/50" />
            </div>

            <div className="relative container mx-auto px-4 py-10 md:py-14">
                <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
                    {/* Left side - Content */}
                    <div className="flex-1 text-center lg:text-left">
                        <Badge className="mb-3 border-lime-500/30 bg-lime-500/20 text-accent dark:text-lime-400">
                            <Sparkles className="mr-1 h-3 w-3" />
                            Bundle & Save
                        </Badge>

                        <h2 className="mb-2 text-2xl font-bold md:text-3xl lg:text-4xl">
                            <span className="text-foreground">The </span>
                            <span className="text-gradient">
                                Essentials Plan
                            </span>
                        </h2>

                        <p className="mb-4 max-w-xl text-muted-foreground">
                            6 AI Agents included for{' '}
                            {formatCurrency(BASE_PLAN_PRICE)}/mo. Upgrade output
                            agent by agent.
                        </p>

                        {/* Agent Pills - Compact */}
                        <div className="mb-4 flex flex-wrap justify-center gap-2 lg:justify-start">
                            {essentialsAgents.map((agent) => (
                                <div
                                    key={agent.name}
                                    className="rounded-md border border-lime-500/20 bg-background/30 px-3 py-1.5 text-xs backdrop-blur-sm"
                                >
                                    <span className="font-medium">
                                        {agent.name}
                                    </span>
                                    <span className="ml-1 text-muted-foreground">
                                        • {agent.job_title}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <p className="text-sm font-medium text-accent dark:text-lime-400">
                            Save over 25% on bundled agents
                        </p>
                    </div>

                    {/* Right side - Pricing & CTA */}
                    <div className="flex flex-col items-center gap-4 lg:items-end">
                        <div className="text-center lg:text-right">
                            <p className="mb-1 text-xs text-muted-foreground">
                                Starting at
                            </p>
                            <p className="text-4xl font-bold text-accent md:text-5xl dark:text-lime-400">
                                {formatCurrency(BASE_PLAN_PRICE)}
                                <span className="text-lg font-normal text-muted-foreground">
                                    /mo
                                </span>
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Includes {formatCurrency(includedValue)} value
                            </p>
                        </div>

                        <div className="flex items-center gap-2 font-semibold text-accent transition-all group-hover:gap-3 dark:text-lime-400">
                            Build Your Plan
                            <ArrowRight className="h-5 w-5" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
