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
import { Plus, X, Trash2 } from "lucide-react"

// --- Type Definitions ---
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
  key_feature?: string
  keywords?: string[]    // ✅ Changed to array
  isFeature?: boolean
  variants?: { price: string; quantity: string; percentage?: string }[]  // ✅ Added percentage
  images?: string[]
}

interface Category {
  _id: string
  categoryname: string
}

interface Brand {
  _id: string
  brand: string
}

interface SubCategory {
  _id: string
  subCatName: string
  subCatTitle: string
  catId: string
  isDelete: boolean
  __v: number
}

interface FormData {
  name: string
  description: string
  brand: string
  categoryId: string
  subcategoryId: string
  points: string
  key_feature: string
  keywords: string       // ✅ Frontend me string hi rahega
  isFeature: boolean
}

interface Variant {
  price: string
  quantity: string
  percentage?: string    // ✅ New field for discount percentage
}

interface AddProductProps {
  onAddProduct: (product: Product) => void
}
// --- End Type Definitions ---

export function AddProduct({ onAddProduct }: AddProductProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    brand: "",
    categoryId: "",
    subcategoryId: "",
    points: "",
    key_feature: "",
    keywords: "",        // ✅ String rahega frontend me
    isFeature: false,
  })

  const [variants, setVariants] = useState<Variant[]>([{ price: "", quantity: "", percentage: "" }]) // ✅ Added percentage
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [isSubCatLoading, setIsSubCatLoading] = useState(false)

  const BASE_URL = "https://barber-syndicate.vercel.app"

  useEffect(() => {
    if (!isOpen) return

    const token = localStorage.getItem("adminToken")
    if (!token) {
      setError("Authentication token not found. Please log in again.")
      return
    }

    const fetchCategories = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/v1/category`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (data.success) setCategories(data.data)
      } catch (err) {
        console.error("Error fetching categories:", err)
      }
    }

    const fetchBrands = async () => {
      const url = `${BASE_URL}/api/v1/brands/getAll`
      try {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (data.success && Array.isArray(data.data)) {
          setBrands(data.data)
        } else {
          setBrands([])
        }
      } catch (err) {
        console.error("Error fetching brands:", err)
        setBrands([])
      }
    }

    fetchCategories()
    fetchBrands()
  }, [isOpen])

  useEffect(() => {
    const token = localStorage.getItem("adminToken")
    const categoryId = formData.categoryId

    if (!categoryId || !token) {
      setSubCategories([])
      setFormData((prev) => ({ ...prev, subcategoryId: "" }))
      return
    }

    const fetchSubCategories = async () => {
      setIsSubCatLoading(true)
      const url = `${BASE_URL}/api/v1/subcategory/getSubCat?catId=${categoryId}`
      try {
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await res.json()

        if (data.status === "success" && Array.isArray(data.data)) {
          const activeSubCats = data.data.filter((sub: SubCategory) => !sub.isDelete)
          setSubCategories(activeSubCats)
          if (!activeSubCats.find((sub: SubCategory) => sub._id === formData.subcategoryId)) {
            setFormData((prev) => ({ ...prev, subcategoryId: "" }))
          }
        } else {
          setSubCategories([])
        }
      } catch (err) {
        console.error("Error fetching subcategories:", err)
        setSubCategories([])
      } finally {
        setIsSubCatLoading(false)
      }
    }

    fetchSubCategories()
  }, [formData.categoryId, formData.subcategoryId])

  // --- Handlers ---
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCatId = e.target.value
    setFormData((prev) => ({
      ...prev,
      categoryId: newCatId,
      subcategoryId: "",
    }))
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (images.length + files.length > 7) {
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
      URL.revokeObjectURL(url)
      return prev.filter((_, i) => i !== index)
    })
  }

  const updateVariant = (index: number, field: keyof Variant, value: string) => {
    // Allow only numbers and decimal for price and percentage
    if (field === "price" || field === "percentage") {
      if (value && !/^\d*\.?\d*$/.test(value)) return
    }
    const updated = [...variants]
    updated[index][field] = value
    setVariants(updated)
  }

  const addVariant = () => {
    setVariants((prev) => [...prev, { price: "", quantity: "", percentage: "" }])
  }

  const removeVariant = (index: number) => {
    setVariants((prev) => {
      if (prev.length === 1) return prev
      return prev.filter((_, i) => i !== index)
    })
  }

  useEffect(() => {
    if (!isOpen) {
      setImages([])
      imagePreviews.forEach((url) => URL.revokeObjectURL(url))
      setImagePreviews([])
      setVariants([{ price: "", quantity: "", percentage: "" }]) // ✅ Reset with percentage
      setFormData({
        name: "",
        description: "",
        brand: "",
        categoryId: "",
        subcategoryId: "",
        points: "",
        key_feature: "",
        keywords: "",     // ✅ Reset keywords
        isFeature: false,
      })
      setError(null)
      setSubCategories([])
      setIsSubCatLoading(false)
    }
  }, [isOpen])

  const handleSubmit = async () => {
    if (!formData.name || !formData.categoryId || !formData.subcategoryId || !formData.brand) {
      setError("Please fill in all required fields (Name, Category, Subcategory, Brand).")
      return
    }
    if (images.length === 0) {
      setError("Please add at least one image (max 7).")
      return
    }
    if (variants.length === 0) {
      setError("Please add at least 1 variant.")
      return
    }
    const invalidVariant = variants.some((v) => !v.quantity || !v.price)
    if (invalidVariant) {
      setError("Please fill price + quantity for all variants (or remove empty ones).")
      return
    }

    try {
      setUploading(true)
      setError(null)

      const token = localStorage.getItem("adminToken")
      if (!token) {
        setError("Authentication token not found. Please log in.")
        return
      }

      const data = new FormData()
      data.append("name", formData.name)
      data.append("description", formData.description)
      data.append("categoryId", formData.categoryId)
      data.append("subcategoryId", formData.subcategoryId)
      data.append("brand", formData.brand)
      data.append("isFeature", formData.isFeature ? "true" : "false")
      
      // ✅ CRITICAL: Send key_feature to backend
      console.log("Sending key_feature:", formData.key_feature)
      data.append("key_feature", formData.key_feature)
      
      // ✅ CRITICAL: Convert keywords string to array and send to backend
      const keywordsArray = formData.keywords
        .split(",")
        .map((keyword) => keyword.trim())
        .filter((keyword) => keyword.length > 0)
      
      console.log("Sending keywords as array:", keywordsArray)
      data.append("keywords", JSON.stringify(keywordsArray))

      const pointsArray =
        formData.points && formData.points.trim() !== ""
          ? formData.points.split("\n").map((s) => s.trim()).filter(Boolean)
          : []
      data.append("points", JSON.stringify(pointsArray))

      // ✅ Include percentage in cleaned variants
      const cleanedVariants = variants.map((v) => ({
        price: v.price || "0",
        quantity: v.quantity,
        percentage: v.percentage || "", // send empty string if not provided
      }))
      data.append("variants", JSON.stringify(cleanedVariants))

      images.forEach((img) => data.append("image", img))

      const res = await fetch(`https://barber-syndicate.vercel.app/api/v1/product`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      })

      const result = await res.json()
      console.log("API Response:", result) // ✅ Debug

      if (res.ok && result.success) {
        const newProduct: Product = {
          id: result._id || result.data?._id || crypto.randomUUID(),
          name: formData.name,
          image: result.image || result.data?.image || imagePreviews[0] || "/placeholder.svg",
          description: formData.description,
          key_feature: formData.key_feature,
          keywords: keywordsArray,        // ✅ Store as array
          pricing: {
            single: parseFloat(cleanedVariants[0]?.price) || 0,
            dozen: parseFloat(cleanedVariants[1]?.price) || 0,
            carton: parseFloat(cleanedVariants[2]?.price) || 0,
          },
          brand: formData.brand,
          categoryId: formData.categoryId,
          subcategoryId: formData.subcategoryId,
          points: pointsArray,
          isFeature: formData.isFeature,
          variants: cleanedVariants,      // ✅ Now includes percentage
          images: result.images || result.data?.images || imagePreviews,
        }

        onAddProduct(newProduct)
        setIsOpen(false)
      } else {
        setError(result.message || "Failed to add product")
      }
    } catch (err) {
      console.error("Error adding product:", err)
      setError("Error adding product. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-lg transition-all duration-200 hover:shadow-xl">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </DialogTrigger>

      <DialogContent className="border-rose-200 max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 border-b border-rose-100 bg-gradient-to-r from-rose-50 to-pink-50">
          <DialogTitle className="text-2xl font-bold text-rose-900 flex items-center">
            <Plus className="h-6 w-6 mr-2 text-rose-600" />
            Add New Product
          </DialogTitle>
          <DialogDescription className="text-rose-600">
            Create a new product in your catalog with detailed pricing options
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

          {/* Product Name + Brand */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                className="border-rose-200 focus:border-rose-500 focus:ring-rose-500"
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand" className="text-sm font-medium text-gray-700">
                Brand <span className="text-red-500">*</span>
              </Label>
              <select
                id="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-rose-200 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white"
                required
              >
                <option value="">Select Brand</option>
                {brands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.brand}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category + Subcategory */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="categoryId" className="text-sm font-medium text-gray-700">
                Category <span className="text-red-500">*</span>
              </Label>
              <select
                id="categoryId"
                value={formData.categoryId}
                onChange={handleCategoryChange}
                className="w-full px-3 py-2 border border-rose-200 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.categoryname}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategoryId" className="text-sm font-medium text-gray-700">
                Subcategory <span className="text-red-500">*</span>
              </Label>
              <select
                id="subcategoryId"
                value={formData.subcategoryId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-rose-200 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white"
                required
                disabled={!formData.categoryId || isSubCatLoading}
              >
                <option value="">
                  {!formData.categoryId
                    ? "Select category first"
                    : isSubCatLoading
                    ? "Loading subcategories..."
                    : subCategories.length === 0
                    ? "No subcategories found"
                    : "Select Subcategory"}
                </option>
                {subCategories.map((subCat) => (
                  <option key={subCat._id} value={subCat._id}>
                    {subCat.subCatName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={handleInputChange}
              className="border-rose-200 focus:border-rose-500 focus:ring-rose-500 min-h-[100px]"
              placeholder="Enter product description..."
            />
          </div>

          {/* Key Feature */}
          <div className="space-y-2">
            <Label htmlFor="key_feature" className="text-sm font-medium text-gray-700">
              Key Feature (Shows on product card)
            </Label>
            <Input
              id="key_feature"
              value={formData.key_feature}
              onChange={handleInputChange}
              className="border-rose-200 focus:border-rose-500 focus:ring-rose-500"
              placeholder="Enter key feature (e.g., 'Best Seller', 'New Arrival')"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs text-gray-500">Quick suggestions:</span>
              {["Best Seller", "New Arrival", "Trending", "Premium", "Limited Stock", "Most Popular"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setFormData({ ...formData, key_feature: tag })}
                  className="text-xs px-2 py-1 bg-rose-100 text-rose-700 rounded-md hover:bg-rose-200 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Keywords - MULTIPLE KEYWORDS SUPPORT */}
          <div className="space-y-2">
            <Label htmlFor="keywords" className="text-sm font-medium text-gray-700">
              Keywords (Comma separated for multiple keywords)
            </Label>
            <Input
              id="keywords"
              value={formData.keywords}
              onChange={handleInputChange}
              className="border-rose-200 focus:border-rose-500 focus:ring-rose-500"
              placeholder="Enter keywords separated by commas (e.g., Hair Gel, Styling, Strong Hold)"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs text-gray-500">Quick suggestions:</span>
              {["Hair Gel", "Styling", "Strong Hold", "Matte Finish", "Shampoo", "Conditioner", "Hair Oil", "Beard Care", "Hair Wax", "Hair Spray"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    const current = formData.keywords
                    // ✅ Multiple keywords support with comma
                    const newKeywords = current ? `${current}, ${tag}` : tag
                    setFormData({ ...formData, keywords: newKeywords })
                  }}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter multiple keywords separated by commas. Example: "Hair Gel, Styling, Strong Hold"
            </p>
          </div>

          {/* Featured + Points */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Featured Product</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFeature"
                  checked={formData.isFeature}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isFeature: !!checked })
                  }
                  className="border-rose-200 focus:ring-rose-500"
                />
                <Label htmlFor="isFeature" className="text-sm text-gray-600">
                  Mark as featured product (Shows "Feature" on card)
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="points" className="text-sm font-medium text-gray-700">
                Product Points (for details page)
              </Label>
              <Textarea
                id="points"
                value={formData.points}
                onChange={handleInputChange}
                className="border-rose-200 focus:border-rose-500 focus:ring-rose-500 min-h-[80px]"
                placeholder="Enter product points/benefits, one per line..."
              />
            </div>
          </div>

          {/* Variants */}
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-6 rounded-lg border border-rose-100">
            <h3 className="text-lg font-semibold text-rose-900 mb-4 flex items-center">
              Variants <span className="text-sm text-rose-600 ml-2">(Required)</span>
            </h3>
            <div className="space-y-3">
              {variants.map((v, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-md shadow-sm border border-rose-100">
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
                    placeholder="Quantity (eg: 1Pc, 12Pcs, Carton)"
                    value={v.quantity}
                    onChange={(e) => updateVariant(i, "quantity", e.target.value)}
                    className="flex-1 border-rose-200 focus:border-rose-500"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="%"
                    value={v.percentage}
                    onChange={(e) => updateVariant(i, "percentage", e.target.value)}
                    className="w-20 border-rose-200 focus:border-rose-500" // small width for percentage
                  />
                  {variants.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeVariant(i)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addVariant}
                className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300"
              >
                + Add Variant
              </Button>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label htmlFor="images" className="text-sm font-medium text-gray-700">
              Product Images <span className="text-rose-600">(At least 1, max 7)</span>
            </Label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="border-rose-200 focus:border-rose-500 focus:ring-rose-500"
            />
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
                  </div>
                ))}
              </div>
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
              !formData.brand ||
              images.length === 0 ||
              variants.length === 0 ||
              variants.some((v) => !v.price || !v.quantity)
            }
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving Product...
              </>
            ) : (
              "Add Product"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}