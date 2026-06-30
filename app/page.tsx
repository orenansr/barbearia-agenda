import Link from 'next/link'
import { Playfair_Display } from 'next/font/google'
import {
  Scissors,
  CalendarClock,
  Share2,
  Settings,
  CheckCircle2,
  Star,
  ArrowRight,
  Clock,
  ShieldCheck,
  Smartphone,
} from 'lucide-react'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
})

const HERO_IMG =
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1400&q=80&auto=format&fit=crop'
const SHOWCASE_IMG =
  'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1100&q=80&auto=format&fit=crop'

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 antialiased">
      {/* ===== Nav ===== */}
      <header className="absolute inset-x-0 top-0 z-20">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400 text-neutral-950">
              <Scissors className="size-4.5" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-white">
              Barbearia<span className="text-amber-400">Agenda</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:text-white"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-amber-400"
            >
              Criar conta
            </Link>
          </div>
        </nav>
      </header>

      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/90 to-neutral-950/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/60" />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col px-5 pb-24 pt-40 sm:pt-48 lg:pb-32">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1.5 text-xs font-medium tracking-wide text-amber-300">
              <span className="size-1.5 rounded-full bg-amber-400" />
              Agenda online para barbearias
            </span>

            <h1
              className={`${playfair.className} mt-6 text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl`}
            >
              Sua cadeira{' '}
              <span className="italic text-amber-400">sempre cheia</span>.
              Sem WhatsApp lotado.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-300">
              Crie a página de agendamento da sua barbearia, defina serviços e
              horários, e deixe os clientes marcarem sozinhos — 24 horas por dia,
              direto do celular.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/cadastro"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-7 py-3.5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-amber-300"
              >
                Criar minha página grátis
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
              >
                Já tenho conta
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-5 text-sm text-neutral-400">
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span>Feito para barbearias que levam a agenda a sério.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Stats ===== */}
      <section className="border-y border-white/5 bg-neutral-900/40">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 divide-x divide-white/5 px-5 sm:grid-cols-4">
          <Stat valor="24h" rotulo="Agenda aberta" />
          <Stat valor="0" rotulo="Custo pra começar" />
          <Stat valor="1 link" rotulo="Pra compartilhar" />
          <Stat valor="1 clique" rotulo="Pra confirmar" />
        </div>
      </section>

      {/* ===== Features ===== */}
      <section className="mx-auto w-full max-w-6xl px-5 py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
            Por que usar
          </p>
          <h2
            className={`${playfair.className} mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl`}
          >
            Tudo que a sua barbearia precisa pra encher a agenda.
          </h2>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          <Feature
            icon={<Share2 className="size-5" />}
            titulo="Página própria"
            texto="Um link exclusivo da sua barbearia, com seus serviços e preços. Compartilhe no Instagram e na bio."
          />
          <Feature
            icon={<CalendarClock className="size-5" />}
            titulo="Agenda inteligente"
            texto="Os clientes só veem os horários realmente livres. Nada de marcar dois cortes no mesmo horário."
          />
          <Feature
            icon={<Settings className="size-5" />}
            titulo="Serviços e horários"
            texto="Cadastre cortes, barba, preços e seus dias de atendimento em minutos, sem complicação."
          />
          <Feature
            icon={<CheckCircle2 className="size-5" />}
            titulo="Confirme num toque"
            texto="Veja os agendamentos no painel e confirme ou cancele com um clique."
          />
          <Feature
            icon={<Smartphone className="size-5" />}
            titulo="Pensado pro celular"
            texto="Funciona liso no telefone — tanto pra você quanto pro cliente que está marcando."
          />
          <Feature
            icon={<ShieldCheck className="size-5" />}
            titulo="Seus dados seguros"
            texto="Cada barbearia enxerga só os próprios agendamentos. Privacidade do cliente em primeiro lugar."
          />
        </div>
      </section>

      {/* ===== Showcase ===== */}
      <section className="border-y border-white/5 bg-neutral-900/40">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-24 lg:grid-cols-2">
          <div className="relative">
            <div className="absolute -inset-3 -z-10 rounded-3xl bg-amber-400/10 blur-2xl" />
            <img
              src={SHOWCASE_IMG}
              alt="Barbeiro atendendo cliente"
              className="aspect-[4/5] w-full rounded-2xl object-cover ring-1 ring-white/10"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
              Como funciona
            </p>
            <h2
              className={`${playfair.className} mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl`}
            >
              No ar em três passos.
            </h2>
            <div className="mt-10 space-y-8">
              <Passo
                numero="01"
                titulo="Cadastre sua barbearia"
                texto="Crie sua conta e dê um nome à barbearia. Leva menos de um minuto."
              />
              <Passo
                numero="02"
                titulo="Configure serviços e horários"
                texto="Adicione seus cortes, preços e os dias e horas em que você atende."
              />
              <Passo
                numero="03"
                titulo="Compartilhe seu link"
                texto="Divulgue a página e comece a receber agendamentos no automático."
              />
            </div>
            <Link
              href="/cadastro"
              className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-amber-400 transition-colors hover:text-amber-300"
            >
              Começar agora
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Testimonial ===== */}
      <section className="mx-auto w-full max-w-4xl px-5 py-24 text-center">
        <Scissors className="mx-auto size-7 text-amber-400" />
        <blockquote
          className={`${playfair.className} mt-6 text-3xl font-medium leading-snug text-white sm:text-4xl`}
        >
          “Os clientes marcam sozinhos e eu só abro o painel pra ver o dia. Parei
          de perder horário e a agenda nunca esteve tão cheia.”
        </blockquote>
        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-amber-400 font-semibold text-neutral-950">
            G
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-white">Barbearia Goulart</p>
            <p className="text-xs text-neutral-400">Dono · usa o BarbeariaAgenda</p>
          </div>
        </div>
      </section>

      {/* ===== CTA final ===== */}
      <section className="mx-auto w-full max-w-6xl px-5 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-amber-400/20 bg-gradient-to-br from-neutral-900 to-neutral-950 px-8 py-16 text-center sm:px-16">
          <div className="absolute -right-16 -top-16 size-48 rounded-full bg-amber-400/10 blur-3xl" />
          <Clock className="mx-auto size-8 text-amber-400" />
          <h2
            className={`${playfair.className} mx-auto mt-5 max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl`}
          >
            Pronto pra encher a sua cadeira?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-neutral-400">
            Crie a página da sua barbearia agora. É grátis pra começar e leva
            menos de um minuto.
          </p>
          <Link
            href="/cadastro"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-amber-400 px-8 py-3.5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-amber-300"
          >
            Criar conta grátis
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t border-white/5">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-neutral-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <Scissors className="size-4 text-amber-400" />
            <span className="font-medium text-neutral-300">BarbeariaAgenda</span>
          </div>
          <p>Feito com Next.js e Supabase</p>
        </div>
      </footer>
    </div>
  )
}

