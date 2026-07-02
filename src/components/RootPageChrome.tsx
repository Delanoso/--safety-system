"use client";

import { usePathname } from "next/navigation";
import MobilePageNav, { shouldShowMobilePageNav } from "./MobilePageNav";

export default function RootPageChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const showNav = shouldShowMobilePageNav(pathname);

  return (
    <>
      {showNav ? <MobilePageNav /> : null}
      <div className={showNav ? "mobile-nav-page-spacer" : "max-w-full overflow-x-hidden"}>
        {children}
      </div>
    </>
  );
}
