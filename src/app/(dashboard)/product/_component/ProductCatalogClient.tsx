'use client';
import React, { useState, useEffect } from "react";
import { Loader, Search, ArrowLeft, X } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Product {
  _id: string;
  productname: string;
  description: string;
  brand: string;
  category?: any;
  subCategory?: any;
  variants?: Array<{
    price: number;
    quantity: string;
  }>;
  images?: string[];
  catId?: string;
  subCatId?: string;
  categoryId?: string;
  subCategoryId?: string;
}

export default function ProductCatalogClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [debugInfo, setDebugInfo] = useState("");

  const searchParams = useSearchParams();
  const router = useRouter();
  
  const categoryId = searchParams.get('category');
  const subcategoryId = searchParams.get('subcategory');

  const API_URL = "https://barber-syndicate.vercel.app/api/v1/product";

  // Fetch category and subcategory names
  useEffect(() => {
    const fetchCategoryNames = async () => {
      if (categoryId) {
        try {
          const res = await fetch(`https://barber-syndicate.vercel.app/api/v1/category/${categoryId}`);
          const data = await res.json();
          if (data.success) {
            setCategoryName(data.data?.categoryname || "");
          }
        } catch (err) {
          console.error("Error fetching category:", err);
        }
      }

      if (subcategoryId) {
        try {
          const res = await fetch(`https://barber-syndicate.vercel.app/api/v1/subcategory/${subcategoryId}`);
          const data = await res.json();
          if (data.data) {
            setSubCategoryName(data.data?.subCatName || "");
            
            // Get parent category name if catId exists
            if (data.data.catId) {
              const catRes = await fetch(`https://barber-syndicate.vercel.app/api/v1/category/${data.data.catId}`);
              const catData = await catRes.json();
              if (catData.success) {
                setCategoryName(catData.data?.categoryname || "");
              }
            }
          }
        } catch (err) {
          console.error("Error fetching subcategory:", err);
        }
      }
    };

    fetchCategoryNames();
  }, [categoryId, subcategoryId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setDebugInfo("Fetching products...");
      
      // Build API URL with filters
      const params = new URLSearchParams();
      params.append('limit', '1000');
      
      // Add filters if they exist
      if (subcategoryId) {
        params.append('subcategory', subcategoryId);
      } else if (categoryId) {
        params.append('category', categoryId);
      }
      
      const url = `${API_URL}?${params.toString()}`;
      console.log("🌐 Fetching from:", url);
      
      const res = await fetch(url);
      const data = await res.json();
      
      console.log("📦 API Response:", data);
      
      if (data.success) {
        let filteredProducts = data.products || [];
        
        // Apply client-side search filter
        if (searchTerm) {
          filteredProducts = filteredProducts.filter((product: Product) => {
            return (
              product.productname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
            );
          });
        }
        
        setProducts(filteredProducts);
        setDebugInfo(`Found ${filteredProducts.length} products after filtering`);
        
        // Debug: Log first few products
        if (filteredProducts.length > 0) {
          console.log("🔍 Sample filtered products:", filteredProducts.slice(0, 3).map(p => ({
            id: p._id,
            name: p.productname,
            subCategory: p.subCategory,
            category: p.category
          })));
        }
      } else {
        console.error("API Error:", data);
        setDebugInfo(`API Error: ${data.message || 'Unknown error'}`);
        setProducts([]);
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setDebugInfo(`Fetch error: ${err.message || 'Unknown error'}`);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products when category/subcategory changes
  useEffect(() => {
    fetchProducts();
  }, [categoryId, subcategoryId]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        fetchProducts();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Clear all filters
  const clearFilters = () => {
    router.push('/product');
    setSearchTerm('');
  };

  // Remove specific filter
  const removeFilter = (type: 'category' | 'subcategory') => {
    const params = new URLSearchParams();
    
    if (type === 'category' && subcategoryId) {
      params.set('subcategory', subcategoryId);
      router.push(`/product?${params.toString()}`);
    } else if (type === 'subcategory' && categoryId) {
      params.set('category', categoryId);
      router.push(`/product?${params.toString()}`);
    } else {
      router.push('/product');
    }
  };

  // Alternative fetch function with detailed filtering logic
  const fetchWithDetailedFilter = async () => {
    try {
      setLoading(true);
      setDebugInfo("Fetching all products for detailed filtering...");
      
      // Fetch all products
      const res = await fetch(`${API_URL}?limit=1000`);
      const data = await res.json();
      
      if (data.success) {
        const allProducts = data.products || [];
        let filteredProducts: Product[] = [];
        
        // CASE 1: Filter by Subcategory
        if (subcategoryId) {
          console.log("🔍 Filtering by subcategory ID:", subcategoryId);
          
          filteredProducts = allProducts.filter((product: Product) => {
            // Check all possible subcategory fields
            const subCategoryMatch = 
              (product.subCategory && typeof product.subCategory === 'object' && product.subCategory._id === subcategoryId) ||
              (typeof product.subCategory === 'string' && product.subCategory === subcategoryId) ||
              (product.subCatId === subcategoryId) ||
              (product.subCategoryId === subcategoryId);
            
            if (subCategoryMatch) {
              console.log(`✅ Matched product: ${product.productname}`);
              return true;
            }
            
            return false;
          });
          
          console.log(`📊 Found ${filteredProducts.length} products for subcategory`);
          
          // If no products found, try parent category
          if (filteredProducts.length === 0 && subcategoryId) {
            console.log("🔄 No subcategory products, trying parent category...");
            
            try {
              // Get parent category ID from subcategory
              const subRes = await fetch(`https://barber-syndicate.vercel.app/api/v1/subcategory/${subcategoryId}`);
              const subData = await subRes.json();
              
              if (subData.data?.catId) {
                const parentCatId = subData.data.catId;
                console.log(`📁 Parent category ID: ${parentCatId}`);
                
                // Filter by parent category
                filteredProducts = allProducts.filter((product: Product) => {
                  return (
                    (product.category && typeof product.category === 'object' && product.category._id === parentCatId) ||
                    (typeof product.category === 'string' && product.category === parentCatId) ||
                    (product.catId === parentCatId) ||
                    (product.categoryId === parentCatId)
                  );
                });
                
                console.log(`📊 Found ${filteredProducts.length} products in parent category`);
              }
            } catch (err) {
              console.error("Error fetching parent category:", err);
            }
          }
        }
        // CASE 2: Filter by Category
        else if (categoryId) {
          console.log("🔍 Filtering by category ID:", categoryId);
          
          filteredProducts = allProducts.filter((product: Product) => {
            return (
              (product.category && typeof product.category === 'object' && product.category._id === categoryId) ||
              (typeof product.category === 'string' && product.category === categoryId) ||
              (product.catId === categoryId) ||
              (product.categoryId === categoryId)
            );
          });
          
          console.log(`📊 Found ${filteredProducts.length} products for category`);
        }
        // CASE 3: Show all products
        else {
          filteredProducts = allProducts;
        }
        
        // Apply search filter
        if (searchTerm) {
          filteredProducts = filteredProducts.filter((product: Product) => {
            return (
              product.productname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
            );
          });
        }
        
        setProducts(filteredProducts);
        setDebugInfo(`Found ${filteredProducts.length} products total`);
      }
    } catch (err) {
      console.error("❌ Error in detailed filter:", err);
      setDebugInfo(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Uncomment this and comment the simple fetchProducts to use detailed filtering
  // useEffect(() => {
  //   fetchWithDetailedFilter();
  // }, [categoryId, subcategoryId]);

  return (
    <div className="min-h-screen bg-[#FAF3E0]">
      {/* ================= TOP NAVIGATION ================= */}
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#B30000] rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">BS</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Barber Syndicate</h1>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm font-medium text-gray-700 hover:text-[#B30000]">
                Home
              </Link>
              <Link href="/product" className="text-sm font-medium text-[#B30000]">
                Products
              </Link>
              <Link href="/category" className="text-sm font-medium text-gray-700 hover:text-[#B30000]">
                Category
              </Link>
              <Link href="/contacts" className="text-sm font-medium text-gray-700 hover:text-[#B30000]">
                Contacts
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <button className="text-sm text-gray-700 hover:text-[#B30000] font-medium">
                  Log In
                </button>
              </Link>
              <Link href="/register">
                <button className="bg-[#B30000] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700">
                  Register
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ================= FILTER HEADER ================= */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Breadcrumb and Title */}
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Link href="/category" className="text-sm text-gray-600 hover:text-[#B30000] flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3" />
                  Back to Categories
                </Link>
                
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
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {subCategoryName 
                  ? `${subCategoryName} Products`
                  : categoryName 
                  ? `${categoryName} Products`
                  : "All Products"}
                <span className="text-lg font-normal text-gray-600 ml-2">
                  ({products.length} {products.length === 1 ? 'product' : 'products'})
                </span>
              </h1>
              
              {(categoryId || subcategoryId) && (
                <p className="text-sm text-gray-500 mt-1">
                  {categoryId && subcategoryId 
                    ? `Showing products in ${categoryName} > ${subCategoryName}`
                    : categoryId
                    ? `Showing products in ${categoryName}`
                    : `Showing products in ${subCategoryName}`}
                </p>
              )}
            </div>

            {/* Search and Clear Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full sm:w-64 py-2.5 pl-10 pr-4 rounded-lg border border-gray-300 shadow-sm outline-none focus:ring-2 focus:ring-[#B30000] focus:border-[#B30000] bg-white text-gray-700"
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
              
              {(categoryId || subcategoryId || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= DEBUG INFO ================= */}
      <div className="container mx-auto px-4 pt-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-blue-800 text-sm">🛠️ Debug Information</h3>
            <button 
              onClick={fetchProducts}
              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
            >
              Refresh
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="space-y-1">
              <p><span className="font-semibold">Category:</span> {categoryName || 'None'}</p>
              <p><span className="font-semibold">Category ID:</span> {categoryId || 'None'}</p>
            </div>
            <div className="space-y-1">
              <p><span className="font-semibold">Subcategory:</span> {subCategoryName || 'None'}</p>
              <p><span className="font-semibold">Subcategory ID:</span> {subcategoryId || 'None'}</p>
            </div>
            <div className="space-y-1">
              <p><span className="font-semibold">Products:</span> {products.length} found</p>
              <p><span className="font-semibold">Status:</span> {loading ? '⏳ Loading...' : '✅ Ready'}</p>
            </div>
          </div>
          {debugInfo && (
            <div className="mt-2 p-2 bg-white rounded border">
              <span className="font-semibold">Last Action:</span> {debugInfo}
            </div>
          )}
        </div>
      </div>

      {/* ================= PRODUCT GRID ================= */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader className="animate-spin h-12 w-12 text-[#B30000] mb-4" />
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="
              grid 
              grid-cols-1 
              sm:grid-cols-2 
              md:grid-cols-3 
              lg:grid-cols-4 
              xl:grid-cols-5 
              gap-6
            ">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={{
                    ...product,
                    id: product._id,
                    price: product.variants?.[0]?.price || 0,
                    quantity: product.variants?.[0]?.quantity || "",
                    images: product.images || []
                  }}
                />
              ))}
            </div>

            {(categoryId || subcategoryId) && products.length > 0 && (
              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Showing {products.length} product{products.length !== 1 ? 's' : ''} 
                  {subCategoryName 
                    ? ` in "${subCategoryName}"`
                    : categoryName 
                    ? ` in "${categoryName}"`
                    : ''}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 md:py-20">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="h-10 w-10 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No Products Found
              </h2>
              <p className="text-gray-600 mb-6">
                {subCategoryName
                  ? `No products found in "${subCategoryName}"`
                  : categoryName
                  ? `No products found in "${categoryName}"`
                  : searchTerm
                  ? `No products found for "${searchTerm}"`
                  : "No products available at the moment"}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-[#B30000] text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  View All Products
                </button>
                <Link href="/category">
                  <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                    Browse Categories
                  </button>
                </Link>
              </div>
              
              {/* Debug buttons */}
              <div className="mt-6 space-y-2">
                <p className="text-sm text-gray-500">Debug Options:</p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={fetchWithDetailedFilter}
                    className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
                  >
                    Fetch with Detailed Filter
                  </button>
                  <button
                    onClick={() => {
                      console.log("Current products state:", products);
                      console.log("URL Params:", { categoryId, subcategoryId });
                    }}
                    className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
                  >
                    Log State
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#B30000] rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">BS</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Barber Syndicate</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Premium grooming products for the modern barber
            </p>
            <div className="flex justify-center gap-6">
              <Link href="/" className="text-sm text-gray-600 hover:text-[#B30000]">
                Home
              </Link>
              <Link href="/product" className="text-sm text-[#B30000] font-medium">
                Products
              </Link>
              <Link href="/category" className="text-sm text-gray-600 hover:text-[#B30000]">
                Categories
              </Link>
              <Link href="/contacts" className="text-sm text-gray-600 hover:text-[#B30000]">
                Contact
              </Link>
            </div>
            <p className="text-gray-500 text-sm mt-6">
              © {new Date().getFullYear()} Barber Syndicate. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}