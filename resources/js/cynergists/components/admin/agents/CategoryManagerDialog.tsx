import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, Tag, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Category {
  id: string;
  name: string;
  display_order: number;
}

interface Agent {
  id: string;
  name: string;
  category: string;
}

interface CategoryManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoryManagerDialog({ open, onOpenChange }: CategoryManagerDialogProps) {
  const queryClient = useQueryClient();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [affectedAgents, setAffectedAgents] = useState<Agent[]>([]);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["agent-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_categories")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as Category[];
    },
  });

  const { data: agents } = useQuery({
    queryKey: ["portal-agents-for-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portal_available_agents")
        .select("id, name, category");
      if (error) throw error;
      return data as Agent[];
    },
  });

  const addCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const maxOrder = categories?.reduce((max, cat) => Math.max(max, cat.display_order), 0) || 0;
      const { error } = await supabase.from("agent_categories").insert([{
        name,
        display_order: maxOrder + 1,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-categories"] });
      queryClient.invalidateQueries({ queryKey: ["agent-categories-names"] });
      setNewCategoryName("");
      toast.success("Category added successfully");
    },
    onError: (error: Error) => {
      if (error.message.includes("duplicate")) {
        toast.error("A category with this name already exists");
      } else {
        toast.error("Failed to add category: " + error.message);
      }
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (category: Category) => {
      // First, update any agents using this category to "General"
      const { error: updateError } = await supabase
        .from("portal_available_agents")
        .update({ category: "General" })
        .eq("category", category.name);
      
      if (updateError) throw updateError;

      // Then delete the category
      const { error: deleteError } = await supabase
        .from("agent_categories")
        .delete()
        .eq("id", category.id);
      
      if (deleteError) throw deleteError;
      
      return affectedAgents.length;
    },
    onSuccess: (updatedCount) => {
      queryClient.invalidateQueries({ queryKey: ["agent-categories"] });
      queryClient.invalidateQueries({ queryKey: ["agent-categories-names"] });
      queryClient.invalidateQueries({ queryKey: ["portal-agents"] });
      queryClient.invalidateQueries({ queryKey: ["portal-agents-for-categories"] });
      setCategoryToDelete(null);
      setAffectedAgents([]);
      if (updatedCount > 0) {
        toast.success(`Category deleted. ${updatedCount} agent(s) moved to "General"`);
      } else {
        toast.success("Category deleted successfully");
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to delete category: " + error.message);
    },
  });

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    addCategoryMutation.mutate(newCategoryName.trim());
  };

  const handleDeleteClick = (category: Category) => {
    // Check if any agents use this category
    const agentsWithCategory = agents?.filter(a => a.category === category.name) || [];
    setAffectedAgents(agentsWithCategory);
    setCategoryToDelete(category);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteCategoryMutation.mutate(categoryToDelete);
    }
  };

  const isProtectedCategory = (name: string) => name === "General";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Manage Categories
            </DialogTitle>
            <DialogDescription>
              Add or remove categories for AI Agents
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Add new category */}
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <Input
                placeholder="New category name..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={!newCategoryName.trim() || addCategoryMutation.isPending}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </form>

            {/* Category list */}
            <div className="border rounded-lg">
              <ScrollArea className="h-[300px]">
                <div className="p-2 space-y-1">
                  {isLoading ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
                  ) : categories?.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No categories</p>
                  ) : (
                    categories?.map((category) => {
                      const agentCount = agents?.filter(a => a.category === category.name).length || 0;
                      return (
                        <div
                          key={category.id}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{category.name}</span>
                            {agentCount > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {agentCount} agent{agentCount !== 1 ? "s" : ""}
                              </Badge>
                            )}
                            {isProtectedCategory(category.name) && (
                              <Badge variant="outline" className="text-xs">
                                Default
                              </Badge>
                            )}
                          </div>
                          {!isProtectedCategory(category.name) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteClick(category)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {affectedAgents.length > 0 && (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              )}
              Delete "{categoryToDelete?.name}" category?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                {affectedAgents.length > 0 ? (
                  <>
                    <p className="text-amber-600 dark:text-amber-400 font-medium">
                      This category is currently being used by {affectedAgents.length} agent{affectedAgents.length !== 1 ? "s" : ""}:
                    </p>
                    <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                      {affectedAgents.map((agent) => (
                        <div key={agent.id} className="text-sm font-medium">
                          • {agent.name}
                        </div>
                      ))}
                    </div>
                    <p>
                      If you proceed, these agents will be moved to the <strong>"General"</strong> category.
                    </p>
                  </>
                ) : (
                  <p>This category is not being used by any agents.</p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {affectedAgents.length > 0 
                ? `Delete & Move ${affectedAgents.length} Agent${affectedAgents.length !== 1 ? "s" : ""}`
                : "Delete Category"
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
