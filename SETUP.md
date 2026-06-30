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
