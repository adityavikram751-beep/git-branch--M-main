"use client";

import { useState, useEffect } from "react";
import { Pencil, Save, X, Loader2 } from "lucide-react";

const BASE_URL = "https://barber-syndicate.vercel.app";

export default function ContactUs() {
  // YEH PROBLEM HAI - Hardcoded values hatado
  const [contact, setContact] = useState({
    _id: "",
    email: "", // YEH KHALI KARDO
    phone: "", // YEH KHALI KARDO
    address: "", // YEH KHALI KARDO
  });

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(contact);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  // Fetch contact data on component mount
  useEffect(() => {
    fetchContact();
  }, []);

  // Fetch contact data
  const fetchContact = async () => {
    try {
      setFetching(true);
      setError("");
      console.log("🔄 Fetching contact from:", `${BASE_URL}/api/v1/admin/contact`);
      
      const response = await fetch(`${BASE_URL}/api/v1/admin/contact`);
      const data = await response.json();
      
      console.log("📥 API Response:", data);
      
      if (data.data) {
        console.log("✅ Setting contact data:", data.data);
        setContact(data.data);
        setForm(data.data);
      } else {
        // If no data exists
        console.log("⚠️ No contact data found in backend");
        setContact({
          _id: "",
          email: "",
          phone: "",
          address: "",
        });
        setForm({
          _id: "",
          email: "",
          phone: "",
          address: "",
        });
      }
    } catch (error) {
      console.error("❌ Error fetching contact:", error);
      setError("Failed to load contact details");
    } finally {
      setFetching(false);
    }
  };

  // EDIT CLICK
  const handleEdit = () => {
    console.log("✏️ Edit clicked, current contact:", contact);
    setForm(contact);
    setIsEditing(true);
  };

  // SAVE CLICK
  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");
      
      const payload = {
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      };

      console.log("💾 Saving contact with payload:", payload);
      console.log("📊 Contact has ID?", contact._id ? "YES" : "NO");

      let endpoint, method;
      
      if (contact._id) {
        // Update existing contact
        endpoint = `${BASE_URL}/api/v1/admin/contact-update`;
        method = "PUT";
        console.log("🔄 UPDATE mode - Using PUT");
      } else {
        // Create new contact
        endpoint = `${BASE_URL}/api/v1/admin/contact`;
        method = "POST";
        console.log("🆕 CREATE mode - Using POST");
      }

      console.log("🌐 Sending request to:", endpoint);
      console.log("📤 Method:", method);
      console.log("📝 Payload:", payload);

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      console.log("📨 Save response:", data);
      
      if (data.status) {
        console.log("✅ Save successful!");
        console.log("✅ Updated data:", data.data);
        
        // Refresh contact data from backend
        await fetchContact();
        setIsEditing(false);
        
        // Show success message
        alert("✅ Contact details saved successfully!");
        console.log("✅ Postman mein bhi update ho gaya hai! Ab Postman se GET request karke check karo.");
        
      } else {
        console.log("❌ Save failed:", data.message);
        alert(`Failed: ${data.message}`);
      }
    } catch (error) {
      console.error("❌ Error saving contact:", error);
      setError("Failed to save contact details");
      alert("Failed to save contact details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // CANCEL CLICK
  const handleCancel = () => {
    console.log("❌ Cancel clicked, reverting to:", contact);
    setForm(contact);
    setIsEditing(false);
  };

  if (fetching) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
          <p className="text-sm text-gray-600">Loading contact details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button 
            onClick={fetchContact}
            className="mt-2 text-sm underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-rose-900 mb-4">
        Contact Us
      </h1>

      <div className="bg-white rounded-xl shadow p-6 max-w-xl relative">
        {/* EDIT BUTTON */}
        {!isEditing && (
          <div className="absolute top-4 right-4">
            <button
              onClick={handleEdit}
              className="flex items-center gap-1 bg-rose-600 text-white px-3 py-2 rounded-md text-sm hover:bg-rose-700"
              title="Edit"
            >
              <Pencil size={16} />
              Edit
            </button>
          </div>
        )}

        {/* VIEW MODE */}
        {!isEditing && (
          <div className="space-y-4 text-sm">
            <div>
              <strong className="text-gray-700">Email:</strong>
              <p className="mt-1 text-gray-900">{contact.email || "—"}</p>
            </div>
            <div>
              <strong className="text-gray-700">Phone:</strong>
              <p className="mt-1 text-gray-900">{contact.phone || "—"}</p>
            </div>
            <div>
              <strong className="text-gray-700">Address:</strong>
              <p className="mt-1 text-gray-900 whitespace-pre-line">{contact.address || "—"}</p>
            </div>
            
            {/* Debug Info
            <div className="mt-6 p-3 bg-blue-50 border border-blue-100 rounded text-xs text-blue-700">
              <p className="font-semibold">Debug Info:</p>
              <p>Contact ID: <code>{contact._id || "No ID"}</code></p>
              <p>Data from: <code>{BASE_URL}</code></p>
              <p className="mt-1">✅ Edit karne ke baad POSTMAN mein bhi update hoga!</p>
              <p>1. Admin panel mein edit karo</p>
              <p>2. Save karo</p>
              <p>3. Postman mein GET request karo: <code>GET /api/v1/admin/contact</code></p>
            </div> */}
          </div>
        )}

        {/* EDIT MODE */}
        {isEditing && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Enter email address"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Enter phone number"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Enter full address"
                value={form.address}
                rows={4}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-md text-sm hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {loading ? "Saving..." : "Save Changes"}
              </button>

              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
            
            {/* Debug Info */}
            {/* <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded text-xs text-yellow-700">
              <p className="font-semibold">Note:</p>
              <p>Ye changes <strong>POSTMAN mein bhi update ho jayenge</strong> kyunki:</p>
              <p>• Contact ID: <code>{contact._id || "Nahi hai (Create hoga)"}</code></p>
              <p>• API: {contact._id ? "PUT /contact-update" : "POST /contact"}</p>
              <p className="mt-1">✅ Save karne ke baad Postman se GET request karke check karo!</p>
            </div> */}
          </div>
        )}
      </div>
    </div>
  );
}