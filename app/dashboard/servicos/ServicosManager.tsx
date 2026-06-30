'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import { Clock, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import {
  atualizarServico,
  criarServico,
  deletarServico,
  type ServicoState,
} from '@/app/actions/servicos'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export interface Servico {
  id: string
  nome: string
  duracao_minutos: number
  preco: number
  ativo: boolean
}

const moeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function ServicosManager({ servicos }: { servicos: Servico[] }) {
  const [dialogAberto, setDialogAberto] = useState(false)
  const [editando, setEditando] = useState<Servico | null>(null)
  const [erroExcluir, setErroExcluir] = useState<string | null>(null)
  const [excluindoId, setExcluindoId] = useState<string | null>(null)
  const [, startExcluir] = useTransition()

  function abrirNovo() {
    setEditando(null)
    setDialogAberto(true)
  }

  function abrirEdicao(s: Servico) {
    setEditando(s)
    setDialogAberto(true)
  }

  function excluir(s: Servico) {
    if (!confirm(`Excluir o serviço "${s.nome}"?`)) return
    setErroExcluir(null)
    setExcluindoId(s.id)
    startExcluir(async () => {
      const res = await deletarServico(s.id)
      if (!res.success) setErroExcluir(res.error)
      setExcluindoId(null)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={abrirNovo}>
          <Plus className="size-4" />
          Adicionar serviço
        </Button>
      </div>

      {erroExcluir && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {erroExcluir}
        </p>
      )}

      {servicos.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Nenhum serviço cadastrado ainda. Clique em “Adicionar serviço” para
            começar.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {servicos.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex items-start justify-between gap-3 py-4">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{s.nome}</p>
                    <span
                      className={
                        s.ativo
                          ? 'rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700 dark:bg-green-950 dark:text-green-400'
                          : 'rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground'
                      }
                    >
                      {s.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {s.duracao_minutos} min
                  </p>
                  <p className="text-sm font-semibold">{moeda.format(s.preco)}</p>
                </div>

                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => abrirEdicao(s)}
                    aria-label="Editar"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => excluir(s)}
                    disabled={excluindoId === s.id}
                    aria-label="Excluir"
                  >
                    {excluindoId === s.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent>
          <ServicoForm
            key={editando?.id ?? 'novo'}
            servico={editando}
            onSuccess={() => setDialogAberto(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

const estadoInicial: ServicoState = { error: null, success: false }

function ServicoForm({
  servico,
  onSuccess,
}: {
  servico: Servico | null
  onSuccess: () => void
}) {
  const acao = servico ? atualizarServico : criarServico
  const [state, formAction, pending] = useActionState(acao, estadoInicial)

  useEffect(() => {
    if (state.success) onSuccess()
  }, [state.success, onSuccess])

  return (
    <form action={formAction}>
      <DialogHeader>
        <DialogTitle>{servico ? 'Editar serviço' : 'Novo serviço'}</DialogTitle>
        <DialogDescription>
          Preencha os dados do serviço oferecido.
        </DialogDescription>
      </DialogHeader>

      {servico && <input type="hidden" name="id" value={servico.id} />}

      <div className="space-y-4 py-4">
        {state.error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            name="nome"
            defaultValue={servico?.nome ?? ''}
            placeholder="Ex: Corte masculino"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="duracao_minutos">Duração (min)</Label>
            <Input
              id="duracao_minutos"
              name="duracao_minutos"
              type="number"
              min={1}
              step={1}
              defaultValue={servico?.duracao_minutos ?? 30}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="preco">Preço (R$)</Label>
            <Input
              id="preco"
              name="preco"
              type="number"
              min={0}
              step={0.01}
              defaultValue={servico?.preco ?? ''}
              placeholder="0,00"
              required
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="ativo" name="ativo" defaultChecked={servico?.ativo ?? true} />
          <Label htmlFor="ativo" className="font-normal">
            Serviço ativo (visível para os clientes)
          </Label>
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Salvando…
            </>
          ) : (
            'Salvar'
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}
