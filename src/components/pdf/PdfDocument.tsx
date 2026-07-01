import React from "react";

const PDF_HEADER_BLUE = "#1e40af";
const PDF_TEXT = "#111827";
const PDF_BORDER = "#e5e7eb";
const PDF_TABLE_HEAD_BG = "#f0f9ff";

/**
 * Shared PDF document wrapper.
 * Professional layout: blue header, clear hierarchy, optional logo, footer.
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
    padding: "48px 56px 56px",
    fontFamily: "Georgia, 'Times New Roman', serif",
    background: "#ffffff",
    color: PDF_TEXT,
    fontSize: 14,
    lineHeight: 1.6,
    maxWidth: 210 * 3.78,
    marginLeft: "auto",
    marginRight: "auto",
  };

  const headerStyles: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: `3px solid ${PDF_HEADER_BLUE}`,
    paddingBottom: 20,
    marginBottom: 28,
  };

  const footerStyles: React.CSSProperties = {
    marginTop: 48,
    paddingTop: 16,
    borderTop: `1px solid ${PDF_BORDER}`,
    textAlign: "center",
    fontSize: 11,
    color: "#6b7280",
    letterSpacing: "0.02em",
  };

  return (
    <div style={baseStyles} className="pdf-page">
      <header style={headerStyles}>
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 26,
              fontWeight: 700,
              color: PDF_HEADER_BLUE,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 12,
              color: "#6b7280",
              fontWeight: 400,
            }}
          >
            {documentType}
          </p>
        </div>
        {logoUrl && (
          <div style={{ flexShrink: 0 }}>
            <img
              src={logoUrl}
              alt="Company logo"
              style={{
                maxHeight: 52,
                maxWidth: 200,
                objectFit: "contain",
              }}
            />
          </div>
        )}
      </header>

      <main style={{ color: PDF_TEXT, fontSize: 14, lineHeight: 1.6 }}>{children}</main>

      <footer style={footerStyles}>{documentType}</footer>
    </div>
  );
}

/**
 * Image for PDF content (incident photos, NCR images, etc.). Renders in color with a subtle border.
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
        border: `1px solid ${PDF_BORDER}`,
        borderRadius: 4,
        display: "block",
        maxWidth: "100%",
        height: "auto",
        ...style,
      }}
    />
  );
}

/**
 * Section block for PDF content with a clear heading and accent line.
 */
export function PdfSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 26 }}>
      <h2
        style={{
          fontSize: 16,
          margin: 0,
          marginBottom: 10,
          paddingBottom: 8,
          fontWeight: 700,
          color: PDF_HEADER_BLUE,
          borderBottom: `2px solid ${PDF_HEADER_BLUE}`,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h2>
      <div style={{ color: PDF_TEXT, fontSize: 14, lineHeight: 1.6, marginTop: 4 }}>
        {children}
      </div>
    </div>
  );
}

/**
 * Signature block for PDF: label, signature (image or line), and date.
 * Use for appointments, incident team, risk assessments, etc.
 */
export function PdfSignatureBlock({
  label,
  signature,
  signedAt,
}: {
  label: string;
  signature: string | null;
  signedAt?: string | null;
}) {
  const blockStyle: React.CSSProperties = {
    border: `1px solid ${PDF_BORDER}`,
    borderRadius: 6,
    padding: 16,
    minWidth: 200,
    maxWidth: 280,
  };
  const lineStyle: React.CSSProperties = {
    borderBottom: `1px solid ${PDF_TEXT}`,
    marginTop: 4,
    marginBottom: 12,
    minHeight: 40,
  };
  return (
    <div style={blockStyle}>
      <div style={{ fontSize: 12, fontWeight: 700, color: PDF_HEADER_BLUE, marginBottom: 4 }}>{label}</div>
      {signature ? (
        <img
          src={signature}
          alt={`${label} signature`}
          style={{ maxWidth: 220, maxHeight: 56, objectFit: "contain", display: "block", marginBottom: 8 }}
        />
      ) : (
        <div style={lineStyle} />
      )}
      <div style={{ fontSize: 11, color: "#6b7280" }}>
        Date: {signedAt ? new Date(signedAt).toLocaleDateString() : "_______________"}
      </div>
    </div>
  );
}

/** Shared table styles for PDF: light header, clean borders. */
export const pdfTableStyles = {
  table: {
    width: "100%" as const,
    borderCollapse: "collapse" as const,
    fontSize: 13,
    color: PDF_TEXT,
  },
  th: {
    border: `1px solid ${PDF_BORDER}`,
    padding: "10px 12px",
    textAlign: "left" as const,
    fontWeight: 700 as const,
    background: PDF_TABLE_HEAD_BG,
    color: PDF_HEADER_BLUE,
    fontSize: 12,
  },
  td: {
    border: `1px solid ${PDF_BORDER}`,
    padding: "10px 12px",
    background: "#ffffff",
    color: PDF_TEXT,
  },
} as const;
