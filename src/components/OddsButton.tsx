import { Check, Lock } from 'lucide-react'
import { findOutcome } from '@/lib/markets'
import { fmtOdds } from '@/lib/format'
import { priceAt, useTick, autoSuspended } from '@/lib/live'
import { actions, useStore } from '@/lib/store'
import { MATCH_BY_ID } from '@/data/catalog'

export function useOdds(id: string) {
  const tick = useTick()
  const bump = useStore((s) => s.bump[id] ?? 1)
  const forced = useStore((s) => s.suspended)
  const f = findOutcome(id)
  const live = f?.match.status === 'live'
  const base = f?.outcome.baseOdds ?? 0
  const odds = f ? priceAt(id, base, live, tick, bump) : 0
  const prev = f ? priceAt(id, base, live, tick - 1, bump) : 0
  const dir = odds > prev ? 1 : odds < prev ? -1 : 0
  const suspended =
    !f || forced.includes(`${f.match.id}|${f.market.key}`) || forced.includes(f.match.id) || autoSuspended(f.match, f.market.key, tick)
  return { odds, dir, suspended, tick, found: f }
}

export function useMarketSuspended(matchId: string, marketKey: string) {
  const tick = useTick()
  const forced = useStore((s) => s.suspended)
  const m = MATCH_BY_ID[matchId]
  return forced.includes(`${matchId}|${marketKey}`) || forced.includes(matchId) || (!!m && autoSuspended(m, marketKey, tick))
}

interface Props {
  outcomeId: string
  /** Overrides the outcome label. */
  label?: string
  size?: 'sm' | 'md'
  forceSuspended?: boolean
}

export function OddsButton({ outcomeId, label, size = 'md', forceSuspended }: Props) {
  const { odds, dir, suspended: s0, tick, found } = useOdds(outcomeId)
  const selected = useStore((s) => s.slip.some((i) => i.id === outcomeId))
  const suspended = s0 || !!forceSuspended
  if (!found) return null
  const text = label ?? found.outcome.label
  const sm = size === 'sm'

  const base =
    'group relative flex min-w-0 flex-col justify-center overflow-hidden rounded-2xl border text-left transition-all duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt/70 '
  const pad = sm ? 'min-h-[52px] px-3 py-2' : 'min-h-[56px] px-3.5 py-2.5'
  const tone = suspended
    ? 'cursor-not-allowed border-white/[0.03] bg-ink-950/60 text-slate-500'
    : selected
      ? 'border-volt bg-volt text-ink-950 shadow-glow'
      : 'border-white/[0.07] bg-ink-800/80 hover:border-volt/50 hover:bg-ink-700'

  return (
    <button
      type="button"
      disabled={suspended}
      aria-pressed={selected}
      aria-label={`${text} at ${fmtOdds(odds)}${suspended ? ', suspended' : ''}`}
      onClick={() => actions.toggleSelection(outcomeId)}
      className={base + pad + ' ' + tone}
    >
      {dir !== 0 && !suspended && !selected && (
        <span
          key={tick}
          aria-hidden
          className="pointer-events-none absolute inset-0 animate-tint"
          style={{ ['--tint' as string]: dir > 0 ? 'rgba(52,211,153,0.22)' : 'rgba(255,107,129,0.22)' }}
        />
      )}
      <span className="relative flex items-center gap-1 text-[12px] font-semibold leading-tight">
        <span className={'truncate ' + (selected ? 'text-ink-900' : suspended ? 'text-slate-500' : 'text-slate-300')}>{text}</span>
        {found.outcome.sub && (
          <span className={'shrink-0 text-[10px] font-bold uppercase tracking-wide ' + (selected ? 'text-ink-800/70' : 'text-slate-500')}>
            {found.outcome.sub}
          </span>
        )}
      </span>
      <span className="relative mt-0.5 flex items-center gap-1">
        {suspended ? (
          <Lock size={14} className="text-slate-500" aria-hidden />
        ) : (
          <>
            <span
              className={
                'tabular font-display text-[15px] font-bold leading-none ' +
                (selected ? 'text-ink-950' : dir > 0 ? 'text-up' : dir < 0 ? 'text-down' : 'text-volt')
              }
            >
              {fmtOdds(odds)}
            </span>
            {dir !== 0 && !selected && (
              <span key={tick} className="animate-flash text-[9px] leading-none" aria-hidden>
                <span className={dir > 0 ? 'text-up' : 'text-down'}>{dir > 0 ? '▲' : '▼'}</span>
              </span>
            )}
          </>
        )}
      </span>
      {selected && !suspended && <Check size={14} strokeWidth={3} className="absolute right-2 top-2 text-ink-900" aria-hidden />}
    </button>
  )
}
