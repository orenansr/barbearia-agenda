# Finalizar Barbearia Agenda — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deixar o `barbearia-agenda` funcional de ponta a ponta e rodando localmente: home real, sem promessas falsas, sem rota de debug, proteção de horário documentada, e docs para validar.

**Architecture:** Mudanças cirúrgicas em um app Next.js 16 já funcional. Landing page como Server Component estático reaproveitando o design system shadcn existente; remoções de cosmética/segurança; documentação de setup. Sem novas dependências.

**Tech Stack:** Next.js 16 (App Router, Turbopack), React 19, Supabase, Tailwind v4, shadcn/ui, lucide-react, fonte Geist.

## Global Constraints

- **Sem novas dependências.** Apenas remover `resend`.
- **Idioma:** todo texto voltado ao usuário em português (pt-BR).
- **Design system:** usar somente tokens shadcn existentes (`primary`, `muted`, `foreground`, `border`, `Card`, `Button`) e ícones `lucide-react`. Dark-mode-ready via classes `dark:` / tokens — nunca cores hard-coded fora da paleta.
- **Verificação por task:** não há framework de testes. O ciclo é `npm run build` (deve passar limpo) e, quando aplicável, checagem HTTP do dev server. Nunca declarar sucesso sem rodar o comando.
- **Next.js 16:** APIs podem divergir do treino. Em dúvida, conferir `node_modules/next/dist/docs/`.

---

### Task 1: Landing page real em `app/page.tsx`

Substitui o boilerplate do Next pela landing SaaS aprovada. Server Component estático, sem JS de cliente.

**Files:**
- Modify (substituir conteúdo): `app/page.tsx`

**Interfaces:**
- Consumes: `Button` de `@/components/ui/button`; `Card`, `CardContent` de `@/components/ui/card`; ícones de `lucide-react`; `Link` de `next/link`.
- Produces: rota `/` renderizada estaticamente (`○` no output do build).

- [ ] **Step 1: Substituir `app/page.tsx` pelo conteúdo abaixo**

```tsx
import Link from 'next/link'
import {
  Scissors,
  CalendarClock,
  LayoutDashboard,
  CheckCircle2,
  Share2,
  Settings,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Scissors className="size-4" />
            </div>
            <span className="font-semibold tracking-tight">Barbearia Agenda</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/cadastro">Criar conta</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto w-full max-w-5xl px-4 py-20 text-center sm:py-28">
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          <CalendarClock className="size-3.5" />
          Agendamento online para barbearias
        </span>
        <h1 className="mx-auto mt-6 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Sua barbearia recebendo agendamentos online, 24 horas por dia.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
          Crie sua página de agendamento, defina seus serviços e horários, e
          deixe seus clientes marcarem o horário sozinhos — sem WhatsApp lotado.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/cadastro">
              Começar grátis
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">Já tenho conta</Link>
          </Button>
        </div>
      </section>

      {/* Benefícios */}
      <section className="mx-auto w-full max-w-5xl px-4 pb-20">
        <div className="grid gap-4 sm:grid-cols-3">
          <Beneficio
            icon={<Share2 className="size-5" />}
            titulo="Página própria de agendamento"
            texto="Um link exclusivo para sua barbearia. Compartilhe e receba agendamentos a qualquer hora."
          />
          <Beneficio
            icon={<Settings className="size-5" />}
            titulo="Gestão de serviços e horários"
            texto="Cadastre seus cortes, preços e horários de funcionamento em poucos cliques."
          />
          <Beneficio
            icon={<CheckCircle2 className="size-5" />}
            titulo="Confirme em 1 clique"
            texto="Veja os agendamentos no painel e confirme ou cancele sem complicação."
          />
        </div>
      </section>

      {/* Como funciona */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto w-full max-w-5xl px-4 py-20">
          <h2 className="text-center text-2xl font-semibold tracking-tight">
            Como funciona
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            <Passo
              numero={1}
              titulo="Cadastre sua barbearia"
              texto="Crie sua conta e dê um nome à sua barbearia. Leva menos de um minuto."
            />
            <Passo
              numero={2}
              titulo="Configure serviços e horários"
              texto="Adicione seus serviços, preços e os dias e horas em que você atende."
            />
            <Passo
              numero={3}
              titulo="Compartilhe seu link"
              texto="Divulgue sua página e comece a receber agendamentos automaticamente."
            />
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto w-full max-w-5xl px-4 py-20">
        <Card className="border-primary/20 bg-primary text-primary-foreground">
          <CardContent className="flex flex-col items-center gap-5 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-foreground/10">
              <Scissors className="size-6" />
            </div>
            <h2 className="max-w-md text-2xl font-semibold tracking-tight">
              Pronto para organizar sua agenda?
            </h2>
            <Button asChild size="lg" variant="secondary">
              <Link href="/cadastro">
                Criar conta grátis
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-1.5">
            <Scissors className="size-3.5" />
            Barbearia Agenda
          </div>
          <p>Feito com Next.js e Supabase</p>
        </div>
      </footer>
    </div>
  )
}

function Beneficio({
  icon,
  titulo,
  texto,
}: {
  icon: React.ReactNode
  titulo: string
  texto: string
}) {
  return (
    <Card>
      <CardContent className="space-y-2 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground">
          {icon}
        </div>
        <h3 className="font-medium">{titulo}</h3>
        <p className="text-sm text-muted-foreground">{texto}</p>
      </CardContent>
    </Card>
  )
}

function Passo({
  numero,
  titulo,
  texto,
}: {
  numero: number
  titulo: string
  texto: string
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-background font-semibold">
        {numero}
      </div>
      <h3 className="mt-4 font-medium">{titulo}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{texto}</p>
    </div>
  )
}
```

