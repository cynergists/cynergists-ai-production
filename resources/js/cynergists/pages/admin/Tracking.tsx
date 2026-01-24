import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSessionTracking, usePageViews, usePlanInteractions } from "@/hooks/useAdminQueries";
import { Loader2 } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function AdminTracking() {
  const { data: sessions = [], isLoading: loadingSessions } = useSessionTracking();
  const { data: pageViews = [], isLoading: loadingPageViews } = usePageViews();
  const { data: interactions = [], isLoading: loadingInteractions } = usePlanInteractions();

  const isLoading = loadingSessions || loadingPageViews || loadingInteractions;

  const formatDate = (date: string) => {
    return formatDateTime(date);
  };

  const truncate = (str: string | null, length: number) => {
    if (!str) return "-";
    return str.length > length ? str.substring(0, length) + "..." : str;
  };

  return (
    <>
      <Helmet>
        <title>Analytics | Admin</title>
      </Helmet>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics & Tracking</h1>
          <p className="text-muted-foreground">View session data, page views, and plan interactions</p>
        </div>

        <Tabs defaultValue="sessions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sessions">Sessions ({sessions.length})</TabsTrigger>
            <TabsTrigger value="pageviews">Page Views ({pageViews.length})</TabsTrigger>
            <TabsTrigger value="interactions">Plan Interactions ({interactions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSessions && sessions.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : sessions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No sessions recorded yet. Sessions will appear as users visit your site.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Session ID</TableHead>
                          <TableHead>Landing Page</TableHead>
                          <TableHead>Referrer</TableHead>
                          <TableHead>IP Address</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sessions.map((sessionItem) => (
                          <TableRow key={sessionItem.id}>
                            <TableCell className="font-mono text-xs">
                              {sessionItem.session_id.substring(0, 8)}...
                            </TableCell>
                            <TableCell>{truncate(sessionItem.landing_page, 30)}</TableCell>
                            <TableCell>{truncate(sessionItem.referrer, 30)}</TableCell>
                            <TableCell>{sessionItem.ip_address || "-"}</TableCell>
                            <TableCell>{formatDate(sessionItem.created_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pageviews">
            <Card>
              <CardHeader>
                <CardTitle>Recent Page Views</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingPageViews && pageViews.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : pageViews.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No page views recorded yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Session ID</TableHead>
                          <TableHead>Page Path</TableHead>
                          <TableHead>Page Title</TableHead>
                          <TableHead>Time on Page</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pageViews.map((view) => (
                          <TableRow key={view.id}>
                            <TableCell className="font-mono text-xs">
                              {view.session_id.substring(0, 8)}...
                            </TableCell>
                            <TableCell>{view.page_path}</TableCell>
                            <TableCell>{truncate(view.page_title, 30)}</TableCell>
                            <TableCell>{view.time_on_page}s</TableCell>
                            <TableCell>{formatDate(view.created_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interactions">
            <Card>
              <CardHeader>
                <CardTitle>Plan Interactions</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingInteractions && interactions.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : interactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No plan interactions recorded yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Session ID</TableHead>
                          <TableHead>Plan Name</TableHead>
                          <TableHead>Interaction</TableHead>
                          <TableHead>Page</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {interactions.map((interaction) => (
                          <TableRow key={interaction.id}>
                            <TableCell className="font-mono text-xs">
                              {interaction.session_id.substring(0, 8)}...
                            </TableCell>
                            <TableCell className="font-medium">{interaction.plan_name}</TableCell>
                            <TableCell className="capitalize">{interaction.interaction_type}</TableCell>
                            <TableCell>{truncate(interaction.page_path, 20)}</TableCell>
                            <TableCell>{formatDate(interaction.created_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
