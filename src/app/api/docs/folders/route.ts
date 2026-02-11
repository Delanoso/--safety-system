import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const section = searchParams.get("section");

    if (!section) {
      return NextResponse.json([]);
    }

    const folders = await prisma.folder.findMany({
      where: { section },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(folders);
  } catch (err) {
    console.error("FOLDERS GET ERROR:", err);
    return NextResponse.json(
      { error: "Failed to load folders" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name, section } = await req.json();

    if (!name || !section) {
      return NextResponse.json(
        { error: "Missing name or section" },
        { status: 400 }
      );
    }

    const folder = await prisma.folder.create({
      data: { name, section },
    });

    return NextResponse.json(folder);
  } catch (err) {
    console.error("FOLDER CREATE ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

