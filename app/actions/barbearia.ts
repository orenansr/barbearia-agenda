'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type State = { error: string | null; success: boolean }

export async function salvarBarbearia(
  _prevState: State,
  formData: FormData,
): Promise<State> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado.', success: false }

  const nome = (formData.get('nome') as string).trim()
  const slug = (formData.get('slug') as string).trim()
  const descricao = (formData.get('descricao') as string).trim()

  const { data: existing } = await supabase
    .from('barbearias')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const payload = { nome, slug, descricao }
  const { error } = existing
    ? await supabase.from('barbearias').update(payload).eq('id', existing.id)
    : await supabase.from('barbearias').insert({ ...payload, user_id: user.id })

  if (error) {
    if (error.code === '23505') {
      return { error: 'Esse slug já está em uso. Escolha outro.', success: false }
    }
    return { error: 'Erro ao salvar. Tente novamente.', success: false }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/barbearia')
  return { error: null, success: true }
}
