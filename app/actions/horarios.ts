'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type HorarioInput = {
  dia_semana: number
  ativo: boolean
  hora_inicio: string // "HH:MM"
  hora_fim: string // "HH:MM"
}

export type HorariosState = { error: string | null; success: boolean }

const NOMES_DIAS: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado',
}

export async function salvarHorarios(
  dias: HorarioInput[],
): Promise<HorariosState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado.', success: false }

  const { data: barbearia } = await supabase
    .from('barbearias')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!barbearia)
    return { error: 'Configure sua barbearia primeiro.', success: false }

  // Normaliza e valida. O banco exige hora_fim > hora_inicio em TODAS as
  // linhas (constraint), então defaults válidos são aplicados a campos vazios.
  const linhas = dias.map((d) => {
    const inicio = d.hora_inicio || '09:00'
    const fim = d.hora_fim || '18:00'
    return {
      barbearia_id: barbearia.id,
      dia_semana: d.dia_semana,
      ativo: d.ativo,
      hora_inicio: inicio,
      hora_fim: fim,
    }
  })

  for (const l of linhas) {
    if (l.hora_fim <= l.hora_inicio) {
      return {
        error: `${NOMES_DIAS[l.dia_semana]}: a hora de fim deve ser maior que a de início.`,
        success: false,
      }
    }
  }

  const { error } = await supabase
    .from('horarios_disponiveis')
    .upsert(linhas, { onConflict: 'barbearia_id,dia_semana' })

  if (error) {
    console.error('[horarios] salvar:', error)
    return { error: 'Erro ao salvar. Tente novamente.', success: false }
  }

  revalidatePath('/dashboard/horarios')
  return { error: null, success: true }
}
