import { v2 as cloudinary } from "cloudinary";

const PLACEHOLDERS = ["your_cloud_name", "your_api_key", "your_api_secret"];

function isPlaceholder(v: string | undefined): boolean {
  return PLACEHOLDERS.some((p) => v === p || v?.trim() === p);
}

function isValidUrl(url: string): boolean {
  return (
    url.startsWith("cloudinary://") &&
    url.includes("@") &&
    url.split("@").length >= 2
  );
}

export function isCloudinaryConfigured(): boolean {
  // Option 1: CLOUDINARY_URL (cloudinary://api_key:api_secret@cloud_name)
  const url = process.env.CLOUDINARY_URL?.trim();
  if (url && isValidUrl(url)) return true;

  // Option 2: Separate vars
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  return !!(
    cloudName &&
    apiKey &&
    apiSecret &&
    !isPlaceholder(cloudName) &&
    !isPlaceholder(apiKey) &&
    !isPlaceholder(apiSecret)
  );
}

export function getCloudinary() {
  if (!isCloudinaryConfigured()) return null;

  const url = process.env.CLOUDINARY_URL?.trim();
  if (url && isValidUrl(url)) {
    cloudinary.config();
    return cloudinary;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
  });
  return cloudinary;
}
