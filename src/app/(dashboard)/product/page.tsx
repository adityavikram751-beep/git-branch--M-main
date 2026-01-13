import { Suspense } from "react";
import ProductCatalogClient from "./_component/ProductCatalogClient";

interface ApiProductVariant {
  price?: number;
  quantity?: string | number;
}

interface ApiProduct {
  _id: string;
  name: string;
  price?: number;

  categoryId?: string;
  subcategoryId?: string;
  brandId?: string;

  brand?: string;

  description?: string;
  shortDescription?: string;

  quantity?: string;
  isFeature?: boolean;
  carter?: number;

  images?: string[];
  variants?: ApiProductVariant[];

  quantityOptions?: { type: string }[];
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

const PRODUCT_API_URL = "https://barber-syndicate.vercel.app/api/v1/product";
const CATEGORY_API_URL = "https://barber-syndicate.vercel.app/api/v1/category";
const BRAND_API_URL = "https://barber-syndicate.vercel.app/api/v1/brands/getall";

async function fetchInitialProducts(
  page = 1,
  category?: string,
  subcategory?: string,
  brand?: string
): Promise<ApiResponse> {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: "20",
      ...(category ? { category } : {}),
      ...(subcategory ? { subcategory } : {}),
      ...(brand ? { brand } : {}),
    });

    const response = await fetch(`${PRODUCT_API_URL}?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      next: { revalidate: 3600 },
    });

    const data: ApiResponse = await response.json();

    if (!data?.success) {
      return {
        success: false,
        products: [],
        currentPage: 1,
        totalPages: 1,
        totalResults: 0,
        message: data?.message || "Failed to fetch products",
      };
    }

    const mappedProducts: ApiProduct[] = (data.products || []).map((product) => ({
      ...product,
      images: product.images || [],
      quantityOptions: product.quantityOptions || [],
    }));

    return { ...data, products: mappedProducts };
  } catch (err) {
    console.error("Failed to fetch products:", err);
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
      next: { revalidate: 3600 },
    });

    const data = await response.json();

    if (data?.success && Array.isArray(data?.data)) {
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
      next: { revalidate: 3600 },
    });

    const data = await response.json();

    if (data?.success && Array.isArray(data?.data)) {
      const mapped = data.data.map((brand: any) => ({
        id: brand._id,
        name: brand.brand,
      }));

      const unique = mapped.filter(
        (b: Brand, index: number, self: Brand[]) =>
          index === self.findIndex((x) => x.id === b.id)
      );

      return unique;
    }

    return [];
  } catch (err) {
    console.error("Error fetching brands", err);
    return [];
  }
}

export default async function ProductPage({
  searchParams,
}: {
  searchParams?: Promise<{
    [key: string]: string | string[] | undefined;
    category?: string;
    subcategory?: string;
    brand?: string;
  }>;
}) {
  // ✅ IMPORTANT FIX: await searchParams
  const sp = await searchParams;

  const category = sp?.category as string | undefined;
  const subcategory = sp?.subcategory as string | undefined;
  const brand = sp?.brand as string | undefined;

  const initialData = await fetchInitialProducts(1, category, subcategory, brand);
  const initialCategories = await fetchCategories();
  const initialBrands = await fetchBrands();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <span className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600 inline-block border-4 border-purple-200 border-t-purple-600 rounded-full" />
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
        initialCategory={category}
        initialSubCategory={subcategory}
        initialBrand={brand}
      />
    </Suspense>
  );
}
