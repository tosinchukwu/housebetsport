import { useSyncExternalStore } from 'react'
import { hash, type Match } from '@/data/catalog'

/** Simulated live clock. Everything on screen that moves is driven from here. */

export const TICK_SECONDS = 4
const T0 = Date.now()
const OFFSET_TICKS = 7

let secs = 0
const listeners = new Set<() => void>()

if (typeof window !== 'undefined') {
  setInterval(() => {
    secs = Math.floor((Date.now() - T0) / 1000)
    listeners.forEach((l) => l())
  }, 1000)
}

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export const currentSeconds = () => secs
export const currentTick = () => Math.floor(secs / TICK_SECONDS) + OFFSET_TICKS

export const useSeconds = () => useSyncExternalStore(subscribe, () => secs)
export const useTick = () => useSyncExternalStore(subscribe, currentTick)

/* --------------------------------- prices --------------------------------- */

function drift(id: string, tick: number, live: boolean): number {
  const h = hash(id)
  const p1 = (h % 628) / 100
  const p2 = ((h >> 8) % 628) / 100
  const amp = live ? 0.035 : 0.008
  return 1 + amp * (0.6 * Math.sin(tick * 0.37 + p1) + 0.4 * Math.sin(tick * 0.91 + p2))
}

export function priceAt(id: string, base: number, live: boolean, tick: number, bump = 1): number {
  return Math.max(1.01, Math.round(base * drift(id, tick, live) * bump * 100) / 100)
}

export function autoSuspended(match: Match, marketKey: string, tick: number): boolean {
  if (match.status !== 'live') return false
  if (match.flaky) return tick % 10 < 4
  return hash(match.id + marketKey) % 31 === tick % 31
}

/* --------------------------------- clocks --------------------------------- */

const pad = (n: number) => String(n).padStart(2, '0')

/** "52:14" for scoreboards. */
export function clockFull(match: Match, seconds: number): string {
  if (match.sport !== 'football') return match.detail ?? ''
  const total = (match.minute ?? 0) * 60 + seconds
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`
}

/** "52'" for list rows. */
export function clockShort(match: Match, seconds: number): string {
  if (match.sport !== 'football') return match.detail?.split(' · ')[0] ?? 'Live'
  const total = (match.minute ?? 0) * 60 + seconds
  return `${Math.floor(total / 60)}'`
}

export function startLabel(startsInMin: number, seconds: number): { primary: string; secondary: string } {
  const remaining = startsInMin - seconds / 60
  if (remaining <= 1) return { primary: 'Starting', secondary: 'now' }
  if (remaining < 90) return { primary: `${Math.round(remaining)} min`, secondary: 'to kick-off' }
  const at = new Date(T0 + startsInMin * 60000)
  const time = at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  const today = new Date(T0)
  const sameDay = at.toDateString() === today.toDateString()
  const tomorrow = new Date(T0 + 86400000).toDateString() === at.toDateString()
  const day = sameDay ? 'Today' : tomorrow ? 'Tomorrow' : at.toLocaleDateString([], { weekday: 'short' })
  return { primary: time, secondary: day }
}
