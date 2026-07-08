import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCloudinary } from "@/lib/cloudinary";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function getIncidentForUser(
  incidentId: string,
  current: { companyId: string | null; role: string }
) {
  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
    select: { companyId: true },
  });
  if (!incident) return null;
  if (current.role !== "super" && incident.companyId !== current.companyId) {
    return null;
  }
  return incident;
}

type ImageMeta = {
  category?: string;
  comment?: string | null;
};

function parseImageMeta(formData: FormData, index: number): ImageMeta {
  const raw = formData.get("meta");
  if (!raw || typeof raw !== "string") return {};
  try {
    const parsed = JSON.parse(raw) as ImageMeta[];
    return parsed[index] ?? {};
  } catch {
    return {};
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const current = await getCurrentUser();
    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id: incidentId } = await context.params;
    if (!incidentId) {
      return NextResponse.json(
        { error: "Missing incidentId in route params" },
        { status: 400 }
      );
    }

    const incident = await getIncidentForUser(incidentId, current);
    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

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

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json(
        { error: "No files uploaded" },
        { status: 400 }
      );
    }

    const uploadedImages: {
      url: string;
      category: string;
      comment: string | null;
    }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const meta = parseImageMeta(formData, i);
      const category = meta.category === "relevant" ? "relevant" : "photo";
      const comment =
        category === "relevant" && meta.comment ? String(meta.comment).trim() : null;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result: { secure_url: string } = await new Promise((resolve, reject) => {
        cloud.uploader
          .upload_stream({ folder: "incidents" }, (error, uploadResult) => {
            if (error) reject(error);
            else if (uploadResult?.secure_url) resolve(uploadResult);
            else reject(new Error("Upload failed"));
          })
          .end(buffer);
      });

      uploadedImages.push({ url: result.secure_url, category, comment });
    }

    await prisma.incidentImage.createMany({
      data: uploadedImages.map((img) => ({
        incidentId,
        url: img.url,
        category: img.category,
        comment: img.comment,
      })),
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("IMAGE UPLOAD ERROR:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Image upload failed" },
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
    const current = await getCurrentUser();
    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id: incidentId } = await context.params;
    if (!incidentId) {
      return NextResponse.json({ error: "Missing incident ID" }, { status: 400 });
    }

    const incident = await getIncidentForUser(incidentId, current);
    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    const body = await req.json();
    const images = body.images as
      | Array<{ url: string; category?: string; comment?: string | null }>
      | undefined;

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid images array" },
        { status: 400 }
      );
    }

    await prisma.incidentImage.createMany({
      data: images.map((img) => ({
        incidentId,
        url: img.url,
        category: img.category === "relevant" ? "relevant" : "photo",
        comment:
          img.category === "relevant" && img.comment
            ? String(img.comment).trim()
            : null,
      })),
    });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("IMAGE PATCH ERROR:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save images" },
      { status: 500 }
    );
  }
}
