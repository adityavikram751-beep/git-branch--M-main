import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ✅ Type added
export const getPresignedUrl = async (files: File) => {
  const res = await fetch(
    "https://api.3846.in/api/upload/presigned-url",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        fileType: files.type,
      }),
    }
  );

  return await res.json();
};