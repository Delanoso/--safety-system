import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

export const dynamic = "force-dynamic";

function getCloudinary() {
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
    return null;
  }
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  return cloudinary;
}

export async function POST(req: Request) {
  const cloud = getCloudinary();
  if (!cloud) {
    return NextResponse.json(
      { error: "Cloudinary is not configured for uploads" },
      { status: 503 }
    );
  }

  const formData = await req.formData();
  const token = formData.get("token") as string | null;
  const file = formData.get("file") as File | null;
  const section = formData.get("section") as string | null;

  if (!token || typeof token !== "string" || !token.trim()) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file received" }, { status: 400 });
  }
  if (!section || typeof section !== "string" || !section.trim()) {
    return NextResponse.json({ error: "Section is required" }, { status: 400 });
  }

  const contractor = await prisma.contractor.findUnique({
    where: { uploadToken: token.trim() },
  });
  if (!contractor) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 404 });
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloud.uploader.upload_stream(
        { folder: "contractors" },
        (error, result) => {
          if (error) reject(error);
          else if (result?.secure_url) resolve(result);
          else reject(new Error("No URL returned"));
        }
      );
      uploadStream.end(buffer);
    });

    const doc = await prisma.contractorDocument.create({
      data: {
        contractorId: contractor.id,
        section: section.trim(),
        fileName: file.name,
        fileUrl: result.secure_url,
        uploadedByContractor: true,
      },
    });
    return NextResponse.json(doc, { status: 201 });
  } catch (err) {
    console.error("Contractor upload-by-token:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
