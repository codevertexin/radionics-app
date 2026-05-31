# Legacy Backend Stack

These files were part of the previous Hono + Drizzle + Turso + better-auth + R2 stack.
They are **not integrated** into the Vite frontend app. Kept for reference only.

| File | Original role |
|------|---------------|
| `specialties-router.ts` | Hono API routes for specialties/certifications |
| `api-client.ts` | Hono RPC client |
| `auth.ts` | better-auth client |
| `schema.ts` | Drizzle SQLite schema |
| `s3.ts` | Cloudflare R2 / S3 presigned uploads |

The frontend now uses `src/services/*` with mock data until Supabase is configured.
