'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Clock, LayoutDashboard, LogOut, Scissors, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/barbearia', label: 'Minha Barbearia', icon: Scissors },
  { href: '/dashboard/servicos', label: 'Serviços', icon: Tag },
  { href: '/dashboard/horarios', label: 'Horários', icon: Clock },
  { href: '/dashboard/agendamentos', label: 'Agendamentos', icon: Calendar },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-60 flex-col border-r bg-sidebar">
      <div className="flex items-center gap-2.5 border-b px-4 py-3.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Scissors className="size-3.5" />
        </div>
        <span className="text-sm font-semibold text-sidebar-foreground">
          Barbearia Agenda
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-2">
        <form action={logout}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2.5 text-sidebar-foreground/70 hover:text-sidebar-foreground"
          >
            <LogOut className="size-4 shrink-0" />
            Sair
          </Button>
        </form>
      </div>
    </aside>
  )
}
