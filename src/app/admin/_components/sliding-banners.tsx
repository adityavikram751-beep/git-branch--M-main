"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { Plus, Trash2, UploadCloud, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/* ---------------- TYPES ---------------- */
type ApiBanner = {
  _id: string
  title: string
  type: "website" | "mobile" | string
  banner: string // ✅ backend gives banner url
  createdAt?: string
}

type BannerUI = {
  id: string
  title: string
  type: "website" | "mobile"
  banner: string
  createdAt?: string
}

/* ---------------- API CONFIG ---------------- */
const BASE_URL = "https://barber-syndicate.vercel.app"
const API_GET_ALL = `${BASE_URL}/api/v1/banner/all`
const API_ADD = `${BASE_URL}/api/v1/banner/add-banner`
const API_DELETE = `${BASE_URL}/api/v1/banner/delete-banner`

/* ---------------- TOKEN ---------------- */
const getAuthHeader = () => {
  const rawToken = localStorage.getItem("adminToken") || ""
  if (!rawToken) return ""
  if (rawToken.startsWith("Bearer ")) return rawToken
  return `Bearer ${rawToken}`
}

/* ---------------- HELPERS ---------------- */
const parseList = (data: any): ApiBanner[] => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.banners)) return data.banners
  if (Array.isArray(data?.result)) return data.result
  return []
}

const mapApiToUI = (b: ApiBanner): BannerUI => {
  const t = (b.type || "").toLowerCase()
  return {
    id: b._id,
    title: b.title || "",
    type: t === "mobile" ? "mobile" : "website", // ✅ only 2 types we handle
    banner: b.banner || "",
    createdAt: b.createdAt,
  }
}

