"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Clock,
  Package,
  Star,
  Trash2,
  Loader,
  CheckSquare,
  Square,
  Eye,
  ShoppingBag,
} from "lucide-react";

// ================= TYPES =================
type VariantUI = {
  _id: string; // variantId
  variantName: string;
  qty: number; // UI me show karne ke liye
  unitPrice: number; // unit price
  totalPrice: number; // ❌ multiply nahi hoga (same as unitPrice)
};

type EnquiryUIItem = {
  _id: string; // enquiryId
  product: {
    _id: string;
    name: string;
    image: string;
    description: string;
    points: string[];
    isFeature: boolean;
  };
  variants: VariantUI[];
  AddedAt: string;
};

type ProductCartItem = {
  productId: string;
  enquiryIds: string[]; // backend delete/order ke liye
  product: EnquiryUIItem["product"];
  variants: VariantUI[]; // merged variants
  AddedAt: string;
};

// Order types for API response
type ApiOrderVariant = {
  price: string;
  quantity: string;
  _id: string;
  variantName?: string; // Optional field
};

type ApiOrder = {
  _id: string;
  productName: string;
  variants: ApiOrderVariant[];
  status: string;
  createdAt: string;
  // These might come from API or we calculate
  totalAmount?: number;
  userId?: string;
  items?: any[];
};

type Order = ApiOrder;

