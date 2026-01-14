"use client";
import React, { useState, useEffect } from "react";
import { Search, Eye, AlertCircle, RefreshCw, X } from "lucide-react";

type Enquiry = {
  _id: string;
  user_id?: {
    _id: string;
    name?: string;
    email?: string;
    [key: string]: any;
  };
  AddedAt: string;
  status?: string;
  [key: string]: any;
};

type UserEnquirySummary = {
  _id?: string;
  name: string;
  email: string;
  enquiryId: string;
  enquiryCount: number;
  latestEnquiry: string;
  status: string;
  allEnquiries: Enquiry[];
};

const AllUserEnquiries = ({
  onViewUser,
}: {
  onViewUser?: (user: any) => void;
}) => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ✅ Modal state
  const [selectedUser, setSelectedUser] = useState<UserEnquirySummary | null>(
    null
  );

  const fetchAllUserEnquiries = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken");

      if (!adminToken) {
        throw new Error("No admin token provided. Please log in again.");
      }

      setLoading(true);
      setError(null);

      const response = await fetch(
        "https://barber-syndicate.vercel.app/api/v1/enquiry/all",
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
        setEnquiries(result.data || []);
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

  useEffect(() => {
    fetchAllUserEnquiries();
  }, []);

  // ✅ Group enquiries by user (FIXED SORT)
  const uniqueUsers = enquiries.reduce<UserEnquirySummary[]>((acc, enquiry) => {
    const userId = enquiry.user_id?._id;

    if (userId && !acc.find((user) => user._id === userId)) {
      const userEnquiries = enquiries.filter(
        (enq) => enq.user_id?._id === userId
      );

      // ✅ FIX: sort on copy (no mutation)
      const latestEnquiry = [...userEnquiries].sort(
        (a, b) =>
          new Date(b.AddedAt).getTime() - new Date(a.AddedAt).getTime()
      )[0];

      acc.push({
        _id: enquiry.user_id?._id ?? "",
        name: enquiry.user_id?.name ?? "Unknown",
        email: enquiry.user_id?.email ?? "Unknown",
        enquiryId: enquiry._id,
        enquiryCount: userEnquiries.length,
        latestEnquiry: latestEnquiry?.AddedAt ?? enquiry.AddedAt,
        status: latestEnquiry?.status || "Pending",
        allEnquiries: userEnquiries,
      });
    }

    return acc;
  }, []);

  // Apply filters
  let filteredUsers = uniqueUsers;

  if (searchTerm) {
    filteredUsers = uniqueUsers.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user._id ?? "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (statusFilter !== "All") {
    filteredUsers = filteredUsers.filter((user) => user.status === statusFilter);
  }

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const formatDate = (dateString: string | number | Date) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewUser = (user: UserEnquirySummary) => {
    // ✅ open modal and show all enquiries
    setSelectedUser(user);

    if (onViewUser) {
      onViewUser(user);
    }
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center text-red-600 mb-4">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>Error: {error}</span>
        </div>
        <button
          onClick={fetchAllUserEnquiries}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center mx-auto"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 relative">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            User Enquiries Management
          </h1>
          <button
            onClick={fetchAllUserEnquiries}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by User ID, Name, Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

         
        </div>

        <div className="mt-3 text-sm text-gray-600">
          Showing {paginatedUsers.length} of {filteredUsers.length} users
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Enquiries
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Latest Activity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                    <span>Loading users...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  {searchTerm || statusFilter !== "All"
                    ? "No users match your filters"
                    : "No users found"}
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-gray-900">
                      #{user._id ? user._id.slice(-6) : "------"}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user.enquiryCount} enquir{user.enquiryCount === 1 ? "y" : "ies"}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(user.latestEnquiry)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewUser(user)}
                      className="text-blue-600 hover:text-blue-900 flex items-center transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages} ({filteredUsers.length} total users)
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ✅ MODAL (View Details) */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedUser.name} - All Enquiries ({selectedUser.allEnquiries.length})
                </h2>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-gray-200 rounded-md transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {[...selectedUser.allEnquiries]
                .sort(
                  (a, b) =>
                    new Date(b.AddedAt).getTime() - new Date(a.AddedAt).getTime()
                )
                .map((enq, i) => (
                  <div
                    key={enq._id}
                    className="border border-gray-200 rounded-lg p-3 mb-3"
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-semibold text-gray-900">
                        Enquiry #{i + 1}
                      </p>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 border">
                        {enq.status || "Pending"}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mt-2">
                      <b>Date:</b> {formatDate(enq.AddedAt)}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      Enquiry ID: {enq._id}
                    </p>
                  </div>
                ))}
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUserEnquiries;
