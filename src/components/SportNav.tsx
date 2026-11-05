import { CircleDot, Disc, Dribbble, Home, Radio, Target } from 'lucide-react'
import { Link, useLocation } from '@/router'
import { MATCHES } from '@/data/catalog'

const liveCount = MATCHES.filter((m) => m.status === 'live').length

const ITEMS = [
  { to: '/', label: 'Home', icon: Home, id: 'home' },
  { to: '/live', label: 'Live', icon: Radio, id: 'live', count: liveCount },
  { to: '/football', label: 'Football', icon: CircleDot, id: 'football' },
  { to: '/live?sport=tennis', label: 'Tennis', icon: Disc, id: 'tennis' },
  { to: '/live?sport=basketball', label: 'Basketball', icon: Dribbble, id: 'basketball' },
  { to: '/live?sport=cricket', label: 'Cricket', icon: Target, id: 'cricket' },
]

/** Phone sports nav. Desktop uses the left rail instead. */
export function SportNav() {
  const { pathname, params } = useLocation()
  const sport = params.get('sport')
  const active = (id: string) => {
    if (id === 'home') return pathname === '/'
    if (id === 'live') return pathname === '/live' && !sport
    if (id === 'football') return pathname === '/football'
    return pathname === '/live' && sport === id
  }
  return (
    <nav aria-label="Sports" className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 lg:hidden">
      {ITEMS.map((it) => (
        <Link
          key={it.id}
          to={it.to}
          aria-current={active(it.id) ? 'page' : undefined}
          className={'chip h-11 shrink-0 px-4 ' + (active(it.id) ? 'chip-active' : '')}
        >
          <it.icon size={16} className={it.id === 'live' && !active(it.id) ? 'text-live' : ''} />
          {it.label}
          {it.count !== undefined && <span className="tabular text-[12px] opacity-80">{it.count}</span>}
        </Link>
      ))}
    </nav>
  )
}
