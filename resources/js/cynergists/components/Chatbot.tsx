import cynessaHeadshot from '@/assets/cynessa-headshot.webp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { usePage } from '@inertiajs/react';
import DOMPurify from 'dompurify';
import {
    EyeOff,
    MessageCircle,
    Mic,
    MicOff,
    Send,
    Volume2,
    VolumeX,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const CHATBOT_HIDDEN_KEY = 'cynessa-chatbot-hidden';

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

type Message = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = '/api/chat';

// Sanitize text content to prevent XSS
const sanitizeContent = (content: string): string => {
    // First sanitize with DOMPurify to remove any HTML/script tags
    const sanitized = DOMPurify.sanitize(content, {
        ALLOWED_TAGS: [], // Strip all HTML tags
        ALLOWED_ATTR: [], // Strip all attributes
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
    const pathname = url.split('?')[0];
    const isCheckoutPage = pathname === '/checkout';
    const isPortalPage = pathname.startsWith('/portal');

    // Don't show public chatbot on portal pages (portal has its own chat)
    if (isPortalPage) {
        return null;
    }

    // Initialize hidden state from localStorage or default to hidden on checkout
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false); // Shows bubble icon when true
    const [isHidden, setIsHidden] = useState(() => {
        // Check localStorage first
        const savedHidden = localStorage.getItem(CHATBOT_HIDDEN_KEY);
        if (savedHidden !== null) {
            return savedHidden === 'true';
        }
        // Default to hidden on checkout page
        return isCheckoutPage;
    });
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content:
                "Hi! I'm Cynessa, your Cynergists assistant. How can I help you learn about our services today?",
        },
    ]);
    const [input, setInput] = useState('');
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
            const scrollContainer = scrollAreaRef.current.querySelector(
                '[data-radix-scroll-area-viewport]',
            );
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

        const SpeechRecognitionClass =
            win.SpeechRecognition || win.webkitSpeechRecognition;

        if (SpeechRecognitionClass) {
            recognitionRef.current = new SpeechRecognitionClass();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (
                event: SpeechRecognitionEvent,
            ) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = () => {
                setIsListening(false);
                toast({
                    title: 'Voice Error',
                    description:
                        'Could not recognize speech. Please try again.',
                    variant: 'destructive',
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
            y: e.touches[0].clientY,
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
                title: 'Not Supported',
                description: 'Voice input is not supported in your browser.',
                variant: 'destructive',
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

    const speakText = useCallback(
        (text: string) => {
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
        },
        [speechEnabled],
    );

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
                title: 'Message too long',
                description: 'Please keep your message under 2000 characters.',
                variant: 'destructive',
            });
            return;
        }

        // Escape user input before adding to messages
        const escapedText = escapeUserInput(text);
        const userMsg: Message = { role: 'user', content: escapedText };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        let assistantContent = '';

        try {
            const resp = await fetch(CHAT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ messages: [...messages, userMsg] }),
            });

            if (!resp.ok) {
                const errorData = await resp.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to get response');
            }

            const data = await resp.json();
            assistantContent = sanitizeContent(data.content || 'Sorry, I could not generate a response.');

            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: assistantContent },
            ]);

            if (assistantContent && speechEnabled) {
                speakText(assistantContent);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Unable to send message. Please try again.',
                variant: 'destructive',
            });
            setMessages((prev) => {
                if (prev[prev.length - 1]?.content === '') {
                    return prev.slice(0, -1);
                }
                return prev;
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
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
                    className="fixed right-6 bottom-6 z-50 flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/20 px-3 py-1.5 text-xs text-primary shadow-sm transition-all hover:scale-105 hover:bg-primary/30"
                    aria-label="Show Cynessa"
                >
                    <MessageCircle className="h-3 w-3" />
                    <span>Show Chat</span>
                </button>
            )}

            {/* Minimized State - Message Bubble */}
            {!isHidden && isMinimized && !isOpen && (
                <div className="fixed right-6 bottom-6 z-50 flex items-center gap-2">
                    {/* Hide button on the left of bubble */}
                    <button
                        onClick={() => {
                            handleSetHidden(true);
                            setIsMinimized(false);
                        }}
                        className="flex items-center gap-1 rounded border border-primary/30 bg-primary/20 px-2 py-1 text-xs text-primary transition-all hover:bg-primary/30"
                        aria-label="Hide Cynessa"
                    >
                        <EyeOff className="h-3 w-3" />
                        <span>Hide</span>
                    </button>
                    <button
                        onClick={() => setIsMinimized(false)}
                        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg transition-all hover:scale-105 hover:bg-primary/90"
                        aria-label="Open chat with Cynessa"
                    >
                        <MessageCircle className="h-6 w-6 text-primary-foreground" />
                    </button>
                </div>
            )}

            {/* Default State - Cynessa's Face */}
            {!isHidden && !isMinimized && !isOpen && (
                <div className="fixed right-6 bottom-6 z-50">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="group"
                        aria-label="Chat with Cynessa"
                    >
                        <div className="relative">
                            <img
                                src={cynessaHeadshot}
                                alt="Cynessa - Your Cynergists Assistant"
                                className="h-[120px] w-[120px] rounded-full border-2 border-primary object-cover object-top shadow-lg transition-all group-hover:scale-105 group-hover:border-primary/80"
                            />
                            <div className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-md">
                                <MessageCircle className="h-3 w-3 text-primary-foreground" />
                            </div>
                        </div>
                        <span className="absolute -top-8 right-0 rounded-lg border border-border/50 bg-background/90 px-2 py-1 text-xs whitespace-nowrap text-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                            Chat with Cynessa
                        </span>
                    </button>
                    {/* Hide button on bottom left of Cynessa */}
                    <button
                        onClick={() => {
                            handleSetHidden(true);
                        }}
                        className="absolute -bottom-1 -left-1 flex items-center gap-1 rounded border border-primary/30 bg-primary/20 px-2 py-1 text-xs text-primary shadow-md transition-all hover:bg-primary/30"
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
                    className="animate-fade-in fixed right-6 bottom-6 z-50 flex h-[520px] max-h-[calc(100vh-6rem)] w-[380px] max-w-[calc(100vw-3rem)] touch-pan-y flex-col rounded-xl border border-border/30 bg-background shadow-2xl"
                    style={{
                        transform: `translateX(${swipeOffset}px)`,
                        transition: isSwiping
                            ? 'none'
                            : 'transform 0.3s ease-out',
                        opacity:
                            swipeOffset > 0
                                ? Math.max(0.3, 1 - swipeOffset / 200)
                                : 1,
                    }}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Swipe hint for mobile */}
                    {swipeOffset > 20 && (
                        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/80">
                            <div className="text-center">
                                <MessageCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    Swipe right to minimize
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-border/30 bg-gradient-to-r from-primary/10 to-secondary/10 p-4">
                        <div className="flex items-center gap-3">
                            <img
                                src={cynessaHeadshot}
                                alt="Cynessa"
                                className="h-10 w-10 rounded-full border border-primary/50 object-cover object-top"
                            />
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">
                                    Cynessa
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    {isSpeaking
                                        ? 'Speaking...'
                                        : isListening
                                          ? 'Listening...'
                                          : isLoading
                                            ? 'Thinking...'
                                            : 'Your Cynergists Assistant'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSpeechEnabled(!speechEnabled)}
                                className="h-8 w-8 p-0"
                                aria-label={
                                    speechEnabled
                                        ? 'Disable voice responses'
                                        : 'Enable voice responses'
                                }
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
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-lg px-4 py-2 text-sm ${
                                            msg.role === 'user'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-foreground'
                                        }`}
                                    >
                                        {msg.content ||
                                            (isLoading &&
                                            i === messages.length - 1 ? (
                                                <span className="flex items-center gap-1">
                                                    <span className="animate-pulse">
                                                        ●
                                                    </span>
                                                    <span
                                                        className="animate-pulse"
                                                        style={{
                                                            animationDelay:
                                                                '150ms',
                                                        }}
                                                    >
                                                        ●
                                                    </span>
                                                    <span
                                                        className="animate-pulse"
                                                        style={{
                                                            animationDelay:
                                                                '300ms',
                                                        }}
                                                    >
                                                        ●
                                                    </span>
                                                </span>
                                            ) : (
                                                ''
                                            ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Speaking indicator */}
                    {isSpeaking && (
                        <div className="flex items-center justify-between border-t border-border/30 bg-primary/10 px-4 py-2">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                    <div
                                        className="animate-soundwave h-3 w-1 rounded-full bg-primary"
                                        style={{ animationDelay: '0ms' }}
                                    />
                                    <div
                                        className="animate-soundwave h-3 w-1 rounded-full bg-primary"
                                        style={{ animationDelay: '150ms' }}
                                    />
                                    <div
                                        className="animate-soundwave h-3 w-1 rounded-full bg-primary"
                                        style={{ animationDelay: '300ms' }}
                                    />
                                </div>
                                <span className="text-xs text-primary">
                                    Cynessa is speaking...
                                </span>
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
                    <div className="border-t border-border/30 p-4">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleListening}
                                className={`h-10 w-10 shrink-0 p-0 ${isListening ? 'animate-pulse bg-cyan-500/20 text-cyan-400' : ''}`}
                                aria-label={
                                    isListening
                                        ? 'Stop listening'
                                        : 'Start voice input'
                                }
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
                                placeholder={
                                    isListening
                                        ? 'Listening...'
                                        : 'Ask Cynessa anything...'
                                }
                                disabled={isLoading || isListening}
                                maxLength={2000}
                                className="flex-1"
                            />
                            <Button
                                onClick={() => sendMessage()}
                                disabled={!input.trim() || isLoading}
                                size="sm"
                                className="h-10 w-10 shrink-0 p-0"
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
