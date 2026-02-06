import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(request, context) {
  console.log("🔥 HIT UPLOAD ROUTE");  //
  try {
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
      console.log("Uploading file:", file.name); // ✅ Now file exists

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result: any = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
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

      console.log("Cloudinary result:", result.secure_url);

      urls.push(result.secure_url);
    }

    console.log("Final URLs:", urls);

    return NextResponse.json({ urls });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    return NextResponse.json(
      { error: "Failed to upload images" },
      { status: 500 }
    );
  }
}

