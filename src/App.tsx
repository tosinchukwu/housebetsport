import { Toaster } from 'sonner'
import { Link, useLocation } from '@/router'
import { Shell } from '@/components/Shell'
import HomePage from '@/pages/HomePage'
import LivePage from '@/pages/LivePage'
import FootballPage from '@/pages/FootballPage'
import MatchPage from '@/pages/MatchPage'
import BetsPage from '@/pages/BetsPage'

function NotFound() {
  return (
    <div className="surface mx-auto grid max-w-md place-items-center px-6 py-14 text-center">
      <h1 className="font-display text-[22px] font-bold text-white">Page not found</h1>
      <p className="mt-1.5 text-[13px] text-slate-400">That address does not exist in Housebets.</p>
      <Link to="/" className="mt-5 inline-flex h-11 items-center rounded-xl bg-volt px-5 text-[14px] font-bold text-ink-950">
        Back to home
      </Link>
    </div>
  )
}

function Routes() {
  const { pathname } = useLocation()
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/') return <HomePage />
  if (path === '/live') return <LivePage />
  if (path === '/football') return <FootballPage />
  if (path === '/bets') return <BetsPage />
  if (path.startsWith('/match/')) {
    const id = decodeURIComponent(path.slice('/match/'.length))
    return <MatchPage key={id} matchId={id} />
  }
  return <NotFound />
}

export default function App() {
  return (
    <Shell>
      <Routes />
      <Toaster theme="dark" position="top-center" />
    </Shell>
  )
}
