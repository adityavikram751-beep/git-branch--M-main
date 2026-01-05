"use client";
import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Package,
  Calendar,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

type Enquiry = {
  _id: string;
  user_id?: {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    gstnumber?: string;
  };
  productId?: {
    _id: string;
    name: string;
    brand: string;
    categoryId: string;
    description: string;
    images: string[];
    points: string[];
  };
  variants?: {
    price: number;
    quantity: string;
    _id: string;
  }[];
  AddedAt: string;
};

const SingleUserEnquiry = ({
  enquiryId,
  onBack,
}: {
  enquiryId: string;
  onBack?: () => void;
}) => {
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const adminToken = localStorage.getItem("adminToken");

  const fetchSingleEnquiry = async () => {
    try {
      if (!adminToken) {
        throw new Error("No admin token provided. Please log in again.");
      }

      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://barber-syndicate.vercel.app/api/v1/enquiry/single/${enquiryId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setEnquiry(result.data);
      } else {
        throw new Error("Failed to fetch enquiry");
      }
    } catch (error: any) {
      console.error("Error fetching enquiry:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enquiryId) {
      fetchSingleEnquiry();
    }
  }, [enquiryId]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center text-red-600 mb-4">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>Error: {error}</span>
        </div>
        <button
          onClick={fetchSingleEnquiry}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center mx-auto"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  if (loading || !enquiry) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        Loading enquiry details...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-900">Enquiry Details</h2>
        <button
          onClick={onBack}
          className="flex items-center px-3 py-2 border rounded-md hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* User Info */}
        <div>
          <h3 className="text-lg font-medium mb-3">User Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2 text-gray-500" />
              {enquiry.user_id?.name}
            </div>
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2 text-gray-500" />
              {enquiry.user_id?.email}
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2 text-gray-500" />
              {enquiry.user_id?.phone}
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-gray-500" />
              {enquiry.user_id?.address}
            </div>
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-2 text-gray-500" />
              GST: {enquiry.user_id?.gstnumber}
            </div>
          </div>
        </div>

        {/* Product Info */}
        {enquiry.productId && (
          <div>
            <h3 className="text-lg font-medium mb-3">Product Information</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Package className="w-4 h-4 mr-2 text-gray-500" />
                {enquiry.productId.name}
              </div>
              <div className="text-gray-600 text-sm whitespace-pre-line">
                {enquiry.productId.description}
              </div>
              {enquiry.productId.images?.length > 0 && (
                <div className="flex gap-3 overflow-x-auto">
                  {enquiry.productId.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt="Product"
                      className="w-28 h-28 object-cover rounded-md border"
                    />
                  ))}
                </div>
              )}
              {enquiry.productId.points?.length > 0 && (
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {enquiry.productId.points.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Variants */}
        {enquiry.variants && enquiry.variants.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3">Variants</h3>
            <ul className="space-y-2 text-sm">
              {enquiry.variants.map((v) => (
                <li
                  key={v._id}
                  className="border rounded-md px-3 py-2 flex justify-between"
                >
                  <span>{v.quantity}</span>
                  <span className="font-medium">₹{v.price}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Added Date */}
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          Added At: {formatDate(enquiry.AddedAt)}
        </div>
      </div>
    </div>
  );
};

export default SingleUserEnquiry;
