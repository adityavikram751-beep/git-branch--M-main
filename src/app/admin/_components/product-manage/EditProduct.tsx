"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Pencil, X, Trash2, Loader2, Upload, RefreshCw } from "lucide-react"

interface Product {
  id: string
  name: string
  image: string
  description: string
  pricing: {
    single: number
    dozen: number
    carton: number
  }
  brand?: string
  categoryId?: string
  subcategoryId?: string
  points?: string[]
  isFeature?: boolean
  variants?: { price: string; quantity: string }[]
  images?: string[]
}

interface Category {
  _id: string
  categoryname: string
}

interface Subcategory {
  _id: string
  subCatName: string
  catId: string
  subCatTitle: string
  isDelete: boolean
}

interface Brand {
  _id: string
  brand: string
}

interface FormData {
  name: string
  description: string
  brand: string
  categoryId: string
  subcategoryId: string
  points: string
  isFeature: boolean
}

interface Variant {
  price: string
  quantity: string
}

interface EditProductProps {
  product: Product
  onEditProduct?: (product: Product) => void
  onUpdateProduct?: (product: Product) => void
  refreshProducts?: () => void
}

export function EditProduct({ 
  product, 
  onEditProduct, 
  onUpdateProduct, 
  refreshProducts 
}: EditProductProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: product.name || "",
    description: product.description || "",
    brand: product.brand || "",
    categoryId: product.categoryId || "",
    subcategoryId: product.subcategoryId || "",
    points: product.points ? product.points.join("\n") : "",
    isFeature: product.isFeature || false,
  })
  const [variants, setVariants] = useState<Variant[]>([
    { price: product.pricing?.single?.toString() || "", quantity: "1" },
    { price: product.pricing?.dozen?.toString() || "", quantity: "12pcs" },
    { price: product.pricing?.carton?.toString() || "", quantity: "carton" },
    ...(product.variants?.slice(3) || []),
  ])
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>(product.images || [product.image])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState({
    categories: false,
    subcategories: false,
    brands: false
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        console.warn("No admin token found in localStorage.");
      }
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchAllData();
      
      setFormData({
        name: product.name || "",
        description: product.description || "",
        brand: product.brand || "",
        categoryId: product.categoryId || "",
        subcategoryId: product.subcategoryId || "",
        points: product.points ? product.points.join("\n") : "",
        isFeature: product.isFeature || false,
      });

      if (product.variants && product.variants.length > 0) {
        setVariants(product.variants);
      } else {
        setVariants([
          { price: product.pricing?.single?.toString() || "0", quantity: "1" },
          { price: product.pricing?.dozen?.toString() || "0", quantity: "12pcs" },
          { price: product.pricing?.carton?.toString() || "0", quantity: "carton" },
        ]);
      }
      
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, product])

  const fetchAllData = async () => {
    await Promise.all([
      fetchCategories(),
      fetchSubcategories(),
      fetchBrands()
    ]);
  }

  const fetchCategories = async () => {
    try {
      setLoading(prev => ({ ...prev, categories: true }));
      const res = await fetch("https://barber-syndicate.vercel.app/api/v1/category")
      const data = await res.json()
      if (data.success) {
        setCategories(data.data)
      } else {
        console.error("Failed to fetch categories:", data.message)
      }
    } catch (err) {
      console.error("Error fetching categories:", err)
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  }

  const fetchSubcategories = async () => {
    try {
      setLoading(prev => ({ ...prev, subcategories: true }));
      const res = await fetch("https://barber-syndicate.vercel.app/api/v1/subcategory/getSubCat");
      const data = await res.json()
      
      if (data.status === "success" && Array.isArray(data.data)) {
        const activeSubcategories = data.data.filter((sub: Subcategory) => !sub.isDelete);
        setSubcategories(activeSubcategories)
        
        if (product.categoryId && activeSubcategories.length > 0) {
          const filtered = activeSubcategories.filter(
            (sub: Subcategory) => sub.catId === product.categoryId
          );
          setFilteredSubcategories(filtered);
        }
      } else if (data.success && Array.isArray(data.data)) {
        const activeSubcategories = data.data.filter((sub: Subcategory) => !sub.isDelete);
        setSubcategories(activeSubcategories)
      } else {
        console.error("Failed to fetch subcategories:", data.message)
        setSubcategories([])
      }
    } catch (err) {
      console.error("Error fetching subcategories:", err)
      setSubcategories([])
    } finally {
      setLoading(prev => ({ ...prev, subcategories: false }));
    }
  }

  const fetchBrands = async () => {
    try {
      setLoading(prev => ({ ...prev, brands: true }));
      const token = localStorage.getItem("adminToken");
      
      const res = await fetch("https://barber-syndicate.vercel.app/api/v1/brands/getall", {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {}
      });
      
      const data = await res.json()
      
      if (data.success && Array.isArray(data.data)) {
        setBrands(data.data)
      } else if (data.data && Array.isArray(data.data)) {
        setBrands(data.data)
      } else {
        console.error("Failed to fetch brands:", data.message)
        setBrands([])
      }
    } catch (err) {
      console.error("Error fetching brands:", err)
      setBrands([])
    } finally {
      setLoading(prev => ({ ...prev, brands: false }));
    }
  }

  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => ({ 
      ...prev, 
      categoryId,
      subcategoryId: ""
    }))
    
    const filtered = subcategories.filter(
      sub => sub.catId === categoryId
    )
    setFilteredSubcategories(filtered)
  }

  useEffect(() => {
    if (formData.categoryId && subcategories.length > 0) {
      const filtered = subcategories.filter(
        sub => sub.catId === formData.categoryId
      )
      setFilteredSubcategories(filtered)
    }
  }, [formData.categoryId, subcategories])

  const addVariant = () => setVariants([...variants, { price: "", quantity: "" }])

  const updateVariant = (index: number, field: keyof Variant, value: string) => {
    if (field === "price" && value && !/^\d*\.?\d*$/.test(value)) return
    const updated = [...variants]
    updated[index][field] = value
    setVariants(updated)
  }

  const removeVariant = (index: number) => {
    if (index >= 3) {
      setVariants(variants.filter((_, i) => i !== index))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (imagePreviews.length + files.length > 7) {
      setError("You can only upload a maximum of 7 images")
      return
    }
    
    setImages((prev) => [...prev, ...files])
    setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))])
    setError(null)
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => {
      const url = prev[index]
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url)
      }
      return prev.filter((_, i) => i !== index)
    })
  }

  // Function to upload images to server
  const uploadImagesToServer = async (imageFiles: File[]): Promise<string[]> => {
    const token = localStorage.getItem("adminToken")
    if (!token) {
      throw new Error("Authentication token not found")
    }

    const uploadedImageUrls: string[] = []
    
    for (const file of imageFiles) {
      try {
        const formData = new FormData()
        formData.append("file", file)
        
        const response = await fetch("https://barber-syndicate.vercel.app/api/v1/upload", {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData
        })
        
        if (!response.ok) {
          throw new Error(`Image upload failed: ${response.status}`)
        }
        
        const result = await response.json()
        if (result.url) {
          uploadedImageUrls.push(result.url)
        } else {
          console.error("No URL returned from image upload:", result)
        }
      } catch (error) {
        console.error("Error uploading image:", error)
        throw new Error("Failed to upload one or more images")
      }
    }
    
    return uploadedImageUrls
  }

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name || !formData.categoryId || !formData.subcategoryId || !formData.brand) {
      setError("Please fill in all required fields (Name, Category, Subcategory, Brand).")
      return
    }

    // Validate images
    if (imagePreviews.length === 0) {
      setError("Please add at least one image (minimum 1, maximum 7).")
      return
    }

    // Validate variants
    const cleanedVariants = variants.map(v => ({
      ...v,
      price: v.price || "0"
    }))
    
    const requiredVariants = cleanedVariants.slice(0, 3)
    if (requiredVariants.some(v => !v.price || parseFloat(v.price) <= 0)) {
      setError("Please provide valid prices for all three required variants (Single, Dozen, Carton).")
      return
    }

    try {
      setUploading(true)
      setError(null)
      setSuccess(null)
      
      const token = localStorage.getItem("adminToken")
      
      if (!token) {
        setError("Authentication token not found. Please login first.");
        setUploading(false);
        return;
      }

      const pointsArray = formData.points && formData.points.trim() !== ""
        ? formData.points.split("\n").map((s) => s.trim()).filter(Boolean)
        : []

      console.log("Updating product ID:", product.id);
      
      // Check if product ID is valid MongoDB ObjectId format
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(product.id);
      
      if (!isValidObjectId) {
        setError(`Invalid product ID format. Expected MongoDB ObjectId (24 hex characters), got: ${product.id}`);
        setUploading(false);
        return;
      }

      // Step 1: Upload new images if any
      let uploadedImageUrls: string[] = []
      if (images.length > 0) {
        try {
          setSuccess("Uploading images...")
          uploadedImageUrls = await uploadImagesToServer(images)
          console.log("Uploaded image URLs:", uploadedImageUrls)
        } catch (uploadError: any) {
          setError(`Image upload failed: ${uploadError.message}`)
          setUploading(false)
          return
        }
      }

      // Step 2: Prepare final images array
      const finalImages: string[] = []
      let uploadedIndex = 0
      
      // Combine existing URLs and new uploaded URLs
      imagePreviews.forEach(preview => {
        if (preview.startsWith('blob:')) {
          // This is a new image that was uploaded
          if (uploadedIndex < uploadedImageUrls.length) {
            finalImages.push(uploadedImageUrls[uploadedIndex])
            uploadedIndex++
          }
        } else {
          // This is an existing image URL
          finalImages.push(preview)
        }
      })

      console.log("Final images array:", finalImages)

      // Step 3: Prepare JSON request body WITH images
      const requestBody = {
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId,
        description: formData.description.trim(),
        variants: cleanedVariants,
        brand: formData.brand,
        points: pointsArray,
        isFeature: formData.isFeature,
        images: finalImages, // ✅ Include images in the update
      };

      console.log("Request Body:", JSON.stringify(requestBody, null, 2));

      // Step 4: Send update request
      const res = await fetch(`https://barber-syndicate.vercel.app/api/v1/product/${product.id}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log("Response status:", res.status);

      const result = await res.json()
      console.log("API Response:", result)

      if (res.ok && result.success) {
        setSuccess("✅ Product updated successfully with new images!");
        
        const selectedBrand = brands.find(b => b._id === formData.brand)
        const selectedSubcategory = subcategories.find(s => s._id === formData.subcategoryId)
        
        const updatedProduct: Product = {
          ...product,
          name: formData.name,
          description: formData.description,
          brand: selectedBrand?.brand || formData.brand,
          categoryId: formData.categoryId,
          subcategoryId: formData.subcategoryId,
          points: pointsArray,
          isFeature: formData.isFeature,
          variants: cleanedVariants,
          images: finalImages,
          pricing: {
            single: parseFloat(cleanedVariants.find((v) => v.quantity === "1")?.price || "0"),
            dozen: parseFloat(cleanedVariants.find((v) => v.quantity === "12pcs")?.price || "0"),
            carton: parseFloat(cleanedVariants.find((v) => v.quantity === "carton")?.price || "0"),
          },
        }
        
        // Option 1: Call onUpdateProduct if provided (from parent)
        if (onUpdateProduct && typeof onUpdateProduct === 'function') {
          console.log("🔄 Calling onUpdateProduct:", updatedProduct)
          onUpdateProduct(updatedProduct)
        }
        // Option 2: Call onEditProduct if provided (legacy support)
        else if (onEditProduct && typeof onEditProduct === 'function') {
          console.log("🔄 Calling onEditProduct:", updatedProduct)
          onEditProduct(updatedProduct)
        }
        // Option 3: Call refreshProducts if provided
        else if (refreshProducts && typeof refreshProducts === 'function') {
          console.log("🔄 Refreshing products list...")
          setTimeout(() => {
            refreshProducts()
          }, 1000)
        }
        
        // Close dialog after 2 seconds
        setTimeout(() => {
          setIsOpen(false)
          setSuccess(null)
          // Reset images state
          setImages([])
          // Revoke blob URLs
          imagePreviews.forEach(preview => {
            if (preview.startsWith('blob:')) {
              URL.revokeObjectURL(preview)
            }
          })
        }, 2000)
        
      } else {
        let errorMsg = result.message || `Failed to update product. Status: ${res.status}`;
        
        if (errorMsg.includes("Invalid product ID")) {
          errorMsg = `Invalid product ID: "${product.id}". Please check if this is the correct product ID from the database.`;
        } else if (errorMsg.includes("Cannot read properties of undefined") || errorMsg.includes("name")) {
          errorMsg = "Server error: Required fields missing. Please check all fields are filled correctly.";
        } else if (errorMsg.includes("subcategoryId")) {
          errorMsg = "Subcategory field error. Please select a valid subcategory.";
        }
        
        setError(errorMsg);
      }
    } catch (err: any) {
      console.error("Error updating product:", err);
      setError(err.message || "Network error. Please check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
  <Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button
      type="button"
      variant="ghost"
      className="
        flex items-center gap-2
        w-full justify-start
        px-3 py-2
        text-sm font-normal
        text-gray-700
        hover:bg-gray-100
        hover:text-gray-900
      "
    >
      <Pencil className="h-4 w-4 text-gray-600" />
      Edit
    </Button>
  </DialogTrigger>

      <DialogContent className="border-rose-200 max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 border-b border-rose-100 bg-gradient-to-r from-rose-50 to-pink-50">
          <DialogTitle className="text-2xl font-bold text-black flex items-center">
            <Pencil className="h-6 w-6 mr-2 text-rose-600" />
            Edit Product
          </DialogTitle>
          <DialogDescription className="text-rose-600">
            Update product details, pricing and images
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <X className="h-4 w-4 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-green-700 font-medium">{success}</p>
                {!onUpdateProduct && !onEditProduct && !refreshProducts && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.reload()}
                    className="ml-2 text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Refresh Page
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {/* Basic Info Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-rose-200 focus:border-rose-500 focus:ring-rose-500"
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand" className="text-sm font-medium text-gray-700">
                Brand <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <select
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-3 py-2 border border-rose-200 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white appearance-none"
                  required
                  disabled={loading.brands}
                >
                  <option value="">{loading.brands ? "Loading brands..." : "Select Brand"}</option>
                  {brands.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.brand}
                    </option>
                  ))}
                </select>
                {loading.brands && (
                  <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-rose-600" />
                )}
              </div>
              {brands.length === 0 && !loading.brands && (
                <p className="text-xs text-amber-600 mt-1">No brands found</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="border-rose-200 focus:border-rose-500 focus:ring-rose-500 min-h-[100px]"
              placeholder="Enter product description..."
            />
          </div>

          {/* Category and Subcategory Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                Category <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <select
                  id="category"
                  value={formData.categoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-rose-200 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white appearance-none"
                  required
                  disabled={loading.categories}
                >
                  <option value="">{loading.categories ? "Loading categories..." : "Select Category"}</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.categoryname}
                    </option>
                  ))}
                </select>
                {loading.categories && (
                  <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-rose-600" />
                )}
              </div>
              {categories.length === 0 && !loading.categories && (
                <p className="text-xs text-amber-600 mt-1">No categories found</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategory" className="text-sm font-medium text-gray-700">
                Subcategory <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <select
                  id="subcategory"
                  value={formData.subcategoryId}
                  onChange={(e) => setFormData({ ...formData, subcategoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-rose-200 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white appearance-none"
                  required
                  disabled={!formData.categoryId || loading.subcategories}
                >
                  <option value="">
                    {loading.subcategories ? "Loading subcategories..." : 
                     !formData.categoryId ? "Select category first" : 
                     filteredSubcategories.length === 0 ? "No subcategories available" :
                     "Select Subcategory"}
                  </option>
                  {filteredSubcategories.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.subCatName}
                    </option>
                  ))}
                </select>
                {loading.subcategories && (
                  <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-rose-600" />
                )}
              </div>
              {formData.categoryId && filteredSubcategories.length === 0 && !loading.subcategories && (
                <p className="text-xs text-amber-600 mt-1">
                  No subcategories available for this category
                </p>
              )}
              {!formData.categoryId && (
                <p className="text-xs text-gray-500 mt-1">
                  Please select a category first
                </p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Featured Product</Label>
              <div className="flex items-center space-x-2 p-2 border border-rose-100 rounded-md bg-white">
                <Checkbox
                  id="isFeature"
                  checked={formData.isFeature}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFeature: !!checked })}
                  className="border-rose-200 focus:ring-rose-500 data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600"
                />
                <Label htmlFor="isFeature" className="text-sm text-gray-600 cursor-pointer">
                  Mark as featured product
                </Label>
              </div>
            </div>
          </div>

          {/* Points Section */}
          <div className="space-y-2">
            <Label htmlFor="points" className="text-sm font-medium text-gray-700">
              Product Points (one per line)
            </Label>
            <Textarea
              id="points"
              value={formData.points}
              onChange={(e) => setFormData({ ...formData, points: e.target.value })}
              className="border-rose-200 focus:border-rose-500 focus:ring-rose-500 min-h-[80px]"
              placeholder="Enter product points/benefits, one per line..."
            />
          </div>

          {/* Pricing Section */}
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-6 rounded-lg border border-rose-100">
            <h3 className="text-lg font-semibold text-rose-900 mb-4 flex items-center">
              Pricing Structure <span className="text-sm text-rose-600 ml-2">(Required)</span>
            </h3>
            <div className="space-y-4">
              {variants.slice(0, 3).map((v, i) => {
                const labels = ['Single Unit', 'Dozen (12 Pieces)', 'Carton']
                return (
                  <div key={i} className="flex items-end gap-3 bg-white p-4 rounded-md shadow-sm border border-rose-100">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                        {labels[i]}
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={`Price for ${labels[i].toLowerCase()}`}
                        value={v.price}
                        onChange={(e) => updateVariant(i, "price", e.target.value)}
                        className="border-rose-200 focus:border-rose-500 focus:ring-rose-500 text-lg font-medium"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">{v.quantity}</p>
                    </div>
                  </div>
                )
              })}
              
              {/* Optional Additional Variants */}
              {variants.length > 3 && (
                <>
                  <div className="border-t border-rose-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Additional Variants</h4>
                    {variants.slice(3).map((v, i) => (
                      <div key={i + 3} className="flex items-center gap-3 mb-3 p-3 bg-gray-50 rounded-md">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Price"
                          value={v.price}
                          onChange={(e) => updateVariant(i + 3, "price", e.target.value)}
                          className="flex-1 border-rose-200 focus:border-rose-500"
                        />
                        <Input
                          type="text"
                          placeholder="Quantity"
                          value={v.quantity}
                          onChange={(e) => updateVariant(i + 3, "quantity", e.target.value)}
                          className="flex-1 border-rose-200 focus:border-rose-500"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeVariant(i + 3)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={addVariant}
                className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300"
              >
                + Add Custom Variant
              </Button>
            </div>
          </div>

          {/* Images Section
          <div className="space-y-2">
            <Label htmlFor="images" className="text-sm font-medium text-gray-700">
              Product Images <span className="text-rose-600">(Minimum 1, Maximum 7)</span>
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="border-rose-200 focus:border-rose-500 focus:ring-rose-500 flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('images')?.click()}
                className="border-rose-200 text-rose-600 hover:bg-rose-50"
              >
                <Upload className="h-4 w-4 mr-2" />
                Browse
              </Button>
            </div>
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="relative w-full h-24 bg-gray-100 rounded-md overflow-hidden border border-rose-200">
                      <Image
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 33vw"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {preview.startsWith('blob:') && (
                      <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                        New
                      </div>
                    )}
                    {imagePreviews.length >= 7 && (
                      <div className="absolute bottom-1 left-1 bg-red-500 text-white text-xs px-1 rounded">
                        Max
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {imagePreviews.length < 7 && (
              <p className="text-xs text-gray-500 mt-1">
                You can upload {7 - imagePreviews.length} more image{7 - imagePreviews.length !== 1 ? 's' : ''}
              </p>
            )}
            {imagePreviews.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                Please upload at least 1 image
              </p>
            )}
          </div> */}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={uploading || !formData.name || !formData.categoryId || !formData.subcategoryId || !formData.brand || imagePreviews.length === 0}
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating Product...
              </>
            ) : (
              "Update Product"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}