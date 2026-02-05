import bradMayThumb from '@/assets/testimonials/brad-may-thumbnail.webp';
import marquesOgdenThumb from '@/assets/testimonials/marques-ogden-thumbnail.webp';
import { OrbitingButton } from '@/components/ui/orbiting-button';
import { Link } from '@inertiajs/react';
import { ArrowRight, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const testimonials = [
    {
        name: 'Marques Ogden',
        role: 'Former NFL Player & Keynote Speaker',
        thumbnail: marquesOgdenThumb,
        videoSrc: '/videos/testimonial-marques-ogden.mp4',
    },
    {
        name: 'Brad May',
        role: 'Owner, JM Auto Repair',
        thumbnail: bradMayThumb,
        videoSrc: '/videos/testimonial-brad-may.mp4',
    },
];

const TestimonialCard = ({
    testimonial,
}: {
    testimonial: (typeof testimonials)[0];
}) => {
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [hasUnmuted, setHasUnmuted] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Intersection Observer for auto-play on scroll
    useEffect(() => {
        const video = videoRef.current;
        const container = containerRef.current;
        if (!video || !container) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // Video is in view - play it
                        video.play().catch(() => {
                            // Autoplay might be blocked, that's okay
                        });
                        setIsPlaying(true);
                    } else {
                        // Video is out of view - pause it
                        video.pause();
                        setIsPlaying(false);
                    }
                });
            },
            {
                threshold: 0.5, // Trigger when 50% of the video is visible
                rootMargin: '0px',
            },
        );

        observer.observe(container);

        return () => {
            observer.disconnect();
        };
    }, []);

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (videoRef.current) {
            if (isMuted) {
                // Unmute and restart video, disable loop
                videoRef.current.muted = false;
                videoRef.current.loop = false;
                videoRef.current.currentTime = 0;
                videoRef.current.play();
                setIsPlaying(true);
                setHasUnmuted(true);
            } else {
                videoRef.current.muted = true;
            }
            setIsMuted(!isMuted);
        }
    };

    const handleVideoEnd = () => {
        if (hasUnmuted) {
            setIsPlaying(false);
        }
    };

    return (
        <div ref={containerRef} className="card-glass relative overflow-hidden">
            <div className="relative aspect-[9/16] overflow-hidden rounded-lg bg-background/50">
                <video
                    ref={videoRef}
                    src={testimonial.videoSrc}
                    poster={testimonial.thumbnail}
                    className="h-full w-full object-cover"
                    onEnded={handleVideoEnd}
                    playsInline
                    autoPlay
                    muted
                    loop={!hasUnmuted}
                />

                {/* Video Controls */}
                <div className="absolute top-3 right-3 z-10 flex gap-2">
                    <button
                        onClick={togglePlay}
                        className="rounded-full border border-border/50 bg-background/50 p-2 text-foreground backdrop-blur-sm transition-colors hover:bg-background/70"
                        aria-label={isPlaying ? 'Pause video' : 'Play video'}
                    >
                        {isPlaying ? (
                            <Pause className="h-4 w-4" />
                        ) : (
                            <Play className="h-4 w-4" />
                        )}
                    </button>
                    <button
                        onClick={toggleMute}
                        className="rounded-full border border-border/50 bg-background/50 p-2 text-foreground backdrop-blur-sm transition-colors hover:bg-background/70"
                        aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                    >
                        {isMuted ? (
                            <VolumeX className="h-4 w-4" />
                        ) : (
                            <Volume2 className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </div>

            {/* Author Info */}
            <div className="mt-4 text-center">
                <div className="font-semibold text-foreground">
                    {testimonial.name}
                </div>
                <div className="text-sm text-muted-foreground">
                    {testimonial.role}
                </div>
            </div>
        </div>
    );
};

const TestimonialsSection = () => {
    return (
        <section className="bg-background py-24 dark:bg-background">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-16 text-center">
                    <h2 className="font-display mb-4 text-3xl font-bold text-foreground md:text-4xl">
                        Real Results From{' '}
                        <span className="text-gradient">
                            Real Organizations
                        </span>
                    </h2>
                    <h3 className="mb-4 text-xl font-medium text-muted-foreground md:text-2xl">
                        See how teams are removing execution bottlenecks and
                        scaling output
                    </h3>
                    <p className="mx-auto max-w-2xl text-muted-foreground">
                        These organizations were not short on talent. They were
                        constrained by fragmented systems, manual handoffs, and
                        workflows that slowed execution as they scaled.
                    </p>
                </div>

                {/* Testimonials Grid - 2 columns centered */}
                <div className="mx-auto mb-12 grid max-w-3xl gap-8 md:grid-cols-2">
                    {testimonials.map((testimonial) => (
                        <TestimonialCard
                            key={testimonial.name}
                            testimonial={testimonial}
                        />
                    ))}
                </div>

                {/* CTA Button */}
                <div className="text-center">
                    <OrbitingButton
                        asChild
                        className="btn-primary group px-8 py-6 text-lg"
                    >
                        <Link href="/marketplace">
                            Deploy Your Team
                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </OrbitingButton>
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
