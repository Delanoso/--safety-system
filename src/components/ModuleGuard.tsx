"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getModuleFromPath, canAccessModule } from "@/lib/module-access";
import RestrictedAccessModal from "./RestrictedAccessModal";

type UserMe = {
  id: string;
  email: string;
  role: string;
  companyId: string | null;
  companyName: string | null;
  allowedModules: string[] | null;
};

export default function ModuleGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<UserMe | null | undefined>(undefined);
  const [restricted, setRestricted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { user: UserMe | null }) => {
        if (!cancelled) setUser(data?.user ?? null);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      setRestricted(false);
      return;
    }
    const moduleSlug = getModuleFromPath(pathname ?? "");
    if (moduleSlug === null) {
      setRestricted(false);
      return;
    }
    const allowed = canAccessModule(user.allowedModules, moduleSlug);
    setRestricted(!allowed);
  }, [user, pathname]);

  if (restricted) {
    return (
      <RestrictedAccessModal
        open={true}
        onClose={() => {}}
        showGoToDashboard={true}
      />
    );
  }

  return <>{children}</>;
}
