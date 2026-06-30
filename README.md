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
