import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCloudinary } from "@/lib/cloudinary";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const cloud = getCloudinary();
    if (!cloud) {
      return NextResponse.json(
        {
          error:
            "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to .env.local (see .env.example).",
        },
        { status: 503 }
      );
    }

    const { id: incidentId } = await context.params;

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
        cloud.uploader.upload_stream(
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

/** PATCH — Save image URLs to DB (used by incident form after upload-images) */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: incidentId } = await context.params;
    if (!incidentId) {
      return NextResponse.json({ error: "Missing incident ID" }, { status: 400 });
    }

    const body = await req.json();
    const urls = body.images as string[] | undefined;
    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid images array" },
        { status: 400 }
      );
    }

    await prisma.incidentImage.createMany({
      data: urls.map((url) => ({ incidentId, url })),
    });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("IMAGE PATCH ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save images" },
      { status: 500 }
    );
  }
}

