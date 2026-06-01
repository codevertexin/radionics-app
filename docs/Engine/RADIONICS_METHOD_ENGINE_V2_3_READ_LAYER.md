# RADIONICS — Methodology Engine V2.3: Read layer

## Scope

Read-only service + temporary debug UI. **No changes** to workspace, sessions, reports, or existing `mock-data` tool arrays (`TOOLS_RAD35`, etc.).

## Service

**File:** `src/services/methodologyEngineService.ts`

| Function | Returns |
|----------|---------|
| `getSpecialtyTools(specialtySlug)` | `SpecialtyToolLink[]` (tool embedded) |
| `getSpecialtyAssets(specialtySlug)` | `MethodologyAsset[]` for tools linked to specialty |
| `getSpecialtyAssetContent(specialtySlug)` | `SpecialtyAssetContent[]` |
| `getSpecialtyMethodologyBundle(specialtySlug)` | All of the above + `SpecialtyMethodologyContext` |

### Data mode

| `VITE_DATA_MODE` | Behaviour |
|------------------|-----------|
| `mock` (default) | Mesa 35 parity from `src/lib/methodology/mockMesa35Data.ts` (8 graphs + 17 Hawkins + 3 tool links + 8 content rows) |
| `supabase` | Queries by `radionics_specialties.slug`; respects RLS |

### Errors

`MethodologyEngineError` with codes: `NOT_FOUND`, `FORBIDDEN`, `RLS`, `CONFIG`, `UNKNOWN`.

Supabase RLS messages are translated to readable errors when policy blocks access (e.g. no approved certification for `specialty_tools`).

## Supabase implementation

**File:** `src/services/supabase/methodologyEngineSupabase.ts`

- Resolves specialty via `radionics_specialties.slug`
- `specialty_tools` join `methodology_tools`
- `methodology_assets` filtered by linked `tool_id` and `status = active`
- `specialty_asset_content` by `specialty_id`
- Requires authenticated session (`requireAuthUserId`)

**Mappers:** `src/lib/supabase/methodologyEngineMappers.ts`

**Types:** `src/types/methodology-engine.ts` (re-exported from `@/types`)

## Debug route (temporary)

**URL:** `/methodology-debug/:specialtySlug`  
**Example:** `/methodology-debug/mesa-35`

**Access:**

- `import.meta.env.DEV`, or
- mock mode (always), or
- `isCurrentUserRadionicsAdmin()` in Supabase production build

Not added to sidebar. Supabase route uses `RequireSupabaseAuth` + `MethodologyDebugGate`.

**Page:** `src/pages/methodology/MethodologyDebugPage.tsx`

Shows: specialty name, linked tools, assets grouped by tool, contextual content count.

## Mock Mesa 35 parity (V2.2 seed)

| Dataset | Count |
|---------|-------|
| Tools linked | 3 (`graph-set-35`, `hawkins-scale`, `chakra-set`) |
| Graph assets | 8 |
| Hawkins assets | 17 |
| Chakra assets | 0 |
| specialty_asset_content | 8 (graphs only) |

Other specialty slugs in mock mode throw `NOT_FOUND` (by design).

## What was not changed

- `WorkspacePage` / `getToolsByMethodology`
- `sessionsService`
- Reports
- Phase 1 / V2.1 / V2.2 migrations
- Main navigation

## Next phases

| Phase | Work |
|-------|------|
| V2.4 | Workspace reads tools from `getSpecialtyAssets` when certified |
| V2.x | Remaining 27 graph assets + images |
| V2.x | `activation_scripts` read for certified users (link-based RLS) |

## Validation

```bash
npm run build
npm run typecheck
npm run lint
```

Manual:

1. Mock: open `/methodology-debug/mesa-35`
2. Supabase: login as certified therapist for Mesa 35 or admin; same URL
