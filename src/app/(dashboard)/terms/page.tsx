"use client";

import React, { JSX, useEffect, useMemo, useState } from "react";
import { X, SlidersHorizontal } from "lucide-react";

type Section = {
  id: string;
  title: string;
  content: (string | JSX.Element)[];
};

export default function TermsAndConditionsPage() {
  const sections: Section[] = useMemo(
    () => [
      {
        id: "acceptance",
        title: "Acceptance of Terms",
        content: [
          "By accessing, browsing, or placing an order through our Site, you confirm that you are at least 18 years old and agree to be legally bound by these Terms, our Privacy Policy, and any other policies referenced herein.",
        ],
      },
      {
        id: "products-services",
        title: "Products and Services",
        content: [
          "Barber Syndicate offers a curated range of professional beauty consumables and accessories. We reserve the right to change or discontinue any product or service at any time without notice.",
          "All product descriptions, images, prices, and availability are subject to change without prior notice. We make every effort to ensure the accuracy of our listings, but we do not guarantee that product details or pricing are always correct or up to date.",
        ],
      },
      {
        id: "ordering-payment",
        title: "Ordering and Payment",
        content: [
          "Orders placed on our website are subject to acceptance and availability.",
          "We reserve the right to cancel or refuse any order at our sole discretion.",
          "All payments must be made through the secure payment methods provided on our Site.",
          "Prices are listed in INR and are inclusive/exclusive of applicable taxes (as indicated).",
        ],
      },
      {
        id: "shipping-delivery",
        title: "Shipping and Delivery",
        content: [
          "Delivery timelines are estimates and may vary based on location and external conditions.",
          "Delays due to courier partners, natural events, or unforeseen issues are not our responsibility.",
          "Customers are responsible for providing accurate shipping details. We are not liable for delays or non-delivery due to incorrect information.",
          "For full shipping details, refer to our Shipping Policy.",
        ],
      },
      {
        id: "returns-refunds",
        title: "Returns and Refunds",
        content: [
          "We accept returns and exchanges in accordance with our Return & Refund Policy. Please read it carefully to understand your rights and responsibilities.",
        ],
      },
      {
        id: "intellectual-property",
        title: "Intellectual Property",
        content: [
          "All content on this website—including but not limited to logos, product images, text, graphics, and layout—is the property of Barber Syndicate and protected under applicable copyright and trademark laws. Unauthorized use, reproduction, or redistribution is prohibited.",
        ],
      },
      {
        id: "user-responsibilities",
        title: "User Responsibilities",
        content: [
          "By using our website, you agree that you will:",
          "• Provide accurate and current information",
          "• Not use the site for any unlawful purpose",
          "• Not engage in any activity that could harm, disrupt, or compromise the integrity of our website or services",
        ],
      },
      {
        id: "limitation-liability",
        title: "Limitation of Liability",
        content: [
          "Barber Syndicate is not liable for any indirect, incidental, special, or consequential damages arising from your use of the Site or purchase of our products. Our liability is limited to the total amount paid by you for the product or service.",
        ],
      },
      {
        id: "indemnification",
        title: "Indemnification",
        content: [
          "You agree to indemnify, defend, and hold harmless Barber Syndicate, its employees, directors, and affiliates from any claims, losses, liabilities, or expenses arising out of your violation of these Terms or misuse of our Site.",
        ],
      },
      {
        id: "governing-law",
        title: "Governing Law",
        content: [
          "The laws of India govern these Terms and Conditions, and any disputes shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka.",
        ],
      },
      {
        id: "modifications",
        title: "Modifications to Terms",
        content: [
          "We reserve the right to update or modify these Terms at any time without prior notice. Any changes will be effective upon posting on this page. Continued use of the website constitutes your acceptance of the revised Terms.",
        ],
      },
      {
        id: "contact-us",
        title: "Contact Us",
        content: [
          "If you have any questions regarding these Terms and Conditions, please contact us at:",
          <div key="contact" className="mt-2">
            <strong>Barber Syndicate</strong><br />
            Website: <a href="https://3846.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">https://3846.in/</a><br />
            Email: <a href="mailto:order@3846.in" className="text-blue-600 underline hover:text-blue-800">order@3846.in</a><br />
            Phone: <a href="tel:+919818396703" className="text-blue-600 underline hover:text-blue-800">+91 9818396703</a>
          </div>,
        ],
      },
    ],
    []
  );

  const [activeId, setActiveId] = useState(sections[0]?.id || "");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const headerOffset = 140;
    const elementPosition = el.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0)
          );

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        root: null,
        threshold: [0.2, 0.35, 0.5, 0.7],
      }
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  const SidebarContent = () => (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">
          Quick Navigation
        </h3>
      </div>

      <div className="max-h-[70vh] overflow-y-auto p-6">
        <ul className="space-y-3">
          {sections.map((item, index) => {
            const isActive = activeId === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    scrollToSection(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full text-left text-sm md:text-base transition-all ${
                    isActive
                      ? "text-blue-600 font-semibold"
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  <span className="mr-2">{index + 1}.</span>
                  {item.title}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFF7F0]">
      {/* Mobile navigation button */}
      <div className="lg:hidden fixed top-[56px] left-0 right-0 z-40 bg-[#FFF7F0] pt-4 pb-3">
        <div className="max-w-6xl mx-auto px-4">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-red-500" />
              <span className="font-semibold text-gray-800">Navigation</span>
            </div>
            <span className="text-xs text-gray-500"></span>
          </button>
        </div>
      </div>

      {/* Mobile sidebar drawer */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />

          <div className="fixed top-0 left-0 h-full w-[85%] max-w-sm bg-white z-50 lg:hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
              <h2 className="font-bold text-gray-900">Quick Navigation</h2>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-[calc(100%-64px)] overflow-y-auto p-4">
              <SidebarContent />
            </div>
          </div>
        </>
      )}

      <div className="max-w-6xl mx-auto px-4 py-20 pt-32 lg:pt-20">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold">
            <span className="text-red-500">Terms and </span>{" "}
            <span className="text-amber-500">Conditions</span>
          </h1>
          <p className="text-gray-600 mt-2 max-w-3xl">
            Welcome to Barber Syndicate! By accessing or using our website{" "}
            <a href="https://3846.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
              https://3846.in/
            </a>{" "}
            (“Site”), you agree to comply with and be bound by the following Terms and Conditions. Please read them carefully before using our services.
          </p>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Desktop Sidebar */}
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-[90px]">
              <SidebarContent />
            </div>
          </aside>

          {/* Content */}
          <main className="lg:col-span-8 space-y-10">
            {sections.map((item, index) => (
              <section
                key={item.id}
                id={item.id}
                className="scroll-mt-[160px]"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {index + 1}. {item.title}
                </h2>

                <div className="space-y-4 text-gray-600 leading-relaxed">
                  {item.content.map((p, i) => (
                    <div key={i}>{p}</div>
                  ))}
                </div>
              </section>
            ))}
          </main>
        </div>
      </div>
    </div>
  );
}