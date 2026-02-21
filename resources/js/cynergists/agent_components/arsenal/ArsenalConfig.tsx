import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    ShoppingCart,
    Package,
    Image,
    FileText,
    Settings,
    Shield,
    CheckCircle2,
    AlertCircle,
    Upload,
} from 'lucide-react';

interface ArsenalConfigProps {
    agentDetails: any;
}

export function ArsenalConfig({ agentDetails }: ArsenalConfigProps) {
    return (
        <div className="h-full">
            <ScrollArea className="h-full px-4 py-3">
                <div className="space-y-4">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="mb-2 flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5 text-orange-600" />
                            <h2 className="text-lg font-semibold text-foreground">
                                Arsenal eCommerce Strategist
                            </h2>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Transform unstructured product data into storefront-compatible draft listings with full human approval control.
                        </p>
                    </div>

                    {/* Configuration Status */}
                    <Card className="border-orange-500/20 bg-orange-50/50 p-4 dark:bg-orange-950/20">
                        <div className="mb-3 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-orange-600" />
                            <span className="font-medium text-orange-900 dark:text-orange-400">Draft-Only Mode</span>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                                <CheckCircle2 className="h-3 w-3" />
                                All outputs require human approval
                            </div>
                            <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                                <CheckCircle2 className="h-3 w-3" />
                                No live publishing or price modifications
                            </div>
                            <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                                <CheckCircle2 className="h-3 w-3" />
                                Full operational boundary enforcement
                            </div>
                        </div>
                    </Card>

                    {/* Core Capabilities */}
                    <Card className="p-4">
                        <div className="mb-3 flex items-center gap-2">
                            <Settings className="h-4 w-4 text-foreground" />
                            <span className="font-medium">Core Capabilities</span>
                        </div>
                        <div className="grid gap-3 text-sm">
                            <div className="flex items-start gap-3">
                                <Package className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                <div>
                                    <div className="font-medium">Data Normalization</div>
                                    <div className="text-muted-foreground">Standardize product structure & metadata</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                <div>
                                    <div className="font-medium">Content Generation</div>
                                    <div className="text-muted-foreground">Draft titles, descriptions & bullet points</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Image className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                <div>
                                    <div className="font-medium">Image Preparation</div>
                                    <div className="text-muted-foreground">Validate resolution & generate alt-text</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                <div>
                                    <div className="font-medium">Draft Assembly</div>
                                    <div className="text-muted-foreground">Storefront-ready structured exports</div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Supported Data Sources */}
                    <Card className="p-4">
                        <div className="mb-3 flex items-center gap-2">
                            <Upload className="h-4 w-4 text-foreground" />
                            <span className="font-medium">Supported Data Sources</span>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="rounded-lg border border-blue-500/20 bg-blue-50/50 p-3 dark:bg-blue-950/20">
                                <div className="mb-1 font-medium text-blue-900 dark:text-blue-400">CSV Files</div>
                                <div className="text-blue-700 dark:text-blue-300">
                                    Upload product data from CSV exports
                                </div>
                            </div>
                            <div className="rounded-lg border border-purple-500/20 bg-purple-50/50 p-3 dark:bg-purple-950/20">
                                <div className="mb-1 font-medium text-purple-900 dark:text-purple-400">JSON / API Data</div>
                                <div className="text-purple-700 dark:text-purple-300">
                                    Process structured data from APIs and database exports
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Operational Boundaries */}
                    <Card className="p-4">
                        <div className="mb-3 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <span className="font-medium">Operational Boundaries</span>
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <div>• Never publishes or modifies live listings</div>
                            <div>• Never adjusts pricing or inventory</div>
                            <div>• Never connects to payment systems</div>
                            <div>• Only processes approved data sources</div>
                            <div>• All outputs labeled as draft-only</div>
                            <div>• Full audit logging and CRM integration</div>
                        </div>
                    </Card>

                    {/* Start Configuration */}
                    <div className="pt-4">
                        <Button
                            className="w-full bg-orange-600 hover:bg-orange-700"
                            size="lg"
                        >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Start Catalog Cleanup
                        </Button>
                        <p className="mt-2 text-center text-xs text-muted-foreground">
                            Upload product data to begin processing
                        </p>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
