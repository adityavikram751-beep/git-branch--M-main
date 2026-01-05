import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-red-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Image
                src="/logo.png"
                alt="Barber Syndicate Logo"
                width={80}
                height={50}
              />
              <span className="text-xl font-bold text-yellow-300">Barber Syndicate</span>
            </div>
            <p className="text-yellow-100 text-sm leading-relaxed">
              Your trusted partner for wholesale cosmetics. We provide premium quality beauty products 
              with competitive bulk pricing and exceptional customer service.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-yellow-200 hover:text-yellow-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-yellow-200 hover:text-yellow-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-yellow-200 hover:text-yellow-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-300">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-yellow-100 hover:text-white transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/product" className="text-yellow-100 hover:text-white transition-colors text-sm">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-yellow-100 hover:text-white transition-colors text-sm">
                  Become a Partner
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-yellow-100 hover:text-white transition-colors text-sm">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-yellow-100 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-300">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-100">
                  <p>123 Business District,</p>
                  <p>3846 Main Market Mori Gate Delhi</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                <span className="text-sm text-yellow-100">+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                <span className="text-sm text-yellow-100">info@BarberSyndicate.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-yellow-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-yellow-200">
              © 2025 Barber Syndicate. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm text-yellow-200">
              <span>GST: 07AABCU9603R1ZX</span>
              <span>•</span>
              <span>Wholesale License: WL/MH/2024/001</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
