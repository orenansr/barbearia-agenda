'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Scissors } from 'lucide-react'
import { login } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, { error: null })

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Scissors className="size-5" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Barbearia Agenda</h1>
        </div>

        <form action={action}>
          <Card>
            <CardHeader>
              <CardTitle>Entrar</CardTitle>
              <CardDescription>
                Acesse sua conta para gerenciar sua barbearia.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {state.error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {state.error}
                </p>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  name="senha"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-3">
              <Button type="submit" className="w-full" size="lg" disabled={pending}>
                {pending ? 'Entrando…' : 'Entrar'}
              </Button>
              <p className="text-sm text-muted-foreground">
                Não tem conta?{' '}
                <Link
                  href="/cadastro"
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  Criar conta
                </Link>
              </p>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  )
}
