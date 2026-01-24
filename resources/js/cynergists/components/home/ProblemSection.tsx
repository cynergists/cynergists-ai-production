const ProblemSection = () => {
  return (
    <section className="py-24 bg-background dark:bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 dark:block hidden" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
            <span className="text-sm text-primary font-medium">The Villain Is Manual Work</span>
          </div>
          
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Your Team Is Stuck in{" "}
            <span className="text-gradient">Repetition</span>
          </h2>
          
          <h3 className="text-xl md:text-2xl text-muted-foreground font-medium mb-8">
            The work gets done, but it drains focus, speed, and leadership time
          </h3>
          
          <p className="text-muted-foreground leading-relaxed mb-6">
            Most companies are not short on talent. They are short on bandwidth. Every week, your best people get pulled into follow ups, status updates, data cleanup, and internal coordination. That is not strategy. That is survival.
          </p>
          
          <p className="text-muted-foreground leading-relaxed">
            You do not need more tools. You need a team that executes consistently, without adding headcount chaos.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
