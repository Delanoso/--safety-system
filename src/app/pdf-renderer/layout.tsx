/**
 * PDF renderer layout — clean document only (no print bar).
 * Used internally by /api/pdf; not shown to end users.
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
              margin: 0;
              padding: 0;
              overflow: visible !important;
            }
          `,
        }}
      />
      {children}
    </>
  );
}
