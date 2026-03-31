import pako from 'pako'
import { CARD_HEIGHT, CARD_RADIUS, CARD_WIDTH } from './constants'

/** ストロークは [x0,y0,x1,y1,...]（論理座標 0..CARD_WIDTH × 0..CARD_HEIGHT） */
export type Stroke = number[]

export type ParsedShareState = {
  strokes: Stroke[]
  faceDown: boolean
}

const MAX_STROKES = 4000
const MAX_POINTS_PER_STROKE = 8000
const MAX_TOTAL_POINTS = 120_000

/** バイナリ形式バージョン */
const PACK_VERSION = 3

/** Ramer–Douglas–Peucker の許容誤差（px） */
const RDP_EPSILON = 0.75

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

function strokeToPairs(flat: number[]): [number, number][] {
  const out: [number, number][] = []
  for (let i = 0; i < flat.length; i += 2) {
    const x = flat[i]
    const y = flat[i + 1]
    if (x !== undefined && y !== undefined) {
      out.push([x, y])
    }
  }
  return out
}

function perpDistance(
  p: [number, number],
  a: [number, number],
  b: [number, number],
): number {
  const [x, y] = p
  const [x1, y1] = a
  const [x2, y2] = b
  const dx = x2 - x1
  const dy = y2 - y1
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) {
    const ex = x - x1
    const ey = y - y1
    return Math.sqrt(ex * ex + ey * ey)
  }
  let t = ((x - x1) * dx + (y - y1) * dy) / lenSq
  t = Math.max(0, Math.min(1, t))
  const px = x1 + t * dx
  const py = y1 + t * dy
  const ex = x - px
  const ey = y - py
  return Math.sqrt(ex * ex + ey * ey)
}

/** 反復スタックで RDP（深い再帰を避ける） */
function rdpSimplify(
  points: [number, number][],
  epsilon: number,
): [number, number][] {
  if (points.length <= 2) return points

  const keep = new Set<number>([0, points.length - 1])
  const stack: [number, number][] = [[0, points.length - 1]]

  while (stack.length > 0) {
    const [start, end] = stack.pop()!
    if (end <= start + 1) continue

    let maxDist = 0
    let maxIdx = start
    for (let i = start + 1; i < end; i++) {
      const d = perpDistance(points[i], points[start], points[end])
      if (d > maxDist) {
        maxDist = d
        maxIdx = i
      }
    }
    if (maxDist > epsilon) {
      keep.add(maxIdx)
      stack.push([start, maxIdx], [maxIdx, end])
    }
  }

  const indices = [...keep].sort((a, b) => a - b)
  return indices.map((i) => points[i])
}

function quantizeAndClamp(pairs: [number, number][]): [number, number][] {
  return pairs.map(([x, y]) => {
    const qx = Math.max(0, Math.min(CARD_WIDTH, Math.round(x)))
    const qy = Math.max(0, Math.min(CARD_HEIGHT, Math.round(y)))
    return [qx, qy] as [number, number]
  })
}

function prepareStrokesForPack(strokes: Stroke[]): [number, number][][] {
  const out: [number, number][][] = []
  for (const stroke of strokes) {
    let pairs = strokeToPairs(stroke)
    if (pairs.length < 2) continue
    pairs = rdpSimplify(pairs, RDP_EPSILON)
    let q = quantizeAndClamp(pairs)
    if (q.length < 2) {
      const a = q[0] ?? [0, 0]
      q = [a, [...a] as [number, number]]
    }
    out.push(q)
  }
  return out
}

function pushUint16LE(bytes: number[], v: number) {
  bytes.push(v & 0xff, (v >> 8) & 0xff)
}

function pushInt16LE(bytes: number[], v: number) {
  const clamped = Math.max(-32768, Math.min(32767, Math.round(v)))
  const u = clamped < 0 ? clamped + 65536 : clamped
  bytes.push(u & 0xff, (u >> 8) & 0xff)
}

