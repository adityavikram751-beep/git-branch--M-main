"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, ShoppingBag } from "lucide-react"

/* ================= HERO DEFAULT FALLBACK ================= */
const DEFAULT_HERO = [
  {
    websiteImg: "/hero/hero sliding 1.png",
    mobileImg: "/hero/loreal poster 1.png",
    buttonText: "Explore Products",
    buttonBg: "bg-[#C2185B]",
    textColor: "text-white",
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
  },
]

/* ================= HELPER: MAKE INFINITE SLIDES ================= */
const makeInfiniteSlides = (items: any[]) => {
  if (!items || items.length === 0) return []
  return [items[items.length - 1], ...items, items[0]]
}

/* ================= TYPES ================= */
type BannerItem = {
  _id: string
  banner: string
  title: string
  type: "mobile" | "website"
}

export default function HomePage() {
  const BASE_URL = "https://barber-syndicate.vercel.app"
  const NEW_ARRIVAL_API = `${BASE_URL}/api/v1/product/new-arrival`

  const HERO_API =
    "https://barber-syndicate.vercel.app/api/v1/banner/banner-for-ui"

  /* ================= HERO STATES ================= */
  const [heroIndex, setHeroIndex] = useState(0)
  const [heroWebsiteBanners, setHeroWebsiteBanners] = useState<BannerItem[]>([])
  const [heroMobileBanners, setHeroMobileBanners] = useState<BannerItem[]>([])

  /* ================= DATA STATES ================= */
  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [newArrivalProducts, setNewArrivalProducts] = useState<any[]>([])

  const [loading, setLoading] = useState(true)

  /* ================= RESPONSIVE SLIDES PER VIEW ================= */
  const [categorySlidesPerView, setCategorySlidesPerView] = useState(1)
  const [productSlidesPerView, setProductSlidesPerView] = useState(1)
  const [brandSlidesPerView, setBrandSlidesPerView] = useState(1)
  const [newArrivalSlidesPerView, setNewArrivalSlidesPerView] = useState(1)

  useEffect(() => {
    const handleResize = () => {
      // categories
      if (window.innerWidth >= 1024) setCategorySlidesPerView(3)
      else if (window.innerWidth >= 640) setCategorySlidesPerView(2)
      else setCategorySlidesPerView(1)

      // products
      if (window.innerWidth >= 1024) setProductSlidesPerView(3)
      else if (window.innerWidth >= 640) setProductSlidesPerView(2)
      else setProductSlidesPerView(1)

      // brands
      if (window.innerWidth >= 1024) setBrandSlidesPerView(3)
      else if (window.innerWidth >= 640) setBrandSlidesPerView(2)
      else setBrandSlidesPerView(1)

      // new arrival
      if (window.innerWidth >= 1024) setNewArrivalSlidesPerView(3)
      else if (window.innerWidth >= 640) setNewArrivalSlidesPerView(2)
      else setNewArrivalSlidesPerView(1)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  /* ================= FETCH HERO BANNERS (GET + QUERY) ================= */
  useEffect(() => {
    const fetchHeroBanners = async () => {
      try {
        const [websiteRes, mobileRes] = await Promise.all([
          fetch(`${HERO_API}?type=website`, { method: "GET" }),
          fetch(`${HERO_API}?type=mobile`, { method: "GET" }),
        ])

        const websiteData = await websiteRes.json()
        const mobileData = await mobileRes.json()

        setHeroWebsiteBanners(Array.isArray(websiteData?.banners) ? websiteData.banners : [])
        setHeroMobileBanners(Array.isArray(mobileData?.banners) ? mobileData.banners : [])

        setHeroIndex(0)
      } catch (error) {
        console.error("Error fetching hero banners:", error)
        setHeroWebsiteBanners([])
        setHeroMobileBanners([])
      }
    }

    fetchHeroBanners()
  }, [])

  /* ================= HERO SLIDES (MERGE WEBSITE + MOBILE) ================= */
  const heroLen = Math.max(heroWebsiteBanners.length, heroMobileBanners.length)

  const heroSlides = useMemo(() => {
    // If API empty => fallback default
    if (!heroLen) return DEFAULT_HERO

    return Array.from({ length: heroLen }).map((_, i) => {
      const websiteImg =
        heroWebsiteBanners[i]?.banner ||
        heroWebsiteBanners[0]?.banner ||
        DEFAULT_HERO[0].websiteImg

      const mobileImg =
        heroMobileBanners[i]?.banner ||
        heroMobileBanners[0]?.banner ||
        DEFAULT_HERO[0].mobileImg

      return {
        websiteImg,
        mobileImg,
        buttonText: "Explore Products",
        buttonBg: "bg-[#C2185B]",
        textColor: "text-white",
        mobile: {
          title: heroMobileBanners[i]?.title || "Explore Our Collection",
          subtitle: "",
          description: "",
          stats: [
            { value: "500+", label: "Products" },
            { value: "1000+", label: "Happy Clients" },
            { value: "99%+", label: "Satisfaction" },
          ],
        },
      }
    })
  }, [heroLen, heroWebsiteBanners, heroMobileBanners])

  /* ================= HERO AUTO SLIDER ================= */
  useEffect(() => {
    if (!heroSlides.length) return
    const timer = setInterval(() => {
      setHeroIndex((p) => (p + 1) % heroSlides.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [heroSlides.length])

  /* ================= FETCH ALL DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // products
        const allProductsRes = await fetch(`${BASE_URL}/api/v1/product?page=1`)
        const allProductsData = await allProductsRes.json()
        setAllProducts(allProductsData?.products || [])

        // categories
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

        // brands
        const brandsRes = await fetch(`${BASE_URL}/api/v1/brands/getall`)
        const brandsData = await brandsRes.json()
        setBrands(brandsData?.data || [])

        // new arrival products
        const newArrivalRes = await fetch(NEW_ARRIVAL_API)
        const newArrivalData = await newArrivalRes.json()

        const list =
          newArrivalData?.products ||
          newArrivalData?.data ||
          newArrivalData?.newArrivals ||
          []

        setNewArrivalProducts(Array.isArray(list) ? list : [])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
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
  const infiniteBrands = useMemo(() => makeInfiniteSlides(brands), [brands])
  const infiniteNewArrivals = useMemo(
    () => makeInfiniteSlides(newArrivalProducts),
    [newArrivalProducts]
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

  /* ================= BRAND INFINITE SLIDER ================= */
  const [brandPos, setBrandPos] = useState(1)
  const [brandTransition, setBrandTransition] = useState(true)
  const brandSlideWidth = 100 / brandSlidesPerView

  useEffect(() => {
    if (brands.length > 0) {
      setBrandTransition(false)
      setBrandPos(1)
      const t = setTimeout(() => setBrandTransition(true), 50)
      return () => clearTimeout(t)
    }
  }, [brands.length])

  useEffect(() => {
    if (brands.length > 0) {
      const timer = setInterval(() => {
        setBrandPos((p) => p + 1)
      }, 3500)
      return () => clearInterval(timer)
    }
  }, [brands.length])

  useEffect(() => {
    if (!brands.length) return
    if (!infiniteBrands.length) return

    const lastIndex = infiniteBrands.length - 1

    if (brandPos === lastIndex) {
      const t = setTimeout(() => {
        setBrandTransition(false)
        setBrandPos(1)
      }, 700)
      return () => clearTimeout(t)
    }

    if (brandPos === 0) {
      const t = setTimeout(() => {
        setBrandTransition(false)
        setBrandPos(lastIndex - 1)
      }, 700)
      return () => clearTimeout(t)
    }

    const enableT = setTimeout(() => setBrandTransition(true), 750)
    return () => clearTimeout(enableT)
  }, [brandPos, brands.length, infiniteBrands.length])

  const handleBrandNext = () => setBrandPos((p) => p + 1)
  const handleBrandPrev = () => setBrandPos((p) => p - 1)

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

  /* ================= NEW ARRIVAL INFINITE SLIDER ================= */
  const [newArrivalPos, setNewArrivalPos] = useState(1)
  const [newArrivalTransition, setNewArrivalTransition] = useState(true)
  const newArrivalSlideWidth = 100 / newArrivalSlidesPerView

  useEffect(() => {
    if (newArrivalProducts.length > 0) {
      setNewArrivalTransition(false)
      setNewArrivalPos(1)
      const t = setTimeout(() => setNewArrivalTransition(true), 50)
      return () => clearTimeout(t)
    }
  }, [newArrivalProducts.length])

  useEffect(() => {
    if (newArrivalProducts.length > 0) {
      const timer = setInterval(() => {
        setNewArrivalPos((p) => p + 1)
      }, 3500)
      return () => clearInterval(timer)
    }
  }, [newArrivalProducts.length])

  useEffect(() => {
    if (!newArrivalProducts.length) return
    if (!infiniteNewArrivals.length) return

    const lastIndex = infiniteNewArrivals.length - 1

    if (newArrivalPos === lastIndex) {
      const t = setTimeout(() => {
        setNewArrivalTransition(false)
        setNewArrivalPos(1)
      }, 700)
      return () => clearTimeout(t)
    }

    if (newArrivalPos === 0) {
      const t = setTimeout(() => {
        setNewArrivalTransition(false)
        setNewArrivalPos(lastIndex - 1)
      }, 700)
      return () => clearTimeout(t)
    }

    const enableT = setTimeout(() => setNewArrivalTransition(true), 750)
    return () => clearTimeout(enableT)
  }, [newArrivalPos, newArrivalProducts.length, infiniteNewArrivals.length])

  const handleNewArrivalNext = () => setNewArrivalPos((p) => p + 1)
  const handleNewArrivalPrev = () => setNewArrivalPos((p) => p - 1)

  return (
    <div className="bg-white">
      {/* ================= HERO SECTION ================= */}
      <section className="relative h-[80vh] md:h-screen w-full overflow-hidden">
        <div className="relative h-full w-full">
          {heroSlides.map((slide, index) => (
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
                  src={slide.websiteImg}
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

              {/* MOBILE HERO TEXT */}
              <div className="absolute inset-0 flex md:hidden items-center justify-center px-4">
                <div className="w-full max-w-md mx-auto">
                  <div className="text-center mb-8">
                    <h1 className="text-white text-2xl font-bold mb-4 leading-tight">
                      {slide.mobile.title}
                    </h1>
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
                        <div className="text-white/90 text-xs font-medium mt-1">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mb-8">
                    <Link
                      href="/product"
                      className={`inline-flex items-center justify-center gap-2
                      ${slide.buttonBg} ${slide.textColor}
                      px-6 py-3.5 rounded-xl font-bold text-sm w-full
                      border-2 border-white/30`}
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
            {heroSlides.map((_, i) => (
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

      {/* ================= BRANDS ================= */}
      <section className="py-20 bg-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-14">
            <div>
              <h2 className="text-[40px] font-serif font-semibold text-gray-800">
                Explore Brands
              </h2>
              <p className="text-gray-600 mt-2 max-w-xl">
                Choose a brand and explore products.
              </p>
            </div>

            <Link
              href="/brand"
              className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              View All Brands <span>→</span>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-600">
              Loading brands...
            </div>
          ) : brands.length > 0 ? (
            <div className="relative">
              <button
                onClick={handleBrandPrev}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10
                w-12 h-12 rounded-full text-white text-2xl
                flex items-center justify-center shadow-xl transition
                bg-red-500 hover:bg-red-600"
              >
                ‹
              </button>

              <button
                onClick={handleBrandNext}
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
                    brandTransition
                      ? "transition-transform duration-700 ease-in-out"
                      : ""
                  }`}
                  style={{
                    transform: `translateX(-${brandPos * brandSlideWidth}%)`,
                  }}
                >
                  {infiniteBrands.map((b: any, i: number) => (
                    <div
                      key={`${b._id}-${i}`}
                      style={{ minWidth: `${brandSlideWidth}%` }}
                      className="px-3"
                    >
                      <Link
                        href={`/product?brand=${b._id}`}
                        className="block h-full"
                      >
                        <div
                          className="bg-white rounded-xl shadow-md overflow-hidden
                          transition-all duration-300 hover:-translate-y-2 hover:shadow-xl
                          h-[290px] flex flex-col cursor-pointer"
                        >
                          <div className="relative h-[240px] bg-gray-100 overflow-hidden">
                            <img
                              src={b.icons || "/placeholder.jpg"}
                              alt={b.brand || "Brand"}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-3 right-3 bg-pink-500 text-white text-xs px-3 py-1 rounded">
                              Brand
                            </span>
                          </div>

                          <div className="p-5 flex flex-col flex-1">
                            <h3 className="text-base font-semibold text-gray-800 mb-1 line-clamp-1">
                              {b.brand}
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
              No brands available
            </div>
          )}
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
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

      {/* ================= NEW ARRIVAL PRODUCTS ================= */}
      <section className="py-20 bg-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-14">
            <div>
              <h2 className="text-[40px] font-serif font-semibold text-gray-800">
                New Arrival Products
              </h2>
              <p className="text-gray-600 mt-2 max-w-xl">
                Freshly added products — explore the latest arrivals.
              </p>
            </div>

            <Link
              href="/product"
              className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Explore Products <span>→</span>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-600">
              Loading new arrivals...
            </div>
          ) : newArrivalProducts.length > 0 ? (
            <div className="relative">
              <button
                onClick={handleNewArrivalPrev}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10
                w-12 h-12 rounded-full text-white text-2xl
                flex items-center justify-center shadow-xl transition
                bg-red-500 hover:bg-red-600"
              >
                ‹
              </button>

              <button
                onClick={handleNewArrivalNext}
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
                    newArrivalTransition
                      ? "transition-transform duration-700 ease-in-out"
                      : ""
                  }`}
                  style={{
                    transform: `translateX(-${
                      newArrivalPos * newArrivalSlideWidth
                    }%)`,
                  }}
                >
                  {infiniteNewArrivals.map((p: any, i: number) => (
                    <div
                      key={`${p._id}-${i}`}
                      style={{ minWidth: `${newArrivalSlideWidth}%` }}
                      className="px-3"
                    >
                      <Link href={`/product/${p._id}`} className="block h-full">
                        <div
                          className="bg-white rounded-xl shadow-md overflow-hidden
                          transition-all duration-300 hover:-translate-y-2 hover:shadow-xl
                          h-[420px] flex flex-col cursor-pointer"
                        >
                          <div className="relative h-[220px] bg-gray-100 overflow-hidden">
                            <img
                              src={p.images?.[0] || "/placeholder.jpg"}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-3 right-3 bg-pink-500 text-white text-xs px-3 py-1 rounded">
                              New
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
              No new arrival products available
            </div>
          )}
        </div>
      </section>

      {/* ================= PRODUCTS ================= */}
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
