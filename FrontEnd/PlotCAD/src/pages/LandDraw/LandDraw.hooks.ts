import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react"
import type { ISegment, IDrawPoint, IRegistration, CardinalDirection, IParsedBearing } from "./LandDraw.types"

export const CARDINAL_OPTIONS: CardinalDirection[] = ["N", "S", "E", "O", "NE", "NO", "SE", "SO"]

export const MAX_SEGMENTS = 100
export const MAX_DISTANCE_M = 100_000

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

const ZOOM_MIN = 0.01
const ZOOM_MAX = 500
const ZOOM_FACTOR = 1.12
const FIT_PADDING = 80

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
  const delta = ((toBase - fromBase) + 540) % 360 - 180
  const sign = delta >= 0 ? 1 : -1
  const azimuth = ((fromBase + sign * totalDeg) % 360 + 360) % 360
  return (azimuth * Math.PI) / 180
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

const DIRECTION_PATTERN = "(NO|NE|SO|SE|[NSEO])"
const BEARING_REGEX = new RegExp(`^${DIRECTION_PATTERN}(\\d{4,6})${DIRECTION_PATTERN}$`, "i")

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
  label: "",
})

const DEFAULT_REGISTRATION: IRegistration = {
  name: "",
  registrationNumber: "",
  location: "",
  client: "",
  notes: "",
}

function niceGridStep(zoom: number): number {
  const targetPx = 50
  const rawStep = targetPx / zoom
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)))
  const norm = rawStep / mag
  let f: number
  if (norm < 1.5) f = 1
  else if (norm < 3.5) f = 2
  else if (norm < 7.5) f = 5
  else f = 10
  return mag * f
}

