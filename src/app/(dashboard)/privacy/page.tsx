"use client";

import React, { JSX, useEffect, useMemo, useState } from "react";
import { X, SlidersHorizontal } from "lucide-react";

type Section = {
  id: string;
  title: string;
  content: (string | JSX.Element)[];
};

export default function PrivacyPolicyPage() {
  const sections: Section[] = useMemo(
    () => [
      {
        id: "info-collect",
        title: "Information We Collect",
        content: [
          "When you visit or make a purchase on our site, we may collect the following types of information:",
          <div key="personal" className="mt-2">
            <strong>a. Personal Information</strong>
            <ul className="list-disc ml-6 mt-1 space-y-0.5">
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Billing and shipping address</li>
              <li>Payment information (processed securely via payment gateways)</li>
            </ul>
          </div>,
          <div key="nonpersonal" className="mt-2">
            <strong>b. Non-Personal Information</strong>
            <ul className="list-disc ml-6 mt-1 space-y-0.5">
              <li>Browser type</li>
              <li>Device type</li>
              <li>IP address</li>
              <li>Pages visited and time spent</li>
            </ul>
          </div>,
        ],
      },
      {
        id: "how-we-use",
        title: "How We Use Your Information",
        content: [
          "We use the information collected for:",
          <ul key="uses" className="list-disc ml-6 mt-1 space-y-0.5">
            <li>Processing and fulfilling your orders</li>
            <li>Providing customer support</li>
            <li>Sending order updates and promotional offers (with consent)</li>
            <li>Improving our website and user experience</li>
            <li>Ensuring site security and preventing fraud</li>
          </ul>,
        ],
      },
      {
        id: "cookies",
        title: "Cookies",
        content: [
          "We use cookies and similar technologies to enhance your browsing experience, understand user behavior, and personalize content. You can manage cookie preferences through your browser settings.",
        ],
      },
      {
        id: "data-sharing",
        title: "Data Sharing",
        content: [
          "We do not sell, rent, or trade your personal data. However, we may share your data with:",
          <ul key="sharing" className="list-disc ml-6 mt-1 space-y-0.5">
            <li>Trusted third-party service providers (e.g., shipping partners, payment gateways)</li>
            <li>Legal authorities, when required by law or to protect our rights</li>
          </ul>,
        ],
      },
      {
        id: "data-security",
        title: "Data Security",
        content: [
          "We implement robust security measures, including SSL encryption and secure servers, to protect your data. However, no online transmission is 100% secure; use the website at your own risk.",
        ],
      },
      {
        id: "third-party-links",
        title: "Third-Party Links",
        content: [
          "Our website may contain links to other sites. We are not responsible for the privacy practices or content of third-party websites.",
        ],
      },
      {
        id: "your-rights",
        title: "Your Rights",
        content: [
          "You may:",
          <ul key="rights" className="list-disc ml-6 mt-1 space-y-0.5">
            <li>Request access to your personal data</li>
            <li>Ask us to correct or delete your information</li>
            <li>Opt out of marketing communications at any time</li>
          </ul>,
          "To exercise your rights, please contact us at order@3846.in",
        ],
      },
      {
        id: "children-privacy",
        title: "Children's Privacy",
        content: [
          "Our services are not intended for children under the age of 13. We do not knowingly collect personal data from minors.",
        ],
      },
      {
        id: "policy-changes",
        title: "Changes to This Policy",
        content: [
          "We may update this Privacy Policy from time to time. Any changes will be posted on this page with a revised effective date.",
        ],
      },
      {
        id: "contact-us",
        title: "Contact Us",
        content: [
          "If you have any questions or concerns regarding this Privacy Policy, please reach out to:",
          <div key="contact" className="mt-2">
            <strong>Barber Syndicate</strong><br />
            Website: <a href="https://3846.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://3846.in/</a><br />
            Email: <a href="mailto:order@3846.in" className="text-blue-600 underline">order@3846.in</a><br />
            Phone: <a href="tel:+919818396703" className="text-blue-600 underline">+91 9818396703</a>
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
    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { root: null, threshold: [0.2, 0.35, 0.5, 0.7] }
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
        <h3 className="text-xl font-semibold text-gray-900">Quick Navigation</h3>
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
                      ? ""
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
            <span className="text-red-500">Privacy </span>
            <span className="text-amber-500">Policy</span>
          </h1>
          <p className="text-gray-600 mt-2 max-w-3xl">
            Barber Syndicate (“we,” “our,” or “us”) values your privacy and is committed to protecting your personal information. This Privacy Policy outlines how we collect, use, and protect the data you provide when you use our website{" "}
            <a href="https://3846.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              https://3846.in/
            </a>.
          </p>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-[90px]">
              <SidebarContent />
            </div>
          </aside>

          <main className="lg:col-span-8 space-y-10">
            {sections.map((item, index) => (
              <section key={item.id} id={item.id} className="scroll-mt-[160px]">
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