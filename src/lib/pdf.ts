import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * Get company logo URL for PDF generation.
 * Uses entity's company when companyId is provided, otherwise the current user's company.
 */
export async function getCompanyLogoUrl(
  companyId?: string | null
): Promise<string | null> {
  if (companyId) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { logoUrl: true },
    });
    return company?.logoUrl ?? null;
  }

  const user = await getCurrentUser();
  if (!user?.companyId) return null;

  const company = await prisma.company.findUnique({
    where: { id: user.companyId },
    select: { logoUrl: true },
  });
  return company?.logoUrl ?? null;
}
