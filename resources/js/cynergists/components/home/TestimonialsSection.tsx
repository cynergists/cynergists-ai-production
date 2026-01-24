import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, ArrowRight } from "lucide-react";
import { Link } from "@inertiajs/react";
import { OrbitingButton } from "@/components/ui/orbiting-button";
import marquesOgdenThumb from "@/assets/testimonials/marques-ogden-thumbnail.webp";
import bradMayThumb from "@/assets/testimonials/brad-may-thumbnail.webp";

const testimonials = [
  {
    name: "Marques Ogden",
    role: "Former NFL Player & Keynote Speaker",
    thumbnail: marquesOgdenThumb,
    videoSrc: "/videos/testimonial-marques-ogden.mp4",
  },
  {
    name: "Brad May",
    role: "Owner, JM Auto Repair",
    thumbnail: bradMayThumb,
    videoSrc: "/videos/testimonial-brad-may.mp4",
  },
];

const TestimonialCard = ({ testimonial }: { testimonial: typeof testimonials[0] }) => {
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
        rootMargin: "0px",
      }
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
      <div className="relative aspect-[9/16] rounded-lg overflow-hidden bg-background/50">
        <video
          ref={videoRef}
          src={testimonial.videoSrc}
          poster={testimonial.thumbnail}
          className="w-full h-full object-cover"
          onEnded={handleVideoEnd}
          playsInline
          autoPlay
          muted
          loop={!hasUnmuted}
        />
        
        {/* Video Controls */}
        <div className="absolute top-3 right-3 flex gap-2 z-10">
          <button
            onClick={togglePlay}
            className="p-2 rounded-full bg-background/50 backdrop-blur-sm border border-border/50 text-foreground hover:bg-background/70 transition-colors"
            aria-label={isPlaying ? "Pause video" : "Play video"}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            onClick={toggleMute}
            className="p-2 rounded-full bg-background/50 backdrop-blur-sm border border-border/50 text-foreground hover:bg-background/70 transition-colors"
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
      
      {/* Author Info */}
      <div className="mt-4 text-center">
        <div className="font-semibold text-foreground">{testimonial.name}</div>
        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
      </div>
    </div>
  );
};

const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-background dark:bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Real Results From{" "}
            <span className="text-gradient">Real Organizations</span>
          </h2>
          <h3 className="text-xl md:text-2xl text-muted-foreground font-medium mb-4">
            See how teams are removing execution bottlenecks and scaling output
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            These organizations were not short on talent. They were constrained by fragmented systems, manual handoffs, and workflows that slowed execution as they scaled.
          </p>
        </div>

        {/* Testimonials Grid - 2 columns centered */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-12">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} />
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <OrbitingButton asChild className="btn-primary group text-lg px-8 py-6">
            <Link href="/marketplace">
              Deploy Your Team
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </OrbitingButton>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
