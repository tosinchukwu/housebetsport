import { useEffect, useRef, useState } from 'react'
import { Star } from 'lucide-react'
import { actions, useStore } from '@/lib/store'
import { teamLabel } from '@/lib/markets'
import { Crest } from '@/components/Crest'
import type { Match } from '@/data/catalog'

export function CompStar({ compId, label }: { compId: string; label: string }) {
  const on = useStore((s) => s.followed.includes(`comp:${compId}`))
  return (
    <button
      type="button"
      onClick={() => actions.toggleFollow(`comp:${compId}`)}
      aria-pressed={on}
      aria-label={on ? `Unfollow ${label}` : `Follow ${label}`}
      className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-white/5"
    >
      <Star size={17} className={on ? 'fill-gold text-gold' : 'text-slate-500'} />
    </button>
  )
}

export function TeamFollowButton({ teamId, className = '' }: { teamId: string; className?: string }) {
  const on = useStore((s) => s.followed.includes(`team:${teamId}`))
  return (
    <button
      type="button"
      onClick={() => actions.toggleFollow(`team:${teamId}`)}
      aria-pressed={on}
      className={
        'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12px] font-bold transition-colors ' +
        (on ? 'border-gold/40 bg-gold/10 text-gold' : 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07]') +
        ' ' +
        className
      }
    >
      <Star size={13} className={on ? 'fill-gold' : ''} />
      {on ? 'Following' : 'Follow'}
    </button>
  )
}

/** Star on a match row: opens a small menu to follow either side. */
export function MatchFollow({ match }: { match: Match }) {
  const followed = useStore((s) => s.followed)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const any = followed.includes(`team:${match.home}`) || followed.includes(`team:${match.away}`)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Follow a team"
        onClick={() => setOpen((v) => !v)}
        className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-white/5"
      >
        <Star size={17} className={any ? 'fill-gold text-gold' : 'text-slate-500'} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-10 z-30 w-52 animate-floatIn rounded-xl border border-white/10 bg-ink-800 p-1.5 shadow-2xl">
          {[match.home, match.away].map((id) => {
            const on = followed.includes(`team:${id}`)
            return (
              <button
                key={id}
                role="menuitem"
                type="button"
                onClick={() => {
                  actions.toggleFollow(`team:${id}`)
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-semibold hover:bg-white/5"
              >
                <Crest teamId={id} size={20} />
                <span className="flex-1 truncate">{teamLabel(id)}</span>
                <Star size={14} className={on ? 'fill-gold text-gold' : 'text-slate-500'} />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
