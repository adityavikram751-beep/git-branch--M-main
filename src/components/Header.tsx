"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingBag, User } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navClass = (href: string) =>
    `text-sm md:text-[18px] font-semibold tracking-wide ${
      pathname === href
        ? "text-[#3f3cff] underline underline-offset-4"
        : "text-black hover:text-[#3f3cff]"
    }`;

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#fff9f2] border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* REDUCED HEADER HEIGHT */}
        <div className="h-12 md:h-16 flex items-center justify-between">

          {/* LOGO AND MOBILE MENU BUTTON */}
          <div className="flex items-center gap-3">
            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-1.5 rounded-md hover:bg-gray-100 transition"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X size={20} className="text-gray-700" />
              ) : (
                <Menu size={20} className="text-gray-700" />
              )}
            </button>

            {/* LOGO - REDUCED SIZE */}
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Barber Syndicate"
                width={60}
                height={34}
                className="w-12 h-7 md:w-16 md:h-9"
                priority
              />
            </Link>
          </div>

          {/* CENTER MENU - DESKTOP */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-10">
            <Link href="/" className={navClass("/")}>
              Home
            </Link>
            <Link href="/product" className={navClass("/product")}>
              Products
            </Link>
            <Link href="/brand" className={navClass("/brand")}>
              Brands
            </Link>
            <Link href="/category" className={navClass("/category")}>
              Category
            </Link>
            <Link href="/contact" className={navClass("/contact")}>
              Contacts
            </Link>
          </nav>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* MOBILE CART ICON */}
            <Link
              href="/cart"
              className="md:hidden p-1.5 rounded-md hover:bg-gray-100 transition"
              aria-label="Shopping Cart"
            >
              <ShoppingBag size={18} className="text-gray-700" />
            </Link>

            {/* MOBILE USER ICON */}
            <Link
              href="/login"
              className="md:hidden p-1.5 rounded-md hover:bg-gray-100 transition"
              aria-label="Login"
            >
              <User size={18} className="text-gray-700" />
            </Link>

            {/* DESKTOP LOGIN/REGISTER */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/login"
                className="text-[16px] font-semibold text-black hover:text-[#3f3cff] transition-colors"
              >
                Log In
              </Link>

              <Link
                href="/register"
                className="px-4 py-1.5 rounded-md bg-[#d9d2ff] text-[#3f3cff] font-semibold hover:bg-[#c8beff] transition-colors text-[16px]"
              >
                Register
              </Link>
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t shadow-lg animate-slideDown">
            <div className="px-4 py-4 space-y-2">
              <Link
                href="/"
                className={`block py-2 px-4 rounded-lg transition-colors ${
                  pathname === "/" 
                    ? "bg-[#f0edff] text-[#3f3cff]" 
                    : "hover:bg-gray-50 text-gray-700"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <span className="text-base">🏠</span>
                  </div>
                  <span className="font-semibold text-sm">Home</span>
                </div>
              </Link>

              <Link
                href="/product"
                className={`block py-2 px-4 rounded-lg transition-colors ${
                  pathname === "/product" 
                    ? "bg-[#f0edff] text-[#3f3cff]" 
                    : "hover:bg-gray-50 text-gray-700"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <span className="text-base">🛍️</span>
                  </div>
                  <span className="font-semibold text-sm">Products</span>
                </div>
              </Link>

              <Link
                href="/brand"
                className={`block py-2 px-4 rounded-lg transition-colors ${
                  pathname === "/brand" 
                    ? "bg-[#f0edff] text-[#3f3cff]" 
                    : "hover:bg-gray-50 text-gray-700"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <span className="text-base">🏢</span>
                  </div>
                  <span className="font-semibold text-sm">Brands</span>
                </div>
              </Link>

              <Link
                href="/category"
                className={`block py-2 px-4 rounded-lg transition-colors ${
                  pathname === "/category" 
                    ? "bg-[#f0edff] text-[#3f3cff]" 
                    : "hover:bg-gray-50 text-gray-700"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <span className="text-base">📁</span>
                  </div>
                  <span className="font-semibold text-sm">Category</span>
                </div>
              </Link>

              <Link
                href="/contact"
                className={`block py-2 px-4 rounded-lg transition-colors ${
                  pathname === "/contact" 
                    ? "bg-[#f0edff] text-[#3f3cff]" 
                    : "hover:bg-gray-50 text-gray-700"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <span className="text-base">📞</span>
                  </div>
                  <span className="font-semibold text-sm">Contacts</span>
                </div>
              </Link>

              {/* MOBILE LOGIN/REGISTER BUTTONS */}
              <div className="pt-3 mt-3 border-t space-y-2">
                <Link
                  href="/login"
                  className="block w-full py-2 text-center rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="block w-full py-2 text-center rounded-lg bg-[#d9d2ff] text-[#3f3cff] font-semibold hover:bg-[#c8beff] transition-colors text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS FOR ANIMATION */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </header>
  );
}