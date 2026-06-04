import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface ResourceSearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ResourceSearchBox({
  value,
  onChange,
  placeholder = 'Pesquisar por nome, nome canónico, original ou aliases…',
}: ResourceSearchBoxProps) {
  return (
    <div className="relative max-w-xl">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
      />
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
}
