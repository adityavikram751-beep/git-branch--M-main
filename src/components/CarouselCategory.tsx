import { useEffect, useState } from "react"
import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import { ShoppingBag, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react'

interface Category {
  _id: string
  categoryname: string
  catImg: string
}

export function CategoryCards() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("https://barber-syndicate.vercel.app/api/v1/category")
        const data = await res.json()
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data)
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Auto-scroll effect
  useEffect(() => {
    if (categories.length === 0 || isHovered) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % categories.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [categories.length, isHovered])

  const goToSlide = (index: number) => setCurrentIndex(index)
  const goToPrevious = () => setCurrentIndex(prev => prev === 0 ? categories.length - 1 : prev - 1)
  const goToNext = () => setCurrentIndex(prev => (prev + 1) % categories.length)

  if (loading) {
    return (
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="h-12 bg-[#FFD700]/30 rounded mx-auto w-64 mb-4 animate-pulse"></div>
          <div className="h-6 bg-[#FFD700]/30 rounded mx-auto w-96 animate-pulse"></div>
        </div>
        <div className="relative">
          <div className="flex gap-6 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="flex-shrink-0 w-80 animate-pulse bg-[#FFF8F0]">
                <CardContent className="p-0">
                  <div className="aspect-square bg-[#FFD700]/20 rounded-t-xl"></div>
                  <div className="p-6">
                    <div className="h-6 bg-[#FFD700]/20 rounded mb-3"></div>
                    <div className="h-4 bg-[#FFD700]/20 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (categories.length === 0) {
    return (
      <section className="py-16 px-4 bg-gradient-to-br from-[#FFF8F0] to-[#FFF2E1]">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-[#2B2B2B] mb-4">No Categories Found</h2>
          <p className="text-[#5C5C5C]">Please check back later for our product categories.</p>
        </div>
      </section>
    )
  }

  const extendedCategories = [
    ...categories.slice(-2),
    ...categories,
    ...categories.slice(0, 2)
  ]

  return (
    <section >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#2B2B2B] mb-4">
            Explore Our{" "}
            <span className="bg-gradient-to-r from-[#D72638] to-[#FFD700] bg-clip-text text-transparent">
              Categories
            </span>
          </h2>
          <p className="text-xl text-[#5C5C5C] max-w-2xl mx-auto">
            Discover our curated collection of premium products across different categories
          </p>
        </div>

        {/* Slider Container */}
        <div 
          className="relative group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Navigation Buttons */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-[#FFD700]/30 flex items-center justify-center text-[#D72638] hover:bg-[#FFD700]/20 hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-[#FFD700]/30 flex items-center justify-center text-[#D72638] hover:bg-[#FFD700]/20 hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Slider Track */}
          <div className="overflow-hidden">
            <div 
              className="flex gap-6 transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${(currentIndex + 2) * (320 + 24)}px)` }}
            >
              {extendedCategories.map((category, index) => (
                <Card
                  key={`${category._id}-${index}`}
                  className="flex-shrink-0 w-80 group/card overflow-hidden hover:shadow-2xl transition-all duration-700 hover:-translate-y-3 border border-[#FFD700]/30 bg-white cursor-pointer relative"
                >
                  {/* Trending Badge */}
                  {categories.indexOf(category) < 3 && categories.indexOf(category) >= 0 && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-gradient-to-r from-[#FFD700] to-[#D72638] text-white border-0 shadow-lg">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Trending
                      </Badge>
                    </div>
                  )}

                  <CardContent className="p-0">
                    <div className="relative overflow-hidden">
                      <div className="aspect-square bg-gradient-to-br from-[#FFD700]/10 to-[#D72638]/10 relative">
                        <img
                          src={category.catImg || `https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg`}
                          alt={category.categoryname}
                          className="w-full h-full object-cover group-hover/card:scale-125 transition-transform duration-1000 ease-out"
                          onError={(e) => {
                            e.currentTarget.src = `https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg`
                          }}
                        />
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#D72638]/80 via-[#FFD700]/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-all duration-500">
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="flex items-center justify-between">
                              <Badge className="bg-white text-[#D72638] border-0 shadow-md font-medium">
                                <ShoppingBag className="w-3 h-3 mr-1" />
                                Shop Now
                              </Badge>
                              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center group-hover/card:rotate-45 transition-transform duration-300">
                                <svg className="w-5 h-5 text-[#D72638]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.5-9.5M17 7H7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 text-center relative">
                      <h3 className="font-bold text-[#2B2B2B] text-xl mb-2 line-clamp-1 group-hover/card:text-[#D72638] transition-colors duration-300">
                        {category.categoryname}
                      </h3>
                      {/* Accent line */}
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#D72638] to-[#FFD700] group-hover/card:w-12 transition-all duration-500"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {categories.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentIndex === index
                    ? 'bg-gradient-to-r from-[#D72638] to-[#FFD700] scale-125'
                    : 'bg-[#FFD700]/30 hover:bg-[#FFD700]/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
