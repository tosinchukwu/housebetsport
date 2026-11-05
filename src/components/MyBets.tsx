import { useState } from 'react'
import { toast } from 'sonner'
import { Lock, Ticket } from 'lucide-react'
import { Link } from '@/router'
import { fmtAmount, fmtOdds, timeAgo } from '@/lib/format'
import { actions, cashOutValue, useStore, type Bet } from '@/lib/store'
import { clockShort, useSeconds, useTick } from '@/lib/live'
import { findOutcome } from '@/lib/markets'
import { LiveBadge } from '@/components/MatchCards'

const STATUS: Record<Bet['status'], { label: string; cls: string }> = {
  open: { label: 'Open', cls: 'bg-volt/10 text-volt' },
  won: { label: 'Won', cls: 'bg-up/15 text-up' },
  lost: { label: 'Lost', cls: 'bg-down/15 text-down' },
  cashed: { label: 'Cashed out', cls: 'bg-gold/15 text-gold' },
}

function CashOut({ bet }: { bet: Bet }) {
  const tick = useTick()
  const state = useStore((s) => s)
  const value = cashOutValue(bet, tick, state)
  const [confirm, setConfirm] = useState<number | null>(null)

  if (value === null) {
    return (
      <button type="button" disabled className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-ink-950/40 text-[13px] font-bold text-slate-500">
        <Lock size={14} /> Cash out unavailable
      </button>
    )
  }

  if (confirm !== null) {
    const moved = Math.abs(value - confirm) / confirm >= 0.01
    return (
      <div className="mt-3 rounded-xl border border-gold/30 bg-gold/[0.06] p-3">
        <p className="text-[13px] font-semibold text-white">
          {moved ? (
            <>
              Cash out value changed to <span className="tabular text-gold">{fmtAmount(value)} USDT</span>
            </>
          ) : (
            <>
              Cash out <span className="tabular text-gold">{fmtAmount(confirm)} USDT</span> now?
            </>
          )}
        </p>
        <div className="mt-2.5 flex gap-2">
          <button
            type="button"
            onClick={() => {
              actions.cashOut(bet.id, moved ? value : confirm)
              toast.success(`Cashed out ${fmtAmount(moved ? value : confirm)} USDT`)
              setConfirm(null)
            }}
            className="h-10 flex-1 rounded-lg bg-gold text-[13px] font-extrabold text-ink-950 hover:brightness-110"
          >
            {moved ? 'Accept and cash out' : 'Confirm'}
          </button>
          <button type="button" onClick={() => setConfirm(null)} className="h-10 rounded-lg px-4 text-[13px] font-bold text-slate-300 hover:bg-white/5">
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setConfirm(value)}
      className="mt-3 flex h-11 w-full items-center justify-between rounded-xl border border-mint/30 bg-mint/[0.08] px-4 text-[13px] font-bold text-mint transition-colors hover:bg-mint/15"
    >
      <span>Cash out</span>
      <span className="tabular font-display text-[15px]">{fmtAmount(value)} USDT</span>
    </button>
  )
}

function BetCard({ bet }: { bet: Bet }) {
  const secs = useSeconds()
  const found = bet.outcomeId ? findOutcome(bet.outcomeId) : undefined
  const live = bet.status === 'open' && found?.match.status === 'live'
  const st = STATUS[bet.status]
  const potential = bet.stake * bet.odds
  const returned = bet.status === 'open' ? potential : (bet.payout ?? 0)

  return (
    <li className="animate-floatIn rounded-2xl border border-white/[0.07] bg-ink-900/70 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className={'rounded-md px-2 py-[3px] text-[11px] font-extrabold uppercase tracking-wide ' + st.cls}>{st.label}</span>
        <span className="font-mono text-[11px] text-slate-500">
          {bet.ref} · {timeAgo(bet.placedAt)}
        </span>
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-bold text-white">{bet.label}</p>
          <p className="truncate text-[12px] text-slate-400">{bet.marketName}</p>
          <p className="mt-0.5 truncate text-[12px] text-slate-500">{bet.matchName}</p>
        </div>
        <p className="tabular font-display text-[17px] font-bold text-volt">{fmtOdds(bet.odds)}</p>
      </div>
      {live && found && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-ink-950/50 px-3 py-2">
          <LiveBadge />
          <span className="tabular text-[12px] font-bold text-live">{clockShort(found.match, secs)}</span>
          <span className="tabular ml-auto font-display text-[13px] font-bold text-white">
            {found.match.score[0]} - {found.match.score[1]}
          </span>
          <Link to={`/match/${found.match.id}`} className="text-[12px] font-bold text-volt hover:underline">
            View
          </Link>
        </div>
      )}
      <div className="mt-3 grid grid-cols-2 gap-3 border-t border-white/[0.06] pt-3 text-[12px]">
        <div>
          <p className="text-slate-500">Stake</p>
          <p className="tabular mt-0.5 text-[14px] font-bold text-white">{fmtAmount(bet.stake)} USDT</p>
        </div>
        <div className="text-right">
          <p className="text-slate-500">{bet.status === 'open' ? 'Potential return' : 'Returned'}</p>
          <p className={'tabular mt-0.5 text-[14px] font-bold ' + (bet.status === 'lost' ? 'text-slate-400' : bet.status === 'open' ? 'text-white' : 'text-up')}>
            {fmtAmount(returned)} USDT
          </p>
        </div>
      </div>
      {bet.status === 'open' && <CashOut bet={bet} />}
    </li>
  )
}

export function MyBets() {
  const bets = useStore((s) => s.bets)
  const tab = useStore((s) => s.betsTab)
  const open = bets.filter((b) => b.status === 'open')
  const settled = bets.filter((b) => b.status !== 'open')
  const list = tab === 'open' ? open : settled

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-6 pt-3">
      <div role="tablist" className="mb-3 grid grid-cols-2 rounded-xl border border-white/[0.06] bg-ink-950/50 p-1">
        {(['open', 'settled'] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            type="button"
            onClick={() => actions.setBetsTab(t)}
            className={'h-9 rounded-lg text-[13px] font-bold capitalize transition-colors ' + (tab === t ? 'bg-ink-700 text-white' : 'text-slate-400 hover:text-white')}
          >
            {t} <span className="tabular ml-1 text-slate-400">{t === 'open' ? open.length : settled.length}</span>
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <div className="grid place-items-center px-6 py-14 text-center">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-white/[0.08] bg-ink-850 text-volt">
            <Ticket size={24} />
          </div>
          <p className="font-display text-[16px] font-bold text-white">No {tab} bets</p>
          <p className="mt-1.5 text-[13px] text-slate-400">Bets you place will show up here.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((b) => (
            <BetCard key={b.id} bet={b} />
          ))}
        </ul>
      )}
    </div>
  )
}
