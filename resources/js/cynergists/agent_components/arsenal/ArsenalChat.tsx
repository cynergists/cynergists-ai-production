import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
    ShoppingCart,
    Send,
    Upload,
    AlertTriangle,
    Shield,
    FileText,
    Package,
} from 'lucide-react';

interface ArsenalChatProps {
    messages: Array<{ role: 'user' | 'assistant'; content: string; isVoiceGenerated?: boolean }>;
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
    selectedAgentId?: string | null;
    onMessageReceived?: (message: {
        role: 'user' | 'assistant';
        content: string;
        isVoiceGenerated?: boolean;
    }) => void;
}

export function ArsenalChat({
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
}: ArsenalChatProps) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isStreaming || isUploading) return;
        onSend(e);
    };

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="shrink-0 border-b border-border p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
                        <ShoppingCart className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                        <h1 className="font-semibold text-foreground">Arsenal eCommerce Strategist</h1>
                        <p className="text-sm text-muted-foreground">Draft-only catalog cleanup & standardization</p>
                    </div>
                </div>

                {/* Draft-Only Warning Banner */}
                <div className="mt-4 rounded-lg border border-orange-500/20 bg-orange-50/50 p-3 dark:bg-orange-950/20">
                    <div className="flex items-start gap-2">
                        <Shield className="mt-0.5 h-4 w-4 text-orange-600" />
                        <div className="text-sm">
                            <div className="font-medium text-orange-900 dark:text-orange-400">
                                Draft-Only Mode Active
                            </div>
                            <div className="text-orange-700 dark:text-orange-300">
                                All outputs require human approval before external use. No live publishing permitted.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="grow p-4" ref={scrollRef}>
                <div className="space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center">
                            <div className="mb-4 flex justify-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                                    <ShoppingCart className="h-8 w-8 text-orange-600" />
                                </div>
                            </div>
                            <h3 className="mb-2 font-medium text-foreground">Welcome to Arsenal</h3>
                            <p className="mb-6 text-sm text-muted-foreground">
                                I transform unstructured product data into storefront-compatible draft listings.
                                Upload your catalog data or describe your cleanup needs to get started.
                            </p>
                            <div className="grid gap-3 text-left">
                                <div className="rounded-lg border border-blue-500/20 bg-blue-50/50 p-3 dark:bg-blue-950/20">
                                    <div className="mb-1 flex items-center gap-2 font-medium text-blue-900 dark:text-blue-400">
                                        <Package className="h-4 w-4" />
                                        Data Normalization
                                    </div>
                                    <div className="text-sm text-blue-700 dark:text-blue-300">
                                        "Standardize my product categories and fix missing SKUs"
                                    </div>
                                </div>
                                <div className="rounded-lg border border-purple-500/20 bg-purple-50/50 p-3 dark:bg-purple-950/20">
                                    <div className="mb-1 flex items-center gap-2 font-medium text-purple-900 dark:text-purple-400">
                                        <FileText className="h-4 w-4" />
                                        Content Generation
                                    </div>
                                    <div className="text-sm text-purple-700 dark:text-purple-300">
                                        "Generate draft descriptions for my product catalog"
                                    </div>
                                </div>
                                <div className="rounded-lg border border-green-500/20 bg-green-50/50 p-3 dark:bg-green-950/20">
                                    <div className="mb-1 flex items-center gap-2 font-medium text-green-900 dark:text-green-400">
                                        <Upload className="h-4 w-4" />
                                        Data Upload
                                    </div>
                                    <div className="text-sm text-green-700 dark:text-green-300">
                                        "I have a CSV file with product data to clean up"
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex gap-3 ${
                                message.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                        >
                            {message.role === 'assistant' && (
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                                    <ShoppingCart className="h-4 w-4 text-orange-600" />
                                </div>
                            )}
                            <div
                                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                                    message.role === 'user'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground'
                                }`}
                            >
                                <div className="whitespace-pre-wrap">{message.content}</div>
                                {/* Draft approval reminder for Arsenal responses */}
                                {message.role === 'assistant' && message.content.includes('DRAFT') && (
                                    <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                                        <AlertTriangle className="h-3 w-3" />
                                        Human approval required
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {isStreaming && (
                        <div className="flex gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                                <ShoppingCart className="h-4 w-4 text-orange-600" />
                            </div>
                            <div className="max-w-[80%] rounded-lg bg-muted px-3 py-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 animate-pulse rounded-full bg-orange-600"></div>
                                    <div className="h-2 w-2 animate-pulse rounded-full bg-orange-600 animation-delay-150"></div>
                                    <div className="h-2 w-2 animate-pulse rounded-full bg-orange-600 animation-delay-300"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="shrink-0 border-t border-border p-4">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <div className="relative grow">
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Upload product data or describe your catalog cleanup needs..."
                            className="min-h-[44px] resize-none pr-24"
                            rows={1}
                            disabled={isStreaming || isUploading}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                        />
                        <div className="absolute bottom-2 right-2 flex gap-1">
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={onFileClick}
                                disabled={isStreaming || isUploading}
                                title="Upload product data file"
                            >
                                <Upload className="h-4 w-4" />
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                className="h-8 w-8 bg-orange-600 p-0 hover:bg-orange-700"
                                disabled={!input.trim() || isStreaming || isUploading}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </form>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json,.xlsx,.xls"
                    onChange={onFileSelect}
                    className="hidden"
                />

                <div className="mt-2 text-center text-xs text-muted-foreground">
                    Supports CSV, JSON, and Excel files • All outputs require human approval
                </div>
            </div>
        </div>
    );
}