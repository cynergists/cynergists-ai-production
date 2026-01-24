import { useState } from "react";
import { formatDate as formatDateUtil } from "@/lib/utils";
import { Archive, Download, Eye, FileText, Loader2, X, Calendar, Building, User, Tag, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";

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
    case "superseded":
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Superseded</Badge>;
    case "expired":
      return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Expired</Badge>;
    case "terminated":
      return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20">Terminated</Badge>;
    default:
      return <Badge variant="outline">{status || "Unknown"}</Badge>;
  }
};

const getAgreementTypeBadge = (type: string | null) => {
  switch (type?.toLowerCase()) {
    case "msa":
      return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">MSA</Badge>;
    case "sow":
      return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20">SOW</Badge>;
    case "amendment":
      return <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20">Amendment</Badge>;
    case "addendum":
      return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Addendum</Badge>;
    default:
      return <Badge variant="outline">{type || "MSA"}</Badge>;
  }
};

export default function AgreementArchive({ agreements, loading, onClose }: AgreementArchiveProps) {
  const [selectedAgreement, setSelectedAgreement] = useState<ArchivedAgreement | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleViewDetails = (agreement: ArchivedAgreement) => {
    setSelectedAgreement(agreement);
    setDrawerOpen(true);
  };

  const handleDownload = (agreement: ArchivedAgreement) => {
    // Create a blob from the agreement content and download
    const blob = new Blob([agreement.content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${agreement.title || agreement.plan_name}-${agreement.client_name}-archived.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    try {
      return formatDateUtil(dateStr);
    } catch {
      return "—";
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
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Archive className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  Agreement Archives
                  <Badge variant="secondary" className="ml-2">{agreements.length}</Badge>
                </CardTitle>
                <CardDescription>
                  Historical agreements — read-only for legal and audit purposes
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
            <div className="text-center py-8 text-muted-foreground">
              <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No archived agreements</p>
              <p className="text-sm mt-1">Superseded, expired, or terminated agreements will appear here</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Agreement Name</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Version</TableHead>
                    <TableHead className="font-semibold">Client / Company</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Effective Date</TableHead>
                    <TableHead className="font-semibold">Signed Date</TableHead>
                    <TableHead className="font-semibold">Archived Date</TableHead>
                    <TableHead className="font-semibold">Reason</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agreements.map((agreement) => (
                    <TableRow key={agreement.id} className="hover:bg-muted/30">
                      <TableCell>
                        <button
                          onClick={() => handleViewDetails(agreement)}
                          className="font-medium text-primary hover:underline text-left"
                        >
                          {agreement.title || agreement.plan_name}
                        </button>
                      </TableCell>
                      <TableCell>{getAgreementTypeBadge(agreement.agreement_type)}</TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">v{agreement.version || "1.0"}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{agreement.client_name}</div>
                          {agreement.client_company && (
                            <div className="text-sm text-muted-foreground">{agreement.client_company}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getLifecycleStatusBadge(agreement.lifecycle_status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(agreement.effective_date || agreement.created_at)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(agreement.signed_at)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(agreement.archived_at)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {agreement.archived_reason || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(agreement)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownload(agreement)}
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
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <DrawerTitle className="flex items-center gap-2">
                  {selectedAgreement?.title || selectedAgreement?.plan_name}
                  <Badge variant="outline" className="ml-2">Read-Only</Badge>
                </DrawerTitle>
                <DrawerDescription>
                  Archived Agreement — For legal and audit reference only
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>
          
          {selectedAgreement && (
            <div className="p-6 overflow-auto max-h-[60vh]">
              {/* Warning banner */}
              <div className="flex items-center gap-3 p-4 mb-6 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                <p className="text-sm text-amber-700">
                  This agreement is archived and cannot be edited, re-signed, or resent. 
                  It is preserved for legal and audit purposes.
                </p>
              </div>

              {/* Metadata grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Agreement Type</label>
                  <div className="mt-1">{getAgreementTypeBadge(selectedAgreement.agreement_type)}</div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Version</label>
                  <p className="mt-1 font-mono">v{selectedAgreement.version || "1.0"}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
                  <div className="mt-1">{getLifecycleStatusBadge(selectedAgreement.lifecycle_status)}</div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <User className="h-3 w-3" /> Client Name
                  </label>
                  <p className="mt-1 font-medium">{selectedAgreement.client_name}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Building className="h-3 w-3" /> Company
                  </label>
                  <p className="mt-1">{selectedAgreement.client_company || "—"}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Plan</label>
                  <p className="mt-1">{selectedAgreement.plan_name}</p>
                  <p className="text-sm text-muted-foreground">${selectedAgreement.plan_price.toLocaleString()}/mo</p>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Date information */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Effective Date
                  </label>
                  <p className="mt-1">{formatDate(selectedAgreement.effective_date || selectedAgreement.created_at)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Signed Date</label>
                  <p className="mt-1">{formatDate(selectedAgreement.signed_at)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Archived Date</label>
                  <p className="mt-1">{formatDate(selectedAgreement.archived_at)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Tag className="h-3 w-3" /> Archive Reason
                  </label>
                  <p className="mt-1">{selectedAgreement.archived_reason || "—"}</p>
                </div>
              </div>

              {/* Signer names if available */}
              {selectedAgreement.signer_names && selectedAgreement.signer_names.length > 0 && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Signers</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedAgreement.signer_names.map((name, idx) => (
                        <Badge key={idx} variant="secondary">{name}</Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Superseded by link */}
              {selectedAgreement.superseded_by && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Superseded By</label>
                    <p className="mt-1 font-mono text-sm text-primary">{selectedAgreement.superseded_by}</p>
                  </div>
                </>
              )}
            </div>
          )}

          <DrawerFooter className="border-t pt-4">
            <div className="flex items-center justify-between w-full">
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
              {selectedAgreement && (
                <Button onClick={() => handleDownload(selectedAgreement)}>
                  <Download className="h-4 w-4 mr-2" />
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
