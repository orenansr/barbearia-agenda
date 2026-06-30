import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BookingFlow } from './BookingFlow'

export default async function PaginaPublica({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: barbearia } = await supabase
    .from('barbearias')
    .select('id, nome, descricao')
    .eq('slug', slug)
    .single()

  if (!barbearia) notFound()

  const [{ data: servicos }, { data: horarios }] = await Promise.all([
    supabase
      .from('servicos')
      .select('id, nome, duracao_minutos, preco')
      .eq('barbearia_id', barbearia.id)
      .eq('ativo', true)
      .order('nome'),
    supabase
      .from('horarios_disponiveis')
      .select('dia_semana')
      .eq('barbearia_id', barbearia.id)
      .eq('ativo', true),
  ])

  const diasAbertos = [...new Set((horarios ?? []).map((h) => h.dia_semana))]

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto w-full max-w-lg px-4 py-8 sm:py-12">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {barbearia.nome}
          </h1>
          {barbearia.descricao && (
            <p className="mt-2 text-sm text-muted-foreground">
              {barbearia.descricao}
            </p>
          )}
        </header>

        <BookingFlow
          barbeariaId={barbearia.id}
          barbeariaNome={barbearia.nome}
          servicos={servicos ?? []}
          diasAbertos={diasAbertos}
        />
      </div>
    </div>
  )
}
