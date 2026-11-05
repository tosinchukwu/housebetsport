import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronUp, CircleDot, Home, Radio, Ticket, X } from 'lucide-react'
import { Link, useLocation } from '@/router'
import { fmtOdds } from '@/lib/format'
import { actions, priceNow, useStore } from '@/lib/store'
import { findOutcome } from '@/lib/markets'
import { useTick } from '@/lib/live'
import { RoyalSlip } from '@/components/royal/RoyalSlip'

const NAV = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/live', label: 'Live', icon: Radio },
  { to: '/football', label: 'Football', icon: CircleDot },
  { to: '/bets', label: 'Bets', icon: Ticket },
]

/** Phone and tablet: bottom navigation plus a bar that expands into the full bet slip. */
export function MobileSlip() {
  const { pathname } = useLocation()
  const slip = useStore((s) => s.slip)
  const open = useStore((s) => s.sheetOpen)
  useTick()

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

  const first = slip[0] && findOutcome(slip[0].id)

  return (
    <div className="xl:hidden">
      <div className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-ink-850">
        {slip.length > 0 && (
          <button
            type="button"
            onClick={() => actions.setSheet(true)}
            aria-label="Open bet slip"
            className="flex h-14 w-full items-center gap-3 border-b border-white/[0.06] bg-volt px-4 text-left text-ink-950"
          >
            <span className="tabular grid h-8 w-8 place-items-center rounded-full bg-ink-950 font-display text-[14px] font-bold text-volt">{slip.length}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-display text-[14px] font-bold">
                {slip.length === 1 && first ? `${first.outcome.label} @ ${fmtOdds(priceNow(slip[0].id))}` : `${slip.length} selections`}
              </span>
              <span className="block text-[11px] font-semibold text-ink-900/70">
                Singles · tap to set stakes
              </span>
            </span>
            <ChevronUp size={20} />
          </button>
        )}
        <ul className="mx-auto grid h-16 max-w-lg grid-cols-4 px-2">
          {NAV.map((n) => {
            const active = n.to === '/' ? pathname === '/' : n.to === '/football' ? pathname === '/football' || pathname.startsWith('/match/') : pathname === n.to
            return (
              <li key={n.to} className="grid place-items-center">
                <Link
                  to={n.to}
                  aria-current={active ? 'page' : undefined}
                  className={'flex h-12 w-full flex-col items-center justify-center gap-0.5 text-[11px] font-bold ' + (active ? 'text-gold' : 'text-slate-400')}
                >
                  <n.icon size={20} />
                  {n.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => actions.setSheet(false)} className="absolute inset-0 bg-ink-950/80" />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Bet slip"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 34, stiffness: 340 }}
              className="absolute inset-x-0 bottom-0 mx-auto flex h-[88dvh] max-w-lg flex-col overflow-hidden rounded-t-3xl border border-b-0 border-gold/20 bg-ink-800 shadow-2xl"
            >
              <div className="relative flex h-6 shrink-0 justify-center pt-2.5">
                <span className="h-1 w-10 rounded-full bg-white/20" />
                <button type="button" aria-label="Close bet slip" onClick={() => actions.setSheet(false)} className="absolute right-3 top-1 grid h-9 w-9 place-items-center rounded-full text-slate-300 hover:bg-white/5">
                  <X size={18} />
                </button>
              </div>
              <div className="min-h-0 flex-1">
                <RoyalSlip />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
