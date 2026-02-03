import meetryanBackground from '@/assets/meetryan-background.webp';
import { ArrowRight, Search, Target } from 'lucide-react';
import { Helmet } from 'react-helmet';

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

            <div className="relative min-h-screen">
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
                <section className="relative z-10 flex min-h-screen items-center py-16 md:py-24">
                    <div className="container mx-auto px-4">
                        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                            {/* Left Column - Copy */}
                            <div className="space-y-6">
                                <h1 className="font-display text-4xl leading-tight font-bold text-foreground md:text-5xl lg:text-6xl">
                                    <span className="text-gradient">
                                        Lead Like a Hero,
                                    </span>{' '}
                                    Leave the Heavy Lifting to Us.
                                </h1>

                                <h2 className="font-display text-xl leading-relaxed text-muted-foreground md:text-2xl">
                                    Running a business shouldn't feel like
                                    battling villains alone. Discover how our
                                    scalable operations team infused with AI
                                    grows your business faster, smarter, and at
                                    a fraction of the cost. No pitch. Just a
                                    quick chat to see if you're a fit for our
                                    system.
                                </h2>

                                <p className="text-2xl font-semibold text-primary md:text-3xl">
                                    Schedule Your Free 30 Minute Consultation
                                    Now!
                                </p>
                            </div>

                            {/* Right Column - Calendar */}
                            <div className="h-[840px] w-full overflow-y-auto scroll-smooth rounded-lg border border-border/30 bg-card/50">
                                <iframe
                                    src="https://link.cynergists.com/widget/booking/HUtyePseLWGRwfdQKEFU"
                                    style={{
                                        width: '100%',
                                        height: '850px',
                                        border: 'none',
                                    }}
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
                        <div className="mx-auto max-w-5xl space-y-12 text-center">
                            <h3 className="font-display text-2xl font-semibold text-foreground md:text-3xl lg:text-4xl">
                                What to Expect on the Call
                            </h3>

                            <div className="grid gap-6 md:grid-cols-3">
                                {/* Box 1 */}
                                <div className="group relative rounded-2xl border border-border/50 bg-card/80 p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                    <div className="relative space-y-4">
                                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                                            <Search className="h-7 w-7 text-primary" />
                                        </div>
                                        <div className="text-lg font-bold text-primary">
                                            Step 1
                                        </div>
                                        <p className="text-lg leading-relaxed font-medium text-foreground">
                                            We will review your current
                                            operations and bottlenecks
                                        </p>
                                    </div>
                                </div>

                                {/* Box 2 */}
                                <div className="group relative rounded-2xl border border-border/50 bg-card/80 p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                    <div className="relative space-y-4">
                                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                                            <Target className="h-7 w-7 text-primary" />
                                        </div>
                                        <div className="text-lg font-bold text-primary">
                                            Step 2
                                        </div>
                                        <p className="text-lg leading-relaxed font-medium text-foreground">
                                            We will identify where leverage is
                                            being lost
                                        </p>
                                    </div>
                                </div>

                                {/* Box 3 */}
                                <div className="group relative rounded-2xl border border-border/50 bg-card/80 p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                    <div className="relative space-y-4">
                                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                                            <ArrowRight className="h-7 w-7 text-primary" />
                                        </div>
                                        <div className="text-lg font-bold text-primary">
                                            Step 3
                                        </div>
                                        <p className="text-lg leading-relaxed font-medium text-foreground">
                                            We will outline clear next steps if
                                            there is a fit
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <p className="pb-[200px] text-xl text-muted-foreground italic">
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
