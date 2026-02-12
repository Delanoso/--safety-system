import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
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

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contractor = await prisma.contractor.findFirst({
    where: {
      id,
      ...(current.companyId ? { companyId: current.companyId } : {}),
    },
  });
  if (!contractor) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const docs = await prisma.contractorDocument.findMany({
    where: { contractorId: id },
    orderBy: [{ section: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(docs);
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contractor = await prisma.contractor.findFirst({
    where: {
      id,
      ...(current.companyId ? { companyId: current.companyId } : {}),
    },
  });
  if (!contractor) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const cloud = getCloudinary();
  if (!cloud) {
    return NextResponse.json(
      { error: "Cloudinary is not configured for uploads" },
      { status: 503 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const section = formData.get("section") as string | null;

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file received" }, { status: 400 });
  }
  if (!section || typeof section !== "string" || !section.trim()) {
    return NextResponse.json({ error: "Section is required" }, { status: 400 });
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
        contractorId: id,
        section: section.trim(),
        fileName: file.name,
        fileUrl: result.secure_url,
        uploadedByContractor: false,
      },
    });
    return NextResponse.json(doc, { status: 201 });
  } catch (err) {
    console.error("Contractor document upload:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
