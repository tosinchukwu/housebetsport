import { CalendarClock, Radio } from 'lucide-react'
import { Link, navigate, useLocation } from '@/router'
import { COMPETITIONS, COMP_BY_ID, MATCHES, SPORTS, type SportId } from '@/data/catalog'
import { PageTitle, SectionHeader } from '@/components/Bits'
import { CompGroup } from '@/components/CompGroup'
import { MatchRow } from '@/components/MatchCards'
import { SearchBox } from '@/components/SearchBox'
import { SportNav } from '@/components/SportNav'

const live = MATCHES.filter((m) => m.status === 'live')

function setParams(sport: string | null, comp: string | null) {
  const q = new URLSearchParams()
  if (sport) q.set('sport', sport)
  if (comp) q.set('comp', comp)
  const s = q.toString()
  navigate('/live' + (s ? `?${s}` : ''), { replace: true })
}

export default function LivePage() {
  const { params } = useLocation()
  const sport = (params.get('sport') as SportId | null) ?? null
  const comp = params.get('comp')

  const inSport = sport ? live.filter((m) => m.sport === sport) : live
  const comps = Array.from(new Set(inSport.map((m) => m.comp)))
  const shown = comp ? inSport.filter((m) => m.comp === comp) : inSport
  const groups = Array.from(new Set(shown.map((m) => m.comp)))

  const sportName = sport ? SPORTS.find((s) => s.id === sport)?.name : null
  const soonList = MATCHES.filter((m) => m.status === 'upcoming' && (!sport || m.sport === sport))
    .sort((a, b) => (a.startsInMin ?? 0) - (b.startsInMin ?? 0))
    .slice(0, 5)
  const soonFallback = soonList.length ? soonList : MATCHES.filter((m) => m.status === 'upcoming').slice(0, 5)

  return (
    <div className="mx-auto max-w-[1040px]">
      <SearchBox className="mb-4 xl:hidden" />
      <SportNav />
      <PageTitle
        title={sportName ? `Live ${sportName}` : 'Live now'}
        sub={shown.length ? `${shown.length} ${shown.length === 1 ? 'match' : 'matches'} in play` : 'Nothing in play right now'}
        right={
          shown.length > 0 && (
            <span className="hidden items-center gap-2 rounded-full bg-live/10 px-3 py-1.5 text-[12px] font-bold text-live sm:inline-flex">
              <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-live" /> Updating live
            </span>
          )
        }
      />

      <div className="mb-3 flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0" role="tablist" aria-label="Filter by sport">
        <button type="button" role="tab" aria-selected={!sport} onClick={() => setParams(null, null)} className={'chip h-10 shrink-0 ' + (!sport ? 'chip-active' : '')}>
          <Radio size={14} /> All <span className="tabular opacity-70">{live.length}</span>
        </button>
        {SPORTS.map((s) => {
          const n = live.filter((m) => m.sport === s.id).length
          return (
            <button key={s.id} type="button" role="tab" aria-selected={sport === s.id} onClick={() => setParams(s.id, null)} className={'chip h-10 shrink-0 ' + (sport === s.id ? 'chip-active' : '')}>
              {s.name} <span className="tabular opacity-70">{n}</span>
            </button>
          )
        })}
      </div>

      {comps.length > 1 && (
        <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0" role="tablist" aria-label="Filter by competition">
          <button type="button" role="tab" aria-selected={!comp} onClick={() => setParams(sport, null)} className={'chip h-9 shrink-0 text-[12px] ' + (!comp ? 'chip-active' : '')}>
            All competitions
          </button>
          {comps.map((id) => (
            <button key={id} type="button" role="tab" aria-selected={comp === id} onClick={() => setParams(sport, id)} className={'chip h-9 shrink-0 text-[12px] ' + (comp === id ? 'chip-active' : '')}>
              {COMP_BY_ID[id].name}
              <span className="tabular opacity-70">{inSport.filter((m) => m.comp === id).length}</span>
            </button>
          ))}
        </div>
      )}

      {shown.length > 0 ? (
        <div className="space-y-4">
          {groups.map((id) => (
            <CompGroup key={id} compId={id} matches={shown.filter((m) => m.comp === id)} />
          ))}
        </div>
      ) : (
        <div className="surface mb-8 grid place-items-center px-6 py-12 text-center">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-white/[0.08] bg-ink-900 text-volt">
            <CalendarClock size={24} />
          </div>
          <h2 className="font-display text-[18px] font-bold text-white">Nothing live{sportName ? ` in ${sportName}` : ''} right now</h2>
          <p className="mt-1.5 max-w-sm text-[13px] text-slate-400">Matches appear here the moment they kick off. Here is what starts next.</p>
        </div>
      )}

      {shown.length === 0 && (
        <section aria-label="Starting soon">
          <SectionHeader title="Starting soon" sub={soonList.length ? undefined : 'Nothing scheduled here yet. Showing other sports.'} />
          <div className="space-y-2.5">
            {soonFallback.map((m) => (
              <MatchRow key={m.id} match={m} showComp />
            ))}
          </div>
        </section>
      )}

      {shown.length > 0 && (
        <p className="mt-6 text-center text-[12px] text-slate-500">
          Looking for pre-match? <Link to="/football" className="font-bold text-volt hover:underline">Browse football</Link>
        </p>
      )}
      <span className="hidden">{COMPETITIONS.length}</span>
    </div>
  )
}
