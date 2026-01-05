"use client";
import React, { useState } from "react";
import { Phone, Mail, MapPin } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
};

 const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  alert("Message sent successfully ✅");
  setFormData({ name: "", phone: "", email: "", message: "" });
};


  return (
    <section className="py-16 min-h-[60vh] flex items-center justify-center bg-[#FFF8F5] px-3">

      {/* CARD WITH 3D LIFT EFFECT */}
      <div
        className="
          max-w-4xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 
          bg-white rounded-2xl overflow-hidden

          border border-gray-300 
          shadow-sm

          transform transition-all duration-300 
          hover:-translate-y-4 
          hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)]
        "
      >

        {/* LEFT SIDE */}
        <div className="bg-white p-6 md:p-8 flex flex-col justify-center">
          <h2 className="text-2xl font-semibold text-red-800 mb-2">
            Contact <span className="text-yellow-500">Us</span>
          </h2>
          <p className="text-gray-600 mb-6 text-sm">
            We are here to assist you anytime.
          </p>

          <div className="space-y-5 text-sm">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-red-800 mt-0.5" />
              <p className="text-gray-700">
                123 Business District,<br />
                3846 Main Market, Mori Gate, Delhi
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-red-800" />
              <p className="text-gray-700">+91 98765 43210</p>
            </div>

            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-red-800" />
              <p className="text-gray-700">info@barbersyndicate.com</p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE – FORM */}
        <div className="p-6 md:p-8 bg-white">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            We’d love to hear from you.
          </h3>
          <p className="text-gray-600 mb-6 text-sm">
            Let’s get in touch.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Full Name *
              </label>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter full name"
                className="w-full border-2 border-gray-300 rounded-md px-3 py-2 text-sm focus:border-red-600 focus:ring-0"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Phone Number *
              </label>
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Enter phone number"
                className="w-full border-2 border-gray-300 rounded-md px-3 py-2 text-sm focus:border-red-600 focus:ring-0"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Email Address *
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter email"
                className="w-full border-2 border-gray-300 rounded-md px-3 py-2 text-sm focus:border-red-600 focus:ring-0"
              />
            </div>

            {/* Message */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Message
              </label>
              <textarea
                name="message"
                rows={3}
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your message"
                className="w-full border-2 border-gray-300 rounded-md px-3 py-2 text-sm focus:border-red-600 focus:ring-0 resize-none"
              ></textarea>
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full bg-red-700 text-white py-2 px-4 rounded-md hover:bg-red-800 transition-colors text-sm font-medium"
            >
              Send
            </button>

          </form>
        </div>

      </div>
    </section>
  );
}
