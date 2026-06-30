import Link from 'next/link'
import {
  Scissors,
  CalendarClock,
  CheckCircle2,
  Share2,
  Settings,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Scissors className="size-4" />
            </div>
            <span className="font-semibold tracking-tight">Barbearia Agenda</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/cadastro">Criar conta</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto w-full max-w-5xl px-4 py-20 text-center sm:py-28">
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          <CalendarClock className="size-3.5" />
          Agendamento online para barbearias
        </span>
        <h1 className="mx-auto mt-6 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Sua barbearia recebendo agendamentos online, 24 horas por dia.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
          Crie sua página de agendamento, defina seus serviços e horários, e
          deixe seus clientes marcarem o horário sozinhos — sem WhatsApp lotado.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/cadastro">
              Começar grátis
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">Já tenho conta</Link>
          </Button>
        </div>
      </section>

      {/* Benefícios */}
      <section className="mx-auto w-full max-w-5xl px-4 pb-20">
        <div className="grid gap-4 sm:grid-cols-3">
          <Beneficio
            icon={<Share2 className="size-5" />}
            titulo="Página própria de agendamento"
            texto="Um link exclusivo para sua barbearia. Compartilhe e receba agendamentos a qualquer hora."
          />
          <Beneficio
            icon={<Settings className="size-5" />}
            titulo="Gestão de serviços e horários"
            texto="Cadastre seus cortes, preços e horários de funcionamento em poucos cliques."
          />
          <Beneficio
            icon={<CheckCircle2 className="size-5" />}
            titulo="Confirme em 1 clique"
            texto="Veja os agendamentos no painel e confirme ou cancele sem complicação."
          />
        </div>
      </section>

      {/* Como funciona */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto w-full max-w-5xl px-4 py-20">
          <h2 className="text-center text-2xl font-semibold tracking-tight">
            Como funciona
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            <Passo
              numero={1}
              titulo="Cadastre sua barbearia"
              texto="Crie sua conta e dê um nome à sua barbearia. Leva menos de um minuto."
            />
            <Passo
              numero={2}
              titulo="Configure serviços e horários"
              texto="Adicione seus serviços, preços e os dias e horas em que você atende."
            />
            <Passo
              numero={3}
              titulo="Compartilhe seu link"
              texto="Divulgue sua página e comece a receber agendamentos automaticamente."
            />
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto w-full max-w-5xl px-4 py-20">
        <Card className="border-primary/20 bg-primary text-primary-foreground">
          <CardContent className="flex flex-col items-center gap-5 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-foreground/10">
              <Scissors className="size-6" />
            </div>
            <h2 className="max-w-md text-2xl font-semibold tracking-tight">
              Pronto para organizar sua agenda?
            </h2>
            <Button asChild size="lg" variant="secondary">
              <Link href="/cadastro">
                Criar conta grátis
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-1.5">
            <Scissors className="size-3.5" />
            Barbearia Agenda
          </div>
          <p>Feito com Next.js e Supabase</p>
        </div>
      </footer>
    </div>
  )
}

function Beneficio({
  icon,
  titulo,
  texto,
}: {
  icon: React.ReactNode
  titulo: string
  texto: string
}) {
  return (
    <Card>
      <CardContent className="space-y-2 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground">
          {icon}
        </div>
        <h3 className="font-medium">{titulo}</h3>
        <p className="text-sm text-muted-foreground">{texto}</p>
      </CardContent>
    </Card>
  )
}

function Passo({
  numero,
  titulo,
  texto,
}: {
  numero: number
  titulo: string
  texto: string
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-background font-semibold">
        {numero}
      </div>
      <h3 className="mt-4 font-medium">{titulo}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{texto}</p>
    </div>
  )
}
