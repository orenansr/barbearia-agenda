import Link from 'next/link'
import { Scissors } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: barbearia } = await supabase
    .from('barbearias')
    .select('nome, slug')
    .eq('user_id', user!.id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Bem-vindo de volta!</p>
      </div>

      {barbearia ? (
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>{barbearia.nome}</CardTitle>
            <CardDescription>
              Página pública:{' '}
              <span className="font-mono text-foreground">/{barbearia.slug}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Gerencie seus serviços, horários e agendamentos pelo menu lateral.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="max-w-lg">
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
              <Scissors className="size-5 text-muted-foreground" />
            </div>
            <CardTitle>Configure sua barbearia</CardTitle>
            <CardDescription>
              Você ainda não configurou sua barbearia. Comece agora para receber
              agendamentos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/barbearia">Configurar agora</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
