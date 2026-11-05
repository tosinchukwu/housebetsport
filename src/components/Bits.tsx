import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { Link } from '@/router'

export function SectionHeader({ title, sub, to, action }: { title: string; sub?: string; to?: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 font-display text-[18px] font-bold tracking-tight text-white md:text-[20px]"><span aria-hidden className="h-5 w-1.5 rounded-full bg-volt" />{title}</h2>
        {sub && <p className="mt-0.5 text-[12px] font-medium text-slate-400">{sub}</p>}
      </div>
      {action}
      {to && (
        <Link to={to} className="flex h-9 shrink-0 items-center gap-0.5 rounded-full border border-volt/25 px-3 text-[13px] font-bold text-volt hover:bg-volt/10">
          See all <ChevronRight size={15} />
        </Link>
      )}
    </div>
  )
}

export function Carousel({ children }: { children: ReactNode }) {
  return (
    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 lg:-mx-0 lg:px-0">{children}</div>
  )
}

export function PageTitle({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-[26px] font-extrabold tracking-[-0.03em] text-white md:text-[34px]">{title}</h1>
        {sub && <p className="mt-1 text-[13px] font-medium text-slate-400 md:text-[14px]">{sub}</p>}
      </div>
      {right}
    </div>
  )
}
