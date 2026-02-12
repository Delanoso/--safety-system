/**
 * PDF renderer layout.
 * Forces white background on html/body and full-viewport overlay to prevent
 * app gradient/theme from bleeding into PDF output.
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
            html, body { background: #ffffff !important; min-height: 100%; }
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
        {children}
      </div>
    </>
  );
}
