import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileDown, ArrowLeft } from "lucide-react";
import { getPdfDownloadUrl } from "@/lib/pdf-download";
import { getCurrentUser } from "@/lib/auth";
import { canAccessInspection } from "@/lib/inspection-access";

export const dynamic = "force-dynamic";

/**
 * View page for a daily inspection. This layout matches the PDF output
 * so users can confirm content before downloading.
 */
export default async function ViewDailyInspectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const current = await getCurrentUser();
  if (!current) notFound();

  const inspection = await prisma.dailyInspection.findUnique({
    where: { id },
    select: { id: true, department: true, inspector: true, createdAt: true, data: true, companyId: true },
  });

  if (!inspection) notFound();

  if (!canAccessInspection(current, inspection)) notFound();

  let parsed: {
    columns: string[];
    legendItems: string[];
    rows: string[][];
  } = {
    columns: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    legendItems: [],
    rows: [],
  };

  try {
    if (inspection.data) {
      parsed = { ...parsed, ...JSON.parse(inspection.data as string) };
    }
  } catch {
    // keep defaults
  }

  const { columns, legendItems, rows } = parsed;

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-4xl mx-auto p-8">
        {/* Actions */}
        <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b-2 border-black">
          <Link
            href="/inspections"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-black text-black hover:bg-black hover:text-white transition"
          >
            <ArrowLeft size={18} />
            Back to Inspections
          </Link>
          <a
            href={getPdfDownloadUrl("daily-inspection", id)}
            className="button button-pdf inline-flex items-center gap-2"
          >
            <FileDown size={20} />
            Download PDF
          </a>
        </div>

        {/* Same structure as PDF for consistency */}
        <header className="border-b-2 border-black pb-4 mb-6">
          <h1 className="text-2xl font-bold text-black">Daily Inspection Report</h1>
        </header>

        <div className="space-y-2 text-sm mb-6">
          <div><strong>Inspection ID:</strong> {id}</div>
          <div><strong>Department:</strong> {inspection.department}</div>
          <div><strong>Inspector:</strong> {inspection.inspector}</div>
          <div><strong>Created At:</strong> {new Date(inspection.createdAt).toLocaleString()}</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm text-black">
            <thead>
              <tr>
                <th className="border border-black p-2 bg-white font-bold">#</th>
                <th className="border border-black p-2 bg-white font-bold text-left">Inspection Item</th>
                {columns.map((col) => (
                  <th key={col} className="border border-black p-2 bg-white font-bold">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {legendItems.map((item, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="border border-black p-2 bg-white">{rowIndex + 1}</td>
                  <td className="border border-black p-2 bg-white text-left">{item}</td>
                  {columns.map((_, colIndex) => (
                    <td key={colIndex} className="border border-black p-2 bg-white">
                      {rows?.[rowIndex]?.[colIndex] ?? ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="mt-10 pt-4 border-t border-black text-center text-xs text-black">
          Salus — Daily Inspection Report
        </footer>
      </div>
    </div>
  );
}
