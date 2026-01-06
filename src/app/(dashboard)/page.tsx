"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  ArrowRight, 
  Star, 
  Sparkles, 
  Flame, 
  ShoppingBag, 
  Truck, 
  FileText, 
  Headset
} from "lucide-react"

/* ================= HERO SLIDES ================= */
const HERO_SLIDES = [
  { 
    desktopImg: "/hero/hero sliding 1.png",
    mobileImg: "/hero/loreal poster 1.png",
    mobile: {
      title: "Experience salon-quality beauty with",
      subtitle: "L'Oréal Paris",
      description: "Because You're Worth It — advanced skincare, makeup, and hair care crafted by experts.",
      stats: [
        { value: "500+", label: "Products" },
        { value: "1000+", label: "Happy Clients" },
        { value: "99%+", label: "Satisfaction" }
      ]
    },
    buttonText: "Explore Products ",
    buttonBg: "bg-[#C2185B]",
    textColor: "text-white"
  },
  { 
    desktopImg: "/hero/hero sliding 2.png",
    mobileImg: "/hero/garnier poster 1.png",
    mobile: {
      title: "Naturally Beautiful, Naturally You",
      subtitle: "Trusted skincare solutions for",
      description: "soft, clear, and radiant skin — from daily care to deep nourishment.",
      stats: [
        { value: "500+", label: "Products" },
        { value: "1000+", label: "Happy Clients" },
        { value: "99%+", label: "Satisfaction" }
      ]
    },
    buttonText: "Explore Products ",
    buttonBg: "bg-[#4CAF50]",
    textColor: "text-white"
  },
  { 
    desktopImg: "/hero/hero sliding 3.png",
    mobileImg: "/hero/maybelline poster 1.png",
    mobile: {
      title: "Make It Happen with Maybelline",
      subtitle: "Experience professional makeup",
      description: "Bold colors, flawless finishes, and trend-setting makeup made for every look.",
      stats: [
        { value: "500+", label: "Products" },
        { value: "1000+", label: "Happy Clients" },
        { value: "99%+", label: "Satisfaction" }
      ]
    },
    buttonText: "Explore Products ",
    buttonBg: "bg-[#E91E63]",
    textColor: "text-white"
  },
  { 
    desktopImg: "/hero/hero sliding 4.png",
    mobileImg: "/hero/pounds poster 1.png",
    mobile: {
      title: "Care Your Skin Deserves",
      subtitle: "Trusted skincare solutions",
      description: "for soft, clear, and radiant skin — from daily care to deep nourishment.",
      stats: [
        { value: "500+", label: "Products" },
        { value: "1000+", label: "Happy Clients" },
        { value: "99%+", label: "Satisfaction" }
      ]
    },
    buttonText: "Explore Products",
    buttonBg: "bg-[#7B1FA2]",
    textColor: "text-white"
  }
]