export default function SlidingBanners() {
  /* ---------------- UI STATE ---------------- */
  const fileRef = useRef<HTMLInputElement | null>(null)

  const [selectedType, setSelectedType] = useState<"website" | "mobile">("website")
  const [title, setTitle] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState("")

  const [allBanners, setAllBanners] = useState<BannerUI[]>([])

  const [loading, setLoading] = useState(false)
  const [posting, setPosting] = useState(false)
  const [deletingId, setDeletingId] = useState<string>("")

  const showMsg = (msg: string) => alert(msg)

  /* ---------------- FILTERED LISTS ---------------- */
  const websiteBanners = useMemo(
    () => allBanners.filter((x) => x.type === "website"),
    [allBanners]
  )

  const mobileBanners = useMemo(
    () => allBanners.filter((x) => x.type === "mobile"),
    [allBanners]
  )

  /* ---------------- GET ALL ---------------- */
  const fetchBanners = async () => {
    try {
      setLoading(true)

      const auth = getAuthHeader()
      if (!auth) {
        showMsg("Token missing! Please login again.")
        return
      }

      const res = await fetch(API_GET_ALL, {
        method: "GET",
        headers: {
          Authorization: auth,
        },
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        console.log("GET ALL ERROR =>", data)
        showMsg(data?.message || "Failed to load banners")
        return
      }

      const list = parseList(data)
      const mapped = list.map(mapApiToUI)

      // ✅ remove broken items (no banner url)
      setAllBanners(mapped.filter((x) => x.banner && x.banner.trim() !== ""))
    } catch (err) {
      console.log(err)
      showMsg("Failed to load banners")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  /* ---------------- FILE UPLOAD ---------------- */
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return

    if (!f.type.startsWith("image/")) {
      showMsg("Only image files allowed")
      return
    }

    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  /* ---------------- ADD BANNER ---------------- */
  const addBanner = async () => {
    try {
      const auth = getAuthHeader()
      if (!auth) {
        showMsg("Token missing! Please login again.")
        return
      }

      if (!title.trim()) return showMsg("Please enter banner title")
      if (!file) return showMsg("Please upload banner image")

      setPosting(true)

      const fd = new FormData()

      // ✅ backend keys (as per your Postman screenshot)
      fd.append("file", file) // 🔥 IMPORTANT
      fd.append("type", selectedType) // website / mobile
      fd.append("title", title.trim())

      // debug
      for (const pair of fd.entries()) {
        console.log("FORMDATA =>", pair[0], pair[1])
      }

      const res = await fetch(API_ADD, {
        method: "POST",
        headers: {
          Authorization: auth,
        },
        body: fd,
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        console.log("ADD ERROR FULL =>", JSON.stringify(data, null, 2))
        showMsg(data?.message || "Failed to add banner")
        return
      }

      // reset
      setTitle("")
      setFile(null)
      setPreview("")
      if (fileRef.current) fileRef.current.value = ""

      showMsg("Banner added ✅")
      fetchBanners()
    } catch (err) {
      console.log(err)
      showMsg("Something went wrong while adding banner")
    } finally {
      setPosting(false)
    }
  }

  /* ---------------- DELETE ---------------- */
  const deleteBanner = async (id: string) => {
    try {
      const auth = getAuthHeader()
      if (!auth) {
        showMsg("Token missing! Please login again.")
        return
      }

      setDeletingId(id)

      const res = await fetch(`${API_DELETE}?b_id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: auth,
        },
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        console.log("DELETE ERROR =>", data)
        showMsg(data?.message || "Failed to delete banner")
        return
      }

      showMsg("Banner deleted ✅")
      fetchBanners()
    } catch (err) {
      console.log(err)
      showMsg("Something went wrong while deleting banner")
    } finally {
      setDeletingId("")
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3">
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

      {/* ---------------- ADD SECTION (ONE FORM) ---------------- */}
      <Card className="border-rose-200">
        <CardHeader>
          <CardTitle className="text-rose-900">Add Banner</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Type Dropdown */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-rose-900">Select Banner Type</p>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as "website" | "mobile")}
              className="w-full rounded-md border border-rose-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-300"
            >
              <option value="website">Desktop / Website</option>
              <option value="mobile">Mobile</option>
            </select>
          </div>

          {/* Title */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              selectedType === "website"
                ? "Desktop/Website Banner Title"
                : "Mobile Banner Title"
            }
            className="w-full rounded-md border border-rose-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-300"
          />

          {/* Upload + Button */}
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
                Upload Banner
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
          {preview ? (
            <div className="rounded-xl border border-rose-200 p-3">
              <p className="text-sm font-medium text-rose-900 mb-2">
                Preview ({selectedType}) - {title || "No Title"}
              </p>

              <div className="relative h-[180px] w-full overflow-hidden rounded-lg">
                <Image
                  src={preview}
                  alt={`${selectedType} preview`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* ---------------- WEBSITE/DESKTOP LIST ---------------- */}
      <Card className="border-rose-200">
        <CardHeader>
          <CardTitle className="text-rose-900">
            Desktop / Website Banners ({websiteBanners.length})
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {websiteBanners.length === 0 ? (
            <p className="text-sm text-rose-600">
              {loading ? "Loading..." : "No website banners found."}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {websiteBanners.map((b) => (
                <div
                  key={b.id}
                  className="rounded-xl border border-rose-200 bg-white overflow-hidden"
                >
                  <div className="relative h-[180px] w-full">
                    {b.banner ? (
                      <Image
                        src={b.banner}
                        alt={b.title || "website banner"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-[180px] w-full flex items-center justify-center text-sm text-rose-500">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-rose-900">{b.title}</h3>
                    <p className="text-xs text-rose-600">Type: {b.type}</p>

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
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---------------- MOBILE LIST ---------------- */}
      <Card className="border-rose-200">
        <CardHeader>
          <CardTitle className="text-rose-900">
            Mobile Banners ({mobileBanners.length})
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {mobileBanners.length === 0 ? (
            <p className="text-sm text-rose-600">
              {loading ? "Loading..." : "No mobile banners found."}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mobileBanners.map((b) => (
                <div
                  key={b.id}
                  className="rounded-xl border border-rose-200 bg-white overflow-hidden"
                >
                  <div className="relative h-[180px] w-full">
                    {b.banner ? (
                      <Image
                        src={b.banner}
                        alt={b.title || "mobile banner"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-[180px] w-full flex items-center justify-center text-sm text-rose-500">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-rose-900">{b.title}</h3>
                    <p className="text-xs text-rose-600">Type: {b.type}</p>

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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
