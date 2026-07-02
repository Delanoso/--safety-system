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
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&display=swap"
        rel="stylesheet"
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
            html, body {
              background: #ffffff !important;
              color: #111827 !important;
              margin: 0;
              padding: 0;
              overflow: visible !important;
              min-height: 100%;
              height: 100%;
            }
          `,
        }}
      />
      {children}
    </>
  );
}
