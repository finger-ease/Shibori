import { CARD_HEIGHT, CARD_WIDTH } from '../constants'
import * as THREE from 'three'

/**
 * CardBack と近い見た目のグラデーションを Canvas に描き、Three.js 用テクスチャを返す。
 */
export function createBackCanvasTexture(): THREE.CanvasTexture {
  const w = CARD_WIDTH
  const h = CARD_HEIGHT
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('2d context unavailable')
  }

  const g = ctx.createRadialGradient(
    w * 0.5,
    h * 0.4,
    0,
    w * 0.5,
    h * 0.5,
    Math.hypot(w, h) * 0.55,
  )
  g.addColorStop(0, '#c41e3a')
  g.addColorStop(0.45, '#8b1538')
  g.addColorStop(1, '#5c0f26')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.lineWidth = 8
  for (let i = -w; i < w + h; i += 16) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i + h, h)
    ctx.stroke()
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.08)'
  for (let i = -h; i < w + h; i += 16) {
    ctx.beginPath()
    ctx.moveTo(0, i)
    ctx.lineTo(w, i - w)
    ctx.stroke()
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.4)'
  ctx.lineWidth = 6
  ctx.strokeRect(12, 12, w - 24, h - 24)
  const rg = ctx.createRadialGradient(
    w * 0.5,
    h * 0.4,
    0,
    w * 0.5,
    h * 0.5,
    h * 0.55,
  )
  rg.addColorStop(0, 'rgba(255,255,255,0.12)')
  rg.addColorStop(0.6, 'transparent')
  ctx.fillStyle = rg
  ctx.fillRect(0, 0, w, h)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}
