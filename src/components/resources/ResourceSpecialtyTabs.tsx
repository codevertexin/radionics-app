import { Link, useLocation, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { SpecialtyResourceSummary } from '@/types';

const ALL_TABS = [
  { key: 'assets', label: 'Assets', countKey: 'assetCount' as const },
  { key: 'protocols', label: 'Protocolos', countKey: 'protocolCount' as const },
  { key: 'activations', label: 'Ativações', countKey: 'activationCount' as const },
  { key: 'materials', label: 'Materiais', countKey: 'materialCount' as const },
] as const;

interface ResourceSpecialtyTabsProps {
  summary: SpecialtyResourceSummary;
}

/** Tabs must receive summary via props — sibling of <Outlet>, not a child route. */
export function ResourceSpecialtyTabs({ summary }: ResourceSpecialtyTabsProps) {
  const { specialtySlug } = useParams<{ specialtySlug: string }>();
  const location = useLocation();

  if (!specialtySlug) return null;

  const visibleTabs = ALL_TABS.filter(tab => summary[tab.countKey] > 0);
  if (visibleTabs.length === 0) return null;

  const activeTab = visibleTabs.find(t => location.pathname.includes(`/${t.key}`))?.key
    ?? visibleTabs[0].key;

  return (
    <div className="flex flex-wrap gap-1 border-b border-[var(--color-border)] px-6">
      {visibleTabs.map(tab => (
        <Link
          key={tab.key}
          to={`/resources/${specialtySlug}/${tab.key}`}
          className={cn(
            'px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
            activeTab === tab.key
              ? 'border-[var(--color-gold)] text-[var(--color-gold)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]',
          )}
        >
          {tab.label}
          <span className="ml-1.5 text-[10px] opacity-60">({summary[tab.countKey]})</span>
        </Link>
      ))}
    </div>
  );
}
