"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MessageCircle,
  ShoppingCart,
  Share2,
  Loader,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  Minus,
  Plus,
  Check,
} from "lucide-react";

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  isFeature: boolean;
  images: string[];
  variants: {
    price: string;
    quantity: string;
    _id: string;
    variantName?: string;
    variantColor?: string;
    variantSize?: string;
    variantSKU?: string;
    percentage?: string; // ✅ Always string for consistency
  }[];
  points: string[];
}

interface ApiProduct {
  _id: string;
  name: string;
  brand: string;
  categoryId: string;
  variants: {
    price: string;
    quantity: string;
    _id: string;
    variantName?: string;
    variantColor?: string;
    variantSize?: string;
    variantSKU?: string;
    percentage?: number | string; // API might send as number
  }[];
  description: string;
  isFeature: boolean;
  images: string[];
  points: string[];
  __v?: number;
}

interface SimilarProduct {
  _id: string;
  name: string;
  brand: string;
  categoryId: string;
  description: string;
  isFeature: boolean;
  images: string[];
  variants: { price: string; quantity: string; _id: string; percentage?: string }[];
  points: string[];
  __v?: number;
}

// Enquiry structure
interface EnquiryVariantItem {
  variantId: string;
  selectedQuantity: number;
  totalPrice: string;
  price: string;
  quantity: string;
  variantName?: string;
}

