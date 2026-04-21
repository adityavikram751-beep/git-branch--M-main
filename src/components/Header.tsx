"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Menu, X, LogOut, FileText, User, Search, ShoppingBag, Mic } from "lucide-react"
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

  const [searchQuery, _setSearchQuery] = useState("")
  const searchQueryRef = useRef("")
  const setSearchQuery = useCallback((val: string) => {
    searchQueryRef.current = val
    _setSearchQuery(val)
  }, [])

  const [searchLoading, setSearchLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  // isListening: BOTH state (JSX re-render) AND ref (for callbacks — no stale closure)
  const [isListening, setIsListening] = useState(false)
  const isListeningRef = useRef(false)

  // Direct DOM refs for mic buttons — instant visual update without waiting for re-render
  const desktopMicBtnRef = useRef<HTMLButtonElement>(null)
  const mobileMicBtnRef = useRef<HTMLButtonElement>(null)

  const recognitionRef = useRef<any>(null)
  const router = useRouter()
  const pathname = usePathname()

  // ==================== DIRECT DOM MIC UPDATE ====================
  // Updates mic button appearance IMMEDIATELY — no React re-render lag
  const applyMicStyle = useCallback((listening: boolean) => {
    const btns = [desktopMicBtnRef.current, mobileMicBtnRef.current]
    btns.forEach((btn) => {
      if (!btn) return
      if (listening) {
        btn.style.backgroundColor = "#ef4444"
        btn.style.border = "none"
        btn.style.color = "#ffffff"
        btn.style.boxShadow = "0 0 0 4px rgba(239,68,68,0.25)"
        btn.innerHTML = `
          <span style="display:flex;align-items:center;gap:2px;height:16px;">
            <span style="display:block;width:3px;border-radius:3px;background:#fff;height:8px;animation:micWave 0.6s ease-in-out 0s infinite alternate;"></span>
            <span style="display:block;width:3px;border-radius:3px;background:#fff;height:14px;animation:micWave 0.6s ease-in-out 0.12s infinite alternate;"></span>
            <span style="display:block;width:3px;border-radius:3px;background:#fff;height:10px;animation:micWave 0.6s ease-in-out 0.24s infinite alternate;"></span>
            <span style="display:block;width:3px;border-radius:3px;background:#fff;height:6px;animation:micWave 0.6s ease-in-out 0.36s infinite alternate;"></span>
          </span>`
      } else {
        btn.style.backgroundColor = "#ffffff"
        btn.style.border = "1.5px solid #e5e7eb"
        btn.style.color = "#9ca3af"
        btn.style.boxShadow = "none"
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>`
      }
    })
  }, [])

  // ==================== VOICE SEARCH ====================
  const initSpeechRecognition = useCallback(() => {
    if (typeof window === "undefined") return null
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return null

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = navigator.language || "en-IN"

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.trim()
      if (transcript) {
        setSearchQuery(transcript)
        router.push(`/product?search=${encodeURIComponent(transcript)}`)
        setShowDropdown(false)
        setMobileSearchOpen(false)
        setIsMenuOpen(false)
      }
      isListeningRef.current = false
      setIsListening(false)
      applyMicStyle(false)
    }

    recognition.onerror = () => {
      isListeningRef.current = false
      setIsListening(false)
      applyMicStyle(false)
    }

    recognition.onend = () => {
      isListeningRef.current = false
      setIsListening(false)
      applyMicStyle(false)
    }

    return recognition
  }, [router, setSearchQuery, applyMicStyle])

  // toggleVoiceSearch has NO dependency on isListening state — uses isListeningRef instead
  const toggleVoiceSearch = useCallback(() => {
    if (!recognitionRef.current) {
      recognitionRef.current = initSpeechRecognition()
      if (!recognitionRef.current) {
        alert("Voice search is not supported in your browser. Try Chrome, Edge, or Safari.")
        return
      }
    }

    if (isListeningRef.current) {
      try { recognitionRef.current.stop() } catch (e) {}
      isListeningRef.current = false
      setIsListening(false)
      applyMicStyle(false)
    } else {
      try {
        recognitionRef.current.start()
        isListeningRef.current = true
        setIsListening(true)
        applyMicStyle(true)  // instant DOM update — no re-render needed
      } catch (err) {
        console.error("Start failed", err)
        isListeningRef.current = false
        setIsListening(false)
        applyMicStyle(false)
      }
    }
  }, [initSpeechRecognition, applyMicStyle]) // intentionally NO isListening in deps

  useEffect(() => {
    recognitionRef.current = initSpeechRecognition()
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort() } catch (e) {}
      }
    }
  }, [initSpeechRecognition])

  useEffect(() => {
    if (!mobileSearchOpen && isListeningRef.current && recognitionRef.current) {
      try { recognitionRef.current.stop() } catch (e) {}
      isListeningRef.current = false
      setIsListening(false)
      applyMicStyle(false)
    }
  }, [mobileSearchOpen, applyMicStyle])

  // ==================== HEADER DATA ====================
  const loadHeaderData = useCallback(async () => {
    setLoading(true)
    const token = localStorage.getItem("token")
    const userId = localStorage.getItem("userId")
    const hasSeenEnquiries = localStorage.getItem("hasSeenEnquiries") === "true"

    if (!token || !userId) {
      setLoggedIn(false)
      setUserName("")
      setEnquiryCount(0)
      setShowEnquiryBadge(false)
      setLoading(false)
      return
    }
    setLoggedIn(true)

    try {
      const userRes = await fetch(`https://api.3846.in/api/v1/user/single-user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const userData = await userRes.json()
      setUserName(userData?.user?.name || "User")
    } catch {
      setUserName("User")
    }

    try {
      const enquiryRes = await fetch(`https://api.3846.in/api/v1/enquiry/${userId}`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      })
      const enquiryData = await enquiryRes.json()
      if (enquiryData?.success && Array.isArray(enquiryData?.data)) {
        const count = enquiryData.data.length
        setEnquiryCount(count)
        setShowEnquiryBadge(count > 0 && !hasSeenEnquiries)
      } else {
        setEnquiryCount(0)
        setShowEnquiryBadge(false)
      }
    } catch {
      setEnquiryCount(0)
      setShowEnquiryBadge(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadHeaderData() }, [loadHeaderData])

  useEffect(() => {
    const handleAuthChanged = () => loadHeaderData()
    window.addEventListener("authChanged", handleAuthChanged)
    return () => window.removeEventListener("authChanged", handleAuthChanged)
  }, [loadHeaderData])

  // ==================== SEARCH ====================
  useEffect(() => {
    const q = searchQuery.trim()
    if (!q) { setSearchResults([]); setShowDropdown(false); return }

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true)
        const res = await fetch(
          `https://api.3846.in/api/v1/product/search-product?search=${encodeURIComponent(q)}`
        )
        const data = await res.json()
        const products = data?.data || data?.products || data?.results || []
        if (Array.isArray(products)) {
          setSearchResults(products.filter((p: any) => p?.name && p?.images?.[0]).slice(0, 15))
        } else {
          setSearchResults([])
        }
        setShowDropdown(true)
      } catch {
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
    router.push(product?._id || product?.id ? `/product/${product._id || product.id}` : "/product")
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchQueryRef.current.trim()
    if (!q) return
    setShowDropdown(false)
    setIsMenuOpen(false)
    setMobileSearchOpen(false)
    router.push(`/product?search=${encodeURIComponent(q)}`)
  }

  const closeSearchDropdown = () => { setShowDropdown(false); setSearchResults([]) }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    localStorage.removeItem("hasSeenEnquiries")
    localStorage.removeItem("notificationDismissed")
    setLoggedIn(false)
    setUserName("")
    setEnquiryCount(0)
    setShowEnquiryBadge(false)
    setIsMenuOpen(false)
    window.dispatchEvent(new Event("authChanged"))
    router.push("/login")
  }

  const handleEnquiryClick = () => {
    setIsMenuOpen(false)
    localStorage.setItem("hasSeenEnquiries", "true")
    setShowEnquiryBadge(false)
    router.push("/inquiry")
  }

  const navClass = (href: string) =>
    `text-[17px] font-semibold tracking-wide transition-colors ${
      pathname === href ? "text-[#3f3cff] underline underline-offset-4" : "text-black hover:text-[#3f3cff]"
    }`

  const navItems = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/product", label: "Products", icon: "🛍️" },
    { href: "/brand", label: "Brands", icon: "🏢" },
    { href: "/category", label: "Category", icon: "📁" },
    { href: "/contact", label: "Contacts", icon: "📞" },
  ]

  // Base mic button style — appearance is overridden directly via applyMicStyle() on click
  const micBtnStyle: React.CSSProperties = {
    position: "absolute",
    right: "8px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    border: "1.5px solid #e5e7eb",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    color: "#9ca3af",
    zIndex: 10,
    outline: "none",
    flexShrink: 0,
    transition: "background-color 0.15s ease, box-shadow 0.15s ease",
  }

  const inputStyle = (fullWidth?: boolean): React.CSSProperties => ({
    width: fullWidth ? "100%" : "420px",
    height: "44px",
    paddingLeft: "40px",
    paddingRight: "52px",
    borderRadius: "8px",
    border: isListening ? "2px solid #ef4444" : "1.5px solid #d1d5db",
    outline: "none",
    fontSize: "14px",
    backgroundColor: isListening ? "#fff5f5" : "#ffffff",
    boxShadow: isListening ? "0 0 0 3px rgba(239,68,68,0.15)" : "none",
    transition: "all 0.25s ease",
  })

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#fff9f2] border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-2 lg:px-0">
        <div className="h-16 flex items-center justify-between gap-4">

          {/* LEFT */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-black/5 transition"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={22} className="text-gray-800" /> : <Menu size={22} className="text-gray-800" />}
            </button>
            <Link href="/" className="flex items-center">
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

          {/* CENTER NAV */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={navClass(item.href)}>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* RIGHT */}
          <div className="flex items-center gap-2">

            <button
              onClick={() => { setMobileSearchOpen((p) => !p); setShowDropdown(false) }}
              className="md:hidden p-2 rounded-md hover:bg-black/5 transition"
              aria-label="Search"
            >
              <Search size={22} className="text-gray-800" />
            </button>

            {/* ========== DESKTOP SEARCH ========== */}
            <div
              className="hidden md:flex items-center search-container"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <form onSubmit={handleSearchSubmit}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => searchQuery.trim() && setShowDropdown(true)}
                      placeholder={isListening ? "Listening..." : "Search products..."}
                      style={inputStyle()}
                    />
                    {/* DESKTOP MIC — ref for direct DOM style updates */}
                    <button
                      ref={desktopMicBtnRef}
                      type="button"
                      onClick={toggleVoiceSearch}
                      aria-label="Voice search"
                      style={micBtnStyle}
                    >
                      <Mic size={15} />
                    </button>
                  </div>
                </form>

                {/* Listening banner below input */}
                {isListening && (
                  <div style={{
                    position: "absolute",
                    top: "50px",
                    left: 0,
                    right: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "7px 14px",
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#ef4444",
                    zIndex: 60,
                  }}>
                    <span style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      backgroundColor: "#ef4444",
                      animation: "micPulseCircle 1s ease-in-out infinite",
                      flexShrink: 0,
                    }} />
                    Listening... Speak now
                  </div>
                )}

                {/* Desktop dropdown */}
                {showDropdown && !isListening && (
                  <div className="absolute left-0 w-[600px] bg-white border-2 border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden" style={{ top: "52px" }}>
                    <div className="flex justify-between items-center px-4 py-2 border-b bg-gray-50">
                      <span className="text-sm font-medium text-gray-600">Search Results</span>
                      <button onClick={closeSearchDropdown} className="p-1 rounded-full hover:bg-gray-200">
                        <X size={18} className="text-gray-600" />
                      </button>
                    </div>
                    {searchLoading ? (
                      <div className="px-6 py-8 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3f3cff] mr-3" />
                        <p className="text-base font-medium text-gray-700">Searching products...</p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="max-h-[500px] overflow-y-auto">
                        <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                          <p className="text-lg font-bold text-gray-800">{searchResults.length} products found</p>
                          <p className="text-sm text-gray-600 mt-1">Showing results for "{searchQuery}"</p>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {searchResults.map((p: any, index: number) => (
                            <button
                              key={index}
                              onClick={() => handleSelectProduct(p)}
                              className="w-full text-left p-5 hover:bg-blue-50/50 flex items-center gap-5 transition-all duration-200 group"
                            >
                              <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border-2 border-gray-200 group-hover:border-[#3f3cff]">
                                {p?.images?.[0] ? (
                                  <Image src={p.images[0]} alt={p?.name || "Product"} width={80} height={80}
                                    className="w-20 h-20 object-cover"
                                    onError={(e) => ((e.target as HTMLImageElement).src = "https://via.placeholder.com/80x80?text=No+Image")}
                                  />
                                ) : (
                                  <div className="w-20 h-20 flex items-center justify-center bg-gray-200">
                                    <ShoppingBag className="w-8 h-8 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-[#3f3cff]">{p?.name || "Product"}</p>
                                {p?.price && <p className="text-lg font-bold text-green-600 mt-1">₹{p.price}</p>}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="px-6 py-12 text-center">
                        <Search className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-xl font-bold text-gray-800">No products found</p>
                        <p className="text-gray-500 mt-1">Try different keywords</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* AUTH */}
            {loggedIn ? (
              <>
                <button onClick={handleEnquiryClick} className="md:hidden p-2 relative hover:bg-black/5 rounded-md transition">
                  <FileText size={22} className="text-gray-800" />
                  {enquiryCount > 0 && showEnquiryBadge && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                      {enquiryCount > 9 ? "9+" : enquiryCount}
                    </span>
                  )}
                </button>
                <div className="hidden md:flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleEnquiryClick} className="relative hover:bg-[#f0edff]">
                    <FileText className="w-5 h-5" />
                    <span className="ml-2">My Cart</span>
                    {enquiryCount > 0 && showEnquiryBadge && (
                      <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                        {enquiryCount > 99 ? "99+" : enquiryCount}
                      </Badge>
                    )}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <User className="w-4 h-4 mr-2" />
                        <span className="max-w-32 truncate">{userName || "User"}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-3 py-2">
                        <p className="text-sm font-medium text-gray-900">Signed in as</p>
                        <p className="text-sm text-gray-500 truncate">{userName || "User"}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-4">
                <Link href="/login" className="text-[18px] font-semibold text-black hover:text-[#3f3cff]">Log In</Link>
                <Link href="/register" className="px-4 py-2 rounded-md bg-[#d9d2ff] text-[#3f3cff] font-semibold hover:bg-[#c8beff] text-sm">Register</Link>
              </div>
            )}
          </div>
        </div>

        {/* ========== MOBILE SEARCH ========== */}
        {mobileSearchOpen && (
          <div className="md:hidden pb-3 search-container" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSearchSubmit}>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setShowDropdown(true)}
                  placeholder={isListening ? "Listening..." : "Search products..."}
                  style={inputStyle(true)}
                />
                {/* MOBILE MIC — separate ref */}
                <button
                  ref={mobileMicBtnRef}
                  type="button"
                  onClick={toggleVoiceSearch}
                  aria-label="Voice search"
                  style={micBtnStyle}
                >
                  <Mic size={15} />
                </button>
              </div>
            </form>

            {isListening && (
              <div style={{
                display: "flex", alignItems: "center", gap: "8px",
                marginTop: "8px", padding: "6px 12px",
                backgroundColor: "#fef2f2", border: "1px solid #fecaca",
                borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "#ef4444",
              }}>
                <span style={{
                  width: "8px", height: "8px", borderRadius: "50%",
                  backgroundColor: "#ef4444",
                  animation: "micPulseCircle 1s ease-in-out infinite",
                  flexShrink: 0,
                }} />
                Listening... Speak now
              </div>
            )}

            {showDropdown && !isListening && (
              <div className="absolute left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-[400px] overflow-y-auto z-50">
                <div className="flex justify-between items-center px-3 py-2 border-b bg-gray-50 sticky top-0">
                  <span className="text-xs font-medium text-gray-600">Results</span>
                  <button onClick={closeSearchDropdown} className="p-1 rounded-full hover:bg-gray-200">
                    <X size={16} />
                  </button>
                </div>
                {searchLoading ? (
                  <div className="px-4 py-6 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#3f3cff] mr-2" />
                    <p className="text-sm text-gray-600">Searching...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="px-4 py-3 border-b bg-gray-50">
                      <p className="text-sm font-semibold text-gray-700">{searchResults.length} products found</p>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {searchResults.map((p: any, index: number) => (
                        <button key={index} onClick={() => handleSelectProduct(p)}
                          className="w-full text-left p-3 hover:bg-gray-50 flex items-center gap-3">
                          <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                            {p?.images?.[0] ? (
                              <Image src={p.images[0]} alt={p?.name || "Product"} width={56} height={56}
                                className="w-14 h-14 object-cover"
                                onError={(e) => ((e.target as HTMLImageElement).src = "https://via.placeholder.com/56x56")}
                              />
                            ) : (
                              <div className="w-14 h-14 flex items-center justify-center bg-gray-200">
                                <ShoppingBag className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-gray-800 line-clamp-2">{p?.name || "Product"}</p>
                        </button>
                      ))}
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

        {/* MOBILE MENU DRAWER */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/20" onClick={() => setIsMenuOpen(false)} />
            <div className="absolute top-0 left-0 w-4/5 max-w-sm h-full bg-white shadow-xl animate-slideIn">
              <div className="h-full overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image src="/logo.png" alt="Barber Syndicate" width={50} height={30} className="w-12 h-8" />
                    <span className="text-lg font-bold text-gray-900">Menu</span>
                  </div>
                  <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-md hover:bg-gray-100">
                    <X size={20} className="text-gray-700" />
                  </button>
                </div>
                <div className="px-2 py-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 py-3 px-4 rounded-lg mx-2 mb-1 transition-colors ${
                        pathname === item.href ? "bg-[#f0edff] text-[#3f3cff]" : "hover:bg-gray-50 text-gray-700"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-semibold text-sm">{item.label}</span>
                    </Link>
                  ))}
                </div>
                <div className="px-4 py-6 border-t mt-4">
                  {loggedIn ? (
                    <>
                      <div className="px-3 py-4 bg-gray-50 rounded-lg mb-4">
                        <p className="text-sm font-medium text-gray-900">Welcome back</p>
                        <p className="text-sm text-gray-600 truncate">{userName || "User"}</p>
                      </div>
                      <button
                        onClick={handleEnquiryClick}
                        className="flex items-center justify-between w-full py-3 px-4 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors mb-3"
                      >
                        <div className="flex items-center gap-3">
                          <FileText size={18} className="text-gray-600" />
                          <span className="font-semibold text-sm">My Cart</span>
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
                      <Link href="/login"
                        className="block w-full py-3 text-center rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 text-sm"
                        onClick={() => setIsMenuOpen(false)}>Log In
                      </Link>
                      <Link href="/register"
                        className="block w-full py-3 text-center rounded-lg bg-[#d9d2ff] text-[#3f3cff] font-semibold hover:bg-[#c8beff] text-sm"
                        onClick={() => setIsMenuOpen(false)}>Register
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }

        @keyframes micWave {
          from { transform: scaleY(0.35); opacity: 0.7; }
          to   { transform: scaleY(1.3);  opacity: 1; }
        }

        @keyframes micPulseCircle {
          0%, 100% { transform: scale(1);   opacity: 1; }
          50%       { transform: scale(1.6); opacity: 0.4; }
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