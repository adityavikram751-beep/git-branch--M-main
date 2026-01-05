"use client"

import { ShoppingCart, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"

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

  const ActionButtons = ({ compact = false }: { compact?: boolean }) => (
    <>
      {!compact && (
        <Button
          size="sm"
          disabled={inStock === false}
          className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:bg-muted disabled:text-muted-foreground"
        >
          <ShoppingCart className="h-4 w-4 mr-1" /> Add to Cart
        </Button>
      )}
    </>
  )

  if (viewMode === "list") {
    return (
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-border bg-card">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            <div className="relative sm:w-64 h-48 sm:h-40 overflow-hidden">
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
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                </div>
                <h3 className="font-bold text-card-foreground mb-3 line-clamp-1 text-lg">{name}</h3>
                <p className="text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{shortDescription}</p>
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
    )
  }

  return (
    <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-border bg-card">
      <CardContent className="p-0">
        <div className="relative overflow-hidden">
          <div className="aspect-square bg-muted">
            <img
              src={imageUrl || "/placeholder.svg"}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          </div>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {hasDiscount && (
              <Badge className="bg-accent text-accent-foreground shadow-lg">{discountPercent}% OFF</Badge>
            )}
            {product.isFeature && <Badge className="bg-primary text-primary-foreground shadow-lg">Featured</Badge>}
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs border-primary/20 text-primary">
              {category}
            </Badge>
          </div>

          <h3 className="font-bold text-card-foreground line-clamp-2 min-h-[3rem] text-lg leading-tight">{name}</h3>

          <p className="text-muted-foreground line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed">
            {shortDescription}
          </p>

          <div className="space-y-4 pt-2">
             <Link href={`/product/${id}`}>
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              View Details
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
