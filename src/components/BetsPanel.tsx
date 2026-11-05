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
      <div role="tablist" className="flex shrink-0 gap-1 border-b border-white/[0.07] px-3 pt-3">
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
              'relative flex h-11 flex-1 items-center justify-center gap-2 rounded-t-xl text-[14px] font-bold transition-colors ' +
              (tab === key ? 'text-white' : 'text-slate-400 hover:text-slate-200')
            }
          >
            {label}
            <span
              className={
                'tabular grid h-5 min-w-[20px] place-items-center rounded-full px-1.5 text-[11px] font-extrabold ' +
                (tab === key ? 'bg-aqua text-ink-950' : 'bg-white/10 text-slate-300')
              }
            >
              {count}
            </span>
            {tab === key && <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-aqua" />}
          </button>
        ))}
      </div>
      {tab === 'slip' ? <SlipView /> : <MyBets />}
    </div>
  )
}
