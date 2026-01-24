import { useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface VideoWithControlsProps {
  src: string;
  className?: string;
  aspectRatio?: "video" | "square" | "portrait";
  onClick?: () => void;
}

const VideoWithControls = ({ src, className = "", aspectRatio = "video", onClick }: VideoWithControlsProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [hasUnmuted, setHasUnmuted] = useState(false);

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

  const handleVideoEnded = () => {
    if (hasUnmuted) {
      setIsPlaying(false);
    }
  };

  const aspectClasses = {
    video: "aspect-video",
    square: "aspect-square",
    portrait: "aspect-[9/16]"
  };

  return (
    <div className={`relative ${aspectClasses[aspectRatio]} rounded-lg overflow-hidden ${className}`} onClick={onClick}>
      <video
        ref={videoRef}
        autoPlay
        muted
        loop={!hasUnmuted}
        playsInline
        onEnded={handleVideoEnded}
        className="w-full h-full object-cover"
      >
        <source src={src} type="video/mp4" />
      </video>
      
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
  );
};

export default VideoWithControls;
