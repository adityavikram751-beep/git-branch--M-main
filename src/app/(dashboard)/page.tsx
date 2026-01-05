"use client"
import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle, MessageCircle, Truck, FileText, Loader, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import ProductCard from "@/components/ProductCard"
import { CategoryCards } from "@/components/CarouselCategory"

interface Product {
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
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        const response = await fetch("https://barber-syndicate.vercel.app/api/v1/product/feature")
        const data = await response.json()
        if (data.success) {
          const mappedProducts: Product[] = data.data.map((item: any) => ({
            id: item._id,
            name: item.name,
            price: item.price,
            category: item.categoryId,
            shortDescription: item.description.slice(0, 100),
            description: item.description,
            quantity: item.qunatity,
            isFeature: item.isFeature,
            carter: item.carter,
            images: item.images,
            quantityOptions: [{ type: item.qunatity }],
          }))
          setFeaturedProducts(mappedProducts)
        }
      } catch (error) {
        console.error("Error fetching featured products:", error)
      }
    }
    fetchFeaturedProducts()

    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token")
        setIsAuthenticated(!!token)
        setAuthChecked(true)
      }
    }

    checkAuth()
  }, [])

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#D72638]/10 via-[#FFD700]/10 to-[#D72638]/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFF8F0]/90 to-[#FFF8F0]/60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-fade-in-up">
              <Badge className="bg-[#FFD700]/20 text-[#D72638] border-[#FFD700]/40 px-4 py-2">
                <Star className="h-4 w-4 mr-2 text-[#D72638]" />
                Premium Wholesale Partner
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold text-[#2B2B2B] leading-tight">
                Premium{" "}
                <span className="bg-gradient-to-r from-[#D72638] to-[#FFD700] bg-clip-text text-transparent">
                  Wholesale
                </span>{" "}
                Cosmetics
              </h1>
              <p className="text-xl text-[#5C5C5C] leading-relaxed max-w-lg">
                Transform your business with our curated collection of premium beauty products.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#D72638] hover:bg-[#b91d2d] text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link href="/product">
                    <span>Explore Products</span>
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-8 pt-4">
                {[
                  { label: "Products", value: "500+" },
                  { label: "Happy Clients", value: "1000+" },
                  { label: "Satisfaction", value: "99%" },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div className="text-2xl font-bold text-[#D72638]">{item.value}</div>
                    <div className="text-sm text-[#5C5C5C]">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative lg:pl-8">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#FFD700]/20 to-[#D72638]/10">
                <img
                  src="https://i.pinimg.com/1200x/56/b0/09/56b009d7e650777ff1de19122217fc45.jpg"
                  alt="Premium cosmetics collection"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-white rounded-2xl shadow-xl p-6 border border-[#FFD700]/30">
                <div className="flex items-center space-x-4">
                  <div className="bg-[#FFD700]/20 p-3 rounded-xl">
                    <CheckCircle className="h-8 w-8 text-[#D72638]" />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-[#2B2B2B]">Authentic Products</p>
                    <p className="text-[#5C5C5C]">100% Genuine Guarantee</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-[#FFF2E1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-[#2B2B2B]">Why Choose Barber Syndicate?</h2>
            <p className="text-xl text-[#5C5C5C] max-w-3xl mx-auto">
              Experience the difference with our comprehensive wholesale solution designed for your success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{
              icon: <Truck className="h-10 w-10 text-white" />,
              title: "Bulk Pricing",
              desc: "Unlock exceptional wholesale rates with our tiered pricing structure. The more you order, the more you save."
            },
            {
              icon: <FileText className="h-10 w-10 text-white" />,
              title: "GST Compliant",
              desc: "Professional GST invoices for seamless business operations. Maintain perfect records effortlessly."
            },
            {
              icon: <MessageCircle className="h-10 w-10 text-white" />,
              title: "24/7 Support",
              desc: "Get instant support via WhatsApp. Our dedicated team ensures your business never stops."
            }].map((card, i) => (
              <div key={i} className="group text-center space-y-6 p-8 rounded-2xl bg-white border border-[#FFD700]/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="bg-gradient-to-br from-[#D72638] to-[#FFD700] w-20 h-20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  {card.icon}
                </div>
                <h3 className="text-2xl font-bold text-[#2B2B2B]">{card.title}</h3>
                <p className="text-[#5C5C5C] leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-[#FFF8F0]">
        
          <CategoryCards />
     
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-[#FFF2E1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-4xl font-bold text-[#2B2B2B] mb-4">Featured Products</h2>
              <p className="text-[#5C5C5C] text-lg max-w-2xl">
                Discover our most popular wholesale cosmetic products trusted by businesses worldwide.
              </p>
            </div>
            <Button asChild variant="outline" className="hidden md:flex border-[#FFD700]/40 hover:bg-[#FFD700]/10">
              <Link href="/product">
                View All Products <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <Suspense key={product.id} fallback={<div className="bg-white rounded-2xl p-6 animate-pulse">
                  <div className="bg-[#FFD700]/20 h-48 rounded-xl mb-4"></div>
                  <div className="bg-[#FFD700]/20 h-4 rounded mb-2"></div>
                  <div className="bg-[#FFD700]/20 h-4 rounded w-2/3"></div>
                </div>}>
                  <ProductCard product={product} />
                </Suspense>
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <Loader className="h-8 w-8 text-[#D72638] mx-auto animate-spin mb-4" />
                <p className="text-[#5C5C5C] text-lg">Loading featured products...</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
