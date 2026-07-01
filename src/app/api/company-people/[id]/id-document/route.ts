import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const current = await requireUser();
    const { id } = await context.params;

    const person = await prisma.companyPerson.findUnique({ where: { id } });
    if (!person) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (current.role !== "super" && person.companyId !== current.companyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const cloudinary = getCloudinary();
    if (!cloudinary) {
      return NextResponse.json(
        { error: "File upload is not configured (Cloudinary)." },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Only PDF, JPG, PNG, or WEBP files are allowed." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "company-people-id",
          resource_type: file.type === "application/pdf" ? "raw" : "image",
        },
        (error, uploadResult) => {
          if (error) reject(error);
          else if (uploadResult?.secure_url) resolve(uploadResult);
          else reject(new Error("Upload failed"));
        }
      );
      uploadStream.end(buffer);
    });

    const updated = await prisma.companyPerson.update({
      where: { id },
      data: { idDocumentUrl: result.secure_url },
    });

    return NextResponse.json({ ok: true, idDocumentUrl: updated.idDocumentUrl });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST id-document", err);
    return NextResponse.json({ error: "Failed to upload ID document" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const current = await requireUser();
    const { id } = await context.params;

    const person = await prisma.companyPerson.findUnique({ where: { id } });
    if (!person) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (current.role !== "super" && person.companyId !== current.companyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.companyPerson.update({
      where: { id },
      data: { idDocumentUrl: null },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to remove ID document" }, { status: 500 });
  }
}
