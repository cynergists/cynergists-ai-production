import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    ShoppingCart,
    Package,
    FileText,
    Image,
    CheckCircle2,
    AlertTriangle,
    Shield,
    Upload,
    Download,
} from 'lucide-react';

export default function ArsenalSidebar() {
    return (
        <div className="h-full">
            <ScrollArea className="h-full px-3 py-4">
                <div className="space-y-4">
                    {/* Agent Status */}
                    <Card className="border-orange-500/20 bg-orange-50/50 p-3 dark:bg-orange-950/20">
                        <div className="mb-2 flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4 text-orange-600" />
                            <span className="text-sm font-medium text-orange-900 dark:text-orange-400">
                                Arsenal Active
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <Shield className="h-3 w-3 text-orange-600" />
                            <span className="text-orange-700 dark:text-orange-300">
                                Draft-Only Mode
                            </span>
                        </div>
                    </Card>

                    {/* Quick Actions */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-foreground">Quick Actions</h3>
                        <div className="space-y-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start gap-2 text-left"
                            >
                                <Upload className="h-4 w-4" />
                                Upload Product Data
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start gap-2 text-left"
                            >
                                <Package className="h-4 w-4" />
                                Normalize Categories
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start gap-2 text-left"
                            >
                                <FileText className="h-4 w-4" />
                                Generate Content
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start gap-2 text-left"
                            >
                                <Image className="h-4 w-4" />
                                Process Images
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start gap-2 text-left"
                            >
                                <Download className="h-4 w-4" />
                                Export Draft
                            </Button>
                        </div>
                    </div>

                    {/* Processing Status */}
                    <Card className="p-3">
                        <h4 className="mb-2 text-sm font-medium text-foreground">Processing Status</h4>
                        <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Session Active</span>
                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Data Uploaded</span>
                                <div className="h-3 w-3 rounded-full bg-muted"></div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Products Processed</span>
                                <div className="h-3 w-3 rounded-full bg-muted"></div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Drafts Generated</span>
                                <div className="h-3 w-3 rounded-full bg-muted"></div>
                            </div>
                        </div>
                    </Card>

                    {/* Operational Boundaries */}
                    <Card className="p-3">
                        <h4 className="mb-2 flex items-center gap-1 text-sm font-medium text-foreground">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            Boundaries
                        </h4>
                        <div className="space-y-1 text-xs text-muted-foreground">
                            <div>• Draft-only outputs</div>
                            <div>• No live publishing</div>
                            <div>• No price changes</div>
                            <div>• Human approval required</div>
                            <div>• Full audit logging</div>
                        </div>
                    </Card>

                    {/* Data Sources */}
                    <Card className="p-3">
                        <h4 className="mb-2 text-sm font-medium text-foreground">Supported Formats</h4>
                        <div className="space-y-1 text-xs text-muted-foreground">
                            <div>• CSV files</div>
                            <div>• JSON data</div>
                            <div>• Excel files</div>
                            <div>• API responses</div>
                            <div>• Database exports</div>
                        </div>
                    </Card>

                    {/* Help */}
                    <Card className="border-blue-500/20 bg-blue-50/50 p-3 dark:bg-blue-950/20">
                        <h4 className="mb-1 text-sm font-medium text-blue-900 dark:text-blue-400">
                            Need Help?
                        </h4>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                            Ask me about catalog cleanup, product normalization, or data processing workflows.
                        </p>
                    </Card>
                </div>
            </ScrollArea>
        </div>
    );
}