function Stat({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <div className="px-5 py-8 text-center">
      <p
        className={`text-3xl font-semibold text-white sm:text-4xl`}
      >
        {valor}
      </p>
      <p className="mt-1 text-xs uppercase tracking-wider text-neutral-500">
        {rotulo}
      </p>
    </div>
  )
}

function Feature({
  icon,
  titulo,
  texto,
}: {
  icon: React.ReactNode
  titulo: string
  texto: string
}) {
  return (
    <div className="group bg-neutral-950 p-7 transition-colors hover:bg-neutral-900">
      <span className="flex size-11 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400 transition-colors group-hover:bg-amber-400 group-hover:text-neutral-950">
        {icon}
      </span>
      <h3 className="mt-5 text-lg font-semibold text-white">{titulo}</h3>
      <p className="mt-2 text-sm leading-relaxed text-neutral-400">{texto}</p>
    </div>
  )
}

function Passo({
  numero,
  titulo,
  texto,
}: {
  numero: string
  titulo: string
  texto: string
}) {
  return (
    <div className="flex gap-5">
      <span
        className={`${playfair.className} text-2xl font-semibold text-amber-400`}
      >
        {numero}
      </span>
      <div className="border-l border-white/10 pl-5">
        <h3 className="font-semibold text-white">{titulo}</h3>
        <p className="mt-1 text-sm leading-relaxed text-neutral-400">{texto}</p>
      </div>
    </div>
  )
}
