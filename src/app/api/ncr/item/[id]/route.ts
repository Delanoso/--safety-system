import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Delete images first (due to FK constraint)
    await prisma.ncrImage.deleteMany({
      where: { itemId: id },
    });

    // Delete the item
    await prisma.ncrItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting NCR item:", error);
    return NextResponse.json(
      { error: "Failed to delete NCR item" },
      { status: 500 }
    );
  }
}

