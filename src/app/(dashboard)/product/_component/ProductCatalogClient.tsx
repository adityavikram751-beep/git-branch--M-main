"use client";
import React, { useState, useEffect } from "react";
import { Loader, Search } from "lucide-react";
import ProductCard from "@/components/ProductCard";

export default function ProductCatalogClient() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const API_URL = "https://barber-syndicate.vercel.app/api/v1/product";

  // Fetch Products with 20 limit
  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      // API call with page and 20 limit
      const res = await fetch(`${API_URL}?page=${page}&limit=20&search=${searchTerm}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-[#FAF3E0] flex flex-col">
      {/* 1. MAIN HEADER - Logo Section */}
      <div className="w-full bg-[#FAF3E0] py-4 flex justify-center border-b border-orange-100">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-12 w-auto" />
          <h1 className="text-2xl font-bold text-[#B30000]">Barber Syndicate</h1>
        </div>
      </div>

      {/* 2. STICKY SEARCH BAR - Scroll karne par chipka rahega */}
      <div className="sticky top-0 z-50 bg-[#FAF3E0]/90 backdrop-blur-sm py-6 flex justify-center px-4">
        <div className="relative w-full max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search Product ...."
            className="w-full py-3 pl-12 pr-4 rounded-xl border border-gray-300 shadow-sm outline-none focus:ring-2 focus:ring-[#B30000] bg-white transition-all text-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 3. PRODUCT GRID - Exactly as per UI image */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader className="animate-spin h-10 w-10 text-[#B30000]" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {products.map((p: any) => (
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
          </>
        )}
      </main>
    </div>
  );
}