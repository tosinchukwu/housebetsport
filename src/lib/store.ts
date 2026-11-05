import { useSyncExternalStore } from 'react'
import { matchName } from '@/data/catalog'
import { findOutcome } from '@/lib/markets'
import { autoSuspended, currentTick, priceAt } from '@/lib/live'
import { parseStake } from '@/lib/format'

export const MIN_STAKE = 1
export const MAX_STAKE = 1000
export const START_BALANCE = 1250

export interface SlipItem {
  id: string
  /** Last price the player has seen and accepted. */
  odds: number
  stake: string
  state: 'idle' | 'placing' | 'failed'
  error?: string
}

export interface Bet {
  id: string
  ref: string
  outcomeId?: string
  matchName: string
  marketName: string
  label: string
  odds: number
  stake: number
  placedAt: number
  status: 'open' | 'won' | 'lost' | 'cashed'
  payout?: number
  settledAt?: number
}

export interface State {
  slip: SlipItem[]
  bets: Bet[]
  balance: number
  followed: string[]
  receipt: Bet[]
  panelTab: 'slip' | 'bets'
  betsTab: 'open' | 'settled'
  sheetOpen: boolean
  /** Prototype controls. */
  bump: Record<string, number>
  suspended: string[]
  failNext: boolean
}

const ago = (min: number) => Date.now() - min * 60000

function seedBets(): Bet[] {
  return [
    { id: 'b1', ref: 'HB-4Q7M2K', outcomeId: 'ars-bha|result|h', matchName: 'Arsenal v Brighton & Hove Albion', marketName: 'Match result', label: 'Arsenal', odds: 1.85, stake: 50, placedAt: ago(96), status: 'open' },
    { id: 'b2', ref: 'HB-9XD1TA', outcomeId: 'int-mil|total_main|o', matchName: 'Inter v AC Milan', marketName: 'Total goals', label: 'Over (live line)', odds: 2.1, stake: 25, placedAt: ago(31), status: 'open' },
    { id: 'b3', ref: 'HB-7LC3WN', outcomeId: 'rma-bay|btts|y', matchName: 'Real Madrid v Bayern Munich', marketName: 'Both teams to score', label: 'Yes', odds: 1.72, stake: 100, placedAt: ago(240), status: 'open' },
    { id: 's1', ref: 'HB-2PF8ZR', matchName: 'Liverpool v Chelsea', marketName: 'Match result', label: 'Liverpool', odds: 2.05, stake: 40, placedAt: ago(60 * 26), status: 'won', payout: 82, settledAt: ago(60 * 24) },
    { id: 's2', ref: 'HB-5GH6QV', matchName: 'Napoli v Roma', marketName: 'Total goals 2.5', label: 'Over 2.5', odds: 1.95, stake: 30, placedAt: ago(60 * 30), status: 'lost', payout: 0, settledAt: ago(60 * 28) },
    { id: 's3', ref: 'HB-1VB4EJ', matchName: 'Sevilla v Real Betis', marketName: 'Both teams to score', label: 'Yes', odds: 1.8, stake: 60, placedAt: ago(60 * 50), status: 'cashed', payout: 71.4, settledAt: ago(60 * 49) },
    { id: 's4', ref: 'HB-8KT2NY', matchName: 'Leverkusen v Dortmund', marketName: 'Draw no bet', label: 'Leverkusen', odds: 1.55, stake: 80, placedAt: ago(60 * 74), status: 'won', payout: 124, settledAt: ago(60 * 72) },
  ]
}

function loadFollowed(): string[] {
  try {
    const raw = localStorage.getItem('hb:follow')
    if (raw) return JSON.parse(raw) as string[]
  } catch {
    /* ignore */
  }
  return ['comp:pl', 'team:ars']
}

let state: State = {
  slip: [],
  bets: seedBets(),
  balance: START_BALANCE,
  followed: loadFollowed(),
  receipt: [],
  panelTab: 'slip',
  betsTab: 'open',
  sheetOpen: false,
  bump: {},
  suspended: [],
  failNext: false,
}

const listeners = new Set<() => void>()
const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function set(patch: Partial<State>) {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state))
}

export const getState = () => state

