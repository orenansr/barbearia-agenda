'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// Ações do PAINEL DO BARBEIRO (confirmar/cancelar). Não confundir com
// `agendamento.ts`, que cuida do fluxo público de criação de agendamentos.

export type StatusResult =
  | { ok: true; status: 'confirmado' | 'cancelado' }
  | { ok: false; error: string }

async function atualizarStatus(
  id: string,
  novoStatus: 'confirmado' | 'cancelado',
): Promise<StatusResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Não autorizado.' }

  // O RLS ("agendamentos: dono edita status") garante que o barbeiro só
  // consegue atualizar agendamentos da própria barbearia.
  const { error } = await supabase
    .from('agendamentos')
    .update({ status: novoStatus })
    .eq('id', id)

  if (error) {
    console.error('[agendamentos] atualizar status:', error)
    return { ok: false, error: 'Erro ao atualizar. Tente novamente.' }
  }

  revalidatePath('/dashboard/agendamentos')
  return { ok: true, status: novoStatus }
}

export async function confirmarAgendamento(id: string): Promise<StatusResult> {
  return atualizarStatus(id, 'confirmado')
}

export async function cancelarAgendamento(id: string): Promise<StatusResult> {
  return atualizarStatus(id, 'cancelado')
}
