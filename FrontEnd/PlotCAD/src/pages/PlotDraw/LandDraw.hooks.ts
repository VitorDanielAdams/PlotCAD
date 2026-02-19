import { useState, useEffect, useRef, useCallback } from "react"
import type { ISegment, IDrawPoint, CardinalDirection } from "./LandDraw.types"

// ─── Constants ────────────────────────────────────────────────────────────────

export const CARDINAL_OPTIONS: CardinalDirection[] = ["N", "S", "E", "O", "NE", "NO", "SE", "SO"]

const BEARING_ANGLES: Record<CardinalDirection, number> = {
  N: 0,
  NE: 45,
  E: 90,
  SE: 135,
  S: 180,
  SO: 225,
  O: 270,
  NO: 315,
}

// ─── Geometry helpers ─────────────────────────────────────────────────────────

function bearingToAngleRad(
  from: CardinalDirection,
  to: CardinalDirection,
  deg: number,
  min: number,
  sec: number,
): number {
  const totalDeg = deg + min / 60 + sec / 3600
  const fromBase = BEARING_ANGLES[from]
  const toBase = BEARING_ANGLES[to]
  let delta = toBase - fromBase
  if (delta < 0) delta += 360
  if (delta > 180) delta = 360 - delta
  const direction = fromBase + (delta > 0 ? totalDeg : -totalDeg)
  return (direction * Math.PI) / 180
}

export function computePoints(segments: ISegment[]): IDrawPoint[] {
  const points: IDrawPoint[] = [{ x: 0, y: 0 }]
  for (const seg of segments) {
    const angle = bearingToAngleRad(seg.from, seg.to, seg.degrees, seg.minutes, seg.seconds)
    const prev = points[points.length - 1]
    points.push({
      x: prev.x + seg.distance * Math.sin(angle),
      y: prev.y - seg.distance * Math.cos(angle),
    })
  }
  return points
}

export function computeArea(points: IDrawPoint[]): number {
  let area = 0
  const n = points.length
  for (let i = 0; i < n - 1; i++) {
    area += points[i].x * points[i + 1].y
    area -= points[i + 1].x * points[i].y
  }
  return Math.abs(area) / 2
}

// ─── Bearing text parser ───────────────────────────────────────────────────────
//
// Accepted format: SO1235NE  → SO 12°35'00" NE  (4 digits = ddmm,  seconds = 0)
//                  SO123545NE → SO 12°35'45" NE  (6 digits = ddmmss)
//
// Pattern: {startDirection}{ddmm[ss]}{endDirection}

const DIRECTION_PATTERN = "(NO|NE|SO|SE|[NSEO])"
const BEARING_REGEX = new RegExp(`^${DIRECTION_PATTERN}(\\d{4,6})${DIRECTION_PATTERN}$`, "i")

export interface IParsedBearing {
  from: CardinalDirection
  to: CardinalDirection
  degrees: number
  minutes: number
  seconds: number
}

export function parseBearingInput(raw: string): IParsedBearing | null {
  const match = raw.trim().match(BEARING_REGEX)
  if (!match) return null

  const from = match[1].toUpperCase() as CardinalDirection
  const digits = match[2]
  const to = match[3].toUpperCase() as CardinalDirection

  if (!CARDINAL_OPTIONS.includes(from) || !CARDINAL_OPTIONS.includes(to)) return null

  let degrees: number, minutes: number, seconds: number

  if (digits.length === 4) {
    degrees = parseInt(digits.slice(0, 2), 10)
    minutes = parseInt(digits.slice(2, 4), 10)
    seconds = 0
  } else {
    degrees = parseInt(digits.slice(0, 2), 10)
    minutes = parseInt(digits.slice(2, 4), 10)
    seconds = parseInt(digits.slice(4, 6), 10)
  }

  if (degrees > 89 || minutes > 59 || seconds > 59) return null

  return { from, to, degrees, minutes, seconds }
}

// ─── Segment factory ──────────────────────────────────────────────────────────

function createId(): string {
  return Math.random().toString(36).slice(2, 9)
}

export const createEmptySegment = (): ISegment => ({
  id: createId(),
  from: "SO",
  to: "NE",
  degrees: 0,
  minutes: 0,
  seconds: 0,
  distance: 0,
  bearingRaw: "",
})

// ─── Main hook ────────────────────────────────────────────────────────────────

