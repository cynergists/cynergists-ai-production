import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdminApi } from '@/hooks/useAdminApi';
import { format } from 'date-fns';
import { ArrowUpCircle, Check, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { CreateVersionModal } from './CreateVersionModal';
import RichTextEditor from './RichTextEditor';
import {
    VersionHistorySection,
    type TemplateVersion,
} from './VersionHistorySection';
interface DocumentTemplate {
    id: string;
    title: string;
    content: string;
    version: number;
    document_type: string;
    updated_at?: string;
}

interface MSAWorkflowProps {
    template: DocumentTemplate | null;
    onSaveContent: (content: string) => Promise<void>;
    onUpdateVersion?: () => Promise<void>;
    isLoading: boolean;
}

// Format version as X.Y (e.g., 1 -> 1.0, 10 -> 1.9, 11 -> 2.0)
function formatVersion(version: number): string {
    if (version <= 0) return '1.0';

    const major = Math.floor((version - 1) / 10) + 1;
    const minor = (version - 1) % 10;

    return `${major}.${minor}`;
}

// Get display title based on document type
function getDocumentTitle(documentType: string): string {
    switch (documentType) {
        case 'msa':
            return 'Master Services Agreements';
        case 'partner':
            return 'Partner Agreements';
        case 'sales_reps':
            return 'Sales Agreements';
        case 'terms':
            return 'Terms & Conditions';
        case 'privacy':
            return 'Privacy Policy';
        default:
            return 'Document Editor';
    }
}

export default function MSAWorkflow({
    template,
    onSaveContent,
    onUpdateVersion,
    isLoading,
}: MSAWorkflowProps) {
    const [content, setContent] = useState('');
    const { callApi } = useAdminApi();

    // Auto-save state
    const [isSaving, setIsSaving] = useState(false);
    const [isUpdatingVersion, setIsUpdatingVersion] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [lastVersionUpdate, setLastVersionUpdate] = useState<Date | null>(
        null,
    );
    const [currentVersion, setCurrentVersion] = useState<number>(1);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showCreateVersionModal, setShowCreateVersionModal] = useState(false);
    const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const contentRef = useRef(content);

    // Version history state
    const [versions, setVersions] = useState<TemplateVersion[]>([]);
    const [loadingVersions, setLoadingVersions] = useState(false);

    // Keep refs in sync
    useEffect(() => {
        contentRef.current = content;
    }, [content]);

    // Load template content
    useEffect(() => {
        if (template) {
            setContent(template.content);
            setCurrentVersion(template.version);
            setHasUnsavedChanges(false);
            if (template.updated_at) {
                setLastVersionUpdate(new Date(template.updated_at));
            }
        }
    }, [template]);

    // Load version history when template changes
    useEffect(() => {
        if (template?.id) {
            loadVersionHistory();
        }
    }, [template?.id]);

    const loadVersionHistory = async () => {
        if (!template?.id) return;

        setLoadingVersions(true);
        try {
            const data = await callApi<TemplateVersion[]>(
                'get_template_versions',
                { template_id: template.id },
            );
            setVersions(data || []);
        } catch (error) {
            console.error('Failed to load version history:', error);
        } finally {
            setLoadingVersions(false);
        }
    };

    // Auto-save for content
    const triggerAutoSave = useCallback(() => {
        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }

        autoSaveTimeoutRef.current = setTimeout(async () => {
            setIsSaving(true);
            try {
                await onSaveContent(contentRef.current);
                setLastSaved(new Date());
                setHasUnsavedChanges(false);
            } catch (error) {
                console.error('Auto-save failed:', error);
                toast.error('Failed to save changes');
            } finally {
                setIsSaving(false);
            }
        }, 1000); // 1 second debounce
    }, [onSaveContent]);

    // Handle content change
    const handleContentChange = useCallback(
        (newContent: string) => {
            setContent(newContent);
            setHasUnsavedChanges(true);
            triggerAutoSave();
        },
        [triggerAutoSave],
    );

    // Manual save
    const handleManualSave = useCallback(async () => {
        setIsSaving(true);
        try {
            await onSaveContent(content);
            setLastSaved(new Date());
            setHasUnsavedChanges(false);
            toast.success('Changes saved');
        } catch (error) {
            console.error('Save failed:', error);
            toast.error('Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    }, [content, onSaveContent]);

    // Create new version with confirmation modal
    const handleCreateVersion = async (data: {
        changeSummary: string;
        effectiveDate: string;
    }) => {
        if (!template?.id) return;

        setIsUpdatingVersion(true);
        try {
            // First save any pending content changes
            await onSaveContent(contentRef.current);

            // Create new version via API
            const newVersion = await callApi<TemplateVersion>(
                'create_new_template_version',
                { template_id: template.id },
                {
                    change_summary: data.changeSummary,
                    effective_date: data.effectiveDate,
                },
            );

            if (newVersion) {
                setCurrentVersion(newVersion.version_number);
                setLastVersionUpdate(new Date());

                // Reload version history
                await loadVersionHistory();
            }
        } catch (error) {
            console.error('Version creation failed:', error);
            toast.error('Failed to create new version');
            throw error;
        } finally {
            setIsUpdatingVersion(false);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, []);

    if (!template) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
            {/* Workflow Header */}
            <div className="shrink-0 border-b bg-card px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Title */}
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-semibold">
                            {getDocumentTitle(template.document_type)}
                        </h2>
                    </div>

                    {/* Save Status & Actions */}
                    <div className="flex items-center gap-4">
                        {/* Save Status */}
                        <div className="flex items-center gap-2 text-sm">
                            {isSaving ? (
                                <Badge variant="outline" className="gap-1.5">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Saving...
                                </Badge>
                            ) : hasUnsavedChanges ? (
                                <Badge
                                    variant="outline"
                                    className="border-amber-300 text-amber-600"
                                >
                                    Unsaved changes
                                </Badge>
                            ) : (
                                <Badge
                                    variant="outline"
                                    className="gap-1.5 border-green-300 text-green-600"
                                >
                                    <Check className="h-3 w-3" />
                                    Last Saved{' '}
                                    {lastSaved
                                        ? format(lastSaved, 'M/d/yy h:mm a')
                                        : template.updated_at
                                          ? format(
                                                new Date(template.updated_at),
                                                'M/d/yy h:mm a',
                                            )
                                          : 'N/A'}
                                </Badge>
                            )}
                        </div>

                        {/* Update Version Button - now opens modal */}
                        {template.id && (
                            <Button
                                onClick={() => setShowCreateVersionModal(true)}
                                disabled={
                                    isUpdatingVersion ||
                                    isLoading ||
                                    hasUnsavedChanges
                                }
                                className="gap-2 bg-lime-400 text-gray-900 hover:bg-lime-500"
                            >
                                {isUpdatingVersion ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <ArrowUpCircle className="h-4 w-4" />
                                )}
                                Update Version
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Rich Text Editor with Document Header */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white dark:bg-background">
                {/* Non-editable Document Header */}
                <div className="shrink-0 border-b bg-muted px-6 py-3 text-sm text-muted-foreground">
                    <div>Version: {formatVersion(currentVersion)}</div>
                    <div>
                        Version Update:{' '}
                        {lastVersionUpdate
                            ? format(lastVersionUpdate, 'M/d/yy')
                            : template.updated_at
                              ? format(new Date(template.updated_at), 'M/d/yy')
                              : 'N/A'}
                    </div>
                </div>

                {/* Editable Content - scrollable area */}
                <div className="min-h-0 flex-1 overflow-auto">
                    <RichTextEditor
                        content={content}
                        onChange={handleContentChange}
                        placeholder="Enter your MSA content here..."
                    />
                </div>

                {/* Version History Section */}
                <div className="shrink-0 border-t bg-card p-4">
                    <VersionHistorySection
                        versions={versions}
                        loading={loadingVersions}
                    />
                </div>
            </div>

            {/* Create Version Modal */}
            <CreateVersionModal
                open={showCreateVersionModal}
                onOpenChange={setShowCreateVersionModal}
                onConfirm={handleCreateVersion}
                currentVersion={currentVersion}
                templateId={template.id}
                documentType={
                    template.document_type as
                        | 'msa'
                        | 'terms'
                        | 'privacy'
                        | 'partner'
                        | 'sales_reps'
                }
            />
        </div>
    );
}
