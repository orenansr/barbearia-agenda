'use client'

import { useActionState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { salvarBarbearia } from '@/app/actions/barbearia'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Barbearia {
  nome: string
  slug: string
  descricao: string | null
}

function toSlug(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function BarbeariaForm({ barbearia }: { barbearia?: Barbearia | null }) {
  const [state, action, pending] = useActionState(salvarBarbearia, {
    error: null,
    success: false,
  })

  function handleNomeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const slugInput = e.currentTarget.form?.elements.namedItem(
      'slug',
    ) as HTMLInputElement | null
    if (slugInput && !slugInput.dataset.manual) {
      slugInput.value = toSlug(e.target.value)
    }
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.currentTarget.dataset.manual = 'true'
  }

  return (
    <form action={action} className="space-y-5">
      {state.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.success && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950 dark:text-green-400">
          <CheckCircle2 className="size-4 shrink-0" />
          Barbearia salva com sucesso!
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="nome">Nome da barbearia</Label>
        <Input
          id="nome"
          name="nome"
          defaultValue={barbearia?.nome ?? ''}
          placeholder="Ex: Barbearia do João"
          onChange={handleNomeChange}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slug">URL pública</Label>
        <div className="flex">
          <span className="inline-flex h-8 items-center rounded-l-lg border border-r-0 bg-muted px-3 text-sm text-muted-foreground select-none">
            /
          </span>
          <Input
            id="slug"
            name="slug"
            defaultValue={barbearia?.slug ?? ''}
            placeholder="minha-barbearia"
            className="rounded-l-none"
            onChange={handleSlugChange}
            required
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Gerado automaticamente pelo nome. Pode editar manualmente.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="descricao">
          Descrição{' '}
          <span className="text-muted-foreground font-normal">(opcional)</span>
        </Label>
        <Textarea
          id="descricao"
          name="descricao"
          defaultValue={barbearia?.descricao ?? ''}
          placeholder="Fale um pouco sobre sua barbearia…"
          rows={3}
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? 'Salvando…' : 'Salvar'}
      </Button>
    </form>
  )
}
