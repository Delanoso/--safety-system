import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { getCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

function apiError(err: unknown, fallback: string) {
  if (err instanceof Error && err.message === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2021") {
      return NextResponse.json(
        { error: "Database not ready. Run database migrations and try again." },
        { status: 503 }
      );
    }
  }
  console.error(fallback, err);
  return NextResponse.json({ error: fallback }, { status: 500 });
}

export async function GET() {
  try {
    const current = await requireUser();
    if (!current.companyId && current.role !== "super") {
      return NextResponse.json([]);
    }

    const where =
      current.role === "super" && !current.companyId
        ? {}
        : { companyId: current.companyId! };

    const items = await prisma.sHERepInspection.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items);
  } catch (err) {
    return apiError(err, "Failed to load inspections");
  }
}

export async function POST(req: Request) {
  try {
    const current = await requireUser();
    const body = await req.json();
    const title = String(body.title ?? "").trim();
    const period = body.period != null ? String(body.period).trim() : null;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const companyId = current.companyId;
    if (!companyId && current.role !== "super") {
      return NextResponse.json({ error: "No company associated" }, { status: 400 });
    }

    const item = await prisma.sHERepInspection.create({
      data: {
        title,
        period: period || null,
        companyId: companyId ?? null,
        status: "pending",
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    return apiError(err, "Failed to create inspection");
  }
}

export async function PATCH(req: Request) {
  try {
    const current = await getCurrentUser();
    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const id = formData.get("id") as string | null;
    const file = formData.get("file") as File | null;

    if (!id || !file) {
      return NextResponse.json({ error: "id and file are required" }, { status: 400 });
    }

    const existing = await prisma.sHERepInspection.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (
      current.role !== "super" &&
      existing.companyId &&
      existing.companyId !== current.companyId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const cloud = getCloudinary();
    if (!cloud) {
      return NextResponse.json(
        { error: "Cloudinary is not configured on the server." },
        { status: 503 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploaded: { secure_url: string } = await new Promise((resolve, reject) => {
      cloud.uploader.upload_stream(
        { folder: "she_rep_inspections", resource_type: "auto" },
        (err, result) => {
          if (err) reject(err);
          else resolve(result as { secure_url: string });
        }
      ).end(buffer);
    });

    const updated = await prisma.sHERepInspection.update({
      where: { id },
      data: {
        fileUrl: uploaded.secure_url,
        fileName: file.name,
        status: "completed",
        uploadedAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    return apiError(err, "Upload failed");
  }
}
