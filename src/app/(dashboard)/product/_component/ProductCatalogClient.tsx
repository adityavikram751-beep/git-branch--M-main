"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Loader, Search, X, Tag } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useSearchParams, useRouter } from "next/navigation";

// ================= TYPES =================
interface Variant {
  price?: number;
  quantity?: string | number;
}

export interface ProductItem {
  _id: string;
  name?: string;
  images?: string[];
  variants?: Variant[];
  description?: string;
  brand?: string;
  key_feature?: string;
  subcategoryId?: string;
  [key: string]: any;
}

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

type FilterType = "brand" | "category" | "subcategory";

interface ProductCatalogClientProps {
  initialProducts: ProductItem[];
  initialCategories: Category[];
  initialBrands: Brand[];
  initialPage: number;
  initialTotalPages: number;
  initialTotalResults: number;
  initialCategory?: string;
  initialSubCategory?: string;
  initialBrand?: string;
}

// ================= COMPONENT =================
export default function ProductCatalogClient({
  initialProducts,
  initialCategories,
  initialBrands,
  initialPage,
  initialTotalPages,
  initialTotalResults,
  initialCategory,
  initialSubCategory,
  initialBrand,
}: ProductCatalogClientProps) {
  const [products, setProducts] = useState<ProductItem[]>(initialProducts || []);
  const [searchResults, setSearchResults] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(initialPage || 1);
  const [totalPages, setTotalPages] = useState(initialTotalPages || 1);

  const [categoryName, setCategoryName] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [brandName, setBrandName] = useState("");

  const searchParams = useSearchParams();
  const router = useRouter();

  // URL Filters
  const categoryId = searchParams.get("category") || initialCategory || null;
  const subcategoryId =
    searchParams.get("subcategory") || initialSubCategory || null;
  const brandId = searchParams.get("brand") || initialBrand || null;

  // ✅ CORRECTED API URL
  const API_URL = "https://api.3846.in/api/v1/product/user-products";
  const SEARCH_API_URL = "https://api.3846.in/api/v1/product/search-product";

  // ================= DEBOUNCE SEARCH TERM =================
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ================= FETCH FILTER NAMES =================
  useEffect(() => {
    const fetchNames = async () => {
      if (categoryId) {
        try {
          const res = await fetch(
            `https://api.3846.in/api/v1/category/${categoryId}`
          );
          const data = await res.json();
          if (data?.success) setCategoryName(data?.data?.categoryname || "");
        } catch (err) {
          console.error("Error fetching category:", err);
        }
      } else {
        setCategoryName("");
      }

      if (subcategoryId) {
        try {
          const res = await fetch(
            `https://api.3846.in/api/v1/subcategory/${subcategoryId}`
          );
          const data = await res.json();
          if (data?.data) setSubCategoryName(data?.data?.subCatName || "");
        } catch (err) {
          console.error("Error fetching subcategory:", err);
        }
      } else {
        setSubCategoryName("");
      }

      if (brandId) {
        try {
          const res = await fetch(
            `https://api.3846.in/api/v1/brand/${brandId}`
          );
          const data = await res.json();
          if (data?.success)
            setBrandName(data?.data?.brandName || data?.data?.brand || "");
        } catch (err) {
          console.error("Error fetching brand:", err);
        }
      } else {
        setBrandName("");
      }
    };

    fetchNames();
  }, [categoryId, subcategoryId, brandId]);

  // ================= FETCH PRODUCTS FOR PAGINATION =================
  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "20");

      if (subcategoryId) params.append("subcategory", subcategoryId);
      else if (categoryId) params.append("category", categoryId);
      if (brandId) params.append("brand", brandId);

      const res = await fetch(`${API_URL}?${params.toString()}`);
      const data = await res.json();

      if (data?.success) {
        setProducts((data?.products || []) as ProductItem[]);
        setTotalPages(data?.totalPages || 1);
        setCurrentPage(data?.currentPage || page);
      } else {
        setProducts([]);
        setTotalPages(1);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setProducts([]);
      setTotalPages(1);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  // ================= SEARCH PRODUCTS API =================
  const searchProducts = useCallback(async (search: string) => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      
      const params = new URLSearchParams();
      params.append("search", search);
      
      if (subcategoryId) params.append("subcategory", subcategoryId);
      else if (categoryId) params.append("category", categoryId);
      if (brandId) params.append("brand", brandId);

      const res = await fetch(`${SEARCH_API_URL}?${params.toString()}`);
      const data = await res.json();

      if (data?.success) {
        setSearchResults(data?.data || []);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, [categoryId, subcategoryId, brandId]);

  // ================= Trigger search =================
  useEffect(() => {
    if (debouncedSearchTerm) {
      searchProducts(debouncedSearchTerm);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm, searchProducts]);

  // When filters change, fetch products
  useEffect(() => {
    fetchProducts(1);
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setSearchResults([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, subcategoryId, brandId]);

  // Show either search results or paginated products
  const displayedProducts = useMemo(() => {
    if (debouncedSearchTerm) {
      return searchResults;
    }
    return products;
  }, [debouncedSearchTerm, searchResults, products]);

  const showLoading = loading || (debouncedSearchTerm && searchLoading);

  // ================= SIMPLE PAGINATION =================
  // Sirf 4 numbers dikhenge, jo current page ke around honge
  const getPageNumbers = useCallback(() => {
    if (totalPages <= 4) {
      // Agar total pages 4 ya usse kam hai to saare dikhao
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Agar current page 1 ya 2 hai to [1,2,3,4] dikhao
    if (currentPage <= 2) {
      return [1, 2, 3, 4];
    }
    
    // Agar current page last page ya usse pehle hai to [last-3, last-2, last-1, last] dikhao
    if (currentPage >= totalPages - 1) {
      return [totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    
    // Otherwise current page ke around 4 numbers dikhao
    return [currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
  }, [currentPage, totalPages]);

  // ================= ACTIONS =================
  const clearFilters = () => {
    router.push("/product");
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setSearchResults([]);
  };

  const removeFilter = (type: FilterType) => {
    const params = new URLSearchParams();

    if (type === "brand") {
      if (categoryId) params.set("category", categoryId);
      if (subcategoryId) params.set("subcategory", subcategoryId);
      router.push(`/product?${params.toString()}`);
      return;
    }

    if (type === "category") {
      if (subcategoryId) params.set("subcategory", subcategoryId);
      if (brandId) params.set("brand", brandId);
      router.push(`/product?${params.toString()}`);
      return;
    }

    if (type === "subcategory") {
      if (categoryId) params.set("category", categoryId);
      if (brandId) params.set("brand", brandId);
      router.push(`/product?${params.toString()}`);
      return;
    }

    router.push("/product");
  };

  const BrandFilterButton = () => {
    if (brandId && brandName) {
      return (
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-400">›</span>
          <div className="flex items-center gap-1 bg-purple-50 px-2 sm:px-3 py-1 rounded-md border border-purple-200">
            <Tag className="h-3 w-3 text-purple-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-purple-600 capitalize truncate max-w-[100px] sm:max-w-[150px]">
              {brandName}
            </span>
            <button
              onClick={() => removeFilter("brand")}
              className="text-gray-400 hover:text-gray-600 ml-1 flex-shrink-0"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  // ================= UI =================
  return (
    <div className="min-h-screen bg-[#FAF3E0] flex flex-col">
      {/* Header */}
      <div className="w-full bg-[#FAF3E0] py-4 flex justify-center border-b border-orange-100">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-[#B30000]">Barber Syndicate </h1>
        </div>
      </div>

      {/* Breadcrumb */}
      {(categoryId || subcategoryId || brandId) && (
        <div className="bg-yellow-50 py-3 px-4 border-b">
          <div className="container mx-auto">
            <div className="flex items-center gap-2 flex-wrap">
              {categoryName && (
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-400">›</span>
                  <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-md border">
                    <span className="text-sm font-medium text-[#B30000] capitalize">
                      {categoryName}
                    </span>
                    <button
                      onClick={() => removeFilter("category")}
                      className="text-gray-400 hover:text-gray-600 ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}

              {subCategoryName && (
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-400">›</span>
                  <div className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-md border border-blue-200">
                    <span className="text-sm font-medium text-blue-600 capitalize">
                      {subCategoryName}
                    </span>
                    <button
                      onClick={() => removeFilter("subcategory")}
                      className="text-gray-400 hover:text-gray-600 ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}

              <BrandFilterButton />
            </div>

            <h2 className="text-lg font-bold mt-2">
              {subCategoryName
                ? `${subCategoryName} Products`
                : categoryName
                ? `${categoryName} Products`
                : brandName
                ? `${brandName} Brand Products`
                : "All Products"}
            </h2>
          </div>
        </div>
      )}

      {/* Search - Hidden on mobile */}
      <div className="hidden sm:flex sticky top-14 z-20 bg-[#FAF0E0]/90 backdrop-blur-sm py-6 justify-center px-4">
        <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by keywords..."
              className="w-full py-2 pl-10 pr-10 rounded-lg border border-gray-300 shadow-sm outline-none focus:ring-2 focus:ring-[#B30000] bg-white transition-all text-gray-700 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setDebouncedSearchTerm("");
                  setSearchResults([]);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {searchTerm && searchLoading && (
              <div className="absolute right-10 top-1/2 -translate-y-1/2">
                <Loader className="h-4 w-4 animate-spin text-[#B30000]" />
              </div>
            )}
          </div>

          {(categoryId || subcategoryId || brandId || searchTerm) && (
            <button
              onClick={clearFilters}
              className="px-5 py-2 rounded-lg bg-[#B30000] text-white font-semibold hover:bg-red-700 transition-all"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Mobile search indicator */}
      {searchTerm && (
        <div className="sm:hidden bg-[#FAF0E0] py-2 px-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-[#B30000]" />
              <span className="text-sm text-gray-600">
                Searching: "<span className="font-semibold">{searchTerm}</span>"
              </span>
            </div>
            <button
              onClick={() => {
                setSearchTerm("");
                setDebouncedSearchTerm("");
                setSearchResults([]);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Search Info */}
      {searchTerm && (
        <div className="container mx-auto px-4 mt-2">
          <div className="bg-white rounded-lg p-3 shadow-sm border">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {searchLoading ? (
                  "Searching products..."
                ) : (
                  <>
                    Found <span className="font-semibold text-[#B30000]">{searchResults.length}</span> matches
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        {showLoading ? (
          <div className="flex justify-center py-20">
            <Loader className="animate-spin h-10 w-10 text-[#B30000]" />
            <span className="ml-3 text-gray-600">
              {searchTerm ? "Searching..." : "Loading..."}
            </span>
          </div>
        ) : (
          <>
            {/* Grid - 1,2,3,4,5 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {displayedProducts.map((p) => (
                <ProductCard
                  key={p._id}
                  product={{
                    ...p,
                    id: p._id,
                    price: p.variants?.[0]?.price || 0,
                    quantity: String(p.variants?.[0]?.quantity ?? ""),
                  }}
                />
              ))}
            </div>

            {/* 🔥 SIMPLE PAGINATION - Sirf 4 Numbers */}
            {!searchTerm && totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-16 mb-12">
                {getPageNumbers().map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => {
                      fetchProducts(pageNum);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`w-10 h-10 rounded-lg font-bold transition-all ${
                      currentPage === pageNum
                        ? "bg-[#B30000] text-white shadow-md"
                        : "bg-white text-gray-700 border border-gray-200 hover:bg-orange-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
            )}

            {/* Empty States */}
            {searchTerm && searchResults.length === 0 && !searchLoading && (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No Products Found
                </h3>
                <p className="text-gray-600 mb-6">
                  No products found for "<span className="font-semibold">{searchTerm}</span>"
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setDebouncedSearchTerm("");
                    setSearchResults([]);
                  }}
                  className="px-6 py-3 bg-[#B30000] text-white rounded-lg font-medium hover:bg-red-700"
                >
                  Clear Search
                </button>
              </div>
            )}

            {!searchTerm && displayedProducts.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No Products Found
                </h3>
                <p className="text-gray-600 mb-6">
                  {brandName
                    ? `No products found for "${brandName}" brand`
                    : categoryName || subCategoryName
                    ? `No products found in this category`
                    : "No products available"}
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-[#B30000] text-white rounded-lg font-medium hover:bg-red-700"
                >
                  View All Products
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}