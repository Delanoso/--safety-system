import React from "react";

export const dynamic = "force-dynamic";

export default function InspectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden">
      {children}
    </div>
  );
}

