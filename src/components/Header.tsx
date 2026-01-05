'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, LogOut, FileText, User, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

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
            setEnquiryCount(data.data.length);
          } else {
            setEnquiryCount(0);
          }
        })
        .catch((err) => {
          console.error('Error fetching enquiry count:', err);
          setEnquiryCount(0);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoggedIn(false);
      setUserName('');
      setEnquiryCount(0);
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setLoggedIn(false);
    setUserName('');
    setEnquiryCount(0);
    setIsMenuOpen(false);
    router.push('/login');
  };

  const handleEnquiryClick = () => {
    setIsMenuOpen(false);
   router.push('/inquiry');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
      <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
  <div className="relative rounded-lg flex items-center justify-center">
    <Image
      src="/logo.png"
      alt="Logo"
      width={70}
      height={50}
      className="object-cover rounded-lg"
    />
  </div>
  <span className="text-xl font-bold text-gray-900">Barber Syndicate</span>
</Link>
          

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
            >
              Home
            </Link>
            <Link 
              href="/product" 
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
            >
              Products
            </Link>

            
               <Link 
              href="/brand" 
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
            >
              Brands
            </Link>

               <Link 
              href="/category" 
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
            >
              Categorys
            </Link>
            <Link 
              href="/contact" 
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
            >
              Contact
            </Link>

          </nav>

          {/* Desktop Auth & Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {loggedIn ? (
              <>
                {/* Enquiry Count Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEnquiryClick}
                  className="relative hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                >
                  <FileText className="w-5 h-5" />
                  <span className="ml-2 hidden sm:inline">My Enquiries</span>
                  {enquiryCount > 0 && (
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
                    <Button variant="ghost" size="sm" className="hover:bg-gray-100 transition-colors duration-200">
                      <User className="w-4 h-4 mr-2" />
                      <span className="max-w-32 truncate">{userName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium text-gray-900">Signed in as</p>
                      <p className="text-sm text-gray-500 truncate">{userName}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleEnquiryClick} className="cursor-pointer">
                      <FileText className="w-4 h-4 mr-2" />
                      My Enquiries
                      {enquiryCount > 0 && (
                        <Badge variant="secondary" className="ml-auto">
                          {enquiryCount}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Mobile Navigation Links */}
            <div className="space-y-2">
              <Link 
                href="/" 
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
              >
                Home
              </Link>
              <Link 
                href="/product" 
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
              >
                Products
              </Link>
              <Link 
                href="/contact" 
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
              >
                Contact
              </Link>
            </div>

            {/* Mobile Auth Section */}
            <div className="border-t pt-4">
              {loggedIn ? (
                <div className="space-y-2">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">Welcome, {userName}</p>
                  </div>
                  
                  {/* Mobile Enquiry Button */}
                  
                  <button
                    onClick={handleEnquiryClick}
                    className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
                  >
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      My Enquiries
                    </div>
                    {enquiryCount > 0 && (
                      <Badge variant="destructive" className="bg-red-500">
                        {enquiryCount > 99 ? '99+' : enquiryCount}
                      </Badge>
                    )}
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button variant="ghost" size="sm" asChild className="w-full justify-start">
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button size="sm" asChild className="w-full">
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                      Register
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}