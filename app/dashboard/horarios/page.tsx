import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { HorariosManager, type HorarioDia } from './HorariosManager'

// Ordem de exibição: Segunda a Domingo (dia_semana: 0=domingo … 6=sábado)
const DIAS: { num: number; nome: string }[] = [
  { num: 1, nome: 'Segunda-feira' },
  { num: 2, nome: 'Terça-feira' },
  { num: 3, nome: 'Quarta-feira' },
  { num: 4, nome: 'Quinta-feira' },
  { num: 5, nome: 'Sexta-feira' },
  { num: 6, nome: 'Sábado' },
  { num: 0, nome: 'Domingo' },
]

export default async function HorariosPage() {
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
        <h1 className="text-2xl font-semibold">Horários</h1>
        <Card className="max-w-lg">
          <CardContent className="py-6">
            <p className="text-sm text-muted-foreground">
              Você precisa configurar sua barbearia antes de definir horários.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/barbearia">Configurar barbearia</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { data: existentes } = await supabase
    .from('horarios_disponiveis')
    .select('dia_semana, ativo, hora_inicio, hora_fim')
    .eq('barbearia_id', barbearia.id)

  const porDia = new Map(
    (existentes ?? []).map((h) => [h.dia_semana, h]),
  )

  const dias: HorarioDia[] = DIAS.map(({ num, nome }) => {
    const e = porDia.get(num)
    return {
      dia_semana: num,
      nome,
      ativo: e?.ativo ?? false,
      hora_inicio: e?.hora_inicio?.slice(0, 5) ?? '09:00',
      hora_fim: e?.hora_fim?.slice(0, 5) ?? '18:00',
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Horários de funcionamento</h1>
        <p className="text-sm text-muted-foreground">
          Defina os dias e horários em que sua barbearia atende.
        </p>
      </div>

      <HorariosManager diasIniciais={dias} />
    </div>
  )
}
