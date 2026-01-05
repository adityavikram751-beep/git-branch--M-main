"use client"

import type React from "react"
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import {
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  ImageIcon,
  Search,
  X,
  Check,
  AlertCircle,
  Grid3X3,
  List,
  Layers,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  Folder,
} from "lucide-react"

const API_URL = "https://barber-syndicate.vercel.app/api/v1"

interface Category {
  _id: string
  categoryname: string
  catImg: string
}

interface SubCategory {
  _id: string
  subCatName: string
  subCatTitle: string
  catId: string
  icon?: string  // Image is stored in "icon" field
  isDelete: boolean
}

interface ImageFile {
  file: File
  previewUrl: string
}

interface ApiResponse<T> {
  success?: boolean
  status?: string
  data?: T
  message?: string
}

export default function CategoryManagement() {
  // States
  const [categories, setCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [filteredSubCategories, setFilteredSubCategories] = useState<SubCategory[]>([])
  
  // Form States
  const [categoryName, setCategoryName] = useState<string>("")
  const [subCatName, setSubCatName] = useState<string>("")
  const [subCatTitle, setSubCatTitle] = useState<string>("")
  const [selectedCatId, setSelectedCatId] = useState<string>("")
  
  // Image States
  const [selectedImages, setSelectedImages] = useState<ImageFile[]>([])
  const [selectedSubCatImages, setSelectedSubCatImages] = useState<ImageFile[]>([])
  
  // UI States
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [subCatSearchTerm, setSubCatSearchTerm] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false)
  const [itemToDelete, setItemToDelete] = useState<Category | SubCategory | null>(null)
  const [deleteType, setDeleteType] = useState<"category" | "subcategory">("category")
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editingSubCategory, setEditingSubCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [dragOver, setDragOver] = useState<boolean>(false)
  const [subCatDragOver, setSubCatDragOver] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<"categories" | "subcategories">("categories")
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem("adminToken")
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // Fetch Categories
  useEffect(() => {
    fetchCategories()
    fetchSubCategories()
  }, [])

  useEffect(() => {
    const filtered = categories.filter((category) =>
      category.categoryname.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredCategories(filtered)
  }, [categories, searchTerm])

  useEffect(() => {
    const filtered = subCategories.filter((subCat) =>
      subCat.subCatName.toLowerCase().includes(subCatSearchTerm.toLowerCase()) ||
      subCat.subCatTitle.toLowerCase().includes(subCatSearchTerm.toLowerCase())
    )
    setFilteredSubCategories(filtered)
  }, [subCategories, subCatSearchTerm])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/category`, {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("Non-JSON response:", text)
        throw new Error("Server returned non-JSON response")
      }

      const data: ApiResponse<Category[]> = await response.json()
      if (!data.success) {
        throw new Error(data.message || "Failed to fetch categories")
      }

      setCategories(data.data || [])
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch categories"
      setError(errorMessage)
      console.error("Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/subcategory/getSubCat`, {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("Non-JSON response:", text)
        throw new Error("Server returned non-JSON response")
      }

      const data: ApiResponse<SubCategory[]> = await response.json()
      if (!data.status || data.status !== "success") {
        throw new Error(data.message || "Failed to fetch subcategories")
      }

      console.log("Subcategories data received:", data.data)
      setSubCategories(data.data || [])
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch subcategories"
      setError(errorMessage)
      console.error("Fetch subcategories error:", err)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryName = (catId: string) => {
    const category = categories.find(cat => cat._id === catId)
    return category ? category.categoryname : "Unknown Category"
  }

  const getSubCatImage = (subCat: SubCategory) => {
    // Subcategory image is stored in "icon" field
    return subCat.icon || null
  }

  // Image Upload Handlers for Category
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (selectedImages.length + files.length > 1) {
      setError("You can only upload 1 image")
      return
    }

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setError("Only image files allowed")
        return
      }
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size should be less than 2MB")
        return
      }

      const previewUrl = URL.createObjectURL(file)
      setSelectedImages((prev) => [...prev, { file, previewUrl }])
    })
  }

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (selectedImages.length + files.length > 1) {
      setError("You can only upload 1 image")
      return
    }

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setError("Only image files allowed")
        return
      }
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size should be less than 2MB")
        return
      }

      const previewUrl = URL.createObjectURL(file)
      setSelectedImages((prev) => [...prev, { file, previewUrl }])
    })
    
    e.target.value = ""
  }

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
  }

  // Image Upload Handlers for Subcategory
  const handleSubCatDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setSubCatDragOver(true)
  }

  const handleSubCatDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setSubCatDragOver(false)
  }

  const handleSubCatDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setSubCatDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (selectedSubCatImages.length + files.length > 1) {
      setError("You can only upload 1 image")
      return
    }

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setError("Only image files allowed")
        return
      }
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size should be less than 2MB")
        return
      }

      const previewUrl = URL.createObjectURL(file)
      setSelectedSubCatImages((prev) => [...prev, { file, previewUrl }])
    })
  }

  const handleSubCatImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (selectedSubCatImages.length + files.length > 1) {
      setError("You can only upload 1 image")
      return
    }

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setError("Only image files allowed")
        return
      }
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size should be less than 2MB")
        return
      }

      const previewUrl = URL.createObjectURL(file)
      setSelectedSubCatImages((prev) => [...prev, { file, previewUrl }])
    })
    
    e.target.value = ""
  }

  const removeSubCatImage = (index: number) => {
    setSelectedSubCatImages((prev) => prev.filter((_, i) => i !== index))
  }

  // Category CRUD Operations
  const handleSaveCategory = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!categoryName.trim()) {
      setError("Please enter a category name")
      return
    }

    try {
      setLoading(true)

      if (editingCategory) {
        // EDIT mode - update name only
        const response = await fetch(`${API_URL}/category/${editingCategory}`, {
          method: "PUT",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ name: categoryName.trim() }),
        })

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text()
          console.error("Non-JSON response:", text)
          throw new Error("Server returned non-JSON response")
        }

        const data: ApiResponse<Category> = await response.json()
        
        if (response.ok) {
          setSuccess("Category updated successfully!")
        } else {
          throw new Error(data.message || "Failed to update category")
        }
      } else {
        // ADD mode - require image
        if (selectedImages.length === 0) {
          setError("Please select an image")
          setLoading(false)
          return
        }

        const formData = new FormData()
        formData.append("name", categoryName.trim())
        formData.append("image", selectedImages[0].file)

        const response = await fetch(`${API_URL}/category`, {
          method: "POST",
          headers: {
            ...getAuthHeaders(),
          },
          body: formData,
        })

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text()
          console.error("Non-JSON response:", text)
          
          if (text.includes("Category created successfully") || text.includes("success")) {
            setSuccess("Category added successfully!")
          } else {
            throw new Error(text || "Failed to add category")
          }
        } else {
          const data: ApiResponse<Category> = await response.json()
          
          if (data.success || data.status === "success" || (data.message && data.message.toLowerCase().includes("success"))) {
            setSuccess("Category added successfully!")
          } else {
            throw new Error(data.message || "Failed to add category")
          }
        }
      }

      setCategoryName("")
      setSelectedImages([])
      setEditingCategory(null)
      await fetchCategories()
      await fetchSubCategories()
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : `Failed to ${editingCategory ? "update" : "add"} category`
      setError(errorMessage)
      console.error("Save category error:", err)
    } finally {
      setLoading(false)
    }
  }

  // SubCategory CRUD Operations
  const handleSaveSubCategory = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!subCatName.trim()) {
      setError("Please enter a subcategory name")
      return
    }

    if (!subCatTitle.trim()) {
      setError("Please enter a subcategory title")
      return
    }

    if (!selectedCatId) {
      setError("Please select a category")
      return
    }

    try {
      setLoading(true)

      if (editingSubCategory) {
        // EDIT mode - only update text fields
        const requestBody = {
          subCatName: subCatName.trim(),
          subCatTitle: subCatTitle.trim(),
          catId: selectedCatId
        }

        const response = await fetch(`${API_URL}/subcategory/updatesubcat/${editingSubCategory}`, {
          method: "PUT",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(requestBody),
        })

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text()
          console.error("Non-JSON response:", text)
          throw new Error("Server returned non-JSON response")
        }

        const data: ApiResponse<SubCategory> = await response.json()
        if (!data.status || data.status !== "success") {
          throw new Error(data.message || "Failed to update subcategory")
        }

        setSuccess("Subcategory updated successfully!")
      } else {
        // ADD mode - require image
        if (selectedSubCatImages.length === 0) {
          setError("Please select an image for subcategory")
          setLoading(false)
          return
        }

        const formData = new FormData()
        formData.append("subCatName", subCatName.trim())
        formData.append("subCatTitle", subCatTitle.trim())
        formData.append("catId", selectedCatId)
        formData.append("image", selectedSubCatImages[0].file)

        console.log("Adding subcategory with data:", {
          subCatName: subCatName.trim(),
          subCatTitle: subCatTitle.trim(),
          catId: selectedCatId,
          imageName: selectedSubCatImages[0].file.name
        })

        const response = await fetch(`${API_URL}/subcategory/addsubcat`, {
          method: "POST",
          headers: {
            ...getAuthHeaders(),
          },
          body: formData,
        })

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text()
          console.error("Non-JSON response:", text)
          
          if (text.includes("success") || text.includes("created") || text.includes("subcategory")) {
            setSuccess("Subcategory added successfully!")
          } else {
            throw new Error(text || "Failed to add subcategory")
          }
        } else {
          const data: ApiResponse<SubCategory> = await response.json()
          console.log("Add subcategory response:", data)
          
          if (data.status === "success" || (data.message && data.message.toLowerCase().includes("success"))) {
            setSuccess("Subcategory added successfully!")
          } else {
            throw new Error(data.message || "Failed to add subcategory")
          }
        }
      }

      setSubCatName("")
      setSubCatTitle("")
      setSelectedCatId("")
      setSelectedSubCatImages([])
      setEditingSubCategory(null)
      await fetchSubCategories()
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : `Failed to ${editingSubCategory ? "update" : "add"} subcategory`
      setError(errorMessage)
      console.error("Save subcategory error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category._id)
    setCategoryName(category.categoryname)
    setSelectedImages([])
    setError("")
    setSuccess("")
    setActiveTab("categories")
  }

  const handleEditSubCategory = (subCategory: SubCategory) => {
    setEditingSubCategory(subCategory._id)
    setSubCatName(subCategory.subCatName)
    setSubCatTitle(subCategory.subCatTitle)
    setSelectedCatId(subCategory.catId)
    setSelectedSubCatImages([])
    setError("")
    setSuccess("")
    setActiveTab("subcategories")
  }

  const handleCancelEdit = () => {
    setEditingCategory(null)
    setEditingSubCategory(null)
    setCategoryName("")
    setSubCatName("")
    setSubCatTitle("")
    setSelectedCatId("")
    setSelectedImages([])
    setSelectedSubCatImages([])
    setError("")
    setSuccess("")
  }

  const openDeleteModal = (item: Category | SubCategory, type: "category" | "subcategory") => {
    setItemToDelete(item)
    setDeleteType(type)
    setDeleteModalOpen(true)
  }

  const handleDelete = async () => {
    if (!itemToDelete) return

    try {
      setLoading(true)
      let url = ""
      
      if (deleteType === "category") {
        // Category delete endpoint
        url = `${API_URL}/category/${itemToDelete._id}`
      } else {
        // Subcategory delete endpoint
        url = `${API_URL}/subcategory/deletesubcat/${itemToDelete._id}`
      }

      console.log(`Deleting ${deleteType} with URL:`, url)

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("Non-JSON response:", text)
        
        // Check if text contains success message
        if (text.includes("deleted") || text.includes("success")) {
          setSuccess(`${deleteType === "category" ? "Category" : "Subcategory"} deleted successfully!`)
          setDeleteModalOpen(false)
          setItemToDelete(null)
          await fetchCategories()
          await fetchSubCategories()
          return
        }
        throw new Error("Server returned non-JSON response")
      }

      const data: ApiResponse<void> = await response.json()
      console.log("Delete response:", data)
      
      if (deleteType === "category") {
        if (response.ok || data.success) {
          setSuccess("Category deleted successfully!")
        } else {
          throw new Error(data.message || "Failed to delete category")
        }
      } else {
        // Check for both possible response formats
        if (response.ok || data.status === "success" || data.success) {
          setSuccess("Subcategory deleted successfully!")
        } else {
          throw new Error(data.message || "Failed to delete subcategory")
        }
      }

      setDeleteModalOpen(false)
      setItemToDelete(null)
      
      await fetchCategories()
      await fetchSubCategories()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : `Failed to delete ${deleteType}`
      setError(errorMessage)
      console.error("Delete error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setError("")
    setSuccess("")
    await fetchCategories()
    await fetchSubCategories()
  }

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId)
  }

  const getSubCategoriesByCategory = (catId: string) => {
    return subCategories.filter(subCat => subCat.catId === catId)
  }

  return (
    <div className="min-h-screen bg-rose-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Layers className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Category Management
                </h1>
                <p className="text-gray-600 mt-1">Manage your categories and subcategories</p>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mt-6">
            <button
              className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === "categories" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-900"}`}
              onClick={() => setActiveTab("categories")}
            >
              Categories ({categories.length})
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === "subcategories" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-900"}`}
              onClick={() => setActiveTab("subcategories")}
            >
              Subcategories ({subCategories.length})
            </button>
          </div>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{error}</span>
            </div>
            <button onClick={() => setError("")} className="text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{success}</span>
            </div>
            <button onClick={() => setSuccess("")} className="text-green-400 hover:text-green-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Categories Tab Content */}
        {activeTab === "categories" && (
          <>
            {/* Category Form */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                {editingCategory ? (
                  <>
                    <Edit className="w-5 h-5 text-blue-600" />
                    Edit Category
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 text-blue-600" />
                    Add New Category
                  </>
                )}
              </h2>

              <form onSubmit={handleSaveCategory} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCategoryName(e.target.value)}
                    placeholder="Enter category name..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {!editingCategory && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category Image</label>
                    <div className="space-y-4">
                      {/* Image previews */}
                      {selectedImages.length > 0 && (
                        <div className="flex flex-wrap gap-4">
                          {selectedImages.map((img, index) => (
                            <div key={index} className="relative">
                              <div className="w-24 h-24 border border-gray-200 rounded-lg overflow-hidden">
                                <img
                                  src={img.previewUrl || "/placeholder.svg"}
                                  alt="Category preview"
                                  className="object-cover w-full h-full"
                                />
                              </div>
                              <button
                                type="button"
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center"
                                onClick={() => removeImage(index)}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Upload area */}
                      {selectedImages.length < 1 && (
                        <div
                          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                            dragOver
                              ? "border-blue-400 bg-blue-50"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                        >
                          <ImageIcon className={`w-10 h-10 mx-auto mb-3 ${dragOver ? "text-blue-500" : "text-gray-400"}`} />
                          <p className={`text-sm font-medium mb-2 ${dragOver ? "text-blue-600" : "text-gray-600"}`}>
                            {dragOver ? "Drop your image here" : "Drag & drop an image here"}
                          </p>
                          <p className="text-gray-500 text-sm mb-3">or</p>
                          <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors">
                            <Plus className="w-4 h-4" />
                            Choose File
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                          </label>
                          <p className="text-xs text-gray-400 mt-2">Max file size: 2MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  {editingCategory && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors"
                    disabled={loading}
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : editingCategory ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    {loading ? "Saving..." : editingCategory ? "Update Category" : "Add Category"}
                  </button>
                </div>
              </form>
            </div>

            {/* Categories List */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Folder className="w-5 h-5 text-blue-600" />
                  Categories List
                </h2>

                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                    />
                  </div>

                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded transition-colors ${
                        viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded transition-colors ${
                        viewMode === "list" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                    <span className="text-gray-600">Loading categories...</span>
                  </div>
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-lg mb-1">{searchTerm ? "No categories found" : "No categories yet"}</p>
                  <p className="text-gray-400">
                    {searchTerm ? "Try adjusting your search" : "Add your first category to get started"}
                  </p>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCategories.map((cat) => {
                    const categorySubCats = getSubCategoriesByCategory(cat._id)
                    return (
                      <div
                        key={cat._id}
                        className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="h-48 overflow-hidden relative">
                          <img
                            src={cat.catImg || "/placeholder.svg"}
                            alt={cat.categoryname}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                              ;(e.target as HTMLImageElement).src = "/abstract-categories.png"
                            }}
                          />
                          {/* Edit and Delete buttons on top right of image */}
                          <div className="absolute top-2 right-2 flex gap-1">
                            <button
                              className="p-2 bg-white/80 hover:bg-white rounded-full shadow-sm"
                              onClick={() => handleEditCategory(cat)}
                              title="Edit category"
                            >
                              <Edit size={16} className="text-blue-600" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(cat, "category")}
                              className="p-2 bg-white/80 hover:bg-white rounded-full shadow-sm"
                              title="Delete category"
                            >
                              <Trash2 size={16} className="text-red-600" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 text-lg truncate">
                                {cat.categoryname}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {categorySubCats.length} subcategories
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => toggleCategoryExpansion(cat._id)}
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 w-full"
                          >
                            {expandedCategory === cat._id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                            {expandedCategory === cat._id ? "Hide" : "View"} Subcategories
                          </button>

                          {expandedCategory === cat._id && categorySubCats.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Subcategories:</h4>
                              <div className="space-y-2">
                                {categorySubCats.map((subCat) => {
                                  const subCatImage = getSubCatImage(subCat)
                                  return (
                                    <div key={subCat._id} className="flex items-center justify-between text-sm bg-gray-50 px-3 py-2 rounded">
                                      <div className="flex items-center gap-2">
                                        {subCatImage ? (
                                          <div className="w-6 h-6 rounded overflow-hidden">
                                            <img
                                              src={subCatImage}
                                              alt={subCat.subCatName}
                                              className="w-full h-full object-cover"
                                              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                                ;(e.target as HTMLImageElement).src = "/abstract-categories.png"
                                              }}
                                            />
                                          </div>
                                        ) : (
                                          <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center">
                                            <Layers className="w-4 h-4 text-blue-400" />
                                          </div>
                                        )}
                                        <span className="text-gray-700">{subCat.subCatName}</span>
                                      </div>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => handleEditSubCategory(subCat)}
                                          className="text-blue-600 hover:text-blue-800"
                                        >
                                          <Edit size={12} />
                                        </button>
                                        <button
                                          onClick={() => openDeleteModal(subCat, "subcategory")}
                                          className="text-red-600 hover:text-red-800"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredCategories.map((cat) => {
                    const categorySubCats = getSubCategoriesByCategory(cat._id)
                    return (
                      <div
                        key={cat._id}
                        className="flex items-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0 mr-4 relative">
                          <img
                            src={cat.catImg || "/placeholder.svg"}
                            alt={cat.categoryname}
                            className="w-full h-full object-cover"
                            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                              ;(e.target as HTMLImageElement).src = "/abstract-categories.png"
                            }}
                          />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-800">{cat.categoryname}</h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {categorySubCats.length} subcategories
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm"
                                onClick={() => handleEditCategory(cat)}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => openDeleteModal(cat, "category")}
                                className="px-3 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => toggleCategoryExpansion(cat._id)}
                                className="px-3 py-1 text-gray-600 hover:bg-gray-50 rounded text-sm"
                              >
                                {expandedCategory === cat._id ? "Hide" : "Show"}
                              </button>
                            </div>
                          </div>

                          {expandedCategory === cat._id && categorySubCats.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Subcategories:</h4>
                              <div className="grid grid-cols-2 gap-2">
                                {categorySubCats.map((subCat) => {
                                  const subCatImage = getSubCatImage(subCat)
                                  return (
                                    <div key={subCat._id} className="flex items-center justify-between text-sm bg-gray-50 px-3 py-2 rounded">
                                      <div className="flex items-center gap-2">
                                        {subCatImage ? (
                                          <div className="w-6 h-6 rounded overflow-hidden">
                                            <img
                                              src={subCatImage}
                                              alt={subCat.subCatName}
                                              className="w-full h-full object-cover"
                                              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                                ;(e.target as HTMLImageElement).src = "/abstract-categories.png"
                                              }}
                                            />
                                          </div>
                                        ) : (
                                          <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center">
                                            <Layers className="w-4 h-4 text-blue-400" />
                                          </div>
                                        )}
                                        <span className="text-gray-700">{subCat.subCatName}</span>
                                      </div>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => handleEditSubCategory(subCat)}
                                          className="text-blue-600 hover:text-blue-800 text-xs"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => openDeleteModal(subCat, "subcategory")}
                                          className="text-red-600 hover:text-red-800 text-xs"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* Subcategories Tab Content */}
        {activeTab === "subcategories" && (
          <>
            {/* Subcategory Form */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                {editingSubCategory ? (
                  <>
                    <Edit className="w-5 h-5 text-blue-600" />
                    Edit Subcategory
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 text-blue-600" />
                    Add New Subcategory
                  </>
                )}
              </h2>

              <form onSubmit={handleSaveSubCategory} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory Name</label>
                    <input
                      type="text"
                      value={subCatName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setSubCatName(e.target.value)}
                      placeholder="Enter subcategory name..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Parent Category</label>
                    <select
                      value={selectedCatId}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedCatId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.categoryname}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={subCatTitle}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setSubCatTitle(e.target.value)}
                    placeholder="Enter description..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {!editingSubCategory && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory Image</label>
                    <div className="space-y-4">
                      {/* Image previews */}
                      {selectedSubCatImages.length > 0 && (
                        <div className="flex flex-wrap gap-4">
                          {selectedSubCatImages.map((img, index) => (
                            <div key={index} className="relative">
                              <div className="w-24 h-24 border border-gray-200 rounded-lg overflow-hidden">
                                <img
                                  src={img.previewUrl || "/placeholder.svg"}
                                  alt="Subcategory preview"
                                  className="object-cover w-full h-full"
                                />
                              </div>
                              <button
                                type="button"
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center"
                                onClick={() => removeSubCatImage(index)}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Upload area */}
                      {selectedSubCatImages.length < 1 && (
                        <div
                          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                            subCatDragOver
                              ? "border-blue-400 bg-blue-50"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                          onDragOver={handleSubCatDragOver}
                          onDragLeave={handleSubCatDragLeave}
                          onDrop={handleSubCatDrop}
                        >
                          <ImageIcon className={`w-10 h-10 mx-auto mb-3 ${subCatDragOver ? "text-blue-500" : "text-gray-400"}`} />
                          <p className={`text-sm font-medium mb-2 ${subCatDragOver ? "text-blue-600" : "text-gray-600"}`}>
                            {subCatDragOver ? "Drop your image here" : "Drag & drop an image here"}
                          </p>
                          <p className="text-gray-500 text-sm mb-3">or</p>
                          <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors">
                            <Plus className="w-4 h-4" />
                            Choose File
                            <input type="file" accept="image/*" onChange={handleSubCatImageUpload} className="hidden" />
                          </label>
                          <p className="text-xs text-gray-400 mt-2">Max file size: 2MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  {editingSubCategory && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors"
                    disabled={loading}
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : editingSubCategory ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    {loading ? "Saving..." : editingSubCategory ? "Update Subcategory" : "Add Subcategory"}
                  </button>
                </div>
              </form>
            </div>

            {/* Subcategories List */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600" />
                  Subcategories List
                </h2>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search subcategories..."
                    value={subCatSearchTerm}
                    onChange={(e) => setSubCatSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                    <span className="text-gray-600">Loading subcategories...</span>
                  </div>
                </div>
              ) : filteredSubCategories.length === 0 ? (
                <div className="text-center py-12">
                  <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-lg mb-1">
                    {subCatSearchTerm ? "No subcategories found" : "No subcategories yet"}
                  </p>
                  <p className="text-gray-400">
                    {subCatSearchTerm ? "Try adjusting your search" : "Add your first subcategory to get started"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSubCategories.map((subCat) => {
                    const subCatImage = getSubCatImage(subCat)
                    return (
                      <div
                        key={subCat._id}
                        className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="h-48 overflow-hidden relative">
                          {subCatImage ? (
                            <img
                              src={subCatImage || "/placeholder.svg"}
                              alt={subCat.subCatName}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                ;(e.target as HTMLImageElement).src = "/abstract-categories.png"
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                              <Layers className="w-16 h-16 text-blue-400" />
                            </div>
                          )}
                          {/* Edit and Delete buttons on top right of image */}
                          <div className="absolute top-2 right-2 flex gap-1">
                            <button
                              className="p-2 bg-white/80 hover:bg-white rounded-full shadow-sm"
                              onClick={() => handleEditSubCategory(subCat)}
                              title="Edit subcategory"
                            >
                              <Edit size={16} className="text-blue-600" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(subCat, "subcategory")}
                              className="p-2 bg-white/80 hover:bg-white rounded-full shadow-sm"
                              title="Delete subcategory"
                            >
                              <Trash2 size={16} className="text-red-600" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 text-lg truncate">
                                {subCat.subCatName}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {subCat.subCatTitle}
                              </p>
                              <div className="mt-2">
                                <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                  {getCategoryName(subCat.catId)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Confirm Delete</h2>
              <p className="text-gray-600">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-800">
                  {deleteType === "category" 
                    ? (itemToDelete as Category)?.categoryname 
                    : (itemToDelete as SubCategory)?.subCatName}
                </span>?
              </p>
              <p className="text-sm text-red-600 mt-2">This action cannot be undone.</p>
            </div>

            <div className="flex gap-3">
              <button
                className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
                onClick={() => {
                  setDeleteModalOpen(false)
                  setItemToDelete(null)
                }}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}