interface EnquiryItem {
  _id: string;
  productId: string;
  variants: EnquiryVariantItem[];
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<SimilarProduct[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Enquiry
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);
  const [showEnquiryPopup, setShowEnquiryPopup] = useState(false);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);

  // Share modal
  const [showShareModal, setShowShareModal] = useState(false);

  const API_URL = `https://barber-syndicate.vercel.app/api/v1/product/single/${id}`;
  const ENQUIRY_API_URL = "https://barber-syndicate.vercel.app/api/v1/enquiry";

  // ✅ Helper to calculate effective price after percentage discount
  const getEffectivePrice = (variant: { price: string; percentage?: string }) => {
    const original = parseFloat(variant.price || "0");
    const percent = parseFloat(variant.percentage || "0");
    if (percent > 0) {
      return original * (1 - percent / 100);
    }
    return original;
  };

  // Variant change pe quantity reset
  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");

    setIsAuthenticated(!!token);
    setUserId(storedUserId);

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.product) {
          const apiProduct: ApiProduct = data.product;

          // ✅ Convert percentage to string for consistent handling
          setProduct({
            id: apiProduct._id,
            name: apiProduct.name,
            brand: apiProduct.brand,
            category: apiProduct.categoryId,
            description: apiProduct.description,
            isFeature: apiProduct.isFeature,
            images: apiProduct.images?.length > 0 
              ? apiProduct.images 
              : ["https://via.placeholder.com/600x600?text=No+Image"],
            variants: (apiProduct.variants || []).map(v => ({
              ...v,
              percentage: v.percentage?.toString() || "",
            })),
            points: apiProduct.points || [],
          });

          // Similar products fetch
          try {
            const SIMILAR_PRODUCTS_API = `https://barber-syndicate.vercel.app/api/v1/product/user-products?page=${currentPage}&limit=8`;
            
            const similarResponse = await fetch(SIMILAR_PRODUCTS_API, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            });

            if (similarResponse.ok) {
              const similarData = await similarResponse.json();

              if (similarData.success && similarData.products) {
                const filteredProducts = similarData.products
                  .filter((p: any) => p._id !== apiProduct._id)
                  .slice(0, 4)
                  .map((p: any) => ({
                    ...p,
                    // ✅ Convert percentage to string in similar products as well
                    variants: (p.variants || []).map((v: any) => ({
                      ...v,
                      percentage: v.percentage?.toString() || "",
                    })),
                  }));
                setSimilarProducts(filteredProducts);
                setTotalPages(similarData.totalPages || 1);
              }
            }
          } catch (similarErr) {
            console.warn("Could not fetch similar products:", similarErr);
          }

        } else {
          throw new Error(data.message || "Product data not found in response");
        }
      } catch (err) {
        console.error("Error in fetchProduct:", err);
        let errorMessage = "Failed to load product. Please try again.";
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    } else {
      setError("No product ID provided");
      setLoading(false);
    }
  }, [id, currentPage]);

  // Quantity functions
  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  // helper: user enquiry fetch
  const fetchUserEnquiries = async (token: string, userId: string) => {
    try {
      const res = await fetch(`${ENQUIRY_API_URL}/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) return [];

      return (data.enquiries || data.enquiry || []) as EnquiryItem[];
    } catch {
      return [];
    }
  };

  // FINAL ADD TO CART (MERGE QUANTITY) with discounted price
  const handleEnquiry = async () => {
    if (!product || !userId || !isAuthenticated) {
      setEnquiryError("Please login to create an enquiry");
      return;
    }

    if (!product.variants || product.variants.length === 0) {
      setEnquiryError("No variants available for this product");
      return;
    }

    try {
      setIsSubmittingEnquiry(true);
      setEnquiryError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setEnquiryError("Token missing. Please login again.");
        return;
      }

      const selectedVariantData = product.variants[selectedVariant];
      if (!selectedVariantData?._id) {
        setEnquiryError("Variant not selected properly");
        return;
      }

      // ✅ Use effective price after discount
      const unitPrice = getEffectivePrice(selectedVariantData);
      const qtySelected = Number(quantity || 1);

      // 1) GET existing enquiries
      const existingEnquiries = await fetchUserEnquiries(token, userId);

      // 2) find same product + same variant
      const foundSame = existingEnquiries.find((enq) => {
        if (enq.productId !== product.id) return false;
        return enq.variants?.some((v) => v.variantId === selectedVariantData._id);
      });

      // IF FOUND => UPDATE QUANTITY (merge)
      if (foundSame) {
        const existingVariant = foundSame.variants.find(
          (v) => v.variantId === selectedVariantData._id
        );

        const oldQty = Number(existingVariant?.selectedQuantity || 0);
        const newQty = oldQty + qtySelected;

        const newTotal = unitPrice * newQty;

        // Update API route
        const UPDATE_URL = `${ENQUIRY_API_URL}/update`;

        const updatePayload = {
          enquiryId: foundSame._id,
          productId: product.id,
          variantId: selectedVariantData._id,
          selectedQuantity: newQty,
          totalPrice: String(newTotal),
        };

        const updateRes = await fetch(UPDATE_URL, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatePayload),
        });

        const updateData = await updateRes.json();

        if (!updateRes.ok || !updateData.success) {
          // fallback to create new
          throw new Error(
            updateData.message || "Failed to update enquiry"
          );
        }

        setShowEnquiryPopup(true);
        setTimeout(() => setShowEnquiryPopup(false), 2500);
        return;
      }

      // IF NOT FOUND => CREATE NEW ENTRY
      const totalPrice = unitPrice * qtySelected;

      const enquiryData = {
        id: userId,
        productId: product.id,
        variants: [
          {
            variantId: selectedVariantData._id,
            variantName:
              selectedVariantData.variantName ||
              selectedVariantData.quantity ||
              "Default Variant",
            price: String(unitPrice), // ✅ Send discounted price
            quantity: selectedVariantData.quantity,
            selectedQuantity: qtySelected,
            totalPrice: String(totalPrice),
          },
        ],
      };

      const response = await fetch(ENQUIRY_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(enquiryData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create enquiry");
      }

      setShowEnquiryPopup(true);
      setTimeout(() => setShowEnquiryPopup(false), 2500);
    } catch (error) {
      console.error("Enquiry error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create enquiry";
      setEnquiryError(errorMessage);
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  const handleWhatsAppClick = () => {
    if (!product || product.variants.length === 0) return;

    const selectedOption = product.variants[selectedVariant];
    const variantName =
      selectedOption.variantName || selectedOption.quantity || "Variant";

    // ✅ Use effective price for WhatsApp message
    const unitPrice = getEffectivePrice(selectedOption);
    const total = unitPrice * quantity;

    const message = `Hi! I'm interested in:\n\nProduct: ${product.name}\nVariant: ${variantName}\nQuantity: ${quantity} units\n${
      isAuthenticated
        ? `Price per unit: ₹${unitPrice.toFixed(2)}\nTotal Price: ₹${total.toFixed(2)}`
        : ""
    }\n\nCan you please provide more details?`;

    const phoneNumber = "9818396703";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank");
  };

  // Updated share handler with fallback modal
  const handleShare = async () => {
    if (!product) return;

    const shareData = {
      title: product.name,
      text: product.description,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled share or error occurred
        console.log('Share cancelled or failed', error);
      }
    } else {
      // Fallback: show custom share modal
      setShowShareModal(true);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  // ✅ Get lowest effective price from variants for "From" display
  const getLowestEffectivePrice = (
    variants: { price: string; percentage?: string }[]
  ) => {
    if (!variants || variants.length === 0) return 0;
    const effectivePrices = variants.map(v => getEffectivePrice(v));
    return effectivePrices.length > 0 ? Math.min(...effectivePrices) : 0;
  };

  // Popup for enquiry success
  const EnquirySuccessPopup = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900">Success!</h3>
          </div>
          <button
            onClick={() => setShowEnquiryPopup(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-gray-600 mb-4">
          Product added to cart successfully!
        </p>
        <button
          onClick={() => setShowEnquiryPopup(false)}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );

  // Custom share modal (fallback)
  const ShareModal = () => {
    if (!showShareModal || !product) return null;

    const shareUrl = window.location.href;
    const shareTitle = product.name;
    const shareText = product.description;

    const shareLinks = [
      {
        name: 'WhatsApp',
        icon: '📱',
        url: `https://wa.me/?text=${encodeURIComponent(shareTitle + ' - ' + shareUrl)}`,
      },
      {
        name: 'Twitter',
        icon: '🐦',
        url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
      },
      {
        name: 'Facebook',
        icon: '📘',
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      },
      {
        name: 'Email',
        icon: '📧',
        url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`,
      },
    ];

    const copyToClipboard = () => {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
      setShowShareModal(false);
    };

    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" 
        onClick={() => setShowShareModal(false)}
      >
        <div 
          className="bg-white rounded-xl p-6 max-w-sm w-full" 
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Share this product</h3>
            <button 
              onClick={() => setShowShareModal(false)} 
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {shareLinks.map(link => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowShareModal(false)}
                className="flex flex-col items-center justify-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl mb-1">{link.icon}</span>
                <span className="text-sm font-medium">{link.name}</span>
              </a>
            ))}
          </div>
          <div className="mt-4">
            <button
              onClick={copyToClipboard}
              className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <span>📋</span> Copy Link
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-sm">
          <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-400 text-2xl">!</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error loading product
          </h3>
          <p className="text-gray-600 mb-4">{error || "Product not found"}</p>
          <Link
            href="/product"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const selectedVariantData = product.variants[selectedVariant];
  const effectivePrice = selectedVariantData ? getEffectivePrice(selectedVariantData) : 0;
  const totalPrice = effectivePrice * quantity;

  return (
    <div className="min-h-screen bg-yellow-50">
      {showEnquiryPopup && <EnquirySuccessPopup />}
      <ShareModal />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/product"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Products</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* ==================== IMAGES SECTION ==================== */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-200">
              <img
                src={product.images[selectedImage] || "https://via.placeholder.com/600x600?text=No+Image"}
                alt={product.name}
                className="w-full h-full object-contain p-4"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/600x600?text=No+Image";
                }}
              />
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-purple-600"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/150x150?text=Image";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            <div>
              {product.isFeature && (
                <span className="inline-block bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1 rounded-full w-fit mb-2">
                  Featured
                </span>
              )}

              <div className="flex items-center justify-between mb-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  {product.name}
                </h1>

                <button
                  onClick={handleShare}
                  className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>

              <p className="text-lg text-gray-600 leading-relaxed mb-4">
                {product.description}
              </p>

              {/* Points */}
              {product.points && product.points.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Key Points:</h4>
                  <ul className="space-y-1">
                    {product.points.map((point, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        <span className="text-gray-600">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Select Variant
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.variants.map((variant, index) => {
                      const effective = getEffectivePrice(variant);
                      const original = parseFloat(variant.price || "0");
                      const hasDiscount = parseFloat(variant.percentage || "0") > 0;

                      return (
                        <button
                          key={variant._id}
                          onClick={() => setSelectedVariant(index)}
                          className={`p-4 border-2 rounded-xl text-left transition-all ${
                            selectedVariant === index
                              ? "border-purple-600 bg-purple-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {variant.variantName ||
                                  variant.quantity ||
                                  `Variant ${index + 1}`}
                              </h4>
                              {variant.variantColor && (
                                <p className="text-sm text-gray-500 mt-1">
                                  Color: {variant.variantColor}
                                </p>
                              )}
                              {variant.variantSize && (
                                <p className="text-sm text-gray-500">
                                  Size: {variant.variantSize}
                                </p>
                              )}
                            </div>

                            {selectedVariant === index && (
                              <Check className="h-5 w-5 text-purple-600" />
                            )}
                          </div>

                          <div className="mt-3">
                            {isAuthenticated ? (
                              hasDiscount ? (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-lg font-bold text-purple-600">
                                    ₹{effective.toFixed(2)}
                                  </span>
                                  <span className="text-sm text-gray-400 line-through">
                                    ₹{original.toFixed(2)}
                                  </span>
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                    {variant.percentage}% off
                                  </span>
                                </div>
                              ) : (
                                <span className="text-lg font-bold text-purple-600">
                                  ₹{original.toFixed(2)}
                                </span>
                              )
                            ) : (
                              <span className="text-lg font-bold text-gray-400">
                                Login to view price
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quantity */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Quantity
                  </h3>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-lg bg-white">
                      <button
                        onClick={handleDecrement}
                        disabled={quantity <= 1}
                        className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>

                      <div className="px-6 py-3 border-x min-w-[60px] text-center">
                        <span className="text-lg font-medium">{quantity}</span>
                      </div>

                      <button
                        onClick={handleIncrement}
                        className="p-3 hover:bg-gray-100 rounded-r-lg transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {isAuthenticated && selectedVariantData && (
                      <div className="ml-auto text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          ₹{totalPrice.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          ₹{effectivePrice.toFixed(2)} × {quantity} units
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Enquiry Error */}
            {enquiryError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{enquiryError}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleWhatsAppClick}
                disabled={!product.variants.length}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Contact via WhatsApp</span>
              </button>

              <button
                onClick={handleEnquiry}
                disabled={
                  !isAuthenticated ||
                  isSubmittingEnquiry ||
                  !product.variants.length
                }
                className="flex-1 border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingEnquiry ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <ShoppingCart className="h-5 w-5" />
                )}

                <span>
                  {isSubmittingEnquiry
                    ? "Adding..."
                    : isAuthenticated && selectedVariantData
                    ? `Add to cart - ₹${totalPrice.toFixed(2)}`
                    : "Add to cart"}
                </span>
              </button>
            </div>

            {!isAuthenticated && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center space-y-4">
                <div className="text-amber-800">
                  <h3 className="font-semibold text-lg mb-2">Login Required</h3>
                  <p className="text-sm">
                    Please login to view pricing, select variants, choose
                    quantity, and place orders.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/login"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="border border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Register
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ==================== SIMILAR PRODUCTS ==================== */}
        {similarProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Similar Products
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((similarProduct) => {
                const lowestPrice = getLowestEffectivePrice(similarProduct.variants);
                return (
                  <Link
                    key={similarProduct._id}
                    href={`/product/${similarProduct._id}`}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden group"
                  >
                    <div className="relative w-full pt-[100%] bg-gray-50">
                      <div className="absolute inset-0 p-3">
                        <img
                          src={similarProduct.images[0] || "https://via.placeholder.com/400x400?text=Product"}
                          alt={similarProduct.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/400x400?text=Product";
                          }}
                        />
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 mb-2">
                        {similarProduct.name}
                      </h3>

                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {similarProduct.description}
                      </p>

                      <div
                        className={`text-lg font-bold ${
                          isAuthenticated ? "text-purple-600" : "text-gray-400"
                        }`}
                      >
                        {isAuthenticated && similarProduct.variants.length > 0
                          ? `From ₹${lowestPrice.toFixed(2)}`
                          : "Login to view price"}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center space-x-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-600 hover:text-purple-600 disabled:text-gray-300 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>

                <span className="text-gray-900 font-medium">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-600 hover:text-purple-600 disabled:text-gray-300 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}