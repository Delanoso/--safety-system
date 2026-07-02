import React from "react";
import { getPdfFooterMetadata } from "@/lib/pdf-document-metadata";

const PDF_HEADER_BLUE = "#1e40af";
const PDF_TEXT = "#111827";
const PDF_BORDER = "#e5e7eb";
const PDF_TABLE_HEAD_BG = "#f0f9ff";
const PDF_COMPANY_NAME_FONT =
  "'Cormorant Garamond', Georgia, 'Times New Roman', serif";

/**
 * Shared PDF document wrapper.
 * Standard header: company logo + name (top left), then document title below.
 */
export function PdfDocument({
  children,
  title,
  documentType: _documentType,
  logoUrl,
  companyName,
  entityId,
  documentNumber,
}: {
  children: React.ReactNode;
  title: string;
  /** Kept for compatibility; no longer shown in the header/footer. */
  documentType?: string;
  logoUrl?: string | null;
  companyName?: string | null;
  entityId?: string | null;
  documentNumber?: string | null;
}) {
  const footer = getPdfFooterMetadata({ entityId, documentNumber });
  const baseStyles: React.CSSProperties = {
    margin: 0,
    padding: "12px 48px 0",
    fontFamily: "Georgia, 'Times New Roman', serif",
    background: "#ffffff",
    color: PDF_TEXT,
    fontSize: 14,
    lineHeight: 1.6,
    maxWidth: 210 * 3.78,
    marginLeft: "auto",
    marginRight: "auto",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
  };

  const headerStyles: React.CSSProperties = {
    borderBottom: `3px solid ${PDF_HEADER_BLUE}`,
    paddingBottom: 14,
    marginBottom: 22,
  };

  const brandingRowStyles: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 12,
    minHeight: 50,
  };

  const companyNameStyles: React.CSSProperties = {
    margin: 0,
    fontFamily: PDF_COMPANY_NAME_FONT,
    fontSize: 26,
    fontWeight: 600,
    color: "#1e293b",
    letterSpacing: "0.03em",
    lineHeight: 1.15,
  };

  const footerStyles: React.CSSProperties = {
    marginTop: "auto",
    paddingTop: 12,
    paddingBottom: 0,
    borderTop: `1px solid ${PDF_BORDER}`,
    fontSize: 10,
    color: "#6b7280",
    letterSpacing: "0.01em",
    lineHeight: 1.5,
    flexShrink: 0,
  };

  const footerGridStyles: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 12,
    textAlign: "center",
  };

  const footerLabelStyles: React.CSSProperties = {
    display: "block",
    fontSize: 9,
    fontWeight: 700,
    color: PDF_HEADER_BLUE,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: 4,
  };

  const footerValueStyles: React.CSSProperties = {
    display: "block",
    fontSize: 10,
    color: "#374151",
    fontWeight: 500,
  };

  const showBranding = Boolean(logoUrl || companyName);

  return (
    <div style={baseStyles} className="pdf-page">
      <header style={headerStyles}>
        {showBranding && (
          <div style={brandingRowStyles}>
            {logoUrl && (
              <img
                src={logoUrl}
                alt={companyName ? `${companyName} logo` : "Company logo"}
                style={{
                  maxHeight: 60,
                  maxWidth: 180,
                  objectFit: "contain",
                  flexShrink: 0,
                  display: "block",
                }}
              />
            )}
            {companyName && <p style={companyNameStyles}>{companyName}</p>}
          </div>
        )}

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
        </div>
      </header>

      <main
        style={{
          color: PDF_TEXT,
          fontSize: 14,
          lineHeight: 1.6,
          flex: 1,
        }}
      >
        {children}
      </main>

      <footer style={footerStyles}>
        <div style={footerGridStyles}>
          <div>
            <span style={footerLabelStyles}>Document No.</span>
            <span style={footerValueStyles}>{footer.documentNumber}</span>
          </div>
          <div>
            <span style={footerLabelStyles}>Created</span>
            <span style={footerValueStyles}>{footer.createdDate}</span>
          </div>
          <div>
            <span style={footerLabelStyles}>Review Date</span>
            <span style={footerValueStyles}>{footer.reviewDate}</span>
          </div>
          <div>
            <span style={footerLabelStyles}>PDF Date</span>
            <span style={footerValueStyles}>{footer.pdfDate}</span>
          </div>
        </div>
      </footer>
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
