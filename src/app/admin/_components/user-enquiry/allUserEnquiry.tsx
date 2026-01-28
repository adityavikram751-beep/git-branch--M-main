"use client";
import React, { useState, useEffect } from "react";
import { Search, Eye, AlertCircle, RefreshCw, X } from "lucide-react";

type UserOrderSummary = {
  _id?: string;
  name: string;
  email: string;
  userId: string;
  orderCount: number;
  latestOrder?: string; // Will fetch separately
  status?: string; // Will fetch separately
};

const AllUserOrders = ({
  onViewUser,
}: {
  onViewUser?: (user: any) => void;
}) => {
  const [users, setUsers] = useState<UserOrderSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ✅ Modal state
  const [selectedUser, setSelectedUser] = useState<UserOrderSummary | null>(
    null
  );
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchAllUserOrders = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken");

      if (!adminToken) {
        throw new Error("No admin token provided. Please log in again.");
      }

      setLoading(true);
      setError(null);

      const response = await fetch(
        "https://barber-syndicate.vercel.app/api/v1/order/userlist",
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
        // Transform API response to match our component
        const transformedUsers = result.data.map((user: any) => ({
          _id: user.userId,
          userId: user.userId,
          name: user.name,
          email: user.email,
          orderCount: user.total || 0,
          latestOrder: "", // We'll fetch this separately if needed
          status: "Active", // Default status
        }));
        setUsers(transformedUsers);
      } else {
        throw new Error("Failed to fetch users");
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch individual user's orders
  const fetchUserOrders = async (userId: string) => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) return;

      setModalLoading(true);
      const response = await fetch(
        `https://barber-syndicate.vercel.app/api/v1/order/user/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setUserOrders(result.data || []);
        }
      }
    } catch (error) {
      console.error("Error fetching user orders:", error);
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUserOrders();
  }, []);

  // Apply filters
  let filteredUsers = users;

  if (searchTerm) {
    filteredUsers = users.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.userId ?? "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const formatDate = (dateString: string | number | Date) => {
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const handleViewUser = async (user: UserOrderSummary) => {
    setSelectedUser(user);
    setUserOrders([]); // Reset previous orders
    await fetchUserOrders(user.userId);

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
          onClick={fetchAllUserOrders}
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
            User Orders Management
          </h1>
          <button
            onClick={fetchAllUserOrders}
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
                Orders
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
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
                  {searchTerm
                    ? "No users match your search"
                    : "No users found"}
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user) => (
                <tr key={user.userId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-gray-900">
                      #{user.userId ? user.userId.slice(-6) : "------"}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user.orderCount} order{user.orderCount === 1 ? "" : "s"}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.email}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewUser(user)}
                      className="text-blue-600 hover:text-blue-900 flex items-center transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Orders
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

      {/* ✅ MODAL (View User Orders) */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedUser.name} - Orders ({selectedUser.orderCount})
                </h2>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  User ID: {selectedUser.userId}
                </p>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-gray-200 rounded-md transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {modalLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                  <span>Loading orders...</span>
                </div>
              ) : userOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No orders found for this user
                </div>
              ) : (
                userOrders.map((order, i) => (
                  <div
                    key={order._id || i}
                    className="border border-gray-200 rounded-lg p-3 mb-3"
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-semibold text-gray-900">
                        Order #{i + 1}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full border ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status || "Pending"}
                      </span>
                    </div>

                    {order.createdAt && (
                      <p className="text-sm text-gray-600 mt-2">
                        <b>Date:</b> {formatDate(order.createdAt)}
                      </p>
                    )}

                    {order._id && (
                      <p className="text-xs text-gray-400 mt-1">
                        Order ID: {order._id}
                      </p>
                    )}
                  </div>
                ))
              )}
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

export default AllUserOrders;