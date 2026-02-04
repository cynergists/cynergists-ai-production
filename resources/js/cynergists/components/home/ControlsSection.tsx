import { CheckCircle, Shield } from 'lucide-react';

const controls = [
    'Approval rules for sensitive actions',
    'Logging for visibility into actions and outputs',
    'Quality checks to reduce drift and errors',
    'Escalation paths when confidence is low or context is missing',
];

const ControlsSection = () => {
    return (
        <section className="relative overflow-hidden bg-secondary/10 py-24 dark:bg-secondary/20">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />

            <div className="relative z-10 container mx-auto px-4">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-12 text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/20 px-4 py-2 dark:bg-secondary/30">
                            <Shield className="h-4 w-4 text-secondary" />
                            <span className="text-sm font-medium text-secondary">
                                Guardrails First
                            </span>
                        </div>

                        <h2 className="font-display mb-4 text-3xl font-bold text-foreground md:text-4xl">
                            Control Is{' '}
                            <span className="text-gradient">Not Optional</span>
                        </h2>

                        <h3 className="mb-6 text-xl font-medium text-foreground/70 md:text-2xl">
                            Agents should move fast, but never recklessly
                        </h3>

                        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-foreground/80">
                            Every agent is deployed with role based permissions,
                            clear boundaries, and defined escalation paths.
                            Autonomy is earned, not assumed.
                        </p>
                    </div>

                    <div className="mb-10 grid gap-4 md:grid-cols-2">
                        {controls.map((control) => (
                            <div
                                key={control}
                                className="rounded-xl border border-border/50 bg-card p-5 shadow-sm transition-shadow hover:shadow-md dark:bg-card/50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                                        <CheckCircle className="h-5 w-5 text-primary" />
                                    </div>
                                    <span className="font-medium text-foreground">
                                        {control}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <p className="text-xl font-medium text-foreground">
                            This is how you keep speed without losing trust.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ControlsSection;
