import { Bot, Loader2, Paperclip, Send, Mic, Trash2, Square } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useVoiceMode } from "@/hooks/useVoiceMode";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface CynessaChatProps {
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  isStreaming: boolean;
  isUploading: boolean;
  agentDetails: any;
  fileInputRef: React.RefObject<HTMLInputElement>;
  scrollRef: React.RefObject<HTMLDivElement>;
  onSend: (e: React.FormEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileClick: () => void;
  onClearChat?: () => void;
  selectedAgentId?: string | null;
  onMessageReceived?: (message: { role: "user" | "assistant"; content: string }) => void;
}

export function CynessaChat({
  messages,
  input,
  setInput,
  isStreaming,
  isUploading,
  agentDetails,
  fileInputRef,
  scrollRef,
  onSend,
  onFileSelect,
  onFileClick,
  onClearChat,
  selectedAgentId,
  onMessageReceived,
}: CynessaChatProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const processedMessagesRef = useRef(new Set<number>());

  // Voice mode hook
  const {
    isRecording,
    isProcessing,
    isPlaying,
    toggleVoiceMode,
    isVoiceActive,
  } = useVoiceMode({
    agentId: selectedAgentId,
    onTranscriptReceived: (text) => {
      onMessageReceived?.({ role: "user", content: text });
    },
    onResponseReceived: (response) => {
      onMessageReceived?.({ role: "assistant", content: response.text });
    },
  });

  // Automatically speak all of Cynessa's responses
  useEffect(() => {
    const speakLatestMessage = async () => {
      if (!selectedAgentId || messages.length === 0) return;

      // Get the last message
      const lastMessage = messages[messages.length - 1];
      const lastIndex = messages.length - 1;

      // Only speak assistant messages that haven't been processed yet
      if (lastMessage.role === "assistant" && !processedMessagesRef.current.has(lastIndex)) {
        processedMessagesRef.current.add(lastIndex);

        try {
          console.log('[Auto-Voice] Converting Cynessa response to speech:', lastMessage.content.substring(0, 50));
          
          const response = await apiClient.post<{
            success: boolean;
            audio: string | null;
            error?: string;
          }>(`/api/portal/voice/${selectedAgentId}`, {
            message: lastMessage.content,
            textOnly: true, // Flag to indicate we're just converting text to speech
          });

          if (response.success && response.audio) {
            console.log('[Auto-Voice] Playing audio response');
            await playAudio(response.audio);
          } else if (response.error) {
            console.warn('[Auto-Voice] No audio:', response.error);
          }
        } catch (error) {
          console.error('[Auto-Voice] Failed to convert text to speech:', error);
        }
      }
    };

    speakLatestMessage();
  }, [messages, selectedAgentId]);

  // Play audio from base64
  const playAudio = async (base64Audio: string): Promise<void> => {
    try {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // Convert base64 to blob
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(blob);

      // Create and play audio element
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };
      audioRef.current.onerror = (e) => {
        console.error('[Auto-Voice] Audio playback error:', e);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      await audioRef.current.play();
    } catch (error) {
      console.error('[Auto-Voice] Failed to play audio:', error);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <>
      {/* Messages */}
      <ScrollArea className="flex-1 max-h-[600px] px-4 py-3" ref={scrollRef}>
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground animate-in fade-in duration-300">
              Start the conversation with {agentDetails?.agent_name ?? "your agent"}.
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={cn(
                  "flex gap-3 animate-in slide-in-from-bottom-2 fade-in duration-300",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {message.role === "assistant" && agentDetails?.avatar_url && (
                  <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 ring-2 ring-accent-purple/40">
                    <img
                      src={agentDetails.avatar_url}
                      alt={agentDetails.agent_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-0.5">
                  <Card
                    className={cn(
                      "max-w-[380px] rounded-xl px-3 py-2 text-foreground transition-all duration-200 hover:shadow-md",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-surface-2 border border-primary/10 rounded-bl-sm"
                    )}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</p>
                  </Card>
                  <span className="text-[10px] text-muted-foreground/60 px-1 text-left">
                    {new Date().toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
          {isStreaming && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground animate-in fade-in duration-300">
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking...
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="px-4 pt-3 pb-3 bg-card rounded-xl">
        <form onSubmit={onSend}>
          <div className="flex gap-2 items-end">
            <input
              ref={fileInputRef}
              type="file"
              onChange={onFileSelect}
              accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.svg,.webp,.mp4,.mov,.avi"
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={isUploading}
              onClick={onFileClick}
              className="h-10 w-10 rounded-lg shrink-0"
              title="Upload file"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Paperclip className="w-4 h-4" />
              )}
            </Button>
            <Textarea
              value={input}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)}
              placeholder="Type your message..."
              disabled={isStreaming}
              className="flex-1 min-h-[40px] max-h-[100px] bg-background border-primary/15 text-sm px-3 py-2 rounded-lg focus:border-primary/40 focus:ring-primary/20 resize-none"
              rows={1}
              onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend(e as unknown as React.FormEvent);
                }
              }}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="h-10 w-10 rounded-lg shrink-0 bg-primary hover:bg-primary-hover shadow-glow-primary"
            >
              {isStreaming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-7 px-3 text-xs gap-1.5 rounded-button border-border-strong",
              isVoiceActive
                ? "bg-primary/20 border-primary hover:bg-primary/30"
                : "hover:bg-primary/10 hover:border-primary/40"
            )}
            onClick={toggleVoiceMode}
            disabled={!selectedAgentId}
          >
            {isRecording ? (
              <>
                <Square className="w-3 h-3 animate-pulse" />
                Recording...
              </>
            ) : isProcessing ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Processing...
              </>
            ) : isPlaying ? (
              <>
                <Square className="w-3 h-3 animate-pulse" />
                Playing...
              </>
            ) : (
              <>
                <Mic className="w-3 h-3" />
                Voice Mode
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-3 text-xs gap-1.5 rounded-button border-border-strong hover:bg-primary/10 hover:border-primary/40"
            onClick={onClearChat}
            disabled={!selectedAgentId || messages.length === 0}
          >
            <Trash2 className="w-3 h-3" />
            Clear Chat
          </Button>
        </div>
      </div>
    </>
  );
}
