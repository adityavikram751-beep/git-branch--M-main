"use client"

import { ShoppingCart, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import React from "react" // React आयात किया गया

export interface Product {
  id: string
  name: string
  price: number
  category: string
  shortDescription: string
  description: string
  quantity: string
  isFeature: boolean
  carter: number
  images: string[]
  quantityOptions: { type: string }[]
  originalPrice?: number
  inStock?: boolean
}

interface ProductCardProps {
  product: Product
  viewMode?: "grid" | "list"
}

export default function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const {id, name, price, category, shortDescription, images, originalPrice, inStock } = product
  const imageUrl = images?.[0] || "/placeholder-image.jpg"
  const hasDiscount = !!(originalPrice && originalPrice > price)
  const discountPercent = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0

  // ActionButtons में onClick इवेंट को रोका गया ताकि पूरे कार्ड पर क्लिक करने का प्रभाव न पड़े।
  const ActionButtons = ({ compact = false }: { compact?: boolean }) => (
    <>
      {!compact && (
        <Button
          size="xs" 
          disabled={inStock === false}
          className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:bg-muted disabled:text-muted-foreground"
          // **IMPORTANT: prevents link navigation when clicking this button**
          onClick={(e) => {
            e.stopPropagation() // लिंक नेविगेशन को रोकता है
            // यहाँ कार्ट में जोड़ने का लॉजिक आएगा (e.g., dispatching an action)
            console.log(`Product ${id} added to cart`) 
          }}
        >
          <ShoppingCart className="h-4 w-4 mr-1" /> Add to Cart
        </Button>
      )}
    </>
  )
  
  // उत्पाद विवरण का URL
  const productLink = `/product/${id}`


  if (viewMode === "list") {
    // List View: पूरे कार्ड को Link से घेरा गया है
    return (
      <Link href={productLink} className="block"> 
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-border bg-card">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row">
              <div className="relative sm:w-48 h-48 sm:h-32 overflow-hidden">
                {/* Image component for list view */}
                <Image
                  src={imageUrl || "/placeholder.svg"}
                  alt={name}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
                {hasDiscount && (
                  <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">{discountPercent}% OFF</Badge>
                )}
              </div>
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {category}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-card-foreground mb-2 line-clamp-1 text-base">{name}</h3>
                  <p className="text-muted-foreground mb-3 line-clamp-2 leading-snug text-sm">{shortDescription}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ActionButtons />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  // Grid View: पूरे कार्ड को Link से घेरा गया है
  return (
    <Link 
      href={productLink} 
      className="group block" // group क्लास को Card से Link में ले जाया गया है
    >
      <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-border bg-card">
        <CardContent className="p-0">
          <div className="relative overflow-hidden">
            <div className="aspect-[4/3] bg-muted"> 
              <img
                src={imageUrl || "/placeholder.svg"}
                alt={name}
                // group-hover:scale-110 अब Link पर hover होने पर काम करेगा
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            </div>

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {hasDiscount && (
                <Badge className="bg-accent text-accent-foreground shadow-lg text-xs">{discountPercent}% OFF</Badge>
              )}
              {product.isFeature && <Badge className="bg-primary text-primary-foreground shadow-lg text-xs">Featured</Badge>}
            </div>
          </div>

          <div className="p-3 space-y-2"> 
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs border-primary/20 text-primary">
                {category}
              </Badge>
            </div>

            <h3 className="font-bold text-card-foreground line-clamp-2 min-h-[2.5rem] text-base leading-tight">{name}</h3> 

            <p className="text-muted-foreground line-clamp-2 min-h-[2rem] text-xs leading-relaxed">
              {shortDescription}
            </p>

            <div className="pt-1">
              {/* "View Details" बटन अब अनावश्यक है, लेकिन इसे एक साधारण बटन के रूप में रखा गया है 
                  ताकि डिज़ाइन न बिगड़े, और `Link` कॉम्पोनेंट हटा दिया गया है। */}
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
                size="sm" 
              >
                View Details
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}