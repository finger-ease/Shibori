import { useCallback, useRef, useState } from 'react'
import { PIXELS_FOR_FULL_PEEL } from '../constants'
import { parseShareStateFromHash } from '../drawingState'
import type { AppPhase, PeelEdge } from '../types'

export type CardFlipState = {
  phase: AppPhase
  /** めくり進行度（0 = 裏面で完全に覆われている、1 = 表面が完全に見える） */
  peelProgress: number
  /** めくりの起点辺 */
  peelEdge: PeelEdge
  /** CSS transition を有効にするか */
  transition: boolean
}

const initialFlipState: CardFlipState = {
  phase: 'drawing',
  peelProgress: 1,
  peelEdge: 'bottom',
  transition: false,
}

const initialFlipFaceDown: CardFlipState = {
  phase: 'faceDown',
  peelProgress: 0,
  peelEdge: 'bottom',
  transition: false,
}

function readInitialFlipFromHash(): CardFlipState {
  if (typeof window === 'undefined') return initialFlipState
  const parsed = parseShareStateFromHash(window.location.hash)
  if (parsed?.faceDown) return initialFlipFaceDown
  return initialFlipState
}

function determinePeelEdge(
  localX: number,
  localY: number,
  w: number,
  h: number,
): PeelEdge {
  const normTop = localY / h
  const normBottom = 1 - localY / h
  const normLeft = localX / w
  const normRight = 1 - localX / w

  const cornerThreshold = 0.3
  if (normTop < cornerThreshold && normLeft < cornerThreshold)
    return 'top-left'
  if (normTop < cornerThreshold && normRight < cornerThreshold)
    return 'top-right'
  if (normBottom < cornerThreshold && normLeft < cornerThreshold)
    return 'bottom-left'
  if (normBottom < cornerThreshold && normRight < cornerThreshold)
    return 'bottom-right'

  const dists: Record<string, number> = {
    top: localY,
    bottom: h - localY,
    left: localX,
    right: w - localX,
  }
  let min = Infinity
  let edge: PeelEdge = 'bottom'
  for (const [key, val] of Object.entries(dists)) {
    if (val < min) {
      min = val
      edge = key as PeelEdge
    }
  }
  return edge
}

export function useCardFlip() {
  const [flip, setFlip] = useState<CardFlipState>(readInitialFlipFromHash)
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)

  const goFaceDown = useCallback(() => {
    setFlip({
      phase: 'faceDown',
      peelProgress: 0,
      peelEdge: 'bottom',
      transition: true,
    })
  }, [])

  const resetAll = useCallback(() => {
    dragStartRef.current = null
    setFlip(initialFlipState)
  }, [])

  const handleFlipPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (flip.phase !== 'faceDown') return
      e.preventDefault()
      e.currentTarget.setPointerCapture(e.pointerId)

      const rect = e.currentTarget.getBoundingClientRect()
      dragStartRef.current = { x: e.clientX, y: e.clientY }

      const localX = e.clientX - rect.left
      const localY = e.clientY - rect.top
      const peelEdge = determinePeelEdge(localX, localY, rect.width, rect.height)

      setFlip({
        phase: 'flipping',
        peelProgress: 0,
        peelEdge,
        transition: false,
      })
    },
    [flip.phase],
  )

  const handleFlipPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStartRef.current) return
    const start = dragStartRef.current

    setFlip((s) => {
      if (s.phase !== 'flipping') return s

      const dx = e.clientX - start.x
      const dy = e.clientY - start.y
      const SQRT2_INV = 1 / Math.SQRT2

      let dist: number
      switch (s.peelEdge) {
        case 'bottom':
          dist = -dy
          break
        case 'top':
          dist = dy
          break
        case 'left':
          dist = dx
          break
        case 'right':
          dist = -dx
          break
        case 'bottom-right':
          dist = (-dx + -dy) * SQRT2_INV
          break
        case 'top-left':
          dist = (dx + dy) * SQRT2_INV
          break
        case 'top-right':
          dist = (-dx + dy) * SQRT2_INV
          break
        case 'bottom-left':
          dist = (dx + -dy) * SQRT2_INV
          break
      }

      const peelProgress = Math.max(0, Math.min(1, dist / PIXELS_FOR_FULL_PEEL))
      return { ...s, peelProgress }
    })
  }, [])

  const handleFlipPointerUp = useCallback((e: React.PointerEvent) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    dragStartRef.current = null

    setFlip((s) => {
      if (s.phase !== 'flipping') return s
      if (s.peelProgress > 0.5) {
        return {
          phase: 'revealed',
          peelProgress: 1,
          peelEdge: s.peelEdge,
          transition: true,
        }
      }
      return {
        phase: 'faceDown',
        peelProgress: 0,
        peelEdge: s.peelEdge,
        transition: true,
      }
    })
  }, [])

  return {
    flip,
    goFaceDown,
    resetAll,
    flipPointerHandlers: {
      onPointerDown: handleFlipPointerDown,
      onPointerMove: handleFlipPointerMove,
      onPointerUp: handleFlipPointerUp,
      onPointerCancel: handleFlipPointerUp,
    },
  }
}
