import React from "react";
import { PdfImageBw } from "@/components/pdf/PdfDocument";
import { chunkArray, type IncidentImageRecord } from "@/lib/incident-images";

const PHOTO_CELL_HEIGHT = 320;
const RELEVANT_HALF_HEIGHT = 420;

export function IncidentPhotoPages({
  images,
}: {
  images: IncidentImageRecord[];
}) {
  const pages = chunkArray(images, 4);
  if (pages.length === 0) return null;

  return (
    <>
      {pages.map((pageImages, pageIndex) => (
        <div
          key={`photo-page-${pageIndex}`}
          style={{
            pageBreakAfter: pageIndex < pages.length - 1 ? "always" : "auto",
            breakAfter: pageIndex < pages.length - 1 ? "page" : "auto",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            {Array.from({ length: 4 }).map((_, cellIndex) => {
              const image = pageImages[cellIndex];
              return (
                <div
                  key={`photo-cell-${pageIndex}-${cellIndex}`}
                  style={{
                    width: "100%",
                    height: PHOTO_CELL_HEIGHT,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #d1d5db",
                    padding: 4,
                    boxSizing: "border-box",
                    background: "#fafafa",
                  }}
                >
                  {image ? (
                    <PdfImageBw
                      src={image.url}
                      alt={`Incident photo ${pageIndex * 4 + cellIndex + 1}`}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        width: "auto",
                        height: "auto",
                        objectFit: "contain",
                      }}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

export function IncidentRelevantInfoPages({
  images,
}: {
  images: IncidentImageRecord[];
}) {
  const pages = chunkArray(images, 2);
  if (pages.length === 0) return null;

  return (
    <>
      {pages.map((pageItems, pageIndex) => (
        <div
          key={`relevant-page-${pageIndex}`}
          style={{
            pageBreakAfter: pageIndex < pages.length - 1 ? "always" : "auto",
            breakAfter: pageIndex < pages.length - 1 ? "page" : "auto",
          }}
        >
          {pageItems.map((image, itemIndex) => (
            <div
              key={image.id || `${pageIndex}-${itemIndex}`}
              style={{
                height: RELEVANT_HALF_HEIGHT,
                display: "flex",
                flexDirection: "column",
                border: "1px solid #d1d5db",
                padding: 10,
                boxSizing: "border-box",
                marginBottom: itemIndex === 0 && pageItems.length > 1 ? 10 : 0,
                pageBreakInside: "avoid",
                breakInside: "avoid",
                background: "#fafafa",
              }}
            >
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <PdfImageBw
                  src={image.url}
                  alt={`Relevant information ${pageIndex * 2 + itemIndex + 1}`}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    width: "auto",
                    height: "auto",
                    objectFit: "contain",
                  }}
                />
              </div>
              {image.comment ? (
                <p
                  style={{
                    margin: "10px 0 0",
                    fontSize: 12,
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  <strong>Comment:</strong> {image.comment}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