- [ ] **Step 2: Rodar o build e confirmar que passa e que `/` é estática**

Run: `npm run build`
Expected: `✓ Compiled successfully`, sem erros de TypeScript, e a rota `/` aparece marcada com `○` (Static) na tabela de rotas. O import de `Image`/`next.svg` não deve mais existir.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: landing page SaaS na home"
```

---

### Task 2: Corrigir o email fantasma e remover `resend`

A tela de sucesso promete um email que nunca é enviado. Tornar a cópia honesta e remover a dependência não usada.

**Files:**
- Modify: `app/[slug]/BookingFlow.tsx` (bloco da tela de sucesso, ~linhas 119-124)
- Modify: `package.json` (remover `"resend"` das dependencies)
- Modify: `.env.local` (remover a linha `RESEND_API_KEY`)

**Interfaces:**
- Consumes: nada novo.
- Produces: nenhuma referência a `resend` no projeto; tela de sucesso sem promessa de email.

- [ ] **Step 1: Ajustar a cópia da tela de sucesso em `app/[slug]/BookingFlow.tsx`**

Localizar este bloco (dentro de `if (etapa === 'sucesso' ...)`):

```tsx
          <div>
            <h2 className="text-xl font-semibold">Agendamento confirmado!</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enviamos os detalhes para {email}.
            </p>
          </div>
```

Substituir por:

```tsx
          <div>
            <h2 className="text-xl font-semibold">Agendamento registrado!</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Guarde os detalhes abaixo. A barbearia vai confirmar em breve.
            </p>
          </div>
```

- [ ] **Step 2: Remover `resend` do `package.json`**

Em `dependencies`, remover a linha:

```json
    "resend": "^6.16.0",