export default function HomePage() {
  const [heroIndex, setHeroIndex] = useState(0)
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [activeBox, setActiveBox] = useState<number | null>(null)

  /* ================= HERO AUTO SLIDER ================= */
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((p) => (p + 1) % HERO_SLIDES.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  /* ================= FEATURE PRODUCTS API ================= */
  useEffect(() => {
    fetch("https://barber-syndicate.vercel.app/api/v1/product/feature")
      .then((res) => res.json())
      .then((data) => setProducts(data?.data || []))
  }, [])

  /* ================= CATEGORIES API ================= */
  useEffect(() => {
    fetch("https://barber-syndicate.vercel.app/api/v1/category")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          // Add trending flag to some categories
          const categoriesWithTrending = data.data.map((cat: any, index: number) => ({
            ...cat,
            trending: index % 3 === 0 // Every 3rd category is trending
          }))
          setCategories(categoriesWithTrending)
        }
      })
      .catch(err => console.error("Error fetching categories:", err))
  }, [])

  const currentSlide = HERO_SLIDES[heroIndex]

  return (
    <div className="bg-white">
      {/* ================= HERO SECTION ================= */}
      <section className="relative h-[70vh] md:h-screen w-full overflow-hidden">
        <div className="relative h-full w-full">
          {HERO_SLIDES.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === heroIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Background Images */}
              <div className="absolute inset-0">
                {/* Desktop Image (visible only on desktop) */}
                <img
                  src={slide.desktopImg}
                  alt={`Slide ${index + 1}`}
                  className="hidden md:block w-full h-full object-cover object-top md:object-center"
                />
                {/* Mobile Poster Image (visible only on mobile) */}
                <img
                  src={slide.mobileImg}
                  alt={`Mobile Slide ${index + 1}`}
                  className="md:hidden w-full h-full object-cover object-center"
                />
                {/* Dark Overlay for better text visibility on mobile */}
                <div className="absolute inset-0 md:bg-black/0 bg-black/40"></div>
              </div>

              {/* DESKTOP BUTTON (visible only on desktop) */}
              <Link
                href="/product"
                className={`absolute z-10 hidden md:flex items-center gap-2 ${slide.buttonBg} ${slide.textColor} 
                  px-6 py-3.5 rounded-lg font-bold text-lg 
                  transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
                style={{
                  top: "48%",
                  left: "7%"
                }}
              >
                <ShoppingBag size={20} />
                {slide.buttonText}
                <ArrowRight size={20} />
              </Link>

              {/* MOBILE CONTENT (visible only on mobile) - TEXT CONTENT */}
              <div className="absolute inset-0 flex md:hidden items-center justify-center px-4">
                <div className="w-full max-w-md mx-auto">
                  {/* White Text Content */}
                  <div className="text-center mb-8">
                    {/* Quote - First slide only */}
                    {index === 0 && (
                      <div className="text-white text-sm font-semibold mb-4 tracking-wide">
                        "Because You're Worth It"
                      </div>
                    )}
                    
                    {/* Main Title */}
                    <h1 className="text-white text-2xl font-bold mb-4 leading-tight">
                      {slide.mobile.title}
                    </h1>
                    
                    {/* Subtitle */}
                    {slide.mobile.subtitle && (
                      <h2 className="text-white text-xl font-bold mb-4">
                        {slide.mobile.subtitle}
                      </h2>
                    )}
                    
                    {/* Description */}
                    {slide.mobile.description && (
                      <p className="text-white text-sm leading-relaxed mb-8">
                        {slide.mobile.description}
                      </p>
                    )}
                  </div>
                  
                  {/* Stats Grid for Mobile */}
                  <div className="grid grid-cols-3 gap-3 mb-8">
                    {slide.mobile.stats.map((stat, idx) => (
                      <div 
                        key={idx} 
                        className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-xl p-3 text-center border border-white/20"
                      >
                        <div className="text-white text-lg font-bold">
                          {stat.value}
                        </div>
                        {stat.label && (
                          <div className="text-white/90 text-xs font-medium mt-1">
                            {stat.label}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Button for Mobile */}
                  <div className="mb-8">
                    <Link
                      href="/product"
                      className={`inline-flex items-center justify-center gap-2 
                        ${slide.buttonBg} ${slide.textColor}
                        px-6 py-3.5 rounded-xl font-bold 
                        text-sm transition-all duration-300 
                        hover:scale-105 hover:shadow-2xl 
                        shadow-lg w-full
                        border-2 border-white/30
                        backdrop-blur-sm`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      {slide.buttonText}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Slide Dots */}
        <div className="absolute bottom-8 left-0 right-0 z-20">
          <div className="flex justify-center gap-3">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIndex(i)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  heroIndex === i 
                    ? 'w-10 bg-white' 
                    : 'w-3 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ================= WHY CHOOSE ================= */}
      <section className="py-16 md:py-24 bg-yellow-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Why Choose Barber Syndicate?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Experience the difference with our comprehensive wholesale solution designed for your success.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Box 1 */}
            <div 
              className="group relative"
              onTouchStart={() => setActiveBox(0)}
              onTouchEnd={() => setActiveBox(null)}
              onClick={() => setActiveBox(activeBox === 0 ? null : 0)}
            >
              <div className={`
                bg-gray-50 rounded-2xl p-8 text-center border border-gray-200 
                transform transition-all duration-500 ease-out 
                h-full flex flex-col
                md:group-hover:-translate-y-4 md:group-hover:shadow-2xl
                ${activeBox === 0 ? '-translate-y-2 shadow-xl scale-[1.02] md:scale-100' : ''}
              `}>
                <div className={`
                  w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 
                  rounded-2xl flex items-center justify-center mx-auto mb-6
                  transform transition-transform duration-500 
                  md:group-hover:scale-110 md:group-hover:rotate-6
                  ${activeBox === 0 ? 'scale-110 rotate-6' : ''}
                `}>
                  <Truck size={28} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Bulk Pricing</h3>
                <p className="text-gray-600 flex-grow">
                  Unlock exceptional wholesale rates with our tiered pricing structure. 
                  The more you order, the more you save.
                </p>
              </div>
              {/* Subtle Glow Effect */}
              <div className={`
                absolute inset-0 rounded-2xl bg-gradient-to-r 
                from-pink-500/0 via-red-500/0 to-pink-500/0 
                md:opacity-0 md:group-hover:opacity-20 
                transition-opacity duration-500 
                blur-xl -z-10
                ${activeBox === 0 ? 'opacity-20' : 'opacity-0'}
              `}></div>
            </div>
            
            {/* Box 2 */}
            <div 
              className="group relative"
              onTouchStart={() => setActiveBox(1)}
              onTouchEnd={() => setActiveBox(null)}
              onClick={() => setActiveBox(activeBox === 1 ? null : 1)}
            >
              <div className={`
                bg-gray-50 rounded-2xl p-8 text-center border border-gray-200 
                transform transition-all duration-500 ease-out 
                h-full flex flex-col
                md:group-hover:-translate-y-4 md:group-hover:shadow-2xl
                ${activeBox === 1 ? '-translate-y-2 shadow-xl scale-[1.02] md:scale-100' : ''}
              `}>
                <div className={`
                  w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 
                  rounded-2xl flex items-center justify-center mx-auto mb-6
                  transform transition-transform duration-500 
                  md:group-hover:scale-110 md:group-hover:-rotate-6
                  ${activeBox === 1 ? 'scale-110 -rotate-6' : ''}
                `}>
                  <FileText size={28} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">GST Compliant</h3>
                <p className="text-gray-600 flex-grow">
                  Professional GST invoices for seamless business operations. 
                  Maintain perfect records effortlessly.
                </p>
              </div>
              {/* Subtle Glow Effect */}
              <div className={`
                absolute inset-0 rounded-2xl bg-gradient-to-r 
                from-emerald-500/0 via-green-500/0 to-emerald-500/0 
                md:opacity-0 md:group-hover:opacity-20 
                transition-opacity duration-500 
                blur-xl -z-10
                ${activeBox === 1 ? 'opacity-20' : 'opacity-0'}
              `}></div>
            </div>
            
            {/* Box 3 */}
            <div 
              className="group relative"
              onTouchStart={() => setActiveBox(2)}
              onTouchEnd={() => setActiveBox(null)}
              onClick={() => setActiveBox(activeBox === 2 ? null : 2)}
            >
              <div className={`
                bg-gray-50 rounded-2xl p-8 text-center border border-gray-200 
                transform transition-all duration-500 ease-out 
                h-full flex flex-col
                md:group-hover:-translate-y-4 md:group-hover:shadow-2xl
                ${activeBox === 2 ? '-translate-y-2 shadow-xl scale-[1.02] md:scale-100' : ''}
              `}>
                <div className={`
                  w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 
                  rounded-2xl flex items-center justify-center mx-auto mb-6
                  transform transition-transform duration-500 
                  md:group-hover:scale-110 md:group-hover:rotate-12
                  ${activeBox === 2 ? 'scale-110 rotate-12' : ''}
                `}>
                  <Headset size={28} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">24/7 Support</h3>
                <p className="text-gray-600 flex-grow">
                  Get instant support via WhatsApp. Our dedicated team 
                  ensures your business never stops.
                </p>
              </div>
              {/* Subtle Glow Effect */}
              <div className={`
                absolute inset-0 rounded-2xl bg-gradient-to-r 
                from-blue-500/0 via-cyan-500/0 to-blue-500/0 
                md:opacity-0 md:group-hover:opacity-20 
                transition-opacity duration-500 
                blur-xl -z-10
                ${activeBox === 2 ? 'opacity-20' : 'opacity-0'}
              `}></div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES SECTION (UI aise hi) ================= */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-yellow-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore Our Categories
            </h2>
            <p className="text-gray-600 text-lg mb-2">
              Discover our curated collection of premium products
            </p>
            <p className="text-gray-500">
              across different categories
            </p>
          </div>

          {categories.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.slice(0, 4).map((category, index) => (
                <div
                  key={category._id}
                  className="group bg-white rounded-xl shadow-lg hover:shadow-2xl 
                    transition-all duration-500 overflow-hidden border border-gray-100
                    transform hover:-translate-y-2"
                >
                  <div className="relative h-48">
                    <img 
                      src={category.catImg} 
                      alt={category.categoryname} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    {category.trending && (
                      <span className="absolute top-3 right-3 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                        <Flame size={12} /> Trending
                      </span>
                    )}
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg flex items-center justify-center">
                          <Sparkles size={18} className="text-pink-600" />
                        </div>
                        <span className="font-bold text-gray-900">{category.categoryname}</span>
                      </div>
                      <Link
                        href={`/category/${category._id}`}
                        className="w-8 h-8 bg-gradient-to-br from-pink-50 to-rose-50 rounded-full flex items-center justify-center
                          group-hover:from-pink-600 group-hover:to-rose-600 transition-all duration-300"
                      >
                        <ArrowRight size={16} className="text-gray-700 group-hover:text-white" />
                      </Link>
                    </div>
                    
                    {/* Product Count */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Premium Collection</span>
                        <span className="text-pink-600 font-semibold">50+ Products</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Fallback/Placeholder while loading */}
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 animate-pulse"
                >
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View All Categories Button */}
          <div className="text-center mt-12">
            <Link
              href="/categories"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-xl transition-all duration-300"
            >
              View All Categories
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= NEW BEAUTY ESSENTIALS ================= */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-pink-50 to-rose-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Sparkles className="text-yellow-500" size={28} /> 
                New Beauty Essentials
              </h2>
              <p className="text-gray-700 text-lg mb-8">
                Fresh launches you'll love — skincare & makeup everyone's talking about
              </p>
              <Link
                href="/product"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-xl transition-all duration-300"
              >
                <ShoppingBag size={20} />
                Explore Now
                <ArrowRight size={20} />
              </Link>
            </div>

            <div className="lg:w-1/2 flex justify-center">
              <img
                src="/hero/image 5.png"
                alt="Beauty Essentials"
                className="w-64 h-64 md:w-80 md:h-80 object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= PRODUCTS ================= */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl flex items-center justify-center">
                  <ShoppingBag size={24} className="text-white" />
                </div>
                Featured Products
              </h2>
              <p className="text-gray-600 text-lg">
                Discover our most popular wholesale cosmetic products.
              </p>
            </div>
            
            <Link
              href="/product"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-xl transition-all duration-300"
            >
              View All Products
              <ArrowRight size={20} />
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((p) => (
                <div key={p._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                  <div className="relative h-56">
                    <img
                      src={p.images?.[0] || "/placeholder.jpg"}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm px-3 py-1.5 rounded-full flex items-center gap-1">
                      <Star size={14} fill="white" /> Featured
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
                      <Sparkles size={16} className="text-yellow-500" /> 
                      {p.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                      {p.description}
                    </p>

                    <Link
                      href={`/product/${p._id}`}
                      className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 w-full"
                    >
                      View Details
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading products...</p>
            </div>
          )}
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">1000+</div>
              <div className="text-sm md:text-base">Happy Clients</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">99%</div>
              <div className="text-sm md:text-base">Satisfaction</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">500+</div>
              <div className="text-sm md:text-base">Products</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">24/7</div>
              <div className="text-sm md:text-base">Support</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}