"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import Link from "next/link"
import {
  ArrowRight,
  ShoppingBag,
  Truck,
  FileText,
  Headset,
  X,
} from "lucide-react"

/* ================= HERO SLIDES ================= */
const HERO_SLIDES = [
  {
    desktopImg: "/hero/hero sliding 1.png",
    mobileImg: "/hero/loreal poster 1.png",
    mobile: {
      title: "Experience salon-quality beauty with",
      subtitle: "L'Oréal Paris",
      description:
        "Because You're Worth It — advanced skincare, makeup, and hair care crafted by experts.",
      stats: [
        { value: "500+", label: "Products" },
        { value: "1000+", label: "Happy Clients" },
        { value: "99%+", label: "Satisfaction" },
      ],
    },
    buttonText: "Explore Products ",
    buttonBg: "bg-[#C2185B]",
    textColor: "text-white",
  },
  {
    desktopImg: "/hero/hero sliding 2.png",
    mobileImg: "/hero/garnier poster 1.png",
    mobile: {
      title: "Naturally Beautiful, Naturally You",
      subtitle: "Trusted skincare solutions for",
      description:
        "soft, clear, and radiant skin — from daily care to deep nourishment.",
      stats: [
        { value: "500+", label: "Products" },
        { value: "1000+", label: "Happy Clients" },
        { value: "99%+", label: "Satisfaction" },
      ],
    },
    buttonText: "Explore Products ",
    buttonBg: "bg-[#4CAF50]",
    textColor: "text-white",
  },
  {
    desktopImg: "/hero/hero sliding 3.png",
    mobileImg: "/hero/maybelline poster 1.png",
    mobile: {
      title: "Make It Happen with Maybelline",
      subtitle: "Experience professional makeup",
      description:
        "Bold colors, flawless finishes, and trend-setting makeup made for every look.",
      stats: [
        { value: "500+", label: "Products" },
        { value: "1000+", label: "Happy Clients" },
        { value: "99%+", label: "Satisfaction" },
      ],
    },
    buttonText: "Explore Products ",
    buttonBg: "bg-[#E91E63]",
    textColor: "text-white",
  },
  {
    desktopImg: "/hero/hero sliding 4.png",
    mobileImg: "/hero/pounds poster 1.png",
    mobile: {
      title: "Care Your Skin Deserves",
      subtitle: "Trusted skincare solutions",
      description:
        "for soft, clear, and radiant skin — from daily care to deep nourishment.",
      stats: [
        { value: "500+", label: "Products" },
        { value: "1000+", label: "Happy Clients" },
        { value: "99%+", label: "Satisfaction" },
      ],
    },
    buttonText: "Explore Products",
    buttonBg: "bg-[#7B1FA2]",
    textColor: "text-white",
  },
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
      { value: "40% OFF", label: "On First Order" },
    ],
    buttonText: "Shop Now ",
    buttonBg: "bg-[#FF4081]",
    textColor: "text-white",
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
      { value: "Matte Finish", label: "Premium Quality" },
    ],
    buttonText: "Explore Collection ",
    buttonBg: "bg-[#9C27B0]",
    textColor: "text-white",
  },
  {
    desktopImg: "/hero/destop 3.png",
    mobileImg: "/hero/mobile3.png",
    title: "Powered by Nature",
    subtitle: "Carefully curated beauty essentials",
    description:
      "designed to nourish your skin and elevate your everyday look",
    stats: [
      { value: "Organic", label: "Natural Ingredients" },
      { value: "Cruelty Free", label: "Ethical Beauty" },
      { value: "Eco Friendly", label: "Sustainable" },
    ],
    buttonText: "Discover More ",
    buttonBg: "bg-[#4CAF50]",
    textColor: "text-white",
  },
]

/* ================= HELPER: MAKE INFINITE SLIDES ================= */
const makeInfiniteSlides = (items: any[]) => {
  if (!items || items.length === 0) return []
  return [items[items.length - 1], ...items, items[0]]
}

