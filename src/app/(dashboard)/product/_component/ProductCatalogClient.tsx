"use client";
import React, { useState, useEffect } from "react";
import { Loader, Search, ArrowLeft, X, Tag } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useSearchParams, useRouter } from "next/navigation";

export default function ProductCatalogClient() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryName, setCategoryName] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [brandName, setBrandName] = useState("");

  const searchParams = useSearchParams();
  const router = useRouter();
  
  const categoryId = searchParams.get('category');
  const subcategoryId = searchParams.get('subcategory');
  const brandId = searchParams.get('brand');

  const API_URL = "https://barber-syndicate.vercel.app/api/v1/product";

  // Fetch category and brand names
  useEffect(() => {
    const fetchNames = async () => {
      // Fetch category name
      if (categoryId) {
        try {
          const res = await fetch(`https://barber-syndicate.vercel.app/api/v1/category/${categoryId}`);
          const data = await res.json();
          if (data.success) setCategoryName(data.data?.categoryname || "");
        } catch (err) {
          console.error("Error fetching category:", err);
        }
      }

      // Fetch subcategory name
      if (subcategoryId) {
        try {
          const res = await fetch(`https://barber-syndicate.vercel.app/api/v1/subcategory/${subcategoryId}`);
          const data = await res.json();
          if (data.data) {
            setSubCategoryName(data.data?.subCatName || "");
          }
        } catch (err) {
          console.error("Error fetching subcategory:", err);
        }
      }

      // Fetch brand name
      if (brandId) {
        try {
          const res = await fetch(`https://barber-syndicate.vercel.app/api/v1/brand/${brandId}`);
          const data = await res.json();
          if (data.success) {
            setBrandName(data.data?.brandName || "");
          }
        } catch (err) {
          console.error("Error fetching brand:", err);
        }
      }
    };

    fetchNames();
  }, [categoryId, subcategoryId, brandId]);

  // Fetch Products
  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '20');
      
      if (searchTerm) params.append('search', searchTerm);
      if (subcategoryId) params.append('subcategory', subcategoryId);
      else if (categoryId) params.append('category', categoryId);
      if (brandId) params.append('brand', brandId); // Brand parameter add kiya
      
      const res = await fetch(`${API_URL}?${params.toString()}`);
      const data = await res.json();
      
      if (data.success) {
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.currentPage || 1);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, [searchTerm, categoryId, subcategoryId, brandId]); // brandId add kiya dependency mein

  // Clear filters
  const clearFilters = () => {
    router.push('/product');
    setSearchTerm('');
  };

  // Remove specific filter
  const removeFilter = (type) => {
    const params = new URLSearchParams();
    
    if (type === 'brand') {
      // Agar brand hatana hai
      if (categoryId) params.set('category', categoryId);
      if (subcategoryId) params.set('subcategory', subcategoryId);
      router.push(`/product?${params.toString()}`);
    } else if (type === 'category') {
      // Agar category hatana hai
      if (subcategoryId) params.set('subcategory', subcategoryId);
      if (brandId) params.set('brand', brandId);
      router.push(`/product?${params.toString()}`);
    } else if (type === 'subcategory') {
      // Agar subcategory hatana hai
      if (categoryId) params.set('category', categoryId);
      if (brandId) params.set('brand', brandId);
      router.push(`/product?${params.toString()}`);
    } else {
      router.push('/product');
    }
  };

  // Brand button component
  const BrandFilterButton = () => {
    // Agar brand page se aaye hain to brand filter button show karein
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
              onClick={() => removeFilter('brand')}
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

  return (
    <div className="min-h-screen bg-[#FAF3E0] flex flex-col">
      {/* 1. MAIN HEADER - Logo Section */}
      <div className="w-full bg-[#FAF3E0] py-4 flex justify-center border-b border-orange-100">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-[#B30000]">Barber Syndicate</h1>
        </div>
      </div>

      {/* 2. FILTER BREADCRUMB */}
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
                      onClick={() => removeFilter('category')}
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
                      onClick={() => removeFilter('subcategory')}
                      className="text-gray-400 hover:text-gray-600 ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Brand Filter Button */}
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

     {/* 3. STICKY SEARCH BAR */}
<div className="sticky top-14 z-20 bg-[#FAF0E0]/90 backdrop-blur-sm py-6 flex justify-center px-4">
  <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-3">
    
    {/* Search Input */}
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
          onClick={() => setSearchTerm('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>

    {/* Clear Button */}
    {(categoryId || subcategoryId || brandId || searchTerm) && (
      <button
        onClick={clearFilters}
      >
        
      </button>
    )}
  </div>
</div>

      {/* 4. PRODUCT GRID */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader className="animate-spin h-10 w-10 text-[#B30000]" />
          </div>
        ) : (
          <>
            {/* Product Count */}
            <div className="mb-6 text-center">
              {/* Optional: Product count display */}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {products.map((p) => (
                <ProductCard 
                  key={p._id} 
                  product={{
                    ...p,
                    id: p._id,
                    price: p.variants?.[0]?.price || 0,
                    quantity: p.variants?.[0]?.quantity || ""
                  }} 
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-16 mb-12">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                        fetchProducts(num);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
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

            {/* No Products Found */}
            {products.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No Products Found
                </h3>
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