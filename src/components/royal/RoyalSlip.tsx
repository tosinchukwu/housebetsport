import { useState } from 'react'
import { actions, useStore } from '@/lib/store'
import { SlipView } from '@/components/SlipView'
import { MyBets } from '@/components/MyBets'
import { AccaView } from '@/components/royal/AccaView'

/** Bet slip (singles or accumulator) and My bets, using the existing betting logic. */
export function RoyalSlip() {
  const tab = useStore((s) => s.panelTab)
  const slipCount = useStore((s) => s.slip.length)
  const openCount = useStore((s) => s.bets.filter((b) => b.status === 'open').length)
  const [mode, setMode] = useState<'singles' | 'acca'>('singles')

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div role="tablist" className="flex shrink-0 border-b border-white/[0.07] px-2">
        {(
          [
            ['slip', 'Bet slip', slipCount],
            ['bets', 'My bets', openCount],
          ] as const
        ).map(([key, label, count]) => (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={tab === key}
            onClick={() => actions.setPanelTab(key)}
            className={'relative flex h-12 flex-1 items-center justify-center gap-2 text-[14px] font-bold transition-colors ' + (tab === key ? 'text-white' : 'text-slate-400 hover:text-white')}
          >
            {label}
            <span className={'tabular grid h-5 min-w-[20px] place-items-center rounded-full px-1.5 text-[11px] font-extrabold ' + (tab === key ? 'bg-volt text-ink-950' : 'bg-white/10 text-slate-300')}>{count}</span>
            {tab === key && <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-gold" />}
          </button>
        ))}
      </div>

      {tab === 'slip' ? (
        <>
          <div role="radiogroup" aria-label="Bet type" className="mx-4 mt-3 grid shrink-0 grid-cols-2 rounded-xl bg-ink-950 p-1">
            {(
              [
                ['singles', 'Singles'],
                ['acca', 'Accumulator'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={mode === key}
                onClick={() => setMode(key)}
                className={'h-9 rounded-lg text-[13px] font-bold transition-colors ' + (mode === key ? 'bg-ink-700 text-white' : 'text-slate-400 hover:text-white')}
              >
                {label}
              </button>
            ))}
          </div>
          {mode === 'singles' ? <SlipView /> : <AccaView />}
        </>
      ) : (
        <MyBets />
      )}
    </div>
  )
}
