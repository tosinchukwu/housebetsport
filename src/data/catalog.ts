// Sample data only. Crests are generic shields, player names are invented.

export type SportId = 'football' | 'tennis' | 'basketball' | 'cricket'

export interface Sport {
  id: SportId
  name: string
}

export interface Competition {
  id: string
  sport: SportId
  name: string
  short: string
  region: string
  accent: string
}

export interface Team {
  id: string
  name: string
  short: string
  c1: string
  c2: string
}

export interface Match {
  id: string
  sport: SportId
  comp: string
  home: string
  away: string
  status: 'live' | 'upcoming'
  /** football: minute played. */
  minute?: number
  /** upcoming: minutes from page load until kick-off. */
  startsInMin?: number
  score: [number, number]
  /** score at half time (football). */
  ht?: [number, number]
  corners?: [number, number]
  cards?: [number, number]
  /** Extra live detail line (tennis game score, basketball quarter). */
  detail?: string
  /** Match result prices: home, draw, away (two-way sports: home, away). */
  odds: number[]
  /** A match whose markets are suspended on a loop (VAR check demo). */
  flaky?: boolean
}

export const SPORTS: Sport[] = [
  { id: 'football', name: 'Football' },
  { id: 'tennis', name: 'Tennis' },
  { id: 'basketball', name: 'Basketball' },
  { id: 'cricket', name: 'Cricket' },
]

export const COMPETITIONS: Competition[] = [
  { id: 'pl', sport: 'football', name: 'Premier League', short: 'PL', region: 'England', accent: '#a78bfa' },
  { id: 'ucl', sport: 'football', name: 'Champions League', short: 'UCL', region: 'Europe', accent: '#60a5fa' },
  { id: 'laliga', sport: 'football', name: 'LaLiga', short: 'LL', region: 'Spain', accent: '#fb923c' },
  { id: 'seriea', sport: 'football', name: 'Serie A', short: 'SA', region: 'Italy', accent: '#34d399' },
  { id: 'bundes', sport: 'football', name: 'Bundesliga', short: 'BL', region: 'Germany', accent: '#f87171' },
  { id: 'harbor', sport: 'tennis', name: 'Harbor Open', short: 'HO', region: 'Court Series', accent: '#facc15' },
  { id: 'coastal', sport: 'basketball', name: 'Coastal League', short: 'CL', region: 'Pro', accent: '#f472b6' },
  { id: 'rhino', sport: 'cricket', name: 'Twenty20 Cup', short: 'T20', region: 'International', accent: '#2dd4bf' },
]

export const FOOTBALL_COMPS = ['pl', 'ucl', 'laliga', 'seriea', 'bundes']

const t = (id: string, name: string, short: string, c1: string, c2: string): Team => ({ id, name, short, c1, c2 })

export const TEAMS: Team[] = [
  t('ars', 'Arsenal', 'ARS', '#e0314b', '#ffffff'),
  t('bha', 'Brighton & Hove Albion', 'BHA', '#1f74e0', '#ffffff'),
  t('avl', 'Aston Villa', 'AVL', '#7a2350', '#9fd6ff'),
  t('ful', 'Fulham', 'FUL', '#16181d', '#ffffff'),
  t('liv', 'Liverpool', 'LIV', '#c8102e', '#ffffff'),
  t('mun', 'Manchester United', 'MUN', '#da291c', '#ffd23f'),
  t('che', 'Chelsea', 'CHE', '#1746a2', '#ffffff'),
  t('tot', 'Tottenham', 'TOT', '#14214d', '#ffffff'),
  t('mci', 'Manchester City', 'MCI', '#6cabdd', '#10233f'),
  t('new', 'Newcastle', 'NEW', '#242424', '#ffffff'),
  t('atm', 'Atlético Madrid', 'ATM', '#c8312f', '#ffffff'),
  t('sev', 'Sevilla', 'SEV', '#f2f2f2', '#c8102e'),
  t('rma', 'Real Madrid', 'RMA', '#f4f4f6', '#3b2f7a'),
  t('bar', 'Barcelona', 'BAR', '#8a1538', '#2b4fa8'),
  t('val', 'Valencia', 'VAL', '#f2f2f2', '#f08a1c'),
  t('bet', 'Real Betis', 'BET', '#1c8a4a', '#ffffff'),
  t('int', 'Inter', 'INT', '#0e2a5c', '#4aa3ff'),
  t('mil', 'AC Milan', 'MIL', '#b3101f', '#111111'),
  t('juv', 'Juventus', 'JUV', '#111111', '#ffffff'),
  t('nap', 'Napoli', 'NAP', '#2d8fd8', '#ffffff'),
  t('rom', 'Roma', 'ROM', '#8c1d2f', '#ffc42b'),
  t('laz', 'Lazio', 'LAZ', '#8cc7ee', '#10233f'),
  t('bay', 'Bayern Munich', 'BAY', '#d0112b', '#ffffff'),
  t('bvb', 'Dortmund', 'BVB', '#fbd000', '#111111'),
  t('b04', 'Leverkusen', 'B04', '#d6001c', '#111111'),
  t('rbl', 'RB Leipzig', 'RBL', '#e9eef7', '#c8102e'),
  t('psg', 'Paris SG', 'PSG', '#0f2a5e', '#e30613'),
  // Fictional sides for the non-football sample fixtures
  t('tid', 'Harbor City Tides', 'HCT', '#0e7490', '#cffafe'),
  t('pea', 'Summit Ridge Peaks', 'SRP', '#4338ca', '#e0e7ff'),
  t('kin', 'Bayview Kings', 'BVK', '#a16207', '#fef3c7'),
  t('owl', 'Redwood Owls', 'RWO', '#9a3412', '#ffedd5'),
  t('com', 'Lakeshore Comets', 'LSC', '#be185d', '#fce7f3'),
  t('bea', 'Granite Falls Bears', 'GFB', '#374151', '#e5e7eb'),
  t('p1', 'L. Moretti', 'MOR', '#0f766e', '#ccfbf1'),
  t('p2', 'K. Lindqvist', 'LIN', '#7c3aed', '#ede9fe'),
  t('p3', 'A. Okafor', 'OKA', '#b45309', '#fef3c7'),
  t('p4', 'J. Brandt', 'BRA', '#1d4ed8', '#dbeafe'),
  t('p5', 'S. Varga', 'VAR', '#be123c', '#ffe4e6'),
  t('p6', 'M. Duarte', 'DUA', '#15803d', '#dcfce7'),
  t('rhi', 'Northern Rhinos', 'NOR', '#475569', '#f1f5f9'),
  t('cok', 'Coastal Kestrels', 'COK', '#0369a1', '#e0f2fe'),
  t('sab', 'Eastern Sabres', 'EAS', '#a21caf', '#fae8ff'),
  t('gul', 'Gulf Giants', 'GUG', '#c2410c', '#ffedd5'),
]

