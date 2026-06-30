import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ServicosManager } from './ServicosManager'

export default async function ServicosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: barbearia } = await supabase
    .from('barbearias')
    .select('id')
    .eq('user_id', user!.id)
    .single()

  if (!barbearia) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Serviços</h1>
        </div>
        <Card className="max-w-lg">
          <CardContent className="py-6">
            <p className="text-sm text-muted-foreground">
              Você precisa configurar sua barbearia antes de cadastrar serviços.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/barbearia">Configurar barbearia</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { data: servicos } = await supabase
    .from('servicos')
    .select('id, nome, duracao_minutos, preco, ativo')
    .eq('barbearia_id', barbearia.id)
    .order('nome')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Serviços</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie os serviços que seus clientes podem agendar.
        </p>
      </div>

      <ServicosManager servicos={servicos ?? []} />
    </div>
  )
}
