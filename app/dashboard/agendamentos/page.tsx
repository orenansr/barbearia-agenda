import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AgendamentosManager, type Agendamento } from './AgendamentosManager'

export default async function AgendamentosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: barbearia } = await supabase
    .from('barbearias')
    .select('id, slug')
    .eq('user_id', user!.id)
    .single()

  if (!barbearia) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Agendamentos</h1>
        <Card className="max-w-lg">
          <CardContent className="py-6">
            <p className="text-sm text-muted-foreground">
              Configure sua barbearia para começar a receber agendamentos.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/barbearia">Configurar barbearia</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { data } = await supabase
    .from('agendamentos')
    .select('id, cliente_nome, cliente_email, data_hora, status, servicos(nome)')
    .eq('barbearia_id', barbearia.id)
    .order('data_hora', { ascending: false })

  // Normaliza o embed `servicos(nome)` (pode vir como objeto ou array)
  const agendamentos: Agendamento[] = (data ?? []).map((a) => {
    const s = a.servicos as { nome: string } | { nome: string }[] | null
    const servico_nome = Array.isArray(s) ? (s[0]?.nome ?? '—') : (s?.nome ?? '—')
    return {
      id: a.id,
      cliente_nome: a.cliente_nome,
      cliente_email: a.cliente_email,
      data_hora: a.data_hora,
      status: a.status as Agendamento['status'],
      servico_nome,
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Agendamentos</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe e gerencie os agendamentos da sua barbearia.
        </p>
      </div>

      <AgendamentosManager agendamentos={agendamentos} slug={barbearia.slug} />
    </div>
  )
}
