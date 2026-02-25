"use client";

export function PdfPrintBar() {
  return (
    <div
      className="pdf-print-bar"
      style={{
        position: "sticky",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100000,
        background: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)",
        color: "#fff",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      <span style={{ fontSize: 14, opacity: 0.95 }}>
        To save as PDF: click <strong>Print / Save as PDF</strong>, then choose <strong>Save as PDF</strong> or <strong>Microsoft Print to PDF</strong> as the destination.
      </span>
      <button
        type="button"
        onClick={() => window.print()}
        style={{
          background: "#fff",
          color: "#1e40af",
          border: "none",
          padding: "10px 22px",
          borderRadius: 8,
          fontSize: 15,
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      >
        Print / Save as PDF
      </button>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              .pdf-print-bar { display: none !important; }
            }
          `,
        }}
      />
    </div>
  );
}
