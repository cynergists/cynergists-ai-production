import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@cy/components/ui/card';
import { Button } from '@cy/components/ui/button';
import { Switch } from '@cy/components/ui/switch';
import { Label } from '@cy/components/ui/label';
import { Badge } from '@cy/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@cy/components/ui/tabs';
import { Input } from '@cy/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@cy/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@cy/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@cy/components/ui/dialog';
import { ScrollArea } from '@cy/components/ui/scroll-area';
import { Loader2, AlertTriangle, Activity, DollarSign, Users, Bug, RefreshCw, Play, Zap, Eye, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import {
  useTestMode,
  useSetTestMode,
  useWebhookEvents,
  useAttributionEvents,
  useHealthStats,
  useReplayWebhook,
  useGenerateTestEvent,
} from '@cy/hooks/useDebugData';
import { supabase } from '@cy/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export default function AdminDebug() {
  const [webhookStatusFilter, setWebhookStatusFilter] = useState<string>('');
  const [webhookProviderFilter, setWebhookProviderFilter] = useState<string>('');
  const [attributionEventTypeFilter, setAttributionEventTypeFilter] = useState<string>('');
  const [attributionPartnerFilter, setAttributionPartnerFilter] = useState<string>('');
  const [selectedPayload, setSelectedPayload] = useState<any>(null);

  const { data: testMode, isLoading: testModeLoading } = useTestMode();
  const setTestMode = useSetTestMode();
  const { data: healthStats, isLoading: healthLoading, refetch: refetchHealth } = useHealthStats();
  
  const { data: webhookEvents, isLoading: webhooksLoading, refetch: refetchWebhooks } = useWebhookEvents({
    status: webhookStatusFilter || undefined,
    provider: webhookProviderFilter || undefined,
  });
  
  const { data: attributionEvents, isLoading: attributionsLoading, refetch: refetchAttributions } = useAttributionEvents({
    event_type: attributionEventTypeFilter || undefined,
    partner_slug: attributionPartnerFilter || undefined,
  });

  const replayWebhook = useReplayWebhook();
  const generateTestEvent = useGenerateTestEvent();

  // Fetch recent payments for debug view
  const { data: recentPayments, isLoading: paymentsLoading, refetch: refetchPayments } = useQuery({
    queryKey: ['debug-payments'],
    queryFn: async () => {
      const { data, error } = await (supabase.from as any)('payments')
        .select('id, square_payment_id, amount, currency, status, captured_at, refunded_at, deal_id, partner_id')
        .order('captured_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Array<{
        id: string;
        square_payment_id: string;
        amount: number;
        currency: string;
        status: string;
        captured_at: string | null;
        refunded_at: string | null;
        deal_id: string | null;
        partner_id: string | null;
      }>;
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processed':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Processed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'received':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Received</Badge>;
      case 'ignored':
        return <Badge className="bg-muted text-muted-foreground">Ignored</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getEventTypeBadge = (eventType: string) => {
    const colors: Record<string, string> = {
      landing_view: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      form_submit: 'bg-green-500/20 text-green-400 border-green-500/30',
      booked_call: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      paid_checkout: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    };
    return <Badge className={colors[eventType] || 'bg-muted'}>{eventType}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Debug Console | Admin</title>
      </Helmet>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bug className="h-6 w-6" />
            Developer Debug Console
          </h1>
          <p className="text-muted-foreground">Monitor webhooks, attribution events, and system health</p>
        </div>
        
        {/* TEST_MODE Toggle */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="test-mode" className="font-medium">TEST_MODE</Label>
              {testModeLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Switch
                  id="test-mode"
                  checked={testMode || false}
                  onCheckedChange={(checked) => setTestMode.mutate(checked)}
                  disabled={setTestMode.isPending}
                />
              )}
            </div>
            {testMode && (
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                <Zap className="h-3 w-3 mr-1" />
                Test Mode Active
              </Badge>
            )}
          </div>
        </Card>
      </div>

      {/* Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={healthStats?.failedWebhooks24h ? 'border-destructive' : ''}>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Failed Webhooks (24h)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : healthStats?.failedWebhooks24h || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Attribution Events (24h)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : healthStats?.attributionEvents24h || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Commissions Created (24h)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : healthStats?.commissionsCreated24h || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Payouts Created (24h)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : healthStats?.payoutsCreated24h || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Event Generators */}
      {testMode && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Test Event Generator
            </CardTitle>
            <CardDescription>Generate test events for debugging (only available in TEST_MODE)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => generateTestEvent.mutate({ eventType: 'attribution' })}
                disabled={generateTestEvent.isPending}
              >
                {generateTestEvent.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                Generate Test Attribution
              </Button>
              <Button
                variant="outline"
                onClick={() => generateTestEvent.mutate({ eventType: 'payment' })}
                disabled={generateTestEvent.isPending}
              >
                {generateTestEvent.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                Generate Test Payment Webhook
              </Button>
              <Button
                variant="outline"
                onClick={() => generateTestEvent.mutate({ eventType: 'refund' })}
                disabled={generateTestEvent.isPending}
              >
                {generateTestEvent.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                Generate Test Refund Webhook
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Tables */}
      <Tabs defaultValue="webhooks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="webhooks">Webhook Events</TabsTrigger>
          <TabsTrigger value="attribution">Attribution Events</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks" className="space-y-4">
          {/* Webhook Filters */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={webhookStatusFilter} onValueChange={setWebhookStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="processed">Processed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="ignored">Ignored</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <Select value={webhookProviderFilter} onValueChange={setWebhookProviderFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="All providers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All providers</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="ghl">GHL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" onClick={() => refetchWebhooks()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Webhook Table */}
          <Card>
            <CardContent className="pt-4">
              {webhooksLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Provider</TableHead>
                      <TableHead>Event Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Received</TableHead>
                      <TableHead>Processed</TableHead>
                      <TableHead>Error</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {webhookEvents?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No webhook events found
                        </TableCell>
                      </TableRow>
                    ) : (
                      webhookEvents?.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell>
                            <Badge variant="outline">{event.provider}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{event.event_type}</TableCell>
                          <TableCell>{getStatusBadge(event.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(event.received_at), 'MMM d, HH:mm:ss')}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {event.processed_at ? format(new Date(event.processed_at), 'MMM d, HH:mm:ss') : '-'}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-sm text-destructive">
                            {event.error_message || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setSelectedPayload(event.payload_json)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh]">
                                  <DialogHeader>
                                    <DialogTitle>Webhook Payload</DialogTitle>
                                    <DialogDescription>
                                      {event.provider} - {event.event_type}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <ScrollArea className="h-[60vh]">
                                    <pre className="text-xs bg-muted p-4 rounded overflow-auto">
                                      {JSON.stringify(selectedPayload, null, 2)}
                                    </pre>
                                  </ScrollArea>
                                </DialogContent>
                              </Dialog>
                              {event.status === 'failed' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => replayWebhook.mutate(event.id)}
                                  disabled={replayWebhook.isPending}
                                >
                                  <RefreshCw className={`h-4 w-4 ${replayWebhook.isPending ? 'animate-spin' : ''}`} />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attribution" className="space-y-4">
          {/* Attribution Filters */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="space-y-2">
                  <Label>Event Type</Label>
                  <Select value={attributionEventTypeFilter} onValueChange={setAttributionEventTypeFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All types</SelectItem>
                      <SelectItem value="landing_view">Landing View</SelectItem>
                      <SelectItem value="form_submit">Form Submit</SelectItem>
                      <SelectItem value="booked_call">Booked Call</SelectItem>
                      <SelectItem value="paid_checkout">Paid Checkout</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Partner Slug</Label>
                  <Input
                    placeholder="Search slug..."
                    value={attributionPartnerFilter}
                    onChange={(e) => setAttributionPartnerFilter(e.target.value)}
                    className="w-[200px]"
                  />
                </div>
                <Button variant="outline" onClick={() => refetchAttributions()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Attribution Table */}
          <Card>
            <CardContent className="pt-4">
              {attributionsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Type</TableHead>
                      <TableHead>Partner Slug</TableHead>
                      <TableHead>UTM Source</TableHead>
                      <TableHead>Landing Page</TableHead>
                      <TableHead>Cookie</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attributionEvents?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No attribution events found
                        </TableCell>
                      </TableRow>
                    ) : (
                      attributionEvents?.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell>{getEventTypeBadge(event.event_type)}</TableCell>
                          <TableCell className="font-mono text-sm">{event.partner_slug || '-'}</TableCell>
                          <TableCell className="text-sm">{event.utm_source || '-'}</TableCell>
                          <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                            {event.landing_page_url || '-'}
                          </TableCell>
                          <TableCell>
                            {event.cookie_present ? (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Yes</Badge>
                            ) : (
                              <Badge variant="outline">No</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(event.created_at), 'MMM d, HH:mm:ss')}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          {/* Payments Filters */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Recent Payments (Last 50)</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetchPayments()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payments Table */}
          <Card>
            <CardContent className="pt-4">
              {paymentsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Captured</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Deal ID</TableHead>
                      <TableHead>Partner ID</TableHead>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Refunded</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentPayments?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No payments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentPayments?.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="text-sm text-muted-foreground">
                            {payment.captured_at ? format(new Date(payment.captured_at), 'MMM d, HH:mm') : '—'}
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              payment.status === 'captured' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                              payment.status === 'refunded' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                              payment.status === 'partial_refund' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                              payment.status === 'failed' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                              'bg-muted'
                            }>
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            ${payment.amount.toFixed(2)} {payment.currency}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {payment.deal_id ? payment.deal_id.substring(0, 8) + '...' : '—'}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {payment.partner_id ? payment.partner_id.substring(0, 8) + '...' : '—'}
                          </TableCell>
                          <TableCell className="font-mono text-xs max-w-[120px] truncate">
                            {payment.square_payment_id}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {payment.refunded_at ? format(new Date(payment.refunded_at), 'MMM d, HH:mm') : '—'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
