import type { ReactNode } from 'react'
import { COMP_BY_ID, TEAM_BY_ID, type Match } from '@/data/catalog'
import { clockFull, startLabel, useSeconds } from '@/lib/live'
import { teamLabel } from '@/lib/markets'
import { Crest } from '@/components/Crest'
import { LiveBadge } from '@/components/MatchCards'
import { CompStar, TeamFollowButton } from '@/components/Follow'

interface Props {
  match: Match
  /** "page" shows follow controls; "hero" is the home feature card. */
  variant?: 'page' | 'hero'
  children?: ReactNode
}

export function Scoreboard({ match, variant = 'page', children }: Props) {
  const secs = useSeconds()
  const comp = COMP_BY_ID[match.comp]
  const live = match.status === 'live'
  const football = match.sport === 'football'
  const start = !live ? startLabel(match.startsInMin ?? 0, secs) : null
  const name = (id: string) => (football ? teamLabel(id) : TEAM_BY_ID[id].name)

  return (
    <section
      aria-label="Scoreboard"
      className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-ink-800 via-ink-850 to-ink-900 p-4 shadow-card md:p-6"
    >
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-aqua/[0.07] blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-16 h-64 w-64 rounded-full bg-live/[0.05] blur-3xl" />
      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <p className="label-caps flex items-center gap-2">
            {variant === 'hero' && <span className="rounded bg-aqua/10 px-1.5 py-0.5 text-aqua">Featured</span>}
            <span className="truncate">{comp.name}</span>
          </p>
          {football && <CompStar compId={comp.id} label={comp.name} />}
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2 md:gap-6">
          <div className="flex min-w-0 flex-col items-center gap-2.5 text-center">
            <div className="md:hidden">
              <Crest teamId={match.home} size={52} />
            </div>
            <div className="hidden md:block">
              <Crest teamId={match.home} size={72} />
            </div>
            <p className="line-clamp-2 min-h-[2.5em] text-[14px] font-bold leading-tight text-white md:text-[17px]">{name(match.home)}</p>
            {variant === 'page' && football && <TeamFollowButton teamId={match.home} />}
          </div>

          <div className="flex min-w-[120px] flex-col items-center gap-2.5 pt-2 md:min-w-[200px]">
            {live ? (
              <>
                <div className="flex items-center gap-2 md:gap-3">
                  <span className="tabular grid h-14 w-12 place-items-center rounded-xl bg-ink-950/70 font-display text-[32px] font-extrabold text-white md:h-[72px] md:w-[60px] md:text-[42px]">
                    {match.score[0]}
                  </span>
                  <span className="text-slate-500">–</span>
                  <span className="tabular grid h-14 w-12 place-items-center rounded-xl bg-ink-950/70 font-display text-[32px] font-extrabold text-white md:h-[72px] md:w-[60px] md:text-[42px]">
                    {match.score[1]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <LiveBadge />
                  <span className="tabular font-display text-[14px] font-bold text-live">{clockFull(match, secs)}</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-1 pt-3">
                <span className="tabular font-display text-[30px] font-extrabold leading-none text-white md:text-[40px]">{start?.primary}</span>
                <span className="text-[13px] font-semibold text-slate-400">{start?.secondary}</span>
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-col items-center gap-2.5 text-center">
            <div className="md:hidden">
              <Crest teamId={match.away} size={52} />
            </div>
            <div className="hidden md:block">
              <Crest teamId={match.away} size={72} />
            </div>
            <p className="line-clamp-2 min-h-[2.5em] text-[14px] font-bold leading-tight text-white md:text-[17px]">{name(match.away)}</p>
            {variant === 'page' && football && <TeamFollowButton teamId={match.away} />}
          </div>
        </div>
        {children && <div className="mt-5">{children}</div>}
      </div>
    </section>
  )
}
