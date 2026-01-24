import { formatDate } from '@/lib/utils';
import { AlertTriangle, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { TemplateVersion } from './VersionHistorySection';

interface VersionViewModalProps {
  version: TemplateVersion | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'published':
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Published</Badge>;
    case 'draft':
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Draft</Badge>;
    case 'archived':
      return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">Archived</Badge>;
    case 'superseded':
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Superseded</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const formatVersion = (version: number) => {
  const major = Math.floor(version / 10);
  const minor = version % 10;
  return `${major}.${minor}`;
};

export function VersionViewModal({ version, open, onOpenChange }: VersionViewModalProps) {
  if (!version) return null;

  const isLocked = version.status !== 'draft';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <span>{version.title}</span>
              <span className="font-mono text-muted-foreground">
                v{formatVersion(version.version_number)}
              </span>
              {getStatusBadge(version.status)}
            </DialogTitle>
          </div>
        </DialogHeader>

        {isLocked && (
          <Alert className="bg-muted border-muted-foreground/20">
            <Lock className="h-4 w-4" />
            <AlertDescription className="flex items-center gap-2">
              <span className="font-semibold">READ ONLY</span>
              <span className="text-muted-foreground">
                — This version is locked and cannot be modified for legal compliance.
              </span>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Created</p>
            <p className="text-sm font-medium">
              {formatDate(version.created_at)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Effective Date</p>
            <p className="text-sm font-medium">
              {version.effective_date 
                ? formatDate(version.effective_date)
                : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Executions</p>
            <p className="text-sm font-medium">{version.execution_count}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Notifications</p>
            <p className="text-sm font-medium">
              {version.notification_sent 
                ? `Sent ${version.notification_sent_at ? formatDate(version.notification_sent_at) : ''}`
                : 'Not sent'}
            </p>
          </div>
        </div>

        {(version.change_summary || version.changelog) && (
          <div className="py-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Change Summary</p>
            <p className="text-sm">{version.change_summary || version.changelog}</p>
          </div>
        )}

        <ScrollArea className="flex-1 min-h-0 border rounded-lg bg-muted/30 overflow-hidden">
          <div className="p-4">
            <div 
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: version.content }}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
