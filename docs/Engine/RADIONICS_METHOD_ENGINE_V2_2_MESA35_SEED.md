# RADIONICS — Methodology Engine V2.2: Mesa 35 seed

## Migration

**File:** `supabase/migrations/20260531160000_radionics_methodology_seed_mesa35_v2.sql`

**Type:** Additive seed only (no `ALTER` on Phase 1 / V2.1 tables, no app changes).

## Prerequisites

| Slug | Table | If missing |
|------|--------|------------|
| `mesa-35` | `radionics_specialties` | Migration **raises exception** with explicit message |
| `graph-set-35` | `methodology_tools` | Exception — apply V2.1 |
| `hawkins-scale` | `methodology_tools` | Exception — apply V2.1 |
| `chakra-set` | `methodology_tools` | Exception — apply V2.1 |

IDs are resolved inside a `DO` block — **no hardcoded UUIDs**.

## What was seeded

### `methodology_assets`

| Tool slug | Assets | Notes |
|-----------|--------|--------|
| `graph-set-35` | **8** | Same set as mock/UI (`TOOLS_RAD35` first 8) |
| `hawkins-scale` | **17** | Levels 20–700 (Hawkins scale in workspace) |
| `chakra-set` | **0** | Tool linked only; assets deferred |

**Total new assets:** 25 rows (8 graphs + 17 Hawkins levels).

### Why only 8 graphs (not 35)

- Current workspace and `mock-data.ts` expose **8** Mesa 35 graphs in the diagnosis UI.
- V2.2 aligns Supabase knowledge with what therapists use today.
- Remaining 27 graphs will be added in a later content migration (see `RADIONICS_CONTENT_MIGRATION_PLAN.md`).

### `specialty_tools` (specialty `mesa-35`)

| sort_order | Tool slug | is_required | visible |
|------------|-----------|-------------|---------|
| 1 | `graph-set-35` | true | true |
| 2 | `hawkins-scale` | true | true |
| 3 | `chakra-set` | false | true |

Uses `ON CONFLICT (specialty_id, tool_id) DO UPDATE` — idempotent.

### `specialty_asset_content`

| Scope | Rows |
|-------|------|
| Mesa 35 × 8 graph assets | **8** |

Per row:

- `title` = asset name  
- `therapist_explanation` = `base_description`  
- `client_explanation` = short client-safe PT text  
- `recommended_use` = usage context  
- `activation_text`, `interpretation`, `notes` = NULL  

**Hawkins:** no `specialty_asset_content` in V2.2 (global assets only).

## What was not changed

- Frontend, services, mock session store  
- Phase 1 tables and RLS  
- V2.1 table definitions  
- `activation_scripts` / links  

## Idempotency

- `methodology_assets`: `ON CONFLICT (tool_id, slug) DO UPDATE`  
- `specialty_tools`: `ON CONFLICT (specialty_id, tool_id) DO UPDATE`  
- `specialty_asset_content`: `ON CONFLICT (specialty_id, asset_id) DO UPDATE`  

Re-running the migration updates descriptions and sort orders without duplicating rows.

## Future phases

| Phase | Work |
|-------|------|
| V2.3+ | Remaining 27 Mesa 35 graph assets + images/metadata |
| V2.x | Chakra assets + `specialty_asset_content` for Mesa 35 |
| V2.x | Hawkins editorial overlay per specialty (optional) |
| App | `methodologyToolsService` reading Supabase when `VITE_DATA_MODE=supabase` |
| App | Workspace loads tools from `specialty_tools` instead of `TOOLS_RAD35` |

## SQL validation queries

### Asset counts per tool

```sql
select mt.slug as tool_slug, count(ma.id) as asset_count
from methodology_tools mt
left join methodology_assets ma on ma.tool_id = mt.id
where mt.slug in ('graph-set-35', 'hawkins-scale', 'chakra-set')
group by mt.slug
order by mt.slug;
```

**Expected:**

| tool_slug | asset_count |
|-----------|-------------|
| chakra-set | 0 |
| graph-set-35 | 8 |
| hawkins-scale | 17 |

### Tools linked to Mesa 35

```sql
select rs.slug as specialty_slug, mt.slug as tool_slug, st.sort_order,
       st.is_required, st.is_visible_in_workspace
from specialty_tools st
join radionics_specialties rs on rs.id = st.specialty_id
join methodology_tools mt on mt.id = st.tool_id
where rs.slug = 'mesa-35'
order by st.sort_order;
```

**Expected:** 3 rows (`graph-set-35`, `hawkins-scale`, `chakra-set`).

### Specialty content for graphs

```sql
select rs.slug as specialty_slug, ma.slug as asset_slug, sac.title
from specialty_asset_content sac
join radionics_specialties rs on rs.id = sac.specialty_id
join methodology_assets ma on ma.id = sac.asset_id
where rs.slug = 'mesa-35'
order by ma.sort_order;
```

**Expected:** 8 rows (`anti-magia` … `karma`).

## Apply

```bash
supabase db push
```

## App validation (unchanged codebase)

```bash
npm run build
npm run typecheck
npm run lint
```
