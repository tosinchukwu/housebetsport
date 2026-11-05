export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5" aria-label="Housebets">
      <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden>
        <defs>
          <linearGradient id="hb-wave" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8af2fb" />
            <stop offset="1" stopColor="#17c9db" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="38" height="38" rx="11" fill="#062330" stroke="rgba(62,230,245,0.35)" />
        <path
          d="M7 27c4.500 0 5.500-5 9.500-5S22 27 26 27s5-5 7-5"
          fill="none"
          stroke="url(#hb-wave)"
          strokeWidth="2.600"
          strokeLinecap="round"
        />
        <path
          d="M9 20c1.500-6.500 6-10.500 12-10.500 5.500 0 8.500 3.500 8.500 7 0 3-2.200 4.700-4.700 4.700-2.100 0-3.700-1.400-3.700-3.300 0-1.600 1.200-2.800 2.800-2.800"
          fill="none"
          stroke="url(#hb-wave)"
          strokeWidth="2.600"
          strokeLinecap="round"
        />
      </svg>
      {!compact && (
        <span className="text-[19px] font-extrabold tracking-tight text-white" style={{ fontFamily: "Sora, Figtree, ui-sans-serif, sans-serif" }}>
          <span className="text-[#3ee6f5]">H</span>ousebets
        </span>
      )}
    </span>
  )
}
