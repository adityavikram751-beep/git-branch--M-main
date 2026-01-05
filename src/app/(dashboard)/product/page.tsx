
import { Suspense } from "react";
import ProductCatalogClient from "./_component/ProductCatalogClient";

interface ApiProduct {
  _id: string;
  name: string;
  price: number;
  categoryId: string;
  brandId?: string;
  brand?: string;
  description: string;
  qunatity: string;
  isFeature: boolean;
  carter: number;
  images: string[];
  quantityOptions: { type: string }[];
}

interface ApiResponse {
  success: boolean;
  products: ApiProduct[];
  currentPage: number;
  totalPages: number;
  totalResults: number;
  message?: string;
}

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

const PRODUCT_API_URL =
  "https://barber-syndicate.vercel.app/api/v1/product";
const CATEGORY_API_URL =
  "https://barber-syndicate.vercel.app/api/v1/category";
const BRAND_API_URL =
  "https://barber-syndicate.vercel.app/api/v1/brands";

async function fetchInitialProducts(page = 1): Promise<ApiResponse> {
  try {
    const response = await fetch(`${PRODUCT_API_URL}?page=${page}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    const data: ApiResponse = await response.json();
    // Map products to include quantityOptions
    const mappedProducts = data.products.map((product: any) => ({
      ...product,
      quantityOptions: product.quantity || [],
    }));
    return { ...data, products: mappedProducts };
  } catch (err) {
    return {
      success: false,
      products: [],
      currentPage: 1,
      totalPages: 1,
      totalResults: 0,
      message: "Failed to fetch products",
    };
  }
}

async function fetchCategories(): Promise<Category[]> {
  try {
    const response = await fetch(CATEGORY_API_URL, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    const data = await response.json();
    if (data.success && Array.isArray(data.data)) {
      return data.data.map((cat: any) => ({
        id: cat._id,
        name: cat.categoryname,
      }));
    }
    return [];
  } catch (err) {
    console.error("Error fetching categories", err);
    return [];
  }
}

async function fetchBrands(): Promise<Brand[]> {
  try {
    const response = await fetch(BRAND_API_URL, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    const data = await response.json();
    if (data.success && Array.isArray(data.data)) {
      return data.data.map((brand: any) => ({
        id: brand._id,
        name: brand.brand,
      }));
    }
    return [];
  } catch (err) {
    console.error("Error fetching brands", err);
    return [];
  }
}

export default async function ProductPage() {
  const initialData = await fetchInitialProducts(1);
  const initialCategories = await fetchCategories();
  const initialBrands = await fetchBrands();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <span className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600 inline-block border-4 border-purple-200 border-t-purple-600 rounded-full"></span>
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      }
    >
      <ProductCatalogClient
        initialProducts={initialData.products}
        initialCategories={initialCategories}
        initialBrands={initialBrands}
        initialPage={initialData.currentPage}
        initialTotalPages={initialData.totalPages}
        initialTotalResults={initialData.totalResults}
      />
    </Suspense>
  );
}