export function useLandDraw() {
  const [segments, setSegments] = useState<ISegment[]>([createEmptySegment()])
  const [scale, setScale] = useState(1)
  const [openSegmentId, setOpenSegmentId] = useState<string | null>(segments[0].id)
  const [fullscreen, setFullscreen] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const points = computePoints(segments)
  const isClosed =
    points.length > 2 &&
    Math.abs(points[0].x - points[points.length - 1].x) < 0.5 &&
    Math.abs(points[0].y - points[points.length - 1].y) < 0.5

  const areaM2 = isClosed ? computeArea(points) : null
  const perimeter = segments.reduce((acc, s) => acc + s.distance, 0)

  // ── Canvas draw ─────────────────────────────────────────────────────────────

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Sync the canvas pixel buffer with its CSS size before drawing.
    // Setting width/height clears the canvas, but since we do it inside the
    // draw cycle the redraw happens immediately afterwards.
    const displayWidth = canvas.clientWidth
    const displayHeight = canvas.clientHeight
    if (displayWidth === 0 || displayHeight === 0) return
    canvas.width = displayWidth
    canvas.height = displayHeight

    const W = canvas.width
    const H = canvas.height

    // background
    ctx.fillStyle = "#0f172a"
    ctx.fillRect(0, 0, W, H)

    // grid
    const gridStep = 40
    ctx.strokeStyle = "rgba(255,255,255,0.05)"
    ctx.lineWidth = 1
    for (let x = 0; x < W; x += gridStep) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
    }
    for (let y = 0; y < H; y += gridStep) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
    }

    if (points.length < 2) return

    const xs = points.map(p => p.x)
    const ys = points.map(p => p.y)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    const rangeX = maxX - minX || 1
    const rangeY = maxY - minY || 1

    const padding = 60
    const scaleX = (W - padding * 2) / rangeX
    const scaleY = (H - padding * 2) / rangeY
    const autoScale = Math.min(scaleX, scaleY) * scale

    const toCanvas = (p: IDrawPoint) => ({
      cx: padding + (p.x - minX) * autoScale + (W - padding * 2 - rangeX * autoScale) / 2,
      cy: padding + (p.y - minY) * autoScale + (H - padding * 2 - rangeY * autoScale) / 2,
    })

    // compass rose
    const compassX = W - 40
    const compassY = 40
    ctx.save()
    ctx.strokeStyle = "rgba(255,255,255,0.4)"
    ctx.lineWidth = 1
    const compassRadius = 18
    ctx.beginPath()
    ctx.arc(compassX, compassY, compassRadius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = "rgba(255,255,255,0.6)"
    ctx.font = "bold 10px monospace"
    ctx.textAlign = "center"
    ctx.fillText("N", compassX, compassY - compassRadius - 4)
    ctx.fillText("S", compassX, compassY + compassRadius + 10)
    ctx.fillText("L", compassX + compassRadius + 8, compassY + 4)
    ctx.fillText("O", compassX - compassRadius - 8, compassY + 4)
    ctx.strokeStyle = "rgba(34,197,94,0.8)"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(compassX, compassY - compassRadius + 4)
    ctx.lineTo(compassX, compassY)
    ctx.stroke()
    ctx.restore()

    // filled polygon (only when closed)
    if (isClosed && points.length > 2) {
      ctx.beginPath()
      const first = toCanvas(points[0])
      ctx.moveTo(first.cx, first.cy)
      for (let i = 1; i < points.length; i++) {
        const p = toCanvas(points[i])
        ctx.lineTo(p.cx, p.cy)
      }
      ctx.closePath()
      ctx.fillStyle = "rgba(34,197,94,0.08)"
      ctx.fill()
    }

    // lines with distance labels
    ctx.strokeStyle = "#22c55e"
    ctx.lineWidth = 2
    ctx.setLineDash([])
    for (let i = 0; i < points.length - 1; i++) {
      const a = toCanvas(points[i])
      const b = toCanvas(points[i + 1])
      ctx.beginPath()
      ctx.moveTo(a.cx, a.cy)
      ctx.lineTo(b.cx, b.cy)
      ctx.stroke()

      const midX = (a.cx + b.cx) / 2
      const midY = (a.cy + b.cy) / 2
      const seg = segments[i]
      if (seg) {
        const label = `${seg.distance.toFixed(2)}m`
        ctx.save()
        ctx.fillStyle = "rgba(0,0,0,0.6)"
        const textWidth = ctx.measureText(label).width
        ctx.fillRect(midX - textWidth / 2 - 4, midY - 9, textWidth + 8, 15)
        ctx.fillStyle = "#86efac"
        ctx.font = "10px monospace"
        ctx.textAlign = "center"
        ctx.fillText(label, midX, midY + 2)
        ctx.restore()
      }
    }

    // dashed closing line when polygon is open
    if (!isClosed && points.length > 2) {
      const first = toCanvas(points[0])
      const last = toCanvas(points[points.length - 1])
      ctx.save()
      ctx.strokeStyle = "rgba(251,191,36,0.5)"
      ctx.lineWidth = 1.5
      ctx.setLineDash([6, 4])
      ctx.beginPath()
      ctx.moveTo(last.cx, last.cy)
      ctx.lineTo(first.cx, first.cy)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()
    }

    // vertex points
    for (let i = 0; i < points.length; i++) {
      const { cx, cy } = toCanvas(points[i])
      const isFirst = i === 0
      const isLast = i === points.length - 1

      ctx.beginPath()
      ctx.arc(cx, cy, isFirst ? 6 : 4, 0, Math.PI * 2)
      ctx.fillStyle = isFirst ? "#f0fdf4" : isLast && isClosed ? "#f0fdf4" : "#22c55e"
      ctx.fill()
      ctx.strokeStyle = "#15803d"
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    // area label (only when closed)
    if (isClosed && areaM2 !== null) {
      const cx = W / 2
      const cy = H - 22
      const label = `Área: ${areaM2.toFixed(2)} m²`
      ctx.save()
      ctx.fillStyle = "rgba(0,0,0,0.7)"
      const textWidth = ctx.measureText(label).width
      ctx.fillRect(cx - textWidth / 2 - 8, cy - 13, textWidth + 16, 20)
      ctx.fillStyle = "#86efac"
      ctx.font = "bold 12px monospace"
      ctx.textAlign = "center"
      ctx.fillText(label, cx, cy + 2)
      ctx.restore()
    }
  }, [points, scale, isClosed, areaM2, segments])

  // Redraw whenever data changes
  useEffect(() => {
    draw()
  }, [draw])

  // Redraw on window resize (e.g. fullscreen toggle)
  useEffect(() => {
    window.addEventListener("resize", draw)
    return () => window.removeEventListener("resize", draw)
  }, [draw])

  // ── Segment actions ─────────────────────────────────────────────────────────

  const addSegment = () => {
    const segment = createEmptySegment()
    setSegments(prev => [...prev, segment])
    setOpenSegmentId(segment.id)
  }

  const removeSegment = (id: string) => {
    setSegments(prev => prev.filter(s => s.id !== id))
  }

  const updateSegment = (id: string, field: keyof ISegment, value: string | number) => {
    setSegments(prev =>
      prev.map(s => s.id === id ? { ...s, [field]: value } : s)
    )
  }

  /** Updates the raw text field and, if valid, auto-fills the bearing fields */
  const updateBearingRaw = (id: string, raw: string) => {
    const upperRaw = raw.toUpperCase()
    setSegments(prev =>
      prev.map(s => {
        if (s.id !== id) return s
        const parsed = parseBearingInput(upperRaw)
        if (parsed) {
          return {
            ...s,
            bearingRaw: upperRaw,
            from: parsed.from,
            to: parsed.to,
            degrees: parsed.degrees,
            minutes: parsed.minutes,
            seconds: parsed.seconds,
          }
        }
        return { ...s, bearingRaw: upperRaw }
      })
    )
  }

  const formatBearing = (seg: ISegment) =>
    `${seg.from} ${seg.degrees}°${seg.minutes}'${seg.seconds}" ${seg.to}`

  const toggleSegment = (id: string) =>
    setOpenSegmentId(prev => (prev === id ? null : id))

  return {
    segments,
    scale,
    setScale,
    openSegmentId,
    toggleSegment,
    fullscreen,
    setFullscreen,
    canvasRef,
    points,
    isClosed,
    areaM2,
    perimeter,
    addSegment,
    removeSegment,
    updateSegment,
    updateBearingRaw,
    formatBearing,
  }
}
