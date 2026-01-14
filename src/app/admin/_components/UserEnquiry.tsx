"use client";
import React, { useState } from "react";
import AllUserEnquiries from "./user-enquiry/allUserEnquiry";
import SingleUserEnquiries from "./user-enquiry/SingleUserEnquiries";

const AdminEnquirySystem = () => {
  const [currentView, setCurrentView] = useState<"all" | "single">("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handleViewUserEnquiries = (userId: string) => {
    setSelectedUserId(userId);
    setCurrentView("single");
  };

  const handleBackToAll = () => {
    setCurrentView("all");
    setSelectedUserId(null);
  };

  return (
    <div className="min-h-screen bg-rose-50 p-6">
      <div className="max-w-7xl mx-auto">
        {currentView === "all" ? (
          <AllUserEnquiries
            onViewUser={(user) => handleViewUserEnquiries(user._id)} // ✅ userId
          />
        ) : (
          selectedUserId && (
            <SingleUserEnquiries userId={selectedUserId} onBack={handleBackToAll} />
          )
        )}
      </div>
    </div>
  );
};

export default AdminEnquirySystem;
