import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, ArrowLeft, Eye } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@inertiajs/react";
import { AgentFormDialog } from "@/components/admin/agents/AgentFormDialog";

interface Agent {
  id: string;
  name: string;
  job_title: string | null;
  description: string | null;
  price: number;
  category: string;
  icon: string | null;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
}

interface AgentTier {
  price: number;
  description: string;
}

interface AgentFormData {
  name: string;
  job_title: string;
  description: string;
  price: number | "";
  category: string;
  icon: string;
  is_popular: boolean;
  is_active: boolean;
  features: string;
  perfect_for: string;
  integrations: string;
  image_url: string;
  tiers: AgentTier[];
}

export default function ManageAgents() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [formInitialData, setFormInitialData] = useState<Partial<AgentFormData> | undefined>(undefined);

  const { data: agents, isLoading } = useQuery({
    queryKey: ["portal-agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portal_available_agents")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Agent[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: AgentFormData) => {
      const featuresArray = data.features
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);

      // Generate slug from name
      const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      
      const { error } = await supabase.from("portal_available_agents").insert([{
        name: data.name,
        slug: slug,
        job_title: data.job_title || null,
        description: data.description,
        price: typeof data.price === "number" ? data.price : 0,
        category: data.category,
        icon: data.icon,
        is_popular: data.is_popular,
        is_active: data.is_active,
        features: featuresArray,
        tiers: (data.tiers || []) as unknown as Json,
        sort_order: (agents?.length || 0) + 1,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-agents"] });
      toast.success("AI Agent created successfully");
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create AI Agent: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AgentFormData }) => {
      const featuresArray = data.features
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);

      const { error } = await supabase
        .from("portal_available_agents")
        .update({
          name: data.name,
          job_title: data.job_title || null,
          description: data.description,
          price: typeof data.price === "number" ? data.price : 0,
          category: data.category,
          icon: data.icon,
          is_popular: data.is_popular,
          is_active: data.is_active,
          features: featuresArray,
          tiers: (data.tiers || []) as unknown as Json,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-agents"] });
      toast.success("AI Agent updated successfully");
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update AI Agent: " + error.message);
    },
  });

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

  const resetForm = () => {
    setFormInitialData(undefined);
    setEditingAgent(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setFormInitialData({
      name: agent.name,
      job_title: agent.job_title || "",
      description: agent.description || "",
      price: agent.price,
      category: agent.category,
      icon: agent.icon || "bot",
      is_popular: agent.is_popular,
      is_active: agent.is_active,
      features: agent.features?.join("\n") || "",
      perfect_for: "",
      integrations: "",
      image_url: "",
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingAgent(null);
    setFormInitialData(undefined);
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: AgentFormData) => {
    if (editingAgent) {
      updateMutation.mutate({ id: editingAgent.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
                <Link href="/admin/client-portal">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manage AI Agents</h1>
            <p className="text-muted-foreground">
              Configure AI Agents available in the customer marketplace
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/ai-agent-template">
              <Eye className="h-4 w-4 mr-2" />
              Preview Template
            </Link>
          </Button>
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add AI Agent
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Popular</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : agents?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No AI Agents yet. Click "Add AI Agent" to create one.
                </TableCell>
              </TableRow>
            ) : (
              agents?.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell className="font-medium text-lime-400 hover:text-lime-300">
                    {agent.name}
                  </TableCell>
                  <TableCell>{agent.category}</TableCell>
                  <TableCell>${agent.price}/mo</TableCell>
                  <TableCell>{agent.is_popular ? "Yes" : "—"}</TableCell>
                  <TableCell>{agent.is_active ? "Yes" : "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(agent)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
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

      <AgentFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        initialData={formInitialData}
        isEditing={!!editingAgent}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}