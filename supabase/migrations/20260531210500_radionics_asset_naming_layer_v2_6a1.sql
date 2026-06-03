-- =============================================================================
-- RADIONICS — Phase V2.6A.1: Asset naming layer (canonical + aliases)
-- Additive columns on methodology_assets for search, workflows, and AI.
-- Chakra alias seed deferred to a future migration (documented in V2.6A.1 doc).
-- =============================================================================

alter table public.methodology_assets
  add column if not exists canonical_name text,
  add column if not exists original_name text,
  add column if not exists aliases text[] not null default '{}';

comment on column public.methodology_assets.name is
  'Display name for UI (may include accents and marketing labels).';

comment on column public.methodology_assets.canonical_name is
  'Official internal reference name; defaults to name when unset.';

comment on column public.methodology_assets.original_name is
  'Original name from source material (e.g. Sanskrit chakra name).';

comment on column public.methodology_assets.aliases is
  'Alternative searchable names (synonyms, translations, legacy labels).';

-- Backfill existing rows only when values are null / empty
update public.methodology_assets
set
  canonical_name = name,
  updated_at = now()
where canonical_name is null;

-- original_name remains null for existing rows (set in future alias migrations)

update public.methodology_assets
set
  aliases = '{}'::text[]
where aliases is null;

create index if not exists idx_methodology_assets_canonical_name
  on public.methodology_assets (canonical_name);

create index if not exists idx_methodology_assets_original_name
  on public.methodology_assets (original_name)
  where original_name is not null;

create index if not exists idx_methodology_assets_aliases_gin
  on public.methodology_assets using gin (aliases);
