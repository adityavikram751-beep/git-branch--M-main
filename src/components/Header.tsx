"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Menu, X, LogOut, FileText, User, Search, ShoppingBag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")
  const [enquiryCount, setEnquiryCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showEnquiryBadge, setShowEnquiryBadge] = useState(false)

  // ✅ Search States
  const [searchQuery, setSearchQuery] = useState("")
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)

  // ✅ Mobile Search Toggle (Header top bar)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  const router = useRouter()
  const pathname = usePathname()

  // ✅ single function to load everything
  const loadHeaderData = useCallback(async () => {
    setLoading(true)

    const token = localStorage.getItem("token")
    const userId = localStorage.getItem("userId")

    const hasSeenEnquiries = localStorage.getItem("hasSeenEnquiries") === "true"

    // ❌ not logged in
    if (!token || !userId) {
      setLoggedIn(false)
      setUserName("")
      setEnquiryCount(0)
      setShowEnquiryBadge(false)
      setLoading(false)
      return
    }

    // ✅ instantly show logged in UI (no wait for API)
    setLoggedIn(true)

    try {
      // Fetch user data
      const userRes = await fetch(
        `https://barber-syndicate.vercel.app/api/v1/user/single-user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const userData = await userRes.json()

      if (userData?.user?.name) {
        setUserName(userData.user.name)
      } else {
        setUserName("User")
      }
    } catch (err) {
      console.error("Error fetching user data:", err)
      setUserName("User")
    }

    try {
      // Fetch enquiry count
      const enquiryRes = await fetch(
        `https://barber-syndicate.vercel.app/api/v1/enquiry/${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const enquiryData = await enquiryRes.json()

      if (enquiryData?.success && Array.isArray(enquiryData?.data)) {
        const count = enquiryData.data.length
        setEnquiryCount(count)

        // show badge only if not seen
        if (count > 0 && !hasSeenEnquiries) {
          setShowEnquiryBadge(true)
        } else {
          setShowEnquiryBadge(false)
        }
      } else {
        setEnquiryCount(0)
        setShowEnquiryBadge(false)
      }
    } catch (err) {
      console.error("Error fetching enquiry count:", err)
      setEnquiryCount(0)
      setShowEnquiryBadge(false)
    } finally {
      setLoading(false)
    }
  }, [])

  // ✅ run on first load
  useEffect(() => {
    loadHeaderData()
  }, [loadHeaderData])

  // ✅ LISTEN: login/logout without refresh
  useEffect(() => {
    const handleAuthChanged = () => {
      loadHeaderData()
    }

    window.addEventListener("authChanged", handleAuthChanged)

    return () => {
      window.removeEventListener("authChanged", handleAuthChanged)
    }
  }, [loadHeaderData])

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.search-container') && !target.closest('.search-dropdown')) {
        setShowDropdown(false)
      }
    }

    window.addEventListener("click", handleClickOutside)
    return () => window.removeEventListener("click", handleClickOutside)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    localStorage.removeItem("hasSeenEnquiries")

    setLoggedIn(false)
    setUserName("")
    setEnquiryCount(0)
    setShowEnquiryBadge(false)
    setIsMenuOpen(false)

    // 🔥 notify header instantly
    window.dispatchEvent(new Event("authChanged"))

    router.push("/login")
  }

  const handleEnquiryClick = () => {
    setIsMenuOpen(false)

    // Mark as seen
    localStorage.setItem("hasSeenEnquiries", "true")
    setShowEnquiryBadge(false)

    router.push("/inquiry")
  }

  const navClass = (href: string) =>
    `text-[17px] font-semibold tracking-wide transition-colors ${
      pathname === href
        ? "text-[#3f3cff] underline underline-offset-4"
        : "text-black hover:text-[#3f3cff]"
    }`

  const navItems = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/product", label: "Products", icon: "🛍️" },
    { href: "/brand", label: "Brands", icon: "🏢" },
    { href: "/category", label: "Category", icon: "📁" },
    { href: "/contact", label: "Contacts", icon: "📞" },
  ]

  // ✅ Search API Call (Debounce)
  useEffect(() => {
    const q = searchQuery.trim()

    if (!q) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true)

        const res = await fetch(
          `https://barber-syndicate.vercel.app/api/v1/product/search-product?search=${encodeURIComponent(
            q
          )}`
        )

        const data = await res.json()

        // Get products array from different possible response structures
        const products = 
          data?.data || 
          data?.products || 
          data?.results || 
          []

        if (Array.isArray(products)) {
          // Filter only products with images and name
          const filteredProducts = products
            .filter((p: any) => p?.name && p?.images?.[0])
            .slice(0, 15)
          
          setSearchResults(filteredProducts)
        } else {
          setSearchResults([])
        }

        setShowDropdown(true)
      } catch (err) {
        console.error("Search API error:", err)
        setSearchResults([])
        setShowDropdown(false)
      } finally {
        setSearchLoading(false)
      }
    }, 450)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSelectProduct = (product: any) => {
    setShowDropdown(false)
    setSearchQuery("")
    setIsMenuOpen(false)
    setMobileSearchOpen(false)

    if (product?._id || product?.id) {
      router.push(`/product/${product._id || product.id}`)
      return
    }

    router.push("/product")
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const q = searchQuery.trim()
    if (!q) return

    setShowDropdown(false)
    setIsMenuOpen(false)
    setMobileSearchOpen(false)

    router.push(`/product?search=${encodeURIComponent(q)}`)
  }

  const toggleMobileSearch = () => {
    setMobileSearchOpen((prev) => !prev)
    setShowDropdown(false)
  }

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#fff9f2] border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-2 lg:px-0">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* LEFT: Mobile menu + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-black/5 transition"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X size={22} className="text-gray-800" />
              ) : (
                <Menu size={22} className="text-gray-800" />
              )}
            </button>

            <Link href="/" className="flex items-center transition-opacity">
              <Image
                src="/logo.png"
                alt="Barber Syndicate"
                width={120}
                height={70}
                className="w-20 h-12 md:w-32 md:h-20 object-contain"
                priority
              />
            </Link>
          </div>

          {/* CENTER: Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={navClass(item.href)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* RIGHT: Search + Auth */}
          <div className="flex items-center gap-2">
            {/* ✅ Mobile Search Icon (Header Top Bar) */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleMobileSearch()
              }}
              className="md:hidden p-2 rounded-md hover:bg-black/5 transition"
              aria-label="Search"
            >
              <Search size={22} className="text-gray-800" />
            </button>

            {/* ✅ Desktop Search */}
            <div
              className="hidden md:flex items-center search-container"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <form onSubmit={handleSearchSubmit}>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (searchQuery.trim()) setShowDropdown(true)
                    }}
                    placeholder="Search products..."
                    className="w-[420px] h-11 pl-10 pr-3 rounded-lg border border-gray-300 bg-white text-sm outline-none focus:ring-2 focus:ring-[#3f3cff]/30"
                  />
                </form>

                {/* ✅ Desktop Dropdown */}
                {showDropdown && (
                  <div className="absolute top-14 left-0 w-[600px] bg-white border-2 border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden search-dropdown">
                    {searchLoading ? (
                      <div className="px-6 py-8 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-3 border-[#3f3cff] mr-3"></div>
                        <p className="text-base font-medium text-gray-700">Searching products...</p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="max-h-[500px] overflow-y-auto">
                        {/* ✅ Header */}
                        <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                          <p className="text-lg font-bold text-gray-800">
                            {searchResults.length} products found
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Showing results for "{searchQuery}"
                          </p>
                        </div>
                        
                        {/* ✅ Product List */}
                        <div className="divide-y divide-gray-100">
                          {searchResults.map((p: any, index: number) => (
                            <button
                              key={index}
                              onClick={() => handleSelectProduct(p)}
                              className="w-full text-left p-5 hover:bg-blue-50/50 flex items-center gap-5 transition-all duration-200 hover:scale-[1.01] group"
                            >
                              {/* ✅ Image */}
                              <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center border-2 border-gray-300 group-hover:border-[#3f3cff] group-hover:shadow-lg transition-all duration-300">
                                {p?.images?.[0] ? (
                                  <Image
                                    src={p.images[0]}
                                    alt={p?.name || "Product"}
                                    width={80}
                                    height={80}
                                    className="w-20 h-20 object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/80x80?text=No+Image"
                                    }}
                                  />
                                ) : p?.image ? (
                                  <Image
                                    src={p.image}
                                    alt={p?.name || "Product"}
                                    width={80}
                                    height={80}
                                    className="w-20 h-20 object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/80x80?text=No+Image"
                                    }}
                                  />
                                ) : (
                                  <div className="w-20 h-20 flex items-center justify-center bg-gray-200">
                                    <ShoppingBag className="w-8 h-8 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              
                              {/* ✅ Text Area */}
                              <div className="flex-1 min-w-0">
                                <p className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-[#3f3cff] transition-colors">
                                  {p?.name || "Product"}
                                </p>
                                
                                {/* ✅ Brand if available */}
                               
                                
                                {/* ✅ Price if available */}
                                {p?.price && (
                                  <p className="text-lg font-bold text-green-600 mt-1">
                                    ₹{p.price}
                                  </p>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="px-6 py-12 text-center">
                        <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100">
                          <Search className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-xl font-bold text-gray-800">No products found</p>
                        <p className="text-gray-600 mt-2">Try searching with different keywords</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {loggedIn ? (
              <>
                {/* Mobile Enquiry Icon */}
                <button
                  onClick={handleEnquiryClick}
                  className="md:hidden p-2 relative hover:bg-black/5 rounded-md transition"
                  aria-label="My Enquiries"
                >
                  <FileText size={22} className="text-gray-800" />
                  {enquiryCount > 0 && showEnquiryBadge && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                      {enquiryCount > 9 ? "9+" : enquiryCount}
                    </span>
                  )}
                </button>

                {/* Desktop Enquiry + User */}
                <div className="hidden md:flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEnquiryClick}
                    className="relative hover:bg-[#f0edff] hover:text-[#3f3cff] transition-colors"
                  >
                    <FileText className="w-5 h-5" />
                    <span className="ml-2">My Cart</span>
                    {enquiryCount > 0 && showEnquiryBadge && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-600"
                      >
                        {enquiryCount > 99 ? "99+" : enquiryCount}
                      </Badge>
                    )}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-black/5 transition-colors"
                      >
                        <User className="w-4 h-4 mr-2" />
                        <span className="max-w-32 truncate">
                          {userName || "User"}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-3 py-2">
                        <p className="text-sm font-medium text-gray-900">
                          Signed in as
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {userName || "User"}
                        </p>
                      </div>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer text-red-600 focus:text-red-600"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-[18px] font-semibold text-black hover:text-[#3f3cff] transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-md bg-[#d9d2ff] text-[#3f3cff] font-semibold hover:bg-[#c8beff] transition-colors text-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ✅ SIMPLE MOBILE SEARCH BAR */}
        {mobileSearchOpen && (
          <div
            className="md:hidden pb-3 search-container"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearchSubmit}>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.trim()) setShowDropdown(true)
                  }}
                  placeholder="Search products..."
                  className="w-full h-11 pl-10 pr-3 rounded-lg border border-gray-300 bg-white text-sm outline-none focus:ring-2 focus:ring-[#3f3cff]/30"
                />
              </div>
            </form>

            {/* ✅ SIMPLE MOBILE DROPDOWN - ONLY IMAGE + NAME */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-[400px] overflow-y-auto z-50 search-dropdown">
                {searchLoading ? (
                  <div className="px-4 py-6 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#3f3cff] mr-2"></div>
                    <p className="text-sm text-gray-600">Searching...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    {/* ✅ SIMPLE HEADER */}
                    <div className="px-4 py-3 border-b bg-gray-50">
                      <p className="text-sm font-semibold text-gray-700">
                        {searchResults.length} products found
                      </p>
                    </div>
                    
                    {/* ✅ SIMPLE PRODUCT LIST */}
                    <div className="divide-y divide-gray-100">
                      {searchResults.map((p: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => handleSelectProduct(p)}
                          className="w-full text-left p-3 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        >
                          {/* ✅ SIMPLE IMAGE */}
                          <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                            {p?.images?.[0] ? (
                              <Image
                                src={p.images[0]}
                                alt={p?.name || "Product"}
                                width={56}
                                height={56}
                                className="w-14 h-14 object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/56x56?text=No+Image"
                                }}
                              />
                            ) : p?.image ? (
                              <Image
                                src={p.image}
                                alt={p?.name || "Product"}
                                width={56}
                                height={56}
                                className="w-14 h-14 object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/56x56?text=No+Image"
                                }}
                              />
                            ) : (
                              <div className="w-14 h-14 flex items-center justify-center bg-gray-200">
                                <ShoppingBag className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          {/* ✅ SIMPLE NAME ONLY */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 line-clamp-2">
                              {p?.name || "Product"}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    {/* ✅ SIMPLE VIEW ALL */}
                    <div className="px-4 py-3 border-t bg-gray-50">
                     
                    </div>
                  </>
                ) : (
                  <div className="px-4 py-8 text-center">
                    <Search className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-600 font-medium">No products found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40">
            <div
              className="absolute inset-0 bg-black/20"
              onClick={() => setIsMenuOpen(false)}
            />

            <div className="absolute top-0 left-0 w-4/5 max-w-sm h-full bg-white shadow-xl animate-slideIn">
              <div className="h-full overflow-y-auto">
                {/* Menu Header */}
                <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/logo.png"
                      alt="Barber Syndicate"
                      width={50}
                      height={30}
                      className="w-12 h-8"
                    />
                    <span className="text-lg font-bold text-gray-900">
                      Menu
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-md hover:bg-gray-100"
                  >
                    <X size={20} className="text-gray-700" />
                  </button>
                </div>

                {/* Navigation Links */}
                <div className="px-2 py-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 py-3 px-4 rounded-lg mx-2 mb-1 transition-colors ${
                        pathname === item.href
                          ? "bg-[#f0edff] text-[#3f3cff]"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="w-6 h-6 flex items-center justify-center">
                        <span className="text-lg">{item.icon}</span>
                      </div>
                      <span className="font-semibold text-sm">{item.label}</span>
                    </Link>
                  ))}
                </div>

                {/* User Section */}
                <div className="px-4 py-6 border-t mt-4">
                  {loggedIn ? (
                    <>
                      <div className="px-3 py-4 bg-gray-50 rounded-lg mb-4">
                        <p className="text-sm font-medium text-gray-900">
                          Welcome back
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {userName || "User"}
                        </p>
                      </div>

                      <button
                        onClick={handleEnquiryClick}
                        className="flex items-center justify-between w-full py-3 px-4 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors mb-3"
                      >
                        <div className="flex items-center gap-3">
                          <FileText size={18} className="text-gray-600" />
                          <span className="font-semibold text-sm">
                            My Cart
                          </span>
                        </div>
                        {enquiryCount > 0 && showEnquiryBadge && (
                          <span className="h-6 w-6 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                            {enquiryCount > 9 ? "9+" : enquiryCount}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full py-3 px-4 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                      >
                        <LogOut size={18} />
                        <span className="font-semibold text-sm">Logout</span>
                      </button>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <Link
                        href="/login"
                        className="block w-full py-3 text-center rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors text-sm"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Log In
                      </Link>
                      <Link
                        href="/register"
                        className="block w-full py-3 text-center rounded-lg bg-[#d9d2ff] text-[#3f3cff] font-semibold hover:bg-[#c8beff] transition-colors text-sm"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS FOR ANIMATION */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
        }
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
      `}</style>
    </header>
  )
}