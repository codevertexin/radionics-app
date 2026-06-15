import { cn } from '@/lib/utils';

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-lg bg-[var(--color-surface-1)] animate-pulse',
        className,
      )}
      aria-hidden
    />
  );
}

function MaterialCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-0)] overflow-hidden">
      <SkeletonBlock className="aspect-[4/3] w-full rounded-none" />
      <div className="p-4 space-y-3">
        <SkeletonBlock className="h-4 w-3/4" />
        <SkeletonBlock className="h-3 w-full" />
        <SkeletonBlock className="h-3 w-5/6" />
        <div className="flex gap-2 pt-1">
          <SkeletonBlock className="h-5 w-16 rounded-full" />
          <SkeletonBlock className="h-5 w-12 rounded-full" />
        </div>
        <SkeletonBlock className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export function ResourceMaterialsPageSkeleton() {
  return (
    <div className="p-6 space-y-8" aria-busy="true" aria-label="A carregar materiais">
      <div className="space-y-4">
        <SkeletonBlock className="h-5 w-32" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MaterialCardSkeleton />
          <MaterialCardSkeleton />
        </div>
      </div>
    </div>
  );
}
