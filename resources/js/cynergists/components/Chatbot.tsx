import { useState, useRef, useEffect, useCallback } from "react";
import { usePage } from "@inertiajs/react";
import { X, Send, Mic, MicOff, Volume2, VolumeX, MessageCircle, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import cynessaHeadshot from "@/assets/cynessa-headshot.webp";
import DOMPurify from "dompurify";

const CHATBOT_HIDDEN_KEY = "cynessa-chatbot-hidden";

// Extend Window interface for speech recognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

type Message = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

// Sanitize text content to prevent XSS
const sanitizeContent = (content: string): string => {
  // First sanitize with DOMPurify to remove any HTML/script tags
  const sanitized = DOMPurify.sanitize(content, { 
    ALLOWED_TAGS: [], // Strip all HTML tags
    ALLOWED_ATTR: [] // Strip all attributes
  });
  return sanitized;
};

// Escape user input before sending to AI to prevent prompt injection
const escapeUserInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

const Chatbot = () => {
  const { url } = usePage();
  const pathname = url.split("?")[0];
  const isCheckoutPage = pathname === "/checkout";
  
  // Initialize hidden state from localStorage or default to hidden on checkout
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false); // Shows bubble icon when true
  const [isHidden, setIsHidden] = useState(() => {
    // Check localStorage first
    const savedHidden = localStorage.getItem(CHATBOT_HIDDEN_KEY);
    if (savedHidden !== null) {
      return savedHidden === "true";
    }
    // Default to hidden on checkout page
    return isCheckoutPage;
  });
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm Cynessa, your Cynergists assistant. How can I help you learn about our services today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const { toast } = useToast();

  // Persist hidden state to localStorage and auto-hide on checkout
  useEffect(() => {
    // If user explicitly set hidden state (stored in localStorage), respect it
    const savedHidden = localStorage.getItem(CHATBOT_HIDDEN_KEY);
    if (savedHidden === null && isCheckoutPage) {
      // No user preference saved and on checkout - auto-hide
      setIsHidden(true);
    }
  }, [isCheckoutPage]);

  // Save hidden state to localStorage whenever it changes (user action)
  const handleSetHidden = (hidden: boolean) => {
    setIsHidden(hidden);
    localStorage.setItem(CHATBOT_HIDDEN_KEY, String(hidden));
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    const win = window as typeof window & {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
    
    if (SpeechRecognitionClass) {
      recognitionRef.current = new SpeechRecognitionClass();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice Error",
          description: "Could not recognize speech. Please try again.",
          variant: "destructive",
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [toast]);

  // Handle touch events for swipe-to-hide on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const deltaX = e.touches[0].clientX - touchStartRef.current.x;
    const deltaY = Math.abs(e.touches[0].clientY - touchStartRef.current.y);
    
    // Only allow horizontal swipe (right direction) with some tolerance
    if (deltaX > 0 && deltaX > deltaY) {
      setSwipeOffset(deltaX);
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    
    // If swiped more than 100px, hide the chatbot
    if (swipeOffset > 100) {
      setIsOpen(false);
      setIsMinimized(true);
      setSwipeOffset(0);
    } else {
      // Animate back to original position
      setSwipeOffset(0);
    }
    
    touchStartRef.current = null;
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Not Supported",
        description: "Voice input is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakText = useCallback((text: string) => {
    if (!speechEnabled || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    
    // Sanitize text before speaking
    const sanitizedText = sanitizeContent(text);
    const utterance = new SpeechSynthesisUtterance(sanitizedText);
    utterance.rate = 1;
    utterance.pitch = 1.1;
    utterance.volume = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  }, [speechEnabled]);

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    // Validate input length
    if (text.length > 2000) {
      toast({
        title: "Message too long",
        description: "Please keep your message under 2000 characters.",
        variant: "destructive",
      });
      return;
    }

    // Escape user input before adding to messages
    const escapedText = escapeUserInput(text);
    const userMsg: Message = { role: "user", content: escapedText };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get response");
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              // Sanitize AI-generated content before displaying
              const sanitizedContent = sanitizeContent(content);
              assistantContent += sanitizedContent;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: assistantContent };
                return updated;
              });
            }
          } catch {
            // Incomplete JSON, continue
          }
        }
      }

      if (assistantContent && speechEnabled) {
        speakText(assistantContent);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to send message. Please try again.",
        variant: "destructive",
      });
      setMessages(prev => {
        if (prev[prev.length - 1]?.content === "") {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Hidden State - Show Button to Reveal (positioned where chatbot would be) */}
      {isHidden && (
        <button
          onClick={() => handleSetHidden(false)}
          className="fixed bottom-6 right-6 z-50 px-3 py-1.5 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-md shadow-sm flex items-center gap-1.5 transition-all hover:scale-105 text-xs text-primary"
          aria-label="Show Cynessa"
        >
          <MessageCircle className="h-3 w-3" />
          <span>Show Chat</span>
        </button>
      )}

      {/* Minimized State - Message Bubble */}
      {!isHidden && isMinimized && !isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
          {/* Hide button on the left of bubble */}
          <button
            onClick={() => {
              handleSetHidden(true);
              setIsMinimized(false);
            }}
            className="px-2 py-1 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded text-xs text-primary flex items-center gap-1 transition-all"
            aria-label="Hide Cynessa"
          >
            <EyeOff className="h-3 w-3" />
            <span>Hide</span>
          </button>
          <button
            onClick={() => setIsMinimized(false)}
            className="w-14 h-14 bg-primary hover:bg-primary/90 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
            aria-label="Open chat with Cynessa"
          >
            <MessageCircle className="h-6 w-6 text-primary-foreground" />
          </button>
        </div>
      )}

      {/* Default State - Cynessa's Face */}
      {!isHidden && !isMinimized && !isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsOpen(true)}
            className="group"
            aria-label="Chat with Cynessa"
          >
            <div className="relative">
              <img 
                src={cynessaHeadshot} 
                alt="Cynessa - Your Cynergists Assistant" 
                className="w-[120px] h-[120px] rounded-full object-cover object-top border-2 border-primary shadow-lg transition-all group-hover:scale-105 group-hover:border-primary/80"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md">
                <MessageCircle className="h-3 w-3 text-primary-foreground" />
              </div>
            </div>
            <span className="absolute -top-8 right-0 bg-background/90 border border-border/50 text-foreground text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md">
              Chat with Cynessa
            </span>
          </button>
          {/* Hide button on bottom left of Cynessa */}
          <button
            onClick={() => {
              handleSetHidden(true);
            }}
            className="absolute -bottom-1 -left-1 px-2 py-1 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded text-xs text-primary flex items-center gap-1 transition-all shadow-md"
            aria-label="Hide Cynessa"
          >
            <EyeOff className="h-3 w-3" />
            <span>Hide</span>
          </button>
        </div>
      )}

      {/* Chat Window */}
      {!isHidden && isOpen && (
        <div 
          className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[520px] max-h-[calc(100vh-6rem)] bg-background border border-border/30 rounded-xl shadow-2xl flex flex-col animate-fade-in touch-pan-y"
          style={{
            transform: `translateX(${swipeOffset}px)`,
            transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
            opacity: swipeOffset > 0 ? Math.max(0.3, 1 - swipeOffset / 200) : 1
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Swipe hint for mobile */}
          {swipeOffset > 20 && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-xl z-10 pointer-events-none">
              <div className="text-center">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Swipe right to minimize</p>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/30 bg-gradient-to-r from-primary/10 to-secondary/10">
            <div className="flex items-center gap-3">
              <img 
                src={cynessaHeadshot} 
                alt="Cynessa" 
                className="w-10 h-10 rounded-full object-cover object-top border border-primary/50"
              />
              <div>
                <h3 className="text-sm font-semibold text-foreground">Cynessa</h3>
                <p className="text-xs text-muted-foreground">
                  {isSpeaking ? "Speaking..." : 
                   isListening ? "Listening..." :
                   isLoading ? "Thinking..." : 
                   "Your Cynergists Assistant"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSpeechEnabled(!speechEnabled)}
                className="h-8 w-8 p-0"
                aria-label={speechEnabled ? "Disable voice responses" : "Enable voice responses"}
              >
                {speechEnabled ? (
                  <Volume2 className="h-4 w-4 text-primary" />
                ) : (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsOpen(false);
                  setIsMinimized(true);
                }}
                className="h-8 w-8 p-0"
                aria-label="Minimize to bubble"
                title="Minimize"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-4 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {msg.content || (isLoading && i === messages.length - 1 ? (
                      <span className="flex items-center gap-1">
                        <span className="animate-pulse">●</span>
                        <span className="animate-pulse" style={{ animationDelay: "150ms" }}>●</span>
                        <span className="animate-pulse" style={{ animationDelay: "300ms" }}>●</span>
                      </span>
                    ) : "")}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Speaking indicator */}
          {isSpeaking && (
            <div className="px-4 py-2 bg-primary/10 border-t border-border/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1 h-3 bg-primary rounded-full animate-soundwave" style={{ animationDelay: "0ms" }} />
                  <div className="w-1 h-3 bg-primary rounded-full animate-soundwave" style={{ animationDelay: "150ms" }} />
                  <div className="w-1 h-3 bg-primary rounded-full animate-soundwave" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-xs text-primary">Cynessa is speaking...</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={stopSpeaking}
                className="h-6 text-xs"
              >
                Stop
              </Button>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border/30">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleListening}
                className={`h-10 w-10 p-0 shrink-0 ${isListening ? "bg-cyan-500/20 text-cyan-400 animate-pulse" : ""}`}
                aria-label={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "Listening..." : "Ask Cynessa anything..."}
                disabled={isLoading || isListening}
                maxLength={2000}
                className="flex-1"
              />
              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                size="sm"
                className="h-10 w-10 p-0 shrink-0"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
