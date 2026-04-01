import { CARD_HEIGHT, CARD_WIDTH } from '../constants'
import type { PeelEdge } from '../types'

const W = CARD_WIDTH
const H = CARD_HEIGHT
const HW = W / 2
const HH = H / 2

export type Vec2 = { x: number; y: number }

export type PeelFrame = {
  /** めくり進行方向（カード内へ向かう単位ベクトル、XY 平面） */
  peelDir: Vec2
  /** 折り目に沿う方向（単位ベクトル、peelDir と直交） */
  foldDir: Vec2
  /** dot(v, peelDir) の折り線位置が走る範囲 [foldStart, foldEnd] */
  foldStart: number
  foldEnd: number
}

function norm(v: Vec2): Vec2 {
  const l = Math.hypot(v.x, v.y) || 1
  return { x: v.x / l, y: v.y / l }
}

/**
 * 辺・角ごとに、折り線が進む方向と dot の範囲を返す。
 * 頂点 v はカード中心原点、x∈[-HW,HW], y∈[-HH,HH]。
 */
export function getPeelFrame(edge: PeelEdge): PeelFrame {
  switch (edge) {
    case 'bottom':
      return {
        peelDir: norm({ x: 0, y: 1 }),
        foldDir: norm({ x: 1, y: 0 }),
        foldStart: -HH,
        foldEnd: HH,
      }
    case 'top':
      return {
        peelDir: norm({ x: 0, y: -1 }),
        foldDir: norm({ x: 1, y: 0 }),
        foldStart: HH,
        foldEnd: -HH,
      }
    case 'left':
      return {
        peelDir: norm({ x: 1, y: 0 }),
        foldDir: norm({ x: 0, y: 1 }),
        foldStart: -HW,
        foldEnd: HW,
      }
    case 'right':
      return {
        peelDir: norm({ x: -1, y: 0 }),
        foldDir: norm({ x: 0, y: 1 }),
        foldStart: HW,
        foldEnd: -HW,
      }
    case 'bottom-right': {
      const d = norm({ x: -1, y: 1 })
      const c1 = HW * d.x + -HH * d.y
      const c2 = -HW * d.x + HH * d.y
      return {
        peelDir: d,
        foldDir: norm({ x: d.y, y: -d.x }),
        foldStart: Math.min(c1, c2),
        foldEnd: Math.max(c1, c2),
      }
    }
    case 'top-left': {
      const d = norm({ x: 1, y: -1 })
      const c1 = -HW * d.x + HH * d.y
      const c2 = HW * d.x + -HH * d.y
      return {
        peelDir: d,
        foldDir: norm({ x: d.y, y: -d.x }),
        foldStart: Math.min(c1, c2),
        foldEnd: Math.max(c1, c2),
      }
    }
    case 'top-right': {
      const d = norm({ x: -1, y: -1 })
      const c1 = HW * d.x + HH * d.y
      const c2 = -HW * d.x + -HH * d.y
      return {
        peelDir: d,
        foldDir: norm({ x: d.y, y: -d.x }),
        foldStart: Math.min(c1, c2),
        foldEnd: Math.max(c1, c2),
      }
    }
    case 'bottom-left': {
      const d = norm({ x: 1, y: 1 })
      const c1 = -HW * d.x + -HH * d.y
      const c2 = HW * d.x + HH * d.y
      return {
        peelDir: d,
        foldDir: norm({ x: d.y, y: -d.x }),
        foldStart: Math.min(c1, c2),
        foldEnd: Math.max(c1, c2),
      }
    }
  }
}

function dot2(a: Vec2, b: Vec2): number {
  return a.x * b.x + a.y * b.y
}

/**
 * 平面 (x,y,0) 上の頂点をめくり変形。Z は画面奥行き（持ち上がり）。
 * R: 曲がり半径（ワールド単位、カード寸法と同スケール）
 */
export function deformVertex(
  x: number,
  y: number,
  frame: PeelFrame,
  peelProgress: number,
  curlRadius: number,
): { x: number; y: number; z: number } {
  const { peelDir, foldDir, foldStart, foldEnd } = frame
  const foldOffset = foldStart + peelProgress * (foldEnd - foldStart)

  const vx = x
  const vy = y
  const u = dot2({ x: vx, y: vy }, peelDir) - foldOffset
  if (u >= 0) {
    return { x: vx, y: vy, z: 0 }
  }

  const d = -u
  const R = Math.max(curlRadius, 0.001)
  /** 半円ぶんの弧長（ここまでが円柱に沿う曲がり） */
  const arcHalf = R * Math.PI

  const foldPointX = foldOffset * peelDir.x + dot2({ x: vx, y: vy }, foldDir) * foldDir.x
  const foldPointY = foldOffset * peelDir.y + dot2({ x: vx, y: vy }, foldDir) * foldDir.y

  if (d <= arcHalf) {
    const theta = d / R
    const sinT = Math.sin(theta)
    const cosT = Math.cos(theta)
    return {
      x: foldPointX - R * sinT * peelDir.x,
      y: foldPointY - R * sinT * peelDir.y,
      z: R * (1 - cosT),
    }
  }

  /**
   * d が弧長を超えた分は、折り終端（θ=π）からめくり方向へ真っ直ぐ伸ばす。
   * これにより大きくめくっても表面が同じ位置に潰れず、全体が見える。
   */
  const extra = d - arcHalf
  const oz = 2 * R
  return {
    x: foldPointX + extra * peelDir.x,
    y: foldPointY + extra * peelDir.y,
    z: oz,
  }
}

/**
 * 変形後の法線（近似）。折り付近で滑らかに。
 */
export function deformNormal(
  x: number,
  y: number,
  frame: PeelFrame,
  peelProgress: number,
  curlRadius: number,
): { x: number; y: number; z: number } {
  const e = 1.2
  const c = deformVertex(x, y, frame, peelProgress, curlRadius)
  const px = deformVertex(x + e, y, frame, peelProgress, curlRadius)
  const py = deformVertex(x, y + e, frame, peelProgress, curlRadius)
  const tx = px.x - c.x
  const ty = px.y - c.y
  const tz = px.z - c.z
  const ux = py.x - c.x
  const uy = py.y - c.y
  const uz = py.z - c.z
  let nx = ty * uz - tz * uy
  let ny = tz * ux - tx * uz
  let nz = tx * uy - ty * ux
  const nl = Math.hypot(nx, ny, nz) || 1
  nx /= nl
  ny /= nl
  nz /= nl
  if (nz < 0) {
    nx = -nx
    ny = -ny
    nz = -nz
  }
  return { x: nx, y: ny, z: nz }
}
