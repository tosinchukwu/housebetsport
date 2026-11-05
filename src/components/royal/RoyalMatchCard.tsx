import { useState } from 'react'
import { ChevronRight, Lock } from 'lucide-react'
import { Link } from '@/router'
import { COMP_BY_ID, TEAM_BY_ID, type Match } from '@/data/catalog'
import { marketsFor, teamLabel, type Market } from '@/lib/markets'
import { Crest } from '@/components/Crest'
import { MatchFollow } from '@/components/Follow'
import { StatusBlock } from '@/components/MatchCards'
import { OddsButton, useMarketSuspended } from '@/components/OddsButton'

/** Markets offered on the compact card, in display order. Only the ones a match supports are shown. */
const CARD_MARKETS: { key: string; tab: string }[] = [
  { key: 'result', tab: '1X2' },
  { key: 'winner', tab: 'Winner' },
  { key: 'dc', tab: 'Double chance' },
  { key: 'dnb', tab: 'Draw no bet' },
  { key: 'total_main', tab: 'Total goals' },
  { key: 'btts', tab: 'Both score' },
  { key: 'spread', tab: 'Spread' },
  { key: 'points_total', tab: 'Total points' },
  { key: 'games_total', tab: 'Total games' },
]

const SIDE: Record<string, string> = { h: 'Home', d: 'Draw', a: 'Away' }
const COLS = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3' } as const

function MarketOdds({ market }: { market: Market }) {
  const suspended = useMarketSuspended(market.matchId, market.key)
  if (suspended) {
    return (
      <div className="flex min-h-[56px] items-center justify-center gap-2 rounded-xl border border-gold/25 bg-gold/[0.07] text-[13px] font-bold text-gold">
        <Lock size={14} /> Suspended
      </div>
    )
  }
  const sided = market.key === 'result' || market.key === 'winner'
  return (
    <div className={'grid gap-2 ' + COLS[market.cols]}>
      {market.outcomes.map((o) => (
        <OddsButton key={o.id} outcomeId={o.id} size="sm" label={sided ? SIDE[o.key] : undefined} />
      ))}
    </div>
  )
}

function TeamLine({ id, score, leading }: { id: string; score?: number; leading?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Crest teamId={id} size={26} />
      <span className="min-w-0 flex-1 truncate font-display text-[15px] font-semibold text-white">{TEAM_BY_ID[id].name}</span>
      {score !== undefined && (
        <span className={'tabular grid h-8 min-w-[34px] place-items-center rounded-lg bg-ink-950 px-2 font-display text-[16px] font-bold ' + (leading ? 'text-gold' : 'text-slate-400')}>
          {score}
        </span>
      )}
    </div>
  )
}

export function RoyalMatchCard({ match, featured = false }: { match: Match; featured?: boolean }) {
  const all = marketsFor(match.id)
  const tabs = CARD_MARKETS.map((t) => ({ ...t, market: all.find((m) => m.key === t.key) })).filter((t): t is typeof t & { market: Market } => !!t.market)
  const [active, setActive] = useState(tabs[0]?.key)
  const current = tabs.find((t) => t.key === active) ?? tabs[0]
  const live = match.status === 'live'
  const [h, a] = match.score

  return (
    <article
      className={
        'rounded-2xl border bg-ink-800 p-4 shadow-card transition-colors hover:border-gold/30 ' +
        (featured ? 'border-gold/25 bg-gradient-to-br from-ink-700 to-ink-800' : 'border-white/[0.06]')
      }
    >
      <div className="mb-3.5 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <StatusBlock match={match} />
          <span className="hidden truncate text-[12px] font-medium text-slate-400 sm:block">{COMP_BY_ID[match.comp].name}</span>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {match.sport === 'football' && <MatchFollow match={match} />}
          <Link to={`/match/${match.id}`} className="flex h-9 items-center gap-0.5 rounded-full px-2.5 text-[12px] font-bold text-gold hover:bg-gold/10">
            +{Math.max(0, all.length - 1)} markets <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:items-center md:gap-6">
        <Link to={`/match/${match.id}`} className="block space-y-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt/60">
          <TeamLine id={match.home} score={live ? h : undefined} leading={h >= a} />
          <TeamLine id={match.away} score={live ? a : undefined} leading={a >= h} />
          {live && match.sport !== 'football' && match.detail && <p className="pl-[38px] text-[12px] font-semibold text-slate-400">{match.detail}</p>}
          {match.sport === 'football' && <span className="sr-only">{teamLabel(match.home)} versus {teamLabel(match.away)}</span>}
        </Link>

        <div>
          {tabs.length > 1 && (
            <div role="tablist" aria-label="Markets" className="no-scrollbar -mx-1 mb-2.5 flex gap-1 overflow-x-auto px-1">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={current?.key === t.key}
                  onClick={() => setActive(t.key)}
                  className={
                    'h-8 shrink-0 rounded-full px-3 text-[12px] font-bold transition-colors ' +
                    (current?.key === t.key ? 'bg-gold/15 text-gold' : 'text-slate-400 hover:text-white')
                  }
                >
                  {t.tab}
                </button>
              ))}
            </div>
          )}
          {current && <MarketOdds market={current.market} />}
        </div>
      </div>
    </article>
  )
}
