"use client"

import React, { useState, useEffect, useRef } from "react"
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
import { Pencil, X, Trash2, Loader2, RefreshCw, Plus } from "lucide-react"

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

interface FormDataType {
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
  refreshProducts,
}: EditProductProps) {
  const [isOpen, setIsOpen] = useState(false)

  const MAX_IMAGES = 7

  const [loadingProduct, setLoadingProduct] = useState(false)

  const [formData, setFormData] = useState<FormDataType>({
    name: product.name || "",
    description: product.description || "",
    brand: product.brand || "",
    categoryId: product.categoryId || "",
    subcategoryId: product.subcategoryId || "",
    points: product.points ? product.points.join("\n") : "",
    isFeature: product.isFeature || false,
  })

  // ✅ dynamic variants
  const [variants, setVariants] = useState<Variant[]>(product.variants || [])

  // ✅ current images state (SOURCE OF TRUTH)
  const [imagePreviews, setImagePreviews] = useState<string[]>(
    product.images && product.images.length > 0
      ? product.images.slice(0, MAX_IMAGES)
      : product.image
      ? [product.image]
      : []
  )

  // ✅ replaced files map (index => File)
  const [replacedFiles, setReplacedFiles] = useState<Record<number, File>>({})

  // hidden input ref for replace
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null)

  // hidden input ref for add
  const addImageInputRef = useRef<HTMLInputElement | null>(null)

  const [uploading, setUploading] = useState(false)
  const [addingImage, setAddingImage] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([])
  const [brands, setBrands] = useState<Brand[]>([])

  const [loading, setLoading] = useState({
    categories: false,
    subcategories: false,
    brands: false,
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("adminToken")
      if (!token) console.warn("No admin token found in localStorage.")
    }
  }, [])

  // ✅ Dialog open => fetch categories/brands + fetch latest product (GET API)
  useEffect(() => {
    if (!isOpen) return

    fetchAllData()
    fetchSingleProduct() // 🔥 GET call

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // ✅ GET single product API call (latest data show without refresh)
  const fetchSingleProduct = async () => {
    try {
      setLoadingProduct(true)
      setError(null)

      const res = await fetch(
        `https://barber-syndicate.vercel.app/api/v1/product/single/${product.id}`
      )
      const data = await res.json()
      console.log("SINGLE PRODUCT API:", data)

      if (res.ok && (data.success || data.status === "success")) {
        const p = data.data || data.product || data

        setFormData({
          name: p.name || "",
          description: p.description || "",
          brand: p.brand || "",
          categoryId: p.categoryId || "",
          subcategoryId: p.subcategoryId || "",
          points: p.points ? p.points.join("\n") : "",
          isFeature: p.isFeature || false,
        })

        setVariants(p.variants || [])

        const imgs =
          p.images && Array.isArray(p.images) && p.images.length > 0
            ? p.images
            : p.image
            ? [p.image]
            : []

        setImagePreviews(imgs.slice(0, MAX_IMAGES))
        setReplacedFiles({})
      } else {
        setError(data.message || "Failed to fetch product data.")
      }
    } catch (err) {
      console.error("Error fetching single product:", err)
      setError("Network error while fetching product.")
    } finally {
      setLoadingProduct(false)
    }
  }

  const fetchAllData = async () => {
    await Promise.all([fetchCategories(), fetchSubcategories(), fetchBrands()])
  }

  const fetchCategories = async () => {
    try {
      setLoading((prev) => ({ ...prev, categories: true }))
      const res = await fetch("https://barber-syndicate.vercel.app/api/v1/category")
      const data = await res.json()
      if (data.success) setCategories(data.data)
    } catch (err) {
      console.error("Error fetching categories:", err)
    } finally {
      setLoading((prev) => ({ ...prev, categories: false }))
    }
  }

  const fetchSubcategories = async () => {
    try {
      setLoading((prev) => ({ ...prev, subcategories: true }))
      const res = await fetch(
        "https://barber-syndicate.vercel.app/api/v1/subcategory/getSubCat"
      )
      const data = await res.json()

      if ((data.status === "success" || data.success) && Array.isArray(data.data)) {
        const active = data.data.filter((sub: Subcategory) => !sub.isDelete)
        setSubcategories(active)

        if (formData.categoryId) {
          setFilteredSubcategories(
            active.filter((sub: Subcategory) => sub.catId === formData.categoryId)
          )
        }
      } else {
        setSubcategories([])
      }
    } catch (err) {
      console.error("Error fetching subcategories:", err)
      setSubcategories([])
    } finally {
      setLoading((prev) => ({ ...prev, subcategories: false }))
    }
  }

  const fetchBrands = async () => {
    try {
      setLoading((prev) => ({ ...prev, brands: true }))
      const token = localStorage.getItem("adminToken")

      const res = await fetch("https://barber-syndicate.vercel.app/api/v1/brands/getall", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      const data = await res.json()

      if (data.success && Array.isArray(data.data)) setBrands(data.data)
      else if (data.data && Array.isArray(data.data)) setBrands(data.data)
      else setBrands([])
    } catch (err) {
      console.error("Error fetching brands:", err)
      setBrands([])
    } finally {
      setLoading((prev) => ({ ...prev, brands: false }))
    }
  }

  const handleCategoryChange = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryId,
      subcategoryId: "",
    }))

    const filtered = subcategories.filter((sub) => sub.catId === categoryId)
    setFilteredSubcategories(filtered)
  }

  useEffect(() => {
    if (formData.categoryId && subcategories.length > 0) {
      setFilteredSubcategories(
        subcategories.filter((sub) => sub.catId === formData.categoryId)
      )
    }
  }, [formData.categoryId, subcategories])

  // ✅ variants
  const addVariant = () => setVariants((prev) => [...prev, { price: "", quantity: "" }])

  const updateVariant = (index: number, field: keyof Variant, value: string) => {
    if (field === "price" && value && !/^\d*\.?\d*$/.test(value)) return
    setVariants((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index))
  }

  // ✅ replace image
  const handleReplaceClick = (index: number) => {
    setReplaceIndex(index)
    fileInputRef.current?.click()
  }

  const handleReplaceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (replaceIndex === null) return

    const newBlobUrl = URL.createObjectURL(file)

    setImagePreviews((prev) => {
      const updated = [...prev]
      updated[replaceIndex] = newBlobUrl
      return updated
    })

    setReplacedFiles((prev) => ({
      ...prev,
      [replaceIndex]: file,
    }))

    setError(null)
    e.target.value = ""
  }

  // ✅ ADD IMAGE
  const handleAddImageClick = () => {
    setError(null)
    setSuccess(null)

    if (imagePreviews.length >= MAX_IMAGES) {
      setError(`Max ${MAX_IMAGES} images allowed (old + new).`)
      return
    }

    addImageInputRef.current?.click()
  }

  // ✅ Add Image (instant UI update without refresh)
  const handleAddImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const localPreview = URL.createObjectURL(file)

    // ✅ UI me turant show
    setImagePreviews((prev) => [...prev, localPreview].slice(0, MAX_IMAGES))

    try {
      setAddingImage(true)
      setError(null)
      setSuccess(null)

      const token = localStorage.getItem("adminToken")
      if (!token) {
        setError("Authentication token not found. Please login first.")
        setImagePreviews((prev) => prev.filter((img) => img !== localPreview))
        return
      }

      if (imagePreviews.length >= MAX_IMAGES) {
        setError(`Max ${MAX_IMAGES} images allowed.`)
        setImagePreviews((prev) => prev.filter((img) => img !== localPreview))
        return
      }

      const fd = new FormData()
      fd.append("image", file)

      const res = await fetch(
        `https://barber-syndicate.vercel.app/api/v1/product/add-image/${product.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: fd,
        }
      )

      const result = await res.json()
      console.log("ADD IMAGE API:", result)

      if (res.ok && (result.success || result.status === "success")) {
        const updatedImages =
          result?.data?.images ||
          result?.product?.images ||
          result?.images ||
          result?.data?.product?.images

        // ✅ backend se latest images list aayi toh sync
        if (Array.isArray(updatedImages) && updatedImages.length > 0) {
          setImagePreviews(updatedImages.slice(0, MAX_IMAGES))
        }

        setSuccess("✅ Image added successfully!")
      } else {
        setImagePreviews((prev) => prev.filter((img) => img !== localPreview))
        setError(result.message || `Failed to add image (${res.status})`)
      }
    } catch (err: any) {
      console.error("Error adding image:", err)
      setImagePreviews((prev) => prev.filter((img) => img !== localPreview))
      setError(err.message || "Network error while adding image.")
    } finally {
      setAddingImage(false)
      e.target.value = ""
    }
  }

  // ✅ SUBMIT UPDATE PRODUCT
  const handleSubmit = async () => {
    if (!formData.name || !formData.categoryId || !formData.subcategoryId || !formData.brand) {
      setError("Please fill in all required fields (Name, Category, Subcategory, Brand).")
      return
    }

    if (imagePreviews.length === 0) {
      setError("Please add at least one image.")
      return
    }

    if (imagePreviews.length > MAX_IMAGES) {
      setError(`Max ${MAX_IMAGES} images allowed.`)
      return
    }

    if (!variants || variants.length === 0) {
      setError("Please add at least one variant.")
      return
    }

    const cleanedVariants = variants.map((v) => ({
      price: v.price || "0",
      quantity: (v.quantity || "").trim(),
    }))

    if (cleanedVariants.some((v) => !v.quantity)) {
      setError("Please fill quantity for all variants.")
      return
    }

    try {
      setUploading(true)
      setError(null)
      setSuccess(null)

      const token = localStorage.getItem("adminToken")
      if (!token) {
        setError("Authentication token not found. Please login first.")
        return
      }

      const pointsArray =
        formData.points && formData.points.trim() !== ""
          ? formData.points
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean)
          : []

      const fd = new FormData()
      fd.append("name", formData.name.trim())
      fd.append("categoryId", formData.categoryId)
      fd.append("subcategoryId", formData.subcategoryId)
      fd.append("description", formData.description.trim())
      fd.append("variants", JSON.stringify(cleanedVariants))
      fd.append("brand", formData.brand)
      fd.append("points", JSON.stringify(pointsArray))
      fd.append("isFeature", String(formData.isFeature))
      fd.append("positions", JSON.stringify(["0"]))

      // ✅ IMPORTANT: existingImages = current imagePreviews
      fd.append("existingImages", JSON.stringify(imagePreviews.slice(0, MAX_IMAGES)))

      // ✅ send replaced files + index
      const replaceEntries = Object.entries(replacedFiles)
      replaceEntries.forEach(([idx, file]) => {
        fd.append("replaceIndex", idx)
        fd.append("image", file)
      })

      const res = await fetch(
        `https://barber-syndicate.vercel.app/api/v1/product/${product.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: fd,
        }
      )

      const result = await res.json()
      console.log("UPDATE PRODUCT API:", result)

      if (res.ok && result.success) {
        setSuccess("✅ Product updated successfully!")

        const updatedProduct: Product = {
          ...product,
          name: formData.name,
          description: formData.description,
          brand: formData.brand,
          categoryId: formData.categoryId,
          subcategoryId: formData.subcategoryId,
          points: pointsArray,
          isFeature: formData.isFeature,
          variants: cleanedVariants,
          images: imagePreviews.slice(0, MAX_IMAGES),
          image: imagePreviews[0] || product.image,
          pricing: product.pricing,
        }

        if (onUpdateProduct) onUpdateProduct(updatedProduct)
        else if (onEditProduct) onEditProduct(updatedProduct)
        else if (refreshProducts) refreshProducts()

        setTimeout(() => {
          setIsOpen(false)
          setSuccess(null)
        }, 1200)
      } else {
        setError(result.message || `Failed to update product (${res.status})`)
      }
    } catch (err: any) {
      console.error("Error updating product:", err)
      setError(err.message || "Network error. Please check your connection and try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="flex items-center gap-2 w-full justify-start px-3 py-2 text-sm font-normal text-gray-700 hover:bg-gray-100 hover:text-gray-900"
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

        {loadingProduct ? (
          <div className="p-10 flex items-center justify-center gap-2 text-rose-700">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading product data...
          </div>
        ) : (
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

            {/* Basic Info */}
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
                    <option value="">
                      {loading.brands ? "Loading brands..." : "Select Brand"}
                    </option>
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

            {/* Category and Subcategory */}
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
                    <option value="">
                      {loading.categories ? "Loading categories..." : "Select Category"}
                    </option>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategory" className="text-sm font-medium text-gray-700">
                  Subcategory <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <select
                    id="subcategory"
                    value={formData.subcategoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, subcategoryId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-rose-200 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white appearance-none"
                    required
                    disabled={!formData.categoryId || loading.subcategories}
                  >
                    <option value="">
                      {loading.subcategories
                        ? "Loading subcategories..."
                        : !formData.categoryId
                        ? "Select category first"
                        : filteredSubcategories.length === 0
                        ? "No subcategories available"
                        : "Select Subcategory"}
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
              </div>
            </div>

            {/* Featured */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Featured Product</Label>
                <div className="flex items-center space-x-2 p-2 border border-rose-100 rounded-md bg-white">
                  <Checkbox
                    id="isFeature"
                    checked={formData.isFeature}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isFeature: !!checked })
                    }
                    className="border-rose-200 focus:ring-rose-500 data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600"
                  />
                  <Label htmlFor="isFeature" className="text-sm text-gray-600 cursor-pointer">
                    Mark as featured product
                  </Label>
                </div>
              </div>
            </div>

            {/* Points */}
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

            {/* Variants */}
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-6 rounded-lg border border-rose-100">
              <h3 className="text-lg font-semibold text-rose-900 mb-4 flex items-center">
                Variants <span className="text-sm text-rose-600 ml-2">(Custom)</span>
              </h3>

              <div className="space-y-3">
                {variants.length > 0 ? (
                  variants.map((v, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-white p-4 rounded-md shadow-sm border border-rose-100"
                    >
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={v.price}
                        onChange={(e) => updateVariant(i, "price", e.target.value)}
                        className="flex-1 border-rose-200 focus:border-rose-500"
                      />

                      <Input
                        type="text"
                        placeholder="Quantity (eg: 1 / 12pcs / carton)"
                        value={v.quantity}
                        onChange={(e) => updateVariant(i, "quantity", e.target.value)}
                        className="flex-1 border-rose-200 focus:border-rose-500"
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVariant(i)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Delete Variant"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-600">
                    No variants found. Please add a variant.
                  </p>
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

            {/* Images */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Product Images <span className="text-rose-600">(Max {MAX_IMAGES})</span>
              </Label>

              {/* hidden input for replace */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleReplaceFileChange}
              />

              {/* hidden input for add */}
              <input
                ref={addImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAddImageChange}
              />

              <Button
                type="button"
                variant="outline"
                onClick={handleAddImageClick}
                disabled={addingImage || imagePreviews.length >= MAX_IMAGES}
                className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300"
              >
                {addingImage ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding Image...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Image ({imagePreviews.length}/{MAX_IMAGES})
                  </>
                )}
              </Button>

              {imagePreviews.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
                  {imagePreviews.slice(0, MAX_IMAGES).map((preview, index) => (
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

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full mt-2 border-rose-200 text-rose-600 hover:bg-rose-50"
                        onClick={() => handleReplaceClick(index)}
                      >
                        Replace
                      </Button>

                      {replacedFiles[index] && (
                        <p className="text-[10px] text-green-600 mt-1 text-center">
                          Replaced
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-red-500">No images found in this product.</p>
              )}
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                uploading ||
                !formData.name ||
                !formData.categoryId ||
                !formData.subcategoryId ||
                !formData.brand
              }
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
        )}
      </DialogContent>
    </Dialog>
  )
}
