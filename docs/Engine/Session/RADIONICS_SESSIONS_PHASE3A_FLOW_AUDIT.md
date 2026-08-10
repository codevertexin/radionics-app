# RADIONICS — Phase 3A: Auditoria e correção do fluxo de criação de sessão

## Resumo

Validação do wizard `/sessions/new` → `createSession()` → listagem `/sessions` → workspace `/sessions/:id`.

## «Maria Silva» na confirmação — origem

| Hipótese | Conclusão |
|----------|-----------|
| Valor hardcoded no passo confirmar | **Não** — usa `selectedClient.name` |
| Sempre `client-001` no `createSession` | **Não** — usa `input.clientId` |
| Lista só com Maria Silva | **Não** — `CLIENTS` tem 5 clientes |
| Utilizador escolhe Maria ou seed antigo confunde | **Sim** — `client-001` é Maria Silva em `mock-data.ts`; sessões seed também usam esse nome |

A confirmação reflete o **cliente selecionado** no passo 3. Se aparece Maria Silva, foi porque esse cartão foi escolhido (ou estava pré-selecionado antes da correção do passo cliente).

## Auditoria `NewSessionPage`

| Aspeto | Antes | Depois (Phase 3A) |
|--------|-------|-------------------|
| Clientes | `CLIENTS` import direto de `mock-data` | `listClients()` via `clientsService` + React Query |
| Seleção cliente | Clique avançava imediatamente | Seleção visual + botão **Continuar** (bloqueado sem cliente) |
| Empty state clientes | Não existia | Mensagem + link `/clients` |
| `createSession` input | `specialtyId` = `meth-*` (methodology) | `specialtyId`, `specialtyName`, `specialtySlug` do catálogo |
| Template | `templateId` apenas | `templateId` + `templateName` |
| Redirect | `/sessions/:id` | Mantido (rota = workspace) |

## `createSession()` — campos persistidos (store em memória)

| Campo | Guardado |
|-------|----------|
| `id` | `sess-{timestamp}` |
| `therapistId` | `therapist-001` (mock) |
| `clientId` / `clientName` | Do cliente selecionado |
| `specialtyId` / `specialtyName` / `specialtySlug` | Da especialidade do wizard |
| `templateId` / `templateName` | Do template escolhido |
| `methodologyId` / `methodologyName` / `methodologyCode` | Resolvidos via `resolveSpecialtyToMethodologyId` + `METHODOLOGIES` (ferramentas/workspace) |
| `sessionMode` | `presential` \| `online` \| `distance` |
| `status` | `draft` |
| `createdAt` / `updatedAt` | ISO agora |
| `scheduledAt` | ISO agora |

## Modos de dados

### `VITE_DATA_MODE=mock`

- `sessionsService` e `clientsService` usam stores em memória partilhados.
- Nova sessão aparece em **Rascunhos** em `/sessions` após `invalidateQueries(['sessions'])` — sem refresh manual.

### `VITE_DATA_MODE=supabase`

- Especialidades/certificações: Supabase.
- **Sessões e clientes: ainda store mock** (removido `supabaseNotWired` que impedia criar sessão).
- Tabelas `radionics_sessions` **fora de scope** nesta fase.

## UI confirmação

Mostra: especialidade, template, cliente (nomes reais selecionados), modo (select com labels PT).

## Rotas

| Rota | Página |
|------|--------|
| `/sessions/new` | Wizard |
| `/sessions` | Lista (inclui rascunhos) |
| `/sessions/:id` | Workspace |

## Ficheiros principais

- `src/pages/sessions/NewSessionPage.tsx`
- `src/services/sessionsService.ts`
- `src/services/clientsService.ts`
- `src/types/index.ts` — campos `specialty*` em `Session`
- `src/data/mock-data.ts` — seed com `specialty*`
- `src/lib/auth/clearUserState.ts` — `resetClientsStore`

## Validação

```bash
npm run build
npm run typecheck
npm run lint
```

## Próximo (fora de 3A)

- Persistência Supabase de sessões e clientes
- Gate server-side em `createSession` (certificação aprovada)
- Criação de clientes a partir do wizard
