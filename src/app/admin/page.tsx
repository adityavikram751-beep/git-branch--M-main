'use client';

import { useState, useEffect } from 'react';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from './_components/admin-sidebar';

import { UserRequests } from './_components/user-requests';
import { ProductManagement } from './_components/product-management';
import Category from './_components/category';
import UserEnquiry from './_components/UserEnquiry';
import Brands from './_components/brands';
import ContactUs from './_components/contact-us'; // ✅ ADD
import AdminLogin from './admin-login/_components/AdminLogin';

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState('user-requests');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    setIsAuthenticated(!!token);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setActiveSection('user-requests');
  };

  // ✅ LOGOUT HANDLER
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setActiveSection('user-requests');
  };

  // ✅ FIXED RENDER LOGIC
  const renderContent = () => {
    switch (activeSection) {
      case 'user-requests':
        return <UserRequests />;

      case 'products':
        return <ProductManagement />;

      case 'category':
        return <Category />;

      case 'brands':
        return <Brands />;

      case 'user-enquiry':
        return <UserEnquiry />;

      case 'contact-us':                 // ✅ FIX
        return <ContactUs />;

      default:
        return null;                      // ❌ products mat dikhao
    }
  };

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <SidebarProvider>
      <AdminSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onLogout={handleLogout}            // ✅ PASS LOGOUT
      />

      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 p-4">
          {renderContent()}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
