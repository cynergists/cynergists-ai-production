import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Send } from "lucide-react";
import { toast } from "sonner";
import { usePortalContext } from "@/contexts/PortalContext";
import { apiClient } from "@/lib/api-client";

const categories = [
  "Content",
  "Development",
  "Analytics",
  "Communication",
  "Creative",
  "Automation",
  "Research",
  "Other",
];

export default function Suggest() {
  const { user } = usePortalContext();
  const [formData, setFormData] = useState({
    agent_name: "",
    category: "",
    description: "",
    use_case: "",
  });

  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user?.id) {
        throw new Error("You must be logged in to submit a suggestion");
      }

      await apiClient.post("/api/portal/suggestions", data);
    },
    onSuccess: () => {
      toast.success("Your suggestion has been submitted! We'll review it soon.");
      setFormData({
        agent_name: "",
        category: "",
        description: "",
        use_case: "",
      });
    },
    onError: (error) => {
      toast.error("Failed to submit suggestion: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agent_name || !formData.category || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }
    submitMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Lightbulb className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Suggest an Agent</h1>
          <p className="text-muted-foreground">
            Have an idea for a new AI agent? Let us know!
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submit Your Idea</CardTitle>
          <CardDescription>
            Tell us about the agent you'd like to see in our marketplace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="agent_name">Agent Name / Title *</Label>
              <Input
                id="agent_name"
                value={formData.agent_name}
                onChange={(e) =>
                  setFormData({ ...formData, agent_name: e.target.value })
                }
                placeholder="e.g., Social Media Scheduler"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe what this agent would do..."
                rows={4}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="use_case">How would you use it?</Label>
              <Textarea
                id="use_case"
                value={formData.use_case}
                onChange={(e) =>
                  setFormData({ ...formData, use_case: e.target.value })
                }
                placeholder="Tell us about your specific use case..."
                rows={3}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-lime-500 hover:bg-lime-600 text-black"
              disabled={submitMutation.isPending}
            >
              <Send className="h-4 w-4 mr-2" />
              {submitMutation.isPending ? "Submitting..." : "Submit Suggestion"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Tips for a Great Suggestion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Be specific about what the agent should accomplish</p>
          <p>• Explain the problem it would solve for you</p>
          <p>• Describe your ideal workflow with this agent</p>
          <p>• Include any features that would be essential</p>
        </CardContent>
      </Card>
    </div>
  );
}
