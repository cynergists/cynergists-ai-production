import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Building2,
    Download,
    Eye,
    File,
    FileSpreadsheet,
    FileText,
    Image,
    Palette,
    Target,
    User,
    Video,
} from 'lucide-react';

interface CynessaSidebarProps {
    agentDetails: any;
    setupProgress: {
        completed: number;
        total: number;
        steps: Array<{
            id: string;
            label: string;
            completed: boolean;
        }>;
    };
}

const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || ''))
        return Image;
    if (['mp4', 'mov', 'avi', 'webm'].includes(ext || '')) return Video;
    if (['xls', 'xlsx', 'csv'].includes(ext || '')) return FileSpreadsheet;
    if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) return FileText;
    return File;
};

export default function CynessaSidebar({
    agentDetails,
    setupProgress,
}: CynessaSidebarProps) {
    // Extract tenant data from agentDetails
    const tenantData = agentDetails?.tenant_data;
    const settings = tenantData?.settings || {};

    const onboardingData = {
        companyName: tenantData?.company_name || 'Not provided',
        industry: settings?.industry || 'Not provided',
        services: settings?.services_needed || 'Not provided',
        brandTone: settings?.brand_tone || 'Not provided',
    };

    const providedFiles = settings?.brand_assets || [];

    return (
        <div className="hidden min-h-0 w-[300px] shrink-0 flex-col gap-6 transition-all duration-300 lg:flex">
            {/* Onboarding Information */}
            <div className="flex flex-col rounded-2xl border border-primary/20 bg-card p-5">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                    <Building2 className="h-5 w-5 text-primary" />
                    Onboarding Info
                </h2>

                <div className="space-y-4">
                    <div>
                        <div className="mb-1 flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase">
                                Company
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground">
                            {onboardingData.companyName}
                        </p>
                    </div>

                    <div>
                        <div className="mb-1 flex items-center gap-2">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase">
                                Industry
                            </span>
                        </div>
                        <p className="text-sm text-foreground">
                            {onboardingData.industry}
                        </p>
                    </div>

                    <div>
                        <div className="mb-1 flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase">
                                Services
                            </span>
                        </div>
                        <p className="text-sm text-foreground">
                            {onboardingData.services}
                        </p>
                    </div>

                    <div>
                        <div className="mb-1 flex items-center gap-2">
                            <Palette className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase">
                                Brand Tone
                            </span>
                        </div>
                        <p className="text-sm text-foreground">
                            {onboardingData.brandTone}
                        </p>
                    </div>
                </div>

                <div className="mt-4 border-t border-primary/20 pt-4">
                    <div className="mb-2 text-xs text-muted-foreground">
                        Setup Progress: {setupProgress.completed}/
                        {setupProgress.total}
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{
                                width: `${(setupProgress.completed / setupProgress.total) * 100}%`,
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Files Provided */}
            <div className="flex max-h-[400px] flex-col overflow-hidden rounded-2xl border border-primary/20 bg-card p-5">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                    <FileText className="h-5 w-5 text-primary" />
                    Files Provided
                </h2>

                <ScrollArea className="max-h-[320px] flex-1">
                    {providedFiles.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            No files uploaded yet
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {providedFiles.map((file: any, index: number) => {
                                const IconComponent = getFileIcon(
                                    file.filename,
                                );

                                return (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 rounded-lg border border-primary/10 bg-muted/30 p-3 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                            <IconComponent className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-foreground">
                                                {file.filename}
                                            </p>
                                            <p className="text-xs text-muted-foreground capitalize">
                                                {file.type || 'Unknown'}
                                            </p>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 shrink-0"
                                                title="View file"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 shrink-0"
                                                title="Download file"
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
    );
}
