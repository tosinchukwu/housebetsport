import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ChevronDown, Search, SearchX, X } from 'lucide-react'
import { Link, navigate, useLocation } from '@/router'
import { MATCHES, MATCH_BY_ID, type Match } from '@/data/catalog'
import { GROUPS, marketsFor, teamLabel, type GroupKey } from '@/lib/markets'
import { Scoreboard } from '@/components/Scoreboard'
import { MarketCard } from '@/components/MarketCard'
import { SportNav } from '@/components/SportNav'

const tag = (m: Match) => `${teamLabel(m.home).slice(0, 3).toUpperCase()} - ${teamLabel(m.away).slice(0, 3).toUpperCase()}`

/** Compact dropdown to jump between matches of the same competition. */
function MatchPicker({ match }: { match: Match }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const siblings = MATCHES.filter((m) => m.comp === match.comp)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', close)
    window.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', close)
      window.removeEventListener('keydown', esc)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-12 items-center gap-2 rounded-full border border-volt/30 bg-volt/[0.08] px-5 font-display text-[15px] font-bold text-white hover:bg-volt/15"
      >
        {tag(match)}
        <ChevronDown size={16} className={'text-slate-400 transition-transform ' + (open ? 'rotate-180' : '')} />
      </button>
      {open && (
        <ul role="listbox" className="absolute left-0 top-14 z-30 max-h-72 w-64 animate-floatIn overflow-y-auto rounded-xl border border-white/10 bg-ink-800 p-1.5 shadow-2xl">
          {siblings.map((m) => (
            <li key={m.id} role="option" aria-selected={m.id === match.id}>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  navigate(`/match/${m.id}`)
                }}
                className={'flex h-11 w-full items-center gap-2 rounded-lg px-2.5 text-left text-[13px] font-semibold hover:bg-white/5 ' + (m.id === match.id ? 'text-volt' : 'text-slate-200')}
              >
                <span className="min-w-0 flex-1 truncate">
                  {teamLabel(m.home)} v {teamLabel(m.away)}
                </span>
                {m.status === 'live' && <span className="text-[10px] font-extrabold uppercase text-live">Live</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function MatchPage({ matchId }: { matchId: string }) {
  const match = MATCH_BY_ID[matchId]
  const { params } = useLocation()
  const q = params.get('q') ?? ''
  const tabParam = params.get('tab')
  const markets = useMemo(() => marketsFor(matchId), [matchId])

  const groups = GROUPS.filter((g) => markets.some((m) => m.group === g.key))
  const needle = q.trim().toLowerCase()
  const searching = needle.length > 0
  const active: GroupKey = (groups.find((g) => g.key === tabParam)?.key ?? groups[0]?.key ?? 'popular')

  const setParam = (k: string, v: string | null) => {
    const next = new URLSearchParams(window.location.search)
    if (v) next.set(k, v)
    else next.delete(k)
    const s = next.toString()
    navigate(`/match/${matchId}${s ? `?${s}` : ''}`, { replace: true })
  }

  if (!match) {
    return (
      <div className="mx-auto max-w-[760px]">
        <div className="surface grid place-items-center px-6 py-14 text-center">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-white/[0.08] bg-ink-900 text-volt">
            <SearchX size={24} />
          </div>
          <h1 className="font-display text-[20px] font-bold text-white">Match not found</h1>
          <p className="mt-1.5 max-w-sm text-[13px] text-slate-400">This fixture is no longer listed. Pick another from the live or football pages.</p>
          <Link to="/football" className="mt-5 inline-flex h-11 items-center rounded-xl bg-volt px-5 text-[14px] font-bold text-ink-950">
            Browse football
          </Link>
        </div>
      </div>
    )
  }

  const visible = searching
    ? markets.filter((m) => m.name.toLowerCase().includes(needle) || m.outcomes.some((o) => o.label.toLowerCase().includes(needle)))
    : markets.filter((m) => m.group === active)

  return (
    <div className="mx-auto max-w-[820px]">
      <SportNav />
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => (window.history.length > 1 ? window.history.back() : navigate('/football'))}
          className="grid h-12 w-12 place-items-center rounded-full border border-white/[0.08] bg-ink-800 text-slate-200 hover:bg-ink-700"
        >
          <ArrowLeft size={18} />
        </button>
        <MatchPicker match={match} />
      </div>

      <Scoreboard match={match} />

      <div className="relative mt-4">
        <Search size={18} aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={q}
          onChange={(e) => setParam('q', e.target.value || null)}
          placeholder="Search markets or players"
          aria-label="Search markets or players"
          className="h-12 w-full rounded-full border border-white/[0.08] bg-ink-800/80 pl-11 pr-11 text-[14px] text-white outline-none focus:border-volt/50 focus:ring-2 focus:ring-volt/20 [&::-webkit-search-cancel-button]:hidden"
        />
        {q && (
          <button type="button" aria-label="Clear search" onClick={() => setParam('q', null)} className="absolute right-1.5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-slate-400 hover:bg-white/10">
            <X size={16} />
          </button>
        )}
      </div>

      {!searching && (
        <div role="tablist" aria-label="Market groups" className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
          {groups.map((g) => (
            <button
              key={g.key}
              type="button"
              role="tab"
              aria-selected={active === g.key}
              onClick={() => setParam('tab', g.key)}
              className={'chip h-11 shrink-0 ' + (active === g.key ? 'chip-active' : '')}
            >
              {g.label}
              <span className="tabular opacity-70">{markets.filter((m) => m.group === g.key).length}</span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 space-y-2.5">
        {searching && <p className="label-caps px-1">{visible.length} {visible.length === 1 ? 'market' : 'markets'} for “{q}”</p>}
        {visible.length === 0 ? (
          <div className="surface px-6 py-10 text-center text-[14px] text-slate-400">No markets match that search.</div>
        ) : (
          visible.map((m, i) => <MarketCard key={`${active}-${searching}-${m.key}`} market={m} defaultOpen={searching || i < 6} />)
        )}
      </div>
    </div>
  )
}
