import { AlertTriangle, ArrowRight, CheckCircle2, Loader2, Lock, Receipt, RotateCcw, Trash2, X } from 'lucide-react'
import { Link } from '@/router'
import { fmtAmount, fmtOdds, parseStake } from '@/lib/format'
import { actions, hasChanged, isSuspended, MAX_STAKE, MIN_STAKE, priceNow, useStore, type Bet, type SlipItem } from '@/lib/store'
import { useTick } from '@/lib/live'
import { useOdds } from '@/components/OddsButton'
import { matchName } from '@/data/catalog'

const QUICK = [10, 25, 50, 100]

function Receipt_({ bets }: { bets: Bet[] }) {
  return (
    <div className="animate-floatIn rounded-2xl border border-up/30 bg-up/10 p-4">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 shrink-0 text-up" size={22} />
        <div className="min-w-0 flex-1">
          <p className="font-display text-[15px] font-bold text-white">{bets.length > 1 ? `${bets.length} bets placed` : 'Bet placed'}</p>
          <ul className="mt-2 space-y-2">
            {bets.map((b) => (
              <li key={b.id} className="rounded-lg bg-ink-950/50 px-3 py-2 text-[12px]">
                <div className="flex justify-between gap-2">
                  <span className="truncate font-semibold text-slate-100">
                    {b.label} <span className="text-volt">@ {fmtOdds(b.odds)}</span>
                  </span>
                  <span className="tabular shrink-0 text-slate-300">{fmtAmount(b.stake)} USDT</span>
                </div>
                <div className="mt-0.5 flex justify-between gap-2 text-slate-500">
                  <span className="truncate">{b.marketName}</span>
                  <span className="shrink-0 font-mono text-[11px]">{b.ref}</span>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => actions.setPanelTab('bets')} className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/[0.06] text-[13px] font-bold text-white hover:bg-white/10">
              View in My bets <ArrowRight size={14} />
            </button>
            <button type="button" onClick={() => actions.dismissReceipt()} className="h-10 rounded-xl px-4 text-[13px] font-bold text-slate-300 hover:bg-white/5">
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SlipRow({ item }: { item: SlipItem }) {
  const { odds, suspended, found } = useOdds(item.id)
  if (!found) return null
  const stake = parseStake(item.stake)
  const changed = !suspended && hasChanged(item.odds, odds)
  const placing = item.state === 'placing'
  const tooHigh = stake > MAX_STAKE
  const ret = stake * odds

  return (
    <li className={'rounded-2xl border bg-ink-900/70 p-3.5 transition-colors ' + (suspended ? 'border-gold/30' : changed ? 'border-volt/40' : 'border-white/[0.07]')}>
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-500">{matchName(found.match)}</p>
          <p className="mt-1 truncate text-[15px] font-bold text-white">{found.outcome.label}</p>
          <p className="truncate text-[12px] text-slate-400">{found.market.name}</p>
        </div>
        <div className="text-right">
          {suspended ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-gold/10 px-2 py-1 text-[12px] font-bold text-gold">
              <Lock size={12} /> Suspended
            </span>
          ) : (
            <div>
              {changed && <p className="tabular text-[11px] text-slate-500 line-through">{fmtOdds(item.odds)}</p>}
              <p className={'tabular font-display text-[19px] font-bold leading-none ' + (changed ? (odds > item.odds ? 'text-up' : 'text-down') : 'text-volt')}>
                {fmtOdds(odds)}
              </p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => actions.removeSelection(item.id)}
          disabled={placing}
          aria-label={`Remove ${found.outcome.label}`}
          className="-mr-1.5 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-500 hover:bg-white/5 hover:text-white disabled:opacity-40"
        >
          <X size={16} />
        </button>
      </div>

      {suspended && (
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-gold/[0.07] px-3 py-2 text-[12px] font-medium text-gold">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          This selection is suspended. It will reopen shortly, or you can remove it.
        </p>
      )}
      {changed && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-volt/[0.08] px-3 py-2">
          <p className="flex-1 text-[12px] font-semibold text-volt">
            Odds changed from {fmtOdds(item.odds)} to {fmtOdds(odds)}
          </p>
          <button type="button" onClick={() => actions.acceptOdds(item.id)} className="h-8 rounded-lg bg-volt px-3 text-[12px] font-extrabold text-ink-950 hover:bg-volt-300">
            Accept
          </button>
        </div>
      )}
      {item.state === 'failed' && item.error && (
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-down/10 px-3 py-2 text-[12px] font-medium text-down">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          {item.error}
        </p>
      )}

      <div className="mt-3.5">
        <label htmlFor={`stake-${item.id}`} className="sr-only">
          Stake in USDT
        </label>
        <div
          className={
            'flex h-12 items-center rounded-xl border bg-ink-950/60 pl-3.5 pr-3 transition-colors focus-within:border-volt/60 ' +
            (tooHigh ? 'border-down/60' : 'border-white/[0.08]')
          }
        >
          <input
            id={`stake-${item.id}`}
            inputMode="decimal"
            autoComplete="off"
            placeholder="Stake"
            value={item.stake}
            disabled={placing}
            onChange={(e) => actions.setStake(item.id, e.target.value)}
            className="tabular h-full min-w-0 flex-1 bg-transparent font-display text-[17px] font-bold text-white outline-none"
          />
          <span className="text-[12px] font-bold text-slate-400">USDT</span>
        </div>
        {tooHigh && <p className="mt-1.5 text-[12px] font-medium text-down">Maximum stake is {fmtAmount(MAX_STAKE)} USDT.</p>}
        <div className="mt-2 flex gap-1.5">
          {QUICK.map((q) => (
            <button
              key={q}
              type="button"
              disabled={placing}
              onClick={() => actions.setStake(item.id, String(q))}
              className="h-8 flex-1 rounded-lg border border-white/[0.07] bg-white/[0.03] text-[12px] font-bold text-slate-300 hover:bg-white/[0.07] disabled:opacity-40"
            >
              {q}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between text-[13px]">
          <span className="text-slate-400">Potential return</span>
          <span className="tabular font-display font-bold text-white">{stake > 0 && !suspended ? fmtAmount(ret) : '0.00'} USDT</span>
        </div>
      </div>
      {placing && (
        <p className="mt-3 flex items-center gap-2 text-[12px] font-semibold text-slate-300">
          <Loader2 size={14} className="animate-spin" /> Placing bet…
        </p>
      )}
    </li>
  )
}

export function SlipView() {
  const slip = useStore((s) => s.slip)
  const receipt = useStore((s) => s.receipt)
  const balance = useStore((s) => s.balance)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-4 pt-3">
        {receipt.length > 0 && <Receipt_ bets={receipt} />}
        {slip.length === 0 ? (
          receipt.length === 0 && (
            <div className="grid place-items-center px-6 py-14 text-center">
              <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-white/[0.08] bg-ink-850 text-volt">
                <Receipt size={24} />
              </div>
              <p className="font-display text-[16px] font-bold text-white">Your slip is empty</p>
              <p className="mt-1.5 max-w-[240px] text-[13px] text-slate-400">Tap any odds to add a single. Each selection is its own bet.</p>
              <Link to="/live" className="mt-5 inline-flex h-10 items-center gap-1.5 rounded-xl bg-white/[0.06] px-4 text-[13px] font-bold text-white hover:bg-white/10">
                Browse live matches <ArrowRight size={14} />
              </Link>
            </div>
          )
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="label-caps">Singles · {slip.length}</p>
              <button type="button" onClick={() => actions.clearSlip()} className="inline-flex items-center gap-1 text-[12px] font-semibold text-slate-400 hover:text-white">
                <Trash2 size={13} /> Clear all
              </button>
            </div>
            <ul className="space-y-3">
              {slip.map((i) => (
                <SlipRow key={i.id} item={i} />
              ))}
            </ul>
          </>
        )}
      </div>
      {slip.length > 0 && <SlipFooter balance={balance} />}
    </div>
  )
}

function SlipFooter({ balance }: { balance: number }) {
  const slip = useStore((s) => s.slip)
  const state = useStore((s) => s)
  const tick = useTick()
  const rows = slip.map((i) => ({
    i,
    odds: priceNow(i.id, state, tick),
    suspended: isSuspended(i.id, state, tick),
    stake: parseStake(i.stake),
  }))
  const anySuspended = rows.some((r) => r.suspended)
  const anyChanged = rows.some((r) => !r.suspended && hasChanged(r.i.odds, r.odds))
  const anyEmpty = rows.some((r) => r.stake < MIN_STAKE)
  const anyHigh = rows.some((r) => r.stake > MAX_STAKE)
  const placing = rows.some((r) => r.i.state === 'placing')
  const total = rows.reduce((a, r) => a + r.stake, 0)
  const ret = rows.reduce((a, r) => a + (r.suspended ? 0 : r.stake * r.odds), 0)
  const insufficient = total > balance

  let cta: { label: string; disabled?: boolean; onClick?: () => void; tone?: 'primary' | 'warn' } = {
    label: `Place ${slip.length > 1 ? `${slip.length} bets` : 'bet'}`,
    onClick: () => void actions.placeBets(),
  }
  if (placing) cta = { label: 'Placing…', disabled: true }
  else if (anySuspended)
    cta = {
      label: 'Remove suspended selections',
      tone: 'warn',
      onClick: () => rows.filter((r) => r.suspended).forEach((r) => actions.removeSelection(r.i.id)),
    }
  else if (anyChanged) cta = { label: 'Accept odds changes', tone: 'warn', onClick: () => actions.acceptAll() }
  else if (anyEmpty) cta = { label: 'Enter a stake', disabled: true }
  else if (anyHigh) cta = { label: 'Stake above maximum', disabled: true }
  else if (insufficient) cta = { label: 'Insufficient balance', disabled: true }

  const failed = rows.some((r) => r.i.state === 'failed')

  return (
    <div className="safe-bottom border-t border-white/[0.07] bg-ink-850 px-4 pb-4 pt-3.5">
      <dl className="space-y-1.5 text-[13px]">
        <div className="flex justify-between">
          <dt className="text-slate-400">Total stake</dt>
          <dd className="tabular font-bold text-white">{fmtAmount(total)} USDT</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-400">Potential return</dt>
          <dd className="tabular font-display text-[15px] font-bold text-volt">{fmtAmount(ret)} USDT</dd>
        </div>
        <div className="flex justify-between text-[12px]">
          <dt className="text-slate-500">Sample balance</dt>
          <dd className="tabular text-slate-400">{fmtAmount(balance)} USDT</dd>
        </div>
      </dl>
      <button
        type="button"
        disabled={cta.disabled}
        onClick={cta.onClick}
        className={
          'mt-3.5 flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl font-display text-[15px] font-bold transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 ' +
          (cta.tone === 'warn' ? 'bg-gold text-ink-950 hover:brightness-110' : 'bg-mint text-ink-950 hover:brightness-105')
        }
      >
        {placing && <Loader2 size={17} className="animate-spin" />}
        {failed && !placing && !anySuspended && !anyChanged && !anyEmpty && !insufficient && <RotateCcw size={16} />}
        {failed && cta.label.startsWith('Place') ? 'Retry' : cta.label}
      </button>
      <p className="mt-2.5 text-center text-[11px] text-slate-500">Singles only. Decimal odds. Prototype with sample data, no real money.</p>
    </div>
  )
}
