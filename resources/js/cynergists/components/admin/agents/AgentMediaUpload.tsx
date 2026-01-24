import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, X, Bot, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface MediaItem {
  url: string;
  type: "image" | "video";
}

interface AgentMediaUploadProps {
  media: MediaItem[];
  onChange: (media: MediaItem[]) => void;
  agentName?: string;
}

export function AgentMediaUpload({ media, onChange, agentName }: AgentMediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateAndUpload = async (file: File) => {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      toast({
        title: "Invalid file type",
        description: "Please select an image or video file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 50MB for videos, 5MB for images)
    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `Please select a file under ${isVideo ? "50MB" : "5MB"}.`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `agents/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("plan-product-images")
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("plan-product-images")
        .getPublicUrl(data.path);

      const newMedia: MediaItem = {
        url: urlData.publicUrl,
        type: isVideo ? "video" : "image",
      };

      onChange([...media, newMedia]);
      setCurrentIndex(media.length);
      
      toast({
        title: "File uploaded",
        description: `Your ${isVideo ? "video" : "image"} has been uploaded successfully.`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    for (let i = 0; i < files.length; i++) {
      await validateAndUpload(files[i]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (!files) return;
    
    for (let i = 0; i < files.length; i++) {
      await validateAndUpload(files[i]);
    }
  };

  const handleRemove = (index: number) => {
    const newMedia = media.filter((_, i) => i !== index);
    onChange(newMedia);
    if (currentIndex >= newMedia.length) {
      setCurrentIndex(Math.max(0, newMedia.length - 1));
    }
  };

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1));
  }, [media.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0));
  }, [media.length]);

  const currentMedia = media[currentIndex];

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "relative aspect-video rounded-2xl overflow-hidden border-2 transition-colors cursor-pointer",
          isDragging 
            ? "border-primary bg-primary/10 border-dashed" 
            : media.length === 0 
              ? "border-dashed border-border/50 bg-card/50 hover:border-primary/50" 
              : "border-border/50 bg-card/50"
        )}
        onClick={() => !media.length && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </div>
        ) : currentMedia ? (
          <>
            {currentMedia.type === "video" ? (
              <video
                src={currentMedia.url}
                className="w-full h-full object-cover"
                controls
              />
            ) : (
              <img
                src={currentMedia.url}
                alt={agentName || "AI Agent"}
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Remove button */}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(currentIndex);
              }}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Navigation arrows */}
            {media.length > 1 && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 opacity-80 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 opacity-80 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Dot indicators */}
            {media.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {media.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      index === currentIndex 
                        ? "bg-white" 
                        : "bg-white/50 hover:bg-white/75"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(index);
                    }}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div 
            className="flex flex-col items-center justify-center h-full p-8"
          >
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 mb-3">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">AI Agent Media</p>
            <p className="text-xs text-muted-foreground">
              {isDragging ? "Drop files here" : "Drop images or videos here, or click to upload"}
            </p>
          </div>
        )}
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {media.length > 0 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          Add More Media
        </Button>
      )}
    </div>
  );
}
