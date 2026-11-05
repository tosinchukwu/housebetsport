import { useState } from 'react'
import { Link, navigate, useLocation } from '@/router'
import { COMP_BY_ID, FOOTBALL_COMPS, MATCHES } from '@/data/catalog'
import { PageTitle } from '@/components/Bits'
import { CompGroup } from '@/components/CompGroup'
import { SearchBox } from '@/components/SearchBox'
import { SportNav } from '@/components/SportNav'
import { actions, useStore } from '@/lib/store'
import { Star } from 'lucide-react'

const football = MATCHES.filter((m) => m.sport === 'football')
const sorter = (a: (typeof football)[number], b: (typeof football)[number]) => {
  if (a.status !== b.status) return a.status === 'live' ? -1 : 1
  return (a.startsInMin ?? 0) - (b.startsInMin ?? 0)
}

export default function FootballPage() {
  const { params } = useLocation()
  const comp = params.get('c')
  const [tab, setTab] = useState<'soon' | 'all'>('soon')
  const followed = useStore((s) => s.followed)

  const pool = tab === 'soon' ? football.filter((m) => m.status === 'live' || (m.startsInMin ?? 0) <= 720) : football
  const scoped = comp ? pool.filter((m) => m.comp === comp) : pool
  const ids = FOOTBALL_COMPS.filter((id) => scoped.some((m) => m.comp === id))
  const setComp = (id: string | null) => navigate(id ? `/football?c=${id}` : '/football', { replace: true })

  return (
    <div className="mx-auto max-w-[1040px]">
      <SearchBox className="mb-4 lg:hidden" />
      <SportNav />
      <PageTitle title="Football" sub="Premier League, Champions League, LaLiga, Serie A and Bundesliga" />

      <div role="tablist" aria-label="Fixtures" className="mb-3 grid w-full max-w-sm grid-cols-2 rounded-xl border border-white/[0.07] bg-ink-850 p-1">
        {(
          [
            ['soon', 'Live & upcoming', pool.length && football.filter((m) => m.status === 'live' || (m.startsInMin ?? 0) <= 720).length],
            ['all', 'All football', football.length],
          ] as const
        ).map(([key, label, n]) => (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={'h-10 rounded-lg text-[13px] font-bold transition-colors ' + (tab === key ? 'bg-ink-700 text-white' : 'text-slate-400 hover:text-white')}
          >
            {label} <span className="tabular ml-1 opacity-70">{n}</span>
          </button>
        ))}
      </div>

      <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0" role="tablist" aria-label="Competitions">
        <button type="button" role="tab" aria-selected={!comp} onClick={() => setComp(null)} className={'chip h-10 shrink-0 ' + (!comp ? 'chip-active' : '')}>
          All
        </button>
        {FOOTBALL_COMPS.map((id) => {
          const on = followed.includes(`comp:${id}`)
          return (
            <button key={id} type="button" role="tab" aria-selected={comp === id} onClick={() => setComp(id)} className={'chip h-10 shrink-0 ' + (comp === id ? 'chip-active' : '')}>
              {on && <Star size={12} className="fill-gold text-gold" />}
              {COMP_BY_ID[id].name}
            </button>
          )
        })}
      </div>

      {ids.length === 0 ? (
        <div className="surface px-6 py-12 text-center text-[14px] text-slate-400">No fixtures in this view yet.</div>
      ) : (
        <div className="space-y-4">
          {ids.map((id) => (
            <CompGroup key={id} compId={id} matches={scoped.filter((m) => m.comp === id).sort(sorter)} />
          ))}
        </div>
      )}

      <p className="mt-6 text-center text-[12px] text-slate-500">
        Tap the star on a competition or a match to follow it.{' '}
        <button type="button" onClick={() => actions.toggleFollow('comp:pl')} className="hidden" aria-hidden tabIndex={-1} />
        <Link to="/" className="font-bold text-aqua hover:underline">
          See your favourites
        </Link>
      </p>
    </div>
  )
}
