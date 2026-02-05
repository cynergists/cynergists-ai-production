import heroCommander from '@/assets/hero-commander.webp';
import { CheckCircle } from 'lucide-react';

const bullets = [
    {
        title: 'Revenue Agents',
        description:
            'qualification, follow up, routing, pipeline hygiene, and enablement support',
    },
    {
        title: 'Operations Agents',
        description:
            'task coordination, SOP execution, internal requests, and process automation',
    },
    {
        title: 'Internal Workflow Agents',
        description:
            'reporting, documentation, knowledge retrieval, and cross team handoffs',
    },
];

const SolutionSection = () => {
    return (
        <section className="relative overflow-hidden bg-background py-24">
            {/* Subtle background accent */}
            <div className="absolute inset-0 bg-gradient-to-br from-muted/50 via-transparent to-primary/5" />

            <div className="relative z-10 container mx-auto px-4">
                <div className="grid items-start gap-12 lg:grid-cols-2">
                    {/* Left Column - Image */}
                    <div className="relative rounded-2xl bg-gradient-to-br from-primary via-primary/60 to-secondary p-[3px] shadow-2xl">
                        <img
                            src={heroCommander}
                            alt="Commander managing AI operations on a futuristic holographic display"
                            className="h-auto w-full rounded-xl object-cover"
                        />
                    </div>

                    {/* Right Column - Text Content */}
                    <div>
                        <h2 className="font-display mb-4 text-3xl font-bold text-foreground md:text-4xl">
                            AI Agents With{' '}
                            <span className="text-gradient">Defined Roles</span>
                        </h2>

                        <h3 className="mb-6 text-xl font-medium text-foreground/70 md:text-2xl">
                            Built like specialists, deployed like a coordinated
                            team
                        </h3>

                        <p className="mb-8 text-lg leading-relaxed text-foreground/80">
                            Each agent is designed to own a specific job, with
                            clear responsibilities, clear guardrails, and clear
                            handoffs. Alone, they reduce drag. Together, they
                            create momentum.
                        </p>

                        <div className="mb-8 space-y-4">
                            {bullets.map((bullet) => (
                                <div
                                    key={bullet.title}
                                    className="flex items-start gap-3 rounded-lg border border-border/50 bg-card/50 p-4 dark:bg-card/30"
                                >
                                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                                    <div>
                                        <span className="font-semibold text-foreground">
                                            {bullet.title}:
                                        </span>{' '}
                                        <span className="text-foreground/70">
                                            {bullet.description}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p className="text-lg leading-relaxed text-foreground/80">
                            You get agents that work inside your existing
                            systems, with human oversight that keeps execution
                            accurate and controlled.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SolutionSection;
