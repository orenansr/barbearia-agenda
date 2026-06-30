# Finalizar Barbearia Agenda — Design

**Data:** 2026-06-30
**Objetivo:** Terminar o projeto deixando-o funcional de ponta a ponta, rodando
localmente, pronto para o autor validar, hospedar depois e linkar no portfólio.

## Contexto

`barbearia-agenda` é um SaaS multi-tenant de agendamento para barbearias
(Next.js 16, Supabase, Tailwind/shadcn). O núcleo já está implementado e o build
passa limpo:

- Schema Supabase com RLS aplicado (tabelas existem e respondem).
- Auth (login, cadastro, logout).
- Painel: configurar barbearia, serviços, horários, gerenciar agendamentos.
- Fluxo público de agendamento em `/[slug]` (serviço → data → hora → dados → sucesso).
- Dados reais já cadastrados: barbearia "Barbearia Goulart" (slug
  `barbearia-goulart`), 2 serviços e horários.

### Lacunas que impedem considerar o projeto "terminado"

1. **Home é o boilerplate do Next.js** — `app/page.tsx` ainda mostra "To get
   started, edit the page.tsx file". É a porta de entrada do link de portfólio.
2. **Email fantasma** — a tela de sucesso afirma "Enviamos os detalhes para
   {email}", mas nada é enviado. `resend` está instalado mas nunca é usado.
3. **Rota de debug** — `app/api/debug-env/route.ts`, marcada para remoção antes
   de produção.
4. **Proteção de horário duplicado desligada** — a função
   `public.horarios_ocupados` (security definer) NÃO está aplicada no Supabase
   (REST retorna PGRST202/404). Sem ela, o cálculo de disponibilidade degrada
   graciosamente e exibe todos os horários sem descontar os já reservados.

## Escopo

### 1. Landing page — `app/page.tsx`

Substituir o boilerplate por uma landing SaaS estática (Server Component, sem JS
de cliente, sem novas dependências), reaproveitando os tokens shadcn existentes
(`primary`, `muted`, `Card`, `Button`) e a fonte Geist. Dark-mode-ready via os
tokens já definidos em `globals.css`.

Estrutura:

- **Header/nav:** ícone `Scissors` + "Barbearia Agenda"; à direita "Entrar"
  (`/login`) e "Criar conta" (`/cadastro`).
- **Hero:** headline forte ("Sua barbearia recebendo agendamentos online, 24
  horas por dia."), subtítulo voltado ao dono, CTAs "Começar grátis"
  (`/cadastro`) e "Entrar" (`/login`).
- **Benefícios (3 cards):** página própria de agendamento; gestão de horários e
  serviços; confirmar/cancelar em 1 clique. Cada um com ícone lucide.
- **Como funciona (3 passos):** cadastre a barbearia → configure serviços e
  horários → compartilhe o link e receba agendamentos.
- **CTA final:** faixa com chamada + botão "Criar conta grátis".
- **Footer:** nome + "Feito com Next.js e Supabase".

Tom: minimalista, monocromático (paleta cinza do tema), tipografia Geist,
bastante respiro. Consistente com o painel e a página pública.

### 2. Corrigir o email fantasma

- **`app/[slug]/BookingFlow.tsx`** — trocar a cópia da tela de sucesso por algo
  honesto (ex.: "Agendamento registrado! A barbearia vai confirmar em breve.") e
  remover a linha que promete o envio de email. Resumo e status "Pendente"
  permanecem.
- **`package.json`** — remover a dependência `resend` (não usada). Atualizar o
  `package-lock.json`.
- **`.env.local`** — remover a linha `RESEND_API_KEY` (chave órfã, sem efeito).

### 3. Remover a rota de debug

- Apagar `app/api/debug-env/route.ts`.

### 4. Ativar a proteção de horário duplicado (passo manual do autor)

A função `horarios_ocupados` já está versionada em `supabase/schema.sql` (linhas
~250–271) mas não foi aplicada no banco. **O agente não tem acesso de escrita ao
Postgres** (apenas a chave anônima), então a aplicação é um passo manual:

- Entregar o bloco SQL pronto para colar uma vez no SQL Editor do Supabase.
- Documentar isso no `SETUP.md`.

Sem esse passo o app funciona; com ele, horários reservados passam a ser
bloqueados automaticamente (o código já consome a função quando ela existe).

### 5. Documentação e validação local

- **Criar `SETUP.md`** na raiz: pré-requisitos, variáveis de ambiente, como
  rodar (`npm install`, `npm run dev`), o SQL da função para colar no Supabase, e
  um roteiro de validação (home, fluxo público em `/barbearia-goulart`, login,
  painel).
- **Substituir o `README.md`** padrão por uma descrição real do projeto (o que é,
  stack, link para o `SETUP.md`).
- **Verificação:** `npm run build` deve passar limpo; subir `npm run dev` e
  confirmar que home, `/barbearia-goulart`, `/login` e `/cadastro` respondem.

## Fora de escopo (YAGNI)

- Envio real de email (Resend com domínio verificado) — desnecessário para
  portfólio; decisão explícita do autor.
- Animações / bibliotecas extras na landing — CSS/Tailwind puro basta.
- Refatorações não relacionadas ao objetivo de finalização.
- Fuso horário configurável por barbearia (TODO já documentado no código).

## Critérios de sucesso

1. `app/page.tsx` é uma landing SaaS real, não o boilerplate.
2. Nenhuma tela promete algo que o sistema não faz (email).
3. `resend` e a rota de debug removidos; build limpo.
4. `SETUP.md` permite a qualquer pessoa rodar e validar localmente, incluindo o
   SQL da função.
5. O autor consegue subir o app localmente e percorrer: home → agendar em
   `/barbearia-goulart` → ver o agendamento no painel.

## Entrega

App rodando em `localhost:3000` com home de verdade, fluxo de agendamento
funcional, `SETUP.md` + `README.md` atualizados e build limpo. Para validar o
painel, o autor loga como dono da "Barbearia Goulart" ou cria conta em
`/cadastro`.
