import { useLayoutEffect, useRef, useState } from 'react'
import { INDIA_MAP_PATHS, INDIA_MAP_VIEWBOX } from './indiaMapPaths'
import { getStateLabel } from '../../utils/benchesByState'

interface IndiaMapProps {
  selectedCode: string | null
  availableCodes: ReadonlySet<string>
  onSelect: (stateCode: string) => void
}

interface StateLabel {
  id: string
  code: string
  x: number
  y: number
  originX: number
  originY: number
  lines: string[]
  fontSize: number
  outside: boolean
  anchor: 'middle' | 'start' | 'end'
}

/** Distinct fill per state so neighbours are easy to tell apart. */
const STATE_FILL: Record<string, string> = {
  AN: '#6A8EAE',
  AP: '#E8A54B',
  AR: '#7BA05A',
  AS: '#E07A9B',
  BR: '#5FA8D3',
  CH: '#C45C5C',
  CG: '#6A9F78',
  DH: '#7BC47F',
  DL: '#C45C5C',
  GA: '#D4A017',
  GJ: '#3D9B8F',
  HR: '#E8B86D',
  HP: '#C5A3CF',
  JK: '#7EB6D9',
  JH: '#C47B6B',
  KA: '#6B9B6B',
  KL: '#4A8B7A',
  LA: '#9BB5C9',
  LD: '#4A9BB5',
  MP: '#D98B4A',
  MH: '#5B8DEF',
  MN: '#D46A6A',
  ML: '#8B6BB5',
  MZ: '#5B9B8A',
  NL: '#C9A84C',
  OD: '#D4A574',
  PY: '#B85C8A',
  PB: '#F5D76E',
  RJ: '#E07A5F',
  SK: '#9B7EBD',
  TN: '#C96B4A',
  TS: '#C45C7A',
  TR: '#E08A5A',
  UK: '#8FBC8F',
  UP: '#E6B84A',
  WB: '#4A90A4',
}

const FALLBACK_FILL = '#D9C495'

interface LabelTweak {
  dx?: number
  dy?: number
  fontSize?: number
  lines?: string[]
  outside?: boolean
  anchor?: 'middle' | 'start' | 'end'
}

