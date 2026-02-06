"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";

interface DropdownItem {
  name: string;
  href?: string;
  children?: DropdownItem[];
}

interface DropdownProps {
  title: string;
  icon: React.ReactNode;
  items?: DropdownItem[];
  collapsed: boolean;
}

export default function SidebarDropdown({
  title,
  icon,
  items = [],
  collapsed,
}: DropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="text-[var(--foreground)]">
      <button
        onClick={() => !collapsed && setOpen(!open)}
        className="w-full flex items-center justify-between 
                   px-3 py-2 hover:opacity-70 rounded transition"
      >
        <span className="flex items-center gap-3">
          {icon}
          {!collapsed && title}
        </span>

        {!collapsed &&
          (open ? <ChevronDown size={18} /> : <ChevronRight size={18} />)}
      </button>

      {!collapsed && open && (
        <div className="ml-6 mt-2 flex flex-col gap-2">
          {items.map((item) =>
            item.children ? (
              <NestedDropdown key={item.name} item={item} />
            ) : (
              <Link
                key={item.name}
                href={item.href ?? "#"}
                className="text-sm hover:opacity-70 transition"
              >
                {item.name}
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}

function NestedDropdown({ item }: { item: DropdownItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="text-[var(--foreground)]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between 
                   px-2 py-1 hover:opacity-70 transition"
      >
        {item.name}
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>

      {open && (
        <div className="ml-4 mt-1 flex flex-col gap-1">
          {item.children?.map((child) => (
            <Link
              key={child.name}
              href={child.href ?? "#"}
              className="text-sm hover:opacity-70 transition"
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

