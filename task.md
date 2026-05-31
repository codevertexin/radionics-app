# RADIONICS — Especialidades & Certificações — Persistência Real

## Stack Reality
- DB: Turso (libsql) via @libsql/client + Drizzle ORM
- Auth: better-auth (RUNABLE_AUTH_ISSUER) — session via cookie/header
- Storage: Cloudflare R2 via @aws-sdk/client-s3
- API: Hono routes in packages/web/src/api/index.ts
- Frontend: React + TanStack Query calling /api/* Hono endpoints

## What "Supabase" means here
The planning docs used Supabase terminology but actual infra is:
- RLS → Hono middleware (check auth session, verify ownership)
- auth.uid() → req.var.userId from better-auth session middleware
- Storage bucket → R2 bucket at S3_BUCKET env var
- Migrations → drizzle-kit generate/migrate against Turso

## Scope
1. **Drizzle schema** — 4 new tables in schema.ts (real Drizzle, not comments)
2. **Migration** — run drizzle-kit push to create tables in Turso
3. **R2 storage** — certifications bucket path: radionics/certifications/{userId}/{certId}/{filename}
4. **Hono API routes** — /api/specialties, /api/certifications, /api/specialty-requests, /api/cert-documents
5. **Frontend lib/db/specialties.ts** — service functions (useSpecialties, useCertifications, etc.)
6. **certifications.tsx** — replace mock imports with real API calls via TanStack Query
7. **sessions/index.tsx** — specialty lock from real certification status
8. **Build verify** — 0 TS errors

## Steps
- [x] Read existing code
- [ ] 1. schema.ts — add 4 Drizzle tables
- [ ] 2. run db:push to create tables in Turso  
- [ ] 3. Hono routes: GET/POST specialties, certifications, specialty_requests, documents
- [ ] 4. File upload route: POST /api/cert-documents/upload → R2
- [ ] 5. lib/db/specialties.ts service + transforms
- [ ] 6. certifications.tsx wire to API
- [ ] 7. sessions/index.tsx wire specialty lock to API
- [ ] 8. Build clean

## RLS / Auth pattern
- Use existing better-auth session middleware to extract userId
- Every query filters by therapist_id = userId
- Admin actions check role from session (add isAdmin flag to user session)
- File uploads: validate file type (pdf/jpg/jpeg/png) server-side before R2 upload

## Tables
1. radionics_specialties — catalog of specialties (admin manages)
2. radionics_specialty_requests — therapist-proposed specialties 
3. therapist_specialty_certifications — certification per therapist+specialty
4. therapist_specialty_documents — files per certification

## Key Decisions
- Keep SPECIALTIES/CERTIFICATIONS mock as fallback if DB empty (dev mode)
- Admin = first user or flag in session (simple for MVP)
- File path in R2: radionics/certs/{therapistId}/{certId}/{uuid}-{filename}
- Accepted MIME: application/pdf, image/jpeg, image/png (max 10MB per file)
