import { ImageUpload } from '@/components/admin/ImageUpload';
import { ProductForm } from '@/components/admin/products/ProductForm';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import {
    useCreatePlan,
    useDeletePlan,
    usePlans,
    useUpdatePlan,
    type Plan,
} from '@/hooks/useAdminQueries';
import { useCategories } from '@/hooks/useCategoriesQueries';
import {
    useProducts,
    useUpdateProduct,
    type Product,
} from '@/hooks/useProductsQueries';
import { Link, router, usePage } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    DollarSign,
    Info,
    LayoutTemplate,
    Loader2,
    Plus,
    Search,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';

// Unified item type for the combined table
interface UnifiedItem {
    id: string;
    name: string;
    sku: string | null;
    status: 'draft' | 'active' | 'hidden' | 'test';
    type: string | null;
    category_id: string | null;
    price: number;
    billing: string;
    url: string | null;
    source: 'plan' | 'product';
    originalData: Plan | Product;
}

type SortField =
    | 'name'
    | 'sku'
    | 'status'
    | 'type'
    | 'category'
    | 'price'
    | 'billing'
    | 'url';
type SortDirection = 'asc' | 'desc';

const defaultColumnWidths: Record<string, number> = {
    name: 180,
    sku: 100,
    status: 110,
    type: 100,
    category: 120,
    price: 90,
    billing: 100,
    url: 160,
};