export default function HomePage() {
  const [heroIndex, setHeroIndex] = useState(0)
  const [beautyIndex, setBeautyIndex] = useState(0)

  const [categories, setCategories] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])

  const [loading, setLoading] = useState(true)
  const [activeBox, setActiveBox] = useState<number | null>(null)

  /* ================= SEARCH STATES (API CONNECTED) ================= */
  const BASE_URL = "https://barber-syndicate.vercel.app"

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)

  // ✅ refs for outside click
  const searchWrapperRef = useRef<HTMLDivElement | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  // ✅ clear function
  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
    setSearchLoading(false)
    setShowSearchDropdown(false)
    searchInputRef.current?.focus()
  }

  /* ================= RESPONSIVE SLIDES PER VIEW ================= */
  const [categorySlidesPerView, setCategorySlidesPerView] = useState(1)
  const [productSlidesPerView, setProductSlidesPerView] = useState(1)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setCategorySlidesPerView(3)
      else if (window.innerWidth >= 640) setCategorySlidesPerView(2)
      else setCategorySlidesPerView(1)

      if (window.innerWidth >= 1024) setProductSlidesPerView(3)
      else if (window.innerWidth >= 640) setProductSlidesPerView(2)
      else setProductSlidesPerView(1)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

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

  /* ================= FETCH ALL DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const featuredRes = await fetch(`${BASE_URL}/api/v1/product/feature`)
        const featuredData = await featuredRes.json()
        setFeaturedProducts(featuredData?.data || [])

        const allProductsRes = await fetch(`${BASE_URL}/api/v1/product?page=1`)
        const allProductsData = await allProductsRes.json()
        setAllProducts(allProductsData?.products || [])

        const categoriesRes = await fetch(`${BASE_URL}/api/v1/category`)
        const categoriesData = await categoriesRes.json()
        if (categoriesData.success && categoriesData.data) {
          const categoriesWithTrending = categoriesData.data.map(
            (cat: any, index: number) => ({
              ...cat,
              trending: index % 3 === 0,
            })
          )
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

  /* ================= SEARCH API CALL (DEBOUNCE) ================= */
  useEffect(() => {
    const q = searchQuery.trim()

    if (!q) {
      setSearchResults([])
      setSearchLoading(false)
      setShowSearchDropdown(false)
      return
    }

    setShowSearchDropdown(true)
    setSearchLoading(true)

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/api/v1/product/search-product?search=${encodeURIComponent(
            q
          )}`
        )
        const data = await res.json()

        const products =
          data?.data ||
          data?.products ||
          data?.result ||
          data?.results ||
          []

        setSearchResults(Array.isArray(products) ? products : [])
      } catch (err) {
        console.error("Search error:", err)
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [searchQuery])

  /* ================= OUTSIDE CLICK CLOSE DROPDOWN ================= */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(e.target as Node)
      ) {
        setShowSearchDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  /* ================= ESC KEY TO CLEAR ================= */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        clearSearch()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  /* ================= INFINITE DATA (CLONED) ================= */
  const infiniteCategories = useMemo(
    () => makeInfiniteSlides(categories),
    [categories]
  )
  const infiniteProducts = useMemo(
    () => makeInfiniteSlides(allProducts),
    [allProducts]
  )

  /* ================= CATEGORY INFINITE SLIDER ================= */
  const [categoryPos, setCategoryPos] = useState(1)
  const [catTransition, setCatTransition] = useState(true)

  const categorySlideWidth = 100 / categorySlidesPerView

  useEffect(() => {
    if (categories.length > 0) {
      setCatTransition(false)
      setCategoryPos(1)
      const t = setTimeout(() => setCatTransition(true), 50)
      return () => clearTimeout(t)
    }
  }, [categories.length])

  useEffect(() => {
    if (categories.length > 0) {
      const timer = setInterval(() => {
        setCategoryPos((p) => p + 1)
      }, 3500)

      return () => clearInterval(timer)
    }
  }, [categories.length])

  useEffect(() => {
    if (!categories.length) return
    if (!infiniteCategories.length) return

    const lastIndex = infiniteCategories.length - 1

    if (categoryPos === lastIndex) {
      const t = setTimeout(() => {
        setCatTransition(false)
        setCategoryPos(1)
      }, 700)
      return () => clearTimeout(t)
    }

    if (categoryPos === 0) {
      const t = setTimeout(() => {
        setCatTransition(false)
        setCategoryPos(lastIndex - 1)
      }, 700)
      return () => clearTimeout(t)
    }

    const enableT = setTimeout(() => setCatTransition(true), 750)
    return () => clearTimeout(enableT)
  }, [categoryPos, categories.length, infiniteCategories.length])

  const handleCatNext = () => setCategoryPos((p) => p + 1)
  const handleCatPrev = () => setCategoryPos((p) => p - 1)

  /* ================= PRODUCT INFINITE SLIDER ================= */
  const [productPos, setProductPos] = useState(1)
  const [prodTransition, setProdTransition] = useState(true)

  const productSlideWidth = 100 / productSlidesPerView

  useEffect(() => {
    if (allProducts.length > 0) {
      setProdTransition(false)
      setProductPos(1)
      const t = setTimeout(() => setProdTransition(true), 50)
      return () => clearTimeout(t)
    }
  }, [allProducts.length])

  useEffect(() => {
    if (allProducts.length > 0) {
      const timer = setInterval(() => {
        setProductPos((p) => p + 1)
      }, 3500)

      return () => clearInterval(timer)
    }
  }, [allProducts.length])

  useEffect(() => {
    if (!allProducts.length) return
    if (!infiniteProducts.length) return

    const lastIndex = infiniteProducts.length - 1

    if (productPos === lastIndex) {
      const t = setTimeout(() => {
        setProdTransition(false)
        setProductPos(1)
      }, 700)
      return () => clearTimeout(t)
    }

    if (productPos === 0) {
      const t = setTimeout(() => {
        setProdTransition(false)
        setProductPos(lastIndex - 1)
      }, 700)
      return () => clearTimeout(t)
    }

    const enableT = setTimeout(() => setProdTransition(true), 750)
    return () => clearTimeout(enableT)
  }, [productPos, allProducts.length, infiniteProducts.length])

  const handleProdNext = () => setProductPos((p) => p + 1)
  const handleProdPrev = () => setProductPos((p) => p - 1)

  return (
    <div className="bg-white">
      {/* ================= HERO SECTION ================= */}
      <section className="relative h-[80vh] md:h-screen w-full overflow-hidden">
        <div className="relative h-full w-full">
          {HERO_SLIDES.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === heroIndex
                  ? "opacity-100 z-10"
                  : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <div className="absolute inset-0">
                <img
                  src={slide.desktopImg}
                  alt={`Slide ${index + 1}`}
                  className="hidden md:block w-full h-full object-cover"
                />
                <img
                  src={slide.mobileImg}
                  alt={`Mobile Slide ${index + 1}`}
                  className="md:hidden w-full h-full object-cover"
                />
                <div className="absolute inset-0 md:bg-black/0 bg-black/40"></div>
              </div>

              <Link
                href="/product"
                className={`absolute z-10 hidden md:flex items-center gap-2 ${slide.buttonBg} ${slide.textColor} 
                  px-6 py-3.5 rounded-lg font-bold text-lg 
                  transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
                style={{ top: "48%", left: "7%" }}
              >
                <ShoppingBag size={20} />
                {slide.buttonText}
                <ArrowRight size={20} />
              </Link>

              <div className="absolute inset-0 flex md:hidden items-center justify-center px-4">
                <div className="w-full max-w-md mx-auto">
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

        <div className="absolute bottom-8 left-0 right-0 z-20">
          <div className="flex justify-center gap-3">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIndex(i)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  heroIndex === i
                    ? "w-10 bg-white"
                    : "w-3 bg-white/50 hover:bg-white/80"
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
              Experience the difference with our comprehensive wholesale solution
              designed for your success.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div
              className="group relative"
              onTouchStart={() => setActiveBox(0)}
              onTouchEnd={() => setActiveBox(null)}
              onClick={() => setActiveBox(activeBox === 0 ? null : 0)}
            >
              <div
                className={`
                bg-gray-50 rounded-2xl p-8 text-center border border-gray-200 
                transform transition-all duration-500 ease-out 
                h-full flex flex-col
                md:group-hover:-translate-y-4 md:group-hover:shadow-2xl
                ${
                  activeBox === 0
                    ? "-translate-y-2 shadow-xl scale-[1.02] md:scale-100"
                    : ""
                }
              `}
              >
                <div
                  className={`
                  w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 
                  rounded-2xl flex items-center justify-center mx-auto mb-6
                  transform transition-transform duration-500 
                  md:group-hover:scale-110 md:group-hover:rotate-6
                  ${activeBox === 0 ? "scale-110 rotate-6" : ""}
                `}
                >
                  <Truck size={28} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Bulk Pricing
                </h3>
                <p className="text-gray-600 flex-grow">
                  Unlock exceptional wholesale rates with our tiered pricing
                  structure. The more you order, the more you save.
                </p>
              </div>
            </div>

            <div
              className="group relative"
              onTouchStart={() => setActiveBox(1)}
              onTouchEnd={() => setActiveBox(null)}
              onClick={() => setActiveBox(activeBox === 1 ? null : 1)}
            >
              <div
                className={`
                bg-gray-50 rounded-2xl p-8 text-center border border-gray-200 
                transform transition-all duration-500 ease-out 
                h-full flex flex-col
                md:group-hover:-translate-y-4 md:group-hover:shadow-2xl
                ${
                  activeBox === 1
                    ? "-translate-y-2 shadow-xl scale-[1.02] md:scale-100"
                    : ""
                }
              `}
              >
                <div
                  className={`
                  w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 
                  rounded-2xl flex items-center justify-center mx-auto mb-6
                  transform transition-transform duration-500 
                  md:group-hover:scale-110 md:group-hover:-rotate-6
                  ${activeBox === 1 ? "scale-110 -rotate-6" : ""}
                `}
                >
                  <FileText size={28} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  GST Compliant
                </h3>
                <p className="text-gray-600 flex-grow">
                  Professional GST invoices for seamless business operations.
                  Maintain perfect records effortlessly.
                </p>
              </div>
            </div>

            <div
              className="group relative"
              onTouchStart={() => setActiveBox(2)}
              onTouchEnd={() => setActiveBox(null)}
              onClick={() => setActiveBox(activeBox === 2 ? null : 2)}
            >
              <div
                className={`
                bg-gray-50 rounded-2xl p-8 text-center border border-gray-200 
                transform transition-all duration-500 ease-out 
                h-full flex flex-col
                md:group-hover:-translate-y-4 md:group-hover:shadow-2xl
                ${
                  activeBox === 2
                    ? "-translate-y-2 shadow-xl scale-[1.02] md:scale-100"
                    : ""
                }
              `}
              >
                <div
                  className={`
                  w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 
                  rounded-2xl flex items-center justify-center mx-auto mb-6
                  transform transition-transform duration-500 
                  md:group-hover:scale-110 md:group-hover:rotate-12
                  ${activeBox === 2 ? "scale-110 rotate-12" : ""}
                `}
                >
                  <Headset size={28} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  24/7 Support
                </h3>
                <p className="text-gray-600 flex-grow">
                  Get instant support via WhatsApp. Our dedicated team ensures
                  your business never stops.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= EXPLORE CATEGORIES (SMOOTH INFINITE) ================= */}
      <section className="py-20 bg-red-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-14">
            <div>
              <h2 className="text-[40px] font-serif font-semibold text-gray-800">
                Explore Categories
              </h2>
              <p className="text-gray-600 mt-2 max-w-xl">
                Discover our curated collection of premium products across
                different categories.
              </p>
            </div>

            <Link
              href="/category"
              className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              View All Categories <span>→</span>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-600">
              Loading categories...
            </div>
          ) : categories.length > 0 ? (
            <div className="relative">
              <button
                onClick={handleCatPrev}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10
                  w-12 h-12 rounded-full text-white text-2xl
                  flex items-center justify-center shadow-xl transition
                  bg-red-500 hover:bg-red-600"
              >
                ‹
              </button>

              <button
                onClick={handleCatNext}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-10
                  w-12 h-12 rounded-full text-white text-2xl
                  flex items-center justify-center shadow-xl transition
                  bg-red-500 hover:bg-red-600"
              >
                ›
              </button>

              <div className="overflow-hidden">
                <div
                  className={`flex ${
                    catTransition
                      ? "transition-transform duration-700 ease-in-out"
                      : ""
                  }`}
                  style={{
                    transform: `translateX(-${
                      categoryPos * categorySlideWidth
                    }%)`,
                  }}
                >
                  {infiniteCategories.map((cat: any, i: number) => (
                    <div
                      key={`${cat._id}-${i}`}
                      style={{ minWidth: `${categorySlideWidth}%` }}
                      className="px-3"
                    >
                      <Link
                        href={`/product?category=${cat._id}`}
                        className="block h-full"
                      >
                        <div
                          className="bg-white rounded-xl shadow-md overflow-hidden
                          transition-all duration-300 hover:-translate-y-2 hover:shadow-xl
                          h-[290px] flex flex-col cursor-pointer"
                        >
                          <div className="relative h-[240px] bg-gray-100 overflow-hidden">
                            <img
                              src={cat.catImg || "/placeholder.jpg"}
                              alt={cat.categoryname}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-3 right-3 bg-pink-500 text-white text-xs px-3 py-1 rounded">
                              Category
                            </span>
                          </div>

                          <div className="p-5 flex flex-col flex-1">
                            <h3 className="text-base font-semibold text-gray-800 mb-1 line-clamp-1">
                              {cat.categoryname}
                            </h3>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-600">
              No categories available
            </div>
          )}
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
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src={slide.desktopImg}
                  alt={slide.title}
                  className="hidden md:block max-h-full max-w-full object-contain"
                />
                <img
                  src={slide.mobileImg}
                  alt={slide.title}
                  className="md:hidden w-full h-full object-cover"
                />
                <div className="absolute inset-0 md:bg-black/0 bg-black/40"></div>
              </div>

              <div className="hidden md:flex absolute inset-8 items-center">
                <div className="max-w-xl ml-10 rounded-2xl p-10">
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
                        <div className="text-white/90 text-xs">{stat.label}</div>
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

        <div className="absolute bottom-8 left-0 right-0 z-20">
          <div className="flex justify-center gap-3">
            {BEAUTY_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setBeautyIndex(i)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  beautyIndex === i ? "w-10 bg-red-500" : "w-3 bg-red-300"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ================= PRODUCTS (SMOOTH INFINITE) ================= */}
      <section className="py-20 bg-[#f6dcc7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-14">
            <div>
              <h2 className="text-[40px] font-serif font-semibold text-gray-800">
                Products
              </h2>
              <p className="text-gray-600 mt-2 max-w-xl">
                Discover our most popular wholesale cosmetic products trusted by
                businesses worldwide.
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

          {loading ? (
            <div className="text-center py-12 text-gray-600">
              Loading products...
            </div>
          ) : allProducts.length > 0 ? (
            <div className="relative">
              <button
                onClick={handleProdPrev}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10
                  w-12 h-12 rounded-full
                  bg-red-500 text-white text-2xl
                  flex items-center justify-center
                  shadow-xl hover:bg-red-600"
              >
                ‹
              </button>

              <button
                onClick={handleProdNext}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-10
                  w-12 h-12 rounded-full
                  bg-red-500 text-white text-2xl
                  flex items-center justify-center
                  shadow-xl hover:bg-red-600"
              >
                ›
              </button>

              <div className="overflow-hidden">
                <div
                  className={`flex ${
                    prodTransition
                      ? "transition-transform duration-700 ease-in-out"
                      : ""
                  }`}
                  style={{
                    transform: `translateX(-${productPos * productSlideWidth}%)`,
                  }}
                >
                  {infiniteProducts.map((p: any, i: number) => (
                    <div
                      key={`${p._id}-${i}`}
                      style={{ minWidth: `${productSlideWidth}%` }}
                      className="px-3"
                    >
                      <Link href={`/product/${p._id}`} className="block h-full">
                        <div
                          className="bg-white rounded-xl shadow-md overflow-hidden
                          transition-all duration-300
                          hover:-translate-y-2 hover:shadow-xl
                          h-[420px] flex flex-col
                          cursor-pointer"
                        >
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

                          <div className="p-5 flex flex-col flex-1">
                            <h3 className="text-base font-semibold text-gray-800 mb-1 line-clamp-1">
                              {p.name}
                            </h3>

                            <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">
                              {p.description}
                            </p>

                            <span className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium w-fit">
                              View Details
                              <ArrowRight size={14} />
                            </span>
                          </div>
                        </div>
                      </Link>
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
    </div>
  )
}
