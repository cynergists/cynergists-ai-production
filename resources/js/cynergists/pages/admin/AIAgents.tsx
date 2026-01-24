import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, router } from "@inertiajs/react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Store, Users, Handshake, Settings, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { CategoryManagerDialog } from "@/components/admin/agents/CategoryManagerDialog";
import { Badge } from "@/components/ui/badge";

type SortField = "name" | "job_title" | "category" | "price" | "is_popular" | "is_active";
type SortDirection = "asc" | "desc";

interface Agent {
  id: string;
  name: string;
  job_title: string | null;
  description: string | null;
  price: number;
  category: string;
  website_category: string[] | null;
  is_popular: boolean;
  is_active: boolean;
}

export default function AIAgents() {
  const queryClient = useQueryClient();
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const { data: agents, isLoading } = useQuery({
    queryKey: ["portal-agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portal_available_agents")
        .select("id, name, job_title, description, price, category, website_category, is_popular, is_active")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Agent[];
    },
  });

  // Sort agents
  const sortedAgents = useMemo(() => {
    if (!agents) return [];
    return [...agents].sort((a, b) => {
      let aVal: string | number | boolean | null = a[sortField];
      let bVal: string | number | boolean | null = b[sortField];
      
      // Handle nulls
      if (aVal === null) aVal = "";
      if (bVal === null) bVal = "";
      
      // Compare
      if (typeof aVal === "boolean") {
        aVal = aVal ? 1 : 0;
        bVal = bVal ? 1 : 0;
      }
      
      if (typeof aVal === "string") {
        const compare = aVal.localeCompare(bVal as string);
        return sortDirection === "asc" ? compare : -compare;
      }
      
      const compare = (aVal as number) - (bVal as number);
      return sortDirection === "asc" ? compare : -compare;
    });
  }, [agents, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    return sortDirection === "asc" 
      ? <ArrowUp className="h-4 w-4 ml-1" />
      : <ArrowDown className="h-4 w-4 ml-1" />;
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("portal_available_agents")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-agents"] });
      toast.success("AI Agent deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete AI Agent: " + error.message);
    },
  });

  const handleEdit = (agent: Agent) => {
    router.visit(`/admin/ai-agents/${agent.id}`);
  };

  const handleAddNew = () => {
    router.visit("/admin/ai-agents/new");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">AI Agents</h1>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add AI Agent
        </Button>
      </div>

      {/* Live Sync Bar */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-lime-500/10 border border-lime-500/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-lime-500 animate-pulse" />
            <span className="text-sm text-lime-400 font-medium">Live sync enabled:</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground hover:text-foreground">
              <Link href="/marketplace" target="_blank">
                <Store className="h-4 w-4 mr-1.5" />
                Marketplace
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground hover:text-foreground">
              <Link href="/portal/browse" target="_blank">
                <Users className="h-4 w-4 mr-1.5" />
                Client
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground hover:text-foreground">
              <Link href="/partner/marketplace" target="_blank">
                <Handshake className="h-4 w-4 mr-1.5" />
                Partner
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button 
                  className="flex items-center hover:text-foreground transition-colors"
                  onClick={() => handleSort("job_title")}
                >
                  Job Title
                  <SortIcon field="job_title" />
                </button>
              </TableHead>
              <TableHead>
                <button 
                  className="flex items-center hover:text-foreground transition-colors"
                  onClick={() => handleSort("name")}
                >
                  Name
                  <SortIcon field="name" />
                </button>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  <button 
                    className="flex items-center hover:text-foreground transition-colors"
                    onClick={() => handleSort("category")}
                  >
                    Category
                    <SortIcon field="category" />
                  </button>
                  <button
                    className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setIsCategoryDialogOpen(true)}
                    title="Manage Categories"
                  >
                    <Settings className="h-3.5 w-3.5" />
                  </button>
                </div>
              </TableHead>
              <TableHead>
                <button 
                  className="flex items-center hover:text-foreground transition-colors"
                  onClick={() => handleSort("price")}
                >
                  Price
                  <SortIcon field="price" />
                </button>
              </TableHead>
              <TableHead>
                <button 
                  className="flex items-center hover:text-foreground transition-colors"
                  onClick={() => handleSort("is_popular")}
                >
                  Popular
                  <SortIcon field="is_popular" />
                </button>
              </TableHead>
              <TableHead>
                <button 
                  className="flex items-center hover:text-foreground transition-colors"
                  onClick={() => handleSort("is_active")}
                >
                  Active
                  <SortIcon field="is_active" />
                </button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : sortedAgents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No AI Agents yet. Click "Add AI Agent" to create one.
                </TableCell>
              </TableRow>
            ) : (
              sortedAgents.map((agent) => (
                <TableRow key={agent.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <button
                      className="text-lime-400 hover:text-lime-300 hover:underline cursor-pointer"
                      onClick={() => handleEdit(agent)}
                    >
                      {agent.job_title || "—"}
                    </button>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span>{agent.name}</span>
                      {agent.is_popular && (
                        <Badge variant="secondary" className="text-xs">Popular</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{agent.category}</TableCell>
                  <TableCell>${agent.price}/mo</TableCell>
                  <TableCell>{agent.is_popular ? "Yes" : "—"}</TableCell>
                  <TableCell>
                    <Badge variant={agent.is_active ? "default" : "secondary"}>
                      {agent.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Are you sure you want to delete this AI Agent?")) {
                          deleteMutation.mutate(agent.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CategoryManagerDialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
      />
    </div>
  );
}
