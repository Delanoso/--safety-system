import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export type CompanyPdfBranding = {
  logoUrl: string | null;
  companyName: string | null;
};

async function fetchCompanyBranding(
  companyId: string
): Promise<CompanyPdfBranding> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { logoUrl: true, name: true },
  });
  return {
    logoUrl: company?.logoUrl ?? null,
    companyName: company?.name ?? null,
  };
}

/**
 * Logo + company name for PDF headers.
 * Uses the given company when companyId is provided, otherwise the current user's company.
 */
export async function getCompanyPdfBranding(
  companyId?: string | null
): Promise<CompanyPdfBranding> {
  if (companyId) {
    return fetchCompanyBranding(companyId);
  }

  const user = await getCurrentUser();
  if (!user?.companyId) {
    return { logoUrl: null, companyName: null };
  }

  return fetchCompanyBranding(user.companyId);
}

/**
 * Prefer entity company fields when already loaded, otherwise fetch branding.
 */
export async function resolvePdfBranding(
  companyId?: string | null,
  company?: { logoUrl?: string | null; name?: string } | null
): Promise<CompanyPdfBranding> {
  const branding = await getCompanyPdfBranding(companyId);
  return {
    logoUrl: company?.logoUrl ?? branding.logoUrl,
    companyName: company?.name ?? branding.companyName,
  };
}

/**
 * Get company logo URL for PDF generation.
 * Uses entity's company when companyId is provided, otherwise the current user's company.
 */
export async function getCompanyLogoUrl(
  companyId?: string | null
): Promise<string | null> {
  const { logoUrl } = await getCompanyPdfBranding(companyId);
  return logoUrl;
}