export function useLandDraw() {
  const [segments, setSegments] = useState<ISegment[]>([createEmptySegment()])
  const [openSegmentId, setOpenSegmentId] = useState<string | null>(segments[0].id)
  const [registration, setRegistration] = useState<IRegistration>(DEFAULT_REGISTRATION)
  const [fullscreen, setFullscreen] = useState(false)
  const [showLabels, setShowLabels] = useState(true)
  const [zoomDisplay, setZoomDisplay] = useState(1)

  const points = computePoints(segments)
  const isClosed =
    points.length > 2 &&
    Math.abs(points[0].x - points[points.length - 1].x) < 0.5 &&
    Math.abs(points[0].y - points[points.length - 1].y) < 0.5
  const areaM2 = isClosed ? computeArea(points) : null
  const perimeter = segments.reduce((acc, s) => acc + s.distance, 0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const zoomRef = useRef(1)
  const panRef = useRef({ x: 0, y: 0 })
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, panX: 0, panY: 0 })
  const rafPendingRef = useRef(false)

  const pointsRef = useRef(points)
  const segmentsRef = useRef(segments)
  const isClosedRef = useRef(isClosed)
  const areaM2Ref = useRef(areaM2)
  const showLabelsRef = useRef(showLabels)

  pointsRef.current = points
  segmentsRef.current = segments
  isClosedRef.current = isClosed
  areaM2Ref.current = areaM2
  showLabelsRef.current = showLabels

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const W = canvas.clientWidth
    const H = canvas.clientHeight
    if (!W || !H) return

    if (canvas.width !== W || canvas.height !== H) {
      canvas.width = W
      canvas.height = H
    }

    const zoom = zoomRef.current
    const pan = panRef.current
    const pts = pointsRef.current
    const segs = segmentsRef.current
    const closed = isClosedRef.current
    const area = areaM2Ref.current
    const lbls = showLabelsRef.current

    const toCanvas = (p: IDrawPoint) => ({
      cx: p.x * zoom + pan.x,
      cy: p.y * zoom + pan.y,
    })

    ctx.fillStyle = "#0f172a"
    ctx.fillRect(0, 0, W, H)

    const step = niceGridStep(zoom)
    const startWX = Math.floor((-pan.x / zoom) / step) * step
    const startWY = Math.floor((-pan.y / zoom) / step) * step

    ctx.strokeStyle = "rgba(255,255,255,0.05)"
    ctx.lineWidth = 1
    for (let wx = startWX; wx * zoom + pan.x <= W + step * zoom; wx += step) {
      const cx = Math.round(wx * zoom + pan.x) + 0.5
      ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke()
    }
    for (let wy = startWY; wy * zoom + pan.y <= H + step * zoom; wy += step) {
      const cy = Math.round(wy * zoom + pan.y) + 0.5
      ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke()
    }

    const ox = pan.x, oy = pan.y
    if (ox >= 0 && ox <= W && oy >= 0 && oy <= H) {
      ctx.save()
      ctx.strokeStyle = "rgba(255,255,255,0.12)"
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath(); ctx.moveTo(ox, 0); ctx.lineTo(ox, H); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(W, oy); ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()
    }

    const compassX = W - 36
    const compassY = H - 36
    const compassR = 16
    ctx.save()
    ctx.strokeStyle = "rgba(255,255,255,0.30)"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(compassX, compassY, compassR, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = "rgba(255,255,255,0.50)"
    ctx.font = "bold 8px monospace"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("N", compassX, compassY - compassR - 5)
    ctx.fillText("S", compassX, compassY + compassR + 5)
    ctx.fillText("L", compassX + compassR + 5, compassY)
    ctx.fillText("O", compassX - compassR - 5, compassY)
    ctx.strokeStyle = "rgba(34,197,94,0.80)"
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(compassX, compassY - compassR + 3)
    ctx.lineTo(compassX, compassY)
    ctx.stroke()
    ctx.restore()

    if (pts.length < 2) return

    if (closed && pts.length > 2) {
      ctx.beginPath()
      const { cx, cy } = toCanvas(pts[0])
      ctx.moveTo(cx, cy)
      for (let i = 1; i < pts.length; i++) {
        const p = toCanvas(pts[i])
        ctx.lineTo(p.cx, p.cy)
      }
      ctx.closePath()
      ctx.fillStyle = "rgba(34,197,94,0.07)"
      ctx.fill()
    }

    ctx.strokeStyle = "#22c55e"
    ctx.lineWidth = 2
    ctx.setLineDash([])

    for (let i = 0; i < pts.length - 1; i++) {
      const a = toCanvas(pts[i])
      const b = toCanvas(pts[i + 1])
      ctx.beginPath()
      ctx.moveTo(a.cx, a.cy)
      ctx.lineTo(b.cx, b.cy)
      ctx.stroke()

      const seg = segs[i]
      const segLenPx = Math.hypot(b.cx - a.cx, b.cy - a.cy)
      if (!seg || segLenPx <= 36) continue

      const midX = (a.cx + b.cx) / 2
      const midY = (a.cy + b.cy) / 2

      const distLabel = `${seg.distance.toFixed(2)}m`
      ctx.save()
      ctx.font = "10px monospace"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      const dw = ctx.measureText(distLabel).width
      ctx.fillStyle = "rgba(0,0,0,0.65)"
      ctx.fillRect(midX - dw / 2 - 4, midY - 8, dw + 8, 16)
      ctx.fillStyle = "#86efac"
      ctx.fillText(distLabel, midX, midY)
      ctx.restore()

      if (lbls && seg.label) {
        ctx.save()
        ctx.font = "italic 9px monospace"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillStyle = "rgba(134,239,172,0.55)"
        ctx.fillText(seg.label, midX, midY + 14)
        ctx.restore()
      }
    }

    if (!closed && pts.length > 2) {
      const first = toCanvas(pts[0])
      const last = toCanvas(pts[pts.length - 1])
      ctx.save()
      ctx.strokeStyle = "rgba(251,191,36,0.40)"
      ctx.lineWidth = 1.5
      ctx.setLineDash([6, 4])
      ctx.beginPath()
      ctx.moveTo(last.cx, last.cy)
      ctx.lineTo(first.cx, first.cy)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()
    }

    for (let i = 0; i < pts.length; i++) {
      const { cx, cy } = toCanvas(pts[i])
      const isFirst = i === 0
      const isLast = i === pts.length - 1
      ctx.beginPath()
      ctx.arc(cx, cy, isFirst ? 6 : 4, 0, Math.PI * 2)
      ctx.fillStyle = (isFirst || (isLast && closed)) ? "#f0fdf4" : "#22c55e"
      ctx.fill()
      ctx.strokeStyle = "#15803d"
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    if (closed && area !== null) {
      const label = `Área: ${area.toFixed(2)} m²`
      ctx.save()
      ctx.font = "bold 11px monospace"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      const tw = ctx.measureText(label).width
      const lx = W / 2
      const ly = H - 18
      ctx.fillStyle = "rgba(0,0,0,0.70)"
      ctx.fillRect(lx - tw / 2 - 8, ly - 9, tw + 16, 18)
      ctx.fillStyle = "#86efac"
      ctx.fillText(label, lx, ly)
      ctx.restore()
    }
  }, [])

  const scheduleRedraw = useCallback(() => {
    if (rafPendingRef.current) return
    rafPendingRef.current = true
    requestAnimationFrame(() => {
      rafPendingRef.current = false
      draw()
    })
  }, [draw])

  const fitToView = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const W = canvas.clientWidth
    const H = canvas.clientHeight
    if (!W || !H) return

    const pts = pointsRef.current
    const isDegenerate =
      pts.length < 2 ||
      (pts.length === 2 &&
        Math.abs(pts[0].x - pts[1].x) < 0.001 &&
        Math.abs(pts[0].y - pts[1].y) < 0.001)

    if (isDegenerate) {
      zoomRef.current = 1
      panRef.current = { x: W / 2, y: H / 2 }
    } else {
      const xs = pts.map(p => p.x)
      const ys = pts.map(p => p.y)
      const minX = Math.min(...xs), maxX = Math.max(...xs)
      const minY = Math.min(...ys), maxY = Math.max(...ys)
      const rangeX = maxX - minX || 1
      const rangeY = maxY - minY || 1
      const newZoom = Math.min(
        (W - FIT_PADDING * 2) / rangeX,
        (H - FIT_PADDING * 2) / rangeY,
      )
      zoomRef.current = newZoom
      panRef.current = {
        x: W / 2 - ((minX + maxX) / 2) * newZoom,
        y: H / 2 - ((minY + maxY) / 2) * newZoom,
      }
    }

    setZoomDisplay(parseFloat(zoomRef.current.toPrecision(3)))
    scheduleRedraw()
  }, [scheduleRedraw])

  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => fitToView())
    return () => cancelAnimationFrame(id)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ro = new ResizeObserver(() => fitToView())
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [fitToView])

  const prevSegCountRef = useRef(segments.length)
  useEffect(() => {
    const countChanged = segments.length !== prevSegCountRef.current
    prevSegCountRef.current = segments.length
    if (countChanged) {
      fitToView()
    } else {
      scheduleRedraw()
    }
  }, [segments, fitToView, scheduleRedraw])

  useEffect(() => {
    scheduleRedraw()
  }, [showLabels, scheduleRedraw])

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return
    isDraggingRef.current = true
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      panX: panRef.current.x,
      panY: panRef.current.y,
    }
    e.currentTarget.style.cursor = "grabbing"
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return
    panRef.current = {
      x: dragStartRef.current.panX + (e.clientX - dragStartRef.current.mouseX),
      y: dragStartRef.current.panY + (e.clientY - dragStartRef.current.mouseY),
    }
    scheduleRedraw()
  }, [scheduleRedraw])

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false
    e.currentTarget.style.cursor = "grab"
  }, [])

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false
    e.currentTarget.style.cursor = "grab"
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      const worldX = (mouseX - panRef.current.x) / zoomRef.current
      const worldY = (mouseY - panRef.current.y) / zoomRef.current
      const factor = e.deltaY < 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR
      const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoomRef.current * factor))
      panRef.current = {
        x: mouseX - worldX * newZoom,
        y: mouseY - worldY * newZoom,
      }
      zoomRef.current = newZoom
      setZoomDisplay(parseFloat(newZoom.toPrecision(3)))
      scheduleRedraw()
    }

    canvas.addEventListener("wheel", handleWheel, { passive: false })
    return () => canvas.removeEventListener("wheel", handleWheel)
  }, [scheduleRedraw])

  const addSegment = useCallback(() => {
    if (segments.length >= MAX_SEGMENTS) return
    const segment = createEmptySegment()
    setSegments(prev => [...prev, segment])
    setOpenSegmentId(segment.id)
  }, [segments.length])

  const removeSegment = useCallback((id: string) => {
    setSegments(prev => prev.filter(s => s.id !== id))
  }, [])

  const updateSegment = useCallback((id: string, field: keyof ISegment, value: string | number) => {
    setSegments(prev =>
      prev.map(s => {
        if (s.id !== id) return s

        let sanitized: string | number = value
        if (field === "distance") {
          sanitized = Math.max(0, Math.min(MAX_DISTANCE_M, Number(value)))
        } else if (field === "degrees") {
          sanitized = Math.max(0, Math.min(89, Number(value)))
        } else if (field === "minutes" || field === "seconds") {
          sanitized = Math.max(0, Math.min(59, Number(value)))
        }

        return { ...s, [field]: sanitized }
      })
    )
  }, [])

  const updateBearingRaw = useCallback((id: string, raw: string) => {
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
  }, [])

  const updateRegistration = useCallback((field: keyof IRegistration, value: string) => {
    setRegistration(prev => ({ ...prev, [field]: value }))
  }, [])

  const toggleShowLabels = useCallback(() => setShowLabels(v => !v), [])

  const formatBearing = useCallback((seg: ISegment) =>
    `${seg.from} ${seg.degrees}°${seg.minutes}'${seg.seconds}" ${seg.to}`, [])

  const toggleSegment = useCallback((id: string) =>
    setOpenSegmentId(prev => (prev === id ? null : id)), [])

  return {
    segments,
    openSegmentId,
    toggleSegment,
    registration,
    updateRegistration,
    fullscreen,
    setFullscreen,
    showLabels,
    toggleShowLabels,
    canvasRef,
    isClosed,
    areaM2,
    perimeter,
    zoomDisplay,
    fitToView,
    addSegment,
    removeSegment,
    updateSegment,
    updateBearingRaw,
    formatBearing,
    canvasHandlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave,
    },
  }
}
