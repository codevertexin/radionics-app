# RADIONICS — Auth Dev Mode (Phase 2B)

**Date:** 2026-05-31  
**Scope:** Login/logout mínimo via Supabase Auth para testar RLS, Storage e services em `VITE_DATA_MODE=supabase`.  
**Status:** ⚠️ **Temporário / desenvolvimento — não é o fluxo final de autenticação.**

> **Decisão arquitectural:** O login email/password em `/auth/login` existe **apenas para dev/QA**.  
> **Não deve ir para produção** como auth principal do RADIONICS.  
> Ver plano de integração: [`RADIONICS_HUB_AUTH_INTEGRATION_PLAN.md`](./RADIONICS_HUB_AUTH_INTEGRATION_PLAN.md)

---

## Auth Dev vs Auth Final (HUB)

| Aspecto | Auth Dev (actual) | Auth Final (HUB / Auth Core) |
|---------|-------------------|------------------------------|
| Login | Supabase email/password local (`/auth/login`) | HUB — login centralizado ByElamor |
| Registo | Não implementado (users criados no Dashboard) | HUB — registo público |
| Logout | `supabase.auth.signOut({ scope: 'local' })` | HUB — logout global do ecossistema |
| Password recovery | Não implementado | HUB |
| Perfil global | Mock local + email Supabase | HUB — nome, avatar, contactos, billing |
| Identidade para RLS | `auth.uid()` Supabase directo | Token/sessão emitida pelo Auth Core → Supabase |
| Produção | ❌ Não usar como auth principal | ✅ Único fluxo de produção |

**O que o Auth Dev permite testar hoje:** RLS (`auth.uid()`), Storage, specialties/certifications services, guards de rota, limpeza de cache no logout.

**O que o Auth Dev não substitui:** SSO, registo, recuperação de password, perfil global, billing, roles cross-app, auditoria centralizada.

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

Estes fluxos pertencem ao **HUB/Auth Core**, não ao RADIONICS:

- Registo público
- Magic link / OAuth / Google
- Recuperação de password
- HUB SSO
- Auth Core
- Billing
- Perfil global editável
- Roles complexas cross-app (admin continua via `radionics_admin_allowlist` + JWT placeholder)

**Não implementar estes fluxos no RADIONICS** enquanto a integração HUB não estiver definida — evita divergência e dívida técnica.

---

## Integração futura (HUB / Auth Core)

Este AuthProvider e `/auth/login` serão **removidos ou substituídos** na integração HUB.

Plano detalhado: [`RADIONICS_HUB_AUTH_INTEGRATION_PLAN.md`](./RADIONICS_HUB_AUTH_INTEGRATION_PLAN.md)

Resumo:

- SSO centralizado no ecossistema ByElamor (`VITE_HUB_URL`)
- Claims/roles vindos do Auth Core (`radionics_role`, etc.)
- Perfil global partilhado entre apps (RADIONICS só consome/leitura)
- RADIONICS deixa de expor páginas de login/registo próprias

Até lá, tratar `src/lib/auth/*` e `src/pages/auth/*` como **código descartável de dev** — não construir features de produto em cima desta camada.

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
