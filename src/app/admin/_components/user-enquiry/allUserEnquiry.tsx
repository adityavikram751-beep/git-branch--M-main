"use client";
import React, { useState, useEffect } from 'react';
import { Search, Eye, AlertCircle, RefreshCw } from 'lucide-react';

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

const AllUserEnquiries = ({ onViewUser }: { onViewUser?: (user: any) => void }) => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const adminToken = localStorage.getItem("adminToken");

  const fetchAllUserEnquiries = async () => {
    try {
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
        setEnquiries(result.data);
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

  // Define a type for the user summary
      type UserEnquirySummary = {
        _id?: string;
        name: string;
        email: string;
        enquiryId: string;
        enquiryCount: number;
        latestEnquiry: string;
        status: string;
        allEnquiries: Enquiry[];
        [key: string]: any;
      };
  
    // Group enquiries by user
    const uniqueUsers = enquiries.reduce<UserEnquirySummary[]>((acc, enquiry) => {
      const userId = enquiry.user_id?._id;
      if (userId && !acc.find((user) => user._id === userId)) {
        const userEnquiries = enquiries.filter(
          (enq) => enq.user_id?._id === userId
        );
        const latestEnquiry = userEnquiries.sort(
          (a, b) => new Date(b.AddedAt).getTime() - new Date(a.AddedAt).getTime()
        )[0];
  
        acc.push({
          _id: enquiry.user_id?._id ?? "",
          name: enquiry.user_id?.name ?? "Unknown",
          email: enquiry.user_id?.email ?? "Unknown",
          enquiryId: enquiry._id,
          enquiryCount: userEnquiries.length,
          latestEnquiry: latestEnquiry.AddedAt,
          status: latestEnquiry.status || "Pending", // fallback
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
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset to first page when filters change
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

  const getStatusBadge = (status: "Approved" | "Pending" | "Rejected" | string = "Pending") => {
    const statusConfig: Record<"Approved" | "Pending" | "Rejected", string> = {
      Approved: "bg-green-100 text-green-800 border-green-200",
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Rejected: "bg-red-100 text-red-800 border-red-200",
    };
    return statusConfig[status as "Approved" | "Pending" | "Rejected"] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const handleViewUser = (user: { [x: string]: any; _id?: string | undefined; name: any; email: any; enquiryId?: string; enquiryCount: any; latestEnquiry?: string; status: any; allEnquiries?: Enquiry[]; }) => {
    if (onViewUser) {
      onViewUser(user);
    } else {
      alert(
        `Viewing details for ${user.name}\nEmail: ${user.email}\nEnquiries: ${user.enquiryCount}\nLatest Status: ${user.status}`
      );
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
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
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="All">All Status</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
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
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th> */}
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
                      {user.enquiryCount} enquir
                      {user.enquiryCount === 1 ? "y" : "ies"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(user.latestEnquiry)}
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(
                        user.status
                      )}`}
                    >
                      {user.status}
                    </span>
                  </td> */}
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
            Page {currentPage} of {totalPages} ({filteredUsers.length} total
            users)
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
    </div>
  );
};

export default AllUserEnquiries;
