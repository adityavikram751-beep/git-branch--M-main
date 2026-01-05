'use client';

import React from 'react';

const categories = [
  'Hair Care',
  'Beard Care',
  'Skin Care',
  'Styling Products',
  'Tools & Accessories',
];

export default function CategoryPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Categories</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((cat, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 hover:shadow-md transition"
          >
            <h2 className="font-semibold text-lg">{cat}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
