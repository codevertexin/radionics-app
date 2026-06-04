import { Link, useLocation, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';

const TABS = [
  { key: 'assets', label: 'Assets' },
  { key: 'protocols', label: 'Protocolos' },
  { key: 'activations', label: 'Ativações' },
  { key: 'materials', label: 'Materiais' },
] as const;

export function ResourceSpecialtyTabs() {
  const { specialtySlug } = useParams<{ specialtySlug: string }>();
  const location = useLocation();

  if (!specialtySlug) return null;

  const activeTab = TABS.find(t => location.pathname.includes(`/${t.key}`))?.key ?? 'assets';

  return (
    <div className="flex flex-wrap gap-1 border-b border-[var(--color-border)] px-6">
      {TABS.map(tab => (
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
        </Link>
      ))}
    </div>
  );
}
