import { PageTitle } from '@/components/Bits'
import { BetsPanel } from '@/components/BetsPanel'

/** Full-page bet slip and My bets (the phone bottom nav and left rail link here). */
export default function BetsPage() {
  return (
    <div className="mx-auto max-w-[640px]">
      <PageTitle title="Bet slip & My bets" sub="Set stakes, place singles and track open bets" />
      <div className="surface flex h-[calc(100dvh-15rem)] min-h-[460px] flex-col overflow-hidden">
        <BetsPanel />
      </div>
    </div>
  )
}
