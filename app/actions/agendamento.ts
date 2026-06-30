'use server'

import { createClient } from '@/lib/supabase/server'

// -------------------------------------------------------------
// Convenção de fuso horário (MVP):
// Tratamos todos os horários como "horário de parede" (wall-clock).
// O slot de 18:00 do dia 27/06 é gravado como 2026-06-27T18:00:00Z e
// sempre exibido como 18:00 — nunca reconvertido. Isso mantém a leitura e
// a gravação consistentes sem uma feature completa de fusos por barbearia.
// TODO: suportar fuso configurável por barbearia.
// -------------------------------------------------------------

// Intervalo fixo da grade de horários (09:00, 09:30, 10:00 …).
// Independe da duração do serviço — a duração só decide se o slot cabe/conflita.
const PASSO_MINUTOS = 30

function paraMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

function paraHHMM(minutos: number): string {
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// Dia da semana (0=domingo) de uma data YYYY-MM-DD, de forma determinística
function diaDaSemana(dataStr: string): number {
  const [y, m, d] = dataStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

export type Slot = { hora: string; ocupado: boolean }

export type SlotsResult =
  | { ok: true; slots: Slot[] }
  | { ok: false; error: string }

export async function getHorariosDisponiveis(
  barbeariaId: string,
  servicoId: string,
  dataStr: string,
): Promise<SlotsResult> {
  const supabase = await createClient()

  // Serviço (duração) — precisa pertencer à barbearia e estar ativo
  const { data: servico, error: servicoError } = await supabase
    .from('servicos')
    .select('duracao_minutos')
    .eq('id', servicoId)
    .eq('barbearia_id', barbeariaId)
    .eq('ativo', true)
    .single()

  if (servicoError && servicoError.code !== 'PGRST116') {
    console.error('[disponibilidade] erro ao buscar serviço:', servicoError)
  }
  if (!servico) return { ok: false, error: 'Serviço indisponível.' }
  const dur = servico.duracao_minutos

  // Horário de funcionamento daquele dia da semana
  const { data: horario, error: horarioError } = await supabase
    .from('horarios_disponiveis')
    .select('hora_inicio, hora_fim')
    .eq('barbearia_id', barbeariaId)
    .eq('dia_semana', diaDaSemana(dataStr))
    .eq('ativo', true)
    .single()

  // PGRST116 = "nenhuma linha": dia fechado, comportamento esperado (lista vazia)
  if (horarioError && horarioError.code !== 'PGRST116') {
    console.error('[disponibilidade] erro ao buscar horário:', horarioError)
  }
  if (!horario) return { ok: true, slots: [] }

  const inicioMin = paraMinutos(horario.hora_inicio)
  const fimMin = paraMinutos(horario.hora_fim)

  // Agendamentos já ocupados nesse dia (via função security definer).
  // Degradação graciosa: se a função `horarios_ocupados` ainda não existir
  // no banco, NÃO bloqueamos o fluxo — exibimos todos os horários do dia
  // (sem descontar os ocupados). Assim a página funciona mesmo sem o SQL
  // aplicado; ao criar a função, o desconto de ocupados volta sozinho.
  const { data: ocupados, error: rpcError } = await supabase.rpc(
    'horarios_ocupados',
    { p_barbearia_id: barbeariaId, p_data: dataStr },
  )

  let intervalosOcupados: { ini: number; fim: number }[] = []
  if (rpcError) {
    console.error(
      '[disponibilidade] RPC horarios_ocupados indisponível — exibindo todos os horários sem descontar ocupados. Crie a função no Supabase para ativar a proteção contra horário duplicado. Detalhe:',
      rpcError,
    )
  } else {
    intervalosOcupados = (ocupados ?? []).map(
      (o: { inicio: string; duracao_minutos: number }) => {
        const ini = paraMinutos(o.inicio.slice(11, 16)) // "HH:MM"
        return { ini, fim: ini + o.duracao_minutos }
      },
    )
  }

  // Grade fixa de 30 em 30 minutos, começando exatamente em hora_inicio.
  // O slot só é gerado se a duração COMPLETA do serviço couber antes de
  // hora_fim. Um slot fica "ocupado" quando sua janela [t, t+duração) invade
  // qualquer agendamento existente — assim um serviço de 60min às 09:30 é
  // bloqueado quando há um agendamento às 10:00.
  const slots: Slot[] = []
  for (let t = inicioMin; t + dur <= fimMin; t += PASSO_MINUTOS) {
    const ocupado = intervalosOcupados.some((o) => t < o.fim && o.ini < t + dur)
    slots.push({ hora: paraHHMM(t), ocupado })
  }

  return { ok: true, slots }
}

export type AgendarResult =
  | { ok: true }
  | { ok: false; error: string }

export async function criarAgendamento(input: {
  barbeariaId: string
  servicoId: string
  data: string // YYYY-MM-DD
  hora: string // HH:MM
  clienteNome: string
  clienteEmail: string
}): Promise<AgendarResult> {
  const supabase = await createClient()

  const nome = input.clienteNome.trim()
  const email = input.clienteEmail.trim()

  if (!nome || !email) {
    return { ok: false, error: 'Preencha nome e e-mail.' }
  }

  // Revalida disponibilidade no servidor para evitar agendamento duplicado
  // entre a hora em que o cliente viu os slots e o envio do formulário.
  const disp = await getHorariosDisponiveis(
    input.barbeariaId,
    input.servicoId,
    input.data,
  )
  if (!disp.ok) return { ok: false, error: disp.error }
  const slot = disp.slots.find((s) => s.hora === input.hora)
  if (!slot || slot.ocupado) {
    return { ok: false, error: 'Esse horário acabou de ser reservado. Escolha outro.' }
  }

  const dataHora = `${input.data}T${input.hora}:00.000Z`

  const { error } = await supabase.from('agendamentos').insert({
    barbearia_id: input.barbeariaId,
    servico_id: input.servicoId,
    cliente_nome: nome,
    cliente_email: email,
    data_hora: dataHora,
    status: 'pendente',
  })

  if (error) {
    console.error('[agendamento] erro ao inserir:', error)
    return { ok: false, error: 'Não foi possível concluir. Tente novamente.' }
  }

  return { ok: true }
}
