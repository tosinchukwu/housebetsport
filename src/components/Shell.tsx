import { useEffect, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronUp, CircleDot, Disc, Dribbble, Home, Radio, Star, Target, Ticket, X } from 'lucide-react'
import { Link, useLocation } from '@/router'
import { COMP_BY_ID, FOOTBALL_COMPS, MATCHES, TEAM_BY_ID } from '@/data/catalog'
import { fmtAmount, fmtOdds } from '@/lib/format'
import { actions, useStore } from '@/lib/store'
import { findOutcome } from '@/lib/markets'
import { useTick } from '@/lib/live'
import { priceNow } from '@/lib/store'
import { Logo } from '@/components/Logo'
import { SearchBox } from '@/components/SearchBox'
import { DemoMenu } from '@/components/DemoMenu'
import { BetsPanel } from '@/components/BetsPanel'
import { Crest } from '@/components/Crest'

const LIVE_COUNT = MATCHES.filter((m) => m.status === 'live').length

function TopBar() {
  const balance = useStore((s) => s.balance)
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1760px] items-center gap-3 px-4 lg:px-0">
        <Link to="/" className="shrink-0 lg:w-64 lg:pl-6" aria-label="Housebets home">
          <Logo />
        </Link>
        <SearchBox className="mx-auto hidden w-full max-w-xl lg:block" />
        <div className="ml-auto flex items-center gap-2 lg:pr-6">
          <div className="flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] bg-ink-850 pl-2.5 pr-3.5" title="Sample balance. No real money.">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-gradient-to-b from-aqua-300 to-aqua-500 text-[10px] font-extrabold text-ink-950">$</span>
            <span className="tabular font-display text-[13px] font-bold text-white">{fmtAmount(balance)}</span>
            <span className="hidden text-[11px] font-bold text-slate-400 sm:inline">USDT</span>
          </div>
          <DemoMenu />
          <span className="hidden h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-ink-600 to-ink-700 font-display text-[13px] font-bold text-aqua sm:grid" aria-label="Demo player">
            DP
          </span>
        </div>
      </div>
    </header>
  )
}

const NAV = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/live', label: 'Live', icon: Radio, count: LIVE_COUNT },
  { to: '/football', label: 'Football', icon: CircleDot },
  { to: '/live?sport=tennis', label: 'Tennis', icon: Disc },
  { to: '/live?sport=basketball', label: 'Basketball', icon: Dribbble },
  { to: '/live?sport=cricket', label: 'Cricket', icon: Target },
  { to: '/bets', label: 'Bet slip & My bets', icon: Ticket },
]

