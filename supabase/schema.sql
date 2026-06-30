-- =============================================================
-- Barbearia Agenda — Schema
-- =============================================================

-- Extensão para geração de UUIDs (disponível por padrão no Supabase)
create extension if not exists "pgcrypto";

-- =============================================================
-- TABELAS
-- =============================================================

create table public.barbearias (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  nome         text not null,
  slug         text not null unique,
  descricao    text,
  created_at   timestamptz not null default now()
);

create table public.servicos (
  id                uuid primary key default gen_random_uuid(),
  barbearia_id      uuid not null references public.barbearias(id) on delete cascade,
  nome              text not null,
  duracao_minutos   int not null check (duracao_minutos > 0),
  preco             numeric(10, 2) not null check (preco >= 0),
  ativo             boolean not null default true,
  created_at        timestamptz not null default now()
);

create table public.horarios_disponiveis (
  id            uuid primary key default gen_random_uuid(),
  barbearia_id  uuid not null references public.barbearias(id) on delete cascade,
  dia_semana    smallint not null check (dia_semana between 0 and 6),
  hora_inicio   time not null,
  hora_fim      time not null,
  ativo         boolean not null default true,
  constraint horario_valido check (hora_fim > hora_inicio),
  constraint dia_unico unique (barbearia_id, dia_semana)
);

create table public.agendamentos (
  id            uuid primary key default gen_random_uuid(),
  barbearia_id  uuid not null references public.barbearias(id) on delete cascade,
  servico_id    uuid not null references public.servicos(id) on delete restrict,
  cliente_nome  text not null,
  cliente_email text not null,
  data_hora     timestamptz not null,
  status        text not null default 'pendente'
                  check (status in ('pendente', 'confirmado', 'cancelado')),
  created_at    timestamptz not null default now()
);

-- =============================================================
-- ÍNDICES
-- =============================================================

-- Busca rápida da barbearia pelo dono (dashboard do usuário)
create index idx_barbearias_user_id
  on public.barbearias(user_id);

-- Slug é único mas também consultado com frequência em rotas públicas
create index idx_barbearias_slug
  on public.barbearias(slug);

-- Listagem de serviços por barbearia
create index idx_servicos_barbearia_id
  on public.servicos(barbearia_id);

-- Listagem de horários por barbearia
create index idx_horarios_barbearia_id
  on public.horarios_disponiveis(barbearia_id);

-- Consultas de agenda por barbearia + data (evita full scan ao listar o dia)
create index idx_agendamentos_barbearia_data
  on public.agendamentos(barbearia_id, data_hora);

-- Consulta de agendamentos por e-mail do cliente (histórico / cancelamento)
create index idx_agendamentos_cliente_email
  on public.agendamentos(cliente_email);

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

alter table public.barbearias          enable row level security;
alter table public.servicos            enable row level security;
alter table public.horarios_disponiveis enable row level security;
alter table public.agendamentos        enable row level security;

-- -------------------------------------------------------------
-- barbearias
-- -------------------------------------------------------------

-- Dono lê a própria barbearia
create policy "barbearias: dono lê"
  on public.barbearias for select
  using (auth.uid() = user_id);

-- Dono cria (user_id precisa ser o próprio)
create policy "barbearias: dono cria"
  on public.barbearias for insert
  with check (auth.uid() = user_id);

-- Dono edita a própria
create policy "barbearias: dono edita"
  on public.barbearias for update
  using (auth.uid() = user_id);

-- Dono deleta a própria
create policy "barbearias: dono deleta"
  on public.barbearias for delete
  using (auth.uid() = user_id);

-- Leitura pública por slug (página de agendamento do cliente)
create policy "barbearias: leitura pública por slug"
  on public.barbearias for select
  using (true);

-- -------------------------------------------------------------
-- servicos
-- -------------------------------------------------------------

-- Leitura pública (cliente precisa ver os serviços disponíveis)
create policy "servicos: leitura pública"
  on public.servicos for select
  using (true);

-- Dono cria serviços na própria barbearia
create policy "servicos: dono cria"
  on public.servicos for insert
  with check (
    exists (
      select 1 from public.barbearias
      where id = barbearia_id and user_id = auth.uid()
    )
  );

-- Dono edita serviços da própria barbearia
create policy "servicos: dono edita"
  on public.servicos for update
  using (
    exists (
      select 1 from public.barbearias
      where id = barbearia_id and user_id = auth.uid()
    )
  );

-- Dono deleta serviços da própria barbearia
create policy "servicos: dono deleta"
  on public.servicos for delete
  using (
    exists (
      select 1 from public.barbearias
      where id = barbearia_id and user_id = auth.uid()
    )
  );

-- -------------------------------------------------------------
-- horarios_disponiveis
-- -------------------------------------------------------------

-- Leitura pública (cliente precisa ver quando pode agendar)
create policy "horarios: leitura pública"
  on public.horarios_disponiveis for select
  using (true);

-- Dono cria horários da própria barbearia
create policy "horarios: dono cria"
  on public.horarios_disponiveis for insert
  with check (
    exists (
      select 1 from public.barbearias
      where id = barbearia_id and user_id = auth.uid()
    )
  );

-- Dono edita horários da própria barbearia
create policy "horarios: dono edita"
  on public.horarios_disponiveis for update
  using (
    exists (
      select 1 from public.barbearias
      where id = barbearia_id and user_id = auth.uid()
    )
  );

-- Dono deleta horários da própria barbearia
create policy "horarios: dono deleta"
  on public.horarios_disponiveis for delete
  using (
    exists (
      select 1 from public.barbearias
      where id = barbearia_id and user_id = auth.uid()
    )
  );

-- -------------------------------------------------------------
-- agendamentos
-- -------------------------------------------------------------

-- Dono da barbearia vê os próprios agendamentos
create policy "agendamentos: dono lê"
  on public.agendamentos for select
  using (
    exists (
      select 1 from public.barbearias
      where id = barbearia_id and user_id = auth.uid()
    )
  );

-- Qualquer pessoa pode inserir um agendamento (fluxo do cliente sem login)
create policy "agendamentos: inserção pública"
  on public.agendamentos for insert
  with check (true);

-- Dono confirma ou cancela agendamentos
create policy "agendamentos: dono edita status"
  on public.agendamentos for update
  using (
    exists (
      select 1 from public.barbearias
      where id = barbearia_id and user_id = auth.uid()
    )
  );

-- Dono pode deletar agendamentos da própria barbearia
create policy "agendamentos: dono deleta"
  on public.agendamentos for delete
  using (
    exists (
      select 1 from public.barbearias
      where id = barbearia_id and user_id = auth.uid()
    )
  );

-- =============================================================
-- FUNÇÃO: horários ocupados (fluxo público de agendamento)
-- =============================================================
-- O SELECT em `agendamentos` é restrito ao dono (RLS), então o cliente
-- anônimo não consegue ler os agendamentos para descobrir quais horários
-- já estão tomados. Esta função `security definer` roda com privilégios
-- elevados e retorna APENAS o horário de início e a duração de cada
-- agendamento — nunca o nome ou e-mail do cliente — preservando a
-- privacidade enquanto permite calcular os horários livres.
--
-- Convenção de fuso: as datas/horas são tratadas como horário "de parede"
-- (wall-clock) em UTC. O início é retornado como texto 'YYYY-MM-DDTHH:MI'
-- para comparação direta e estável com os slots gerados no servidor.
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

-- Anônimo só pode executar a função (não ler a tabela diretamente)
revoke all on function public.horarios_ocupados(uuid, date) from public;
grant execute on function public.horarios_ocupados(uuid, date) to anon, authenticated;
