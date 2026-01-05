// Main Admin Enquiry 
"use client";
import React, { useState } from "react";
import AllUserEnquiries from "./user-enquiry/allUserEnquiry";
import SingleUserEnquiry from "./user-enquiry/SingleUserEnquiries";

const AdminEnquirySystem = () => {
  const [currentView, setCurrentView] = useState<"all" | "single">("all");
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(null);

  const handleViewEnquiry = (enquiryId: string) => {
    setSelectedEnquiryId(enquiryId);
    setCurrentView("single");
  };

  const handleBackToAll = () => {
    setCurrentView("all");
    setSelectedEnquiryId(null);
  };

  return (
    <div className="min-h-screen bg-rose-50 p-6">
      <div className="max-w-7xl mx-auto">
        {currentView === "all" ? (
          <AllUserEnquiries onViewUser={(user) => handleViewEnquiry(user.enquiryId)} />
        ) : (
          selectedEnquiryId && (
            <SingleUserEnquiry
              enquiryId={selectedEnquiryId}
              onBack={handleBackToAll}
            />
          )
        )}
      </div>
    </div>
  );
};

export default AdminEnquirySystem;
