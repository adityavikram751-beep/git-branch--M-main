"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package, RefreshCw, MoreVertical, Eye, EyeOff } from "lucide-react";
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

interface Product {
  id: string;
  name: string;
  description: string;
  pricing: {
    single: number;
    dozen: number;
    carton: number;
  };
  brand?: string;
  categoryId?: string;
  subcategoryId?: string;
  points?: string[];
  isFeatured?: boolean;
  variants?: { price: string; quantity: string }[];
  images?: string[];
  image?: string; // ✅ added
  isActivate?: boolean;
  status?: string;
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
  subcategoryId: string;
  points: string[];
  isFeature: boolean;
  isActivate: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  currentPage: number;
  totalPages: number;
  totalResults: number;
  products: ApiProduct[];
}

// Utility functions to truncate text
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  // ✅ FIX: variants default [] so undefined never breaks build
  const extractPricingFromVariants = (
    variants: { price: string; quantity: string }[] = []
  ) => {
    let single = 0;
    let dozen = 0;
    let carton = 0;

    variants.forEach((variant) => {
      const qty = (variant.quantity || "").toLowerCase().trim();
      const price = parseFloat(variant.price) || 0;

      // Single piece (1 pc)
      if (
        qty === "1" ||
        qty === "1pc" ||
        qty === "1pcs" ||
        qty === "single" ||
        qty === "1 piece" ||
        qty === "1 pc" ||
        qty === "1p" ||
        qty.startsWith("1 ")
      ) {
        single = price;
      }

      // Dozen (12 pcs)
      if (
        qty === "12" ||
        qty === "12pcs" ||
        qty === "12 pcs" ||
        qty === "12pc" ||
        qty === "12p" ||
        qty.includes("dozen") ||
        qty.includes("12 pieces") ||
        qty === "12 pieces" ||
        qty === "12 piece" ||
        qty === "12-pack"
      ) {
        dozen = price;
      }

      // Carton (bulk)
      if (
        qty.includes("carton") ||
        qty.includes("ctn") ||
        qty.includes("box") ||
        qty.includes("case") ||
        qty.includes("pack") ||
        qty.includes("bulk") ||
        qty.includes("crate") ||
        qty.includes("package") ||
        qty.includes("lot")
      ) {
        carton = price;
      }

      const qtyNumber = parseInt(qty);
      if (qtyNumber > 12 && carton === 0) {
        carton = price;
      }
    });

    // fallback for carton
    if (carton === 0 && variants.length > 0) {
      const sortedByQty = [...variants].sort((a, b) => {
        const aNum = parseInt(a.quantity) || 0;
        const bNum = parseInt(b.quantity) || 0;
        return bNum - aNum;
      });

      if (sortedByQty.length > 0) {
        const highestQty = sortedByQty[0];
        const highestQtyNum = parseInt(highestQty.quantity) || 0;

        if (highestQtyNum > 12) {
          carton = parseFloat(highestQty.price) || 0;
        }
      }

      if (carton === 0) {
        const largeVariant = variants.find(
          (v) =>
            v.quantity.toLowerCase().includes("large") ||
            v.quantity.toLowerCase().includes("big") ||
            v.quantity.toLowerCase().includes("xl") ||
            v.quantity.toLowerCase().includes("xxl")
        );
        if (largeVariant) carton = parseFloat(largeVariant.price) || 0;
      }
    }

    return { single, dozen, carton };
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
        const pricing = extractPricingFromVariants(apiProduct.variants);

        return {
          id: apiProduct._id,
          name: apiProduct.name,
          description: apiProduct.description,
          pricing,
          brand: apiProduct.brand,
          categoryId: apiProduct.categoryId,
          subcategoryId: apiProduct.subcategoryId,
          points: apiProduct.points || [],
          isFeatured: apiProduct.isFeature || false,
          variants: apiProduct.variants.map((v) => ({
            price: v.price,
            quantity: v.quantity,
          })),
          images: apiProduct.images || [],
          image: apiProduct.images?.[0] || "", // ✅ always set
          isActivate: apiProduct.isActivate,
          status: apiProduct.isActivate ? "active" : "inactive",
        };
      });

      setProducts(mappedProducts);
      setTotalPages(data.totalPages);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, refreshTrigger]);

  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);

    setTimeout(() => {
      fetchProducts();
    }, 300);

    toast.success("Product added successfully!");
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    const pricing = extractPricingFromVariants(updatedProduct.variants || []);

    const productWithPricing: Product = {
      ...updatedProduct,
      pricing,
      image: updatedProduct.image || updatedProduct.images?.[0] || "", // ✅ safety
    };

    setProducts((prev) =>
      prev.map((product) =>
        product.id === productWithPricing.id ? productWithPricing : product
      )
    );

    setTimeout(() => {
      fetchProducts();
    }, 300);

    toast.success("Product updated successfully!");
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== productId));
    toast.success("Product deleted successfully!");
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

      const newStatus = currentIsActivate ? "deactivate" : "activate";

      const response = await fetch(
        `https://barber-syndicate.vercel.app/api/v1/product/active-deactive/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ status: newStatus }),
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

      if (result.success) {
        const newIsActivate = newStatus === "activate";

        setProducts((prev) =>
          prev.map((product) =>
            product.id === productId
              ? {
                  ...product,
                  isActivate: newIsActivate,
                  status: newIsActivate ? "active" : "inactive",
                }
              : product
          )
        );

        setProducts((prev) =>
          [...prev].sort((a, b) => {
            if (a.isActivate && !b.isActivate) return -1;
            if (!a.isActivate && b.isActivate) return 1;
            return 0;
          })
        );

        toast.success(
          result.message ||
            `Product ${
              newStatus === "activate" ? "activated" : "deactivated"
            } successfully!`
        );

        setTimeout(() => {
          fetchProducts();
        }, 500);
      } else {
        throw new Error(result.message || "Failed to update status");
      }
    } catch (error: any) {
      console.error("Error updating product status:", error);
      toast.error(error.message || "Failed to update product status");
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    setRefreshTrigger((prev) => !prev);
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-rose-900">
            Product Management
          </h1>
          <p className="text-rose-600">Manage your cosmetic product catalog</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-rose-100 text-rose-700 rounded hover:bg-rose-200 transition-colors flex items-center gap-2"
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
        <CardHeader>
          <CardTitle className="text-rose-900 flex items-center gap-2">
            <Package className="h-5 w-5" /> Product Catalog
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-rose-200">
                  <TableHead className="text-rose-700">Image</TableHead>
                  <TableHead className="text-rose-700">Product</TableHead>
                  <TableHead className="text-rose-700 hidden md:table-cell">
                    Description
                  </TableHead>
                  <TableHead className="text-rose-700">1 pc</TableHead>
                  <TableHead className="text-rose-700">12 pcs</TableHead>
                  <TableHead className="text-rose-700">Carton</TableHead>
                  <TableHead className="text-rose-700">Status</TableHead>
                  <TableHead className="text-rose-700">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {products.length === 0 && !isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-rose-700 py-8"
                    >
                      No products found. Add your first product!
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow
                      key={product.id}
                      className={`border-rose-200 hover:bg-rose-50 ${
                        !product.isActivate ? "opacity-60 bg-gray-50" : ""
                      }`}
                    >
                      <TableCell>
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-rose-100 rounded flex items-center justify-center">
                            <Package className="h-8 w-8 text-rose-400" />
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <div
                          className="font-medium text-rose-900 cursor-help"
                          title={product.name}
                        >
                          {truncateProductName(product.name)}
                        </div>

                        {product.isFeatured && (
                          <span className="mt-1 px-2 py-0.5 text-xs bg-rose-100 text-rose-700 rounded inline-block">
                            Featured
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="text-rose-700 hidden md:table-cell">
                        <div
                          className="truncate cursor-help"
                          title={product.description}
                        >
                          {truncateDescription(product.description)}
                        </div>
                      </TableCell>

                      <TableCell className="text-rose-700">
                        $
                        {product.pricing.single > 0
                          ? product.pricing.single.toFixed(2)
                          : "0.00"}
                      </TableCell>

                      <TableCell className="text-rose-700">
                        $
                        {product.pricing.dozen > 0
                          ? product.pricing.dozen.toFixed(2)
                          : "0.00"}
                      </TableCell>

                      <TableCell className="text-rose-700">
                        $
                        {product.pricing.carton > 0
                          ? product.pricing.carton.toFixed(2)
                          : "0.00"}
                      </TableCell>

                      <TableCell>
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
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 hover:bg-rose-100 rounded">
                              <MoreVertical className="h-4 w-4 text-rose-700" />
                            </button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() =>
                                handleToggleStatus(
                                  product.id,
                                  product.isActivate || false
                                )
                              }
                              className="cursor-pointer"
                            >
                              {product.isActivate ? (
                                <>
                                  <EyeOff className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {/* ✅ FINAL FIX: always pass image to EditProduct */}
                            <EditProduct
                              product={{
                                ...product,
                                image: product.image || product.images?.[0] || "",
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
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <nav className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-rose-100 text-rose-700 rounded disabled:opacity-50 hover:bg-rose-200 transition-colors"
              >
                Previous
              </button>

              <span className="px-4 py-2 text-rose-700">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-rose-100 text-rose-700 rounded disabled:opacity-50 hover:bg-rose-200 transition-colors"
              >
                Next
              </button>
            </nav>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
