import { Link, useLocation } from '@/router'
import { fmtAmount } from '@/lib/format'
import { useStore } from '@/lib/store'
import { Logo } from '@/components/Logo'
import { SearchBox } from '@/components/SearchBox'
import { DemoMenu } from '@/components/DemoMenu'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/live', label: 'Live' },
  { to: '/football', label: 'Football' },
  { to: '/bets', label: 'Bets' },
]

export function RoyalHeader() {
  const { pathname } = useLocation()
  const balance = useStore((s) => s.balance)
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-900">
      <div aria-hidden className="h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      <div className="mx-auto flex h-16 max-w-[1680px] items-center gap-4 px-4 lg:px-6">
        <Link to="/" aria-label="Housebets home" className="shrink-0">
          <Logo />
        </Link>
        <nav aria-label="Main" className="ml-4 hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => {
            const active = l.to === '/' ? pathname === '/' : l.to === '/football' ? pathname === '/football' || pathname.startsWith('/match/') : pathname === l.to
            return (
              <Link
                key={l.to}
                to={l.to}
                aria-current={active ? 'page' : undefined}
                className={
                  'relative flex h-16 items-center px-3.5 text-[14px] font-semibold transition-colors ' +
                  (active ? 'text-white' : 'text-slate-400 hover:text-white')
                }
              >
                {l.label}
                {active && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gold" />}
              </Link>
            )
          })}
        </nav>
        <SearchBox className="ml-auto hidden w-full max-w-sm xl:block" />
        <div className="ml-auto flex items-center gap-2 xl:ml-0">
          <div className="flex h-10 items-center gap-2 rounded-full border border-gold/30 bg-ink-850 pl-1.5 pr-3.5" title="Sample balance. No real money.">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-gold text-[11px] font-extrabold text-ink-950">$</span>
            <span className="tabular text-[14px] font-bold text-white">{fmtAmount(balance)}</span>
            <span className="hidden text-[11px] font-bold tracking-wide text-gold sm:inline">USDT</span>
          </div>
          <DemoMenu />
        </div>
      </div>
    </header>
  )
}
