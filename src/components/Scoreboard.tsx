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

function PitchLines() {
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" fill="none" stroke="#fff" strokeWidth="1.5">
      <circle cx="200" cy="100" r="46" />
      <line x1="200" y1="0" x2="200" y2="200" />
      <rect x="-2" y="52" width="52" height="96" />
      <rect x="350" y="52" width="52" height="96" />
    </svg>
  )
}

export function Scoreboard({ match, variant = 'page', children }: Props) {
  const secs = useSeconds()
  const comp = COMP_BY_ID[match.comp]
  const live = match.status === 'live'
  const football = match.sport === 'football'
  const start = !live ? startLabel(match.startsInMin ?? 0, secs) : null
  const name = (id: string) => (football ? teamLabel(id) : TEAM_BY_ID[id].name)
  const home = TEAM_BY_ID[match.home]
  const away = TEAM_BY_ID[match.away]

  return (
    <section aria-label="Scoreboard" className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-ink-900 p-4 shadow-float md:p-6">
      <div aria-hidden className="pointer-events-none absolute -left-20 top-0 h-full w-2/3 opacity-30 blur-3xl" style={{ background: `radial-gradient(closest-side, ${home.c1}, transparent)` }} />
      <div aria-hidden className="pointer-events-none absolute -right-20 top-0 h-full w-2/3 opacity-30 blur-3xl" style={{ background: `radial-gradient(closest-side, ${away.c1}, transparent)` }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink-950/10 via-ink-950/50 to-ink-950/80" />
      <PitchLines />
      <div className="relative">
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="label-caps flex min-w-0 items-center gap-2">
            {variant === 'hero' && <span className="rounded-full bg-volt px-2 py-0.5 text-[10px] font-extrabold text-ink-950">Featured</span>}
            <span className="truncate text-slate-300">{comp.name}</span>
          </p>
          {football && <CompStar compId={comp.id} label={comp.name} />}
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2 md:gap-6">
          <div className="flex min-w-0 flex-col items-center gap-2.5 text-center">
            <div className="md:hidden">
              <Crest teamId={match.home} size={52} />
            </div>
            <div className="hidden md:block">
              <Crest teamId={match.home} size={76} />
            </div>
            <p className="line-clamp-2 min-h-[2.5em] text-[14px] font-bold leading-tight text-white md:text-[17px]">{name(match.home)}</p>
            {variant === 'page' && football && <TeamFollowButton teamId={match.home} />}
          </div>

          <div className="flex min-w-[120px] flex-col items-center gap-3 pt-1 md:min-w-[210px]">
            {live ? (
              <>
                <div className="flex items-center gap-1.5 rounded-3xl border border-white/10 bg-ink-950/70 px-3 py-2 backdrop-blur md:gap-2.5 md:px-5">
                  <span className="tabular font-display text-[40px] font-bold leading-none text-white md:text-[56px]">{match.score[0]}</span>
                  <span className="font-display text-[24px] font-bold text-volt md:text-[32px]">:</span>
                  <span className="tabular font-display text-[40px] font-bold leading-none text-white md:text-[56px]">{match.score[1]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <LiveBadge />
                  <span className="tabular font-display text-[14px] font-bold text-live">{clockFull(match, secs)}</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-1 rounded-3xl border border-white/10 bg-ink-950/70 px-5 py-3 backdrop-blur">
                <span className="tabular font-display text-[28px] font-bold leading-none text-volt md:text-[38px]">{start?.primary}</span>
                <span className="text-[13px] font-semibold text-slate-400">{start?.secondary}</span>
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-col items-center gap-2.5 text-center">
            <div className="md:hidden">
              <Crest teamId={match.away} size={52} />
            </div>
            <div className="hidden md:block">
              <Crest teamId={match.away} size={76} />
            </div>
            <p className="line-clamp-2 min-h-[2.5em] text-[14px] font-bold leading-tight text-white md:text-[17px]">{name(match.away)}</p>
            {variant === 'page' && football && <TeamFollowButton teamId={match.away} />}
          </div>
        </div>
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  )
}