export default function AdminPlans() {
    const { toast } = useToast();
    const { url } = usePage();
    const searchParams = useMemo(
        () => new URLSearchParams(url.split('?')[1] ?? ''),
        [url],
    );
    const setSearchParams = useCallback((params: Record<string, string>) => {
        const query = new URLSearchParams(params).toString();
        router.visit(`/admin/plans${query ? `?${query}` : ''}`, {
            replace: true,
            preserveState: true,
            preserveScroll: true,
        });
    }, []);
    const { data: plans = [], isLoading: plansLoading } = usePlans();
    const { data: products = [], isLoading: productsLoading } = useProducts();
    const { data: categories = [] } = useCategories();

    const createPlan = useCreatePlan();
    const updatePlan = useUpdatePlan();
    const deletePlan = useDeletePlan();

    const updateProduct = useUpdateProduct();

    const isLoading = plansLoading || productsLoading;

    const getCategoryName = (categoryId: string | null) => {
        if (!categoryId) return '—';
        const category = categories.find((c) => c.id === categoryId);
        return category?.name || '—';
    };

    // Combine plans and products into unified items
    const unifiedItems = useMemo((): UnifiedItem[] => {
        const planItems: UnifiedItem[] = plans.map((plan) => ({
            id: plan.id,
            name: plan.name,
            sku: plan.sku,
            status: plan.status,
            type: plan.type,
            category_id: plan.category_id,
            price: plan.price,
            billing: plan.billing_period,
            url: plan.slug ? `/plans/${plan.slug}` : null,
            source: 'plan' as const,
            originalData: plan,
        }));

        const productItems: UnifiedItem[] = products.map((product) => ({
            id: product.id,
            name: product.product_name,
            sku: product.product_sku,
            status: product.product_status,
            type: product.type,
            category_id: product.category_id,
            price: product.price,
            billing: product.billing_type.replace(/_/g, ' '),
            url: product.url,
            source: 'product' as const,
            originalData: product,
        }));

        return [...planItems, ...productItems];
    }, [plans, products]);

    const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [searchQuery, setSearchQuery] = useState(
        () => searchParams.get('search') || '',
    );
    const [columnWidths, setColumnWidths] = useState(defaultColumnWidths);

    // Sync URL search param with searchQuery state
    useEffect(() => {
        const urlSearch = searchParams.get('search') || '';
        if (urlSearch !== searchQuery && urlSearch) {
            setSearchQuery(urlSearch);
        }
    }, [searchParams]);

    // Update URL when search changes (optional - to keep URL in sync)
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        if (value) {
            setSearchParams({ search: value });
        } else {
            setSearchParams({});
        }
    };
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [planFormData, setPlanFormData] = useState({
        name: '',
        slug: '',
        sku: '',
        description: '',
        price: '' as string | number,
        billing_period: 'monthly',
        url: '',
        features: '',
        status: 'draft' as 'draft' | 'active' | 'hidden' | 'test',
        display_order: '' as string | number,
        image_url: null as string | null,
        category_id: null as string | null,
    });

    // Column resizing state
    const [resizing, setResizing] = useState<string | null>(null);
    const [localWidths, setLocalWidths] = useState<Record<string, number>>({});
    const startXRef = useRef(0);
    const startWidthRef = useRef(0);

    const getColumnWidth = (colKey: string) => {
        if (localWidths[colKey] !== undefined) {
            return localWidths[colKey];
        }
        return columnWidths[colKey] || defaultColumnWidths[colKey] || 150;
    };

    const handleResizeStart = useCallback(
        (e: React.MouseEvent, colKey: string) => {
            e.preventDefault();
            e.stopPropagation();
            setResizing(colKey);
            startXRef.current = e.clientX;
            startWidthRef.current =
                columnWidths[colKey] || defaultColumnWidths[colKey] || 150;

            const handleMouseMove = (moveEvent: MouseEvent) => {
                const delta = moveEvent.clientX - startXRef.current;
                const newWidth = Math.max(50, startWidthRef.current + delta);
                setLocalWidths((prev) => ({ ...prev, [colKey]: newWidth }));
            };

            const handleMouseUp = (upEvent: MouseEvent) => {
                const delta = upEvent.clientX - startXRef.current;
                const finalWidth = Math.max(50, startWidthRef.current + delta);

                setColumnWidths((prev) => ({ ...prev, [colKey]: finalWidth }));

                setLocalWidths((prev) => {
                    const next = { ...prev };
                    delete next[colKey];
                    return next;
                });
                setResizing(null);
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        },
        [columnWidths],
    );

    const isMutating =
        createPlan.isPending || updatePlan.isPending || deletePlan.isPending;

    const resetPlanForm = () => {
        setPlanFormData({
            name: '',
            slug: '',
            sku: '',
            description: '',
            price: '',
            billing_period: 'monthly',
            url: '',
            features: '',
            status: 'hidden',
            display_order: '',
            image_url: null,
            category_id: null,
        });
        setEditingPlan(null);
    };

    const openCreatePlanDialog = () => {
        resetPlanForm();
        setIsPlanDialogOpen(true);
    };

    const openCreateProductDialog = () => {
        setEditingProduct(null);
        setIsProductDialogOpen(true);
    };

    const openEditDialog = (item: UnifiedItem) => {
        if (item.source === 'plan') {
            const plan = item.originalData as Plan;
            setEditingPlan(plan);
            setPlanFormData({
                name: plan.name,
                slug: plan.slug,
                sku: plan.sku || '',
                description: plan.description || '',
                price: plan.price,
                billing_period: plan.billing_period,
                url: plan.url || '',
                features: Array.isArray(plan.features)
                    ? plan.features.join('\n')
                    : '',
                status: plan.status,
                display_order: plan.display_order,
                image_url: plan.image_url || null,
                category_id: plan.category_id || null,
            });
            setIsPlanDialogOpen(true);
        } else {
            setEditingProduct(item.originalData as Product);
            setIsProductDialogOpen(true);
        }
    };

    const handlePlanSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const planData = {
            name: planFormData.name,
            slug: planFormData.slug,
            sku: planFormData.sku || null,
            description: planFormData.description || null,
            price:
                typeof planFormData.price === 'string'
                    ? parseFloat(planFormData.price) || 0
                    : planFormData.price,
            billing_period: planFormData.billing_period,
            url: planFormData.url || null,
            features: planFormData.features.split('\n').filter((f) => f.trim()),
            status: planFormData.status,
            display_order:
                typeof planFormData.display_order === 'string'
                    ? parseInt(planFormData.display_order) || 0
                    : planFormData.display_order,
            image_url: planFormData.image_url,
            category_id: planFormData.category_id,
        };

        try {
            if (editingPlan) {
                await updatePlan.mutateAsync({
                    id: editingPlan.id,
                    ...planData,
                });
            } else {
                await createPlan.mutateAsync(
                    planData as Omit<Plan, 'id' | 'created_at'>,
                );
            }

            toast({
                title: editingPlan ? 'Plan Updated' : 'Plan Created',
                description: `${planFormData.name} has been ${editingPlan ? 'updated' : 'created'} successfully.`,
            });
            setIsPlanDialogOpen(false);
            resetPlanForm();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save plan. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleDeletePlan = async () => {
        if (!editingPlan || deleteConfirmText !== 'Delete') return;

        setIsDeleting(true);
        try {
            await deletePlan.mutateAsync(editingPlan.id);
            toast({
                title: 'Plan Deleted',
                description: `${editingPlan.name} has been deleted.`,
            });
            setIsPlanDialogOpen(false);
            setEditingPlan(null);
            setDeleteConfirmText('');
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete plan. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleStatusChange = async (
        item: UnifiedItem,
        newStatus: 'draft' | 'active' | 'hidden' | 'test',
    ) => {
        try {
            if (item.source === 'plan') {
                await updatePlan.mutateAsync({
                    id: item.id,
                    status: newStatus,
                });
            } else {
                await updateProduct.mutateAsync({
                    id: item.id,
                    product_status: newStatus,
                });
            }
            toast({
                title: 'Status Updated',
                description: `${item.name} status changed to ${newStatus}.`,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update status. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleCategoryChange = async (
        item: UnifiedItem,
        newCategoryId: string | null,
    ) => {
        try {
            if (item.source === 'plan') {
                await updatePlan.mutateAsync({
                    id: item.id,
                    category_id: newCategoryId,
                });
            } else {
                await updateProduct.mutateAsync({
                    id: item.id,
                    category_id: newCategoryId,
                });
            }
            toast({
                title: 'Category Updated',
                description: `${item.name} category changed.`,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update category. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleTypeChange = async (
        item: UnifiedItem,
        newType: string | null,
    ) => {
        try {
            if (item.source === 'plan') {
                await updatePlan.mutateAsync({ id: item.id, type: newType });
            } else {
                await updateProduct.mutateAsync({ id: item.id, type: newType });
            }
            toast({
                title: 'Type Updated',
                description: `${item.name} type changed.`,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update type. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const getTypeLabel = (type: string | null) => {
        if (!type) return '—';
        const labels: Record<string, string> = {
            product: 'Product',
            service: 'Service',
        };
        return labels[type] || type;
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            draft: 'Draft',
            active: 'Active',
            hidden: 'Hidden',
            test: 'Test',
        };
        return labels[status] || status;
    };

    const getBillingLabel = (billing: string) => {
        const labels: Record<string, string> = {
            monthly: 'Monthly',
            quarterly: 'Quarterly',
            annual: 'Annual',
            'one-time': 'One-time',
            'one time': 'One-Time',
            'monthly subscription': 'Monthly',
            'annual subscription': 'Annual',
            'subscription with minimum commitment': 'Subscription',
            'usage based': 'Usage-Based',
        };
        return labels[billing.toLowerCase()] || billing;
    };

    const statusTooltipContent = (
        <div className="max-w-xs space-y-2 text-sm">
            <div>
                <strong>Draft</strong> – Saved but not visible to customers. Not
                live or purchasable.
            </div>
            <div>
                <strong>Active</strong> – Live on the website and available for
                purchase.
            </div>
            <div>
                <strong>Hidden</strong> – Live and fully functional but not
                displayed on the website. Can be accessed via direct link or
                internal use.
            </div>
            <div>
                <strong>Test</strong> – Used only for testing live payment
                flows. Not intended for real customer purchases.
            </div>
        </div>
    );

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) {
            return <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />;
        }
        return sortDirection === 'asc' ? (
            <ArrowUp className="ml-1 h-4 w-4" />
        ) : (
            <ArrowDown className="ml-1 h-4 w-4" />
        );
    };

    // Filter items by search query
    const filteredItems = unifiedItems.filter((item) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        const categoryName = getCategoryName(item.category_id).toLowerCase();
        return (
            item.name.toLowerCase().includes(query) ||
            (item.sku && item.sku.toLowerCase().includes(query)) ||
            item.billing.toLowerCase().includes(query) ||
            item.status.toLowerCase().includes(query) ||
            categoryName.includes(query) ||
            item.source.toLowerCase().includes(query)
        );
    });

    const sortedItems = [...filteredItems].sort((a, b) => {
        const modifier = sortDirection === 'asc' ? 1 : -1;

        switch (sortField) {
            case 'name':
                return modifier * a.name.localeCompare(b.name);
            case 'sku':
                return modifier * (a.sku || '').localeCompare(b.sku || '');
            case 'status':
                return modifier * a.status.localeCompare(b.status);
            case 'type':
                return modifier * (a.type || '').localeCompare(b.type || '');
            case 'category':
                return (
                    modifier *
                    getCategoryName(a.category_id).localeCompare(
                        getCategoryName(b.category_id),
                    )
                );
            case 'price':
                return modifier * (a.price - b.price);
            case 'billing':
                return modifier * a.billing.localeCompare(b.billing);
            case 'url':
                return modifier * (a.url || '').localeCompare(b.url || '');
            default:
                return 0;
        }
    });

    const handleProductSuccess = () => {
        setIsProductDialogOpen(false);
        setEditingProduct(null);
    };

    const handleProductDelete = async (
        productId: string,
        productName: string,
    ) => {
        // This is handled by ProductForm internally
    };

    const ResizeHandle = ({ column }: { column: string }) => (
        <div
            className={`absolute top-0 right-0 h-full w-1 cursor-col-resize transition-colors hover:bg-primary/50 ${
                resizing === column ? 'bg-primary' : 'bg-transparent'
            }`}
            onMouseDown={(e) => handleResizeStart(e, column)}
        />
    );

    return (
        <>
            <Helmet>
                <title>Products | Admin</title>
            </Helmet>

            <div className="flex h-[calc(100vh-64px)] flex-col overflow-hidden">
                {/* Sticky Header Section */}
                <div className="flex-shrink-0 space-y-4 bg-background p-6 pb-4">
                    {/* Header */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">
                                    Products
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {unifiedItems.length} total products
                                </p>
                            </div>

                            {/* View Links */}
                            <div className="flex items-center gap-1 border-l pl-6">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="text-sm"
                                >
                                    All
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        handleSearchChange(e.target.value)
                                    }
                                    className="w-64 pl-9"
                                />
                            </div>

                            <Button asChild variant="outline">
                                <Link href="/admin/product-template">
                                    <LayoutTemplate className="mr-2 h-4 w-4" />
                                    View Template
                                </Link>
                            </Button>

                            <Button onClick={openCreateProductDialog}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Product
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Plan Dialog */}
                <Dialog
                    open={isPlanDialogOpen}
                    onOpenChange={setIsPlanDialogOpen}
                >
                    <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingPlan ? 'Edit Plan' : 'Create New Plan'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handlePlanSubmit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={planFormData.name}
                                        onChange={(e) =>
                                            setPlanFormData({
                                                ...planFormData,
                                                name: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input
                                        id="slug"
                                        value={planFormData.slug}
                                        onChange={(e) =>
                                            setPlanFormData({
                                                ...planFormData,
                                                slug: e.target.value,
                                            })
                                        }
                                        placeholder="unique-identifier"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="sku">SKU</Label>
                                    <Input
                                        id="sku"
                                        value={planFormData.sku}
                                        onChange={(e) =>
                                            setPlanFormData({
                                                ...planFormData,
                                                sku: e.target.value,
                                            })
                                        }
                                        placeholder="PLAN-001"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        value={
                                            planFormData.category_id || 'none'
                                        }
                                        onValueChange={(value) =>
                                            setPlanFormData({
                                                ...planFormData,
                                                category_id:
                                                    value === 'none'
                                                        ? null
                                                        : value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                No Category
                                            </SelectItem>
                                            {categories.map((cat) => (
                                                <SelectItem
                                                    key={cat.id}
                                                    value={cat.id}
                                                >
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={planFormData.description}
                                    onChange={(e) =>
                                        setPlanFormData({
                                            ...planFormData,
                                            description: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Price</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            value={planFormData.price}
                                            onChange={(e) =>
                                                setPlanFormData({
                                                    ...planFormData,
                                                    price: e.target.value,
                                                })
                                            }
                                            placeholder="0.00"
                                            className="pl-9"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="billing_period">
                                        Billing Period
                                    </Label>
                                    <Select
                                        value={planFormData.billing_period}
                                        onValueChange={(value) =>
                                            setPlanFormData({
                                                ...planFormData,
                                                billing_period: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="monthly">
                                                Monthly
                                            </SelectItem>
                                            <SelectItem value="quarterly">
                                                Quarterly
                                            </SelectItem>
                                            <SelectItem value="annual">
                                                Annual
                                            </SelectItem>
                                            <SelectItem value="one-time">
                                                One-time
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="url">Website URL</Label>
                                <Input
                                    id="url"
                                    value={planFormData.url}
                                    onChange={(e) =>
                                        setPlanFormData({
                                            ...planFormData,
                                            url: e.target.value,
                                        })
                                    }
                                    placeholder="/plans/essentials"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={planFormData.status}
                                    onValueChange={(
                                        value:
                                            | 'draft'
                                            | 'active'
                                            | 'hidden'
                                            | 'test',
                                    ) =>
                                        setPlanFormData({
                                            ...planFormData,
                                            status: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">
                                            Draft
                                        </SelectItem>
                                        <SelectItem value="active">
                                            Active
                                        </SelectItem>
                                        <SelectItem value="hidden">
                                            Hidden
                                        </SelectItem>
                                        <SelectItem value="test">
                                            Test
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="features">
                                    Features (one per line)
                                </Label>
                                <Textarea
                                    id="features"
                                    value={planFormData.features}
                                    onChange={(e) =>
                                        setPlanFormData({
                                            ...planFormData,
                                            features: e.target.value,
                                        })
                                    }
                                    rows={5}
                                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                                />
                            </div>

                            <ImageUpload
                                value={planFormData.image_url}
                                onChange={(url) =>
                                    setPlanFormData({
                                        ...planFormData,
                                        image_url: url,
                                    })
                                }
                                label="Plan Image"
                                folder="plans"
                            />

                            {editingPlan && (
                                <div className="mt-4 border-t pt-4">
                                    <div className="space-y-3">
                                        <div className="font-medium text-destructive">
                                            Danger Zone
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Are you sure you want to delete this
                                            Plan? This cannot be undone.
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <Input
                                                placeholder='Type "Delete" to confirm'
                                                value={deleteConfirmText}
                                                onChange={(e) =>
                                                    setDeleteConfirmText(
                                                        e.target.value,
                                                    )
                                                }
                                                className="max-w-[200px]"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                disabled={
                                                    deleteConfirmText !==
                                                        'Delete' || isDeleting
                                                }
                                                onClick={handleDeletePlan}
                                            >
                                                {isDeleting && (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                )}
                                                Delete Plan
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsPlanDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isMutating}>
                                    {isMutating && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {editingPlan ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Product Dialog */}
                <Dialog
                    open={isProductDialogOpen}
                    onOpenChange={setIsProductDialogOpen}
                >
                    <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingProduct
                                    ? 'Edit Product'
                                    : 'Create New Product'}
                            </DialogTitle>
                        </DialogHeader>
                        <ProductForm
                            product={editingProduct}
                            onSuccess={handleProductSuccess}
                            onCancel={() => setIsProductDialogOpen(false)}
                            onDelete={
                                editingProduct ? handleProductDelete : undefined
                            }
                        />
                    </DialogContent>
                </Dialog>

                {/* Scrollable Table Section */}
                <div className="flex-1 overflow-hidden px-6">
                    <div className="h-full overflow-auto rounded-lg border">
                        {isLoading && unifiedItems.length === 0 ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : filteredItems.length === 0 && searchQuery ? (
                            <p className="py-8 text-center text-muted-foreground">
                                No items match your search.
                            </p>
                        ) : unifiedItems.length === 0 ? (
                            <p className="py-8 text-center text-muted-foreground">
                                No items yet. Click "Add Product" to get
                                started.
                            </p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead
                                            className="group relative sticky top-0 z-10 bg-background"
                                            style={{
                                                width: getColumnWidth('name'),
                                                minWidth: 100,
                                            }}
                                        >
                                            <button
                                                className="flex items-center transition-colors hover:text-foreground"
                                                onClick={() =>
                                                    handleSort('name')
                                                }
                                            >
                                                Name {getSortIcon('name')}
                                            </button>
                                            <ResizeHandle column="name" />
                                        </TableHead>
                                        <TableHead
                                            className="group relative"
                                            style={{
                                                width: getColumnWidth('sku'),
                                                minWidth: 80,
                                            }}
                                        >
                                            <button
                                                className="flex items-center transition-colors hover:text-foreground"
                                                onClick={() =>
                                                    handleSort('sku')
                                                }
                                            >
                                                SKU {getSortIcon('sku')}
                                            </button>
                                            <ResizeHandle column="sku" />
                                        </TableHead>
                                        <TableHead
                                            className="group relative"
                                            style={{
                                                width: getColumnWidth('status'),
                                                minWidth: 100,
                                            }}
                                        >
                                            <div className="flex items-center gap-1">
                                                <button
                                                    className="flex items-center transition-colors hover:text-foreground"
                                                    onClick={() =>
                                                        handleSort('status')
                                                    }
                                                >
                                                    Status{' '}
                                                    {getSortIcon('status')}
                                                </button>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Info className="h-4 w-4 cursor-help text-muted-foreground hover:text-foreground" />
                                                        </TooltipTrigger>
                                                        <TooltipContent
                                                            side="top"
                                                            className="max-w-sm"
                                                        >
                                                            {
                                                                statusTooltipContent
                                                            }
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                            <ResizeHandle column="status" />
                                        </TableHead>
                                        <TableHead
                                            className="group relative"
                                            style={{
                                                width: getColumnWidth('type'),
                                                minWidth: 90,
                                            }}
                                        >
                                            <button
                                                className="flex items-center transition-colors hover:text-foreground"
                                                onClick={() =>
                                                    handleSort('type')
                                                }
                                            >
                                                Type {getSortIcon('type')}
                                            </button>
                                            <ResizeHandle column="type" />
                                        </TableHead>
                                        <TableHead
                                            className="group relative"
                                            style={{
                                                width: getColumnWidth(
                                                    'category',
                                                ),
                                                minWidth: 100,
                                            }}
                                        >
                                            <button
                                                className="flex items-center transition-colors hover:text-foreground"
                                                onClick={() =>
                                                    handleSort('category')
                                                }
                                            >
                                                Category{' '}
                                                {getSortIcon('category')}
                                            </button>
                                            <ResizeHandle column="category" />
                                        </TableHead>
                                        <TableHead
                                            className="group relative"
                                            style={{
                                                width: getColumnWidth('price'),
                                                minWidth: 80,
                                            }}
                                        >
                                            <button
                                                className="flex items-center transition-colors hover:text-foreground"
                                                onClick={() =>
                                                    handleSort('price')
                                                }
                                            >
                                                Price {getSortIcon('price')}
                                            </button>
                                            <ResizeHandle column="price" />
                                        </TableHead>
                                        <TableHead
                                            className="group relative"
                                            style={{
                                                width: getColumnWidth(
                                                    'billing',
                                                ),
                                                minWidth: 100,
                                            }}
                                        >
                                            <button
                                                className="flex items-center transition-colors hover:text-foreground"
                                                onClick={() =>
                                                    handleSort('billing')
                                                }
                                            >
                                                Billing {getSortIcon('billing')}
                                            </button>
                                            <ResizeHandle column="billing" />
                                        </TableHead>
                                        <TableHead
                                            className="group relative"
                                            style={{
                                                width: getColumnWidth('url'),
                                                minWidth: 120,
                                            }}
                                        >
                                            <button
                                                className="flex items-center transition-colors hover:text-foreground"
                                                onClick={() =>
                                                    handleSort('url')
                                                }
                                            >
                                                Website URL {getSortIcon('url')}
                                            </button>
                                            <ResizeHandle column="url" />
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedItems.map((item) => (
                                        <TableRow
                                            key={`${item.source}-${item.id}`}
                                        >
                                            <TableCell
                                                style={{
                                                    width: getColumnWidth(
                                                        'name',
                                                    ),
                                                }}
                                            >
                                                <button
                                                    className="text-left font-medium transition-colors hover:text-primary hover:underline"
                                                    onClick={() =>
                                                        openEditDialog(item)
                                                    }
                                                >
                                                    {item.name}
                                                </button>
                                            </TableCell>
                                            <TableCell
                                                className="text-muted-foreground"
                                                style={{
                                                    width: getColumnWidth(
                                                        'sku',
                                                    ),
                                                }}
                                            >
                                                {item.sku || '—'}
                                            </TableCell>
                                            <TableCell
                                                style={{
                                                    width: getColumnWidth(
                                                        'status',
                                                    ),
                                                }}
                                            >
                                                <Select
                                                    value={item.status}
                                                    onValueChange={(
                                                        value:
                                                            | 'draft'
                                                            | 'active'
                                                            | 'hidden'
                                                            | 'test',
                                                    ) =>
                                                        handleStatusChange(
                                                            item,
                                                            value,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="h-8 w-[100px]">
                                                        <SelectValue>
                                                            {getStatusLabel(
                                                                item.status,
                                                            )}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="draft">
                                                            Draft
                                                        </SelectItem>
                                                        <SelectItem value="active">
                                                            Active
                                                        </SelectItem>
                                                        <SelectItem value="hidden">
                                                            Hidden
                                                        </SelectItem>
                                                        <SelectItem value="test">
                                                            Test
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell
                                                style={{
                                                    width: getColumnWidth(
                                                        'type',
                                                    ),
                                                }}
                                            >
                                                <Select
                                                    value={item.type || 'none'}
                                                    onValueChange={(value) =>
                                                        handleTypeChange(
                                                            item,
                                                            value === 'none'
                                                                ? null
                                                                : value,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="h-8 w-[90px]">
                                                        <SelectValue>
                                                            {getTypeLabel(
                                                                item.type,
                                                            )}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">
                                                            —
                                                        </SelectItem>
                                                        <SelectItem value="product">
                                                            Product
                                                        </SelectItem>
                                                        <SelectItem value="service">
                                                            Service
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell
                                                style={{
                                                    width: getColumnWidth(
                                                        'category',
                                                    ),
                                                }}
                                            >
                                                <Select
                                                    value={
                                                        item.category_id ||
                                                        'none'
                                                    }
                                                    onValueChange={(value) =>
                                                        handleCategoryChange(
                                                            item,
                                                            value === 'none'
                                                                ? null
                                                                : value,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="h-8 w-[110px]">
                                                        <SelectValue>
                                                            {getCategoryName(
                                                                item.category_id,
                                                            )}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">
                                                            —
                                                        </SelectItem>
                                                        {categories.map(
                                                            (category) => (
                                                                <SelectItem
                                                                    key={
                                                                        category.id
                                                                    }
                                                                    value={
                                                                        category.id
                                                                    }
                                                                >
                                                                    {
                                                                        category.name
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell
                                                style={{
                                                    width: getColumnWidth(
                                                        'price',
                                                    ),
                                                }}
                                            >
                                                ${item.price.toLocaleString()}
                                            </TableCell>
                                            <TableCell
                                                className="capitalize"
                                                style={{
                                                    width: getColumnWidth(
                                                        'billing',
                                                    ),
                                                }}
                                            >
                                                {getBillingLabel(item.billing)}
                                            </TableCell>
                                            <TableCell
                                                style={{
                                                    width: getColumnWidth(
                                                        'url',
                                                    ),
                                                }}
                                            >
                                                {item.url ? (
                                                    <a
                                                        href={item.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block max-w-[160px] truncate text-primary hover:underline"
                                                    >
                                                        {item.url}
                                                    </a>
                                                ) : (
                                                    '—'
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </div>

                {/* Sticky Pagination Footer */}
                <div className="flex-shrink-0 border-t bg-background px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                Showing {filteredItems.length} of{' '}
                                {unifiedItems.length} products
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
