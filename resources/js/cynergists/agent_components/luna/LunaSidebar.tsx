import { AgentQuickLinks } from '@/components/portal/AgentQuickLinks';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Eye, ImageIcon, Sparkles, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface LunaSidebarProps {
    agentDetails: any;
    activeView?: string;
    setActiveView?: (view: string) => void;
    todayActivity?: any;
    seoStats?: any;
    setupProgress?: any;
}

export default function LunaSidebar({ agentDetails, activeView, setActiveView }: LunaSidebarProps) {
    const [expandedImage, setExpandedImage] = useState<string | null>(null);

    const lunaData = agentDetails?.luna_data || {};
    const stats = lunaData?.generation_stats || {
        total_images: 0,
        this_month: 0,
    };
    const recentImages = lunaData?.recent_images || [];

    return (
        <div className="hidden min-h-0 w-[300px] shrink-0 flex-col gap-6 transition-all duration-300 lg:flex">
            {/* Quick Links */}
            <div className="flex flex-col rounded-2xl border border-primary/20 bg-card p-5">
                <h2 className="mb-4 shrink-0 text-lg font-semibold text-foreground">
                    Quick Links
                </h2>
                <AgentQuickLinks activeView={activeView ?? 'chat'} setActiveView={setActiveView ?? (() => {})} />
            </div>

            {/* Lightbox */}
            {expandedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    onClick={() => setExpandedImage(null)}
                >
                    <img
                        src={expandedImage}
                        alt="Generated image"
                        className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl"
                    />
                </div>
            )}

            {/* Generation Stats */}
            <div className="flex flex-col rounded-2xl border border-amber-500/20 bg-card p-5">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    Creative Studio
                </h2>

                <div className="space-y-4">
                    <div>
                        <div className="mb-1 flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase">
                                Total Creations
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-amber-600">
                            {stats.total_images}
                        </p>
                    </div>

                    <div>
                        <div className="mb-1 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase">
                                This Month
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground">
                            {stats.this_month}{' '}
                            {stats.this_month === 1 ? 'image' : 'images'}{' '}
                            generated
                        </p>
                    </div>
                </div>
            </div>

            {/* Recent Images Gallery */}
            <div className="flex max-h-[500px] flex-col overflow-hidden rounded-2xl border border-amber-500/20 bg-card p-5">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                    <ImageIcon className="h-5 w-5 text-amber-500" />
                    Recent Creations
                </h2>

                <ScrollArea className="max-h-[420px] flex-1">
                    {recentImages.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            No images generated yet. Start creating!
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                            {recentImages.map((image: any) => (
                                <div
                                    key={image.id}
                                    className="group relative overflow-hidden rounded-lg border border-amber-500/10 transition-all hover:border-amber-500/30 hover:shadow-md"
                                >
                                    <img
                                        src={image.url}
                                        alt={image.prompt}
                                        className="aspect-square w-full cursor-pointer object-cover transition-transform duration-200 group-hover:scale-105"
                                        onClick={() =>
                                            setExpandedImage(image.url)
                                        }
                                    />
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                                        <p className="line-clamp-1 text-[10px] text-white">
                                            {image.prompt}
                                        </p>
                                        <div className="mt-0.5 flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-white hover:bg-white/20"
                                                onClick={() =>
                                                    setExpandedImage(image.url)
                                                }
                                            >
                                                <Eye className="h-3 w-3" />
                                            </Button>
                                            <a
                                                href={image.url}
                                                download
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-white hover:bg-white/20"
                                                >
                                                    <Download className="h-3 w-3" />
                                                </Button>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
    );
}
