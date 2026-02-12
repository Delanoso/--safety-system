import { NextResponse } from "next/server";
import { getCloudinary } from "@/lib/cloudinary";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
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
    const { id } = await context.params; // ✅ Correct Next.js 16 params

    const form = await request.formData();
    const files = form.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No images received" },
        { status: 400 }
      );
    }

    const urls: string[] = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result: any = await new Promise((resolve, reject) => {
        const uploadStream = cloud.uploader.upload_stream(
          {
            folder: `incidents/${id}`, // ⭐ Correct folder
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(buffer);
      });

      urls.push(result.secure_url);
    }

    return NextResponse.json({ urls });
  } catch (error: unknown) {
    console.error("UPLOAD ERROR:", error);
    const message = error instanceof Error ? error.message : "Failed to upload images";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

