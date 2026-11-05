import { CalendarClock } from 'lucide-react'
import { navigate, useLocation } from '@/router'
import { FEATURED_MATCH_ID, MATCHES, MATCH_BY_ID, SPORTS, type SportId } from '@/data/catalog'
import { Scoreboard } from '@/components/Scoreboard'
import { ResultOdds } from '@/components/MatchCards'
import { SearchBox } from '@/components/SearchBox'
import { RoyalHeader } from '@/components/royal/RoyalHeader'
import { RoyalSidebar } from '@/components/royal/RoyalSidebar'
import { RoyalMatchCard } from '@/components/royal/RoyalMatchCard'
import { RoyalSlip } from '@/components/royal/RoyalSlip'
import { MobileSlip } from '@/components/royal/MobileSlip'

type View = 'all' | 'live' | 'upcoming'
const VIEWS: { key: View; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'live', label: 'Live' },
  { key: 'upcoming', label: 'Upcoming' },
]

function Heading({ title, sub, live = false }: { title: string; sub?: string; live?: boolean }) {
  return (
    <div className="mb-3 flex items-baseline gap-3">
      <h2 className="flex items-center gap-2 font-display text-[22px] font-semibold text-white">
        {live && <span className="h-2 w-2 animate-pulseDot rounded-full bg-live" aria-hidden />}
        {title}
      </h2>
      {sub && <span className="text-[13px] text-slate-400">{sub}</span>}
    </div>
  )
}

/** Royal Emerald sportsbook: leagues on the left, matches in the middle, bet slip on the right. */
export default function BetsPage() {
  const { params } = useLocation()
  const sport = (SPORTS.find((s) => s.id === params.get('sport'))?.id ?? null)
  const comp = params.get('c')
  const view = (VIEWS.find((v) => v.key === params.get('view'))?.key ?? 'all')

  const update = (next: { sport?: SportId | null; comp?: string | null; view?: View }) => {
    const q = new URLSearchParams()
    const s = next.sport === undefined ? sport : next.sport
    const c = next.sport !== undefined ? null : next.comp === undefined ? comp : next.comp
    const v = next.view ?? view
    if (s) q.set('sport', s)
    if (c) q.set('c', c)
    if (v !== 'all') q.set('view', v)
    const str = q.toString()
    navigate('/bets' + (str ? `?${str}` : ''), { replace: true })
  }

  const scoped = MATCHES.filter((m) => (!sport || m.sport === sport) && (!comp || m.comp === comp))
  const live = scoped.filter((m) => m.status === 'live')
  const upcoming = scoped.filter((m) => m.status === 'upcoming').sort((a, b) => (a.startsInMin ?? 0) - (b.startsInMin ?? 0))
  const featured = scoped.find((m) => m.id === FEATURED_MATCH_ID) ?? live[0] ?? upcoming[0]
  const showLive = view !== 'upcoming'
  const showUpcoming = view !== 'live'
  const liveList = live.filter((m) => m.id !== featured?.id)
  const upcomingList = upcoming.filter((m) => m.id !== featured?.id)
  const nothing = (!showLive || liveList.length === 0) && (!showUpcoming || upcomingList.length === 0) && !featured

  return (
    <div className="min-h-dvh bg-ink-900">
      <RoyalHeader />
      <div className="mx-auto flex max-w-[1680px] gap-6 px-4 lg:px-6">
        <RoyalSidebar sport={sport} comp={comp} onSport={(s) => update({ sport: s })} onComp={(c) => update({ comp: c })} />

        <main className="min-w-0 flex-1 pb-44 pt-6 xl:pb-12">
          <SearchBox className="mb-4 xl:hidden" />

          <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 lg:hidden" role="tablist" aria-label="Sports">
            <button type="button" role="tab" aria-selected={!sport} onClick={() => update({ sport: null })} className={'chip h-10 shrink-0 ' + (!sport ? 'chip-active' : '')}>
              All
            </button>
            {SPORTS.map((s) => (
              <button key={s.id} type="button" role="tab" aria-selected={sport === s.id} onClick={() => update({ sport: s.id })} className={'chip h-10 shrink-0 ' + (sport === s.id ? 'chip-active' : '')}>
                {s.name}
              </button>
            ))}
          </div>

          <div className="mb-6 flex items-end justify-between gap-3">
            <div>
              <p className="label-caps text-gold">Sportsbook</p>
              <h1 className="mt-1 font-display text-[30px] font-semibold leading-tight text-white md:text-[36px]">Today's matches</h1>
            </div>
            <div role="tablist" aria-label="Match status" className="flex rounded-full border border-white/[0.07] bg-ink-850 p-1">
              {VIEWS.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  role="tab"
                  aria-selected={view === v.key}
                  onClick={() => update({ view: v.key })}
                  className={'h-9 rounded-full px-4 text-[13px] font-bold transition-colors ' + (view === v.key ? 'bg-ink-600 text-white' : 'text-slate-400 hover:text-white')}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {featured && (view === 'all' || (view === 'live') === (featured.status === 'live')) && (
            <section aria-label="Featured match" className="mb-9">
              <Scoreboard match={MATCH_BY_ID[featured.id]} variant="hero">
                <ResultOdds match={featured} />
              </Scoreboard>
            </section>
          )}

          {showLive && liveList.length > 0 && (
            <section aria-label="Live matches" className="mb-9">
              <Heading title="Live now" sub={`${live.length} in play`} live />
              <div className="space-y-3">
                {liveList.map((m) => (
                  <RoyalMatchCard key={m.id} match={m} />
                ))}
              </div>
            </section>
          )}

          {showUpcoming && upcomingList.length > 0 && (
            <section aria-label="Upcoming matches" className="mb-9">
              <Heading title="Upcoming" sub={`${upcoming.length} fixtures`} />
              <div className="space-y-3">
                {upcomingList.map((m) => (
                  <RoyalMatchCard key={m.id} match={m} />
                ))}
              </div>
            </section>
          )}

          {nothing && (
            <div className="grid place-items-center rounded-2xl border border-white/[0.06] bg-ink-800 px-6 py-14 text-center">
              <CalendarClock size={26} className="mb-3 text-gold" />
              <p className="font-display text-[18px] font-semibold text-white">No matches here yet</p>
              <p className="mt-1 text-[13px] text-slate-400">Try another sport or league.</p>
            </div>
          )}
        </main>

        <aside aria-label="Bet slip and My bets" className="sticky top-24 mt-6 hidden h-[calc(100dvh-7.5rem)] w-[400px] shrink-0 self-start overflow-hidden rounded-2xl border border-white/[0.07] bg-ink-800 shadow-card xl:block">
          <RoyalSlip />
        </aside>
      </div>
      <MobileSlip />
    </div>
  )
}
