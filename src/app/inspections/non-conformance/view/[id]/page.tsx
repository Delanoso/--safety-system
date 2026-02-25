import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileDown, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

/**
 * View page for an NCR report. Layout matches the PDF so users can
 * confirm content before downloading.
 */
export default async function ViewNcrPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const report = await prisma.ncrReport.findUnique({
    where: { id },
    include: {
      company: true,
      items: { include: { images: true } },
    },
  });

  if (!report) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b-2 border-black">
          <Link
            href="/inspections/non-conformance"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-black text-black hover:bg-black hover:text-white transition"
          >
            <ArrowLeft size={18} />
            Back to Non-Conformance
          </Link>
          <a
            href={`/pdf-renderer?type=ncr&id=${encodeURIComponent(id)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="button button-pdf inline-flex items-center gap-2"
          >
            <FileDown size={20} />
            Download PDF
          </a>
        </div>

        <header className="border-b-2 border-black pb-4 mb-6">
          <h1 className="text-2xl font-bold text-black">Non-Conformance Report</h1>
        </header>

        <div className="space-y-2 text-sm mb-6">
          <div><strong>Report ID:</strong> {report.id}</div>
          {report.company && <div><strong>Company:</strong> {report.company.name}</div>}
          <div><strong>Created:</strong> {new Date(report.createdAt).toLocaleString()}</div>
          <div><strong>Status:</strong> {report.status}</div>
          <div><strong>Department:</strong> {report.department || "N/A"}</div>
        </div>

        <div className="space-y-6">
          {report.items.map((item, index) => (
            <div
              key={item.id}
              className="pb-4 border-b border-dashed border-black"
            >
              <h2 className="text-lg font-bold text-black mb-2">
                Item {index + 1}: {item.description || "No description"}
              </h2>
              <div className="text-sm space-y-1">
                <div><strong>Date:</strong> {new Date(item.date).toLocaleDateString()}</div>
                <div><strong>Department:</strong> {item.department || "N/A"}</div>
                {item.comment && <div><strong>Comment:</strong> {item.comment}</div>}
              </div>
              {item.images.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.images.map((img) => (
                    <img
                      key={img.id}
                      src={img.url}
                      alt="NCR"
                      className="max-w-[120px] max-h-24 object-cover border border-black"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <footer className="mt-10 pt-4 border-t border-black text-center text-xs text-black">
          Safety System — Non-Conformance Report
        </footer>
      </div>
    </div>
  );
}
