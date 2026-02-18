import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
    Play, 
    Upload, 
    FileAudio, 
    FileVideo,
    Mic,
    Video,
    MessageSquare,
    Clock,
    CheckCircle2,
    AlertCircle,
    Scissors,
    Headphones,
    FileText,
    Sparkles
} from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
    isVoiceGenerated?: boolean;
}

interface PrismChatProps {
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
    onMessageReceived?: (message: Message) => void;
}

export const PrismChat: React.FC<PrismChatProps> = ({
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
}) => {
    const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'complete'>('idle');
    const [currentEpisode, setCurrentEpisode] = useState<any>(null);

    const renderMessage = (message: Message, index: number) => {
        const isUser = message.role === 'user';
        
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
                                <Sparkles className="w-4 h-4 text-indigo-600" />
                                <span className="text-sm font-medium text-indigo-600">Prism</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                                Content Decomposition
                            </Badge>
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

    const renderProcessingStatus = () => {
        if (processingStatus === 'idle') return null;

        return (
            <Card className="p-4 mb-4 border-indigo-200 bg-indigo-50">
                <div className="flex items-start gap-3">
                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mt-0.5" />
                    <div className="flex-1">
                        <h4 className="text-sm font-medium text-indigo-800 mb-2">Processing Episode</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-indigo-600">
                                <span>Content Decomposition</span>
                                <span>75%</span>
                            </div>
                            <Progress value={75} className="h-2" />
                            <div className="text-xs text-indigo-600">
                                Extracting highlight clips and generating summaries...
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        );
    };

    const renderPrismStatusCards = () => {
        return (
            <div className="mb-6 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Headphones className="w-4 h-4" />
                    Podcast Processing Status
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Episodes Processed</p>
                                <p className="text-xs text-gray-500">This Month</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-green-600">8</p>
                                <Badge variant="secondary" className="text-xs">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Complete
                                </Badge>
                            </div>
                        </div>
                    </Card>
                    
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Assets Generated</p>
                                <p className="text-xs text-gray-500">Ready for Review</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-blue-600">156</p>
                                <Badge variant="secondary" className="text-xs">
                                    <FileText className="w-3 h-3 mr-1" />
                                    Draft
                                </Badge>
                            </div>
                        </div>
                    </Card>
                </div>
                
                <Card className="p-4 border-orange-200 bg-orange-50">
                    <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-orange-800">Processing Queue</p>
                            <p className="text-xs text-orange-600">2 episodes waiting for processing • Average processing time: 45 minutes</p>
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
                        onClick={() => onFileClick()}
                    >
                        <Upload className="w-4 h-4" />
                        <span className="text-xs">Upload Episode</span>
                    </Button>
                    
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex flex-col items-center gap-1 h-auto py-3"
                        onClick={() => setInput('Show me the assets from my latest episode')}
                    >
                        <Scissors className="w-4 h-4" />
                        <span className="text-xs">View Assets</span>
                    </Button>
                    
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex flex-col items-center gap-1 h-auto py-3"
                        onClick={() => setInput('Check the processing status of my episodes')}
                    >
                        <Clock className="w-4 h-4" />
                        <span className="text-xs">Check Status</span>
                    </Button>
                    
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex flex-col items-center gap-1 h-auto py-3"
                        onClick={() => setInput('Generate social media content from my latest episode')}
                    >
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-xs">Social Content</span>
                    </Button>
                </div>
            </div>
        );
    };

    const renderSupportedFormats = () => {
        return (
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Supported Formats</h3>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <FileAudio className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium">Audio</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {['MP3', 'WAV', 'FLAC', 'M4A'].map(format => (
                                <Badge key={format} variant="outline" className="text-xs">
                                    {format}
                                </Badge>
                            ))}
                        </div>
                    </div>
                    
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <FileVideo className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium">Video</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {['MP4', 'MOV', 'AVI'].map(format => (
                                <Badge key={format} variant="outline" className="text-xs">
                                    {format}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Prism</h2>
                        <p className="text-xs text-gray-500">Podcast Content Decomposition</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    {onClearChat && (
                        <Button variant="ghost" size="sm" onClick={onClearChat}>
                            Clear
                        </Button>
                    )}
                </div>
            </div>

            {/* Chat Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                {messages.length === 0 ? (
                    <div className="space-y-6">
                        <div className="text-center py-8">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Welcome to Prism! 🎙️
                            </h3>
                            <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
                                I'm your podcast content decomposition agent. Upload your episode recordings 
                                and I'll extract highlights, quotes, summaries, and social content.
                            </p>
                            
                            <Card className="p-4 text-left max-w-md mx-auto border-indigo-200 bg-indigo-50">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-indigo-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-indigo-800">Draft Mode Only</p>
                                        <p className="text-xs text-indigo-600">All generated content requires human review before distribution</p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                        
                        {renderPrismStatusCards()}
                        {renderQuickActions()}
                        {renderSupportedFormats()}
                    </div>
                ) : (
                    <div>
                        {renderProcessingStatus()}
                        {messages.map((message, index) => renderMessage(message, index))}
                    </div>
                )}
            </ScrollArea>

            <Separator />

            {/* Input Section */}
            <div className="p-4 space-y-3">
                {isUploading && (
                    <div className="flex items-center gap-2 text-sm text-indigo-600">
                        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        Processing your podcast file...
                    </div>
                )}
                
                <form onSubmit={onSend} className="space-y-3">
                    <div className="flex gap-2">
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask Prism about podcast processing, upload episodes, or request specific content assets..."
                            className="flex-1 resize-none"
                            rows={2}
                            disabled={isStreaming}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    onSend(e);
                                }
                            }}
                        />
                        <div className="flex flex-col gap-2">
                            <Button
                                type="submit"
                                disabled={isStreaming || !input.trim()}
                                size="sm"
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
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
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                                <Mic className="w-3 h-3" />
                                Audio supported
                            </span>
                            <span className="flex items-center gap-1">
                                <Video className="w-3 h-3" />
                                Video supported
                            </span>
                        </div>
                    </div>
                </form>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onFileSelect}
                    accept=".mp3,.wav,.flac,.m4a,.mp4,.mov,.avi"
                    className="hidden"
                />
            </div>
        </div>
    );
};