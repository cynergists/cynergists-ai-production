import Layout from '@/components/layout/Layout';
import VideoWithControls from '@/components/sample-work/VideoWithControls';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import { OrbitingButton } from '@/components/ui/orbiting-button';
import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    Globe,
    MessageSquare,
    Sparkles,
    Target,
    Video,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

import aiVideoCynergists from '@/assets/sample-work/ai-video-cynergists.webp';
import aiVideoDrumTalkTv from '@/assets/sample-work/ai-video-drum-talk-tv.webp';
import aiVideoOutlawsAmsterdam from '@/assets/sample-work/ai-video-outlaws-amsterdam.webp';
import drumTalkTvFunnel from '@/assets/sample-work/drum-talk-tv-funnel.webp';
import grantCardoneFunnel from '@/assets/sample-work/grant-cardone-funnel.webp';
import jmAutoRepairWebsite from '@/assets/sample-work/jm-auto-repair-website.webp';
import podcastIntroInnerGame from '@/assets/sample-work/podcast-intro-inner-game.webp';
import podcastIntroScalingUp from '@/assets/sample-work/podcast-intro-scaling-up.webp';
import podcastTeaserBobBurg from '@/assets/sample-work/podcast-teaser-bob-burg.webp';
import podcastTeaserSeanSwarner from '@/assets/sample-work/podcast-teaser-sean-swarner.webp';
import podcastTeaserTr3 from '@/assets/sample-work/podcast-teaser-tr3.webp';
import qrBria from '@/assets/sample-work/qr-bria.webp';
import qrMike from '@/assets/sample-work/qr-mike.webp';
import qrSara from '@/assets/sample-work/qr-sara.webp';
import socialMedicare from '@/assets/sample-work/social-medicare.webp';
import socialPets from '@/assets/sample-work/social-pets.webp';
import socialSongneeds from '@/assets/sample-work/social-songneeds.webp';
import socialWomenTrades from '@/assets/sample-work/social-women-trades.webp';
import unchain3dWebsite from '@/assets/sample-work/unchain3d-website.webp';

