'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, LogOut, FileText, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [enquiryCount, setEnquiryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showEnquiryBadge, setShowEnquiryBadge] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    // Check if user has already seen the enquiries
    const hasSeenEnquiries = localStorage.getItem('hasSeenEnquiries') === 'true';

    if (token && userId) {
      // Fetch user data
      fetch(`https://barber-syndicate.vercel.app/api/v1/user/single-user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.user?.name) {
            setLoggedIn(true);
            setUserName(data.user.name);
          } else {
            setLoggedIn(false);
            setUserName('');
          }
        })
        .catch((err) => {
          console.error('Error fetching user data:', err);
          setLoggedIn(false);
          setUserName('');
        });

      // Fetch enquiry count
      fetch(`https://barber-syndicate.vercel.app/api/v1/enquiry/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && data?.data) {
            const count = data.data.length;
            setEnquiryCount(count);
            
            // Agar user ne abhi tak enquiries nahi dekhi hain aur count > 0 hai
            if (count > 0 && !hasSeenEnquiries) {
              setShowEnquiryBadge(true);
            } else {
              setShowEnquiryBadge(false);
            }
          } else {
            setEnquiryCount(0);
            setShowEnquiryBadge(false);
          }
        })
        .catch((err) => {
          console.error('Error fetching enquiry count:', err);
          setEnquiryCount(0);
          setShowEnquiryBadge(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoggedIn(false);
      setUserName('');
      setEnquiryCount(0);
      setShowEnquiryBadge(false);
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('hasSeenEnquiries');
    setLoggedIn(false);
    setUserName('');
    setEnquiryCount(0);
    setShowEnquiryBadge(false);
    setIsMenuOpen(false);
    router.push('/login');
  };

  const handleEnquiryClick = () => {
    setIsMenuOpen(false);
    
    // Mark as seen when user clicks on enquiries
    localStorage.setItem('hasSeenEnquiries', 'true');
    setShowEnquiryBadge(false);
    
    router.push('/inquiry');
  };

  const navClass = (href: string) =>
    `text-sm md:text-[18px] font-semibold tracking-wide ${
      pathname === href
        ? "text-[#3f3cff] underline underline-offset-4"
        : "text-black hover:text-[#3f3cff]"
    }`;

  // Navigation items
  const navItems = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/product", label: "Products", icon: "🛍️" },
    { href: "/brand", label: "Brands", icon: "🏢" },
    { href: "/category", label: "Category", icon: "📁" },
    { href: "/contact", label: "Contact Us", icon: "📞" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#fff9f2] border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-14 md:h-16 flex items-center justify-between">
          
          {/* Logo and Mobile Menu Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100 transition"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X size={22} className="text-gray-700" />
              ) : (
                <Menu size={22} className="text-gray-700" />
              )}
            </button>

            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <Image
                src="/logo.png"
                alt="Barber Syndicate"
                width={60}
                height={34}
                className="w-12 h-7 md:w-16 md:h-9"
                priority
              />
              <span className="ml-2 text-lg font-bold text-gray-900 hidden sm:inline">
                Barber Syndicate
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-10">
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

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 md:gap-4">
            {loggedIn ? (
              <>
                {/* MOBILE: Only Enquiry Icon (User icon removed) */}
                <button
                  onClick={handleEnquiryClick}
                  className="md:hidden p-2 relative hover:bg-gray-100 rounded-md transition"
                  aria-label="My Enquiries"
                >
                  <FileText size={22} className="text-gray-700" />
                  {enquiryCount > 0 && showEnquiryBadge && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                      {enquiryCount > 9 ? '9+' : enquiryCount}
                    </span>
                  )}
                </button>

                {/* DESKTOP: Full User Menu */}
                <div className="hidden md:flex items-center gap-4">
                  {/* Enquiry Button with Badge */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEnquiryClick}
                    className="relative hover:bg-[#f0edff] hover:text-[#3f3cff] transition-colors"
                  >
                    <FileText className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="ml-2">Enquiries</span>
                    {enquiryCount > 0 && showEnquiryBadge && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-600"
                      >
                        {enquiryCount > 99 ? '99+' : enquiryCount}
                      </Badge>
                    )}
                  </Button>

                  {/* User Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="hover:bg-gray-100 transition-colors">
                        <User className="w-4 h-4 mr-2" />
                        <span className="max-w-32 truncate">{userName}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-3 py-2">
                        <p className="text-sm font-medium text-gray-900">Signed in as</p>
                        <p className="text-sm text-gray-500 truncate">{userName}</p>
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
              <>
                {/* MOBILE: No icons for non-logged in users */}
                
                {/* DESKTOP: Login/Register */}
                <div className="hidden md:flex items-center gap-4">
                  <Link
                    href="/login"
                    className="text-[16px] font-semibold text-black hover:text-[#3f3cff] transition-colors"
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
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu - Full screen overlay */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/20"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Menu Panel */}
            <div className="absolute top-0 left-0 w-4/5 max-w-sm h-full bg-white shadow-xl animate-slideIn">
              <div className="h-full overflow-y-auto">
                {/* Menu Header */}
                <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/logo.png"
                      alt="Barber Syndicate"
                      width={40}
                      height={24}
                      className="w-10 h-6"
                    />
                    <span className="text-lg font-bold text-gray-900">Menu</span>
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
                      {/* User Info */}
                      <div className="px-3 py-4 bg-gray-50 rounded-lg mb-4">
                        <p className="text-sm font-medium text-gray-900">Welcome back</p>
                        <p className="text-sm text-gray-600 truncate">{userName}</p>
                      </div>

                      {/* My Enquiries Button */}
                      <button
                        onClick={handleEnquiryClick}
                        className="flex items-center justify-between w-full py-3 px-4 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors mb-3"
                      >
                        <div className="flex items-center gap-3">
                          <FileText size={18} className="text-gray-600" />
                          <span className="font-semibold text-sm">My Enquiries</span>
                        </div>
                        {enquiryCount > 0 && showEnquiryBadge && (
                          <span className="h-6 w-6 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                            {enquiryCount}
                          </span>
                        )}
                      </button>

                      {/* Logout Button */}
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
      `}</style>
    </header>
  );
}