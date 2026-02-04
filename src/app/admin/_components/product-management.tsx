"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Package,
  RefreshCw,
  MoreVertical,
  Eye,
  EyeOff,
  Search,
  CheckSquare,
  Square,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { AddProduct } from "./product-manage/AddProduct";
import { EditProduct } from "./product-manage/EditProduct";
import { DeleteProduct } from "./product-manage/DeleteProduct";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  description: string;
  brand?: string;
  categoryId?: string;
  subcategoryId?: string;
  subcategoryName?: string;
  points?: string[];
  isFeature?: boolean;
  isFeatured?: boolean;
  variants?: { price: string; quantity: string }[];
  images?: string[];
  image?: string;
  isActivate?: boolean;
  status?: string;
  key_feature?: string;
}

interface ApiProduct {
  _id: string;
  name: string;
  images: string[];
  description: string;
  variants: {
    price: string;
    quantity: string;
    _id: string;
  }[];
  brand: string;
  categoryId: string;
  subcategoryId:
    | {
        _id: string;
        subCatName: string;
      }
    | null;
  points: string[];
  isFeature: boolean;
  isActivate: boolean;
  createdAt: string;
  updatedAt: string;
  key_feature?: string;
}

interface ApiResponse {
  success: boolean;
  currentPage: number;
  totalPages: number;
  totalResults: number;
  products: ApiProduct[];
}

type StatusFilter = "all" | "active" | "inactive";

/* ---------------- Utility functions ---------------- */
const truncateText = (text: string, maxWords: number = 4): string => {
  if (!text) return "";
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
};

const truncateProductName = (name: string): string => {
  if (name.includes("XBS")) {
    return truncateText(name, 5);
  }
  return truncateText(name, 4);
};

