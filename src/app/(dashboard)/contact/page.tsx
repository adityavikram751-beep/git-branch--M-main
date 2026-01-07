"use client";
import React, { useState, useEffect } from "react";
import { Phone, Mail, MapPin, Send, MessageCircle, Clock } from "lucide-react";

interface ContactData {
  _id: string;
  phone: string;
  email: string;
  address: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  
  const [contactInfo, setContactInfo] = useState<ContactData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const response = await fetch('https://barber-syndicate.vercel.app/api/v1/admin/contact');
        const result = await response.json();
        if (result.data) {
          setContactInfo(result.data);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContactData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("Thank you! Your message has been sent successfully. ✅");
    setFormData({ name: "", phone: "", email: "", message: "" });
  };

  return (
    // Background updated to yellow-50
    <section className="pt-36 pb-24 min-h-screen bg-yellow-50 px-4 overflow-hidden relative">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-20 left-[-10%] w-[40%] h-[40%] bg-red-100/40 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-10 right-[-10%] w-[30%] h-[30%] bg-white/50 rounded-full blur-[100px] -z-10"></div>

      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight">
            Let's Start a <span className="text-[#B30000]">Conversation</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg font-medium">
            Our priority is to help your business grow. Reach out to us for any professional inquiries.
          </p>
        </div>

        {/* Main 3D Card Wrapper */}
        <div className="flex flex-col lg:flex-row bg-white rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.08)] overflow-hidden border border-white/40 backdrop-blur-sm">
          
          {/* LEFT SIDE: Information Panel */}
          <div className="lg:w-[40%] bg-[#B30000] p-10 md:p-14 text-white flex flex-col justify-between relative">
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

            <div className="relative z-10 space-y-12">
              <div>
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  Contact Info <MessageCircle className="text-[#FFD700]" />
                </h2>
                <div className="w-20 h-1.5 bg-[#FFD700] rounded-full"></div>
              </div>

              <div className="space-y-10">
                {/* Address */}
                <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 group-hover:scale-110 group-hover:bg-[#FFD700] group-hover:text-red-900 transition-all duration-500 shadow-xl">
                    <MapPin size={28} />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-black text-[#FFD700] tracking-[0.2em] mb-1">Visit Us</p>
                    <p className="text-lg leading-snug font-medium">{loading ? "Fetching address..." : contactInfo?.address}</p>
                  </div>
                </div>

                {/* Phone */}
                <a href={`tel:${contactInfo?.phone}`} className="flex items-center gap-6 group cursor-pointer">
                  <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 group-hover:scale-110 group-hover:bg-[#FFD700] group-hover:text-red-900 transition-all duration-500 shadow-xl">
                    <Phone size={28} />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-black text-[#FFD700] tracking-[0.2em] mb-1">Call Anytime</p>
                    <p className="text-xl font-bold">{loading ? "..." : contactInfo?.phone}</p>
                  </div>
                </a>

                {/* Email */}
                <a href={`mailto:${contactInfo?.email}`} className="flex items-center gap-6 group cursor-pointer">
                  <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 group-hover:scale-110 group-hover:bg-[#FFD700] group-hover:text-red-900 transition-all duration-500 shadow-xl">
                    <Mail size={28} />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-black text-[#FFD700] tracking-[0.2em] mb-1">Email Support</p>
                    <p className="text-lg font-medium break-all">{loading ? "..." : contactInfo?.email}</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Bottom Info Box */}
            <div className="mt-16 p-6 bg-black/20 rounded-3xl border border-white/10 flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center text-red-900 shadow-lg">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-sm font-bold">Opening Hours</p>
                <p className="text-xs opacity-70">Mon-Sat: 10:00 AM - 8:00 PM</p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Interactive Form */}
          <div className="lg:w-[60%] p-10 md:p-16 bg-white relative">
            <div className="max-w-md">
              <h3 className="text-3xl font-extrabold text-gray-900 mb-2">Drop us a line</h3>
              <p className="text-gray-400 mb-10 font-medium">Our team will respond to your inquiry within 24 hours.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative group">
                  <input
                    name="name"
                    type="text"
                    onChange={handleChange}
                    value={formData.name}
                    required
                    className="w-full py-3 bg-transparent border-b-2 border-gray-200 focus:border-[#B30000] outline-none transition-all text-gray-800 font-medium peer"
                    placeholder=" "
                  />
                  <label className="absolute left-0 top-3 text-gray-400 pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-[#B30000] peer-focus:font-bold peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs">Full Name</label>
                </div>

                <div className="relative group">
                  <input
                    name="phone"
                    type="tel"
                    onChange={handleChange}
                    value={formData.phone}
                    required
                    className="w-full py-3 bg-transparent border-b-2 border-gray-200 focus:border-[#B30000] outline-none transition-all text-gray-800 font-medium peer"
                    placeholder=" "
                  />
                  <label className="absolute left-0 top-3 text-gray-400 pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-[#B30000] peer-focus:font-bold peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs">Phone Number</label>
                </div>
              </div>

              <div className="relative group">
                <input
                  name="email"
                  type="email"
                  onChange={handleChange}
                  value={formData.email}
                  required
                  className="w-full py-3 bg-transparent border-b-2 border-gray-200 focus:border-[#B30000] outline-none transition-all text-gray-800 font-medium peer"
                  placeholder=" "
                />
                <label className="absolute left-0 top-3 text-gray-400 pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-[#B30000] peer-focus:font-bold peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs">Email Address</label>
              </div>

              <div className="relative group">
                <textarea
                  name="message"
                  rows={4}
                  onChange={handleChange}
                  value={formData.message}
                  className="w-full py-3 bg-transparent border-b-2 border-gray-200 focus:border-[#B30000] outline-none transition-all text-gray-800 font-medium peer resize-none"
                  placeholder=" "
                ></textarea>
                <label className="absolute left-0 top-3 text-gray-400 pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-[#B30000] peer-focus:font-bold peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs">Your Message</label>
              </div>

              <button
                type="submit"
                className="group relative w-full md:w-fit px-12 py-5 bg-[#B30000] text-white font-black rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_20px_40px_rgba(179,0,0,0.3)] active:scale-95"
              >
                <div className="absolute inset-0 w-0 bg-black transition-all duration-[0.4s] ease-out group-hover:w-full -z-0"></div>
                <span className="relative z-10 flex items-center justify-center gap-3 tracking-widest uppercase">
                  Send Message <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}