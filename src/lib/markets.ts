import { MATCH_BY_ID, TEAM_BY_ID, playersFor, type Match } from '@/data/catalog'

export type GroupKey = 'popular' | 'goals' | 'halves' | 'handicaps' | 'scorers' | 'corners'

export const GROUPS: { key: GroupKey; label: string }[] = [
  { key: 'popular', label: 'Popular' },
  { key: 'goals', label: 'Goals' },
  { key: 'halves', label: 'Halves' },
  { key: 'handicaps', label: 'Handicaps' },
  { key: 'scorers', label: 'Goalscorers' },
  { key: 'corners', label: 'Corners & cards' },
]

export interface Outcome {
  id: string
  key: string
  label: string
  sub?: string
  baseOdds: number
}

export interface Market {
  matchId: string
  key: string
  name: string
  group: GroupKey
  cols: 1 | 2 | 3
  outcomes: Outcome[]
}

const SHORT_NAMES: Record<string, string> = {
  bha: 'Brighton',
  mun: 'Man United',
  mci: 'Man City',
  atm: 'Atlético',
  bay: 'Bayern',
  mil: 'Milan',
  rbl: 'Leipzig',
  psg: 'Paris SG',
}
export const teamLabel = (id: string) => SHORT_NAMES[id] ?? TEAM_BY_ID[id].name

/* ---------------------------------- maths --------------------------------- */

const N = 10
const pmfCache = new Map<number, number[]>()
function pmf(lambda: number): number[] {
  const key = Math.round(lambda * 1000)
  const hit = pmfCache.get(key)
  if (hit) return hit
  const l = key / 1000
  const out = [Math.exp(-l)]
  for (let k = 1; k < N; k++) out.push((out[k - 1] * l) / k)
  const sum = out.reduce((a, b) => a + b, 0)
  const norm = out.map((x) => x / sum)
  pmfCache.set(key, norm)
  return norm
}

type Test = (h: number, a: number) => boolean
function prob(lh: number, la: number, ch: number, ca: number, test: Test): number {
  const ph = pmf(lh)
  const pa = pmf(la)
  let s = 0
  for (let h = 0; h < N; h++) for (let a = 0; a < N; a++) if (test(ch + h, ca + a)) s += ph[h] * pa[a]
  return s
}

function fitLambdas(cur: [number, number], target: [number, number, number]): [number, number] {
  let best: [number, number] = [0.6, 0.6]
  let err = Infinity
  for (let lh = 0.02; lh <= 3.6; lh += 0.06) {
    for (let la = 0.02; la <= 3.6; la += 0.06) {
      const ph = pmf(lh)
      const pa = pmf(la)
      let w = 0
      let d = 0
      for (let h = 0; h < N; h++) {
        for (let a = 0; a < N; a++) {
          const diff = cur[0] + h - (cur[1] + a)
          const p = ph[h] * pa[a]
          if (diff > 0) w += p
          else if (diff === 0) d += p
        }
      }
      const l = 1 - w - d
      const e = (w - target[0]) ** 2 + (d - target[1]) ** 2 + (l - target[2]) ** 2
      if (e < err) {
        err = e
        best = [lh, la]
      }
    }
  }
  return best
}

export const toOdds = (p: number) => {
  const q = Math.min(Math.max(p, 0.004), 0.985)
  return Math.min(250, Math.max(1.01, Math.round((0.945 / q) * 100) / 100))
}