```

(Atenção à vírgula da linha anterior: garanta que o JSON continue válido — a linha anterior `"react-dom": "19.2.4",` mantém a vírgula pois `shadcn`/outras vêm depois; confira a ordem real do arquivo e ajuste vírgulas para JSON válido.)

- [ ] **Step 3: Atualizar o lockfile e a árvore de `node_modules`**

Run: `npm install`
Expected: termina sem erro; `package-lock.json` atualizado removendo `resend`.

- [ ] **Step 4: Remover a chave órfã do `.env.local`**

Remover a linha:

```
RESEND_API_KEY=...
```

- [ ] **Step 5: Confirmar que não sobrou referência a `resend`**

Run: `git grep -i resend -- ':!package-lock.json' ':!docs/'` (ou busca equivalente)
Expected: nenhum resultado em código/config (ok se aparecer só no plano/spec dentro de `docs/`).

- [ ] **Step 6: Rodar o build**

Run: `npm run build`
Expected: `✓ Compiled successfully`, sem erros.

- [ ] **Step 7: Commit**

```bash
git add app/[slug]/BookingFlow.tsx package.json package-lock.json
git commit -m "fix: tela de sucesso honesta e remove dependencia resend nao usada"
```

(`.env.local` está no `.gitignore` — não será commitado, o que é esperado.)

---

### Task 3: Remover a rota de debug

Apagar a rota que expõe info de ambiente, marcada para remoção.

**Files:**
- Delete: `app/api/debug-env/route.ts`

**Interfaces:**
- Consumes: nada.
- Produces: rota `/api/debug-env` deixa de existir no build.

- [ ] **Step 1: Apagar o arquivo**

```bash
git rm app/api/debug-env/route.ts
```

(Se o diretório `app/api/debug-env/` ficar vazio, remova-o também.)

- [ ] **Step 2: Rodar o build e confirmar que a rota sumiu**

Run: `npm run build`
Expected: `✓ Compiled successfully`; a rota `/api/debug-env` NÃO aparece mais na tabela de rotas.

- [ ] **Step 3: Commit**

```bash
git commit -m "chore: remove rota de debug /api/debug-env"
```

---

### Task 4: Documentação — `SETUP.md` e `README.md`

Permitir que qualquer pessoa rode e valide o projeto, incluindo o SQL da função de horários ocupados.

**Files:**
- Create: `SETUP.md`
- Modify (substituir): `README.md`

**Interfaces:**
- Consumes: nada.
- Produces: docs de setup e validação.

- [ ] **Step 1: Criar `SETUP.md` com o conteúdo abaixo**

````markdown
# Setup — Barbearia Agenda

App de agendamento para barbearias (Next.js 16 + Supabase).

## Pré-requisitos

- Node.js 20+
- Um projeto Supabase (gratuito)

## Variáveis de ambiente

Crie um arquivo `.env.local` na raiz com:

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

## Banco de dados

Aplique o schema no SQL Editor do Supabase: copie todo o conteúdo de
`supabase/schema.sql` e execute.

### Função de horários ocupados (proteção contra agendamento duplicado)

Se você aplicou o schema antes desta função existir, rode o bloco abaixo no
SQL Editor do Supabase para ativar o bloqueio automático de horários já
reservados. Sem ele o app funciona, mas exibe todos os horários sem descontar
os ocupados.

```sql
create or replace function public.horarios_ocupados(
  p_barbearia_id uuid,
  p_data date
)
returns table (inicio text, duracao_minutos int)
language sql
security definer
set search_path = public
as $$
  select
    to_char(a.data_hora at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI') as inicio,
    s.duracao_minutos
  from public.agendamentos a
  join public.servicos s on s.id = a.servico_id
  where a.barbearia_id = p_barbearia_id
    and a.status <> 'cancelado'
    and (a.data_hora at time zone 'UTC')::date = p_data;
$$;

revoke all on function public.horarios_ocupados(uuid, date) from public;
grant execute on function public.horarios_ocupados(uuid, date) to anon, authenticated;
```

## Rodar localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Como validar

1. **Home** (`/`): deve mostrar a landing page do produto.
2. **Cadastro** (`/cadastro`): crie uma conta. Você cai no painel.
3. **Painel** (`/dashboard`): configure a barbearia, adicione serviços e horários.
4. **Página pública** (`/SEU-SLUG`): agende como cliente — escolha serviço, data,
   hora e preencha os dados.
5. **Agendamentos** (`/dashboard/agendamentos`): veja o agendamento recém-criado
   e confirme ou cancele.

## Stack

Next.js 16 (App Router), React 19, Supabase (Auth + Postgres + RLS),
Tailwind CSS v4, shadcn/ui.
````

- [ ] **Step 2: Substituir `README.md` pelo conteúdo abaixo**

```markdown
# Barbearia Agenda

SaaS de agendamento online para barbearias. Cada barbearia tem uma página
pública onde clientes marcam horário em poucos passos, e um painel para o dono
gerenciar serviços, horários e agendamentos.

## Funcionalidades

- Página pública de agendamento por barbearia (`/slug`)
- Fluxo de agendamento: serviço → data → horário → dados
- Cálculo de disponibilidade com bloqueio de horários já reservados
- Painel com autenticação: serviços, horários e gestão de agendamentos
- Confirmar / cancelar agendamentos

## Stack

Next.js 16 · React 19 · Supabase (Auth + Postgres + RLS) · Tailwind v4 · shadcn/ui

## Como rodar

Veja [SETUP.md](./SETUP.md) para variáveis de ambiente, banco de dados e
instruções de execução.
```

- [ ] **Step 3: Commit**

```bash
git add SETUP.md README.md
git commit -m "docs: SETUP.md com SQL da funcao e README do projeto"
```

---

### Task 5: Verificação final e entrega rodando localmente

Garantir que tudo compila e que as rotas-chave respondem no dev server.

**Files:** nenhum (verificação).

**Interfaces:**
- Consumes: tudo das tasks anteriores.
- Produces: confirmação de app funcional em `localhost:3000`.

- [ ] **Step 1: Build limpo**

Run: `npm run build`
Expected: `✓ Compiled successfully`, sem erros de TypeScript/lint que quebrem o build. Rotas esperadas: `/` (○), `/cadastro` (○), `/login` (○), `/[slug]` (ƒ), `/dashboard` e subrotas (ƒ). `/api/debug-env` NÃO deve aparecer.

- [ ] **Step 2: Subir o dev server em background**

Run: `npm run dev` (em background; aguardar a mensagem "Ready"/porta 3000)

- [ ] **Step 3: Checar as rotas públicas via HTTP**

Run (uma a uma):
```bash
curl -s -o /dev/null -w "/ %{http_code}\n"            http://localhost:3000/
curl -s -o /dev/null -w "/login %{http_code}\n"       http://localhost:3000/login
curl -s -o /dev/null -w "/cadastro %{http_code}\n"    http://localhost:3000/cadastro
curl -s -o /dev/null -w "/barbearia-goulart %{http_code}\n" http://localhost:3000/barbearia-goulart
curl -s -o /dev/null -w "/api/debug-env %{http_code}\n"     http://localhost:3000/api/debug-env
```
Expected: `/`, `/login`, `/cadastro`, `/barbearia-goulart` → `200`. `/api/debug-env` → `404`.

- [ ] **Step 4: Derrubar o dev server**

Encerrar o processo `npm run dev` do background.

- [ ] **Step 5: Entregar ao autor**

Resumir o que mudou, lembrar do passo manual do SQL (Task 4 / `SETUP.md`) caso a
proteção de horário ainda não esteja ativa, e explicar como validar o painel
(logar como dono da "Barbearia Goulart" ou criar conta em `/cadastro`).

---

## Self-Review (preenchido pelo autor do plano)

- **Cobertura do spec:** Landing (Task 1) ✓; email fantasma + remover resend (Task 2) ✓; remover debug (Task 3) ✓; função SQL documentada como passo manual + docs (Task 4) ✓; verificação/rodar local (Task 5) ✓. Sem lacunas.
- **Placeholders:** nenhum — todo código e SQL está completo e literal.
- **Consistência de tipos/nomes:** componentes `Beneficio`/`Passo` definidos e usados na mesma Task 1; nomes de rotas consistentes entre Task 1 e Task 5.
