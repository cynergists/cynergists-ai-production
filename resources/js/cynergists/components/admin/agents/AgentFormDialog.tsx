import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AgentMediaUpload } from "./AgentMediaUpload";
import { Card, CardContent } from "@/components/ui/card";

interface MediaItem {
  url: string;
  type: "image" | "video";
}

interface AgentTier {
  price: number;
  description: string;
}

const WEBSITE_CATEGORIES = ["New", "Popular", "Software", "Planned", "Roadmap", "Beta", "Vote"] as const;

interface AgentFormData {
  name: string;
  job_title: string;
  description: string;
  price: number | "";
  category: string;
  website_category: string;
  icon: string;
  is_popular: boolean;
  is_active: boolean;
  features: string;
  perfect_for: string;
  integrations: string;
  image_url: string;
  media: MediaItem[];
  card_media: MediaItem[];
  product_media: MediaItem[];
  tiers: AgentTier[];
}

interface AgentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AgentFormData) => void;
  initialData?: Partial<AgentFormData>;
  isEditing?: boolean;
  isLoading?: boolean;
}

export function AgentFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isEditing = false,
  isLoading = false,
}: AgentFormDialogProps) {
  // Fetch categories from database
  const { data: categories = [] } = useQuery({
    queryKey: ["agent-categories-names"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_categories")
        .select("name")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data.map(c => c.name);
    },
  });
  const [formData, setFormData] = useState<AgentFormData>({
    name: "",
    job_title: "",
    description: "",
    price: "",
    category: "General",
    website_category: "New",
    icon: "bot",
    is_popular: false,
    is_active: true,
    features: "",
    perfect_for: "",
    integrations: "",
    image_url: "",
    media: [],
    card_media: [],
    product_media: [],
    tiers: [],
  });

  // Reset form when dialog opens with new data
  useEffect(() => {
    if (open) {
      // Convert legacy image_url to card_media array if needed
      const legacyCardMedia: MediaItem[] = initialData?.image_url 
        ? [{ url: initialData.image_url, type: "image" as const }]
        : [];
      
      setFormData({
        name: initialData?.name || "",
        job_title: initialData?.job_title || "",
        description: initialData?.description || "",
        price: initialData?.price ?? "",
        category: initialData?.category || "General",
        website_category: (initialData as any)?.website_category || "New",
        icon: initialData?.icon || "bot",
        is_popular: initialData?.is_popular || false,
        is_active: initialData?.is_active ?? true,
        features: initialData?.features || "",
        perfect_for: initialData?.perfect_for || "",
        integrations: initialData?.integrations || "",
        image_url: initialData?.image_url || "",
        media: initialData?.media || [],
        card_media: initialData?.card_media || legacyCardMedia,
        product_media: initialData?.product_media || [],
        tiers: initialData?.tiers || [],
      });
    }
  }, [open, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Set image_url from first card_media item for backwards compatibility
    const dataToSubmit = {
      ...formData,
      image_url: formData.card_media[0]?.url || "",
    };
    onSubmit(dataToSubmit);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const addTier = () => {
    const newTier: AgentTier = {
      price: 0,
      description: "",
    };
    setFormData({ ...formData, tiers: [...formData.tiers, newTier] });
  };

  const removeTier = (index: number) => {
    const newTiers = formData.tiers.filter((_, i) => i !== index);
    setFormData({ ...formData, tiers: newTiers });
  };

  const updateTier = (index: number, field: keyof AgentTier, value: string | number) => {
    const newTiers = [...formData.tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setFormData({ ...formData, tiers: newTiers });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[950px] max-h-[90vh] p-0 flex flex-col overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50 flex-shrink-0">
            <DialogTitle className="text-xl font-bold">
              {isEditing ? "Edit AI Agent" : "Add New AI Agent"}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[calc(90vh-180px)]">
            <div className="grid lg:grid-cols-2 gap-8 px-8 py-4">
              {/* Left Column - Media & Basic Info */}
              <div className="space-y-6">
                {/* Agent Player Card Media */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Agent Player Card</Label>
                  <p className="text-xs text-muted-foreground">
                    Media shown on the agent card in listings. Add multiple for a carousel.
                  </p>
                  <AgentMediaUpload
                    media={formData.card_media}
                    onChange={(card_media) => setFormData({ ...formData, card_media })}
                    agentName={formData.name}
                  />
                </div>

                {/* Agent Product Page Media */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Agent Product Page</Label>
                  <p className="text-xs text-muted-foreground">
                    Media shown on the agent's detail page. Add multiple for a carousel.
                  </p>
                  <AgentMediaUpload
                    media={formData.product_media}
                    onChange={(product_media) => setFormData({ ...formData, product_media })}
                    agentName={formData.name}
                  />
                </div>

                {/* Product Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Product Category</Label>
                  <p className="text-xs text-muted-foreground">
                    The type of product (e.g., Content, Software, Growth)
                  </p>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
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

                {/* Website Category */}
                <div className="space-y-2">
                  <Label htmlFor="website_category">Website Category</Label>
                  <p className="text-xs text-muted-foreground">
                    Where this appears on the website (e.g., New, Popular, Planned)
                  </p>
                  <Select
                    value={formData.website_category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, website_category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WEBSITE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Toggles */}
                <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_popular"
                      checked={formData.is_popular}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_popular: checked })
                      }
                    />
                    <Label htmlFor="is_popular">Mark as Popular</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_active: checked })
                      }
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                </div>

                {/* Features (Static for all tiers) */}
                <div className="space-y-2">
                  <Label htmlFor="features">What's Included (one per line)</Label>
                  <p className="text-xs text-muted-foreground">
                    These features apply to all tiers
                  </p>
                  <Textarea
                    id="features"
                    placeholder="Feature item one&#10;Feature item two&#10;Feature item three"
                    value={formData.features}
                    onChange={(e) =>
                      setFormData({ ...formData, features: e.target.value })
                    }
                    rows={4}
                  />
                </div>

                {/* Integrations */}
                <div className="space-y-2">
                  <Label htmlFor="integrations">Integrations (one per line)</Label>
                  <Textarea
                    id="integrations"
                    placeholder="Slack&#10;Zapier&#10;Google Workspace"
                    value={formData.integrations}
                    onChange={(e) =>
                      setFormData({ ...formData, integrations: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </div>

              {/* Right Column - Details & Tiers */}
              <div className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">AI Agent Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Mosaic"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Job Title */}
                <div className="space-y-2">
                  <Label htmlFor="job_title">Job Title</Label>
                  <Input
                    id="job_title"
                    placeholder="e.g., Content Writer Pro"
                    value={formData.job_title}
                    onChange={(e) =>
                      setFormData({ ...formData, job_title: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    A short title that appears under the agent name
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Short Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Summarize what this AI Agent does and its key value proposition..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                {/* Base Price (for agents without tiers) */}
                <div className="space-y-2">
                  <Label htmlFor="price">Base Price ($/month)</Label>
                  <p className="text-xs text-muted-foreground">
                    Used when no tiers are defined
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">$</span>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      className="text-xl font-bold"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: e.target.value === "" ? "" : parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>

                {/* Tiers Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Pricing Tiers</Label>
                      <p className="text-xs text-muted-foreground">
                        Add tiers to enable slider-based pricing
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTier}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Tier
                    </Button>
                  </div>

                  {formData.tiers.length === 0 ? (
                    <div className="p-4 rounded-lg border border-dashed border-border/50 text-center">
                      <p className="text-sm text-muted-foreground">
                        No tiers defined. Click "Add Tier" to enable tiered pricing.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.tiers.map((tier, index) => (
                        <Card key={index} className="bg-muted/30">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {/* Tier indicator dot */}
                              <div className="flex items-center justify-center w-6 h-6 mt-1 shrink-0">
                                <Circle className="h-3 w-3 fill-lime-400 text-lime-400" />
                              </div>
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                  <div className="flex-1 space-y-1">
                                    <Label className="text-xs">Price ($/mo)</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      placeholder="0"
                                      value={tier.price || ""}
                                      onChange={(e) =>
                                        updateTier(
                                          index,
                                          "price",
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Tier Description</Label>
                                  <Input
                                    placeholder="e.g., 1 Website and 1 Domain"
                                    value={tier.description}
                                    onChange={(e) =>
                                      updateTier(index, "description", e.target.value)
                                    }
                                  />
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="shrink-0 text-muted-foreground hover:text-destructive"
                                onClick={() => removeTier(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t border-border/50 flex-shrink-0">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isEditing ? "Update AI Agent" : "Create AI Agent"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
