import Layout from '@/components/layout/Layout';
import { OrbitingButton } from '@/components/ui/orbiting-button';
import { Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    CheckCircle,
    Pause,
    Play,
    Quote,
    Settings,
    Volume2,
    VolumeX,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Helmet } from 'react-helmet';

const OgdenVentures = () => {
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [hasUnmuted, setHasUnmuted] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
            if (isMuted) {
                setHasUnmuted(true);
                videoRef.current.currentTime = 0;
                videoRef.current.loop = false;
            }
        }
    };

    const handleVideoEnded = () => {
        if (hasUnmuted) {
            setIsPlaying(false);
        }
    };

    return (
        <Layout>
            <Helmet>
                <title>Ogden Ventures Case Study | Cynergists</title>
                <meta
                    name="description"
                    content="How Operational Infrastructure Enabled Scalable Content, Outreach, and Automation for Ogden Ventures. See how Cynergists transformed fragmented systems into an integrated operational backbone."
                />
                <link
                    rel="canonical"
                    href="https://cynergists.ai/case-studies/ogden-ventures"
                />
                <meta
                    property="og:title"
                    content="Ogden Ventures Case Study | Cynergists"
                />
                <meta
                    property="og:description"
                    content="How Operational Infrastructure Enabled Scalable Content, Outreach, and Automation for Ogden Ventures."
                />
                <meta
                    property="og:url"
                    content="https://cynergists.ai/case-studies/ogden-ventures"
                />
                <meta property="og:type" content="article" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta
                    name="twitter:title"
                    content="Ogden Ventures Case Study | Cynergists"
                />
                <meta
                    name="twitter:description"
                    content="How Operational Infrastructure Enabled Scalable Content, Outreach, and Automation for Ogden Ventures."
                />
                <script type="application/ld+json">
                    {JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Article',
                        headline: 'Ogden Ventures Case Study',
                        description:
                            'How Operational Infrastructure Enabled Scalable Content, Outreach, and Automation for Ogden Ventures.',
                        author: {
                            '@type': 'Organization',
                            name: 'Cynergists',
                        },
                        publisher: {
                            '@type': 'Organization',
                            name: 'Cynergists',
                        },
                    })}
                </script>
            </Helmet>

            {/* Hero */}
            <section className="gradient-hero relative overflow-hidden py-20 lg:py-32">
                <div className="absolute inset-0">
                    <div className="absolute top-1/3 right-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute bottom-1/4 left-0 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
                </div>

                <div className="relative z-10 container mx-auto px-4">
                    <Link
                        href="/case-studies"
                        className="mb-8 inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Case Studies
                    </Link>

                    <div className="flex flex-col items-center gap-8 lg:flex-row lg:gap-16">
                        <div className="flex-1">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                                <Settings className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium text-primary">
                                    Operations Case Study
                                </span>
                            </div>
                            <h1 className="font-display mb-6 text-4xl font-bold text-foreground md:text-5xl">
                                From Scattered Systems to{' '}
                                <span className="text-gradient">
                                    Scalable Growth Engine
                                </span>
                            </h1>
                            <h2 className="mb-6 text-xl font-medium text-foreground/90 md:text-2xl">
                                How We Built the Operational Backbone That
                                Powers Ogden Ventures' Content and Outreach
                            </h2>

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <div>
                                    <span className="font-medium text-foreground">
                                        Client:
                                    </span>{' '}
                                    Marcus Ogden, CEO and Founder of Ogden
                                    Ventures LLC
                                </div>
                                <div>
                                    <span className="font-medium text-foreground">
                                        Partner:
                                    </span>{' '}
                                    Cynergists
                                </div>
                            </div>
                        </div>

                        {/* Video Player */}
                        <div className="w-full flex-shrink-0 lg:-ml-8 lg:w-auto">
                            <div className="p-[6px] md:p-[8px] rounded-xl md:rounded-2xl animate-gradient-reverse [box-shadow:0_0_15px_rgba(132,204,22,0.15)] hover:[box-shadow:0_0_25px_rgba(132,204,22,0.3)] hover:scale-[1.02] transition-all duration-300 mx-auto w-full max-w-[340px] lg:mx-0">
                                <div className="relative aspect-[9/16] overflow-hidden rounded-lg md:rounded-xl bg-card">
                                    <video
                                    ref={videoRef}
                                    src="/videos/ogden-ventures-case-study.mp4"
                                    className="h-full w-full object-cover"
                                    autoPlay
                                    muted
                                    loop={!hasUnmuted}
                                    playsInline
                                    onEnded={handleVideoEnded}
                                    />

                                    {/* Video Controls */}
                                    <div className="absolute right-4 bottom-4 left-4 z-10 flex items-center justify-between">
                                    <button
                                        onClick={togglePlay}
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-background/80 transition-colors hover:bg-background"
                                        aria-label={
                                            isPlaying ? 'Pause' : 'Play'
                                        }
                                    >
                                        {isPlaying ? (
                                            <Pause className="h-5 w-5 text-foreground" />
                                        ) : (
                                            <Play className="ml-0.5 h-5 w-5 text-foreground" />
                                        )}
                                    </button>
                                    <button
                                        onClick={toggleMute}
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-background/80 transition-colors hover:bg-background"
                                        aria-label={isMuted ? 'Unmute' : 'Mute'}
                                    >
                                        {isMuted ? (
                                            <VolumeX className="h-5 w-5 text-foreground" />
                                        ) : (
                                            <Volume2 className="h-5 w-5 text-foreground" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* The Challenge */}
            <section className="py-16 lg:py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-4xl">
                        <h2 className="font-display mb-8 text-3xl font-bold text-foreground">
                            The <span className="text-gradient">Challenge</span>
                        </h2>

                        <p className="mb-6 text-lg text-muted-foreground">
                            Ogden Ventures was expanding its brand presence
                            across podcasts, social platforms, LinkedIn
                            outreach, and CRM-driven follow-ups. While growth
                            was happening, the backend operations were becoming
                            increasingly fragmented.
                        </p>

                        <p className="mb-6 text-lg text-muted-foreground">
                            Before engaging Cynergists, the business faced:
                        </p>

                        <ul className="mb-8 space-y-4">
                            {[
                                'Disconnected systems across podcasting, outreach, and CRM',
                                'Manual processes limiting speed and consistency',
                                'Operational bottlenecks slowing execution',
                                'Founder dependency for coordination and problem resolution',
                                'Lack of centralized automation to support scale',
                            ].map((item, index) => (
                                <li
                                    key={index}
                                    className="flex items-start gap-3"
                                >
                                    <AlertTriangle className="mt-1 h-5 w-5 flex-shrink-0 text-amber-500" />
                                    <span className="text-muted-foreground">
                                        {item}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <p className="text-lg text-muted-foreground">
                            The result was growing complexity. Strategic ideas
                            existed, but execution required too much founder
                            involvement to remain sustainable.
                        </p>
                    </div>
                </div>
            </section>

            {/* Starting Point */}
            <section className="bg-card/30 py-16 lg:py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-4xl">
                        <h2 className="font-display mb-4 text-3xl font-bold text-foreground">
                            Starting{' '}
                            <span className="text-gradient">Point</span>
                        </h2>

                        <p className="mb-8 text-lg text-muted-foreground">
                            At the start of the engagement, Ogden Ventures had
                            momentum but lacked an integrated operational
                            backbone.
                        </p>

                        <h3 className="font-display mb-6 text-xl font-semibold text-foreground">
                            Initial State Overview:
                        </h3>

                        <ul className="mb-8 space-y-4">
                            {[
                                'Podcast production without standardized workflows',
                                'CRM in place but underutilized',
                                'Manual outreach processes',
                                'Limited automation between platforms',
                                'No unified system connecting content, distribution, and follow-up',
                            ].map((item, index) => (
                                <li
                                    key={index}
                                    className="flex items-start gap-3"
                                >
                                    <AlertTriangle className="mt-1 h-5 w-5 flex-shrink-0 text-amber-500" />
                                    <span className="text-muted-foreground">
                                        {item}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <p className="text-lg text-muted-foreground">
                            The business was functional, but not yet built to
                            scale efficiently.
                        </p>
                    </div>
                </div>
            </section>

            {/* What We Did */}
            <section className="py-16 lg:py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-4xl">
                        <h2 className="font-display mb-4 text-3xl font-bold text-foreground">
                            What We <span className="text-gradient">Did</span>
                        </h2>

                        <p className="mb-8 text-lg text-muted-foreground">
                            Rather than offering isolated services, Cynergists
                            acted as an embedded operations and execution
                            partner.
                        </p>

                        <h3 className="font-display mb-6 text-xl font-semibold text-foreground">
                            Operational Infrastructure Implemented:
                        </h3>

                        <ul className="mb-8 space-y-4">
                            {[
                                'Built scalable systems for podcast operations',
                                'Structured CRM workflows for outreach and follow-up',
                                'Implemented automation across platforms to reduce manual effort',
                                'Executed LinkedIn and social media posting consistently',
                                'Handled video editing and content distribution',
                                'Aligned strategy with tactical execution across channels',
                            ].map((item, index) => (
                                <li
                                    key={index}
                                    className="flex items-start gap-3"
                                >
                                    <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                                    <span className="text-muted-foreground">
                                        {item}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <p className="text-lg text-muted-foreground">
                            All systems were designed to work together, creating
                            a cohesive operating environment instead of siloed
                            tools.
                        </p>
                    </div>
                </div>
            </section>

            {/* Execution Philosophy */}
            <section className="bg-card/30 py-16 lg:py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-4xl">
                        <h2 className="font-display mb-8 text-3xl font-bold text-foreground">
                            Execution{' '}
                            <span className="text-gradient">Philosophy</span>
                        </h2>

                        <p className="mb-6 text-lg text-muted-foreground">
                            Speed and responsiveness were core differentiators.
                        </p>

                        <p className="mb-6 text-lg text-muted-foreground">
                            When issues surfaced or adjustments were needed,
                            Cynergists addressed them immediately. This
                            prevented delays, minimized friction, and allowed
                            the brand to maintain momentum without interruption.
                        </p>

                        <p className="text-lg text-muted-foreground">
                            The team operated as an extension of Ogden Ventures,
                            covering multiple operational angles simultaneously
                            without sacrificing quality or clarity.
                        </p>
                    </div>
                </div>
            </section>

            {/* Results Over Time */}
            <section className="py-16 lg:py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-4xl">
                        <h2 className="font-display mb-4 text-3xl font-bold text-foreground">
                            Results{' '}
                            <span className="text-gradient">Over Time</span>
                        </h2>

                        <p className="mb-8 text-lg text-muted-foreground">
                            As systems matured, operational clarity followed.
                        </p>

                        <h3 className="font-display mb-6 text-xl font-semibold text-foreground">
                            Key Outcomes:
                        </h3>

                        <ul className="mb-8 space-y-4">
                            {[
                                'Improved organization across all operational systems',
                                'More strategic alignment between content, outreach, and CRM',
                                'Faster execution without increasing internal workload',
                                'Reduced operational noise for leadership',
                                'Greater confidence in launching and scaling initiatives',
                            ].map((item, index) => (
                                <li
                                    key={index}
                                    className="flex items-start gap-3"
                                >
                                    <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                                    <span className="text-muted-foreground">
                                        {item}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <p className="mb-4 text-lg text-muted-foreground">
                            According to Marcus, the brand became:
                        </p>

                        <div className="flex flex-wrap gap-4">
                            {[
                                'More organized',
                                'More strategic',
                                'More tactical',
                            ].map((item) => (
                                <span
                                    key={item}
                                    className="rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Before vs After */}
            <section className="bg-card/30 py-16 lg:py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-4xl">
                        <h2 className="font-display mb-8 text-center text-3xl font-bold text-foreground">
                            Before vs After{' '}
                            <span className="text-gradient">Snapshot</span>
                        </h2>

                        <div className="card-glass p-6 lg:p-8">
                            <div className="grid grid-cols-3 gap-4 lg:gap-6">
                                {/* Header Row */}
                                <div className="text-center">
                                    <span className="text-lg font-semibold text-muted-foreground lg:text-xl">
                                        Metric
                                    </span>
                                </div>
                                <div className="text-center">
                                    <span className="text-lg font-semibold text-muted-foreground lg:text-xl">
                                        Before
                                    </span>
                                </div>
                                <div className="text-center">
                                    <span className="text-lg font-semibold text-muted-foreground lg:text-xl">
                                        After
                                    </span>
                                </div>

                                {/* Data Rows */}
                                {[
                                    {
                                        metric: 'Operational Structure',
                                        before: 'Fragmented',
                                        after: 'Integrated',
                                    },
                                    {
                                        metric: 'CRM Utilization',
                                        before: 'Limited',
                                        after: 'Fully leveraged',
                                    },
                                    {
                                        metric: 'Content Execution',
                                        before: 'Inconsistent',
                                        after: 'Systemized',
                                    },
                                    {
                                        metric: 'Automation',
                                        before: 'Minimal',
                                        after: 'Cross-platform',
                                    },
                                    {
                                        metric: 'Founder Dependency',
                                        before: 'High',
                                        after: 'Reduced',
                                    },
                                ].map((row, index) => (
                                    <>
                                        <div
                                            key={`metric-${index}`}
                                            className="flex items-center justify-center rounded-lg bg-muted/20 p-3 lg:p-4"
                                        >
                                            <span className="text-center text-base font-medium text-foreground lg:text-lg">
                                                {row.metric}
                                            </span>
                                        </div>
                                        <div
                                            key={`before-${index}`}
                                            className="flex items-center justify-center rounded-lg bg-muted/10 p-3 lg:p-4"
                                        >
                                            <span className="text-center text-base font-semibold text-muted-foreground lg:text-lg">
                                                {row.before}
                                            </span>
                                        </div>
                                        <div
                                            key={`after-${index}`}
                                            className="flex items-center justify-center rounded-lg border border-primary/20 bg-primary/10 p-3 lg:p-4"
                                        >
                                            <span className="text-center text-base font-semibold text-primary lg:text-lg">
                                                {row.after}
                                            </span>
                                        </div>
                                    </>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Business Impact */}
            <section className="py-16 lg:py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-4xl">
                        <h2 className="font-display mb-8 text-3xl font-bold text-foreground">
                            Business{' '}
                            <span className="text-gradient">Impact</span>
                        </h2>

                        <p className="mb-6 text-lg text-muted-foreground">
                            The operational improvements translated directly
                            into business leverage.
                        </p>

                        <ul className="mb-8 space-y-4">
                            {[
                                'Smoother execution across podcasts, outreach, and content',
                                'Faster turnaround on requests and adjustments',
                                'Improved consistency across brand touchpoints',
                                'Less time spent managing tools and processes',
                                'More time allocated to leadership, strategy, and growth',
                            ].map((item, index) => (
                                <li
                                    key={index}
                                    className="flex items-start gap-3"
                                >
                                    <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                                    <span className="text-muted-foreground">
                                        {item}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <p className="text-lg text-muted-foreground">
                            Instead of managing systems, leadership could focus
                            on direction.
                        </p>
                    </div>
                </div>
            </section>

            {/* Client Testimonial */}
            <section className="bg-card/30 py-16 lg:py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-4xl">
                        <h2 className="font-display mb-8 text-center text-3xl font-bold text-foreground">
                            Client{' '}
                            <span className="text-gradient">Testimonial</span>
                        </h2>

                        <div className="card-glass relative p-8 lg:p-12">
                            <Quote className="absolute top-6 left-6 h-12 w-12 text-primary/20" />

                            <blockquote className="relative z-10">
                                <p className="mb-6 pl-8 text-lg text-foreground/90 italic lg:text-xl">
                                    "They are sensational. Ryan and his team are
                                    fantastic at every angle of scaling a
                                    business. They helped our brand scale
                                    systems, operational setup, podcasting,
                                    outreach, CRM, automation, LinkedIn, social
                                    media, posting, and video editing.
                                </p>
                                <p className="mb-6 pl-8 text-lg text-foreground/90 italic lg:text-xl">
                                    What I love most is how responsive they are.
                                    If something needs to be addressed, they are
                                    on it right away.
                                </p>
                                <p className="mb-8 pl-8 text-lg text-foreground/90 italic lg:text-xl">
                                    They helped our brand tremendously get more
                                    organized, more strategic, and more
                                    tactical."
                                </p>
                                <footer className="pl-8">
                                    <p className="font-semibold text-foreground">
                                        — Marcus Ogden
                                    </p>
                                    <p className="text-muted-foreground">
                                        CEO, Ogden Ventures LLC
                                    </p>
                                </footer>
                            </blockquote>
                        </div>
                    </div>
                </div>
            </section>

            {/* The Takeaway */}
            <section className="py-16 lg:py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-4xl">
                        <h2 className="font-display mb-8 text-3xl font-bold text-foreground">
                            The <span className="text-gradient">Takeaway</span>
                        </h2>

                        <p className="mb-6 text-xl font-medium text-foreground">
                            Operational scaling is not about adding tools. It is
                            about removing friction.
                        </p>

                        <p className="mb-6 text-lg text-muted-foreground">
                            Ogden Ventures now operates with:
                        </p>

                        <ul className="mb-8 space-y-4">
                            {[
                                'Systems that support growth instead of slowing it',
                                'Execution that keeps pace with strategy',
                                'Infrastructure that scales without founder burnout',
                            ].map((item, index) => (
                                <li
                                    key={index}
                                    className="flex items-start gap-3"
                                >
                                    <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                                    <span className="text-muted-foreground">
                                        {item}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <p className="text-lg font-medium text-foreground">
                            This is what happens when operations are treated as
                            infrastructure, not overhead.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-card/30 py-16 lg:py-24">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="font-display mb-4 text-3xl font-bold text-foreground">
                        Ready to Build Operational Leverage?
                    </h2>
                    <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
                        Let's discuss how Cynergists can help you systemize
                        execution and scale without chaos.
                    </p>
                    <OrbitingButton
                        asChild
                        className="btn-primary group px-12 py-8 text-xl"
                    >
                        <Link href="/schedule">
                            Schedule a Call
                            <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </OrbitingButton>
                </div>
            </section>
        </Layout>
    );
};

export default OgdenVentures;
