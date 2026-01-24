import { useState, useEffect, useMemo, useCallback } from "react";
import { router, usePage } from "@inertiajs/react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, DollarSign, Calendar, Users, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { DealDrawer } from "@/components/admin/deals/DealDrawer";

interface Deal {
  id: string;
  partner_id: string | null;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  client_company: string | null;
  stage: string;
  deal_value: number;
  expected_close_date: string | null;
  last_activity_at: string | null;
  created_at: string;
  timeline: Array<{ timestamp: string; type: string; message: string }>;
  partners?: { first_name: string | null; last_name: string | null; slug: string } | null;
}

const stageConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; color: string }> = {
  new: { label: "New", variant: "default", color: "bg-blue-500" },
  in_progress: { label: "In Progress", variant: "secondary", color: "bg-yellow-500" },
  closed_won: { label: "Closed Won", variant: "default", color: "bg-green-500" },
  closed_lost: { label: "Closed Lost", variant: "destructive", color: "bg-red-500" },
};

export default function AdminDeals() {
  const { url } = usePage();
  const searchParams = useMemo(() => new URLSearchParams(url.split("?")[1] ?? ""), [url]);
  const setSearchParams = useCallback((params: URLSearchParams) => {
    const query = params.toString();
    router.visit(`/admin/deals${query ? `?${query}` : ""}`, {
      replace: true,
      preserveState: true,
      preserveScroll: true,
    });
  }, []);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchDeals = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('partner_deals')
        .select('*, partners(first_name, last_name, slug)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Cast to handle new columns not yet in generated types
      setDeals((data as unknown as Deal[]) || []);
      
      // Check if dealId is in URL params
      const dealIdParam = searchParams.get('dealId');
      if (dealIdParam && data) {
        const deal = (data as unknown as Deal[]).find(d => d.id === dealIdParam);
        if (deal) {
          setSelectedDeal(deal as Deal);
          setIsDrawerOpen(true);
          // Clear the param
          searchParams.delete('dealId');
          setSearchParams(searchParams);
        }
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
      toast.error("Failed to load deals");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const filteredDeals = deals.filter(d => {
    const matchesSearch = !searchQuery || 
      d.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.client_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.client_company?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === "all" || d.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const dealsByStage = {
    all: filteredDeals,
    new: filteredDeals.filter(d => d.stage === 'new'),
    in_progress: filteredDeals.filter(d => d.stage === 'in_progress'),
    closed_won: filteredDeals.filter(d => d.stage === 'closed_won'),
    closed_lost: filteredDeals.filter(d => d.stage === 'closed_lost'),
  };

  const getPartnerName = (d: Deal) => {
    if (d.partners) {
      return [d.partners.first_name, d.partners.last_name].filter(Boolean).join(' ') || d.partners.slug;
    }
    return null;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  const totalValue = deals.reduce((sum, d) => sum + (d.deal_value || 0), 0);
  const wonValue = deals.filter(d => d.stage === 'closed_won').reduce((sum, d) => sum + (d.deal_value || 0), 0);
  const openDeals = deals.filter(d => ['new', 'in_progress'].includes(d.stage)).length;

  const handleDealUpdate = () => {
    fetchDeals();
  };

  const renderDealsTable = (dealsList: Deal[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Stage</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Close Date</TableHead>
          <TableHead>Partner</TableHead>
          <TableHead>Last Activity</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {dealsList.map((d) => (
          <TableRow 
            key={d.id} 
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => { setSelectedDeal(d); setIsDrawerOpen(true); }}
          >
            <TableCell>
              <Badge variant={stageConfig[d.stage]?.variant || "outline"}>
                {stageConfig[d.stage]?.label || d.stage}
              </Badge>
            </TableCell>
            <TableCell className="font-medium">{d.client_company || '—'}</TableCell>
            <TableCell>{d.client_name}</TableCell>
            <TableCell>{d.client_email || '—'}</TableCell>
            <TableCell>{d.deal_value ? formatCurrency(d.deal_value) : '—'}</TableCell>
            <TableCell>
              {d.expected_close_date ? format(new Date(d.expected_close_date), 'MMM d, yyyy') : 'TBD'}
            </TableCell>
            <TableCell>
              {getPartnerName(d) ? (
                <Badge variant="outline">{getPartnerName(d)}</Badge>
              ) : (
                <span className="text-muted-foreground">Unassigned</span>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {d.last_activity_at ? formatDistanceToNow(new Date(d.last_activity_at), { addSuffix: true }) : '—'}
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {format(new Date(d.created_at), 'MMM d, yyyy')}
            </TableCell>
          </TableRow>
        ))}
        {dealsList.length === 0 && (
          <TableRow>
            <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
              No deals found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Deals Pipeline</h1>
          <p className="text-muted-foreground">Manage partner deals and track progress</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Deals</p>
                <p className="text-2xl font-bold">{deals.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Deals</p>
                <p className="text-2xl font-bold">{openDeals}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pipeline Value</p>
                <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Won Value</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(wonValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by company, contact, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All ({dealsByStage.all.length})</TabsTrigger>
                <TabsTrigger value="new">New ({dealsByStage.new.length})</TabsTrigger>
                <TabsTrigger value="in_progress">In Progress ({dealsByStage.in_progress.length})</TabsTrigger>
                <TabsTrigger value="closed_won">Closed Won ({dealsByStage.closed_won.length})</TabsTrigger>
                <TabsTrigger value="closed_lost">Closed Lost ({dealsByStage.closed_lost.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="overflow-x-auto">
                {renderDealsTable(dealsByStage.all)}
              </TabsContent>
              <TabsContent value="new" className="overflow-x-auto">
                {renderDealsTable(dealsByStage.new)}
              </TabsContent>
              <TabsContent value="in_progress" className="overflow-x-auto">
                {renderDealsTable(dealsByStage.in_progress)}
              </TabsContent>
              <TabsContent value="closed_won" className="overflow-x-auto">
                {renderDealsTable(dealsByStage.closed_won)}
              </TabsContent>
              <TabsContent value="closed_lost" className="overflow-x-auto">
                {renderDealsTable(dealsByStage.closed_lost)}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Deal Drawer */}
      <DealDrawer
        deal={selectedDeal}
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); setSelectedDeal(null); }}
        onUpdate={handleDealUpdate}
      />
    </div>
  );
}
