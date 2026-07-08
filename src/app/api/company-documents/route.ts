import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getCloudinary } from "@/lib/cloudinary";
import {
  companyDocumentMimeType,
  isAllowedCompanyDocument,
  isPdfDocument,
  resolveDocumentName,
} from "@/lib/company-documents";

export const dynamic = "force-dynamic";

async function getDivisionForUser(divisionId: string, current: { companyId: string | null; role: string }) {
  const division = await prisma.companyDocumentDivision.findUnique({
    where: { id: divisionId },
  });
  if (!division) return null;
  if (current.companyId && division.companyId !== current.companyId) return null;
  if (!current.companyId && current.role !== "super") return null;
  return division;
}

export async function GET(req: Request) {
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const divisionId = searchParams.get("divisionId");
  if (!divisionId) return NextResponse.json([]);

  const division = await getDivisionForUser(divisionId, current);
  if (!division) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const documents = await prisma.companyDocument.findMany({
    where: { divisionId },
    orderBy: { createdAt: "desc" },
    include: {
      uploadedBy: { select: { email: true } },
    },
  });

  return NextResponse.json(documents);
}

export async function POST(req: Request) {
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cloud = getCloudinary();
  if (!cloud) {
    return NextResponse.json(
      { error: "Cloudinary is not configured for uploads" },
      { status: 503 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const divisionId = formData.get("divisionId") as string | null;
  const customName = (formData.get("name") as string | null) ?? "";

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file received" }, { status: 400 });
  }
  if (!divisionId) {
    return NextResponse.json({ error: "Division is required" }, { status: 400 });
  }
  if (!isAllowedCompanyDocument(file)) {
    return NextResponse.json(
      { error: "Only PDF and Word documents (.pdf, .doc, .docx) are allowed" },
      { status: 400 }
    );
  }

  const division = await getDivisionForUser(divisionId, current);
  if (!division) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const documentName = resolveDocumentName(customName, file.name);
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloud.uploader.upload_stream(
        {
          folder: "company_documents",
          resource_type: isPdfDocument(file.name) ? "auto" : "raw",
        },
        (error, uploadResult) => {
          if (error) reject(error);
          else if (uploadResult?.secure_url) resolve(uploadResult);
          else reject(new Error("No URL returned"));
        }
      );
      uploadStream.end(buffer);
    });

    const doc = await prisma.companyDocument.create({
      data: {
        name: documentName,
        fileUrl: result.secure_url,
        mimeType: companyDocumentMimeType(documentName) ?? (file.type || null),
        size: file.size,
        divisionId,
        uploadedById: current.id,
      },
      include: {
        uploadedBy: { select: { email: true } },
      },
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (err) {
    console.error("Company document upload:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
