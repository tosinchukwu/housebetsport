import { TEAM_BY_ID } from '@/data/catalog'

interface Props {
  teamId: string
  size?: number
}

/** Generic crest: a shield (or a disc for individual players) in the team colours. Never a real club badge. */
export function Crest({ teamId, size = 28 }: Props) {
  const team = TEAM_BY_ID[teamId]
  if (!team) return null
  const round = /^p\d$/.test(teamId)
  const label = team.short.slice(0, 3)
  const h = round ? size : size * 1.1
  return (
    <svg width={size} height={h} viewBox={round ? '0 0 32 32' : '0 0 32 36'} aria-hidden className="shrink-0 drop-shadow-sm">
      <defs>
        <linearGradient id={`g-${teamId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={team.c1} />
          <stop offset="1" stopColor={team.c1} stopOpacity="0.78" />
        </linearGradient>
      </defs>
      {round ? (
        <circle cx="16" cy="16" r="15" fill={`url(#g-${teamId})`} stroke="rgba(255,255,255,0.28)" />
      ) : (
        <path
          d="M16 1.5 29 5.5v11.2c0 8.6-5.7 14.6-13 17.8C8.7 31.300 3 25.300 3 16.700V5.500z"
          fill={`url(#g-${teamId})`}
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="1"
        />
      )}
      {!round && <path d="M16 1.500 29 5.500v5.500H3V5.500z" fill="rgba(255,255,255,0.12)" />}
      <text
        x="16"
        y={round ? 20 : 22}
        textAnchor="middle"
        fontSize={round ? 10 : 9.5}
        fontWeight="800"
        fontFamily="Space Grotesk, sans-serif"
        fill={team.c2}
        letterSpacing="-0.3"
      >
        {label}
      </text>
    </svg>
  )
}
