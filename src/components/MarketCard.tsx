import { useState } from 'react'
import { ChevronDown, Lock } from 'lucide-react'
import type { Market } from '@/lib/markets'
import { OddsButton, useMarketSuspended } from '@/components/OddsButton'

const COLS = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3' } as const

/** One betting market with a collapsible grid of outcomes. */
export function MarketCard({ market, defaultOpen = true }: { market: Market; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const suspended = useMarketSuspended(market.matchId, market.key)
  const body = `market-${market.matchId}-${market.key}`

  return (
    <section aria-label={market.name} className="surface-inner overflow-hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={body}
        onClick={() => setOpen((v) => !v)}
        className="flex h-12 w-full items-center gap-2 px-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-aqua/60"
      >
        <h3 className="min-w-0 flex-1 truncate font-display text-[14px] font-bold text-white">{market.name}</h3>
        {suspended && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-2 py-0.5 text-[11px] font-bold text-gold">
            <Lock size={11} /> Suspended
          </span>
        )}
        <ChevronDown size={18} className={'shrink-0 text-slate-400 transition-transform ' + (open ? 'rotate-180' : '')} />
      </button>
      {open && (
        <div id={body} className={'grid gap-2 px-3 pb-3 ' + COLS[market.cols]}>
          {market.outcomes.map((o) => (
            <OddsButton key={o.id} outcomeId={o.id} size="sm" forceSuspended={suspended} />
          ))}
        </div>
      )}
    </section>
  )
}
