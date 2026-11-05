import type { ReactNode } from 'react'
import { CircleDot, Disc, Dribbble, Home, Radio, Star, Target, Ticket, type LucideIcon } from 'lucide-react'
import { Link, useLocation } from '@/router'
import { COMP_BY_ID, FOOTBALL_COMPS, MATCHES, TEAM_BY_ID } from '@/data/catalog'
import { useStore } from '@/lib/store'
import { Crest } from '@/components/Crest'
import { RoyalHeader } from '@/components/royal/RoyalHeader'
import { RoyalSlip } from '@/components/royal/RoyalSlip'
import { MobileSlip } from '@/components/royal/MobileSlip'

const LIVE_COUNT = MATCHES.filter((m) => m.status === 'live').length

const SPORT_LINKS: { to: string; label: string; icon: LucideIcon; count?: number }[] = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/live', label: 'Live', icon: Radio, count: LIVE_COUNT },
  { to: '/football', label: 'Football', icon: CircleDot },
  { to: '/live?sport=tennis', label: 'Tennis', icon: Disc },
  { to: '/live?sport=basketball', label: 'Basketball', icon: Dribbble },
  { to: '/live?sport=cricket', label: 'Cricket', icon: Target },
]

const rowCls = (active: boolean) =>
  'flex h-11 items-center gap-3 rounded-xl px-3 text-[14px] font-semibold transition-colors ' +
  (active ? 'bg-volt/10 text-white shadow-[inset_2px_0_0_0_rgb(var(--volt))]' : 'text-slate-300 hover:bg-white/[0.04] hover:text-white')

function LeftNav() {
  const { pathname, params } = useLocation()
  const followed = useStore((s) => s.followed)
  const slipCount = useStore((s) => s.slip.length)

  const isActive = (to: string) => {
    const [p, q] = to.split('?')
    if (p !== pathname && !(p === '/football' && pathname.startsWith('/match/'))) return false
    if (p === '/live') return (q ? q.split('=')[1] : null) === params.get('sport')
    return true
  }

  return (
    <nav aria-label="Sports and competitions" className="sticky top-24 hidden max-h-[calc(100dvh-7rem)] w-60 shrink-0 self-start overflow-y-auto pb-6 pt-6 lg:block">
      <p className="label-caps mb-2 px-3">Sports</p>
      <ul className="space-y-0.5">
        {SPORT_LINKS.map((n) => {
          const active = isActive(n.to)
          return (
            <li key={n.to}>
              <Link to={n.to} aria-current={active ? 'page' : undefined} className={rowCls(active)}>
                <n.icon size={18} className={active ? 'text-volt' : 'text-slate-400'} />
                <span className="flex-1 truncate">{n.label}</span>
                {n.count !== undefined && <span className="tabular rounded-full bg-live/15 px-2 py-0.5 text-[11px] font-bold text-live">{n.count}</span>}
              </Link>
            </li>
          )
        })}
        <li>
          <Link to="/bets" className={rowCls(false)}>
            <Ticket size={18} className="text-gold" />
            <span className="flex-1 truncate">Bets</span>
            {slipCount > 0 && <span className="tabular grid h-5 min-w-[20px] place-items-center rounded-full bg-volt px-1 text-[11px] font-extrabold text-ink-950">{slipCount}</span>}
          </Link>
        </li>
      </ul>

      <p className="label-caps mb-2 mt-7 px-3">Top competitions</p>
      <ul className="space-y-0.5">
        {FOOTBALL_COMPS.map((id) => (
          <li key={id}>
            <Link to={`/football?c=${id}`} className={rowCls(false)}>
              <span className="grid h-7 w-9 shrink-0 place-items-center rounded-lg bg-ink-700 text-[10px] font-extrabold tracking-wide text-gold">{COMP_BY_ID[id].short}</span>
              <span className="truncate">{COMP_BY_ID[id].name}</span>
            </Link>
          </li>
        ))}
      </ul>

      {followed.length > 0 && (
        <>
          <p className="label-caps mb-2 mt-7 flex items-center gap-1.5 px-3">
            <Star size={11} className="fill-gold text-gold" /> Following
          </p>
          <ul className="space-y-0.5">
            {followed.map((key) => {
              const [kind, id] = key.split(':')
              if (kind === 'team' && TEAM_BY_ID[id]) {
                const m = MATCHES.find((x) => x.home === id || x.away === id)
                return (
                  <li key={key}>
                    <Link to={m ? `/match/${m.id}` : '/football'} className={rowCls(false)}>
                      <Crest teamId={id} size={22} />
                      <span className="truncate">{TEAM_BY_ID[id].name}</span>
                    </Link>
                  </li>
                )
              }
              if (kind === 'comp' && COMP_BY_ID[id]) {
                return (
                  <li key={key}>
                    <Link to={`/football?c=${id}`} className={rowCls(false)}>
                      <span className="grid h-6 w-6 place-items-center rounded-md bg-ink-700 text-[9px] font-extrabold text-gold">{COMP_BY_ID[id].short.slice(0, 2)}</span>
                      <span className="truncate">{COMP_BY_ID[id].name}</span>
                    </Link>
                  </li>
                )
              }
              return null
            })}
          </ul>
        </>
      )}
    </nav>
  )
}

export function Shell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  // /bets has its own sportsbook layout (league filters, match list, slip) with the same header and dock.
  if (pathname === '/bets') return <>{children}</>
  return (
    <div className="min-h-dvh bg-ink-900">
      <RoyalHeader />
      <div className="mx-auto flex max-w-[1680px] gap-6 px-4 lg:px-6">
        <LeftNav />
        <main className="min-w-0 flex-1 pb-44 pt-6 xl:pb-12">{children}</main>
        <aside aria-label="Bet slip and My bets" className="sticky top-24 mt-6 hidden h-[calc(100dvh-7.5rem)] w-[400px] shrink-0 self-start overflow-hidden rounded-2xl border border-white/[0.07] bg-ink-800 shadow-card xl:block">
          <RoyalSlip />
        </aside>
      </div>
      <MobileSlip />
    </div>
  )
}
