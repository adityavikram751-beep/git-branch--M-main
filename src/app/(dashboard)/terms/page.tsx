"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X, SlidersHorizontal } from "lucide-react";

type Section = {
  id: string;
  title: string;
  content: string[];
};

export default function PrivacyPolicyPage() {
  const sections: Section[] = useMemo(
    () => [
      {
        id: "collect-info",
        title: "What information do we collect from you?",
        content: [
          "We may collect personal information such as your name, email address, phone number, and delivery address when you register or place an order.",
          "We also collect information related to your usage of our website such as pages visited, time spent, and device/browser details.",
          "This information helps us provide better services and improve your overall experience.",
        ],
      },
      {
        id: "use-info",
        title: "How we use information we collect?",
        content: [
          "We use the collected information to process orders, provide customer support, and deliver products/services efficiently.",
          "We may also use your information to send important updates, offers, or service notifications.",
          "We do not sell your personal data to third parties.",
        ],
      },
      {
        id: "secure-info",
        title: "How we secure your information?",
        content: [
          "We implement standard security measures to protect your personal information.",
          "Access to sensitive information is restricted and protected by authentication and encryption where applicable.",
          "However, no method of transmission over the internet is 100% secure, so we cannot guarantee absolute security.",
        ],
      },
      {
        id: "retain-info",
        title: "How long we keep your information?",
        content: [
          "We retain your personal information only for as long as necessary to provide services and comply with legal obligations.",
          "If you request deletion of your data, we will remove it unless we are required to keep it for legal reasons.",
        ],
      },
      {
        id: "cookies",
        title: "Cookies and other tracking Tools.",
        content: [
          "We may use cookies to improve your browsing experience and analyze site traffic.",
          "Cookies help us remember your preferences and understand how users interact with our website.",
          "You can disable cookies in your browser settings, but some features may not work properly.",
        ],
      },
    ],
    []
  );

  const [activeId, setActiveId] = useState(sections[0]?.id || "");

  // ✅ Mobile Sidebar Drawer open/close
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // ✅ Smooth scroll with header offset (Navbar fixed issue solved)
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

  // ✅ Active section tracking (scroll pe active highlight)
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

  // ✅ Sidebar UI reusable
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
                    // ✅ mobile me click ke baad sidebar close
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
      {/* ✅ MOBILE FIXED NAV BUTTON */}
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

      {/* ✅ MOBILE SIDEBAR DRAWER */}
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
            <span className="text-amber-500">Condition</span>
          </h1>
          <p className="text-gray-600 mt-2 max-w-3xl">
            Your privacy is important to us. This policy outlines how we collect,
            use, and protect your personal information when you use our services.
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
                    <p key={i}>{p}</p>
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
