import { v2 as cloudinary } from "cloudinary";

const PLACEHOLDERS = ["your_cloud_name", "your_api_key", "your_api_secret"];

function isPlaceholder(v: string | undefined): boolean {
  return PLACEHOLDERS.some((p) => v === p || v?.trim() === p);
}

/** Parse CLOUDINARY_URL to avoid SDK validation errors during build. */
function parseCloudinaryUrl(
  url: string
): { cloud_name: string; api_key: string; api_secret: string } | null {
  const trimmed = url?.trim();
  if (
    !trimmed ||
    !trimmed.startsWith("cloudinary://") ||
    !trimmed.includes("@")
  )
    return null;
  try {
    // Format: cloudinary://api_key:api_secret@cloud_name
    const match = trimmed.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (!match) return null;
    const [, api_key, api_secret, cloud_name] = match;
    if (!cloud_name || !api_key || !api_secret) return null;
    return { cloud_name, api_key, api_secret };
  } catch {
    return null;
  }
}

export function isCloudinaryConfigured(): boolean {
  const url = process.env.CLOUDINARY_URL?.trim();
  if (url && parseCloudinaryUrl(url)) return true;

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

export function getCloudinary(): typeof cloudinary | null {
  const url = process.env.CLOUDINARY_URL?.trim();
  const parsed = url ? parseCloudinaryUrl(url) : null;
  if (parsed) {
    cloudinary.config(parsed);
    return cloudinary;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (
    !cloudName ||
    !apiKey ||
    !apiSecret ||
    isPlaceholder(cloudName) ||
    isPlaceholder(apiKey) ||
    isPlaceholder(apiSecret)
  )
    return null;

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  return cloudinary;
}
