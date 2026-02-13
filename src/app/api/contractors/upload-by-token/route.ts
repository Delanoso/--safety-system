import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_SIZE_MB = 4.5;

export async function POST(req: Request) {
  const cloud = getCloudinary();
  if (!cloud) {
    return NextResponse.json(
      {
        error:
          "Cloudinary is not configured. Add CLOUDINARY_URL (or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) to your Vercel project Environment Variables, then redeploy.",
      },
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
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return NextResponse.json(
      {
        error: `File too large. Maximum size is ${MAX_FILE_SIZE_MB} MB. Try compressing or splitting the file.`,
      },
      { status: 413 }
    );
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
    const message =
      err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