function packDrawingPayload(prepared: [number, number][][]): Uint8Array {
  const bytes: number[] = []
  bytes.push(PACK_VERSION, 0)
  pushUint16LE(bytes, prepared.length)

  for (const q of prepared) {
    const n = q.length
    pushUint16LE(bytes, n)
    pushUint16LE(bytes, q[0][0])
    pushUint16LE(bytes, q[0][1])
    for (let i = 1; i < n; i++) {
      pushInt16LE(bytes, q[i][0] - q[i - 1][0])
      pushInt16LE(bytes, q[i][1] - q[i - 1][1])
    }
  }

  return new Uint8Array(bytes)
}

function readUint16LE(data: Uint8Array, o: number): number {
  return data[o]! | (data[o + 1]! << 8)
}

function readInt16LE(data: Uint8Array, o: number): number {
  const u = data[o]! | (data[o + 1]! << 8)
  return u > 32767 ? u - 65536 : u
}

function parsePackedPayload(data: Uint8Array): ParsedShareState | null {
  if (data.length < 4) return null
  const version = data[0]
  if (version !== PACK_VERSION) return null

  const flags = data[1]!
  const faceDown = (flags & 1) === 1

  let offset = 4
  const strokeCount = readUint16LE(data, 2)
  if (strokeCount > MAX_STROKES) return null

  const strokes: Stroke[] = []
  let totalPoints = 0

  for (let s = 0; s < strokeCount; s++) {
    if (offset + 2 > data.length) return null
    const n = readUint16LE(data, offset)
    offset += 2
    if (n < 2 || n > MAX_POINTS_PER_STROKE) return null
    totalPoints += n
    if (totalPoints > MAX_TOTAL_POINTS) return null
    /** 各ストローク: x0,y0 (uint16×2) + (n−1)×(dx,dy int16×2) = 4n バイト */
    if (offset + 4 * n > data.length) return null

    const flat: number[] = new Array(n * 2)
    let x = readUint16LE(data, offset)
    offset += 2
    let y = readUint16LE(data, offset)
    offset += 2
    flat[0] = x
    flat[1] = y

    for (let i = 1; i < n; i++) {
      const dx = readInt16LE(data, offset)
      offset += 2
      const dy = readInt16LE(data, offset)
      offset += 2
      x += dx
      y += dy
      flat[i * 2] = x
      flat[i * 2 + 1] = y
    }

    strokes.push(flat)
  }

  if (offset !== data.length) return null
  if (!strokesWithinCard(strokes)) return null

  return { strokes, faceDown }
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

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function base64UrlToBytes(s: string): Uint8Array | null {
  try {
    const pad = '='.repeat((4 - (s.length % 4)) % 4)
    const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad
    const binary = atob(b64)
    const out = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      out[i] = binary.charCodeAt(i)
    }
    return out
  } catch {
    return null
  }
}

/** ハッシュからストロークと伏せ状態を復元 */
export function parseShareStateFromHash(hash: string): ParsedShareState | null {
  if (!hash.startsWith('#d=')) return null
  const raw = hash.slice(3)
  if (!raw) return null

  const compressed = base64UrlToBytes(raw)
  if (!compressed || compressed.length === 0) return null

  let inflated: Uint8Array
  try {
    inflated = pako.inflateRaw(compressed)
  } catch {
    return null
  }

  return parsePackedPayload(inflated)
}

export function encodeShareHash(strokes: Stroke[], faceDown: boolean): string {
  if (strokes.length === 0 && !faceDown) return ''

  const prepared = prepareStrokesForPack(strokes)
  const payload = packDrawingPayload(prepared)
  payload[1] = faceDown ? 1 : 0

  const deflated = pako.deflateRaw(payload, { level: 9 })
  const b64 = bytesToBase64Url(deflated)
  return `#d=${b64}`
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
