'use client'

import { useState, useTransition } from 'react'
import { Calendar, Check, Copy, Loader2, X } from 'lucide-react'
import {
  cancelarAgendamento,
  confirmarAgendamento,
} from '@/app/actions/dashboard-agendamentos'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

type Status = 'pendente' | 'confirmado' | 'cancelado'

export interface Agendamento {
  id: string
  cliente_nome: string
  cliente_email: string
  data_hora: string
  status: Status
  servico_nome: string
}

type FiltroStatus = 'todos' | Status
type FiltroData = 'todos' | 'hoje' | 'semana'

const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const MESES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
]

// Convenção wall-clock (UTC): exibe a hora exatamente como gravada, usando os
// getters UTC para não deslocar pelo fuso do navegador. Ex: "Sexta, 27 Jun às 09:30".
function formatarDataHora(iso: string): string {
  const d = new Date(iso)
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const mm = String(d.getUTCMinutes()).padStart(2, '0')
  return `${DIAS[d.getUTCDay()]}, ${d.getUTCDate()} ${MESES[d.getUTCMonth()]} às ${hh}:${mm}`
}

// Data (YYYY-MM-DD) em UTC, consistente com o armazenamento
function dataUTC(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10)
}

function semanaAtualUTC(): { inicio: string; fim: string } {
  const hoje = new Date()
  const dow = hoje.getUTCDay() // 0=domingo
  const desdeSegunda = (dow + 6) % 7
  const base = Date.UTC(
    hoje.getUTCFullYear(),
    hoje.getUTCMonth(),
    hoje.getUTCDate(),
  )
  const umDia = 86_400_000
  const segunda = new Date(base - desdeSegunda * umDia)
  const domingo = new Date(base + (6 - desdeSegunda) * umDia)
  return {
    inicio: segunda.toISOString().slice(0, 10),
    fim: domingo.toISOString().slice(0, 10),
  }
}

const statusBadge: Record<Status, string> = {
  pendente:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
  confirmado:
    'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
  cancelado: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
}
const statusRotulo: Record<Status, string> = {
  pendente: 'Pendente',
  confirmado: 'Confirmado',
  cancelado: 'Cancelado',
}

export function AgendamentosManager({
  agendamentos,
  slug,
}: {
  agendamentos: Agendamento[]
  slug: string
}) {
  const [lista, setLista] = useState(agendamentos)
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('todos')
  const [filtroData, setFiltroData] = useState<FiltroData>('todos')
  const [processandoId, setProcessandoId] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)
  const [, startTransition] = useTransition()

  const hojeStr = new Date().toISOString().slice(0, 10)
  const semana = semanaAtualUTC()

  // Resumo — sempre sobre a lista completa, independente dos filtros
  const totalHoje = lista.filter(
    (a) => a.status !== 'cancelado' && dataUTC(a.data_hora) === hojeStr,
  ).length
  const totalPendentes = lista.filter((a) => a.status === 'pendente').length
  const totalConfirmados = lista.filter((a) => a.status === 'confirmado').length

  const filtrados = lista.filter((a) => {
    if (filtroStatus !== 'todos' && a.status !== filtroStatus) return false
    if (filtroData === 'hoje' && dataUTC(a.data_hora) !== hojeStr) return false
    if (filtroData === 'semana') {
      const d = dataUTC(a.data_hora)
      if (d < semana.inicio || d > semana.fim) return false
    }
    return true
  })

  function mudarStatus(
    id: string,
    acao: typeof confirmarAgendamento,
  ) {
    setErro(null)
    setProcessandoId(id)
    startTransition(async () => {
      const res = await acao(id)
      if (res.ok) {
        setLista((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: res.status } : a)),
        )
      } else {
        setErro(res.error)
      }
      setProcessandoId(null)
    })
  }

  async function copiarLink() {
    const url = `${window.location.origin}/${slug}`
    try {
      await navigator.clipboard.writeText(url)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      setErro('Não foi possível copiar o link.')
    }
  }

  // Estado vazio (nenhum agendamento existe)
  if (lista.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
            <Calendar className="size-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Nenhum agendamento ainda.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Compartilhe seu link público para receber agendamentos.
            </p>
          </div>
          <Button variant="outline" onClick={copiarLink}>
            {copiado ? (
              <>
                <Check className="size-4" />
                Link copiado!
              </>
            ) : (
              <>
                <Copy className="size-4" />
                Copiar link público
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid gap-3 sm:grid-cols-3">
        <ResumoCard rotulo="Hoje" valor={totalHoje} />
        <ResumoCard rotulo="Pendentes" valor={totalPendentes} />
        <ResumoCard rotulo="Confirmados" valor={totalConfirmados} />
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmento
          opcoes={[
            { valor: 'todos', label: 'Todos' },
            { valor: 'pendente', label: 'Pendentes' },
            { valor: 'confirmado', label: 'Confirmados' },
            { valor: 'cancelado', label: 'Cancelados' },
          ]}
          valor={filtroStatus}
          onChange={(v) => setFiltroStatus(v as FiltroStatus)}
        />
        <Segmento
          opcoes={[
            { valor: 'hoje', label: 'Hoje' },
            { valor: 'semana', label: 'Esta semana' },
            { valor: 'todos', label: 'Todos' },
          ]}
          valor={filtroData}
          onChange={(v) => setFiltroData(v as FiltroData)}
        />
      </div>

      {erro && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {erro}
        </p>
      )}

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Data e horário</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    Nenhum agendamento com esses filtros.
                  </TableCell>
                </TableRow>
              ) : (
                filtrados.map((a) => {
                  const ocupado = processandoId === a.id
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">
                        {a.cliente_nome}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {a.cliente_email}
                      </TableCell>
                      <TableCell>{a.servico_nome}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatarDataHora(a.data_hora)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
                            statusBadge[a.status],
                          )}
                        >
                          {statusRotulo[a.status]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1.5">
                          {a.status === 'pendente' && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={ocupado}
                              onClick={() =>
                                mudarStatus(a.id, confirmarAgendamento)
                              }
                            >
                              {ocupado ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <Check className="size-3.5" />
                              )}
                              Confirmar
                            </Button>
                          )}
                          {(a.status === 'pendente' ||
                            a.status === 'confirmado') && (
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={ocupado}
                              onClick={() =>
                                mudarStatus(a.id, cancelarAgendamento)
                              }
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="size-3.5" />
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function ResumoCard({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-sm text-muted-foreground">{rotulo}</p>
        <p className="mt-1 text-2xl font-semibold">{valor}</p>
      </CardContent>
    </Card>
  )
}

function Segmento({
  opcoes,
  valor,
  onChange,
}: {
  opcoes: { valor: string; label: string }[]
  valor: string
  onChange: (v: string) => void
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-lg border bg-muted/40 p-1">
      {opcoes.map((o) => (
        <button
          key={o.valor}
          type="button"
          onClick={() => onChange(o.valor)}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            valor === o.valor
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
