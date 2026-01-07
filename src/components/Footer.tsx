"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react';

interface ContactData {
  phone: string;
  email: string;
  address: string;
}

export default function Footer() {
  const [contactInfo, setContactInfo] = useState<ContactData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const response = await fetch('https://barber-syndicate.vercel.app/api/v1/admin/contact');
        const result = await response.json();
        if (result.data) {
          setContactInfo(result.data);
        }
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContactData();
  }, []);

  return (
    <footer className="bg-[#B30000] text-white">
      {/* Main Container - py-12 for good height */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
          
          {/* 1. Logo Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Image src="/logo.png" alt="Logo" width={80} height={45} className="object-contain" />
              <h2 className="text-2xl font-bold text-[#FFD700] tracking-tight">Barber Syndicate</h2>
            </div>
            <p className="text-[14px] opacity-90 leading-relaxed max-w-sm">
              Your trusted partner for wholesale cosmetics. We provide premium quality beauty products with competitive bulk pricing and exceptional customer service.
            </p>
            
            {/* Icons Section - Fixed Alignment */}
            <div className="flex items-center gap-6 pt-2">
              <a href="#" className="hover:text-[#FFD700] transition-all duration-300">
                <Facebook size={24} strokeWidth={1.5} />
              </a>
              <a href="#" className="hover:text-[#FFD700] transition-all duration-300">
                <Instagram size={24} strokeWidth={1.5} />
              </a>
              <a href="#" className="hover:text-[#FFD700] transition-all duration-300 flex items-center">
                <span className="text-2xl font-bold italic leading-none">X</span>
              </a>
            </div>
          </div>

          {/* 2. Quick Links */}
          <div className="md:pl-16">
            <h3 className="text-xl font-bold mb-6 text-[#FFD700]">Barber Syndicate</h3>
            <ul className="space-y-4 text-[15px]">
              <li><Link href="/register" className="hover:text-[#FFD700] transition-colors">Become a partner</Link></li>
              <li><Link href="/terms" className="hover:text-[#FFD700] transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-[#FFD700] transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* 3. Contact Us - API Data */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-6 text-[#FFD700]">Contact Us</h3>
            <div className="space-y-5 text-[14px]">
              {loading ? (
                <div className="space-y-3">
                  <div className="h-4 w-full bg-white/20 animate-pulse rounded"></div>
                  <div className="h-4 w-2/3 bg-white/20 animate-pulse rounded"></div>
                </div>
              ) : (
                <>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactInfo?.address || "")}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 group"
                  >
                    <MapPin size={22} className="text-[#FFD700] shrink-0" />
                    <span className="group-hover:text-[#FFD700] transition-colors leading-snug">
                      {contactInfo?.address || "Nawad pillar no 745 delhi"}
                    </span>
                  </a>
                  
                  <a href={`tel:${contactInfo?.phone}`} className="flex items-center gap-4 group">
                    <Phone size={20} className="text-[#FFD700] shrink-0" />
                    <span className="group-hover:text-[#FFD700] transition-colors">
                      {contactInfo?.phone || "0990900900"}
                    </span>
                  </a>

                  <a href={`mailto:${contactInfo?.email}`} className="flex items-center gap-4 group">
                    <Mail size={20} className="text-[#FFD700] shrink-0" />
                    <span className="group-hover:text-[#FFD700] transition-colors">
                      {contactInfo?.email || "aditya@gmail.com"}
                    </span>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FULL WIDTH BRIGHT WHITE LINE */}
      <div className="w-full border-t-[1.5px] border-white shadow-md"></div>

      {/* Bottom Footer - py-8 for more height */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[13px] font-bold">
          <p className="tracking-wide">© 2025 Barber Syndicate. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-6">
            <span className="bg-white/10 px-4 py-1.5 rounded-md border border-white/20">GST: 07AABCU9603R1ZX</span>
            <span className="bg-white/10 px-4 py-1.5 rounded-md border border-white/20">Wholesale License: WL/MH/2024/001</span>
          </div>
        </div>
      </div>
    </footer>
  );
}