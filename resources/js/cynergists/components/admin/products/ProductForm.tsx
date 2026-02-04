import { ImageUpload } from '@/components/admin/ImageUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCategories } from '@/hooks/useCategoriesQueries';
import {
    useCreateProduct,
    useUpdateProduct,
    type Product,
} from '@/hooks/useProductsQueries';
import { DollarSign, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ProductFormProps {
    product: Product | null;
    onSuccess: () => void;
    onCancel: () => void;
    onDelete?: (productId: string, productName: string) => Promise<void>;
}

type BillingType =
    | 'one_time'
    | 'monthly_subscription'
    | 'annual_subscription'
    | 'subscription_with_minimum_commitment'
    | 'usage_based';
type ProductStatus = 'draft' | 'active' | 'hidden' | 'test';
type ProductType = 'plan' | 'product' | 'service';

interface FormData {
    product_name: string;
    product_sku: string;
    slug: string;
    short_description: string;
    price: number;
    billing_type: BillingType;
    url: string;
    product_status: ProductStatus;
    full_description: string;
    image_url: string | null;
    category_id: string | null;
    type: ProductType;
}

export function ProductForm({
    product,
    onSuccess,
    onCancel,
    onDelete,
}: ProductFormProps) {
    const { toast } = useToast();
    const createProduct = useCreateProduct();
    const updateProduct = useUpdateProduct();
    const { data: categories = [] } = useCategories();
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        product_name: product?.product_name || '',
        product_sku: product?.product_sku || '',
        slug: product?.slug || '',
        short_description: product?.short_description || '',
        price: product?.price ?? ('' as unknown as number),
        billing_type: product?.billing_type || 'one_time',
        url: product?.url || '',
        product_status: product?.product_status || 'draft',
        full_description: product?.full_description || '',
        image_url: product?.image_url || null,
        category_id: product?.category_id || null,
        type: (product?.type as ProductType) || 'product',
    });

    const isMutating = createProduct.isPending || updateProduct.isPending;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const productData = {
            product_name: formData.product_name,
            product_sku: formData.product_sku || null,
            slug: formData.slug || null,
            short_description: formData.short_description || null,
            full_description: formData.full_description || null,
            price: formData.price,
            billing_type: formData.billing_type,
            url: formData.url || null,
            product_status: formData.product_status,
            image_url: formData.image_url,
            category_id: formData.category_id,
            type: formData.type,
        };

        try {
            if (product) {
                await updateProduct.mutateAsync({
                    id: product.id,
                    ...productData,
                });
                toast({
                    title: 'Product Updated',
                    description: `${formData.product_name} has been updated successfully.`,
                });
            } else {
                await createProduct.mutateAsync(productData);
                toast({
                    title: 'Product Created',
                    description: `${formData.product_name} has been created successfully.`,
                });
            }
            onSuccess();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save product. Please try again.',
                variant: 'destructive',
            });
        }
    };

    // CRITICAL: Delete handler - completely standalone, no form involvement
    const executeDelete = () => {
        console.log('=== DELETE CLICKED ===');
        console.log('Product:', product?.id, product?.product_name);
        console.log('onDelete exists:', !!onDelete);
        console.log('deleteConfirmText:', deleteConfirmText);
        console.log('isDeleting:', isDeleting);

        if (!product) {
            console.error('DELETE ABORT: No product');
            throw new Error('No product to delete');
        }

        if (!onDelete) {
            console.error('DELETE ABORT: onDelete handler missing');
            throw new Error(
                'onDelete handler is required but was not provided',
            );
        }

        if (deleteConfirmText !== 'Delete') {
            console.error('DELETE ABORT: Confirmation text mismatch');
            return;
        }

        if (isDeleting) {
            console.log('DELETE ABORT: Already deleting');
            return;
        }

        console.log('=== CALLING onDelete ===');
        setIsDeleting(true);

        onDelete(product.id, product.product_name)
            .then(() => {
                console.log('=== DELETE FINISHED (SUCCESS) ===');
            })
            .catch((error) => {
                console.error('=== DELETE FINISHED (FAILED) ===', error);
                toast({
                    title: 'Delete Failed',
                    description:
                        'Could not delete product. Check console for details.',
                    variant: 'destructive',
                });
            })
            .finally(() => {
                setIsDeleting(false);
            });
    };

    return (
        <div className="space-y-4">
            {/* FORM - Only for editing product fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="product_name">Name</Label>
                        <Input
                            id="product_name"
                            value={formData.product_name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    product_name: e.target.value,
                                })
                            }
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="product_sku">SKU</Label>
                        <Input
                            id="product_sku"
                            value={formData.product_sku}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    product_sku: e.target.value,
                                })
                            }
                            placeholder="PROD-001"
                        />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                            id="slug"
                            value={formData.slug}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    slug: e.target.value,
                                })
                            }
                            placeholder="my-product"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                            value={formData.category_id || 'none'}
                            onValueChange={(value) =>
                                setFormData({
                                    ...formData,
                                    category_id:
                                        value === 'none' ? null : value,
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
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="short_description">Description</Label>
                    <Textarea
                        id="short_description"
                        value={formData.short_description}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                short_description: e.target.value,
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
                                value={formData.price}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        price:
                                            e.target.value === ''
                                                ? ('' as unknown as number)
                                                : parseFloat(e.target.value) ||
                                                  0,
                                    })
                                }
                                placeholder="0.00"
                                className="pl-9"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="billing_type">Billing Type</Label>
                        <Select
                            value={formData.billing_type}
                            onValueChange={(value: BillingType) =>
                                setFormData({
                                    ...formData,
                                    billing_type: value,
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="one_time">
                                    One-Time
                                </SelectItem>
                                <SelectItem value="monthly_subscription">
                                    Monthly
                                </SelectItem>
                                <SelectItem value="annual_subscription">
                                    Annual
                                </SelectItem>
                                <SelectItem value="subscription_with_minimum_commitment">
                                    Subscription
                                </SelectItem>
                                <SelectItem value="usage_based">
                                    Usage-Based
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="url">Website URL</Label>
                    <Input
                        id="url"
                        value={formData.url}
                        onChange={(e) =>
                            setFormData({ ...formData, url: e.target.value })
                        }
                        placeholder="/products/my-product"
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value: ProductType) =>
                                setFormData({ ...formData, type: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="plan">Plan</SelectItem>
                                <SelectItem value="product">Product</SelectItem>
                                <SelectItem value="service">Service</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="product_status">Status</Label>
                        <Select
                            value={formData.product_status}
                            onValueChange={(value: ProductStatus) =>
                                setFormData({
                                    ...formData,
                                    product_status: value,
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="hidden">Hidden</SelectItem>
                                <SelectItem value="test">Test</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="full_description">Full Description</Label>
                    <Textarea
                        id="full_description"
                        value={formData.full_description}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                full_description: e.target.value,
                            })
                        }
                        rows={5}
                        placeholder="Detailed product description..."
                    />
                </div>

                <ImageUpload
                    value={formData.image_url}
                    onChange={(url) =>
                        setFormData({ ...formData, image_url: url })
                    }
                    label="Product Image"
                    folder="products"
                />

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isMutating}>
                        {isMutating && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {product ? 'Update' : 'Create'}
                    </Button>
                </div>
            </form>

            {/* DELETE SECTION - Completely OUTSIDE the form */}
            {product && onDelete && (
                <div className="mt-4 border-t pt-4">
                    <div className="space-y-3">
                        <div className="font-medium text-destructive">
                            Danger Zone
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Are you sure you want to delete this Product? This
                            cannot be undone.
                        </p>
                        <div className="flex items-center gap-3">
                            <Input
                                placeholder='Type "Delete" to confirm'
                                value={deleteConfirmText}
                                onChange={(e) =>
                                    setDeleteConfirmText(e.target.value)
                                }
                                className="max-w-[200px]"
                            />
                            <button
                                type="button"
                                disabled={
                                    deleteConfirmText !== 'Delete' || isDeleting
                                }
                                className="inline-flex h-10 items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium whitespace-nowrap text-destructive-foreground ring-offset-background transition-colors hover:bg-destructive/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                                onClick={executeDelete}
                            >
                                {isDeleting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Delete Product
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
