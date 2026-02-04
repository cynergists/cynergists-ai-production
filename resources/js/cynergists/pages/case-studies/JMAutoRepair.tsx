import Layout from '@/components/layout/Layout';
import { OrbitingButton } from '@/components/ui/orbiting-button';
import { Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle,
    Pause,
    Play,
    Search,
    TrendingUp,
    Volume2,
    VolumeX,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
const JMAutoRepair = () => {
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
                <title>JM Auto Repair SEO Case Study | Cynergists</title>
                <meta
                    name="description"
                    content="How strategic SEO turned a local auto repair shop into a consistent lead engine. See how Cynergists increased organic traffic by 70% and ranking keywords by 91%."
                />
                <link
                    rel="canonical"
                    href="https://cynergists.ai/case-studies/jm-auto-repair"
                />
                <meta
                    property="og:title"
                    content="JM Auto Repair SEO Case Study | Cynergists"
                />
                <meta
                    property="og:description"
                    content="How strategic SEO turned a local auto repair shop into a consistent lead engine. See how Cynergists increased organic traffic by 70% and ranking keywords by 91%."
                />
                <meta
                    property="og:url"
                    content="https://cynergists.ai/case-studies/jm-auto-repair"
                />
                <meta property="og:type" content="article" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta
                    name="twitter:title"
                    content="JM Auto Repair SEO Case Study | Cynergists"
                />
                <meta
                    name="twitter:description"
                    content="How strategic SEO turned a local auto repair shop into a consistent lead engine."
                />
                <script type="application/ld+json">
                    {JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Article',
                        headline: 'JM Auto Repair SEO Case Study',
                        description:
                            'How strategic SEO turned a local auto repair shop into a consistent lead engine.',
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
                                <Search className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium text-primary">
                                    SEO Case Study
                                </span>
                            </div>
                            <h1 className="font-display mb-6 text-4xl font-bold text-foreground md:text-5xl">
                                From Invisible to{' '}
                                <span className="text-gradient">
                                    70% More Traffic in 6 Months
                                </span>
                            </h1>
                            <h2 className="mb-6 text-xl font-medium text-foreground/90 md:text-2xl">
                                How We Turned a Local Auto Shop Into a
                                Lead-Generating Machine With Strategic SEO
                            </h2>
                        </div>

                        {/* Video Player */}
                        <div className="w-full flex-shrink-0 lg:-ml-8 lg:w-auto">
                            <div className="relative mx-auto aspect-[9/16] w-full max-w-[340px] overflow-hidden rounded-2xl shadow-2xl lg:mx-0">
                                <video
                                    ref={videoRef}
                                    src="/videos/jm-auto-repair-case-study.mp4"
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
                            JM Auto Repair operates in a highly competitive
                            local market where visibility directly impacts
                            revenue. While the business had a website, it was
                            not fully optimized for search engines and was
                            underperforming in key areas that drive inbound
                            demand.
                        </p>

                        <p className="mb-6 text-lg text-muted-foreground">
                            Before our engagement, the site suffered from:
                        </p>

                        <ul className="mb-8 space-y-4">
                            {[
                                'Weak on-page SEO fundamentals',
                                'Thin service pages that failed to rank competitively',
                                'Technical issues that limited crawlability and keyword expansion',
                                'Missed opportunities to capture high-intent local searches',
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
                            The result was predictable: inconsistent organic
                            traffic and reliance on referrals and paid channels
                            to maintain steady business.
                        </p>
                    </div>
                </div>
            </section>

            {/* Starting Point */}
            <section className="bg-card/30 py-16 lg:py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-4xl">
                        <h2 className="font-display mb-4 text-3xl font-bold text-foreground">
                            Starting Point{' '}
                            <span className="text-gradient">(June 2025)</span>
                        </h2>

                        <p className="mb-8 text-lg text-muted-foreground">
                            At the beginning of the campaign, the website showed
                            clear signs of technical and content debt.
                        </p>

                        <h3 className="font-display mb-6 text-xl font-semibold text-foreground">
                            Baseline Metrics:
                        </h3>

                        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                { label: 'On-Page SEO Score', value: '64' },
                                {
                                    label: 'Organic Monthly Traffic',
                                    value: '1,525',
                                },
                                { label: 'Ranking Keywords', value: '248' },
                                { label: 'Backlinks', value: '186' },
                                { label: 'SEO Issues Identified', value: '57' },
                            ].map((metric) => (
                                <div
                                    key={metric.label}
                                    className="card-glass p-6 text-center"
                                >
                                    <div className="font-display mb-2 text-3xl font-bold text-primary">
                                        {metric.value}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {metric.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p className="text-lg text-muted-foreground">
                            At this stage, the site was functional but not
                            competitive. Search engines could not clearly
                            understand page intent, service relevance, or
                            topical authority, which limited growth potential.
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
                            Rather than chasing short-term tricks, we focused on
                            building a durable SEO foundation designed to
                            compound over time.
                        </p>

                        <h3 className="font-display mb-6 text-xl font-semibold text-foreground">
                            SEO Improvements Implemented:
                        </h3>

                        <ul className="mb-8 space-y-4">
                            {[
                                'Rebuilt page structure with proper H1s, titles, and metadata',
                                'Expanded thin pages to fully match search intent for auto repair services',
                                'Fixed duplicate titles, missing descriptions, and weak internal linking',
                                'Cleaned up crawl issues, broken links, and 4XX errors',
                                'Improved URL structure for better indexing and relevance',
                                'Strengthened site authority through consistent backlink growth',
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
                            This work was executed and monitored through
                            recurring audits to ensure progress without
                            regression.
                        </p>
                    </div>
                </div>
            </section>

            {/* Growth Over Time */}
            <section className="bg-card/30 py-16 lg:py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-4xl">
                        <h2 className="font-display mb-4 text-3xl font-bold text-foreground">
                            Growth{' '}
                            <span className="text-gradient">Over Time</span>
                        </h2>

                        <p className="mb-8 text-lg text-muted-foreground">
                            As the foundation improved, the results followed.
                        </p>

                        <h3 className="font-display mb-6 text-xl font-semibold text-foreground">
                            Mid-Campaign Performance (July - September 2025):
                        </h3>

                        <ul className="mb-8 space-y-4">
                            {[
                                'SEO Score improved to 90+',
                                'Organic traffic climbed above 2,400 monthly visitors',
                                'Ranking keywords expanded to 355',
                                'Backlinks grew steadily, reinforcing domain authority',
                            ].map((item, index) => (
                                <li
                                    key={index}
                                    className="flex items-start gap-3"
                                >
                                    <TrendingUp className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                                    <span className="text-muted-foreground">
                                        {item}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <p className="text-lg text-muted-foreground">
                            This confirmed that the site was no longer fragile.
                            It was compounding.
                        </p>
                    </div>
                </div>
            </section>

            {/* Final Results */}
            <section className="py-16 lg:py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-4xl">
                        <h2 className="font-display mb-4 text-3xl font-bold text-foreground">
                            Final Results{' '}
                            <span className="text-gradient">
                                (December 2025)
                            </span>
                        </h2>

                        <p className="mb-8 text-lg text-muted-foreground">
                            By the end of the campaign, JM Auto Repair's website
                            had become a reliable acquisition channel.
                        </p>

                        <h3 className="font-display mb-6 text-xl font-semibold text-foreground">
                            After Metrics:
                        </h3>

                        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                {
                                    label: 'On-Page SEO Score',
                                    value: '90',
                                    change: '+26',
                                },
                                {
                                    label: 'Organic Monthly Traffic',
                                    value: '2,600+',
                                    change: '+70%',
                                },
                                {
                                    label: 'Ranking Keywords',
                                    value: '475',
                                    change: '+91%',
                                },
                                {
                                    label: 'Backlinks',
                                    value: '913',
                                    change: '+391%',
                                },
                                {
                                    label: 'SEO Issues',
                                    value: '12',
                                    change: '-79%',
                                },
                            ].map((metric) => (
                                <div
                                    key={metric.label}
                                    className="card-glass p-6 text-center"
                                >
                                    <div className="font-display mb-1 text-3xl font-bold text-primary">
                                        {metric.value}
                                    </div>
                                    <div className="mb-2 text-sm text-green-400">
                                        {metric.change}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {metric.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p className="mb-8 text-lg text-muted-foreground">
                            The site also achieved traffic peaks exceeding 3,000
                            monthly organic visitors, indicating sustained
                            momentum rather than a temporary spike.
                        </p>

                        {/* Before vs After Snapshot */}
                        <div className="card-glass p-6 lg:p-8">
                            <h3 className="font-display mb-8 text-center text-2xl font-semibold text-foreground lg:text-3xl">
                                Before vs After{' '}
                                <span className="text-gradient">Snapshot</span>
                            </h3>

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
                                        metric: 'SEO Score',
                                        before: '64',
                                        after: '90',
                                    },
                                    {
                                        metric: 'Monthly Traffic',
                                        before: '1,525',
                                        after: '2,600+',
                                    },
                                    {
                                        metric: 'Ranking Keywords',
                                        before: '248',
                                        after: '475',
                                    },
                                    {
                                        metric: 'Backlinks',
                                        before: '186',
                                        after: '913',
                                    },
                                    {
                                        metric: 'SEO Issues',
                                        before: '57',
                                        after: '12',
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
                                            <span className="text-lg font-bold text-muted-foreground lg:text-2xl">
                                                {row.before}
                                            </span>
                                        </div>
                                        <div
                                            key={`after-${index}`}
                                            className="flex items-center justify-center rounded-lg border border-primary/20 bg-primary/10 p-3 lg:p-4"
                                        >
                                            <span className="text-lg font-bold text-primary lg:text-2xl">
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
            <section className="bg-card/30 py-16 lg:py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-4xl">
                        <h2 className="font-display mb-8 text-3xl font-bold text-foreground">
                            Business{' '}
                            <span className="text-gradient">Impact</span>
                        </h2>

                        <p className="mb-6 text-lg text-muted-foreground">
                            This SEO growth translated directly into business
                            results.
                        </p>

                        <ul className="mb-8 space-y-4">
                            {[
                                'More inbound calls and form submissions from high-intent local searches',
                                'Reduced reliance on paid advertising to maintain lead volume',
                                'Increased visibility for core repair services in local search results',
                                'Stronger brand trust due to consistent Google presence',
                                'A scalable marketing asset that continues working without additional ad spend',
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
                            Instead of chasing customers, JM Auto Repair
                            positioned itself where customers were already
                            searching.
                        </p>
                    </div>
                </div>
            </section>

            {/* Conclusion */}
            <section className="py-16 lg:py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-4xl">
                        <div className="card-glass p-8 text-center lg:p-12">
                            <p className="mb-8 text-xl font-medium text-foreground">
                                SEO done correctly does not just increase
                                traffic. It increases predictability.
                            </p>

                            <p className="mb-6 text-lg text-muted-foreground">
                                JM Auto Repair now owns a search presence that:
                            </p>

                            <ul className="mx-auto mb-8 max-w-xl space-y-4 text-left">
                                {[
                                    'Continues to attract local customers every month',
                                    'Compounds over time instead of resetting like ads',
                                    'Creates leverage against competitors who rely on short-term tactics',
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

                            <p className="text-lg font-semibold text-foreground">
                                This is what happens when SEO is treated as
                                infrastructure, not an experiment.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-card/30 py-24">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="font-display mb-4 text-3xl font-bold text-foreground">
                        Ready to Build Your Own Lead Engine?
                    </h2>
                    <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
                        Let's discuss how Cynergists can help you achieve
                        similar results for your business.
                    </p>
                    <OrbitingButton asChild className="btn-primary">
                        <Link href="/schedule">Schedule a Call</Link>
                    </OrbitingButton>
                </div>
            </section>
        </Layout>
    );
};

export default JMAutoRepair;
