import { useState } from 'react'
import { AlertTriangle, Layers, Loader2, Lock, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { fmtAmount, fmtOdds, parseStake } from '@/lib/format'
import { actions, hasChanged, isSuspended, MAX_STAKE, MIN_STAKE, priceNow, useStore } from '@/lib/store'
import { useTick } from '@/lib/live'
import { findOutcome } from '@/lib/markets'
import { matchName } from '@/data/catalog'

const QUICK = [10, 25, 50, 100]

/** Accumulator: every selection on the slip combined into one bet. */
export function AccaView() {
  const slip = useStore((s) => s.slip)
  const state = useStore((s) => s)
  const balance = useStore((s) => s.balance)
  const tick = useTick()
  const [stake, setStake] = useState('')
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const legs = slip.map((i) => {
    const f = findOutcome(i.id)
    return { item: i, found: f, odds: priceNow(i.id, state, tick), suspended: isSuspended(i.id, state, tick) }
  })
  const matchCounts = new Map<string, number>()
  legs.forEach((l) => l.found && matchCounts.set(l.found.match.id, (matchCounts.get(l.found.match.id) ?? 0) + 1))
  const conflict = (id?: string) => !!id && (matchCounts.get(id) ?? 0) > 1

  const anySuspended = legs.some((l) => l.suspended)
  const anyChanged = legs.some((l) => !l.suspended && hasChanged(l.item.odds, l.odds))
  const hasConflict = legs.some((l) => conflict(l.found?.match.id))
  const combined = legs.reduce((a, l) => a * (l.odds || 1), 1)
  const amount = parseStake(stake)
  const ret = amount * combined

  const place = async () => {
    setPlacing(true)
    setError(null)
    const err = await actions.placeAccumulator(stake)
    setPlacing(false)
    if (err) setError(err)
    else {
      setStake('')
      toast.success('Accumulator placed. Track it in My bets.')
    }
  }

  let cta: { label: string; disabled?: boolean; onClick?: () => void; warn?: boolean } = { label: 'Place accumulator', onClick: () => void place() }
  if (placing) cta = { label: 'Placing…', disabled: true }
  else if (legs.length < 2) cta = { label: 'Add 2 or more selections', disabled: true }
  else if (hasConflict) cta = { label: 'One selection per match only', disabled: true }
  else if (anySuspended) cta = { label: 'Remove suspended selections', warn: true, onClick: () => legs.filter((l) => l.suspended).forEach((l) => actions.removeSelection(l.item.id)) }
  else if (anyChanged) cta = { label: 'Accept odds changes', warn: true, onClick: () => actions.acceptAll() }
  else if (amount < MIN_STAKE) cta = { label: 'Enter a stake', disabled: true }
  else if (amount > MAX_STAKE) cta = { label: 'Stake above maximum', disabled: true }
  else if (amount > balance) cta = { label: 'Insufficient balance', disabled: true }

  if (legs.length === 0) {
    return (
      <div className="grid flex-1 place-items-center px-6 py-14 text-center">
        <div>
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-white/[0.08] bg-ink-850 text-gold">
            <Layers size={24} />
          </div>
          <p className="font-display text-[17px] font-semibold text-white">Build an accumulator</p>
          <p className="mx-auto mt-1.5 max-w-[250px] text-[13px] text-slate-400">Pick selections from two or more different matches. Their odds multiply into one bet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-4 pt-3">
        <div className="flex items-center justify-between">
          <p className="label-caps">{legs.length}-fold accumulator</p>
          <button type="button" onClick={() => actions.clearSlip()} className="inline-flex items-center gap-1 text-[12px] font-semibold text-slate-400 hover:text-white">
            <Trash2 size={13} /> Clear all
          </button>
        </div>
        <ul className="space-y-2">
          {legs.map((l) => (
            <li key={l.item.id} className={'rounded-xl border bg-ink-850 p-3 ' + (conflict(l.found?.match.id) ? 'border-gold/50' : 'border-white/[0.06]')}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-bold text-white">{l.found?.outcome.label ?? 'Unavailable'}</p>
                  {l.found && (
                    <p className="mt-0.5 truncate text-[12px] text-slate-400">
                      {l.found.market.name} · {matchName(l.found.match)}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {l.suspended ? <Lock size={14} className="text-gold" aria-label="Suspended" /> : <span className="tabular font-display text-[16px] font-bold text-volt">{fmtOdds(l.odds)}</span>}
                  <button type="button" aria-label="Remove selection" onClick={() => actions.removeSelection(l.item.id)} className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-white/5">
                    <X size={15} />
                  </button>
                </div>
              </div>
              {conflict(l.found?.match.id) && (
                <p className="mt-2 flex items-center gap-1.5 text-[12px] font-semibold text-gold">
                  <AlertTriangle size={13} /> Another selection from this match is on the slip.
                </p>
              )}
            </li>
          ))}
        </ul>

        <div>
          <label htmlFor="acca-stake" className="label-caps">
            Stake
          </label>
          <div className="mt-1.5 flex h-12 items-center gap-2 rounded-xl border border-white/[0.08] bg-ink-950 px-3 focus-within:border-volt/60">
            <span className="text-slate-400">$</span>
            <input
              id="acca-stake"
              inputMode="decimal"
              value={stake}
              placeholder="0.00"
              disabled={placing}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9.]/g, '')
                const [a, b] = v.split('.')
                setStake(b === undefined ? a : `${a}.${b.slice(0, 2)}`)
                setError(null)
              }}
              className="tabular h-full min-w-0 flex-1 bg-transparent text-[16px] font-semibold text-white outline-none"
            />
          </div>
          <div className="mt-2 flex gap-1.5">
            {QUICK.map((q) => (
              <button key={q} type="button" onClick={() => setStake(String(q))} className="h-9 flex-1 rounded-lg bg-ink-700 text-[13px] font-bold text-slate-200 hover:bg-ink-600">
                {q}
              </button>
            ))}
          </div>
        </div>
        {error && (
          <p role="alert" className="flex items-start gap-2 rounded-xl border border-down/30 bg-down/10 px-3 py-2.5 text-[12px] font-semibold text-down">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {error}
          </p>
        )}
      </div>

      <div className="safe-bottom border-t border-white/[0.07] bg-ink-850 px-4 pb-4 pt-3.5">
        <dl className="space-y-1.5 text-[13px]">
          <div className="flex justify-between">
            <dt className="text-slate-400">Combined odds</dt>
            <dd className="tabular font-bold text-white">{fmtOdds(combined)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-400">Total stake</dt>
            <dd className="tabular font-bold text-white">{fmtAmount(amount)} USDT</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-400">Potential winnings</dt>
            <dd className="tabular font-display text-[16px] font-bold text-gold">{fmtAmount(ret)} USDT</dd>
          </div>
        </dl>
        <button
          type="button"
          disabled={cta.disabled}
          onClick={cta.onClick}
          className={
            'mt-3.5 flex h-[52px] w-full items-center justify-center gap-2 rounded-xl font-display text-[15px] font-bold transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 ' +
            (cta.warn ? 'bg-gold text-ink-950 hover:brightness-110' : 'bg-volt text-ink-950 hover:bg-volt-300')
          }
        >
          {placing && <Loader2 size={17} className="animate-spin" />}
          {cta.label}
        </button>
        <p className="mt-2.5 text-center text-[11px] text-slate-500">Decimal odds. Prototype with sample data, no real money.</p>
      </div>
    </div>
  )
}
