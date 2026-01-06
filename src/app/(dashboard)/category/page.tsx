'use client';

import React, { useEffect, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Search,
  Layers,
  Tag,
} from 'lucide-react';

interface Category {
  _id: string;
  categoryname: string;
  catImg: string;
}

interface SubCategory {
  _id: string;
  subCatName: string;
  catId: string;
}

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // CATEGORY API
  useEffect(() => {
    fetch('https://barber-syndicate.vercel.app/api/v1/category')
      .then(res => res.json())
      .then(data => setCategories(data.data || []));
  }, []);

  // SUB CATEGORY API
  const loadSubCategories = async (catId: string) => {
    const res = await fetch(
      'https://barber-syndicate.vercel.app/api/v1/subcategory/getSubCat'
    );
    const data = await res.json();
    const filtered = data.data.filter((s: SubCategory) => s.catId === catId);
    setSubCategories(filtered);
  };

  const toggleCategory = (catId: string) => {
    if (openCategory === catId) {
      setOpenCategory(null);
    } else {
      setOpenCategory(catId);
      setSelectedCategory(catId);
      loadSubCategories(catId);
    }
  };

  return (
    <div className="flex gap-6 p-6 bg-[#FFF6EF] min-h-screen">

      {/* LEFT SIDEBAR */}
      <aside className="w-[280px] bg-[#FFEFE6] rounded-xl p-4">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            placeholder="Search Product..."
            className="w-full pl-9 pr-3 py-2 rounded-md border text-sm"
          />
        </div>

        <h2 className="font-semibold mb-3">Categories</h2>

        <ul className="space-y-2">
          {categories.map(cat => (
            <li key={cat._id}>
              {/* CATEGORY */}
              <button
                onClick={() => toggleCategory(cat._id)}
                className="w-full flex items-center justify-between p-2 rounded-md hover:bg-white transition"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={cat.catImg}
                    alt={cat.categoryname}
                    className="w-6 h-6 rounded"
                  />
                  <span className="text-sm capitalize">
                    {cat.categoryname}
                  </span>
                </div>

                {openCategory === cat._id ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>

              {/* SUB CATEGORY */}
              {openCategory === cat._id && (
                <ul className="ml-8 mt-2 space-y-1">
                  {subCategories.length > 0 ? (
                    subCategories.map(sub => (
                      <li
                        key={sub._id}
                        className="flex items-center gap-2 text-sm text-gray-700 hover:text-black cursor-pointer"
                      >
                        <Tag size={14} />
                        {sub.subCatName}
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-gray-400">
                      No sub categories
                    </li>
                  )}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </aside>

      {/* RIGHT PRODUCTS */}
      <main className="flex-1 bg-[#FFEFE6] rounded-xl p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

          {/* CARD */}
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              className="bg-white rounded-xl shadow hover:shadow-md transition"
            >
              <div className="relative">
                <img
                  src={
                    i % 2 === 0
                      ? 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571'
                      : 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9'
                  }
                  className="rounded-t-xl h-44 w-full object-cover"
                  alt="product"
                />
                <span className="absolute top-2 right-2 bg-pink-500 text-white text-xs px-2 py-1 rounded">
                  Featured
                </span>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-sm mb-1">
                  Facewash
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  D-TAN Scrub (200g) – Gently exfoliates dead skin cells.
                </p>

                <button className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded flex items-center gap-1">
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
