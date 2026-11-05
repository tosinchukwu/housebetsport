import { COMP_BY_ID, type Match } from '@/data/catalog'
import { CompStar } from '@/components/Follow'
import { MatchRow } from '@/components/MatchCards'

export function CompBadge({ compId, size = 36 }: { compId: string; size?: number }) {
  const c = COMP_BY_ID[compId]
  return (
    <span
      className="grid shrink-0 place-items-center rounded-lg font-display text-[11px] font-extrabold"
      style={{ width: size * 1.15, height: size, background: `${c.accent}22`, color: c.accent }}
    >
      {c.short}
    </span>
  )
}

export function CompGroup({ compId, matches, follow = true }: { compId: string; matches: Match[]; follow?: boolean }) {
  const c = COMP_BY_ID[compId]
  const live = matches.filter((m) => m.status === 'live').length
  return (
    <section aria-label={c.name} className="surface overflow-hidden">
      <header className="flex items-center gap-3 border-b border-white/[0.06] px-3.5 py-2.5 md:px-4">
        <CompBadge compId={compId} size={32} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-[15px] font-bold text-white">{c.name}</h3>
          <p className="text-[12px] text-slate-400">
            {c.region}
            {live > 0 && <span className="ml-2 font-bold text-live">{live} live</span>}
          </p>
        </div>
        {follow && c.sport === 'football' && <CompStar compId={compId} label={c.name} />}
        <span className="tabular rounded-full bg-white/[0.06] px-2.5 py-1 text-[12px] font-bold text-slate-300">{matches.length}</span>
      </header>
      <div className="space-y-2 p-2.5 md:p-3">
        {matches.map((m) => (
          <MatchRow key={m.id} match={m} />
        ))}
      </div>
    </section>
  )
}
