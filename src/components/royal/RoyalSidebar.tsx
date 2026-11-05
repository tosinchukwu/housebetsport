import { CircleDot, Disc, Dribbble, Layers, Target, type LucideIcon } from 'lucide-react'
import { COMPETITIONS, MATCHES, SPORTS, type SportId } from '@/data/catalog'

const ICONS: Record<SportId, LucideIcon> = { football: CircleDot, tennis: Disc, basketball: Dribbble, cricket: Target }

interface Props {
  sport: SportId | null
  comp: string | null
  onSport: (s: SportId | null) => void
  onComp: (c: string | null) => void
}

function Row({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        'flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[14px] font-semibold transition-colors ' +
        (active ? 'bg-volt/10 text-white shadow-[inset_2px_0_0_0_rgb(var(--volt))]' : 'text-slate-300 hover:bg-white/[0.04] hover:text-white')
      }
    >
      {children}
    </button>
  )
}

/** Sports categories and popular leagues. Selecting one filters the match list. */
export function RoyalSidebar({ sport, comp, onSport, onComp }: Props) {
  const leagues = COMPETITIONS.filter((c) => !sport || c.sport === sport)
  const count = (pred: (m: (typeof MATCHES)[number]) => boolean) => MATCHES.filter(pred).length

  return (
    <nav aria-label="Sports and leagues" className="sticky top-24 hidden max-h-[calc(100dvh-7rem)] w-60 shrink-0 self-start overflow-y-auto pb-6 lg:block">
      <p className="label-caps mb-2 px-3">Sports</p>
      <ul className="space-y-0.5">
        <li>
          <Row active={!sport} onClick={() => onSport(null)}>
            <Layers size={18} className={!sport ? 'text-volt' : 'text-slate-400'} />
            <span className="flex-1">All sports</span>
            <span className="tabular text-[12px] text-slate-500">{MATCHES.length}</span>
          </Row>
        </li>
        {SPORTS.map((s) => {
          const Icon = ICONS[s.id]
          const live = count((m) => m.sport === s.id && m.status === 'live')
          return (
            <li key={s.id}>
              <Row active={sport === s.id} onClick={() => onSport(s.id)}>
                <Icon size={18} className={sport === s.id ? 'text-volt' : 'text-slate-400'} />
                <span className="flex-1">{s.name}</span>
                {live > 0 && <span className="tabular rounded-full bg-live/15 px-2 py-0.5 text-[11px] font-bold text-live">{live} live</span>}
              </Row>
            </li>
          )
        })}
      </ul>

      <p className="label-caps mb-2 mt-7 px-3">Popular leagues</p>
      <ul className="space-y-0.5">
        {leagues.map((c) => (
          <li key={c.id}>
            <Row active={comp === c.id} onClick={() => onComp(comp === c.id ? null : c.id)}>
              <span className="grid h-7 w-9 shrink-0 place-items-center rounded-lg bg-ink-700 text-[10px] font-extrabold tracking-wide text-gold">{c.short}</span>
              <span className="min-w-0 flex-1 truncate">{c.name}</span>
              <span className="tabular text-[12px] text-slate-500">{count((m) => m.comp === c.id)}</span>
            </Row>
          </li>
        ))}
      </ul>
    </nav>
  )
}
