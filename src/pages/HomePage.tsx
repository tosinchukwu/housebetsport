import { ChevronRight, Star, X } from 'lucide-react'
import { Link } from '@/router'
import { COMPETITIONS, COMP_BY_ID, FEATURED_MATCH_ID, FOOTBALL_COMPS, MATCHES, MATCH_BY_ID, TEAM_BY_ID } from '@/data/catalog'
import { marketsFor } from '@/lib/markets'
import { actions, useStore } from '@/lib/store'
import { Carousel, SectionHeader } from '@/components/Bits'
import { Crest } from '@/components/Crest'
import { MatchCard, MatchRow, ResultOdds } from '@/components/MatchCards'
import { Scoreboard } from '@/components/Scoreboard'
import { SearchBox } from '@/components/SearchBox'
import { SportNav } from '@/components/SportNav'

const liveMatches = MATCHES.filter((m) => m.status === 'live')
const soon = MATCHES.filter((m) => m.status === 'upcoming')
  .sort((a, b) => (a.startsInMin ?? 0) - (b.startsInMin ?? 0))
  .slice(0, 6)

function Favourites() {
  const followed = useStore((s) => s.followed)
  if (!followed.length) return null
  return (
    <section aria-label="Favourites" className="mb-7">
      <SectionHeader title="Favourites" />
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0">
        {followed.map((key) => {
          const [kind, id] = key.split(':')
          const team = kind === 'team' ? TEAM_BY_ID[id] : undefined
          const comp = kind === 'comp' ? COMP_BY_ID[id] : undefined
          if (!team && !comp) return null
          return (
            <span key={key} className="chip h-11 shrink-0 gap-2 pl-3 pr-1.5 text-white">
              {team ? <Crest teamId={id} size={20} /> : <Star size={15} className="fill-gold text-gold" />}
              {team?.name ?? comp?.name}
              <button type="button" aria-label={`Unfollow ${team?.name ?? comp?.name}`} onClick={() => actions.toggleFollow(key)} className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white">
                <X size={14} />
              </button>
            </span>
          )
        })}
      </div>
    </section>
  )
}

function YourMatches() {
  const followed = useStore((s) => s.followed)
  const mine = MATCHES.filter((m) => followed.includes(`comp:${m.comp}`) || followed.includes(`team:${m.home}`) || followed.includes(`team:${m.away}`)).slice(0, 6)
  if (!mine.length) return null
  return (
    <section aria-label="Your matches" className="mb-8">
      <SectionHeader title="Your matches" sub={`${mine.length} from the teams and competitions you follow`} />
      <Carousel>
        {mine.map((m) => (
          <MatchCard key={m.id} match={m} />
        ))}
      </Carousel>
    </section>
  )
}

export default function HomePage() {
  const featured = MATCH_BY_ID[FEATURED_MATCH_ID]
  const marketTotal = marketsFor(featured.id).length

  return (
    <div className="mx-auto max-w-[1040px]">
      <SearchBox className="mb-4 lg:hidden" />
      <SportNav />

      <div className="mb-8">
        <Scoreboard match={featured} variant="hero">
          <ResultOdds match={featured} />
          <Link to={`/match/${featured.id}`} className="mt-4 flex h-11 items-center justify-center gap-1 rounded-xl bg-white/[0.05] text-[13px] font-bold text-white hover:bg-white/10">
            All {marketTotal} markets <ChevronRight size={15} />
          </Link>
        </Scoreboard>
      </div>

      <Favourites />
      <YourMatches />

      <section aria-label="Live now" className="mb-8">
        <SectionHeader title="Live now" sub={`${liveMatches.length} matches in play`} to="/live" />
        <Carousel>
          {liveMatches.slice(0, 8).map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </Carousel>
      </section>

      <section aria-label="Starting soon" className="mb-8">
        <SectionHeader title="Starting soon" sub="Kick-offs in the next day" />
        <div className="space-y-2.5">
          {soon.map((m) => (
            <MatchRow key={m.id} match={m} showComp />
          ))}
        </div>
      </section>

      <section aria-label="Top competitions" className="mb-6">
        <SectionHeader title="Top competitions" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {FOOTBALL_COMPS.map((id) => {
            const c = COMP_BY_ID[id]
            const all = MATCHES.filter((m) => m.comp === id)
            const live = all.filter((m) => m.status === 'live').length
            return (
              <Link
                key={id}
                to={`/football?c=${id}`}
                className="group surface relative overflow-hidden p-4 transition-all hover:-translate-y-0.5 hover:border-white/15"
              >
                <span aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl" style={{ background: `${c.accent}33` }} />
                <span className="relative grid h-11 w-11 place-items-center rounded-xl font-display text-[13px] font-extrabold" style={{ background: `${c.accent}22`, color: c.accent }}>
                  {c.short}
                </span>
                <p className="relative mt-3 truncate font-display text-[15px] font-bold text-white">{c.name}</p>
                <p className="relative mt-0.5 text-[12px] text-slate-400">
                  {c.region} · {all.length} matches
                </p>
                <p className="relative mt-2 h-4 text-[12px] font-bold text-live">{live > 0 ? `${live} live` : ''}</p>
              </Link>
            )
          })}
        </div>
        <p className="mt-3 text-[12px] text-slate-500">More: {COMPETITIONS.filter((c) => c.sport !== 'football').map((c) => c.name).join(' · ')}</p>
      </section>
    </div>
  )
}
