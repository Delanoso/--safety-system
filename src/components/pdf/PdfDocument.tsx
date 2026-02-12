import React from "react";

/**
 * Shared PDF document wrapper.
 * - White background, black text only (B&W)
 * - Full page layout with consistent margins
 * - Optional company logo in header (exception to B&W - logo stays as uploaded)
 * - Footer with document type
 */
export function PdfDocument({
  children,
  title,
  documentType,
  logoUrl,
}: {
  children: React.ReactNode;
  title: string;
  documentType: string;
  logoUrl?: string | null;
}) {
  const baseStyles: React.CSSProperties = {
    margin: 0,
    padding: "40px 48px",
    fontFamily: "Arial, Helvetica, sans-serif",
    background: "#ffffff",
    color: "#000000",
    fontSize: 13,
    lineHeight: 1.5,
    minHeight: "100vh",
  };

  const headerStyles: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "2px solid #000",
    paddingBottom: 16,
    marginBottom: 24,
  };

  const footerStyles: React.CSSProperties = {
    marginTop: 40,
    paddingTop: 12,
    borderTop: "1px solid #000",
    textAlign: "center",
    fontSize: 10,
    color: "#000",
  };

  return (
    <div style={baseStyles}>
      <header style={headerStyles}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: "bold" }}>{title}</h1>
        </div>
        {logoUrl && (
          <div style={{ flexShrink: 0 }}>
            <img
              src={logoUrl}
              alt="Company logo"
              style={{
                maxHeight: 48,
                maxWidth: 180,
                objectFit: "contain",
              }}
            />
          </div>
        )}
      </header>

      <main style={{ color: "#000" }}>{children}</main>

      <footer style={footerStyles}>{documentType}</footer>
    </div>
  );
}

/**
 * Wrapper for images that should appear in grayscale (B&W).
 * Use for incident photos, NCR images, etc. - NOT for company logo.
 */
export function PdfImageBw({
  src,
  alt,
  style = {},
}: {
  src: string;
  alt: string;
  style?: React.CSSProperties;
}) {
  return (
    <img
      src={src}
      alt={alt}
      style={{
        filter: "grayscale(100%)",
        ...style,
      }}
    />
  );
}

/**
 * Simple section heading for PDF content
 */
export function PdfSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2
        style={{
          fontSize: 15,
          marginBottom: 8,
          fontWeight: "bold",
          color: "#000",
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}