const truncateDescription = (text: string): string => {
  return truncateText(text, 3);
};

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [isSelectAllGlobal, setIsSelectAllGlobal] = useState(false);

  const fetchAllProducts = async () => {
    setIsLoadingAll(true);
    try {
      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) {
        console.error("No admin token found");
        return;
      }

      let allFetchedProducts: Product[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(
          `https://barber-syndicate.vercel.app/api/v1/product?page=${page}&limit=100`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${adminToken}`,
            },
          }
        );

        if (!response.ok) {
          console.error("Failed to fetch all products");
          break;
        }

        const data: ApiResponse = await response.json();

        const mappedProducts: Product[] = data.products.map((apiProduct) => ({
          id: apiProduct._id,
          name: apiProduct.name,
          description: apiProduct.description,
          brand: apiProduct.brand,
          categoryId: apiProduct.categoryId,
          subcategoryId: apiProduct.subcategoryId?._id || "",
          subcategoryName: apiProduct.subcategoryId?.subCatName || "—",
          points: apiProduct.points || [],
          isFeature: apiProduct.isFeature || false,
          isFeatured: apiProduct.isFeature || false,
          variants: (apiProduct.variants || []).map((v) => ({
            price: v.price,
            quantity: v.quantity,
          })),
          images: apiProduct.images || [],
          image: apiProduct.images?.[0] || "",
          isActivate: apiProduct.isActivate,
          status: apiProduct.isActivate ? "active" : "inactive",
          key_feature: apiProduct.key_feature || "",
        }));

        allFetchedProducts = [...allFetchedProducts, ...mappedProducts];

        if (page >= data.totalPages) {
          hasMore = false;
        } else {
          page++;
        }
      }

      console.log("✅ Total products fetched:", allFetchedProducts.length);
      setAllProducts(allFetchedProducts);
    } catch (err) {
      console.error("Error fetching all products:", err);
    } finally {
      setIsLoadingAll(false);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const adminToken = localStorage.getItem("adminToken");

      if (!adminToken) {
        throw new Error("Authentication required. Please log in.");
      }

      const response = await fetch(
        `https://barber-syndicate.vercel.app/api/v1/product?page=${currentPage}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized: Invalid or expired token");
        }
        throw new Error("Failed to fetch products");
      }

      const data: ApiResponse = await response.json();

      const sortedProducts = data.products.sort((a, b) => {
        if (a.isActivate && !b.isActivate) return -1;
        if (!a.isActivate && b.isActivate) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      const mappedProducts: Product[] = sortedProducts.map((apiProduct) => {
        return {
          id: apiProduct._id,
          name: apiProduct.name,
          description: apiProduct.description,
          brand: apiProduct.brand,
          categoryId: apiProduct.categoryId,
          subcategoryId: apiProduct.subcategoryId?._id || "",
          subcategoryName: apiProduct.subcategoryId?.subCatName || "—",
          points: apiProduct.points || [],
          isFeature: apiProduct.isFeature || false,
          isFeatured: apiProduct.isFeature || false,
          variants: (apiProduct.variants || []).map((v) => ({
            price: v.price,
            quantity: v.quantity,
          })),
          images: apiProduct.images || [],
          image: apiProduct.images?.[0] || "",
          isActivate: apiProduct.isActivate,
          status: apiProduct.isActivate ? "active" : "inactive",
          key_feature: apiProduct.key_feature || "",
        };
      });

      setProducts(mappedProducts);
      setTotalPages(data.totalPages);
      setTotalResults(data.totalResults);
      
      // Reset selection states
      setSelectedProducts(new Set());
      setIsSelectAll(false);
      setIsSelectAllGlobal(false);
    } catch (err: any) {
      const errorMessage =
        err.message || "Failed to load products. Please try again later.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error fetching products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, refreshTrigger]);

  useEffect(() => {
    fetchAllProducts();
  }, [refreshTrigger]);

  const handleAddProduct = (newProduct: Product) => {
    setRefreshTrigger(prev => prev + 1);
    toast.success("Product added successfully! Refreshing...");
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setRefreshTrigger(prev => prev + 1);
    toast.success("Product updated successfully! Refreshing...");
  };

  const handleDeleteProduct = (productId: string) => {
    setRefreshTrigger(prev => prev + 1);
    toast.success("Product deleted successfully! Refreshing...");
  };

  const handleToggleStatus = async (
    productId: string,
    currentIsActivate: boolean
  ) => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch(
        `https://barber-syndicate.vercel.app/api/v1/product/active-deactive`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ 
            id: [productId], 
            status: !currentIsActivate 
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(
          `Failed to update product status. Status: ${response.status}`
        );
      }

      const result = await response.json();

      if (result.success || result.message) {
        setRefreshTrigger(prev => prev + 1);
        
        toast.success(
          result.message ||
            `Product ${
              !currentIsActivate ? "activated" : "deactivated"
            } successfully! Refreshing...`
        );
      } else {
        throw new Error(result.message || "Failed to update status");
      }
    } catch (error: any) {
      console.error("Error updating product status:", error);
      toast.error(error.message || "Failed to update product status");
    }
  };

  // 🔥 ENHANCED: Bulk toggle for all selected products
  const handleBulkToggleStatus = async (activate: boolean) => {
    if (selectedProducts.size === 0) {
      toast.error("Please select at least one product");
      return;
    }

    try {
      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) {
        toast.error("Authentication required");
        return;
      }

      const productIds = Array.from(selectedProducts);

      const response = await fetch(
        `https://barber-syndicate.vercel.app/api/v1/product/active-deactive`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            id: productIds,
            status: activate
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(`Failed to update product status. Status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success || result.message) {
        setRefreshTrigger(prev => prev + 1);
        setSelectedProducts(new Set());
        setIsSelectAll(false);
        setIsSelectAllGlobal(false);

        toast.success(
          `${productIds.length} product(s) ${
            activate ? "activated" : "deactivated"
          } successfully! Refreshing...`
        );
      } else {
        throw new Error(result.message || "Failed to update product statuses");
      }
    } catch (error: any) {
      console.error("Error in bulk status toggle:", error);
      toast.error(error.message || "Failed to update product statuses");
    }
  };

  // 🔥 NEW: Select all products in the database
  const handleSelectAllGlobal = () => {
    if (isSelectAllGlobal) {
      // Deselect all
      setSelectedProducts(new Set());
      setIsSelectAllGlobal(false);
      setIsSelectAll(false);
    } else {
      // Select all products from allProducts (fetched from API)
      const allIds = allProducts.map((p) => p.id);
      setSelectedProducts(new Set(allIds));
      setIsSelectAllGlobal(true);
      setIsSelectAll(true);
      toast.success(`Selected all ${allIds.length} products`);
    }
  };

  const handleSelectProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
    
    // Update select all states
    const currentFilteredIds = filteredProducts.map((p) => p.id);
    const allSelected = currentFilteredIds.every(id => newSelected.has(id));
    setIsSelectAll(allSelected);
  };

  const handleSelectAll = () => {
    if (isSelectAll) {
      // Deselect all in current view
      const newSelected = new Set(selectedProducts);
      filteredProducts.forEach(p => newSelected.delete(p.id));
      setSelectedProducts(newSelected);
    } else {
      // Select all in current view
      const newSelected = new Set(selectedProducts);
      filteredProducts.forEach(p => newSelected.add(p.id));
      setSelectedProducts(newSelected);
    }
    setIsSelectAll(!isSelectAll);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    setSelectedProducts(new Set());
    setIsSelectAll(false);
    setIsSelectAllGlobal(false);
    setRefreshTrigger(prev => prev + 1);
    toast.success("Refreshing products...");
  };

  // 🔥 MAIN FIX: Filter function updated
  const filteredProducts = useMemo(() => {
    // Jab bhi filter lag raha hai (statusFilter != "all"), toh pure allProducts se filter karo
    if (statusFilter !== "all") {
      // Status filter ke liye allProducts use karo
      let list = [...allProducts];
      
      if (statusFilter === "active") {
        list = list.filter((p) => p.isActivate === true);
      } else if (statusFilter === "inactive") {
        list = list.filter((p) => p.isActivate === false);
      }
      
      // Search bhi apply karo
      const q = search.trim().toLowerCase();
      if (q.length > 0) {
        list = list.filter((p) => {
          const name = (p.name || "").toLowerCase();
          const desc = (p.description || "").toLowerCase();
          const sub = (p.subcategoryName || "").toLowerCase();
          const brand = (p.brand || "").toLowerCase();
          const keyFeature = (p.key_feature || "").toLowerCase();
          return name.includes(q) || desc.includes(q) || sub.includes(q) || brand.includes(q) || keyFeature.includes(q);
        });
      }
      
      return list;
    }
    
    // Agar "all" filter hai toh
    const q = search.trim().toLowerCase();
    
    let list = q.length > 0 && allProducts.length > 0 
      ? [...allProducts] 
      : [...products];

    if (q.length > 0) {
      list = list.filter((p) => {
        const name = (p.name || "").toLowerCase();
        const desc = (p.description || "").toLowerCase();
        const sub = (p.subcategoryName || "").toLowerCase();
        const brand = (p.brand || "").toLowerCase();
        const keyFeature = (p.key_feature || "").toLowerCase();
        return name.includes(q) || desc.includes(q) || sub.includes(q) || brand.includes(q) || keyFeature.includes(q);
      });
    }

    return list;
  }, [products, allProducts, search, statusFilter]);

  // 🔥 NEW: Pagination hide karna jab filter active ho
  const shouldShowPagination = !search && statusFilter === "all";

  // Update select all state when filtered products change
  useEffect(() => {
    if (filteredProducts.length > 0) {
      const allSelected = filteredProducts.every(p => selectedProducts.has(p.id));
      setIsSelectAll(allSelected);
      
      // Check if all products in database are selected
      if (allProducts.length > 0 && selectedProducts.size === allProducts.length) {
        setIsSelectAllGlobal(true);
      } else {
        setIsSelectAllGlobal(false);
      }
    }
  }, [filteredProducts, selectedProducts, allProducts]);

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-rose-900">
            Product Management
          </h1>
          <p className="text-rose-600">
            Manage your cosmetic product catalog
            {isLoadingAll && <span className="ml-2 text-xs">(Loading all products...)</span>}
          </p>
        </div>

        <div className="flex gap-2">
          {selectedProducts.size > 0 && (
            <div className="flex gap-2 mr-4">
              <Button
                onClick={() => handleBulkToggleStatus(true)}
                className="bg-green-100 text-green-700 hover:bg-green-200 border border-green-200"
              >
                <Eye className="h-4 w-4 mr-2" />
                Activate ({selectedProducts.size})
              </Button>
              <Button
                onClick={() => handleBulkToggleStatus(false)}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
              >
                <EyeOff className="h-4 w-4 mr-2" />
                Deactivate ({selectedProducts.size})
              </Button>
              
              {/* 🔥 NEW: Select All Global Button */}
              <Button
                onClick={handleSelectAllGlobal}
                className="bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-200"
                disabled={allProducts.length === 0}
              >
                {isSelectAllGlobal ? (
                  <>
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Select All {allProducts.length} Products
                  </>
                )}
              </Button>
            </div>
          )}

          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-rose-100 text-rose-700 rounded hover:bg-rose-200 transition-colors flex items-center gap-2 border border-rose-200"
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>

          <AddProduct onAddProduct={handleAddProduct} />
        </div>
      </header>

      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-700"></div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-600">
          {error}
        </div>
      )}

      <Card className="border-rose-200 bg-white/70 backdrop-blur-sm">
        <CardHeader className="space-y-4">
          <CardTitle className="text-rose-900 flex items-center gap-2">
            <Package className="h-5 w-5" /> Product Catalog
            {selectedProducts.size > 0 && (
              <span className="ml-2 text-sm font-normal text-rose-600">
                ({selectedProducts.size} products selected)
              </span>
            )}
          </CardTitle>

          <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-rose-500" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  allProducts.length > 0 
                    ? `Search across ${allProducts.length} products...` 
                    : "Search products..."
                }
                className="pl-9 border-rose-200 focus:border-rose-500 focus:ring-rose-500"
                disabled={isLoadingAll}
              />
              {search && (
                <span className="absolute right-3 top-2.5 text-xs text-rose-600 font-medium">
                  {filteredProducts.length} found
                </span>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="border-rose-200 text-rose-700 hover:bg-rose-50 w-full md:w-auto"
                >
                  Filter:{" "}
                  <span className="ml-2 font-semibold capitalize">
                    {statusFilter}
                  </span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    setStatusFilter("all");
                    setCurrentPage(1);
                  }}
                >
                  All
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    setStatusFilter("active");
                    setCurrentPage(1);
                  }}
                >
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    setStatusFilter("inactive");
                    setCurrentPage(1);
                  }}
                >
                  Inactive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          <div className="w-full border border-rose-200 rounded-md overflow-hidden">
            <div className="grid grid-cols-[70px_50px_1.4fr_1fr_1.3fr_105px_70px] bg-white sticky top-0 z-30 border-b border-rose-200">
              <div className="px-2 py-2 font-semibold text-rose-700 border-r border-rose-100">
                Image
              </div>

              <div className="px-2 py-2 font-semibold text-rose-700 border-r border-rose-100 flex items-center justify-center">
                <button
                  onClick={handleSelectAll}
                  className="p-1 hover:bg-rose-50 rounded"
                  title={isSelectAll ? "Deselect all" : "Select all"}
                >
                  {isSelectAll ? (
                    <CheckSquare className="h-4 w-4 text-rose-700" />
                  ) : (
                    <Square className="h-4 w-4 text-rose-400" />
                  )}
                </button>
              </div>

              <div className="px-2 py-2 font-semibold text-rose-700 border-r border-rose-100">
                Product
              </div>

              <div className="px-2 py-2 font-semibold text-rose-700 border-r border-rose-100">
                Subcategory
              </div>

              <div className="px-2 py-2 font-semibold text-rose-700 border-r border-rose-100">
                Description
              </div>

              <div className="px-2 py-2 font-semibold text-rose-700">
                Status
              </div>

              <div className="px-1 py-2 font-semibold text-rose-700">
                Actions
              </div>
            </div>

            <div className="max-h-[520px] overflow-y-auto">
              {isLoadingAll && (search || statusFilter !== "all") ? (
                <div className="text-center text-rose-700 py-10">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-700 mx-auto mb-2"></div>
                  Loading products for search/filter...
                </div>
              ) : filteredProducts.length === 0 && !isLoading ? (
                <div className="text-center text-rose-700 py-10">
                  {search || statusFilter !== "all" 
                    ? "No products found matching your criteria." 
                    : "No products found."}
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`grid grid-cols-[70px_50px_1.4fr_1fr_1.3fr_90px_70px] items-center 
                    border-b border-rose-200 hover:bg-rose-50/40 transition ${
                      !product.isActivate
                        ? "opacity-60 bg-gray-50"
                        : "bg-white"
                    }`}
                  >
                    <div className="px-2 py-2 border-r border-rose-100">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-rose-100 rounded flex items-center justify-center">
                          <Package className="h-6 w-6 text-rose-400" />
                        </div>
                      )}
                    </div>

                    <div className="px-2 py-2 border-r border-rose-100 flex items-center justify-center">
                      <button
                        onClick={() => handleSelectProduct(product.id)}
                        className="p-1 hover:bg-rose-50 rounded"
                      >
                        {selectedProducts.has(product.id) ? (
                          <CheckSquare className="h-4 w-4 text-rose-700" />
                        ) : (
                          <Square className="h-4 w-4 text-rose-400" />
                        )}
                      </button>
                    </div>

                    <div className="px-4 py-4 border-r border-rose-100 min-w-0">
                      <div
                        className="font-medium text-rose-900 cursor-help truncate"
                        title={product.name}
                      >
                        {truncateProductName(product.name)}
                      </div>

                      {product.key_feature && product.key_feature.trim() && (
                        <span className="mt-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded inline-block mr-2">
                          {product.key_feature}
                        </span>
                      )}

                      {product.isFeature && (
                        <span className="mt-1 px-2 py-0.5 text-xs bg-rose-100 text-rose-700 rounded inline-block">
                          Featured
                        </span>
                      )}
                    </div>

                    <div
                      className="px-2 py-2 text-rose-700 hidden md:block border-r border-rose-100 min-w-0"
                      title={product.subcategoryName || "—"}
                    >
                      <div className="truncate">{product.subcategoryName || "—"}</div>
                    </div>

                    <div
                      className="px-2 py-2 text-rose-700 hidden md:block border-r border-rose-100 min-w-0"
                      title={product.description}
                    >
                      <div className="truncate">
                        {truncateDescription(product.description)}
                      </div>
                    </div>

                    <div className="px-2 py-2">
                      <Badge
                        className={`cursor-pointer ${
                          product.isActivate
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                        onClick={() =>
                          handleToggleStatus(
                            product.id,
                            product.isActivate || false
                          )
                        }
                      >
                        {product.isActivate ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="px-2 py-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 hover:bg-rose-100 rounded">
                            <MoreVertical className="h-4 w-4 text-rose-700" />
                          </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuSeparator />

                          <EditProduct
                            product={{
                              ...product,
                              image:
                                product.image || product.images?.[0] || "",
                            }}
                            onUpdateProduct={handleUpdateProduct}
                          />

                          <DropdownMenuSeparator />

                          <DeleteProduct
                            productId={product.id}
                            productName={product.name}
                            onDeleteProduct={handleDeleteProduct}
                          />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 🔥 FIXED: Pagination sirf tab dikhe jab no filter ho */}
          {shouldShowPagination && totalPages > 1 && (
            <nav className="flex justify-center items-center gap-2 mt-4">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-rose-100 text-rose-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-200 transition-colors border border-rose-200 flex items-center gap-1"
                title="First Page"
              >
                <ChevronsLeft className="h-4 w-4" />
                First
              </button>

              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-rose-100 text-rose-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-200 transition-colors border border-rose-200"
              >
                Previous
              </button>

              <span className="px-4 py-2 text-rose-700 font-medium">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-rose-100 text-rose-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-200 transition-colors border border-rose-200"
              >
                Next
              </button>

              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-rose-100 text-rose-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-200 transition-colors border border-rose-200 flex items-center gap-1"
                title="Last Page"
              >
                Last
                <ChevronsRight className="h-4 w-4" />
              </button>
            </nav>
          )}

          {/* 🔥 NEW: Show filter status */}
          {(search || statusFilter !== "all") && filteredProducts.length > 0 && (
            <div className="text-center text-rose-600 text-sm mt-4">
              Showing {filteredProducts.length} product(s) 
              {search && ` matching "${search}"`}
              {statusFilter !== "all" && ` (${statusFilter} only)`}
              {search && statusFilter !== "all" && ` from all products`}
            </div>
          )}
          
          {selectedProducts.size > 0 && (
            <div className="text-center text-rose-700 font-medium text-sm mt-4">
              ⚡ {selectedProducts.size} product(s) selected - 
              Ready for bulk actions!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}