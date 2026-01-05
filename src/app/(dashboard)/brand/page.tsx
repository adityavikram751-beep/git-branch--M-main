'use client';

import React, { useEffect, useState } from 'react';

interface Brand {
  _id: string;
  brand: string;
}

export default function BrandPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://barber-syndicate.vercel.app/api/v1/brands/getall')
      .then(res => res.json())
      .then(data => {
        if (data?.success) {
          setBrands(data.data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-6">Loading brands...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Brands</h1>

      {brands.length === 0 ? (
        <p>No brands found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {brands.map((brand) => (
            <div
              key={brand._id}
              className="border rounded-lg p-4 hover:shadow-md transition"
            >
              <h2 className="font-semibold text-lg">{brand.brand}</h2>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