export const TEAM_BY_ID: Record<string, Team> = Object.fromEntries(TEAMS.map((x) => [x.id, x]))
export const COMP_BY_ID: Record<string, Competition> = Object.fromEntries(COMPETITIONS.map((x) => [x.id, x]))

const SURNAMES = [
  'Halvorsen', 'Castellan', 'Marlowe', 'Brightwell', 'Okonkwo', 'Valdez', 'Ferreira', 'Lindgren',
  'Tavares', 'Kowalczyk', 'Merriweather', 'Ashdown', 'Bellamy', 'Corrigan', 'Duvall', 'Ellery',
  'Fontaine', 'Garrity', 'Holloway', 'Ivanek', 'Jessop', 'Kestrel', 'Lacroix', 'Moreau',
  'Navarro', 'Oyelaran', 'Penhale', 'Quillan', 'Rasmussen', 'Soderberg', 'Thackeray', 'Umberto',
  'Vasquez', 'Whitlock', 'Yarrow', 'Zielinski', 'Abernathy', 'Baptiste', 'Cavanagh', 'Delacroix',
]
const INITIALS = 'ABCDEFGHJKLMNPRSTVW'

const hash = (s: string) => {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
export { hash }

/** Four invented attackers per club, stable per team id. */
export function playersFor(teamId: string): string[] {
  const seed = hash(teamId)
  return [0, 1, 2, 3].map((i) => {
    const s = SURNAMES[(seed + i * 11) % SURNAMES.length]
    const ini = INITIALS[(seed >> (i + 2)) % INITIALS.length]
    return `${ini}. ${s}`
  })
}

type M = Omit<Match, 'id'>
const mk = (id: string, m: M): Match => ({ id, ...m })

export const MATCHES: Match[] = [
  // Live football
  mk('ars-bha', { sport: 'football', comp: 'pl', home: 'ars', away: 'bha', status: 'live', minute: 52, score: [1, 0], ht: [1, 0], corners: [5, 3], cards: [1, 2], odds: [1.3, 4.6, 11] }),
  mk('avl-ful', { sport: 'football', comp: 'pl', home: 'avl', away: 'ful', status: 'live', minute: 67, score: [1, 1], ht: [0, 1], corners: [6, 4], cards: [2, 1], odds: [3.6, 2.2, 3.9] }),
  mk('atm-sev', { sport: 'football', comp: 'laliga', home: 'atm', away: 'sev', status: 'live', minute: 37, score: [1, 0], corners: [3, 1], cards: [1, 1], odds: [1.55, 3.8, 7.5], flaky: true }),
  mk('val-bet', { sport: 'football', comp: 'laliga', home: 'val', away: 'bet', status: 'live', minute: 12, score: [0, 0], corners: [1, 0], cards: [0, 0], odds: [2.4, 3.2, 3.1] }),
  mk('int-mil', { sport: 'football', comp: 'seriea', home: 'int', away: 'mil', status: 'live', minute: 74, score: [2, 1], ht: [1, 1], corners: [7, 5], cards: [2, 3], odds: [1.35, 5.2, 9.5] }),
  mk('rom-laz', { sport: 'football', comp: 'seriea', home: 'rom', away: 'laz', status: 'live', minute: 81, score: [0, 0], ht: [0, 0], corners: [4, 6], cards: [3, 2], odds: [4.8, 1.42, 5.2] }),
  mk('bay-bvb', { sport: 'football', comp: 'bundes', home: 'bay', away: 'bvb', status: 'live', minute: 29, score: [0, 0], corners: [3, 2], cards: [0, 1], odds: [1.72, 4.1, 4.4] }),
  // Live tennis
  mk('mor-lin', { sport: 'tennis', comp: 'harbor', home: 'p1', away: 'p2', status: 'live', score: [1, 0], detail: 'Set 2 · 3-2', odds: [1.38, 3.0] }),
  mk('oka-bra', { sport: 'tennis', comp: 'harbor', home: 'p3', away: 'p4', status: 'live', score: [0, 1], detail: 'Set 2 · 1-4', odds: [4.5, 1.18] }),
  mk('var-dua', { sport: 'tennis', comp: 'harbor', home: 'p5', away: 'p6', status: 'live', score: [1, 1], detail: 'Set 3 · 2-2', odds: [1.9, 1.9] }),
  // Live basketball
  mk('tid-pea', { sport: 'basketball', comp: 'coastal', home: 'tid', away: 'pea', status: 'live', score: [54, 49], detail: 'Q3 · 04:12', odds: [1.62, 2.3] }),
  mk('kin-owl', { sport: 'basketball', comp: 'coastal', home: 'kin', away: 'owl', status: 'live', score: [31, 38], detail: 'Q2 · 02:40', odds: [2.9, 1.4] }),
  mk('com-bea', { sport: 'basketball', comp: 'coastal', home: 'com', away: 'bea', status: 'live', score: [88, 84], detail: 'Q4 · 06:55', odds: [1.78, 2.05] }),
  // Starting soon
  mk('ars-int', { sport: 'football', comp: 'ucl', home: 'ars', away: 'int', status: 'upcoming', startsInMin: 24, score: [0, 0], odds: [1.95, 3.5, 4.0] }),
  mk('rma-bay', { sport: 'football', comp: 'ucl', home: 'rma', away: 'bay', status: 'upcoming', startsInMin: 24, score: [0, 0], odds: [2.2, 3.6, 3.15] }),
  mk('bar-psg', { sport: 'football', comp: 'ucl', home: 'bar', away: 'psg', status: 'upcoming', startsInMin: 38, score: [0, 0], odds: [2.05, 3.7, 3.5] }),
  mk('mci-bvb', { sport: 'football', comp: 'ucl', home: 'mci', away: 'bvb', status: 'upcoming', startsInMin: 180, score: [0, 0], odds: [1.45, 4.8, 6.6] }),
  mk('liv-mun', { sport: 'football', comp: 'pl', home: 'liv', away: 'mun', status: 'upcoming', startsInMin: 95, score: [0, 0], odds: [1.7, 4.0, 4.9] }),
  mk('che-tot', { sport: 'football', comp: 'pl', home: 'che', away: 'tot', status: 'upcoming', startsInMin: 260, score: [0, 0], odds: [2.1, 3.6, 3.4] }),
  mk('mci-new', { sport: 'football', comp: 'pl', home: 'mci', away: 'new', status: 'upcoming', startsInMin: 1500, score: [0, 0], odds: [1.5, 4.5, 6.0] }),
  mk('rma-bar', { sport: 'football', comp: 'laliga', home: 'rma', away: 'bar', status: 'upcoming', startsInMin: 1560, score: [0, 0], odds: [2.35, 3.5, 2.9] }),
  mk('juv-nap', { sport: 'football', comp: 'seriea', home: 'juv', away: 'nap', status: 'upcoming', startsInMin: 150, score: [0, 0], odds: [2.4, 3.1, 3.2] }),
  mk('b04-rbl', { sport: 'football', comp: 'bundes', home: 'b04', away: 'rbl', status: 'upcoming', startsInMin: 1440, score: [0, 0], odds: [1.95, 3.7, 3.7] }),
  mk('rhi-cok', { sport: 'cricket', comp: 'rhino', home: 'rhi', away: 'cok', status: 'upcoming', startsInMin: 210, score: [0, 0], odds: [1.85, 1.95] }),
  mk('sab-gul', { sport: 'cricket', comp: 'rhino', home: 'sab', away: 'gul', status: 'upcoming', startsInMin: 1700, score: [0, 0], odds: [2.1, 1.72] }),
]

export const MATCH_BY_ID: Record<string, Match> = Object.fromEntries(MATCHES.map((x) => [x.id, x]))

export const FEATURED_MATCH_ID = 'ars-bha'

export const matchName = (m: Match) => `${TEAM_BY_ID[m.home].name} v ${TEAM_BY_ID[m.away].name}`
