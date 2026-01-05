"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Search, Filter, Grid, List, Loader } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  brand: string;
  shortDescription: string;
  description: string;
  quantity: string;
  isFeature: boolean;
  carter: number;
  images: string[];
  quantityOptions: { type: string }[];
}

interface ApiProduct {
  _id: string;
  name: string;
  price: number;
  categoryId: string;
  brandId?: string;
  brand?: string;
  description: string;
  qunatity: string;
  isFeature: boolean;
  carter: number;
  images: string[];
  quantityOptions: { type: string }[];
}

interface ApiResponse {
  success: boolean;
  products: ApiProduct[];
  currentPage: number;
  totalPages: number;
  totalResults: number;
  message?: string;
}

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

interface ProductCatalogClientProps {
  initialProducts: ApiProduct[];
  initialCategories: Category[];
  initialBrands?: Brand[];
  initialPage: number;
  initialTotalPages: number;
  initialTotalResults: number;
}

export default function ProductCatalogClient({
  initialProducts,
  initialCategories,
  initialBrands = [],
  initialPage,
  initialTotalPages,
  initialTotalResults,
}: ProductCatalogClientProps) {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [selectedBrand, setSelectedBrand] = useState(
    searchParams.get("brand") || "all"
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [products, setProducts] = useState<ApiProduct[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(initialTotalPages);
  const [totalResults, setTotalResults] = useState<number>(initialTotalResults);

  const PRODUCT_API_URL =
    "https://barber-syndicate.vercel.app/api/v1/product";
  const CATEGORY_API_URL =
    "https://barber-syndicate.vercel.app/api/v1/category";
  const BRAND_API_URL =
    "https://barber-syndicate.vercel.app/api/v1/brands";

  // Fetch products
  const fetchProducts = async (page = 1, retryCount = 0) => {
    const maxRetries = 2;
    try {
      setLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(
        `${PRODUCT_API_URL}?page=${page}&category=${selectedCategory !== "all" ? selectedCategory : ""}&brand=${
          selectedBrand !== "all" ? selectedBrand : ""
        }`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      const data: ApiResponse = await response.json();

      if (data.success) {
        setProducts(data.products || []);
        setCurrentPage(data.currentPage || 1);
        setTotalPages(data.totalPages || 1);
        setTotalResults(data.totalResults || 0);
      } else {
        throw new Error(data.message || "Failed to fetch products");
      }
    } catch (err) {
      let errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      if (err instanceof Error && err.name === "AbortError") {
        errorMessage = "Request timed out.";
      }

      if (retryCount < maxRetries) {
        return fetchProducts(page, retryCount + 1);
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await fetch(CATEGORY_API_URL);
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        const newCategories = data.data.map((cat: any) => ({
          id: cat._id,
          name: cat.categoryname,
        }));
        setCategories(newCategories);
        console.log("Fetched categories:", newCategories); // Debugging
      } else {
        console.error("Invalid category data:", data);
      }
    } catch (err) {
      console.error("Error fetching categories", err);
    }
  };

  // Fetch brands from API
  const fetchBrands = async () => {
    try {
      const response = await fetch(BRAND_API_URL);
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        const newBrands = data.data.map((brand: any) => ({
          id: brand._id,
          name: brand.brand,
        }));
        setBrands(newBrands);
        console.log("Fetched brands:", newBrands); // Debugging
      } else {
        console.error("Invalid brand data:", data);
      }
    } catch (err) {
      console.error("Error fetching brands", err);
    }
  };

  useEffect(() => {
    const categoryFromParams = searchParams.get("category") || "all";
    const brandFromParams = searchParams.get("brand") || "all";
    console.log("URL params - category:", categoryFromParams, "brand:", brandFromParams); // Debugging
    setSelectedCategory(categoryFromParams);
    setSelectedBrand(brandFromParams);

    if (!initialProducts.length) {
      fetchProducts();
    }
    if (!initialCategories.length) {
      fetchCategories();
    }
    if (!initialBrands.length) {
      fetchBrands();
    }
  }, [searchParams, initialProducts, initialCategories, initialBrands]);

  const transformedProducts = useMemo(() => {
    return products.map((product) => ({
      id: product._id,
      name: product.name,
      price: product.price,
      category: product.categoryId,
      brand: product.brandId || product.brand || "Unknown",
      shortDescription: product.description,
      description: product.description,
      quantity: product.qunatity,
      isFeature: product.isFeature,
      carter: product.carter,
      images: product.images || ["/placeholder-image.jpg"],
      quantityOptions: product.quantityOptions || [{ type: "Default" }],
    }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return transformedProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.shortDescription
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      const matchesBrand =
        selectedBrand === "all" || product.brand === selectedBrand;
      return matchesSearch && matchesCategory && matchesBrand;
    });
  }, [transformedProducts, searchTerm, selectedCategory, selectedBrand]);

  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      fetchProducts(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Clear all filters function
  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedBrand("all");
    console.log("Filters cleared"); // Debugging
  };

  // Debug selection changes
  const handleCategoryChange = (value: string) => {
    console.log("Selected category:", value); // Debugging
    setSelectedCategory(value);
    fetchProducts(1); // Refetch products with new filters
  };

  const handleBrandChange = (value: string) => {
    console.log("Selected brand:", value); // Debugging
    setSelectedBrand(value);
    fetchProducts(1); // Refetch products with new filters
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <Search className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error loading products
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button
            onClick={() => fetchProducts()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col justify-center">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Product Catalog
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our extensive collection of premium wholesale cosmetic products
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-80">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Filter className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Filters
                  </h3>
                </div>

                {/* Search */}
                <div className="mb-8">
                  <Label
                    htmlFor="search"
                    className="text-sm font-medium text-gray-700 mb-3 block"
                  >
                    Search Products
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div className="mb-8">
                  <Label className="text-sm font-medium text-gray-700 mb-4 block">
                    Categories
                  </Label>
                  <RadioGroup
                    value={selectedCategory}
                    onValueChange={handleCategoryChange}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem
                        value="all"
                        id="category-all"
                        className="text-purple-600"
                      />
                      <Label
                        htmlFor="category-all"
                        className="text-sm text-gray-700 cursor-pointer hover:text-gray-900 transition-colors"
                      >
                        All Categories
                      </Label>
                    </div>
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-3">
                          <RadioGroupItem
                            value={category.id}
                            id={`category-${category.id}`}
                            className="text-purple-600"
                          />
                          <Label
                            htmlFor={`category-${category.id}`}
                            className="text-sm text-gray-700 cursor-pointer hover:text-gray-900 transition-colors capitalize"
                          >
                            {category.name}
                          </Label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No categories available</p>
                    )}
                  </RadioGroup>
                </div>

                {/* Brands */}
                <div className="mb-8">
                  <Label className="text-sm font-medium text-gray-700 mb-4 block">
                    Brands
                  </Label>
                  <RadioGroup
                    value={selectedBrand}
                    onValueChange={handleBrandChange}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem
                        value="all"
                        id="brand-all"
                        className="text-purple-600"
                      />
                      <Label
                        htmlFor="brand-all"
                        className="text-sm text-gray-700 cursor-pointer hover:text-gray-900 transition-colors"
                      >
                        All Brands
                      </Label>
                    </div>
                    {brands.length > 0 ? (
                      brands.map((brand) => (
                        <div key={brand.id} className="flex items-center space-x-3">
                          <RadioGroupItem
                            value={brand.id}
                            id={`brand-${brand.id}`}
                            className="text-purple-600"
                          />
                          <Label
                            htmlFor={`brand-${brand.id}`}
                            className="text-sm text-gray-700 cursor-pointer hover:text-gray-900 transition-colors capitalize"
                          >
                            {brand.name}
                          </Label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No brands available</p>
                    )}
                  </RadioGroup>
                </div>

                {/* Clear Filters Button */}
                <Button
                  onClick={clearAllFilters}
                  variant="outline"
                  className="w-full text-purple-600 border-purple-600 hover:bg-purple-50"
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Controls Bar */}
            {loading && products.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center">
                <Loader className="h-4 w-4 animate-spin mr-2 text-blue-600" />
                <span className="text-blue-700 text-sm">
                  Loading products...
                </span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <p className="text-sm text-gray-600">
                Showing {filteredProducts.length} of {totalResults} products
                {selectedCategory !== "all" && (
                  <span className="ml-1">
                    in{" "}
                    <span className="capitalize font-medium">
                      {categories.find((c) => c.id === selectedCategory)?.name ||
                        selectedCategory}
                    </span>
                  </span>
                )}
                {selectedBrand !== "all" && (
                  <span className="ml-1">
                    from{" "}
                    <span className="capitalize font-medium">
                      {brands.find((b) => b.id === selectedBrand)?.name ||
                        selectedBrand}
                    </span>
                  </span>
                )}
              </p>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button
                  onClick={clearAllFilters}
                  variant="outline"
                  className="text-purple-600 border-purple-600 hover:bg-purple-50"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      viewMode="grid"
                    />
                  ))}
                </div>

                {totalPages > 1 && filteredProducts.length > 0 && (
                  <div className="flex items-center justify-center space-x-2 mt-8">
                    <Button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                      variant="outline"
                    >
                      Previous
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          disabled={loading}
                          variant={
                            currentPage === page ? "default" : "outline"
                          }
                        >
                          {page}
                        </Button>
                      )
                    )}

                    <Button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || loading}
                      variant="outline"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}