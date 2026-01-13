"use client";

import React, { useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(initialPage || 1);
  const [totalPages, setTotalPages] = useState(initialTotalPages || 1);

  const [categoryName, setCategoryName] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [brandName, setBrandName] = useState("");

  const searchParams = useSearchParams();
  const router = useRouter();

  // URL Filters
  const categoryId = searchParams.get("category") || initialCategory || null;
  const subcategoryId = searchParams.get("subcategory") || initialSubCategory || null;
  const brandId = searchParams.get("brand") || initialBrand || null;

  const API_URL = "https://barber-syndicate.vercel.app/api/v1/product";

  // ================= FETCH FILTER NAMES =================
  useEffect(() => {
    const fetchNames = async () => {
      // Category
      if (categoryId) {
        try {
          const res = await fetch(
            `https://barber-syndicate.vercel.app/api/v1/category/${categoryId}`
          );
          const data = await res.json();
          if (data?.success) setCategoryName(data?.data?.categoryname || "");
        } catch (err) {
          console.error("Error fetching category:", err);
        }
      } else {
        setCategoryName("");
      }

      // Subcategory
      if (subcategoryId) {
        try {
          const res = await fetch(
            `https://barber-syndicate.vercel.app/api/v1/subcategory/${subcategoryId}`
          );
          const data = await res.json();
          if (data?.data) setSubCategoryName(data?.data?.subCatName || "");
        } catch (err) {
          console.error("Error fetching subcategory:", err);
        }
      } else {
        setSubCategoryName("");
      }

      // Brand
      if (brandId) {
        try {
          const res = await fetch(
            `https://barber-syndicate.vercel.app/api/v1/brand/${brandId}`
          );
          const data = await res.json();
          if (data?.success) setBrandName(data?.data?.brandName || data?.data?.brand || "");
        } catch (err) {
          console.error("Error fetching brand:", err);
        }
      } else {
        setBrandName("");
      }
    };

    fetchNames();
  }, [categoryId, subcategoryId, brandId]);

  // ================= FETCH PRODUCTS =================
  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "20");

      if (searchTerm) params.append("search", searchTerm);
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

  // When searchTerm or filters change, fetch again
  useEffect(() => {
    fetchProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, categoryId, subcategoryId, brandId]);

  // ================= ACTIONS =================
  const clearFilters = () => {
    router.push("/product");
    setSearchTerm("");
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
          <div className="flex items-center gap-1 bg-purple-50 px-3 py-1 rounded-md border border-purple-200">
            <Tag className="h-3 w-3 text-purple-600" />
            <span className="text-sm font-medium text-purple-600 capitalize">
              {brandName}
            </span>
            <button
              onClick={() => removeFilter("brand")}
              className="text-gray-400 hover:text-gray-600 ml-1"
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
          <h1 className="text-2xl font-bold text-[#B30000]">Barber Syndicate</h1>
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

      {/* Search */}
      <div className="sticky top-14 z-20 bg-[#FAF0E0]/90 backdrop-blur-sm py-6 flex justify-center px-4">
        <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search Product ...."
              className="w-full py-2 pl-10 pr-10 rounded-lg border border-gray-300 shadow-sm outline-none focus:ring-2 focus:ring-[#B30000] bg-white transition-all text-gray-700 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
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

      {/* Products */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader className="animate-spin h-10 w-10 text-[#B30000]" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {products.map((p) => (
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

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-16 mb-12">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      fetchProducts(num);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`w-10 h-10 rounded-lg font-bold transition-all ${
                      currentPage === num
                        ? "bg-[#B30000] text-white shadow-md"
                        : "bg-white text-gray-700 border border-gray-200 hover:bg-orange-50"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            )}

            {products.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm
                    ? `No products found for "${searchTerm}"`
                    : brandName
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
