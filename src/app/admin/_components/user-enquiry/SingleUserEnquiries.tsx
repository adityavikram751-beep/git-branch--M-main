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
  ShoppingBag,
  CheckCircle,
  XCircle,
  Filter,
  Loader2,
  ChevronDown,
  FileDown,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type OrderVariant = {
  price: string;
  quantity: string;
  _id: string;
};

type OrderProduct = {
  productId: string;
  name: string;
  variants: OrderVariant[];
  image: string;
};

type Order = {
  _id: string;
  orderId: string;
  product: OrderProduct;
  status: "pending" | "approved" | "cancel";
  createdAt: string;
  updatedAt: string;
};

type UserOrdersData = {
  userId: string;
  name: string;
  email: string;
  addres: string;
  phone: string;
  gst: string;
  orders: Order[];
};

const SingleUserOrders = ({
  userId,
  onBack,
}: {
  userId: string;
  onBack?: () => void;
}) => {
  const [userData, setUserData] = useState<UserOrdersData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const API_BASE_URL = "https://barber-syndicate.vercel.app/api/v1/order";

  const fetchUserOrders = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) {
        setError("No admin token provided. Please log in again.");
        return;
      }

      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/single-order-details/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      const responseText = await response.text();
      console.log("API Response:", responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.error("Response was:", responseText);
        throw new Error(`Server returned invalid JSON. Status: ${response.status}`);
      }

      if (!response.ok) {
        throw new Error(result?.message || `HTTP error! status: ${response.status}`);
      }

      if (result.success) {
        const transformedData = {
          ...result.data,
          orders: result.data.orders.map((order: any) => ({
            ...order,
            status: order.status === "cancelled" ? "cancel" : order.status
          }))
        };
        setUserData(transformedData);
      } else {
        throw new Error(result?.message || "Failed to fetch user orders");
      }
    } catch (error: any) {
      console.error("Error fetching user orders:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, type: "approved" | "cancel") => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) {
        alert("No admin token provided. Please log in again.");
        return;
      }

      setUpdatingStatus(orderId);

      const response = await fetch(
        `${API_BASE_URL}/confrim-order?id=${orderId}&type=${type}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      const responseText = await response.text();
      console.log("Update API Response:", responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.error("Response was:", responseText);
        throw new Error(`Server returned invalid JSON. Status: ${response.status}`);
      }

      if (!response.ok) {
        throw new Error(result?.message || `Failed to update status: ${response.status}`);
      }

      if (result.status === true || result.success === true) {
        setUserData(prev => {
          if (!prev) return null;
          return {
            ...prev,
            orders: prev.orders.map(order => 
              order._id === orderId 
                ? { 
                    ...order, 
                    status: type,
                    updatedAt: new Date().toISOString()
                  } 
                : order
            )
          };
        });
        
        alert(`Order ${type === "approved" ? "approved" : "cancel"} successfully ✅`);
      } else {
        throw new Error(result?.message || "Failed to update order status");
      }
    } catch (error: any) {
      console.error("Error updating order status:", error);
      alert(error.message || "Failed to update order status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  // ✅ UPDATED PDF GENERATION - EXACT MATCH TO INVOICE FORMAT
  const generatePDF = async () => {
    if (!userData || !filteredOrders.length) {
      alert("No orders to download");
      return;
    }

    try {
      setDownloadingPDF(true);
      
      // ✅ FILTER ONLY APPROVED ORDERS
      const approvedOrders = userData.orders.filter(order => order.status === "approved");
      
      if (approvedOrders.length === 0) {
        alert("No approved orders to generate PDF");
        setDownloadingPDF(false);
        return;
      }
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Load logo
      let logoDataUrl = "";
      try {
        const logoResponse = await fetch("/logo.png");
        const logoBlob = await logoResponse.blob();
        logoDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(logoBlob);
        });
      } catch (err) {
        console.log("Logo not found, continuing without logo");
      }
      
      // ========== HEADER ==========
      let yPos = 22;
      
      // Logo position (top right, well above everything)
      if (logoDataUrl) {
        doc.addImage(logoDataUrl, "PNG", pageWidth - 58, 5, 45, 45);
      }
      
      // Title
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Order Estimate", 60, yPos);
      
      yPos += 18;
      
      // ========== LEFT COLUMN - COMPANY INFO ==========
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Barber Syndicate", 20, yPos);
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      yPos += 5;
      doc.text("Shop No.3846, Main Market,", 20, yPos);
      yPos += 4;
      doc.text("Mori Gate, Delhi - 110006", 20, yPos);
      yPos += 4;
      doc.text("GSTIN/UIN: 07AHUPA1680K1Z2", 20, yPos);
      yPos += 4;
      doc.text("State Name : Delhi, Code : 07", 20, yPos);
      yPos += 4;
      doc.text("Contact : 011-40349786,+91 9818 396 703", 20, yPos);
      yPos += 4;
      doc.text("E-Mail : farhan3846@gmail.com", 20, yPos);
      
      // ========== RIGHT COLUMN - DATE INFO ==========
      let rightYPos = yPos - 24;
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Date", pageWidth - 80, rightYPos);
      doc.setFont("helvetica", "bold");
      doc.text(new Date().toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: '2-digit' 
      }), pageWidth - 80, rightYPos + 4);
      
      yPos += 8;
      
      // ========== BUYER DETAILS ==========
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Buyer (Bill to)", 20, yPos);
      
      yPos += 6;
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("Client Details", 20, yPos);
      
      yPos += 5;
      
      // Client details table
      if (userData) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        
        if (userData.name) {
          doc.text(`Name: ${userData.name}`, 20, yPos);
          yPos += 4;
        }
        if (userData.phone) {
          doc.text(`Phone: ${userData.phone}`, 20, yPos);
          yPos += 4;
        }
        if (userData.email) {
          doc.text(`Email: ${userData.email}`, 20, yPos);
          yPos += 4;
        }
        if (userData.addres) {
          doc.text(`Address: ${userData.addres}`, 20, yPos);
          yPos += 4;
        }
        if (userData.gst) {
          doc.text(`GST: ${userData.gst}`, 20, yPos);
          yPos += 4;
        }
      }
      
      yPos += 6;
      
      // ========== TABLE HEADER ==========
      const tableStartY = yPos;
      
      // Table structure
      const tableData: any[] = [];
      let grandTotal = 0;
      
      approvedOrders.forEach((order) => {
        if (order.product?.variants) {
          order.product.variants.forEach((variant) => {
            const quantity = variant.quantity;
            const description = order.product.name;
            const rateInclTax = parseFloat(variant.price);
            const per = "Pcs"; // You can modify this based on product type
            
            // Add to grand total
            grandTotal += rateInclTax;
            
            tableData.push([
              quantity + " " + per,
              description,
              rateInclTax.toFixed(2),
              per
            ]);
          });
        }
      });
      
      // Add table with total row
      autoTable(doc, {
        startY: tableStartY,
        head: [['Quantity', 'Description of Goods', 'Rate\n(Incl. of Tax)', 'per']],
        body: [
          ...tableData,
          ['', '', 'Total', `${grandTotal.toFixed(2)}`] // Total without ₹ symbol to save space
        ],
        theme: 'grid',
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          lineWidth: 0.5,
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'center',
          valign: 'middle'
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          lineWidth: 0.5,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 25, halign: 'center' },
          1: { cellWidth: 85, halign: 'left' },
          2: { cellWidth: 30, halign: 'right' },
          3: { cellWidth: 25, halign: 'right' }
        },
        margin: { left: 20, right: 20 },
        tableWidth: 165,
        willDrawCell: function(data) {
          // Make total row bold
          if (data.row.index === tableData.length && data.section === 'body') {
            doc.setFont("helvetica", "bold");
          }
        },
        didDrawPage: function(data) {
          yPos = data.cursor?.y || yPos;
        }
      });
      
      yPos += 10;
      
      // ========== AMOUNT IN WORDS ==========
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Amount Chargeable (in words)", 20, yPos);
      doc.text("E. & O.E", pageWidth - 30, yPos, { align: "right" });
      
      yPos += 5;
      doc.setFont("helvetica", "bold");
      const amountInWords = convertNumberToWords(grandTotal);
      doc.text(`INR ${amountInWords} Only`, 20, yPos);
      
      yPos += 10;
      
      // ========== FOOTER ==========
      // Bottom line
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(20, pageHeight - 30, pageWidth - 20, pageHeight - 30);
      
      // Jurisdiction text
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("SUBJECT TO DELHI JURISDICTION", pageWidth / 2, pageHeight - 22, { align: "center" });
      
      doc.setFont("helvetica", "normal");
      doc.text("This is a Computer Generated Invoice", pageWidth / 2, pageHeight - 15, { align: "center" });
      
      // Save PDF
      const fileName = `Order_Estimate_${userData.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);
      
      alert("Order Estimate PDF downloaded successfully! ✅");
      
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF: " + error.message);
    } finally {
      setDownloadingPDF(false);
    }
  };

  // Helper function to convert number to words (Indian numbering system)
  const convertNumberToWords = (num: number): string => {
    if (num === 0) return 'Zero';
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    const convertBelow100 = (n: number): string => {
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    };
    
    const convertBelow1000 = (n: number): string => {
      if (n < 100) return convertBelow100(n);
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertBelow100(n % 100) : '');
    };
    
    const intPart = Math.floor(num);
    
    // Handle crores
    if (intPart >= 10000000) {
      const crores = Math.floor(intPart / 10000000);
      const remainder = intPart % 10000000;
      return convertBelow1000(crores) + ' Crore' + (remainder ? ' ' + convertNumberToWords(remainder) : '');
    }
    
    // Handle lakhs
    if (intPart >= 100000) {
      const lakhs = Math.floor(intPart / 100000);
      const remainder = intPart % 100000;
      return convertBelow100(lakhs) + ' Lakh' + (remainder ? ' ' + convertNumberToWords(remainder) : '');
    }
    
    // Handle thousands
    if (intPart >= 1000) {
      const thousands = Math.floor(intPart / 1000);
      const remainder = intPart % 1000;
      return convertBelow100(thousands) + ' Thousand' + (remainder ? ' ' + convertBelow1000(remainder) : '');
    }
    
    return convertBelow1000(intPart);
  };

  const confirmDeleteOrder = (orderId: string) => {
    setDeleteConfirm(orderId);
  };

  const deleteOrder = async (orderId: string) => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) {
        alert("No admin token provided. Please log in again.");
        return;
      }

      const res = await fetch(
        `${API_BASE_URL}/${orderId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      const responseText = await res.text();
      console.log("Delete API Response:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.error("Response was:", responseText);
        throw new Error(`Server returned invalid JSON. Status: ${res.status}`);
      }

      if (!res.ok) {
        throw new Error(data?.message || `Delete failed: ${res.status}`);
      }

      setUserData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          orders: prev.orders.filter(order => order._id !== orderId)
        };
      });
      
      setDeleteConfirm(null);
      alert("Order deleted ✅");
    } catch (err: any) {
      alert(err.message || "Delete failed");
      setDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  useEffect(() => {
    if (userId) fetchUserOrders();
  }, [userId]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const filteredOrders = userData?.orders?.filter(order => {
    if (statusFilter === "all") return true;
    return order.status === statusFilter;
  }) || [];

  const getStatusCount = (status: string) => {
    if (!userData?.orders) return 0;
    if (status === "all") return userData.orders.length;
    return userData.orders.filter(o => o.status === status).length;
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "all": return "bg-blue-600";
      case "pending": return "bg-yellow-600";
      case "approved": return "bg-green-600";
      case "cancel": return "bg-red-600";
      default: return "bg-gray-600";
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case "all": return "All Orders";
      case "pending": return "Pending";
      case "approved": return "Approved";
      case "cancel": return "Cancel";
      default: return status;
    }
  };

  const displayStatus = (status: string) => {
    switch(status) {
      case "pending": return "Pending";
      case "approved": return "Approved";
      case "cancel": return "Cancel";
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center text-red-600 mb-4">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>Error: {error}</span>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={fetchUserOrders}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        Loading user orders...
      </div>
    );
  }

  const orders = filteredOrders;
  const allOrdersCount = userData?.orders?.length || 0;

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
        {/* Fixed Header Section */}
        <div className="flex-shrink-0">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center px-3 py-2 border rounded-md hover:bg-gray-100"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </button>
              )}
              
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <ShoppingBag className="w-5 h-5 mr-2" />
                User Orders ({allOrdersCount})
              </h2>
            </div>

            {/* Right Side - All buttons */}
            <div className="flex items-center gap-3">
              {/* Download PDF Button */}
              {orders.length > 0 && (
                <button
                  onClick={generatePDF}
                  disabled={downloadingPDF}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Download PDF Report"
                >
                  {downloadingPDF ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FileDown className="w-4 h-4 mr-2" />
                  )}
                  {downloadingPDF ? "Generating..." : "Download PDF"}
                </button>
              )}

              {/* Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`flex items-center justify-between px-4 py-2 rounded-md text-sm font-medium ${getStatusColor(statusFilter)} text-white hover:opacity-90`}
                >
                  <div className="flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    <span>{getStatusLabel(statusFilter)}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
                </button>
                
                {isFilterOpen && (
                  <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-64">
                    <div className="py-1">
                      <div className="px-4 py-2 text-xs text-gray-500 border-b">
                        Filter by Status
                      </div>
                      {["all", "pending", "approved", "cancel"].map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setStatusFilter(status);
                            setIsFilterOpen(false);
                          }}
                          className={`flex items-center justify-between w-full px-4 py-2 text-sm text-left hover:bg-gray-50 ${
                            statusFilter === status ? "bg-gray-100" : ""
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-3 ${getStatusColor(status).replace('600', '500')}`}></div>
                            <span>{getStatusLabel(status)}</span>
                          </div>
                          <span className="text-gray-500">({getStatusCount(status)})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchUserOrders}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </button>
            </div>
          </div>

          {/* User Info */}
          {userData && (
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium mb-3">User Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-500" />
                  {userData.name || "Unknown"}
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-500" />
                  {userData.email || "Unknown"}
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-500" />
                  {userData.phone || "-"}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                  {userData.addres || "-"}
                </div>
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-gray-500" />
                  GST: {userData.gst || "-"}
                </div>
              </div>
              
              {/* Current Filter Display */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {orders.length} of {allOrdersCount} orders
                </div>
                
                {statusFilter !== "all" && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Current filter:</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(statusFilter)} text-white`}>
                      {getStatusLabel(statusFilter)}
                      <button 
                        onClick={() => setStatusFilter("all")}
                        className="ml-2 hover:opacity-80"
                      >
                        ✕
                      </button>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Orders List */}
        <div className="flex-grow overflow-y-auto p-6">
          {orders.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              No {statusFilter !== "all" ? statusFilter : ""} orders found for this user.
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order, index) => (
                <div key={order._id} className="border rounded-lg p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        Order {index + 1}
                      </h3>
                      <p className="text-sm text-gray-600"></p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        order.status === "approved" ? "bg-green-100 text-green-800" :
                        order.status === "cancel" ? "bg-red-100 text-red-800" :
                        "bg-blue-100 text-blue-800"
                      }`}>
                        {displayStatus(order.status)}
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  {order.product && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2 flex items-center">
                        <Package className="w-4 h-4 mr-2 text-gray-500" />
                        Product Information
                      </h4>

                      <div className="flex gap-4">
                        {order.product.image && (
                          <img
                            src={order.product.image}
                            alt={order.product.name}
                            className="w-24 h-24 object-cover rounded-md border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://via.placeholder.com/100x100?text=No+Image";
                            }}
                          />
                        )}
                        
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{order.product.name}</p>
                          <p className="text-xs text-gray-500 mt-1"></p>
                        </div>
                      </div>

                      {/* Variants */}
                      {order.product.variants && order.product.variants.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Variants</h4>
                          <ul className="space-y-2 text-sm">
                            {order.product.variants.map((variant) => (
                              <li
                                key={variant._id}
                                className="border rounded-md px-3 py-2 flex justify-between"
                              >
                                <span>Quantity: {variant.quantity}</span>
                                <span className="font-medium">₹{variant.price}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Order Dates */}
                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(order.createdAt)}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    {order.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateOrderStatus(order._id, "approved")}
                          disabled={updatingStatus === order._id}
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingStatus === order._id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          Approve Order
                        </button>
                        
                        <button
                          onClick={() => updateOrderStatus(order._id, "cancel")}
                          disabled={updatingStatus === order._id}
                          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingStatus === order._id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4 mr-2" />
                          )}
                          Cancel Order
                        </button>
                      </>
                    )}
                    
                    {deleteConfirm === order._id ? (
                      <div className="flex items-center gap-2 ml-auto">
                        <span className="text-sm text-gray-600 mr-2">Are you sure?</span>
                        <button
                          onClick={cancelDelete}
                          className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => confirmDeleteOrder(order._id)}
                      >
                      
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleUserOrders;