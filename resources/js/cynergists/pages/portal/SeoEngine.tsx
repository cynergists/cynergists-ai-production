import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import {
  CheckCircle2,
  FileDown,
  FileText,
  Globe,
  PlusCircle,
  Sparkles,
  XCircle,
} from "lucide-react";
import { usePortalContext } from "@/contexts/PortalContext";
import { apiClient } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type SeoSite = {
  id: string;
  name: string;
  url: string;
  status: string;
  last_audit_at: string | null;
  created_at: string;
};

type SeoRecommendation = {
  id: string;
  seo_site_id: string;
  type: string;
  title: string;
  impact_score: number | null;
  effort: string | null;
  status: string;
  created_at: string;
  approved_at: string | null;
  applied_at: string | null;
  site?: { id: string; name: string };
};

type SeoReport = {
  id: string;
  seo_site_id: string;
  period_start: string | null;
  period_end: string | null;
  status: string;
  highlights: Record<string, number | string> | null;
  metrics: Record<string, number | string> | null;
  created_at: string;
  site?: { id: string; name: string };
};

type SeoChange = {
  id: string;
  seo_site_id: string;
  status: string;
  summary: string | null;
  applied_at: string | null;
  created_at: string;
  site?: { id: string; name: string };
};

type SeoOverviewResponse = {
  stats: {
    siteCount: number;
    pendingRecommendations: number;
    approvedRecommendations: number;
    changesApplied: number;
    reportsReady: number;
  };
  sites: SeoSite[];
  recommendations: SeoRecommendation[];
  reports: SeoReport[];
  changes: SeoChange[];
};

const formatDateInput = (value: Date) => value.toISOString().split("T")[0];

const statusStyles: Record<string, string> = {
  pending: "border-amber-500/40 bg-amber-500/10 text-amber-600",
  approved: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
  rejected: "border-rose-500/40 bg-rose-500/10 text-rose-600",
  applied: "border-primary/40 bg-primary/10 text-primary",
  failed: "border-rose-500/40 bg-rose-500/10 text-rose-600",
  ready: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
  draft: "border-amber-500/40 bg-amber-500/10 text-amber-600",
  active: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
  inactive: "border-border bg-muted text-muted-foreground",
};

