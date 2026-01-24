import { OrbitingButton } from "@/components/ui/orbiting-button";

import { ArrowRight, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Link } from "@inertiajs/react";
import { useRef, useState, useEffect } from "react";

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
    <section className="relative min-h-[90vh] flex items-center overflow-hidden gradient-hero py-8">
      {/* Background Effects - Dark Mode */}
      <div className="absolute inset-0 overflow-hidden dark:block hidden">
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
      </div>
      
      {/* Background Effects - Light Mode Gradient Bursts */}
      <div className="absolute inset-0 overflow-hidden dark:hidden block">
        <div className="absolute top-[10%] left-[15%] w-[400px] h-[400px] bg-white/60 rounded-full blur-[80px]" />
        <div className="absolute top-[5%] right-[20%] w-[300px] h-[300px] bg-white/50 rounded-full blur-[60px]" />
        <div className="absolute bottom-[20%] left-[40%] w-[350px] h-[350px] bg-white/40 rounded-full blur-[70px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[250px] h-[250px] bg-white/35 rounded-full blur-[50px]" />
        <div className="absolute top-[40%] left-[5%] w-[200px] h-[200px] bg-white/30 rounded-full blur-[40px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
              <span className="text-sm text-primary font-medium">Mission Ready AI</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-tight">
              AI Agents That Assemble Like a{" "}
              <span className="text-gradient">Superpowered Team</span>
            </h1>
            
            <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground/90 mb-6">
              Each One Built to Operate Independently and Win Together
            </h2>
            
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 leading-relaxed font-sans">
              Cynergists designs, deploys, and manages AI Agents that take full ownership of revenue, operations, and internal workflows. Backed by expert human oversight to ensure precision and safety.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <OrbitingButton asChild className="btn-primary group text-lg px-8 py-6">
                <Link href="/marketplace">
                  Assemble Your Team
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </OrbitingButton>
            </div>
          </div>

          {/* Video */}
          <div className="relative aspect-square rounded-2xl p-[20px] bg-gradient-to-br from-primary via-primary/60 to-emerald-400 shadow-2xl">
            <div className="relative w-full h-full rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                src="/videos/cynergists-hero.mp4"
                className="w-full h-full object-cover"
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
                  className="p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5 text-foreground" />
                  ) : (
                    <Play className="h-5 w-5 text-foreground" />
                  )}
                </button>
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                  aria-label={isMuted ? "Unmute" : "Mute"}
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
