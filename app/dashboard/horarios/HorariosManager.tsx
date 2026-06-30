'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { salvarHorarios } from '@/app/actions/horarios'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

export interface HorarioDia {
  dia_semana: number
  nome: string
  ativo: boolean
  hora_inicio: string // "HH:MM"
  hora_fim: string // "HH:MM"
}

export function HorariosManager({
  diasIniciais,
}: {
  diasIniciais: HorarioDia[]
}) {
  const [dias, setDias] = useState<HorarioDia[]>(diasIniciais)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)
  const [salvando, startSalvar] = useTransition()

  function atualizar(index: number, patch: Partial<HorarioDia>) {
    setDias((prev) =>
      prev.map((d, i) => (i === index ? { ...d, ...patch } : d)),
    )
    setSucesso(false)
  }

  function salvar() {
    setErro(null)
    setSucesso(false)
    startSalvar(async () => {
      const res = await salvarHorarios(
        dias.map((d) => ({
          dia_semana: d.dia_semana,
          ativo: d.ativo,
          hora_inicio: d.hora_inicio,
          hora_fim: d.hora_fim,
        })),
      )
      if (res.success) setSucesso(true)
      else setErro(res.error)
    })
  }

  return (
    <div className="max-w-2xl space-y-4">
      <Card>
        <CardContent className="divide-y p-0">
          {dias.map((d, i) => (
            <div
              key={d.dia_semana}
              className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <Switch
                  checked={d.ativo}
                  onCheckedChange={(v) => atualizar(i, { ativo: v })}
                  aria-label={`Ativar ${d.nome}`}
                />
                <span
                  className={cn(
                    'text-sm font-medium',
                    !d.ativo && 'text-muted-foreground',
                  )}
                >
                  {d.nome}
                </span>
              </div>

              <div className="flex items-center gap-2 pl-12 sm:pl-0">
                <Input
                  type="time"
                  value={d.hora_inicio}
                  onChange={(e) => atualizar(i, { hora_inicio: e.target.value })}
                  disabled={!d.ativo}
                  className="w-28"
                  aria-label={`Hora de início ${d.nome}`}
                />
                <span className="text-sm text-muted-foreground">até</span>
                <Input
                  type="time"
                  value={d.hora_fim}
                  onChange={(e) => atualizar(i, { hora_fim: e.target.value })}
                  disabled={!d.ativo}
                  className="w-28"
                  aria-label={`Hora de fim ${d.nome}`}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {erro && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {erro}
        </p>
      )}
      {sucesso && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950 dark:text-green-400">
          <CheckCircle2 className="size-4 shrink-0" />
          Horários salvos com sucesso!
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={salvar} disabled={salvando}>
          {salvando ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Salvando…
            </>
          ) : (
            'Salvar'
          )}
        </Button>
      </div>
    </div>
  )
}
