import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCloudinary } from "@/lib/cloudinary";

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
    const cloud = getCloudinary();
    if (!cloud) {
      return NextResponse.json(
        {
          error:
            "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to .env.local.",
        },
        { status: 503 }
      );
    }

    const formData = await req.formData();

    const file = formData.get("file") as File;
    const folderId = formData.get("folderId") as string;

    if (!file || !folderId) {
      return NextResponse.json(
        { error: "Missing file or folderId" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploaded = await new Promise((resolve, reject) => {
      const upload = cloud.uploader.upload_stream(
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