/* ------------------------------ price helpers ------------------------------ */

export function priceNow(id: string, s: State = state, tick = currentTick()): number {
  const f = findOutcome(id)
  if (!f) return 0
  return priceAt(id, f.outcome.baseOdds, f.match.status === 'live', tick, s.bump[id] ?? 1)
}

export function isSuspended(id: string, s: State = state, tick = currentTick()): boolean {
  const f = findOutcome(id)
  if (!f) return true
  const marketRef = `${f.match.id}|${f.market.key}`
  if (s.suspended.includes(marketRef) || s.suspended.includes(f.match.id)) return true
  return autoSuspended(f.match, f.market.key, tick)
}

export const hasChanged = (accepted: number, current: number) => Math.abs(current - accepted) >= Math.max(0.03, accepted * 0.02)

export function cashOutValue(bet: Bet, tick = currentTick(), s: State = state): number | null {
  if (!bet.outcomeId) return null
  if (isSuspended(bet.outcomeId, s, tick)) return null
  const cur = priceNow(bet.outcomeId, s, tick)
  if (!cur) return null
  const raw = ((bet.stake * bet.odds) / cur) * 0.95
  return Math.round(Math.min(raw, bet.stake * bet.odds * 0.98) * 100) / 100
}

/* --------------------------------- actions -------------------------------- */

