"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface DeleteProductProps {
  productId: string;
  productName: string;
  onDeleteProduct: (productId: string) => void;
}

export function DeleteProduct({
  productId,
  productName,
  onDeleteProduct,
}: DeleteProductProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    
    try {
      // Check authentication token
      const adminToken = localStorage.getItem("adminToken");
      
      if (!adminToken) {
        toast.error("Authentication required. Please log in.");
        setIsLoading(false);
        return;
      }

      console.log("Deleting product ID:", productId);

      // Make API call
      const response = await fetch(
        `https://barber-syndicate.vercel.app/api/v1/product/${productId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${adminToken}`,
          },
        }
      );

      console.log("Response Status:", response.status);

      // Always try to parse response regardless of status code
      let responseData;
      try {
        const responseText = await response.text();
        console.log("Raw response text:", responseText);
        
        if (responseText) {
          responseData = JSON.parse(responseText);
          console.log("Parsed response:", responseData);
        }
      } catch (parseError) {
        console.log("Could not parse response as JSON");
      }

      // ✅ WORKAROUND FOR BACKEND BUG:
      // Even if status is 500, check if operation was actually successful
      if (response.status === 500 && responseData?.success === true) {
        console.log("Backend bug detected: 500 status but success: true");
        console.log("Message:", responseData.message);
        
        // Product was actually deleted (backend bug)
        onDeleteProduct(productId);
        toast.success(`Product "${productName}" deleted successfully`);
        setIsLoading(false);
        return;
      }

      // Normal error handling for other cases
      if (!response.ok && !(response.status === 500 && responseData?.success === true)) {
        if (response.status === 401) {
          throw new Error("Unauthorized: Please login again");
        }
        if (response.status === 404) {
          throw new Error(`Product "${productName}" not found`);
        }
        if (response.status === 500) {
          throw new Error("Server error. Please try again later.");
        }
        throw new Error(responseData?.message || "Failed to delete product");
      }

      // Normal success case
      if (responseData?.success) {
        onDeleteProduct(productId);
        toast.success(`Product "${productName}" deleted successfully`);
      } else {
        throw new Error(responseData?.message || "Delete operation failed");
      }
      
    } catch (error: any) {
      console.error("Delete error:", error);
      
      // Handle the specific typo error from backend
      if (error.message.toLowerCase().includes("peroduct")) {
        // Backend has typo but operation succeeded
        onDeleteProduct(productId);
        toast.success(`Product "${productName}" deleted successfully`);
      } else {
        toast.error(error.message || "Failed to delete product. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
    <AlertDialogTrigger asChild>
  <Button
    type="button"
    variant="ghost"
    disabled={isLoading}
    className="
      flex items-center gap-2
      w-full justify-start
      px-3 py-2
      text-sm font-normal
       hover:bg-gray-100
      text-black
     
    "
    aria-label={`Delete ${productName}`}
    title={`Delete ${productName}`}
  >
    {isLoading ? (
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
    ) : (
      <Trash2 className="h-4 w-4" />
    )}
    Delete
  </Button>
</AlertDialogTrigger>


      <AlertDialogContent className="border-rose-200 max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-rose-900 text-lg">
            Confirm Delete
          </AlertDialogTitle>
          <AlertDialogDescription className="text-rose-700">
            Are you sure you want to delete <strong>"{productName}"</strong>? 
            <br />
            This action <strong>cannot be undone</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="mt-4 gap-2">
          <AlertDialogCancel 
            className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-800 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-rose-600 text-white hover:bg-rose-700 focus:ring-2 focus:ring-rose-300 transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Deleting...
              </span>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}