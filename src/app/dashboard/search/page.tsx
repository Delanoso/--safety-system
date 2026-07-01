'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type SearchHit = {
  category: string;
  title: string;
  subtitle?: string;
  href: string;
};

function SearchContent() {
  const searchParams = useSearchParams();
  const raw = searchParams.get('q') ?? '';
  const query = raw.trim();
  const [results, setResults] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/search?q=${encodeURIComponent(query)}`, { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(typeof data.error === 'string' ? data.error : 'Search failed');
          setResults([]);
          return;
        }
        setResults(Array.isArray(data.results) ? data.results : []);
      })
      .catch(() => {
        setError('Search failed');
        setResults([]);
      })
      .finally(() => setLoading(false));
  }, [query]);

  const grouped = results.reduce<Record<string, SearchHit[]>>((acc, hit) => {
    if (!acc[hit.category]) acc[hit.category] = [];
    acc[hit.category].push(hit);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Search</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Search records across Salus — incidents, medicals, contractors, site safety, compliance and more.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--foreground)]/10 bg-[var(--card-bg)] p-4 space-y-2">
        <p className="text-sm text-[var(--muted-foreground)]">
          <span className="font-medium">Search term:</span>{' '}
          {query ? <span className="italic">&ldquo;{query}&rdquo;</span> : <span className="italic">(empty)</span>}
        </p>
        {query.length > 0 && query.length < 2 && (
          <p className="text-xs text-[var(--muted-foreground)]">Type at least 2 characters to search records.</p>
        )}
      </div>

      {!query && (
        <p className="text-[var(--muted-foreground)]">Use the search bar in the top navigation to find anything in your company data.</p>
      )}

      {loading && <p className="text-[var(--muted-foreground)]">Searching…</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {query.length >= 2 && !loading && results.length === 0 && !error && (
        <p className="text-[var(--muted-foreground)]">No results found for &ldquo;{query}&rdquo;.</p>
      )}

      {Object.entries(grouped).map(([category, hits]) => (
        <div key={category} className="space-y-3">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {hits.map((hit, idx) => (
              <Link
                key={`${hit.href}-${idx}`}
                href={hit.href}
                className="block rounded-xl border border-[var(--foreground)]/10 bg-[var(--card-bg)] p-4 hover:border-blue-500 hover:shadow-md transition"
              >
                <h3 className="font-semibold text-[var(--foreground)]">{hit.title}</h3>
                {hit.subtitle && (
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">{hit.subtitle}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardSearchPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto text-[var(--muted-foreground)]">Loading search…</div>}>
      <SearchContent />
    </Suspense>
  );
}
