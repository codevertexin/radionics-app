# RADIONICS — Auth Dev Mode (Phase 2B)

**Date:** 2026-05-31  
**Scope:** Login/logout mínimo via Supabase Auth para testar RLS, specialties, certifications e storage.  
**Status:** Temporário / desenvolvimento — **não** é o modelo final de autenticação.

---

## Resumo

Esta fase adiciona uma camada **temporária** de autenticação Supabase email/password apenas para permitir testes end-to-end com `VITE_DATA_MODE=supabase`.

| Modo | Auth |
|------|------|
| `VITE_DATA_MODE=mock` (default) | Sem login — rotas abertas, `isAuthenticated` sempre `true` |
| `VITE_DATA_MODE=supabase` | Login obrigatório nas rotas protegidas; RLS usa `auth.uid()` |

---

## O que foi implementado

### AuthProvider (`src/lib/auth/AuthProvider.tsx`)

Expõe via `useAuth()`:

- `user` — utilizador Supabase (`User | null`)
- `session` — sessão activa (`Session | null`)
- `loading` — a carregar sessão inicial
- `isAuthenticated` — `true` se há sessão (em mock mode, sempre `true`)
- `signInWithEmailPassword(email, password)`
- `signOut()`

Sessão gerida com:

```ts
supabase.auth.getSession()
supabase.auth.onAuthStateChange()
```

### Login (`/auth/login`)

- Página: `src/pages/auth/LoginPage.tsx`
- Campos: email, password
- Erros visíveis, loading state
- Redirect para rota anterior após login (`location.state.from`)
- Redirecciona para `/dashboard` se acedido em mock mode

### Rotas protegidas (apenas `VITE_DATA_MODE=supabase`)

Guard: `RequireSupabaseAuth` (`src/lib/auth/RequireSupabaseAuth.tsx`)

| Rota | Motivo |
|------|--------|
| `/certifications` | Dados do terapeuta + admin review |
| `/specialties` | Catálogo + pedidos |
| `/sessions/new` | Usa `getApprovedSpecialties()` (certificações aprovadas) |
| `/profile` | Perfil + logout |

Outras rotas (dashboard, sessões list, clientes, etc.) **não** exigem login nesta fase.

### Logout (comportamento final)

Único ponto de lógica: `signOut()` no `AuthProvider`. Perfil e Sidebar chamam apenas `await signOut()`.

**Sequência ao clicar "Terminar sessão":**

1. `session` → `null`, `user` → `null`, `loading` → `false` (UI deixa de mostrar auth imediatamente)
2. `clearUserState()` — `queryClient.clear()` + reset stores mock
3. `await supabase.auth.signOut({ scope: 'local' })` — limpa tokens em localStorage (não depende de rede)
4. `navigate('/auth/login', { replace: true })`

**Evento `SIGNED_OUT`:** força `session = null` e repete `clearUserState()`.

**Guard:** `RequireSupabaseAuth` — se `!isAuthenticated` → `<Navigate to="/auth/login" />`.

**Teste manual esperado:** Login → `/profile` → Terminar sessão → `/auth/login`; `/certifications` e `/specialties` redirecionam para login; sem dados em cache.

**Nota:** `scope: 'local'` evita falhas de logout global que mantinham a sessão activa. Em mock mode, `isAuthenticated` permanece sempre `true` (sem fallback em supabase mode).

---

## Configuração para testar

```env
VITE_DATA_MODE=supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Criar utilizador de teste

1. Supabase Dashboard → **Authentication** → **Users**
2. **Add user** → email + password (sem registo público na app)
3. (Opcional admin) SQL:

```sql
INSERT INTO public.radionics_admin_allowlist (user_id, note)
VALUES ('<uuid-do-utilizador>', 'dev admin');
```

### Fluxo de teste

1. Abrir `/certifications` sem sessão → redirect `/auth/login`
2. Login com credenciais Supabase
3. Voltar à rota pedida; queries RLS usam `auth.uid()`
4. Submeter certificação, upload storage, admin review (se allowlist)

---

## O que NÃO foi implementado (de propósito)

- Registo público
- Magic link / OAuth / Google
- HUB SSO
- Auth Core
- Billing
- Roles complexas (admin continua via `radionics_admin_allowlist` + JWT placeholder)

---

## Integração futura (HUB / Auth Core)

Este AuthProvider será **substituído** quando o HUB/Auth Core estiver integrado:

- SSO centralizado no ecossistema ByElamor
- Claims/roles vindos do HUB (`radionics_role`, etc.)
- Perfil global partilhado entre apps
- Remoção do login email/password dev em `/auth/login`

Até lá, tratar `src/lib/auth/*` como **código descartável de dev** — não construir features de produto em cima desta camada.

---

## Ficheiros

```
src/lib/auth/
  AuthProvider.tsx
  RequireSupabaseAuth.tsx
  clearUserState.ts
src/pages/auth/
  LoginPage.tsx
src/routes/index.tsx          — rotas + ProtectedWithLayout
src/components/Provider.tsx   — AuthProvider wrapper
src/components/layout/Sidebar.tsx — logout
src/pages/ProfilePage.tsx     — logout + email Supabase
```

---

## Validação

```bash
npm run build
npm run typecheck
npm run lint
```
