# RADIONICS — Methodology Engine V2.1 (applied)

## Migration

**File:** `supabase/migrations/20260531150000_radionics_methodology_core_v2.sql`

## What was added

### Tables (6)

| Table | Purpose |
|-------|---------|
| `methodology_tools` | Reusable tool definitions (graph sets, Hawkins, chakras, …) |
| `methodology_assets` | Items inside a tool (graphs, symbols, levels, …) |
| `specialty_tools` | Which tools a specialty exposes in workspace |
| `specialty_asset_content` | Per-specialty editorial overlay on assets |
| `activation_scripts` | Prayers, activations, instructions |
| `activation_script_links` | Polymorphic links script → specialty / tool / asset / … |

### Functions

| Function | Notes |
|----------|--------|
| `has_approved_specialty_certification(uuid)` | **New** — RLS helper for certified therapists |
| `is_radionics_admin()` | **Reused** from Phase 1 (not recreated) |
| `set_updated_at()` | **Reused** from Phase 1 for `updated_at` triggers |

### Seed (minimal)

Three active rows in `methodology_tools` only:

- **35 Gráficos** (`graph-set-35`, `graph_set`)
- **Escala de Hawkins** (`hawkins-scale`, `hawkins_scale`)
- **Chakras** (`chakra-set`, `chakra_set`)

No `methodology_assets`, no `specialty_tools`, no `specialty_asset_content` in V2.1.

## What was not changed

- `radionics_specialties`
- `radionics_specialty_requests`
- `therapist_specialty_certifications`
- `therapist_specialty_documents`
- Storage bucket / certification storage policies
- Mock session UI (`sessionsService` in-memory store)
- Existing app services (`specialtiesService`, `certificationsService`, wizard, workspace)

## Why this is additive

- Only `CREATE TABLE`, indexes, RLS, and seed `INSERT` on new objects.
- Foreign keys **point into** existing `radionics_specialties`; no `ALTER` on Phase 1 tables.
- App continues to use mock tools (`TOOLS_RAD35`, etc.) until V2.2+ wires Supabase reads.

## RLS summary

| Table | SELECT (authenticated) | INSERT/UPDATE/DELETE |
|-------|------------------------|----------------------|
| `methodology_tools` | `status = 'active'` | Admin only |
| `methodology_assets` | `status = 'active'` | Admin only |
| `specialty_tools` | Approved cert for `specialty_id` or admin | Admin only |
| `specialty_asset_content` | Approved cert for `specialty_id` or admin | Admin only |
| `activation_scripts` | **Admin only** (V2.1) | Admin only |
| `activation_script_links` | **Admin only** (V2.1) | Admin only |

### V2.1 limitation: activation scripts

Link-based read (“show script if user is certified for linked specialty”) is **deferred**. Therapists cannot read `activation_scripts` / `activation_script_links` until V2.2+ adds policies or a security-definer RPC. Admin can manage and preview via Supabase dashboard or future admin UI.

## Policies created (count)

- **methodology_tools:** 5 (select active, admin select all, insert, update, delete)
- **methodology_assets:** 5
- **specialty_tools:** 4 (select certified/admin, insert, update, delete)
- **specialty_asset_content:** 4
- **activation_scripts:** 4 (admin only)
- **activation_script_links:** 4 (admin only)

**Total:** 26 policies

## Next phase — V2.2

1. Seed `methodology_assets` for Mesa 35 (35 graphs) from `mock-data` / migration plan.
2. Link `mesa-35` specialty → `graph-set-35` via `specialty_tools`.
3. Optional: `specialty_asset_content` from apostila / knowledge docs.
4. Relax `activation_scripts` SELECT for certified users via link traversal.
5. Services: `methodologyToolsService` with `VITE_DATA_MODE` branch (no change to session mock yet).

## Apply locally

```bash
supabase db push
# or
supabase migration up
```

## Validation (app)

```bash
npm run build
npm run typecheck
npm run lint
```

Migration-only change; app build should remain green.
