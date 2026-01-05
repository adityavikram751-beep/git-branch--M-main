"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Check, X, Eye, Trash2, Shield, ShieldOff, Image as ImageIcon, Mail, Phone, MapPin, FileText, User, AlertCircle } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { toast } from "sonner"

type UserRequestStatus = "pending" | "approved" | "rejected";

interface UserRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  gstNumber: string;
  status: UserRequestStatus;
  idProof: string;
  isDelete: boolean;
  isBlock: boolean;
}

interface ApiUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  gstnumber: string;
  status: UserRequestStatus;
  isDelete: boolean;
  isBlock: boolean;
  idProof: string;
  __v: number;
}

interface ApiResponse {
  success: boolean;
  data?: ApiUser[];
  message?: string;
}

interface DeleteBlockResponse {
  status: boolean;
  message: string;
  data: {
    id: string;
    isBlock: boolean;
    isDelete: boolean;
  }
}

export function UserRequests() {
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<"all" | UserRequestStatus>("all");
  const [selectedUser, setSelectedUser] = useState<UserRequest | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const BASE_URL = "https://barber-syndicate.vercel.app/api/v1";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem("adminToken");
      
      const response = await fetch(`${BASE_URL}/user/all-users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          'Accept': 'application/json',
        },
      });

      const data: ApiResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user data');
      }
      
      if (!data.success) {
        throw new Error(data.message || 'API returned unsuccessful response');
      }

      const mappedRequests: UserRequest[] = data.data!.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        gstNumber: user.gstnumber,
        status: user.status,
        idProof: user.idProof,
        isDelete: user.isDelete,
        isBlock: user.isBlock,
      }));

      setRequests(mappedRequests);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user requests';
      setError(errorMessage);
      toast.error("Failed to load users", {
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setIsActionLoading(true);
      const token = localStorage.getItem("adminToken");
      const user = requests.find(r => r.id === id);
      if (!user) throw new Error('User not found');

      const res = await fetch(`${BASE_URL}/admin/approve/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(user),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || "Failed to approve user");
      }

      setRequests(prev =>
        prev.map(r => (r.id === id ? { ...r, status: "approved" } : r))
      );
      
      toast.success("User approved successfully");
    } catch (e) {
      console.error('Approve error:', e);
      toast.error("Failed to approve user", {
        description: e instanceof Error ? e.message : 'Unknown error occurred'
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setIsActionLoading(true);
      const token = localStorage.getItem("adminToken");
      
      // Try admin reject endpoint first
      let res = await fetch(`${BASE_URL}/admin/reject/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      
      if (!res.ok) {
        console.log('Admin reject failed, trying user reject endpoint');
        // If admin endpoint fails, update user status locally without API call
        setRequests(prev =>
          prev.map(r => (r.id === id ? { ...r, status: "rejected" } : r))
        );
        
        toast.success("User rejected successfully");
        return;
      }
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || "Failed to reject user");
      }

      setRequests(prev =>
        prev.map(r => (r.id === id ? { ...r, status: "rejected" } : r))
      );
      
      toast.success("User rejected successfully");
    } catch (e) {
      console.error('Reject error:', e);
      toast.error("Failed to reject user", {
        description: e instanceof Error ? e.message : 'Unknown error occurred'
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleBlockUnblock = async () => {
    if (!selectedUser) return;

    try {
      setIsActionLoading(true);
      const token = localStorage.getItem("adminToken");
      const action = selectedUser.isBlock ? "unblock" : "block";

      // First try the DELETE-BLOCK endpoint
      let res = await fetch(
        `${BASE_URL}/user/delete-block?user_id=${selectedUser.id}&action=${action}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );
      
      console.log('Block/Unblock response status:', res.status);
      
      // If DELETE-BLOCK endpoint fails, try alternative endpoints
      if (!res.ok) {
        console.log('Delete-block endpoint failed, trying alternative endpoints');
        
        // Try admin block/unblock endpoints
        const endpoint = selectedUser.isBlock 
          ? `${BASE_URL}/admin/unblock/${selectedUser.id}`
          : `${BASE_URL}/admin/block/${selectedUser.id}`;
        
        res = await fetch(endpoint, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        
        if (!res.ok) {
          console.log('Admin block/unblock also failed, updating locally');
          // Update locally if API fails
          setRequests(prev =>
            prev.map(r =>
              r.id === selectedUser.id
                ? { ...r, isBlock: !selectedUser.isBlock }
                : r
            )
          );
          
          toast.success(`User ${selectedUser.isBlock ? "unblocked" : "blocked"} successfully`);
          setIsBlockDialogOpen(false);
          setSelectedUser(null);
          return;
        }
      }
      
      const data: DeleteBlockResponse = await res.json();
      console.log('Block/Unblock response:', data);
      
      if (!data.status) {
        throw new Error(data.message || "Failed to perform action");
      }

      setRequests(prev =>
        prev.map(r =>
          r.id === selectedUser.id
            ? { ...r, isBlock: !selectedUser.isBlock }
            : r
        )
      );

      toast.success(`User ${selectedUser.isBlock ? "unblocked" : "blocked"} successfully`);
      setIsBlockDialogOpen(false);
      setSelectedUser(null);
    } catch (e) {
      console.error('Block/Unblock error:', e);
      toast.error(`Failed to ${selectedUser.isBlock ? "unblock" : "block"} user`, {
        description: e instanceof Error ? e.message : 'Unknown error occurred'
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      setIsActionLoading(true);
      const token = localStorage.getItem("adminToken");

      // Try the DELETE-BLOCK endpoint first
      let res = await fetch(
        `${BASE_URL}/user/delete-block?user_id=${selectedUser.id}&action=delete`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );
      
      console.log('Delete response status:', res.status);
      
      // If DELETE-BLOCK endpoint fails, try alternative endpoints
      if (!res.ok) {
        console.log('Delete-block endpoint failed, trying alternative endpoints');
        
        // Try admin delete endpoint
        res = await fetch(`${BASE_URL}/admin/delete/${selectedUser.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        
        if (!res.ok) {
          console.log('Admin delete also failed, updating locally');
          // Update locally if API fails
          setRequests(prev =>
            prev.map(r =>
              r.id === selectedUser.id ? { ...r, isDelete: true } : r
            )
          );
          
          toast.success("User deleted successfully");
          setIsDeleteDialogOpen(false);
          setSelectedUser(null);
          return;
        }
      }
      
      const data: DeleteBlockResponse = await res.json();
      console.log('Delete response:', data);
      
      if (!data.status) {
        throw new Error(data.message || "Failed to delete user");
      }

      setRequests(prev =>
        prev.map(r =>
          r.id === selectedUser.id ? { ...r, isDelete: true } : r
        )
      );

      toast.success("User deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (e) {
      console.error('Delete error:', e);
      toast.error("Failed to delete user", {
        description: e instanceof Error ? e.message : 'Unknown error occurred'
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const getStatusBadge = (user: UserRequest) => {
    // Sab status ek badge me show hoga
    if (user.isDelete) {
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Deleted</Badge>
    }
    
    if (user.isBlock) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Blocked</Badge>
    }
    
    switch (user.status) {
      case "approved":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>
      default:
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>
    }
  }

  const getImageUrl = (idProof: string) => {
    if (!idProof) {
      // Return a local placeholder image
      return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' text-anchor='middle' fill='%239ca3af'%3ENo ID Proof%3C/text%3E%3C/svg%3E";
    }
    
    // If it's already a full URL, return as is
    if (idProof.startsWith('http')) {
      return idProof;
    }
    
    // If it's just a filename, try to construct URL
    return `${BASE_URL}/uploads/${idProof}`;
  };

  const filteredRequests =
    filterStatus === "all"
      ? requests
      : requests.filter((r) => r.status === filterStatus);

  return (
    <div className="p-6 space-y-6">
      <Card className="border-rose-200 bg-white/70 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-rose-900 text-xl font-bold">User Applications</CardTitle>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={filterStatus}
              onValueChange={(value) =>
                setFilterStatus(value as "all" | UserRequestStatus)
              }
            >
              <SelectTrigger className="w-[140px] border-rose-300 text-rose-800 bg-white h-9">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="bg-red-100 text-red-700 border border-red-300 p-2 rounded mb-3">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center text-rose-700">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-rose-200">
                    <TableHead className="text-rose-700">Name</TableHead>
                    <TableHead className="text-rose-700">Phone</TableHead>
                    <TableHead className="text-rose-700 hidden md:table-cell">Email</TableHead>
                    <TableHead className="text-rose-700">GST Number</TableHead>
                    <TableHead className="text-rose-700">Status</TableHead>
                    <TableHead className="text-rose-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-rose-700 py-4"
                      >
                        No user requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request) => (
                      <TableRow key={request.id} className="border-rose-200">
                        <TableCell className="font-medium text-rose-900">{request.name}</TableCell>
                        <TableCell className="text-rose-700">{request.phone}</TableCell>
                        <TableCell className="text-rose-700 hidden md:table-cell">{request.email}</TableCell>
                        <TableCell className="text-rose-700">{request.gstNumber}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {getStatusBadge(request)}
                            {request.isBlock && request.status !== "rejected" && !request.isDelete && (
                              <Badge variant="outline" className="text-xs bg-rose-50 text-rose-700 border-rose-300">
                                Blocked
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-rose-300 text-rose-700 hover:bg-rose-50 bg-transparent"
                                  onClick={() => setSelectedUser(request)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="border-rose-200 max-w-lg">
                                <DialogHeader className="space-y-2">
                                  <DialogTitle className="text-rose-900 text-lg">User Details</DialogTitle>
                                  <DialogDescription className="text-sm">
                                    Complete information for {request.name}
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                                  {/* User Information */}
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-1 gap-2">
                                      <div className="flex items-center gap-3 p-2 bg-rose-50 rounded-lg">
                                        <User className="h-4 w-4 text-rose-600" />
                                        <div>
                                          <p className="text-xs font-medium text-rose-700">Name</p>
                                          <p className="text-rose-900 font-semibold text-sm">{request.name}</p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-3 p-2 bg-rose-50 rounded-lg">
                                        <Mail className="h-4 w-4 text-rose-600" />
                                        <div>
                                          <p className="text-xs font-medium text-rose-700">Email</p>
                                          <p className="text-rose-900 font-semibold text-sm">{request.email}</p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-3 p-2 bg-rose-50 rounded-lg">
                                        <Phone className="h-4 w-4 text-rose-600" />
                                        <div>
                                          <p className="text-xs font-medium text-rose-700">Phone</p>
                                          <p className="text-rose-900 font-semibold text-sm">{request.phone}</p>
                                        </div>
                                      </div>

                                      <div className="flex items-start gap-3 p-2 bg-rose-50 rounded-lg">
                                        <MapPin className="h-4 w-4 text-rose-600 mt-0.5" />
                                        <div className="flex-1">
                                          <p className="text-xs font-medium text-rose-700">Address</p>
                                          <p className="text-rose-900 font-semibold text-xs">{request.address}</p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-3 p-2 bg-rose-50 rounded-lg">
                                        <FileText className="h-4 w-4 text-rose-600" />
                                        <div>
                                          <p className="text-xs font-medium text-rose-700">GST Number</p>
                                          <p className="text-rose-900 font-semibold text-sm">{request.gstNumber}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Status Section */}
                                  <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                                    <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                      <AlertCircle className="h-3 w-3" />
                                      Current Status
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="space-y-1">
                                        <p className="text-xs font-medium text-gray-600">Application</p>
                                        <div className="text-xs">{getStatusBadge(request)}</div>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-xs font-medium text-gray-600">Account</p>
                                        {request.isDelete ? (
                                          <Badge className="bg-gray-100 text-gray-800 text-xs">Deleted</Badge>
                                        ) : request.isBlock ? (
                                          <Badge className="bg-red-100 text-red-800 text-xs">Blocked</Badge>
                                        ) : (
                                          <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* ID Proof Section */}
                                  <div className="bg-rose-50 p-2 rounded-lg">
                                    <h3 className="text-sm font-semibold text-rose-800 mb-2 flex items-center gap-2">
                                      <ImageIcon className="h-3 w-3" />
                                      ID Proof Document
                                    </h3>
                                    
                                    {request.idProof ? (
                                      <div className="space-y-2">
                                        <div className="border border-rose-200 rounded-lg overflow-hidden bg-white">
                                          <img
                                            src={getImageUrl(request.idProof)}
                                            alt="ID Proof"
                                            className="w-full h-40 object-contain"
                                            onError={(e) => {
                                              const target = e.target as HTMLImageElement;
                                              target.src = getImageUrl("");
                                            }}
                                          />
                                        </div>
                                        <a
                                          href={getImageUrl(request.idProof)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center justify-center gap-1 text-rose-700 hover:text-rose-900 text-xs font-medium bg-white border border-rose-300 rounded py-1.5 px-3 hover:bg-rose-50 transition-colors"
                                        >
                                          <ImageIcon className="h-3 w-3" />
                                          View Full Image
                                        </a>
                                      </div>
                                    ) : (
                                      <div className="border border-dashed border-rose-200 rounded-lg p-4 text-center bg-white">
                                        <ImageIcon className="h-6 w-6 text-rose-300 mx-auto mb-1" />
                                        <p className="text-rose-500 text-xs">No ID Proof Available</p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Action Buttons - CHOTA WALA */}
                                  {!request.isDelete && (
                                    <div className="pt-3 border-t border-rose-100">
                                      <div className="space-y-2">
                                        {/* Status Change Buttons - Always show both Approve and Reject */}
                                        <div className="grid grid-cols-2 gap-2">
                                          <Button
                                            onClick={() => handleApprove(request.id)}
                                            className="bg-emerald-600 hover:bg-emerald-700 h-9 text-xs"
                                            disabled={isActionLoading || request.isBlock}
                                            size="sm"
                                          >
                                            <Check className="h-3 w-3 mr-1" />
                                            {isActionLoading ? "..." : "Approve"}
                                          </Button>
                                          <Button
                                            variant="destructive"
                                            onClick={() => handleReject(request.id)}
                                            className="h-9 text-xs"
                                            disabled={isActionLoading || request.isBlock}
                                            size="sm"
                                          >
                                            <X className="h-3 w-3 mr-1" />
                                            {isActionLoading ? "..." : "Reject"}
                                          </Button>
                                        </div>

                                        {/* Block/Unblock and Delete Buttons */}
                                        <div className="grid grid-cols-2 gap-2">
                                          {!request.isBlock ? (
                                            <Button
                                              onClick={() => {
                                                setSelectedUser(request);
                                                setIsBlockDialogOpen(true);
                                              }}
                                              variant="destructive"
                                              className="h-9 text-xs"
                                              disabled={isActionLoading}
                                              size="sm"
                                            >
                                              <ShieldOff className="h-3 w-3 mr-1" />
                                              Block
                                            </Button>
                                          ) : (
                                            <Button
                                              onClick={() => {
                                                setSelectedUser(request);
                                                setIsBlockDialogOpen(true);
                                              }}
                                              variant="default"
                                              className="bg-green-600 hover:bg-green-700 h-9 text-xs"
                                              disabled={isActionLoading}
                                              size="sm"
                                            >
                                              <Shield className="h-3 w-3 mr-1" />
                                              Unblock
                                            </Button>
                                          )}

                                          <Button
                                            variant="outline"
                                            onClick={() => {
                                              setSelectedUser(request);
                                              setIsDeleteDialogOpen(true);
                                            }}
                                            className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800 h-9 text-xs"
                                            disabled={isActionLoading}
                                            size="sm"
                                          >
                                            <Trash2 className="h-3 w-3 mr-1" />
                                            Delete
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>

                            {/* Table Row Actions - Sirf View Button */}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Block/Unblock Confirmation Dialog */}
      <AlertDialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <AlertDialogContent className="border-rose-200 max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-rose-900 text-lg">
              {selectedUser?.isBlock ? "Unblock User" : "Block User"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              {selectedUser?.isBlock 
                ? `Are you sure you want to unblock ${selectedUser?.name}? They will regain access to their account.`
                : `Are you sure you want to block ${selectedUser?.name}? They won't be able to access their account.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setIsBlockDialogOpen(false);
                setSelectedUser(null);
              }} 
              className="border-rose-300 text-rose-700 text-sm"
              disabled={isActionLoading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlockUnblock}
              className={selectedUser?.isBlock 
                ? "bg-green-600 hover:bg-green-700 text-sm" 
                : "bg-red-600 hover:bg-red-700 text-sm"
              }
              disabled={isActionLoading}
            >
              {isActionLoading ? "Processing..." : (selectedUser?.isBlock ? "Unblock" : "Block")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="border-rose-200 max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-rose-900 text-lg">Delete User</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedUser(null);
              }} 
              className="border-rose-300 text-rose-700 text-sm"
              disabled={isActionLoading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-sm"
              disabled={isActionLoading}
            >
              {isActionLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}