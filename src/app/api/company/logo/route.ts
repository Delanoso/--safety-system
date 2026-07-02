import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminOrSuper } from "@/lib/auth";
import { getCloudinary } from "@/lib/cloudinary";

async function resolveTargetCompanyId(
  current: Awaited<ReturnType<typeof requireAdminOrSuper>>,
  companyId?: string
) {
  if (current.role === "admin") {
    return current.companyId;
  }
  if (current.role === "super") {
    return companyId ?? current.companyId ?? null;
  }
  return null;
}

export async function GET() {
  const current = await requireAdminOrSuper();

  if (!current.companyId) {
    return NextResponse.json(
      { error: "Current user is not associated with a company" },
      { status: 400 }
    );
  }

  const company = await prisma.company.findUnique({
    where: { id: current.companyId },
  });

  if (!company) {
    return NextResponse.json(
      { error: "Company not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: company.id,
    name: company.name,
    logoUrl: company.logoUrl,
  });
}

export async function POST(req: Request) {
  const current = await requireAdminOrSuper();
  const cloudinary = getCloudinary();

  if (!cloudinary) {
    return NextResponse.json(
      {
        error:
          "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to .env.local (dev) or the server .env (production), then restart the server.",
      },
      { status: 503 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const companyId = formData.get("companyId") as string | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file received" }, { status: 400 });
    }

    const targetCompanyId = await resolveTargetCompanyId(
      current,
      companyId ?? undefined
    );
    if (!targetCompanyId) {
      return NextResponse.json(
        { error: "Unable to determine which company to update" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: `company-logos/${targetCompanyId}` },
        (error, uploadResult) => {
          if (error) reject(error);
          else if (uploadResult?.secure_url) resolve(uploadResult);
          else reject(new Error("No URL returned from Cloudinary"));
        }
      );
      uploadStream.end(buffer);
    });

    const updated = await prisma.company.update({
      where: { id: targetCompanyId },
      data: { logoUrl: result.secure_url },
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      logoUrl: updated.logoUrl,
    });
  } catch (err: unknown) {
    let message = "Upload failed";
    if (err instanceof Error) message = err.message;
    console.error("Company logo upload error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const current = await requireAdminOrSuper();
  const body = await req.json();

  const { logoUrl, companyId } = body as {
    logoUrl?: string;
    companyId?: string;
  };

  if (!logoUrl) {
    return NextResponse.json(
      { error: "logoUrl is required" },
      { status: 400 }
    );
  }

  let targetCompanyId: string | null = null;

  targetCompanyId = await resolveTargetCompanyId(current, companyId);

  if (!targetCompanyId) {
    return NextResponse.json(
      { error: "Unable to determine which company to update" },
      { status: 400 }
    );
  }

  const updated = await prisma.company.update({
    where: { id: targetCompanyId },
    data: { logoUrl },
  });

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    logoUrl: updated.logoUrl,
  });
}

