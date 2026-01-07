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
  Headset,
  Package,
  TrendingUp,
  Shield,
  CheckCircle
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

/* ================= BEAUTY SLIDES ================= */
const BEAUTY_SLIDES = [
  {
    desktopImg: "/hero/destop 1.png",
    mobileImg: "/hero/mobile1.png",
    title: "New Beauty Essentials",
    subtitle: "Fresh launches you'll love",
    description: "skincare & makeup everyone's talking about",
    stats: [
      { value: "50+", label: "New Products" },
      { value: "Limited", label: "Time Offer" },
      { value: "40% OFF", label: "On First Order" }
    ],
    buttonText: "Shop Now ",
    buttonBg: "bg-[#FF4081]",
    textColor: "text-white",
    overlayColor: "from-pink-900/70 to-purple-900/60"
  },
  {
    desktopImg: "/hero/destop 2.png",
    mobileImg: "/hero/mobile2.png",
    title: "Define Your Beauty",
    subtitle: "High-impact makeup for bold expressions",
    description: "Create looks that turn heads everywhere",
    stats: [
      { value: "100+", label: "Makeup Items" },
      { value: "Waterproof", label: "Long Lasting" },
      { value: "Matte Finish", label: "Premium Quality" }
    ],
    buttonText: "Explore Collection ",
    buttonBg: "bg-[#9C27B0]",
    textColor: "text-white",
    overlayColor: "from-purple-900/70 to-indigo-900/60"
  },
  {
    desktopImg: "/hero/destop 3.png",
    mobileImg: "/hero/mobile3.png",
    title: "Powered by Nature",
    subtitle: "Carefully curated beauty essentials",
    description: "designed to nourish your skin and elevate your everyday look",
    stats: [
      { value: "Organic", label: "Natural Ingredients" },
      { value: "Cruelty Free", label: "Ethical Beauty" },
      { value: "Eco Friendly", label: "Sustainable" }
    ],
    buttonText: "Discover More ",
    buttonBg: "bg-[#4CAF50]",
    textColor: "text-white",
    overlayColor: "from-emerald-900/70 to-green-900/60"
  },
]

