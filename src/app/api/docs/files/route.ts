import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

// Make sure your Cloudinary env vars are set:
// CLOUDINARY_CLOUD_NAME
// CLOUDINARY_API_KEY
// CLOUDINARY_API_SECRET

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folderId");

    if (!folderId) return NextResponse.json([]);

    const files = await prisma.file.findMany({
      where: { folderId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(files);
  } catch (err) {
    console.error("FILES GET ERROR:", err);
    return NextResponse.json(
      { error: "Failed to load files" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;
    const folderId = formData.get("folderId") as string;

    if (!file || !folderId) {
      return NextResponse.json(
        { error: "Missing file or folderId" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploaded = await new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: "safety_system_docs" },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
      upload.end(buffer);
    });

    const cloud = uploaded as any;

    // Save metadata in Prisma
    const saved = await prisma.file.create({
      data: {
        name: file.name,
        url: cloud.secure_url,
        size: file.size,
        folderId,
      },
    });

    return NextResponse.json(saved);
  } catch (err) {
    console.error("FILE UPLOAD ERROR:", err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}

