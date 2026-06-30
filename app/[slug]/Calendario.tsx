'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

// Formata uma data local como YYYY-MM-DD sem conversão de fuso
function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

interface Props {
  diasAbertos: number[]
  selected: string | null
  onSelect: (data: string) => void
}

export function Calendario({ diasAbertos, selected, onSelect }: Props) {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const [mesAtual, setMesAtual] = useState(
    () => new Date(hoje.getFullYear(), hoje.getMonth(), 1),
  )

  const ano = mesAtual.getFullYear()
  const mes = mesAtual.getMonth()
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay()
  const diasNoMes = new Date(ano, mes + 1, 0).getDate()

  // Não deixa navegar para meses anteriores ao atual
  const noMesAtual =
    ano === hoje.getFullYear() && mes === hoje.getMonth()

  const celulas: (Date | null)[] = [
    ...Array(primeiroDiaSemana).fill(null),
    ...Array.from({ length: diasNoMes }, (_, i) => new Date(ano, mes, i + 1)),
  ]

  function estaDisponivel(d: Date): boolean {
    if (d < hoje) return false
    return diasAbertos.includes(d.getDay())
  }

  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="mb-2 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => setMesAtual(new Date(ano, mes - 1, 1))}
          disabled={noMesAtual}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-30"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-sm font-medium">
          {MESES[mes]} {ano}
        </span>
        <button
          type="button"
          onClick={() => setMesAtual(new Date(ano, mes + 1, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
          aria-label="Próximo mês"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DIAS_SEMANA.map((d) => (
          <div
            key={d}
            className="flex h-8 items-center justify-center text-xs font-medium text-muted-foreground"
          >
            {d}
          </div>
        ))}

        {celulas.map((d, i) => {
          if (!d) return <div key={`v-${i}`} />
          const disponivel = estaDisponivel(d)
          const valor = ymd(d)
          const ativo = valor === selected
          return (
            <button
              key={valor}
              type="button"
              disabled={!disponivel}
              onClick={() => onSelect(valor)}
              className={cn(
                'flex h-10 items-center justify-center rounded-md text-sm transition-colors',
                ativo && 'bg-primary text-primary-foreground hover:bg-primary/90',
                !ativo && disponivel && 'hover:bg-muted',
                !disponivel && 'text-muted-foreground/30',
              )}
            >
              {d.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}
