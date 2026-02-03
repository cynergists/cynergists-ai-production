import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatDate as formatDateUtil } from '@/lib/utils';
import {
    AlertCircle,
    Archive,
    Building,
    Calendar,
    Download,
    Eye,
    FileText,
    Loader2,
    Tag,
    User,
    X,
} from 'lucide-react';
import { useState } from 'react';

export interface ArchivedAgreement {
    id: string;
    title: string;
    client_name: string;
    client_email: string;
    client_company: string | null;
    plan_name: string;
    plan_price: number;
    status: string;
    lifecycle_status: string | null;
    agreement_type: string | null;
    version: string | null;
    created_at: string;
    signed_at: string | null;
    effective_date: string | null;
    archived_at: string | null;
    archived_reason: string | null;
    superseded_by: string | null;
    signer_names: string[] | null;
    content: string;
    token: string;
}

interface AgreementArchiveProps {
    agreements: ArchivedAgreement[];
    loading: boolean;
    onClose: () => void;
}

const getLifecycleStatusBadge = (status: string | null) => {
    switch (status) {
        case 'superseded':
            return (
                <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-600">
                    Superseded
                </Badge>
            );
        case 'expired':
            return (
                <Badge className="border-red-500/20 bg-red-500/10 text-red-600">
                    Expired
                </Badge>
            );
        case 'terminated':
            return (
                <Badge className="border-gray-500/20 bg-gray-500/10 text-gray-600">
                    Terminated
                </Badge>
            );
        default:
            return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
};

const getAgreementTypeBadge = (type: string | null) => {
    switch (type?.toLowerCase()) {
        case 'msa':
            return (
                <Badge
                    variant="outline"
                    className="border-blue-500/20 bg-blue-500/10 text-blue-600"
                >
                    MSA
                </Badge>
            );
        case 'sow':
            return (
                <Badge
                    variant="outline"
                    className="border-purple-500/20 bg-purple-500/10 text-purple-600"
                >
                    SOW
                </Badge>
            );
        case 'amendment':
            return (
                <Badge
                    variant="outline"
                    className="border-orange-500/20 bg-orange-500/10 text-orange-600"
                >
                    Amendment
                </Badge>
            );
        case 'addendum':
            return (
                <Badge
                    variant="outline"
                    className="border-green-500/20 bg-green-500/10 text-green-600"
                >
                    Addendum
                </Badge>
            );
        default:
            return <Badge variant="outline">{type || 'MSA'}</Badge>;
    }
};

export default function AgreementArchive({
    agreements,
    loading,
    onClose,
}: AgreementArchiveProps) {
    const [selectedAgreement, setSelectedAgreement] =
        useState<ArchivedAgreement | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleViewDetails = (agreement: ArchivedAgreement) => {
        setSelectedAgreement(agreement);
        setDrawerOpen(true);
    };

    const handleDownload = (agreement: ArchivedAgreement) => {
        // Create a blob from the agreement content and download
        const blob = new Blob([agreement.content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${agreement.title || agreement.plan_name}-${agreement.client_name}-archived.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '—';
        try {
            return formatDateUtil(dateStr);
        } catch {
            return '—';
        }
    };

    if (loading) {
        return (
            <Card className="mt-4 border-dashed border-amber-500/30 bg-amber-500/5">
                <CardContent className="py-12">
                    <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className="mt-4 border-dashed border-amber-500/30 bg-amber-500/5">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                                <Archive className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    Agreement Archives
                                    <Badge variant="secondary" className="ml-2">
                                        {agreements.length}
                                    </Badge>
                                </CardTitle>
                                <CardDescription>
                                    Historical agreements — read-only for legal
                                    and audit purposes
                                </CardDescription>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {agreements.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                            <Archive className="mx-auto mb-4 h-12 w-12 opacity-50" />
                            <p className="font-medium">
                                No archived agreements
                            </p>
                            <p className="mt-1 text-sm">
                                Superseded, expired, or terminated agreements
                                will appear here
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="font-semibold">
                                            Agreement Name
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Type
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Version
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Client / Company
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Status
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Effective Date
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Signed Date
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Archived Date
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Reason
                                        </TableHead>
                                        <TableHead className="text-right font-semibold">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {agreements.map((agreement) => (
                                        <TableRow
                                            key={agreement.id}
                                            className="hover:bg-muted/30"
                                        >
                                            <TableCell>
                                                <button
                                                    onClick={() =>
                                                        handleViewDetails(
                                                            agreement,
                                                        )
                                                    }
                                                    className="text-left font-medium text-primary hover:underline"
                                                >
                                                    {agreement.title ||
                                                        agreement.plan_name}
                                                </button>
                                            </TableCell>
                                            <TableCell>
                                                {getAgreementTypeBadge(
                                                    agreement.agreement_type,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-mono text-sm">
                                                    v
                                                    {agreement.version || '1.0'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {agreement.client_name}
                                                    </div>
                                                    {agreement.client_company && (
                                                        <div className="text-sm text-muted-foreground">
                                                            {
                                                                agreement.client_company
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getLifecycleStatusBadge(
                                                    agreement.lifecycle_status,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {formatDate(
                                                    agreement.effective_date ||
                                                        agreement.created_at,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {formatDate(
                                                    agreement.signed_at,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {formatDate(
                                                    agreement.archived_at,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-muted-foreground">
                                                    {agreement.archived_reason ||
                                                        '—'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleViewDetails(
                                                                agreement,
                                                            )
                                                        }
                                                        title="View Details"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleDownload(
                                                                agreement,
                                                            )
                                                        }
                                                        title="Download PDF"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Read-only detail drawer */}
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <DrawerContent className="max-h-[90vh]">
                    <DrawerHeader className="border-b pb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                                <FileText className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <DrawerTitle className="flex items-center gap-2">
                                    {selectedAgreement?.title ||
                                        selectedAgreement?.plan_name}
                                    <Badge variant="outline" className="ml-2">
                                        Read-Only
                                    </Badge>
                                </DrawerTitle>
                                <DrawerDescription>
                                    Archived Agreement — For legal and audit
                                    reference only
                                </DrawerDescription>
                            </div>
                        </div>
                    </DrawerHeader>

                    {selectedAgreement && (
                        <div className="max-h-[60vh] overflow-auto p-6">
                            {/* Warning banner */}
                            <div className="mb-6 flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
                                <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
                                <p className="text-sm text-amber-700">
                                    This agreement is archived and cannot be
                                    edited, re-signed, or resent. It is
                                    preserved for legal and audit purposes.
                                </p>
                            </div>

                            {/* Metadata grid */}
                            <div className="mb-6 grid grid-cols-2 gap-6 md:grid-cols-3">
                                <div>
                                    <label className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        Agreement Type
                                    </label>
                                    <div className="mt-1">
                                        {getAgreementTypeBadge(
                                            selectedAgreement.agreement_type,
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        Version
                                    </label>
                                    <p className="mt-1 font-mono">
                                        v{selectedAgreement.version || '1.0'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        Status
                                    </label>
                                    <div className="mt-1">
                                        {getLifecycleStatusBadge(
                                            selectedAgreement.lifecycle_status,
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="flex items-center gap-1 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        <User className="h-3 w-3" /> Client Name
                                    </label>
                                    <p className="mt-1 font-medium">
                                        {selectedAgreement.client_name}
                                    </p>
                                </div>
                                <div>
                                    <label className="flex items-center gap-1 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        <Building className="h-3 w-3" /> Company
                                    </label>
                                    <p className="mt-1">
                                        {selectedAgreement.client_company ||
                                            '—'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        Plan
                                    </label>
                                    <p className="mt-1">
                                        {selectedAgreement.plan_name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        $
                                        {selectedAgreement.plan_price.toLocaleString()}
                                        /mo
                                    </p>
                                </div>
                            </div>

                            <Separator className="my-6" />

                            {/* Date information */}
                            <div className="mb-6 grid grid-cols-2 gap-6 md:grid-cols-4">
                                <div>
                                    <label className="flex items-center gap-1 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        <Calendar className="h-3 w-3" />{' '}
                                        Effective Date
                                    </label>
                                    <p className="mt-1">
                                        {formatDate(
                                            selectedAgreement.effective_date ||
                                                selectedAgreement.created_at,
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        Signed Date
                                    </label>
                                    <p className="mt-1">
                                        {formatDate(
                                            selectedAgreement.signed_at,
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        Archived Date
                                    </label>
                                    <p className="mt-1">
                                        {formatDate(
                                            selectedAgreement.archived_at,
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <label className="flex items-center gap-1 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        <Tag className="h-3 w-3" /> Archive
                                        Reason
                                    </label>
                                    <p className="mt-1">
                                        {selectedAgreement.archived_reason ||
                                            '—'}
                                    </p>
                                </div>
                            </div>

                            {/* Signer names if available */}
                            {selectedAgreement.signer_names &&
                                selectedAgreement.signer_names.length > 0 && (
                                    <>
                                        <Separator className="my-6" />
                                        <div>
                                            <label className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                Signers
                                            </label>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {selectedAgreement.signer_names.map(
                                                    (name, idx) => (
                                                        <Badge
                                                            key={idx}
                                                            variant="secondary"
                                                        >
                                                            {name}
                                                        </Badge>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}

                            {/* Superseded by link */}
                            {selectedAgreement.superseded_by && (
                                <>
                                    <Separator className="my-6" />
                                    <div>
                                        <label className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                            Superseded By
                                        </label>
                                        <p className="mt-1 font-mono text-sm text-primary">
                                            {selectedAgreement.superseded_by}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    <DrawerFooter className="border-t pt-4">
                        <div className="flex w-full items-center justify-between">
                            <DrawerClose asChild>
                                <Button variant="outline">Close</Button>
                            </DrawerClose>
                            {selectedAgreement && (
                                <Button
                                    onClick={() =>
                                        handleDownload(selectedAgreement)
                                    }
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Agreement
                                </Button>
                            )}
                        </div>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    );
}
