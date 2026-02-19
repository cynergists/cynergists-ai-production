import { AlertCircle, Calendar, CheckCircle2, Clock, Loader2, Paperclip, Play, TrendingUp, Upload, Video, Zap } from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent, type RefObject } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
    isVoiceGenerated?: boolean;
}

interface ImpulseChatProps {
    messages: Message[];
    input: string;
    setInput: (value: string) => void;
    isStreaming: boolean;
    isUploading: boolean;
    agentDetails?: {
        agent_name?: string | null;
        job_title?: string | null;
    } | null;
    fileInputRef: RefObject<HTMLInputElement>;
    scrollRef: RefObject<HTMLDivElement>;
    onSend: (e: FormEvent<HTMLFormElement>) => void;
    onFileSelect: (e: ChangeEvent<HTMLInputElement>) => void;
    onFileClick: () => void;
    selectedAgentId?: string | null;
    onMessageReceived?: (message: Message) => void;
}

export const ImpulseChat = ({
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
}: ImpulseChatProps) => {
    const [voiceModeEnabled, setVoiceModeEnabled] = useState(false);
    const agentName =
        typeof agentDetails?.agent_name === 'string' && agentDetails.agent_name.trim() !== ''
            ? agentDetails.agent_name
            : 'Impulse';
    const agentJobTitle =
        typeof agentDetails?.job_title === 'string' && agentDetails.job_title.trim() !== ''
            ? agentDetails.job_title
            : 'TikTok Shop Automation Agent';

    const renderMessage = (message: Message, index: number) => {
        const isUser = message.role === 'user';
        const isVoice = message.isVoiceGenerated;
        
        return (
            <div
                key={index}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
            >
                <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                        isUser
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900 border'
                    }`}
                >
                    {!isUser && (
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1">
                                <Zap className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-medium text-purple-600">{agentName}</span>
                            </div>
                            {isVoice && (
                                <Badge variant="secondary" className="text-xs">
                                    🎵 Voice Response
                                </Badge>
                            )}
                        </div>
                    )}
                    
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                    </div>
                    
                    {message.timestamp && (
                        <div className="text-xs opacity-70 mt-2">
                            {message.timestamp}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderImpulseStatusCards = () => {
        return (
            <div className="mb-6 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    TikTok Shop Automation Status
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Content Pipeline</p>
                                <p className="text-xs text-gray-500">Videos Generated Today</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-green-600">12</p>
                                <Badge variant="secondary" className="text-xs">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Active
                                </Badge>
                            </div>
                        </div>
                    </Card>
                    
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Performance</p>
                                <p className="text-xs text-gray-500">Avg. Engagement Rate</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-blue-600">4.2%</p>
                                <Badge variant="secondary" className="text-xs">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    +0.8%
                                </Badge>
                            </div>
                        </div>
                    </Card>
                </div>
                
                <Card className="p-4 border-orange-200 bg-orange-50">
                    <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-orange-800">Next Scheduled Action</p>
                            <p className="text-xs text-orange-600">Video publish in 2 hours • Catalog sync tomorrow at 6 AM</p>
                        </div>
                    </div>
                </Card>
            </div>
        );
    };

    const renderQuickActions = () => {
        return (
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex flex-col items-center gap-1 h-auto py-3"
                        onClick={() => setInput('Show me today\'s video performance')}
                    >
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs">Performance</span>
                    </Button>
                    
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex flex-col items-center gap-1 h-auto py-3"
                        onClick={() => setInput('Generate videos for my new products')}
                    >
                        <Video className="w-4 h-4" />
                        <span className="text-xs">New Videos</span>
                    </Button>
                    
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex flex-col items-center gap-1 h-auto py-3"
                        onClick={() => setInput('Update my publishing schedule')}
                    >
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs">Schedule</span>
                    </Button>
                    
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex flex-col items-center gap-1 h-auto py-3"
                        onClick={() => setInput('Sync my TikTok Shop catalog')}
                    >
                        <Upload className="w-4 h-4" />
                        <span className="text-xs">Sync Catalog</span>
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">{agentName}</h2>
                        <p className="text-xs text-gray-500">{agentJobTitle}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setVoiceModeEnabled(!voiceModeEnabled)}
                        className={voiceModeEnabled ? 'bg-purple-100 text-purple-700' : ''}
                    >
                        🎵 Voice Mode
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={isUploading}
                        onClick={onFileClick}
                    >
                        {isUploading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                            <Paperclip className="h-3 w-3" />
                        )}
                        Attach
                    </Button>
                </div>
            </div>

            {/* Chat Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                {messages.length === 0 ? (
                    <div className="space-y-6">
                        <div className="text-center py-8">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center mx-auto mb-4">
                                <Zap className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Welcome to Impulse! 🚀
                            </h3>
                            <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
                                I'm your TikTok Shop automation agent. I'll help you generate videos, 
                                track performance, and optimize your content strategy.
                            </p>
                            
                            <Card className="p-4 text-left max-w-md mx-auto border-purple-200 bg-purple-50">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-purple-800">Draft Mode Active</p>
                                        <p className="text-xs text-purple-600">All generated content requires human approval before publishing</p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                        
                        {renderImpulseStatusCards()}
                        {renderQuickActions()}
                    </div>
                ) : (
                    <div>
                        {messages.map((message, index) => renderMessage(message, index))}
                    </div>
                )}
            </ScrollArea>

            <Separator />

            {/* Input Section */}
            <div className="p-4 space-y-3">
                {isUploading && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        Processing your request...
                    </div>
                )}
                
                <form onSubmit={onSend} className="space-y-3">
                    <div className="flex gap-2">
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask Impulse about your TikTok Shop automation, video performance, or content strategy..."
                            className="flex-1 resize-none"
                            rows={2}
                            disabled={isStreaming}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    e.currentTarget.form?.requestSubmit();
                                }
                            }}
                        />
                        <div className="flex flex-col gap-2">
                            <Button
                                type="submit"
                                disabled={isStreaming || !input.trim()}
                                size="sm"
                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            >
                                {isStreaming ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Play className="w-4 h-4" />
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onFileClick}
                                disabled={isStreaming || isUploading}
                            >
                                <Upload className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Press Enter to send, Shift+Enter for new line</span>
                        {voiceModeEnabled && (
                            <span className="text-purple-600">🎵 Voice responses enabled</span>
                        )}
                    </div>
                </form>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onFileSelect}
                    accept=".csv,.json,.txt,image/*"
                    className="hidden"
                />
            </div>
        </div>
    );
};
