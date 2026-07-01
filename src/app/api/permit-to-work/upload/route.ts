import { NextResponse } from "next/server";
import { getCloudinary } from "@/lib/cloudinary";
import { requireUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cloudinary = getCloudinary();
  if (!cloudinary) {
    return NextResponse.json({ error: "Cloudinary is not configured." }, { status: 503 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file received" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "permit-to-work" },
        (error, uploadResult) => {
          if (error) reject(error);
          else if (uploadResult?.secure_url) resolve(uploadResult);
          else reject(new Error("No URL returned"));
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (err) {
    console.error("Permit upload:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
