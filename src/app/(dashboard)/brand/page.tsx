'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  ChevronUp,
  Search,
  Home,
  ShoppingBag,
  Users,
  TagIcon,
  Menu,
  X,
  Layers,
  Building2,
  Filter,
  ChevronRight
} from 'lucide-react';

interface Brand {
  _id: string;
  brand: string;
  icons: string;
  category: string;
  subcategory: string;
}

interface Category {
  _id: string;
  categoryname: string;
  catImg: string;
}

interface SubCategory {
  _id: string;
  subCatName: string;
  subCatTitle: string;
  icon: string;
  catId: string;
}

type ViewMode = 'brands' | 'categories' | 'subcategories';

export default function CategoryPage() {
  const router = useRouter();
  
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  
  const [viewMode, setViewMode] = useState<ViewMode>('brands');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [openBrand, setOpenBrand] = useState<string | null>(null);

  const BASE_URL = "https://barber-syndicate.vercel.app";
  const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NWI4ZGY4Yzg1ZDcwMzY5YWFmMTMwMiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2ODE5MTk2NywiZXhwIjoxNzY4Nzk2NzY3fQ.CL4IZAWkRIKngrITLPJvU1fgcUVVrCH9okx-ZpELjZs";

  const headers = {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [brandsRes, categoriesRes, subCategoriesRes] = await Promise.all([
          fetch(`${BASE_URL}/api/v1/brands/getall`, { headers }),
          fetch(`${BASE_URL}/api/v1/category`, { headers }),
          fetch(`${BASE_URL}/api/v1/subcategory/getSubCat`, { headers })
        ]);

        const brandsData = await brandsRes.json();
        const categoriesData = await categoriesRes.json();
        const subCategoriesData = await subCategoriesRes.json();

        if (brandsData?.success) setBrands(brandsData.data || []);
        if (categoriesData?.success) setCategories(categoriesData.data || []);
        if (subCategoriesData?.status === "success") setSubCategories(subCategoriesData.data || []);

      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleBrandSidebarClick = useCallback((brandId: string) => {
    if (openBrand === brandId) {
      setOpenBrand(null);
      setSelectedBrand(null);
      setSelectedCategory(null);
      setSelectedSubCategory(null);
      setOpenCategory(null);
      setViewMode('brands');
    } else {
      setOpenBrand(brandId);
      setSelectedBrand(brandId);
      setSelectedCategory(null);
      setSelectedSubCategory(null);
      setOpenCategory(null);
      // Keep viewMode as 'brands' to show the brand card
      setViewMode('brands');
    }
  }, [openBrand]);

  const handleCategorySidebarClick = useCallback((catId: string, brandId: string) => {
    if (openCategory === catId) {
      setOpenCategory(null);
      setSelectedCategory(null);
      setSelectedSubCategory(null);
      // Go back to showing brand card
      setViewMode('brands');
    } else {
      setOpenCategory(catId);
      setSelectedCategory(catId);
      setSelectedBrand(brandId);
      setSelectedSubCategory(null);
      setViewMode('categories');
    }
  }, [openCategory]);

  const handleSubCategorySidebarClick = useCallback((subCatId: string, catId: string, brandId: string) => {
    if (selectedSubCategory === subCatId) {
      setSelectedSubCategory(null);
      setSelectedCategory(catId);
      setSelectedBrand(brandId);
      setViewMode('categories');
    } else {
      setSelectedSubCategory(subCatId);
      setSelectedCategory(catId);
      setSelectedBrand(brandId);
      setViewMode('subcategories');
    }
  }, [selectedSubCategory]);

  const handleBrandGridClick = useCallback((brandId: string) => {
    router.push(`/product?brand=${brandId}`);
  }, [router]);

  const handleCategoryGridClick = useCallback((catId: string) => {
    if (selectedBrand) {
      router.push(`/product?brand=${selectedBrand}&category=${catId}`);
    } else {
      router.push(`/product?category=${catId}`);
    }
  }, [router, selectedBrand]);

  const handleSubCategoryGridClick = useCallback((subCatId: string) => {
    const params = new URLSearchParams();
    
    if (selectedBrand) params.append('brand', selectedBrand);
    if (selectedCategory) params.append('category', selectedCategory);
    params.append('subcategory', subCatId);
    
    router.push(`/product?${params.toString()}`);
  }, [router, selectedBrand, selectedCategory]);

  const getCategoriesForSelectedBrand = useCallback(() => {
    if (!selectedBrand) return [];
    
    const brandCategoryIds = brands
      .filter(brand => brand._id === selectedBrand)
      .map(brand => brand.category);
    
    const uniqueCategoryIds = [...new Set(brandCategoryIds)];
    
    return categories.filter(cat => uniqueCategoryIds.includes(cat._id));
  }, [selectedBrand, brands, categories]);

  const getSubCategoriesForSelectedCategory = useCallback(() => {
    if (!selectedCategory) return [];
    return subCategories.filter(sub => sub.catId === selectedCategory);
  }, [selectedCategory, subCategories]);

  const getUniqueBrands = useCallback(() => {
    return brands.filter((brand, index, self) =>
      index === self.findIndex((b) => b._id === brand._id)
    );
  }, [brands]);

  const getCurrentBrand = useCallback(() => 
    brands.find(b => b._id === selectedBrand), [selectedBrand, brands]);
  
  const getCurrentCategory = useCallback(() => 
    categories.find(c => c._id === selectedCategory), [selectedCategory, categories]);

  const getCategoriesForBrand = useCallback((brandId: string) => {
    const brandCategoryIds = brands
      .filter(brand => brand._id === brandId)
      .map(brand => brand.category);
    
    const uniqueCategoryIds = [...new Set(brandCategoryIds)];
    
    return categories.filter(cat => uniqueCategoryIds.includes(cat._id));
  }, [brands, categories]);

  const getSubCategoriesForCategory = useCallback((catId: string) => {
    return subCategories.filter(sub => sub.catId === catId);
  }, [subCategories]);

  const handleBackToBrands = useCallback(() => {
    setViewMode('brands');
    setSelectedBrand(null);
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setOpenBrand(null);
    setOpenCategory(null);
    setSearchTerm('');
  }, []);

  const handleBackToCategories = useCallback(() => {
    if (selectedBrand) {
      setViewMode('categories');
      setSelectedCategory(null);
      setSelectedSubCategory(null);
      setOpenCategory(null);
    }
  }, [selectedBrand]);

  const clearAllFilters = useCallback(() => {
    handleBackToBrands();
  }, [handleBackToBrands]);

  const handleAllBrands = useCallback(() => {
    setSelectedBrand(null);
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setOpenBrand(null);
    setOpenCategory(null);
    setViewMode('brands');
  }, []);

  const getDisplayItems = useCallback(() => {
    const searchLower = searchTerm.toLowerCase();
    
    switch (viewMode) {
      case 'brands':
        // If a brand is selected, show only that brand
        if (selectedBrand) {
          const brand = brands.find(b => b._id === selectedBrand);
          return brand ? [brand] : [];
        }
        // Otherwise show all brands
        const uniqueBrands = getUniqueBrands();
        if (!searchTerm) return uniqueBrands;
        return uniqueBrands.filter(brand => 
          brand.brand.toLowerCase().includes(searchLower)
        );
        
      case 'categories':
        if (selectedCategory) {
          const category = categories.find(c => c._id === selectedCategory);
          return category ? [category] : [];
        }
        if (selectedBrand) {
          const brandCategories = getCategoriesForSelectedBrand();
          if (!searchTerm) return brandCategories;
          return brandCategories.filter(cat => 
            cat.categoryname.toLowerCase().includes(searchLower)
          );
        }
        return [];
        
      case 'subcategories':
        if (selectedCategory) {
          const categorySubCategories = getSubCategoriesForSelectedCategory();
          if (!searchTerm) return categorySubCategories;
          return categorySubCategories.filter(sub => 
            sub.subCatName.toLowerCase().includes(searchLower)
          );
        }
        return [];
        
      default:
        return [];
    }
  }, [viewMode, selectedBrand, selectedCategory, searchTerm, brands, categories, getUniqueBrands, getCategoriesForSelectedBrand, getSubCategoriesForSelectedCategory]);

  const navItems = [
    { name: "Home", icon: Home, href: "/" },
    { name: "Products", icon: ShoppingBag, href: "/product" },
    { name: "Brands", icon: TagIcon, href: "/brands" },
    { name: "Category", icon: Layers, href: "/category", active: true },
    { name: "Contacts", icon: Users, href: "/contacts" },
  ];

  const getPageTitle = useCallback(() => {
    if (selectedSubCategory) {
      const subCat = subCategories.find(s => s._id === selectedSubCategory);
      return subCat ? `${subCat.subCatName}` : 'Subcategories';
    }
    if (selectedCategory) {
      const category = getCurrentCategory();
      return category ? `${category.categoryname} - Categories` : 'Categories';
    }
    if (selectedBrand) {
      const brand = getCurrentBrand();
      return brand ? `${brand.brand}` : 'Brands';
    }
    return `All Brands (${getUniqueBrands().length})`;
  }, [selectedBrand, selectedCategory, selectedSubCategory, getCurrentBrand, getCurrentCategory, getUniqueBrands, subCategories]);

  const getPageDescription = useCallback(() => {
    if (selectedCategory && viewMode === 'subcategories') {
      const subCatsCount = getSubCategoriesForSelectedCategory().length;
      return `${subCatsCount} subcategories available`;
    }
    if (selectedBrand && viewMode === 'categories') {
      const categoriesCount = getCategoriesForSelectedBrand().length;
      return `${categoriesCount} categories available`;
    }
    if (selectedBrand) {
      return `Click "View Details" to see all products from this brand`;
    }
    return `Browse ${getUniqueBrands().length} premium brands`;
  }, [selectedBrand, selectedCategory, viewMode, getUniqueBrands, getCategoriesForSelectedBrand, getSubCategoriesForSelectedCategory]);

  const displayItems = getDisplayItems();

  const ProductCard = ({ item, type }: { item: any, type: 'brand' | 'category' | 'subcategory' }) => {
    let title = '';
    let description = '';
    let image = '';
    let bgColor = '';

    if (type === 'brand') {
      title = item.brand;
      image = item.icons;
      bgColor = 'from-gray-50 to-gray-100';
    } else if (type === 'category') {
      title = item.categoryname;
      image = item.catImg;
      bgColor = 'from-green-50 to-emerald-100';
    } else {
      title = item.subCatName;
      description = item.subCatTitle;
      image = item.icon;
      bgColor = 'from-purple-50 to-violet-100';
    }

    return (
      <div className="bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col hover:shadow-xl transition-all duration-500 h-full">
        <div className={`h-full flex items-center justify-center p-12 bg-gradient-to-br ${bgColor}`}>
          <img
            src={image || "https://via.placeholder.com/400"}
            alt={title}
            className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/400";
            }}
          />
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-bold text-gray-800 mb-2 capitalize">
            {title}
          </h3>
          
          <div className="mb-3">
            {type === 'brand' && (
              <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-200">
                Brand
              </span>
            )}
            {type === 'category' && (
              <span className="inline-block px-2 py-1 bg-green-50 text-green-700 text-xs rounded-md border border-green-200">
                Category
              </span>
            )}
            {type === 'subcategory' && (
              <span className="inline-block px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-md border border-purple-200">
                Subcategory
              </span>
            )}
          </div>
          
          {description && (
            <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2 flex-grow">
              {description}
            </p>
          )}

          <button
            onClick={() => {
              if (type === 'brand') {
                handleBrandGridClick(item._id);
              } else if (type === 'category') {
                handleCategoryGridClick(item._id);
              } else if (type === 'subcategory') {
                handleSubCategoryGridClick(item._id);
              }
            }}
            className="mt-auto bg-red-400 text-black px-5 py-2 rounded-md text-sm font-medium flex items-center gap-2 justify-center hover:bg-red-500 transition-colors"
          >
            View Details <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );

  return (
    <div className="min-h-screen bg-yellow-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#B30000] rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">BS</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Barber Syndicate</h1>
            </div>

            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    item.active 
                      ? 'text-[#B30000]' 
                      : 'text-gray-700 hover:text-[#B30000]'
                  }`}
                >
                  {item.name}
                </a>
              ))}
            </div>

            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-3">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      item.active 
                        ? 'bg-red-50 text-[#B30000]' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-80">
            <div className="bg-orange-50 rounded-xl border border-gray-200 p-6 sticky top-6 shadow-sm">
              {viewMode !== 'brands' && (
                <button
                  onClick={viewMode === 'categories' ? handleBackToCategories : handleBackToCategories}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 mb-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium text-sm"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Back to {viewMode === 'categories' ? 'Brand' : 'Categories'}
                </button>
              )}

              {selectedBrand && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-white p-2 flex items-center justify-center border border-blue-200">
                      {getCurrentBrand()?.icons ? (
                        <img 
                          src={getCurrentBrand()?.icons} 
                          alt={getCurrentBrand()?.brand}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <Building2 className="w-6 h-6 text-blue-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 capitalize">
                        {getCurrentBrand()?.brand}
                      </p>
                      <p className="text-xs text-gray-500">Selected Brand</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder={`Search ${viewMode}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#B30000] focus:border-transparent placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <button
                  onClick={handleAllBrands}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
                    !selectedBrand && !selectedCategory && !selectedSubCategory
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${!selectedBrand && !selectedCategory && !selectedSubCategory ? 'bg-[#B30000]' : 'bg-gray-400'}`}></div>
                    <span className="font-medium">All Brands</span>
                  </div>
                  <span className="text-xs text-gray-500">{getUniqueBrands().length}</span>
                </button>

                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : getUniqueBrands().length > 0 ? (
                  getUniqueBrands().map((brand) => {
                    const brandCategories = getCategoriesForBrand(brand._id);
                    
                    return (
                      <div key={brand._id} className="rounded-lg overflow-hidden">
                        <button
                          onClick={() => handleBrandSidebarClick(brand._id)}
                          className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
                            selectedBrand === brand._id
                              ? 'bg-gray-100 text-gray-900 font-medium'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${selectedBrand === brand._id ? 'bg-[#B30000]' : 'bg-gray-400'}`}></div>
                            <span className="capitalize font-medium">{brand.brand}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {brandCategories.length}
                            </span>
                            {openBrand === brand._id && brandCategories.length > 0 ? (
                              <ChevronUp className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                        </button>

                        {openBrand === brand._id && brandCategories.length > 0 && (
                          <div className="ml-6 mt-1 space-y-1">
                            {brandCategories.map((cat) => {
                              const catSubCategories = getSubCategoriesForCategory(cat._id);
                              
                              return (
                                <div key={cat._id} className="rounded-lg overflow-hidden">
                                  <button
                                    onClick={() => handleCategorySidebarClick(cat._id, brand._id)}
                                    className={`w-full text-left px-4 py-2 rounded transition-colors flex items-center justify-between ${
                                      selectedCategory === cat._id
                                        ? 'bg-red-50 text-[#B30000] font-medium'
                                        : 'hover:bg-gray-50 text-gray-600'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`w-1.5 h-1.5 rounded-full ${selectedCategory === cat._id ? 'bg-[#B30000]' : 'bg-gray-400'}`}></div>
                                      <span className="capitalize text-sm">{cat.categoryname}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-500">
                                        {catSubCategories.length}
                                      </span>
                                      {openCategory === cat._id && catSubCategories.length > 0 ? (
                                        <ChevronUp className="h-3 w-3 text-gray-500" />
                                      ) : (
                                        <ChevronDown className="h-3 w-3 text-gray-500" />
                                      )}
                                    </div>
                                  </button>

                                  {openCategory === cat._id && catSubCategories.length > 0 && (
                                    <div className="ml-6 mt-1 space-y-1">
                                      {catSubCategories.map((sub) => (
                                        <button
                                          key={sub._id}
                                          onClick={() => handleSubCategorySidebarClick(sub._id, cat._id, brand._id)}
                                          className={`w-full text-left px-4 py-1.5 rounded transition-colors flex items-center gap-3 ${
                                            selectedSubCategory === sub._id
                                              ? 'bg-red-100 text-[#B30000] font-medium'
                                              : 'hover:bg-gray-50 text-gray-600'
                                          }`}
                                        >
                                          <div className={`w-1 h-1 rounded-full ${selectedSubCategory === sub._id ? 'bg-[#B30000]' : 'bg-gray-400'}`}></div>
                                          <span className="capitalize text-xs">{sub.subCatName}</span>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No brands found</p>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">
                    Total Items
                  </p>
                  <span className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-900">
                    {displayItems.length}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Showing {displayItems.length} items
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {getPageTitle()}
                  </h1>
                  <p className="text-gray-600">
                    {getPageDescription()}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 bg-gray-100 rounded-full">
                    <span className="text-sm text-gray-700 font-medium">
                      {displayItems.length} items
                    </span>
                  </div>
                  {(selectedBrand || selectedCategory || selectedSubCategory || searchTerm) && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-[#B30000] hover:text-red-700 font-medium flex items-center gap-1"
                    >
                      <Filter className="w-4 h-4" />
                      Clear All
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto bg-orange-50 p-8 rounded-[2rem] border border-gray-50 shadow-sm min-h-full">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-[400px] w-full rounded-2xl" />
                  ))}
                </div>
              ) : displayItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                  {(() => {
                    switch (viewMode) {
                      case 'brands':
                        return displayItems.map((item: Brand) => (
                          <ProductCard key={item._id} item={item} type="brand" />
                        ));
                      case 'categories':
                        return displayItems.map((item: Category) => (
                          <ProductCard key={item._id} item={item} type="category" />
                        ));
                      case 'subcategories':
                        return displayItems.map((item: SubCategory) => (
                          <ProductCard key={item._id} item={item} type="subcategory" />
                        ));
                      default:
                        return null;
                    }
                  })()}
                </div>
              ) : (
                <div className="col-span-3 text-center py-12">
                  <div className="h-12 w-12 text-gray-400 mx-auto mb-4">
                    {viewMode === 'brands' ? (
                      <Building2 className="h-12 w-12" />
                    ) : viewMode === 'categories' ? (
                      <Layers className="h-12 w-12" />
                    ) : (
                      <TagIcon className="h-12 w-12" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No {viewMode} found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm
                      ? `No ${viewMode} matching "${searchTerm}"`
                      : `No ${viewMode} available`}
                  </p>
                  <div className="flex gap-3 justify-center">
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="px-4 py-2 bg-[#E22E2E] text-white rounded-lg text-sm font-medium hover:bg-[#c12727]"
                      >
                        Clear Search
                      </button>
                    )}
                    <button
                      onClick={handleBackToBrands}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                    >
                      Back to Brands
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}