export default function InquiryPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"cart" | "orders">("cart");
  const [items, setItems] = useState<EnquiryUIItem[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [placingOrder, setPlacingOrder] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  // ================== HELPERS ==================
  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "Invalid Date" || dateString.toLowerCase().includes("invalid")) {
      return "—";
    }
    
    try {
      // Try parsing the date directly
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        // Try to fix common date format issues
        // Remove any extra quotes
        const cleanDateString = dateString.replace(/['"]/g, '');
        
        // Try different date formats
        const formats = [
          // ISO format
          () => new Date(cleanDateString),
          // Date with timezone
          () => new Date(cleanDateString.replace(' ', 'T') + 'Z'),
          // Timestamp
          () => new Date(parseInt(cleanDateString)),
        ];
        
        for (const format of formats) {
          try {
            const testDate = format();
            if (!isNaN(testDate.getTime())) {
              return testDate.toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
            }
          } catch {}
        }
        
        return "—";
      }
      
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();

    if (s === "approved") {
      return (
        <Badge className="bg-green-100 text-green-700 border border-green-200">
          Approved
        </Badge>
      );
    }

    if (s === "Cancel" || s === "cancel") {
      return (
        <Badge className="bg-red-100 text-red-700 border border-red-200">
         Cancel
        </Badge>
      );
    }

    return (
      <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200">
        Pending
      </Badge>
    );
  };

  const extractQuantityNumber = (quantityStr: string): number => {
    if (!quantityStr) return 1;
    
    const numericStr = quantityStr.replace(/[^\d.]/g, '');
    const num = parseFloat(numericStr);
    
    if (isNaN(num)) {
      const match = quantityStr.match(/\d+/);
      return match ? parseInt(match[0]) : 1;
    }
    
    return num;
  };

  // ================== MERGE VARIANTS ==================
  const mergeVariants = (variants: VariantUI[]) => {
    const map = new Map<string, VariantUI>();

    for (const v of variants) {
      const key = v._id;

      if (!map.has(key)) {
        map.set(key, { ...v });
      } else {
        const prev = map.get(key)!;
        const mergedQty = Number(prev.qty || 0) + Number(v.qty || 0);
        const unitPrice = Number(prev.unitPrice || v.unitPrice || 0);

        map.set(key, {
          ...prev,
          qty: mergedQty,
          unitPrice,
          totalPrice: unitPrice,
        });
      }
    }

    return Array.from(map.values());
  };

  // ================== LOAD ENQUIRY ==================
  useEffect(() => {
    const fetchEnquiry = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const storedUserId = localStorage.getItem("userId");

        if (!token || !storedUserId) {
          setItems([]);
          setSelected({});
          setError("You are not logged in. Please log in to view your inquiry.");
          return;
        }

        const res = await fetch(
          `https://barber-syndicate.vercel.app/api/v1/enquiry/${storedUserId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok || !data?.success) {
          throw new Error(data?.message || "Failed to fetch enquiry");
        }

        const enquiryList = data.enquiries || data.enquiry || data.data || [];

        if (!Array.isArray(enquiryList) || enquiryList.length === 0) {
          setItems([]);
          setSelected({});
          setError(null);
          return;
        }

        const mapped: EnquiryUIItem[] = enquiryList.map((e: any) => {
          const productId = e.productId?._id || e.productId || "p0";

          const product = {
            _id: productId,
            name: e.productId?.name || e.name || "Product",
            image:
              e.productId?.images?.[0] || e.image || "/placeholder-image.jpg",
            description: e.productId?.description || e.description || "",
            points: e.productId?.points || e.points || [],
            isFeature: !!e.productId?.isFeature,
          };

          const variantsRaw = Array.isArray(e?.variants) ? e.variants : [];

          const fallbackVariant = {
            variantId: e.variantId?._id || e.variantId,
            variantName: e.variantName,
            selectedQuantity: e.quantity,
            price: e.price,
            totalPrice: e.totalPrice,
          };

          const finalVariants = (variantsRaw.length > 0
            ? variantsRaw
            : [fallbackVariant]
          )
            .filter(Boolean)
            .map((v: any, idx: number): VariantUI => {
              const variantId =
                v?.variantId?._id || v?.variantId || v?._id || `v-${idx}`;

              const qtyRaw = v?.selectedQuantity ?? v?.qty ?? v?.quantity ?? 1;
              const qty = Number.isFinite(Number(qtyRaw)) ? Number(qtyRaw) : 1;

              const unitPriceRaw = v?.price ?? 0;
              const unitPrice = Number.isFinite(Number(unitPriceRaw))
                ? Number(unitPriceRaw)
                : 0;

              const totalPrice = unitPrice;

              return {
                _id: String(variantId),
                variantName:
                  v?.variantName ||
                  v?.variantSize ||
                  v?.variantColor ||
                  "Default Variant",
                qty,
                unitPrice,
                totalPrice,
              };
            });

          return {
            _id: e._id,
            product,
            variants: finalVariants,
            AddedAt: e.AddedAt || e.createdAt || new Date().toISOString(),
          };
        });

        setItems(mapped);

        // ✅ default select all PRODUCT cards
        const productMap = new Map<string, ProductCartItem>();

        mapped.forEach((enq) => {
          const pid = enq.product._id;

          if (!productMap.has(pid)) {
            productMap.set(pid, {
              productId: pid,
              enquiryIds: [enq._id],
              product: enq.product,
              variants: [...enq.variants],
              AddedAt: enq.AddedAt,
            });
          } else {
            const prev = productMap.get(pid)!;
            productMap.set(pid, {
              ...prev,
              enquiryIds: Array.from(new Set([...prev.enquiryIds, enq._id])),
              variants: mergeVariants([...prev.variants, ...enq.variants]),
              AddedAt:
                new Date(prev.AddedAt) > new Date(enq.AddedAt)
                  ? prev.AddedAt
                  : enq.AddedAt,
            });
          }
        });

        const mergedProducts = Array.from(productMap.values());

        const initSelected: Record<string, boolean> = {};
        mergedProducts.forEach((p) => (initSelected[p.productId] = true));
        setSelected(initSelected);
      } catch (err: any) {
        setItems([]);
        setSelected({});
        setError(err?.message || "Failed to load enquiry");
      } finally {
        setLoading(false);
      }
    };

    fetchEnquiry();
  }, []);

  // ================== PRODUCT-WISE CART ==================
  const productCart = useMemo(() => {
    const productMap = new Map<string, ProductCartItem>();

    items.forEach((enq) => {
      const pid = enq.product._id;

      if (!productMap.has(pid)) {
        productMap.set(pid, {
          productId: pid,
          enquiryIds: [enq._id],
          product: enq.product,
          variants: [...enq.variants],
          AddedAt: enq.AddedAt,
        });
      } else {
        const prev = productMap.get(pid)!;
        productMap.set(pid, {
          ...prev,
          enquiryIds: Array.from(new Set([...prev.enquiryIds, enq._id])),
          variants: mergeVariants([...prev.variants, ...enq.variants]),
          AddedAt:
            new Date(prev.AddedAt) > new Date(enq.AddedAt)
              ? prev.AddedAt
              : enq.AddedAt,
        });
      }
    });

    return Array.from(productMap.values());
  }, [items]);

  // ================== CART CALCULATIONS ==================
  const allSelected = useMemo(() => {
    if (productCart.length === 0) return false;
    return productCart.every((p) => selected[p.productId]);
  }, [productCart, selected]);

  const selectedProducts = useMemo(() => {
    return productCart.filter((p) => selected[p.productId]);
  }, [productCart, selected]);

  // ✅ Selected total = sum of unitPrice only (NO MULTIPLY)
  const selectedTotal = useMemo(() => {
    return selectedProducts.reduce((sum, p) => {
      const productTotal = p.variants.reduce(
        (s, v) => s + Number(v.unitPrice || 0),
        0
      );
      return sum + productTotal;
    }, 0);
  }, [selectedProducts]);

  // ================== CART ACTIONS ==================
  const handleToggleSelect = (productId: string) => {
    setSelected((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const handleSelectAll = () => {
    if (productCart.length === 0) return;
    const next: Record<string, boolean> = {};
    productCart.forEach((p) => (next[p.productId] = !allSelected));
    setSelected(next);
  };

  // ================== DELETE PRODUCT ==================
  const handleDeleteProduct = async (enquiryIds: string[]) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Login required!");
        return;
      }

      await Promise.all(
        enquiryIds.map(async (eid) => {
          const res = await fetch(
            `https://barber-syndicate.vercel.app/api/v1/enquiry/${eid}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = await res.json();
          if (!res.ok || !data?.success) {
            throw new Error(data?.message || "Delete failed");
          }
        })
      );

      setItems((prev) => prev.filter((x) => !enquiryIds.includes(x._id)));
    } catch (err: any) {
      alert(err?.message || "Delete failed");
    }
  };

  // ================== PLACE ORDER ==================
  const handlePlaceOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      const storedUserId = localStorage.getItem("userId");

      if (!token || !storedUserId) {
        alert("Login required!");
        return;
      }

      if (selectedProducts.length === 0) {
        alert("Please select at least 1 item!");
        return;
      }

      setPlacingOrder(true);

      const enquiryIds = Array.from(
        new Set(selectedProducts.flatMap((p) => p.enquiryIds))
      );

      const payload = {
        enquiry_id: enquiryIds,
        user_id: storedUserId,
      };

      const res = await fetch(
        "https://barber-syndicate.vercel.app/api/v1/order/place-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      const ok = res.ok && (data?.status === true || data?.success === true);

      if (!ok) throw new Error(data?.message || "Order failed");

      alert("✅ Order placed successfully!");
      
      // Refresh orders if on orders tab
      if (activeTab === "orders") {
        await fetchOrders();
      }
      
      // Refresh cart items
      const token2 = localStorage.getItem("token");
      const storedUserId2 = localStorage.getItem("userId");
      
      if (token2 && storedUserId2) {
        const res2 = await fetch(
          `https://barber-syndicate.vercel.app/api/v1/enquiry/${storedUserId2}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token2}`,
            },
          }
        );
        
        const data2 = await res2.json();
        if (res2.ok && data2?.success) {
          const enquiryList2 = data2.enquiries || data2.enquiry || data2.data || [];
          
          if (Array.isArray(enquiryList2) && enquiryList2.length > 0) {
            const mapped2: EnquiryUIItem[] = enquiryList2.map((e: any) => {
              const productId = e.productId?._id || e.productId || "p0";

              const product = {
                _id: productId,
                name: e.productId?.name || e.name || "Product",
                image:
                  e.productId?.images?.[0] || e.image || "/placeholder-image.jpg",
                description: e.productId?.description || e.description || "",
                points: e.productId?.points || e.points || [],
                isFeature: !!e.productId?.isFeature,
              };

              const variantsRaw = Array.isArray(e?.variants) ? e.variants : [];

              const fallbackVariant = {
                variantId: e.variantId?._id || e.variantId,
                variantName: e.variantName,
                selectedQuantity: e.quantity,
                price: e.price,
                totalPrice: e.totalPrice,
              };

              const finalVariants = (variantsRaw.length > 0
                ? variantsRaw
                : [fallbackVariant]
              )
                .filter(Boolean)
                .map((v: any, idx: number): VariantUI => {
                  const variantId =
                    v?.variantId?._id || v?.variantId || v?._id || `v-${idx}`;

                  const qtyRaw = v?.selectedQuantity ?? v?.qty ?? v?.quantity ?? 1;
                  const qty = Number.isFinite(Number(qtyRaw)) ? Number(qtyRaw) : 1;

                  const unitPriceRaw = v?.price ?? 0;
                  const unitPrice = Number.isFinite(Number(unitPriceRaw))
                    ? Number(unitPriceRaw)
                    : 0;

                  const totalPrice = unitPrice;

                  return {
                    _id: String(variantId),
                    variantName:
                      v?.variantName ||
                      v?.variantSize ||
                      v?.variantColor ||
                      "Default Variant",
                    qty,
                    unitPrice,
                    totalPrice,
                  };
                });

              return {
                _id: e._id,
                product,
                variants: finalVariants,
                AddedAt: e.AddedAt || e.createdAt || new Date().toISOString(),
              };
            });

            setItems(mapped2);
          } else {
            setItems([]);
            setSelected({});
          }
        }
      }
    } catch (err: any) {
      alert(err?.message || "Order failed");
    } finally {
      setPlacingOrder(false);
    }
  };

  // ================== FETCH ORDERS ==================
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      setOrdersError(null);

      const token = localStorage.getItem("token");
      const storedUserId = localStorage.getItem("userId");

      if (!token || !storedUserId) {
        setOrdersError("Login required to view orders.");
        return;
      }

      const res = await fetch(
        `https://barber-syndicate.vercel.app/api/v1/order/user-orders/${storedUserId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok || (!data?.success && !data?.status)) {
        throw new Error(data?.message || "Failed to fetch orders");
      }

      // Transform API data
      const ordersData = data.data || data.orders || data.userOrders || [];
      
      const transformedOrders: Order[] = ordersData.map((order: any) => {
        // Calculate total from variants
        const totalAmount = order.variants?.reduce((sum: number, variant: ApiOrderVariant) => {
          const price = Number(variant.price || 0);
          return sum + price; // Only sum prices, no multiplication
        }, 0) || 0;

        // Fix date format if needed
        let createdAt = order.createdAt || order.orderDate;
        
        // If date is invalid or missing, use current date
        if (!createdAt || createdAt.includes("Invalid")) {
          createdAt = new Date().toISOString();
        }

        return {
          ...order,
          totalAmount,
          createdAt: createdAt,
        };
      });

      setOrders(transformedOrders);
    } catch (err: any) {
      setOrdersError(err?.message || "Failed to fetch orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleOpenOrders = async () => {
    setActiveTab("orders");
    if (orders.length === 0) await fetchOrders();
  };

  // ================= UI =================
  return (
    <div className="min-h-screen bg-yellow-50">
      {/* HEADER */}
<div
  id="cart-action-bar"
  className="
    bg-yellow-50 border-b border-gray-300
    w-full
    sticky top-[64px]
    md:top-[65px]
    z-40
  "
>



<div className="max-w-7xl mx-auto px-4 py-3">
<div className="flex items-center justify-between gap-2">
            {activeTab === "cart" ? (
          <button
  onClick={handleSelectAll}
  disabled={productCart.length === 0}
  className="
    flex items-center gap-2
    px-3 py-2
    rounded-xl
    bg-white border border-gray-300
    font-semibold
    text-sm
    disabled:opacity-50
  "
>


                {allSelected ? (
                  <CheckSquare className="w-5 h-5 text-green-600" />
                ) : (
                  <Square className="w-5 h-5 text-gray-500" />
                )}
                <span className="text-sm sm:text-base">Select All</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab("cart")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition font-semibold"
              >
                <ShoppingBag className="w-5 h-5 text-gray-700" />
                <span className="text-sm sm:text-base">Back to Cart</span>
              </button>
            )}

           <button
  onClick={handleOpenOrders}
  className="
    flex items-center gap-2
    px-4 py-2
    rounded-xl
    bg-[#B30000] text-white
    font-bold
    text-sm
    hover:bg-red-700
    transition
  "
>

              <Eye className="w-5 h-5" />
              <span className="text-sm sm:text-base">View Orders</span>
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
<div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-12 pt-[110px] md:pt-12 lg:pt-24 pb-10">
        {loading ? (
          <div className="min-h-[60vh] flex justify-center items-center px-4">
            <div className="text-center">
              <Loader className="h-10 w-10 animate-spin mx-auto mb-4 text-[#B30000]" />
              <p className="text-gray-600">Loading your inquiry...</p>
            </div>
          </div>
        ) : activeTab === "cart" ? (
          <div className="space-y-4 sm:space-y-8">
            {productCart.length === 0 ? (
              <Card className="max-w-xl mx-auto">
                <CardContent className="pt-10 pb-10">
                  <div className="text-center">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-700 font-semibold">
                      No inquiry data found.
                    </p>
                    {error && (
                      <p className="text-sm text-red-600 mt-2">{error}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {productCart.map((p, index) => {
                  const checked = !!selected[p.productId];

                  // ✅ Product Total = sum of unitPrice only (NO MULTIPLY)
                  const productTotal = p.variants.reduce(
                    (sum, v) => sum + Number(v.unitPrice || 0),
                    0
                  );

                  return (
                    <Card
                      key={p.productId}
                      className="shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <CardHeader className="pb-3 sm:pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => handleToggleSelect(p.productId)}
                              className="mt-1"
                            >
                              {checked ? (
                                <CheckSquare className="w-6 h-6 text-green-600" />
                              ) : (
                                <Square className="w-6 h-6 text-gray-500" />
                              )}
                            </button>

                            <div className="min-w-0 flex-1">
                              <CardTitle className="text-base sm:text-lg truncate">
                                Cart Item {index + 1}
                              </CardTitle>

                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <p className="text-xs sm:text-sm text-gray-600 truncate">
                                  {formatDate(p.AddedAt)}
                                </p>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteProduct(p.enquiryIds)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition self-start sm:self-auto"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="text-sm font-semibold">Delete</span>
                          </button>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-3 sm:space-y-4">
                            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
                              <img
                                src={p.product.image || "/placeholder-image.jpg"}
                                alt={p.product.name}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          </div>

                          <div className="space-y-3 sm:space-y-4">
                            <div>
                              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mt-1">
                                {p.product.name}
                              </h3>

                              {p.product.isFeature && (
                                <Badge
                                  variant="secondary"
                                  className="mt-2 bg-yellow-100 text-yellow-800 text-xs"
                                >
                                  <Star className="w-3 h-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                            </div>

                            {/* ✅ VARIANTS LIST (SCROLLABLE) */}
                            <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                              <div className="max-h-[220px] overflow-y-auto pr-1 space-y-3">
                                {p.variants.map((v) => (
                                  <div
                                    key={v._id}
                                    className="bg-white rounded-lg p-3 border border-gray-200"
                                  >
                                  
                                    {/* ✅ Quantity SHOW (12 pcs etc) */}
                                    <p className="text-sm text-gray-700 mt-1">
                                      <span className="font-semibold">
                                        Quantity:
                                      </span>{" "}
                                      {Number(v.qty || 0)} Pcs
                                    </p>

                                    {/* ✅ Unit Price */}
                                    <p className="text-sm text-gray-700 mt-1">
                                      <span className="font-semibold">
                                        Unit Price:
                                      </span>{" "}
                                      ₹{Number(v.unitPrice || 0).toLocaleString()}
                                    </p>
                                  </div>
                                ))}
                              </div>

                              {/* ✅ ONLY ONE TOTAL (Sticky inside cart) */}
                              <div className="sticky bottom-0 bg-gray-50 pt-3 border-t">
                                <p className="text-base font-extrabold text-[#B30000] text-right">
                                  Product Total: ₹{productTotal.toLocaleString()}
                                </p>
                              </div>
                            </div>

                            {p.product.description && (
                              <div>
                                <p className="font-semibold text-gray-900 mb-1">
                                  Description
                                </p>
                                <p className="text-sm text-gray-600">
                                  {p.product.description}
                                </p>
                              </div>
                            )}

                            {p.product.points && p.product.points.length > 0 && (
                              <div>
                                <p className="font-semibold text-gray-900 mb-1">
                                  Key Features
                                </p>
                                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                  {p.product.points.map((pt, idx) => (
                                    <li key={idx}>{pt}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {/* TOTAL + PLACE ORDER (Bottom) */}
                <div className="mt-6 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 border-2 border-purple-600 text-purple-600 bg-white px-6 py-3 rounded-lg font-bold flex items-center justify-center">
                      Selected Total : ₹{selectedTotal.toLocaleString()}
                    </div>

                    <button
                      onClick={handlePlaceOrder}
                      disabled={placingOrder || selectedProducts.length === 0}
                      className="flex-1 bg-[#B30000] hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {placingOrder ? "Placing Order..." : "Place Order"}
                    </button>
                  </div>

                  {selectedProducts.length === 0 && (
                    <p className="text-center text-sm text-gray-500 mt-3">
                      Please select at least 1 cart item to place order.
                    </p>
                  )}
                </div>

                <div className="h-6" />
              </>
            )}
          </div>
        ) : (
          // ================= ORDERS TAB =================
          <div className="space-y-4">
            {ordersLoading ? (
              <div className="flex justify-center items-center py-16">
                <div className="text-center">
                  <Loader className="h-10 w-10 animate-spin mx-auto mb-4 text-[#B30000]" />
                  <p className="text-gray-600">Loading orders...</p>
                </div>
              </div>
            ) : ordersError ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-red-600 font-semibold text-center">
                    {ordersError}
                  </p>
                </CardContent>
              </Card>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="pt-10 pb-10">
                  <div className="text-center">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-semibold">No orders found.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {orders.map((order, idx) => {
                  // ✅ Grand Total = ONLY PRICE (NO MULTIPLY)
                  const orderTotal = order.variants?.reduce(
                    (sum: number, v: any) => sum + Number(v.price || 0),
                    0
                  );

                  return (
                    <Card key={order._id} className="shadow-sm">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <CardTitle className="text-base sm:text-lg">
                              Order #{idx + 1} – {order.productName}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                              <Clock className="w-4 h-4 text-gray-400" />
                              {formatDate(order.createdAt)}
                            </div>
                          </div>

                          <div>{getStatusBadge(order.status)}</div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {order.variants?.map((variant: any, i: number) => {
                            const price = Number(variant.price || 0);

                            return (
                              <div
                                key={variant._id || i}
                                className="p-3 bg-gray-50 rounded-lg flex items-start justify-between gap-3"
                              >
                                <div className="min-w-0">
                                  <p className="font-semibold text-gray-900">
                                    Variant {i + 1}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Price: ₹{price.toLocaleString()}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Quantity: {variant.quantity}
                                  </p>
                                </div>

                                {/* ✅ RIGHT SIDE ONLY PRICE */}
                                <p className="text-base font-bold text-green-700">
                                  ₹{price.toLocaleString()}
                                </p>
                              </div>
                            );
                          })}

                          {/* ✅ GRAND TOTAL (NO MULTIPLY) */}
                          <div className="border-t pt-3 flex items-center justify-between">
                            <p className="font-bold text-gray-900">Grand Total</p>
                            <p className="font-extrabold text-[#B30000] text-lg">
                              ₹{Number(orderTotal).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}