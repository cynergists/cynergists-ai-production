import { AgentMediaUpload } from '@/components/admin/agents/AgentMediaUpload';
import { AgentPreview } from '@/components/shared/AgentPreview';
import { AIAgentCard } from '@/components/ui/AIAgentCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { callAdminApi } from '@/lib/admin-api';
import { Link, router } from '@inertiajs/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    ArrowLeft,
    Circle,
    Eye,
    Handshake,
    Loader2,
    Plus,
    Store,
    Trash2,
    Users,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

interface MediaItem {
    url: string;
    type: 'image' | 'video';
}

interface AgentTier {
    price: number;
    description: string;
}

interface AgentRecord {
    id: string;
    name: string;
    job_title?: string | null;
    description?: string | null;
    price?: number | null;
    category?: string | null;
    website_category?: string[] | null;
    section_order?: number | null;
    icon?: string | null;
    is_popular?: boolean | null;
    is_active?: boolean | null;
    features?: string[] | null;
    perfect_for?: string[] | null;
    integrations?: string[] | null;
    image_url?: string | null;
    card_media?: MediaItem[] | null;
    product_media?: MediaItem[] | null;
    tiers?: AgentTier[] | null;
}

const WEBSITE_CATEGORIES = [
    'New',
    'Popular',
    'Software',
    'Planned',
    'Roadmap',
    'Beta',
    'Vote',
] as const;

interface FormData {
    name: string;
    job_title: string;
    description: string;
    price: number | '';
    category: string;
    website_categories: string[];
    section_order: number;
    icon: string;
    is_popular: boolean;
    is_active: boolean;
    features: string;
    perfect_for: string;
    integrations: string;
    image_url: string;
    card_media: MediaItem[];
    product_media: MediaItem[];
    tiers: AgentTier[];
}

export default function AIAgentEdit({ id }: { id: string }) {
    const queryClient = useQueryClient();
    const isNew = id === 'new';

    // Fetch categories
    const { data: categories = [] } = useQuery({
        queryKey: ['agent-categories-names'],
        queryFn: async () => {
            const data = await callAdminApi<{ name: string }[]>(
                'get_agent_categories',
            );
            return data.map((category) => category.name);
        },
    });

    // Fetch existing agent if editing
    const { data: existingAgent, isLoading: isLoadingAgent } =
        useQuery<AgentRecord | null>({
            queryKey: ['agent-edit', id],
            queryFn: async () => {
                if (isNew) return null;
                return callAdminApi<AgentRecord | null>('get_ai_agent', { id });
            },
            enabled: !isNew,
        });

    const [formData, setFormData] = useState<FormData>({
        name: '',
        job_title: '',
        description: '',
        price: '',
        category: 'General',
        website_categories: ['New'],
        section_order: 999,
        icon: 'bot',
        is_popular: false,
        is_active: true,
        features: '',
        perfect_for: '',
        integrations: '',
        image_url: '',
        card_media: [],
        product_media: [],
        tiers: [],
    });

    // Manual save state
    const [isSaving, setIsSaving] = useState(false);
    const [previewMode, setPreviewMode] = useState<'product' | 'card'>(
        'product',
    );
    const initialLoadRef = useRef(true);

    // Load existing agent data
    useEffect(() => {
        if (existingAgent) {
            const legacyCardMedia: MediaItem[] = existingAgent.image_url
                ? [{ url: existingAgent.image_url, type: 'image' as const }]
                : [];

            // Parse website_category - could be array or string
            const rawWebsiteCat = existingAgent.website_category;
            const websiteCategories = Array.isArray(rawWebsiteCat)
                ? rawWebsiteCat
                : typeof rawWebsiteCat === 'string'
                  ? [rawWebsiteCat]
                  : ['New'];

            setFormData({
                name: existingAgent.name || '',
                job_title: existingAgent.job_title || '',
                description: existingAgent.description || '',
                price: existingAgent.price ?? '',
                category: existingAgent.category || 'General',
                website_categories: websiteCategories,
                section_order: (existingAgent as any).section_order ?? 999,
                icon: existingAgent.icon || 'bot',
                is_popular: existingAgent.is_popular || false,
                is_active: existingAgent.is_active ?? true,
                features: Array.isArray(existingAgent.features)
                    ? existingAgent.features.join('\n')
                    : '',
                perfect_for: Array.isArray(existingAgent.perfect_for)
                    ? existingAgent.perfect_for.join('\n')
                    : '',
                integrations: Array.isArray(existingAgent.integrations)
                    ? existingAgent.integrations.join('\n')
                    : '',
                image_url: existingAgent.image_url || '',
                card_media: Array.isArray(existingAgent.card_media)
                    ? (existingAgent.card_media as unknown as MediaItem[])
                    : legacyCardMedia,
                product_media: Array.isArray(existingAgent.product_media)
                    ? (existingAgent.product_media as unknown as MediaItem[])
                    : [],
                tiers: Array.isArray(existingAgent.tiers)
                    ? (existingAgent.tiers as unknown as AgentTier[])
                    : [],
            });
            initialLoadRef.current = false;
        }
    }, [existingAgent]);

    // Create preview data from form
    const previewData = useMemo(
        () => ({
            name: formData.name,
            job_title: formData.job_title || null,
            description: formData.description || null,
            category: formData.category,
            website_category: formData.website_categories[0] || 'New',
            features: formData.features
                .split('\n')
                .map((f) => f.trim())
                .filter(Boolean),
            integrations: formData.integrations
                .split('\n')
                .map((f) => f.trim())
                .filter(Boolean),
            image_url: formData.image_url || null,
            product_media: formData.product_media,
            tiers: formData.tiers,
            price: typeof formData.price === 'number' ? formData.price : 0,
        }),
        [formData],
    );

    // Save function
    const performSave = useCallback(async () => {
        if (!formData.name || isNew) return;

        setIsSaving(true);
        try {
            const featuresArray = formData.features
                .split('\n')
                .map((f) => f.trim())
                .filter(Boolean);
            const perfectForArray = formData.perfect_for
                .split('\n')
                .map((f) => f.trim())
                .filter(Boolean);
            const integrationsArray = formData.integrations
                .split('\n')
                .map((f) => f.trim())
                .filter(Boolean);

            const agentData = {
                name: formData.name,
                job_title: formData.job_title || null,
                description: formData.description,
                price: typeof formData.price === 'number' ? formData.price : 0,
                category: formData.category,
                website_category:
                    formData.website_categories.length > 0
                        ? formData.website_categories
                        : ['New'],
                section_order: formData.section_order,
                icon: formData.icon,
                is_popular: formData.is_popular,
                is_active: formData.is_active,
                features: featuresArray,
                perfect_for: perfectForArray,
                integrations: integrationsArray,
                image_url: formData.card_media[0]?.url || '',
                card_media: formData.card_media,
                product_media: formData.product_media,
                tiers: formData.tiers,
            };

            await callAdminApi('update_ai_agent', { id }, agentData);

            toast.success('Agent saved successfully');
            queryClient.invalidateQueries({ queryKey: ['portal-agents'] });
            queryClient.invalidateQueries({ queryKey: ['marketplace-agents'] });
        } catch (error: any) {
            toast.error('Failed to save: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    }, [formData, id, isNew, queryClient]);

    // Create new agent mutation (for new agents only)
    const createMutation = useMutation({
        mutationFn: async () => {
            const featuresArray = formData.features
                .split('\n')
                .map((f) => f.trim())
                .filter(Boolean);
            const perfectForArray = formData.perfect_for
                .split('\n')
                .map((f) => f.trim())
                .filter(Boolean);
            const integrationsArray = formData.integrations
                .split('\n')
                .map((f) => f.trim())
                .filter(Boolean);

            const agentData = {
                name: formData.name,
                job_title: formData.job_title || null,
                description: formData.description,
                price: typeof formData.price === 'number' ? formData.price : 0,
                category: formData.category,
                website_category:
                    formData.website_categories.length > 0
                        ? formData.website_categories
                        : ['New'],
                section_order: formData.section_order,
                icon: formData.icon,
                is_popular: formData.is_popular,
                is_active: formData.is_active,
                features: featuresArray,
                perfect_for: perfectForArray,
                integrations: integrationsArray,
                image_url: formData.card_media[0]?.url || '',
                card_media: formData.card_media,
                product_media: formData.product_media,
                tiers: formData.tiers,
            };

            const slug = formData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
            await callAdminApi('create_ai_agent', undefined, {
                ...agentData,
                slug,
                sort_order: 999,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portal-agents'] });
            toast.success('AI Agent created successfully');
            router.visit('/admin/ai-agents');
        },
        onError: (error) => {
            toast.error('Failed to create AI Agent: ' + error.message);
        },
    });

    const addTier = () => {
        setFormData({
            ...formData,
            tiers: [...formData.tiers, { price: 0, description: '' }],
        });
    };

    const removeTier = (index: number) => {
        setFormData({
            ...formData,
            tiers: formData.tiers.filter((_, i) => i !== index),
        });
    };

    const updateTier = (
        index: number,
        field: keyof AgentTier,
        value: string | number,
    ) => {
        const newTiers = [...formData.tiers];
        newTiers[index] = { ...newTiers[index], [field]: value };
        setFormData({ ...formData, tiers: newTiers });
    };

    if (!isNew && isLoadingAgent) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-lime-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/ai-agents">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {isNew
                                ? 'Create AI Agent'
                                : `Edit: ${existingAgent?.name}`}
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {!isNew && (
                        <Button
                            onClick={performSave}
                            disabled={isSaving || !formData.name}
                            className="bg-lime-500 text-black hover:bg-lime-600"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Agent'
                            )}
                        </Button>
                    )}
                    {isNew && (
                        <Button
                            onClick={() => createMutation.mutate()}
                            disabled={
                                createMutation.isPending || !formData.name
                            }
                            className="bg-lime-500 text-black hover:bg-lime-600"
                        >
                            {createMutation.isPending
                                ? 'Creating...'
                                : 'Create Agent'}
                        </Button>
                    )}
                </div>
            </div>

            {/* Sync indicator with preview toggle */}
            <div className="flex items-center justify-between rounded-lg border border-lime-500/20 bg-lime-500/10 p-3">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-lime-500" />
                    <p className="text-sm text-lime-400">Live sync enabled:</p>
                    <div className="flex gap-2">
                        <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                        >
                            <Link href="/marketplace" target="_blank">
                                <Store className="mr-1 h-3 w-3" />
                                Marketplace
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                        >
                            <Link href="/portal/browse" target="_blank">
                                <Users className="mr-1 h-3 w-3" />
                                Client
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                        >
                            <Link href="/partner/marketplace" target="_blank">
                                <Handshake className="mr-1 h-3 w-3" />
                                Partner
                            </Link>
                        </Button>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        <span>Live Preview</span>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={
                                previewMode === 'product'
                                    ? 'default'
                                    : 'outline'
                            }
                            size="sm"
                            onClick={() => setPreviewMode('product')}
                        >
                            Agent Product Page
                        </Button>
                        <Button
                            variant={
                                previewMode === 'card' ? 'default' : 'outline'
                            }
                            size="sm"
                            onClick={() => setPreviewMode('card')}
                        >
                            Agent Player Card
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main content: Form + Preview side by side */}
            <div className="grid gap-8 xl:grid-cols-[400px_1fr]">
                {/* Left side - Form (narrow) */}
                <Card className="h-fit">
                    <CardContent className="p-6">
                        <ScrollArea className="h-[calc(100vh-280px)]">
                            <div className="space-y-6 pr-4">
                                {/* Agent Player Card Media */}
                                <div className="space-y-2">
                                    <Label className="text-base font-semibold">
                                        Agent Player Card
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Media shown on the agent card in
                                        listings
                                    </p>
                                    <AgentMediaUpload
                                        media={formData.card_media}
                                        onChange={(card_media) =>
                                            setFormData({
                                                ...formData,
                                                card_media,
                                            })
                                        }
                                        agentName={formData.name}
                                        maxItems={1}
                                    />
                                </div>

                                {/* Agent Product Page Media */}
                                <div className="space-y-2">
                                    <Label className="text-base font-semibold">
                                        Agent Product Page
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Media shown on the agent's detail page
                                    </p>
                                    <AgentMediaUpload
                                        media={formData.product_media}
                                        onChange={(product_media) =>
                                            setFormData({
                                                ...formData,
                                                product_media,
                                            })
                                        }
                                        agentName={formData.name}
                                        maxItems={1}
                                    />
                                </div>

                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        AI Agent Name *
                                    </Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g., Mosaic"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                name: e.target.value,
                                            })
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
                                            setFormData({
                                                ...formData,
                                                job_title: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">
                                        Short Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Summarize what this AI Agent does..."
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                description: e.target.value,
                                            })
                                        }
                                        rows={3}
                                    />
                                </div>

                                {/* Categories row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Product Category</Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={(value) =>
                                                setFormData({
                                                    ...formData,
                                                    category: value,
                                                })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem
                                                        key={cat}
                                                        value={cat}
                                                    >
                                                        {cat}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Website Sections</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Select where this agent appears
                                        </p>
                                        <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/30 p-3">
                                            {WEBSITE_CATEGORIES.map((cat) => {
                                                const isSelected =
                                                    formData.website_categories.includes(
                                                        cat,
                                                    );
                                                return (
                                                    <label
                                                        key={cat}
                                                        className={`flex cursor-pointer items-center gap-2 rounded p-2 transition-colors ${
                                                            isSelected
                                                                ? 'border border-lime-500/40 bg-lime-500/20'
                                                                : 'hover:bg-muted'
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={(e) => {
                                                                const newCategories =
                                                                    e.target
                                                                        .checked
                                                                        ? [
                                                                              ...formData.website_categories,
                                                                              cat,
                                                                          ]
                                                                        : formData.website_categories.filter(
                                                                              (
                                                                                  c,
                                                                              ) =>
                                                                                  c !==
                                                                                  cat,
                                                                          );
                                                                setFormData({
                                                                    ...formData,
                                                                    website_categories:
                                                                        newCategories,
                                                                });
                                                            }}
                                                            className="rounded border-muted-foreground/50"
                                                        />
                                                        <span className="text-sm">
                                                            {cat}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Toggles */}
                                <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/50 p-4">
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            id="is_popular"
                                            checked={formData.is_popular}
                                            onCheckedChange={(checked) =>
                                                setFormData({
                                                    ...formData,
                                                    is_popular: checked,
                                                })
                                            }
                                        />
                                        <Label htmlFor="is_popular">
                                            Popular
                                        </Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            id="is_active"
                                            checked={formData.is_active}
                                            onCheckedChange={(checked) =>
                                                setFormData({
                                                    ...formData,
                                                    is_active: checked,
                                                })
                                            }
                                        />
                                        <Label htmlFor="is_active">
                                            Active
                                        </Label>
                                    </div>
                                </div>

                                {/* Base Price */}
                                <div className="space-y-2">
                                    <Label htmlFor="price">
                                        Base Price ($/month)
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Used when no tiers are defined
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-bold text-primary">
                                            $
                                        </span>
                                        <Input
                                            id="price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    price:
                                                        e.target.value === ''
                                                            ? ''
                                                            : parseFloat(
                                                                  e.target
                                                                      .value,
                                                              ) || 0,
                                                })
                                            }
                                        />
                                        <span className="text-muted-foreground">
                                            /mo
                                        </span>
                                    </div>
                                </div>

                                {/* Tiers Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Pricing Tiers</Label>
                                            <p className="text-xs text-muted-foreground">
                                                Add tiers for slider-based
                                                pricing
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addTier}
                                        >
                                            <Plus className="mr-1 h-4 w-4" />
                                            Add Tier
                                        </Button>
                                    </div>

                                    {formData.tiers.length === 0 ? (
                                        <div className="rounded-lg border border-dashed border-border/50 p-4 text-center">
                                            <p className="text-sm text-muted-foreground">
                                                No tiers defined
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {formData.tiers.map(
                                                (tier, index) => (
                                                    <Card
                                                        key={index}
                                                        className="bg-muted/30"
                                                    >
                                                        <CardContent className="p-4">
                                                            <div className="flex items-start gap-3">
                                                                <Circle className="mt-3 h-3 w-3 shrink-0 fill-lime-400 text-lime-400" />
                                                                <div className="flex-1 space-y-3">
                                                                    <div className="grid grid-cols-2 gap-3">
                                                                        <div>
                                                                            <Label className="text-xs">
                                                                                Price
                                                                                ($/mo)
                                                                            </Label>
                                                                            <Input
                                                                                type="number"
                                                                                min="0"
                                                                                value={
                                                                                    tier.price ||
                                                                                    ''
                                                                                }
                                                                                onChange={(
                                                                                    e,
                                                                                ) =>
                                                                                    updateTier(
                                                                                        index,
                                                                                        'price',
                                                                                        parseFloat(
                                                                                            e
                                                                                                .target
                                                                                                .value,
                                                                                        ) ||
                                                                                            0,
                                                                                    )
                                                                                }
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <Label className="text-xs">
                                                                                Description
                                                                            </Label>
                                                                            <Input
                                                                                placeholder="e.g., 1 Website"
                                                                                value={
                                                                                    tier.description
                                                                                }
                                                                                onChange={(
                                                                                    e,
                                                                                ) =>
                                                                                    updateTier(
                                                                                        index,
                                                                                        'description',
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                    )
                                                                                }
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() =>
                                                                        removeTier(
                                                                            index,
                                                                        )
                                                                    }
                                                                    className="shrink-0"
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                </Button>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ),
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Features */}
                                <div className="space-y-2">
                                    <Label htmlFor="features">
                                        What's Included (one per line)
                                    </Label>
                                    <Textarea
                                        id="features"
                                        placeholder="Feature one&#10;Feature two&#10;Feature three"
                                        value={formData.features}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                features: e.target.value,
                                            })
                                        }
                                        rows={4}
                                    />
                                </div>

                                {/* Integrations */}
                                <div className="space-y-2">
                                    <Label htmlFor="integrations">
                                        Integrations (one per line)
                                    </Label>
                                    <Textarea
                                        id="integrations"
                                        placeholder="Slack&#10;Zapier&#10;Google Workspace"
                                        value={formData.integrations}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                integrations: e.target.value,
                                            })
                                        }
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Right side - Live Preview (wide) */}
                <div className="space-y-4">
                    <Card className="overflow-hidden">
                        <CardContent className="p-6 md:p-8">
                            {previewMode === 'product' ? (
                                <AgentPreview agent={previewData} isAdmin />
                            ) : (
                                <div className="flex justify-center py-8">
                                    <AIAgentCard
                                        agent={{
                                            id: id || 'preview',
                                            name: formData.name || 'Agent Name',
                                            slug:
                                                formData.name
                                                    ?.toLowerCase()
                                                    .replace(/\s+/g, '-') ||
                                                'preview',
                                            description:
                                                formData.description || null,
                                            job_title:
                                                formData.job_title || null,
                                            price:
                                                typeof formData.price ===
                                                'number'
                                                    ? formData.price
                                                    : 0,
                                            category: formData.category,
                                            icon: formData.icon || 'bot',
                                            features: formData.features
                                                .split('\n')
                                                .filter(Boolean),
                                            is_popular: formData.is_popular,
                                            is_active: formData.is_active,
                                            card_media: formData.card_media,
                                        }}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
