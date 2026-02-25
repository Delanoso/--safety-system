'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type SearchTarget = {
  name: string;
  description: string;
  href: string;
  tags: string[];
};

const TARGETS: SearchTarget[] = [
  {
    name: 'Medicals',
    description: 'View and manage employee medicals',
    href: '/medicals/list',
    tags: ['medical', 'medicals', 'health', 'expiry'],
  },
  {
    name: 'Training Certificates',
    description: 'Browse and manage training certificates',
    href: '/training/certificates/list',
    tags: ['training', 'certificate', 'certificates', 'course'],
  },
  {
    name: 'Contractors',
    description: 'Manage contractor safety files and uploads',
    href: '/contractors',
    tags: ['contractor', 'contractors', 'safety file', 'uploads'],
  },
  {
    name: 'PPE Management',
    description: 'Manage PPE stock, sizes and issues',
    href: '/ppe-management',
    tags: ['ppe', 'equipment', 'stock', 'sizes'],
  },
  {
    name: 'Incidents',
    description: 'View and manage incident reports',
    href: '/incidents/list',
    tags: ['incident', 'incidents', 'accident', 'report'],
  },
  {
    name: 'Risk Assessments',
    description: 'Manage risk assessments',
    href: '/risk-assessments',
    tags: ['risk', 'assessment', 'hazard'],
  },
  {
    name: 'Hazardous Chemicals',
    description: 'Manage hazardous chemical inventory',
    href: '/hazardous-chemicals',
    tags: ['chemical', 'chemicals', 'hazardous', 'msds'],
  },
  {
    name: 'Inspections',
    description: 'Plan and capture inspections',
    href: '/inspections',
    tags: ['inspection', 'inspections', 'daily', 'weekly', 'monthly'],
  },
  {
    name: 'Documents (Safety Files)',
    description: 'Browse safety file documents by section',
    href: '/dashboard/docs/safety-files',
    tags: ['docs', 'documents', 'safety file', 'files'],
  },
];

export default function DashboardSearchPage() {
  const searchParams = useSearchParams();
  const raw = searchParams.get('q') ?? '';
  const query = raw.trim();

  const normalized = query.toLowerCase();
  const results = normalized
    ? TARGETS.filter((t) => {
        const haystack = [t.name, t.description, ...t.tags].join(' ').toLowerCase();
        return haystack.includes(normalized);
      })
    : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Search results</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Showing matches inside this Safety System project only.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--foreground)]/10 bg-[var(--card-bg)] p-4 space-y-3">
        <p className="text-sm text-[var(--muted-foreground)]">
          <span className="font-medium">Search term:</span>{' '}
          {query ? <span className="italic">“{query}”</span> : <span className="italic">(empty)</span>}
        </p>
        {query && (
          <p className="text-xs text-[var(--muted-foreground)]">
            Tip: This search is internal-only and helps you jump to the right module. Use the search
            boxes inside each module to filter detailed records.
          </p>
        )}
      </div>

      {!query && (
        <p className="text-[var(--muted-foreground)]">
          Type a search term in the top bar to find modules and sections in this project.
        </p>
      )}

      {query && results.length === 0 && (
        <p className="text-[var(--muted-foreground)]">No matching modules found for “{query}”.</p>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="block rounded-xl border border-[var(--foreground)]/10 bg-[var(--card-bg)] p-4 hover:border-blue-500 hover:shadow-md transition"
            >
              <h2 className="font-semibold text-[var(--foreground)]">{t.name}</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">{t.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

