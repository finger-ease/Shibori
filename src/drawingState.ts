import LZString from 'lz-string'
import { CARD_HEIGHT, CARD_RADIUS, CARD_WIDTH } from './constants'

/** ストロークは [x0,y0,x1,y1,...]（論理座標 0..CARD_WIDTH × 0..CARD_HEIGHT） */
export type Stroke = number[]

export type DrawingPayloadV1 = {
  v: 1
  s: Stroke[]
}

/** v2: fd が 1 のとき伏せた状態で共有 */
export type DrawingPayloadV2 = {
  v: 2
  s: Stroke[]
  fd?: 1 | 0
}

export type ParsedShareState = {
  strokes: Stroke[]
  faceDown: boolean
}

const MAX_STROKES = 4000
const MAX_POINTS_PER_STROKE = 8000
const MAX_TOTAL_POINTS = 120_000

function clipRoundRect(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.roundRect(0, 0, w, h, r)
  ctx.clip()
}

function parseStrokesPayload(s: unknown): Stroke[] | null {
  if (!Array.isArray(s)) return null
  if (s.length > MAX_STROKES) return null

  let totalPoints = 0
  const out: Stroke[] = []
  for (const stroke of s) {
    if (!Array.isArray(stroke)) return null
    const n = stroke.length
    if (n < 4 || n % 2 !== 0) return null
    if (n > MAX_POINTS_PER_STROKE) return null
    totalPoints += n / 2
    if (totalPoints > MAX_TOTAL_POINTS) return null

    const flat: number[] = new Array(n)
    for (let i = 0; i < n; i++) {
      const v = stroke[i]
      if (typeof v !== 'number' || !Number.isFinite(v)) return null
      flat[i] = v
    }
    out.push(flat)
  }

  if (!strokesWithinCard(out)) return null
  return out
}

/** ハッシュからストロークと伏せ状態を復元（v1 は常に描画中扱い） */
export function parseShareStateFromHash(hash: string): ParsedShareState | null {
  if (!hash.startsWith('#d=')) return null
  const raw = hash.slice(3)
  if (!raw) return null
  let json: string | null
  try {
    json = LZString.decompressFromEncodedURIComponent(raw)
  } catch {
    return null
  }
  if (!json) return null
  let data: unknown
  try {
    data = JSON.parse(json)
  } catch {
    return null
  }
  if (typeof data !== 'object' || data === null || !('v' in data) || !('s' in data)) {
    return null
  }
  const version = (data as { v: unknown }).v
  if (version !== 1 && version !== 2) return null

  const out = parseStrokesPayload((data as { s: unknown }).s)
  if (!out) return null

  let faceDown = false
  if (version === 2 && 'fd' in data) {
    const fd = (data as { fd: unknown }).fd
    faceDown = fd === 1 || fd === true
  }

  return { strokes: out, faceDown }
}

function strokesWithinCard(strokes: Stroke[]): boolean {
  const pad = 4
  for (const flat of strokes) {
    for (let i = 0; i < flat.length; i += 2) {
      const x = flat[i]
      const y = flat[i + 1]
      if (
        x < -pad ||
        y < -pad ||
        x > CARD_WIDTH + pad ||
        y > CARD_HEIGHT + pad
      ) {
        return false
      }
    }
  }
  return true
}

export function encodeShareHash(strokes: Stroke[], faceDown: boolean): string {
  if (strokes.length === 0 && !faceDown) return ''
  const payload: DrawingPayloadV2 = { v: 2, s: strokes }
  if (faceDown) payload.fd = 1
  const json = JSON.stringify(payload)
  return `#d=${LZString.compressToEncodedURIComponent(json)}`
}

export function replaceUrlShareHash(strokes: Stroke[], faceDown: boolean): void {
  const hash = encodeShareHash(strokes, faceDown)
  const next = `${window.location.pathname}${window.location.search}${hash}`
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`
  if (next !== current) {
    window.history.replaceState(null, '', next)
  }
}

export type StrokeRenderStyle = {
  lineWidth: number
  strokeStyle: string
}

export function renderStrokesToCanvas(
  canvas: HTMLCanvasElement,
  strokes: Stroke[],
  style: StrokeRenderStyle,
): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.restore()

  const dpr = Math.min(window.devicePixelRatio ?? 1, 2)
  ctx.save()
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  clipRoundRect(ctx, CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = style.strokeStyle
  ctx.lineWidth = style.lineWidth

  for (const flat of strokes) {
    if (flat.length < 4) continue
    ctx.beginPath()
    ctx.moveTo(flat[0], flat[1])
    for (let i = 2; i < flat.length; i += 2) {
      ctx.lineTo(flat[i], flat[i + 1])
    }
    ctx.stroke()
  }
  ctx.restore()
}
