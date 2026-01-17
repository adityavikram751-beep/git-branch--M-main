import React, { useState, useEffect, useCallback } from "react";

// --- Type definitions ---
interface Brand {
  _id: string;
  brand: string;
  icons?: string;
  category?: string;
  subcategory?: string;
}

interface Category {
  _id: string;
  categoryname: string;
  catImg?: string;
}

interface Subcategory {
  _id: string;
  subCatName: string;
  subCatTitle?: string;
  catId: string;
  isDelete: boolean;
}

interface ApiResponse {
  success: boolean;
  data: Brand[];
}

interface CategoryResponse {
  data: Category[];
}

interface SubcategoryResponse {
  status: string;
  data: Subcategory[];
}

interface MutateBrandResponse {
  success: boolean;
  message: string;
  data?: Brand;
}

// Token Utility
const getToken = () => {
  if (typeof window !== "undefined") {
    return (
      localStorage.getItem("adminToken") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("token")
    );
  }
  return null;
};

// --- Custom Hook ---
const useBrands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState<boolean>(false);

  const getAuthHeaders = (
    contentType: "json" | "multipart" = "json"
  ): HeadersInit => {
    const token = getToken();
    const headers: HeadersInit = {};

    if (contentType === "json") {
      headers["Content-Type"] = "application/json";
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const headers = getAuthHeaders("json");
      const response = await fetch(
        "https://barber-syndicate.vercel.app/api/v1/category",
        {
          method: "GET",
          headers: headers,
        }
      );

      if (!response.ok) throw new Error("Failed to fetch categories");

      const data: CategoryResponse = await response.json();
      setCategories(data.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  }, []);

  // Fetch Subcategories
  const fetchSubcategories = useCallback(async () => {
    try {
      const headers = getAuthHeaders("json");
      const response = await fetch(
        "https://barber-syndicate.vercel.app/api/v1/subcategory/getSubCat",
        {
          method: "GET",
          headers: headers,
        }
      );

      if (!response.ok) throw new Error("Failed to fetch subcategories");

      const data: SubcategoryResponse = await response.json();
      setSubcategories(data.data.filter((sub) => !sub.isDelete));
    } catch (err) {
      console.error("Error fetching subcategories:", err);
    }
  }, []);

  // Fetch Brands
  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = getAuthHeaders("json");
      const response = await fetch(
        "https://barber-syndicate.vercel.app/api/v1/brands/getall",
        {
          method: "GET",
          headers: headers,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (data.success) {
        setBrands(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching brands");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create Brand
  const createBrand = async (
    name: string,
    file: File | null,
    categoryId: string,
    subcategoryId: string
  ): Promise<boolean> => {
    try {
      setIsMutating(true);
      setError(null);

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("brand", name.trim());

      if (file) formData.append("file", file);
      if (categoryId) formData.append("category", categoryId);
      if (subcategoryId) formData.append("subcategory", subcategoryId);

      const headers = getAuthHeaders("multipart");

      const response = await fetch(
        "https://barber-syndicate.vercel.app/api/v1/brands",
        {
          method: "POST",
          headers: headers,
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! Status: ${response.status}`
        );
      }

      const data: MutateBrandResponse = await response.json();

      if (data.success) {
        await fetchBrands();
        return true;
      } else {
        throw new Error(data.message || "Failed to create brand");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating brand");
      console.error("Error:", err);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  // Update Brand
  const updateBrand = async (
    id: string,
    name: string,
    file: File | null,
    categoryId: string,
    subcategoryId: string
  ): Promise<boolean> => {
    try {
      setIsMutating(true);
      setError(null);

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("brand", name.trim());

      if (file) formData.append("file", file);
      if (categoryId) formData.append("category", categoryId);
      if (subcategoryId) formData.append("subcategory", subcategoryId);

      const headers = getAuthHeaders("multipart");

      const response = await fetch(
        `https://barber-syndicate.vercel.app/api/v1/brands/${id}`,
        {
          method: "PUT",
          headers: headers,
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! Status: ${response.status}`
        );
      }

      const data: MutateBrandResponse = await response.json();

      if (data.success) {
        await fetchBrands();
        return true;
      } else {
        throw new Error(data.message || "Failed to update brand");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating brand");
      console.error("Error:", err);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  // ✅ Delete Brand (NEW API)
  const deleteBrand = async (id: string): Promise<boolean> => {
    try {
      setIsMutating(true);
      setError(null);

      const headers = getAuthHeaders("json");

      const response = await fetch(
        `https://barber-syndicate.vercel.app/api/v1/brands/delete-brand?brand_id=${id}`,
        {
          method: "DELETE",
          headers,
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || `HTTP error! Status: ${response.status}`
        );
      }

      await fetchBrands();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting brand");
      console.error("Error:", err);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  useEffect(() => {
    fetchBrands();
    fetchCategories();
    fetchSubcategories();
  }, [fetchBrands, fetchCategories, fetchSubcategories]);

  return {
    brands,
    categories,
    subcategories,
    loading,
    error,
    isMutating,
    refetch: fetchBrands,
    createBrand,
    updateBrand,
    deleteBrand,
  };
};

// --- Main Component ---
const Brands = () => {
  const {
    brands: brandsList,
    categories,
    subcategories,
    loading,
    error,
    isMutating,
    refetch,
    createBrand,
    updateBrand,
    deleteBrand,
  } = useBrands();

  // Form States
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    subcategory: "",
    file: null as File | null,
    previewUrl: "" as string,
  });

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");

  // Get filtered subcategories based on selected category in modal
  const getFilteredSubcategoriesForModal = () => {
    if (!formData.category) return subcategories;
    return subcategories.filter((sub) => sub.catId === formData.category);
  };

  // Get filtered brands based on selected filters
  const getFilteredBrands = () => {
    let filtered = [...brandsList];

    if (selectedCategory) {
      filtered = filtered.filter((brand) => brand.category === selectedCategory);
    }

    if (selectedSubcategory) {
      filtered = filtered.filter(
        (brand) => brand.subcategory === selectedSubcategory
      );
    }

    return filtered;
  };

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat._id === categoryId);
    return category ? category.categoryname : "Unknown";
  };

  // Get subcategory name by ID
  const getSubcategoryName = (subcategoryId: string) => {
    const subcategory = subcategories.find((sub) => sub._id === subcategoryId);
    return subcategory ? subcategory.subCatName : "Unknown";
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedCategory("");
    setSelectedSubcategory("");
  };

  // Open modal for creating
  const handleOpenCreate = () => {
    setEditingBrand(null);
    setFormData({
      name: "",
      category: "",
      subcategory: "",
      file: null,
      previewUrl: "",
    });
    setShowModal(true);
  };

  // Open modal for editing
  const handleOpenEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.brand,
      category: brand.category || "",
      subcategory: brand.subcategory || "",
      file: null,
      previewUrl: brand.icons || "",
    });
    setShowModal(true);
  };

  // Handle file change with preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        file: file,
        previewUrl: URL.createObjectURL(file),
      }));
    }
  };

  // Handle category change in modal - reset subcategory
  const handleCategoryChangeInModal = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      category: categoryId,
      subcategory: "",
    }));
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert("⚠️ Brand name is required!");
      return;
    }

    if (!formData.file && !editingBrand) {
      alert("⚠️ Please upload a brand logo!");
      return;
    }

    let success = false;

    if (editingBrand) {
      success = await updateBrand(
        editingBrand._id,
        formData.name,
        formData.file,
        formData.category,
        formData.subcategory
      );
    } else {
      success = await createBrand(
        formData.name,
        formData.file,
        formData.category,
        formData.subcategory
      );
    }

    if (success) {
      setShowModal(false);
      setFormData({
        name: "",
        category: "",
        subcategory: "",
        file: null,
        previewUrl: "",
      });
      alert(editingBrand ? "✅ Brand updated successfully!" : "✅ Brand created successfully!");
    } else {
      alert(`❌ Operation failed: ${error || "Unknown error"}`);
    }
  };

  const filteredBrands = getFilteredBrands();

  if (loading && brandsList.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading brands...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rose-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Brand Management
            </h1>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleOpenCreate}
              disabled={isMutating}
              className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              Add Brand
            </button>

            <button
              onClick={refetch}
              disabled={loading || isMutating}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded shadow-sm">
            <div className="flex items-center">
              <span className="text-xl mr-3">⚠️</span>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        </div>
      )}

      {/* Brands Grid */}
      <div className="max-w-7xl mx-auto">
        {filteredBrands.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBrands.map((brand) => (
              <div
                key={brand._id}
                className="bg-white rounded-lg shadow hover:shadow-xl transition-all duration-300 overflow-hidden group relative"
              >
                {/* ✅ BOTH ICONS TOP RIGHT */}
                <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  
                  {/* EDIT BUTTON */}
                  <button
                    onClick={() => handleOpenEdit(brand)}
                    disabled={isMutating}
                    className="bg-white text-blue-600 p-2 rounded-lg hover:bg-blue-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                    title="Edit Brand"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>

                  {/* DELETE BUTTON */}
                  <button
                    onClick={async () => {
                      const confirmDelete = confirm(`Delete brand "${brand.brand}"?`);
                      if (!confirmDelete) return;

                      const success = await deleteBrand(brand._id);

                      if (success) {
                        alert("🗑️ Brand deleted successfully!");
                      } else {
                        alert(`❌ Delete failed: ${error || "Unknown error"}`);
                      }
                    }}
                    disabled={isMutating}
                    className="bg-white text-red-600 p-2 rounded-lg hover:bg-red-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                    title="Delete Brand"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3m-4 0h14"
                      />
                    </svg>
                  </button>
                </div>

                {/* Image Container */}
                <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6 border-b">
                  {brand.icons ? (
                    <img
                      src={brand.icons}
                      alt={brand.brand}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                      {brand.brand[0]?.toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Info Section */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-center text-gray-800 mb-2">
                    {brand.brand}
                  </h3>
                  {brand.category && (
                    <p className="text-xs text-gray-500 text-center">
                      {getCategoryName(brand.category)}
                      {brand.subcategory &&
                        ` • ${getSubcategoryName(brand.subcategory)}`}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-16 text-center">
            <div className="text-7xl mb-6">📦</div>
            <h3 className="text-2xl font-bold mb-3 text-gray-800">
              No Brands Found
            </h3>
            <p className="text-gray-500 mb-6">
              {selectedCategory || selectedSubcategory
                ? "No brands match your filters. Try adjusting your selection."
                : "Get started by adding your first brand"}
            </p>

            <button
              onClick={handleOpenCreate}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-medium text-lg shadow-lg transition-all hover:scale-105"
            >
              + Add First Brand
            </button>
          </div>
        )}
      </div>

      {/* Modal with Blur Background */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 overflow-y-auto"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(8px)",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full mb-20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-xl">
              <h2 className="text-2xl font-bold">
                {editingBrand ? "✏️ Edit Brand" : "➕ Add New Brand"}
              </h2>
              <p className="text-sm text-blue-100 mt-1">
                {editingBrand ? "Update brand information" : "Create a new brand entry"}
              </p>
            </div>

            {/* Modal Form */}
            <div className="p-6 space-y-5">
              {/* Logo Preview Section */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-700 text-center">
                  Brand Logo {!editingBrand && <span className="text-red-500">*</span>}
                </label>
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden border-4 border-gray-300 shadow-lg">
                      {formData.previewUrl ? (
                        <img
                          src={formData.previewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-5xl">🖼️</span>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                      </svg>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={isMutating}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Brand Name Input */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., Nike, Adidas"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  disabled={isMutating}
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleCategoryChangeInModal(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white"
                  disabled={isMutating}
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.categoryname}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory Dropdown */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Subcategory
                </label>
                <select
                  value={formData.subcategory}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      subcategory: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white"
                  disabled={isMutating || !formData.category}
                >
                  <option value="">-- Select Subcategory --</option>
                  {getFilteredSubcategoriesForModal().map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.subCatName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={isMutating}
                  className="flex-1 px-5 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={
                    isMutating ||
                    !formData.name.trim() ||
                    (!formData.file && !editingBrand)
                  }
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-3 rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-lg"
                >
                  {isMutating ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </span>
                  ) : editingBrand ? (
                    "💾 Update Brand"
                  ) : (
                    "✨ Create Brand"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Brands;
