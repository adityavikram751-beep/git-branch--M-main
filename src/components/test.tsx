"use client";

import { useState } from "react";

const Test = () => {
  // ✅ file ka type define kiya
  const [file, setFile] = useState<File | null>(null);

  const getPresignedUrl = async () => {
    // ✅ null check
    console.log("Selected file:", file);
    if (!file) return;

    const res = await fetch(
      "https://api.3846.in/api/v1/upload/presigned-url",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          fileType: file?.type,
        }),
      }
    );
    console.log("Presigned URL response status:", res);
    return await res.json();
  };

  const uploadFile = async () => {  
    // ✅ null check
    if (!file) {
      alert("Please select file");
      return;
    }

    try {
      const data = await getPresignedUrl();
        console.log("Presigned URL data:", data);
      // ✅ agar data undefined ho
      if (!data) return;

      await fetch(data?.uploadUrl, {
        method: "PUT",

        headers: {
          "Content-Type": file?.type,
        },

        body: file,
      });

      console.log("Uploaded File URL:", data?.fileUrl);

      alert("Upload Success");
    } catch (error) {
      console.log(error);
      alert("Upload Failed");
    }
  };

  return (
    <div className="p-5">
      <h2 className="text-xl font-bold mb-4">
        Upload File
      </h2>

      <input
        type="file"
        onChange={(e) => {
          // ✅ files null ho sakta hai
          if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
          }
        }}
      />

      <br />
      <br />

      <button
        onClick={uploadFile}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Upload
      </button>
    </div>
  );
};

export default Test;