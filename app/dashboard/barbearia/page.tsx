import { createClient } from '@/lib/supabase/server'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { BarbeariaForm } from './BarbeariaForm'

export default async function BarbeariaPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: barbearia } = await supabase
    .from('barbearias')
    .select('nome, slug, descricao')
    .eq('user_id', user!.id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Minha Barbearia</h1>
        <p className="text-sm text-muted-foreground">
          Configure as informações públicas da sua barbearia.
        </p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Informações gerais</CardTitle>
          <CardDescription>
            Estas informações aparecem na sua página pública de agendamento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BarbeariaForm barbearia={barbearia} />
        </CardContent>
      </Card>
    </div>
  )
}
