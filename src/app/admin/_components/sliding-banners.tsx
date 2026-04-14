"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, UploadCloud, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/* ---------------- TYPES ---------------- */
type ApiBanner = {
  _id: string;
  title: string;
  type: "website" | "mobile" | string;
  banner: string;
  createdAt?: string;
};

type BannerUI = {
  id: string;
  title: string;
  type: "website" | "mobile";
  banner: string;
  createdAt?: string;
};

/* ---------------- API CONFIG ---------------- */
const BASE_URL = "https://api.3846.in";
const API_GET_ALL = `${BASE_URL}/api/v1/banner/all`;
const API_ADD = `${BASE_URL}/api/v1/banner/add-banner`;
const API_DELETE = `${BASE_URL}/api/v1/banner/delete-banner`;

/* ---------------- TOKEN ---------------- */
const getAuthToken = () => {
  const raw = localStorage.getItem("adminToken") || "";
  if (raw.startsWith("Bearer ")) return raw;
  if (raw) return `Bearer ${raw}`;
  return "";
};

/* ---------------- HELPERS ---------------- */
const parseBannersList = (data: any): ApiBanner[] => {
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  if (data?.banners && Array.isArray(data.banners)) return data.banners;
  if (data?.result && Array.isArray(data.result)) return data.result;
  return [];
};

const mapApiToUI = (b: ApiBanner): BannerUI => {
  const t = (b.type || "").toLowerCase();
  return {
    id: b._id,
    title: b.title || "",
    type: t === "mobile" ? "mobile" : "website",
    banner: b.banner || "",
    createdAt: b.createdAt,
  };
};