const refCode = () => 'HB-' + Math.random().toString(36).slice(2, 8).toUpperCase()
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export const actions = {
  toggleSelection(id: string) {
    const exists = state.slip.some((i) => i.id === id)
    if (exists) {
      set({ slip: state.slip.filter((i) => i.id !== id) })
      return
    }
    const prefix = id.split('|').slice(0, 2).join('|') + '|'
    const rest = state.slip.filter((i) => !i.id.startsWith(prefix))
    set({ slip: [...rest, { id, odds: priceNow(id), stake: '', state: 'idle' }], panelTab: 'slip' })
  },
  removeSelection(id: string) {
    set({ slip: state.slip.filter((i) => i.id !== id) })
  },
  clearSlip() {
    set({ slip: [] })
  },
  setStake(id: string, raw: string) {
    const v = raw.replace(/[^0-9.]/g, '')
    const [a, b] = v.split('.')
    const clean = b === undefined ? a : `${a}.${b.slice(0, 2)}`
    set({ slip: state.slip.map((i) => (i.id === id ? { ...i, stake: clean, state: 'idle', error: undefined } : i)) })
  },
  acceptOdds(id: string) {
    set({ slip: state.slip.map((i) => (i.id === id ? { ...i, odds: priceNow(id) } : i)) })
  },
  acceptAll() {
    set({ slip: state.slip.map((i) => ({ ...i, odds: priceNow(i.id) })) })
  },
  setPanelTab(tab: 'slip' | 'bets') {
    set({ panelTab: tab })
  },
  setBetsTab(tab: 'open' | 'settled') {
    set({ betsTab: tab })
  },
  setSheet(open: boolean) {
    set({ sheetOpen: open })
  },
  dismissReceipt() {
    set({ receipt: [] })
  },
  toggleFollow(key: string) {
    const followed = state.followed.includes(key) ? state.followed.filter((k) => k !== key) : [...state.followed, key]
    try {
      localStorage.setItem('hb:follow', JSON.stringify(followed))
    } catch {
      /* ignore */
    }
    set({ followed })
  },

  async placeBets() {
    const ready = state.slip.filter((i) => parseStake(i.stake) >= MIN_STAKE && i.state !== 'placing')
    if (!ready.length) return
    const ids = new Set(ready.map((i) => i.id))
    set({ slip: state.slip.map((i) => (ids.has(i.id) ? { ...i, state: 'placing', error: undefined } : i)) })

    await Promise.all(
      ready.map(async (item, idx) => {
        await wait(1000 + idx * 350)
        const f = findOutcome(item.id)
        const stake = parseStake(item.stake)
        const fail = (error: string) =>
          set({ slip: state.slip.map((i) => (i.id === item.id ? { ...i, state: 'failed', error } : i)) })

        if (!f) return fail('This selection is no longer available.')
        if (state.failNext) {
          set({ failNext: false })
          return fail('Bet failed. We could not reach the pricing service. Your stake was not taken.')
        }
        if (isSuspended(item.id)) return fail('Selection suspended while placing. Your stake was not taken.')
        if (stake > state.balance) return fail('Insufficient balance.')
        const odds = priceNow(item.id)
        if (hasChanged(item.odds, odds)) return fail('The price moved while placing. Review the new odds and try again.')

        const bet: Bet = {
          id: `b-${Date.now()}-${idx}`,
          ref: refCode(),
          outcomeId: item.id,
          matchName: matchName(f.match),
          marketName: f.market.name,
          label: f.outcome.label,
          odds,
          stake,
          placedAt: Date.now(),
          status: 'open',
        }
        set({
          bets: [bet, ...state.bets],
          balance: Math.round((state.balance - stake) * 100) / 100,
          slip: state.slip.filter((i) => i.id !== item.id),
          receipt: [bet, ...state.receipt],
        })
      }),
    )
  },

  /** Places every selection on the slip as one accumulator. Returns an error message, or null on success. */
  async placeAccumulator(rawStake: string): Promise<string | null> {
    const legs = state.slip.map((i) => ({ item: i, found: findOutcome(i.id) }))
    const stake = parseStake(rawStake)
    if (legs.length < 2) return 'Add at least two selections.'
    if (legs.some((l) => !l.found)) return 'A selection is no longer available.'
    if (new Set(legs.map((l) => l.found!.match.id)).size !== legs.length) return 'Only one selection per match is allowed in an accumulator.'
    if (stake < MIN_STAKE) return `Minimum stake is ${MIN_STAKE} USDT.`
    if (stake > MAX_STAKE) return `Maximum stake is ${MAX_STAKE} USDT.`

    await wait(1000)
    if (state.failNext) {
      set({ failNext: false })
      return 'Bet failed. We could not reach the pricing service. Your stake was not taken.'
    }
    if (legs.some((l) => isSuspended(l.item.id))) return 'A selection was suspended while placing. Your stake was not taken.'
    if (stake > state.balance) return 'Insufficient balance.'
    let combined = 1
    for (const l of legs) {
      const current = priceNow(l.item.id)
      if (hasChanged(l.item.odds, current)) return 'A price moved while placing. Review the new odds and try again.'
      combined *= current
    }

    const bet: Bet = {
      id: `b-${Date.now()}-acca`,
      ref: refCode(),
      matchName: legs.map((l) => matchName(l.found!.match)).join(' | '),
      marketName: legs.map((l) => `${l.found!.outcome.label} (${l.found!.market.name})`).join(' · '),
      label: `${legs.length}-fold accumulator`,
      odds: Math.round(combined * 100) / 100,
      stake,
      placedAt: Date.now(),
      status: 'open',
    }
    set({
      bets: [bet, ...state.bets],
      balance: Math.round((state.balance - stake) * 100) / 100,
      slip: [],
      panelTab: 'bets',
      betsTab: 'open',
    })
    return null
  },

  cashOut(betId: string, value: number) {
    const bet = state.bets.find((b) => b.id === betId)
    if (!bet || bet.status !== 'open') return
    set({
      bets: state.bets.map((b) => (b.id === betId ? { ...b, status: 'cashed', payout: value, settledAt: Date.now() } : b)),
      balance: Math.round((state.balance + value) * 100) / 100,
      betsTab: state.betsTab,
    })
  },

  /* prototype controls */
  demoMoveOdds(direction: 1 | -1) {
    const bump = { ...state.bump }
    for (const i of state.slip) bump[i.id] = (bump[i.id] ?? 1) * (direction > 0 ? 1.12 : 0.9)
    set({ bump })
  },
  demoSuspendSlip() {
    const refs = state.slip.map((i) => i.id.split('|').slice(0, 2).join('|'))
    set({ suspended: Array.from(new Set([...state.suspended, ...refs])) })
  },
  demoFailNext() {
    set({ failNext: true })
  },
  demoReset() {
    set({
      slip: [],
      bets: seedBets(),
      balance: START_BALANCE,
      receipt: [],
      bump: {},
      suspended: [],
      failNext: false,
      sheetOpen: false,
    })
  },
}
