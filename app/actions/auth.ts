'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const mensagensErro: Record<string, string> = {
  'Invalid login credentials': 'E-mail ou senha incorretos.',
  'Email not confirmed': 'Confirme seu e-mail antes de entrar.',
  'User already registered': 'Este e-mail já está cadastrado.',
  'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.',
  'Signup is disabled': 'Novos cadastros estão desativados.',
}

function traduzirErro(error: { message: string; status?: number }): string {
  console.error('[auth] erro do Supabase:', {
    message: error.message,
    status: error.status,
  })

  if (process.env.NODE_ENV === 'development') {
    return `[dev] ${error.message}`
  }

  return mensagensErro[error.message] ?? 'Ocorreu um erro. Tente novamente.'
}

export async function login(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  console.log('[auth] tentando login para:', formData.get('email'))

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('senha') as string,
  })

  if (error) return { error: traduzirErro(error) }

  redirect('/dashboard')
}

export async function cadastro(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  console.log('[auth] tentando cadastro para:', formData.get('email'))

  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('senha') as string,
  })

  if (error) return { error: traduzirErro(error) }

  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
