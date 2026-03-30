import { useCallback, useRef, useState } from 'react'
import {
  AXIS_LOCK_THRESHOLD,
  PIXELS_FOR_FULL_FLIP,
} from '../constants'
import type { AppPhase, Axis2D } from '../types'

export type CardFlipState = {
  phase: AppPhase
  /** めくり中の追加回転角（0〜180） */
  peelAngle: number
  /** ドラッグ開始時に固定する回転軸（画面 XY 平面） */
  axis: Axis2D | null
  /** CSS transition を有効にするか（スナップ時） */
  transition: boolean
}

const initialFlipState: CardFlipState = {
  phase: 'drawing',
  peelAngle: 0,
  axis: null,
  transition: true,
}

export function useCardFlip() {
  const [flip, setFlip] = useState<CardFlipState>(initialFlipState)
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)

  /** 「伏せる」後の表面非表示アニメ用 */
  const goFaceDown = useCallback(() => {
    setFlip({
      phase: 'faceDown',
      peelAngle: 0,
      axis: null,
      transition: true,
    })
  }, [])

  /** 伏せた状態からアニメーションで表面までめくる */
  const goRevealFully = useCallback(() => {
    dragStartRef.current = null
    setFlip((s) => {
      if (s.phase !== 'faceDown') return s
      return {
        phase: 'revealed',
        peelAngle: 0,
        axis: null,
        transition: true,
      }
    })
  }, [])

  /** リセット：描画フェーズへ */
  const resetAll = useCallback(() => {
    dragStartRef.current = null
    setFlip(initialFlipState)
  }, [])

  const computeAxisFromDelta = useCallback((dx: number, dy: number): Axis2D => {
    const len = Math.hypot(dx, dy)
    if (len < 1e-6) return { x: 1, y: 0 }
    return { x: -dy / len, y: dx / len }
  }, [])

  const handleFlipPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (flip.phase !== 'faceDown') return
      e.preventDefault()
      e.currentTarget.setPointerCapture(e.pointerId)
      dragStartRef.current = { x: e.clientX, y: e.clientY }
      setFlip((s) => ({
        ...s,
        phase: 'flipping',
        peelAngle: 0,
        axis: null,
        transition: false,
      }))
    },
    [flip.phase],
  )

  const handleFlipPointerMove = useCallback(
    (e: React.PointerEvent) => {
      /* dragStartRef は pointerdown でセットされる。phase 更新前の move も拾う */
      if (!dragStartRef.current) return
      const start = dragStartRef.current
      const dx = e.clientX - start.x
      const dy = e.clientY - start.y
      const dist = Math.hypot(dx, dy)

      setFlip((s) => {
        let axis = s.axis
        if (!axis && dist >= AXIS_LOCK_THRESHOLD) {
          axis = computeAxisFromDelta(dx, dy)
        }
        if (!axis) {
          return { ...s, peelAngle: 0 }
        }
        const peelAngle = Math.min(180, (dist / PIXELS_FOR_FULL_FLIP) * 180)
        return { ...s, axis, peelAngle }
      })
    },
    [computeAxisFromDelta],
  )

  const handleFlipPointerUp = useCallback((e: React.PointerEvent) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    dragStartRef.current = null

    setFlip((s) => {
      if (s.phase !== 'flipping') return s
      if (s.peelAngle > 90) {
        return {
          phase: 'revealed',
          peelAngle: 0,
          axis: null,
          transition: true,
        }
      }
      return {
        phase: 'faceDown',
        peelAngle: 0,
        axis: null,
        transition: true,
      }
    })
  }, [])

  /** カードルートの transform 文字列 */
  const cardTransform = useCallback(() => {
    const { phase, peelAngle, axis } = flip
    if (phase === 'drawing') return 'rotateY(0deg)'
    if (phase === 'faceDown') return 'rotateY(180deg)'
    if (phase === 'flipping' && axis) {
      const { x, y } = axis
      return `rotate3d(${x}, ${y}, 0, ${peelAngle}deg) rotateY(180deg)`
    }
    if (phase === 'flipping' && !axis) {
      return 'rotateY(180deg)'
    }
    if (phase === 'revealed') return 'rotateY(0deg)'
    return 'rotateY(0deg)'
  }, [flip])

  return {
    flip,
    goFaceDown,
    goRevealFully,
    resetAll,
    cardTransform: cardTransform(),
    flipPointerHandlers: {
      onPointerDown: handleFlipPointerDown,
      onPointerMove: handleFlipPointerMove,
      onPointerUp: handleFlipPointerUp,
      onPointerCancel: handleFlipPointerUp,
    },
  }
}
