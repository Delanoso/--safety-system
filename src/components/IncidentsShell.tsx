"use client";

import { usePathname } from "next/navigation";
import ModuleMobileNav from "./ModuleMobileNav";

function getBackTarget(pathname: string): { href: string; label: string } | null {
  if (pathname === "/incidents") return null;
  if (pathname.startsWith("/incidents/sign/")) {
    return { href: "/incidents/list", label: "Incidents" };
  }
  if (pathname.startsWith("/incidents/")) {
    return { href: "/incidents", label: "Incidents" };
  }
  return null;
}

export default function IncidentsShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const back = getBackTarget(pathname);

  if (!back) {
    return <div className="module-page-shell module-page-shell--plain">{children}</div>;
  }

  return (
    <div className="module-page-shell">
      <ModuleMobileNav backHref={back.href} backLabel={back.label} />
      <div className="module-page-shell__content">{children}</div>
    </div>
  );
}
