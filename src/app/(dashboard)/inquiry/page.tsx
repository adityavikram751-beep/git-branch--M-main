'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, MapPin, Calendar, User, Package, Star, ShoppingBag, Clock, AlertTriangle } from 'lucide-react';

interface Enquiry {
  _id: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    gstnumber: string;
    status: string;
  };
  productId: {
    _id: string;
    name: string;
    brand: string;
    categoryId: string;
    description: string;
    isFeature: boolean;
    images: string[];
    points: string[];
  } | null;
  variants: { price: number; quantity: string; _id: string }[];
  AddedAt: string;
  __v: number;
}

export default function EnquiryPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<{ [key: string]: number }>({});
  const [expandedVariants, setExpandedVariants] = useState<{ [key: string]: boolean }>({}); // ⭐ ADDED

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUserId = localStorage.getItem('userId');
        if (!token || !storedUserId) {
          setError('You are not logged in. Please log in to view your enquiries.');
          setLoading(false);
          return;
        }

        const response = await fetch(`https://barber-syndicate.vercel.app/api/v1/enquiry/${storedUserId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
          setEnquiries(result.data);
          const initialSelectedImages: { [key: string]: number } = {};
          const initialExpanded: { [key: string]: boolean } = {};

          result.data.forEach((enquiry: Enquiry) => {
            if (enquiry.productId) {
              initialSelectedImages[enquiry._id] = 0;
              initialExpanded[enquiry._id] = false;
            }
          });

          setSelectedImages(initialSelectedImages);
          setExpandedVariants(initialExpanded);
        } else {
          setError(result.message || 'No enquiry data found.');
        }
      } catch (err: any) {
        setError(`Failed to fetch enquiry data: ${err.message}. Please try again.`);
      } finally {
        setLoading(false);
      }
    };

    fetchEnquiries();
  }, []);

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('pending')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (statusLower.includes('approved') || statusLower.includes('active')) return 'bg-green-100 text-green-800 border-green-200';
    if (statusLower.includes('completed')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (statusLower.includes('rejected') || statusLower.includes('cancelled')) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleImageSelect = (enquiryId: string, index: number) => {
    setSelectedImages(prev => ({
      ...prev,
      [enquiryId]: index
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-rose-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your enquiries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-rose-50 flex justify-center items-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-xl">!</span>
              </div>
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (enquiries.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No enquiries found.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userInfo = enquiries[0].user_id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Enquiries</h1>
              <p className="text-sm text-gray-600 mt-1">
                
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={`px-3 py-1 text-sm font-medium ${getStatusColor(userInfo.status)}`}>
                {userInfo.status}
              </Badge>
              <div className="flex items-center gap-2 text-gray-600">
                <ShoppingBag className="w-5 h-5" />
                <span className="font-medium">{enquiries.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="w-5 h-5 text-blue-600" />
                    Customer Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold text-gray-900">{userInfo.name}</p>
                    <p className="text-sm text-gray-600">Customer</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <a href={`mailto:${userInfo.email}`} 
                           className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors">
                          {userInfo.email}
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <a href={`tel:${userInfo.phone}`} 
                           className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors">
                          {userInfo.phone}
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="text-sm text-gray-900">{userInfo.address}</p>
                      </div>
                    </div>
                    
                    {userInfo.gstnumber && (
                      <div>
                        <p className="text-sm text-gray-600">GST Number</p>
                        <p className="text-sm text-gray-900 font-mono">{userInfo.gstnumber}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            {enquiries.map((enquiry, index) => (
              <Card key={enquiry._id} className="shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <CardTitle className="text-lg">Enquiry #{enquiry._id.slice(-8)}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <p className="text-sm text-gray-600">{formatDate(enquiry.AddedAt)}</p>
                        </div>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(userInfo.status)}`}>
                      {userInfo.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {!enquiry.productId ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-orange-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Information Unavailable</h3>
                      <p className="text-gray-600 mb-4">
                        This enquiry was submitted but the product details are currently not available.
                      </p>
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        Product Not Linked
                      </Badge>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
                          <img
                            src={enquiry.productId.images[selectedImages[enquiry._id]] || enquiry.productId.images[0] || '/placeholder-image.jpg'}
                            alt={enquiry.productId.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        
                        {enquiry.productId.images.length > 1 && (
                          <div className="grid grid-cols-4 gap-2">
                            {enquiry.productId.images.slice(0, 4).map((image, imgIndex) => (
                              <button
                                key={imgIndex}
                                onClick={() => handleImageSelect(enquiry._id, imgIndex)}
                                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                  selectedImages[enquiry._id] === imgIndex 
                                    ? 'border-blue-500 ring-2 ring-blue-200' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <img
                                  src={image}
                                  alt={`${enquiry.productId!.name} ${imgIndex + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600 uppercase tracking-wide">{enquiry.productId.brand}</p>
                          <h3 className="text-xl font-bold text-gray-900 mt-1 line-clamp-2">{enquiry.productId.name}</h3>
                          {enquiry.productId.isFeature && (
                            <Badge variant="secondary" className="mt-2 bg-yellow-100 text-yellow-800">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>

                        {/* ⭐⭐⭐⭐⭐ FINAL SHOW MORE / SHOW LESS CODE ⭐⭐⭐⭐⭐ */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Available Variants</h4>
                          <div className="space-y-2">

                            {(expandedVariants[enquiry._id]
                              ? enquiry.variants
                              : enquiry.variants.slice(0, 2)
                            ).map((variant, variantIndex) => (
                              <div
                                key={variant._id}
                                className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"
                              >
                                <div>
                                  <p className="font-medium text-gray-900 text-sm">Variant {variantIndex + 1}</p>
                                  <p className="text-xs text-gray-600">Qty: {variant.quantity}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold text-green-600">₹{variant.price.toLocaleString()}</p>
                                </div>
                              </div>
                            ))}

                            {enquiry.variants.length > 2 && (
                              <button
                                onClick={() =>
                                  setExpandedVariants(prev => ({
                                    ...prev,
                                    [enquiry._id]: !prev[enquiry._id],
                                  }))
                                }
                                className="w-full text-center text-blue-600 text-sm hover:underline mt-1"
                              >
                                {expandedVariants[enquiry._id]
                                  ? "Show Less"
                                  : `+${enquiry.variants.length - 2} more variants`}
                              </button>
                            )}

                            <div className="border-t pt-2 mt-2 flex justify-between items-center">
                              <p className="text-sm font-medium text-gray-700">Total Price</p>
                              <p className="text-lg font-bold text-blue-600">
                                ₹{enquiry.variants.reduce((total, v) => total + (v.price || 0), 0).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                          <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">{enquiry.productId.description}</p>
                        </div>

                        {enquiry.productId.points.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Key Features</h4>
                            <ul className="space-y-1">
                              {enquiry.productId.points.slice(0, 3).map((point, pointIndex) => (
                                <li key={pointIndex} className="flex items-start gap-2 text-sm text-gray-700">
                                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                                  {point}
                                </li>
                              ))}
                              {enquiry.productId.points.length > 3 && (
                                <li className="text-sm text-gray-500">
                                  +{enquiry.productId.points.length - 3} more features
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