export default function SlidingBanners() {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [selectedType, setSelectedType] = useState<"website" | "mobile">("website");
  const [title, setTitle] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const [allBanners, setAllBanners] = useState<BannerUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState<string>("");
  const [error, setError] = useState<string>("");

  const showMsg = (msg: string) => alert(msg);

  const websiteBanners = useMemo(
    () => allBanners.filter((x) => x.type === "website"),
    [allBanners]
  );
  const mobileBanners = useMemo(
    () => allBanners.filter((x) => x.type === "mobile"),
    [allBanners]
  );

  /* ---------------- FETCH BANNERS ---------------- */
  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getAuthToken();
      if (!token) {
        setError("Token missing!");
        showMsg("Token missing! Please login again.");
        return;
      }

      const res = await fetch(API_GET_ALL, {
        method: "GET",
        headers: { Authorization: token },
      });

      const rawText = await res.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        setError("Invalid JSON from banners API");
        return;
      }

      if (!res.ok) {
        setError(data?.message || `HTTP ${res.status}`);
        showMsg(data?.message || "Failed to load banners");
        return;
      }

      const list = parseBannersList(data);
      const mapped = list
        .map((b) => mapApiToUI(b))
        .filter((x) => x.banner && x.banner.trim() !== "");

      setAllBanners(mapped);
    } catch (err: any) {
      setError(err.message);
      showMsg("Network error while loading banners");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    fetchBanners();
  }, []);

  /* ---------------- FILE UPLOAD ---------------- */
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      showMsg("Only image files allowed");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  /* ---------------- ADD BANNER ---------------- */
  const addBanner = async () => {
    try {
      const token = getAuthToken();
      if (!token) { showMsg("Token missing!"); return; }
      if (!title.trim()) return showMsg("Please enter banner title");
      if (!file) return showMsg("Please upload banner image");

      setPosting(true);

      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", selectedType);
      fd.append("title", title.trim());
      if (redirectUrl.trim()) {
        fd.append("url", redirectUrl.trim());
      }

      const res = await fetch(API_ADD, {
        method: "POST",
        headers: { Authorization: token },
        body: fd,
      });

      const rawRes = await res.text();
      let data: any = {};
      try { data = JSON.parse(rawRes); } catch {}

      if (!res.ok) {
        showMsg(data?.message || "Failed to add banner");
        return;
      }

      setTitle("");
      setRedirectUrl("");
      setFile(null);
      setPreview("");
      if (fileRef.current) fileRef.current.value = "";

      showMsg("Banner added ✅");
      await fetchBanners();
    } catch {
      showMsg("Something went wrong while adding banner");
    } finally {
      setPosting(false);
    }
  };

  /* ---------------- DELETE BANNER ---------------- */
  const deleteBanner = async (id: string) => {
    try {
      const token = getAuthToken();
      if (!token) { showMsg("Token missing!"); return; }

      setDeletingId(id);

      const res = await fetch(`${API_DELETE}?b_id=${id}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showMsg(data?.message || "Failed to delete banner");
        return;
      }

      showMsg("Banner deleted ✅");
      await fetchBanners();
    } catch {
      showMsg("Something went wrong while deleting banner");
    } finally {
      setDeletingId("");
    }
  };

  /* ---------------- BANNER CARD ---------------- */
  const BannerCard = ({ b }: { b: BannerUI }) => (
    <div className="rounded-xl border border-rose-200 bg-white overflow-hidden">
      <div className="relative h-[180px] w-full">
        <Image src={b.banner} alt={b.title} fill className="object-cover" />
      </div>
      <div className="p-4 space-y-1">
        <h3 className="font-semibold text-rose-900">{b.title}</h3>
        <div className="pt-2">
          <Button
            variant="destructive"
            onClick={() => deleteBanner(b.id)}
            disabled={deletingId === b.id}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deletingId === b.id ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-semibold text-rose-900">Sliding Banners</h2>
        <Button
          onClick={fetchBanners}
          variant="outline"
          className="border-rose-200 text-rose-700 hover:bg-rose-50"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Add Banner Card */}
      <Card className="border-rose-200">
        <CardHeader>
          <CardTitle className="text-rose-900">Add Banner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Banner Type */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-rose-900">Banner Type</p>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as "website" | "mobile")}
              className="w-full rounded-md border border-rose-200 bg-white px-3 py-2 text-sm"
            >
              <option value="website">Desktop / Website</option>
              <option value="mobile">Mobile</option>
            </select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-rose-900">Banner Title</p>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter banner title"
              className="w-full rounded-md border border-rose-200 bg-white px-3 py-2 text-sm"
            />
          </div>

          {/* Redirect URL */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-rose-900">
              Redirect URL <span className="text-rose-400 font-normal"></span>
            </p>
            <input
              value={redirectUrl}
              onChange={(e) => setRedirectUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-md border border-rose-200 bg-white px-3 py-2 text-sm"
            />
          </div>

          {/* Upload + Add */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
                id="bannerUpload"
              />
              <label
                htmlFor="bannerUpload"
                className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-rose-200 bg-white px-3 py-2 text-sm text-rose-700 hover:bg-rose-50"
              >
                <UploadCloud className="h-4 w-4" />
                {file ? file.name.slice(0, 20) + "…" : "Upload Banner"}
              </label>
            </div>
            <Button
              onClick={addBanner}
              className="bg-rose-600 hover:bg-rose-700"
              disabled={posting}
            >
              <Plus className="h-4 w-4 mr-2" />
              {posting ? "Adding..." : "Add Banner"}
            </Button>
          </div>

          {/* Preview */}
          {preview && (
            <div className="rounded-xl border border-rose-200 p-3">
              <p className="text-sm font-medium text-rose-900 mb-2">
                Preview ({selectedType}) — {title || "No Title"}
              </p>
              <div className="relative h-[180px] w-full overflow-hidden rounded-lg">
                <Image src={preview} alt="preview" fill className="object-cover" unoptimized />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Website Banners */}
      <Card className="border-rose-200">
        <CardHeader>
          <CardTitle className="text-rose-900">
            Desktop / Website Banners ({websiteBanners.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-rose-600">Loading...</p>
          ) : websiteBanners.length === 0 ? (
            <p className="text-sm text-rose-600">No website banners found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {websiteBanners.map((b) => <BannerCard key={b.id} b={b} />)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile Banners */}
      <Card className="border-rose-200">
        <CardHeader>
          <CardTitle className="text-rose-900">
            Mobile Banners ({mobileBanners.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-rose-600">Loading...</p>
          ) : mobileBanners.length === 0 ? (
            <p className="text-sm text-rose-600">No mobile banners found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mobileBanners.map((b) => <BannerCard key={b.id} b={b} />)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}