const formatStatus = (value: string) =>
  value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export default function PortalSeoEngine() {
  const { user } = usePortalContext();
  const queryClient = useQueryClient();

  const { data: overview, isLoading } = useQuery({
    queryKey: ["portal-seo-overview", user?.id],
    queryFn: async () => {
      return apiClient.get<SeoOverviewResponse>("/api/portal/seo/overview");
    },
    enabled: Boolean(user?.id),
  });

  const stats = overview?.stats ?? {
    siteCount: 0,
    pendingRecommendations: 0,
    approvedRecommendations: 0,
    changesApplied: 0,
    reportsReady: 0,
  };
  const sites = overview?.sites ?? [];
  const recommendations = overview?.recommendations ?? [];
  const reports = overview?.reports ?? [];
  const changes = overview?.changes ?? [];

  const [siteDialogOpen, setSiteDialogOpen] = useState(false);
  const [siteForm, setSiteForm] = useState({ name: "", url: "" });

  const createSiteMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error("Please sign in to add a site.");
      }
      return apiClient.post<{ site: SeoSite }>("/api/portal/seo/sites", siteForm);
    },
    onSuccess: () => {
      toast.success("Site added successfully.");
      setSiteDialogOpen(false);
      setSiteForm({ name: "", url: "" });
      queryClient.invalidateQueries({ queryKey: ["portal-seo-overview", user?.id] });
    },
    onError: (error: Error) => {
      toast.error(`Unable to add site: ${error.message}`);
    },
  });

  const [decisionDialogOpen, setDecisionDialogOpen] = useState(false);
  const [decisionForm, setDecisionForm] = useState({ decision: "approved", notes: "" });
  const [selectedRecommendation, setSelectedRecommendation] = useState<SeoRecommendation | null>(null);

  const decisionMutation = useMutation({
    mutationFn: async () => {
      if (!selectedRecommendation) {
        throw new Error("Select a recommendation first.");
      }
      return apiClient.post(`/api/portal/seo/recommendations/${selectedRecommendation.id}/decision`, decisionForm);
    },
    onSuccess: () => {
      toast.success("Recommendation updated.");
      setDecisionDialogOpen(false);
      setSelectedRecommendation(null);
      setDecisionForm({ decision: "approved", notes: "" });
      queryClient.invalidateQueries({ queryKey: ["portal-seo-overview", user?.id] });
    },
    onError: (error: Error) => {
      toast.error(`Unable to update recommendation: ${error.message}`);
    },
  });

  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const defaultReportDates = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    return {
      period_start: formatDateInput(start),
      period_end: formatDateInput(end),
    };
  }, []);

  const [reportForm, setReportForm] = useState({
    seo_site_id: "",
    period_start: defaultReportDates.period_start,
    period_end: defaultReportDates.period_end,
  });

  useEffect(() => {
    if (!reportForm.seo_site_id && sites.length > 0) {
      setReportForm((current) => ({ ...current, seo_site_id: sites[0].id }));
    }
  }, [sites, reportForm.seo_site_id]);

  const reportMutation = useMutation({
    mutationFn: async () => {
      if (!reportForm.seo_site_id) {
        throw new Error("Select a site before generating a report.");
      }
      return apiClient.post<{ report: SeoReport }>("/api/portal/seo/reports/generate", reportForm);
    },
    onSuccess: () => {
      toast.success("Report generated.");
      setReportDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["portal-seo-overview", user?.id] });
    },
    onError: (error: Error) => {
      toast.error(`Unable to generate report: ${error.message}`);
    },
  });

  const handleOpenDecision = (recommendation: SeoRecommendation) => {
    setSelectedRecommendation(recommendation);
    setDecisionForm({ decision: "approved", notes: "" });
    setDecisionDialogOpen(true);
  };

  const addSiteDisabled = !siteForm.name.trim() || !siteForm.url.trim();
  const reportDisabled = !reportForm.seo_site_id || !reportForm.period_start || !reportForm.period_end;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 p-8">
        <section className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4 flex-col md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                SEO, GEO & AEO Engine
              </div>
              <h1 className="text-3xl font-semibold text-foreground">
                Cynergists SEO, GEO & AEO Engine
              </h1>
              <p className="text-muted-foreground">
                A dedicated optimization system built to continuously improve how your website ranks
                in search engines, geographic results, and AI-powered answer engines. Monitor audits,
                approve recommendations, and track measurable SEO progress.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setSiteDialogOpen(true)} className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Add site
              </Button>
              <Button variant="outline" onClick={() => setReportDialogOpen(true)} className="gap-2">
                <FileText className="h-4 w-4" />
                Generate report
              </Button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-5">
          {[
            { label: "Sites", value: stats.siteCount },
            { label: "Pending reviews", value: stats.pendingRecommendations },
            { label: "Approved fixes", value: stats.approvedRecommendations },
            { label: "Changes applied", value: stats.changesApplied },
            { label: "Reports ready", value: stats.reportsReady },
          ].map((item) => (
            <Card key={item.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-3xl font-semibold text-foreground">{item.value}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Websites</CardTitle>
                <CardDescription>Sites currently monitored by the SEO engine.</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => setSiteDialogOpen(true)}>
                Add site
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <Skeleton className="h-28 w-full" />
              ) : sites.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No SEO sites yet. Add your first site to start auditing.
                </div>
              ) : (
                sites.map((site) => (
                  <div key={site.id} className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" />
                        <p className="font-semibold text-foreground">{site.name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{site.url}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Last audit{" "}
                        {site.last_audit_at
                          ? formatDistanceToNow(new Date(site.last_audit_at), { addSuffix: true })
                          : "not yet run"}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("capitalize", statusStyles[site.status] ?? "text-muted-foreground")}
                    >
                      {formatStatus(site.status)}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Changes</CardTitle>
              <CardDescription>Latest approved optimizations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <Skeleton className="h-28 w-full" />
              ) : changes.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No changes logged yet.
                </div>
              ) : (
                changes.map((change) => (
                  <div key={change.id} className="rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">
                        {change.site?.name ?? "Site update"}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn("capitalize", statusStyles[change.status] ?? "text-muted-foreground")}
                      >
                        {formatStatus(change.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {change.summary ?? "Change details are being compiled."}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {change.applied_at
                        ? `Applied ${formatDistanceToNow(new Date(change.applied_at), { addSuffix: true })}`
                        : "Awaiting deployment"}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Priority Recommendations</CardTitle>
              <CardDescription>Approve or reject the next fixes to deploy.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <Skeleton className="h-28 w-full" />
              ) : recommendations.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Recommendations will appear after the first audit completes.
                </div>
              ) : (
                recommendations.map((rec) => (
                  <div key={rec.id} className="rounded-xl border border-border p-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {rec.site?.name ?? "Site"} - {formatStatus(rec.type)}
                        </p>
                        <p className="text-sm font-semibold text-foreground mt-1">{rec.title}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn("capitalize", statusStyles[rec.status] ?? "text-muted-foreground")}
                      >
                        {formatStatus(rec.status)}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>Impact: {rec.impact_score ?? "N/A"}</span>
                      <span>Effort: {rec.effort ? formatStatus(rec.effort) : "N/A"}</span>
                      <span>
                        Created {formatDistanceToNow(new Date(rec.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {rec.status === "pending" ? (
                        <Button size="sm" onClick={() => handleOpenDecision(rec)} className="gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Review
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          {formatStatus(rec.status)}
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Monthly SEO summaries and downloads.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <Skeleton className="h-28 w-full" />
              ) : reports.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No reports yet. Generate the first monthly summary to get started.
                </div>
              ) : (
                reports.map((report) => (
                  <div key={report.id} className="rounded-xl border border-border p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {report.site?.name ?? "SEO Report"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {report.period_start && report.period_end
                            ? `${format(new Date(report.period_start), "MMM d")} - ${format(
                                new Date(report.period_end),
                                "MMM d, yyyy",
                              )}`
                            : "Custom period"}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn("capitalize", statusStyles[report.status] ?? "text-muted-foreground")}
                      >
                        {formatStatus(report.status)}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>Health score: {report.highlights?.health_score ?? "N/A"}</span>
                      <span>|</span>
                      <span>Created {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="gap-2" asChild>
                        <a href={`/reports/seo/${report.id}`} target="_blank" rel="noreferrer">
                          <FileText className="h-4 w-4" />
                          View report
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2" asChild>
                        <a
                          href={`/api/portal/seo/reports/${report.id}/download`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <FileDown className="h-4 w-4" />
                          Download JSON
                        </a>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      <Dialog open={siteDialogOpen} onOpenChange={setSiteDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Add a site</DialogTitle>
            <DialogDescription>
              Connect a website to start recurring audits and recommendations.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (addSiteDisabled || createSiteMutation.isPending) {
                return;
              }
              createSiteMutation.mutate();
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="site-name">Site name</Label>
              <Input
                id="site-name"
                value={siteForm.name}
                onChange={(event) => setSiteForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Acme.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="site-url">Website URL</Label>
              <Input
                id="site-url"
                value={siteForm.url}
                onChange={(event) => setSiteForm((current) => ({ ...current, url: event.target.value }))}
                placeholder="https://acme.com"
              />
            </div>
            <Button type="submit" disabled={addSiteDisabled || createSiteMutation.isPending} className="w-full">
              {createSiteMutation.isPending ? "Adding..." : "Add site"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={decisionDialogOpen} onOpenChange={setDecisionDialogOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Review recommendation</DialogTitle>
            <DialogDescription>
              Approve or reject this recommendation before it is applied.
            </DialogDescription>
          </DialogHeader>
          {selectedRecommendation ? (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                decisionMutation.mutate();
              }}
            >
              <div className="rounded-lg border border-border p-4 text-sm text-foreground">
                <p className="font-semibold">{selectedRecommendation.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedRecommendation.site?.name ?? "Site"} -{" "}
                  {formatStatus(selectedRecommendation.type)}
                </p>
              </div>
              <div className="grid gap-2">
                <Label>Decision</Label>
                <Select
                  value={decisionForm.decision}
                  onValueChange={(value) => setDecisionForm((current) => ({ ...current, decision: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approve</SelectItem>
                    <SelectItem value="rejected">Reject</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  value={decisionForm.notes}
                  onChange={(event) => setDecisionForm((current) => ({ ...current, notes: event.target.value }))}
                  rows={3}
                  placeholder="Leave internal notes for your team..."
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={decisionMutation.isPending} className="gap-2">
                  {decisionForm.decision === "approved" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {decisionMutation.isPending ? "Saving..." : "Submit decision"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setDecisionDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-sm text-muted-foreground">Select a recommendation to review.</div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Generate report</DialogTitle>
            <DialogDescription>
              Build a summary report for the selected period.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (reportDisabled || reportMutation.isPending) {
                return;
              }
              reportMutation.mutate();
            }}
          >
            <div className="grid gap-2">
              <Label>Site</Label>
              <Select
                value={reportForm.seo_site_id}
                onValueChange={(value) => setReportForm((current) => ({ ...current, seo_site_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Period start</Label>
                <Input
                  type="date"
                  value={reportForm.period_start}
                  onChange={(event) =>
                    setReportForm((current) => ({ ...current, period_start: event.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Period end</Label>
                <Input
                  type="date"
                  value={reportForm.period_end}
                  onChange={(event) =>
                    setReportForm((current) => ({ ...current, period_end: event.target.value }))
                  }
                />
              </div>
            </div>
            <Button type="submit" disabled={reportDisabled || reportMutation.isPending} className="w-full">
              {reportMutation.isPending ? "Generating..." : "Generate report"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
