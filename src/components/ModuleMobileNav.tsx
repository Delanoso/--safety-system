import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

type Props = {
  backHref: string;
  backLabel?: string;
};

/** Server-rendered mobile nav — works in PWA without browser chrome or client JS. */
export default function ModuleMobileNav({
  backHref,
  backLabel = "Back",
}: Props) {
  return (
    <nav
      className="module-mobile-nav lg:hidden"
      aria-label="Page navigation"
    >
      <Link href={backHref} className="module-mobile-nav__btn module-mobile-nav__btn--primary">
        <ArrowLeft size={18} aria-hidden />
        {backLabel}
      </Link>
      <Link href="/dashboard" className="module-mobile-nav__btn module-mobile-nav__btn--secondary">
        <Home size={18} aria-hidden />
        Home
      </Link>
    </nav>
  );
}
