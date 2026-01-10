'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
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
  Layers
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');

  const BASE_URL = "https://barber-syndicate.vercel.app";

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, subRes] = await Promise.all([
          fetch(`${BASE_URL}/api/v1/category`),
          fetch(`${BASE_URL}/api/v1/subcategory/getSubCat`)
        ]);
        const catData = await catRes.json();
        const subData = await subRes.json();

        if (catData.success) setCategories(catData.data || []);
        if (subData.status === "success") setSubCategories(subData.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Get subcategories for a specific category
  const getSubCategoriesForCategory = (catId: string) => {
    return subCategories.filter(sub => sub.catId === catId);
  };

  // Determine what to display in main content - UPDATED
  const getDisplayItems = () => {
    if (selectedSubCategory) {
      // If subcategory selected, show only that subcategory
      const subCat = subCategories.find(sub => sub._id === selectedSubCategory);
      return subCat ? [subCat] : [];
    } else if (selectedCategory) {
      // If category selected, show only that category (not its subcategories)
      const cat = categories.find(c => c._id === selectedCategory);
      return cat ? [cat] : [];
    } else {
      // If nothing selected (All Categories), show all categories
      return categories;
    }
  };

  // Handle category selection - UPDATED
  const handleCategoryClick = useCallback((catId: string) => {
    if (selectedCategory === catId) {
      // Clicking same category again should deselect
      setSelectedCategory(null);
      setSelectedSubCategory(null);
      setOpenCategory(null);
    } else {
      setSelectedCategory(catId);
      setSelectedSubCategory(null);
      setOpenCategory(catId === openCategory ? null : catId);
    }
  }, [openCategory, selectedCategory]);

  // Handle subcategory selection
  const handleSubCategoryClick = useCallback((subCatId: string, catId: string) => {
    if (selectedSubCategory === subCatId) {
      // Clicking same subcategory again should deselect
      setSelectedSubCategory(null);
      setSelectedCategory(catId);
    } else {
      setSelectedSubCategory(subCatId);
      setSelectedCategory(catId);
      setOpenCategory(catId);
    }
  }, [selectedSubCategory]);

  // Handle All Categories
  const handleAllCategories = useCallback(() => {
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setOpenCategory(null);
    setCategorySearchTerm('');
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    handleAllCategories();
  }, [handleAllCategories]);

  // Filter categories and subcategories based on search term
  const filteredCategories = React.useMemo(() => {
    if (!categorySearchTerm.trim()) return categories;

    const searchLower = categorySearchTerm.toLowerCase();
    
    return categories.filter(cat => {
      // Check if category name matches
      if (cat.categoryname?.toLowerCase().includes(searchLower)) return true;
      
      // Check if any subcategory matches
      const catSubCategories = getSubCategoriesForCategory(cat._id);
      const hasMatchingSubCategory = catSubCategories.some(sub => 
        sub.subCatName?.toLowerCase().includes(searchLower)
      );
      
      return hasMatchingSubCategory;
    });
  }, [categories, categorySearchTerm, subCategories]);

  // Navigation Items
  const navItems = [
    { name: "Home", icon: <Home className="w-4 h-4" />, href: "/" },
    { name: "Products", icon: <ShoppingBag className="w-4 h-4" />, href: "/products" },
    { name: "Brands", icon: <TagIcon className="w-4 h-4" />, href: "/brands" },
    { name: "Category", icon: <Layers className="w-4 h-4" />, href: "/category", active: true },
    { name: "Contacts", icon: <Users className="w-4 h-4" />, href: "/contacts" },
  ];

  // Product Card Component - Your design from image
  const ProductCard = ({ item }: { item: any }) => {
    const isCategory = 'categoryname' in item;
    const isSubCategory = 'subCatName' in item;
    
    return (
      <div className="bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col hover:shadow-xl transition-all duration-500 h-full">
        {/* Product Image - White background like in image */}
        <div className="h-60 flex items-center justify-center p-20 bg-white">
          <img
            src={item.catImg || item.icon || item.subCatImg || "https://via.placeholder.com/400"}
            alt={item.categoryname || item.subCatName}
            className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Product Info - Exactly like in your image */}
        <div className="p-6 pt-2 flex flex-col flex-grow">
          <h3 className="text-xl font-bold text-gray-800 mb-2 capitalize">
            {item.categoryname || item.subCatName}
          </h3>
          
          {/* Show if it's category or subcategory */}
          <div className="mb-3">
            {isCategory && (
              <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-200">
                Category
              </span>
            )}
            {isSubCategory && (
              <span className="inline-block px-2 py-1 bg-green-50 text-green-700 text-xs rounded-md border border-green-200">
                Subcategory
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-500 leading-relaxed mb-6 line-clamp-2 flex-grow">
          </p>

          {/* View Details Button - Red color like in image */}
          <Link href={isCategory ? `/product?category=${item._id}` : `/product?subcategory=${item._id}`}>
            <button className="bg-red-400  text-black px-5 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors w-full justify-center">
              View Details <span className="text-lg">→</span>
            </button>
          </Link>
        </div>
      </div>
    );
  };

  // Get current page title
  const getPageTitle = () => {
    if (selectedSubCategory) {
      const subCat = subCategories.find(s => s._id === selectedSubCategory);
      return subCat?.subCatName || 'Subcategory';
    } else if (selectedCategory) {
      const cat = categories.find(c => c._id === selectedCategory);
      return cat?.categoryname || 'Category';
    }
    return ;
  };

  // Get current description
  const getPageDescription = () => {
    if (selectedSubCategory) {
      const cat = categories.find(c => c._id === selectedCategory);
      return `Subcategory under ${cat?.categoryname || 'Category'}`;
    } else if (selectedCategory) {
      const subCatsCount = getSubCategoriesForCategory(selectedCategory).length;
      return `Category with ${subCatsCount} subcategories`;
    }
    return `Browse ${categories.length} categories`;
  };

  // Get item count
  const getItemCount = () => {
    const items = getDisplayItems();
    return items.length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
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
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    item.active 
                      ? 'text-[#B30000]' 
                      : 'text-gray-700 hover:text-[#B30000]'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-3">
                {navItems.map((item) => (
                  <Link
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
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Categories - Your design from Frame 32 */}
          <div className="lg:w-80">
            <div className="bg-yellow-50 rounded-xl border border-gray-200 p-6 sticky top-6 shadow-sm">
              {/* Header - "Categories" title */}
           
              {/* Search Box - Like in your image */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search Product ...."
                    value={categorySearchTerm}
                    onChange={(e) => setCategorySearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#B30000] focus:border-transparent placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Categories List - Exactly like your Frame 32 design */}
              <div className="space-y-1">
                {/* All Categories - Like in your image */}
                <button
                  onClick={handleAllCategories}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
                    !selectedCategory && !selectedSubCategory
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${!selectedCategory && !selectedSubCategory ? 'bg-[#B30000]' : 'bg-gray-400'}`}></div>
                    <span className="font-medium">All Categories</span>
                  </div>
                  <span className="text-xs text-gray-500">{categories.length}</span>
                </button>

                {/* Categories - Your bullet point design */}
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : filteredCategories.length > 0 ? (
                  filteredCategories.map((cat) => {
                    const catSubCategories = getSubCategoriesForCategory(cat._id);
                    const filteredSubCategories = catSubCategories.filter(sub =>
                      !categorySearchTerm || 
                      sub.subCatName?.toLowerCase().includes(categorySearchTerm.toLowerCase())
                    );

                    const shouldShow = !categorySearchTerm || 
                      cat.categoryname.toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
                      filteredSubCategories.length > 0;

                    if (!shouldShow) return null;

                    return (
                      <div key={cat._id} className="rounded-lg overflow-hidden">
                        {/* Main Category - With bullet point */}
                        <button
                          onClick={() => handleCategoryClick(cat._id)}
                          className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
                            selectedCategory === cat._id && !selectedSubCategory
                              ? 'bg-gray-100 text-gray-900 font-medium'
                              : selectedCategory === cat._id && selectedSubCategory
                                ? 'bg-gray-50 text-gray-800'
                                : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Bullet point indicator */}
                            <div className={`w-2 h-2 rounded-full ${selectedCategory === cat._id ? 'bg-[#B30000]' : 'bg-gray-400'}`}></div>
                            <span className="capitalize font-medium">{cat.categoryname}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {filteredSubCategories.length > 0 && (
                              <span className="text-xs text-gray-500">
                                {filteredSubCategories.length}
                              </span>
                            )}
                            {filteredSubCategories.length > 0 && (
                              openCategory === cat._id ? (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              )
                            )}
                          </div>
                        </button>

                        {/* Subcategories - Indented with smaller bullet points */}
                        {openCategory === cat._id && filteredSubCategories.length > 0 && (
                          <div className="ml-6 mt-1 space-y-1">
                            {filteredSubCategories.map((sub) => (
                              <button
                                key={sub._id}
                                onClick={() => handleSubCategoryClick(sub._id, cat._id)}
                                className={`w-full text-left px-4 py-2 rounded transition-colors flex items-center gap-3 ${
                                  selectedSubCategory === sub._id
                                    ? 'bg-red-50 text-[#B30000] font-medium'
                                    : 'hover:bg-gray-50 text-gray-600'
                                }`}
                              >
                                {/* Small bullet point for subcategories */}
                                <div className={`w-1.5 h-1.5 rounded-full ${selectedSubCategory === sub._id ? 'bg-[#B30000]' : 'bg-gray-400'}`}></div>
                                <span className="capitalize text-sm">{sub.subCatName}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No categories found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Content - Main Grid */}
          <div className="flex-1">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 capitalize">
                    {getPageTitle()}
                  </h1>
                  <p className="text-gray-600">
                    {getPageDescription()}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 bg-gray-100 rounded-full">
                    <span className="text-sm text-gray-700 font-medium">
                    </span>
                  </div>
                  {(selectedCategory || selectedSubCategory || categorySearchTerm) && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-[#B30000] hover:text-red-700 font-medium"
                    >
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Main Grid - Your card design from image.png */}
            <div className="max-w-7xl mx-auto bg-white/40 p-8 rounded-[2rem] border border-white/60 shadow-sm min-h-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {loading ? (
                  [1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-[400px] w-full rounded-2xl" />
                  ))
                ) : getDisplayItems().length > 0 ? (
                  getDisplayItems().map((item: any) => (
                    <ProductCard key={item._id} item={item} />
                  ))
                ) : (
                  <div className="col-span-3 text-center py-12">
                    <div className="h-12 w-12 text-gray-400 mx-auto mb-4">
                      <Layers className="h-12 w-12" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No items found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {categorySearchTerm
                        ? `No items matching "${categorySearchTerm}"`
                        : "No items available"}
                    </p>
                    {categorySearchTerm && (
                      <button
                        onClick={() => setCategorySearchTerm('')}
                        className="px-4 py-2 bg-[#E22E2E] text-white rounded-lg text-sm font-medium hover:bg-[#c12727]"
                      >
                        Clear Search
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}