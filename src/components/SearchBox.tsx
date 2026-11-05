import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { navigate } from '@/router'
import { COMPETITIONS, MATCHES, TEAMS, matchName, playersFor, type Match } from '@/data/catalog'
import { marketsFor } from '@/lib/markets'
import { Crest } from '@/components/Crest'

interface Hit {
  key: string
  group: 'Teams' | 'Competitions' | 'Players' | 'Markets'
  title: string
  sub: string
  to: string
  teamId?: string
}

function buildIndex(): Hit[] {
  const hits: Hit[] = []
  for (const t of TEAMS) {
    const m = MATCHES.find((x) => x.home === t.id || x.away === t.id)
    if (m) hits.push({ key: `t-${t.id}`, group: 'Teams', title: t.name, sub: matchName(m), to: `/match/${m.id}`, teamId: t.id })
  }
  for (const c of COMPETITIONS) {
    hits.push({
      key: `c-${c.id}`,
      group: 'Competitions',
      title: c.name,
      sub: c.region,
      to: c.sport === 'football' ? `/football?c=${c.id}` : `/live?sport=${c.sport}`,
    })
  }
  const seen = new Set<string>()
  for (const m of MATCHES.filter((x) => x.sport === 'football')) {
    for (const side of [m.home, m.away]) {
      if (seen.has(side)) continue
      seen.add(side)
      for (const p of playersFor(side)) {
        hits.push({ key: `p-${side}-${p}`, group: 'Players', title: p, sub: `${TEAMS.find((t) => t.id === side)?.name} · ${matchName(m)}`, to: `/match/${m.id}?tab=scorers&q=${encodeURIComponent(p)}` })
      }
    }
  }
  const feat: Match = MATCHES[0]
  const names = new Set<string>()
  for (const mk of marketsFor(feat.id)) {
    const base = mk.name.replace(/\s[\d.]+$/, '')
    if (names.has(base)) continue
    names.add(base)
    hits.push({ key: `m-${mk.key}`, group: 'Markets', title: base, sub: matchName(feat), to: `/match/${feat.id}?q=${encodeURIComponent(base)}` })
  }
  return hits
}

let index: Hit[] | null = null

export function SearchBox({ className = '' }: { className?: string }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const results = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (term.length < 2) return []
    index ??= buildIndex()
    const groups: Hit['group'][] = ['Teams', 'Competitions', 'Players', 'Markets']
    return groups.flatMap((g) => index!.filter((h) => h.group === g && (h.title.toLowerCase().includes(term) || (g === 'Players' && h.sub.toLowerCase().includes(term)))).slice(0, 4))
  }, [q])

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const go = (to: string) => {
    setOpen(false)
    setQ('')
    navigate(to)
  }

  return (
    <div ref={ref} className={'relative ' + className}>
      <div className="flex h-12 items-center gap-2.5 rounded-full border border-white/[0.08] bg-ink-800/80 px-3.5 transition-colors focus-within:border-volt/50 lg:h-11">
        <Search size={18} className="shrink-0 text-slate-400" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false)
            if (e.key === 'Enter' && results[0]) go(results[0].to)
          }}
          placeholder="Search teams, players, competitions, markets"
          aria-label="Search teams, players, competitions and markets"
          className="h-full min-w-0 flex-1 bg-transparent text-[14px] font-medium text-white outline-none"
        />
        {q && (
          <button type="button" aria-label="Clear search" onClick={() => setQ('')} className="grid h-7 w-7 place-items-center rounded-full text-slate-400 hover:bg-white/5">
            <X size={15} />
          </button>
        )}
      </div>
      {open && q.trim().length >= 2 && (
        <div className="absolute inset-x-0 top-[calc(100%+8px)] z-50 max-h-[60vh] animate-floatIn overflow-y-auto rounded-2xl border border-white/10 bg-ink-850 p-2 shadow-2xl">
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-[13px] text-slate-400">No results for “{q.trim()}”.</p>
          ) : (
            (['Teams', 'Competitions', 'Players', 'Markets'] as const).map((g) => {
              const items = results.filter((r) => r.group === g)
              if (!items.length) return null
              return (
                <div key={g} className="mb-1">
                  <p className="label-caps px-3 pb-1 pt-2">{g}</p>
                  {items.map((r) => (
                    <button key={r.key} type="button" onClick={() => go(r.to)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-white/5">
                      {r.teamId && <Crest teamId={r.teamId} size={22} />}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-semibold text-white">{r.title}</span>
                        <span className="block truncate text-[12px] text-slate-400">{r.sub}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
