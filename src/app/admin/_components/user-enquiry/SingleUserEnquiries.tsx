"use client";
import React, { useEffect, useState } from "react";
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
  Trash2,
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
  status?: string;
};

const SingleUserEnquiries = ({
  userId,
  onBack,
}: {
  userId: string;
  onBack?: () => void;
}) => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserEnquiries = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) throw new Error("No admin token provided. Please log in again.");

      setLoading(true);
      setError(null);

      // ✅ get all enquiries
      const response = await fetch(
        `https://barber-syndicate.vercel.app/api/v1/enquiry/all`,
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
        const all: Enquiry[] = result.data || [];

        // ✅ filter by userId
        const filtered = all.filter((enq) => enq.user_id?._id === userId);

        // ✅ sort latest first
        const sorted = [...filtered].sort(
          (a, b) => new Date(b.AddedAt).getTime() - new Date(a.AddedAt).getTime()
        );

        setEnquiries(sorted);
      } else {
        throw new Error("Failed to fetch enquiries");
      }
    } catch (error: any) {
      console.error("Error fetching enquiries:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ DELETE enquiry
  const deleteEnquiry = async (enquiryId: string) => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) throw new Error("No admin token provided. Please log in again.");

      const ok = confirm("Are you sure you want to delete this enquiry?");
      if (!ok) return;

      const res = await fetch(
        `https://barber-syndicate.vercel.app/api/v1/enquiry/${enquiryId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || `Delete failed: ${res.status}`);
      }

      await fetchUserEnquiries();
      alert("Enquiry deleted ✅");
    } catch (err: any) {
      alert(err.message || "Delete failed");
    }
  };

  useEffect(() => {
    if (userId) fetchUserEnquiries();
  }, [userId]);

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
          onClick={fetchUserEnquiries}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center mx-auto"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        Loading user enquiries...
      </div>
    );
  }

  const userInfo = enquiries?.[0]?.user_id;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            User Enquiries ({enquiries.length})
          </h2>
          <p className="text-sm text-gray-600">
            User ID: <span className="font-mono">{userId}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onBack}
            className="flex items-center px-3 py-2 border rounded-md hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </button>

          <button
            onClick={fetchUserEnquiries}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </button>
        </div>
      </div>

      {/* User Info */}
      {userInfo && (
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium mb-3">User Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2 text-gray-500" />
              {userInfo?.name || "Unknown"}
            </div>
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2 text-gray-500" />
              {userInfo?.email || "Unknown"}
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2 text-gray-500" />
              {userInfo?.phone || "-"}
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-gray-500" />
              {userInfo?.address || "-"}
            </div>
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-2 text-gray-500" />
              GST: {userInfo?.gstnumber || "-"}
            </div>
          </div>
        </div>
      )}

      {/* Enquiry List */}
      <div className="p-6 space-y-6">
        {enquiries.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No enquiries found for this user.
          </div>
        ) : (
          enquiries.map((enquiry, index) => (
            <div key={enquiry._id} className="border rounded-lg p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Enquiry #{index + 1}
                </h3>

                <button
                  onClick={() => deleteEnquiry(enquiry._id)}
                  className="flex items-center text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>

              {/* Product Info */}
              {enquiry.productId && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Package className="w-4 h-4 mr-2 text-gray-500" />
                    Product Information
                  </h4>

                  <p className="text-sm font-semibold">{enquiry.productId.name}</p>

                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                    {enquiry.productId.description}
                  </p>

                  {enquiry.productId.images?.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto mt-3">
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
                    <ul className="list-disc list-inside text-sm text-gray-700 mt-3">
                      {enquiry.productId.points.map((p, idx) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Variants */}
              {enquiry.variants && enquiry.variants.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Variants</h4>
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
              <div className="flex items-center text-sm text-gray-600 mt-4">
                <Calendar className="w-4 h-4 mr-2" />
                Added At: {formatDate(enquiry.AddedAt)}
              </div>

              <div className="text-xs text-gray-400 mt-1">
                Enquiry ID: {enquiry._id}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SingleUserEnquiries;
