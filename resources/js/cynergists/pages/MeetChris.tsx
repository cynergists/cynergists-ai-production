import { Helmet } from "react-helmet";
import meetryanBackground from "@/assets/meetryan-background.webp";
import { Search, Target, ArrowRight } from "lucide-react";

const MeetChris = () => {
  return (
    <>
      <Helmet>
        <title>Meet Chris | Cynergists</title>
        <meta
          name="description"
          content="Schedule a quick chat to discover how our scalable operations team infused with AI grows your business faster, smarter, and at a fraction of the cost."
        />
      </Helmet>

      <div className="min-h-screen relative">
        {/* Parallax Sticky Background */}
        <div 
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: `url(${meetryanBackground})`,
            backgroundAttachment: 'fixed',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/70" />
        </div>

        {/* Content */}
        <section className="relative z-10 min-h-screen flex items-center py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Column - Copy */}
              <div className="space-y-6">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                <span className="text-gradient">Lead Like a Hero,</span> Leave the Heavy Lifting to Us.
              </h1>
                
                <h2 className="font-display text-xl md:text-2xl text-muted-foreground leading-relaxed">
                  Running a business shouldn't feel like battling villains alone. Discover how our scalable operations team infused with AI grows your business faster, smarter, and at a fraction of the cost. No pitch. Just a quick chat to see if you're a fit for our system.
                </h2>
                
                <p className="text-2xl md:text-3xl font-semibold text-primary">
                  Schedule Your Free 30 Minute Consultation Now!
                </p>
              </div>

              {/* Right Column - Calendar */}
              <div className="w-full h-[840px] overflow-y-auto rounded-lg border border-border/30 bg-card/50 scroll-smooth">
                <iframe 
                  src="https://link.cynergists.com/widget/booking/HUtyePseLWGRwfdQKEFU" 
                  style={{ width: '100%', height: '850px', border: 'none' }}
                  id="0cNmv0RgakjVLwmCloFZ_1766511845336"
                  title="Book a meeting with Chris"
                />
              </div>
            </div>
          </div>
        </section>

        {/* What Happens Next Section */}
        <section className="relative z-10 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto text-center space-y-12">
              <h3 className="font-display text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground">
                What to Expect on the Call
              </h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                {/* Box 1 */}
                <div className="group relative p-8 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative space-y-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                      <Search className="w-7 h-7 text-primary" />
                    </div>
                    <div className="text-primary font-bold text-lg">Step 1</div>
                    <p className="text-foreground font-medium text-lg leading-relaxed">
                      We will review your current operations and bottlenecks
                    </p>
                  </div>
                </div>

                {/* Box 2 */}
                <div className="group relative p-8 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative space-y-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                      <Target className="w-7 h-7 text-primary" />
                    </div>
                    <div className="text-primary font-bold text-lg">Step 2</div>
                    <p className="text-foreground font-medium text-lg leading-relaxed">
                      We will identify where leverage is being lost
                    </p>
                  </div>
                </div>

                {/* Box 3 */}
                <div className="group relative p-8 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative space-y-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                      <ArrowRight className="w-7 h-7 text-primary" />
                    </div>
                    <div className="text-primary font-bold text-lg">Step 3</div>
                    <p className="text-foreground font-medium text-lg leading-relaxed">
                      We will outline clear next steps if there is a fit
                    </p>
                  </div>
                </div>
              </div>
              
              <p className="text-xl text-muted-foreground italic pb-[200px]">
                No pressure, no pitch deck, no obligation
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default MeetChris;
