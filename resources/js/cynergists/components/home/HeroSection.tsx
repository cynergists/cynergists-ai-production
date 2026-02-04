import { OrbitingButton } from '@/components/ui/orbiting-button';

import { Link } from '@inertiajs/react';
import { ArrowRight, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const HeroSection = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);

    useEffect(() => {
        // Autoplay on mount
        if (videoRef.current) {
            videoRef.current.play();
        }
    }, []);

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
            if (isMuted) {
                // Unmuting: restart video and stop looping
                videoRef.current.muted = false;
                videoRef.current.loop = false;
                videoRef.current.currentTime = 0;
                videoRef.current.play();
                setIsPlaying(true);
            } else {
                // Muting: resume looping
                videoRef.current.muted = true;
                videoRef.current.loop = true;
            }
            setIsMuted(!isMuted);
        }
    };

    const handleVideoEnded = () => {
        setIsPlaying(false);
    };

    return (
        <section className="gradient-hero relative flex min-h-[90vh] items-center overflow-hidden py-8">
            {/* Background Effects - Dark Mode */}
            <div className="absolute inset-0 hidden overflow-hidden dark:block">
                <div className="absolute top-1/4 -right-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute bottom-1/4 -left-20 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
                <div className="bg-gradient-radial absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full from-primary/5 to-transparent" />
            </div>

            {/* Background Effects - Light Mode Gradient Bursts */}
            <div className="absolute inset-0 block overflow-hidden dark:hidden">
                <div className="absolute top-[10%] left-[15%] h-[400px] w-[400px] rounded-full bg-white/60 blur-[80px]" />
                <div className="absolute top-[5%] right-[20%] h-[300px] w-[300px] rounded-full bg-white/50 blur-[60px]" />
                <div className="absolute bottom-[20%] left-[40%] h-[350px] w-[350px] rounded-full bg-white/40 blur-[70px]" />
                <div className="absolute right-[10%] bottom-[10%] h-[250px] w-[250px] rounded-full bg-white/35 blur-[50px]" />
                <div className="absolute top-[40%] left-[5%] h-[200px] w-[200px] rounded-full bg-white/30 blur-[40px]" />
            </div>

            <div className="relative z-10 container mx-auto px-4">
                <div className="grid items-center gap-12 lg:grid-cols-2">
                    {/* Text Content */}
                    <div className="animate-fade-in text-center lg:text-left">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                            <span className="text-sm font-medium text-primary">
                                Mission Ready AI
                            </span>
                        </div>

                        <h1 className="font-display mb-4 text-4xl leading-tight font-bold text-foreground md:text-5xl lg:text-6xl">
                            AI Agents That Assemble Like a{' '}
                            <span className="text-gradient">
                                Superpowered Team
                            </span>
                        </h1>

                        <h2 className="mb-6 text-xl font-semibold text-foreground/90 md:text-2xl lg:text-3xl">
                            Each One Built to Operate Independently and Win
                            Together
                        </h2>

                        <p className="mb-8 font-sans text-lg leading-relaxed text-muted-foreground md:text-xl lg:text-2xl">
                            Cynergists designs, deploys, and manages AI Agents
                            that take full ownership of revenue, operations, and
                            internal workflows. Backed by expert human oversight
                            to ensure precision and safety.
                        </p>

                        <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                            <OrbitingButton
                                asChild
                                className="btn-primary group px-8 py-6 text-lg"
                            >
                                <Link href="/marketplace">
                                    Assemble Your Team
                                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </OrbitingButton>
                        </div>
                    </div>

                    {/* Video */}
                    <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-primary via-primary/60 to-emerald-400 p-[20px] shadow-2xl">
                        <div className="relative h-full w-full overflow-hidden rounded-lg">
                            <video
                                ref={videoRef}
                                src="/videos/cynergists-hero.mp4"
                                className="h-full w-full object-cover"
                                muted={isMuted}
                                loop={isMuted}
                                playsInline
                                autoPlay
                                onEnded={handleVideoEnded}
                            />

                            {/* Video Controls - Top Right */}
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button
                                    onClick={togglePlay}
                                    className="rounded-full bg-background/80 p-2 backdrop-blur-sm transition-colors hover:bg-background"
                                    aria-label={isPlaying ? 'Pause' : 'Play'}
                                >
                                    {isPlaying ? (
                                        <Pause className="h-5 w-5 text-foreground" />
                                    ) : (
                                        <Play className="h-5 w-5 text-foreground" />
                                    )}
                                </button>
                                <button
                                    onClick={toggleMute}
                                    className="rounded-full bg-background/80 p-2 backdrop-blur-sm transition-colors hover:bg-background"
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
    );
};

export default HeroSection;
