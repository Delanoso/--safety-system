import { PdfPrintBar } from "./PdfPrintBar";

/**
 * PDF renderer layout.
 * Forces white background and black text on all content so every PDF is
 * consistent; only the company logo in the header may use colour.
 * Includes a "Print / Save as PDF" bar so users can save without server-side Chrome.
 */
export default function PdfRendererLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            html, body {
              background: #ffffff !important;
              color: #111827 !important;
              min-height: 100%;
              margin: 0;
              padding: 0;
            }
          `,
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#ffffff",
          color: "#000000",
          overflow: "auto",
          zIndex: 99999,
        }}
      >
        <PdfPrintBar />
        {children}
      </div>
    </>
  );
}
