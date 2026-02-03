import { CheckCircle } from 'lucide-react';

const advantages = [
    'Faster cycles from request to completion',
    'More predictable outcomes across teams',
    'Less dependency on individual heroics',
    'Stronger operational discipline without bureaucracy',
];

const CompetitiveSection = () => {
    return (
        <section className="relative overflow-hidden bg-background py-24">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-primary/5" />

            <div className="relative z-10 container mx-auto px-4">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-12 text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                            <span className="text-sm font-medium text-primary">
                                Win With Coordination
                            </span>
                        </div>

                        <h2 className="font-display mb-4 text-3xl font-bold text-foreground md:text-4xl">
                            Most Companies{' '}
                            <span className="text-gradient">Add Tools</span>
                        </h2>

                        <h3 className="mb-8 text-xl font-medium text-muted-foreground md:text-2xl">
                            The winners add an execution unit
                        </h3>

                        <p className="mb-8 leading-relaxed text-muted-foreground">
                            Tools require humans to drive them. Agents execute
                            inside them. When your workflow engine runs every
                            day with consistency, you move faster than
                            competitors who rely on manual effort and best
                            intentions.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {advantages.map((advantage) => (
                            <div key={advantage} className="card-glass p-4">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 flex-shrink-0 text-primary" />
                                    <span className="text-foreground">
                                        {advantage}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CompetitiveSection;
