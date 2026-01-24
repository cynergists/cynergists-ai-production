const FreedomSection = () => {
  return (
    <section className="py-24 bg-card/30 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
              <span className="text-sm text-primary font-medium">Reclaim Command</span>
            </div>
            
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Lead the Business,{" "}
              <span className="text-gradient">Not the Backlog</span>
            </h2>
            
            <h3 className="text-xl md:text-2xl text-muted-foreground font-medium mb-8">
              Your job is direction, priorities, and decisions, not busywork management
            </h3>
            
            <p className="text-muted-foreground leading-relaxed mb-6">
              When your execution layer is handled, leadership gets lighter. Meetings get shorter. Reporting gets clearer. Your team spends less time coordinating work and more time completing it.
            </p>
            
            <p className="text-lg text-foreground leading-relaxed">
              This is what scale feels like when it is built correctly.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FreedomSection;
