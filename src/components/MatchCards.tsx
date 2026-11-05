import { ChevronRight, Lock } from 'lucide-react'
import { Link } from '@/router'
import { COMP_BY_ID, TEAM_BY_ID, type Match } from '@/data/catalog'
import { marketsFor, resultMarket } from '@/lib/markets'
import { clockShort, startLabel, useSeconds } from '@/lib/live'
import { Crest } from '@/components/Crest'
import { MatchFollow } from '@/components/Follow'
import { OddsButton, useMarketSuspended } from '@/components/OddsButton'

export function LiveBadge({ className = '' }: { className?: string }) {
  return (
    <span className={'inline-flex items-center gap-1.5 rounded-full bg-live px-2.5 py-[3px] text-[11px] font-extrabold uppercase tracking-wider text-white ' + className}>
      <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-white" />
      Live
    </span>
  )
}

export function StatusBlock({ match }: { match: Match }) {
  const secs = useSeconds()
  if (match.status === 'live') {
    return (
      <div className="flex items-center gap-2">
        <LiveBadge />
        <span className="tabular font-display text-[13px] font-bold text-live">{clockShort(match, secs)}</span>
      </div>
    )
  }
  const s = startLabel(match.startsInMin ?? 0, secs)
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="tabular font-display text-[14px] font-bold text-white">{s.primary}</span>
      <span className="text-[12px] font-medium text-slate-400">{s.secondary}</span>
    </div>
  )
}

function TeamLine({ id, score, leading }: { id: string; score?: number; leading?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <Crest teamId={id} size={24} />
      <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-slate-100">{TEAM_BY_ID[id].name}</span>
      {score !== undefined && (
        <span
          className={
            'tabular grid h-7 min-w-[30px] place-items-center rounded-lg bg-ink-950 px-1.5 font-display text-[14px] font-bold ' +
            (leading ? 'text-white' : 'text-slate-400')
          }
        >
          {score}
        </span>
      )}
    </div>
  )
}

function Teams({ match }: { match: Match }) {
  const live = match.status === 'live'
  const [h, a] = match.score
  return (
    <div className="space-y-2">
      <TeamLine id={match.home} score={live ? h : undefined} leading={h >= a} />
      <TeamLine id={match.away} score={live ? a : undefined} leading={a >= h} />
      {live && match.sport !== 'football' && match.detail && (
        <div className="pl-[34px] text-[11px] font-semibold text-slate-400">{match.detail}</div>
      )}
    </div>
  )
}

export function ResultOdds({ match, size = 'md' }: { match: Match; size?: 'sm' | 'md' }) {
  const market = resultMarket(match.id)
  const suspended = useMarketSuspended(match.id, market?.key ?? '')
  if (!market) return null
  if (suspended) {
    return (
      <div className="flex min-h-[56px] items-center justify-center gap-2 rounded-2xl border border-gold/20 bg-gold/[0.06] text-[13px] font-bold text-gold">
        <Lock size={14} /> Suspended
      </div>
    )
  }
  const n = market.outcomes.length
  return (
    <div className={'grid gap-2 ' + (n === 3 ? 'grid-cols-3' : 'grid-cols-2')}>
      {market.outcomes.map((o) => (
        <OddsButton key={o.id} outcomeId={o.id} size={size} />
      ))}
    </div>
  )
}

const marketCount = (m: Match) => Math.max(0, marketsFor(m.id).length - 1)

/** Full-width list row. Stacks on phones, one line on desktop. */
export function MatchRow({ match, showComp = false }: { match: Match; showComp?: boolean }) {
  const comp = COMP_BY_ID[match.comp]
  return (
    <article className="surface-inner relative px-3.5 py-3.5 transition-colors hover:border-volt/20 md:px-4">
      <div className="md:grid md:grid-cols-[132px_minmax(0,1fr)_minmax(0,300px)_72px] md:items-center md:gap-5">
        <div className="mb-2.5 flex items-center justify-between md:mb-0 md:block">
          <div>
            <StatusBlock match={match} />
            {showComp && <p className="mt-1 hidden truncate text-[11px] font-medium text-slate-500 md:block">{comp.name}</p>}
          </div>
          <div className="flex items-center gap-1 md:hidden">
            {showComp && <span className="mr-1 truncate text-[11px] font-medium text-slate-500">{comp.name}</span>}
            {match.sport === 'football' && <MatchFollow match={match} />}
            <Link to={`/match/${match.id}`} className="flex h-9 items-center gap-0.5 rounded-full px-2 text-[12px] font-bold text-slate-300 hover:bg-white/5">
              +{marketCount(match)} <ChevronRight size={14} />
            </Link>
          </div>
        </div>
        <Link to={`/match/${match.id}`} className="block min-w-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt/60">
          <Teams match={match} />
        </Link>
        <div className="mt-3 md:mt-0">
          <ResultOdds match={match} size="sm" />
        </div>
        <div className="hidden items-center justify-end gap-0.5 md:flex">
          {match.sport === 'football' && <MatchFollow match={match} />}
          <Link to={`/match/${match.id}`} aria-label="All markets" className="flex h-9 items-center gap-0.5 rounded-full px-2 text-[12px] font-bold text-slate-300 hover:bg-white/5">
            +{marketCount(match)} <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  )
}

/** Compact card for horizontal carousels. */
export function MatchCard({ match, className = '' }: { match: Match; className?: string }) {
  const comp = COMP_BY_ID[match.comp]
  return (
    <article className={'surface-inner relative flex w-[300px] shrink-0 snap-start flex-col gap-3 overflow-hidden p-4 md:w-[320px] ' + className}>
      <div className="flex items-center justify-between">
        <StatusBlock match={match} />
        <div className="flex items-center gap-0.5">
          {match.sport === 'football' && <MatchFollow match={match} />}
          <Link to={`/match/${match.id}`} className="flex h-9 items-center gap-0.5 rounded-full px-2 text-[12px] font-bold text-slate-300 hover:bg-white/5">
            +{marketCount(match)} <ChevronRight size={14} />
          </Link>
        </div>
      </div>
      <Link to={`/match/${match.id}`} className="block">
        <p className="mb-2 truncate text-[11px] font-semibold uppercase tracking-wider text-slate-500">{comp.name}</p>
        <Teams match={match} />
      </Link>
      <ResultOdds match={match} size="sm" />
    </article>
  )
}

