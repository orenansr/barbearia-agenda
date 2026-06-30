'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export type ServicoState = { error: string | null; success: boolean }

// Resolve o usuário logado e a barbearia dele. Helper local (não exportado
// como action) reaproveitado pelas três operações abaixo.
async function getContexto(): Promise<
  { supabase: SupabaseClient; barbeariaId: string } | null
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: barbearia } = await supabase
    .from('barbearias')
    .select('id')
    .eq('user_id', user.id)
    .single()

  return barbearia ? { supabase, barbeariaId: barbearia.id } : null
}

function parseCampos(formData: FormData) {
  const nome = (formData.get('nome') as string)?.trim() ?? ''
  const duracao = Number(formData.get('duracao_minutos'))
  const preco = Number(formData.get('preco'))
  const ativo = formData.get('ativo') === 'on'

  if (!nome) return { erro: 'Informe o nome do serviço.' as const }
  if (!Number.isInteger(duracao) || duracao <= 0)
    return { erro: 'A duração deve ser um número de minutos maior que zero.' as const }
  if (Number.isNaN(preco) || preco < 0)
    return { erro: 'O preço deve ser zero ou maior.' as const }

  return { dados: { nome, duracao_minutos: duracao, preco, ativo } }
}

export async function criarServico(
  _prev: ServicoState,
  formData: FormData,
): Promise<ServicoState> {
  const ctx = await getContexto()
  if (!ctx) return { error: 'Configure sua barbearia primeiro.', success: false }

  const parsed = parseCampos(formData)
  if (parsed.erro) return { error: parsed.erro, success: false }

  const { error } = await ctx.supabase
    .from('servicos')
    .insert({ ...parsed.dados, barbearia_id: ctx.barbeariaId })

  if (error) {
    console.error('[servicos] criar:', error)
    return { error: 'Erro ao salvar. Tente novamente.', success: false }
  }

  revalidatePath('/dashboard/servicos')
  return { error: null, success: true }
}

export async function atualizarServico(
  _prev: ServicoState,
  formData: FormData,
): Promise<ServicoState> {
  const ctx = await getContexto()
  if (!ctx) return { error: 'Configure sua barbearia primeiro.', success: false }

  const id = formData.get('id') as string
  if (!id) return { error: 'Serviço inválido.', success: false }

  const parsed = parseCampos(formData)
  if (parsed.erro) return { error: parsed.erro, success: false }

  const { error } = await ctx.supabase
    .from('servicos')
    .update(parsed.dados)
    .eq('id', id)
    .eq('barbearia_id', ctx.barbeariaId)

  if (error) {
    console.error('[servicos] atualizar:', error)
    return { error: 'Erro ao salvar. Tente novamente.', success: false }
  }

  revalidatePath('/dashboard/servicos')
  return { error: null, success: true }
}

export async function deletarServico(id: string): Promise<ServicoState> {
  const ctx = await getContexto()
  if (!ctx) return { error: 'Não autorizado.', success: false }

  const { error } = await ctx.supabase
    .from('servicos')
    .delete()
    .eq('id', id)
    .eq('barbearia_id', ctx.barbeariaId)

  if (error) {
    // 23503 = FK violation: o serviço tem agendamentos (on delete restrict)
    if (error.code === '23503') {
      return {
        error:
          'Este serviço possui agendamentos e não pode ser excluído. Desative-o em vez de excluir.',
        success: false,
      }
    }
    console.error('[servicos] deletar:', error)
    return { error: 'Erro ao excluir. Tente novamente.', success: false }
  }

  revalidatePath('/dashboard/servicos')
  return { error: null, success: true }
}
