import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useRef, useState } from 'react';

interface VideoWithControlsProps {
    src: string;
    className?: string;
    aspectRatio?: 'video' | 'square' | 'portrait';
    onClick?: () => void;
}

const VideoWithControls = ({
    src,
    className = '',
    aspectRatio = 'video',
    onClick,
}: VideoWithControlsProps) => {
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
        video: 'aspect-video',
        square: 'aspect-square',
        portrait: 'aspect-[9/16]',
    };

    return (
        <div
            className={`relative ${aspectClasses[aspectRatio]} overflow-hidden rounded-lg ${className}`}
            onClick={onClick}
        >
            <video
                ref={videoRef}
                autoPlay
                muted
                loop={!hasUnmuted}
                playsInline
                onEnded={handleVideoEnded}
                className="h-full w-full object-cover"
            >
                <source src={src} type="video/mp4" />
            </video>

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
    );
};

export default VideoWithControls;