export default function HomePage() {
  const [heroIndex, setHeroIndex] = useState(0)
  const [beautyIndex, setBeautyIndex] = useState(0)
  const [categoryIndex, setCategoryIndex] = useState(0)
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [activeBox, setActiveBox] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  /* ================= HERO AUTO SLIDER ================= */
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((p) => (p + 1) % HERO_SLIDES.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  /* ================= BEAUTY AUTO SLIDER ================= */
  useEffect(() => {
    const timer = setInterval(() => {
      setBeautyIndex((p) => (p + 1) % BEAUTY_SLIDES.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  /* ================= CATEGORIES AUTO SLIDER ================= */
  useEffect(() => {
    if (categories.length > 0) {
      const timer = setInterval(() => {
        setCategoryIndex((p) => (p + 1) % Math.min(categories.length, 4))
      }, 3500)
      return () => clearInterval(timer)
    }
  }, [categories.length])


  const [productIndex, setProductIndex] = useState(0)

useEffect(() => {
  if (allProducts.length > 0) {
    const timer = setInterval(() => {
      setProductIndex((p) =>
        p === allProducts.length - 1 ? 0 : p + 1
      )
    }, 3500)

    return () => clearInterval(timer)
  }
}, [allProducts.length])


  /* ================= FETCH ALL DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch featured products
        const featuredRes = await fetch("https://barber-syndicate.vercel.app/api/v1/product/feature")
        const featuredData = await featuredRes.json()
        setFeaturedProducts(featuredData?.data || [])

        // Fetch all products
        const allProductsRes = await fetch("https://barber-syndicate.vercel.app/api/v1/product?page=1")
        const allProductsData = await allProductsRes.json()
        setAllProducts(allProductsData?.products || [])

        // Fetch categories
        const categoriesRes = await fetch("https://barber-syndicate.vercel.app/api/v1/category")
        const categoriesData = await categoriesRes.json()
        if (categoriesData.success && categoriesData.data) {
          const categoriesWithTrending = categoriesData.data.map((cat: any, index: number) => ({
            ...cat,
            trending: index % 3 === 0
          }))
          setCategories(categoriesWithTrending)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Function to get minimum price from variants
  const getMinPrice = (variants: any[]) => {
    if (!variants || variants.length === 0) return "N/A"
    const prices = variants.map(v => parseFloat(v.price)).filter(p => !isNaN(p))
    return prices.length > 0 ? `₹${Math.min(...prices)}` : "N/A"
  }

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
                {/* Desktop Image */}
                <img
                  src={slide.desktopImg}
                  alt={`Slide ${index + 1}`}
                  className="hidden md:block w-full h-full object-cover"
                />
                {/* Mobile Poster Image */}
                <img
                  src={slide.mobileImg}
                  alt={`Mobile Slide ${index + 1}`}
                  className="md:hidden w-full h-full object-cover"
                />
                {/* Dark Overlay for mobile */}
                <div className="absolute inset-0 md:bg-black/0 bg-black/40"></div>
              </div>

              {/* DESKTOP BUTTON */}
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

              {/* MOBILE CONTENT */}
              <div className="absolute inset-0 flex md:hidden items-center justify-center px-4">
                <div className="w-full max-w-md mx-auto">
                  {/* Text Content */}
                  <div className="text-center mb-8">
                    {index === 0 && (
                      <div className="text-white text-sm font-semibold mb-4 tracking-wide">
                        "Because You're Worth It"
                      </div>
                    )}
                    
                    <h1 className="text-white text-2xl font-bold mb-4 leading-tight">
                      {slide.mobile.title}
                    </h1>
                    
                    {slide.mobile.subtitle && (
                      <h2 className="text-white text-xl font-bold mb-4">
                        {slide.mobile.subtitle}
                      </h2>
                    )}
                    
                    {slide.mobile.description && (
                      <p className="text-white text-sm leading-relaxed mb-8">
                        {slide.mobile.description}
                      </p>
                    )}
                  </div>
                  
                  {/* Stats Grid */}
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
                  
                  {/* Button */}
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

        {/* Hero Slide Dots */}
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

      {/* ================= BEAUTY ESSENTIALS SLIDER ================= */}
      <section className="relative h-[70vh] md:h-[80vh] w-full overflow-hidden bg-yellow-50">
        <div className="relative h-full w-full">
          {BEAUTY_SLIDES.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === beautyIndex
                  ? "opacity-100 z-10"
                  : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* ================= BACKGROUND ================= */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* DESKTOP IMAGE – FULL IMAGE, NO CUT */}
                <img
                  src={slide.desktopImg}
                  alt={slide.title}
                  className="hidden md:block max-h-full max-w-full object-contain"
                />

                {/* MOBILE IMAGE – FULL COVER */}
                <img
                  src={slide.mobileImg}
                  alt={slide.title}
                  className="md:hidden w-full h-full object-cover"
                />

                {/* OVERLAY */}
                <div className="absolute inset-0 md:bg-black/0 bg-black/40"></div>
              </div>

              {/* ================= DESKTOP CONTENT ================= */}
              <div className="hidden md:flex absolute inset-8 items-center">
                <div className="max-w-xl ml-10 rounded-2xl p-10">
                  {/* BUTTON */}
                  <div className="mt-38">
                    <Link
                      href="/product"
                      className={`inline-flex items-center gap-2 ${slide.buttonBg} ${slide.textColor}
                        px-8 py-4 rounded-xl font-bold text-lg
                        transition hover:scale-105 hover:shadow-xl`}
                    >
                      <ShoppingBag size={20} />
                      {slide.buttonText}
                      <ArrowRight size={20} />
                    </Link>
                  </div>
                </div>
              </div>

              {/* ================= MOBILE CONTENT ================= */}
              <div className="absolute inset-0 flex md:hidden items-center justify-center px-6">
                <div className="w-full max-w-md text-center">
                  <h1 className="text-white text-2xl font-bold mb-3">
                    {slide.title}
                  </h1>

                  <h2 className="text-white/90 text-lg font-semibold mb-4">
                    {slide.subtitle}
                  </h2>

                  <p className="text-white/80 text-sm mb-6 leading-relaxed">
                    {slide.description}
                  </p>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {slide.stats.map((stat, i) => (
                      <div
                        key={i}
                        className="bg-white/20 backdrop-blur-md rounded-xl p-3"
                      >
                        <div className="text-white font-bold text-base">
                          {stat.value}
                        </div>
                        <div className="text-white/90 text-xs">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/product"
                    className={`inline-flex items-center justify-center gap-2
                      ${slide.buttonBg} ${slide.textColor}
                      px-6 py-3.5 rounded-xl font-bold text-sm w-full
                      border-2 border-white/30`}
                  >
                    <ShoppingBag size={16} />
                    {slide.buttonText}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ================= DOTS ================= */}
        <div className="absolute bottom-22 left-0 right-0 z-20">
          <div className="flex justify-center gap-3">
            {BEAUTY_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setBeautyIndex(i)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  beautyIndex === i
                    ? "w-10 bg-red-500"
                    : "w-3 bg-red-300"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ================= EXPLORE CATEGORIES ================= */}
      <section className="py-20 bg-red-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          {/* Heading */}
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-gray-800">
              Explore Our Categories
            </h2>
            <p className="text-gray-600 mt-3">
              Discover our curated collection of premium products
            </p>
            <p className="text-gray-500">
              across different categories
            </p>
          </div>

          {/* SLIDER */}
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{
                transform: `translateX(-${
                  categoryIndex *
                  (typeof window !== "undefined" && window.innerWidth >= 768 ? 25 : 100)
                }%)`,
              }}
            >
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <div
                    key={cat._id}
                    className="
                      min-w-full
                      sm:min-w-[50%]
                      md:min-w-[25%]
                      px-2
                    "
                  >
                    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
                      {/* IMAGE */}
                      <div className="relative h-48 md:h-56 overflow-hidden">
                        <img
                          src={cat.catImg}
                          alt={cat.categoryname}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />

                        {cat.trending && (
                          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs px-3 py-1 rounded-full shadow">
                            🔥 Trending
                          </span>
                        )}
                      </div>

                      {/* TITLE */}
                      <div className="p-5 text-center">
                        <h3 className="font-semibold text-gray-800 text-lg">
                          {cat.categoryname}
                        </h3>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="min-w-full text-center py-12">
                  <p className="text-gray-500">Loading categories...</p>
                </div>
              )}
            </div>
          </div>

          {/* DOTS */}
          <div className="flex justify-center gap-2 mt-10">
            {categories.map((_, i) => (
              <button
                key={i}
                onClick={() => setCategoryIndex(i)}
                className={`w-3 h-3 rounded-full transition ${
                  categoryIndex === i ? "bg-red-500" : "bg-red-200"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

     

  {/* ================= ALL PRODUCTS GRID ================= */}
<section className="py-20 bg-[#f6dcc7]">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-hidden"> {/* YEH LINE CHANGE KARO */}
    
    {/* ===== Header ===== */}
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-14">
      <div>
        <h2 className="text-[40px] font-serif font-semibold text-gray-800">
          Products
        </h2>
        <p className="text-gray-600 mt-2 max-w-xl">
          Discover our most popular wholesale cosmetic products trusted by businesses worldwide.
        </p>
      </div>

      <Link
        href="/product"
        className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition"
      >
        View All Products
        <ArrowRight size={16} />
      </Link>
    </div>

    {/* ===== SLIDER ===== */}
    {loading ? (
      <div className="text-center py-12 text-gray-600">
        Loading products...
      </div>
    ) : allProducts.length > 0 ? (
      <div className="relative"> {/* YEH OVERFLOW HIDDEN HATA DO */}

        {/* LEFT ARROW */}
        <button
          onClick={() =>
            setProductIndex((p) =>
              p === 0 ? allProducts.length - 1 : p - 1
            )
          }
          className="
            absolute -left-4 top-1/2 -translate-y-1/2 z-10
            w-12 h-12 rounded-full
            bg-red-500 text-white text-2xl
            flex items-center justify-center
            shadow-xl hover:bg-red-600
          "
        >
          ‹
        </button>

        {/* RIGHT ARROW */}
        <button
          onClick={() =>
            setProductIndex((p) =>
              p === allProducts.length - 1 ? 0 : p + 1
            )
          }
          className="
            absolute -right-4 top-1/2 -translate-y-1/2 z-10
            w-12 h-12 rounded-full
            bg-red-500 text-white text-2xl
            flex items-center justify-center
            shadow-xl hover:bg-red-600
          "
        >
          ›
        </button>

        {/* TRACK */}
        <div className="overflow-hidden"> {/* YEH EK AUR OVERFLOW HIDDEN LAGAO */}
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(-${
                productIndex *
                (typeof window !== "undefined" && window.innerWidth >= 1024
                  ? 33.333
                  : typeof window !== "undefined" && window.innerWidth >= 640
                  ? 50
                  : 100)
              }%)`,
            }}
          >
            {allProducts.map((p) => (
              <div
                key={p._id}
                className="min-w-full sm:min-w-[50%] lg:min-w-[33.333%] px-3"
              >
                {/* CARD – FIXED HEIGHT */}
                <div
                  className="
                    bg-white rounded-xl shadow-md overflow-hidden
                    transition-all duration-300
                    hover:-translate-y-2 hover:shadow-xl
                    h-[420px] flex flex-col
                  "
                >
                  {/* IMAGE – FIXED HEIGHT */}
                  <div className="relative h-[220px] bg-gray-100 overflow-hidden">
                    <img
                      src={p.images?.[0] || "/placeholder.jpg"}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />

                    <span className="absolute top-3 right-3 bg-pink-500 text-white text-xs px-3 py-1 rounded">
                      Featured
                    </span>
                  </div>

                  {/* CONTENT – FIXED */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-base font-semibold text-gray-800 mb-1 line-clamp-1">
                      {p.name}
                    </h3>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">
                      {p.description}
                    </p>

                    <Link
                      href={`/product/${p._id}`}
                      className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium w-fit"
                    >
                      View Details
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ) : (
      <div className="text-center py-12 text-gray-600">
        No products available
      </div>
    )}
  </div>
</section>

      {/* ================= BENEFITS =================
      <section className="py-16 bg-gradient-to-r from-orange-50 to-yellow-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Why Shop With Us?
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield size={24} className="text-red-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">100% Authentic</h3>
              <p className="text-gray-600 text-sm">Genuine products directly from brands</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Truck size={24} className="text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-gray-600 text-sm">Quick shipping across India</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp size={24} className="text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Best Prices</h3>
              <p className="text-gray-600 text-sm">Wholesale rates for bulk orders</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Headset size={24} className="text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Support 24/7</h3>
              <p className="text-gray-600 text-sm">Dedicated customer support</p>
            </div>
          </div>
        </div>
      </section> */}

      {/* ================= STATS =================
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
      </section> */}
    </div>
  )
}