import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export async function POST(request: Request) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const placeholders = ["your_cloud_name", "your_api_key", "your_api_secret"];
  const isPlaceholder = (v: string) =>
    placeholders.some((p) => v === p || v?.trim() === p);

  if (
    !cloudName ||
    !apiKey ||
    !apiSecret ||
    isPlaceholder(cloudName) ||
    isPlaceholder(apiKey) ||
    isPlaceholder(apiSecret)
  ) {
    return NextResponse.json(
      {
        error:
          "Cloudinary is not set up. In .env.local replace your_cloud_name, your_api_key, and your_api_secret with your real values from https://cloudinary.com/console (Dashboard + API Keys). Then restart the dev server.",
      },
      { status: 503 }
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file received" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "contractors" },
        (error, result) => {
          if (error) reject(error);
          else if (result?.secure_url) resolve(result);
          else reject(new Error("No URL returned from Cloudinary"));
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({ url: result.secure_url, fileName: file.name });
  } catch (err: unknown) {
    let message = "Upload failed";
    if (err instanceof Error) message = err.message;
    if (err && typeof err === "object" && "error" in err) {
      const ce = (err as { error?: { message?: string } }).error;
      if (ce && typeof ce === "object" && typeof ce.message === "string")
        message = ce.message;
    }
    console.error("Contractor upload error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
