export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5" aria-label="Housebets">
      <svg width="36" height="36" viewBox="0 0 40 40" aria-hidden>
        <defs>
          <linearGradient id="hb-wave" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#dcff82" />
            <stop offset="1" stopColor="#a3e000" />
          </linearGradient>
          <linearGradient id="hb-tile" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#262238" />
            <stop offset="1" stopColor="#14111f" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="38" height="38" rx="12" fill="url(#hb-tile)" stroke="rgba(198,255,61,0.4)" />
        <path d="M10 10v20M30 10v20M10 20h20" fill="none" stroke="url(#hb-wave)" strokeWidth="3.4" strokeLinecap="round" />
        <circle cx="30" cy="10" r="2.6" fill="#ff4560" />
      </svg>
      {!compact && (
        <span className="font-display text-[20px] font-bold tracking-tight text-white">
          House<span className="text-volt">bets</span>
        </span>
      )}
    </span>
  )
}
