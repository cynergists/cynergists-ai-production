import { Badge } from '@cy/components/ui/badge';
import { Button } from '@cy/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@cy/components/ui/collapsible';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@cy/components/ui/table';
import { formatDate } from '@cy/lib/utils';
import { Bell, BellOff, ChevronDown, ChevronUp, Edit, Eye } from 'lucide-react';
import { useState } from 'react';
import { VersionViewModal } from './VersionViewModal';

export interface TemplateVersion {
    id: string;
    template_id: string;
    version_number: number;
    status: 'draft' | 'published' | 'archived' | 'superseded';
    content: string;
    title: string;
    content_hash: string;
    created_at: string;
    created_by: string | null;
    published_at: string | null;
    published_by: string | null;
    changelog: string | null;
    effective_date: string | null;
    change_summary: string | null;
    supersedes_version_id: string | null;
    notification_sent: boolean;
    notification_sent_at: string | null;
    execution_count: number;
}

interface VersionHistorySectionProps {
    versions: TemplateVersion[];
    loading: boolean;
    onEditDraft?: (version: TemplateVersion) => void;
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'published':
            return (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Published
                </Badge>
            );
        case 'draft':
            return (
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    Draft
                </Badge>
            );
        case 'archived':
            return (
                <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                    Archived
                </Badge>
            );
        case 'superseded':
            return (
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Superseded
                </Badge>
            );
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

const formatVersion = (version: number) => {
    const major = Math.floor(version / 10);
    const minor = version % 10;
    return `${major}.${minor}`;
};

export function VersionHistorySection({
    versions,
    loading,
    onEditDraft,
}: VersionHistorySectionProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedVersion, setSelectedVersion] =
        useState<TemplateVersion | null>(null);
    const [showViewModal, setShowViewModal] = useState(false);

    const handleViewVersion = (version: TemplateVersion) => {
        setSelectedVersion(version);
        setShowViewModal(true);
    };

    if (loading) {
        return (
            <div className="mt-6 rounded-lg border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">
                    Loading version history...
                </p>
            </div>
        );
    }

    if (versions.length === 0) {
        return null;
    }

    return (
        <>
            <Collapsible
                open={isOpen}
                onOpenChange={setIsOpen}
                className="mt-6"
            >
                <CollapsibleTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full justify-between"
                    >
                        <span className="flex items-center gap-2">
                            Version History
                            <Badge variant="secondary" className="ml-2">
                                {versions.length}
                            </Badge>
                        </span>
                        {isOpen ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                    <div className="overflow-hidden rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-20">
                                        Version
                                    </TableHead>
                                    <TableHead className="w-28">
                                        Status
                                    </TableHead>
                                    <TableHead className="w-32">
                                        Effective Date
                                    </TableHead>
                                    <TableHead className="w-32">
                                        Created
                                    </TableHead>
                                    <TableHead>Change Summary</TableHead>
                                    <TableHead className="w-24 text-center">
                                        Executions
                                    </TableHead>
                                    <TableHead className="w-24 text-center">
                                        Notified
                                    </TableHead>
                                    <TableHead className="w-24 text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {versions.map((version) => (
                                    <TableRow key={version.id}>
                                        <TableCell className="font-mono font-medium">
                                            {formatVersion(
                                                version.version_number,
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(version.status)}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {version.effective_date
                                                ? formatDate(
                                                      version.effective_date,
                                                  )
                                                : '—'}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDate(version.created_at)}
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate text-sm">
                                            {version.change_summary ||
                                                version.changelog ||
                                                '—'}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline">
                                                {version.execution_count}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {version.notification_sent ? (
                                                <Bell className="mx-auto h-4 w-4 text-green-600" />
                                            ) : (
                                                <BellOff className="mx-auto h-4 w-4 text-muted-foreground" />
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {version.status === 'draft' &&
                                            onEditDraft ? (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        onEditDraft(version)
                                                    }
                                                >
                                                    <Edit className="mr-1 h-4 w-4" />
                                                    Edit
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleViewVersion(
                                                            version,
                                                        )
                                                    }
                                                >
                                                    <Eye className="mr-1 h-4 w-4" />
                                                    View
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CollapsibleContent>
            </Collapsible>

            <VersionViewModal
                version={selectedVersion}
                open={showViewModal}
                onOpenChange={setShowViewModal}
            />
        </>
    );
}