const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`)

/** Pick the x.5 line whose "over" chance is closest to 50%. */
function bestLine(cur: number, lambda: number): number {
  let best = cur + 0.5
  let diff = Infinity
  for (let l = cur + 0.5; l <= cur + 6.5; l += 1) {
    const p = prob(lambda, 0, 0, 0, (h) => cur + h > l)
    const d = Math.abs(p - 0.5)
    if (d < diff) {
      diff = d
      best = l
    }
  }
  return best
}

/* ------------------------------ market builder ----------------------------- */

const cache = new Map<string, Market[]>()

export function marketsFor(matchId: string): Market[] {
  const hit = cache.get(matchId)
  if (hit) return hit
  const m = MATCH_BY_ID[matchId]
  if (!m) return []
  const built = m.sport === 'football' ? footballMarkets(m) : otherMarkets(m)
  cache.set(matchId, built)
  return built
}

class Builder {
  list: Market[] = []
  constructor(private matchId: string) {}
  add(group: GroupKey, key: string, name: string, cols: 1 | 2 | 3, outs: [string, string, number, string?][]) {
    const outcomes = outs.map(([k, label, baseOdds, sub]) => ({
      id: `${this.matchId}|${key}|${k}`,
      key: k,
      label,
      sub,
      baseOdds,
    }))
    this.list.push({ matchId: this.matchId, key, name, group, cols, outcomes })
  }
}

function footballMarkets(m: Match): Market[] {
  const b = new Builder(m.id)
  const hn = teamLabel(m.home)
  const an = teamLabel(m.away)
  const minute = m.minute ?? 0
  const cur = m.score
  const [ch, ca] = cur
  const imp = m.odds.map((o) => 1 / o)
  const tot = imp.reduce((x, y) => x + y, 0)
  const pr: [number, number, number] = [imp[0] / tot, imp[1] / tot, imp[2] / tot]
  const [lh, la] = fitLambdas(cur, pr)
  const total = ch + ca
  const L = lh + la

  /* Popular */
  b.add('popular', 'result', 'Match result', 3, [
    ['h', hn, m.odds[0]],
    ['d', 'Draw', m.odds[1]],
    ['a', an, m.odds[2]],
  ])
  b.add('popular', 'dc', 'Double chance', 3, [
    ['hd', `${hn}/Draw`, toOdds(pr[0] + pr[1])],
    ['ha', `${hn}/${an}`, toOdds(pr[0] + pr[2])],
    ['da', `Draw/${an}`, toOdds(pr[1] + pr[2])],
  ])
  b.add('popular', 'dnb', 'Draw no bet', 2, [
    ['h', hn, toOdds(pr[0] / (pr[0] + pr[2]))],
    ['a', an, toOdds(pr[2] / (pr[0] + pr[2]))],
  ])
  const pBtts = prob(lh, la, ch, ca, (h, a) => h > 0 && a > 0)
  b.add('popular', 'btts', 'Both teams to score', 2, [
    ['y', 'Yes', toOdds(pBtts)],
    ['n', 'No', toOdds(1 - pBtts)],
  ])
  const main = bestLine(total, L)
  const pMain = prob(lh, la, ch, ca, (h, a) => h + a > main)
  b.add('popular', 'total_main', `Total goals ${main}`, 2, [
    ['o', `Over ${main}`, toOdds(pMain)],
    ['u', `Under ${main}`, toOdds(1 - pMain)],
  ])
  if (minute < 85) {
    const pNone = Math.exp(-L)
    const pH = (lh / L) * (1 - pNone)
    const pA = (la / L) * (1 - pNone)
    b.add('popular', 'next_goal', minute > 0 ? 'Next goal' : 'First goal', 3, [
      ['h', hn, toOdds(pH)],
      ['n', 'No goal', toOdds(pNone)],
      ['a', an, toOdds(pA)],
    ])
  }
  const rb: [string, string, Test][] = [
    ['hy', `${hn} & Yes`, (h, a) => h > a && h > 0 && a > 0],
    ['dy', 'Draw & Yes', (h, a) => h === a && h > 0],
    ['ay', `${an} & Yes`, (h, a) => a > h && h > 0 && a > 0],
    ['hn', `${hn} & No`, (h, a) => h > a && a === 0],
    ['dn', 'Draw & No', (h, a) => h === a && h === 0],
    ['an', `${an} & No`, (h, a) => a > h && h === 0],
  ]
  b.add('popular', 'result_btts', 'Result & both teams to score', 3, rb.map(([k, l, t]) => [k, l, toOdds(prob(lh, la, ch, ca, t))]))
  const hl = bestLine(ch, lh)
  const pHl = prob(lh, 0, ch, 0, (h) => h > hl)
  b.add('popular', 'home_total', `${hn} total goals ${hl}`, 2, [
    ['o', `Over ${hl}`, toOdds(pHl)],
    ['u', `Under ${hl}`, toOdds(1 - pHl)],
  ])
  const al = bestLine(ca, la)
  const pAl = prob(0, la, 0, ca, (_h, a) => a > al)
  b.add('popular', 'away_total', `${an} total goals ${al}`, 2, [
    ['o', `Over ${al}`, toOdds(pAl)],
    ['u', `Under ${al}`, toOdds(1 - pAl)],
  ])
  const pOdd = prob(lh, la, ch, ca, (h, a) => (h + a) % 2 === 1)
  b.add('popular', 'odd_even', 'Total goals odd / even', 2, [
    ['odd', 'Odd', toOdds(pOdd)],
    ['even', 'Even', toOdds(1 - pOdd)],
  ])

  /* Goals */
  const lines = [0, 1, 2, 3, 4].map((i) => total + 0.5 + i).filter((l) => l <= total + 4.5).slice(0, 4)
  b.add(
    'goals',
    'total_alt',
    'Total goals lines',
    2,
    lines.flatMap((l): [string, string, number][] => {
      const p = prob(lh, la, ch, ca, (h, a) => h + a > l)
      return [
        [`o${l}`, `Over ${l}`, toOdds(p)],
        [`u${l}`, `Under ${l}`, toOdds(1 - p)],
      ]
    }),
  )
  const exact: [string, string, number][] = []
  for (let g = total; g <= total + 4; g++) {
    exact.push([`e${g}`, `${g}`, toOdds(prob(lh, la, ch, ca, (h, a) => h + a === g))])
  }
  exact.push([`e${total + 5}p`, `${total + 5}+`, toOdds(prob(lh, la, ch, ca, (h, a) => h + a >= total + 5))])
  b.add('goals', 'exact', 'Exact total goals', 3, exact)
  const homeLines = [ch + 0.5, ch + 1.5, ch + 2.5]
  b.add(
    'goals',
    'home_alt',
    `${hn} goals lines`,
    2,
    homeLines.flatMap((l): [string, string, number][] => {
      const p = prob(lh, 0, ch, 0, (h) => h > l)
      return [
        [`o${l}`, `Over ${l}`, toOdds(p)],
        [`u${l}`, `Under ${l}`, toOdds(1 - p)],
      ]
    }),
  )
  const awayLines = [ca + 0.5, ca + 1.5, ca + 2.5]
  b.add(
    'goals',
    'away_alt',
    `${an} goals lines`,
    2,
    awayLines.flatMap((l): [string, string, number][] => {
      const p = prob(0, la, 0, ca, (_h, a) => a > l)
      return [
        [`o${l}`, `Over ${l}`, toOdds(p)],
        [`u${l}`, `Under ${l}`, toOdds(1 - p)],
      ]
    }),
  )
  const bl = main
  const bt: [string, string, Test][] = [
    ['yo', `Yes & Over ${bl}`, (h, a) => h > 0 && a > 0 && h + a > bl],
    ['yu', `Yes & Under ${bl}`, (h, a) => h > 0 && a > 0 && h + a < bl],
    ['no', `No & Over ${bl}`, (h, a) => (h === 0 || a === 0) && h + a > bl],
    ['nu', `No & Under ${bl}`, (h, a) => (h === 0 || a === 0) && h + a < bl],
  ]
  b.add('goals', 'btts_total', `Both teams to score & total goals ${bl}`, 2, bt.map(([k, l, t]) => [k, l, toOdds(prob(lh, la, ch, ca, t))]))
  if (ca === 0) {
    const p = prob(lh, la, ch, ca, (_h, a) => a === 0)
    b.add('goals', 'cs_home', `${hn} clean sheet`, 2, [
      ['y', 'Yes', toOdds(p)],
      ['n', 'No', toOdds(1 - p)],
    ])
  }
  if (ch === 0) {
    const p = prob(lh, la, ch, ca, (h) => h === 0)
    b.add('goals', 'cs_away', `${an} clean sheet`, 2, [
      ['y', 'Yes', toOdds(p)],
      ['n', 'No', toOdds(1 - p)],
    ])
  }
  const mg: [string, string, Test][] = [
    ['h1', `${hn} by 1`, (h, a) => h - a === 1],
    ['h2', `${hn} by 2`, (h, a) => h - a === 2],
    ['h3', `${hn} by 3+`, (h, a) => h - a >= 3],
    ['d', 'Draw', (h, a) => h === a],
    ['a1', `${an} by 1`, (h, a) => a - h === 1],
    ['a2', `${an} by 2`, (h, a) => a - h === 2],
    ['a3', `${an} by 3+`, (h, a) => a - h >= 3],
  ]
  b.add('goals', 'margin', 'Winning margin', 3, mg.map(([k, l, t]) => [k, l, toOdds(prob(lh, la, ch, ca, t))]))

  /* Halves */
  const halfMarkets = (
    prefix: string,
    title: string,
    hlh: number,
    hla: number,
    c: [number, number],
  ) => {
    const p = [
      prob(hlh, hla, c[0], c[1], (h, a) => h > a),
      prob(hlh, hla, c[0], c[1], (h, a) => h === a),
      prob(hlh, hla, c[0], c[1], (h, a) => h < a),
    ]
    b.add('halves', `${prefix}_result`, `${title} result`, 3, [
      ['h', hn, toOdds(p[0])],
      ['d', 'Draw', toOdds(p[1])],
      ['a', an, toOdds(p[2])],
    ])
    const sum = c[0] + c[1]
    const ls = [sum + 0.5, sum + 1.5, sum + 2.5]
    b.add(
      'halves',
      `${prefix}_total`,
      `${title} total goals`,
      2,
      ls.flatMap((l): [string, string, number][] => {
        const q = prob(hlh, hla, c[0], c[1], (h, a) => h + a > l)
        return [
          [`o${l}`, `Over ${l}`, toOdds(q)],
          [`u${l}`, `Under ${l}`, toOdds(1 - q)],
        ]
      }),
    )
    const qb = prob(hlh, hla, c[0], c[1], (h, a) => h > 0 && a > 0)
    b.add('halves', `${prefix}_btts`, `${title} both teams to score`, 2, [
      ['y', 'Yes', toOdds(qb)],
      ['n', 'No', toOdds(1 - qb)],
    ])
  }
  if (minute < 45) {
    const f1 = (45 - minute) / (90 - minute)
    halfMarkets('h1', '1st half', lh * f1, la * f1, cur)
    const f2 = 45 / (90 - minute)
    halfMarkets('h2', '2nd half', lh * f2, la * f2, [0, 0])
    const l1h = lh * f1
    const l1a = la * f1
    const l2 = (lh + la) * f2
    const g1 = pmf(l1h + l1a)
    const g2 = pmf(l2)
    let p1 = 0
    let pt = 0
    let p2 = 0
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const x = g1[i] * g2[j]
        if (total + i > j) p1 += x
        else if (total + i === j) pt += x
        else p2 += x
      }
    }
    b.add('halves', 'highest_half', 'Highest scoring half', 3, [
      ['1', '1st half', toOdds(p1)],
      ['t', 'Tie', toOdds(pt)],
      ['2', '2nd half', toOdds(p2)],
    ])
  } else {
    const c2: [number, number] = m.ht ? [ch - m.ht[0], ca - m.ht[1]] : [ch, ca]
    halfMarkets('h2', '2nd half', lh, la, c2)
  }

  /* Handicaps */
  for (const hcap of [-2, -1, 1, 2]) {
    const sg = signed(hcap)
    const pH = prob(lh, la, ch, ca, (h, a) => h + hcap > a)
    const pD = prob(lh, la, ch, ca, (h, a) => h + hcap === a)
    b.add('handicaps', `hcap_${hcap}`, `Handicap ${hn} ${sg}`, 3, [
      ['h', `${hn} (${sg})`, toOdds(pH)],
      ['d', `Draw (${sg})`, toOdds(pD)],
      ['a', `${an} (${signed(-hcap)})`, toOdds(1 - pH - pD)],
    ])
  }
  const ah: [string, string, number][] = []
  for (const line of [-1.5, -0.5, 0.5, 1.5]) {
    const p = prob(lh, la, ch, ca, (h, a) => h + line > a)
    ah.push([`h${line}`, `${hn} ${signed(line)}`, toOdds(p)])
    ah.push([`a${line}`, `${an} ${signed(-line)}`, toOdds(1 - p)])
  }
  b.add('handicaps', 'asian', 'Asian handicap', 2, ah)

  /* Goalscorers */
  const shares = [0.42, 0.3, 0.22, 0.14]
  const hp = playersFor(m.home).map((n, i) => ({ n, s: shares[i], t: m.home, l: lh }))
  const ap = playersFor(m.away).map((n, i) => ({ n, s: shares[i], t: m.away, l: la }))
  const all = [...hp, ...ap]
  b.add(
    'scorers',
    'anytime',
    'Anytime goalscorer',
    2,
    all.map((p, i): [string, string, number, string] => [`p${i}`, p.n, toOdds(1 - Math.exp(-p.s * p.l)), TEAM_BY_ID[p.t].short]),
  )
  if (minute < 88) {
    const pNone = Math.exp(-L)
    const norm = (t: typeof all) => t.reduce((x, y) => x + y.s, 0)
    const nh = norm(hp)
    const na = norm(ap)
    const nextOuts = all.map((p, i): [string, string, number, string] => {
      const teamNext = (p.l / L) * (1 - pNone)
      const pn = teamNext * (p.s / (p.t === m.home ? nh : na))
      return [`p${i}`, p.n, toOdds(pn), TEAM_BY_ID[p.t].short]
    })
    nextOuts.push(['none', 'No goalscorer', toOdds(pNone), '—'])
    b.add('scorers', 'next_scorer', minute > 0 ? 'Next goalscorer' : 'First goalscorer', 2, nextOuts)
  }
  b.add(
    'scorers',
    'two_plus',
    'To score 2 or more goals',
    2,
    all.map((p, i): [string, string, number, string] => {
      const x = p.s * p.l
      return [`p${i}`, p.n, toOdds(1 - Math.exp(-x) * (1 + x)), TEAM_BY_ID[p.t].short]
    }),
  )

  /* Corners & cards */
  const frac = Math.max(0.05, (90 - minute) / 90)
  const corners = m.corners ?? [0, 0]
  const cShare = Math.min(0.65, Math.max(0.35, 0.5 + 0.15 * (pr[0] - pr[2])))
  const lcH = 10.2 * frac * cShare
  const lcA = 10.2 * frac * (1 - cShare)
  const cTot = corners[0] + corners[1]
  const cBase = Math.round(cTot + lcH + lcA)
  const cLines = [-1, 0, 1, 2].map((i) => cBase + i - 0.5).filter((l) => l > cTot)
  b.add(
    'corners',
    'corners_total',
    'Total corners',
    2,
    cLines.flatMap((l): [string, string, number][] => {
      const p = prob(lcH, lcA, corners[0], corners[1], (h, a) => h + a > l)
      return [
        [`o${l}`, `Over ${l}`, toOdds(p)],
        [`u${l}`, `Under ${l}`, toOdds(1 - p)],
      ]
    }),
  )
  const cmH = prob(lcH, lcA, corners[0], corners[1], (h, a) => h > a)
  const cmD = prob(lcH, lcA, corners[0], corners[1], (h, a) => h === a)
  b.add('corners', 'most_corners', 'Most corners', 3, [
    ['h', hn, toOdds(cmH)],
    ['d', 'Equal', toOdds(cmD)],
    ['a', an, toOdds(1 - cmH - cmD)],
  ])
  const cards = m.cards ?? [0, 0]
  const lkH = 2.1 * frac
  const lkA = 2.1 * frac
  const kTot = cards[0] + cards[1]
  const kLines = [kTot + 0.5, kTot + 1.5, kTot + 2.5].filter((l) => l >= 1.5)
  b.add(
    'corners',
    'cards_total',
    'Total cards',
    2,
    kLines.flatMap((l): [string, string, number][] => {
      const p = prob(lkH, lkA, cards[0], cards[1], (h, a) => h + a > l)
      return [
        [`o${l}`, `Over ${l}`, toOdds(p)],
        [`u${l}`, `Under ${l}`, toOdds(1 - p)],
      ]
    }),
  )
  if (cards[0] === 0 || cards[1] === 0) {
    const p = prob(lkH, lkA, cards[0], cards[1], (h, a) => h > 0 && a > 0)
    b.add('corners', 'both_carded', 'Both teams to receive a card', 2, [
      ['y', 'Yes', toOdds(p)],
      ['n', 'No', toOdds(1 - p)],
    ])
  }
  const pRed = 1 - Math.exp(-0.13 * frac)
  b.add('corners', 'red_card', 'Red card in match', 2, [
    ['y', 'Yes', toOdds(pRed)],
    ['n', 'No', toOdds(1 - pRed)],
  ])
  const pPen = 1 - Math.exp(-0.28 * frac)
  b.add('corners', 'penalty', 'Penalty awarded', 2, [
    ['y', 'Yes', toOdds(pPen)],
    ['n', 'No', toOdds(1 - pPen)],
  ])

  return b.list
}

function otherMarkets(m: Match): Market[] {
  const b = new Builder(m.id)
  const hn = TEAM_BY_ID[m.home].name
  const an = TEAM_BY_ID[m.away].name
  const imp = [1 / m.odds[0], 1 / m.odds[1]]
  const pH = imp[0] / (imp[0] + imp[1])
  b.add('popular', 'winner', m.sport === 'basketball' ? 'Moneyline' : 'Match winner', 2, [
    ['h', hn, m.odds[0]],
    ['a', an, m.odds[1]],
  ])
  if (m.sport === 'tennis') {
    const ps = 0.5 + (pH - 0.5) * 0.65
    b.add('popular', 'set_winner', 'Current set winner', 2, [
      ['h', hn, toOdds(ps)],
      ['a', an, toOdds(1 - ps)],
    ])
    const p15 = Math.min(0.9, pH * 0.72)
    b.add('popular', 'set_hcap', 'Set handicap', 2, [
      ['h', `${hn} (-1.5)`, toOdds(p15)],
      ['a', `${an} (+1.5)`, toOdds(1 - p15)],
    ])
    b.add('popular', 'games_total', 'Total games 22.5', 2, [
      ['o', 'Over 22.5', 1.9],
      ['u', 'Under 22.5', 1.9],
    ])
  } else if (m.sport === 'basketball') {
    const [sh, sa] = m.score
    const mm = /Q(\d) · (\d\d):(\d\d)/.exec(m.detail ?? '')
    const played = mm ? (Number(mm[1]) - 1) * 12 + (12 - Number(mm[2]) - Number(mm[3]) / 60) : 24
    const proj = Math.round(((sh + sa) / Math.max(played, 6)) * 48 - 0.5) + 0.5
    const mag = Math.floor(Math.abs(pH - 0.5) * 26) + 0.5
    const line = pH >= 0.5 ? -mag : mag
    b.add('popular', 'spread', 'Point spread', 2, [
      ['h', `${hn} (${signed(line)})`, 1.91],
      ['a', `${an} (${signed(-line)})`, 1.91],
    ])
    b.add('popular', 'points_total', `Total points ${proj}`, 2, [
      ['o', `Over ${proj}`, 1.91],
      ['u', `Under ${proj}`, 1.91],
    ])
  } else {
    b.add('popular', 'toss', 'Toss winner', 2, [
      ['h', hn, 1.9],
      ['a', an, 1.9],
    ])
  }
  return b.list
}

/* -------------------------------- lookups --------------------------------- */

export interface Found {
  match: Match
  market: Market
  outcome: Outcome
}

export function findOutcome(id: string): Found | undefined {
  const [matchId, marketKey] = id.split('|')
  const match = MATCH_BY_ID[matchId]
  if (!match) return undefined
  const market = marketsFor(matchId).find((x) => x.key === marketKey)
  const outcome = market?.outcomes.find((o) => o.id === id)
  return market && outcome ? { match, market, outcome } : undefined
}

export const resultMarket = (matchId: string) => marketsFor(matchId).find((x) => x.key === 'result' || x.key === 'winner')
