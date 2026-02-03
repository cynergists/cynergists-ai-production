const ProblemSection = () => {
    return (
        <section className="relative overflow-hidden bg-background py-24 dark:bg-background">
            <div className="absolute inset-0 hidden bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 dark:block" />

            <div className="relative z-10 container mx-auto px-4">
                <div className="mx-auto max-w-4xl text-center">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                        <span className="text-sm font-medium text-primary">
                            The Villain Is Manual Work
                        </span>
                    </div>

                    <h2 className="font-display mb-4 text-3xl font-bold text-foreground md:text-4xl">
                        Your Team Is Stuck in{' '}
                        <span className="text-gradient">Repetition</span>
                    </h2>

                    <h3 className="mb-8 text-xl font-medium text-muted-foreground md:text-2xl">
                        The work gets done, but it drains focus, speed, and
                        leadership time
                    </h3>

                    <p className="mb-6 leading-relaxed text-muted-foreground">
                        Most companies are not short on talent. They are short
                        on bandwidth. Every week, your best people get pulled
                        into follow ups, status updates, data cleanup, and
                        internal coordination. That is not strategy. That is
                        survival.
                    </p>

                    <p className="leading-relaxed text-muted-foreground">
                        You do not need more tools. You need a team that
                        executes consistently, without adding headcount chaos.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default ProblemSection;
