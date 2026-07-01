"use client";

import { useEffect, useRef, useState } from "react";

export type CompanyPersonRecord = {
  id: string;
  name: string;
  surname: string | null;
  employeeNumber: string | null;
  idNumber: string | null;
  occupation: string | null;
  department: string | null;
  supervisor: string | null;
  contactNumber: string | null;
  address: string | null;
};

type PersonAutocompleteProps = {
  label?: string;
  placeholder?: string;
  onSelect: (person: CompanyPersonRecord) => void;
  /** Change to clear the search input (e.g. after adding an attendee). */
  resetToken?: string | number;
};

export function personDisplayName(p: Pick<CompanyPersonRecord, "name" | "surname">) {
  return [p.name, p.surname].filter(Boolean).join(" ");
}

export function PersonDetailsCard({ person }: { person: CompanyPersonRecord }) {
  return (
    <div className="rounded-lg border border-emerald-300 bg-emerald-50/90 p-3 text-sm text-black space-y-1">
      <p className="font-semibold text-emerald-900">Employee loaded from system</p>
      <p>
        <span className="text-black/60">Name:</span> {personDisplayName(person)}
      </p>
      {person.employeeNumber && (
        <p>
          <span className="text-black/60">Employee #:</span> {person.employeeNumber}
        </p>
      )}
      {person.idNumber && (
        <p>
          <span className="text-black/60">ID number:</span> {person.idNumber}
        </p>
      )}
      {person.department && (
        <p>
          <span className="text-black/60">Department:</span> {person.department}
        </p>
      )}
      {person.occupation && (
        <p>
          <span className="text-black/60">Occupation:</span> {person.occupation}
        </p>
      )}
    </div>
  );
}

export default function PersonAutocomplete({
  label = "Search person (name or employee number)",
  placeholder = "Type name or employee number…",
  onSelect,
  resetToken,
}: PersonAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CompanyPersonRecord[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery("");
    setResults([]);
    setOpen(false);
    setSearched(false);
  }, [resetToken]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      setSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/company-people?search=${encodeURIComponent(query.trim())}`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : [];
          setResults(list);
          setSearched(true);
          setOpen(true);
        } else {
          setResults([]);
          setSearched(true);
          setOpen(true);
        }
      } catch {
        setResults([]);
        setSearched(true);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div ref={wrapRef} className="relative z-30">
      <label className="block text-xs font-semibold mb-1 text-black">{label}</label>
      <input
        type="text"
        className="w-full px-3 py-2 rounded-lg border border-white/40 bg-white/90 text-sm text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (results.length > 0 || (searched && query.trim().length >= 2)) {
            setOpen(true);
          }
        }}
        autoComplete="off"
      />
      {loading && <p className="text-xs text-black/60 mt-1">Searching…</p>}
      {open && query.trim().length >= 2 && !loading && (
        <ul className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl text-sm text-black">
          {results.length === 0 ? (
            <li className="px-3 py-3 text-black/60">
              No employees found. Check spelling or add the person under Staff Members first.
            </li>
          ) : (
            results.map((p) => (
              <li key={p.id} className="border-b border-gray-100 last:border-0">
                <button
                  type="button"
                  className="w-full text-left px-3 py-2.5 hover:bg-orange-50 transition"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onSelect(p);
                    setQuery(personDisplayName(p));
                    setOpen(false);
                  }}
                >
                  <span className="font-medium block">{personDisplayName(p)}</span>
                  {p.employeeNumber && (
                    <span className="text-xs text-black/70">Employee #: {p.employeeNumber}</span>
                  )}
                  {p.idNumber && (
                    <span className="text-xs text-black/70 block">ID: {p.idNumber}</span>
                  )}
                  {p.department && (
                    <span className="text-xs text-black/60 block">{p.department}</span>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
