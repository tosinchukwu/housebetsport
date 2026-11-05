import { actions, useStore } from '@/lib/store'
import { SlipView } from '@/components/SlipView'
import { MyBets } from '@/components/MyBets'

/** Bet slip and My bets in one panel. Used in the desktop side panel, the phone sheet and the /bets page. */
export function BetsPanel() {
  const tab = useStore((s) => s.panelTab)
  const slipCount = useStore((s) => s.slip.length)
  const openCount = useStore((s) => s.bets.filter((b) => b.status === 'open').length)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div role="tablist" className="mx-3 mt-3 flex shrink-0 gap-1 rounded-full border border-white/[0.06] bg-ink-950/70 p-1">
        {(
          [
            ['slip', 'Bet slip', slipCount],
            ['bets', 'My bets', openCount],
          ] as const
        ).map(([key, label, count]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            type="button"
            onClick={() => actions.setPanelTab(key)}
            className={
              'relative flex h-10 flex-1 items-center justify-center gap-2 rounded-full text-[14px] font-bold transition-colors ' +
              (tab === key ? 'bg-ink-700 text-white' : 'text-slate-400 hover:text-slate-200')
            }
          >
            {label}
            <span
              className={
                'tabular grid h-5 min-w-[20px] place-items-center rounded-full px-1.5 text-[11px] font-extrabold ' +
                (tab === key ? 'bg-volt text-ink-950' : 'bg-white/10 text-slate-300')
              }
            >
              {count}
            </span>
          </button>
        ))}
      </div>
      {tab === 'slip' ? <SlipView /> : <MyBets />}
    </div>
  )
}
