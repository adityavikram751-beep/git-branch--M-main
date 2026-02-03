"use client";

import React from "react";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";

export interface Product {
  _id?: string;
  id?: string;
  name?: string;
  price?: number;
  category?: string;
  shortDescription?: string;
  description?: string;
  quantity?: string;
  isFeature?: boolean;
  carter?: number;
  images?: string[];
  quantityOptions?: { type: string }[];
  originalPrice?: number;
  inStock?: boolean;
  key_feature?: string;
  [key: string]: any;
}

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
}

export default function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const id = product.id || product._id || "";
  const name = product.name || "No Name";
  const price = product.price ?? 0;
  const category = product.category || "Category";
  const shortDescription = product.shortDescription || "";
  const images = product.images || [];
  const originalPrice = product.originalPrice;
  const inStock = product.inStock;
  const keyFeature = product.key_feature;

  const imageUrl = images?.[0] || "/placeholder-image.jpg";

  const hasDiscount = !!(originalPrice && originalPrice > price);
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  // FUNCTION TO GET COLOR BASED ON KEY FEATURE
  const getKeyFeatureColor = (feature: string) => {
    const colorMap: Record<string, string> = {
      "Best Seller": "bg-gradient-to-r from-yellow-500 to-orange-500 text-white",
      "Premium": "bg-gradient-to-r from-purple-600 to-pink-500 text-white",
      "Trending": "bg-gradient-to-r from-red-500 to-pink-500 text-white",
      "New Arrival": "bg-gradient-to-r from-blue-500 to-cyan-400 text-white",
      "Limited Edition": "bg-gradient-to-r from-gray-800 to-gray-600 text-white",
      "Special Offer": "bg-gradient-to-r from-green-500 to-emerald-400 text-white",
      "Hot": "bg-gradient-to-r from-red-600 to-orange-500 text-white",
      "Featured": "bg-gradient-to-r from-blue-600 to-indigo-500 text-white",
    };
    
    return colorMap[feature] || "bg-gradient-to-r from-[#B30000] to-red-600 text-white";
  };

  const ActionButtons = ({ compact = false }: { compact?: boolean }) => (
    <>
      {!compact && (
        <Button
          size="sm"
          disabled={inStock === false}
          className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:bg-muted disabled:text-muted-foreground"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log(`Product ${id} added to cart`);
          }}
        >
          <ShoppingCart className="h-4 w-4 mr-1" /> Add to Cart
        </Button>
      )}
    </>
  );

  const productLink = id ? `/product/${id}` : "/product";

  // Get key feature color
  const keyFeatureColor = keyFeature && keyFeature.trim() ? getKeyFeatureColor(keyFeature) : "";

  // ===================== LIST VIEW =====================
  if (viewMode === "list") {
    return (
      <Link href={productLink} className="block">
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-border bg-card">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row">
              <div className="relative sm:w-48 h-48 sm:h-32 overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={name}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                  {keyFeature && keyFeature.trim() && (
                    <Badge className={`${keyFeatureColor} shadow-lg text-xs px-3 py-1`}>
                      {keyFeature}
                    </Badge>
                  )}
                  {hasDiscount && (
                    <Badge className="bg-accent text-accent-foreground">
                      {discountPercent}% OFF
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {category}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-card-foreground mb-2 line-clamp-1 text-base">
                    {name}
                  </h3>

                  <p className="text-muted-foreground mb-3 line-clamp-2 leading-snug text-sm">
                    {shortDescription}
                  </p>
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
    );
  }

  // ===================== GRID VIEW =====================
  return (
    <Link href={productLink} className="group block">
      <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-border bg-card">
        <CardContent className="p-0">
          <div className="relative overflow-hidden">
            <div className="aspect-[4/3] bg-muted">
              <img
                src={imageUrl}
                alt={name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            </div>

            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {keyFeature && keyFeature.trim() && (
                <Badge className={`${keyFeatureColor} shadow-lg text-xs px-3 py-1`}>
                  {keyFeature}
                </Badge>
              )}
              {hasDiscount && (
                <Badge className="bg-accent text-accent-foreground shadow-lg text-xs">
                  {discountPercent}% OFF
                </Badge>
              )}
              {product.isFeature && (
                <Badge className="bg-primary text-primary-foreground shadow-lg text-xs">
                  Featured
                </Badge>
              )}
            </div>
          </div>

          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs border-primary/20 text-primary">
                {category}
              </Badge>
            </div>

            <h3 className="font-bold text-card-foreground line-clamp-2 min-h-[2.5rem] text-base leading-tight">
              {name}
            </h3>

            <p className="text-muted-foreground line-clamp-2 min-h-[2rem] text-xs leading-relaxed">
              {shortDescription}
            </p>

            <div className="pt-1">
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
  );
}