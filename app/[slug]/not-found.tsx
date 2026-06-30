import Link from 'next/link'
import { Scissors } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
        <Scissors className="size-6 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-semibold">Barbearia não encontrada</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        O endereço que você acessou não existe ou a barbearia ainda não foi
        configurada.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Voltar ao início</Link>
      </Button>
    </div>
  )
}