function LeftNav() {
  const { pathname, params } = useLocation()
  const followed = useStore((s) => s.followed)
  const isActive = (to: string) => {
    const [p, q] = to.split('?')
    if (p !== pathname && !(p === '/football' && pathname.startsWith('/match/'))) return false
    if (p === '/live') return (q ? q.split('=')[1] : null) === params.get('sport')
    return true
  }

  return (
    <nav aria-label="Sports" className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-64 shrink-0 overflow-y-auto px-4 pb-8 pt-6 lg:block">
      <ul className="space-y-1">
        {NAV.map((n) => {
          const active = isActive(n.to) && !(n.to === '/football' && pathname.startsWith('/match/') && false)
          return (
            <li key={n.to}>
              <Link
                to={n.to}
                aria-current={active ? 'page' : undefined}
                className={
                  'flex h-11 items-center gap-3 rounded-xl px-3 text-[14px] font-semibold transition-colors ' +
                  (active ? 'bg-aqua/10 text-aqua shadow-[inset_2px_0_0_0_#3ee6f5]' : 'text-slate-300 hover:bg-white/[0.04] hover:text-white')
                }
              >
                <n.icon size={18} />
                <span className="flex-1 truncate">{n.label}</span>
                {n.count !== undefined && <span className="tabular rounded-full bg-live px-2 py-0.5 text-[11px] font-extrabold text-white">{n.count}</span>}
              </Link>
            </li>
          )
        })}
      </ul>

      <p className="label-caps mb-2 mt-8 px-3">Top competitions</p>
      <ul className="space-y-0.5">
        {FOOTBALL_COMPS.map((id) => (
          <li key={id}>
            <Link to={`/football?c=${id}`} className="flex h-10 items-center gap-3 rounded-xl px-3 text-[14px] font-medium text-slate-300 hover:bg-white/[0.04] hover:text-white">
              <span className="grid h-6 w-8 place-items-center rounded-md text-[10px] font-extrabold" style={{ background: `${COMP_BY_ID[id].accent}22`, color: COMP_BY_ID[id].accent }}>
                {COMP_BY_ID[id].short}
              </span>
              <span className="truncate">{COMP_BY_ID[id].name}</span>
            </Link>
          </li>
        ))}
      </ul>

      {followed.length > 0 && (
        <>
          <p className="label-caps mb-2 mt-8 flex items-center gap-1.5 px-3">
            <Star size={11} className="fill-gold text-gold" /> Following
          </p>
          <ul className="space-y-0.5">
            {followed.map((key) => {
              const [kind, id] = key.split(':')
              if (kind === 'team' && TEAM_BY_ID[id]) {
                const m = MATCHES.find((x) => x.home === id || x.away === id)
                return (
                  <li key={key}>
                    <Link to={m ? `/match/${m.id}` : '/football'} className="flex h-10 items-center gap-3 rounded-xl px-3 text-[14px] font-medium text-slate-300 hover:bg-white/[0.04] hover:text-white">
                      <Crest teamId={id} size={20} />
                      <span className="truncate">{TEAM_BY_ID[id].name}</span>
                    </Link>
                  </li>
                )
              }
              if (kind === 'comp' && COMP_BY_ID[id]) {
                return (
                  <li key={key}>
                    <Link to={`/football?c=${id}`} className="flex h-10 items-center gap-3 rounded-xl px-3 text-[14px] font-medium text-slate-300 hover:bg-white/[0.04] hover:text-white">
                      <span className="grid h-5 w-5 place-items-center rounded text-[9px] font-extrabold" style={{ background: `${COMP_BY_ID[id].accent}22`, color: COMP_BY_ID[id].accent }}>
                        {COMP_BY_ID[id].short.slice(0, 2)}
                      </span>
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

function BottomNav() {
  const { pathname } = useLocation()
  const slipCount = useStore((s) => s.slip.length)
  const items = [
    { to: '/', label: 'Home', icon: Home, active: pathname === '/' },
    { to: '/live', label: 'Live', icon: Radio, active: pathname === '/live' },
    { to: '/football', label: 'Football', icon: CircleDot, active: pathname === '/football' || pathname.startsWith('/match/') },
    { to: '/bets', label: 'My bets', icon: Ticket, active: pathname === '/bets', badge: slipCount },
  ]
  return (
    <nav aria-label="Primary" className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.07] bg-ink-950/90 backdrop-blur-xl lg:hidden">
      <ul className="mx-auto grid h-16 max-w-lg grid-cols-4 px-2">
        {items.map((it) => (
          <li key={it.to} className="grid place-items-center">
            <Link
              to={it.to}
              aria-current={it.active ? 'page' : undefined}
              className={'relative flex h-12 w-full flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-bold transition-colors ' + (it.active ? 'bg-aqua/10 text-aqua' : 'text-slate-400')}
            >
              <it.icon size={20} />
              {it.label}
              {!!it.badge && <span className="tabular absolute right-[22%] top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-mint px-1 text-[10px] font-extrabold text-ink-950">{it.badge}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function SlipBar() {
  const { pathname } = useLocation()
  const slip = useStore((s) => s.slip)
  useTick()
  if (pathname === '/bets' || slip.length === 0) return null
  const first = slip[0]
  const f = findOutcome(first.id)
  return (
    <div className="fixed inset-x-3 bottom-[calc(4rem+env(safe-area-inset-bottom)+10px)] z-40 mx-auto max-w-lg animate-floatIn lg:bottom-4 xl:hidden">
      <button
        type="button"
        onClick={() => actions.setSheet(true)}
        aria-label="Open bet slip"
        className="flex h-14 w-full items-center gap-3 rounded-2xl bg-mint pl-2.5 pr-4 text-left text-ink-950 shadow-[0_12px_32px_-8px_rgba(195,248,238,0.45)] transition-transform active:scale-[0.99]"
      >
        <span className="tabular grid h-9 w-9 place-items-center rounded-xl bg-ink-950 font-display text-[15px] font-bold text-mint">{slip.length}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-display text-[14px] font-bold">
            {slip.length === 1 && f ? `${f.outcome.label} @ ${fmtOdds(priceNow(first.id))}` : `${slip.length} selections`}
          </span>
          <span className="block text-[11px] font-semibold text-ink-800/80">Singles · tap to set stakes</span>
        </span>
        <ChevronUp size={20} />
      </button>
    </div>
  )
}

function SlipSheet() {
  const open = useStore((s) => s.sheetOpen)
  const tab = useStore((s) => s.panelTab)
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && actions.setSheet(false)
    window.addEventListener('keydown', esc)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', esc)
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => actions.setSheet(false)} className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={tab === 'slip' ? 'Bet slip' : 'My bets'}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="absolute inset-x-0 bottom-0 mx-auto flex h-[88dvh] max-w-lg flex-col overflow-hidden rounded-t-3xl border border-b-0 border-white/10 bg-ink-850 shadow-2xl lg:bottom-6 lg:right-6 lg:left-auto lg:mr-0 lg:h-[80dvh] lg:w-[420px] lg:max-w-none lg:rounded-3xl lg:border-b"
          >
            <div className="relative flex h-6 shrink-0 justify-center pt-2.5">
              <span className="h-1 w-10 rounded-full bg-white/20" />
              <button type="button" aria-label="Close bet slip" onClick={() => actions.setSheet(false)} className="absolute right-3 top-1 grid h-9 w-9 place-items-center rounded-full text-slate-300 hover:bg-white/5">
                <X size={18} />
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <BetsPanel />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export function Shell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const onBets = pathname === '/bets'
  return (
    <div className="min-h-dvh">
      <TopBar />
      <div className="mx-auto flex max-w-[1760px]">
        <LeftNav />
        <main className="min-w-0 flex-1 px-4 pb-44 pt-5 lg:px-8 lg:pb-16 lg:pt-8">{children}</main>
        {!onBets && (
          <aside aria-label="Bet slip and My bets" className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-[380px] shrink-0 border-l border-white/[0.06] bg-ink-900/60 xl:block">
            <BetsPanel />
          </aside>
        )}
      </div>
      <BottomNav />
      <SlipBar />
      <SlipSheet />
    </div>
  )
}
