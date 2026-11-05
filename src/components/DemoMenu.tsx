import { useEffect, useRef, useState } from 'react'
import { FlaskConical, Lock, RotateCcw, TrendingDown, TrendingUp, ZapOff } from 'lucide-react'
import { actions, useStore } from '@/lib/store'

/** Lets reviewers trigger the bet slip edge states on demand. */
export function DemoMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const slipCount = useStore((s) => s.slip.length)
  const failNext = useStore((s) => s.failNext)

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const items = [
    { icon: TrendingUp, label: 'Odds go up on my slip', run: () => actions.demoMoveOdds(1), needsSlip: true },
    { icon: TrendingDown, label: 'Odds go down on my slip', run: () => actions.demoMoveOdds(-1), needsSlip: true },
    { icon: Lock, label: 'Suspend my slip markets', run: () => actions.demoSuspendSlip(), needsSlip: true },
    { icon: ZapOff, label: failNext ? 'Next bet will fail (armed)' : 'Make the next bet fail', run: () => actions.demoFailNext(), needsSlip: false },
    { icon: RotateCcw, label: 'Reset prototype', run: () => actions.demoReset(), needsSlip: false },
  ]

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Prototype states"
        className={'grid h-10 w-10 place-items-center rounded-xl border transition-colors ' + (open ? 'border-volt/50 bg-volt/10 text-volt' : 'border-white/[0.08] bg-ink-850 text-slate-300 hover:bg-ink-800')}
      >
        <FlaskConical size={18} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-12 z-50 w-72 animate-floatIn rounded-2xl border border-white/10 bg-ink-850 p-2 shadow-2xl">
          <p className="label-caps px-3 pb-1 pt-2">Prototype states</p>
          <p className="px-3 pb-2 text-[12px] text-slate-400">Add a selection to the slip, then trigger a state to see how it behaves.</p>
          {items.map((it) => {
            const disabled = it.needsSlip && slipCount === 0
            return (
              <button
                key={it.label}
                role="menuitem"
                type="button"
                disabled={disabled}
                onClick={() => {
                  it.run()
                  setOpen(false)
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-semibold text-slate-100 hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <it.icon size={16} className="text-volt" />
                {it.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
