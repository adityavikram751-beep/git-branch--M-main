'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, ShoppingCart, Heart, Share2, Loader, ChevronLeft, ChevronRight, X, CheckCircle, Minus, Plus, Check } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  isFeature: boolean;
  images: string[];
  variants: { price: string; quantity: string; _id: string; variantName?: string; variantColor?: string; variantSize?: string; variantSKU?: string; }[];
  points: string[];
}

interface ApiProduct {
  _id: string;
  name: string;
  brand: string;
  categoryId: string;
  variants: { price: string; quantity: string; _id: string; variantName?: string; variantColor?: string; variantSize?: string; variantSKU?: string; }[];
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
  variants: { price: string; quantity: string; _id: string }[];
  points: string[];
  __v?: number;
}

// --- Component Starts Here ---

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

  // Enquiry related states
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);
  const [showEnquiryPopup, setShowEnquiryPopup] = useState(false);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);

  const API_URL = `https://barber-syndicate.vercel.app/api/v1/product/single/${id}`;
  const ENQUIRY_API_URL = 'https://barber-syndicate.vercel.app/api/v1/enquiry';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    setIsAuthenticated(!!token);
    setUserId(storedUserId);

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(API_URL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
          cache: 'no-cache',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const data = await response.json();

        if (data.success && data.product) {
          const apiProduct: ApiProduct = data.product;
          setProduct({
            id: apiProduct._id,
            name: apiProduct.name,
            brand: apiProduct.brand,
            category: apiProduct.categoryId,
            description: apiProduct.description,
            isFeature: apiProduct.isFeature,
            images: apiProduct.images || ['/placeholder-image.jpg'],
            variants: apiProduct.variants || [],
            points: apiProduct.points || [],
          });

          // Fetch similar products using the new API
          const SIMILAR_PRODUCTS_API = `https://barber-syndicate.vercel.app/api/v1/product?page=${currentPage}`;
          const similarResponse = await fetch(SIMILAR_PRODUCTS_API, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            mode: 'cors',
            cache: 'no-cache',
            signal: controller.signal,
          });

          const similarData = await similarResponse.json();
          if (similarData.success && similarData.products) {
            // Filter out the current product from similar products
            const filteredProducts = similarData.products.filter(
              (p: SimilarProduct) => p._id !== apiProduct._id
            );
            setSimilarProducts(filteredProducts);
            setTotalPages(similarData.totalPages || 1);
          } else {
            console.warn('No similar products found');
          }
        } else {
          throw new Error(data.message || 'Product not found');
        }
      } catch (err) {
        let errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        if (err instanceof Error && err.name === 'AbortError') {
          errorMessage = 'Request timed out. Please check your network or try again.';
        }
        setError(errorMessage);
        router.push('/product');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, router, currentPage]);

  const handleEnquiry = async () => {
    if (!product || !userId || !isAuthenticated) {
      setEnquiryError('Please login to create an enquiry');
      return;
    }

    if (!product.variants || product.variants.length === 0) {
      setEnquiryError('No variants available for this product');
      return;
    }

    try {
      setIsSubmittingEnquiry(true);
      setEnquiryError(null);

      // Get the selected variant
      const selectedVariantData = product.variants[selectedVariant];
      const totalPrice = (parseFloat(selectedVariantData.price) * quantity).toFixed(2);

      const enquiryData = {
        id: userId,
        productId: product.id,
        variants: [{
          variantId: selectedVariantData._id,
          variantName: selectedVariantData.variantName || selectedVariantData.quantity,
          price: selectedVariantData.price,
          quantity: selectedVariantData.quantity,
          selectedQuantity: quantity,
          totalPrice: totalPrice
        }]
      };

      const response = await fetch(ENQUIRY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(enquiryData),
      });

      const data = await response.json();

      if (data.success) {
        setShowEnquiryPopup(true);
        // Auto-close popup after 3 seconds
        setTimeout(() => {
          setShowEnquiryPopup(false);
        }, 3000);
      } else {
        throw new Error(data.message || 'Failed to create enquiry');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create enquiry';
      setEnquiryError(errorMessage);
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  const handleWhatsAppClick = () => {
    if (!product || product.variants.length === 0) return;
    const selectedOption = product.variants[selectedVariant];
    const variantName = selectedOption.variantName || selectedOption.quantity;

    const message = `Hi! I'm interested in:\n\nProduct: ${product.name}\nVariant: ${variantName}\nQuantity: ${quantity} units\n${isAuthenticated ? `Price per unit: ₹${selectedOption.price}\nTotal Price: ₹${(parseFloat(selectedOption.price) * quantity).toFixed(2)}` : ''}\n\nCan you please provide more details?`;

    const phoneNumber = '919876543210';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleShare = async () => {
    if (!product) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Product URL copied to clipboard!');
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getLowestPrice = (variants: { price: string; quantity: string; _id: string }[]) => {
    if (!variants || variants.length === 0) return 0;
    return Math.min(...variants.map(v => parseFloat(v.price)));
  };

  // Quantity functions
  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = parseInt(e.target.value);
  //   if (!isNaN(value) && value > 0) {
  //     setQuantity(value);
  //   }
  // };

  // Enquiry Success Popup Component
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
        <p className="text-gray-600 mb-4">Your enquiry has been created successfully!</p>
        <button
          onClick={() => setShowEnquiryPopup(false)}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );

  // --- Loading/Error State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff8f2] flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-[#C13636]" />
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#fff8f2] flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-400 text-2xl">!</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading product</h3>
          <p className="text-gray-600 mb-4">{error || 'Product not found'}</p>
        </div>
      </div>
    );
  }

  const selectedVariantData = product.variants[selectedVariant];
  const variantName = selectedVariantData?.variantName || selectedVariantData?.quantity || `Variant ${selectedVariant + 1}`;
  const totalPrice = selectedVariantData ? (parseFloat(selectedVariantData.price) * quantity) : 0;
  
  // Custom Class for the main container to match the image's background color
  const tanBgClass = "bg-[#fff8f2]";
  // Custom Class for the accent color, choosing a red that matches the image's pink/red highlights
  const accentColorClass = "text-[#C13636] border-[#C13636]"; 
  const accentBgClass = "bg-[#C13636] hover:bg-[#A32D2D]";
  const whatsappBgClass = "bg-[#43a047] hover:bg-[#388e3c]"; // A classic WhatsApp green

  // --- Main Product Detail UI ---
  return (
    <div className={`min-h-screen ${tanBgClass}`}>
      {/* Enquiry Success Popup */}
      {showEnquiryPopup && <EnquirySuccessPopup />}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Back Button / Simplified Breadcrumb */}
        <Link
          href="/product"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Products</span>
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Product Images (Left Side) */}
          <div className="space-y-4">
            <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-2xl relative">
              {/* Product Image on a Decorative Rock (Emulating the Image) */}
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/placeholder-rock-bg.png')" }} />
              <img
                src={product.images[selectedImage] || '/placeholder-image.jpg'}
                alt={product.name}
                // Object-contain to show full product, like in the image
                className="w-full h-full object-contain p-8 md:p-12 z-10 relative" 
              />
            </div>
            {/* Small Thumbnails (Removed for cleaner UI like the image, but kept here for function) */}
            {/* {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-[#C13636]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )} */}
          </div>
          
          {/* Product Information (Right Side) */}
          <div className="space-y-8">
            <div>
              
              {/* Product Title and Description */}
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                {product.description}
              </p>
              
              {/* Key Features (Points) */}
              {product.points && product.points.length > 0 && (
                <div className="space-y-3 p-4 bg-white/50 border border-gray-100 rounded-lg">
                  <h4 className="font-bold text-gray-800 text-lg">Key Features</h4>
                  <ul className="list-disc list-inside space-y-1 text-base text-gray-600">
                    {product.points.map((point, index) => (
                      <li key={index} className="pl-1">{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Variant Selection */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Select Variant</h3>
                <div className="flex flex-wrap gap-4">
                  {product.variants.map((variant, index) => (
                    <button
                      key={variant._id}
                      onClick={() => setSelectedVariant(index)}
                      // Styled to look like the buttons in the image
                      className={`px-6 py-3 border-2 rounded-xl text-center transition-all min-w-[120px] ${
                        selectedVariant === index
                          ? 'border-[#C13636] bg-[#ffe0e0] font-bold shadow-md'
                          : 'border-gray-300 bg-white hover:border-gray-400 font-medium'
                      }`}
                    >
                      <h4 className="text-gray-900 text-base">
                        {variant.variantName || variant.quantity || `${variant.quantity} pcs`}
                      </h4>
                      <p className={`text-sm mt-1 ${
                        isAuthenticated ? 'text-gray-700 font-semibold' : 'text-gray-400'
                      }`}>
                        {isAuthenticated ? `₹${parseFloat(variant.price).toFixed(2)}` : 'Login to view price'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Quantity Selection Section */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Quantity</h3>
                
                <div className="flex items-center justify-between">
                  {/* Plus/Minus Quantity Selector (Styled for UI match) */}
                  <div className="flex items-center border border-gray-300 rounded-xl bg-white">
                    <button
                      onClick={handleDecrement}
                      disabled={quantity <= 1}
                      className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-xl transition-colors text-gray-700"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    
                    <div className="px-6 py-2 border-x border-gray-300 min-w-[70px] text-center">
                      <span className="text-xl font-bold text-gray-900">{quantity}</span>
                    </div>
                    
                    <button
                      onClick={handleIncrement}
                      className="p-3 hover:bg-gray-100 rounded-r-xl transition-colors text-gray-700"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {/* Total Price Display (Conditional) */}
                  {isAuthenticated && selectedVariantData && (
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#C13636]">
                        ₹{totalPrice.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        ₹{parseFloat(selectedVariantData.price).toFixed(2)} × {quantity} units
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* No Variants Message */}
            {(!product.variants || product.variants.length === 0) && (
              <div className="bg-gray-100 border border-gray-200 rounded-xl p-6 text-center">
                <p className="text-gray-600">Contact us for pricing and availability information.</p>
              </div>
            )}
            
            {/* Enquiry Error Message */}
            {enquiryError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{enquiryError}</p>
              </div>
            )}
            
            {/* Action Buttons (Styled for UI match) */}
            <div className="flex flex-col gap-4 pt-4">
              <button
                onClick={handleEnquiry}
                disabled={!isAuthenticated || isSubmittingEnquiry || !product.variants.length}
                // Style matches the 'Add to enquiry' button in the image
                className={`w-full border-2 border-[#C13636] text-black bg-[#ffe0e0] hover:bg-red-100 hover:text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl`}
              >
                {isSubmittingEnquiry ? (
                  <Loader className="h-6 w-6 animate-spin" />
                ) : (
                  <ShoppingCart className="h-6 w-6" />
                )}
                <span>
                  {isSubmittingEnquiry ? 'Adding to Inquiry...' : 
                    isAuthenticated && selectedVariantData ? 
                    `Add to Inquiry - ₹${totalPrice.toFixed(2)}` : 
                    'Add to Inquiry'}
                </span>
              </button>
              
              <button
                onClick={handleWhatsAppClick}
                disabled={!product.variants.length} // WhatsApp contact is always available, even if not logged in
                // Style matches the 'Connect on Whatsapp' button in the image
                className={`w-full ${whatsappBgClass} text-black px-8 py-4 rounded-xl font-bold text-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 shadow-lg hover:shadow-xl`}
              >
                <MessageCircle className="h-6 w-6" />
                <span>Connect on WhatsApp</span>
              </button>
            </div>
            
            {/* Login Prompt */}
            {!isAuthenticated && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center space-y-4">
                <div className="text-amber-800">
                  <h3 className="font-semibold text-lg mb-2">Login Required</h3>
                  <p className="text-sm">
                    Please login to view pricing, select variants, choose quantity, and place orders.
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
        
        {/* Similar Products Section */}
        {similarProducts.length > 0 && (
          <div className="mt-16 border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.slice(0, 4).map((similarProduct) => (
                <Link
                  key={similarProduct._id}
                  href={`/product/${similarProduct._id}`}
                  className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={similarProduct.images[0] || '/placeholder-image.jpg'}
                      alt={similarProduct.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">
                        {similarProduct.brand}
                      </span>
                      {similarProduct.isFeature && (
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">
                          Featured
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 mb-2">{similarProduct.name}</h3>
                    <div className={`text-lg font-bold ${
                      isAuthenticated ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {isAuthenticated && similarProduct.variants.length > 0 
                        ? `From ₹${getLowestPrice(similarProduct.variants).toFixed(2)}` 
                        : 'Login to view price'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center space-x-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-600 hover:text-[#C13636] disabled:text-gray-300 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <span className="text-gray-900">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-600 hover:text-[#C13636] disabled:text-gray-300 transition-colors"
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