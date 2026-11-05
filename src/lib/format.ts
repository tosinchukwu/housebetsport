export const fmtOdds = (n: number) => n.toFixed(2)

const nf = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const fmtAmount = (n: number) => nf.format(n)
export const fmtUsdt = (n: number) => `${nf.format(n)} USDT`

export const parseStake = (s: string) => {
  const n = Number.parseFloat(s)
  return Number.isFinite(n) ? n : 0
}

export function timeAgo(ms: number, now = Date.now()) {
  const m = Math.round((now - ms) / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}
