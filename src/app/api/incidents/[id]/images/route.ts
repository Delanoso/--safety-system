import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: incidentId } = await context.params;   // ⭐ FIXED

    if (!incidentId) {
      return NextResponse.json(
        { error: "Missing incidentId in route params" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json(
        { error: "No files uploaded" },
        { status: 400 }
      );
    }

    const uploadedImages: { url: string }[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result: any = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "incidents" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });

      uploadedImages.push({ url: result.secure_url });
    }

    await prisma.incidentImage.createMany({
      data: uploadedImages.map((img) => ({
        incidentId,
        url: img.url,
      })),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("IMAGE UPLOAD ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Image upload failed" },
      { status: 500 }
    );
  }
}

