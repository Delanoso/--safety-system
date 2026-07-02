"use client";

import { usePathname } from "next/navigation";
import ModuleMobileNav from "./ModuleMobileNav";

function getBackTarget(pathname: string): { href: string; label: string } | null {
  if (pathname === "/appointments") return null;
  if (pathname.startsWith("/appointments/sign/")) {
    return { href: "/appointments/request-signature", label: "Signatures" };
  }
  if (pathname.startsWith("/appointments/")) {
    return { href: "/appointments", label: "Appointments" };
  }
  return null;
}

export default function AppointmentsShell({
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