const SampleWork = () => {
    const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(
        null,
    );

    const podcastIntroVideos = [
        {
            thumbnail: podcastIntroInnerGame,
            videoUrl: '/videos/podcast-intro-inner-game.mp4',
            title: 'The Inner Game Podcast',
        },
        {
            thumbnail: podcastIntroScalingUp,
            videoUrl: '/videos/podcast-intro-scaling-up.mp4',
            title: 'Scaling Up Success Podcast',
        },
    ];

    const aiVideos = [
        {
            thumbnail: aiVideoDrumTalkTv,
            videoUrl: '/videos/ai-video-drum-talk-tv.mp4',
        },
        {
            thumbnail: aiVideoCynergists,
            videoUrl: '/videos/ai-video-cynergists.mp4',
        },
        {
            thumbnail: aiVideoOutlawsAmsterdam,
            videoUrl: '/videos/ai-video-outlaws-amsterdam.mp4',
        },
    ];

    const podcastTeaserVideos = [
        {
            thumbnail: podcastTeaserBobBurg,
            videoUrl: '/videos/podcast-teaser-bob-burg.mp4',
            title: 'Bob Burg',
        },
        {
            thumbnail: podcastTeaserTr3,
            videoUrl: '/videos/podcast-teaser-tr3.mp4',
            title: 'TR3',
        },
        {
            thumbnail: podcastTeaserSeanSwarner,
            videoUrl: '/videos/podcast-teaser-sean-swarner.mp4',
            title: 'Sean Swarner',
        },
    ];

    const socialPosts = [
        { image: socialMedicare, title: 'Medicare Campaign' },
        { image: socialPets, title: 'Pet-Friendly HVAC' },
        { image: socialSongneeds, title: 'Songneeds Promo' },
        { image: socialWomenTrades, title: 'Women in Trades Event' },
    ];

    const selectedPost =
        selectedPostIndex !== null ? socialPosts[selectedPostIndex] : null;

    const navigatePost = useCallback(
        (direction: 'prev' | 'next') => {
            if (selectedPostIndex === null) return;
            if (direction === 'prev') {
                setSelectedPostIndex(
                    selectedPostIndex === 0
                        ? socialPosts.length - 1
                        : selectedPostIndex - 1,
                );
            } else {
                setSelectedPostIndex(
                    selectedPostIndex === socialPosts.length - 1
                        ? 0
                        : selectedPostIndex + 1,
                );
            }
        },
        [selectedPostIndex, socialPosts.length],
    );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedPostIndex === null) return;
            if (e.key === 'ArrowLeft') {
                navigatePost('prev');
            } else if (e.key === 'ArrowRight') {
                navigatePost('next');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedPostIndex, navigatePost]);

    const websites = [
        {
            title: 'JM Auto Repair',
            description:
                'Complete website redesign for a local auto repair shop, featuring online booking, service catalog, and customer testimonials.',
            result: '40% increase in online bookings',
            image: jmAutoRepairWebsite,
            link: 'https://jmautorepair.net',
        },
        {
            title: 'Unchain3d',
            description:
                'Modern web3 platform with sleek design, wallet integration, and seamless user experience for blockchain enthusiasts.',
            result: 'Custom design',
            image: unchain3dWebsite,
            link: 'https://unchain3d.io',
        },
    ];

    const salesFunnels = [
        {
            title: 'Grant Cardone Campaign',
            description:
                'High-converting sales funnel for real estate education program with multi-step lead capture and automated follow-up sequences.',
            image: grantCardoneFunnel,
            link: 'https://app.oui-automate.com/v2/preview/HWcUBFONTx60QGA5ZgUj',
        },
        {
            title: 'Drum Talk TV',
            description:
                'Membership funnel for music education platform featuring video previews, testimonials, and tiered pricing options.',
            image: drumTalkTvFunnel,
            link: 'https://buzz.drumtalktvbrilliance.com/',
        },
    ];

    const aiAgents = [
        {
            name: 'Bria',
            role: 'Customer Support Agent',
            description:
                'Handles customer inquiries 24/7, resolves common issues, and escalates complex cases to human agents.',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
            qrCode: qrBria,
        },
        {
            name: 'Mike',
            role: 'Appointment Setter',
            description:
                'Qualifies leads, schedules appointments, and manages calendar integration for sales teams.',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
            qrCode: qrMike,
        },
        {
            name: 'Sara',
            role: 'Sales Representative',
            description:
                'Engages prospects, answers product questions, and guides customers through the purchase process.',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
            qrCode: qrSara,
        },
    ];

    return (
        <Layout>
            <Helmet>
                <title>
                    The Cynergists Arsenal | Creative Services Portfolio
                </title>
                <meta
                    name="description"
                    content="Explore the Cynergists creative portfolio: websites, brand kits, sales funnels, AI agents, video production, and copywriting. Tactical assets engineered to sell."
                />
                <link
                    rel="canonical"
                    href="https://cynergists.ai/sample-work"
                />
                <meta
                    property="og:title"
                    content="The Cynergists Arsenal | Creative Services Portfolio"
                />
                <meta
                    property="og:description"
                    content="Explore the Cynergists creative portfolio: websites, brand kits, sales funnels, AI agents, video production, and copywriting. Tactical assets engineered to sell."
                />
                <meta
                    property="og:url"
                    content="https://cynergists.ai/sample-work"
                />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta
                    name="twitter:title"
                    content="The Cynergists Arsenal | Creative Services Portfolio"
                />
                <meta
                    name="twitter:description"
                    content="Explore the Cynergists creative portfolio: websites, brand kits, sales funnels, AI agents, video production, and copywriting. Tactical assets engineered to sell."
                />
            </Helmet>

            {/* Hero Section */}
            <section className="relative flex min-h-[50vh] items-center overflow-hidden py-20 lg:py-32">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(84_81%_44%_/_0.15)_0%,_transparent_70%)]" />

                <div className="relative z-10 container mx-auto px-4">
                    <div className="mx-auto max-w-4xl text-center">
                        <div className="glass mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium text-primary">
                                Sample Work
                            </span>
                        </div>

                        <h1 className="mb-6 text-4xl leading-tight font-bold md:text-5xl lg:text-6xl">
                            Perception Wins{' '}
                            <span className="text-gradient">Battles</span>
                        </h1>

                        <p className="mx-auto mb-8 max-w-2xl text-xl text-foreground/80 md:text-2xl">
                            Creative assets that make your brand look as strong
                            as it actually is.
                        </p>

                        <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
                            Your product can be excellent and still lose if your
                            brand looks outdated or inconsistent. This page
                            showcases real websites, design, video, and copy
                            deployed by Cynergists to help businesses command
                            attention, establish authority, and convert faster.
                            This is not art for art's sake. This is creative
                            built to sell.
                        </p>
                    </div>
                </div>
            </section>

            {/* Websites Section */}
            <section className="bg-card/30 py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto mb-16 max-w-3xl text-center">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                            <Globe className="h-4 w-4" />
                            Web Development
                        </div>
                        <h2 className="mb-6 text-3xl font-bold md:text-4xl">
                            <span className="text-gradient">Websites</span>
                        </h2>
                        <p className="text-lg text-foreground/80">
                            SEO-optimized websites that make your brand look as
                            strong as it actually is.
                        </p>
                    </div>

                    <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
                        {websites.map((site, index) => (
                            <a
                                key={index}
                                href={site.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="card-glass group cursor-pointer overflow-hidden transition-all hover:ring-2 hover:ring-primary/50"
                            >
                                <div className="relative mb-4 overflow-hidden rounded-lg">
                                    <img
                                        src={site.image}
                                        alt={site.title}
                                        className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-background/80 to-transparent pb-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                        <span className="inline-flex items-center gap-2 text-lg font-semibold text-primary transition-all duration-300 group-hover:scale-110 group-hover:text-xl">
                                            Visit Site{' '}
                                            <ExternalLink className="h-5 w-5" />
                                        </span>
                                    </div>
                                </div>
                                <h3 className="mb-2 text-xl font-semibold">
                                    {site.title}
                                </h3>
                                <p className="mb-4 text-muted-foreground">
                                    {site.description}
                                </p>
                                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                                    {site.result}
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>
            {/* Sales Funnels Section */}
            <section className="bg-card/30 py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto mb-16 max-w-3xl text-center">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                            <Target className="h-4 w-4" />
                            Conversion Optimization
                        </div>
                        <h2 className="mb-6 text-3xl font-bold md:text-4xl">
                            <span className="text-gradient">Sales Funnels</span>
                        </h2>
                        <p className="text-lg text-foreground/80">
                            High-converting funnels designed to capture leads
                            and drive revenue.
                        </p>
                    </div>

                    <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
                        {salesFunnels.map((funnel, index) => (
                            <a
                                key={index}
                                href={funnel.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="card-glass group cursor-pointer overflow-hidden transition-all hover:ring-2 hover:ring-primary/50"
                            >
                                <div className="relative mb-4 overflow-hidden rounded-lg">
                                    <img
                                        src={funnel.image}
                                        alt={funnel.title}
                                        className="h-64 w-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-background/80 to-transparent pb-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                        <span className="inline-flex items-center gap-2 text-lg font-semibold text-primary transition-all duration-300 group-hover:scale-110 group-hover:text-xl">
                                            View Funnel{' '}
                                            <ExternalLink className="h-5 w-5" />
                                        </span>
                                    </div>
                                </div>
                                <h3 className="mb-2 text-xl font-semibold">
                                    {funnel.title}
                                </h3>
                                <p className="text-muted-foreground">
                                    {funnel.description}
                                </p>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Social Posts Section */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto mb-16 max-w-3xl text-center">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                            <MessageSquare className="h-4 w-4" />
                            Social Media
                        </div>
                        <h2 className="mb-6 text-3xl font-bold md:text-4xl">
                            <span className="text-gradient">Social Posts</span>
                        </h2>
                        <p className="text-lg text-foreground/80">
                            Engaging content designed to capture attention and
                            drive engagement.
                        </p>
                    </div>

                    <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6">
                        {socialPosts.map((post, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedPostIndex(index)}
                                className="card-glass group cursor-pointer overflow-hidden p-3 transition-all hover:ring-2 hover:ring-primary/50"
                            >
                                <div className="relative aspect-square overflow-hidden rounded-lg">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                        <span className="text-lg font-semibold text-primary transition-all duration-300 group-hover:scale-110 group-hover:text-xl">
                                            View Post
                                        </span>
                                    </div>
                                </div>
                                <h3 className="mt-3 text-center text-sm font-medium text-foreground/80">
                                    {post.title}
                                </h3>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Social Post Lightbox Dialog */}
            <Dialog
                open={selectedPostIndex !== null}
                onOpenChange={() => setSelectedPostIndex(null)}
            >
                <DialogContent className="max-w-3xl border-none bg-transparent p-0">
                    <DialogClose className="absolute top-4 right-4 z-10 rounded-full bg-background/80 p-2 transition-colors hover:bg-background">
                        <X className="h-5 w-5" />
                    </DialogClose>

                    {/* Left Arrow */}
                    <button
                        onClick={() => navigatePost('prev')}
                        className="absolute top-1/2 left-4 z-10 -translate-y-1/2 rounded-full bg-background/80 p-2 transition-colors hover:bg-background"
                        aria-label="Previous image"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>

                    {/* Right Arrow */}
                    <button
                        onClick={() => navigatePost('next')}
                        className="absolute top-1/2 right-16 z-10 -translate-y-1/2 rounded-full bg-background/80 p-2 transition-colors hover:bg-background"
                        aria-label="Next image"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>

                    {selectedPost && (
                        <img
                            src={selectedPost.image}
                            alt={selectedPost.title}
                            className="h-auto w-full rounded-lg"
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* AI Voice Agents Section */}
            <section className="bg-card/30 py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto mb-16 max-w-3xl text-center">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                            <MessageSquare className="h-4 w-4" />
                            Interactive Demos
                        </div>
                        <h2 className="mb-6 text-3xl font-bold md:text-4xl">
                            Try Our{' '}
                            <span className="text-gradient">
                                AI Voice Agents
                            </span>
                        </h2>
                        <p className="text-lg text-foreground/80">
                            Experience the power of AI-driven customer
                            interactions firsthand.
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {aiAgents.map((agent, index) => (
                            <div key={index} className="card-glass text-center">
                                <div className="relative mx-auto mb-4 h-48 w-48">
                                    <img
                                        src={agent.avatar}
                                        alt={agent.name}
                                        className="h-full w-full rounded-full object-cover ring-2 ring-primary/20"
                                    />
                                    <div className="absolute -right-2 -bottom-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                                        <MessageSquare className="h-5 w-5 text-primary-foreground" />
                                    </div>
                                </div>
                                <h3 className="mb-1 text-xl font-semibold">
                                    {agent.name}
                                </h3>
                                <p className="mb-3 text-sm font-medium text-primary">
                                    {agent.role}
                                </p>
                                <p className="mb-4 text-muted-foreground">
                                    {agent.description}
                                </p>
                                <div className="mx-auto h-32 w-32 overflow-hidden rounded-lg bg-white p-1">
                                    <img
                                        src={agent.qrCode}
                                        alt={`QR code for ${agent.name}`}
                                        className="h-full w-full object-contain"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* AI Videos Section */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto mb-16 max-w-3xl text-center">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                            <Video className="h-4 w-4" />
                            AI-Generated Content
                        </div>
                        <h2 className="mb-6 text-3xl font-bold md:text-4xl">
                            <span className="text-gradient">AI Videos</span>
                        </h2>
                        <p className="text-lg text-foreground/80">
                            Stunning AI-driven visuals that captivate and
                            convert.
                        </p>
                    </div>

                    <div className="mx-auto flex max-w-4xl flex-col gap-8">
                        {aiVideos.map((video, index) => (
                            <div
                                key={index}
                                className="card-glass group overflow-hidden transition-all hover:ring-2 hover:ring-primary/50"
                            >
                                <VideoWithControls
                                    src={video.videoUrl}
                                    aspectRatio="video"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Sizzle Reels Section */}
            <section className="bg-card/30 py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto mb-16 max-w-3xl text-center">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                            <Video className="h-4 w-4" />
                            Brand Videos
                        </div>
                        <h2 className="mb-6 text-3xl font-bold md:text-4xl">
                            <span className="text-gradient">Sizzle Reels</span>
                        </h2>
                        <p className="text-lg text-foreground/80">
                            Captivate. Inspire. Make Every Second Count.
                        </p>
                    </div>

                    <div className="mx-auto max-w-4xl">
                        <div className="card-glass group overflow-hidden transition-all hover:ring-2 hover:ring-primary/50">
                            <VideoWithControls
                                src="/videos/sizzle-reel.mp4"
                                aspectRatio="video"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Podcast Intro Videos Section */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto mb-16 max-w-3xl text-center">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                            <Video className="h-4 w-4" />
                            Podcast Production
                        </div>
                        <h2 className="mb-6 text-3xl font-bold md:text-4xl">
                            <span className="text-gradient">
                                Podcast Intro Videos
                            </span>
                        </h2>
                        <p className="text-lg text-foreground/80">
                            High-energy intros that set the tone for your show.
                        </p>
                    </div>

                    <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
                        {podcastIntroVideos.map((video, index) => (
                            <div
                                key={index}
                                className="card-glass group overflow-hidden transition-all hover:ring-2 hover:ring-primary/50"
                            >
                                <VideoWithControls
                                    src={video.videoUrl}
                                    aspectRatio="video"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Podcast Teaser Videos Section */}
            <section className="bg-card/30 py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto mb-16 max-w-3xl text-center">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                            <Video className="h-4 w-4" />
                            Short-Form Content
                        </div>
                        <h2 className="mb-6 text-3xl font-bold md:text-4xl">
                            <span className="text-gradient">
                                Podcast Teaser Videos
                            </span>
                        </h2>
                        <p className="text-lg text-foreground/80">
                            Short teasers that drive listeners to your full
                            episodes.
                        </p>
                    </div>

                    <div className="mx-auto flex max-w-4xl flex-col gap-8">
                        {podcastTeaserVideos.map((video, index) => (
                            <div
                                key={index}
                                className="card-glass group overflow-hidden transition-all hover:ring-2 hover:ring-primary/50"
                            >
                                <VideoWithControls
                                    src={video.videoUrl}
                                    aspectRatio="video"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* AEO FAQ Section */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-3xl">
                        <div className="mb-12 text-center">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                                <span className="text-sm font-medium text-primary">
                                    Public Briefing
                                </span>
                            </div>
                            <h2 className="text-3xl font-bold md:text-4xl">
                                Frequently Asked{' '}
                                <span className="text-gradient">Questions</span>
                            </h2>
                        </div>

                        <Accordion
                            type="single"
                            collapsible
                            className="space-y-4"
                        >
                            <AccordionItem
                                value="item-1"
                                className="card-glass px-6"
                            >
                                <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline data-[state=open]:text-primary">
                                    What kind of creative services does
                                    Cynergists offer?
                                </AccordionTrigger>
                                <AccordionContent className="text-base text-foreground/80">
                                    Cynergists provides a full spectrum of
                                    creative and technical services, including
                                    Custom Web Design, Social Media Graphics,
                                    Video Editing, Podcast Production, and
                                    Direct Response Copywriting. These samples
                                    demonstrate our ability to maintain brand
                                    consistency across all media channels.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem
                                value="item-2"
                                className="card-glass px-6"
                            >
                                <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline data-[state=open]:text-primary">
                                    Are these templates or custom work?
                                </AccordionTrigger>
                                <AccordionContent className="text-base text-foreground/80">
                                    Everything you see in our portfolio is
                                    custom-engineered for the specific client.
                                    While we use proven frameworks for
                                    conversion (AEO/SEO best practices), the
                                    design and messaging are tailored to the
                                    unique voice and visual identity of each
                                    national brand we partner with.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem
                                value="item-3"
                                className="card-glass px-6"
                            >
                                <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline data-[state=open]:text-primary">
                                    Can Cynergists match my existing brand
                                    style?
                                </AccordionTrigger>
                                <AccordionContent className="text-base text-foreground/80">
                                    Yes. Our onboarding process includes a
                                    "Brand DNA" extraction where we analyze your
                                    existing assets, color palettes, and voice.
                                    We ensure that every piece of content our
                                    staff creates feels like it came directly
                                    from your headquarters.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem
                                value="item-4"
                                className="card-glass px-6"
                            >
                                <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline data-[state=open]:text-primary">
                                    Do you offer one-off projects or is this
                                    part of a retainer?
                                </AccordionTrigger>
                                <AccordionContent className="text-base text-foreground/80">
                                    Most of the work shown here is produced by
                                    our dedicated team members who work on
                                    monthly retainers. This model ensures you
                                    get consistent, high-quality output without
                                    the high cost of per-project agency fees.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-card/30 py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="mb-6 text-3xl font-bold md:text-4xl">
                            Ready to See What We Can{' '}
                            <span className="text-gradient">Build for You</span>
                            ?
                        </h2>
                        <p className="mb-8 text-lg text-foreground/80">
                            Every project starts with a conversation. Let's
                            discuss your goals and explore how Cynergists can
                            help you scale smarter.
                        </p>
                        <div className="flex flex-col justify-center gap-4 sm:flex-row">
                            <OrbitingButton
                                asChild
                                className="btn-primary px-8 py-6 text-lg"
                            >
                                <Link href="/contact">
                                    Schedule a Conversation
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </OrbitingButton>
                            <Button
                                asChild
                                variant="outline"
                                className="btn-outline px-8 py-6 text-lg"
                            >
                                <Link href="/services/ai-agents">
                                    Explore AI Agents
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default SampleWork;
