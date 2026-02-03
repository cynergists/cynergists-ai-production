import { Bot, Loader2, Paperclip, Send, Mic, Trash2 } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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
}: CynessaChatProps) {
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
            className="h-7 px-3 text-xs gap-1.5 rounded-button border-border-strong hover:bg-primary/10 hover:border-primary/40"
            disabled={!selectedAgentId}
          >
            <Mic className="w-3 h-3" />
            Voice Mode
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
