"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const navClass = (href: string) =>
    `text-[18px] font-semibold tracking-wide ${
      pathname === href
        ? "text-[#3f3cff] underline underline-offset-4"
        : "text-black hover:text-[#3f3cff]"
    }`;

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#fff9f2] border-b">
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-16 flex items-center justify-between">

          {/* LOGO */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Barber Syndicate"
              width={92}
              height={52}
              priority
            />
          </Link>

          {/* CENTER MENU */}
          <nav className="flex items-center gap-12">
            <Link href="/" className={navClass("/")}>
              Home
            </Link>
            <Link href="/product" className={navClass("/product")}>
              Products
            </Link>
            <Link href="/contact" className={navClass("/contact")}>
              Contacts
            </Link>
            <Link href="/brand" className={navClass("/brand")}>
              Brands
            </Link>
            <Link href="/category" className={navClass("/category")}>
              Category
            </Link>
          </nav>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-5">
            <Link
              href="/login"
              className="text-[18px] font-semibold text-black hover:text-[#3f3cff]"
            >
              Log In
            </Link>

            <Link
              href="/register"
              className="px-5 py-1.5 rounded-md bg-[#d9d2ff] text-[#3f3cff] font-semibold hover:bg-[#c8beff] transition"
            >
              Register
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}