/** Path-id tweaks: pull overlapping names apart and wrap long labels. */
const LABEL_TWEAKS: Record<string, LabelTweak> = {
  jk: { dy: -8, fontSize: 11, lines: ['J & K'] },
  hp: { dy: -10, fontSize: 10, lines: ['Himachal'] },
  ut: { dx: 10, dy: 8, fontSize: 9, lines: ['Uttarakhand'] },
  pb: { dx: -8, dy: -11, fontSize: 10, lines: ['Punjab'] },
  hr: { dx: 6, dy: 11, fontSize: 10, lines: ['Haryana'] },
  dl: { dx: 26, dy: 1, fontSize: 8, lines: ['Delhi'], outside: true, anchor: 'start' },
  ch: { dx: -22, dy: -14, fontSize: 8, lines: ['Chandigarh'], outside: true, anchor: 'end' },
  rj: { fontSize: 13, lines: ['Rajasthan'] },
  gj: { dx: 10, dy: 8, fontSize: 12, lines: ['Gujarat'] },
  dn: { dx: -34, dy: 2, fontSize: 8, lines: ['DNH'], outside: true, anchor: 'end' },
  dd: { dx: -32, dy: 16, fontSize: 8, lines: ['Daman'], outside: true, anchor: 'end' },
  mh: { fontSize: 13, lines: ['Maharashtra'] },
  ga: { dx: -22, dy: 8, fontSize: 9, lines: ['Goa'], outside: true, anchor: 'end' },
  mp: { fontSize: 12, lines: ['Madhya', 'Pradesh'] },
  up: { fontSize: 12, lines: ['Uttar', 'Pradesh'] },
  ct: { fontSize: 10, lines: ['Chhattisgarh'] },
  br: { dy: -6, fontSize: 11, lines: ['Bihar'] },
  jh: { dy: 10, fontSize: 10, lines: ['Jharkhand'] },
  wb: { dx: 12, dy: 6, fontSize: 10, lines: ['West', 'Bengal'] },
  or: { fontSize: 12, lines: ['Odisha'] },
  sk: { dx: 16, dy: -10, fontSize: 8, lines: ['Sikkim'], outside: true, anchor: 'start' },
  ar: { dy: -12, fontSize: 9, lines: ['Arunachal'] },
  as: { dx: -8, dy: 0, fontSize: 9, lines: ['Assam'] },
  nl: { dx: 14, dy: -4, fontSize: 8, lines: ['Nagaland'] },
  mn: { dx: 12, dy: 10, fontSize: 8, lines: ['Manipur'] },
  mz: { dx: 8, dy: 14, fontSize: 8, lines: ['Mizoram'] },
  ml: { dx: -8, dy: 12, fontSize: 8, lines: ['Meghalaya'] },
  tr: { dx: -4, dy: 14, fontSize: 8, lines: ['Tripura'] },
  tg: { fontSize: 11, lines: ['Telangana'] },
  ap: { dx: 8, dy: 14, fontSize: 11, lines: ['Andhra', 'Pradesh'] },
  ka: { dy: 8, fontSize: 12, lines: ['Karnataka'] },
  tn: { dy: 12, fontSize: 11, lines: ['Tamil', 'Nadu'] },
  kl: { dx: -2, fontSize: 11, lines: ['Kerala'] },
  py: { dx: 28, dy: 6, fontSize: 8, lines: ['Puducherry'], outside: true, anchor: 'start' },
  ld: { dy: 16, fontSize: 8, lines: ['Lakshadweep'], outside: true },
  an: { fontSize: 8, lines: ['A & N'] },
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const value = hex.replace('#', '')
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  const to = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${to(r)}${to(g)}${to(b)}`
}

function mix(hex: string, toward: string, amount: number): string {
  const a = hexToRgb(hex)
  const b = hexToRgb(toward)
  return rgbToHex(
    a.r + (b.r - a.r) * amount,
    a.g + (b.g - a.g) * amount,
    a.b + (b.b - a.b) * amount,
  )
}

function isDark(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex)
  return (r * 299 + g * 587 + b * 114) / 1000 < 145
}

function fillFor(code: string): string {
  return STATE_FILL[code] ?? FALLBACK_FILL
}

function defaultLines(code: string, fallback: string, pathId: string): string[] {
  if (pathId === 'dn') return ['DNH']
  if (pathId === 'dd') return ['Daman']
  const names: Record<string, string[]> = {
    AN: ['A & N'],
    AP: ['Andhra', 'Pradesh'],
    AR: ['Arunachal'],
    AS: ['Assam'],
    BR: ['Bihar'],
    CH: ['Chandigarh'],
    CG: ['Chhattisgarh'],
    DH: ['DNH'],
    DL: ['Delhi'],
    GA: ['Goa'],
    GJ: ['Gujarat'],
    HR: ['Haryana'],
    HP: ['Himachal'],
    JK: ['J & K'],
    JH: ['Jharkhand'],
    KA: ['Karnataka'],
    KL: ['Kerala'],
    LA: ['Ladakh'],
    LD: ['Lakshadweep'],
    MP: ['Madhya', 'Pradesh'],
    MH: ['Maharashtra'],
    MN: ['Manipur'],
    ML: ['Meghalaya'],
    MZ: ['Mizoram'],
    NL: ['Nagaland'],
    OD: ['Odisha'],
    PY: ['Puducherry'],
    PB: ['Punjab'],
    RJ: ['Rajasthan'],
    SK: ['Sikkim'],
    TN: ['Tamil', 'Nadu'],
    TS: ['Telangana'],
    TR: ['Tripura'],
    UK: ['Uttarakhand'],
    UP: ['Uttar', 'Pradesh'],
    WB: ['West', 'Bengal'],
  }
  return names[code] ?? [getStateLabel(code, fallback)]
}

export function IndiaMap({
  selectedCode,
  availableCodes,
  onSelect,
}: IndiaMapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [labels, setLabels] = useState<StateLabel[]>([])
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  useLayoutEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const next: StateLabel[] = []
    for (const location of INDIA_MAP_PATHS) {
      const el = svg.querySelector(
        `[data-path-id="${location.id}"]`,
      ) as SVGGraphicsElement | null
      if (!el) continue
      const box = el.getBBox()
      if (box.width < 0.5 && box.height < 0.5) continue
      const tweak = LABEL_TWEAKS[location.id] ?? {}
      const originX = box.x + box.width / 2
      const originY = box.y + box.height / 2
      next.push({
        id: location.id,
        code: location.code,
        originX,
        originY,
        x: originX + (tweak.dx ?? 0),
        y: originY + (tweak.dy ?? 0),
        lines: tweak.lines ?? defaultLines(location.code, location.name, location.id),
        fontSize: tweak.fontSize ?? 11,
        outside: tweak.outside ?? false,
        anchor: tweak.anchor ?? 'middle',
      })
    }
    setLabels(next)
  }, [])

  return (
    <svg
      ref={svgRef}
      viewBox={INDIA_MAP_VIEWBOX}
      role="img"
      aria-label="Map of India by state and union territory"
      className="h-auto w-full max-h-[min(78vh,40rem)] overflow-visible"
    >
      {INDIA_MAP_PATHS.map((location) => {
        const selected = location.code === selectedCode
        const hovered = hoveredId === location.id
        const base = fillFor(location.code)
        const muted = availableCodes.has(location.code)
          ? base
          : mix(base, '#F6F1E6', 0.38)
        const fill = selected
          ? mix(base, '#121D33', 0.42)
          : hovered
            ? mix(muted, '#121D33', 0.16)
            : muted
        const label = getStateLabel(location.code, location.name)
        return (
          <path
            key={location.id}
            d={location.path}
            data-state-code={location.code}
            data-path-id={location.id}
            tabIndex={0}
            role="button"
            aria-label={label}
            aria-pressed={selected}
            fill={fill}
            stroke={selected ? '#121D33' : '#F6F1E6'}
            strokeWidth={selected ? 2.4 : 1.1}
            className="cursor-pointer outline-none transition-[fill] duration-150 focus-visible:stroke-[#AD8A4E]"
            style={{ outline: 'none' }}
            onMouseEnter={() => setHoveredId(location.id)}
            onMouseLeave={() => setHoveredId(null)}
            onFocus={() => setHoveredId(location.id)}
            onBlur={() => setHoveredId(null)}
            onClick={() => onSelect(location.code)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onSelect(location.code)
              }
            }}
          >
            <title>{label}</title>
          </path>
        )
      })}
      {labels.map((label) => {
        const selected = label.code === selectedCode
        const fill = selected
          ? mix(fillFor(label.code), '#121D33', 0.42)
          : fillFor(label.code)
        const darkFill = isDark(fill)
        const lineCount = label.lines.length
        const blockHeight = label.fontSize * 1.15 * lineCount
        const longest = label.lines.reduce((max, line) => Math.max(max, line.length), 0)
        const blockWidth = Math.max(22, longest * label.fontSize * 0.62 + 8)
        const textFill = label.outside || !darkFill ? '#121D33' : '#F6F1E6'
        const halo = label.outside || !darkFill ? '#F6F1E6' : '#121D33'

        return (
          <g key={`label-${label.id}`} className="pointer-events-none select-none">
            {label.outside ? (
              <>
                <line
                  x1={label.originX}
                  y1={label.originY}
                  x2={label.x}
                  y2={label.y}
                  stroke="#121D33"
                  strokeWidth={0.8}
                />
                <rect
                  x={
                    label.anchor === 'start'
                      ? label.x - 4
                      : label.anchor === 'end'
                        ? label.x - blockWidth + 4
                        : label.x - blockWidth / 2
                  }
                  y={label.y - blockHeight / 2 - 2}
                  width={blockWidth}
                  height={blockHeight + 4}
                  rx={3}
                  fill="rgba(246, 241, 230, 0.96)"
                  stroke="#1C2B4A"
                  strokeWidth={0.7}
                />
              </>
            ) : null}
            <text
              x={label.x}
              y={label.y - ((lineCount - 1) * label.fontSize * 1.15) / 2}
              textAnchor={label.anchor}
              dominantBaseline="middle"
              fontFamily="Inter, system-ui, sans-serif"
              fontWeight={700}
              fontSize={label.fontSize}
              fill={textFill}
              stroke={label.outside ? 'none' : halo}
              strokeWidth={label.outside ? 0 : Math.min(3.4, label.fontSize * 0.28)}
              paintOrder="stroke"
              strokeLinejoin="round"
            >
              {label.lines.map((line, index) => (
                <tspan
                  key={line}
                  x={label.x}
                  dy={index === 0 ? 0 : label.fontSize * 1.15}
                >
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
