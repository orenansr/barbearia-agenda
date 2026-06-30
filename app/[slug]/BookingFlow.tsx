'use client'

import { useState, useTransition } from 'react'
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Loader2,
} from 'lucide-react'
import {
  criarAgendamento,
  getHorariosDisponiveis,
  type Slot,
} from '@/app/actions/agendamento'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Calendario } from './Calendario'

interface Servico {
  id: string
  nome: string
  duracao_minutos: number
  preco: number
}

type Etapa = 'servico' | 'data' | 'hora' | 'dados' | 'sucesso'

const moeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

function formatarData(dataStr: string): string {
  const [y, m, d] = dataStr.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(y, m - 1, d, 12))
}

export function BookingFlow({
  barbeariaId,
  barbeariaNome,
  servicos,
  diasAbertos,
}: {
  barbeariaId: string
  barbeariaNome: string
  servicos: Servico[]
  diasAbertos: number[]
}) {
  const [etapa, setEtapa] = useState<Etapa>('servico')
  const [servico, setServico] = useState<Servico | null>(null)
  const [data, setData] = useState<string | null>(null)
  const [hora, setHora] = useState<string | null>(null)

  const [slots, setSlots] = useState<Slot[]>([])
  const [slotsErro, setSlotsErro] = useState<string | null>(null)
  const [carregandoSlots, startSlots] = useTransition()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [erroEnvio, setErroEnvio] = useState<string | null>(null)
  const [enviando, startEnvio] = useTransition()

  function escolherServico(s: Servico) {
    setServico(s)
    setData(null)
    setHora(null)
    setEtapa('data')
  }

  function escolherData(d: string) {
    setData(d)
    setHora(null)
    setEtapa('hora')
    setSlotsErro(null)
    startSlots(async () => {
      const res = await getHorariosDisponiveis(barbeariaId, servico!.id, d)
      if (res.ok) setSlots(res.slots)
      else setSlotsErro(res.error)
    })
  }

  function escolherHora(h: string) {
    setHora(h)
    setEtapa('dados')
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault()
    setErroEnvio(null)
    startEnvio(async () => {
      const res = await criarAgendamento({
        barbeariaId,
        servicoId: servico!.id,
        data: data!,
        hora: hora!,
        clienteNome: nome,
        clienteEmail: email,
      })
      if (res.ok) setEtapa('sucesso')
      else setErroEnvio(res.error)
    })
  }

  // ----- Tela de sucesso (resumo do agendamento) -----
  if (etapa === 'sucesso' && servico && data && hora) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
            <CheckCircle2 className="size-7 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Agendamento registrado!</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Guarde os detalhes abaixo. A barbearia vai confirmar em breve.
            </p>
          </div>

          <div className="w-full space-y-2 rounded-lg border bg-muted/40 p-4 text-left text-sm">
            <Resumo rotulo="Barbearia" valor={barbeariaNome} />
            <Resumo rotulo="Serviço" valor={servico.nome} />
            <Resumo rotulo="Data" valor={formatarData(data)} />
            <Resumo rotulo="Horário" valor={hora} />
            <Resumo rotulo="Valor" valor={moeda.format(servico.preco)} />
            <Resumo rotulo="Cliente" valor={nome} />
          </div>

          <p className="text-xs text-muted-foreground">
            Status: <span className="font-medium text-foreground">Pendente</span>{' '}
            — a barbearia confirmará em breve.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="space-y-4 py-6">
        <Passos etapa={etapa} />

        {/* Voltar */}
        {etapa !== 'servico' && (
          <button
            type="button"
            onClick={() =>
              setEtapa(
                etapa === 'data'
                  ? 'servico'
                  : etapa === 'hora'
                    ? 'data'
                    : 'hora',
              )
            }
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Voltar
          </button>
        )}

        {/* Etapa 1 — serviço */}
        {etapa === 'servico' && (
          <div className="space-y-3">
            <h2 className="font-medium">Escolha um serviço</h2>
            {servicos.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Esta barbearia ainda não cadastrou serviços.
              </p>
            ) : (
              <div className="space-y-2">
                {servicos.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => escolherServico(s)}
                    className="flex w-full items-center justify-between rounded-lg border p-4 text-left transition-colors hover:border-primary hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{s.nome}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        {s.duracao_minutos} min
                      </p>
                    </div>
                    <span className="font-semibold">
                      {moeda.format(s.preco)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Etapa 2 — data */}
        {etapa === 'data' && (
          <div className="space-y-3">
            <h2 className="font-medium">Escolha uma data</h2>
            {diasAbertos.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Esta barbearia ainda não definiu horários de funcionamento.
              </p>
            ) : (
              <Calendario
                diasAbertos={diasAbertos}
                selected={data}
                onSelect={escolherData}
              />
            )}
          </div>
        )}

        {/* Etapa 3 — horário */}
        {etapa === 'hora' && data && (
          <div className="space-y-3">
            <h2 className="font-medium capitalize">{formatarData(data)}</h2>

            {carregandoSlots ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Carregando horários…
              </div>
            ) : slotsErro ? (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {slotsErro}
              </p>
            ) : slots.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nenhum horário disponível nesse dia. Tente outra data.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {slots.map((s) => (
                    <button
                      key={s.hora}
                      type="button"
                      disabled={s.ocupado}
                      onClick={() => escolherHora(s.hora)}
                      aria-label={
                        s.ocupado ? `${s.hora} — indisponível` : s.hora
                      }
                      className={
                        s.ocupado
                          ? 'cursor-not-allowed rounded-lg border border-dashed bg-muted py-2.5 text-sm font-medium text-muted-foreground/50 line-through'
                          : 'rounded-lg border py-2.5 text-sm font-medium transition-colors hover:border-primary hover:bg-muted/50'
                      }
                    >
                      {s.hora}
                    </button>
                  ))}
                </div>
                {slots.some((s) => s.ocupado) && (
                  <p className="text-xs text-muted-foreground">
                    Horários riscados já estão reservados.
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* Etapa 4 — dados do cliente */}
        {etapa === 'dados' && servico && data && hora && (
          <form onSubmit={enviar} className="space-y-4">
            <h2 className="font-medium">Seus dados</h2>

            <div className="space-y-1.5 rounded-lg border bg-muted/40 p-3 text-sm">
              <Resumo rotulo="Serviço" valor={servico.nome} />
              <Resumo rotulo="Data" valor={formatarData(data)} />
              <Resumo rotulo="Horário" valor={hora} />
              <Resumo rotulo="Valor" valor={moeda.format(servico.preco)} />
            </div>

            {erroEnvio && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {erroEnvio}
              </p>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="nome">Nome completo</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={enviando}
            >
              {enviando ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Confirmando…
                </>
              ) : (
                'Confirmar agendamento'
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

function Resumo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{rotulo}</span>
      <span className="text-right font-medium">{valor}</span>
    </div>
  )
}

function Passos({ etapa }: { etapa: Etapa }) {
  const ordem: Etapa[] = ['servico', 'data', 'hora', 'dados']
  const atual = ordem.indexOf(etapa === 'sucesso' ? 'dados' : etapa)
  const labels = ['Serviço', 'Data', 'Horário', 'Dados']

  return (
    <div className="flex items-center gap-1.5">
      {labels.map((label, i) => (
        <div key={label} className="flex flex-1 flex-col gap-1">
          <div
            className={
              i <= atual
                ? 'h-1 rounded-full bg-primary'
                : 'h-1 rounded-full bg-muted'
            }
          />
          <span
            className={
              i <= atual
                ? 'flex items-center gap-1 text-[11px] font-medium'
                : 'text-[11px] text-muted-foreground'
            }
          >
            {i === 0 && <CalendarIcon className="hidden size-3 sm:block" />}
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}
