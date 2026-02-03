const FreedomSection = () => {
    return (
        <section className="relative overflow-hidden bg-card/30 py-24">
            <div className="relative z-10 container mx-auto px-4">
                <div className="mx-auto max-w-4xl">
                    <div className="text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                            <span className="text-sm font-medium text-primary">
                                Reclaim Command
                            </span>
                        </div>

                        <h2 className="font-display mb-4 text-3xl font-bold text-foreground md:text-4xl">
                            Lead the Business,{' '}
                            <span className="text-gradient">
                                Not the Backlog
                            </span>
                        </h2>

                        <h3 className="mb-8 text-xl font-medium text-muted-foreground md:text-2xl">
                            Your job is direction, priorities, and decisions,
                            not busywork management
                        </h3>

                        <p className="mb-6 leading-relaxed text-muted-foreground">
                            When your execution layer is handled, leadership
                            gets lighter. Meetings get shorter. Reporting gets
                            clearer. Your team spends less time coordinating
                            work and more time completing it.
                        </p>

                        <p className="text-lg leading-relaxed text-foreground">
                            This is what scale feels like when it is built
                            correctly.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FreedomSection;
