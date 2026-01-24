import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProducts, useDeleteProduct, useUpdateProduct, type Product } from "@/hooks/useProductsQueries";
import { useCategories } from "@/hooks/useCategoriesQueries";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2, Package, ArrowUpDown, ArrowUp, ArrowDown, Search, Info, ExternalLink, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProductForm } from "./ProductForm";
import { Link } from "@inertiajs/react";

type ProductStatus = 'draft' | 'active' | 'hidden' | 'test';
type SortField = "product_name" | "product_sku" | "product_status" | "type" | "category" | "price" | "billing_type" | "url";
type SortDirection = "asc" | "desc";

const defaultColumnWidths: Record<string, number> = {
  product_name: 180,
  product_sku: 100,
  product_status: 120,
  type: 100,
  category: 120,
  price: 90,
  billing_type: 100,
  url: 160,
};

export function ProductsSection() {
  const { toast } = useToast();
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const deleteProduct = useDeleteProduct();
  const updateProduct = useUpdateProduct();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [sortField, setSortField] = useState<SortField>("product_name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [columnWidths, setColumnWidths] = useState(defaultColumnWidths);

  // Column resizing state
  const [resizing, setResizing] = useState<string | null>(null);
  const [localWidths, setLocalWidths] = useState<Record<string, number>>({});
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "—";
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "—";
  };

  const getColumnWidth = (colKey: string) => {
    if (localWidths[colKey] !== undefined) {
      return localWidths[colKey];
    }
    return columnWidths[colKey] || defaultColumnWidths[colKey] || 150;
  };

  const handleResizeStart = useCallback((e: React.MouseEvent, colKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(colKey);
    startXRef.current = e.clientX;
    startWidthRef.current = columnWidths[colKey] || defaultColumnWidths[colKey] || 150;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startXRef.current;
      const newWidth = Math.max(50, startWidthRef.current + delta);
      setLocalWidths(prev => ({ ...prev, [colKey]: newWidth }));
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      const delta = upEvent.clientX - startXRef.current;
      const finalWidth = Math.max(50, startWidthRef.current + delta);
      
      setColumnWidths(prev => ({ ...prev, [colKey]: finalWidth }));
      
      setLocalWidths(prev => {
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
  }, [columnWidths]);

  const openCreateDialog = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: string, productName: string) => {
    console.log("=== ProductsSection handleDelete CALLED ===");
    console.log("Product ID:", productId);
    console.log("Product Name:", productName);
    
    try {
      console.log("Calling deleteProduct.mutateAsync...");
      await deleteProduct.mutateAsync(productId);
      console.log("=== DELETE MUTATION SUCCESS ===");
      
      toast({
        title: "Product Deleted",
        description: `${productName} has been deleted.`,
      });
      setIsDialogOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error("=== DELETE MUTATION FAILED ===", error);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleStatusChange = async (productId: string, productName: string, newStatus: ProductStatus) => {
    try {
      await updateProduct.mutateAsync({ id: productId, product_status: newStatus });
      toast({
        title: "Status Updated",
        description: `${productName} status changed to ${newStatus}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCategoryChange = async (productId: string, productName: string, newCategoryId: string | null) => {
    try {
      await updateProduct.mutateAsync({ id: productId, category_id: newCategoryId });
      toast({
        title: "Category Updated",
        description: `${productName} category changed.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTypeChange = async (productId: string, productName: string, newType: string | null) => {
    try {
      await updateProduct.mutateAsync({ id: productId, type: newType });
      toast({
        title: "Type Updated",
        description: `${productName} type changed.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update type. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSkuChange = async (productId: string, productName: string, newSku: string | null) => {
    try {
      await updateProduct.mutateAsync({ id: productId, product_sku: newSku });
      toast({
        title: "SKU Updated",
        description: `${productName} SKU changed.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update SKU. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePriceChange = async (productId: string, productName: string, newPrice: number) => {
    try {
      await updateProduct.mutateAsync({ id: productId, price: newPrice });
      toast({
        title: "Price Updated",
        description: `${productName} price changed to $${newPrice.toLocaleString()}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update price. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBillingTypeChange = async (productId: string, productName: string, newBillingType: string) => {
    try {
      await updateProduct.mutateAsync({ id: productId, billing_type: newBillingType as Product['billing_type'] });
      toast({
        title: "Billing Updated",
        description: `${productName} billing type changed.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update billing type. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getTypeLabel = (type: string | null) => {
    if (!type) return "—";
    const labels: Record<string, string> = {
      plan: "Plan",
      product: "Product",
      service: "Service",
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Draft",
      active: "Active",
      hidden: "Hidden",
      test: "Test",
    };
    return labels[status] || status;
  };

  const statusTooltipContent = (
    <div className="space-y-2 text-sm max-w-xs">
      <div><strong>Draft</strong> – Saved but not visible to customers. Not live or purchasable.</div>
      <div><strong>Active</strong> – Live on the website and available for purchase.</div>
      <div><strong>Hidden</strong> – Live and fully functional but not displayed on the website. Can be accessed via direct link or internal use.</div>
      <div><strong>Test</strong> – Used only for testing live payment flows. Not intended for real customer purchases.</div>
    </div>
  );

  const getBillingTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      one_time: "One-Time",
      monthly_subscription: "Monthly",
      annual_subscription: "Annual",
      subscription_with_minimum_commitment: "Subscription",
      usage_based: "Usage-Based",
    };
    return labels[type] || type;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    }
    return sortDirection === "asc" 
      ? <ArrowUp className="h-4 w-4 ml-1" />
      : <ArrowDown className="h-4 w-4 ml-1" />;
  };

  // Filter products by search query
  const filteredProducts = products.filter((product) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const categoryName = getCategoryName(product.category_id).toLowerCase();
    return (
      product.product_name.toLowerCase().includes(query) ||
      (product.product_sku && product.product_sku.toLowerCase().includes(query)) ||
      (product.short_description && product.short_description.toLowerCase().includes(query)) ||
      product.billing_type.toLowerCase().includes(query) ||
      product.product_status.toLowerCase().includes(query) ||
      categoryName.includes(query)
    );
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const modifier = sortDirection === "asc" ? 1 : -1;
    
    switch (sortField) {
      case "product_name":
        return modifier * a.product_name.localeCompare(b.product_name);
      case "product_sku":
        return modifier * ((a.product_sku || "").localeCompare(b.product_sku || ""));
      case "product_status":
        return modifier * a.product_status.localeCompare(b.product_status);
      case "type":
        return modifier * ((a.type || "").localeCompare(b.type || ""));
      case "category":
        return modifier * getCategoryName(a.category_id).localeCompare(getCategoryName(b.category_id));
      case "price":
        return modifier * (a.price - b.price);
      case "billing_type":
        return modifier * a.billing_type.localeCompare(b.billing_type);
      case "url":
        return modifier * ((a.url || "").localeCompare(b.url || ""));
      default:
        return 0;
    }
  });

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
  };

  const ResizeHandle = ({ column }: { column: string }) => (
    <div
      className={`absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/50 transition-colors ${
        resizing === column ? 'bg-primary' : 'bg-transparent'
      }`}
      onMouseDown={(e) => handleResizeStart(e, column)}
    />
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          <CardTitle>Products</CardTitle>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button asChild variant="outline">
            <Link href="/admin/product-template">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Template
            </Link>
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Product" : "Create New Product"}</DialogTitle>
              </DialogHeader>
              <ProductForm 
                product={editingProduct} 
                onSuccess={handleSuccess}
                onCancel={() => setIsDialogOpen(false)}
                onDelete={editingProduct ? handleDelete : undefined}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && products.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredProducts.length === 0 && searchQuery ? (
          <p className="text-center text-muted-foreground py-8">
            No products match your search.
          </p>
        ) : products.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No products yet. Click "Add Product" to create your first product.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-max">
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="relative group" 
                    style={{ width: getColumnWidth("product_name"), minWidth: 100 }}
                  >
                    <button 
                      className="flex items-center hover:text-foreground transition-colors"
                      onClick={() => handleSort("product_name")}
                    >
                      Name {getSortIcon("product_name")}
                    </button>
                    <ResizeHandle column="product_name" />
                  </TableHead>
                  <TableHead 
                    className="relative group" 
                    style={{ width: getColumnWidth("product_sku"), minWidth: 80 }}
                  >
                    <button 
                      className="flex items-center hover:text-foreground transition-colors"
                      onClick={() => handleSort("product_sku")}
                    >
                      SKU {getSortIcon("product_sku")}
                    </button>
                    <ResizeHandle column="product_sku" />
                  </TableHead>
                  <TableHead 
                    className="relative group" 
                    style={{ width: getColumnWidth("product_status"), minWidth: 100 }}
                  >
                    <div className="flex items-center gap-1">
                      <button 
                        className="flex items-center hover:text-foreground transition-colors"
                        onClick={() => handleSort("product_status")}
                      >
                        Status {getSortIcon("product_status")}
                      </button>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-sm">
                            {statusTooltipContent}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <ResizeHandle column="product_status" />
                  </TableHead>
                  <TableHead 
                    className="relative group" 
                    style={{ width: getColumnWidth("type"), minWidth: 90 }}
                  >
                    <button 
                      className="flex items-center hover:text-foreground transition-colors"
                      onClick={() => handleSort("type")}
                    >
                      Type {getSortIcon("type")}
                    </button>
                    <ResizeHandle column="type" />
                  </TableHead>
                  <TableHead 
                    className="relative group" 
                    style={{ width: getColumnWidth("category"), minWidth: 100 }}
                  >
                    <button 
                      className="flex items-center hover:text-foreground transition-colors"
                      onClick={() => handleSort("category")}
                    >
                      Category {getSortIcon("category")}
                    </button>
                    <ResizeHandle column="category" />
                  </TableHead>
                  <TableHead 
                    className="relative group" 
                    style={{ width: getColumnWidth("price"), minWidth: 80 }}
                  >
                    <button 
                      className="flex items-center hover:text-foreground transition-colors"
                      onClick={() => handleSort("price")}
                    >
                      Price {getSortIcon("price")}
                    </button>
                    <ResizeHandle column="price" />
                  </TableHead>
                  <TableHead 
                    className="relative group" 
                    style={{ width: getColumnWidth("billing_type"), minWidth: 100 }}
                  >
                    <button 
                      className="flex items-center hover:text-foreground transition-colors"
                      onClick={() => handleSort("billing_type")}
                    >
                      Billing {getSortIcon("billing_type")}
                    </button>
                    <ResizeHandle column="billing_type" />
                  </TableHead>
                  <TableHead 
                    className="relative group" 
                    style={{ width: getColumnWidth("url"), minWidth: 120 }}
                  >
                    <button 
                      className="flex items-center hover:text-foreground transition-colors"
                      onClick={() => handleSort("url")}
                    >
                      Website URL {getSortIcon("url")}
                    </button>
                    <ResizeHandle column="url" />
                  </TableHead>
                  <TableHead 
                    style={{ width: 60, minWidth: 60 }} 
                    className="text-center sticky right-0 bg-card z-10"
                  >
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell style={{ width: getColumnWidth("product_name") }}>
                      <button
                        className="font-medium text-left text-lime-400 hover:text-lime-300 transition-colors"
                        onClick={() => openEditDialog(product)}
                      >
                        {product.product_name}
                      </button>
                    </TableCell>
                    <TableCell style={{ width: getColumnWidth("product_sku") }}>
                      <Input
                        defaultValue={product.product_sku || ""}
                        placeholder="—"
                        className="h-8 w-[90px] text-sm"
                        onBlur={(e) => {
                          const newValue = e.target.value.trim() || null;
                          if (newValue !== product.product_sku) {
                            handleSkuChange(product.id, product.product_name, newValue);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell style={{ width: getColumnWidth("product_status") }}>
                      <Select
                        value={product.product_status}
                        onValueChange={(value: ProductStatus) => handleStatusChange(product.id, product.product_name, value)}
                      >
                        <SelectTrigger className="w-[100px] h-8">
                          <SelectValue>{getStatusLabel(product.product_status)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="hidden">Hidden</SelectItem>
                          <SelectItem value="test">Test</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell style={{ width: getColumnWidth("type") }}>
                      <Select
                        value={product.type || "none"}
                        onValueChange={(value) => handleTypeChange(product.id, product.product_name, value === "none" ? null : value)}
                      >
                        <SelectTrigger className="w-[90px] h-8">
                          <SelectValue>{getTypeLabel(product.type)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">—</SelectItem>
                          <SelectItem value="plan">Plan</SelectItem>
                          <SelectItem value="product">Product</SelectItem>
                          <SelectItem value="service">Service</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell style={{ width: getColumnWidth("category") }}>
                      <Select
                        value={product.category_id || "none"}
                        onValueChange={(value) => handleCategoryChange(product.id, product.product_name, value === "none" ? null : value)}
                      >
                        <SelectTrigger className="w-[110px] h-8">
                          <SelectValue>{getCategoryName(product.category_id)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">—</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell style={{ width: getColumnWidth("price") }}>
                      <Input
                        type="number"
                        defaultValue={product.price}
                        className="h-8 w-[80px] text-sm"
                        min={0}
                        step={1}
                        onBlur={(e) => {
                          const newValue = parseFloat(e.target.value) || 0;
                          if (newValue !== product.price) {
                            handlePriceChange(product.id, product.product_name, newValue);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell style={{ width: getColumnWidth("billing_type") }}>
                      <Select
                        value={product.billing_type}
                        onValueChange={(value) => handleBillingTypeChange(product.id, product.product_name, value)}
                      >
                        <SelectTrigger className="w-[110px] h-8">
                          <SelectValue>{getBillingTypeLabel(product.billing_type)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="one_time">One-Time</SelectItem>
                          <SelectItem value="monthly_subscription">Monthly</SelectItem>
                          <SelectItem value="annual_subscription">Annual</SelectItem>
                          <SelectItem value="subscription_with_minimum_commitment">Subscription</SelectItem>
                          <SelectItem value="usage_based">Usage-Based</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell style={{ width: getColumnWidth("url") }}>
                      {product.slug ? (
                        <a 
                          href={`/products/${product.slug}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline truncate block max-w-[140px]"
                        >
                          /products/{product.slug}
                        </a>
                      ) : "—"}
                    </TableCell>
                    <TableCell style={{ width: 60, minWidth: 60 }} className="text-center sticky right-0 bg-card">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Product</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{product.product_name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                console.log("=== INLINE DELETE CLICKED ===", product.id);
                                handleDelete(product.id, product.product_name);
                              }}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
